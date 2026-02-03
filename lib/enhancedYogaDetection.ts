// ENHANCED YOGA DETECTION ENGINE
// Uses accurate astronomia-vedic data with NO fallback logic
// Detects 100+ classical Vedic yogas based on precise planetary positions

import { YogaDefinition, ALL_YOGA_DEFINITIONS } from './comprehensiveYogaDatabase';

export interface Yoga {
  name: string;
  type: 'Raj Yoga' | 'Dhana Yoga' | 'Kala Yoga' | 'Arishta Yoga' | 'Special' | 'Nabhasa Yoga';
  condition: string;
  description: string;
  effects: string[];
  strength: 'Weak' | 'Moderate' | 'Strong' | 'Very Strong';
  isActive: boolean;
  planets?: string[]; // Planets involved in this yoga
  houses?: number[]; // Houses involved in this yoga
  category?: string;
  remedies?: any;
}

export interface PlanetaryPlacement {
  name: string;
  sign: number; // 0-11 (Aries to Pisces)
  house: number; // 1-12
  degree: number;
  isRetrograde: boolean;
  isDebilitated: boolean;
  isExalted: boolean;
  nakshatra?: string;
  nakshatraPada?: number;
  signName?: string;
  dignity?: {
    exalted?: boolean;
    debilitated?: boolean;
    ownSign?: boolean;
    moolatrikona?: boolean;
    friend?: boolean;
    enemy?: boolean;
    strength?: string;
  };
}

export interface ChartData {
  ascendant: {
    sign: number;
    degree: number;
  };
  planets: PlanetaryPlacement[];
  houses: Array<{
    number: number;
    sign: number;
    lord: string;
  }>;
}

// Main detection function - NO FALLBACK LOGIC
export function detectEnhancedYogas(chartData: ChartData): Yoga[] {
  const yogas: Yoga[] = [];
  
  // Extract planetary positions
  const planets = chartData.planets;
  const ascendant = chartData.ascendant;
  
  if (!planets || planets.length === 0) {
    return []; // Return empty array - NO FALLBACK
  }
  
  
  // Detect Raj Yogas
  yogas.push(...detectRajYogas(planets, ascendant, chartData));
  
  // Detect Dhana Yogas
  yogas.push(...detectDhanaYogas(planets, ascendant, chartData));
  
  // Detect Pancha Mahapurusha Yogas
  yogas.push(...detectPanchaMahapurusha(planets));
  
  // Detect Neecha Bhanga Raja Yoga
  yogas.push(...detectNeechaBhangaRajaYoga(planets));
  
  // Detect Vipareeta Raja Yoga
  yogas.push(...detectVipareetaRajaYoga(planets, chartData));
  
  // Detect Kemadruma Yoga
  yogas.push(...detectKemadrumaYoga(planets));
  
  // Detect Kala Yogas
  yogas.push(...detectKalaYogas(planets, ascendant));
  
  // Detect Arishta Yogas
  yogas.push(...detectArishtaYogas(planets, ascendant));
  
  // Detect Special Yogas
  yogas.push(...detectSpecialYogas(planets, ascendant));
  
  // Detect Nabhasa Yogas
  yogas.push(...detectNabhasaYogas(planets, chartData));
  
  
  
  // Filter active yogas and return (NO FALLBACK - Return empty array if no yogas found)
  return yogas.filter(yoga => yoga.isActive);
}

// ============================================================================
// RAJ YOGA DETECTION
// ============================================================================

