/**
 * Western Astrology Terminology Service
 * 
 * Maps Vedic astrology terms to Western astrology equivalents
 * Ensures consistent Western terminology throughout the application
 */

// Map Vedic terms to Western equivalents
export const VEDIC_TO_WESTERN_MAP = {
  'Rahu': 'North Node',
  'Ketu': 'South Node',
  'Lagna': 'Ascendant',
  'Nakshatra': 'Lunar Mansion',
  'Dasha': 'Planetary Period',
  'Bhava': 'House',
  'Graha': 'Planet',
  'Rashi': 'Sign',
  'Chandra': 'Moon',
  'Surya': 'Sun',
  'Mangal': 'Mars',
  'Budh': 'Mercury',
  'Guru': 'Jupiter',
  'Shukra': 'Venus',
  'Shani': 'Saturn'
};

// Western planet names (standardized)
export const WESTERN_PLANETS = [
  'Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 
  'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto',
  'North Node', 'South Node'
];

// Western zodiac signs
export const WESTERN_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

// Western aspect types
export const WESTERN_ASPECTS = [
  'Conjunction', 'Opposition', 'Trine', 'Square', 'Sextile',
  'Semi-Square', 'Semi-Sextile', 'Quincunx', 'Sesquiquadrate'
];

/**
 * Convert Vedic terminology to Western terminology
 */
export function convertToWesternTerminology(text: string): string {
  if (!text) return text;
  
  let converted = text;
  
  // Replace Vedic terms with Western equivalents
  Object.entries(VEDIC_TO_WESTERN_MAP).forEach(([vedic, western]) => {
    const regex = new RegExp(`\\b${vedic}\\b`, 'gi');
    converted = converted.replace(regex, western);
  });
  
  return converted;
}

/**
 * Convert planet name to Western standard
 */
export function convertPlanetToWestern(planetName: string): string {
  const name = planetName.trim();
  
  // Direct mapping for common variations
  const planetMap: Record<string, string> = {
    'rahu': 'North Node',
    'ketu': 'South Node',
    'sun': 'Sun',
    'moon': 'Moon',
    'mercury': 'Mercury',
    'venus': 'Venus',
    'mars': 'Mars',
    'jupiter': 'Jupiter',
    'saturn': 'Saturn',
    'uranus': 'Uranus',
    'neptune': 'Neptune',
    'pluto': 'Pluto'
  };
  
  return planetMap[name.toLowerCase()] || name;
}

/**
 * Convert sign name to Western standard
 */
export function convertSignToWestern(signName: string): string {
  const name = signName.trim();
  
  // Direct mapping for common variations
  const signMap: Record<string, string> = {
    'aries': 'Aries',
    'taurus': 'Taurus',
    'gemini': 'Gemini',
    'cancer': 'Cancer',
    'leo': 'Leo',
    'virgo': 'Virgo',
    'libra': 'Libra',
    'scorpio': 'Scorpio',
    'sagittarius': 'Sagittarius',
    'capricorn': 'Capricorn',
    'aquarius': 'Aquarius',
    'pisces': 'Pisces'
  };
  
  return signMap[name.toLowerCase()] || name;
}

/**
 * Convert aspect type to Western standard
 */
export function convertAspectToWestern(aspectType: string): string {
  const aspect = aspectType.trim();
  
  const aspectMap: Record<string, string> = {
    'conjunction': 'Conjunction',
    'opposition': 'Opposition',
    'trine': 'Trine',
    'square': 'Square',
    'sextile': 'Sextile',
    'semisquare': 'Semi-Square',
    'semisextile': 'Semi-Sextile',
    'quincunx': 'Quincunx',
    'sesquiquadrate': 'Sesquiquadrate'
  };
  
  return aspectMap[aspect.toLowerCase()] || aspect;
}

/**
 * Recursively convert object properties to Western terminology
 */
export function convertObjectToWestern(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (typeof obj === 'string') {
    return convertToWesternTerminology(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => convertObjectToWestern(item));
  }
  
  if (typeof obj === 'object') {
    const converted: any = {};
    
    Object.entries(obj).forEach(([key, value]) => {
      // Convert key names
      const convertedKey = convertToWesternTerminology(key);
      converted[convertedKey] = convertObjectToWestern(value);
    });
    
    return converted;
  }
  
  return obj;
}

/**
 * Filter out Vedic-only planets for Western astrology
 */
export function filterWesternPlanets(planets: any[]): any[] {
  return planets.filter(planet => {
    const name = planet.name?.toLowerCase() || '';
    // Keep only Western planets, filter out Vedic-specific ones
    return WESTERN_PLANETS.some(western => 
      western.toLowerCase() === name || 
      name.includes(western.toLowerCase().replace(' ', ''))
    );
  });
}

/**
 * Validate Western astrology data
 */
export function validateWesternData(data: any): boolean {
  if (!data) return false;
  
  // Check if planets array contains only Western planets
  if (data.planets && Array.isArray(data.planets)) {
    const hasVedicPlanets = data.planets.some((planet: any) => {
      const name = planet.name?.toLowerCase() || '';
      return name === 'rahu' || name === 'ketu';
    });
    
    if (hasVedicPlanets) {
      console.warn('Western astrology data contains Vedic planets (Rahu/Ketu)');
    }
  }
  
  return true;
}
