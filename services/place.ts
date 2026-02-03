// Place lookup and geocoding utilities for Vedic Astrology
// Supports Google Places API and Nominatim fallback

export interface PlaceInfo {
  name: string;
  latitude: number;
  longitude: number;
  timezone: string;
  country: string;
  state?: string;
  city?: string;
  formatted_address: string;
}

export interface PlaceLookupOptions {
  useGooglePlaces?: boolean;
  useNominatim?: boolean;
  timeout?: number;
}

export class PlaceLookupService {
  private googlePlacesApiKey: string | null = null;
  private timeout: number = 5000;

  constructor() {
    this.googlePlacesApiKey = process.env.GOOGLE_PLACES_API_KEY || null;
  }

  /**
   * Look up place information by name
   */
  async lookupPlace(
    placeName: string, 
    options: PlaceLookupOptions = {}
  ): Promise<PlaceInfo | null> {
    const {
      useGooglePlaces = !!this.googlePlacesApiKey,
      useNominatim = true,
      timeout = this.timeout
    } = options;

    // Try Google Places first if available
    if (useGooglePlaces && this.googlePlacesApiKey) {
      try {
        const result = await this.lookupWithGooglePlaces(placeName, timeout);
        if (result) return result;
      } catch (error) {
        console.warn('Google Places lookup failed:', error);
      }
    }

    // Fallback to Nominatim
    if (useNominatim) {
      try {
        const result = await this.lookupWithNominatim(placeName, timeout);
        if (result) return result;
      } catch (error) {
        console.warn('Nominatim lookup failed:', error);
      }
    }

    return null;
  }

  /**
   * Look up place using Google Places API
   */
  private async lookupWithGooglePlaces(
    placeName: string, 
    timeout: number
  ): Promise<PlaceInfo | null> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?` +
        `input=${encodeURIComponent(placeName)}&` +
        `inputtype=textquery&` +
        `fields=place_id,name,geometry,formatted_address,address_components&` +
        `key=${this.googlePlacesApiKey}`,
        {
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Google Places API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.status !== 'OK' || !data.candidates?.length) {
        return null;
      }

      const place = data.candidates[0];
      const components = place.address_components || [];

      // Extract timezone using coordinates
      const timezone = await this.getTimezoneFromCoordinates(
        place.geometry.location.lat,
        place.geometry.location.lng
      );

      return {
        name: place.name,
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng,
        timezone,
        country: this.extractComponent(components, 'country') || '',
        state: this.extractComponent(components, 'administrative_area_level_1'),
        city: this.extractComponent(components, 'locality') || 
              this.extractComponent(components, 'administrative_area_level_2'),
        formatted_address: place.formatted_address
      };
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Look up place using Nominatim (OpenStreetMap)
   */
  private async lookupWithNominatim(
    placeName: string, 
    timeout: number
  ): Promise<PlaceInfo | null> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `q=${encodeURIComponent(placeName)}&` +
        `format=json&` +
        `limit=1&` +
        `addressdetails=1`,
        {
          signal: controller.signal,
          headers: {
            'User-Agent': 'FutureSeer/1.0',
            'Accept': 'application/json',
          },
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Nominatim API error: ${response.status}`);
      }

      const data = await response.json();

      if (!data?.length) {
        return null;
      }

      const place = data[0];
      const address = place.address || {};

      // Extract timezone using coordinates
      const timezone = await this.getTimezoneFromCoordinates(
        parseFloat(place.lat),
        parseFloat(place.lon)
      );

      return {
        name: place.display_name.split(',')[0],
        latitude: parseFloat(place.lat),
        longitude: parseFloat(place.lon),
        timezone,
        country: address.country || '',
        state: address.state || address.region,
        city: address.city || address.town || address.village,
        formatted_address: place.display_name
      };
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Get timezone from coordinates
   */
  private async getTimezoneFromCoordinates(
    lat: number, 
    lon: number
  ): Promise<string> {
    try {
      // Use timezone API if available
      if (process.env.TIMEZONE_API_KEY) {
        return await this.getTimezoneFromAPI(lat, lon);
      }

      // Fallback to basic timezone mapping
      return this.getTimezoneFromMapping(lat, lon);
    } catch (error) {
      console.warn('Timezone lookup failed:', error);
      return this.getTimezoneFromMapping(lat, lon);
    }
  }

  /**
   * Get timezone using timezone API
   */
  private async getTimezoneFromAPI(lat: number, lon: number): Promise<string> {
    const response = await fetch(
      `https://api.timezonedb.com/v2.1/get-time-zone?` +
      `key=${process.env.TIMEZONE_API_KEY}&` +
      `format=json&` +
      `by=position&` +
      `lat=${lat}&` +
      `lng=${lon}`
    );

    if (!response.ok) {
      throw new Error(`Timezone API error: ${response.status}`);
    }

    const data = await response.json();
    return data.zoneName || 'UTC';
  }

  /**
   * Get timezone using basic geographic mapping
   */
  private getTimezoneFromMapping(lat: number, lon: number): string {
    // India
    if (lat >= 8 && lat <= 37 && lon >= 68 && lon <= 97) {
      return 'Asia/Kolkata';
    }
    
    // United States
    if (lat >= 24 && lat <= 72 && lon >= -180 && lon <= -50) {
      if (lon >= -75 && lon <= -67) return 'America/New_York';
      if (lon >= -100 && lon <= -90) return 'America/Chicago';
      if (lon >= -125 && lon <= -115) return 'America/Los_Angeles';
      return 'America/New_York';
    }
    
    // Europe
    if (lat >= 35 && lat <= 72 && lon >= -25 && lon <= 40) {
      if (lon >= -5 && lon <= 10) return 'Europe/London';
      if (lon >= 10 && lon <= 25) return 'Europe/Berlin';
      if (lon >= 25 && lon <= 40) return 'Europe/Moscow';
      return 'Europe/London';
    }
    
    // Australia
    if (lat >= -45 && lat <= -10 && lon >= 110 && lon <= 155) {
      return 'Australia/Sydney';
    }
    
    // Default to UTC
    return 'UTC';
  }

  /**
   * Extract address component from Google Places response
   */
  private extractComponent(components: any[], type: string): string | undefined {
    const component = components.find(comp => comp.types.includes(type));
    return component?.long_name || component?.short_name;
  }

  /**
   * Validate coordinates
   */
  validateCoordinates(lat: number, lon: number): boolean {
    return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
  }

  /**
   * Format coordinates for display
   */
  formatCoordinates(lat: number, lon: number): string {
    const latDir = lat >= 0 ? 'N' : 'S';
    const lonDir = lon >= 0 ? 'E' : 'W';
    return `${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lon).toFixed(4)}°${lonDir}`;
  }
}

// Export singleton instance
export const placeLookupService = new PlaceLookupService();

