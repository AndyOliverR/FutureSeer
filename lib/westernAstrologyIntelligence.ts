// Intelligent Western Astrology System
// Analyzes Western astrological charts using tropical zodiac and modern interpretations

import { doc, setDoc, getDoc, getFirestore } from 'firebase/firestore';
import { devLog } from '@/lib/devLogger';
import { getFirebaseDB } from './firebase';
import { generatePersonalizedInsights, generateCareerGuidance, generateRelationshipInsights } from './western/interpretationEngine';

export interface WesternAstrologyReading {
  id: string;
  userId: string;
  timestamp: Date;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  
  // Core Chart Data
  sunSign: string;
  moonSign: string;
  risingSign: string;
  mercurySign: string;
  venusSign: string;
  marsSign: string;
  jupiterSign: string;
  saturnSign: string;
  uranusSign: string;
  neptuneSign: string;
  plutoSign: string;
  
  // Houses
  houses: {
    [key: number]: {
      sign: string;
      degree: number;
      planets: string[];
    };
  };
  
  // Aspects
  aspects: {
    planet1: string;
    planet2: string;
    type: string;
    orb: number;
    influence: 'harmonious' | 'challenging' | 'neutral';
  }[];
  
  // Elemental Balance
  elements: {
    fire: number;
    earth: number;
    air: number;
    water: number;
  };
  dominantElement: string;
  missingElements: string[];
  
  // Modalities
  modalities: {
    cardinal: number;
    fixed: number;
    mutable: number;
  };
  dominantModality: string;
  
  // Personality Analysis
  personality: {
    strengths: string[];
    challenges: string[];
    lifePurpose: string;
    careerGuidance: string;
    relationshipInsights: string;
    spiritualPath: string;
  };
  
  // Current Transits
  currentTransits: {
    planet: string;
    aspect: string;
    targetPlanet: string;
    influence: string;
    duration: string;
  }[];
  
  // Coaching
  coaching: {
    currentFocus: string;
    recommendations: string[];
    affirmations: string[];
    nextSteps: string[];
  };
  
  metadata: {
    calculationMethod: string;
    system: string;
    lastUpdated: Date;
  };
}

// Zodiac signs and their properties
const ZODIAC_SIGNS = {
  aries: { element: 'fire', modality: 'cardinal', ruler: 'mars', degree: 0 },
  taurus: { element: 'earth', modality: 'fixed', ruler: 'venus', degree: 30 },
  gemini: { element: 'air', modality: 'mutable', ruler: 'mercury', degree: 60 },
  cancer: { element: 'water', modality: 'cardinal', ruler: 'moon', degree: 90 },
  leo: { element: 'fire', modality: 'fixed', ruler: 'sun', degree: 120 },
  virgo: { element: 'earth', modality: 'mutable', ruler: 'mercury', degree: 150 },
  libra: { element: 'air', modality: 'cardinal', ruler: 'venus', degree: 180 },
  scorpio: { element: 'water', modality: 'fixed', ruler: 'pluto', degree: 210 },
  sagittarius: { element: 'fire', modality: 'mutable', ruler: 'jupiter', degree: 240 },
  capricorn: { element: 'earth', modality: 'cardinal', ruler: 'saturn', degree: 270 },
  aquarius: { element: 'air', modality: 'fixed', ruler: 'uranus', degree: 300 },
  pisces: { element: 'water', modality: 'mutable', ruler: 'neptune', degree: 330 }
};

// Planet properties
const PLANETS = {
  sun: { sign: 'leo', element: 'fire', nature: 'masculine' },
  moon: { sign: 'cancer', element: 'water', nature: 'feminine' },
  mercury: { sign: 'gemini', element: 'air', nature: 'neutral' },
  venus: { sign: 'taurus', element: 'earth', nature: 'feminine' },
  mars: { sign: 'aries', element: 'fire', nature: 'masculine' },
  jupiter: { sign: 'sagittarius', element: 'fire', nature: 'masculine' },
  saturn: { sign: 'capricorn', element: 'earth', nature: 'masculine' },
  uranus: { sign: 'aquarius', element: 'air', nature: 'masculine' },
  neptune: { sign: 'pisces', element: 'water', nature: 'feminine' },
  pluto: { sign: 'scorpio', element: 'water', nature: 'masculine' }
};

