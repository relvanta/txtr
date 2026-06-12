const CACHE_NAME = 'ocr-extractor-cache-v1';
const BASE_PATH = self.location.pathname.replace(/\/[^\/]*$/, '/'); // auto detect subpath
const ASSETS = [
  `${BASE_PATH}index.html`,
  `${BASE_PATH}manifest.json`,
  `${BASE_PATH}icons/icon-192.png`,
  `${BASE_PATH}icons/icon-512.png`,
  `${BASE_PATH}icons/icon-maskable.png`
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // 1. Skip caching for the translation API to prevent stale translations
  if (url.origin.includes('mymemory.translated.net')) {
    e.respondWith(fetch(e.request));
    return;
  }

  // 2. Runtime caching for Tesseract dependencies (CDN files & language packs)
  if (url.origin.includes('jsdelivr.net') || url.origin.includes('unpkg.com') || e.request.url.endsWith('.traineddata.gz')) {
    e.respondWith(
      caches.match(e.request).then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse; // Serve from cache if we already downloaded it
        }
        // Otherwise, fetch from network, then clone and cache it for next time
        return fetch(e.request).then(networkResponse => {
          return caches.open('ocr-runtime-cache-v1').then(cache => {
            cache.put(e.request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
    return;
  }

  // 3. Default Cache-First strategy for local assets (HTML, icons)
  e.respondWith(
    caches.match(e.request).then(resp => resp || fetch(e.request))
  );
});
