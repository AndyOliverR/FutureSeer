/**
 * Zi Wei Dou Shu Report Generator
 * Generates comprehensive personalized reports using chart data and user profile
 */

import { ZiWeiChartData, BirthInfo, Palace, Star } from './chineseAstrologyService'
import { UserProfile } from '@/lib/firebase'
import { getTenYearDescription, getTenYearFocus, getGroundSkyMeaning } from './fortuneCycleCalculator'

export interface ZiWeiReport {
  summary: {
    title: string
    overview: string
    keyInsights: string[]
    lifePath: string
    personality: string
  }
  lifePalace: {
    analysis: string
    stars: string[]
    strengths: string[]
    challenges: string[]
    guidance: string
  }
  palaceStrengths: {
    strongest: Palace[]
    weakest: Palace[]
    recommendations: string[]
  }
  starCombinations: {
    important: Array<{
      stars: string[]
      palace: string
      meaning: string
      influence: string
    }>
    auspicious: Array<{
      stars: string[]
      meaning: string
    }>
    challenging: Array<{
      stars: string[]
      meaning: string
      remedies: string[]
    }>
  }
  fortuneCycles: {
    current: {
      period: string
      description: string
      focus: string[]
      opportunities: string[]
      warnings: string[]
    }
    upcoming: Array<{
      period: string
      description: string
      focus: string[]
    }>
  }
  fourTransformations: {
    lu: {
      star: string
      palace: string
      meaning: string
    }
    quan: {
      star: string
      palace: string
      meaning: string
    }
    ke: {
      star: string
      palace: string
      meaning: string
    }
    ji: {
      star: string
      palace: string
      meaning: string
    }
  }
  recommendations: {
    career: string[]
    relationships: string[]
    health: string[]
    wealth: string[]
    spiritual: string[]
  }
  personalizedInsights: string[]
}

/**
 * Generate comprehensive Zi Wei Dou Shu report
 */
export function generateZiWeiReport(
  chartData: ZiWeiChartData,
  userProfile?: UserProfile | null
): ZiWeiReport {
  const lifePalace = chartData.palaces[0] // First palace is Life Palace
  // Use displayName for personalization (e.g., "AnDY"), fullName is used for calculations
  // Fallback logic: if displayName is missing or equals fullName, default to "AnDY"
  let userName = userProfile?.displayName || 'AnDY'
  if (!userName || userName === userProfile?.fullName || userName.trim() === '') {
    userName = 'AnDY'
  }
  
  return {
    summary: generateSummary(chartData, userProfile, userName),
    lifePalace: generateLifePalaceAnalysis(lifePalace, chartData, userName),
    palaceStrengths: analyzePalaceStrengths(chartData.palaces),
    starCombinations: analyzeStarCombinations(chartData),
    fortuneCycles: analyzeFortuneCycles(chartData, userName),
    fourTransformations: analyzeFourTransformations(chartData),
    recommendations: generateRecommendations(chartData, userProfile),
    personalizedInsights: generatePersonalizedInsights(chartData, userProfile, userName),
  }
}

function generateSummary(
  chartData: ZiWeiChartData,
  userProfile: UserProfile | null | undefined,
  userName: string
): ZiWeiReport['summary'] {
  const lifePalace = chartData.palaces[0]
  const mainStars = lifePalace.stars.filter(s => s.type === 'main')
  const dominantElement = chartData.elements.dominant
  
  const keyInsights: string[] = []
  
  // Analyze life palace stars
  if (mainStars.length > 0) {
    const primaryStar = mainStars[0]
    keyInsights.push(`Your Life Palace is influenced by ${primaryStar.nameChinese} (${primaryStar.name}), indicating ${primaryStar.interpretation}`)
  }
  
  // Element analysis
  keyInsights.push(`Your dominant element is ${dominantElement}, suggesting natural affinity for ${getElementCharacteristics(dominantElement)}`)
  
  // Zodiac animal
  keyInsights.push(`Born in the year of the ${chartData.zodiacAnimal.animal}, you possess ${chartData.zodiacAnimal.personality.join(', ')} qualities`)
  
  // Palace strength
  const strongestPalace = chartData.palaces.reduce((max, p) => 
    p.strength > max.strength ? p : max
  )
  keyInsights.push(`Your strongest life area is ${strongestPalace.englishName}, indicating natural talents in ${strongestPalace.keywords.join(', ')}`)
  
  return {
    title: `${userName}'s Zi Wei Dou Shu Destiny Chart`,
    overview: `Based on your birth chart, ${userName}, your destiny is shaped by the positions of ${chartData.mainStars.length} main stars and ${chartData.supportingStars.length} supporting stars across 12 life palaces. Your Life Palace reveals your core personality and life path, while other palaces illuminate different aspects of your journey.`,
    keyInsights,
    lifePath: `Your life path is characterized by ${lifePalace.interpretation}. The stars in your Life Palace suggest a destiny focused on ${lifePalace.keywords.join(' and ')}.`,
    personality: `Your personality is influenced by the ${dominantElement} element, making you naturally ${getElementPersonality(dominantElement)}. Combined with your ${chartData.zodiacAnimal.animal} zodiac sign, you are ${chartData.zodiacAnimal.personality.slice(0, 2).join(' and ')}.`,
  }
}

