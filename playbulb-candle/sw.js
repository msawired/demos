const addToCache = (request, networkResponse) => {
  return caches.open('playbulb-candle')
    .then((cache) => cache.put(request, networkResponse.clone()));
};

const getCacheResponse = (request) => {
  return caches.open('playbulb-candle').then((cache) => {
    return cache.match(request);
  });
};

const getNetworkOrCacheResponse = (request) => {
  return new Promise((resolve) => {
    fetch(request).then((networkResponse) => {
      addToCache(request, networkResponse);
      resolve(networkResponse);
    }).catch(() => {
      getCacheResponse(request).then((cacheResponse) => {
        resolve(cacheResponse || Response.error());
      });
    });
  });
};

self.addEventListener('fetch', (event) => {
  event.respondWith(getNetworkOrCacheResponse(event.request));
});

const cleanOldCache = () => {
  return caches.keys().then(cacheNames => {
    return Promise.all(
      cacheNames.filter(cacheName => (cacheName !== 'playbulb-candle'))
                .map(cacheName => caches.delete(cacheName))
    );
  })
}

self.addEventListener('activate', (event) => {
  event.waitUntil(cleanOldCache());
});
