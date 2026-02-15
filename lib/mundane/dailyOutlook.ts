/**
 * Daily National Outlook Calculation Engine
 * Generates 3-day mundane astrology outlook with Global Pulse, National Mood, Local Environment
 */

import { calculateTropicalPlanets, getTropicalSign } from '../western/tropicalCalculator'
import { devLog } from '@/lib/devLogger';

/**
 * Generate a unique seed from a date for deterministic but varied randomization
 */
function getDateSeed(date: Date): number {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  // Create a unique seed that changes meaningfully each day
  return year * 366 + month * 31 + day
}

export interface DailyOutlook {
  date: string
  globalPulse: {
    emotionalClimate: string
    stressEaseIndex: number // 0-5
    dominantTide: { aspect: string; interpretation: string }
    globalStoryline: string
  }
  nationalMood: {
    publicSentiment: string
    authorityVibe: string
    economyFeel: '↑' | '→' | '↓'
    mostFeltFactor: string
  }
  localEnvironment: {
    atmosphere: string
    socialInteraction: string
    friction: 'low' | 'moderate' | 'high'
    behaviorNote: string
  }
  personalGuidance: {
    bestMove: string
    caution: string
    energyWindow?: string
  }
  archetypalForce: string
  fateSummary: string
}

/**
 * Calculate Moon aspects for mood scoring
 */
function calculateMoonAspects(date: Date): {
  moonSign: string
  aspectScore: number
  dominantAspect: string
} {
  try {
    const planets = calculateTropicalPlanets(date)
    const moon = planets.moon
    const moonSign = getTropicalSign(moon.longitude)

    // Calculate aspects to benefics (Venus, Jupiter) vs malefics (Saturn, Mars)
    const venus = planets.venus
    const jupiter = planets.jupiter
    const saturn = planets.saturn
    const mars = planets.mars

    let aspectScore = 0
    let dominantAspect = 'Neutral'

    // More precise aspect calculations - check for conjunctions, trines, sextiles, squares, oppositions
    const aspects = [
      { planet: venus, name: 'Venus', type: 'benefic', weights: { conjunction: 1.5, trine: 1, sextile: 0.5 } },
      { planet: jupiter, name: 'Jupiter', type: 'benefic', weights: { conjunction: 2, trine: 1.5, sextile: 0.8 } },
      { planet: saturn, name: 'Saturn', type: 'malefic', weights: { conjunction: -2, opposition: -1.5, square: -1 } },
      { planet: mars, name: 'Mars', type: 'malefic', weights: { conjunction: -1.5, opposition: -1.2, square: -0.8 } }
    ]

    for (const aspect of aspects) {
      const angle = Math.abs(moon.longitude - aspect.planet.longitude)
      const normalizedAngle = Math.min(angle, 360 - angle)
      
      // Check for conjunction (0°), trine (120°), sextile (60°), square (90°), opposition (180°)
      const isConjunction = normalizedAngle < 8
      const isTrine = Math.abs(normalizedAngle - 120) < 8 || Math.abs(normalizedAngle - 240) < 8
      const isSextile = Math.abs(normalizedAngle - 60) < 8 || Math.abs(normalizedAngle - 300) < 8
      const isSquare = Math.abs(normalizedAngle - 90) < 8 || Math.abs(normalizedAngle - 270) < 8
      const isOpposition = Math.abs(normalizedAngle - 180) < 8

      if (isConjunction && aspect.weights.conjunction) {
        aspectScore += aspect.weights.conjunction
        if (aspect.type === 'benefic') {
          dominantAspect = `${aspect.name} harmony`
        } else {
          dominantAspect = `${aspect.name} pressure`
        }
      } else if (isTrine && aspect.weights.trine) {
        aspectScore += aspect.weights.trine
        if (!dominantAspect.includes(aspect.name)) {
          dominantAspect = `${aspect.name} ease`
        }
      } else if (isSextile && aspect.weights.sextile) {
        aspectScore += aspect.weights.sextile
      } else if (isSquare && aspect.weights.square) {
        aspectScore += aspect.weights.square
        if (!dominantAspect.includes(aspect.name)) {
          dominantAspect = `${aspect.name} challenge`
        }
      } else if (isOpposition && aspect.weights.opposition) {
        aspectScore += aspect.weights.opposition
        if (!dominantAspect.includes(aspect.name)) {
          dominantAspect = `${aspect.name} tension`
        }
      }
    }

    // Add subtle variation based on lunar day (moon degrees)
    const lunarDayVariation = (moon.longitude % 30) / 30 - 0.5
    aspectScore += lunarDayVariation * 0.3

    return {
      moonSign,
      aspectScore: Math.round(aspectScore * 10) / 10,
      dominantAspect: dominantAspect || 'Neutral'
    }
  } catch (error) {
    devLog.error('Error calculating Moon aspects:', error, 'dailyOutlook')
    return {
      moonSign: 'Unknown',
      aspectScore: 0,
      dominantAspect: 'Neutral'
    }
  }
}

