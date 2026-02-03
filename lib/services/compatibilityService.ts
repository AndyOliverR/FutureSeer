// Universal Compatibility Service
// Routes compatibility calculations to tool-specific calculators

import { CompatibilityReport, AdditionalProfile } from '@/lib/types/profileTypes'
import { UserProfile } from '@/lib/firebase'
import { calculateNumerologyCompatibility } from '@/lib/compatibility/numerologyCompatibility'
import { calculateGenericCompatibility } from '@/lib/compatibility/genericCompatibility'
import { calculateWesternAstrologyCompatibility } from '@/lib/compatibility/westernAstrologyCompatibility'

export async function calculateCompatibility(
  toolSlug: string,
  userProfile: UserProfile,
  additionalProfile: AdditionalProfile
): Promise<CompatibilityReport> {
  // Route to appropriate calculator based on tool slug
  switch (toolSlug) {
    case 'numerology':
    case 'chaldean-numerology':
      return calculateNumerologyCompatibility(userProfile, additionalProfile)
    
    case 'vedic-astrology':
    case 'kp-astrology':
      // TODO: Implement Vedic compatibility calculator
      return calculateGenericCompatibility(toolSlug, userProfile, additionalProfile)
    
    case 'western-astrology':
      return calculateWesternAstrologyCompatibility(userProfile, additionalProfile)
    
    case 'tarot':
      // TODO: Implement Tarot compatibility calculator
      return calculateGenericCompatibility(toolSlug, userProfile, additionalProfile)
    
    case 'palmistry':
      // TODO: Implement Palmistry compatibility calculator
      return calculateGenericCompatibility(toolSlug, userProfile, additionalProfile)
    
    case 'face-reading':
      // TODO: Implement Face Reading compatibility calculator
      return calculateGenericCompatibility(toolSlug, userProfile, additionalProfile)
    
    default:
      // Fallback to generic calculator for tools without specific logic
      return calculateGenericCompatibility(toolSlug, userProfile, additionalProfile)
  }
}