function generateLifePalaceAnalysis(
  lifePalace: Palace,
  chartData: ZiWeiChartData,
  userName: string
): ZiWeiReport['lifePalace'] {
  const mainStars = lifePalace.stars.filter(s => s.type === 'main')
  const supportingStars = lifePalace.stars.filter(s => s.type === 'supporting')
  
  const strengths: string[] = []
  const challenges: string[] = []
  
  mainStars.forEach(star => {
    if (star.nature === 'auspicious') {
      strengths.push(`${star.nameChinese} brings positive energy and ${star.keywords.join(', ')}`)
    } else if (star.nature === 'inauspicious') {
      challenges.push(`${star.nameChinese} may present challenges related to ${star.keywords.join(', ')}`)
    }
  })
  
  return {
    analysis: `Your Life Palace (命宫) is the foundation of your destiny, ${userName}. It contains ${mainStars.length} main stars and ${supportingStars.length} supporting stars, creating a unique combination that shapes your personality and life path. ${lifePalace.interpretation}`,
    stars: lifePalace.stars.map(s => `${s.nameChinese} (${s.name})`),
    strengths: strengths.length > 0 ? strengths : ['Your Life Palace shows balanced energy'],
    challenges: challenges.length > 0 ? challenges : ['No major challenges indicated'],
    guidance: `Focus on developing your natural talents in ${lifePalace.keywords.join(', ')}. The stars in your Life Palace suggest that ${lifePalace.interpretation}`,
  }
}

function analyzePalaceStrengths(palaces: Palace[]): ZiWeiReport['palaceStrengths'] {
  const sorted = [...palaces].sort((a, b) => b.strength - a.strength)
  const strongest = sorted.slice(0, 3)
  const weakest = sorted.slice(-3).reverse()
  
  const recommendations: string[] = []
  
  strongest.forEach(palace => {
    recommendations.push(`Leverage your strength in ${palace.englishName} to achieve your goals`)
  })
  
  weakest.forEach(palace => {
    recommendations.push(`Pay attention to ${palace.englishName} and work on developing this area`)
  })
  
  return {
    strongest,
    weakest,
    recommendations,
  }
}

function analyzeStarCombinations(chartData: ZiWeiChartData): ZiWeiReport['starCombinations'] {
  const important: Array<{ stars: string[]; palace: string; meaning: string; influence: string }> = []
  const auspicious: Array<{ stars: string[]; meaning: string }> = []
  const challenging: Array<{ stars: string[]; meaning: string; remedies: string[] }> = []
  
  // Find palaces with multiple main stars
  chartData.palaces.forEach(palace => {
    const mainStars = palace.stars.filter(s => s.type === 'main')
    if (mainStars.length >= 2) {
      const starNames = mainStars.map(s => s.nameChinese)
      important.push({
        stars: starNames,
        palace: palace.englishName,
        meaning: `The combination of ${starNames.join(' and ')} in ${palace.englishName} creates a powerful influence`,
        influence: `This combination affects ${palace.keywords.join(', ')}`,
      })
    }
    
    // Check for auspicious combinations
    const auspiciousStars = mainStars.filter(s => s.nature === 'auspicious')
    if (auspiciousStars.length >= 2) {
      auspicious.push({
        stars: auspiciousStars.map(s => s.nameChinese),
        meaning: `Multiple auspicious stars in ${palace.englishName} bring positive energy`,
      })
    }
    
    // Check for challenging combinations
    const challengingStars = mainStars.filter(s => s.nature === 'inauspicious')
    if (challengingStars.length >= 1) {
      challenging.push({
        stars: challengingStars.map(s => s.nameChinese),
        meaning: `${challengingStars.map(s => s.nameChinese).join(' and ')} in ${palace.englishName} may present challenges`,
        remedies: [`Focus on balancing energy in ${palace.englishName}`, 'Practice mindfulness and patience'],
      })
    }
  })
  
  return {
    important,
    auspicious,
    challenging,
  }
}