function calculateSunSign(birthDate: string): string {
  const date = new Date(birthDate);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'aries';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'taurus';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'gemini';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'cancer';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'leo';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'virgo';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'libra';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'scorpio';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'sagittarius';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'capricorn';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'aquarius';
  return 'pisces';
}

function calculateMoonSign(birthDate: string, birthTime: string): string {
  // Simplified moon sign calculation (in real astrology, this requires ephemeris data)
  const date = new Date(birthDate + 'T' + birthTime);
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const moonSigns = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];
  return moonSigns[dayOfYear % 12];
}

function calculateRisingSign(birthDate: string, birthTime: string, birthPlace: string): string {
  // Simplified rising sign calculation (in real astrology, this requires location and time)
  const time = new Date(birthDate + 'T' + birthTime);
  const hour = time.getHours();
  const risingSigns = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];
  return risingSigns[hour % 12];
}

function calculatePlanetaryPositions(birthDate: string, birthTime: string): { [key: string]: string } {
  const sunSign = calculateSunSign(birthDate);
  const moonSign = calculateMoonSign(birthDate, birthTime);
  
  // Simplified planetary positions (in real astrology, this requires ephemeris data)
  const positions: { [key: string]: string } = {
    sun: sunSign,
    moon: moonSign,
    mercury: sunSign, // Mercury is usually close to the Sun
    venus: sunSign,   // Venus is usually close to the Sun
    mars: getRandomSign(),
    jupiter: getRandomSign(),
    saturn: getRandomSign(),
    uranus: getRandomSign(),
    neptune: getRandomSign(),
    pluto: getRandomSign()
  };
  
  return positions;
}

function getRandomSign(): string {
  const signs = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];
  return signs[Math.floor(Math.random() * signs.length)];
}

function calculateHouses(risingSign: string): { [key: number]: any } {
  const houses: { [key: number]: any } = {};
  const signs = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];
  const risingIndex = signs.indexOf(risingSign);
  
  for (let i = 1; i <= 12; i++) {
    const signIndex = (risingIndex + i - 1) % 12;
    houses[i] = {
      sign: signs[signIndex],
      degree: Math.floor(Math.random() * 30),
      planets: []
    };
  }
  
  return houses;
}

function calculateAspects(planets: { [key: string]: string }): any[] {
  const aspects: any[] = [];
  const planetNames = Object.keys(planets);
  
  for (let i = 0; i < planetNames.length; i++) {
    for (let j = i + 1; j < planetNames.length; j++) {
      const planet1 = planetNames[i];
      const planet2 = planetNames[j];
      const sign1 = planets[planet1];
      const sign2 = planets[planet2];
      
      // Simplified aspect calculation
      const aspect = calculateAspect(sign1, sign2);
      if (aspect) {
        aspects.push({
          planet1,
          planet2,
          type: aspect.type,
          orb: aspect.orb,
          influence: aspect.influence
        });
      }
    }
  }
  
  return aspects;
}

function calculateAspect(sign1: string, sign2: string): any {
  const signs = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];
  const index1 = signs.indexOf(sign1);
  const index2 = signs.indexOf(sign2);
  const distance = Math.abs(index1 - index2);
  
  if (distance === 0) return { type: 'conjunction', orb: 0, influence: 'neutral' };
  if (distance === 6) return { type: 'opposition', orb: 0, influence: 'challenging' };
  if (distance === 4 || distance === 8) return { type: 'square', orb: 0, influence: 'challenging' };
  if (distance === 3 || distance === 9) return { type: 'trine', orb: 0, influence: 'harmonious' };
  if (distance === 2 || distance === 10) return { type: 'sextile', orb: 0, influence: 'harmonious' };
  
  return null;
}

function calculateElements(planets: { [key: string]: string }): { elements: any; dominantElement: string; missingElements: string[] } {
  const elementCounts = { fire: 0, earth: 0, air: 0, water: 0 };
  
  Object.values(planets).forEach(sign => {
    const element = ZODIAC_SIGNS[sign as keyof typeof ZODIAC_SIGNS]?.element;
    if (element) {
      elementCounts[element as keyof typeof elementCounts]++;
    }
  });
  
  const dominantElement = Object.entries(elementCounts).reduce((a, b) => elementCounts[a[0] as keyof typeof elementCounts] > elementCounts[b[0] as keyof typeof elementCounts] ? a : b)[0];
  const missingElements = Object.entries(elementCounts).filter(([_, count]) => count === 0).map(([element, _]) => element);
  
  return { elements: elementCounts, dominantElement, missingElements };
}