/**
 * Generate emotional climate based on Moon position and aspects
 */
function generateEmotionalClimate(moonData: { moonSign: string; aspectScore: number }, dateSeed: number): string {
  const climateMap: { [key: string]: string[] } = {
    positive: ['calm but curious', 'optimistic', 'hopeful', 'balanced', 'cooperative', 'buoyant', 'inspired', 'harmonious'],
    neutral: ['cautious but curious', 'steady', 'measured', 'observant', 'pragmatic', 'deliberate', 'watchful', 'methodical'],
    negative: ['restless', 'anxious', 'tense', 'volatile', 'pressured', 'uneasy', 'strained', 'turbulent']
  }

  let category: 'positive' | 'neutral' | 'negative' = 'neutral'
  if (moonData.aspectScore > 0) category = 'positive'
  if (moonData.aspectScore < 0) category = 'negative'

  const climates = climateMap[category]
  const seedIndex = (dateSeed + moonData.moonSign.length) % climates.length
  return climates[seedIndex] || climates[0]
}

/**
 * Generate stress-ease index (0-5) based on planetary aspects
 */
function calculateStressEaseIndex(moonData: { aspectScore: number }, date: Date): number {
  try {
    const planets = calculateTropicalPlanets(date)
    const dateSeed = getDateSeed(date)
    
    // Base score from Moon aspects (scaled to 0-5)
    let stressScore = 2.5 // Middle default

    // Adjust based on Moon aspect score
    stressScore += moonData.aspectScore * 0.5

    // Check for retrograde planets (adds stress)
    const retrogradeCount = Object.values(planets).filter((p: any) => p.speed < 0).length
    stressScore += retrogradeCount * 0.3

    // Check for harsh aspects (Saturn/Mars prominence)
    const saturnStress = Math.abs((planets.saturn.longitude % 30) - 15) < 5 ? 0.5 : 0
    const marsStress = Math.abs((planets.mars.longitude % 30) - 15) < 5 ? 0.4 : 0
    stressScore += saturnStress + marsStress

    // Add date-specific variation (day of week, lunar day)
    const dayOfWeek = date.getDay()
    const lunarDayVariation = (planets.moon.longitude % 30) / 30
    const dateVariation = (dateSeed % 100) / 100 - 0.5 // -0.5 to +0.5
    stressScore += dateVariation * 0.2 + lunarDayVariation * 0.15 - (dayOfWeek === 0 || dayOfWeek === 6 ? 0.1 : 0)

    // Clamp to 0-5 range
    stressScore = Math.max(0, Math.min(5, Math.round(stressScore * 10) / 10))
    
    return stressScore
  } catch (error) {
    return 2.5
  }
}

/**
 * Generate dominant planetary aspect for the day
 */
