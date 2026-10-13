/* Bộ nhớ offline của Cờ Vua Nhí – TẠO TỰ ĐỘNG bởi tools/build_release.py, đừng sửa tay. */
const VERSION = '9';
const CACHE = 'covuanhi-v' + VERSION;
const FILES = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "css/style.css?v=9",
  "js/app.js?v=9",
  "js/audio-index.js?v=9",
  "js/board.js?v=9",
  "js/bot.js?v=9",
  "js/curriculum.js?v=9",
  "js/engine.js?v=9",
  "js/explain.js?v=9",
  "js/media.js?v=9",
  "js/openings.js?v=9",
  "js/progress.js?v=9",
  "js/puzzles.js?v=9",
  "vendor/chess.global.js?v=9",
  "vendor/stockfish.src.js?v=9",
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
// Bản thu giọng AI: tải ngầm sau khi app đã chạy (app gửi tin nhắn 'cache-audio'), để lần mở đầu không phải chờ.
const AUDIO = [];

self.addEventListener('message', event => {
  if (event.data !== 'cache-audio') return;
  event.waitUntil(caches.open(CACHE).then(async cache => {
    for (const url of AUDIO) {
      if (await cache.match(url)) continue;
      try { await cache.add(url); } catch (e) { /* mất mạng giữa chừng: lần sau tải tiếp */ }
    }
  }));
});

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
