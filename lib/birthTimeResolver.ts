'use client';

import { normalizeTimeString } from './timeUtils';

export interface TimePeriodInfo {
  id: string;
  label: string;
  description: string;
  approximateTime: string; // HH:mm format
  vedicTechnique: 'sunrise' | 'noon' | 'sunset' | 'moonChart';
  accuracy: 'approximate' | 'low' | 'very-low';
  icon: string;
}

export const TIME_PERIODS: TimePeriodInfo[] = [
  {
    id: 'early-morning',
    label: 'Early Morning (4 AM - 6 AM)',
    description: 'Just before or around sunrise',
    approximateTime: '05:00',
    vedicTechnique: 'sunrise',
    accuracy: 'approximate',
    icon: '🌅'
  },
  {
    id: 'morning',
    label: 'Morning (6 AM - 10 AM)',
    description: 'After sunrise, morning hours',
    approximateTime: '08:00',
    vedicTechnique: 'sunrise',
    accuracy: 'approximate',
    icon: '🌄'
  },
  {
    id: 'noon',
    label: 'Mid-day (10 AM - 2 PM)',
    description: 'Around noon, mid-day hours',
    approximateTime: '12:00',
    vedicTechnique: 'noon',
    accuracy: 'approximate',
    icon: '☀️'
  },
  {
    id: 'afternoon',
    label: 'Afternoon (2 PM - 6 PM)',
    description: 'After noon, before sunset',
    approximateTime: '16:00',
    vedicTechnique: 'noon',
    accuracy: 'approximate',
    icon: '🌤️'
  },
  {
    id: 'evening',
    label: 'Evening (6 PM - 8 PM)',
    description: 'Around sunset, early evening',
    approximateTime: '18:00',
    vedicTechnique: 'sunset',
    accuracy: 'approximate',
    icon: '🌆'
  },
  {
    id: 'night',
    label: 'Night (8 PM - 12 AM)',
    description: 'After sunset, night hours',
    approximateTime: '21:00',
    vedicTechnique: 'sunset',
    accuracy: 'low',
    icon: '🌙'
  },
  {
    id: 'late-night',
    label: 'Late Night (12 AM - 4 AM)',
    description: 'Midnight to early morning',
    approximateTime: '02:00',
    vedicTechnique: 'moonChart',
    accuracy: 'low',
    icon: '🌃'
  },
  {
    id: 'unknown',
    label: "I Don't Know",
    description: 'No time information available',
    approximateTime: '12:00', // Noon as ultimate fallback
    vedicTechnique: 'moonChart',
    accuracy: 'very-low',
    icon: '❓'
  }
];

export type BirthTimePeriodId = (typeof TIME_PERIODS)[number]['id'];

export interface ResolvedBirthTime {
  time: string; // HH:mm format
  method: 'exact' | 'sunrise' | 'noon' | 'sunset' | 'moonChart' | 'default';
  accuracy: 'high' | 'approximate' | 'low' | 'very-low';
  disclaimer: string;
}

export function getTimeForPeriod(
  period: string,
  birthDate: string,
  latitude: number,
  longitude: number
): string {
  const periodInfo = TIME_PERIODS.find(p => p.id === period);
  if (!periodInfo) return '12:00';
  
  // Calculate actual sunrise/sunset for the date and location
  if (periodInfo.vedicTechnique === 'sunrise') {
    return calculateSunrise(birthDate, latitude, longitude);
  } else if (periodInfo.vedicTechnique === 'sunset') {
    return calculateSunset(birthDate, latitude, longitude);
  }
  
  return periodInfo.approximateTime;
}

function calculateSunrise(date: string, lat: number, lon: number): string {
  // For now, return approximate sunrise time based on latitude
  // TODO: Implement accurate sunrise calculation using SunCalc or similar library
  
  // Rough approximation based on latitude
  if (lat > 60) return '08:00'; // High latitude, later sunrise
  if (lat > 45) return '07:00'; // Mid-high latitude
  if (lat > 30) return '06:30'; // Mid latitude
  if (lat > 15) return '06:00'; // Mid-low latitude
  return '05:30'; // Low latitude, early sunrise
}

