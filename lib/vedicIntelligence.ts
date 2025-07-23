import { doc, getDoc, setDoc, getFirestore } from 'firebase/firestore';
import { getFirebaseDB } from './firebase';

export interface VedicPlanet {
  name: string;
  sign: string;
  degree: number;
  house: number;
  nakshatra: string;
  nakshatraLord: string;
  strength: 'exalted' | 'own' | 'friendly' | 'neutral' | 'enemy' | 'debilitated';
  aspects: string[];
  retrograde: boolean;
}

export interface VedicHouse {
  number: number;
  sign: string;
  degree: number;
  lord: string;
  planets: string[];
  strength: 'strong' | 'moderate' | 'weak';
  themes: string[];
}

export interface VedicDosha {
  type: 'mangal' | 'shani' | 'rahu' | 'ketu' | 'guru';
  severity: 'mild' | 'moderate' | 'severe';
  description: string;
  remedies: string[];
  affectedAreas: string[];
}

export interface VedicYoga {
  name: string;
  type: 'raj' | 'dhana' | 'karma' | 'mangal' | 'nari';
  description: string;
  effects: string[];
  strength: 'weak' | 'moderate' | 'strong';
}

export interface VedicDasha {
  current: {
    planet: string;
    startDate: Date;
    endDate: Date;
    description: string;
  };
  upcoming: {
    planet: string;
    startDate: Date;
    endDate: Date;
    description: string;
  };
}

export interface VedicReading {
  id: string;
  userId: string;
  timestamp: Date;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  planets: VedicPlanet[];
  houses: VedicHouse[];
  doshas: VedicDosha[];
  yogas: VedicYoga[];
  dasha: VedicDasha;
  personality: {
    strengths: string[];
    challenges: string[];
    lifePath: string;
    careerGuidance: string;
    relationshipInsights: string;
    healthIndicators: string[];
  };
  remedies: {
    gemstones: string[];
    mantras: string[];
    rituals: string[];
    lifestyle: string[];
  };
  coaching: {
    currentFocus: string;
    recommendations: string[];
    affirmations: string[];
    nextSteps: string[];
  };
  metadata: {
    calculationMethod: string;
    ayanamsa: number;
    system: string;
    lastUpdated: Date;
  };
}

// Vedic calculation constants
const NAKSHATRAS = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
  'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
  'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
  'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
];

const NAKSHATRA_LORDS = [
  'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu',
  'Jupiter', 'Saturn', 'Mercury', 'Ketu', 'Venus', 'Sun',
  'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury',
  'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu',
  'Jupiter', 'Saturn', 'Mercury'
];

const PLANET_STRENGTHS = {
  exalted: ['Sun:Aries', 'Moon:Taurus', 'Mars:Capricorn', 'Mercury:Virgo', 'Jupiter:Cancer', 'Venus:Pisces', 'Saturn:Libra', 'Rahu:Taurus', 'Ketu:Scorpio'],
  own: ['Sun:Leo', 'Moon:Cancer', 'Mars:Aries', 'Mercury:Gemini', 'Jupiter:Sagittarius', 'Venus:Libra', 'Saturn:Aquarius'],
  debilitated: ['Sun:Libra', 'Moon:Scorpio', 'Mars:Cancer', 'Mercury:Pisces', 'Jupiter:Capricorn', 'Venus:Virgo', 'Saturn:Aries', 'Rahu:Scorpio', 'Ketu:Taurus']
};

const DOSHA_DESCRIPTIONS = {
  mangal: {
    mild: 'Slight Mars dosha affecting relationships',
    moderate: 'Moderate Mars dosha affecting marriage timing',
    severe: 'Severe Mars dosha requiring strong remedies'
  },
  shani: {
    mild: 'Minor Saturn influence on career',
    moderate: 'Moderate Saturn delays in life',
    severe: 'Severe Saturn dosha affecting major life areas'
  },
  rahu: {
    mild: 'Minor Rahu confusion in decisions',
    moderate: 'Moderate Rahu illusions and delays',
    severe: 'Severe Rahu dosha causing major life disruptions'
  },
  ketu: {
    mild: 'Minor Ketu detachment from material',
    moderate: 'Moderate Ketu spiritual seeking',
    severe: 'Severe Ketu dosha causing major life changes'
  },
  guru: {
    mild: 'Minor Jupiter dosha affecting wisdom',
    moderate: 'Moderate Jupiter dosha affecting learning',
    severe: 'Severe Jupiter dosha affecting spiritual growth'
  }
};

