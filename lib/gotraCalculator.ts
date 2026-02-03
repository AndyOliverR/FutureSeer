// Gotra Identification Calculator
// Uses Nakshatra-based method from Kalaprakashika and surname validation

import { 
  NAKSHATRA_GOTRA_MAP, 
  SURNAME_GOTRA_MAP, 
  SAPTARISHI_GOTRAS,
  ALL_GOTRAS,
  DEFAULT_GOTRA,
  getGotraInfo,
  getPossibleGotrasFromSurname
} from './gotraData'

export interface GotraResult {
  primaryGotra: string
  confidence: 'high' | 'medium' | 'low'
  method: 'nakshatra' | 'surname' | 'default'
  moonNakshatra: string
  alternativeGotras: string[]
  sage: string
  sanskritName: string
  description: string
  characteristics: string[]
  ritualUse: string
  marriageGuidance: string
  spiritualQualities: string[]
  mantra?: string
  deity?: string
}

/**
 * Identify Gotra from Moon Nakshatra (primary) and surname (secondary)
 * @param moonNakshatra - Janma Nakshatra (birth star) from Moon position
 * @param surname - Optional surname for validation/alternatives
 * @returns Complete Gotra identification result
 */
export function identifyGotra(
  moonNakshatra: string,
  surname?: string
): GotraResult {
  // Normalize nakshatra name (trim, title case)
  const normalizedNakshatra = moonNakshatra?.trim() || 'Unknown'
  
  // Primary: Nakshatra-based identification (most reliable per Kalaprakashika)
  const gotraFromNakshatra = NAKSHATRA_GOTRA_MAP[normalizedNakshatra]
  
  // Secondary: Surname-based alternatives
  const gotrasFromSurname = surname 
    ? getPossibleGotrasFromSurname(surname.trim())
    : []
  
  // Determine primary Gotra
  let primaryGotra = gotraFromNakshatra || DEFAULT_GOTRA
  let confidence: 'high' | 'medium' | 'low' = gotraFromNakshatra ? 'high' : 'low'
  let method: 'nakshatra' | 'surname' | 'default' = gotraFromNakshatra ? 'nakshatra' : 'default'
  
  // If surname suggests a different Gotra, mark as medium confidence
  if (gotraFromNakshatra && gotrasFromSurname.length > 0) {
    const surnameMatchesNakshatra = gotrasFromSurname.includes(gotraFromNakshatra)
    if (!surnameMatchesNakshatra) {
      confidence = 'medium'
    }
  }
  
  // Get full Gotra information
  const gotraInfo = getGotraInfo(primaryGotra)
  
  // Construct result
  return {
    primaryGotra,
    confidence,
    method,
    moonNakshatra: normalizedNakshatra,
    alternativeGotras: gotrasFromSurname.filter(g => g !== primaryGotra),
    sage: gotraInfo?.sage || 'Unknown Sage',
    sanskritName: gotraInfo?.sanskritName || primaryGotra,
    description: gotraInfo?.meaning || 'Traditional Vedic lineage',
    characteristics: gotraInfo?.characteristics || [],
    ritualUse: gotraInfo?.ritualSignificance || `This Gotra is used in Sankalpa (ritual declaration) as "${primaryGotra} Gotraha"`,
    marriageGuidance: `According to Vedic tradition, marriage within the same ${primaryGotra} Gotra is generally avoided to maintain genetic diversity and respect ancestral lineages.`,
    spiritualQualities: gotraInfo?.spiritualQualities || [],
    mantra: gotraInfo?.mantra,
    deity: gotraInfo?.deity
  }
}

/**
 * Check if given sidereal longitude falls in Abhijit Nakshatra
 * Abhijit is the intercalary 28th Nakshatra between Uttara Ashadha and Shravana
 * @param moonLongitude - Sidereal longitude of Moon in degrees (0-360)
 * @returns true if Moon is in Abhijit Nakshatra
 */
