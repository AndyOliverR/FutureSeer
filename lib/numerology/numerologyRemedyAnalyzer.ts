// Numerology Remedy Analyzer
// Analyzes numerology profiles and generates personalized remedy recommendations

import { NUMEROLOGY_REMEDIES } from '@/lib/comprehensiveRemedyDatabase'
import { buildLoShuCounts } from '@/lib/numerology/loShu'

export interface NumerologyProfile {
  lifePathNumber?: number
  expressionNumber?: number
  destinyNumber?: number
  soulUrgeNumber?: number
  soulNumber?: number
  personalityNumber?: number
  birthdayNumber?: number
  maturityNumber?: number
  personalYearNumber?: number
  karmicDebts?: number[]
  masterNumbers?: number[]
  birthDate?: string
}

export interface NumerologyRemedy {
  id: string
  category: 'missing-number' | 'life-path' | 'expression' | 'soul-urge' | 'personality' | 'karmic-debt' | 'master-number' | 'personal-year'
  title: string
  description: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  instructions: string[]
  benefits: string[]
  gemstones?: string[]
  colors?: string[]
  daysOfWeek?: string[]
  mantras?: string[]
  number?: number
}

export interface RemedyAnalysis {
  remedies: NumerologyRemedy[]
  summary: {
    totalRemedies: number
    criticalCount: number
    highCount: number
    mediumCount: number
    lowCount: number
    categories: string[]
  }
}

// Calculate missing numbers from birth date
function getMissingNumbers(birthDate?: string): number[] {
  if (!birthDate) return []
  const { missing } = buildLoShuCounts(birthDate)
  return missing.filter(n => n >= 1 && n <= 9)
}

// Check if a number is a karmic debt (13, 14, 16, 19)
function isKarmicDebt(number: number): boolean {
  return [13, 14, 16, 19].includes(number)
}

// Check if a number is a master number (11, 22)
function isMasterNumber(number: number): boolean {
  return [11, 22].includes(number)
}

// Extract karmic debt numbers from profile
function getKarmicDebtNumbers(profile: NumerologyProfile): number[] {
  const debts: number[] = []
  
  // Check all numbers for karmic debts
  const numbers = [
    profile.lifePathNumber,
    profile.expressionNumber,
    profile.destinyNumber,
    profile.soulUrgeNumber,
    profile.soulNumber,
    profile.personalityNumber,
    profile.birthdayNumber,
    profile.maturityNumber,
    profile.personalYearNumber
  ].filter((n): n is number => n !== undefined && n !== null)
  
  numbers.forEach(num => {
    if (isKarmicDebt(num) && !debts.includes(num)) {
      debts.push(num)
    }
  })
  
  // Also check explicitly provided karmic debts
  if (profile.karmicDebts) {
    profile.karmicDebts.forEach(debt => {
      if (!debts.includes(debt)) {
        debts.push(debt)
      }
    })
  }
  
  return debts
}

// Extract master numbers from profile
function getMasterNumbers(profile: NumerologyProfile): number[] {
  const masters: number[] = []
  
  // Check all numbers for master numbers
  const numbers = [
    profile.lifePathNumber,
    profile.expressionNumber,
    profile.destinyNumber,
    profile.soulUrgeNumber,
    profile.soulNumber,
    profile.personalityNumber,
    profile.maturityNumber
  ].filter((n): n is number => n !== undefined && n !== null)
  
  numbers.forEach(num => {
    if (isMasterNumber(num) && !masters.includes(num)) {
      masters.push(num)
    }
  })
  
  // Also check explicitly provided master numbers
  if (profile.masterNumbers) {
    profile.masterNumbers.forEach(master => {
      if (!masters.includes(master)) {
        masters.push(master)
      }
    })
  }
  
  return masters
}

// Calculate personal year from birth date
function calculatePersonalYear(birthDate?: string, targetYear?: number): number {
  if (!birthDate) return 0
  
  const birth = new Date(birthDate)
  const year = targetYear || new Date().getFullYear()
  const month = birth.getMonth() + 1
  const day = birth.getDate()
  
  const currentYearSum = year.toString().split('').reduce((sum, digit) => sum + parseInt(digit, 10), 0)
  const personalYear = currentYearSum + month + day
  
  // Reduce to single digit, preserving master numbers
  if (personalYear === 11 || personalYear === 22) return personalYear
  return personalYear > 9 ? personalYear.toString().split('').reduce((sum, digit) => sum + parseInt(digit, 10), 0) : personalYear
}

