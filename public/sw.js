const CACHE_NAME = 'presensi-gtk-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Let network requests pass through normally
  // Offline support can be enhanced as needed
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
