import { devLog } from '@/lib/devLogger';

export interface Coordinates {
  latitude: number;
  longitude: number;
  displayName?: string;
}

/** How coordinates were resolved (for callers that need fallbacks beyond a generic default). */
export type CoordinateResolutionSource = 'geocode' | 'keyed_fallback' | 'ultimate_fallback';

export interface CoordinatesWithMeta extends Coordinates {
  resolution: CoordinateResolutionSource;
}

const GEOCODING_CACHE: Record<string, Coordinates> = {};

/**
 * Convert a place name to coordinates using Nominatim (OpenStreetMap)
 * @param place - City name (e.g., "Mysore, Karnataka, India")
 * @returns Coordinates or null if not found
 */
export async function geocodePlace(place: string): Promise<Coordinates | null> {
  if (!place) return null;
  
  // Check cache first
  const cacheKey = place.toLowerCase().trim();
  if (GEOCODING_CACHE[cacheKey]) {
    devLog.debug('📍 Using cached coordinates for:', place);
    return GEOCODING_CACHE[cacheKey];
  }
  
  try {
    // Use Nominatim API (OpenStreetMap)
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(place)}&format=json&limit=1`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'FutureSeer-Vedic-Astrology-App' // Required by Nominatim
      }
    });
    
    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      const result = data[0];
      const coordinates: Coordinates = {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        displayName: result.display_name
      };
      
      // Cache the result
      GEOCODING_CACHE[cacheKey] = coordinates;
      
      devLog.debug('Geocoded', { place, coordinates }, 'geocoding');
      return coordinates;
    }
    
    devLog.warn('⚠️ No coordinates found for:', place, 'geocoding');
    return null;
  } catch (error) {
    devLog.error('❌ Geocoding error:', error, 'geocoding');
    return null;
  }
}

/**
 * Resolve coordinates and record whether geocoding, a keyed city match, or the generic default was used.
 */
export async function getCoordinatesWithMeta(place: string): Promise<CoordinatesWithMeta> {
  const trimmed = typeof place === 'string' ? place.trim() : '';
  if (!trimmed) {
    devLog.warn('⚠️ Empty place for coordinates', {}, 'geocoding');
    return { latitude: 19.076, longitude: 72.8777, resolution: 'ultimate_fallback' };
  }

  const coords = await geocodePlace(trimmed);
  if (coords) return { ...coords, resolution: 'geocode' };

  const fallbacks: Record<string, Coordinates> = {
    mumbai: { latitude: 19.076, longitude: 72.8777 },
    delhi: { latitude: 28.7041, longitude: 77.1025 },
    bangalore: { latitude: 12.9716, longitude: 77.5946 },
    bengaluru: { latitude: 12.9716, longitude: 77.5946 },
    mysore: { latitude: 12.2958, longitude: 76.6394 },
    mysuru: { latitude: 12.3052, longitude: 76.6552 },
    chennai: { latitude: 13.0827, longitude: 80.2707 },
    kolkata: { latitude: 22.5726, longitude: 88.3639 },
    hyderabad: { latitude: 17.385, longitude: 78.4867 },
    pune: { latitude: 18.5204, longitude: 73.8567 },
  };

  const placeLower = trimmed.toLowerCase();
  for (const [city, c] of Object.entries(fallbacks)) {
    if (placeLower.includes(city)) {
      devLog.debug('Using fallback coordinates', { place: trimmed, city }, 'geocoding');
      return { ...c, resolution: 'keyed_fallback' };
    }
  }

  devLog.warn('⚠️ Using default Mumbai coordinates for:', trimmed, 'geocoding');
  return { latitude: 19.076, longitude: 72.8777, resolution: 'ultimate_fallback' };
}

/**
 * Get coordinates with fallback to common Indian cities
 */
export async function getCoordinatesWithFallback(place: string): Promise<Coordinates> {
  const { resolution, ...coords } = await getCoordinatesWithMeta(place);
  void resolution;
  return coords;
}