// Get missing number remedies
function getMissingNumberRemedies(missingNumbers: number[]): NumerologyRemedy[] {
  const remedies: NumerologyRemedy[] = []
  
  missingNumbers.forEach(num => {
    const remedyData = NUMEROLOGY_REMEDIES.chaldean.missingNumbers[num as keyof typeof NUMEROLOGY_REMEDIES.chaldean.missingNumbers]
    if (remedyData) {
      remedies.push({
        id: `missing-number-${num}`,
        category: 'missing-number',
        number: num,
        title: remedyData.title,
        description: remedyData.description,
        priority: 'critical',
        instructions: remedyData.instructions || [],
        benefits: remedyData.benefits || [],
        gemstones: remedyData.gemstones,
        colors: remedyData.colors,
        daysOfWeek: remedyData.daysOfWeek,
        mantras: remedyData.mantras
      })
    }
  })
  
  return remedies
}

// Get life path remedies
function getLifePathRemedies(lifePathNumber?: number): NumerologyRemedy[] {
  if (!lifePathNumber) return []
  
  const remedyData = NUMEROLOGY_REMEDIES.chaldean.lifePathRemedies[lifePathNumber as keyof typeof NUMEROLOGY_REMEDIES.chaldean.lifePathRemedies]
  if (!remedyData) return []
  
  return [{
    id: `life-path-${lifePathNumber}`,
    category: 'life-path',
    number: lifePathNumber,
    title: remedyData.title,
    description: remedyData.description,
    priority: 'high',
    instructions: remedyData.instructions || [],
    benefits: remedyData.benefits || [],
    gemstones: remedyData.gemstones,
    colors: remedyData.colors,
    daysOfWeek: remedyData.daysOfWeek,
    mantras: remedyData.mantras
  }]
}

// Get expression number remedies
function getExpressionNumberRemedies(expressionNumber?: number): NumerologyRemedy[] {
  if (!expressionNumber) return []
  
  const remedyData = NUMEROLOGY_REMEDIES.chaldean.expressionRemedies?.[expressionNumber as keyof typeof NUMEROLOGY_REMEDIES.chaldean.expressionRemedies]
  if (!remedyData) return []
  
  return [{
    id: `expression-${expressionNumber}`,
    category: 'expression',
    number: expressionNumber,
    title: remedyData.title,
    description: remedyData.description,
    priority: 'medium',
    instructions: remedyData.instructions || [],
    benefits: remedyData.benefits || [],
    gemstones: remedyData.gemstones,
    colors: remedyData.colors,
    daysOfWeek: remedyData.daysOfWeek
  }]
}

// Get soul urge remedies
function getSoulUrgeRemedies(soulUrgeNumber?: number): NumerologyRemedy[] {
  if (!soulUrgeNumber) return []
  
  const remedyData = NUMEROLOGY_REMEDIES.chaldean.soulUrgeRemedies?.[soulUrgeNumber as keyof typeof NUMEROLOGY_REMEDIES.chaldean.soulUrgeRemedies]
  if (!remedyData) return []
  
  return [{
    id: `soul-urge-${soulUrgeNumber}`,
    category: 'soul-urge',
    number: soulUrgeNumber,
    title: remedyData.title,
    description: remedyData.description,
    priority: 'medium',
    instructions: remedyData.instructions || [],
    benefits: remedyData.benefits || [],
    gemstones: remedyData.gemstones,
    colors: remedyData.colors
  }]
}

// Get personality remedies
function getPersonalityRemedies(personalityNumber?: number): NumerologyRemedy[] {
  if (!personalityNumber) return []
  
  const remedyData = NUMEROLOGY_REMEDIES.chaldean.personalityRemedies?.[personalityNumber as keyof typeof NUMEROLOGY_REMEDIES.chaldean.personalityRemedies]
  if (!remedyData) return []
  
  return [{
    id: `personality-${personalityNumber}`,
    category: 'personality',
    number: personalityNumber,
    title: remedyData.title,
    description: remedyData.description,
    priority: 'low',
    instructions: remedyData.instructions || [],
    benefits: remedyData.benefits || [],
    gemstones: remedyData.gemstones,
    colors: remedyData.colors
  }]
}

// Get karmic debt remedies
function getKarmicDebtRemedies(karmicDebtNumbers: number[]): NumerologyRemedy[] {
  const remedies: NumerologyRemedy[] = []
  
  karmicDebtNumbers.forEach(debt => {
    const remedyData = NUMEROLOGY_REMEDIES.chaldean.karmicDebtRemedies?.[debt as keyof typeof NUMEROLOGY_REMEDIES.chaldean.karmicDebtRemedies]
    if (remedyData) {
      remedies.push({
        id: `karmic-debt-${debt}`,
        category: 'karmic-debt',
        number: debt,
        title: remedyData.title,
        description: remedyData.description,
        priority: 'high',
        instructions: remedyData.instructions || [],
        benefits: remedyData.benefits || [],
        gemstones: remedyData.gemstones,
        colors: remedyData.colors,
        mantras: remedyData.mantras
      })
    }
  })
  
  return remedies
}

