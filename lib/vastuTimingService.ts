// Vastu Timing Service
// Provides auspicious timing recommendations based on Panchanga (Tithi, Nakshatra, Yoga, Karana, Vaara)
// For construction, moving, renovations, and other Vastu activities

import { calculatePanchanga, type PanchangaData } from './panchanga';
import { devLog } from '@/lib/devLogger';
import { UserProfile } from './firebase';

export interface VastuTiming {
  date: Date;
  tithi: string;
  nakshatra: string;
  yoga: string;
  karana: string;
  vara: string;
  auspiciousScore: number; // 0-100
  isAuspicious: boolean;
  bestActivities: string[];
  avoidActivities: string[];
  timeSlots: {
    start: string;
    end: string;
    auspicious: boolean;
    activity: string;
  }[];
  recommendations: string[];
}

// Auspicious Tithis for Vastu activities
const AUSPICIOUS_TITHIS = [
  'Pratipada', 'Dwitiya', 'Tritiya', 'Panchami', 'Shashthi', 
  'Saptami', 'Dashami', 'Ekadashi', 'Dwadashi', 'Trayodashi', 'Purnima'
];

const INAUSPICIOUS_TITHIS = [
  'Chaturthi', 'Ashtami', 'Navami', 'Chaturdashi', 'Amavasya'
];

// Auspicious Nakshatras for construction and moving
const AUSPICIOUS_NAKSHATRAS = [
  'Rohini', 'Mrigashira', 'Pushya', 'Hasta', 'Chitra', 
  'Swati', 'Anuradha', 'Shravana', 'Dhanishta', 'Uttara Bhadrapada', 'Revati'
];

const INAUSPICIOUS_NAKSHATRAS = [
  'Ashlesha', 'Magha', 'Jyeshtha', 'Mula'
];

// Auspicious Yogas for Vastu activities
const AUSPICIOUS_YOGAS = [
  'Vishkambha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana', 
  'Sukarma', 'Dhriti', 'Vriddhi', 'Dhruva', 'Siddhi', 'Vyatipata', 
  'Variyan', 'Shiva', 'Siddha', 'Sadhya', 'Shubha', 'Shukla', 'Brahma', 'Indra'
];

const INAUSPICIOUS_YOGAS = [
  'Atiganda', 'Shula', 'Ganda', 'Vyaghata', 'Harshana', 'Vajra', 'Parigha', 'Vaidhriti'
];

// Auspicious Karanas
const AUSPICIOUS_KARANAS = [
  'Bava', 'Balava', 'Kaulava', 'Taitila', 'Gara', 'Vanija'
];

const INAUSPICIOUS_KARANAS = [
  'Visti', 'Shakuni', 'Chatushpada', 'Naga', 'Kimstughna'
];

// Auspicious Vaaras (days)
const AUSPICIOUS_VAARAS = [
  'Monday', 'Wednesday', 'Thursday', 'Friday'
];

const MODERATE_VAARAS = [
  'Sunday', 'Tuesday'
];

const INAUSPICIOUS_VAARAS = [
  'Saturday'
];

// Calculate auspicious score for a given date
function calculateAuspiciousScore(panchanga: PanchangaData): number {
  let score = 50; // Base score
  
  // Tithi influence (30% weight)
  if (AUSPICIOUS_TITHIS.includes(panchanga.tithi.name)) {
    score += 15;
  } else if (INAUSPICIOUS_TITHIS.includes(panchanga.tithi.name)) {
    score -= 20;
  }
  
  // Nakshatra influence (25% weight)
  if (AUSPICIOUS_NAKSHATRAS.includes(panchanga.nakshatra.name)) {
    score += 12;
  } else if (INAUSPICIOUS_NAKSHATRAS.includes(panchanga.nakshatra.name)) {
    score -= 15;
  }
  
  // Yoga influence (20% weight)
  if (AUSPICIOUS_YOGAS.includes(panchanga.yoga.name)) {
    score += 10;
  } else if (INAUSPICIOUS_YOGAS.includes(panchanga.yoga.name)) {
    score -= 12;
  }
  
  // Karana influence (15% weight)
  if (AUSPICIOUS_KARANAS.includes(panchanga.karana.name)) {
    score += 8;
  } else if (INAUSPICIOUS_KARANAS.includes(panchanga.karana.name)) {
    score -= 10;
  }
  
  // Vaara influence (10% weight)
  if (AUSPICIOUS_VAARAS.includes(panchanga.vara.name)) {
    score += 5;
  } else if (MODERATE_VAARAS.includes(panchanga.vara.name)) {
    score += 0;
  } else if (INAUSPICIOUS_VAARAS.includes(panchanga.vara.name)) {
    score -= 8;
  }
  
  // Clamp between 0 and 100
  return Math.max(0, Math.min(100, score));
}

