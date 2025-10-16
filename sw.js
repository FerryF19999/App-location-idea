const CACHE_NAME = 'barista-ai-cache-v4';
const APP_SHELL_URLS = [
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

// Install: Caches app shell and takes control immediately
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(cache => {
            console.log('Opened cache, caching app shell');
            return cache.addAll(APP_SHELL_URLS);
        })
        .then(() => self.skipWaiting()) // Force the waiting service worker to become the active service worker.
    );
});

// Activate: Cleans up old caches and takes control of uncontrolled clients
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim()) // Take control of all open pages.
    );
});


self.addEventListener('fetch', event => {
    // We only care about GET requests.
    if (event.request.method !== 'GET') {
        return;
    }

    // For navigation requests, serve the app shell (index.html) from the cache.
    // This is the core of the SPA PWA experience. It ensures the app loads,
    // and client-side routing can take over.
    if (event.request.mode === 'navigate') {
        event.respondWith(
            caches.match('/index.html')
            .then(response => {
                // Return cached index.html or fetch it if not cached.
                return response || fetch('/index.html');
            })
        );
        return;
    }

    // For all other requests (assets, API calls, etc.), use a "stale-while-revalidate" strategy.
    // This provides a good balance of speed (from cache) and freshness (from network).
    event.respondWith(
        caches.open(CACHE_NAME).then(cache => {
            return cache.match(event.request).then(cachedResponse => {
                const fetchPromise = fetch(event.request).then(networkResponse => {
                    // If we get a valid response, update the cache.
                    if (networkResponse && networkResponse.status === 200) {
                         cache.put(event.request, networkResponse.clone());
                    }
                    return networkResponse;
                }).catch(err => {
                    // If fetch fails, we will rely on the cachedResponse if it exists.
                    console.warn(`Fetch failed for ${event.request.url}:`, err);
                });

                // Return the cached response immediately if it exists, 
                // while the network request runs in the background to update the cache.
                return cachedResponse || fetchPromise;
            });
        })
    );
});
