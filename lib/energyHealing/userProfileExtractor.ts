// User Profile Data Extractor for Energy Healing Personalization
// Extracts and formats user data for personalized energy healing analysis

import { UserProfile } from '@/lib/firebase';
import { devLog } from '@/lib/devLogger';

export interface UserContext {
  age: number;
  gender: string;
  birthDate: string;
  birthTime?: string;
  birthPlace?: string;
  astrological?: {
    sunSign?: string;
    moonSign?: string;
    risingSign?: string;
    planetaryPositions?: any;
  };
  health?: {
    conditions?: string[];
    stressLevel?: string;
    energyLevel?: string;
  };
  lifestyle?: {
    exerciseLevel?: string;
    sleepPattern?: string;
    meditationExperience?: string;
  };
}

/**
 * Calculate age from birth date
 */
function calculateAge(birthDate: string): number {
  if (!birthDate) return 30; // Default age
  
  try {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  } catch (error) {
    devLog.error('Error calculating age:', error, 'userProfileExtractor');
    return 30;
  }
}

/**
 * Extract user context for energy healing analysis
 */
export function extractUserContext(userProfile: UserProfile, astroData?: any): UserContext {
  const age = calculateAge(userProfile.birthDate || '');
  
  const context: UserContext = {
    age,
    gender: userProfile.gender || 'other',
    birthDate: userProfile.birthDate || '',
    birthTime: userProfile.birthTime,
    birthPlace: userProfile.birthPlace,
  };

  // Extract astrological data if available
  if (astroData) {
    context.astrological = {
      sunSign: astroData.vedic?.chart?.sun?.sign || 
               astroData.western?.chart?.sun?.sign ||
               calculateSunSign(userProfile.birthDate ?? ''),
      moonSign: astroData.vedic?.chart?.moon?.sign || 
                astroData.western?.chart?.moon?.sign,
      risingSign: (astroData.vedic?.chart?.ascendant?.sign ?? '') || 
                  (astroData.western?.chart?.ascendant?.sign ?? ''),
      planetaryPositions: astroData.vedic?.chart || astroData.western?.chart,
    };
  } else {
    // Fallback: calculate basic sun sign
    context.astrological = {
      sunSign: calculateSunSign(userProfile.birthDate ?? ''),
    };
  }

  // Extract health information (if available in profile)
  if ((userProfile as any).healthConditions || (userProfile as any).stressLevel) {
    context.health = {
      conditions: (userProfile as any).healthConditions || [],
      stressLevel: (userProfile as any).stressLevel,
      energyLevel: (userProfile as any).energyLevel,
    };
  }

  // Extract lifestyle information (if available)
  if ((userProfile as any).exerciseLevel || (userProfile as any).sleepPattern) {
    context.lifestyle = {
      exerciseLevel: (userProfile as any).exerciseLevel,
      sleepPattern: (userProfile as any).sleepPattern,
      meditationExperience: (userProfile as any).meditationExperience,
    };
  }

  return context;
}

/**
 * Calculate sun sign from birth date (fallback)
 */
function calculateSunSign(birthDate: string): string {
  if (!birthDate) return 'Unknown';
  
  try {
    const date = new Date(birthDate);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    // Zodiac sign boundaries
    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Aries';
    if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Taurus';
    if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gemini';
    if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Cancer';
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo';
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Virgo';
    if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Libra';
    if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Scorpio';
    if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Sagittarius';
    if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Capricorn';
    if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Aquarius';
    if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return 'Pisces';
    
    return 'Unknown';
  } catch (error) {
    devLog.error('Error calculating sun sign:', error, 'userProfileExtractor');
    return 'Unknown';
  }
}

/**
 * Build concise context string for AI prompts
 */
export function buildContextString(context: UserContext, method: string): string {
  const parts: string[] = [];
  
  // Basic info
  parts.push(`User: ${context.age}-year-old ${context.gender}`);
  if (context.birthDate) {
    parts.push(`born ${context.birthDate}`);
  }
  
  // Astrological info
  if (context.astrological) {
    const astroParts: string[] = [];
    if (context.astrological.sunSign) astroParts.push(`Sun ${context.astrological.sunSign}`);
    if (context.astrological.moonSign) astroParts.push(`Moon ${context.astrological.moonSign}`);
    if (context.astrological.risingSign) astroParts.push(`Rising ${context.astrological.risingSign}`);
    
    if (astroParts.length > 0) {
      parts.push(`Astrology: ${astroParts.join(', ')}`);
    }
  }
  
  // Method-specific context
  if (method === 'chakra' && context.astrological?.sunSign) {
    parts.push(`Solar Plexus influenced by Sun sign ${context.astrological.sunSign}`);
    if (context.astrological.moonSign) {
      parts.push(`Emotional chakras influenced by Moon sign ${context.astrological.moonSign}`);
    }
  }
  
  if (method === 'aura' && context.astrological) {
    if (context.astrological.sunSign) {
      parts.push(`Dominant aura color influenced by Sun sign ${context.astrological.sunSign}`);
    }
    if (context.astrological.moonSign) {
      parts.push(`Emotional aura layer influenced by Moon sign ${context.astrological.moonSign}`);
    }
  }
  
  if (method === 'crystal' && context.astrological?.sunSign) {
    parts.push(`Recommended crystals aligned with ${context.astrological.sunSign} sign`);
    if (context.birthDate) {
      const month = new Date(context.birthDate).getMonth() + 1;
      parts.push(`Birth month: ${getMonthName(month)}`);
    }
  }
  
  if (method === 'reiki' && context.health) {
    if (context.health.stressLevel) {
      parts.push(`Stress level: ${context.health.stressLevel}`);
    }
    if (context.lifestyle?.meditationExperience) {
      parts.push(`Meditation experience: ${context.lifestyle.meditationExperience}`);
    }
  }
  
  return parts.join('. ') + '.';
}

function getMonthName(month: number): string {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December'];
  return months[month - 1] || 'Unknown';
}

