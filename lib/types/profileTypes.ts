// Additional Profile Types for Compatibility Analysis

export type RelationshipType = 
  | 'spouse' 
  | 'child' 
  | 'parent' 
  | 'sibling' 
  | 'business-partner' 
  | 'friend' 
  | 'other'

export interface AdditionalProfile {
  id: string
  userId: string
  name: string
  dateOfBirth: string // ISO date (YYYY-MM-DD)
  timeOfBirth?: string // HH:mm format (24-hour)
  birthPlace?: string
  currentLocation?: string
  relationshipType: RelationshipType
  relationshipNotes?: string
  notes?: string
  createdAt: number
  updatedAt: number
}

export interface CompatibilityReport {
  toolSlug: string
  userProfile: {
    name: string
    dateOfBirth: string
    timeOfBirth?: string
    birthPlace?: string
  }
  additionalProfile: AdditionalProfile
  compatibilityScore: number // 0-100
  overallAssessment: 'Excellent' | 'Good' | 'Moderate' | 'Challenging' | 'Poor'
  strengths: string[]
  challenges: string[]
  businessSuitability?: {
    score: number
    analysis: string
    recommendations: string[]
  }
  personalCompatibility?: {
    score: number
    analysis: string
    recommendations: string[]
  }
  recommendations: string[]
  detailedAnalysis: {
    [key: string]: any // Tool-specific data
  }
  generatedAt: number
}

