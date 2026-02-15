"use client"

import { getChart } from './astronomia-vedic'
import { devLog } from '@/lib/devLogger';

export interface TransitData {
  favorable: TransitEffect[]
  challenging: TransitEffect[]
  upcoming: UpcomingTransit[]
}

export interface TransitEffect {
  description: string
  planet: string
  house: number
  sign: string
  intensity: 'low' | 'moderate' | 'high'
}

export interface UpcomingTransit {
  title: string
  description: string
  date: string
  significance: 'Favorable' | 'Mixed' | 'Transformative' | 'Challenging'
  badgeClass: string
}

/**
 * Calculate current planetary transits based on natal chart
 */
export function calculateTransitData(
  natalChart: any,
  birthData: {
    birthDate: string
    birthTime: string
    birthPlace: string
    latitude: number
    longitude: number
  }
): TransitData {
  try {
    devLog.debug('Calculating transit data', { birthDate: birthData.birthDate, birthTime: birthData.birthTime, birthPlace: birthData.birthPlace }, 'transitCalculator');
    
    // Get current planetary positions
    const currentDate = new Date()
    const currentChart = getChart({
      date: currentDate,
      latitude: birthData.latitude,
      longitude: birthData.longitude,
      name: 'Current Chart',
      place: birthData.birthPlace,
      birthDate: undefined  // Transit charts should NOT calculate Dasha
    })

    devLog.debug('📊 Current chart generated:', !!currentChart);
    devLog.debug('📊 Natal chart available:', !!natalChart);

    if (!currentChart || !natalChart) {
      devLog.debug('⚠️ Missing chart data, returning empty transits');
    return {
        favorable: [],
        challenging: [],
        upcoming: []
      }
    }

    // Calculate house transits
    const favorableTransits = calculateFavorableTransits(currentChart, natalChart)
    const challengingTransits = calculateChallengingTransits(currentChart, natalChart)
    const upcomingTransits = calculateUpcomingTransits(natalChart, birthData)

    devLog.debug('✅ Transit calculation results:');
    devLog.debug('  Favorable:', favorableTransits.length);
    devLog.debug('  Challenging:', challengingTransits.length);
    devLog.debug('  Upcoming:', upcomingTransits.length);

    return {
      favorable: favorableTransits,
      challenging: challengingTransits,
      upcoming: upcomingTransits
    }
  } catch (error) {
    devLog.error('Error calculating transit data:', error, 'transitCalculator')
    return {
      favorable: [],
      challenging: [],
      upcoming: []
    }
  }
}

/**
 * Calculate favorable transits based on Vedic rules
 */
