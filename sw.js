/* Bộ nhớ offline của Cờ Vua Nhí – TẠO TỰ ĐỘNG bởi tools/build_release.py, đừng sửa tay. */
const VERSION = '7';
const CACHE = 'covuanhi-v' + VERSION;
const FILES = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "css/style.css?v=7",
  "js/app.js?v=7",
  "js/board.js?v=7",
  "js/bot.js?v=7",
  "js/curriculum.js?v=7",
  "js/engine.js?v=7",
  "js/explain.js?v=7",
  "js/media.js?v=7",
  "js/openings.js?v=7",
  "js/progress.js?v=7",
  "js/puzzles.js?v=7",
  "vendor/chess.global.js?v=7",
  "vendor/stockfish.src.js?v=7",
  "assets/icons/apple-touch-icon.png",
  "assets/icons/icon-192.png",
  "assets/icons/icon-512.png",
  "assets/icons/icon-maskable-512.png",
  "assets/pieces/bB.svg",
  "assets/pieces/bK.svg",
  "assets/pieces/bN.svg",
  "assets/pieces/bP.svg",
  "assets/pieces/bQ.svg",
  "assets/pieces/bR.svg",
  "assets/pieces/wB.svg",
  "assets/pieces/wK.svg",
  "assets/pieces/wN.svg",
  "assets/pieces/wP.svg",
  "assets/pieces/wQ.svg",
  "assets/pieces/wR.svg"
];

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
