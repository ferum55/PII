
SW:  CACHE_NAME = 'UCD cache';


self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Opened cache', CACHE_NAME);
            return cache.addAll([
                "/add.html",
                "/bell.png",
                "/index.html",
                "/manifest.json",
                "/pencil.png",
                "/script.js",
                "/styles.css",
                "/styles.css",
                "/tasks.css",
                "/tasks.html",
                "/user.png",
                "/X.png"
            ]);
        })
    );
});



self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                if (response) {
                    return response;
                }

                const fetchRequest = event.request.clone();

                return fetch(fetchRequest).then(
                    function(response) {
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        const responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then(function(cache) {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    }
                );
            })
    );
});
