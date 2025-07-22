// Comprehensive Numerology Calculation Engine
// This provides all calculations needed for a self-reliant numerology system

interface NumerologyProfile {
  lifePathNumber: number
  destinyNumber: number
  soulNumber: number
  personalityNumber: number
  birthDayNumber: number
  maturityNumber: number
  personalYearNumber: number
  personalMonthNumber: number
  personalDayNumber: number
  karmicDebts: number[]
  masterNumbers: number[]
  pinnacles: number[]
  challenges: number[]
  letters: { [key: string]: number }
  insights: {
    lifePurpose: string
    strengths: string[]
    challenges: string[]
    opportunities: string[]
    compatibility: string[]
    careerPaths: string[]
    personalGrowth: string[]
  }
  metadata: {
    source: 'internal_calculations'
    version: string
    accuracy: string
    timestamp: number
  }
}

// Numerology letter values
const LETTER_VALUES: { [key: string]: number } = {
  'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8, 'I': 9,
  'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'O': 6, 'P': 7, 'Q': 8, 'R': 9,
  'S': 1, 'T': 2, 'U': 3, 'V': 4, 'W': 5, 'X': 6, 'Y': 7, 'Z': 8
}

// Master numbers (11, 22, 33)
const MASTER_NUMBERS = [11, 22, 33]

// Karmic debt numbers
const KARMIC_DEBTS = [13, 14, 16, 19]

// Life Path Number meanings
const LIFE_PATH_MEANINGS: { [key: number]: string } = {
  1: 'The Pioneer - Leadership, independence, innovation',
  2: 'The Mediator - Cooperation, diplomacy, sensitivity',
  3: 'The Communicator - Creativity, expression, joy',
  4: 'The Builder - Stability, organization, hard work',
  5: 'The Adventurer - Freedom, change, experience',
  6: 'The Nurturer - Responsibility, harmony, service',
  7: 'The Seeker - Analysis, spirituality, wisdom',
  8: 'The Achiever - Power, material success, authority',
  9: 'The Humanitarian - Compassion, idealism, completion',
  11: 'The Intuitive - Spiritual insight, inspiration, illumination',
  22: 'The Master Builder - Practical vision, large-scale achievement',
  33: 'The Master Teacher - Universal love, healing, guidance'
}

// Destiny Number meanings
const DESTINY_MEANINGS: { [key: number]: string } = {
  1: 'Natural leader with strong willpower and determination',
  2: 'Diplomatic peacemaker with intuitive understanding',
  3: 'Creative communicator with artistic talents',
  4: 'Practical organizer with strong work ethic',
  5: 'Versatile explorer with adaptability and freedom',
  6: 'Responsible caregiver with nurturing qualities',
  7: 'Analytical thinker with spiritual depth',
  8: 'Ambitious achiever with material success',
  9: 'Compassionate humanitarian with universal love',
  11: 'Intuitive visionary with spiritual gifts',
  22: 'Master builder with practical wisdom',
  33: 'Master teacher with healing abilities'
}

// Calculate single digit or master number
function reduceToSingleDigit(num: number): number {
  if (MASTER_NUMBERS.includes(num)) return num
  if (num < 10) return num
  return reduceToSingleDigit(num.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0))
}

// Calculate Life Path Number from birth date
function calculateLifePathNumber(birthDate: string): number {
  const date = new Date(birthDate)
  const day = date.getDate()
  const month = date.getMonth() + 1
  const year = date.getFullYear()
  
  const daySum = reduceToSingleDigit(day)
  const monthSum = reduceToSingleDigit(month)
  const yearSum = reduceToSingleDigit(year)
  
  const total = daySum + monthSum + yearSum
  return reduceToSingleDigit(total)
}

// Calculate Destiny Number from full name
function calculateDestinyNumber(fullName: string): number {
  const nameArray = fullName.toUpperCase().replace(/\s+/g, '').split('')
  const sum = nameArray.reduce((total, letter) => {
    return total + (LETTER_VALUES[letter] || 0)
  }, 0)
  
  return reduceToSingleDigit(sum)
}

