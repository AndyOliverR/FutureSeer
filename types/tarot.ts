import { TarotCard } from '@/lib/tarotIntelligence'

// User Profile Type
export interface UserProfile {
  uid: string
  email: string | null
  displayName: string | null
  fullName?: string | null
  birthDate?: string | null
  birthTime?: string | null
  birthPlace?: string | null
  photoURL?: string | null
}

// Spread Type
export interface SpreadType {
  name: string
  description: string
  cardCount: number
  positions: string[]
}

// Combined System Data Types
export interface NumerologyData {
  lifePathNumber: number
  destinyNumber: number
  soulNumber: number
  personalityNumber: number
  personalYearNumber?: number
  birthdayNumber?: number
}

export interface WesternAstrologyData {
  sunSign?: string
  moonSign?: string
  risingSign?: string
  dominantElement?: string
  dominantModality?: string
  chartRuler?: string
}

export interface TarotProfileData {
  birthCard: TarotCard | null
  lifePathCard: TarotCard | null
  soulCard: TarotCard | null
  personalityCard: TarotCard | null
}

export interface TarotNumerologyLink {
  tarotCard: string
  numerologyNumber: number
  connection: string
}

export interface CrossReferences {
  tarotNumerologyLinks?: TarotNumerologyLink[]
  timingInsights?: string
  elementalSynergies?: string[]
}

export interface HolisticAnalysis {
  overview?: string
  integration?: string
  timing?: string
  guidance?: string
}

export interface CombinedSystemData {
  tarotProfile: TarotProfileData
  numerology: NumerologyData
  westernAstrology?: WesternAstrologyData
  holisticAnalysis?: HolisticAnalysis
  crossReferences?: CrossReferences
  recommendations?: string[]
  cacheTimestamp?: string
}

// Component Props Types
export interface ProfileCardsData {
  birthCard: TarotCard | null
  lifePathCard: TarotCard | null
  soulCard: TarotCard | null
  personalityCard: TarotCard | null
}