function calculateFavorableTransits(currentChart: any, natalChart: any): TransitEffect[] {
  const favorable: TransitEffect[] = []
  
  if (!currentChart.planets || !natalChart.ascendant) return favorable

  const currentPlanets = currentChart.planets
  const ascendantDegree = natalChart.ascendant.lonSidereal

  // Jupiter transits (always favorable in certain houses)
  if (currentPlanets.jupiter) {
    const jupiterHouseFromAsc = getHouseFromAscendant(currentPlanets.jupiter.lonSidereal, ascendantDegree)
    const jupiterInterpretation = getJupiterTransitInterpretation(jupiterHouseFromAsc)
    if (jupiterInterpretation.type === 'favorable') {
      favorable.push({
        description: jupiterInterpretation.description,
        planet: 'Jupiter',
        house: jupiterHouseFromAsc,
        sign: getSignFromLongitude(currentPlanets.jupiter.lonSidereal),
        intensity: jupiterInterpretation.intensity
      })
    }
  }

  // Venus transits (favorable in 1st, 2nd, 4th, 5th, 7th, 9th, 10th, 11th houses)
  if (currentPlanets.venus) {
    const venusHouseFromAsc = getHouseFromAscendant(currentPlanets.venus.lonSidereal, ascendantDegree)
    const venusInterpretation = getVenusTransitInterpretation(venusHouseFromAsc)
    if (venusInterpretation.type === 'favorable') {
      favorable.push({
        description: venusInterpretation.description,
        planet: 'Venus',
        house: venusHouseFromAsc,
        sign: getSignFromLongitude(currentPlanets.venus.lonSidereal),
        intensity: venusInterpretation.intensity
      })
    }
  }

  // Mercury transits (favorable for Gemini ascendant in communication houses)
  if (currentPlanets.mercury) {
    const mercuryHouseFromAsc = getHouseFromAscendant(currentPlanets.mercury.lonSidereal, ascendantDegree)
    const mercuryInterpretation = getMercuryTransitInterpretation(mercuryHouseFromAsc)
    if (mercuryInterpretation.type === 'favorable') {
      favorable.push({
        description: mercuryInterpretation.description,
        planet: 'Mercury',
        house: mercuryHouseFromAsc,
        sign: getSignFromLongitude(currentPlanets.mercury.lonSidereal),
        intensity: mercuryInterpretation.intensity
      })
    }
  }

  // Sun transits
  if (currentPlanets.sun) {
    const sunHouseFromAsc = getHouseFromAscendant(currentPlanets.sun.lonSidereal, ascendantDegree)
    const sunInterpretation = getSunTransitInterpretation(sunHouseFromAsc)
    if (sunInterpretation.type === 'favorable') {
      favorable.push({
        description: sunInterpretation.description,
        planet: 'Sun',
        house: sunHouseFromAsc,
        sign: getSignFromLongitude(currentPlanets.sun.lonSidereal),
        intensity: sunInterpretation.intensity
      })
    }
  }

  // Moon transits (changes every 2.5 days, always significant)
  if (currentPlanets.moon) {
    const moonHouseFromAsc = getHouseFromAscendant(currentPlanets.moon.lonSidereal, ascendantDegree)
    const moonInterpretation = getMoonTransitInterpretation(moonHouseFromAsc)
    if (moonInterpretation.type === 'favorable') {
      favorable.push({
        description: moonInterpretation.description,
        planet: 'Moon',
        house: moonHouseFromAsc,
        sign: getSignFromLongitude(currentPlanets.moon.lonSidereal),
        intensity: moonInterpretation.intensity
      })
    }
  }

  return favorable
}

/**
 * Calculate challenging transits based on Vedic rules
 */
function calculateChallengingTransits(currentChart: any, natalChart: any): TransitEffect[] {
  const challenging: TransitEffect[] = []
  
  if (!currentChart.planets || !natalChart.ascendant) return challenging

  const currentPlanets = currentChart.planets
  const ascendantDegree = natalChart.ascendant.lonSidereal

  // Saturn transits (generally challenging)
  if (currentPlanets.saturn) {
    const saturnHouseFromAsc = getHouseFromAscendant(currentPlanets.saturn.lonSidereal, ascendantDegree)
    const saturnInterpretation = getSaturnTransitInterpretation(saturnHouseFromAsc)
    if (saturnInterpretation.type === 'challenging') {
      challenging.push({
        description: saturnInterpretation.description,
        planet: 'Saturn',
        house: saturnHouseFromAsc,
        sign: getSignFromLongitude(currentPlanets.saturn.lonSidereal),
        intensity: saturnInterpretation.intensity
      })
    }
  }

  // Mars transits (challenging for energy)
  if (currentPlanets.mars) {
    const marsHouseFromAsc = getHouseFromAscendant(currentPlanets.mars.lonSidereal, ascendantDegree)
    const marsInterpretation = getMarsTransitInterpretation(marsHouseFromAsc)
    if (marsInterpretation.type === 'challenging') {
      challenging.push({
        description: marsInterpretation.description,
        planet: 'Mars',
        house: marsHouseFromAsc,
        sign: getSignFromLongitude(currentPlanets.mars.lonSidereal),
        intensity: marsInterpretation.intensity
      })
    }
  }

  // Rahu transits (challenging for illusions)
  if (currentPlanets.rahu) {
    const rahuHouseFromAsc = getHouseFromAscendant(currentPlanets.rahu.lonSidereal, ascendantDegree)
    const rahuInterpretation = getRahuTransitInterpretation(rahuHouseFromAsc)
    if (rahuInterpretation.type === 'challenging') {
      challenging.push({
        description: rahuInterpretation.description,
        planet: 'Rahu',
        house: rahuHouseFromAsc,
        sign: getSignFromLongitude(currentPlanets.rahu.lonSidereal),
        intensity: rahuInterpretation.intensity
      })
    }
  }

  // Ketu transits (challenging for detachment)
  if (currentPlanets.ketu) {
    const ketuHouseFromAsc = getHouseFromAscendant(currentPlanets.ketu.lonSidereal, ascendantDegree)
    const ketuInterpretation = getKetuTransitInterpretation(ketuHouseFromAsc)
    if (ketuInterpretation.type === 'challenging') {
      challenging.push({
        description: ketuInterpretation.description,
        planet: 'Ketu',
        house: ketuHouseFromAsc,
        sign: getSignFromLongitude(currentPlanets.ketu.lonSidereal),
        intensity: ketuInterpretation.intensity
      })
    }
  }

  return challenging
}