// Calculate Soul Number from vowels in name
function calculateSoulNumber(fullName: string): number {
  const vowels = ['A', 'E', 'I', 'O', 'U']
  const nameArray = fullName.toUpperCase().split('')
  const vowelLetters = nameArray.filter(letter => vowels.includes(letter))
  
  const sum = vowelLetters.reduce((total, letter) => {
    return total + (LETTER_VALUES[letter] || 0)
  }, 0)
  
  return reduceToSingleDigit(sum)
}

// Calculate Personality Number from consonants in name
function calculatePersonalityNumber(fullName: string): number {
  const vowels = ['A', 'E', 'I', 'O', 'U']
  const nameArray = fullName.toUpperCase().split('')
  const consonantLetters = nameArray.filter(letter => !vowels.includes(letter) && LETTER_VALUES[letter])
  
  const sum = consonantLetters.reduce((total, letter) => {
    return total + (LETTER_VALUES[letter] || 0)
  }, 0)
  
  return reduceToSingleDigit(sum)
}

// Calculate Birth Day Number
function calculateBirthDayNumber(birthDate: string): number {
  const date = new Date(birthDate)
  return reduceToSingleDigit(date.getDate())
}

// Calculate Maturity Number
function calculateMaturityNumber(lifePathNumber: number, destinyNumber: number): number {
  return reduceToSingleDigit(lifePathNumber + destinyNumber)
}

// Calculate Personal Year Number
function calculatePersonalYearNumber(birthDate: string, targetYear?: number): number {
  const date = new Date(birthDate)
  const birthDay = date.getDate()
  const birthMonth = date.getMonth() + 1
  const currentYear = targetYear || new Date().getFullYear()
  
  const daySum = reduceToSingleDigit(birthDay)
  const monthSum = reduceToSingleDigit(birthMonth)
  const yearSum = reduceToSingleDigit(currentYear)
  
  return reduceToSingleDigit(daySum + monthSum + yearSum)
}

// Calculate Personal Month Number
function calculatePersonalMonthNumber(personalYearNumber: number, targetMonth?: number): number {
  const currentMonth = targetMonth || new Date().getMonth() + 1
  return reduceToSingleDigit(personalYearNumber + currentMonth)
}

// Calculate Personal Day Number
function calculatePersonalDayNumber(personalMonthNumber: number, targetDay?: number): number {
  const currentDay = targetDay || new Date().getDate()
  return reduceToSingleDigit(personalMonthNumber + currentDay)
}

// Find Karmic Debts in name
function findKarmicDebts(fullName: string): number[] {
  const nameArray = fullName.toUpperCase().replace(/\s+/g, '').split('')
  const letterCounts: { [key: string]: number } = {}
  
  nameArray.forEach(letter => {
    letterCounts[letter] = (letterCounts[letter] || 0) + 1
  })
  
  const karmicDebts: number[] = []
  Object.entries(letterCounts).forEach(([letter, count]) => {
    if (KARMIC_DEBTS.includes(count)) {
      karmicDebts.push(count)
    }
  })
  
  return [...new Set(karmicDebts)]
}

// Find Master Numbers in calculations
function findMasterNumbers(...numbers: number[]): number[] {
  return numbers.filter(num => MASTER_NUMBERS.includes(num))
}

// Calculate Pinnacles
function calculatePinnacles(birthDate: string): number[] {
  const date = new Date(birthDate)
  const day = date.getDate()
  const month = date.getMonth() + 1
  const year = date.getFullYear()
  
  const firstPinnacle = reduceToSingleDigit(day + month)
  const secondPinnacle = reduceToSingleDigit(day + year)
  const thirdPinnacle = reduceToSingleDigit(firstPinnacle + secondPinnacle)
  const fourthPinnacle = reduceToSingleDigit(month + year)
  
  return [firstPinnacle, secondPinnacle, thirdPinnacle, fourthPinnacle]
}

