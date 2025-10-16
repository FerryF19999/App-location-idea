// A more robust, "ultra best practice" service worker

const STATIC_CACHE_NAME = 'barista-ai-static-v5'; // Incremented version
const DYNAMIC_CACHE_NAME = 'barista-ai-dynamic-v5';
const FONT_CACHE_NAME = 'barista-ai-fonts-v5';

// All the assets that make up the "app shell"
const APP_SHELL_URLS = [
  '/',
  '/index.html',
  // Local files
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
  // Third-party scripts needed for the app to function offline
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
  'https://aistudiocdn.com/react@^19.2.0',
  'https://aistudiocdn.com/react-dom@^19.2.0/',
  'https://aistudiocdn.com/@google/genai@^1.22.0',
  // Google Fonts CSS (the font files themselves will be cached at runtime)
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:wght@700;900&display=swap',
];

const ALL_CACHES = [STATIC_CACHE_NAME, DYNAMIC_CACHE_NAME, FONT_CACHE_NAME];

// Install: Caches app shell
self.addEventListener('install', event => {
  console.log('[SW] Install event');
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching App Shell and third-party resources');
        const requests = APP_SHELL_URLS.map(url => {
            // For cross-origin requests, we must use 'no-cors' to cache them, 
            // even though the response will be "opaque".
            // This is necessary for CDNs if they don't support CORS for all assets.
            if (new URL(url, self.location.origin).origin !== self.location.origin) {
                return new Request(url, { mode: 'no-cors' });
            }
            return url;
        });
        return cache.addAll(requests);
      })
      .then(() => self.skipWaiting())
      .catch(err => {
          console.error('[SW] App Shell caching failed:', err);
      })
  );
});

// Activate: Clean up old caches
self.addEventListener('activate', event => {
  console.log('[SW] Activate event');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!ALL_CACHES.includes(cacheName)) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Apply caching strategies
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore non-GET requests, API calls, and browser extension requests
  if (request.method !== 'GET' || request.url.startsWith('chrome-extension://') || url.pathname.includes('/v1beta/')) {
    return;
  }
  
  // Strategy: Google Fonts (Stale While Revalidate)
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(staleWhileRevalidate(request, FONT_CACHE_NAME));
    return;
  }
  
  // Strategy: Navigation requests (Cache First, fallback to Network)
  // This is the crucial part for PWA launch. Always serves the app shell.
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match('/index.html')
        .then(response => {
          return response || fetch('/index.html');
        })
    );
    return;
  }

  // Strategy: For other requests, try to find in any cache first.
  // Then fallback to a stale-while-revalidate for dynamic content.
  event.respondWith(
    caches.match(request).then(cachedResponse => {
        if (cachedResponse) {
            return cachedResponse;
        }
        // Fallback to stale-while-revalidate for dynamic content.
        return staleWhileRevalidate(request, DYNAMIC_CACHE_NAME);
    })
  );
});


// --- Caching Strategy Helper Functions ---

async function staleWhileRevalidate(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cachedResponsePromise = await cache.match(request);
    
    const fetchPromise = fetch(request).then(networkResponse => {
        // We can only cache successful responses
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    }).catch(err => {
        console.warn(`[SW] Network request for ${request.url} failed.`, err);
        // If network fails, we'll just rely on the cached response if it exists.
        return cachedResponsePromise;
    });

    return cachedResponsePromise || fetchPromise;
}