function generateDominantTide(date: Date): { aspect: string; interpretation: string } {
  try {
    const planets = calculateTropicalPlanets(date)
    const dateSeed = getDateSeed(date)
    const aspects: { aspect: string; interpretation: string }[] = [
      {
        aspect: 'Mercury aligned with Jupiter',
        interpretation: 'Important messages gain momentum'
      },
      {
        aspect: 'Mars pressuring the Moon',
        interpretation: 'Spikes in emotional heat'
      },
      {
        aspect: 'Venus eases Saturn walls',
        interpretation: 'Cooperation replaces conflict'
      },
      {
        aspect: 'Jupiter expands opportunities',
        interpretation: 'Growth and optimism prevail'
      },
      {
        aspect: 'Saturn structures chaos',
        interpretation: 'Discipline and limits emerge'
      },
      {
        aspect: 'Uranus disrupts stability',
        interpretation: 'Sudden changes accelerate'
      },
      {
        aspect: 'Neptune softens boundaries',
        interpretation: 'Ideals and imagination flow'
      },
      {
        aspect: 'Pluto transforms structures',
        interpretation: 'Deep change moves beneath the surface'
      },
      {
        aspect: 'Moon meets Venus',
        interpretation: 'Emotional harmony and connection'
      },
      {
        aspect: 'Sun squares Mars',
        interpretation: 'Assertive energy requires channeling'
      }
    ]

    // Select based on prominent planets + date seed for variation
    const moonPhase = (planets.moon.longitude % 30) / 30
    const seedVariation = (dateSeed % 1000) / 1000
    const combinedIndex = ((moonPhase + seedVariation) * aspects.length) % aspects.length
    const aspectIndex = Math.floor(combinedIndex)
    
    return aspects[aspectIndex] || aspects[0]
  } catch (error) {
    return {
      aspect: 'Planetary alignment',
      interpretation: 'Cosmic forces in motion'
    }
  }
}

/**
 * Generate national mood for specified country
 */
function generateNationalMood(country: string, moonData: { moonSign: string; aspectScore: number }, dateSeed: number): {
  publicSentiment: string
  authorityVibe: string
  economyFeel: '↑' | '→' | '↓'
  mostFeltFactor: string
} {
  const sentiments = ['restless', 'assertive', 'relieved', 'cooperative', 'determined', 'cautious', 'optimistic', 'wary', 'hopeful', 'tense', 'energized', 'measured']
  const authorityVibes = ['assertive', 'strict enforcement', 'more supportive', 'rigid', 'active', 'distracted', 'responsive', 'decisive', 'negotiating', 'firm', 'flexible', 'focused']
  const feltFactors = [
    'prices + fuel sensitivity', 
    'transport & bureaucracy delays', 
    'public services', 
    'information flow', 
    'leadership changes',
    'economic indicators',
    'international relations',
    'domestic policies',
    'market volatility',
    'social tensions'
  ]

  // Use date seed to ensure variation across days
  const sentimentIndex = Math.abs(country.length + moonData.aspectScore + dateSeed) % sentiments.length
  const vibeIndex = Math.abs(country.length + dateSeed % 100) % authorityVibes.length
  const factorIndex = Math.abs(country.length + dateSeed % 200) % feltFactors.length

  let economyFeel: '↑' | '→' | '↓' = '→'
  // More nuanced economy feel based on aspect score + date variation
  const economyScore = moonData.aspectScore + ((dateSeed % 50) - 25) / 100
  if (economyScore > 1) economyFeel = '↑'
  if (economyScore < -1) economyFeel = '↓'

  return {
    publicSentiment: sentiments[sentimentIndex] || 'neutral',
    authorityVibe: authorityVibes[vibeIndex] || 'stable',
    economyFeel,
    mostFeltFactor: feltFactors[factorIndex] || 'general economic pressures'
  }
}

/**
 * Generate local environment based on user location
 */
