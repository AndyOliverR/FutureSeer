/**
 * FutureSeer service-worker decommission script.
 * Purpose: aggressively remove any previously installed SW behavior.
 */

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((name) => name.startsWith('futureseer-'))
          .map((name) => caches.delete(name))
      );
    } catch (error) {
      // no-op
    }

    try {
      const allClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const client of allClients) {
        client.postMessage({ type: 'FS_SW_DECOMMISSIONED' });
      }
    } catch (error) {
      // no-op
    }

    await self.clients.claim();
    await self.registration.unregister();
  })());
});

// Do not intercept any requests.
self.addEventListener('fetch', () => {});
