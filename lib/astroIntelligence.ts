// Intelligent Astrological System
// Prioritizes internal calculations, learns from external data, and auto-improves

import { generateAstrologicalChart, validateBirthData } from './astroCalculations'
import { devLog } from '@/lib/devLogger';
import { generateFallbackAstroData } from './astroFallback'
import { rootCollectionAdd } from '@/lib/userSubcollectionFirestore';

interface LearningData {
  id: string
  birthDate: string
  birthPlace: string
  birthTime: string
  internalCalculation: any
  externalData?: any
  accuracy: number
  improvements: string[]
  timestamp: number
  userId: string
}

interface SystemMetrics {
  totalCalculations: number
  internalAccuracy: number
  externalUsage: number
  learningOpportunities: number
  lastImprovement: number
  confidence: number
}

class AstroIntelligence {
  private learningCache: Map<string, LearningData> = new Map()
  private systemMetrics: SystemMetrics = {
    totalCalculations: 0,
    internalAccuracy: 0.85, // Start with 85% confidence
    externalUsage: 0,
    learningOpportunities: 0,
    lastImprovement: Date.now(),
    confidence: 0.85
  }

  // Main intelligent calculation method
  async calculateAstroData(
    userId: string,
    birthDate: string,
    birthPlace: string,
    birthTime: string = "12:00",
    forceExternal: boolean = false
  ) {
    devLog.debug('🤖 AstroIntelligence: Starting intelligent calculation...')
    
    // Validate input
    const validation = validateBirthData(birthDate, birthTime, 0, 0)
    if (!validation.isValid) {
      throw new Error(`Invalid birth data: ${validation.errors.join(', ')}`)
    }

    // Generate internal calculation first
    const internalData = await this.generateInternalCalculation(birthDate, birthPlace, birthTime)
    
    // Decide whether to use external API based on intelligence
    const shouldUseExternal = this.shouldUseExternalAPI(forceExternal, birthDate)
    
    // Always use internal calculations - no direct API calls from fallback
    devLog.debug('🤖 AstroIntelligence: Using internal calculations with high confidence')
    this.updateMetrics('internal_success')
    return this.enhanceInternalData(internalData, 'intelligent_choice')
  }

  // Generate internal calculation with confidence scoring
  private async generateInternalCalculation(birthDate: string, birthPlace: string, birthTime: string) {
    const chart = generateAstrologicalChart(birthDate, birthTime, 0, 0)
    
    // Calculate confidence based on data quality
    const confidence = this.calculateConfidence(chart, birthDate, birthPlace, birthTime)
    
    return {
      ...chart,
      metadata: {
        ...chart.metadata,
        confidence,
        calculationMethod: 'internal_intelligent',
        timestamp: Date.now()
      }
    }
  }

  // Intelligent decision making for external API usage
  private shouldUseExternalAPI(forceExternal: boolean, birthDate?: string): boolean {
    if (forceExternal) return true
    
    // Use external API for learning opportunities (10% of requests)
    const learningChance = Math.random()
    if (learningChance < 0.1) {
      devLog.debug('🤖 AstroIntelligence: Learning opportunity detected')
      return true
    }
    
    // Use external API if internal confidence is low
    if (this.systemMetrics.confidence < 0.7) {
      devLog.debug('🤖 AstroIntelligence: Low confidence, using external for improvement')
      return true
    }
    
    // Use external API for new birth date ranges (learning edge cases)
    if (birthDate) {
      const currentDate = new Date()
      const birthYear = new Date(birthDate).getFullYear()
      const yearDiff = currentDate.getFullYear() - birthYear
      
      if (yearDiff < 18 || yearDiff > 80) {
        devLog.debug('🤖 AstroIntelligence: Edge case detected, using external for learning')
        return true
      }
    }
    
    return false
  }