function generateLocalEnvironment(userLocation: string, stressIndex: number, dateSeed: number): {
  atmosphere: string
  socialInteraction: string
  friction: 'low' | 'moderate' | 'high'
  behaviorNote: string
} {
  const atmospheres = [
    'calm', 'restless', 'electric', 'heavy', 'balanced', 
    'busier than usual', 'charged', 'serene', 'dynamic', 
    'turbulent', 'harmonious', 'intense', 'peaceful', 'vibrant'
  ]
  const socialInteractions = [
    'warm', 'impatient', 'indifferent', 'direct', 'competitive', 
    'cooperative', 'formal', 'friendly', 'reserved', 'engaging',
    'distant', 'collaborative', 'assertive', 'relaxed'
  ]
  const behaviorNotes = [
    'Crowds react quickly and visibly to delays',
    'Leaders clash in any group interaction',
    'People become helpful again',
    'Public spaces feel more crowded',
    'Communication flows smoothly',
    'Tensions surface in conversations',
    'Social connections strengthen',
    'Energy feels scattered but productive',
    'Diplomatic exchanges work well',
    'Minor conflicts resolve quickly',
    'Groups form naturally',
    'Individual initiative stands out'
  ]

  const locationHash = userLocation.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  // Use date seed instead of Date.now() for deterministic but varied results
  const atmosphereIndex = (locationHash + dateSeed % 100) % atmospheres.length
  const socialIndex = (locationHash + dateSeed % 200) % socialInteractions.length
  const behaviorIndex = (locationHash + dateSeed % 300) % behaviorNotes.length

  let friction: 'low' | 'moderate' | 'high' = 'moderate'
  // Add date-based variation to friction
  const frictionAdjustment = ((dateSeed % 30) / 30 - 0.5) * 0.3
  const adjustedStress = stressIndex + frictionAdjustment
  if (adjustedStress < 2) friction = 'low'
  if (adjustedStress > 3.5) friction = 'high'

  return {
    atmosphere: atmospheres[atmosphereIndex] || 'neutral',
    socialInteraction: socialInteractions[socialIndex] || 'normal',
    friction,
    behaviorNote: behaviorNotes[behaviorIndex] || 'Normal public behavior expected'
  }
}

/**
 * Generate personal micro-guidance
 */
function generatePersonalGuidance(moonData: { moonSign: string; aspectScore: number }, stressIndex: number, dateSeed: number): {
  bestMove: string
  caution: string
  energyWindow?: string
} {
  const bestMoves = [
    'Respond, don\'t react',
    'Channel pressure into progress',
    'Collaborate',
    'Stay focused on priorities',
    'Take decisive action',
    'Practice patience',
    'Seek alignment with others',
    'Trust your intuition',
    'Take calculated risks',
    'Build bridges',
    'Maintain boundaries',
    'Embrace flexibility',
    'Act on opportunities',
    'Conserve energy wisely'
  ]
  
  const cautions = [
    'Rushing into purchases',
    'Arguments that solve nothing',
    'Overthinking past friction',
    'Impulsive decisions',
    'Avoiding important conversations',
    'Spreading yourself too thin',
    'Ignoring warning signs',
    'Making promises you can\'t keep',
    'Overcommitting resources',
    'Reacting to every stimulus',
    'Burning bridges prematurely',
    'Neglecting self-care'
  ]

  const windows = [
    'Late afternoon supports clarity',
    'Morning for wins',
    'Evening for harmony and connection',
    'Mid-day for important meetings',
    'Early morning for planning',
    'Noon hour for networking',
    'Dusk for reflection',
    'Dawn for new beginnings'
  ]

  // Use date seed to ensure varied selection each day
  const moveIndex = Math.abs(moonData.aspectScore + stressIndex + dateSeed % 50) % bestMoves.length
  const cautionIndex = Math.abs(stressIndex * 2 + dateSeed % 60) % cautions.length
  const windowIndex = Math.abs(moonData.aspectScore + dateSeed % 40) % windows.length

  return {
    bestMove: bestMoves[moveIndex] || 'Stay balanced',
    caution: cautions[cautionIndex] || 'Avoid unnecessary conflict',
    energyWindow: stressIndex < 2.5 ? windows[windowIndex] : undefined
  }
}

/**
 * Generate archetypal force statement
 */
function generateArchetypalForce(moonData: { dominantAspect: string }, stressIndex: number, dateSeed: number): string {
  const forces = [
    'The Messenger knocks — listen before you speak',
    'The Warrior demands action — choose your battles',
    'The Peacemaker opens the door — step through',
    'The Challenger rises — face obstacles directly',
    'Silence reveals the truth',
    'The Oracle speaks — wisdom emerges',
    'The Transformer reshapes reality',
    'The Builder establishes foundations',
    'The Explorer seeks new horizons',
    'The Healer restores balance',
    'The Teacher shares knowledge',
    'The Protector guards what matters',
    'The Visionary sees beyond',
    'The Catalyst sparks change',
    'The Navigator finds the way'
  ]

  // Use date seed to ensure unique archetype each day
  const forceIndex = Math.abs(stressIndex * moonData.dominantAspect.length + dateSeed % 100) % forces.length
  return forces[forceIndex] || 'Cosmic forces are in motion'
}