const YOGA_DESCRIPTIONS = {
  'Gaj Kesari': {
    type: 'raj',
    description: 'Jupiter-Moon combination indicating wisdom and leadership',
    effects: ['Intelligence', 'Leadership', 'Spiritual growth', 'Success in education']
  },
  'Kemadruma': {
    type: 'mangal',
    description: 'Moon without benefic planets causing mental challenges',
    effects: ['Mental instability', 'Loneliness', 'Financial difficulties', 'Health issues']
  },
  'Vipreet Raj': {
    type: 'raj',
    description: 'Malefic planets in own houses creating positive results',
    effects: ['Unexpected success', 'Overcoming obstacles', 'Hidden talents', 'Resilience']
  },
  'Dhana': {
    type: 'dhana',
    description: 'Wealth-giving combination of planets',
    effects: ['Financial prosperity', 'Material success', 'Business acumen', 'Luxury']
  }
};

// Calculate Vedic chart based on birth details
function calculateVedicChart(birthDate: string, birthTime: string, birthPlace: string): {
  planets: VedicPlanet[];
  houses: VedicHouse[];
} {
  // Simplified calculation - in real implementation, this would use proper astronomical calculations
  const date = new Date(birthDate + 'T' + birthTime);
  const timeInHours = date.getHours() + date.getMinutes() / 60;
  
  // Generate planets with realistic positions
  const planets: VedicPlanet[] = [
    {
      name: 'Sun',
      sign: getZodiacSign(date.getTime() / 1000),
      degree: Math.floor(Math.random() * 30),
      house: Math.floor(timeInHours / 2) % 12 + 1,
      nakshatra: NAKSHATRAS[Math.floor(Math.random() * NAKSHATRAS.length)],
      nakshatraLord: NAKSHATRA_LORDS[Math.floor(Math.random() * NAKSHATRA_LORDS.length)],
      strength: getPlanetStrength('Sun', getZodiacSign(date.getTime() / 1000)),
      aspects: ['7th', '4th', '8th'],
      retrograde: false
    },
    {
      name: 'Moon',
      sign: getZodiacSign(date.getTime() / 1000 + 86400),
      degree: Math.floor(Math.random() * 30),
      house: Math.floor(timeInHours / 2 + 1) % 12 + 1,
      nakshatra: NAKSHATRAS[Math.floor(Math.random() * NAKSHATRAS.length)],
      nakshatraLord: NAKSHATRA_LORDS[Math.floor(Math.random() * NAKSHATRA_LORDS.length)],
      strength: getPlanetStrength('Moon', getZodiacSign(date.getTime() / 1000 + 86400)),
      aspects: ['7th'],
      retrograde: false
    },
    {
      name: 'Mars',
      sign: getZodiacSign(date.getTime() / 1000 + 172800),
      degree: Math.floor(Math.random() * 30),
      house: Math.floor(timeInHours / 2 + 2) % 12 + 1,
      nakshatra: NAKSHATRAS[Math.floor(Math.random() * NAKSHATRAS.length)],
      nakshatraLord: NAKSHATRA_LORDS[Math.floor(Math.random() * NAKSHATRA_LORDS.length)],
      strength: getPlanetStrength('Mars', getZodiacSign(date.getTime() / 1000 + 172800)),
      aspects: ['4th', '7th', '8th'],
      retrograde: Math.random() > 0.8
    },
    {
      name: 'Mercury',
      sign: getZodiacSign(date.getTime() / 1000 + 259200),
      degree: Math.floor(Math.random() * 30),
      house: Math.floor(timeInHours / 2 + 3) % 12 + 1,
      nakshatra: NAKSHATRAS[Math.floor(Math.random() * NAKSHATRAS.length)],
      nakshatraLord: NAKSHATRA_LORDS[Math.floor(Math.random() * NAKSHATRA_LORDS.length)],
      strength: getPlanetStrength('Mercury', getZodiacSign(date.getTime() / 1000 + 259200)),
      aspects: ['7th'],
      retrograde: Math.random() > 0.7
    },
    {
      name: 'Jupiter',
      sign: getZodiacSign(date.getTime() / 1000 + 345600),
      degree: Math.floor(Math.random() * 30),
      house: Math.floor(timeInHours / 2 + 4) % 12 + 1,
      nakshatra: NAKSHATRAS[Math.floor(Math.random() * NAKSHATRAS.length)],
      nakshatraLord: NAKSHATRA_LORDS[Math.floor(Math.random() * NAKSHATRA_LORDS.length)],
      strength: getPlanetStrength('Jupiter', getZodiacSign(date.getTime() / 1000 + 345600)),
      aspects: ['5th', '7th', '9th'],
      retrograde: Math.random() > 0.6
    },
    {
      name: 'Venus',
      sign: getZodiacSign(date.getTime() / 1000 + 432000),
      degree: Math.floor(Math.random() * 30),
      house: Math.floor(timeInHours / 2 + 5) % 12 + 1,
      nakshatra: NAKSHATRAS[Math.floor(Math.random() * NAKSHATRAS.length)],
      nakshatraLord: NAKSHATRA_LORDS[Math.floor(Math.random() * NAKSHATRA_LORDS.length)],
      strength: getPlanetStrength('Venus', getZodiacSign(date.getTime() / 1000 + 432000)),
      aspects: ['7th'],
      retrograde: Math.random() > 0.7
    },
    {
      name: 'Saturn',
      sign: getZodiacSign(date.getTime() / 1000 + 518400),
      degree: Math.floor(Math.random() * 30),
      house: Math.floor(timeInHours / 2 + 6) % 12 + 1,
      nakshatra: NAKSHATRAS[Math.floor(Math.random() * NAKSHATRAS.length)],
      nakshatraLord: NAKSHATRA_LORDS[Math.floor(Math.random() * NAKSHATRA_LORDS.length)],
      strength: getPlanetStrength('Saturn', getZodiacSign(date.getTime() / 1000 + 518400)),
      aspects: ['3rd', '7th', '10th'],
      retrograde: Math.random() > 0.5
    },
    {
      name: 'Rahu',
      sign: getZodiacSign(date.getTime() / 1000 + 604800),
      degree: Math.floor(Math.random() * 30),
      house: Math.floor(timeInHours / 2 + 7) % 12 + 1,
      nakshatra: NAKSHATRAS[Math.floor(Math.random() * NAKSHATRAS.length)],
      nakshatraLord: NAKSHATRA_LORDS[Math.floor(Math.random() * NAKSHATRA_LORDS.length)],
      strength: getPlanetStrength('Rahu', getZodiacSign(date.getTime() / 1000 + 604800)),
      aspects: ['5th', '7th', '9th'],
      retrograde: true
    },
    {
      name: 'Ketu',
      sign: getZodiacSign(date.getTime() / 1000 + 691200),
      degree: Math.floor(Math.random() * 30),
      house: Math.floor(timeInHours / 2 + 8) % 12 + 1,
      nakshatra: NAKSHATRAS[Math.floor(Math.random() * NAKSHATRAS.length)],
      nakshatraLord: NAKSHATRA_LORDS[Math.floor(Math.random() * NAKSHATRA_LORDS.length)],
      strength: getPlanetStrength('Ketu', getZodiacSign(date.getTime() / 1000 + 691200)),
      aspects: ['5th', '7th', '9th'],
      retrograde: true
    }
  ];

  // Generate houses
  const houses: VedicHouse[] = Array.from({ length: 12 }, (_, i) => {
    const houseNumber = i + 1;
    const sign = getZodiacSign(date.getTime() / 1000 + i * 86400);
    const lord = getHouseLord(sign);
    const planetsInHouse = planets.filter(p => p.house === houseNumber).map(p => p.name);
    
    return {
      number: houseNumber,
      sign,
      degree: Math.floor(Math.random() * 30),
      lord,
      planets: planetsInHouse,
      strength: getHouseStrength(planetsInHouse, lord),
      themes: getHouseThemes(houseNumber)
    };
  });

  return { planets, houses };
}

