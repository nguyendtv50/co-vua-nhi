"""Thu sẵn giọng đọc AI cho mọi câu cố định của phần mềm (lời giảng, đề bài, giải thích, khai cuộc…).

Chạy:  python tools/build_audio.py            (giọng nữ HoaiMy)
       python tools/build_audio.py NamMinh    (giọng nam)

Thu song song nhiều tiến trình (nhanh hơn):
       python tools/build_audio.py --plan 4          chia các câu chưa thu thành audio/_shard1.json … _shard4.json
       python tools/build_audio.py --shard audio/_shard1.json   (chạy mỗi phần ở một cửa sổ/tiến trình riêng)
       python tools/build_audio.py --finish          xóa file thừa, ghi js/audio-index.js
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
                    # Có hạn chờ: một câu bị treo mạng không làm đứng cả lượt thu.
                    tmp = AUDIO / f"{key}.part"
                    await asyncio.wait_for(edge_tts.Communicate(text, voice, rate=RATE).save(str(tmp)), 45)
                    tmp.replace(AUDIO / f"{key}.mp3")
                    return
                except Exception as exc:  # mạng chập chờn: thử lại
                    err = exc
                    await asyncio.sleep(2 * (attempt + 1))
            failed.append((key, text, err))

    done = 0

    async def tracked(k, t):
        nonlocal done
        await one(k, t)
        done += 1
        if done % 25 == 0:
            print(f"  đã thu {done}/{len(items)}", flush=True)

    await asyncio.gather(*(tracked(k, t) for k, t in items))
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

    finish(sentences, voice, failed)


def finish(sentences, voice, failed=()):
    removed = 0
    for f in AUDIO.glob("*.part"):
        f.unlink()
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


def plan(parts, voice):
    AUDIO.mkdir(exist_ok=True)
    sentences = collect_sentences()
    todo = [(k, t) for k, t in sentences.items() if not (AUDIO / f"{k}.mp3").exists()]
    for i in range(parts):
        chunk = todo[i::parts]
        (AUDIO / f"_shard{i + 1}.json").write_text(
            json.dumps({"voice": voice, "items": chunk}, ensure_ascii=False), encoding="utf-8")
    (AUDIO / "_sentences.json").write_text(json.dumps(sentences, ensure_ascii=False), encoding="utf-8")
    print(f"{len(sentences)} câu, {len(todo)} câu cần thu mới, chia thành {parts} phần.")


def run_shard(path):
    data = json.loads(pathlib.Path(path).read_text(encoding="utf-8"))
    items = [(k, t) for k, t in data["items"] if not (AUDIO / f"{k}.mp3").exists()]
    print(f"{path}: {len(items)} câu cần thu…", flush=True)
    failed = asyncio.run(synthesize(items, data["voice"]))
    for key, text, err in failed:
        print(f"  LỖI {key}: {text[:60]} ({err})")
    print(f"Xong phần {path}: {len(items) - len(failed)} câu thu được, {len(failed)} lỗi.")
    sys.exit(1 if failed else 0)


def finish_all(voice):
    sentences = json.loads((AUDIO / "_sentences.json").read_text(encoding="utf-8"))
    for f in AUDIO.glob("_*.json"):
        f.unlink()
    missing = [k for k in sentences if not (AUDIO / f"{k}.mp3").exists()]
    finish(sentences, voice, missing)


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    args = sys.argv[1:]
    if args[:1] == ["--plan"]:
        plan(int(args[1]), "vi-VN-HoaiMyNeural")
    elif args[:1] == ["--shard"]:
        run_shard(args[1])
    elif args[:1] == ["--finish"]:
        finish_all("vi-VN-HoaiMyNeural")
    else:
        main(args[0] if args else "HoaiMy")
