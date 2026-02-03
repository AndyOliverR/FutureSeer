// Numerology Compatibility Calculator
// Compares numerology profiles to generate compatibility report

import { CompatibilityReport, AdditionalProfile } from '@/lib/types/profileTypes'
import { UserProfile } from '@/lib/firebase'
import { computeChaldeanProfile } from '@/lib/numerology/chaldean'

export function calculateNumerologyCompatibility(
  userProfile: UserProfile,
  additionalProfile: AdditionalProfile
): CompatibilityReport {
  // Calculate numerology for both profiles
  const userName = userProfile.fullName || userProfile.displayName || ''
  const userBirthDate = userProfile.birthDate || ''
  
  const userNumerology = userName && userBirthDate 
    ? computeChaldeanProfile(userName, userBirthDate)
    : null

  const additionalName = additionalProfile.name
  const additionalBirthDate = additionalProfile.dateOfBirth
  
  const additionalNumerology = computeChaldeanProfile(additionalName, additionalBirthDate)

  if (!userNumerology) {
    return {
      toolSlug: 'numerology',
      userProfile: {
        name: userName,
        dateOfBirth: userBirthDate
      },
      additionalProfile,
      compatibilityScore: 0,
      overallAssessment: 'Poor',
      strengths: [],
      challenges: ['Unable to calculate compatibility - user profile incomplete'],
      recommendations: ['Please complete your profile with name and birth date to generate compatibility analysis'],
      detailedAnalysis: {},
      generatedAt: Date.now()
    }
  }

  // Extract numbers
  const userLP = userNumerology.numbers.lifePath
  const userDestiny = userNumerology.numbers.destiny
  const userSoul = userNumerology.numbers.soulUrge
  const userPersonality = userNumerology.numbers.personality

  const addLP = additionalNumerology.numbers.lifePath
  const addDestiny = additionalNumerology.numbers.destiny
  const addSoul = additionalNumerology.numbers.soulUrge
  const addPersonality = additionalNumerology.numbers.personality

  // Calculate compatibility scores for each aspect
  const lifePathScore = calculateNumberCompatibility(userLP, addLP)
  const destinyScore = calculateNumberCompatibility(userDestiny, addDestiny)
  const soulScore = calculateNumberCompatibility(userSoul, addSoul)
  const personalityScore = calculateNumberCompatibility(userPersonality, addPersonality)

  // Weighted overall score
  const compatibilityScore = Math.round(
    (lifePathScore * 0.35) +
    (destinyScore * 0.25) +
    (soulScore * 0.25) +
    (personalityScore * 0.15)
  )

  // Generate insights
  const strengths: string[] = []
  const challenges: string[] = []

  // Life Path compatibility
  if (lifePathScore >= 80) {
    strengths.push(`Strong Life Path alignment (${userLP} & ${addLP}) - Shared life purpose and journey`)
  } else if (lifePathScore >= 60) {
    strengths.push(`Moderate Life Path compatibility (${userLP} & ${addLP}) - Some shared goals`)
  } else {
    challenges.push(`Different Life Path numbers (${userLP} & ${addLP}) - May have different life purposes`)
  }

  // Destiny/Expression compatibility
  if (destinyScore >= 80) {
    strengths.push(`Strong Expression number harmony (${userDestiny} & ${addDestiny}) - Natural talents complement each other`)
  } else if (destinyScore < 50) {
    challenges.push(`Different Expression numbers (${userDestiny} & ${addDestiny}) - May approach goals differently`)
  }

  // Soul Urge compatibility
  if (soulScore >= 80) {
    strengths.push(`Deep Soul connection (${userSoul} & ${addSoul}) - Similar inner desires and motivations`)
  } else if (soulScore < 50) {
    challenges.push(`Different Soul Urge numbers (${userSoul} & ${addSoul}) - May have different core needs`)
  }

  // Personality compatibility
  if (personalityScore >= 70) {
    strengths.push(`Compatible personalities (${userPersonality} & ${addPersonality}) - How others see you aligns`)
  } else if (personalityScore < 50) {
    challenges.push(`Different Personality numbers (${userPersonality} & ${addPersonality}) - May present differently to the world`)
  }

  // Master number compatibility
  const userMaster = [11, 22].includes(userLP) || [11, 22].includes(userDestiny)
  const addMaster = [11, 22].includes(addLP) || [11, 22].includes(addDestiny)
  if (userMaster && addMaster) {
    strengths.push('Both have Master Numbers - Powerful spiritual connection potential')
  }

  // Karmic connections
  const userSum = userLP + userDestiny + userSoul + userPersonality
  const addSum = addLP + addDestiny + addSoul + addPersonality
  if (Math.abs(userSum - addSum) <= 2) {
    strengths.push('Strong numerical resonance - Deep karmic connection possible')
  }

  // Overall assessment
  let overallAssessment: 'Excellent' | 'Good' | 'Moderate' | 'Challenging' | 'Poor'
  if (compatibilityScore >= 80) {
    overallAssessment = 'Excellent'
  } else if (compatibilityScore >= 65) {
    overallAssessment = 'Good'
  } else if (compatibilityScore >= 50) {
    overallAssessment = 'Moderate'
  } else if (compatibilityScore >= 35) {
    overallAssessment = 'Challenging'
  } else {
    overallAssessment = 'Poor'
  }

  // Business suitability
  const businessScore = Math.round((destinyScore * 0.5) + (personalityScore * 0.5))
  const businessSuitability = {
    score: businessScore,
    analysis: businessScore >= 70
      ? 'Strong potential for successful business partnership. Complementary talents and compatible working styles.'
      : businessScore >= 50
      ? 'Moderate business compatibility. May work well together with clear communication and defined roles.'
      : 'Challenging business compatibility. Different approaches may require careful negotiation and compromise.',
    recommendations: businessScore >= 70
      ? [
          'Consider joint ventures or partnerships',
          'Your complementary skills can create synergy',
          'Focus on clear communication and shared goals'
        ]
      : [
          'Establish clear boundaries and expectations',
          'Consider separate roles that play to each strengths',
          'Regular check-ins to ensure alignment'
        ]
  }

  // Personal compatibility
  const personalScore = Math.round((lifePathScore * 0.4) + (soulScore * 0.4) + (personalityScore * 0.2))
  const personalCompatibility = {
    score: personalScore,
    analysis: personalScore >= 75
      ? 'Strong personal connection with shared values and complementary needs.'
      : personalScore >= 55
      ? 'Good personal compatibility with room for growth and understanding.'
      : 'Different personal needs may require extra effort to understand each other.',
    recommendations: personalScore >= 75
      ? [
          'Nurture your natural connection',
          'Spend quality time together',
          'Support each other\'s individual growth'
        ]
      : [
          'Practice active listening',
          'Be patient with differences',
          'Focus on understanding each other\'s core needs'
        ]
  }

  // General recommendations
  const recommendations: string[] = []
  if (compatibilityScore >= 70) {
    recommendations.push('This relationship has strong potential - nurture it with communication and understanding')
  } else if (compatibilityScore >= 50) {
    recommendations.push('Focus on open communication to bridge differences')
    recommendations.push('Celebrate your differences as strengths')
  } else {
    recommendations.push('This relationship may require extra effort and patience')
    recommendations.push('Consider professional guidance if needed')
  }

  if (challenges.length === 0) {
    recommendations.push('Minor differences can be addressed through understanding and compromise')
  }

  return {
    toolSlug: 'numerology',
    userProfile: {
      name: userName,
      dateOfBirth: userBirthDate,
      timeOfBirth: userProfile.birthTime,
      birthPlace: userProfile.birthPlace
    },
    additionalProfile,
    compatibilityScore,
    overallAssessment,
    strengths,
    challenges,
    businessSuitability,
    personalCompatibility,
    recommendations,
    detailedAnalysis: {
      userNumbers: {
        lifePath: userLP,
        destiny: userDestiny,
        soulUrge: userSoul,
        personality: userPersonality
      },
      additionalNumbers: {
        lifePath: addLP,
        destiny: addDestiny,
        soulUrge: addSoul,
        personality: addPersonality
      },
      scores: {
        lifePath: lifePathScore,
        destiny: destinyScore,
        soul: soulScore,
        personality: personalityScore
      }
    },
    generatedAt: Date.now()
  }
}