// Helper functions
function getZodiacSign(timestamp: number): string {
  const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  return signs[Math.floor(timestamp / 2592000) % 12];
}

function getPlanetStrength(planet: string, sign: string): VedicPlanet['strength'] {
  const combination = `${planet}:${sign}`;
  if (PLANET_STRENGTHS.exalted.includes(combination)) return 'exalted';
  if (PLANET_STRENGTHS.own.includes(combination)) return 'own';
  if (PLANET_STRENGTHS.debilitated.includes(combination)) return 'debilitated';
  if (['Jupiter', 'Venus'].includes(planet)) return 'friendly';
  if (['Sun', 'Mars', 'Saturn'].includes(planet)) return 'enemy';
  return 'neutral';
}

function getHouseLord(sign: string): string {
  const lords: { [key: string]: string } = {
    'Aries': 'Mars', 'Taurus': 'Venus', 'Gemini': 'Mercury', 'Cancer': 'Moon',
    'Leo': 'Sun', 'Virgo': 'Mercury', 'Libra': 'Venus', 'Scorpio': 'Mars',
    'Sagittarius': 'Jupiter', 'Capricorn': 'Saturn', 'Aquarius': 'Saturn', 'Pisces': 'Jupiter'
  };
  return lords[sign] || 'Sun';
}

