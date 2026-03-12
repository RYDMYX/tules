const CACHE_NAME = 'assis-piano-v1';

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.open(CACHE_NAME).then(cache =>
      cache.match(event.request).then(cached => {
        if (cached) return cached;

        return fetch(event.request)
          .then(response => {
            // Only cache successful, same-origin responses
            if (
              response.status === 200 &&
              event.request.url.startsWith(self.location.origin)
            ) {
              cache.put(event.request, response.clone());
            }
            return response;
          })
          .catch(() => cached); // offline fallback
      })
    )
  );
});