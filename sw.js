/* POS UMKM PWA - Service Worker Auto Update */
const CACHE = 'pos-umkm-v3';

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE));
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith((async () => {
    try {
      const fresh = await fetch(event.request, { cache: 'no-cache' });
      if (fresh && (fresh.ok || fresh.type === 'opaque')) {
        const copy = fresh.clone();
        caches.open(CACHE).then(c => c.put(event.request, copy));
      }
      return fresh;
    } catch (e) {
      const cached = await caches.match(event.request);
      return cached || Response.error();
    }
  })());
});