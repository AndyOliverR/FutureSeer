// Western Astrology Compatibility Calculator
// Calculates real synastry (relationship compatibility) between two birth charts

import { CompatibilityReport, AdditionalProfile } from '@/lib/types/profileTypes'
import { devLog } from '@/lib/devLogger';
import { UserProfile } from '@/lib/firebase'
import { universalOccultService, BirthData } from '@/lib/universalOccultService'

interface SynastryAspect {
  planet1: string
  planet2: string
  type: string
  orb: number
  influence: 'harmonious' | 'challenging' | 'neutral'
}

const ZODIAC_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
]

const ELEMENTS = {
  fire: ['Aries', 'Leo', 'Sagittarius'],
  earth: ['Taurus', 'Virgo', 'Capricorn'],
  air: ['Gemini', 'Libra', 'Aquarius'],
  water: ['Cancer', 'Scorpio', 'Pisces']
}

const SIGN_COMPATIBILITY: Record<string, string[]> = {
  'Aries': ['Leo', 'Sagittarius', 'Gemini', 'Aquarius'],
  'Taurus': ['Virgo', 'Capricorn', 'Cancer', 'Pisces'],
  'Gemini': ['Libra', 'Aquarius', 'Aries', 'Leo'],
  'Cancer': ['Scorpio', 'Pisces', 'Taurus', 'Virgo'],
  'Leo': ['Sagittarius', 'Aries', 'Gemini', 'Libra'],
  'Virgo': ['Capricorn', 'Taurus', 'Scorpio', 'Pisces'],
  'Libra': ['Aquarius', 'Gemini', 'Leo', 'Sagittarius'],
  'Scorpio': ['Pisces', 'Cancer', 'Virgo', 'Capricorn'],
  'Sagittarius': ['Aries', 'Leo', 'Libra', 'Aquarius'],
  'Capricorn': ['Taurus', 'Virgo', 'Scorpio', 'Pisces'],
  'Aquarius': ['Gemini', 'Libra', 'Aries', 'Sagittarius'],
  'Pisces': ['Cancer', 'Scorpio', 'Taurus', 'Capricorn']
}

function getSignFromLongitude(longitude: number): string {
  const normalizedLongitude = ((longitude % 360) + 360) % 360
  const signIndex = Math.floor(normalizedLongitude / 30)
  return ZODIAC_SIGNS[signIndex] || "Aries"
}

function getElementFromSign(sign: string): string {
  for (const [element, signs] of Object.entries(ELEMENTS)) {
    if (signs.includes(sign)) {
      return element
    }
  }
  return 'fire'
}

function calculateSynastryAspects(userPlanets: any[], partnerPlanets: any[]): SynastryAspect[] {
  const aspects: SynastryAspect[] = []
  const aspectTypes = [
    { name: 'conjunction', angle: 0, orb: 8, influence: 'neutral' as const },
    { name: 'opposition', angle: 180, orb: 8, influence: 'challenging' as const },
    { name: 'trine', angle: 120, orb: 8, influence: 'harmonious' as const },
    { name: 'square', angle: 90, orb: 8, influence: 'challenging' as const },
    { name: 'sextile', angle: 60, orb: 6, influence: 'harmonious' as const }
  ]

  for (const userPlanet of userPlanets) {
    for (const partnerPlanet of partnerPlanets) {
      // Handle different planet data structures
      const userLongitude = userPlanet.longitude ?? 
                            (typeof userPlanet.position === 'number' ? userPlanet.position : 0)
      const partnerLongitude = partnerPlanet.longitude ?? 
                               (typeof partnerPlanet.position === 'number' ? partnerPlanet.position : 0)
      
      const angle = Math.abs(userLongitude - partnerLongitude)
      const normalizedAngle = Math.min(angle, 360 - angle)
      
      for (const aspectType of aspectTypes) {
        const orbDifference = Math.abs(normalizedAngle - aspectType.angle)
        
        // Variable orbs based on planet importance
        let maxOrb = aspectType.orb
        const importantPlanets = ['Sun', 'Moon', 'Venus', 'Mars']
        if (importantPlanets.includes(userPlanet.name) || importantPlanets.includes(partnerPlanet.name)) {
          maxOrb += 2
        }
        
        if (orbDifference <= maxOrb) {
          aspects.push({
            planet1: userPlanet.name,
            planet2: partnerPlanet.name,
            type: aspectType.name,
            orb: orbDifference,
            influence: aspectType.influence
          })
          break // Only count the closest aspect
        }
      }
    }
  }
  
  return aspects
}

