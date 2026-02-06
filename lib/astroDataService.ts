import { generateChartData } from './astrology'
import { generateFallbackAstroData, isFallbackDataReliable } from './astroFallback'
import { getIntelligentAstroData, getSystemStatus } from './astroIntelligence'
import { doc, setDoc, getDoc, collection } from 'firebase/firestore'
import { getFirebaseDB } from './firebase';
import { devLog, devWarn } from './devLogger';
import { CACHE_TTL } from './cacheConstants';

// Comprehensive astrological data structure
export interface ComprehensiveAstroData {
  // Basic info
  userId: string
  birthDate: string
  birthTime?: string
  birthPlace: string
  lastFetched: number
  
  // Core astrological data
  sunSign: string
  moonSign: string
  risingSign: string
  
  // Planetary positions
  planets: Array<{
    name: string
    sign: string
    degree: number
    house: number
    longitude: number
    latitude: number
    speed: number
    isRetrograde: boolean
  }>
  
  // House system
  houses: Array<{
    number: number
    sign: string
    degree: number
    cusp: number
  }>
  
  // Aspects between planets
  aspects: Array<{
    planet1: string
    planet2: string
    type: string
    orb: number
    angle: number
  }>
  
  // Additional data
  elements: {
    fire: number
    earth: number
    air: number
    water: number
  }
  
  // Chart images
  chartImage?: string
  vedicCharts?: {
    north_indian_chart?: string
    south_indian_chart?: string
    navamsa_chart?: string
  }
  
  modalities: {
    cardinal: number
    fixed: number
    mutable: number
  }
  
  // Calculated insights
  personalityTraits: string[]
  lifePath: string
  challenges: string[]
  strengths: string[]
  compatibility: {
    bestMatches: string[]
    challengingMatches: string[]
  }
  
  // Timing data
  currentTransits: Array<{
    planet: string
    aspect: string
    targetPlanet: string
    orb: number
    effect: string
  }>
  
  // Metadata
  metadata: {
    reportId: string
    version: string
    source: 'internal_calculations' | 'fallback' | 'emergency_fallback' | 'intelligent_system' | 'external_with_learning' | 'astroapp'
    isComprehensive: true
    isFallback?: boolean
    systemConfidence?: number
    learningApplied?: boolean
  }
}

// Cache for in-memory storage
const astroDataCache = new Map<string, ComprehensiveAstroData>()