// Get master number remedies
function getMasterNumberRemedies(masterNumbers: number[]): NumerologyRemedy[] {
  const remedies: NumerologyRemedy[] = []
  
  masterNumbers.forEach(master => {
    const remedyData = NUMEROLOGY_REMEDIES.chaldean.masterNumberRemedies?.[master as keyof typeof NUMEROLOGY_REMEDIES.chaldean.masterNumberRemedies]
    if (remedyData) {
      remedies.push({
        id: `master-number-${master}`,
        category: 'master-number',
        number: master,
        title: remedyData.title,
        description: remedyData.description,
        priority: 'high',
        instructions: remedyData.instructions || [],
        benefits: remedyData.benefits || [],
        gemstones: remedyData.gemstones,
        colors: remedyData.colors,
        daysOfWeek: remedyData.daysOfWeek,
        mantras: remedyData.mantras
      })
    }
  })
  
  return remedies
}

// Get personal year remedies
function getPersonalYearRemedies(personalYear?: number): NumerologyRemedy[] {
  if (!personalYear) return []
  
  const remedyData = NUMEROLOGY_REMEDIES.chaldean.personalYearRemedies?.[personalYear as keyof typeof NUMEROLOGY_REMEDIES.chaldean.personalYearRemedies]
  if (!remedyData) return []
  
  return [{
    id: `personal-year-${personalYear}`,
    category: 'personal-year',
    number: personalYear,
    title: remedyData.title,
    description: remedyData.description,
    priority: 'medium',
    instructions: remedyData.instructions || [],
    benefits: remedyData.benefits || [],
    gemstones: remedyData.gemstones,
    colors: remedyData.colors
  }]
}

// Main analyzer function
export function analyzeNumerologyProfile(
  profile: NumerologyProfile,
  targetYear?: number
): RemedyAnalysis {
  const remedies: NumerologyRemedy[] = []
  
  // 1. Missing numbers (highest priority)
  const missingNumbers = getMissingNumbers(profile.birthDate)
  remedies.push(...getMissingNumberRemedies(missingNumbers))
  
  // 2. Karmic debts (high priority)
  const karmicDebts = getKarmicDebtNumbers(profile)
  remedies.push(...getKarmicDebtRemedies(karmicDebts))
  
  // 3. Master numbers (high priority)
  const masterNumbers = getMasterNumbers(profile)
  remedies.push(...getMasterNumberRemedies(masterNumbers))
  
  // 4. Life path (medium-high priority)
  const lifePathNumber = profile.lifePathNumber
  remedies.push(...getLifePathRemedies(lifePathNumber))
  
  // 5. Expression/Destiny (medium priority)
  const expressionNumber = profile.expressionNumber || profile.destinyNumber
  remedies.push(...getExpressionNumberRemedies(expressionNumber))
  
  // 6. Soul Urge (medium priority)
  const soulUrgeNumber = profile.soulUrgeNumber || profile.soulNumber
  remedies.push(...getSoulUrgeRemedies(soulUrgeNumber))
  
  // 7. Personal Year (medium priority)
  const personalYear = profile.personalYearNumber || calculatePersonalYear(profile.birthDate, targetYear)
  remedies.push(...getPersonalYearRemedies(personalYear))
  
  // 8. Personality (low priority)
  const personalityNumber = profile.personalityNumber
  remedies.push(...getPersonalityRemedies(personalityNumber))
  
  // Sort by priority (critical > high > medium > low)
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
  remedies.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
  
  // Count by priority
  const criticalCount = remedies.filter(r => r.priority === 'critical').length
  const highCount = remedies.filter(r => r.priority === 'high').length
  const mediumCount = remedies.filter(r => r.priority === 'medium').length
  const lowCount = remedies.filter(r => r.priority === 'low').length
  
  // Get unique categories
  const categories = [...new Set(remedies.map(r => r.category))]
  
  return {
    remedies,
    summary: {
      totalRemedies: remedies.length,
      criticalCount,
      highCount,
      mediumCount,
      lowCount,
      categories
    }
  }
}

// Helper function to get remedies for a specific category
export function getRemediesByCategory(
  analysis: RemedyAnalysis,
  category: NumerologyRemedy['category']
): NumerologyRemedy[] {
  return analysis.remedies.filter(r => r.category === category)
}

// Helper function to get remedies by priority
export function getRemediesByPriority(
  analysis: RemedyAnalysis,
  priority: NumerologyRemedy['priority']
): NumerologyRemedy[] {
  return analysis.remedies.filter(r => r.priority === priority)
}