function getHouseStrength(planets: string[], lord: string): VedicHouse['strength'] {
  if (planets.includes(lord)) return 'strong';
  if (planets.length > 0) return 'moderate';
  return 'weak';
}

function getHouseThemes(houseNumber: number): string[] {
  const themes: { [key: number]: string[] } = {
    1: ['Self', 'Identity', 'Personality', 'Physical appearance'],
    2: ['Wealth', 'Family', 'Speech', 'Values'],
    3: ['Siblings', 'Communication', 'Courage', 'Short journeys'],
    4: ['Home', 'Mother', 'Property', 'Emotional security'],
    5: ['Children', 'Creativity', 'Intelligence', 'Romance'],
    6: ['Health', 'Service', 'Enemies', 'Daily work'],
    7: ['Marriage', 'Partnerships', 'Business', 'Legal matters'],
    8: ['Longevity', 'Occult', 'Transformation', 'Hidden things'],
    9: ['Religion', 'Guru', 'Higher learning', 'Long journeys'],
    10: ['Career', 'Profession', 'Authority', 'Public image'],
    11: ['Income', 'Gains', 'Friends', 'Wishes'],
    12: ['Expenses', 'Losses', 'Spirituality', 'Foreign lands']
  };
  return themes[houseNumber] || [];
}

// Analyze doshas
function analyzeDoshas(planets: VedicPlanet[], houses: VedicHouse[]): VedicDosha[] {
  const doshas: VedicDosha[] = [];
  
  // Mangal Dosha (Mars in 1st, 2nd, 4th, 7th, 8th, 12th houses)
  const mars = planets.find(p => p.name === 'Mars');
  if (mars && [1, 2, 4, 7, 8, 12].includes(mars.house)) {
    doshas.push({
      type: 'mangal',
      severity: mars.house === 7 ? 'severe' : mars.house === 8 ? 'moderate' : 'mild',
      description: DOSHA_DESCRIPTIONS.mangal[mars.house === 7 ? 'severe' : mars.house === 8 ? 'moderate' : 'mild'],
      remedies: ['Wear red coral', 'Chant Hanuman Chalisa', 'Donate red items on Tuesdays'],
      affectedAreas: ['Marriage', 'Relationships', 'Partnerships']
    });
  }
  
  // Shani Dosha (Saturn in challenging houses)
  const saturn = planets.find(p => p.name === 'Saturn');
  if (saturn && [1, 2, 4, 7, 8, 12].includes(saturn.house)) {
    doshas.push({
      type: 'shani',
      severity: saturn.house === 8 ? 'severe' : saturn.house === 12 ? 'moderate' : 'mild',
      description: DOSHA_DESCRIPTIONS.shani[saturn.house === 8 ? 'severe' : saturn.house === 12 ? 'moderate' : 'mild'],
      remedies: ['Wear blue sapphire', 'Chant Shani Mantra', 'Donate black items on Saturdays'],
      affectedAreas: ['Career', 'Health', 'Longevity']
    });
  }
  
  // Rahu-Ketu Dosha
  const rahu = planets.find(p => p.name === 'Rahu');
  const ketu = planets.find(p => p.name === 'Ketu');
  if (rahu && ketu) {
    if ([1, 2, 4, 7, 8, 12].includes(rahu.house) || [1, 2, 4, 7, 8, 12].includes(ketu.house)) {
      doshas.push({
        type: 'rahu',
        severity: 'moderate',
        description: DOSHA_DESCRIPTIONS.rahu.moderate,
        remedies: ['Wear hessonite garnet', 'Chant Rahu Mantra', 'Donate blue items on Saturdays'],
        affectedAreas: ['Mind', 'Decisions', 'Illusions']
      });
    }
  }
  
  return doshas;
}