/**
 * Generate one-line fate summary
 */
function generateFateSummary(moonData: { moonSign: string; aspectScore: number }, stressIndex: number, dateSeed: number): string {
  const summaries = [
    'Small news triggers big shifts',
    'Intensity rewards the disciplined',
    'The breakthrough comes quietly',
    'Change arrives through steady effort',
    'Opportunities emerge from challenges',
    'Wisdom grows through experience',
    'Patience reveals hidden paths',
    'Action opens new doors',
    'Connection bridges divides',
    'Clarity follows reflection',
    'Strength comes from adaptation',
    'Growth demands courage',
    'Balance enables progress',
    'Timing determines outcomes',
    'Destiny unfolds through choice'
  ]

  // Use date seed to ensure unique summary each day
  const summaryIndex = Math.abs(moonData.aspectScore + stressIndex + dateSeed % 80) % summaries.length
  return summaries[summaryIndex] || 'The day unfolds as the cosmos directs'
}

/**
 * Main function: Generate Daily National Outlook for a specific date
 */
export function generateDailyNationalOutlook(
  date: Date,
  userLocation: string,
  country: string = 'India'
): DailyOutlook {
  const dateSeed = getDateSeed(date)
  const moonData = calculateMoonAspects(date)
  const stressEaseIndex = calculateStressEaseIndex(moonData, date)
  const dominantTide = generateDominantTide(date)
  const nationalMood = generateNationalMood(country, moonData, dateSeed)
  const localEnvironment = generateLocalEnvironment(userLocation, stressEaseIndex, dateSeed)
  const personalGuidance = generatePersonalGuidance(moonData, stressEaseIndex, dateSeed)
  const archetypalForce = generateArchetypalForce(moonData, stressEaseIndex, dateSeed)
  const fateSummary = generateFateSummary(moonData, stressEaseIndex, dateSeed)

  // Generate global storyline
  const storylines = [
    'Expect rapid news cycles and market sensitivity',
    'Expect passionate headlines, decisive actions',
    'Good for agreements and calming markets',
    'Major policy shifts gain momentum',
    'Diplomatic efforts intensify',
    'Economic indicators show mixed signals',
    'Technology and innovation take center stage',
    'Social movements gain traction',
    'Environmental concerns rise to prominence',
    'Cultural exchanges and dialogue increase',
    'Financial markets show volatility',
    'Educational reforms come into focus'
  ]
  // Use date seed to ensure varied storylines across days
  const storylineIndex = Math.abs(moonData.aspectScore + stressEaseIndex + dateSeed % 120) % storylines.length

  return {
    date: date.toISOString().split('T')[0],
    globalPulse: {
      emotionalClimate: generateEmotionalClimate(moonData, dateSeed),
      stressEaseIndex: Math.round(stressEaseIndex * 10) / 10,
      dominantTide,
      globalStoryline: storylines[storylineIndex] || 'Global events unfold with cosmic timing'
    },
    nationalMood: nationalMood,
    localEnvironment: localEnvironment,
    personalGuidance: personalGuidance,
    archetypalForce: archetypalForce,
    fateSummary: fateSummary
  }
}

/**
 * Generate 3-day outlook (today + next 2 days)
 */
export function generateThreeDayOutlook(
  userLocation: string,
  country: string = 'India'
): DailyOutlook[] {
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const dayAfter = new Date(today)
  dayAfter.setDate(dayAfter.getDate() + 2)

  return [
    generateDailyNationalOutlook(today, userLocation, country),
    generateDailyNationalOutlook(tomorrow, userLocation, country),
    generateDailyNationalOutlook(dayAfter, userLocation, country)
  ]
}