/**
 * Calculate upcoming major transits
 */
function calculateUpcomingTransits(
  natalChart: any,
  birthData: {
    birthDate: string
    birthTime: string
    birthPlace: string
    latitude: number
    longitude: number
  }
): UpcomingTransit[] {
  const upcoming: UpcomingTransit[] = []
  
  try {
    // Calculate upcoming Jupiter transit (every ~12 years)
    const jupiterTransit = calculateJupiterTransit(natalChart, birthData)
    if (jupiterTransit) {
      upcoming.push(jupiterTransit)
    }

    // Calculate upcoming Saturn transit (every ~29 years)
    const saturnTransit = calculateSaturnTransit(natalChart, birthData)
    if (saturnTransit) {
      upcoming.push(saturnTransit)
    }

    // Calculate Rahu-Ketu axis shift (every ~18 years)
    const rahuKetuTransit = calculateRahuKetuTransit(natalChart, birthData)
    if (rahuKetuTransit) {
      upcoming.push(rahuKetuTransit)
    }

  } catch (error) {
    devLog.error('Error calculating upcoming transits:', error, 'transitCalculator')
  }

  return upcoming
}

/**
 * Calculate next Jupiter transit
 */
function calculateJupiterTransit(natalChart: any, birthData: any): UpcomingTransit | null {
  // Simplified calculation - Jupiter moves ~30 degrees per year
  // This is a placeholder for more complex calculations
  
  const currentDate = new Date()
  const nextYear = new Date(currentDate.getFullYear() + 1, 4, 1) // May next year
    
    return {
    title: 'Jupiter enters Pisces',
    description: `${nextYear.getFullYear()} - Spiritual growth & wisdom`,
    date: nextYear.toISOString(),
    significance: 'Favorable',
    badgeClass: 'bg-green-500/20 text-green-300'
  }
}

/**
 * Calculate next Saturn transit
 */
function calculateSaturnTransit(natalChart: any, birthData: any): UpcomingTransit | null {
  // Simplified calculation - Saturn moves ~12 degrees per year
  const currentDate = new Date()
  const nextYear = new Date(currentDate.getFullYear() + 1, 2, 1) // March next year
    
    return {
    title: 'Saturn enters Aquarius',
    description: `${nextYear.getFullYear()} - Career & responsibilities`,
    date: nextYear.toISOString(),
    significance: 'Mixed',
    badgeClass: 'bg-yellow-500/20 text-yellow-300'
  }
}

/**
 * Calculate Rahu-Ketu axis shift
 */
function calculateRahuKetuTransit(natalChart: any, birthData: any): UpcomingTransit | null {
  // Simplified calculation - Rahu-Ketu axis shifts every ~18 years
  const currentDate = new Date()
  const nextYear = new Date(currentDate.getFullYear() + 1, 3, 1) // April next year
    
    return {
    title: 'Rahu-Ketu axis shift',
    description: `${nextYear.getFullYear()} - Life direction changes`,
    date: nextYear.toISOString(),
    significance: 'Transformative',
    badgeClass: 'bg-purple-500/20 text-purple-300'
  }
}

/**
 * Get house number from longitude
 */
function getHouseFromLongitude(longitude: number, houses: any[]): number {
  if (!houses || houses.length === 0) return 1
  
  // Find which house the longitude falls into
  for (let i = 0; i < houses.length; i++) {
    const house = houses[i]
    const startDegree = house.startDegree || 0
    const endDegree = house.endDegree || 30
    
    if (longitude >= startDegree && longitude < endDegree) {
      return i + 1
    }
  }
  
  return 1 // Default to 1st house
}

/**
 * Get sign name from longitude
 */
