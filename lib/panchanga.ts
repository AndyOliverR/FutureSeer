// Panchanga Calculations for Vedic Astrology
// Calculates Tithi, Nakshatra, Yoga, Karana, Vara at birth time

import { normalizeTimeString, normalizeDateString } from './timeUtils';

// import { julian } from 'astronomia';

export interface PanchangaData {
  tithi: {
    number: number;
    name: string;
    paksha: 'Shukla' | 'Krishna';
    progress: number;
    endTime: Date;
  };
  nakshatra: {
    number: number;
    name: string;
    lord: string;
    progress: number;
    endTime: Date;
  };
  yoga: {
    number: number;
    name: string;
    progress: number;
    endTime: Date;
  };
  karana: {
    number: number;
    name: string;
    progress: number;
    endTime: Date;
  };
  vara: {
    number: number;
    name: string;
    lord: string;
  };
  sunrise: Date;
  sunset: Date;
  ayanamsa: number;
}

// Tithi names
const TITHI_NAMES = [
  'Purnima', 'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
  'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami', 'Ekadashi',
  'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Amavasya'
];

// Nakshatra names (already defined in vedic-core.ts)
const NAKSHATRA_NAMES = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu',
  'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta',
  'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha',
  'Uttara Ashadha', 'Shravana', 'Dhanishtha', 'Shatabhisha', 'Purva Bhadrapada',
  'Uttara Bhadrapada', 'Revati'
];

// Yoga names
const YOGA_NAMES = [
  'Vishkambha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda',
  'Sukarma', 'Dhriti', 'Shula', 'Ganda', 'Vriddhi', 'Dhruva',
  'Vyaghata', 'Harshana', 'Vajra', 'Siddhi', 'Vyatipata', 'Variyan',
  'Parigha', 'Shiva', 'Siddha', 'Sadhya', 'Shubha', 'Shukla',
  'Brahma', 'Indra', 'Vaidhriti'
];

// Karana names
const KARANA_NAMES = [
  'Kimstughna', 'Bava', 'Balava', 'Kaulava', 'Taitila', 'Gara', 'Vanija',
  'Vishti', 'Shakuni', 'Chatushpada', 'Naga', 'Kimstughna'
];

// Vara (weekday) names
const VARA_NAMES = [
  'Ravivar', 'Somavar', 'Mangalvar', 'Budhvar', 'Guruvar', 'Shukravar', 'Shanivar'
];

// Vara lords
const VARA_LORDS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

// Nakshatra lords for Vimshottari
const NAKSHATRA_LORDS = [
  'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury',
  'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury',
  'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'
];

// Simplified Julian Day calculation
function calculateJulianDay(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}

export function calculatePanchanga(
  birthDate: string,
  birthTime: string,
  latitude: number,
  longitude: number
): PanchangaData {
  // Normalize inputs to handle timestamps and various formats
  const normalizedDate = normalizeDateString(birthDate);
  const normalizedTime = normalizeTimeString(birthTime);
  
  const [year, month, day] = normalizedDate.split('-').map(Number);
  const [hour, minute] = normalizedTime.split(':').map(Number);
  
  // Create birth date object
  const birthDateTime = new Date(year, month - 1, day, hour, minute);
  
  // Calculate Julian Day (simplified calculation)
  const jd = calculateJulianDay(year, month, day) + (hour + minute / 60) / 24;
  
  // Calculate Sun and Moon positions
  const sunPos = calculateSunPosition(jd);
  const moonPos = calculateMoonPosition(jd);
  
  // Calculate Tithi
  const tithi = calculateTithi(sunPos, moonPos);
  
  // Calculate Nakshatra
  const nakshatra = calculateNakshatra(moonPos);
  
  // Calculate Yoga
  const yoga = calculateYoga(sunPos, moonPos);
  
  // Calculate Karana
  const karana = calculateKarana(tithi);
  
  // Calculate Vara (weekday)
  const vara = calculateVara(birthDateTime);
  
  // Calculate Sunrise/Sunset
  const { sunrise, sunset } = calculateSunriseSunset(year, month, day, latitude, longitude);
  
  // Calculate Ayanamsa (Lahiri)
  const ayanamsa = calculateLahiriAyanamsa(year, month, day);
  
  return {
    tithi,
    nakshatra,
    yoga,
    karana,
    vara,
    sunrise,
    sunset,
    ayanamsa
  };
}