// Get comprehensive astrological data for a user
export async function getComprehensiveAstroData(
  userId: string,
  birthDate: string,
  birthPlace: string,
  birthTime?: string,
  forceRefresh: boolean = false
): Promise<ComprehensiveAstroData> {
  
  // Clear cache if force refresh is requested
  if (forceRefresh) {
    devLog.info('🔄 Force refresh requested - clearing cache for user:', userId, 'astroData')
    astroDataCache.delete(userId)
  }
  
  // Check cache first
  if (!forceRefresh && astroDataCache.has(userId)) {
    const cached = astroDataCache.get(userId)!
    // Check if data is still valid (less than 24 hours old)
    if (Date.now() - cached.lastFetched < CACHE_TTL.REPORTS) {
      devLog.info('Using cached astrological data for user:', userId, 'astroData')
      return cached
    }
  }
  
  // Check Firebase storage (skip if force refresh)
  if (!forceRefresh) {
    try {
      const db = getFirebaseDB()
      const docRef = doc(db, 'users', userId, 'astroProfile', 'comprehensive')
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        const storedData = docSnap.data() as ComprehensiveAstroData
        // TEMPORARILY DISABLED: Check if data is still valid and matches current birth details
        // if (Date.now() - storedData.lastFetched < 24 * 60 * 60 * 1000 &&
        //     storedData.birthDate === birthDate &&
        //     storedData.birthPlace === birthPlace &&
        //     storedData.birthTime === birthTime) {
        //   console.log('Using stored astrological data for user:', userId)
        //   astroDataCache.set(userId, storedData)
        //   return storedData
        // }
        devLog.info('🚫 CACHING DISABLED: Skipping stored astrological data for user:', userId, 'astroData')
      }
    } catch (error) {
      devWarn('Error checking stored astro data:', error)
    }
  } else {
    devLog.info('🔄 Force refresh - skipping Firebase cache check', undefined, 'astroData')
  }
  
  // Use intelligent system for optimal data generation
  devLog.info('🤖 Using intelligent astrological system for user:', userId, 'astroData')
  
  try {
    const intelligentData = await getIntelligentAstroData(userId, birthDate, birthPlace, birthTime)
    
    // Extract Sun and Moon from planets array as fallback for Vedic data
    const sunPlanet = intelligentData.planets?.find((p: any) => p.name === 'Sun' || p.name === 'sun');
    const moonPlanet = intelligentData.planets?.find((p: any) => p.name === 'Moon' || p.name === 'moon');
    
    // Transform to comprehensive format
    const comprehensiveData: ComprehensiveAstroData = {
      userId,
      birthDate,
      birthTime,
      birthPlace,
      lastFetched: Date.now(),
      
      // Support both Western (direct fields) and Vedic (extracted from planets)
      sunSign: intelligentData.sun_sign || sunPlanet?.sign || sunPlanet?.signName || 'Unknown',
      moonSign: intelligentData.moon_sign || moonPlanet?.sign || moonPlanet?.signName || 'Unknown',
      risingSign: intelligentData.rising_sign || intelligentData.ascendant?.signName || intelligentData.ascendant?.sign || 'Unknown',
      
      // Ensure all arrays have defaults
      planets: intelligentData.planets || [],
      houses: intelligentData.houses || [],
      aspects: intelligentData.aspects || [],
      elements: intelligentData.elements || { fire: 0, earth: 0, air: 0, water: 0 },
      modalities: intelligentData.modalities || { cardinal: 0, fixed: 0, mutable: 0 },
      
      personalityTraits: intelligentData.personalityTraits || [],
      lifePath: intelligentData.lifePath || '',
      challenges: intelligentData.challenges || [],
      strengths: intelligentData.strengths || [],
      compatibility: intelligentData.compatibility || { bestMatches: [], challengingMatches: [] },
      currentTransits: intelligentData.currentTransits || [],
      
      // Include chart images (ensure no undefined values)
      chartImage: intelligentData.chartImage || null,
      vedicCharts: intelligentData.vedicCharts || {},
      
      metadata: {
        reportId: `intelligent_${userId}_${Date.now()}`,
        version: intelligentData.metadata?.version || '2.0',
        source: intelligentData.metadata?.source || 'intelligent_system',
        isComprehensive: true,
        isFallback: intelligentData.metadata?.source?.includes('internal') || false,
        systemConfidence: intelligentData.metadata?.systemConfidence || 0.85,
        learningApplied: intelligentData.metadata?.learningApplied || false
      }
    }
    
    // Store in Firebase
    try {
      const db = getFirebaseDB()
      const docRef = doc(db, 'users', userId, 'astroProfile', 'comprehensive')
      await setDoc(docRef, comprehensiveData)
      devLog.info('Stored intelligent astro data in Firebase for user:', userId, 'astroData')
    } catch (storageError) {
      devWarn('Error storing intelligent astro data in Firebase:', storageError)
    }
    
    // Store in cache
    astroDataCache.set(userId, comprehensiveData)
    
    return comprehensiveData
    
  } catch (intelligentError) {
    console.error('Intelligent system failed:', intelligentError)
    throw new Error('Astrological data service is not available. Please try again later.')
  }
}

// Transform raw AstroApp data to comprehensive format
async function transformToComprehensiveData(
  userId: string,
  birthDate: string,
  birthPlace: string,
  birthTime: string | undefined,
  rawData: any
): Promise<ComprehensiveAstroData> {
  
  // Extract basic planetary data
  const planets = rawData.planets?.map((planet: any) => ({
    name: planet.name,
    sign: planet.sign,
    degree: planet.degree || 0,
    house: planet.house || 0,
    longitude: planet.longitude || 0,
    latitude: planet.latitude || 0,
    speed: planet.speed || 0,
    isRetrograde: (planet.speed || 0) < 0
  })) || []
  
  // Extract house data
  const houses = rawData.houses?.map((house: any, index: number) => ({
    number: index + 1,
    sign: house.sign,
    degree: house.degree || 0,
    cusp: house.cusp || 0
  })) || []
  
  // Calculate elements and modalities
  const elements = calculateElements(planets)
  const modalities = calculateModalities(planets)
  
  // Generate personality insights
  const personalityTraits = generatePersonalityTraits(planets, elements, modalities)
  const lifePath = generateLifePath(planets, houses)
  const challenges = generateChallenges(planets, rawData.aspects || [])
  const strengths = generateStrengths(planets, elements)
  
  // Generate compatibility data
  const compatibility = generateCompatibility(planets, elements, modalities)
  
  // Calculate current transits (simplified for now)
  const currentTransits = calculateCurrentTransits(planets)
  
  return {
    userId,
    birthDate,
    birthTime,
    birthPlace,
    lastFetched: Date.now(),
    
    sunSign: rawData.sun_sign || 'Unknown',
    moonSign: rawData.moon_sign || 'Unknown',
    risingSign: rawData.rising_sign || 'Unknown',
    
    planets,
    houses,
    aspects: rawData.aspects || [],
    elements,
    modalities,
    
    personalityTraits,
    lifePath,
    challenges,
    strengths,
    compatibility,
    currentTransits,
    
    metadata: {
      reportId: `astro_${userId}_${Date.now()}`,
      version: '1.0',
      source: 'internal_calculations',
      isComprehensive: true
    }
  }
}