// Generate time slots for the day
function generateTimeSlots(panchanga: PanchangaData): VastuTiming['timeSlots'] {
  const slots: VastuTiming['timeSlots'] = [];
  
  // Brahma Muhurta (4:00 AM - 6:00 AM) - Most auspicious
  slots.push({
    start: '04:00',
    end: '06:00',
    auspicious: true,
    activity: 'Prayer, meditation, foundation laying'
  });
  
  // Morning (6:00 AM - 9:00 AM) - Auspicious
  slots.push({
    start: '06:00',
    end: '09:00',
    auspicious: true,
    activity: 'Construction start, moving, renovations'
  });
  
  // Mid-morning (9:00 AM - 12:00 PM) - Good
  slots.push({
    start: '09:00',
    end: '12:00',
    auspicious: true,
    activity: 'General Vastu activities'
  });
  
  // Afternoon (12:00 PM - 3:00 PM) - Moderate
  slots.push({
    start: '12:00',
    end: '15:00',
    auspicious: false,
    activity: 'Avoid major activities during midday'
  });
  
  // Evening (3:00 PM - 6:00 PM) - Good
  slots.push({
    start: '15:00',
    end: '18:00',
    auspicious: true,
    activity: 'Completion activities, finishing work'
  });
  
  // Night (6:00 PM - 9:00 PM) - Moderate
  slots.push({
    start: '18:00',
    end: '21:00',
    auspicious: false,
    activity: 'Avoid starting new construction'
  });
  
  return slots;
}

// Generate recommendations based on Panchanga
function generateTimingRecommendations(
  panchanga: PanchangaData,
  auspiciousScore: number
): string[] {
  const recommendations: string[] = [];
  
  if (auspiciousScore >= 70) {
    recommendations.push(`Excellent day for Vastu activities - ${panchanga.tithi.name} Tithi, ${panchanga.nakshatra.name} Nakshatra`);
    recommendations.push('Ideal for foundation laying, house warming, and major construction');
  } else if (auspiciousScore >= 50) {
    recommendations.push(`Moderately auspicious day - ${panchanga.tithi.name} Tithi, ${panchanga.nakshatra.name} Nakshatra`);
    recommendations.push('Suitable for minor renovations and routine Vastu activities');
  } else {
    recommendations.push(`Less auspicious day - ${panchanga.tithi.name} Tithi, ${panchanga.nakshatra.name} Nakshatra`);
    recommendations.push('Avoid major construction or moving activities');
    recommendations.push('Consider waiting for a more auspicious day');
  }
  
  // Specific recommendations based on components
  if (AUSPICIOUS_NAKSHATRAS.includes(panchanga.nakshatra.name)) {
    recommendations.push(`${panchanga.nakshatra.name} Nakshatra is highly auspicious for property-related activities`);
  }
  
  if (AUSPICIOUS_YOGAS.includes(panchanga.yoga.name)) {
    recommendations.push(`${panchanga.yoga.name} Yoga enhances positive outcomes for Vastu activities`);
  }
  
  if (INAUSPICIOUS_TITHIS.includes(panchanga.tithi.name)) {
    recommendations.push(`Avoid starting new projects on ${panchanga.tithi.name} Tithi`);
  }
  
  if (INAUSPICIOUS_VAARAS.includes(panchanga.vara.name)) {
    recommendations.push(`${panchanga.vara.name} is generally inauspicious - postpone major activities if possible`);
  }
  
  return recommendations;
}

