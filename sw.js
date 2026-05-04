// Kitap Yönetim Sistemi - Service Worker v4.8.4
const CACHE_NAME = 'kys-v4.8.4';
const urlsToCache = [
  './',
  './Kitap_Listesi.html',
  './manifest.json',
  './icon.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)).catch(err => console.warn('SW cache error:', err))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Only cache GET requests for same-origin or cached assets
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return;
  // Don't cache OneDrive or MSAL requests
  if (url.hostname.includes('microsoft') || url.hostname.includes('live.com') || url.hostname.includes('msauth')) return;
  event.respondWith(
    caches.match(event.request).then(cached => {
      const fetchPromise = fetch(event.request).then(response => {
        if (response && response.status === 200 && response.type === 'basic') {
          const cloned = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, cloned));
        }
        return response;
      }).catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
