/**
 * FutureSeer Service Worker
 * Implements PWA functionality with offline support and caching strategies
 */

// Cache version - increment when SW logic or precache list changes so clients drop old caches
const CACHE_VERSION = 'v1.0.3';
const CACHE_NAME = `futureseer-${CACHE_VERSION}`;

// Cache names for different strategies
const CACHES = {
  static: `${CACHE_NAME}-static`,
  dynamic: `${CACHE_NAME}-dynamic`,
  images: `${CACHE_NAME}-images`,
};

// Assets to precache on install (do NOT include '/' - document must be network-first so footer/UI updates deploy)
const PRECACHE_ASSETS = [
  '/offline',
  '/og-image.svg',
  '/manifest.json',
];

// Maximum cache sizes
const MAX_CACHE_SIZE = {
  images: 50,
  dynamic: 30,
};

/**
 * Install Event - Precache critical assets
 */
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(CACHES.static)
      .then((cache) => {
        console.log('[SW] Precaching static assets');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        console.log('[SW] Service worker installed successfully');
        // Skip waiting to activate immediately
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Installation failed:', error);
      })
  );
});

/**
 * Activate Event - Clean up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              // Remove caches that don't match current version
              return cacheName.startsWith('futureseer-') && !Object.values(CACHES).includes(cacheName);
            })
            .map((cacheName) => {
              console.log('[SW] Removing old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('[SW] Service worker activated successfully');
        // Take control of all clients immediately
        return self.clients.claim();
      })
  );
});

/**
 * Fetch Event - Handle requests with appropriate caching strategy
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Never proxy cross-origin requests via this SW (e.g. Google reCAPTCHA script).
  if (url.origin !== self.location.origin) {
    return;
  }

  // Choose strategy based on request type
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request, CACHES.static));
  } else if (isImage(url)) {
    event.respondWith(staleWhileRevalidate(request, CACHES.images));
  } else if (isAPIRequest(url)) {
    event.respondWith(networkFirst(request, CACHES.dynamic));
  } else {
    event.respondWith(networkFirst(request, CACHES.dynamic));
  }
});

/**
 * Cache First Strategy
 * Use cached version if available, otherwise fetch from network
 */
async function cacheFirst(request, cacheName) {
  try {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }

    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error('[SW] Cache first failed:', error);
    return caches.match('/offline');
  }
}

/**
 * Network First Strategy
 * Try network first, fall back to cache if offline
 */
async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    // Do not cache navigations; always prefer fresh HTML/document responses.
    if (request.mode === 'navigate') {
      return response;
    }
    if (response.ok) {
      try {
        const cache = await caches.open(cacheName);
        await cache.put(request, response.clone());
        limitCacheSize(cacheName, MAX_CACHE_SIZE.dynamic);
      } catch (cacheError) {
        console.warn('[SW] Cache write skipped:', cacheError);
      }
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline');
    }
    throw error;
  }
}

/**
 * Stale While Revalidate Strategy
 * Return cached version immediately, update cache in background
 */
async function staleWhileRevalidate(request, cacheName) {
  const cached = await caches.match(request);
  
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      const cache = caches.open(cacheName);
      cache.then((c) => {
        c.put(request, response.clone());
        limitCacheSize(cacheName, MAX_CACHE_SIZE.images);
      });
    }
    return response;
  });

  return cached || fetchPromise;
}

/**
 * Limit cache size by removing oldest entries
 */
async function limitCacheSize(cacheName, maxSize) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  if (keys.length > maxSize) {
    // Remove oldest entries (first in cache)
    await cache.delete(keys[0]);
    limitCacheSize(cacheName, maxSize);
  }
}

/**
 * Check if request is for a static asset (do NOT include '/' - HTML must be network-first so deploys show new content)
 */
function isStaticAsset(url) {
  return url.pathname.match(/\.(js|css|woff|woff2|ttf|otf)$/) ||
         url.pathname === '/manifest.json' ||
         url.pathname.startsWith('/_next/static/');
}

/**
 * Check if request is for an image
 */
function isImage(url) {
  return url.pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|avif|ico)$/);
}

/**
 * Check if request is an API call
 */
function isAPIRequest(url) {
  return url.pathname.startsWith('/api/');
}

/**
 * Message Event - Handle messages from clients
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
});

console.log('[SW] Service worker script loaded');