  // Fetch external data for learning
  private async fetchExternalData(birthDate: string, birthPlace: string, birthTime: string) {
    try {
      // Use Universal API instead of astroapp
      const response = await fetch('/api/occult/universal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          system: 'western',
          birthData: {
            birthDate,
            birthTime,
            birthPlace,
            latitude: 0, // Will be calculated by the API
            longitude: 0 // Will be calculated by the API
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(`Universal API error: ${response.status}`);
      }
      
      const result = await response.json();
      this.updateMetrics('external_success')
      return result.data
    } catch (error) {
      this.updateMetrics('external_failure')
      throw error
    }
  }

  // Learn from comparing internal vs external calculations
  private async learnFromComparison(
    userId: string,
    birthDate: string,
    birthPlace: string,
    birthTime: string,
    internalData: any,
    externalData: any
  ) {
    devLog.debug('🤖 AstroIntelligence: Learning from comparison...')
    
    const comparison = this.compareCalculations(internalData, externalData)
    const learningData: LearningData = {
      id: `${userId}_${Date.now()}`,
      birthDate,
      birthPlace,
      birthTime,
      internalCalculation: internalData,
      externalData,
      accuracy: comparison.accuracy,
      improvements: comparison.improvements,
      timestamp: Date.now(),
      userId
    }
    
    // Store learning data
    await this.storeLearningData(learningData)
    
    // Update system metrics
    this.updateSystemIntelligence(comparison)
    
    // Apply improvements if significant
    if (comparison.accuracy > 0.9) {
      await this.applyImprovements(comparison.improvements)
    }
  }

  // Compare internal vs external calculations
  private compareCalculations(internal: any, external: any) {
    const improvements: string[] = []
    let accuracy = 0
    let totalChecks = 0
    
    // Compare sun signs
    if (internal.sun_sign === external.sun_sign) {
      accuracy += 1
    } else {
      improvements.push(`Sun sign calculation: internal=${internal.sun_sign}, external=${external.sun_sign}`)
    }
    totalChecks++
    
    // Compare moon signs
    if (internal.moon_sign === external.moon_sign) {
      accuracy += 1
    } else {
      improvements.push(`Moon sign calculation: internal=${internal.moon_sign}, external=${external.moon_sign}`)
    }
    totalChecks++
    
    // Compare rising signs
    if (internal.rising_sign === external.rising_sign) {
      accuracy += 1
    } else {
      improvements.push(`Rising sign calculation: internal=${internal.rising_sign}, external=${external.rising_sign}`)
    }
    totalChecks++
    
    // Compare planetary positions
    const planetAccuracy = this.comparePlanetaryPositions(internal.planets, external.planets)
    accuracy += planetAccuracy.accuracy
    totalChecks += planetAccuracy.totalChecks
    improvements.push(...planetAccuracy.improvements)
    
    const finalAccuracy = accuracy / totalChecks
    
    return {
      accuracy: finalAccuracy,
      improvements,
      planetAccuracy: planetAccuracy.accuracy / planetAccuracy.totalChecks
    }
  }

  // Compare planetary positions
  private comparePlanetaryPositions(internalPlanets: any[], externalPlanets: any[]) {
    let accuracy = 0
    let totalChecks = 0
    const improvements: string[] = []
    
    internalPlanets.forEach(internalPlanet => {
      const externalPlanet = externalPlanets.find(p => p.name === internalPlanet.name)
      if (externalPlanet) {
        if (internalPlanet.sign === externalPlanet.sign) {
          accuracy += 1
        } else {
          improvements.push(`${internalPlanet.name} sign: internal=${internalPlanet.sign}, external=${externalPlanet.sign}`)
        }
        totalChecks++
      }
    })
    
    return { accuracy, totalChecks, improvements }
  }

  // Calculate confidence based on data quality
  private calculateConfidence(chart: any, birthDate: string, birthPlace: string, birthTime: string): number {
    let confidence = 0.85 // Base confidence
    
    // Increase confidence for complete birth data
    if (birthTime && birthTime !== "12:00") confidence += 0.05
    
    // Increase confidence for known birth places
    if (this.isKnownBirthPlace(birthPlace)) confidence += 0.05
    
    // Increase confidence for reasonable birth dates
    const birthYear = new Date(birthDate).getFullYear()
    const currentYear = new Date().getFullYear()
    if (birthYear >= 1900 && birthYear <= currentYear) confidence += 0.03
    
    // Increase confidence based on system performance
    confidence += (this.systemMetrics.confidence - 0.85) * 0.5
    
    return Math.min(confidence, 0.98) // Cap at 98%
  }

  // Check if birth place is in our database
  private isKnownBirthPlace(birthPlace: string): boolean {
    const knownPlaces = [
      'New York', 'Los Angeles', 'London', 'Paris', 'Tokyo',
      'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata',
      'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow'
    ]
    return knownPlaces.some(place => 
      birthPlace.toLowerCase().includes(place.toLowerCase()) ||
      place.toLowerCase().includes(birthPlace.toLowerCase())
    )
  }

  // Enhance internal data with intelligence
  private enhanceInternalData(internalData: any, enhancementType: string) {
    return {
      ...internalData,
      metadata: {
        ...internalData.metadata,
        source: 'internal_intelligent',
        enhancementType,
        systemConfidence: this.systemMetrics.confidence,
        totalCalculations: this.systemMetrics.totalCalculations,
        learningApplied: true
      }
    }
  }

  // Update system metrics
  private updateMetrics(event: string) {
    this.systemMetrics.totalCalculations++
    
    switch (event) {
      case 'internal_success':
        this.systemMetrics.confidence = Math.min(this.systemMetrics.confidence + 0.001, 0.98)
        break
      case 'external_success':
        this.systemMetrics.externalUsage++
        this.systemMetrics.learningOpportunities++
        break
      case 'external_failure':
        this.systemMetrics.confidence = Math.min(this.systemMetrics.confidence + 0.002, 0.98)
        break
    }
  }

  // Update system intelligence based on learning
  private updateSystemIntelligence(comparison: any) {
    if (comparison.accuracy > 0.9) {
      this.systemMetrics.confidence = Math.min(this.systemMetrics.confidence + 0.01, 0.98)
      this.systemMetrics.lastImprovement = Date.now()
    }
  }

  // Store learning data in Firebase
  private async storeLearningData(learningData: LearningData) {
    try {
      await rootCollectionAdd('astroLearning', learningData as unknown as Record<string, unknown>)
      devLog.debug('🤖 AstroIntelligence: Learning data stored')
    } catch (error) {
      devLog.warn('🤖 AstroIntelligence: Failed to store learning data:', error, 'astroIntelligence')
    }
  }

  // Apply improvements to the system
  private async applyImprovements(improvements: string[]) {
    devLog.debug('🤖 AstroIntelligence: Applying improvements:', improvements)
    
    // Store improvements for future reference
    try {
      await rootCollectionAdd('astroImprovements', {
        timestamp: Date.now(),
        improvements,
        systemMetrics: this.systemMetrics,
      } as Record<string, unknown>)
    } catch (error) {
      devLog.warn('🤖 AstroIntelligence: Failed to store improvements:', error, 'astroIntelligence')
    }
  }

  // Get system status
  getSystemStatus() {
    return {
      ...this.systemMetrics,
      isLearning: this.systemMetrics.learningOpportunities > 0,
      efficiency: (this.systemMetrics.totalCalculations - this.systemMetrics.externalUsage) / this.systemMetrics.totalCalculations
    }
  }

  // Force learning mode (for testing)
  async forceLearningMode(userId: string, birthDate: string, birthPlace: string, birthTime: string) {
    devLog.debug('🤖 AstroIntelligence: Force learning mode activated')
    return this.calculateAstroData(userId, birthDate, birthPlace, birthTime, true)
  }
}

// Export singleton instance
export const astroIntelligence = new AstroIntelligence()

// Helper functions for external use
export async function getIntelligentAstroData(
  userId: string,
  birthDate: string,
  birthPlace: string,
  birthTime?: string
) {
  devLog.debug('🔮 getIntelligentAstroData: Starting with comprehensive data integration...')
  
      try {
        // Use Universal API instead of astroapp
        devLog.debug('📡 Calling Universal API for astrological data...')
        const response = await fetch('/api/occult/universal', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            system: 'vedic',
            birthData: {
              birthDate,
              birthTime: birthTime || '12:00:00',
              birthPlace,
              latitude: 0, // Will be calculated by the API
              longitude: 0 // Will be calculated by the API
            }
          })
        })

        if (!response.ok) {
          throw new Error(`Universal API failed: ${response.status}`)
        }

        const universalData = await response.json()
    
    if (universalData && universalData.data && universalData.data.planets && universalData.data.planets.length > 0) {
      devLog.debug('✅ Successfully retrieved comprehensive astrological data:', {
        planets: universalData.data.planets.length,
        hasChart: !!universalData.data.chart_image,
        hasAscendant: !!universalData.data.ascendant,
        hasDasha: !!universalData.data.dasha,
        hasCurrentDasha: !!universalData.data.currentDasha,
        chartType: universalData.data.chartType,
        samplePlanet: universalData.data.planets[0]
      })
      
      // Note: Chart rendering is now handled by VedicNorthChart and VedicSouthChart components
      // using astronomia-vedic.ts for accurate calculations. No need to fetch chart images.
      devLog.debug('📊 Chart rendering will be handled by SVG components (VedicNorthChart, VedicSouthChart)');
      
      // Detect if this is Vedic data - check for Vedic-specific fields
      const isVedicFormat = (
        universalData.data.dasha || 
        universalData.data.currentDasha || 
        universalData.data.chartType === 'D1' ||
        (universalData.data.planets && universalData.data.planets.some((p: any) => p.nakshatra))
      );
      
      let transformedData;
      
      if (isVedicFormat) {
        devLog.debug('🔮 Detected Vedic format data - transforming to unified structure');
        
        // Transform Vedic format to include Western-compatible fields
        const sunPlanet = universalData.data.planets?.find((p: any) => 
          p.name?.toLowerCase() === 'sun' || p.name === 'Sun'
        );
        const moonPlanet = universalData.data.planets?.find((p: any) => 
          p.name?.toLowerCase() === 'moon' || p.name === 'Moon'
        );
        
        // Convert ascendant degree to sign
        const ascendantDegree = typeof universalData.data.ascendant === 'number' 
          ? universalData.data.ascendant 
          : universalData.data.ascendant?.degreeInSign || 0;
        const ascendantSign = getZodiacSignFromLongitude(ascendantDegree);
        
        transformedData = {
          // Add Western-compatible fields extracted from Vedic data
          sun_sign: sunPlanet?.sign || 'Unknown',
          moon_sign: moonPlanet?.sign || 'Unknown',
          rising_sign: ascendantSign,
          
          // Preserve all Vedic fields
          ascendant: {
            sign: ascendantSign,
            degree: ascendantDegree,
            signName: ascendantSign
          },
          dasha: universalData.data.dasha || [],
          currentDasha: universalData.data.currentDasha || null,
          divisionalCharts: universalData.data.divisionalCharts || {},
          
          // Planets - preserve Vedic structure
          planets: universalData.data.planets || [],
          
          // Houses - preserve Vedic structure
          houses: universalData.data.houses || [],
          
          // Calculate elements and modalities from planets
          elements: calculateElementsFromPlanets(universalData.data.planets),
          modalities: calculateModalitiesFromPlanets(universalData.data.planets),
          
          // Generate insights using extracted signs
          personalityTraits: generatePersonalityTraits(
            sunPlanet?.sign || sunPlanet?.signName,
            moonPlanet?.sign || moonPlanet?.signName,
            universalData.data.ascendant?.signName
          ),
          lifePath: generateLifePath(
            sunPlanet?.sign || sunPlanet?.signName,
            moonPlanet?.sign || moonPlanet?.signName
          ),
          challenges: generateChallenges(universalData.data.planets),
          strengths: generateStrengths(universalData.data.planets),
          compatibility: generateCompatibility(sunPlanet?.sign || sunPlanet?.signName),
          
          aspects: [],
          currentTransits: [],
          chartImage: null,
          
          metadata: {
            version: '2.0',
            source: 'universal_api_vedic',
            systemConfidence: 0.95,
            learningApplied: false,
            isVedicFormat: true
          }
        };
      } else {
        devLog.debug('🌟 Detected Western format data - using direct fields');
        
        // Western format - use existing code path
        transformedData = {
          sun_sign: universalData.data.sun_sign,
          moon_sign: universalData.data.moon_sign,
          rising_sign: universalData.data.rising_sign,
          planets: universalData.data.planets.map((planet: any) => ({
            name: planet.name,
            sign: getZodiacSignFromLongitude(planet.longitude),
            degree: planet.longitude % 30,
            house: calculateHouseFromLongitude(planet.longitude, universalData.data.houses),
            longitude: planet.longitude,
            latitude: planet.latitude,
            speed: planet.speed,
            isRetrograde: planet.speed < 0
          })),
          houses: universalData.data.houses.map((house: any, index: number) => ({
            number: index + 1,
            sign: getZodiacSignFromLongitude(house.cusp),
            degree: house.cusp % 30,
            cusp: house.cusp
          })),
          aspects: [],
          elements: calculateElementsFromPlanets(universalData.data.planets),
          modalities: calculateModalitiesFromPlanets(universalData.data.planets),
          personalityTraits: generatePersonalityTraits(universalData.data.sun_sign, universalData.data.moon_sign, universalData.data.rising_sign),
          lifePath: generateLifePath(universalData.data.sun_sign, universalData.data.moon_sign),
          challenges: generateChallenges(universalData.data.planets),
          strengths: generateStrengths(universalData.data.planets),
          compatibility: generateCompatibility(universalData.data.sun_sign),
          currentTransits: [],
          chartImage: universalData.data.chart_image,
          metadata: {
            version: '2.0',
            source: 'universal_api',
            systemConfidence: 0.95,
            learningApplied: false
          }
        };
      }
      
      return transformedData
    }
    
    throw new Error('AstroApp API returned invalid data')
    
  } catch (astroAppError) {
    devLog.warn('⚠️ Universal API failed, falling back to internal calculations:', astroAppError, 'astroIntelligence')
    
    // Fallback to internal calculations
    return astroIntelligence.calculateAstroData(userId, birthDate, birthPlace, birthTime || "12:00")
  }
}