// Helper function to calculate compatibility between two numbers
function calculateNumberCompatibility(num1: number, num2: number): number {
  // Same number = perfect compatibility
  if (num1 === num2) return 100

  // Master numbers (11, 22) compatibility
  if ([11, 22].includes(num1) && [11, 22].includes(num2)) return 90
  if ([11, 22].includes(num1) || [11, 22].includes(num2)) {
    const regular = [11, 22].includes(num1) ? num2 : num1
    const master = [11, 22].includes(num1) ? num1 : num2
    if (master === 11 && [2, 4, 6, 8].includes(regular)) return 85
    if (master === 22 && [4, 6, 8].includes(regular)) return 85
  }

  // Compatible number pairs (based on numerology principles)
  const compatiblePairs: Record<number, number[]> = {
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

  const compatible = compatiblePairs[num1] || []
  if (compatible.includes(num2)) return 75

  // Reduce to single digit for comparison
  const reduce = (n: number): number => {
    if (n === 11 || n === 22) return n
    while (n > 9) {
      n = String(n).split('').reduce((sum, digit) => sum + parseInt(digit), 0)
      if (n === 11 || n === 22) break
    }
    return n
  }

  const reduced1 = reduce(num1)
  const reduced2 = reduce(num2)

  if (reduced1 === reduced2) return 70

  // Calculate difference
  const diff = Math.abs(reduced1 - reduced2)
  if (diff === 1) return 60
  if (diff === 2) return 50
  if (diff === 3) return 45
  if (diff === 4) return 40

  return 35
}