function calculateSunPosition(jd: number): number {
  // Simplified Sun position calculation
  // In production, use Swiss Ephemeris for accuracy
  const T = (jd - 2451545.0) / 36525.0;
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  return ((L0 % 360) + 360) % 360;
}

function calculateMoonPosition(jd: number): number {
  // Simplified Moon position calculation
  // In production, use Swiss Ephemeris for accuracy
  const T = (jd - 2451545.0) / 36525.0;
  const L = 218.3164477 + 481267.88123421 * T - 0.0015786 * T * T;
  return ((L % 360) + 360) % 360;
}

function calculateTithi(sunPos: number, moonPos: number) {
  const diff = moonPos - sunPos;
  const normalizedDiff = ((diff % 360) + 360) % 360;
  
  const tithiNumber = Math.floor(normalizedDiff / 12) + 1;
  const progress = ((normalizedDiff % 12) / 12) * 100;
  
  const paksha: 'Shukla' | 'Krishna' = tithiNumber <= 15 ? 'Shukla' : 'Krishna';
  const tithiIndex = tithiNumber <= 15 ? tithiNumber - 1 : tithiNumber - 16;
  
  return {
    number: tithiNumber,
    name: TITHI_NAMES[tithiIndex],
    paksha,
    progress,
    endTime: new Date(Date.now() + (100 - progress) * 24 * 60 * 60 * 1000 / 100)
  };
}

function calculateNakshatra(moonPos: number) {
  const nakshatraNumber = Math.floor(moonPos / 13.333333) + 1;
  const progress = ((moonPos % 13.333333) / 13.333333) * 100;
  
  return {
    number: nakshatraNumber,
    name: NAKSHATRA_NAMES[(nakshatraNumber - 1) % 27],
    lord: NAKSHATRA_LORDS[(nakshatraNumber - 1) % 27],
    progress,
    endTime: new Date(Date.now() + (100 - progress) * 24 * 60 * 60 * 1000 / 100)
  };
}

function calculateYoga(sunPos: number, moonPos: number) {
  const sum = sunPos + moonPos;
  const normalizedSum = ((sum % 360) + 360) % 360;
  
  const yogaNumber = Math.floor(normalizedSum / 13.333333) + 1;
  const progress = ((normalizedSum % 13.333333) / 13.333333) * 100;
  
  return {
    number: yogaNumber,
    name: YOGA_NAMES[(yogaNumber - 1) % 27],
    progress,
    endTime: new Date(Date.now() + (100 - progress) * 24 * 60 * 60 * 1000 / 100)
  };
}

function calculateKarana(tithi: any) {
  const karanaNumber = Math.floor((tithi.number - 1) * 2) + 1;
  const progress = (tithi.progress / 100) * 50; // Each karana is half a tithi
  
  return {
    number: karanaNumber,
    name: KARANA_NAMES[(karanaNumber - 1) % 11],
    progress,
    endTime: new Date(Date.now() + (50 - progress) * 24 * 60 * 60 * 1000 / 100)
  };
}

function calculateVara(birthDateTime: Date) {
  const dayOfWeek = birthDateTime.getDay();
  
  return {
    number: dayOfWeek + 1,
    name: VARA_NAMES[dayOfWeek],
    lord: VARA_LORDS[dayOfWeek]
  };
}

function calculateSunriseSunset(year: number, month: number, day: number, lat: number, lon: number) {
  // Simplified sunrise/sunset calculation
  // In production, use more accurate astronomical calculations
  
  const date = new Date(year, month - 1, day);
  const jd = calculateJulianDay(year, month, day);
  
  // Approximate sunrise/sunset times
  const sunrise = new Date(year, month - 1, day, 6, 0); // 6:00 AM
  const sunset = new Date(year, month - 1, day, 18, 0); // 6:00 PM
  
  return { sunrise, sunset };
}

function calculateLahiriAyanamsa(year: number, month: number, day: number): number {
  // Lahiri Ayanamsa calculation
  const jd = calculateJulianDay(year, month, day);
  const T = (jd - 2451545.0) / 36525.0;
  const ayanamsa = 23.85327 + 0.01395 * T + 0.0000005 * T * T;
  return ayanamsa;
}