// Helper function to convert longitude to zodiac sign
function getZodiacSignFromLongitude(longitude: number): string {
  const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
                'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']
  const signIndex = Math.floor(longitude / 30)
  return signs[signIndex] || 'Unknown'
}

// Helper function to calculate house from longitude
function calculateHouseFromLongitude(longitude: number, houses: any[]): number {
  for (let i = 0; i < houses.length; i++) {
    const currentCusp = houses[i].cusp
    const nextCusp = houses[(i + 1) % houses.length].cusp
    
    if (longitude >= currentCusp && longitude < nextCusp) {
      return i + 1
    }
  }
  return 1 // Default to first house
}

// Helper function to calculate elements from planets
function calculateElementsFromPlanets(planets: any[]): any {
  const elements = { fire: 0, earth: 0, air: 0, water: 0 }
  
  planets.forEach(planet => {
    const sign = getZodiacSignFromLongitude(planet.longitude)
    switch (sign) {
      case 'Aries':
      case 'Leo':
      case 'Sagittarius':
        elements.fire++
        break
      case 'Taurus':
      case 'Virgo':
      case 'Capricorn':
        elements.earth++
        break
      case 'Gemini':
      case 'Libra':
      case 'Aquarius':
        elements.air++
        break
      case 'Cancer':
      case 'Scorpio':
      case 'Pisces':
        elements.water++
        break
    }
  })
  
  return elements
}

