// Intelligent Hellenistic Astrology System
// Ancient Greco-Roman astrology (1st century BCE - 7th century CE)
// Uses Whole Sign Houses, planetary dignities, Lots, Sect, and Profections
//
// References and Resources:
// - Wikipedia: https://en.wikipedia.org/wiki/Hellenistic_astrology
// - Internet Encyclopedia of Philosophy: https://iep.utm.edu/hellenistic-astrology/
// - Britannica: Astrology in the Hellenistic period
// - Ancient texts: Ptolemy (Tetrabiblos), Vettius Valens, Dorotheus of Sidon
// - Philosophical influences: Stoicism, Neoplatonism, Neopythagoreanism

import { devLog } from '@/lib/devLogger';
import { getFirebaseDB } from './firebase';
import { userSubdocGet, userSubdocSet } from '@/lib/userSubcollectionFirestore';
import { calculateTropicalPlanets, calculateTropicalHouses, getTropicalSign, getDegreeInSign, calculateTropicalAspects } from './western/tropicalCalculator';

// Algorithm version - increment when interpretation logic changes
const HELLENISTIC_ALGORITHM_VERSION = '2.1.0'; // Updated: Personalized remedies & complete interpretation system

export interface HellenisticAstrologyReading {
  id: string;
  userId: string;
  timestamp: Date;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  
  // Core Chart Data (Whole Sign Houses)
  ascendant: {
    sign: string;
    degree: number;
    longitude: number;
  };
  
  planets: Array<{
    name: string;
    sign: string;
    degree: number;
    longitude: number;
    house: number; // Whole Sign House
    dignity: PlanetaryDignity;
    isRetrograde: boolean;
  }>;
  
  // Whole Sign Houses (each sign = one house)
  houses: Array<{
    number: number;
    sign: string;
    planets: string[];
    ruler: string;
    interpretation: string;
  }>;
  
  // Aspects
  aspects: Array<{
    planet1: string;
    planet2: string;
    type: string;
    orb: number;
    influence: 'harmonious' | 'challenging' | 'neutral';
  }>;
  
  // Planetary Dignities
  dignities: {
    [planetName: string]: PlanetaryDignity;
  };
  
  // Lots/Parts
  lots: {
    partOfFortune: Lot;
    partOfSpirit: Lot;
    partOfEros?: Lot;
    partOfNecessity?: Lot;
  };
  
  // Planetary Sect
  sect: {
    type: 'day' | 'night';
    light: 'sun' | 'moon';
    benefic: string;
    malefic: string;
    sectLeader: string;
  };
  
  // Profections
  profections: {
    currentYear: number;
    currentSign: string;
    lord: string;
    activatedHouses: number[];
    timing: string;
  };
  
  // Interpretations
  interpretations: {
    personality: {
      overview: string;
      strengths: string[];
      challenges: string[];
      lifePurpose: string;
    };
    career: {
      suitableProfessions: string[];
      careerTiming: string;
      successFactors: string[];
    };
    relationships: {
      compatibility: string;
      marriageTiming: string;
      relationshipAdvice: string;
    };
    health: {
      constitution: string;
      healthTips: string[];
      vulnerableAreas: string[];
    };
    spirituality: {
      spiritualPath: string;
      meditationAdvice: string;
      karmicLessons: string[];
    };
  };
  
  // Remedies and Guidance
  remedies: {
    planetary: Array<{
      planet: string;
      remedy: string;
      timing: string;
    }>;
    general: string[];
  };
  
  metadata: {
    calculationMethod: string;
    system: string;
    version: string;
    lastUpdated: Date;
  };
}

export interface PlanetaryDignity {
  domicile: boolean; // Rulership
  exaltation: boolean;
  triplicity: boolean;
  term: boolean;
  face: boolean;
  detriment: boolean; // Opposite of domicile
  fall: boolean; // Opposite of exaltation
  score: number; // Overall dignity score (0-5)
}

export interface Lot {
  name: string;
  sign: string;
  degree: number;
  longitude: number;
  house: number;
  interpretation: string;
}

// Hellenistic planetary rulers (traditional 7 planets)
const PLANETARY_RULERS: { [sign: string]: string } = {
  'Aries': 'Mars',
  'Taurus': 'Venus',
  'Gemini': 'Mercury',
  'Cancer': 'Moon',
  'Leo': 'Sun',
  'Virgo': 'Mercury',
  'Libra': 'Venus',
  'Scorpio': 'Mars',
  'Sagittarius': 'Jupiter',
  'Capricorn': 'Saturn',
  'Aquarius': 'Saturn',
  'Pisces': 'Jupiter'
};

// Exaltations
const EXALTATIONS: { [sign: string]: string } = {
  'Aries': 'Sun',
  'Taurus': 'Moon',
  'Gemini': 'North Node',
  'Cancer': 'Jupiter',
  'Leo': 'None',
  'Virgo': 'Mercury',
  'Libra': 'Saturn',
  'Scorpio': 'None',
  'Sagittarius': 'None',
  'Capricorn': 'Mars',
  'Aquarius': 'None',
  'Pisces': 'Venus'
};

// Triplicities (element rulers)
const TRIPLICITY_RULERS: { [element: string]: { day: string; night: string; both: string } } = {
  'fire': { day: 'Sun', night: 'Jupiter', both: 'Sun' },
  'earth': { day: 'Venus', night: 'Moon', both: 'Venus' },
  'air': { day: 'Saturn', night: 'Mercury', both: 'Saturn' },
  'water': { day: 'Venus', night: 'Mars', both: 'Venus' }
};

// Terms (Egyptian bounds) - simplified
const TERMS: { [sign: string]: Array<{ planet: string; start: number; end: number }> } = {
  'Aries': [
    { planet: 'Jupiter', start: 0, end: 6 },
    { planet: 'Venus', start: 6, end: 14 },
    { planet: 'Mercury', start: 14, end: 21 },
    { planet: 'Mars', start: 21, end: 26 },
    { planet: 'Saturn', start: 26, end: 30 }
  ],
  'Taurus': [
    { planet: 'Venus', start: 0, end: 8 },
    { planet: 'Mercury', start: 8, end: 15 },
    { planet: 'Jupiter', start: 15, end: 22 },
    { planet: 'Saturn', start: 22, end: 26 },
    { planet: 'Mars', start: 26, end: 30 }
  ],
  // Simplified - would need full table for all signs
};

// Faces (decans) - each sign divided into 3 faces of 10 degrees
const FACES: { [sign: string]: Array<{ planet: string; start: number; end: number }> } = {
  'Aries': [
    { planet: 'Mars', start: 0, end: 10 },
    { planet: 'Sun', start: 10, end: 20 },
    { planet: 'Venus', start: 20, end: 30 }
  ],
  'Taurus': [
    { planet: 'Venus', start: 0, end: 10 },
    { planet: 'Mercury', start: 10, end: 20 },
    { planet: 'Moon', start: 20, end: 30 }
  ],
  // Simplified - would need full table for all signs
};

