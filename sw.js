/* POS UMKM PWA - Service Worker dengan Auto Update & Fallback */
const CACHE_NAME = 'pos-umkm-v8';
const SHELL_ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon.svg'
];

// Domain yang TIDAK boleh di-cache (karena butuh auth & URL sering berubah)
const EXCLUDED_DOMAINS = [
  'script.google.com',
  'script.googleusercontent.com',
  'accounts.google.com',
  'google-analytics.com'
];

// ============ INSTALL ============
self.addEventListener('install', event => {
  console.log('[SW] Installing...');
  self.skipWaiting(); // Langsung aktifkan SW baru
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Pre-caching shell assets');
        return cache.addAll(SHELL_ASSETS);
      })
      .catch(err => console.warn('[SW] Pre-cache failed:', err))
  );
});

// ============ ACTIVATE ============
self.addEventListener('activate', event => {
  console.log('[SW] Activating...');
  event.waitUntil((async () => {
    // Hapus cache versi lama
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter(k => k !== CACHE_NAME)
        .map(k => {
          console.log('[SW] Deleting old cache:', k);
          return caches.delete(k);
        })
    );
    
    // Ambil alih semua tab yang terbuka
    await self.clients.claim();
    console.log('[SW] Active and controlling all clients');
  })());
});

// ============ FETCH ============
self.addEventListener('fetch', event => {
  const request = event.request;
  
  // Hanya tangani request GET
  if (request.method !== 'GET') return;
  
  // Lewati request ke domain yang tidak boleh di-cache
  const url = new URL(request.url);
  const isAppsScriptDocument = url.hostname.includes('script.google.com') && request.mode === 'navigate';
  if (EXCLUDED_DOMAINS.some(domain => url.hostname.includes(domain)) && !isAppsScriptDocument) {
    return; // Biarkan browser handle langsung
  }
  
  // Lewati chrome-extension dan data URLs
  if (!url.protocol.startsWith('http')) return;
  
  event.respondWith((async () => {
    try {
      // Coba ambil dari network dulu (Network-First)
      const freshResponse = await fetch(request, { 
        cache: 'no-cache',
        redirect: 'follow'
      });
      
      // Jika response valid, simpan ke cache
      if (freshResponse && (freshResponse.ok || freshResponse.type === 'opaque')) {
        const copy = freshResponse.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(request, copy);
        });
      }
      
      return freshResponse;
      
    } catch (error) {
      // Network gagal → coba ambil dari cache
      console.warn('[SW] Network failed, trying cache:', request.url);
      const cachedResponse = await caches.match(request);
      
      if (cachedResponse) {
        return cachedResponse;
      }
      
      // Fallback: jika yang diminta adalah navigasi (halaman), tampilkan index.html
      if (request.mode === 'navigate') {
        const fallback = await caches.match('./index.html');
        if (fallback) return fallback;
      }
      
      // Jika tidak ada fallback, kembalikan response error yang proper
      return new Response('Offline - Aplikasi Kasir', {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'text/plain' }
      });
    }
  })());
});

// ============ MESSAGE HANDLER (untuk komunikasi dengan halaman) ============
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.delete(CACHE_NAME).then(() => {
      console.log('[SW] Cache cleared');
    });
  }
});