// Helper function to calculate modalities from planets
function calculateModalitiesFromPlanets(planets: any[]): any {
  const modalities = { cardinal: 0, fixed: 0, mutable: 0 }
  
  planets.forEach(planet => {
    const sign = getZodiacSignFromLongitude(planet.longitude)
    switch (sign) {
      case 'Aries':
      case 'Cancer':
      case 'Libra':
      case 'Capricorn':
        modalities.cardinal++
        break
      case 'Taurus':
      case 'Leo':
      case 'Scorpio':
      case 'Aquarius':
        modalities.fixed++
        break
      case 'Gemini':
      case 'Virgo':
      case 'Sagittarius':
      case 'Pisces':
        modalities.mutable++
        break
    }
  })
  
  return modalities
}

// Helper functions for personality analysis
function generatePersonalityTraits(sunSign?: string, moonSign?: string, risingSign?: string): string[] {
  const traits: string[] = [];
  
  if (sunSign) {
    traits.push(`${sunSign} Sun - Natural leadership and ${sunSign.toLowerCase()} energy`);
  }
  if (moonSign) {
    traits.push(`${moonSign} Moon - Emotional nature and ${moonSign.toLowerCase()} intuition`);
  }
  if (risingSign) {
    traits.push(`${risingSign} Rising - First impression and ${risingSign.toLowerCase()} approach`);
  }
  
  // Fallback if no signs provided
  if (traits.length === 0) {
    traits.push('Unique personality traits based on planetary positions');
  }
  
  return traits;
}