// Sign elements
const SIGN_ELEMENTS: { [sign: string]: string } = {
  'Aries': 'fire', 'Taurus': 'earth', 'Gemini': 'air', 'Cancer': 'water',
  'Leo': 'fire', 'Virgo': 'earth', 'Libra': 'air', 'Scorpio': 'water',
  'Sagittarius': 'fire', 'Capricorn': 'earth', 'Aquarius': 'air', 'Pisces': 'water'
};

// Calculate planetary dignities
function calculatePlanetaryDignity(planetName: string, sign: string, degree: number): PlanetaryDignity {
  const domicile = PLANETARY_RULERS[sign] === planetName;
  const detriment = PLANETARY_RULERS[getOppositeSign(sign)] === planetName;
  const exaltation = EXALTATIONS[sign] === planetName;
  const fall = EXALTATIONS[getOppositeSign(sign)] === planetName;
  
  // Triplicity
  const element = SIGN_ELEMENTS[sign];
  const triplicityRulers = TRIPLICITY_RULERS[element];
  const triplicity = triplicityRulers?.day === planetName || 
                     triplicityRulers?.night === planetName ||
                     triplicityRulers?.both === planetName;
  
  // Term (simplified - check if planet rules this term)
  let term = false;
  const signTerms = TERMS[sign];
  if (signTerms) {
    term = signTerms.some(t => t.planet === planetName && degree >= t.start && degree < t.end);
  }
  
  // Face (simplified)
  let face = false;
  const signFaces = FACES[sign];
  if (signFaces) {
    face = signFaces.some(f => f.planet === planetName && degree >= f.start && degree < f.end);
  }
  
  // Calculate dignity score (0-5)
  let score = 0;
  if (domicile) score += 2;
  if (exaltation) score += 1.5;
  if (triplicity) score += 1;
  if (term) score += 0.5;
  if (face) score += 0.5;
  if (detriment) score -= 1;
  if (fall) score -= 1;
  
  return {
    domicile,
    exaltation,
    triplicity,
    term,
    face,
    detriment,
    fall,
    score: Math.max(0, Math.min(5, score))
  };
}

function getOppositeSign(sign: string): string {
  const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
                 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  const index = signs.indexOf(sign);
  return signs[(index + 6) % 12];
}

// Helper for ordinal suffix (1st, 2nd, 3rd, etc.)
function getOrdinalSuffix(num: number): string {
  if (num === 1) return 'st';
  if (num === 2) return 'nd';
  if (num === 3) return 'rd';
  return 'th';
}

// Get base themes for each house
function getHouseBaseThemes(houseNumber: number): string {
  const themes: { [key: number]: string } = {
    1: 'your self-expression, identity, and physical presence',
    2: 'your resources, values, and material security',
    3: 'communication, learning, and local environment',
    4: 'home, family, and emotional foundation',
    5: 'creativity, pleasure, and self-expression',
    6: 'work, health, and daily service',
    7: 'partnerships, relationships, and how you relate to others',
    8: 'transformation, shared resources, and regeneration',
    9: 'higher wisdom, philosophy, and life expansion',
    10: 'career, public reputation, and worldly achievement',
    11: 'friendships, community, and future aspirations',
    12: 'spirituality, retreat, and the unconscious mind'
  };
  return themes[houseNumber] || 'life matters';
}

// Get sign qualities
function getSignQualities(sign: string): string {
  const qualities: { [key: string]: string } = {
    'Aries': 'bold, pioneering, and direct action',
    'Taurus': 'steady, practical, and sensory experience',
    'Gemini': 'curious, versatile, and intellectual exploration',
    'Cancer': 'nurturing, protective, and emotional connection',
    'Leo': 'confident, creative, and generous expression',
    'Virgo': 'analytical, service-oriented, and refined attention to detail',
    'Libra': 'harmonious, diplomatic, and partnership-focused energy',
    'Scorpio': 'intense, transformative, and deep emotional investigation',
    'Sagittarius': 'expansive, philosophical, and adventurous seeking',
    'Capricorn': 'structured, ambitious, and disciplined achievement',
    'Aquarius': 'innovative, independent, and humanitarian vision',
    'Pisces': 'compassionate, intuitive, and transcendent understanding'
  };
  return qualities[sign] || 'unique expression';
}

// Get planetary influence on house
function getPlanetaryInfluence(planets: string[], houseNumber: number): string {
  if (planets.length === 1) {
    const planet = planets[0];
    if (planet.includes('Part of')) {
      return `brings fortunate themes to this area of life.`;
    }
    
    const influences: { [key: string]: string } = {
      'Sun': 'illuminates and empowers this life area with vitality and purpose.',
      'Moon': 'brings emotional depth, intuition, and fluctuating experiences to this domain.',
      'Mercury': 'activates communication, learning, and mental agility in this sphere.',
      'Venus': 'brings harmony, beauty, and relational ease to this life area.',
      'Mars': 'energizes this domain with drive, courage, and assertive action.',
      'Jupiter': 'expands and brings growth, wisdom, and beneficial opportunities here.',
      'Saturn': 'structures this area with discipline, responsibility, and lasting achievement.'
    };
    return influences[planet] || 'influences this life area significantly.';
  } else {
    return `create a complex blend of energies that shape your experience in this life area.`;
  }
}

// Calculate Whole Sign Houses
function calculateWholeSignHouses(ascendantSign: string): Array<{ number: number; sign: string; planets: string[]; ruler: string; interpretation: string }> {
  const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
                 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  const ascIndex = signs.indexOf(ascendantSign);
  
  const houses = [];
  for (let i = 1; i <= 12; i++) {
    const signIndex = (ascIndex + i - 1) % 12;
    const sign = signs[signIndex];
    houses.push({
      number: i,
      sign: sign,
      planets: [],
      ruler: PLANETARY_RULERS[sign],
      interpretation: '' // Will be generated after planets are added
    });
  }
  
  return houses;
}

