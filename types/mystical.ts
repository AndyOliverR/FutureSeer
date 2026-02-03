/**
 * Type definitions for Comprehensive Mystical Profile
 * Used across dashboard and divination tools
 */

export interface VedicPlanet {
  name: string
  longitude: number
  latitude?: number
  speed?: number
  sign: number
  house: number
  nakshatra?: string
  retrograde?: boolean
}

export interface VedicHouse {
  number: number
  sign: number
  lord: string
  planets: string[]
}

export interface VedicYoga {
  name: string
  description: string
  strength: number
}

export interface DashaPeriod {
  planet: string
  startDate: string
  endDate: string
  effects?: string
  antardasha?: string
}

export interface VedicData {
  ascendant: number
  ascendantSign?: string
  planets: VedicPlanet[]
  houses: VedicHouse[]
  nakshatras: any[]
  yogas: VedicYoga[]
  dasha: DashaPeriod[]
  currentDasha: DashaPeriod | null
  vedicCharts?: any
}

export interface PersonalityInterpretation {
  overview: string
  strengths: string[]
  challenges: string[]
}

export interface LifePurposeInterpretation {
  overview: string
  karmicLessons: string[]
  spiritualPath: string
  soulEvolution: string
}

export interface RelationshipsInterpretation {
  overview: string
  marriageTiming: string
  compatibility: string
  familyLife: string
}

export interface CareerInterpretation {
  overview: string
  suitableProfessions: string[]
  successFactors: string[]
  timing: string
}

export interface HealthInterpretation {
  overview: string
  constitution: string
  healthTips: string[]
  vulnerableAreas: string[]
}

export interface SpiritualityInterpretation {
  overview: string
  practices: string[]
  evolution: string
  divineConnection: string
}

export interface DashaInterpretation {
  overview: string
  current: DashaPeriod
  upcoming: DashaPeriod[]
  timing: string
}

export interface RemediesInterpretation {
  overview: string
  mantras: string[]
  gemstones: string[]
  practices: string[]
}

export interface Interpretations {
  personality: PersonalityInterpretation
  lifePurpose: LifePurposeInterpretation
  relationships: RelationshipsInterpretation
  career: CareerInterpretation
  health: HealthInterpretation
  spirituality: SpiritualityInterpretation
  dasha: DashaInterpretation
  remedies: RemediesInterpretation
}

export interface ProfileMetadata {
  source: string
  version: string
  generatedAt: string
  calculationTime: number
  systemsUsed: string[]
  interpretationType: string
  confidenceScore?: number
}

export interface ComprehensiveMysticalProfile {
  vedic: VedicData
  interpretations: Interpretations
  metadata: ProfileMetadata
  userId?: string
  lastUpdated?: number
  birthDate?: string
  birthPlace?: string
  birthTime?: string
}

export type DivinationSystem =
  | 'vedic'
  | 'western'
  | 'numerology'
  | 'tarot'
  | 'iching'
  | 'runes'
  | 'lenormand'
  | 'bazi'
  | 'kp'
  | 'palmistry'
  | 'faceReading'
  | 'geomancy'
  | 'pendulum'
  | 'dreamSymbols'
  | 'nameAnalysis'
  | 'angelNumbers'
  | 'vastu'
  | 'markov_bayesian'