export function isAbhijitNakshatra(moonLongitude: number): boolean {
  // Abhijit spans from the last pada of Uttara Ashadha to first pada of Shravana
  // Uttara Ashadha ends at 280° (26°40' Capricorn)
  // Shravana starts at 280° (0° Aquarius)
  // Abhijit occupies approximately 276.67° to 280° (4°13'20")
  
  // However, Abhijit is often not used in standard 27-nakshatra system
  // When needed, it's between 276°40' to 280°
  const abhijitStart = 276.67  // 26°40' Capricorn
  const abhijitEnd = 280       // 0° Aquarius
  
  return moonLongitude >= abhijitStart && moonLongitude < abhijitEnd
}

/**
 * Get Nakshatra name from Abhijit-aware calculation
 * @param moonLongitude - Sidereal longitude of Moon
 * @param standardNakshatra - Nakshatra from standard 27-nakshatra system
 * @returns Adjusted nakshatra name (Abhijit if applicable)
 */
export function getAbhijitAdjustedNakshatra(
  moonLongitude: number,
  standardNakshatra: string
): string {
  if (isAbhijitNakshatra(moonLongitude)) {
    return 'Abhijit'
  }
  return standardNakshatra
}

/**
 * Validate if a surname matches the Nakshatra-derived Gotra
 * @param gotraFromNakshatra - Gotra identified from Nakshatra
 * @param surname - User's surname
 * @returns Validation result with match status
 */
export function validateGotraWithSurname(
  gotraFromNakshatra: string,
  surname: string
): {
  matches: boolean
  possibleGotras: string[]
  recommendation: string
} {
  const possibleGotras = getPossibleGotrasFromSurname(surname)
  const matches = possibleGotras.includes(gotraFromNakshatra)
  
  let recommendation = ''
  if (matches) {
    recommendation = `Your surname ${surname} confirms the Nakshatra-derived ${gotraFromNakshatra} Gotra.`
  } else if (possibleGotras.length > 0) {
    recommendation = `Your surname ${surname} is traditionally associated with ${possibleGotras.join(', ')} Gotra(s), but your Moon Nakshatra indicates ${gotraFromNakshatra}. Family tradition may vary.`
  } else {
    recommendation = `Your surname ${surname} is not in our database. The Nakshatra-based ${gotraFromNakshatra} Gotra is most reliable.`
  }
  
  return {
    matches,
    possibleGotras,
    recommendation
  }
}

/**
 * Get ritual Sankalpa format for Gotra
 * @param gotraName - Name of the Gotra
 * @returns Formatted Sanskrit declaration
 */
export function getSankalpaFormat(gotraName: string): string {
  return `${gotraName} Gotraha`
}

/**
 * Get marriage compatibility advice based on partner's Gotra
 * @param userGotra - User's Gotra
 * @param partnerGotra - Partner's Gotra
 * @returns Compatibility assessment
 */
export function checkMarriageCompatibility(
  userGotra: string,
  partnerGotra: string
): {
  compatible: boolean
  reason: string
  severity: 'acceptable' | 'caution' | 'avoid'
} {
  // Same Gotra - traditionally not compatible
  if (userGotra === partnerGotra) {
    return {
      compatible: false,
      reason: 'Same Gotra marriage is traditionally avoided in Vedic culture to maintain genetic diversity and honor lineage separation.',
      severity: 'avoid'
    }
  }
  
  // Check related Gotras (some Gotras are considered related)
  const userGotraInfo = getGotraInfo(userGotra)
  const relatedGotras = userGotraInfo?.marriageCompatibility?.relatedGotras || []
  
  if (relatedGotras.includes(partnerGotra)) {
    return {
      compatible: false,
      reason: `${userGotra} and ${partnerGotra} are considered related lineages and marriage between them requires careful consideration.`,
      severity: 'caution'
    }
  }
  
  // Different Gotras - compatible
  return {
    compatible: true,
    reason: `${userGotra} and ${partnerGotra} are different lineages, which is traditionally considered appropriate for marriage.`,
    severity: 'acceptable'
  }
}