// Generate personalized house interpretation
function generateHouseInterpretation(
  houseNumber: number,
  sign: string,
  planets: string[],
  dignities: { [key: string]: PlanetaryDignity }
): string {
  const ruler = PLANETARY_RULERS[sign];
  const baseThemes = getHouseBaseThemes(houseNumber);
  const signQualities = getSignQualities(sign);
  
  let interpretation = `With ${sign} on the cusp of your ${houseNumber}${getOrdinalSuffix(houseNumber)} house, `;
  interpretation += `${baseThemes} are experienced through ${signQualities}. `;
  
  // Add planetary influences
  if (planets.length > 0) {
    const regularPlanets = planets.filter(p => !p.includes('Part of'));
    const lots = planets.filter(p => p.includes('Part of'));
    
    if (regularPlanets.length > 0) {
      const planetDescriptions = regularPlanets.map(planet => {
        const dignity = dignities[planet];
        let dignityDesc = 'placed';
        if (dignity) {
          if (dignity.score >= 3) dignityDesc = 'strongly placed';
          else if (dignity.score >= 1) dignityDesc = 'moderately placed';
          else dignityDesc = 'challenged';
        }
        return `${planet} (${dignityDesc})`;
      });
      
      interpretation += `This house contains ${planetDescriptions.join(', ')}, which ${getPlanetaryInfluence(regularPlanets, houseNumber)}`;
    }
    
    if (lots.length > 0) {
      if (regularPlanets.length > 0) {
        interpretation += ` The ${lots.join(' and ')} also reside here, `;
      } else {
        interpretation += `This house contains the ${lots.join(' and ')}, which `;
      }
      interpretation += `bringing fortunate themes and spiritual significance to this area.`;
    }
  } else {
    interpretation += `This house is empty of planets, but its ruler ${ruler} carries these themes wherever it is placed in your chart.`;
  }
  
  return interpretation;
}

// Calculate Part of Fortune
function calculatePartOfFortune(sunLongitude: number, moonLongitude: number, ascendantLongitude: number, isDayChart: boolean): Lot {
  let partLongitude: number;
  
  if (isDayChart) {
    // Day chart: Fortune = Ascendant + Moon - Sun
    partLongitude = ascendantLongitude + moonLongitude - sunLongitude;
  } else {
    // Night chart: Fortune = Ascendant + Sun - Moon
    partLongitude = ascendantLongitude + sunLongitude - moonLongitude;
  }
  
  partLongitude = ((partLongitude % 360) + 360) % 360;
  
  const sign = getTropicalSign(partLongitude);
  const degree = getDegreeInSign(partLongitude);
  
  // Determine house (Whole Sign)
  const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
                 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  const ascIndex = signs.indexOf(getTropicalSign(ascendantLongitude));
  const partIndex = signs.indexOf(sign);
  const house = ((partIndex - ascIndex + 12) % 12) + 1;
  
  return {
    name: 'Part of Fortune',
    sign,
    degree,
    longitude: partLongitude,
    house,
    interpretation: 'Represents material prosperity, physical well-being, and worldly success. Shows where you find joy and abundance in life.'
  };
}

// Calculate Part of Spirit
function calculatePartOfSpirit(sunLongitude: number, moonLongitude: number, ascendantLongitude: number, isDayChart: boolean): Lot {
  let partLongitude: number;
  
  if (isDayChart) {
    // Day chart: Spirit = Ascendant + Sun - Moon
    partLongitude = ascendantLongitude + sunLongitude - moonLongitude;
  } else {
    // Night chart: Spirit = Ascendant + Moon - Sun
    partLongitude = ascendantLongitude + moonLongitude - sunLongitude;
  }
  
  partLongitude = ((partLongitude % 360) + 360) % 360;
  
  const sign = getTropicalSign(partLongitude);
  const degree = getDegreeInSign(partLongitude);
  
  // Determine house (Whole Sign)
  const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
                 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  const ascIndex = signs.indexOf(getTropicalSign(ascendantLongitude));
  const partIndex = signs.indexOf(sign);
  const house = ((partIndex - ascIndex + 12) % 12) + 1;
  
  return {
    name: 'Part of Spirit',
    sign,
    degree,
    longitude: partLongitude,
    house,
    interpretation: 'Represents the soul, spiritual purpose, and inner light. Shows where you find meaning and connection to the divine.'
  };
}

// Determine planetary sect (day/night chart)
function determineSect(sunLongitude: number, ascendantLongitude: number, latitude: number, birthDate: Date): { type: 'day' | 'night'; light: 'sun' | 'moon'; benefic: string; malefic: string; sectLeader: string } {
  // Simplified: if Sun is above horizon (in houses 7-12), it's a day chart
  // More accurate would use actual altitude calculation
  const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
                 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  const ascIndex = signs.indexOf(getTropicalSign(ascendantLongitude));
  const sunIndex = signs.indexOf(getTropicalSign(sunLongitude));
  
  // Calculate approximate house of Sun
  const sunHouse = ((sunIndex - ascIndex + 12) % 12) + 1;
  
  // Day chart: Sun in houses 7-12 (above horizon)
  // Night chart: Sun in houses 1-6 (below horizon)
  const isDayChart = sunHouse >= 7;
  
  if (isDayChart) {
    return {
      type: 'day',
      light: 'sun',
      benefic: 'Jupiter',
      malefic: 'Mars',
      sectLeader: 'Sun'
    };
  } else {
    return {
      type: 'night',
      light: 'moon',
      benefic: 'Venus',
      malefic: 'Saturn',
      sectLeader: 'Moon'
    };
  }
}

// Calculate Profections (annual timing)
function calculateProfections(birthDate: string, currentDate: Date): { currentYear: number; currentSign: string; lord: string; activatedHouses: number[]; timing: string } {
  const birth = new Date(birthDate);
  const currentYear = currentDate.getFullYear() - birth.getFullYear();
  const yearOfLife = currentYear + 1; // Current year of life
  
  // Profections advance one sign per year
  const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
                 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  
  // Get ascendant sign (simplified - would need actual calculation)
  // For now, assume Aries as default
  const ascendantSign = 'Aries'; // Would be calculated from actual chart
  const ascIndex = signs.indexOf(ascendantSign);
  
  // Profected sign for current year
  const profectedIndex = (ascIndex + (yearOfLife - 1)) % 12;
  const profectedSign = signs[profectedIndex];
  const profectedLord = PLANETARY_RULERS[profectedSign];
  
  // Activated houses (houses ruled by profected sign)
  const activatedHouses = [];
  for (let i = 1; i <= 12; i++) {
    const houseSignIndex = (ascIndex + i - 1) % 12;
    if (houseSignIndex === profectedIndex) {
      activatedHouses.push(i);
    }
  }
  
  return {
    currentYear: yearOfLife,
    currentSign: profectedSign,
    lord: profectedLord,
    activatedHouses,
    timing: `Year ${yearOfLife} of life is ruled by ${profectedSign}, with ${profectedLord} as the time-lord. This activates themes related to the house where ${profectedSign} falls.`
  };
}