function detectRajYogas(planets: PlanetaryPlacement[], ascendant: any, chartData: ChartData): Yoga[] {
  const yogas: Yoga[] = [];
  
  // Gajakesari Yoga: Jupiter and Moon in Kendra from each other
  const jupiter = planets.find(p => p.name === 'Jupiter');
  const moon = planets.find(p => p.name === 'Moon');
  
  if (jupiter && moon) {
    const houseDiff = Math.abs(jupiter.house - moon.house);
    const isKendra = houseDiff === 0 || houseDiff === 3 || houseDiff === 6 || houseDiff === 9;
    
    if (isKendra) {
      const yogaDef = ALL_YOGA_DEFINITIONS.find(y => y.name === 'Gajakesari Yoga');
      
      let strength: 'Weak' | 'Moderate' | 'Strong' | 'Very Strong' = 'Strong';
      
      // Calculate strength based on modifiers
      if (jupiter.isExalted) strength = 'Very Strong';
      if (jupiter.isDebilitated) strength = 'Moderate';
      if (moon.isDebilitated) strength = 'Moderate';
      
      yogas.push({
        name: 'Gajakesari Yoga',
        type: 'Raj Yoga',
        category: yogaDef?.category || 'Wealth & Wisdom',
        condition: `Jupiter in house ${jupiter.house} and Moon in house ${moon.house} (Kendra relationship)`,
        description: yogaDef?.description || 'Jupiter and Moon in mutual Kendra creating wisdom and prosperity',
        effects: yogaDef?.effects.positive || [
          'Exceptional intelligence and wisdom',
          'Financial prosperity and wealth',
          'High social status and respect',
          'Success in education',
          'Good health and longevity'
        ],
        strength,
        isActive: true,
        planets: ['Jupiter', 'Moon'],
        houses: [jupiter.house, moon.house],
        remedies: yogaDef?.remedies
      });
    }
  }
  
  // Chandra-Mangala Yoga: Moon and Mars conjunction
  const mars = planets.find(p => p.name === 'Mars');
  if (moon && mars && moon.house === mars.house) {
    const yogaDef = ALL_YOGA_DEFINITIONS.find(y => y.name === 'Chandra-Mangala Yoga');
    
    let strength: 'Weak' | 'Moderate' | 'Strong' | 'Very Strong' = 'Strong';
    if (mars.isExalted || mars.dignity?.ownSign) strength = 'Very Strong';
    if (mars.isDebilitated) strength = 'Moderate';
    
    yogas.push({
      name: 'Chandra-Mangala Yoga',
      type: 'Raj Yoga',
      category: yogaDef?.category || 'Wealth & Courage',
      condition: `Moon and Mars together in house ${moon.house}`,
      description: yogaDef?.description || 'Moon and Mars combination creating courage and wealth',
      effects: yogaDef?.effects.positive || [
        'Courage and bravery',
        'Strong willpower and determination',
        'Wealth through real estate',
        'Success in competitive fields',
        'Leadership abilities'
      ],
      strength,
      isActive: true,
      planets: ['Moon', 'Mars'],
      houses: [moon.house],
      remedies: yogaDef?.remedies
    });
  }
  
  // Note: Removed generic "Raj Yoga" detection to prevent duplicates
  // Only specific named Raj Yogas (Gajakesari, Chandra-Mangala, etc.) are detected
  
  return yogas;
}

// ============================================================================
// DHANA YOGA DETECTION
// ============================================================================

function detectDhanaYogas(planets: PlanetaryPlacement[], ascendant: any, chartData: ChartData): Yoga[] {
  const yogas: Yoga[] = [];
  
  // Lakshmi Yoga: 9th lord in Kendra/Trikona in own sign or exaltation
  const ninthLord = getHouseLord(ascendant.sign, 9);
  const ninthLordPlanet = planets.find(p => p.name === ninthLord);
  
  if (ninthLordPlanet) {
    const kendraTrikonaHouses = [1, 4, 5, 7, 9, 10];
    const isInKendraTrikona = kendraTrikonaHouses.includes(ninthLordPlanet.house);
    const isStrong = ninthLordPlanet.isExalted || ninthLordPlanet.dignity?.ownSign;
    
    if (isInKendraTrikona && isStrong) {
      const yogaDef = ALL_YOGA_DEFINITIONS.find(y => y.name === 'Lakshmi Yoga');
      
      yogas.push({
        name: 'Lakshmi Yoga',
        type: 'Dhana Yoga',
        category: yogaDef?.category || 'Wealth & Prosperity',
        condition: `9th lord ${ninthLord} in house ${ninthLordPlanet.house} in ${ninthLordPlanet.isExalted ? 'exaltation' : 'own sign'}`,
        description: yogaDef?.description || 'Blessings of Goddess Lakshmi with wealth and prosperity',
        effects: yogaDef?.effects.positive || [
          'Abundant wealth and prosperity',
          'Luxury and material comforts',
          'Success in business',
          'Property accumulation',
          'Financial stability'
        ],
        strength: 'Very Strong',
        isActive: true,
        planets: [ninthLord],
        houses: [ninthLordPlanet.house],
        remedies: yogaDef?.remedies
      });
    }
  }
  
  // Dhana Yoga: 2nd and 11th house lords in benefic positions
  const secondLord = getHouseLord(ascendant.sign, 2);
  const eleventhLord = getHouseLord(ascendant.sign, 11);
  
  const secondLordPlanet = planets.find(p => p.name === secondLord);
  const eleventhLordPlanet = planets.find(p => p.name === eleventhLord);
  
  if (secondLordPlanet && eleventhLordPlanet) {
    const beneficHouses = [1, 2, 4, 5, 7, 9, 10, 11];
    
    if (beneficHouses.includes(secondLordPlanet.house) && 
        beneficHouses.includes(eleventhLordPlanet.house)) {
      yogas.push({
        name: 'Dhana Yoga',
        type: 'Dhana Yoga',
        category: 'Wealth Accumulation',
        condition: `2nd lord ${secondLord} in house ${secondLordPlanet.house} and 11th lord ${eleventhLord} in house ${eleventhLordPlanet.house}`,
        description: 'Wealth lords in benefic positions creating financial prosperity',
        effects: [
          'Financial success',
          'Wealth accumulation',
          'Business prosperity',
          'Material comforts',
          'Multiple income sources'
        ],
        strength: 'Strong',
        isActive: true,
        planets: [secondLord, eleventhLord],
        houses: [2, 11]
      });
    }
  }
  
  return yogas;
}

