console.log("hello this is from the service worker");

const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/styles.css",
    "/manifest.webmanifest",
    "/index.js",
    "/icons/icon-96x96.png",
    "/icons/icon-144x144.png",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png",
];

const STATIC_CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";

//install
self.addEventListener("install", function(evt) {
    evt.waitUntil(
        caches.open(STATIC_CACHE_NAME).then(cache => {
            console.log("Files were pre-cached successfully");
            return cache.addAll(FILES_TO_CACHE);
        })
    );
    
    self.skipWaiting();
});


//activate
self.addEventListener("activate", function(evt) {
    evt.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(
                keyList.map(key => {
                    if (key !== STATIC_CACHE_NAME && key !== DATA_CACHE_NAME) {
                        console.log("Removing old cache key", key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );

    self.clients.claim();
});

//fetch
self.addEventListener("fetch", function(evt) {

    if (evt.request.url.includes("/api/")) {
        evt.respondWith(
            caches.open(DATA_CACHE_NAME).then(cache => {
                return fetch(evt.request)
                .then(response => {
                    if (response.status === 200) {
                        cache.put(evt.request.url, response.clone());
                    }

                    return response
                })
                .catch(err => {
                    return cache.match(evt.request);
                });
            }).catch(err => console.log(err))
        );

        return;
    }

    evt.respondWith(
        caches.match(evt.request).then(function(response) {
          return response || fetch(evt.request);
        })
      );
})