// Generate personality overview
function generatePersonalityOverview(sun: any, moon: any, ascendant: any, house1: any, sect: any): string {
  const ascQualities: {[key: string]: string} = {
    'Aries': 'direct, pioneering, and energetic',
    'Taurus': 'steady, practical, and sensually aware',
    'Gemini': 'curious, adaptable, and communicative',
    'Cancer': 'nurturing, emotionally sensitive, and protective',
    'Leo': 'confident, creative, and magnetically charismatic',
    'Virgo': 'analytical, helpful, and detail-oriented',
    'Libra': 'harmonious, diplomatic, and relationship-focused',
    'Scorpio': 'intense, perceptive, and transformatively powerful',
    'Sagittarius': 'philosophical, adventurous, and truth-seeking',
    'Capricorn': 'ambitious, disciplined, and achievement-oriented',
    'Aquarius': 'innovative, independent, and humanitarian',
    'Pisces': 'compassionate, intuitive, and spiritually attuned'
  };
  
  const moonNatures: {[key: string]: string} = {
    'Aries': 'passionate and quick to respond emotionally',
    'Taurus': 'steady and seeking emotional security',
    'Gemini': 'intellectually curious and emotionally versatile',
    'Cancer': 'deeply nurturing and emotionally receptive',
    'Leo': 'warm-hearted and emotionally generous',
    'Virgo': 'analytically processing emotions with care',
    'Libra': 'seeking emotional harmony and balance',
    'Scorpio': 'intensely feeling and emotionally transformative',
    'Sagittarius': 'optimistic and emotionally expansive',
    'Capricorn': 'emotionally reserved yet deeply loyal',
    'Aquarius': 'emotionally independent and humanitarian',
    'Pisces': 'empathically attuned and emotionally fluid'
  };
  
  let overview = `You are born under a ${sect.type} chart, making ${sect.sectLeader} your primary guiding light. `;
  overview += `With ${ascendant.sign} rising, you naturally present yourself as ${ascQualities[ascendant.sign] || 'uniquely expressive'}. `;
  
  if (house1?.planets.length > 0) {
    const firstHousePlanets = house1.planets.filter((p: string) => !p.includes('Part of'));
    if (firstHousePlanets.length > 0) {
      overview += `${firstHousePlanets.join(' and ')} in your 1st house further emphasize${firstHousePlanets.length === 1 ? 's' : ''} these qualities. `;
    }
  }
  
  overview += `Your ${moon.sign} Moon reveals an emotional nature that is ${moonNatures[moon.sign] || 'uniquely sensitive'}, `;
  overview += `residing in your ${moon.house}${getOrdinalSuffix(moon.house)} house. `;
  overview += `Your ${sun.sign} Sun in the ${sun.house}${getOrdinalSuffix(sun.house)} house illuminates your core identity and life direction.`;
  
  return overview;
}

// Generate strengths based on actual chart
function generateStrengths(planets: any[], dignities: { [key: string]: PlanetaryDignity }, sect: any): string[] {
  const strengths = [];
  
  // Check for planets in dignity
  planets.forEach(planet => {
    const dignity = dignities[planet.name];
    if (dignity && dignity.domicile) {
      strengths.push(`${planet.name} in ${planet.sign} (domicile) - natural mastery and authentic expression`);
    } else if (dignity && dignity.exaltation) {
      strengths.push(`${planet.name} exalted in ${planet.sign} - heightened power and noble expression`);
    }
  });
  
  // Add sect benefic strength
  const benefic = planets.find(p => p.name === sect.benefic);
  if (benefic) {
    strengths.push(`${sect.benefic} as your sect benefic in ${benefic.sign} - brings grace and fortunate opportunities`);
  }
  
  // If not enough strengths found, add general ones
  if (strengths.length < 3) {
    strengths.push(`Your ${sect.type} chart aligns with natural diurnal/nocturnal rhythms`);
  }
  
  return strengths.slice(0, 5); // Max 5 strengths
}

// Generate challenges
function generateChallenges(planets: any[], dignities: { [key: string]: PlanetaryDignity }, sect: any): string[] {
  const challenges = [];
  
  // Check for planets in detriment or fall
  planets.forEach(planet => {
    const dignity = dignities[planet.name];
    if (dignity && dignity.detriment) {
      challenges.push(`${planet.name} in detriment (${planet.sign}) requires conscious effort to express well`);
    } else if (dignity && dignity.fall) {
      challenges.push(`${planet.name} in fall (${planet.sign}) needs supportive practices to function optimally`);
    }
  });
  
  // Add sect malefic challenge
  const malefic = planets.find(p => p.name === sect.malefic);
  if (malefic) {
    challenges.push(`${sect.malefic} as sect malefic requires careful management and awareness`);
  }
  
  // General challenges if none found
  if (challenges.length === 0) {
    challenges.push('Integrating multiple planetary energies harmoniously');
    challenges.push('Timing actions according to profections and transits');
  }
  
  return challenges.slice(0, 4); // Max 4 challenges
}

// Generate life purpose
function generateLifePurpose(sun: any, moon: any, house9: any, house10: any): string {
  const sunHouse = sun.house;
  const purposes: {[key: number]: string} = {
    1: 'developing authentic self-expression and personal presence',
    2: 'building stable resources and understanding true values',
    3: 'sharing knowledge and connecting your community',
    4: 'creating emotional security and honoring your roots',
    5: 'creative expression and bringing joy to the world',
    6: 'service, healing, and refining daily practices',
    7: 'building meaningful partnerships and relating to others',
    8: 'transforming yourself and managing shared resources',
    9: 'seeking higher wisdom and expanding consciousness',
    10: 'achieving public recognition and professional mastery',
    11: 'contributing to community and manifesting aspirations',
    12: 'spiritual development and transcending the material'
  };
  
  let purpose = `Your life purpose centers on ${purposes[sunHouse] || 'personal evolution'}, `;
  purpose += `as shown by your Sun in the ${sunHouse}${getOrdinalSuffix(sunHouse)} house. `;
  
  if (house9?.planets.length > 0 || house10?.planets.length > 0) {
    purpose += `The emphasis on your ${house10?.planets.length > 0 ? '10th house (career/reputation)' : '9th house (wisdom/philosophy)'} suggests finding meaning through ${house10?.planets.length > 0 ? 'professional achievement and public contribution' : 'teaching, learning, and philosophical exploration'}.`;
  }
  
  return purpose;
}