function analyzeAspectCompatibility(aspects: SynastryAspect[]): {
  harmoniousCount: number
  challengingCount: number
  majorAspects: SynastryAspect[]
  sunMoonAspect: SynastryAspect | null
  venusMarsAspect: SynastryAspect | null
} {
  const harmonious = aspects.filter(a => a.influence === 'harmonious')
  const challenging = aspects.filter(a => a.influence === 'challenging')
  
  // Find major aspects (Sun, Moon, Venus, Mars interactions)
  const majorPlanets = ['Sun', 'Moon', 'Venus', 'Mars']
  const majorAspects = aspects.filter(a => 
    majorPlanets.includes(a.planet1) && majorPlanets.includes(a.planet2)
  )
  
  const sunMoonAspect = aspects.find(a => 
    (a.planet1 === 'Sun' && a.planet2 === 'Moon') || 
    (a.planet1 === 'Moon' && a.planet2 === 'Sun')
  ) || null
  
  const venusMarsAspect = aspects.find(a => 
    (a.planet1 === 'Venus' && a.planet2 === 'Mars') || 
    (a.planet1 === 'Mars' && a.planet2 === 'Venus')
  ) || null
  
  return {
    harmoniousCount: harmonious.length,
    challengingCount: challenging.length,
    majorAspects,
    sunMoonAspect,
    venusMarsAspect
  }
}

function calculateCompatibilityScore(
  harmoniousCount: number,
  challengingCount: number,
  sunMoonAspect: SynastryAspect | null,
  venusMarsAspect: SynastryAspect | null,
  elementCompatibility: boolean,
  signCompatibility: boolean
): number {
  let score = 50 // Base score
  
  // Aspect-based scoring
  score += (harmoniousCount * 3)
  score -= (challengingCount * 2)
  
  // Major aspect bonuses
  if (sunMoonAspect) {
    if (sunMoonAspect.influence === 'harmonious') {
      score += 15
    } else if (sunMoonAspect.type === 'conjunction') {
      score += 10
    } else {
      score -= 5
    }
  }
  
  if (venusMarsAspect) {
    if (venusMarsAspect.influence === 'harmonious') {
      score += 10
    } else if (venusMarsAspect.type === 'conjunction') {
      score += 8
    } else {
      score -= 3
    }
  }
  
  // Element and sign compatibility
  if (elementCompatibility) score += 8
  if (signCompatibility) score += 7
  
  // Clamp between 0 and 100
  return Math.max(0, Math.min(100, Math.round(score)))
}

function getOverallAssessment(score: number): 'Excellent' | 'Good' | 'Moderate' | 'Challenging' | 'Poor' {
  if (score >= 80) return 'Excellent'
  if (score >= 65) return 'Good'
  if (score >= 50) return 'Moderate'
  if (score >= 35) return 'Challenging'
  return 'Poor'
}