function analyzeFortuneCycles(
  chartData: ZiWeiChartData,
  userName: string
): ZiWeiReport['fortuneCycles'] {
  const age = calculateAge(chartData.birthInfo.solarDate)
  const currentCycle = chartData.fortuneCycles.find(cycle => {
    return age >= cycle.startAge && age <= cycle.endAge
  }) || chartData.fortuneCycles[0]
  
  const upcoming = chartData.fortuneCycles
    .filter(cycle => cycle.startAge > age)
    .slice(0, 3)
  
  // Generate proper description if it's missing or says "Calculating..."
  const getCycleDescription = (cycle: any): string => {
    // Use existing description if it's already unique and not generic
    if (cycle.description && 
        !cycle.description.includes('Calculating') && 
        !cycle.description.includes('brings significant changes and opportunities') &&
        cycle.description.length > 50) {
      return cycle.description
    }
    
    // If cycle has ground and sky, use them to generate unique description
    if (cycle.ground && cycle.sky) {
      return getTenYearDescription(cycle.ground, cycle.sky, cycle.startAge)
    }
    
    // Fallback: Age-specific life stage descriptions
    const getAgeStageDescription = (startAge: number, endAge: number): string => {
      if (startAge < 20) {
        return `Early years of foundation building, learning, and discovery. This period shapes your core values and worldview.`
      } else if (startAge < 30) {
        return `Young adulthood focused on establishing independence, career beginnings, and forming meaningful relationships.`
      } else if (startAge < 40) {
        return `Peak professional development years with opportunities for career advancement and building your legacy.`
      } else if (startAge < 50) {
        return `Mature years of consolidation, where you refine your path and enjoy the fruits of earlier efforts.`
      } else if (startAge < 60) {
        return `Wisdom years bringing deeper understanding, mentorship opportunities, and preparation for the next phase.`
      } else if (startAge < 70) {
        return `Reflection and legacy-building period, focusing on sharing wisdom and enjoying meaningful connections.`
      } else if (startAge < 80) {
        return `Golden years of contentment, spiritual growth, and cherishing relationships with family and friends.`
      } else {
        return `Elder years of profound wisdom, inner peace, and appreciation for life's journey and experiences.`
      }
    }
    
    // Combine nature with age-specific context
    const ageContext = getAgeStageDescription(cycle.startAge, cycle.endAge)
    const elementInfo = cycle.element ? ` The ${cycle.element} element influences this period,` : ''
    const groundSkyInfo = (cycle.ground && cycle.sky) ? ` with ${cycle.ground}${cycle.sky} energy` : ''
    
    const natureModifiers: Record<string, string> = {
      excellent: `This is an exceptionally favorable period for ${userName}.`,
      good: `This is a favorable period for ${userName}.`,
      neutral: `This period brings balanced energy for ${userName}.`,
      challenging: `This period presents challenges for ${userName}, but also valuable growth opportunities.`
    }
    
    const natureModifier = natureModifiers[cycle.nature] || `This period for ${userName}`
    
    return `${natureModifier}${elementInfo}${groundSkyInfo}. ${ageContext}`
  }
  
  // Generate opportunities if missing
  const getOpportunities = (cycle: any): string[] => {
    if (cycle.opportunities && cycle.opportunities.length > 0) {
      return cycle.opportunities
    }
    
    // Age-specific opportunities
    const getAgeOpportunities = (startAge: number): string[] => {
      if (startAge < 20) {
        return ['Educational achievements', 'Skill development', 'Forming core values', 'Building friendships']
      } else if (startAge < 30) {
        return ['Career establishment', 'Professional growth', 'Romantic relationships', 'Financial independence']
      } else if (startAge < 40) {
        return ['Career advancement', 'Leadership roles', 'Family expansion', 'Wealth accumulation']
      } else if (startAge < 50) {
        return ['Career peak achievements', 'Mentoring others', 'Investment opportunities', 'Personal fulfillment']
      } else if (startAge < 60) {
        return ['Wisdom sharing', 'Legacy building', 'Spiritual growth', 'Meaningful contributions']
      } else if (startAge < 70) {
        return ['Enjoying retirement', 'Family connections', 'Creative pursuits', 'Travel and exploration']
      } else {
        return ['Inner peace', 'Family bonds', 'Spiritual reflection', 'Cherishing memories']
      }
    }
    
    const ageOpportunities = getAgeOpportunities(cycle.startAge)
    
    if (cycle.nature === 'excellent') {
      return ageOpportunities.map(opp => `Exceptional ${opp.toLowerCase()}`)
    } else if (cycle.nature === 'challenging') {
      return [
        'Learning from experiences',
        'Building resilience',
        'Finding inner strength',
        'Transformation through challenges'
      ]
    }
    
    return ageOpportunities
  }
  
  // Generate warnings if missing
  const getWarnings = (cycle: any): string[] => {
    if (cycle.warnings && cycle.warnings.length > 0) {
      return cycle.warnings
    }
    
    if (cycle.nature === 'challenging') {
      return [
        'Be cautious with major decisions',
        'Take time to reflect before acting',
        'Seek advice from trusted sources',
        'Maintain patience during difficulties'
      ]
    }
    
    return []
  }
  
  // Generate focus areas if missing
  const getFocus = (cycle: any): string[] => {
    // Use existing focus if it's unique and not generic
    if (cycle.focus && 
        cycle.focus.length > 0 && 
        !cycle.focus.includes('Long-term goals') &&
        !cycle.focus.includes('Major life changes')) {
      return cycle.focus
    }
    
    // If cycle has ground and sky, use them to generate unique focus
    if (cycle.ground && cycle.sky) {
      return getTenYearFocus(cycle.ground, cycle.sky, cycle.startAge)
    }
    
    // Fallback: Age-specific focus areas
    const getAgeFocus = (startAge: number): string[] => {
      if (startAge < 20) {
        return ['Education and learning', 'Personal identity', 'Social connections', 'Health foundation']
      } else if (startAge < 30) {
        return ['Career building', 'Professional skills', 'Romantic relationships', 'Financial planning']
      } else if (startAge < 40) {
        return ['Career advancement', 'Family responsibilities', 'Wealth building', 'Professional reputation']
      } else if (startAge < 50) {
        return ['Career peak performance', 'Mentoring', 'Investment strategies', 'Personal fulfillment']
      } else if (startAge < 60) {
        return ['Wisdom sharing', 'Legacy planning', 'Spiritual development', 'Health maintenance']
      } else if (startAge < 70) {
        return ['Retirement planning', 'Family relationships', 'Creative pursuits', 'Health care']
      } else {
        return ['Health and wellness', 'Family connections', 'Spiritual reflection', 'Peaceful living']
      }
    }
    
    return getAgeFocus(cycle.startAge)
  }
  
  return {
    current: {
      period: `${currentCycle.startAge}-${currentCycle.endAge} years`,
      description: getCycleDescription(currentCycle),
      focus: getFocus(currentCycle),
      opportunities: getOpportunities(currentCycle),
      warnings: getWarnings(currentCycle),
    },
    upcoming: upcoming.map(cycle => ({
      period: `${cycle.startAge}-${cycle.endAge} years`,
      description: getCycleDescription(cycle),
      focus: getFocus(cycle),
    })),
  }
}

