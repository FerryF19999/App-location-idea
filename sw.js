const STATIC_CACHE_NAME = 'barista-ai-static-cache-v2';
const DYNAMIC_CACHE_NAME = 'barista-ai-dynamic-cache-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/index.tsx',
  '/App.tsx',
  '/types.ts',
  '/services/geminiService.ts',
  '/hooks/useLocalStorage.ts',
  '/components/AgentInterface.tsx',
  '/components/AgentStatus.tsx',
  '/components/BandungMapIllustration.tsx',
  '/components/CoffeeShopCard.tsx',
  '/components/CoffeeShopListItem.tsx',
  '/components/CustomMap.tsx',
  '/components/Header.tsx',
  '/components/HotspotCard.tsx',
  '/components/icons.tsx',
  '/components/KalcerFeature.tsx',
  '/components/LandingPage.tsx',
  '/components/LoadingSpinner.tsx',
  '/components/MapExplore.tsx',
  '/components/Navbar.tsx',
  '/logo.svg',
  '/manifest.json',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then(cache => {
        console.log('Opened static cache and caching core assets');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [STATIC_CACHE_NAME, DYNAMIC_CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);

  // Strategy for app's own files (App Shell)
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          // Cache hit - return response
          if (response) {
            return response;
          }
          
          // Not in cache, go to network
          return fetch(event.request)
            .catch(() => {
              // If network fails for a navigation request, return the app shell from cache
              if (event.request.mode === 'navigate') {
                return caches.match('/index.html');
              }
            });
        })
    );
    return;
  }

  // Strategy for third-party assets (e.g., CDN, fonts)
  // Cache-first, then network, with dynamic caching
  event.respondWith(
    caches.open(DYNAMIC_CACHE_NAME).then(cache => {
      return cache.match(event.request).then(response => {
        return response || fetch(event.request).then(networkResponse => {
          // Check for valid response to cache
          if (networkResponse && networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        });
      });
    })
  );
});