export async function calculateWesternAstrologyCompatibility(
  userProfile: UserProfile,
  additionalProfile: AdditionalProfile
): Promise<CompatibilityReport> {
  const userName = userProfile.fullName || userProfile.displayName || ''
  const userBirthDate = userProfile.birthDate || ''
  
  // Validate required data
  if (!userBirthDate || !additionalProfile.dateOfBirth) {
    return {
      toolSlug: 'western-astrology',
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
  
  try {
    // Prepare birth data for both profiles
    const userBirthData: BirthData = {
      birthDate: userBirthDate,
      birthTime: userProfile.birthTime || '12:00',
      birthPlace: userProfile.birthPlace || '',
      latitude: userProfile.birthLatitude || 0,
      longitude: userProfile.birthLongitude || 0
    }
    
    const partnerBirthData: BirthData = {
      birthDate: additionalProfile.dateOfBirth,
      birthTime: additionalProfile.timeOfBirth || '12:00',
      birthPlace: additionalProfile.birthPlace || '',
      // Let the API handle geocoding if coordinates are missing
      latitude: 0,
      longitude: 0
    }
    
    // Calculate both Western charts
    const [userChart, partnerChart] = await Promise.all([
      universalOccultService.calculateWesternChart(userBirthData, {
        houseSystem: 'placidus',
        includeAspects: true
      }),
      universalOccultService.calculateWesternChart(partnerBirthData, {
        houseSystem: 'placidus',
        includeAspects: true
      })
    ])
    
    if (!userChart.success || !partnerChart.success) {
      throw new Error('Failed to calculate birth charts')
    }
    
    const userPlanets = userChart.data?.planets || []
    const partnerPlanets = partnerChart.data?.planets || []
    const userHouses = userChart.data?.houses || []
    const partnerHouses = partnerChart.data?.houses || []
    
    // Calculate synastry aspects
    const synastryAspects = calculateSynastryAspects(userPlanets, partnerPlanets)
    const aspectAnalysis = analyzeAspectCompatibility(synastryAspects)
    
    // Get Sun signs for compatibility
    const userSun = userPlanets.find((p: any) => p.name === 'Sun')
    const partnerSun = partnerPlanets.find((p: any) => p.name === 'Sun')
    const userMoon = userPlanets.find((p: any) => p.name === 'Moon')
    const partnerMoon = partnerPlanets.find((p: any) => p.name === 'Moon')
    const userVenus = userPlanets.find((p: any) => p.name === 'Venus')
    const partnerVenus = partnerPlanets.find((p: any) => p.name === 'Venus')
    const userMars = userPlanets.find((p: any) => p.name === 'Mars')
    const partnerMars = partnerPlanets.find((p: any) => p.name === 'Mars')
    
    const userSunLongitude = userSun?.longitude ?? (typeof userSun?.position === 'number' ? userSun.position : 0)
    const partnerSunLongitude = partnerSun?.longitude ?? (typeof partnerSun?.position === 'number' ? partnerSun.position : 0)
    const userMoonLongitude = userMoon?.longitude ?? (typeof userMoon?.position === 'number' ? userMoon.position : 0)
    const partnerMoonLongitude = partnerMoon?.longitude ?? (typeof partnerMoon?.position === 'number' ? partnerMoon.position : 0)
    
    const userSunSign = userSun ? getSignFromLongitude(userSunLongitude) : ''
    const partnerSunSign = partnerSun ? getSignFromLongitude(partnerSunLongitude) : ''
    const userMoonSign = userMoon ? getSignFromLongitude(userMoonLongitude) : ''
    const partnerMoonSign = partnerMoon ? getSignFromLongitude(partnerMoonLongitude) : ''
    
    // Element compatibility
    const userElement = getElementFromSign(userSunSign)
    const partnerElement = getElementFromSign(partnerSunSign)
    const elementCompatible = userElement === partnerElement || 
      (userElement === 'fire' && partnerElement === 'air') ||
      (userElement === 'air' && partnerElement === 'fire') ||
      (userElement === 'earth' && partnerElement === 'water') ||
      (userElement === 'water' && partnerElement === 'earth')
    
    // Sign compatibility
    const signCompatible = SIGN_COMPATIBILITY[userSunSign]?.includes(partnerSunSign) || false
    
    // Calculate compatibility score
    const compatibilityScore = calculateCompatibilityScore(
      aspectAnalysis.harmoniousCount,
      aspectAnalysis.challengingCount,
      aspectAnalysis.sunMoonAspect,
      aspectAnalysis.venusMarsAspect,
      elementCompatible,
      signCompatible
    )
    
    const overallAssessment = getOverallAssessment(compatibilityScore)
    
    // Generate strengths
    const strengths: string[] = []
    if (aspectAnalysis.sunMoonAspect && aspectAnalysis.sunMoonAspect.influence === 'harmonious') {
      strengths.push(`Strong emotional connection - Your Sun and ${additionalProfile.name}'s Moon form a harmonious aspect, indicating deep emotional understanding and compatibility`)
    }
    if (aspectAnalysis.venusMarsAspect && aspectAnalysis.venusMarsAspect.influence === 'harmonious') {
      strengths.push(`Romantic chemistry - Your Venus and ${additionalProfile.name}'s Mars create attraction and romantic harmony`)
    }
    if (elementCompatible) {
      strengths.push(`Elemental harmony - Both of you share compatible elements (${userElement} & ${partnerElement}), indicating natural rapport`)
    }
    if (signCompatible) {
      strengths.push(`Zodiac compatibility - Your ${userSunSign} and ${additionalProfile.name}'s ${partnerSunSign} signs are naturally compatible`)
    }
    if (userMoonSign === partnerMoonSign) {
      strengths.push(`Moon sign match - Both of you have ${userMoonSign} Moon, indicating emotional alignment and similar needs`)
    }
    if (aspectAnalysis.harmoniousCount > aspectAnalysis.challengingCount) {
      strengths.push(`More harmonious aspects than challenging ones - your charts create overall positive interactions`)
    }
    
    // Generate challenges
    const challenges: string[] = []
    if (aspectAnalysis.sunMoonAspect && aspectAnalysis.sunMoonAspect.influence === 'challenging') {
      challenges.push(`Different emotional rhythms - Your Sun and ${additionalProfile.name}'s Moon form a challenging aspect, requiring understanding of different emotional needs`)
    }
    if (aspectAnalysis.venusMarsAspect && aspectAnalysis.venusMarsAspect.influence === 'challenging') {
      challenges.push(`Different love styles - Your Venus and ${additionalProfile.name}'s Mars aspects may create different approaches to relationships`)
    }
    if (!elementCompatible) {
      challenges.push(`Different elemental natures - Your ${userElement} element and ${additionalProfile.name}'s ${partnerElement} element have different approaches to life`)
    }
    if (aspectAnalysis.challengingCount > aspectAnalysis.harmoniousCount) {
      challenges.push(`More challenging aspects than harmonious ones - this relationship may require more effort and understanding`)
    }
    if (userSunSign === partnerSunSign) {
      challenges.push(`Same Sun sign - While there's familiarity, you may need to avoid competition and embrace differences`)
    }
    
    // Generate recommendations
    const recommendations: string[] = []
    if (overallAssessment === 'Excellent' || overallAssessment === 'Good') {
      recommendations.push(`Nurture this strong connection - the compatibility suggests a relationship with great potential`)
      recommendations.push(`Focus on open communication to maintain the harmonious aspects in your charts`)
    } else if (overallAssessment === 'Moderate') {
      recommendations.push(`This relationship has potential with mutual understanding and effort`)
      recommendations.push(`Be patient with differences and focus on the areas where you naturally connect`)
    } else {
      recommendations.push(`This relationship may require more work, but understanding each other's needs can strengthen the bond`)
      recommendations.push(`Focus on the positive aspects and communicate openly about challenges`)
    }
    
    if (aspectAnalysis.sunMoonAspect) {
      recommendations.push(`Pay attention to emotional compatibility - understanding each other's emotional needs is key`)
    }
    if (aspectAnalysis.venusMarsAspect) {
      recommendations.push(`Be aware of each other's love languages and romantic needs`)
    }
    
    // Personal compatibility insights
    const personalCompatibility = {
      score: Math.round(compatibilityScore * 0.9), // Slightly lower for personal
      analysis: `Your personal compatibility with ${additionalProfile.name} shows ${overallAssessment.toLowerCase()} potential. ` +
        `The synastry aspects between your charts indicate ${aspectAnalysis.harmoniousCount > aspectAnalysis.challengingCount ? 'more harmonious than challenging' : 'a mix of harmonious and challenging'} interactions. ` +
        `With understanding and effort, this relationship can be meaningful and rewarding.`,
      recommendations: recommendations.slice(0, 3)
    }
    
    // Business compatibility (if applicable)
    let businessSuitability = undefined
    if (additionalProfile.relationshipType === 'business-partner') {
      businessSuitability = {
        score: Math.round(compatibilityScore * 0.85),
        analysis: `For business partnership, your compatibility suggests ${overallAssessment.toLowerCase()} potential for collaboration. ` +
          `Your ${userSunSign} and ${additionalProfile.name}'s ${partnerSunSign} signs ${signCompatible ? 'work well together' : 'may have different approaches'}. ` +
          `Communication and defined roles will be important for success.`,
        recommendations: [
          'Define clear roles and responsibilities',
          'Leverage each other\'s strengths',
          'Maintain open communication about business decisions'
        ]
      }
    }
    
    return {
      toolSlug: 'western-astrology',
      userProfile: {
        name: userName,
        dateOfBirth: userBirthDate,
        timeOfBirth: userProfile.birthTime,
        birthPlace: userProfile.birthPlace
      },
      additionalProfile,
      compatibilityScore,
      overallAssessment,
      strengths: strengths.length > 0 ? strengths : ['Overall compatible connection with potential for growth'],
      challenges: challenges.length > 0 ? challenges : ['Minor differences that can be worked through with understanding'],
      personalCompatibility,
      businessSuitability,
      recommendations,
      detailedAnalysis: {
        synastryAspects: synastryAspects.length,
        harmoniousAspects: aspectAnalysis.harmoniousCount,
        challengingAspects: aspectAnalysis.challengingCount,
        userSunSign,
        partnerSunSign,
        userMoonSign,
        partnerMoonSign,
        elementCompatibility: elementCompatible,
        signCompatibility: signCompatible,
        majorAspects: aspectAnalysis.majorAspects.length
      },
      generatedAt: Date.now()
    }
  } catch (error: any) {
    devLog.error('Error calculating Western astrology compatibility:', error, 'westernAstrologyCompatibility')
    
    // Fallback to basic compatibility
    return {
      toolSlug: 'western-astrology',
      userProfile: {
        name: userName,
        dateOfBirth: userBirthDate,
        timeOfBirth: userProfile.birthTime,
        birthPlace: userProfile.birthPlace
      },
      additionalProfile,
      compatibilityScore: 50,
      overallAssessment: 'Moderate',
      strengths: ['Birth information available for compatibility analysis'],
      challenges: ['Complete birth information (time and place) would provide more detailed analysis'],
      recommendations: [
        'Ensure both profiles have complete birth information for accurate compatibility analysis',
        'Consider providing birth time for more precise astrological insights'
      ],
      detailedAnalysis: {
        error: error.message || 'Calculation error'
      },
      generatedAt: Date.now()
    }
  }
}