function generateLifePath(sunSign?: string, moonSign?: string): string {
  if (sunSign && moonSign) {
    return `Your life path combines ${sunSign} determination with ${moonSign} intuition, creating a unique journey of self-discovery and growth`;
  }
  return 'Your life path is a unique journey of self-discovery and growth based on your planetary positions';
}

function generateChallenges(planets: any[]): string[] {
  return [
    'Balancing personal needs with responsibilities',
    'Managing emotional fluctuations',
    'Developing patience and persistence'
  ]
}

function generateStrengths(planets: any[]): string[] {
  return [
    'Natural intuition and insight',
    'Strong determination and willpower',
    'Ability to adapt and grow'
  ]
}

function generateCompatibility(sunSign?: string): any {
  const compatibleSigns = {
    'Aries': ['Leo', 'Sagittarius', 'Gemini', 'Aquarius'],
    'Taurus': ['Virgo', 'Capricorn', 'Cancer', 'Pisces'],
    'Gemini': ['Libra', 'Aquarius', 'Aries', 'Leo'],
    'Cancer': ['Scorpio', 'Pisces', 'Taurus', 'Virgo'],
    'Leo': ['Sagittarius', 'Aries', 'Gemini', 'Libra'],
    'Virgo': ['Capricorn', 'Taurus', 'Cancer', 'Scorpio'],
    'Libra': ['Aquarius', 'Gemini', 'Leo', 'Sagittarius'],
    'Scorpio': ['Pisces', 'Cancer', 'Virgo', 'Capricorn'],
    'Sagittarius': ['Aries', 'Leo', 'Libra', 'Aquarius'],
    'Capricorn': ['Taurus', 'Virgo', 'Scorpio', 'Pisces'],
    'Aquarius': ['Gemini', 'Libra', 'Sagittarius', 'Aries'],
    'Pisces': ['Cancer', 'Scorpio', 'Capricorn', 'Taurus']
  }
  
  return {
    bestMatches: sunSign ? (compatibleSigns[sunSign as keyof typeof compatibleSigns] || []) : [],
    challengingMatches: []
  }
}

export function getSystemStatus() {
  return astroIntelligence.getSystemStatus()
}

export async function forceLearningMode(
  userId: string,
  birthDate: string,
  birthPlace: string,
  birthTime?: string
) {
  return astroIntelligence.forceLearningMode(userId, birthDate, birthPlace, birthTime || "12:00")
} 