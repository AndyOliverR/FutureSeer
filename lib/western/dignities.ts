/**
 * Western Astrology Planetary Dignities System
 * Essential dignities: Domicile, Exaltation, Detriment, Fall
 */

export interface PlanetaryDignity {
  domicile: string[];      // Signs ruled by planet
  exaltation: string;       // Sign of exaltation
  detriment: string[];     // Signs opposite to domicile
  fall: string;            // Sign opposite to exaltation
}

export const WESTERN_DIGNITIES: Record<string, PlanetaryDignity> = {
  'Sun': {
    domicile: ['Leo'],
    exaltation: 'Aries',
    detriment: ['Aquarius'],
    fall: 'Libra'
  },
  'Moon': {
    domicile: ['Cancer'],
    exaltation: 'Taurus',
    detriment: ['Capricorn'],
    fall: 'Scorpio'
  },
  'Mercury': {
    domicile: ['Gemini', 'Virgo'],
    exaltation: 'Virgo',
    detriment: ['Sagittarius', 'Pisces'],
    fall: 'Pisces'
  },
  'Venus': {
    domicile: ['Taurus', 'Libra'],
    exaltation: 'Pisces',
    detriment: ['Scorpio', 'Aries'],
    fall: 'Virgo'
  },
  'Mars': {
    domicile: ['Aries', 'Scorpio'],
    exaltation: 'Capricorn',
    detriment: ['Libra', 'Taurus'],
    fall: 'Cancer'
  },
  'Jupiter': {
    domicile: ['Sagittarius', 'Pisces'],
    exaltation: 'Cancer',
    detriment: ['Gemini', 'Virgo'],
    fall: 'Capricorn'
  },
  'Saturn': {
    domicile: ['Capricorn', 'Aquarius'],
    exaltation: 'Libra',
    detriment: ['Cancer', 'Leo'],
    fall: 'Aries'
  },
  'Uranus': {
    domicile: ['Aquarius'],
    exaltation: 'Scorpio',
    detriment: ['Leo'],
    fall: 'Taurus'
  },
  'Neptune': {
    domicile: ['Pisces'],
    exaltation: 'Cancer',
    detriment: ['Virgo'],
    fall: 'Capricorn'
  },
  'Pluto': {
    domicile: ['Scorpio'],
    exaltation: 'Aries',
    detriment: ['Taurus'],
    fall: 'Libra'
  }
};

/**
 * Get planetary dignity for a planet in a specific sign
 */
export function getPlanetaryDignity(planet: string, sign: string): {
  dignity: 'domicile' | 'exaltation' | 'detriment' | 'fall' | 'neutral';
  strength: number;
  description: string;
} {
  const planetDignities = WESTERN_DIGNITIES[planet];
  if (!planetDignities) {
    return {
      dignity: 'neutral',
      strength: 0,
      description: 'Unknown planet'
    };
  }

  // Check domicile (rulership)
  if (planetDignities.domicile.includes(sign)) {
    return {
      dignity: 'domicile',
      strength: 5,
      description: `${planet} is in its domicile (rulership) in ${sign}`
    };
  }

  // Check exaltation
  if (planetDignities.exaltation === sign) {
    return {
      dignity: 'exaltation',
      strength: 4,
      description: `${planet} is exalted in ${sign}`
    };
  }

  // Check detriment
  if (planetDignities.detriment.includes(sign)) {
    return {
      dignity: 'detriment',
      strength: -3,
      description: `${planet} is in detriment in ${sign}`
    };
  }

  // Check fall
  if (planetDignities.fall === sign) {
    return {
      dignity: 'fall',
      strength: -4,
      description: `${planet} is in its fall in ${sign}`
    };
  }

  // Neutral placement
  return {
    dignity: 'neutral',
    strength: 0,
    description: `${planet} is neutrally placed in ${sign}`
  };
}

/**
 * Get dignity color for UI display
 */
export function getDignityColor(dignity: string): string {
  const colors: Record<string, string> = {
    'domicile': '#4ECDC4',    // Teal - strong positive
    'exaltation': '#45B7D1',  // Blue - positive
    'neutral': '#98D8C8',     // Mint - neutral
    'detriment': '#FFB6C1',   // Light pink - negative
    'fall': '#FF6B6B'         // Red - strong negative
  };
  
  return colors[dignity] || '#FFFFFF';
}

/**
 * Calculate overall planetary strength based on dignity
 */
export function calculatePlanetaryStrength(planet: string, sign: string, house: number): {
  dignityStrength: number;
  houseStrength: number;
  totalStrength: number;
  description: string;
} {
  const dignity = getPlanetaryDignity(planet, sign);
  
  // House strength (angular houses are stronger)
  const angularHouses = [1, 4, 7, 10]; // Ascendant, IC, Descendant, MC
  const succedentHouses = [2, 5, 8, 11];
  const cadentHouses = [3, 6, 9, 12];
  
  let houseStrength = 0;
  let houseDescription = '';
  
  if (angularHouses.includes(house)) {
    houseStrength = 2;
    houseDescription = 'angular house (strong)';
  } else if (succedentHouses.includes(house)) {
    houseStrength = 1;
    houseDescription = 'succedent house (moderate)';
  } else if (cadentHouses.includes(house)) {
    houseStrength = -1;
    houseDescription = 'cadent house (weak)';
  }
  
  const totalStrength = dignity.strength + houseStrength;
  
  return {
    dignityStrength: dignity.strength,
    houseStrength: houseStrength,
    totalStrength: totalStrength,
    description: `${dignity.description}, in ${houseDescription}`
  };
}