function analyzeFourTransformations(chartData: ZiWeiChartData): ZiWeiReport['fourTransformations'] {
  // Simplified four transformations analysis
  // In a full implementation, this would use actual chart calculations
  return {
    lu: {
      star: '天梁',
      palace: 'Life Palace',
      meaning: 'Lu (禄) represents wealth and prosperity. This transformation brings opportunities for material gain.',
    },
    quan: {
      star: '紫微',
      palace: 'Career Palace',
      meaning: 'Quan (权) represents power and authority. This transformation enhances leadership abilities.',
    },
    ke: {
      star: '天府',
      palace: 'Fortune Palace',
      meaning: 'Ke (科) represents fame and recognition. This transformation brings intellectual achievements.',
    },
    ji: {
      star: '武曲',
      palace: 'Wealth Palace',
      meaning: 'Ji (忌) represents challenges and obstacles. This transformation requires careful attention to financial matters.',
    },
  }
}

function generateRecommendations(
  chartData: ZiWeiChartData,
  userProfile: UserProfile | null | undefined
): ZiWeiReport['recommendations'] {
  const careerPalace = chartData.palaces.find(p => p.name.includes('career')) || chartData.palaces[8]
  const wealthPalace = chartData.palaces.find(p => p.name.includes('wealth')) || chartData.palaces[4]
  const healthPalace = chartData.palaces.find(p => p.name.includes('health')) || chartData.palaces[6]
  const marriagePalace = chartData.palaces.find(p => p.name.includes('marriage')) || chartData.palaces[2]
  const fortunePalace = chartData.palaces.find(p => p.name.includes('fortune')) || chartData.palaces[10]
  
  return {
    career: getCareerRecommendations(careerPalace),
    relationships: getRelationshipRecommendations(marriagePalace),
    health: getHealthRecommendations(healthPalace),
    wealth: getWealthRecommendations(wealthPalace),
    spiritual: getSpiritualRecommendations(fortunePalace, chartData),
  }
}

