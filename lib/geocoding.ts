import { devLog } from '@/lib/devLogger';

export interface Coordinates {
  latitude: number;
  longitude: number;
  displayName?: string;
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
 * Get coordinates with fallback to common Indian cities
 */
export async function getCoordinatesWithFallback(place: string): Promise<Coordinates> {
  // Try geocoding first
  const coords = await geocodePlace(place);
  if (coords) return coords;
  
  // Fallback to common Indian cities
  const fallbacks: Record<string, Coordinates> = {
    'mumbai': { latitude: 19.0760, longitude: 72.8777 },
    'delhi': { latitude: 28.7041, longitude: 77.1025 },
    'bangalore': { latitude: 12.9716, longitude: 77.5946 },
    'mysore': { latitude: 12.2958, longitude: 76.6394 },
    'chennai': { latitude: 13.0827, longitude: 80.2707 },
    'kolkata': { latitude: 22.5726, longitude: 88.3639 },
    'hyderabad': { latitude: 17.3850, longitude: 78.4867 },
    'pune': { latitude: 18.5204, longitude: 73.8567 }
  };
  
  const placeLower = place.toLowerCase();
  for (const [city, coords] of Object.entries(fallbacks)) {
    if (placeLower.includes(city)) {
      devLog.debug('Using fallback coordinates', { place, city }, 'geocoding');
      return coords;
    }
  }
  
  // Ultimate fallback: Mumbai (center of India)
  devLog.warn('⚠️ Using default Mumbai coordinates for:', place, 'geocoding');
  return { latitude: 19.0760, longitude: 72.8777 };
}