function calculateModalities(planets: { [key: string]: string }): { modalities: any; dominantModality: string } {
  const modalityCounts = { cardinal: 0, fixed: 0, mutable: 0 };
  
  Object.values(planets).forEach(sign => {
    const modality = ZODIAC_SIGNS[sign as keyof typeof ZODIAC_SIGNS]?.modality;
    if (modality) {
      modalityCounts[modality as keyof typeof modalityCounts]++;
    }
  });
  
  const dominantModality = Object.entries(modalityCounts).reduce((a, b) => modalityCounts[a[0] as keyof typeof modalityCounts] > modalityCounts[b[0] as keyof typeof modalityCounts] ? a : b)[0];
  
  return { modalities: modalityCounts, dominantModality };
}

function generatePersonalityInsights(sunSign: string, moonSign: string, risingSign: string, elements: any, chartData?: any): WesternAstrologyReading['personality'] {
  // Use the new interpretation engine if chart data is available
  if (chartData) {
    const insights = generatePersonalizedInsights(chartData);
    const careerGuidance = generateCareerGuidance(chartData);
    const relationshipInsights = generateRelationshipInsights(chartData);
    
    return {
      strengths: [
        ...(insights.coreIdentity.interpretation?.strengths || []),
        ...(insights.emotionalNature.interpretation?.strengths || []),
        ...(insights.publicPersona.interpretation?.strengths || [])
      ].slice(0, 5), // Limit to top 5
      challenges: [
        ...(insights.coreIdentity.interpretation?.challenges || []),
        ...(insights.emotionalNature.interpretation?.challenges || []),
        ...(insights.publicPersona.interpretation?.challenges || [])
      ].slice(0, 5), // Limit to top 5
      lifePurpose: insights.coreIdentity.interpretation?.shortInterpretation || 'Discover your unique life purpose through self-exploration',
      careerGuidance: careerGuidance.primaryCareerPaths.join(', ') || 'Explore careers that align with your natural talents',
      relationshipInsights: relationshipInsights.loveStyle || 'Develop healthy relationship patterns',
      spiritualPath: insights.coreIdentity.interpretation?.growthPath || 'Embrace your spiritual journey with openness and wisdom'
    };
  }
  
  // Fallback to original logic if no chart data
  const strengths: string[] = [];
  const challenges: string[] = [];
  
  // Sun sign insights
  const sunSignData = ZODIAC_SIGNS[sunSign as keyof typeof ZODIAC_SIGNS];
  if (sunSignData) {
    if (sunSignData.element === 'fire') {
      strengths.push('Natural leadership and enthusiasm');
      challenges.push('May be impulsive or overly aggressive');
    } else if (sunSignData.element === 'earth') {
      strengths.push('Practical and reliable nature');
      challenges.push('May be stubborn or resistant to change');
    } else if (sunSignData.element === 'air') {
      strengths.push('Intellectual and communicative abilities');
      challenges.push('May be scattered or lack grounding');
    } else if (sunSignData.element === 'water') {
      strengths.push('Emotional depth and intuition');
      challenges.push('May be overly sensitive or moody');
    }
  }
  
  // Element balance insights
  if (elements.dominantElement === 'fire') {
    strengths.push('Dynamic and energetic personality');
    challenges.push('May need to develop patience and grounding');
  } else if (elements.dominantElement === 'earth') {
    strengths.push('Grounded and practical approach to life');
    challenges.push('May need to develop spontaneity and creativity');
  } else if (elements.dominantElement === 'air') {
    strengths.push('Intellectual and adaptable nature');
    challenges.push('May need to develop emotional depth and stability');
  } else if (elements.dominantElement === 'water') {
    strengths.push('Emotional intelligence and empathy');
    challenges.push('May need to develop objectivity and structure');
  }
  
  const lifePurpose = `Your ${sunSign} sun sign suggests a life focused on ${sunSignData?.element === 'fire' ? 'leadership and inspiration' : 
    sunSignData?.element === 'earth' ? 'building and stability' :
    sunSignData?.element === 'air' ? 'communication and learning' :
    'emotional growth and intuition'}`;
  
  const careerGuidance = `Your chart suggests success in ${sunSignData?.element === 'fire' ? 'leadership and creative roles' :
    sunSignData?.element === 'earth' ? 'practical and organizational fields' :
    sunSignData?.element === 'air' ? 'communication and analytical work' :
    'caring and intuitive professions'}`;
  
  const relationshipInsights = `Your ${moonSign} moon sign indicates ${sunSignData?.element === 'fire' ? 'a need for excitement and independence' :
    sunSignData?.element === 'earth' ? 'a desire for stability and security' :
    sunSignData?.element === 'air' ? 'a need for intellectual connection' :
    'a deep emotional connection and nurturing'}`;
  
  const spiritualPath = `Your ${risingSign} rising sign suggests a spiritual journey focused on ${sunSignData?.element === 'fire' ? 'self-discovery and expression' :
    sunSignData?.element === 'earth' ? 'practical spirituality and service' :
    sunSignData?.element === 'air' ? 'intellectual and philosophical growth' :
    'emotional and intuitive development'}`;
  
  return {
    strengths,
    challenges,
    lifePurpose,
    careerGuidance,
    relationshipInsights,
    spiritualPath
  };
}