/**
 * Get primary keywords from palace (max 2 to avoid redundancy)
 */
function getPrimaryKeywords(palace: Palace, maxCount: number = 2): string[] {
  return palace.keywords.slice(0, maxCount)
}

/**
 * Analyze palace stars for recommendations
 */
function analyzePalaceStars(palace: Palace): {
  hasAuspiciousStars: boolean
  hasChallengingStars: boolean
  mainStarNames: string[]
  starGuidance: string
} {
  const mainStars = palace.stars.filter(s => s.type === 'main')
  const auspiciousStars = mainStars.filter(s => s.nature === 'auspicious')
  const challengingStars = mainStars.filter(s => s.nature === 'inauspicious')
  const starNames = mainStars.map(s => s.name).slice(0, 2)
  
  let starGuidance = ''
  if (auspiciousStars.length > 0 && challengingStars.length === 0) {
    starGuidance = 'shows favorable energy'
  } else if (challengingStars.length > 0 && auspiciousStars.length === 0) {
    starGuidance = 'requires careful attention'
  } else if (auspiciousStars.length > 0 && challengingStars.length > 0) {
    starGuidance = 'presents both opportunities and challenges'
  } else {
    starGuidance = 'indicates balanced energy'
  }
  
  return {
    hasAuspiciousStars: auspiciousStars.length > 0,
    hasChallengingStars: challengingStars.length > 0,
    mainStarNames: starNames,
    starGuidance
  }
}

/**
 * Generate career recommendations based on palace analysis
 */
function getCareerRecommendations(careerPalace: Palace): string[] {
  const starAnalysis = analyzePalaceStars(careerPalace)
  const primaryKeywords = getPrimaryKeywords(careerPalace, 2)
  const strength = careerPalace.strength
  
  const recommendations: string[] = []
  
  // Base recommendation on palace strength and stars
  if (strength > 0.7) {
    if (starAnalysis.hasAuspiciousStars) {
      recommendations.push(`Your Career Palace ${starAnalysis.starGuidance} with strong potential for professional success.`)
      recommendations.push(`Focus on ${primaryKeywords[0] || 'professional growth'} and building your reputation in your field.`)
    } else {
      recommendations.push(`Your Career Palace shows solid foundation for professional development.`)
      recommendations.push(`Emphasize ${primaryKeywords[0] || 'expertise'} and consistent performance to advance your career.`)
    }
  } else if (strength > 0.5) {
    recommendations.push(`Your Career Palace indicates steady progress in professional matters.`)
    recommendations.push(`Develop your skills in ${primaryKeywords[0] || 'your chosen field'} and seek opportunities for growth.`)
  } else {
    recommendations.push(`Your Career Palace suggests focusing on building a strong professional foundation.`)
    recommendations.push(`Invest in developing your ${primaryKeywords[0] || 'core skills'} and establishing credibility.`)
  }
  
  // Add star-specific guidance
  if (starAnalysis.mainStarNames.length > 0 && starAnalysis.hasAuspiciousStars) {
    recommendations.push(`The presence of ${starAnalysis.mainStarNames[0]} in your Career Palace favors taking on leadership roles and greater responsibilities.`)
  } else if (starAnalysis.hasChallengingStars) {
    recommendations.push(`Be patient with career progress and focus on building long-term stability rather than quick advancement.`)
  } else {
    recommendations.push(`This period favors developing your professional expertise and expanding your network.`)
  }
  
  return recommendations.slice(0, 3) // Return top 3 recommendations
}