// Calculate Challenges
function calculateChallenges(birthDate: string): number[] {
  const date = new Date(birthDate)
  const day = date.getDate()
  const month = date.getMonth() + 1
  const year = date.getFullYear()
  
  const firstChallenge = Math.abs(reduceToSingleDigit(day) - reduceToSingleDigit(month))
  const secondChallenge = Math.abs(reduceToSingleDigit(day) - reduceToSingleDigit(year))
  const thirdChallenge = Math.abs(firstChallenge - secondChallenge)
  const fourthChallenge = Math.abs(reduceToSingleDigit(month) - reduceToSingleDigit(year))
  
  return [firstChallenge, secondChallenge, thirdChallenge, fourthChallenge]
}

// Generate insights based on numerology profile
function generateInsights(profile: NumerologyProfile): NumerologyProfile['insights'] {
  const lifePath = profile.lifePathNumber
  const destiny = profile.destinyNumber
  const soul = profile.soulNumber
  
  const insights = {
    lifePurpose: LIFE_PATH_MEANINGS[lifePath] || 'Personal growth and self-discovery',
    strengths: [] as string[],
    challenges: [] as string[],
    opportunities: [] as string[],
    compatibility: [] as string[],
    careerPaths: [] as string[],
    personalGrowth: [] as string[]
  }
  
  // Strengths based on numbers
  if (lifePath === 1 || destiny === 1) insights.strengths.push('Leadership and independence')
  if (lifePath === 2 || destiny === 2) insights.strengths.push('Diplomacy and cooperation')
  if (lifePath === 3 || destiny === 3) insights.strengths.push('Creativity and communication')
  if (lifePath === 4 || destiny === 4) insights.strengths.push('Organization and reliability')
  if (lifePath === 5 || destiny === 5) insights.strengths.push('Adaptability and freedom')
  if (lifePath === 6 || destiny === 6) insights.strengths.push('Nurturing and responsibility')
  if (lifePath === 7 || destiny === 7) insights.strengths.push('Analysis and spirituality')
  if (lifePath === 8 || destiny === 8) insights.strengths.push('Achievement and authority')
  if (lifePath === 9 || destiny === 9) insights.strengths.push('Compassion and idealism')
  if (MASTER_NUMBERS.includes(lifePath) || MASTER_NUMBERS.includes(destiny)) {
    insights.strengths.push('Spiritual insight and higher purpose')
  }
  
  // Challenges based on karmic debts
  if (profile.karmicDebts.includes(13)) insights.challenges.push('Overcoming laziness and procrastination')
  if (profile.karmicDebts.includes(14)) insights.challenges.push('Managing freedom and responsibility')
  if (profile.karmicDebts.includes(16)) insights.challenges.push('Balancing ego and humility')
  if (profile.karmicDebts.includes(19)) insights.challenges.push('Developing self-confidence and independence')
  
  // Career paths
  if (lifePath === 1) insights.careerPaths.push('Entrepreneur, Executive, Leader')
  if (lifePath === 2) insights.careerPaths.push('Mediator, Counselor, Diplomat')
  if (lifePath === 3) insights.careerPaths.push('Artist, Writer, Communicator')
  if (lifePath === 4) insights.careerPaths.push('Manager, Engineer, Administrator')
  if (lifePath === 5) insights.careerPaths.push('Traveler, Salesperson, Adventurer')
  if (lifePath === 6) insights.careerPaths.push('Teacher, Healer, Caregiver')
  if (lifePath === 7) insights.careerPaths.push('Researcher, Analyst, Spiritual Guide')
  if (lifePath === 8) insights.careerPaths.push('Business Owner, Executive, Financier')
  if (lifePath === 9) insights.careerPaths.push('Humanitarian, Counselor, Artist')
  
  // Compatibility
  const compatibleNumbers = {
    1: [1, 5, 7],
    2: [2, 4, 8],
    3: [3, 6, 9],
    4: [2, 4, 8],
    5: [1, 5, 7],
    6: [3, 6, 9],
    7: [1, 5, 7],
    8: [2, 4, 8],
    9: [3, 6, 9]
  }
  
  const compatible = compatibleNumbers[lifePath as keyof typeof compatibleNumbers] || []
  insights.compatibility = compatible.map(num => `Life Path ${num}`)
  
  // Personal growth
  insights.personalGrowth.push('Embrace your life path purpose')
  insights.personalGrowth.push('Develop your natural strengths')
  insights.personalGrowth.push('Work through karmic lessons')
  insights.personalGrowth.push('Balance your soul and personality numbers')
  
  return insights
}