function calculateSunset(date: string, lat: number, lon: number): string {
  // For now, return approximate sunset time based on latitude
  // TODO: Implement accurate sunset calculation using SunCalc or similar library
  
  // Rough approximation based on latitude
  if (lat > 60) return '16:00'; // High latitude, earlier sunset
  if (lat > 45) return '17:00'; // Mid-high latitude
  if (lat > 30) return '17:30'; // Mid latitude
  if (lat > 15) return '18:00'; // Mid-low latitude
  return '18:30'; // Low latitude, later sunset
}

export async function resolveBirthTime(
  userProfile: {
    birthTime?: string;
    birthTimeKnown?: boolean;
    birthTimePeriod?: string;
    birthDate?: string;
    birthPlace?: string;
  },
  coordinates: { latitude: number; longitude: number }
): Promise<ResolvedBirthTime> {
  
  // Case 1: Exact time known
  if (userProfile.birthTimeKnown && userProfile.birthTime) {
    return {
      time: normalizeTimeString(userProfile.birthTime),
      method: 'exact',
      accuracy: 'high',
      disclaimer: ''
    };
  }
  
  // Case 2: Time period selected
  if (userProfile.birthTimePeriod && userProfile.birthDate) {
    const period = TIME_PERIODS.find(p => p.id === userProfile.birthTimePeriod);
    
    if (period) {
      const resolvedTime = getTimeForPeriod(
        userProfile.birthTimePeriod,
        userProfile.birthDate,
        coordinates.latitude,
        coordinates.longitude
      );
      
      return {
        time: resolvedTime,
        method: period.vedicTechnique,
        accuracy: period.accuracy,
        disclaimer: getDisclaimerForMethod(period.vedicTechnique)
      };
    }
  }
  
  // Case 3: No time information - use noon as default
  return {
    time: '12:00',
    method: 'default',
    accuracy: 'very-low',
    disclaimer: 'Chart generated using noon time (12:00 PM) as birth time was not provided. This is a general chart and may have limited accuracy for house-based predictions. Consider using Moon Chart (Chandra Lagna) for more personalized insights.'
  };
}

function getDisclaimerForMethod(method: string): string {
  const disclaimers = {
    'sunrise': '⚠️ Chart generated using Sunrise time as exact birth time was not provided. This traditional Vedic approach provides good accuracy for planetary positions and dashas, but house-based predictions may vary.',
    'noon': '⚠️ Chart generated using approximate noon time based on your time period selection. Planetary positions are accurate, but ascendant and house placements are approximate.',
    'sunset': '⚠️ Chart generated using Sunset time based on your time period selection. This provides reasonable accuracy for evening births, though exact house positions may vary.',
    'moonChart': '⚠️ Chart primarily uses Moon position (Chandra Lagna) as exact birth time is not available. This traditional Vedic approach is especially useful for transit predictions and emotional patterns.',
    'default': '⚠️ Chart generated using default noon time. For more accurate predictions, please provide your birth time or at least the time period when you were born.'
  };
  
  return disclaimers[method as keyof typeof disclaimers] || disclaimers['default'];
}

// Helper function to get time period info by ID
export function getTimePeriodInfo(periodId: string): TimePeriodInfo | undefined {
  return TIME_PERIODS.find(p => p.id === periodId);
}

// Helper function to format time for display
export function formatTimeForDisplay(time: string): string {
  try {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const min = parseInt(minutes);
    
    if (hour === 0) return `12:${min.toString().padStart(2, '0')} AM`;
    if (hour < 12) return `${hour}:${min.toString().padStart(2, '0')} AM`;
    if (hour === 12) return `12:${min.toString().padStart(2, '0')} PM`;
    return `${hour - 12}:${min.toString().padStart(2, '0')} PM`;
  } catch {
    return time;
  }
}

// Helper function to get accuracy color for UI
export function getAccuracyColor(accuracy: string): string {
  switch (accuracy) {
    case 'high': return 'text-green-400';
    case 'approximate': return 'text-yellow-400';
    case 'low': return 'text-orange-400';
    case 'very-low': return 'text-red-400';
    default: return 'text-slate-400';
  }
}

// Helper function to get accuracy label for UI
export function getAccuracyLabel(accuracy: string): string {
  switch (accuracy) {
    case 'high': return 'High Accuracy';
    case 'approximate': return 'Approximate';
    case 'low': return 'Low Accuracy';
    case 'very-low': return 'Very Low Accuracy';
    default: return 'Unknown';
  }
}