// Helper functions for calculations
function calculateElements(planets: any[]): { fire: number; earth: number; air: number; water: number } {
  const elementCounts = { fire: 0, earth: 0, air: 0, water: 0 }
  
  const elementSigns = {
    fire: ['Aries', 'Leo', 'Sagittarius'],
    earth: ['Taurus', 'Virgo', 'Capricorn'],
    air: ['Gemini', 'Libra', 'Aquarius'],
    water: ['Cancer', 'Scorpio', 'Pisces']
  }
  
  planets.forEach(planet => {
    Object.entries(elementSigns).forEach(([element, signs]) => {
      if (signs.includes(planet.sign)) {
        elementCounts[element as keyof typeof elementCounts]++
      }
    })
  })
  
  return elementCounts
}

function calculateModalities(planets: any[]): { cardinal: number; fixed: number; mutable: number } {
  const modalityCounts = { cardinal: 0, fixed: 0, mutable: 0 }
  
  const modalitySigns = {
    cardinal: ['Aries', 'Cancer', 'Libra', 'Capricorn'],
    fixed: ['Taurus', 'Leo', 'Scorpio', 'Aquarius'],
    mutable: ['Gemini', 'Virgo', 'Sagittarius', 'Pisces']
  }
  
  planets.forEach(planet => {
    Object.entries(modalitySigns).forEach(([modality, signs]) => {
      if (signs.includes(planet.sign)) {
        modalityCounts[modality as keyof typeof modalityCounts]++
      }
    })
  })
  
  return modalityCounts
}

function generatePersonalityTraits(planets: any[], elements: any, modalities: any): string[] {
  const traits = []
  
  // Sun sign traits
  const sun = planets.find(p => p.name === 'Sun')
  if (sun) {
    traits.push(`${sun.sign} energy: Natural leadership and creativity`)
  }
  
  // Moon sign traits
  const moon = planets.find(p => p.name === 'Moon')
  if (moon) {
    traits.push(`${moon.sign} emotions: Intuitive and nurturing nature`)
  }
  
  // Elemental balance
  const dominantElement = Object.entries(elements).reduce((a, b) => elements[a[0]] > elements[b[0]] ? a : b)[0]
  traits.push(`Dominant ${dominantElement} element: Dynamic and passionate`)
  
  return traits
}

function generateLifePath(planets: any[], houses: any[]): string {
  const sun = planets.find(p => p.name === 'Sun')
  const moon = planets.find(p => p.name === 'Moon')
  
  if (sun && moon) {
    return `Your life path combines ${sun.sign} leadership with ${moon.sign} intuition, creating a unique journey of self-discovery and growth.`
  }
  
  return 'Your life path is guided by the cosmic energies, leading you toward your highest potential.'
}

function generateChallenges(planets: any[], aspects: any[]): string[] {
  const challenges = []
  
  // Look for challenging aspects
  const challengingAspects = aspects.filter(aspect => 
    ['Square', 'Opposition'].includes(aspect.type)
  )
  
  challengingAspects.forEach(aspect => {
    challenges.push(`Balancing ${aspect.planet1} and ${aspect.planet2} energies`)
  })
  
  if (challenges.length === 0) {
    challenges.push('Learning to trust your intuition')
    challenges.push('Finding balance between action and reflection')
  }
  
  return challenges
}

