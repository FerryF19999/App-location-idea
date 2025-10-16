const STATIC_CACHE_NAME = 'barista-ai-static-cache-v3';
const DYNAMIC_CACHE_NAME = 'barista-ai-dynamic-cache-v3';
const APP_SHELL_URL = '/index.html';
const urlsToCache = [
  '/',
  APP_SHELL_URL,
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

  // For navigation requests, always serve the app shell from the cache.
  // This is the core of the "App Shell Model" and ensures the SPA loads instantly and works offline.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match(APP_SHELL_URL)
        .then(response => {
          return response || fetch(APP_SHELL_URL);
        })
    );
    return;
  }

  // For same-origin assets (JS, components, etc.), use a cache-first strategy.
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request);
      })
    );
    return;
  }

  // For third-party requests (e.g., CDN, fonts), use a stale-while-revalidate strategy.
  event.respondWith(
    caches.open(DYNAMIC_CACHE_NAME).then(cache => {
      return cache.match(event.request).then(response => {
        const fetchPromise = fetch(event.request).then(networkResponse => {
          if (networkResponse && networkResponse.status === 200) {
             cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        });
        // Return cached response immediately if available, and update cache in the background.
        return response || fetchPromise;
      });
    })
  );
});