// Generate interpretations
function generateInterpretations(
  chartData: any, 
  sect: any,
  dignities: { [key: string]: PlanetaryDignity },
  houses: Array<{ number: number; sign: string; planets: string[]; ruler: string; interpretation: string }>
): HellenisticAstrologyReading['interpretations'] {
  const sun = chartData.planets.find((p: any) => p.name === 'Sun');
  const moon = chartData.planets.find((p: any) => p.name === 'Moon');
  const venus = chartData.planets.find((p: any) => p.name === 'Venus');
  const jupiter = chartData.planets.find((p: any) => p.name === 'Jupiter');
  const saturn = chartData.planets.find((p: any) => p.name === 'Saturn');
  const mercury = chartData.planets.find((p: any) => p.name === 'Mercury');
  const ascendant = chartData.ascendant;
  
  const house1 = houses.find(h => h.number === 1);
  const house6 = houses.find(h => h.number === 6);
  const house7 = houses.find(h => h.number === 7);
  const house9 = houses.find(h => h.number === 9);
  const house10 = houses.find(h => h.number === 10);
  const house12 = houses.find(h => h.number === 12);
  
  // PERSONALITY
  const personalityOverview = generatePersonalityOverview(sun, moon, ascendant, house1, sect);
  const strengths = generateStrengths(chartData.planets, dignities, sect);
  const challenges = generateChallenges(chartData.planets, dignities, sect);
  const lifePurpose = generateLifePurpose(sun, moon, house9, house10);
  
  return {
    personality: {
      overview: personalityOverview,
      strengths,
      challenges,
      lifePurpose
    },
    career: generateCareerAnalysis(house10, saturn, sun, mercury, dignities),
    relationships: generateRelationshipAnalysis(house7, venus, dignities, sect),
    health: generateHealthAnalysis(house6, moon, ascendant, saturn),
    spirituality: generateSpiritualityAnalysis(house9, house12, jupiter, moon)
  };
}

// Generate career analysis
function generateCareerAnalysis(house10: any, saturn: any, sun: any, mercury: any, dignities: { [key: string]: PlanetaryDignity }): any {
  const professions: string[] = [];
  const successFactors: string[] = [];
  
  // Analyze 10th house
  const house10Ruler = house10?.ruler || '';
  const house10Planets = house10?.planets || [];
  
  // Career based on 10th house sign
  const careerBySigns: {[key: string]: string[]} = {
    'Aries': ['Military', 'Athletics', 'Entrepreneurship', 'Leadership roles', 'Pioneering ventures'],
    'Taurus': ['Banking', 'Agriculture', 'Arts', 'Real estate', 'Luxury goods'],
    'Gemini': ['Writing', 'Teaching', 'Communications', 'Trade', 'Technology'],
    'Cancer': ['Hospitality', 'Caregiving', 'Real estate', 'Food industry', 'Family business'],
    'Leo': ['Entertainment', 'Creative arts', 'Leadership', 'Politics', 'Public relations'],
    'Virgo': ['Healthcare', 'Analysis', 'Service industry', 'Craftsmanship', 'Administration'],
    'Libra': ['Law', 'Diplomacy', 'Arts', 'Fashion', 'Partnership businesses'],
    'Scorpio': ['Research', 'Psychology', 'Investigation', 'Finance', 'Transformation work'],
    'Sagittarius': ['Education', 'Philosophy', 'Travel', 'Publishing', 'International affairs'],
    'Capricorn': ['Management', 'Government', 'Architecture', 'Long-term planning', 'Executive roles'],
    'Aquarius': ['Technology', 'Innovation', 'Social reform', 'Science', 'Humanitarian work'],
    'Pisces': ['Arts', 'Spirituality', 'Healing', 'Music', 'Charitable work']
  };
  
  professions.push(...(careerBySigns[house10?.sign] || ['Diverse professional paths']).slice(0, 3));
  
  // Planets in 10th house
  if (house10Planets.includes('Saturn')) {
    professions.push('Structured management or administrative work');
    successFactors.push('Building lasting structures and taking on responsibility');
  }
  if (house10Planets.includes('Jupiter')) {
    professions.push('Teaching, consulting, or expansion-oriented fields');
    successFactors.push('Working with growth, wisdom, and ethical practices');
  }
  if (house10Planets.includes('Mars')) {
    professions.push('Competitive fields requiring courage and initiative');
    successFactors.push('Taking decisive action and leading courageously');
  }
  if (house10Planets.includes('Mercury')) {
    professions.push('Communication, analysis, or intellectually demanding work');
    successFactors.push('Leveraging your analytical and communicative abilities');
  }
  if (house10Planets.includes('Sun')) {
    professions.push('Leadership positions with public recognition');
    successFactors.push('Stepping into authority and expressing your authentic power');
  }
  
  // Success factors based on dignities
  if (dignities[house10Ruler]?.score >= 3) {
    successFactors.push(`Your 10th house ruler (${house10Ruler}) is well-placed, supporting career success`);
  }
  
  // Default success factors
  if (successFactors.length === 0) {
    successFactors.push('Working with your natural talents shown in the chart');
    successFactors.push('Timing career moves with profections');
  }
  
  const careerTiming = saturn.house ? 
    `Saturn in your ${saturn.house}${getOrdinalSuffix(saturn.house)} house suggests career maturity and achievement around ages 28-30, 56-60.` :
    'Your profection years will reveal optimal career timing.';
  
  return {
    suitableProfessions: professions.slice(0, 5),
    careerTiming,
    successFactors: successFactors.slice(0, 4)
  };
}

// Generate relationship analysis
function generateRelationshipAnalysis(house7: any, venus: any, dignities: { [key: string]: PlanetaryDignity }, sect: any): any {
  const house7Ruler = house7?.ruler || '';
  const house7Planets = house7?.planets || [];
  const venusDignity = dignities['Venus'];
  
  // Compatibility based on Venus sign
  const venusCompatibility: {[key: string]: string} = {
    'Aries': 'You\'re attracted to passionate, independent partners who appreciate directness',
    'Taurus': 'You seek stable, sensual partnerships with shared values and loyalty',
    'Gemini': 'You value intellectual connection, variety, and communicative partners',
    'Cancer': 'You seek emotional depth, nurturing bonds, and family-oriented partners',
    'Leo': 'You\'re drawn to confident, generous partners who appreciate romance and creativity',
    'Virgo': 'You value practical, helpful partners who appreciate refinement and service',
    'Libra': 'You seek harmonious, balanced partnerships with mutual respect and beauty',
    'Scorpio': 'You desire intense, transformative connections with emotional depth',
    'Sagittarius': 'You\'re attracted to adventurous, philosophical partners who love freedom',
    'Capricorn': 'You seek committed, ambitious partners who value long-term goals',
    'Aquarius': 'You value independent, innovative partners who respect your uniqueness',
    'Pisces': 'You seek compassionate, spiritually attuned partners with empathic understanding'
  };
  
  const compatibility = venusCompatibility[venus.sign] || 'You have unique relationship needs shown by your Venus placement';
  
  // Marriage timing
  let marriageTiming = `Venus in your ${venus.house}${getOrdinalSuffix(venus.house)} house `;
  if (venus.house === 7) {
    marriageTiming += 'strongly emphasizes partnership - relationships are central to your life path.';
  } else if (venus.house === 1 || venus.house === 5 || venus.house === 11) {
    marriageTiming += 'suggests relationships develop through personal initiative and social connections.';
  } else {
    marriageTiming += 'brings relationship themes through this life area.';
  }
  
  // Relationship advice
  let advice = '';
  if (venusDignity && venusDignity.score >= 3) {
    advice = `Your Venus is well-dignified, naturally attracting harmonious relationships. `;
  } else if (venusDignity && venusDignity.score < 1) {
    advice = `Your Venus needs support - cultivate self-love and work with your ${sect.benefic} (sect benefic) to enhance relationships. `;
  } else {
    advice = `Work with your ${sect.benefic} as the sect benefic to enhance relationship harmony. `;
  }
  
  if (house7Planets.length > 0) {
    const planetsInSeventh = house7Planets.filter((p: string) => !p.includes('Part of'));
    if (planetsInSeventh.length > 0) {
      advice += `With ${planetsInSeventh.join(' and ')} in your 7th house, partnerships are actively shaped by these energies.`;
    }
  } else {
    advice += `Your 7th house ruler ${house7Ruler} shows how partnerships manifest in your life.`;
  }
  
  return {
    compatibility,
    marriageTiming,
    relationshipAdvice: advice
  };
}