// Get best activities for the day
function getBestActivities(panchanga: PanchangaData, auspiciousScore: number): string[] {
  const activities: string[] = [];
  
  if (auspiciousScore >= 70) {
    activities.push('Foundation laying (Bhoomi Pujan)');
    activities.push('House warming (Griha Pravesh)');
    activities.push('Starting construction');
    activities.push('Moving into new property');
    activities.push('Major renovations');
  } else if (auspiciousScore >= 50) {
    activities.push('Minor renovations');
    activities.push('Room decoration');
    activities.push('Vastu remedies installation');
    activities.push('Cleaning and organizing');
  } else {
    activities.push('Planning and preparation only');
    activities.push('Avoid starting new activities');
  }
  
  return activities;
}

// Get activities to avoid
function getAvoidActivities(panchanga: PanchangaData, auspiciousScore: number): string[] {
  const avoid: string[] = [];
  
  if (auspiciousScore < 50) {
    avoid.push('Foundation laying');
    avoid.push('House warming');
    avoid.push('Starting major construction');
    avoid.push('Moving into new property');
  }
  
  if (INAUSPICIOUS_TITHIS.includes(panchanga.tithi.name)) {
    avoid.push('Starting new projects');
    avoid.push('Major financial decisions related to property');
  }
  
  if (INAUSPICIOUS_NAKSHATRAS.includes(panchanga.nakshatra.name)) {
    avoid.push('Property purchase decisions');
    avoid.push('Signing property documents');
  }
  
  return avoid;
}

// Get Vastu timing for a specific date
export function getVastuTiming(
  date: Date,
  latitude: number = 19.0760, // Default to Mumbai
  longitude: number = 72.8777,
  userProfile?: UserProfile | null
): VastuTiming | null {
  try {
    // Extract date components
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    // Use noon time for Panchanga calculation (standard practice)
    const dateString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const timeString = '12:00';
    
    // Calculate Panchanga
    const panchanga = calculatePanchanga(dateString, timeString, latitude, longitude);
    
    if (!panchanga) {
      return null;
    }
    
    // Calculate auspicious score
    const auspiciousScore = calculateAuspiciousScore(panchanga);
    const isAuspicious = auspiciousScore >= 60;
    
    // Generate time slots
    const timeSlots = generateTimeSlots(panchanga);
    
    // Generate recommendations
    const recommendations = generateTimingRecommendations(panchanga, auspiciousScore);
    
    // Get activities
    const bestActivities = getBestActivities(panchanga, auspiciousScore);
    const avoidActivities = getAvoidActivities(panchanga, auspiciousScore);
    
    return {
      date,
      tithi: panchanga.tithi.name,
      nakshatra: panchanga.nakshatra.name,
      yoga: panchanga.yoga.name,
      karana: panchanga.karana.name,
      vara: panchanga.vara.name,
      auspiciousScore,
      isAuspicious,
      bestActivities,
      avoidActivities,
      timeSlots,
      recommendations
    };
  } catch (error) {
    devLog.error('Error calculating Vastu timing:', error, 'vastuTimingService');
    return null;
  }
}

// Get next N auspicious dates for Vastu activities
export function getNextAuspiciousDates(
  startDate: Date = new Date(),
  count: number = 5,
  latitude: number = 19.0760,
  longitude: number = 72.8777,
  minScore: number = 60
): VastuTiming[] {
  const auspiciousDates: VastuTiming[] = [];
  const currentDate = new Date(startDate);
  
  // Search up to 60 days ahead
  for (let i = 0; i < 60 && auspiciousDates.length < count; i++) {
    const date = new Date(currentDate);
    date.setDate(currentDate.getDate() + i);
    
    const timing = getVastuTiming(date, latitude, longitude);
    
    if (timing && timing.auspiciousScore >= minScore) {
      auspiciousDates.push(timing);
    }
  }
  
  return auspiciousDates;
}