function generateCurrentTransits(): WesternAstrologyReading['currentTransits'] {
  const planets = ['mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
  const aspects = ['conjunction', 'trine', 'square', 'opposition', 'sextile'];
  const influences = ['harmonious', 'challenging', 'neutral'];
  
  const transits: WesternAstrologyReading['currentTransits'] = [];
  
  for (let i = 0; i < 3; i++) {
    transits.push({
      planet: planets[Math.floor(Math.random() * planets.length)],
      aspect: aspects[Math.floor(Math.random() * aspects.length)],
      targetPlanet: planets[Math.floor(Math.random() * planets.length)],
      influence: influences[Math.floor(Math.random() * influences.length)],
      duration: `${Math.floor(Math.random() * 30) + 1} days`
    });
  }
  
  return transits;
}

function generateCoachingInsights(
  sunSign: string, 
  elementAnalysis: { 
    elements: any; 
    dominantElement: string; 
    missingElements: string[] 
  }
): WesternAstrologyReading['coaching'] {
  const sunSignData = ZODIAC_SIGNS[sunSign as keyof typeof ZODIAC_SIGNS];
  
  let currentFocus = 'Focus on balancing your elemental energies and living your sun sign purpose';
  const recommendations: string[] = [];
  const affirmations: string[] = [];
  const nextSteps: string[] = [];
  
  // Current focus based on sun sign
  if (sunSignData?.element === 'fire') {
    currentFocus = 'Channel your natural leadership and creativity into productive outlets';
  } else if (sunSignData?.element === 'earth') {
    currentFocus = 'Build solid foundations while remaining open to new possibilities';
  } else if (sunSignData?.element === 'air') {
    currentFocus = 'Develop your intellectual gifts while staying grounded in reality';
  } else if (sunSignData?.element === 'water') {
    currentFocus = 'Embrace your emotional depth while maintaining healthy boundaries';
  }
  
  // Recommendations
  if (elementAnalysis.missingElements.length > 0) {
    recommendations.push(`Balance missing elements: ${elementAnalysis.missingElements.join(', ')}`);
  }
  recommendations.push('Study your natal chart to understand your unique gifts');
  recommendations.push('Work with current transits to maximize opportunities');
  recommendations.push('Develop the qualities of your rising sign');
  
  // Affirmations
  affirmations.push(`I am a powerful ${sunSign} with unique gifts to share`);
  affirmations.push(`My chart is perfectly designed for my soul's journey`);
  affirmations.push(`I embrace both my strengths and challenges as growth opportunities`);
  affirmations.push(`I am aligned with the cosmic energies that support my purpose`);
  
  // Next steps
  nextSteps.push('Learn more about your sun, moon, and rising signs');
  nextSteps.push('Track current transits and their effects on your life');
  nextSteps.push('Develop practices that balance your elemental makeup');
  nextSteps.push('Use your chart insights to make empowered life choices');
  
  return {
    currentFocus,
    recommendations,
    affirmations,
    nextSteps
  };
}

// Main function to get intelligent Western Astrology data
export async function getIntelligentWesternAstrologyData(
  userId: string,
  birthDate: string,
  birthTime: string,
  birthPlace: string
): Promise<WesternAstrologyReading> {
  const db = getFirebaseDB();
  if (!db) {
    throw new Error('Firestore not initialized');
  }
  
  const docRef = doc(db, 'users', userId, 'western-astrology', 'current');
  
  try {
    // Check if we have cached data
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const cachedData = docSnap.data() as WesternAstrologyReading;
      const lastUpdated = cachedData.metadata.lastUpdated;
      const lastUpdatedMs = lastUpdated instanceof Date ? lastUpdated.getTime() : (lastUpdated as { toDate(): Date }).toDate().getTime();
      const hoursSinceUpdate = (new Date().getTime() - lastUpdatedMs) / (1000 * 60 * 60);
      
      // Return cached data if less than 24 hours old and birth data hasn't changed
      if (hoursSinceUpdate < 24 && 
          cachedData.birthDate === birthDate && 
          cachedData.birthTime === birthTime && 
          cachedData.birthPlace === birthPlace) {
        devLog.debug('Returning cached Western Astrology data for user:', userId);
        return cachedData;
      } else {
        devLog.debug('Cache invalid - forcing recalculation for user:', userId);
      }
    }
  } catch (error) {
    devLog.warn('Error checking cached Western Astrology data:', error, 'westernAstrologyIntelligence');
  }
  
  // Calculate new Western Astrology analysis
  devLog.debug('Calculating new Western Astrology analysis for user:', userId);
  
  const sunSign = calculateSunSign(birthDate);
  const moonSign = calculateMoonSign(birthDate, birthTime);
  const risingSign = calculateRisingSign(birthDate, birthTime, birthPlace);
  
  const planetaryPositions = calculatePlanetaryPositions(birthDate, birthTime);
  const houses = calculateHouses(risingSign);
  const aspects = calculateAspects(planetaryPositions);
  
  const { elements, dominantElement, missingElements } = calculateElements(planetaryPositions);
  const { modalities, dominantModality } = calculateModalities(planetaryPositions);
  
  // Convert object to array for interpretation engine
  const planetsArray = Object.entries(planetaryPositions).map(([name, data]: [string, any]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),  // Capitalize: sun → Sun
    ...data
  }));
  
  const personality = generatePersonalityInsights(sunSign, moonSign, risingSign, elements, { 
    planets: planetsArray,  // Now an array
    houses: [], // Houses not needed for basic interpretations
    sunSign,
    moonSign,
    risingSign
  });
  const currentTransits = generateCurrentTransits();
  const elementAnalysis = { elements, dominantElement, missingElements };
  const coaching = generateCoachingInsights(sunSign, elementAnalysis);
  
  // Create comprehensive reading
  const reading: WesternAstrologyReading = {
    id: 'current',
    userId,
    timestamp: new Date(),
    birthDate,
    birthTime,
    birthPlace,
    sunSign,
    moonSign,
    risingSign,
    mercurySign: planetaryPositions.mercury,
    venusSign: planetaryPositions.venus,
    marsSign: planetaryPositions.mars,
    jupiterSign: planetaryPositions.jupiter,
    saturnSign: planetaryPositions.saturn,
    uranusSign: planetaryPositions.uranus,
    neptuneSign: planetaryPositions.neptune,
    plutoSign: planetaryPositions.pluto,
    houses,
    aspects,
    elements,
    dominantElement,
    missingElements,
    modalities,
    dominantModality,
    personality,
    currentTransits,
    coaching,
    metadata: {
      calculationMethod: 'Tropical Zodiac + Modern Western Astrology',
      system: 'Intelligent Western Astrology Analysis',
      lastUpdated: new Date()
    }
  };
  
  // Cache the data
  try {
    await setDoc(docRef, reading);
    devLog.debug('Cached Western Astrology data for user:', userId);
  } catch (error) {
    devLog.warn('Error caching Western Astrology data:', error, 'westernAstrologyIntelligence');
  }
  
  return reading;
}

// Function to clear Western Astrology data cache
export async function clearWesternAstrologyDataCache(userId: string): Promise<void> {
  const db = getFirebaseDB();
  if (!db) return;
  
  const docRef = doc(db, 'users', userId, 'western-astrology', 'current');
  
  try {
    await setDoc(docRef, {});
    devLog.debug('Cleared Western Astrology data cache for user:', userId);
  } catch (error) {
    devLog.warn('Error clearing Western Astrology data cache:', error, 'westernAstrologyIntelligence');
  }
} 