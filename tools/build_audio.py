"""Thu sẵn giọng đọc AI cho mọi câu cố định của phần mềm (lời giảng, đề bài, giải thích, khai cuộc…).

Chạy:  python tools/build_audio.py            (giọng nữ HoaiMy)
       python tools/build_audio.py NamMinh    (giọng nam)
Cần:   pip install edge-tts ; Microsoft Edge ; có mạng.

Các bước:
1. Mở tools/collect_speech.html bằng Edge ẩn để lấy đúng các câu mà phần mềm sẽ đọc.
2. Thu âm những câu chưa có thành audio/<mã>.mp3 (giọng neural tiếng Việt của Microsoft, qua edge-tts).
3. Xóa file âm thanh không còn dùng, ghi js/audio-index.js để phần mềm biết câu nào có bản thu.

Lưu ý: edge-tts dùng dịch vụ đọc to của trình duyệt Edge. Phù hợp cho dùng cá nhân/gia đình;
nếu phát hành thương mại nên chuyển sang dịch vụ chính thức (Azure AI Speech, cùng các giọng này).
"""
import asyncio
import base64
import json
import os
import pathlib
import re
import subprocess
import sys
import tempfile

import edge_tts

ROOT = pathlib.Path(__file__).resolve().parent.parent
AUDIO = ROOT / "audio"
INDEX = ROOT / "js" / "audio-index.js"
EDGE = os.environ.get("EDGE_PATH", r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe")
RATE = "-6%"        # chậm hơn một chút cho trẻ nghe rõ
CONCURRENCY = 4


def fnv1a(text):
    h = 0x811C9DC5
    for b in text.encode("utf-8"):
        h ^= b
        h = (h * 0x01000193) & 0xFFFFFFFF
    return f"{h:08x}"


def collect_sentences():
    page = (ROOT / "tools" / "collect_speech.html").as_uri()
    with tempfile.TemporaryDirectory() as profile:
        proc = subprocess.run(
            [EDGE, "--headless=new", "--disable-gpu", f"--user-data-dir={profile}", "--enable-logging=stderr",
             "--v=0", "--virtual-time-budget=5000", "--dump-dom", page],
            capture_output=True, timeout=120)
    log = proc.stderr.decode("utf-8", "replace")
    sentences = {}
    for key, b64 in re.findall(r"SPEECH ([0-9a-f]{8}) ([A-Za-z0-9+/=]+)", log):
        text = base64.b64decode(b64).decode("utf-8")
        if fnv1a(text) != key:
            raise SystemExit(f"Mã không khớp cho câu: {text!r}")
        sentences[key] = text
    done = re.search(r"SPEECH_DONE (\d+)", log)
    if not done or int(done.group(1)) != len(sentences):
        raise SystemExit("Không thu thập đủ câu từ trang công cụ. Kiểm tra Edge và tools/collect_speech.html.")
    return sentences


async def synthesize(items, voice):
    sem = asyncio.Semaphore(CONCURRENCY)
    failed = []

    async def one(key, text):
        async with sem:
            for attempt in range(3):
                try:
                    await edge_tts.Communicate(text, voice, rate=RATE).save(str(AUDIO / f"{key}.mp3"))
                    return
                except Exception as exc:  # mạng chập chờn: thử lại
                    err = exc
                    await asyncio.sleep(2 * (attempt + 1))
            failed.append((key, text, err))

    await asyncio.gather(*(one(k, t) for k, t in items))
    return failed


def main(voice_name):
    voice = f"vi-VN-{voice_name}Neural"
    AUDIO.mkdir(exist_ok=True)
    sentences = collect_sentences()

    # Đổi giọng thì thu lại toàn bộ.
    old_voice = None
    if INDEX.exists():
        m = re.search(r'"voice":\s*"([^"]+)"', INDEX.read_text(encoding="utf-8"))
        old_voice = m and m.group(1)
    if old_voice and old_voice != voice:
        for f in AUDIO.glob("*.mp3"):
            f.unlink()

    todo = [(k, t) for k, t in sentences.items() if not (AUDIO / f"{k}.mp3").exists()]
    print(f"{len(sentences)} câu cần có bản thu, {len(todo)} câu cần thu mới (giọng {voice})…", flush=True)
    failed = asyncio.run(synthesize(todo, voice))
    for key, text, err in failed:
        print(f"  LỖI {key}: {text[:60]} ({err})")

    removed = 0
    for f in AUDIO.glob("*.mp3"):
        if f.stem not in sentences:
            f.unlink()
            removed += 1

    clips = {k: 1 for k in sorted(sentences) if (AUDIO / f"{k}.mp3").exists()}
    INDEX.write_text(
        "/* Danh sách câu đã có bản thu giọng AI (audio/<mã>.mp3). TẠO TỰ ĐỘNG bởi tools/build_audio.py. */\n"
        "window.AUDIO_CLIPS = " + json.dumps({"voice": voice, "clips": clips}, separators=(",", ":")) + ";\n",
        encoding="utf-8")
    size = sum(f.stat().st_size for f in AUDIO.glob("*.mp3"))
    print(f"Xong: {len(clips)} bản thu ({size / 1024 / 1024:.1f} MB), xóa {removed} file cũ, {len(failed)} lỗi.")
    if failed:
        sys.exit(1)


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    main(sys.argv[1] if len(sys.argv) > 1 else "HoaiMy")
