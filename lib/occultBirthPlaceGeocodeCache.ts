/**
 * Short-lived in-memory cache + in-flight dedupe for geocoding from occult/universal
 * when many parallel calls share the same birth place or current location string.
 */

import type { GeocodedLocation } from '@/services/geocoding';

const TTL_MS = 120_000;

type CacheEntry = { at: number; coords: GeocodedLocation };

const cache = new Map<string, CacheEntry>();
const pending = new Map<string, Promise<GeocodedLocation | null>>();

function normalizePlaceKey(place: string): string {
  return place.trim().toLowerCase().replace(/\s+/g, ' ');
}

export async function geocodePlaceCachedOccult(placeName: string): Promise<GeocodedLocation | null> {
  const key = normalizePlaceKey(placeName);
  if (!key) return null;

  const now = Date.now();
  const hit = cache.get(key);
  if (hit && now - hit.at < TTL_MS) {
    return hit.coords;
  }

  const inflight = pending.get(key);
  if (inflight) return inflight;

  const work = (async (): Promise<GeocodedLocation | null> => {
    try {
      const { geocodePlace } = await import('@/services/geocoding');
      const coords = await geocodePlace(placeName.trim());
      if (coords) {
        cache.set(key, { at: Date.now(), coords });
      }
      return coords;
    } finally {
      pending.delete(key);
    }
  })();

  pending.set(key, work);
  return work;
}