// Export utility functions
export function getTithiSignificance(tithiNumber: number, paksha: string) {
  const significances = {
    1: 'New beginnings, auspicious for starting ventures',
    2: 'Good for partnerships and relationships',
    3: 'Favorable for creative activities',
    4: 'Good for spiritual practices',
    5: 'Auspicious for learning and education',
    6: 'Good for health-related activities',
    7: 'Favorable for travel and movement',
    8: 'Good for transformation and change',
    9: 'Auspicious for worship and devotion',
    10: 'Good for business and commerce',
    11: 'Favorable for fasting and spiritual practices',
    12: 'Good for charity and service',
    13: 'Favorable for meditation and introspection',
    14: 'Good for preparation and planning',
    15: paksha === 'Shukla' ? 'Full Moon - Peak energy' : 'New Moon - New beginnings'
  };
  
  return significances[tithiNumber as keyof typeof significances] || 'Neutral day';
}

export function getNakshatraSignificance(nakshatraName: string) {
  const significances: Record<string, string> = {
    'Ashwini': 'Healing, beginnings, swift action',
    'Bharani': 'Transformation, creativity, fertility',
    'Krittika': 'Purification, determination, leadership',
    'Rohini': 'Growth, abundance, beauty',
    'Mrigashira': 'Searching, curiosity, communication',
    'Ardra': 'Transformation, storms, renewal',
    'Punarvasu': 'Renewal, restoration, healing',
    'Pushya': 'Nourishment, protection, spirituality',
    'Ashlesha': 'Transformation, intensity, healing',
    'Magha': 'Royalty, authority, ancestors',
    'Purva Phalguni': 'Creativity, romance, celebration',
    'Uttara Phalguni': 'Service, healing, partnership',
    'Hasta': 'Skill, dexterity, healing',
    'Chitra': 'Artistry, beauty, creation',
    'Swati': 'Independence, movement, change',
    'Vishakha': 'Achievement, success, determination',
    'Anuradha': 'Friendship, devotion, success',
    'Jyeshtha': 'Power, authority, transformation',
    'Mula': 'Roots, foundation, destruction',
    'Purva Ashadha': 'Invincibility, strength, victory',
    'Uttara Ashadha': 'Universal victory, leadership',
    'Shravana': 'Learning, listening, wisdom',
    'Dhanishtha': 'Wealth, music, dance',
    'Shatabhisha': 'Healing, medicine, mysticism',
    'Purva Bhadrapada': 'Transformation, spirituality',
    'Uttara Bhadrapada': 'Spirituality, liberation',
    'Revati': 'Compassion, completion, healing'
  };
  
  return significances[nakshatraName] || 'Mystical influence';
}

export function getYogaSignificance(yogaName: string) {
  const significances: Record<string, string> = {
    'Vishkambha': 'Support, foundation, stability',
    'Priti': 'Love, affection, harmony',
    'Ayushman': 'Longevity, health, vitality',
    'Saubhagya': 'Good fortune, prosperity',
    'Shobhana': 'Beauty, elegance, refinement',
    'Atiganda': 'Obstacles, challenges, delays',
    'Sukarma': 'Good deeds, righteousness',
    'Dhriti': 'Patience, endurance, stability',
    'Shula': 'Pain, suffering, obstacles',
    'Ganda': 'Danger, obstacles, challenges',
    'Vriddhi': 'Growth, expansion, progress',
    'Dhruva': 'Stability, permanence, constancy',
    'Vyaghata': 'Obstacles, conflicts, challenges',
    'Harshana': 'Joy, happiness, celebration',
    'Vajra': 'Strength, power, determination',
    'Siddhi': 'Success, accomplishment, perfection',
    'Vyatipata': 'Reversal, change, transformation',
    'Variyan': 'Water, fluidity, adaptability',
    'Parigha': 'Obstacles, barriers, restrictions',
    'Shiva': 'Destruction, transformation, renewal',
    'Siddha': 'Accomplishment, success, perfection',
    'Sadhya': 'Achievable, attainable, possible',
    'Shubha': 'Auspicious, favorable, beneficial',
    'Shukla': 'Pure, bright, auspicious',
    'Brahma': 'Creation, knowledge, wisdom',
    'Indra': 'Power, authority, leadership',
    'Vaidhriti': 'Separation, division, obstacles'
  };
  
  return significances[yogaName] || 'Cosmic influence';
}