function generateStrengths(planets: any[], elements: any): string[] {
  const strengths: string[] = []
  
  // Strong planets in their ruling signs
  const strongPlanets = planets.filter(planet => {
    const rulingSigns = {
      'Sun': 'Leo',
      'Moon': 'Cancer',
      'Mercury': ['Gemini', 'Virgo'],
      'Venus': ['Taurus', 'Libra'],
      'Mars': ['Aries', 'Scorpio'],
      'Jupiter': ['Sagittarius', 'Pisces'],
      'Saturn': ['Capricorn', 'Aquarius']
    }
    
    const ruling = rulingSigns[planet.name as keyof typeof rulingSigns]
    return Array.isArray(ruling) ? ruling.includes(planet.sign) : ruling === planet.sign
  })
  
  strongPlanets.forEach(planet => {
    strengths.push(`Strong ${planet.name} in ${planet.sign}: Natural talent and confidence`)
  })
  
  return strengths
}

function generateCompatibility(planets: any[], elements: any, modalities: any): {
  bestMatches: string[];
  challengingMatches: string[];
} {
  const sun = planets.find(p => p.name === 'Sun')
  
  if (!sun) {
    return { bestMatches: [], challengingMatches: [] }
  }
  
  const compatibilitySigns = {
    'Aries': { best: ['Leo', 'Sagittarius', 'Gemini'], challenging: ['Cancer', 'Capricorn'] },
    'Taurus': { best: ['Virgo', 'Capricorn', 'Cancer'], challenging: ['Aquarius', 'Leo'] },
    'Gemini': { best: ['Libra', 'Aquarius', 'Aries'], challenging: ['Pisces', 'Virgo'] },
    'Cancer': { best: ['Scorpio', 'Pisces', 'Taurus'], challenging: ['Aries', 'Libra'] },
    'Leo': { best: ['Aries', 'Sagittarius', 'Libra'], challenging: ['Taurus', 'Scorpio'] },
    'Virgo': { best: ['Taurus', 'Capricorn', 'Cancer'], challenging: ['Sagittarius', 'Pisces'] },
    'Libra': { best: ['Gemini', 'Aquarius', 'Leo'], challenging: ['Cancer', 'Capricorn'] },
    'Scorpio': { best: ['Cancer', 'Pisces', 'Capricorn'], challenging: ['Leo', 'Aquarius'] },
    'Sagittarius': { best: ['Aries', 'Leo', 'Aquarius'], challenging: ['Virgo', 'Pisces'] },
    'Capricorn': { best: ['Taurus', 'Virgo', 'Scorpio'], challenging: ['Aries', 'Libra'] },
    'Aquarius': { best: ['Gemini', 'Libra', 'Sagittarius'], challenging: ['Taurus', 'Scorpio'] },
    'Pisces': { best: ['Cancer', 'Scorpio', 'Taurus'], challenging: ['Gemini', 'Sagittarius'] }
  }
  
  const compatibility = compatibilitySigns[sun.sign as keyof typeof compatibilitySigns]
  
  return {
    bestMatches: compatibility?.best || [],
    challengingMatches: compatibility?.challenging || []
  }
}

function calculateCurrentTransits(planets: any[]): Array<{
  planet: string;
  aspect: string;
  targetPlanet: string;
  orb: number;
  effect: string;
}> {
  // Simplified transit calculation - in a real implementation,
  // this would calculate current planetary positions and aspects
  return [
    {
      planet: 'Jupiter',
      aspect: 'Trine',
      targetPlanet: 'Sun',
      orb: 2.5,
      effect: 'Expansion and growth opportunities'
    }
  ]
}

// Clear cache for a specific user (useful when profile is updated)
export function clearAstroDataCache(userId: string) {
  astroDataCache.delete(userId)
}

// Clear all cache
export function clearAllAstroDataCache() {
  astroDataCache.clear()
}

// Get cached data without fetching
export function getCachedAstroData(userId: string): ComprehensiveAstroData | null {
  return astroDataCache.get(userId) || null
}

// Check if user has comprehensive data
export async function hasComprehensiveData(userId: string): Promise<boolean> {
  // Check cache first
  if (astroDataCache.has(userId)) {
    return true
  }
  
  // Check Firebase
  try {
    const db = getFirebaseDB()
    const docRef = doc(db, 'users', userId, 'astroProfile', 'comprehensive')
    const docSnap = await getDoc(docRef)
    return docSnap.exists()
  } catch (error) {
    return false
  }
} 

// Get system intelligence status
export async function getIntelligenceStatus() {
  return getSystemStatus()
}

// Force learning mode for testing
export async function forceLearningMode(
  userId: string,
  birthDate: string,
  birthPlace: string,
  birthTime?: string
) {
  const { forceLearningMode } = await import('./astroIntelligence')
  return forceLearningMode(userId, birthDate, birthPlace, birthTime)
} 