// Generate health analysis
function generateHealthAnalysis(house6: any, moon: any, ascendant: any, saturn: any): any {
  const house6Ruler = house6?.ruler || '';
  const house6Planets = house6?.planets || [];
  
  // Constitution based on Ascendant
  const constitutions: {[key: string]: string} = {
    'Aries': 'fiery and energetic constitution, prone to inflammation and heat-related issues',
    'Taurus': 'strong and steady constitution with focus on throat and neck',
    'Gemini': 'mercurial constitution affecting nervous system and lungs',
    'Cancer': 'water-based constitution with focus on digestion and emotional health',
    'Leo': 'vital and strong constitution with focus on heart and spine',
    'Virgo': 'detailed health awareness with focus on digestion and intestines',
    'Libra': 'balanced constitution with focus on kidneys and hormonal balance',
    'Scorpio': 'resilient constitution with focus on reproductive and eliminative systems',
    'Sagittarius': 'robust constitution with focus on hips, thighs, and liver',
    'Capricorn': 'enduring constitution with focus on bones, joints, and teeth',
    'Aquarius': 'unique constitution with focus on circulation and ankles',
    'Pisces': 'sensitive constitution with focus on feet and lymphatic system'
  };
  
  const constitution = constitutions[ascendant.sign] || 'balanced constitution';
  
  // Health tips based on planets
  const healthTips: string[] = [];
  
  if (house6Planets.includes('Saturn')) {
    healthTips.push('Maintain regular routines and avoid neglecting chronic health issues');
    healthTips.push('Focus on bone health, joint flexibility, and structured wellness practices');
  }
  if (house6Planets.includes('Mars')) {
    healthTips.push('Channel excess energy through regular physical activity');
    healthTips.push('Prevent inflammation and accidents through mindful practices');
  }
  if (house6Planets.includes('Mercury')) {
    healthTips.push('Mind-body practices like yoga or tai chi benefit your health');
    healthTips.push('Address stress through mental rest and nervous system support');
  }
  if (house6Planets.includes('Moon')) {
    healthTips.push('Honor your emotional health as foundational to physical wellness');
    healthTips.push('Pay attention to digestion and fluid balance in your body');
  }
  
  // General tips if none specific
  if (healthTips.length < 2) {
    healthTips.push('Support your overall vitality by honoring your natural rhythms');
    healthTips.push('Work with your sect light for optimal energy');
    healthTips.push('Balance activity with rest according to your constitution');
  }
  
  // Vulnerable areas
  const vulnerableAreas: string[] = [constitution.split('with focus on')[1] || 'areas of constitutional sensitivity'];
  if (moon.sign === 'Cancer' || moon.sign === 'Pisces') {
    vulnerableAreas.push('Emotional sensitivity affecting physical health');
  }
  if (saturn.house === 6 || saturn.house === 1) {
    vulnerableAreas.push('Chronic conditions requiring long-term management');
  }
  
  return {
    constitution: `You have a ${constitution}`,
    healthTips: healthTips.slice(0, 4),
    vulnerableAreas: vulnerableAreas.slice(0, 3)
  };
}

// Generate spirituality analysis
function generateSpiritualityAnalysis(house9: any, house12: any, jupiter: any, moon: any): any {
  const house9Planets = house9?.planets || [];
  const house12Planets = house12?.planets || [];
  
  // Spiritual path based on Jupiter and 9th/12th houses
  let spiritualPath = '';
  
  if (house12Planets.length > 0) {
    spiritualPath = `With ${house12Planets.join(' and ')} in your 12th house, your spiritual path involves `;
    spiritualPath += house12Planets.includes('Jupiter') ? 'expansive mystical experiences and deep wisdom seeking. ' :
                     house12Planets.includes('Moon') ? 'emotional surrender and intuitive connection to the divine. ' :
                     house12Planets.includes('Venus') ? 'devotional practices and finding beauty in transcendence. ' :
                     'inner retreat and contemplative practices. ';
  } else if (house9Planets.length > 0) {
    spiritualPath = `Your ${house9Planets.join(' and ')} in the 9th house directs you toward philosophy, higher learning, and seeking universal truth.`;
  } else {
    spiritualPath = `Jupiter in your ${jupiter.house}${getOrdinalSuffix(jupiter.house)} house illuminates your path of growth and spiritual expansion.`;
  }
  
  // Meditation advice
  const meditationAdvice = moon.sign === 'Pisces' || moon.sign === 'Cancer' ? 
    'Water meditation, emotional release practices, and devotional prayer align with your sensitive Moon' :
    moon.sign === 'Capricorn' || moon.sign === 'Virgo' ?
    'Structured meditation routines and disciplined spiritual practices suit your grounded Moon' :
    'Meditation practices that honor your unique emotional nature will serve you well';
  
  // Karmic lessons
  const karmicLessons: string[] = [];
  
  if (house12Planets.includes('Saturn')) {
    karmicLessons.push('Learning to release control and trust in divine timing');
  }
  if (house12Planets.includes('Mars')) {
    karmicLessons.push('Transforming anger and assertion into spiritual strength');
  }
  if (house9Planets.includes('Saturn')) {
    karmicLessons.push('Developing wisdom through patience and structured learning');
  }
  
  // Default lessons
  if (karmicLessons.length === 0) {
    karmicLessons.push('Balancing material and spiritual dimensions of life');
    karmicLessons.push('Developing compassion and understanding for all beings');
  }
  
  return {
    spiritualPath,
    meditationAdvice,
    karmicLessons: karmicLessons.slice(0, 3)
  };
}

