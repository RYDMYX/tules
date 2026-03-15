const CORE_CACHE = "tules-core-v1";
const SAMPLE_CACHE = "tules-samples-v1";

/* Core files needed for the app shell */
const CORE_FILES = [
  "/",
  "/index.html",
  "/style.css",
  "/manifest.json",
  "/audio.js",
  "/sample.js",
  "/piano.js",
  "/ruler.js"
];

/* Limit how many sample files can accumulate */
const MAX_SAMPLE_FILES = 120;


/* INSTALL */

self.addEventListener("install", event => {

  self.skipWaiting();

  event.waitUntil(
    caches.open(CORE_CACHE)
      .then(cache => cache.addAll(CORE_FILES))
  );

});


/* ACTIVATE */

self.addEventListener("activate", event => {

  event.waitUntil(

    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CORE_CACHE && key !== SAMPLE_CACHE) {
            return caches.delete(key);
          }
        })
      )
    )

  );

  self.clients.claim();

});


/* SAMPLE CACHE LIMITER */

async function trimSampleCache(cache) {

  const keys = await cache.keys();

  if (keys.length > MAX_SAMPLE_FILES) {
    await cache.delete(keys[0]);
  }

}


/* FETCH HANDLER */

self.addEventListener("fetch", event => {

  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);


  /* SAMPLE FILES (dynamic cache) */

  if (url.pathname.includes("/samples/")) {

    event.respondWith(

      caches.open(SAMPLE_CACHE).then(cache =>

        cache.match(event.request).then(cached => {

          if (cached) return cached;

          return fetch(event.request)
            .then(response => {

              if (response && response.status === 200) {
                cache.put(event.request, response.clone());
                trimSampleCache(cache);
              }

              return response;

            });

        })

      )

    );

    return;

  }


  /* CORE FILES */

  event.respondWith(

    caches.match(event.request).then(cached => {

      const networkFetch = fetch(event.request)
        .then(response => {

          if (
            response &&
            response.status === 200 &&
            event.request.url.startsWith(self.location.origin)
          ) {

            caches.open(CORE_CACHE)
              .then(cache => cache.put(event.request, response.clone()));

          }

          return response;

        })
        .catch(() => cached);

      return cached || networkFetch;

    })

  );

});