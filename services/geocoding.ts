export interface GeocodedLocation {
  latitude: number;
  longitude: number;
  formattedAddress: string;
}

// Use OpenStreetMap Nominatim (free, no API key needed)
export async function geocodePlace(placeName: string): Promise<GeocodedLocation | null> {
  try {
    const encodedPlace = encodeURIComponent(placeName);
    const url = `https://nominatim.openstreetmap.org/search?q=${encodedPlace}&format=json&limit=1`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'FutureSeer-App' // Required by Nominatim
      }
    });
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      const result = data[0];
      return {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        formattedAddress: result.display_name
      };
    }
    
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}