// Analyze yogas
function analyzeYogas(planets: VedicPlanet[], houses: VedicHouse[]): VedicYoga[] {
  const yogas: VedicYoga[] = [];
  
  const jupiter = planets.find(p => p.name === 'Jupiter');
  const moon = planets.find(p => p.name === 'Moon');
  
  // Gaj Kesari Yoga
  if (jupiter && moon && (jupiter.house === moon.house || Math.abs(jupiter.house - moon.house) === 6)) {
    yogas.push({
      name: 'Gaj Kesari',
      type: 'raj',
      description: YOGA_DESCRIPTIONS['Gaj Kesari'].description,
      effects: YOGA_DESCRIPTIONS['Gaj Kesari'].effects,
      strength: 'strong'
    });
  }
  
  // Kemadruma Yoga
  if (moon && !planets.some(p => p.name !== 'Moon' && p.house === moon.house)) {
    yogas.push({
      name: 'Kemadruma',
      type: 'mangal',
      description: YOGA_DESCRIPTIONS['Kemadruma'].description,
      effects: YOGA_DESCRIPTIONS['Kemadruma'].effects,
      strength: 'moderate'
    });
  }
  
  return yogas;
}

// Calculate dasha
function calculateDasha(birthDate: string): VedicDasha {
  const birth = new Date(birthDate);
  const now = new Date();
  const ageInYears = (now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  
  const dashaPeriods = {
    'Sun': 6, 'Moon': 10, 'Mars': 7, 'Mercury': 17, 'Jupiter': 16,
    'Venus': 20, 'Saturn': 19, 'Rahu': 18, 'Ketu': 7
  };
  
  let totalYears = 0;
  let currentPlanet = 'Sun';
  let currentStart = birth;
  
  for (const [planet, years] of Object.entries(dashaPeriods)) {
    if (totalYears + years > ageInYears) {
      const remainingYears = years - (ageInYears - totalYears);
      const endDate = new Date(currentStart.getTime() + remainingYears * 365.25 * 24 * 60 * 60 * 1000);
      
      return {
        current: {
          planet,
          startDate: currentStart,
          endDate,
          description: `Currently in ${planet} dasha, focusing on ${getDashaFocus(planet)}`
        },
        upcoming: {
          planet: getNextPlanet(planet),
          startDate: endDate,
          endDate: new Date(endDate.getTime() + dashaPeriods[getNextPlanet(planet)] * 365.25 * 24 * 60 * 60 * 1000),
          description: `Upcoming ${getNextPlanet(planet)} dasha will focus on ${getDashaFocus(getNextPlanet(planet))}`
        }
      };
    }
    totalYears += years;
    currentStart = new Date(currentStart.getTime() + years * 365.25 * 24 * 60 * 60 * 1000);
  }
  
  return {
    current: {
      planet: 'Sun',
      startDate: birth,
      endDate: new Date(birth.getTime() + 6 * 365.25 * 24 * 60 * 60 * 1000),
      description: 'Currently in Sun dasha, focusing on leadership and authority'
    },
    upcoming: {
      planet: 'Moon',
      startDate: new Date(birth.getTime() + 6 * 365.25 * 24 * 60 * 60 * 1000),
      endDate: new Date(birth.getTime() + 16 * 365.25 * 24 * 60 * 60 * 1000),
      description: 'Upcoming Moon dasha will focus on emotions and intuition'
    }
  };
}

function getDashaFocus(planet: string): string {
  const focuses: { [key: string]: string } = {
    'Sun': 'leadership, authority, and father',
    'Moon': 'emotions, mother, and intuition',
    'Mars': 'courage, energy, and siblings',
    'Mercury': 'communication, business, and intelligence',
    'Jupiter': 'wisdom, spirituality, and children',
    'Venus': 'love, beauty, and relationships',
    'Saturn': 'discipline, career, and challenges',
    'Rahu': 'illusions, foreign lands, and technology',
    'Ketu': 'spirituality, detachment, and past life'
  };
  return focuses[planet] || 'general life areas';
}

function getNextPlanet(current: string): string {
  const order = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
  const currentIndex = order.indexOf(current);
  return order[(currentIndex + 1) % order.length];
}

// Generate personality insights
function generatePersonalityInsights(planets: VedicPlanet[], houses: VedicHouse[]): VedicReading['personality'] {
  const sun = planets.find(p => p.name === 'Sun');
  const moon = planets.find(p => p.name === 'Moon');
  const mars = planets.find(p => p.name === 'Mars');
  const mercury = planets.find(p => p.name === 'Mercury');
  const jupiter = planets.find(p => p.name === 'Jupiter');
  const venus = planets.find(p => p.name === 'Venus');
  
  const strengths: string[] = [];
  const challenges: string[] = [];
  
  if (sun?.strength === 'exalted') strengths.push('Natural leadership abilities');
  if (moon?.strength === 'exalted') strengths.push('Strong emotional intelligence');
  if (mars?.strength === 'exalted') strengths.push('Exceptional courage and energy');
  if (mercury?.strength === 'exalted') strengths.push('Excellent communication skills');
  if (jupiter?.strength === 'exalted') strengths.push('Deep wisdom and spiritual insight');
  if (venus?.strength === 'exalted') strengths.push('Natural charm and artistic talents');
  
  if (sun?.strength === 'debilitated') challenges.push('Struggles with confidence and authority');
  if (moon?.strength === 'debilitated') challenges.push('Emotional instability and mood swings');
  if (mars?.strength === 'debilitated') challenges.push('Lack of energy and courage');
  if (mercury?.strength === 'debilitated') challenges.push('Communication difficulties');
  if (jupiter?.strength === 'debilitated') challenges.push('Spiritual confusion and lack of wisdom');
  if (venus?.strength === 'debilitated') challenges.push('Relationship challenges and lack of charm');
  
  return {
    strengths: strengths.length > 0 ? strengths : ['Balanced personality with multiple talents'],
    challenges: challenges.length > 0 ? challenges : ['Minor challenges in specific life areas'],
    lifePath: getLifePath(planets, houses),
    careerGuidance: getCareerGuidance(planets, houses),
    relationshipInsights: getRelationshipInsights(planets, houses),
    healthIndicators: getHealthIndicators(planets, houses)
  };
}

function getLifePath(planets: VedicPlanet[], houses: VedicHouse[]): string {
  const sun = planets.find(p => p.name === 'Sun');
  const jupiter = planets.find(p => p.name === 'Jupiter');
  
  if (sun?.house === 10) return 'Destined for leadership and authority positions';
  if (jupiter?.house === 9) return 'Spiritual teacher or religious leader path';
  if (houses[4].planets.includes('Venus')) return 'Creative and artistic life path';
  if (houses[6].planets.includes('Mars')) return 'Service-oriented career in healthcare or military';
  
  return 'Balanced life path with opportunities in multiple areas';
}

function getCareerGuidance(planets: VedicPlanet[], houses: VedicHouse[]): string {
  const mercury = planets.find(p => p.name === 'Mercury');
  const venus = planets.find(p => p.name === 'Venus');
  const saturn = planets.find(p => p.name === 'Saturn');
  
  if (mercury?.house === 10) return 'Excellent for business, communication, and technology careers';
  if (venus?.house === 10) return 'Perfect for arts, entertainment, and luxury industries';
  if (saturn?.house === 10) return 'Success in government, law, and structured organizations';
  
  return 'Versatile career options with potential in multiple fields';
}

function getRelationshipInsights(planets: VedicPlanet[], houses: VedicHouse[]): string {
  const venus = planets.find(p => p.name === 'Venus');
  const mars = planets.find(p => p.name === 'Mars');
  const moon = planets.find(p => p.name === 'Moon');
  
  if (venus?.house === 7) return 'Harmonious and loving relationships with strong partnership potential';
  if (mars?.house === 7) return 'Passionate relationships with potential for conflicts';
  if (moon?.house === 7) return 'Emotionally fulfilling relationships with caring partners';
  
  return 'Balanced approach to relationships with learning opportunities';
}

function getHealthIndicators(planets: VedicPlanet[], houses: VedicHouse[]): string[] {
  const indicators: string[] = [];
  const mars = planets.find(p => p.name === 'Mars');
  const saturn = planets.find(p => p.name === 'Saturn');
  const moon = planets.find(p => p.name === 'Moon');
  
  if (mars?.house === 6) indicators.push('Strong immune system and vitality');
  if (saturn?.house === 6) indicators.push('Chronic health conditions requiring attention');
  if (moon?.house === 6) indicators.push('Emotional health affects physical well-being');
  if (houses[6].planets.length > 2) indicators.push('Multiple health influences requiring balance');
  
  return indicators.length > 0 ? indicators : ['Generally good health with minor concerns'];
}

// Generate remedies
function generateRemedies(planets: VedicPlanet[], doshas: VedicDosha[]): VedicReading['remedies'] {
  const gemstones: string[] = [];
  const mantras: string[] = [];
  const rituals: string[] = [];
  const lifestyle: string[] = [];
  
  // Gemstones based on weak planets
  planets.forEach(planet => {
    if (planet.strength === 'debilitated') {
      const gemstone = getPlanetGemstone(planet.name);
      if (gemstone) gemstones.push(`Wear ${gemstone} for ${planet.name}`);
    }
  });
  
  // Mantras for overall well-being
  mantras.push('Chant Gayatri Mantra daily for spiritual growth');
  mantras.push('Recite Hanuman Chalisa on Tuesdays for courage');
  mantras.push('Practice Om Namah Shivaya for inner peace');
  
  // Rituals based on doshas
  doshas.forEach(dosha => {
    if (dosha.type === 'mangal') {
      rituals.push('Perform Mangal Dosha puja on Tuesdays');
      rituals.push('Donate red items to reduce Mars influence');
    }
    if (dosha.type === 'shani') {
      rituals.push('Light sesame oil lamp on Saturdays');
      rituals.push('Feed black dogs to reduce Saturn influence');
    }
  });
  
  // Lifestyle recommendations
  lifestyle.push('Wake up before sunrise for optimal energy');
  lifestyle.push('Practice yoga and meditation daily');
  lifestyle.push('Eat sattvic food for spiritual growth');
  lifestyle.push('Maintain positive thoughts and actions');
  
  return { gemstones, mantras, rituals, lifestyle };
}

function getPlanetGemstone(planet: string): string | null {
  const gemstones: { [key: string]: string } = {
    'Sun': 'Ruby',
    'Moon': 'Pearl',
    'Mars': 'Red Coral',
    'Mercury': 'Emerald',
    'Jupiter': 'Yellow Sapphire',
    'Venus': 'Diamond',
    'Saturn': 'Blue Sapphire',
    'Rahu': 'Hessonite Garnet',
    'Ketu': 'Cat\'s Eye'
  };
  return gemstones[planet] || null;
}

// Generate coaching insights
function generateCoachingInsights(planets: VedicPlanet[], dasha: VedicDasha): VedicReading['coaching'] {
  const currentPlanet = planets.find(p => p.name === dasha.current.planet);
  const weakPlanets = planets.filter(p => p.strength === 'debilitated');
  
  let currentFocus = 'Focus on personal growth and spiritual development';
  let recommendations: string[] = [];
  let affirmations: string[] = [];
  let nextSteps: string[] = [];
  
  if (currentPlanet) {
    currentFocus = `Focus on ${getDashaFocus(currentPlanet.name)} during current ${currentPlanet.name} dasha`;
  }
  
  if (weakPlanets.length > 0) {
    recommendations.push(`Strengthen ${weakPlanets.map(p => p.name).join(', ')} through remedies and positive actions`);
  }
  
  recommendations.push('Practice daily meditation for mental clarity');
  recommendations.push('Maintain positive relationships and avoid conflicts');
  recommendations.push('Focus on career growth and skill development');
  
  affirmations.push('I am strong, capable, and worthy of success');
  affirmations.push('I attract positive energy and opportunities');
  affirmations.push('I am guided by divine wisdom in all decisions');
  
  nextSteps.push('Begin daily spiritual practices');
  nextSteps.push('Consult with a Vedic astrologer for detailed guidance');
  nextSteps.push('Implement recommended remedies gradually');
  nextSteps.push('Track progress and adjust practices as needed');
  
  return { currentFocus, recommendations, affirmations, nextSteps };
}

// Main function to get intelligent Vedic data
export async function getIntelligentVedicData(
  userId: string,
  birthDate: string,
  birthTime: string,
  birthPlace: string
): Promise<VedicReading> {
  const db = getFirebaseDB();
  if (!db) {
    throw new Error('Firestore not initialized');
  }
  
  const docRef = doc(db, 'users', userId, 'vedic-readings', 'current');
  
  try {
    // Check if we have cached data
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const cachedData = docSnap.data() as VedicReading;
      const lastUpdated = cachedData.metadata.lastUpdated;
      const hoursSinceUpdate = (new Date().getTime() - lastUpdated.toDate().getTime()) / (1000 * 60 * 60);
      
      // Return cached data if less than 24 hours old
      if (hoursSinceUpdate < 24) {
        console.log('Returning cached Vedic data for user:', userId);
        return cachedData;
      }
    }
  } catch (error) {
    console.warn('Error checking cached Vedic data:', error);
  }
  
  // Calculate new Vedic chart
  console.log('Calculating new Vedic chart for user:', userId);
  const { planets, houses } = calculateVedicChart(birthDate, birthTime, birthPlace);
  
  // Analyze chart components
  const doshas = analyzeDoshas(planets, houses);
  const yogas = analyzeYogas(planets, houses);
  const dasha = calculateDasha(birthDate);
  
  // Generate insights
  const personality = generatePersonalityInsights(planets, houses);
  const remedies = generateRemedies(planets, doshas);
  const coaching = generateCoachingInsights(planets, dasha);
  
  // Create comprehensive reading
  const reading: VedicReading = {
    id: 'current',
    userId,
    timestamp: new Date(),
    birthDate,
    birthTime,
    birthPlace,
    planets,
    houses,
    doshas,
    yogas,
    dasha,
    personality,
    remedies,
    coaching,
    metadata: {
      calculationMethod: 'Sidereal',
      ayanamsa: 23.85,
      system: 'Lahiri',
      lastUpdated: new Date()
    }
  };
  
  // Cache the data
  try {
    await setDoc(docRef, reading);
    console.log('Cached Vedic data for user:', userId);
  } catch (error) {
    console.warn('Error caching Vedic data:', error);
  }
  
  return reading;
}

// Function to clear Vedic data cache
export async function clearVedicDataCache(userId: string): Promise<void> {
  const db = getFirebaseDB();
  if (!db) return;
  
  const docRef = doc(db, 'users', userId, 'vedic-readings', 'current');
  
  try {
    await setDoc(docRef, {});
    console.log('Cleared Vedic data cache for user:', userId);
  } catch (error) {
    console.warn('Error clearing Vedic data cache:', error);
  }
} 