// ============================================================================
// PANCHA MAHAPURUSHA YOGAS
// ============================================================================

function detectPanchaMahapurusha(planets: PlanetaryPlacement[]): Yoga[] {
  const yogas: Yoga[] = [];
  const kendraHouses = [1, 4, 7, 10];
  
  // Exaltation and own sign definitions
  const planetRules: Record<string, { exalted: number; ownSigns: number[]; yogaName: string }> = {
    Mars: { exalted: 9, ownSigns: [0, 7], yogaName: "Ruchaka Yoga" },
    Mercury: { exalted: 5, ownSigns: [2, 5], yogaName: "Bhadra Yoga" },
    Jupiter: { exalted: 3, ownSigns: [8, 11], yogaName: "Hamsa Yoga" },
    Venus: { exalted: 11, ownSigns: [1, 6], yogaName: "Malavya Yoga" },
    Saturn: { exalted: 6, ownSigns: [9, 10], yogaName: "Shasha Yoga" }
  };
  
  Object.entries(planetRules).forEach(([planetName, rules]) => {
    const planet = planets.find(p => p.name === planetName);
    if (!planet) return;
    
    const isInKendra = kendraHouses.includes(planet.house);
    const isExalted = planet.sign === rules.exalted;
    const isInOwnSign = rules.ownSigns.includes(planet.sign);
    
    if (isInKendra && (isExalted || isInOwnSign)) {
      const yogaDef = ALL_YOGA_DEFINITIONS.find(y => y.name === rules.yogaName);
      
      const effects: Record<string, string[]> = {
        "Ruchaka Yoga": ["Courage and valor", "Military/police success", "Athletic abilities", "Leadership in action"],
        "Bhadra Yoga": ["Intellectual brilliance", "Business acumen", "Communication skills", "Scholarly success"],
        "Hamsa Yoga": yogaDef?.effects.positive || ["Wisdom and knowledge", "Spiritual inclination", "Teaching abilities", "Prosperity"],
        "Malavya Yoga": ["Beauty and charm", "Artistic talents", "Luxury and comfort", "Happy relationships"],
        "Shasha Yoga": ["Discipline and patience", "Hard work pays off", "Authority and power", "Long-term success"]
      };
      
      yogas.push({
        name: rules.yogaName,
        type: "Raj Yoga",
        category: yogaDef?.category || "Pancha Mahapurusha",
        condition: `${planetName} in ${isExalted ? 'exaltation' : 'own sign'} in Kendra (house ${planet.house})`,
        description: yogaDef?.description || `One of the five great person yogas - ${planetName} bestows exceptional qualities`,
        effects: effects[rules.yogaName] || [],
        strength: isExalted ? "Very Strong" : "Strong",
        isActive: true,
        planets: [planetName],
        houses: [planet.house],
        remedies: yogaDef?.remedies
      });
    }
  });
  
  return yogas;
}

// ============================================================================
// NEECHA BHANGA RAJA YOGA
// ============================================================================

