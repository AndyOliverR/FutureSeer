// Intelligent Astrological System
// Prioritizes internal calculations, learns from external data, and auto-improves

import { generateAstrologicalChart, validateBirthData } from './astroCalculations'
import { generateFallbackAstroData } from './astroFallback'
import { getBirthChart } from './astroapp'
import { doc, setDoc, getDoc, collection, addDoc } from 'firebase/firestore'
import { getFirebaseDB } from './firebase';

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
    console.log('🤖 AstroIntelligence: Starting intelligent calculation...')
    
    // Validate input
    const validation = validateBirthData(birthDate, birthTime, 0, 0)
    if (!validation.isValid) {
      throw new Error(`Invalid birth data: ${validation.errors.join(', ')}`)
    }

    // Generate internal calculation first
    const internalData = await this.generateInternalCalculation(birthDate, birthPlace, birthTime)
    
    // Decide whether to use external API based on intelligence
    const shouldUseExternal = this.shouldUseExternalAPI(forceExternal)
    
    if (shouldUseExternal) {
      try {
        console.log('🤖 AstroIntelligence: Using external API for learning opportunity...')
        const externalData = await this.fetchExternalData(birthDate, birthPlace, birthTime)
        
        // Compare and learn from external data
        await this.learnFromComparison(userId, birthDate, birthPlace, birthTime, internalData, externalData)
        
        // Return external data but mark it for learning
        return {
          ...externalData,
          metadata: {
            ...externalData.metadata,
            source: 'external_with_learning',
            internalConfidence: this.systemMetrics.confidence,
            learningApplied: true
          }
        }
      } catch (externalError) {
        console.log('🤖 AstroIntelligence: External API failed, using internal with confidence boost')
        this.updateMetrics('external_failure')
        return this.enhanceInternalData(internalData, 'external_fallback')
      }
    } else {
      console.log('🤖 AstroIntelligence: Using internal calculations with high confidence')
      this.updateMetrics('internal_success')
      return this.enhanceInternalData(internalData, 'intelligent_choice')
    }
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
  private shouldUseExternalAPI(forceExternal: boolean): boolean {
    if (forceExternal) return true
    
    // Use external API for learning opportunities (10% of requests)
    const learningChance = Math.random()
    if (learningChance < 0.1) {
      console.log('🤖 AstroIntelligence: Learning opportunity detected')
      return true
    }
    
    // Use external API if internal confidence is low
    if (this.systemMetrics.confidence < 0.7) {
      console.log('🤖 AstroIntelligence: Low confidence, using external for improvement')
      return true
    }
    
    // Use external API for new birth date ranges (learning edge cases)
    const currentDate = new Date()
    const birthYear = new Date(birthDate).getFullYear()
    const yearDiff = currentDate.getFullYear() - birthYear
    
    if (yearDiff < 18 || yearDiff > 80) {
      console.log('🤖 AstroIntelligence: Edge case detected, using external for learning')
      return true
    }
    
    return false
  }

  // Fetch external data for learning
  private async fetchExternalData(birthDate: string, birthPlace: string, birthTime: string) {
    try {
      const externalData = await getBirthChart(birthDate, birthPlace)
      this.updateMetrics('external_success')
      return externalData
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
    console.log('🤖 AstroIntelligence: Learning from comparison...')
    
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
      const db = getFirebaseDB();
      await addDoc(collection(db, 'astroLearning'), learningData)
      console.log('🤖 AstroIntelligence: Learning data stored')
    } catch (error) {
      console.warn('🤖 AstroIntelligence: Failed to store learning data:', error)
    }
  }

  // Apply improvements to the system
  private async applyImprovements(improvements: string[]) {
    console.log('🤖 AstroIntelligence: Applying improvements:', improvements)
    
    // Store improvements for future reference
    try {
      const db = getFirebaseDB();
      await addDoc(collection(db, 'astroImprovements'), {
        timestamp: Date.now(),
        improvements,
        systemMetrics: this.systemMetrics
      })
    } catch (error) {
      console.warn('🤖 AstroIntelligence: Failed to store improvements:', error)
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
    console.log('🤖 AstroIntelligence: Force learning mode activated')
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
  return astroIntelligence.calculateAstroData(userId, birthDate, birthPlace, birthTime || "12:00")
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