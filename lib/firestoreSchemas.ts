/**
 * Firestore Schema Definitions for FutureSeer
 * 
 * This file defines the data structures used for storing astrological data
 * in Firestore, ensuring consistency and type safety across the application.
 */

// ============================================================================
// VEDIC ASTROLOGY SCHEMAS
// ============================================================================

export interface VedicBirthData {
  name: string
  birthDate: string // ISO date string (YYYY-MM-DD)
  birthTime: string // ISO time string (HH:MM:SS)
  birthPlace: string
  latitude: number
  longitude: number
  timezone: string
  analysisFocus?: string
}

export interface VedicPlanetaryPosition {
  planet: string
  sign: string
  degree: number
  degreeInSign?: number
  dignity?: string
  house: number
  nakshatra: string
  nakshatraLord: string
  nakshatraDegree: number
  isRetrograde: boolean
  isCombust: boolean
  isExalted: boolean
  isDebilitated: boolean
}

export interface VedicHouse {
  houseNumber: number
  sign: string
  lord: string
  planets: string[]
  aspects: string[]
  description: string
}

export interface VedicDasha {
  dashaType: string // 'mahadasha' | 'antardasha' | 'pratyantardasha'
  planet: string
  startDate: string
  endDate: string
  duration: string
  description: string
  effects: string[]
}

export interface VedicYoga {
  name: string
  type: string // 'rajayoga' | 'dhanayoga' | 'karmayoga' | 'bhaktiyoga' | 'mokshayoga'
  planets: string[]
  houses: number[]
  description: string
  effects: string[]
  strength: 'weak' | 'moderate' | 'strong' | 'very_strong'
}

export interface VedicChart {
  chartType: string // 'rasi' | 'navamsa' | 'dasamsa' | 'dwadasamsa' | 'trimsamsa'
  imageUrl?: string
  imageData?: string // Base64 encoded chart image
  ascendant?: { sign: number }
  planets: VedicPlanetaryPosition[]
  houses: VedicHouse[]
  metadata: {
    ayanamsa: string
    houseSystem: string
    generatedAt: string
    source: string
  }
}

export interface VedicAnalysis {
  personality: {
    overview: string
    strengths: string[]
    challenges: string[]
    characteristics: string[]
  }
  career: {
    overview: string
    suitableProfessions: string[]
    careerAdvice: string[]
  }
  relationships: {
    overview: string
    compatibility: string[]
    relationshipAdvice: string[]
  }
  health: {
    overview: string
    healthTips: string[]
    vulnerableAreas: string[]
  }
  spirituality: {
    overview: string
    spiritualPath: string[]
    meditationAdvice: string[]
  }
  timing: {
    favorablePeriods: string[]
    challengingPeriods: string[]
    majorTransits: string[]
  }
}

export interface VedicRemedies {
  gemstones: {
    primary: string[]
    secondary: string[]
    avoid: string[]
  }
  mantras: {
    primary: string[]
    secondary: string[]
    chantingInstructions: string[]
  }
  rituals: {
    daily: string[]
    weekly: string[]
    monthly: string[]
  }
  lifestyle: {
    diet: string[]
    activities: string[]
    avoid: string[]
  }
  charitable: {
    donations: string[]
    seva: string[]
    timing: string[]
  }
}

export interface VedicReport {
  id: string
  userId: string
  birthData: VedicBirthData
  charts: VedicChart[]
  planetaryPositions: VedicPlanetaryPosition[]
  houses: VedicHouse[]
  dashas: VedicDasha[]
  yogas: VedicYoga[]
  analysis: VedicAnalysis
  remedies: VedicRemedies
  metadata: {
    generatedAt: string
    generatedBy: string // 'astroapp' | 'fallback' | 'cached'
    version: string
    cached: boolean
    expiresAt?: string
  }
}

// ============================================================================
// CACHING SCHEMAS
// ============================================================================

export interface VedicCache {
  id: string // Hash of birth data
  userId: string
  birthDataHash: string
  report: VedicReport
  createdAt: string
  expiresAt: string
  accessCount: number
  lastAccessed: string
}

// ============================================================================
// USER PROFILE EXTENSIONS
// ============================================================================

export interface UserVedicPreferences {
  userId: string
  preferredLanguage: string // 'en' | 'hi' | 'ta' | 'te' | etc.
  chartPreferences: {
    showRetrograde: boolean
    showNakshatras: boolean
    showAspects: boolean
    chartStyle: 'traditional' | 'modern' | 'minimal'
  }
  analysisPreferences: {
    detailLevel: 'basic' | 'intermediate' | 'advanced'
    focusAreas: string[]
    includeRemedies: boolean
    includePredictions: boolean
  }
  notificationPreferences: {
    dashaAlerts: boolean
    transitAlerts: boolean
    monthlyReports: boolean
  }
  updatedAt: string
}

// ============================================================================
// ANALYTICS SCHEMAS
// ============================================================================

export interface VedicAnalytics {
  id: string
  userId: string
  reportId: string
  action: 'view' | 'download' | 'share' | 'regenerate'
  timestamp: string
  metadata: {
    userAgent: string
    ipAddress: string
    sessionId: string
  }
}

// ============================================================================
// COLLECTION NAMES
// ============================================================================

export const FIRESTORE_COLLECTIONS = {
  VEDIC_REPORTS: 'vedic_reports',
  VEDIC_CACHE: 'vedic_cache',
  USER_VEDIC_PREFERENCES: 'user_vedic_preferences',
  VEDIC_ANALYTICS: 'vedic_analytics',
  USER_PROFILES: 'user_profiles'
} as const

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type VedicReportStatus = 'generating' | 'completed' | 'failed' | 'cached'
export type ChartType = 'rasi' | 'navamsa' | 'dasamsa' | 'dwadasamsa' | 'trimsamsa'
export type DashaType = 'mahadasha' | 'antardasha' | 'pratyantardasha'
export type YogaType = 'rajayoga' | 'dhanayoga' | 'karmayoga' | 'bhaktiyoga' | 'mokshayoga'

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

export function validateVedicBirthData(data: any): data is VedicBirthData {
  return (
    typeof data.name === 'string' &&
    typeof data.birthDate === 'string' &&
    typeof data.birthTime === 'string' &&
    typeof data.birthPlace === 'string' &&
    typeof data.latitude === 'number' &&
    typeof data.longitude === 'number' &&
    typeof data.timezone === 'string'
  )
}

export function validateVedicReport(data: any): data is VedicReport {
  return (
    typeof data.id === 'string' &&
    typeof data.userId === 'string' &&
    validateVedicBirthData(data.birthData) &&
    Array.isArray(data.charts) &&
    Array.isArray(data.planetaryPositions) &&
    Array.isArray(data.houses) &&
    Array.isArray(data.dashas) &&
    Array.isArray(data.yogas) &&
    typeof data.analysis === 'object' &&
    typeof data.remedies === 'object' &&
    typeof data.metadata === 'object'
  )
}