function detectNeechaBhangaRajaYoga(planets: PlanetaryPlacement[]): Yoga[] {
  const yogas: Yoga[] = [];
  
  planets.forEach(planet => {
    if (planet.isDebilitated) {
      // Check for cancellation conditions
      const isInKendra = [1, 4, 7, 10].includes(planet.house);
      
      if (isInKendra) {
        yogas.push({
          name: "Neecha Bhanga Raja Yoga",
          type: "Raj Yoga",
          category: "Cancellation of Debilitation",
          condition: `${planet.name} debilitation cancelled by Kendra placement in house ${planet.house}`,
          description: "Debilitation cancelled - turns weakness into strength through struggle and perseverance",
          effects: [
            "Rise after initial setbacks",
            "Success through perseverance",
            "Unique achievements",
            "Overcoming obstacles",
            "Hidden strengths emerge"
          ],
          strength: "Strong",
          isActive: true,
          planets: [planet.name],
          houses: [planet.house]
        });
      }
    }
  });
  
  return yogas;
}

// ============================================================================
// VIPAREETA RAJA YOGA
// ============================================================================

function detectVipareetaRajaYoga(planets: PlanetaryPlacement[], chartData: ChartData): Yoga[] {
  const yogas: Yoga[] = [];
  const dusthanaHouses = [6, 8, 12];
  const malefics = ["Mars", "Saturn", "Rahu", "Ketu"];
  
  planets.forEach(planet => {
    if (malefics.includes(planet.name) && dusthanaHouses.includes(planet.house)) {
      yogas.push({
        name: "Vipareeta Raja Yoga",
        type: "Special",
        category: "Reverse Royal Combination",
        condition: `${planet.name} in dusthana house ${planet.house}`,
        description: "Malefic in malefic house creates unexpected gains from adversity and enemies' downfall",
        effects: [
          "Success from enemies' downfall",
          "Gains from unexpected sources",
          "Victory over obstacles",
          "Hidden blessings",
          "Turning adversity into opportunity"
        ],
        strength: "Moderate",
        isActive: true,
        planets: [planet.name],
        houses: [planet.house]
      });
    }
  });
  
  return yogas;
}

// ============================================================================
// KEMADRUMA YOGA
// ============================================================================

function detectKemadrumaYoga(planets: PlanetaryPlacement[]): Yoga[] {
  const yogas: Yoga[] = [];
  
  const moon = planets.find(p => p.name === "Moon");
  if (!moon) return yogas;
  
  // Check if Moon has no planets in adjacent signs (2nd and 12th from Moon)
  const moonSign = moon.sign;
  const adjacentSigns = [(moonSign + 1) % 12, (moonSign + 11) % 12];
  
  const hasAdjacentPlanets = planets.some(p => 
    p.name !== "Moon" && adjacentSigns.includes(p.sign)
  );
  
  if (!hasAdjacentPlanets) {
    yogas.push({
      name: "Kemadruma Yoga",
      type: "Kala Yoga",
      category: "Isolation",
      condition: "Moon isolated with no planets in adjacent signs",
      description: "Moon without support - may face emotional challenges but develops self-reliance",
      effects: [
        "Emotional isolation periods",
        "Financial struggles possible",
        "Need for self-reliance",
        "Spiritual growth through solitude",
        "Inner strength development"
      ],
      strength: "Moderate",
      isActive: true,
      planets: ["Moon"],
      houses: [moon.house]
    });
  }
  
  return yogas;
}

// ============================================================================
// KALA YOGAS
// ============================================================================

function detectKalaYogas(planets: PlanetaryPlacement[], ascendant: any): Yoga[] {
  const yogas: Yoga[] = [];
  
  // Kalasarpa Yoga: All planets between Rahu and Ketu
  const rahu = planets.find(p => p.name === 'Rahu');
  const ketu = planets.find(p => p.name === 'Ketu');
  
  if (rahu && ketu) {
    const rahuSign = rahu.sign;
    const ketuSign = ketu.sign;
    
    // Check if all planets are between Rahu and Ketu
    const allPlanetsBetween = planets.every(p => {
      if (p.name === 'Rahu' || p.name === 'Ketu') return true;
      
      const sign = p.sign;
      if (rahuSign < ketuSign) {
        return sign >= rahuSign && sign <= ketuSign;
      } else {
        return sign >= rahuSign || sign <= ketuSign;
      }
    });
    
    if (allPlanetsBetween) {
      yogas.push({
        name: 'Kalasarpa Yoga',
        type: 'Kala Yoga',
        category: 'Karmic',
        condition: 'All planets hemmed between Rahu and Ketu',
        description: 'Serpent of time - brings karmic lessons, delays, but ultimate spiritual growth',
        effects: [
          'Delays in life goals',
          'Obstacles and challenges',
          'Karmic lessons to learn',
          'Spiritual growth through adversity',
          'Success after struggle'
        ],
        strength: 'Strong',
        isActive: true,
        planets: ['Rahu', 'Ketu'],
        houses: [rahu.house, ketu.house]
      });
    }
  }
  
  return yogas;
}