// Main function to generate complete numerology profile
export function generateNumerologyProfile(
  fullName: string,
  birthDate: string,
  targetYear?: number
): NumerologyProfile {
  try {
    console.log('Generating comprehensive numerology profile')
    
    // Validate input
    if (!fullName || !birthDate) {
      throw new Error('Full name and birth date are required')
    }
    
    // Calculate all core numbers
    const lifePathNumber = calculateLifePathNumber(birthDate)
    const destinyNumber = calculateDestinyNumber(fullName)
    const soulNumber = calculateSoulNumber(fullName)
    const personalityNumber = calculatePersonalityNumber(fullName)
    const birthDayNumber = calculateBirthDayNumber(birthDate)
    const maturityNumber = calculateMaturityNumber(lifePathNumber, destinyNumber)
    const personalYearNumber = calculatePersonalYearNumber(birthDate, targetYear)
    const personalMonthNumber = calculatePersonalMonthNumber(personalYearNumber)
    const personalDayNumber = calculatePersonalDayNumber(personalMonthNumber)
    
    // Calculate additional numbers
    const karmicDebts = findKarmicDebts(fullName)
    const masterNumbers = findMasterNumbers(lifePathNumber, destinyNumber, soulNumber, personalityNumber)
    const pinnacles = calculatePinnacles(birthDate)
    const challenges = calculateChallenges(birthDate)
    
    // Create letter analysis
    const letters: { [key: string]: number } = {}
    fullName.toUpperCase().split('').forEach(letter => {
      if (LETTER_VALUES[letter]) {
        letters[letter] = LETTER_VALUES[letter]
      }
    })
    
    // Create profile
    const profile: NumerologyProfile = {
      lifePathNumber,
      destinyNumber,
      soulNumber,
      personalityNumber,
      birthDayNumber,
      maturityNumber,
      personalYearNumber,
      personalMonthNumber,
      personalDayNumber,
      karmicDebts,
      masterNumbers,
      pinnacles,
      challenges,
      letters,
      insights: {
        lifePurpose: '',
        strengths: [],
        challenges: [],
        opportunities: [],
        compatibility: [],
        careerPaths: [],
        personalGrowth: []
      },
      metadata: {
        source: 'internal_calculations',
        version: '1.0',
        accuracy: 'high',
        timestamp: Date.now()
      }
    }
    
    // Generate insights
    profile.insights = generateInsights(profile)
    
    console.log('Successfully generated numerology profile')
    return profile
    
  } catch (error) {
    console.error('Error generating numerology profile:', error)
    throw new Error(`Failed to generate numerology profile: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Validate numerology input data
export function validateNumerologyData(fullName: string, birthDate: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!fullName || fullName.trim().length === 0) {
    errors.push('Full name is required')
  }
  
  if (!birthDate) {
    errors.push('Birth date is required')
  } else {
    const date = new Date(birthDate)
    if (isNaN(date.getTime())) {
      errors.push('Invalid birth date format')
    }
    if (date > new Date()) {
      errors.push('Birth date cannot be in the future')
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Get number meanings for display
export function getNumberMeaning(number: number, type: 'lifePath' | 'destiny' | 'soul' | 'personality'): string {
  switch (type) {
    case 'lifePath':
      return LIFE_PATH_MEANINGS[number] || 'Personal growth and development'
    case 'destiny':
      return DESTINY_MEANINGS[number] || 'Natural talents and abilities'
    default:
      return 'Significant influence in your life'
  }
} 