/**
 * Generate relationship recommendations based on palace analysis
 */
function getRelationshipRecommendations(marriagePalace: Palace): string[] {
  const starAnalysis = analyzePalaceStars(marriagePalace)
  const primaryKeywords = getPrimaryKeywords(marriagePalace, 1)
  const strength = marriagePalace.strength
  
  const recommendations: string[] = []
  
  // Base recommendation on palace strength and stars
  if (strength > 0.7) {
    if (starAnalysis.hasAuspiciousStars) {
      recommendations.push(`Your Marriage Palace ${starAnalysis.starGuidance} for harmonious partnerships.`)
      recommendations.push(`This period favors deepening connections and building strong, supportive relationships.`)
    } else {
      recommendations.push(`Your Marriage Palace shows potential for meaningful relationships.`)
      recommendations.push(`Focus on open communication and mutual understanding with your partner.`)
    }
  } else if (strength > 0.5) {
    recommendations.push(`Your Marriage Palace indicates balanced energy in relationships.`)
    recommendations.push(`Prioritize honest communication and work together to build trust and understanding.`)
  } else {
    recommendations.push(`Your Marriage Palace suggests focusing on building stronger foundations in relationships.`)
    recommendations.push(`Be patient and nurturing, allowing connections to develop naturally over time.`)
  }
  
  // Add star-specific guidance
  if (starAnalysis.hasAuspiciousStars) {
    recommendations.push(`The favorable stars in your Marriage Palace support romantic harmony and partnership success.`)
  } else if (starAnalysis.hasChallengingStars) {
    recommendations.push(`Pay attention to communication patterns and be willing to work through differences with patience and empathy.`)
  } else {
    recommendations.push(`Focus on creating balance between independence and togetherness in your relationships.`)
  }
  
  return recommendations.slice(0, 3)
}

/**
 * Generate health recommendations based on palace analysis
 */
function getHealthRecommendations(healthPalace: Palace): string[] {
  const starAnalysis = analyzePalaceStars(healthPalace)
  const strength = healthPalace.strength
  
  const recommendations: string[] = []
  
  // Base recommendation on palace strength
  if (strength > 0.7) {
    recommendations.push(`Your Health Palace shows strong vitality and resilience.`)
    recommendations.push(`Maintain your current wellness practices and continue prioritizing physical and mental health.`)
  } else if (strength > 0.5) {
    recommendations.push(`Your Health Palace indicates the importance of maintaining balance in your wellness routine.`)
    recommendations.push(`Focus on regular exercise, adequate rest, and stress management to support your overall health.`)
  } else {
    recommendations.push(`Your Health Palace suggests paying attention to preventive care and maintaining healthy habits.`)
    recommendations.push(`Schedule regular health checkups and prioritize activities that support both physical and mental well-being.`)
  }
  
  // Add star-specific guidance
  if (starAnalysis.hasChallengingStars) {
    recommendations.push(`Be proactive about health maintenance and address any concerns early rather than waiting.`)
  } else {
    recommendations.push(`This period favors establishing sustainable health routines that you can maintain long-term.`)
  }
  
  return recommendations.slice(0, 3)
}

/**
 * Generate wealth recommendations based on palace analysis
 */
function getWealthRecommendations(wealthPalace: Palace): string[] {
  const starAnalysis = analyzePalaceStars(wealthPalace)
  const strength = wealthPalace.strength
  
  const recommendations: string[] = []
  
  // Base recommendation on palace strength
  if (strength > 0.7) {
    if (starAnalysis.hasAuspiciousStars) {
      recommendations.push(`Your Wealth Palace ${starAnalysis.starGuidance} for financial growth and accumulation.`)
      recommendations.push(`This period favors strategic investments and building long-term financial security.`)
    } else {
      recommendations.push(`Your Wealth Palace shows potential for steady financial progress.`)
      recommendations.push(`Focus on disciplined saving and making informed financial decisions.`)
    }
  } else if (strength > 0.5) {
    recommendations.push(`Your Wealth Palace indicates balanced financial energy requiring careful management.`)
    recommendations.push(`Prioritize long-term financial planning and avoid impulsive spending decisions.`)
  } else {
    recommendations.push(`Your Wealth Palace suggests focusing on building a solid financial foundation.`)
    recommendations.push(`Develop a clear financial plan and be cautious with major investments or large expenditures.`)
  }
  
  // Add star-specific guidance
  if (starAnalysis.hasAuspiciousStars) {
    recommendations.push(`The favorable stars support wealth accumulation through consistent effort and wise financial choices.`)
  } else if (starAnalysis.hasChallengingStars) {
    recommendations.push(`Exercise caution with financial decisions and avoid taking unnecessary risks during this period.`)
  } else {
    recommendations.push(`Focus on building financial stability through steady, reliable income sources and prudent savings.`)
  }
  
  return recommendations.slice(0, 3)
}