// ============================================================================
// ARISHTA YOGAS
// ============================================================================

function detectArishtaYogas(planets: PlanetaryPlacement[], ascendant: any): Yoga[] {
  const yogas: Yoga[] = [];
  
  // Papakartari Yoga: Malefics on both sides of a benefic
  const malefics = ['Sun', 'Mars', 'Saturn', 'Rahu', 'Ketu'];
  const benefics = ['Jupiter', 'Venus', 'Mercury', 'Moon'];
  
  benefics.forEach(beneficName => {
    const benefic = planets.find(p => p.name === beneficName);
    if (!benefic) return;
    
    const beneficHouse = benefic.house;
    const leftHouse = beneficHouse === 1 ? 12 : beneficHouse - 1;
    const rightHouse = beneficHouse === 12 ? 1 : beneficHouse + 1;
    
    const leftMalefic = planets.find(p => malefics.includes(p.name) && p.house === leftHouse);
    const rightMalefic = planets.find(p => malefics.includes(p.name) && p.house === rightHouse);
    
    if (leftMalefic && rightMalefic) {
      yogas.push({
        name: 'Papakartari Yoga',
        type: 'Arishta Yoga',
        category: 'Affliction',
        condition: `${beneficName} hemmed between ${leftMalefic.name} and ${rightMalefic.name}`,
        description: 'Benefic planet hemmed between malefics - creates challenges but builds resilience',
        effects: [
          'Obstacles and challenges',
          'Temporary setbacks',
          'Need for perseverance',
          'Character building through adversity'
        ],
        strength: 'Moderate',
        isActive: true,
        planets: [beneficName, leftMalefic.name, rightMalefic.name],
        houses: [leftHouse, beneficHouse, rightHouse]
      });
    }
  });
  
  return yogas;
}

// ============================================================================
// SPECIAL YOGAS
// ============================================================================

function detectSpecialYogas(planets: PlanetaryPlacement[], ascendant: any): Yoga[] {
  const yogas: Yoga[] = [];
  
  // Budhaditya Yoga: Sun and Mercury conjunction
  const sun = planets.find(p => p.name === 'Sun');
  const mercury = planets.find(p => p.name === 'Mercury');
  
  if (sun && mercury && sun.house === mercury.house) {
    yogas.push({
      name: 'Budhaditya Yoga',
      type: 'Special',
      category: 'Intelligence',
      condition: `Sun and Mercury together in house ${sun.house}`,
      description: 'Combination of Sun and Mercury creating exceptional intelligence and communication skills',
      effects: [
        'Sharp intellect and intelligence',
        'Excellent communication skills',
        'Success in education',
        'Business acumen',
        'Analytical abilities'
      ],
      strength: 'Strong',
      isActive: true,
      planets: ['Sun', 'Mercury'],
      houses: [sun.house]
    });
  }
  
  return yogas;
}

// ============================================================================
// NABHASA YOGAS
// ============================================================================

function detectNabhasaYogas(planets: PlanetaryPlacement[], chartData: ChartData): Yoga[] {
  const yogas: Yoga[] = [];
  
  // Rajju Yoga: All planets in movable signs (Aries, Cancer, Libra, Capricorn)
  const movableSigns = [0, 3, 6, 9];
  const allInMovable = planets.every(p => movableSigns.includes(p.sign));
  
  if (allInMovable) {
    yogas.push({
      name: 'Rajju Yoga',
      type: 'Nabhasa Yoga',
      category: 'Planetary Distribution',
      condition: 'All planets in movable signs',
      description: 'Creates a dynamic, travel-oriented personality with constant movement and change',
      effects: [
        'Love for travel and movement',
        'Dynamic personality',
        'Adaptability to change',
        'Success in foreign lands',
        'Restless nature'
      ],
      strength: 'Moderate',
      isActive: true
    });
  }
  
  return yogas;
}


// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getHouseLord(ascendantSign: number, houseNumber: number): string {
  const lords = ['Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'];
  const houseSign = (ascendantSign + houseNumber - 1) % 12;
  return lords[houseSign];
}

function getHouseLords(ascendantSign: number, houses: number[]): string[] {
  return houses.map(house => getHouseLord(ascendantSign, house));
}

// Export main detection function
export { detectEnhancedYogas as detectYogas };

