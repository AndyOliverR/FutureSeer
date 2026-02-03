// Generic Compatibility Calculator
// Fallback for tools without specific compatibility logic

import { CompatibilityReport, AdditionalProfile } from '@/lib/types/profileTypes'
import { UserProfile } from '@/lib/firebase'

export function calculateGenericCompatibility(
  toolSlug: string,
  userProfile: UserProfile,
  additionalProfile: AdditionalProfile
): CompatibilityReport {
  const userName = userProfile.fullName || userProfile.displayName || ''
  const userBirthDate = userProfile.birthDate || ''

  // Basic compatibility based on birth dates
  const userDOB = new Date(userBirthDate)
  const addDOB = new Date(additionalProfile.dateOfBirth)

  if (isNaN(userDOB.getTime()) || isNaN(addDOB.getTime())) {
    return {
      toolSlug,
      userProfile: {
        name: userName,
        dateOfBirth: userBirthDate
      },
      additionalProfile,
      compatibilityScore: 0,
      overallAssessment: 'Poor',
      strengths: [],
      challenges: ['Unable to calculate - birth date information incomplete'],
      recommendations: ['Please ensure both profiles have valid birth dates'],
      detailedAnalysis: {},
      generatedAt: Date.now()
    }
  }

  // Age difference analysis
  const ageDiff = Math.abs(userDOB.getTime() - addDOB.getTime())
  const ageDiffYears = Math.floor(ageDiff / (1000 * 60 * 60 * 24 * 365.25))

  // Basic compatibility score (placeholder - tool-specific calculators should replace this)
  const compatibilityScore = 50

  const strengths: string[] = []
  const challenges: string[] = []

  if (ageDiffYears < 5) {
    strengths.push('Similar age range - likely shared generational experiences')
  } else if (ageDiffYears > 20) {
    challenges.push(`Significant age difference (${ageDiffYears} years) - may have different life perspectives`)
  }

  // Relationship type specific insights
  if (additionalProfile.relationshipType === 'business-partner') {
    strengths.push('Business partnership analysis available')
    challenges.push('Consider professional compatibility factors')
  } else if (additionalProfile.relationshipType === 'spouse') {
    strengths.push('Personal relationship analysis available')
  }

  return {
    toolSlug,
    userProfile: {
      name: userName,
      dateOfBirth: userBirthDate,
      timeOfBirth: userProfile.birthTime,
      birthPlace: userProfile.birthPlace
    },
    additionalProfile,
    compatibilityScore,
    overallAssessment: 'Moderate',
    strengths,
    challenges,
    recommendations: [
      `For detailed ${toolSlug} compatibility analysis, ensure both profiles have complete birth information`,
      'Consider consulting with a specialist for this tool',
      'Use this as a starting point for deeper analysis'
    ],
    detailedAnalysis: {
      ageDifference: ageDiffYears,
      note: 'Generic compatibility calculator - tool-specific analysis recommended'
    },
    generatedAt: Date.now()
  }
}

