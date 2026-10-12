"""Chuẩn bị bản phát hành: đặt số phiên bản, tạo sw.js (bộ nhớ offline) và đóng gói CoVuaNhi.zip.

Chạy:  python tools/build_release.py 5      (5 là số phiên bản mới, lớn hơn bản trước)

- Cập nhật "?v=<số>" cho mọi file trong index.html để trình duyệt tải bản mới.
- Tạo sw.js với danh sách TẤT CẢ file cần cho chạy offline (tự quét thư mục, không cần sửa tay).
- Đóng gói CoVuaNhi.zip để chép sang máy Windows khác.
"""
import json
import pathlib
import re
import sys
import zipfile

ROOT = pathlib.Path(__file__).resolve().parent.parent
INCLUDE = ["index.html", "manifest.webmanifest", "sw.js", "README.md", "css", "js", "vendor", "assets"]

SW_TEMPLATE = """/* Bộ nhớ offline của Cờ Vua Nhí – TẠO TỰ ĐỘNG bởi tools/build_release.py, đừng sửa tay. */
const VERSION = '__VERSION__';
const CACHE = 'covuanhi-v' + VERSION;
const FILES = __FILES__;

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('covuanhi-') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  if (req.mode === 'navigate') {
    // Trang chính: ưu tiên mạng để nhận bản mới, mất mạng thì dùng bản đã lưu.
    event.respondWith(fetch(req).catch(() => caches.match('index.html')));
    return;
  }
  event.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      if (res.ok) {
        const copy = res.clone();
        caches.open(CACHE).then(cache => cache.put(req, copy));
      }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true })))
  );
});
"""


def main(version):
    index = ROOT / "index.html"
    html = index.read_text(encoding="utf-8")
    html = re.sub(r"\?v=\d+", f"?v={version}", html)
    index.write_text(html, encoding="utf-8")

    versioned = set(re.findall(r'(?:src|href)="([^"?]+)\?v=\d+"', html))
    files = ["./", "index.html", "manifest.webmanifest"]
    for folder in ["css", "js", "vendor", "assets"]:
        for path in sorted((ROOT / folder).rglob("*")):
            if path.is_file():
                rel = path.relative_to(ROOT).as_posix()
                files.append(f"{rel}?v={version}" if rel in versioned else rel)
    sw = SW_TEMPLATE.replace("__VERSION__", str(version)).replace("__FILES__", json.dumps(files, indent=2))
    (ROOT / "sw.js").write_text(sw, encoding="utf-8")

    with zipfile.ZipFile(ROOT / "CoVuaNhi.zip", "w", zipfile.ZIP_DEFLATED) as z:
        for name in INCLUDE:
            p = ROOT / name
            for path in ([p] if p.is_file() else sorted(p.rglob("*"))):
                if path.is_file():
                    z.write(path, path.relative_to(ROOT).as_posix())

    print(f"Phiên bản {version}: sw.js lưu offline {len(files)} file; đã tạo CoVuaNhi.zip "
          f"({(ROOT / 'CoVuaNhi.zip').stat().st_size // 1024} KB).")


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    if len(sys.argv) != 2 or not sys.argv[1].isdigit():
        print(__doc__)
        sys.exit(1)
    main(int(sys.argv[1]))