// Generate remedies
function generateRemedies(
  chartData: any, 
  sect: any, 
  dignities: { [key: string]: PlanetaryDignity },
  houses: any[]
): HellenisticAstrologyReading['remedies'] {
  const planetary: Array<{ planet: string; remedy: string; timing: string }> = [];
  
  // Remedies for sect leader
  const sectLeaderRemedies: {[key: string]: string} = {
    'Sun': 'Honor the Sun through morning meditation facing east, wearing gold jewelry, practicing generosity, and taking on leadership roles that serve others',
    'Moon': 'Honor the Moon through evening reflection by water, wearing silver or pearls, nurturing emotional connections, and honoring cyclical rhythms'
  };
  
  planetary.push({
    planet: sect.sectLeader,
    remedy: sectLeaderRemedies[sect.sectLeader] || `Honor your ${sect.sectLeader} through mindful practices`,
    timing: sect.sectLeader === 'Sun' ? 'Sunrise and noon, especially Sundays' : 'Evening and night, especially Mondays during waxing Moon'
  });
  
  // Remedies for challenged planets (detriment/fall)
  chartData.planets.forEach((planet: any) => {
    const dignity = dignities[planet.name];
    if (dignity && (dignity.detriment || dignity.fall)) {
      const planetRemedies: {[key: string]: { remedy: string; timing: string }} = {
        'Mercury': {
          remedy: 'Study sacred texts and philosophy, practice clear communication, keep a daily journal, wear emerald or green stones, and engage in learning',
          timing: 'Wednesdays and Mercury hours (sunrise + 3, 10, 17, 24 hours)'
        },
        'Venus': {
          remedy: 'Practice artistic expression, cultivate beauty in your environment, strengthen loving relationships, wear diamonds or white sapphire, and appreciate aesthetics',
          timing: 'Fridays and Venus hours (sunrise + 2, 9, 16, 23 hours)'
        },
        'Mars': {
          remedy: 'Channel energy through vigorous exercise, practice assertive communication (not aggression), wear red coral, and take calculated risks',
          timing: 'Tuesdays and Mars hours (sunrise + 1, 8, 15, 22 hours)'
        },
        'Jupiter': {
          remedy: 'Study wisdom traditions, practice generosity and mentorship, attend philosophical gatherings, wear yellow sapphire, and expand your worldview',
          timing: 'Thursdays and Jupiter hours (sunrise + 4, 11, 18 hours)'
        },
        'Saturn': {
          remedy: 'Embrace discipline and structure, honor commitments to elders, build long-term foundations, consider blue sapphire only with expert guidance',
          timing: 'Saturdays and Saturn hours (sunrise + 5, 12, 19 hours)'
        },
        'Sun': {
          remedy: 'Build confidence through leadership service, practice sunrise meditation, cultivate vitality, wear ruby or garnet with care',
          timing: 'Sundays and solar hours (sunrise, +7, +14, +21 hours)'
        },
        'Moon': {
          remedy: 'Honor emotional needs through self-care, practice lunar meditation, connect with water elements, wear moonstone or natural pearl',
          timing: 'Mondays and lunar hours (sunrise + 6, 13, 20 hours)'
        }
      };
      
      if (planetRemedies[planet.name]) {
        planetary.push({
          planet: planet.name,
          remedy: planetRemedies[planet.name].remedy,
          timing: planetRemedies[planet.name].timing
        });
      }
    }
  });
  
  // Remedy for sect malefic if not already added
  const malefic = chartData.planets.find((p: any) => p.name === sect.malefic);
  if (malefic && planetary.filter(r => r.planet === sect.malefic).length === 0) {
    const maleficRemedies: {[key: string]: { remedy: string; timing: string }} = {
      'Mars': {
        remedy: 'Practice patience and mindfulness before acting, channel competitive energy into sports or martial arts, wear red coral for balance, and cultivate strategic thinking',
        timing: 'Tuesdays for remedial work, avoid initiating conflicts during Mars hours'
      },
      'Saturn': {
        remedy: 'Accept delays as opportunities for mastery, practice consistent effort over quick results, honor long-term commitments, and respect natural limitations',
        timing: 'Saturdays for remedial practices, use Saturn hours for serious disciplined work'
      }
    };
    
    if (maleficRemedies[sect.malefic]) {
      planetary.push({
        planet: sect.malefic,
        remedy: maleficRemedies[sect.malefic].remedy,
        timing: maleficRemedies[sect.malefic].timing
      });
    }
  }
  
  // General guidance - personalized to chart
  const general: string[] = [];
  
  general.push(`As a ${sect.type} chart native, align important activities with ${sect.type === 'day' ? 'daylight hours, solar energy, and active pursuits' : 'evening/night hours, lunar energy, and receptive practices'}`);
  general.push('Strengthen planets in dignity (domicile/exaltation) through their natural expressions');
  general.push(`Actively work with ${sect.benefic} (your sect benefic) for grace and beneficial outcomes`);
  general.push(`Mindfully manage ${sect.malefic} (your sect malefic) through awareness, timing, and appropriate remedies`);
  
  // Add Part of Fortune guidance
  const fortuneHouse = houses.find(h => h.planets?.includes('Part of Fortune'));
  if (fortuneHouse) {
    general.push(`Cultivate ${fortuneHouse.number}${getOrdinalSuffix(fortuneHouse.number)} house themes (where your Part of Fortune resides) for material and spiritual prosperity`);
  }
  
  // Add profections guidance
  general.push('Use annual profections to time major life decisions and understand yearly themes');
  
  return {
    planetary: planetary.slice(0, 4),
    general: general.slice(0, 6)
  };
}

export type HellenisticAstrologyDataOptions = {
  /** When false, skip Firestore cache R/W (unauthenticated Stage B). Default true. */
  useCache?: boolean;
};