function getSignFromLongitude(longitude: number): string {
  const signs = [
    'Aries', 'Taurus', 'Gemini', 'Cancer',
    'Leo', 'Virgo', 'Libra', 'Scorpio',
    'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ]
  
  const signIndex = Math.floor(longitude / 30)
  return signs[signIndex % 12] || 'Aries'
}

/**
 * Calculate house position from Ascendant
 */
function getHouseFromAscendant(planetLon: number, ascendantLon: number): number {
  let diff = planetLon - ascendantLon
  if (diff < 0) diff += 360
  return Math.floor(diff / 30) + 1
}

/**
 * Transit interpretation functions for each planet
 */
function getJupiterTransitInterpretation(house: number): { type: 'favorable' | 'challenging' | 'neutral', description: string, intensity: 'low' | 'moderate' | 'high' } {
  const interpretations = {
    1: { type: 'favorable', description: 'Jupiter in 1st house - Increased wisdom, optimism, and personal growth', intensity: 'high' },
    2: { type: 'favorable', description: 'Jupiter in 2nd house - Financial gains and family harmony', intensity: 'high' },
    3: { type: 'favorable', description: 'Jupiter in 3rd house - Enhanced communication and courage', intensity: 'moderate' },
    4: { type: 'favorable', description: 'Jupiter in 4th house - Domestic happiness and property gains', intensity: 'high' },
    5: { type: 'favorable', description: 'Jupiter in 5th house - Creativity, children, and speculation favored', intensity: 'high' },
    6: { type: 'challenging', description: 'Jupiter in 6th house - Challenges with health and enemies', intensity: 'moderate' },
    7: { type: 'favorable', description: 'Jupiter in 7th house - Marriage and partnership blessings', intensity: 'high' },
    8: { type: 'challenging', description: 'Jupiter in 8th house - Transformation and unexpected events', intensity: 'moderate' },
    9: { type: 'favorable', description: 'Jupiter in 9th house - Spiritual growth and higher learning', intensity: 'high' },
    10: { type: 'favorable', description: 'Jupiter in 10th house - Career success and recognition', intensity: 'high' },
    11: { type: 'favorable', description: 'Jupiter in 11th house - Gains, achievements, and fulfilled desires', intensity: 'high' },
    12: { type: 'neutral', description: 'Jupiter in 12th house - Spiritual pursuits and foreign connections', intensity: 'moderate' }
  } as const
  return interpretations[house as keyof typeof interpretations] || interpretations[1]
}

function getVenusTransitInterpretation(house: number): { type: 'favorable' | 'challenging' | 'neutral', description: string, intensity: 'low' | 'moderate' | 'high' } {
  const interpretations = {
    1: { type: 'favorable', description: 'Venus in 1st house - Enhanced beauty, charm, and social appeal', intensity: 'high' },
    2: { type: 'favorable', description: 'Venus in 2nd house - Financial gains through arts and luxury', intensity: 'high' },
    3: { type: 'favorable', description: 'Venus in 3rd house - Improved communication and artistic expression', intensity: 'moderate' },
    4: { type: 'favorable', description: 'Venus in 4th house - Domestic harmony and property investments', intensity: 'high' },
    5: { type: 'favorable', description: 'Venus in 5th house - Romance, creativity, and entertainment', intensity: 'high' },
    6: { type: 'challenging', description: 'Venus in 6th house - Health issues and relationship conflicts', intensity: 'moderate' },
    7: { type: 'favorable', description: 'Venus in 7th house - Marriage, partnerships, and social success', intensity: 'high' },
    8: { type: 'challenging', description: 'Venus in 8th house - Relationship transformations and financial ups/downs', intensity: 'moderate' },
    9: { type: 'favorable', description: 'Venus in 9th house - Higher learning, travel, and spiritual pursuits', intensity: 'high' },
    10: { type: 'favorable', description: 'Venus in 10th house - Career success in arts, beauty, or luxury fields', intensity: 'high' },
    11: { type: 'favorable', description: 'Venus in 11th house - Social gains, fulfilled desires, and friendships', intensity: 'high' },
    12: { type: 'neutral', description: 'Venus in 12th house - Spiritual relationships and hidden pleasures', intensity: 'moderate' }
  } as const
  return interpretations[house as keyof typeof interpretations] || interpretations[1]
}

function getMercuryTransitInterpretation(house: number): { type: 'favorable' | 'challenging' | 'neutral', description: string, intensity: 'low' | 'moderate' | 'high' } {
  const interpretations = {
    1: { type: 'favorable', description: 'Mercury in 1st house - Enhanced intelligence and communication skills', intensity: 'high' },
    2: { type: 'favorable', description: 'Mercury in 2nd house - Financial gains through communication and trade', intensity: 'moderate' },
    3: { type: 'favorable', description: 'Mercury in 3rd house - Excellent for writing, teaching, and networking', intensity: 'high' },
    4: { type: 'favorable', description: 'Mercury in 4th house - Mental peace and property-related communications', intensity: 'moderate' },
    5: { type: 'favorable', description: 'Mercury in 5th house - Creative writing, education, and speculation', intensity: 'moderate' },
    6: { type: 'challenging', description: 'Mercury in 6th house - Health concerns and communication issues', intensity: 'moderate' },
    7: { type: 'favorable', description: 'Mercury in 7th house - Business partnerships and intellectual relationships', intensity: 'moderate' },
    8: { type: 'challenging', description: 'Mercury in 8th house - Mental stress and communication breakdowns', intensity: 'moderate' },
    9: { type: 'favorable', description: 'Mercury in 9th house - Higher learning, teaching, and philosophical pursuits', intensity: 'high' },
    10: { type: 'favorable', description: 'Mercury in 10th house - Career success in communication and technology', intensity: 'high' },
    11: { type: 'favorable', description: 'Mercury in 11th house - Social networking and intellectual friendships', intensity: 'moderate' },
    12: { type: 'neutral', description: 'Mercury in 12th house - Spiritual studies and hidden communications', intensity: 'moderate' }
  } as const
  return interpretations[house as keyof typeof interpretations] || interpretations[1]
}

function getSunTransitInterpretation(house: number): { type: 'favorable' | 'challenging' | 'neutral', description: string, intensity: 'low' | 'moderate' | 'high' } {
  const interpretations = {
    1: { type: 'favorable', description: 'Sun in 1st house - Increased confidence, leadership, and vitality', intensity: 'high' },
    2: { type: 'favorable', description: 'Sun in 2nd house - Financial gains and family recognition', intensity: 'moderate' },
    3: { type: 'favorable', description: 'Sun in 3rd house - Enhanced courage, communication, and initiative', intensity: 'moderate' },
    4: { type: 'favorable', description: 'Sun in 4th house - Domestic happiness and property gains', intensity: 'moderate' },
    5: { type: 'favorable', description: 'Sun in 5th house - Creative success and recognition for talents', intensity: 'high' },
    6: { type: 'challenging', description: 'Sun in 6th house - Health issues and workplace conflicts', intensity: 'moderate' },
    7: { type: 'favorable', description: 'Sun in 7th house - Partnership success and public recognition', intensity: 'moderate' },
    8: { type: 'challenging', description: 'Sun in 8th house - Transformation and unexpected changes', intensity: 'moderate' },
    9: { type: 'favorable', description: 'Sun in 9th house - Spiritual growth, higher learning, and recognition', intensity: 'high' },
    10: { type: 'favorable', description: 'Sun in 10th house - Career advancement and public recognition', intensity: 'high' },
    11: { type: 'favorable', description: 'Sun in 11th house - Social success and fulfilled ambitions', intensity: 'moderate' },
    12: { type: 'neutral', description: 'Sun in 12th house - Spiritual pursuits and foreign connections', intensity: 'moderate' }
  } as const
  return interpretations[house as keyof typeof interpretations] || interpretations[1]
}

function getMoonTransitInterpretation(house: number): { type: 'favorable' | 'challenging' | 'neutral', description: string, intensity: 'low' | 'moderate' | 'high' } {
  const interpretations = {
    1: { type: 'favorable', description: 'Moon in 1st house - Emotional sensitivity and intuitive abilities', intensity: 'moderate' },
    2: { type: 'favorable', description: 'Moon in 2nd house - Financial gains through emotions and intuition', intensity: 'moderate' },
    3: { type: 'favorable', description: 'Moon in 3rd house - Enhanced communication and emotional expression', intensity: 'moderate' },
    4: { type: 'favorable', description: 'Moon in 4th house - Domestic happiness and emotional security', intensity: 'high' },
    5: { type: 'favorable', description: 'Moon in 5th house - Creative inspiration and emotional fulfillment', intensity: 'moderate' },
    6: { type: 'challenging', description: 'Moon in 6th house - Health concerns and emotional instability', intensity: 'moderate' },
    7: { type: 'favorable', description: 'Moon in 7th house - Emotional partnerships and public appeal', intensity: 'moderate' },
    8: { type: 'challenging', description: 'Moon in 8th house - Emotional transformations and hidden fears', intensity: 'moderate' },
    9: { type: 'favorable', description: 'Moon in 9th house - Spiritual insights and emotional wisdom', intensity: 'moderate' },
    10: { type: 'favorable', description: 'Moon in 10th house - Public recognition and emotional leadership', intensity: 'moderate' },
    11: { type: 'favorable', description: 'Moon in 11th house - Emotional fulfillment of desires', intensity: 'moderate' },
    12: { type: 'neutral', description: 'Moon in 12th house - Spiritual emotions and hidden feelings', intensity: 'moderate' }
  } as const
  return interpretations[house as keyof typeof interpretations] || interpretations[1]
}

function getSaturnTransitInterpretation(house: number): { type: 'favorable' | 'challenging' | 'neutral', description: string, intensity: 'low' | 'moderate' | 'high' } {
  const interpretations = {
    1: { type: 'challenging', description: 'Saturn in 1st house - Self-discipline, restrictions, and health concerns', intensity: 'high' },
    2: { type: 'challenging', description: 'Saturn in 2nd house - Financial delays and family responsibilities', intensity: 'high' },
    3: { type: 'challenging', description: 'Saturn in 3rd house - Communication difficulties and sibling issues', intensity: 'moderate' },
    4: { type: 'challenging', description: 'Saturn in 4th house - Domestic problems and property delays', intensity: 'high' },
    5: { type: 'challenging', description: 'Saturn in 5th house - Creative blocks and children-related challenges', intensity: 'moderate' },
    6: { type: 'challenging', description: 'Saturn in 6th house - Health issues and workplace difficulties', intensity: 'high' },
    7: { type: 'challenging', description: 'Saturn in 7th house - Partnership delays and relationship challenges', intensity: 'high' },
    8: { type: 'challenging', description: 'Saturn in 8th house - Transformation through difficulties and losses', intensity: 'high' },
    9: { type: 'challenging', description: 'Saturn in 9th house - Spiritual discipline and higher learning delays', intensity: 'moderate' },
    10: { type: 'challenging', description: 'Saturn in 10th house - Career challenges and delayed recognition', intensity: 'high' },
    11: { type: 'challenging', description: 'Saturn in 11th house - Delayed gains and friendship difficulties', intensity: 'moderate' },
    12: { type: 'neutral', description: 'Saturn in 12th house - Spiritual discipline and foreign connections', intensity: 'moderate' }
  } as const
  return interpretations[house as keyof typeof interpretations] || interpretations[1]
}

function getMarsTransitInterpretation(house: number): { type: 'favorable' | 'challenging' | 'neutral', description: string, intensity: 'low' | 'moderate' | 'high' } {
  const interpretations = {
    1: { type: 'challenging', description: 'Mars in 1st house - Increased aggression, accidents, and health issues', intensity: 'high' },
    2: { type: 'challenging', description: 'Mars in 2nd house - Financial conflicts and family disputes', intensity: 'moderate' },
    3: { type: 'favorable', description: 'Mars in 3rd house - Enhanced courage, communication, and initiative', intensity: 'moderate' },
    4: { type: 'challenging', description: 'Mars in 4th house - Domestic conflicts and property disputes', intensity: 'moderate' },
    5: { type: 'favorable', description: 'Mars in 5th house - Creative energy and competitive success', intensity: 'moderate' },
    6: { type: 'favorable', description: 'Mars in 6th house - Success over enemies and health improvements', intensity: 'moderate' },
    7: { type: 'challenging', description: 'Mars in 7th house - Partnership conflicts and relationship disputes', intensity: 'high' },
    8: { type: 'challenging', description: 'Mars in 8th house - Accidents, transformations, and unexpected events', intensity: 'high' },
    9: { type: 'favorable', description: 'Mars in 9th house - Spiritual courage and higher learning success', intensity: 'moderate' },
    10: { type: 'favorable', description: 'Mars in 10th house - Career advancement and leadership opportunities', intensity: 'moderate' },
    11: { type: 'favorable', description: 'Mars in 11th house - Achievement of goals and social success', intensity: 'moderate' },
    12: { type: 'challenging', description: 'Mars in 12th house - Hidden enemies and spiritual conflicts', intensity: 'moderate' }
  } as const
  return interpretations[house as keyof typeof interpretations] || interpretations[1]
}

function getRahuTransitInterpretation(house: number): { type: 'favorable' | 'challenging' | 'neutral', description: string, intensity: 'low' | 'moderate' | 'high' } {
  const interpretations = {
    1: { type: 'challenging', description: 'Rahu in 1st house - Identity confusion and unexpected changes', intensity: 'high' },
    2: { type: 'challenging', description: 'Rahu in 2nd house - Financial instability and family issues', intensity: 'moderate' },
    3: { type: 'challenging', description: 'Rahu in 3rd house - Communication problems and sibling conflicts', intensity: 'moderate' },
    4: { type: 'challenging', description: 'Rahu in 4th house - Domestic instability and property issues', intensity: 'moderate' },
    5: { type: 'challenging', description: 'Rahu in 5th house - Creative blocks and children-related problems', intensity: 'moderate' },
    6: { type: 'challenging', description: 'Rahu in 6th house - Health issues and workplace conflicts', intensity: 'high' },
    7: { type: 'challenging', description: 'Rahu in 7th house - Relationship illusions and partnership problems', intensity: 'high' },
    8: { type: 'challenging', description: 'Rahu in 8th house - Unexpected transformations and hidden enemies', intensity: 'high' },
    9: { type: 'challenging', description: 'Rahu in 9th house - Spiritual confusion and higher learning delays', intensity: 'moderate' },
    10: { type: 'challenging', description: 'Rahu in 10th house - Career instability and reputation issues', intensity: 'moderate' },
    11: { type: 'challenging', description: 'Rahu in 11th house - Unfulfilled desires and friendship problems', intensity: 'moderate' },
    12: { type: 'neutral', description: 'Rahu in 12th house - Spiritual illusions and foreign connections', intensity: 'moderate' }
  } as const
  return interpretations[house as keyof typeof interpretations] || interpretations[1]
}

function getKetuTransitInterpretation(house: number): { type: 'favorable' | 'challenging' | 'neutral', description: string, intensity: 'low' | 'moderate' | 'high' } {
  const interpretations = {
    1: { type: 'challenging', description: 'Ketu in 1st house - Detachment from self and identity confusion', intensity: 'high' },
    2: { type: 'challenging', description: 'Ketu in 2nd house - Financial detachment and family separations', intensity: 'moderate' },
    3: { type: 'challenging', description: 'Ketu in 3rd house - Communication difficulties and sibling separations', intensity: 'moderate' },
    4: { type: 'challenging', description: 'Ketu in 4th house - Domestic instability and property losses', intensity: 'moderate' },
    5: { type: 'challenging', description: 'Ketu in 5th house - Creative blocks and children-related separations', intensity: 'moderate' },
    6: { type: 'challenging', description: 'Ketu in 6th house - Health issues and workplace separations', intensity: 'moderate' },
    7: { type: 'challenging', description: 'Ketu in 7th house - Relationship detachment and partnership separations', intensity: 'high' },
    8: { type: 'challenging', description: 'Ketu in 8th house - Spiritual transformation and unexpected losses', intensity: 'high' },
    9: { type: 'challenging', description: 'Ketu in 9th house - Spiritual detachment and higher learning difficulties', intensity: 'moderate' },
    10: { type: 'challenging', description: 'Ketu in 10th house - Career detachment and reputation issues', intensity: 'moderate' },
    11: { type: 'challenging', description: 'Ketu in 11th house - Social detachment and unfulfilled desires', intensity: 'moderate' },
    12: { type: 'neutral', description: 'Ketu in 12th house - Spiritual detachment and foreign connections', intensity: 'moderate' }
  } as const
  return interpretations[house as keyof typeof interpretations] || interpretations[1]
}