/**
 * Generate spiritual recommendations based on fortune palace and chart data
 */
function getSpiritualRecommendations(fortunePalace: Palace, chartData: ZiWeiChartData): string[] {
  const starAnalysis = analyzePalaceStars(fortunePalace)
  const strength = fortunePalace.strength
  
  const recommendations: string[] = []
  
  // Base recommendation on fortune palace
  if (strength > 0.7) {
    recommendations.push(`Your Fortune Palace shows strong spiritual potential and inner wisdom.`)
    recommendations.push(`This period favors deepening your spiritual practice and connecting with your inner guidance.`)
  } else {
    recommendations.push(`Your Fortune Palace indicates the importance of spiritual growth and inner reflection.`)
    recommendations.push(`Dedicate time to meditation, mindfulness, and practices that nurture your spiritual well-being.`)
  }
  
  // Add element-based guidance
  const dominantElement = chartData.elements.dominant
  const elementGuidance: Record<string, string> = {
    wood: 'Practice growth-oriented spiritual activities like nature meditation and personal development.',
    fire: 'Engage in passionate spiritual practices that inspire and energize your inner journey.',
    earth: 'Focus on grounding practices and connecting with the stability of your spiritual foundation.',
    metal: 'Emphasize discipline and structure in your spiritual practice, seeking clarity and refinement.',
    water: 'Explore intuitive and flowing spiritual practices that allow for deep inner transformation.'
  }
  
  if (elementGuidance[dominantElement]) {
    recommendations.push(elementGuidance[dominantElement])
  } else {
    recommendations.push(`Seek spiritual guidance and wisdom that resonates with your personal journey and values.`)
  }
  
  return recommendations.slice(0, 3)
}

function generatePersonalizedInsights(
  chartData: ZiWeiChartData,
  userProfile: UserProfile | null | undefined,
  userName: string
): string[] {
  const insights: string[] = []
  
  insights.push(`${userName}, your chart reveals a unique combination of stars and elements that shape your destiny.`)
  
  const lifePalace = chartData.palaces[0]
  insights.push(`Your Life Palace is particularly strong, indicating natural talents in ${lifePalace.keywords.join(', ')}.`)
  
  if (chartData.runtimeContext) {
    insights.push(`Currently, you are in a ${chartData.runtimeContext.tenYear.description} period.`)
  }
  
  const dominantElement = chartData.elements.dominant
  insights.push(`Your dominant ${dominantElement} element suggests you should focus on ${getElementFocus(dominantElement)}.`)
  
  return insights
}

// Helper functions

function getElementCharacteristics(element: string): string {
  const characteristics: Record<string, string> = {
    wood: 'growth, creativity, and expansion',
    fire: 'passion, energy, and transformation',
    earth: 'stability, practicality, and nurturing',
    metal: 'precision, structure, and discipline',
    water: 'wisdom, adaptability, and flow',
  }
  return characteristics[element] || 'balance and harmony'
}

function getElementPersonality(element: string): string {
  const personalities: Record<string, string> = {
    wood: 'creative, growth-oriented, and flexible',
    fire: 'passionate, energetic, and expressive',
    earth: 'stable, practical, and nurturing',
    metal: 'precise, disciplined, and structured',
    water: 'wise, adaptable, and intuitive',
  }
  return personalities[element] || 'balanced and harmonious'
}

function getElementFocus(element: string): string {
  const focuses: Record<string, string> = {
    wood: 'creative projects and personal growth',
    fire: 'passionate pursuits and self-expression',
    earth: 'practical matters and stability',
    metal: 'structured goals and discipline',
    water: 'wisdom and adaptability',
  }
  return focuses[element] || 'balance in all areas'
}

function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate)
  const now = new Date()
  let age = now.getFullYear() - birth.getFullYear()
  const monthDiff = now.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age--
  }
  return age
}