// Main function to get intelligent Hellenistic Astrology data
export async function getIntelligentHellenisticAstrologyData(
  userId: string,
  birthDate: string,
  birthTime: string,
  birthPlace: string,
  latitude: number,
  longitude: number,
  options?: HellenisticAstrologyDataOptions
): Promise<HellenisticAstrologyReading> {
  let db: any = null;
  try {
    db = getFirebaseDB();
  } catch {
    db = null;
  }

  const useCache = options?.useCache !== false && !!db;

  if (useCache) {
    try {
      const cachedRaw = await userSubdocGet(userId, 'hellenistic-astrology', 'current');
      if (cachedRaw) {
        const cachedData = cachedRaw as unknown as HellenisticAstrologyReading;
        const lastUpdated = cachedData.metadata?.lastUpdated;
        const lastUpdatedDate = lastUpdated && typeof (lastUpdated as { toDate?: () => Date }).toDate === 'function'
          ? (lastUpdated as unknown as { toDate: () => Date }).toDate()
          : lastUpdated instanceof Date ? lastUpdated : new Date(0);
        const hoursSinceUpdate = (new Date().getTime() - lastUpdatedDate.getTime()) / (1000 * 60 * 60);

        if (hoursSinceUpdate < 24 &&
            cachedData.birthDate === birthDate &&
            cachedData.birthTime === birthTime &&
            cachedData.birthPlace === birthPlace &&
            cachedData.metadata?.version === HELLENISTIC_ALGORITHM_VERSION) {
          devLog.debug('Returning cached Hellenistic Astrology data for user:', userId);
          return cachedData;
        }
        devLog.debug('Cache invalid - forcing recalculation (version mismatch or data changed) for user:', userId);
      }
    } catch (error) {
      devLog.warn('Error checking cached Hellenistic Astrology data:', error, 'hellenisticAstrologyIntelligence');
    }
  } else {
    if (userId !== 'anonymous') {
      devLog.debug('Firestore not available, computing Hellenistic reading without cache');
    }
  }

  // Calculate new Hellenistic Astrology analysis
  devLog.debug('Calculating new Hellenistic Astrology analysis for user:', userId);
  
  // Parse birth date and time
  const birthDateTime = new Date(`${birthDate}T${birthTime}`);
  
  // Calculate tropical planetary positions
  const tropicalPlanets = calculateTropicalPlanets(birthDateTime);
  
  // Calculate houses (we'll use Whole Sign, but need Ascendant first)
  const tropicalHouses = calculateTropicalHouses(birthDateTime, latitude, longitude);
  const ascendantLongitude = tropicalHouses[0]?.longitude || 0;
  const ascendantSign = getTropicalSign(ascendantLongitude);
  const ascendantDegree = getDegreeInSign(ascendantLongitude);
  
  // Calculate Whole Sign Houses
  const wholeSignHouses = calculateWholeSignHouses(ascendantSign);
  
  // Determine sect
  const sect = determineSect(tropicalPlanets.sun.longitude, ascendantLongitude, latitude, birthDateTime);
  
  // Calculate planets with houses and dignities
  const planets = [];
  const planetNames = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];
  const planetKeys = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];
  
  for (let i = 0; i < planetNames.length; i++) {
    const planetName = planetNames[i];
    const planetKey = planetKeys[i];
    const planetData = (tropicalPlanets as any)[planetKey];
    
    if (planetData) {
      const sign = getTropicalSign(planetData.longitude);
      const degree = getDegreeInSign(planetData.longitude);
      const dignity = calculatePlanetaryDignity(planetName, sign, degree);
      
      // Determine house (Whole Sign)
      const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
                     'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
      const ascIndex = signs.indexOf(ascendantSign);
      const planetIndex = signs.indexOf(sign);
      const house = ((planetIndex - ascIndex + 12) % 12) + 1;
      
      // Add planet to house
      const houseObj = wholeSignHouses.find(h => h.number === house);
      if (houseObj) {
        houseObj.planets.push(planetName);
      }
      
      planets.push({
        name: planetName,
        sign,
        degree,
        longitude: planetData.longitude,
        house,
        dignity,
        isRetrograde: false // Would need to calculate from ephemeris
      });
    }
  }
  
  // Calculate aspects
  const planetPositions: any = {};
  planets.forEach(p => {
    planetPositions[p.name.toLowerCase()] = { longitude: p.longitude };
  });
  const aspects = calculateTropicalAspects(planetPositions).map((a: any) => ({
    planet1: a.planet1,
    planet2: a.planet2,
    type: a.type,
    orb: a.orb,
    influence: (a.type === 'trine' || a.type === 'sextile' ? 'harmonious' : 
               a.type === 'square' || a.type === 'opposition' ? 'challenging' : 'neutral') as 'harmonious' | 'challenging' | 'neutral'
  }));
  
  // Calculate dignities
  const dignities: { [key: string]: PlanetaryDignity } = {};
  planets.forEach(p => {
    dignities[p.name] = p.dignity;
  });
  
  // Calculate Lots
  const partOfFortune = calculatePartOfFortune(
    tropicalPlanets.sun.longitude,
    tropicalPlanets.moon.longitude,
    ascendantLongitude,
    sect.type === 'day'
  );
  
  const partOfSpirit = calculatePartOfSpirit(
    tropicalPlanets.sun.longitude,
    tropicalPlanets.moon.longitude,
    ascendantLongitude,
    sect.type === 'day'
  );
  
  // Add Lots to houses
  const fortuneHouse = wholeSignHouses.find(h => h.number === partOfFortune.house);
  if (fortuneHouse) {
    fortuneHouse.planets.push('Part of Fortune');
  }
  
  const spiritHouse = wholeSignHouses.find(h => h.number === partOfSpirit.house);
  if (spiritHouse) {
    spiritHouse.planets.push('Part of Spirit');
  }
  
  // Generate personalized house interpretations
  wholeSignHouses.forEach(house => {
    house.interpretation = generateHouseInterpretation(
      house.number,
      house.sign,
      house.planets,
      dignities
    );
  });
  
  // Calculate Profections
  const profections = calculateProfections(birthDate, new Date());
  
  // Create chart data for interpretations
  const chartData = {
    planets,
    houses: wholeSignHouses,
    ascendant: { sign: ascendantSign, degree: ascendantDegree, longitude: ascendantLongitude }
  };
  
  // Generate interpretations
  const interpretations = generateInterpretations(chartData, sect, dignities, wholeSignHouses);
  
  // Generate remedies
  const remedies = generateRemedies(chartData, sect, dignities, wholeSignHouses);
  
  // Create comprehensive reading
  const reading: HellenisticAstrologyReading = {
    id: 'current',
    userId,
    timestamp: new Date(),
    birthDate,
    birthTime,
    birthPlace,
    ascendant: {
      sign: ascendantSign,
      degree: ascendantDegree,
      longitude: ascendantLongitude
    },
    planets,
    houses: wholeSignHouses,
    aspects,
    dignities,
    lots: {
      partOfFortune,
      partOfSpirit
    },
    sect,
    profections,
    interpretations,
    remedies,
    metadata: {
      calculationMethod: 'Whole Sign Houses + Traditional Hellenistic Techniques',
      system: 'Intelligent Hellenistic Astrology Analysis',
      version: HELLENISTIC_ALGORITHM_VERSION,
      lastUpdated: new Date()
    }
  };
  
  // Cache the data only when Firestore is available (e.g. client or server with compatible SDK)
  if (useCache && db) {
    try {
      await userSubdocSet(
        userId,
        'hellenistic-astrology',
        'current',
        reading as unknown as Record<string, unknown>
      );
      devLog.debug('Cached Hellenistic Astrology data for user:', userId);
    } catch (error) {
      devLog.warn('Error caching Hellenistic Astrology data:', error, 'hellenisticAstrologyIntelligence');
    }
  }

  return reading;
}

// Function to clear Hellenistic Astrology data cache
export async function clearHellenisticAstrologyDataCache(userId: string): Promise<void> {
  if (!getFirebaseDB()) return;

  try {
    await userSubdocSet(userId, 'hellenistic-astrology', 'current', {});
    devLog.debug('Cleared Hellenistic Astrology data cache for user:', userId);
  } catch (error) {
    devLog.warn('Error clearing Hellenistic Astrology data cache:', error, 'hellenisticAstrologyIntelligence');
  }
}

