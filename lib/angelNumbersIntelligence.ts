// Intelligent Angel Numbers System
// Prioritizes internal calculations, provides personalized guidance, and includes coaching

import { generateAngelNumbersProfile, validateAngelNumbersData } from './angelNumbersCalculations'
import { devLog } from '@/lib/devLogger';
import { userSubdocGet, userSubdocSet } from '@/lib/userSubcollectionFirestore'
import { getFirebaseDB } from './firebase';
import { CACHE_TTL } from './cacheConstants';
import {
  powerWordByNumber,
  wealthAttractionByNumber,
  practicalChecklistByNumber,
} from '@/lib/numerology/practicalGuides';

interface AngelNumbersData {
  userId: string
  fullName: string
  birthDate: string
  lastFetched: number
  
  // Personal Angel Numbers
  lifePathAngel: number
  destinyAngel: number
  soulAngel: number
  personalityAngel: number
  
  // Current Angel Numbers
  currentDateAngel: number
  personalYearAngel: number
  personalMonthAngel: number
  personalDayAngel: number
  
  // Angel Number Analysis
  frequentNumbers: Array<number | string | Record<string, unknown>>
  masterNumbers: Array<{ number: number } & Record<string, unknown>>
  repeatingPatterns: string[]
  angelicGuidance: {
    primaryMessage: string
    secondaryMessages: string[]
    actionSteps: string[]
    affirmations: string[]
    warnings?: string[]
  }
  
  // Synchronicity Analysis
  synchronicities: {
    numberSequences: string[]
    timePatterns: string[]
    dateSignificance: string[]
    meaningfulCoincidences: string[]
  }
  
  metadata: {
    reportId: string
    version: string
    source: string
    isComprehensive: boolean
    systemConfidence?: number
    learningApplied?: boolean
  }
  powerWord?: string
  wealthTips?: string[]
  practicalChecklist?: string[]
}

interface AngelNumbersCoachingContext {
  userId: string
  angelNumbersData: AngelNumbersData
  userQuery: string
  currentFocus?: string
  spiritualGoals?: string[]
  challenges?: string[]
}

interface AngelNumbersCoachingResponse {
  guidance: string
  suggestions: string[]
  insights: string[]
  actionableSteps: string[]
  encouragement: string
  relatedNumbers: number[]
  confidence: number
  personalization: string
}

class AngelNumbersIntelligence {
  private angelNumbersCache = new Map<string, AngelNumbersData>()
  private systemMetrics = {
    totalCalculations: 0,
    internalAccuracy: 0.95, // Angel numbers are very accurate internally
    externalUsage: 0,
    learningOpportunities: 0,
    lastImprovement: Date.now(),
    confidence: 0.95
  }

  // Main intelligent calculation method
  async calculateAngelNumbersData(
    userId: string,
    fullName: string,
    birthDate: string
  ): Promise<AngelNumbersData> {
    if (process.env.NODE_ENV === 'development') {
      devLog.debug('👼 AngelNumbersIntelligence: Starting intelligent calculation...')
    }
    
    // Validate input data
    const validation = validateAngelNumbersData(fullName, birthDate)
    if (!validation.isValid) {
      throw new Error(`Invalid angel numbers data: ${validation.errors.join(', ')}`)
    }

    // Check cache first
    if (this.angelNumbersCache.has(userId)) {
      const cached = this.angelNumbersCache.get(userId)!
      if (Date.now() - cached.lastFetched < CACHE_TTL.REPORTS) {
        if (process.env.NODE_ENV === 'development') {
          devLog.debug('Using cached angel numbers data for user:', userId)
        }
        return cached
      }
    }

    // Check Firebase storage
    try {
      const db = getFirebaseDB();
      if (db) {
        const raw = await userSubdocGet(userId, 'angelNumbersProfile', 'comprehensive');
        if (raw) {
          const storedData = raw as unknown as AngelNumbersData
          if (Date.now() - storedData.lastFetched < CACHE_TTL.REPORTS &&
              storedData.fullName === fullName &&
              storedData.birthDate === birthDate) {
            if (process.env.NODE_ENV === 'development') {
              devLog.debug('Using stored angel numbers data for user:', userId)
            }
            this.angelNumbersCache.set(userId, storedData)
            return storedData
          }
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        devLog.warn('Error checking stored angel numbers data:', error, 'angelNumbersIntelligence')
      }
    }

    // Generate internal calculation
    if (process.env.NODE_ENV === 'development') {
      devLog.debug('👼 AngelNumbersIntelligence: Using internal calculations...')
    }
    const internalProfile = generateAngelNumbersProfile(userId, fullName, birthDate)
    
    // Transform to comprehensive format
    const angelNumbersData: AngelNumbersData = {
      userId,
      fullName,
      birthDate,
      lastFetched: Date.now(),
      
      lifePathAngel: internalProfile.lifePathAngel,
      destinyAngel: internalProfile.destinyAngel,
      soulAngel: internalProfile.soulAngel,
      personalityAngel: internalProfile.personalityAngel,
      
      currentDateAngel: internalProfile.currentDateAngel,
      personalYearAngel: internalProfile.personalYearAngel,
      personalMonthAngel: internalProfile.personalMonthAngel,
      personalDayAngel: internalProfile.personalDayAngel,
      
      frequentNumbers: internalProfile.frequentNumbers as unknown as Array<number | string | Record<string, unknown>>,
      masterNumbers: internalProfile.masterNumbers as unknown as Array<{ number: number } & Record<string, unknown>>,
      repeatingPatterns: internalProfile.repeatingPatterns,
      angelicGuidance: internalProfile.angelicGuidance,
      synchronicities: internalProfile.synchronicities,
      
      metadata: {
        reportId: `angel_numbers_${userId}_${Date.now()}`,
        version: internalProfile.metadata.version,
        source: 'intelligent_system',
        isComprehensive: true,
        systemConfidence: this.systemMetrics.confidence,
        learningApplied: false
      },
      powerWord: powerWordByNumber(internalProfile.lifePathAngel),
      wealthTips: wealthAttractionByNumber(internalProfile.lifePathAngel),
      practicalChecklist: practicalChecklistByNumber(internalProfile.lifePathAngel),
    }

    // Store in Firebase
    try {
      const db = getFirebaseDB();
      if (db) {
        await userSubdocSet(
          userId,
          'angelNumbersProfile',
          'comprehensive',
          angelNumbersData as unknown as Record<string, unknown>
        );
        if (process.env.NODE_ENV === 'development') {
          devLog.debug('Stored intelligent angel numbers data in Firebase for user:', userId)
        }
      }
    } catch (storageError) {
      if (process.env.NODE_ENV === 'development') {
        devLog.warn('Error storing angel numbers data in Firebase:', storageError, 'angelNumbersIntelligence')
      }
    }

    // Store in cache
    this.angelNumbersCache.set(userId, angelNumbersData)
    this.updateMetrics('internal_success')

    return angelNumbersData
  }

  // Provide personalized angel numbers coaching
  async provideCoaching(context: AngelNumbersCoachingContext): Promise<AngelNumbersCoachingResponse> {
    if (process.env.NODE_ENV === 'development') {
      devLog.debug('👼 AngelNumbersIntelligence: Providing personalized coaching...')
    }
    
    // Generate personalized response based on angel numbers profile
    const response = await this.generatePersonalizedResponse(context)
    
    return response
  }

  // Generate personalized coaching response
  private async generatePersonalizedResponse(context: AngelNumbersCoachingContext): Promise<AngelNumbersCoachingResponse> {
    const { angelNumbersData, userQuery } = context
    const query = userQuery.toLowerCase()
    
    const guidance = this.generateGuidance(query, angelNumbersData)
    const suggestions = this.generateSuggestions(query, angelNumbersData)
    const insights = this.generateInsights(query, angelNumbersData)
    const actionableSteps = this.generateActionableSteps(query, angelNumbersData)
    const encouragement = this.generateEncouragement(angelNumbersData)
    const relatedNumbers = this.generateRelatedNumbers(query, angelNumbersData)
    
    return {
      guidance,
      suggestions,
      insights,
      actionableSteps,
      encouragement,
      relatedNumbers,
      confidence: 0.95,
      personalization: `Based on your Life Path Angel ${angelNumbersData.lifePathAngel} and Destiny Angel ${angelNumbersData.destinyAngel}`
    }
  }

  // Generate personalized guidance
  private generateGuidance(query: string, data: AngelNumbersData): string {
    const lifePathAngel = data.lifePathAngel
    const destinyAngel = data.destinyAngel
    const currentDateAngel = data.currentDateAngel
    
    if (query.includes('spiritual') || query.includes('awakening') || query.includes('divine')) {
      return `Your Life Path Angel ${lifePathAngel} reveals your spiritual purpose: ${data.angelicGuidance.primaryMessage}. Your Destiny Angel ${destinyAngel} shows your spiritual gifts. Today's Angel ${currentDateAngel} brings divine guidance for your spiritual journey.`
    }
    
    if (query.includes('manifestation') || query.includes('abundance') || query.includes('prosperity')) {
      return `Your Angel Numbers indicate powerful manifestation energy. Your Life Path Angel ${lifePathAngel} combined with Destiny Angel ${destinyAngel} creates a potent combination for attracting abundance. Focus on ${data.angelicGuidance.actionSteps[0] || 'positive thoughts'}.`
    }
    
    if (query.includes('protection') || query.includes('guidance') || query.includes('angels')) {
      return `Your angels are actively guiding you through Angel Number ${currentDateAngel}. Your Soul Angel ${data.soulAngel} represents your spiritual protection. Trust in divine guidance and know you are always supported.`
    }
    
    if (query.includes('change') || query.includes('transformation') || query.includes('growth')) {
      return `Your Angel Numbers show you're in a period of spiritual transformation. Your Personal Year Angel ${data.personalYearAngel} indicates this year's spiritual focus. Embrace change with courage and trust in divine timing.`
    }
    
    return `Your Life Path Angel ${lifePathAngel} and Destiny Angel ${destinyAngel} create a unique spiritual signature. Your angels are communicating through these numbers: ${data.angelicGuidance.primaryMessage}. Trust in divine guidance and your spiritual journey.`
  }

  // Generate personalized suggestions
  private generateSuggestions(query: string, data: AngelNumbersData): string[] {
    const suggestions: string[] = []
    const lifePathAngel = data.lifePathAngel
    const currentDateAngel = data.currentDateAngel
    
    if (query.includes('spiritual') || query.includes('awakening')) {
      suggestions.push(`Meditate on your Life Path Angel ${lifePathAngel} daily`)
      suggestions.push(`Practice the affirmations: ${data.angelicGuidance.affirmations[0] || 'I am guided by divine love'}`)
      suggestions.push(`Pay attention to Angel Number ${currentDateAngel} appearing in your life`)
      suggestions.push(`Develop your spiritual gifts through prayer and meditation`)
    }
    
    if (query.includes('manifestation') || query.includes('abundance')) {
      suggestions.push(`Focus on your Destiny Angel ${data.destinyAngel} for manifestation power`)
      suggestions.push(`Use the affirmation: ${data.angelicGuidance.affirmations[1] || 'I trust in divine abundance'}`)
      suggestions.push(`Notice synchronicities: ${data.synchronicities.meaningfulCoincidences[0] || 'Your angels are guiding you'}`)
      suggestions.push(`Practice gratitude for all blessings in your life`)
    }
    
    if (query.includes('protection') || query.includes('guidance')) {
      suggestions.push(`Call upon your Soul Angel ${data.soulAngel} for protection`)
      suggestions.push(`Trust in divine timing and guidance`)
      suggestions.push(`Ask your angels for help with: ${data.angelicGuidance.actionSteps[0] || 'spiritual growth'}`)
      suggestions.push(`Practice listening to your intuition`)
    }
    
    // Add general suggestions
    suggestions.push(`Pay attention to repeating numbers in your daily life`)
    suggestions.push(`Use your angel numbers as spiritual affirmations`)
    suggestions.push(`Trust in divine guidance and timing`)
    suggestions.push(`Express gratitude for angelic messages`)
    
    return suggestions.slice(0, 4)
  }

  // Generate personalized insights
  private generateInsights(_query: string, data: AngelNumbersData): string[] {
    const insights: string[] = []
    
    insights.push(`Your Life Path Angel ${data.lifePathAngel} reveals your spiritual purpose: ${data.angelicGuidance.primaryMessage}`)
    insights.push(`Your Destiny Angel ${data.destinyAngel} shows your spiritual gifts and abilities`)
    insights.push(`Your Soul Angel ${data.soulAngel} represents your spiritual protection and guidance`)
    insights.push(`Your Personality Angel ${data.personalityAngel} shows how you express your spiritual nature`)
    
    if (data.masterNumbers.length > 0) {
      insights.push(`You have Master Angel Numbers: ${data.masterNumbers.map(m => m.number).join(', ')} - indicating advanced spiritual gifts`)
    }
    
    if (data.repeatingPatterns.length > 0) {
      insights.push(`Your repeating patterns: ${data.repeatingPatterns[0]} - strong angelic messages`)
    }
    
    return insights
  }

  // Generate actionable steps
  private generateActionableSteps(_query: string, data: AngelNumbersData): string[] {
    const steps: string[] = []
    
    steps.push(`Meditate on your Life Path Angel ${data.lifePathAngel} daily`)
    steps.push(`Use your Destiny Angel ${data.destinyAngel} for manifestation`)
    steps.push(`Call upon your Soul Angel ${data.soulAngel} for protection`)
    steps.push(`Practice the affirmations: ${data.angelicGuidance.affirmations.slice(0, 2).join(', ')}`)
    
    return steps
  }

  // Generate encouragement
  private generateEncouragement(data: AngelNumbersData): string {
    const lifePathAngel = data.lifePathAngel
    const destinyAngel = data.destinyAngel
    const currentDateAngel = data.currentDateAngel
    
    return `Your Life Path Angel ${lifePathAngel} and Destiny Angel ${destinyAngel} create a powerful spiritual combination. You are divinely guided and protected. Today's Angel ${currentDateAngel} brings special messages for your journey. Trust in divine timing and know that your angels are always with you, supporting your spiritual growth and guiding you toward your highest good.`
  }

  // Generate related numbers
  private generateRelatedNumbers(_query: string, data: AngelNumbersData): number[] {
    const numbers: number[] = []
    
    numbers.push(data.lifePathAngel)
    numbers.push(data.destinyAngel)
    numbers.push(data.soulAngel)
    numbers.push(data.personalityAngel)
    numbers.push(data.currentDateAngel)
    
    if (data.masterNumbers.length > 0) {
      numbers.push(...data.masterNumbers.map(m => m.number))
    }
    
    return numbers
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

  // Get system status
  getSystemStatus() {
    return {
      ...this.systemMetrics,
      isLearning: this.systemMetrics.learningOpportunities > 0,
      efficiency: (this.systemMetrics.totalCalculations - this.systemMetrics.externalUsage) / this.systemMetrics.totalCalculations
    }
  }
}

// Export singleton instance
export const angelNumbersIntelligence = new AngelNumbersIntelligence()

// Helper functions for external use
export async function getIntelligentAngelNumbersData(
  userId: string,
  fullName: string,
  birthDate: string
): Promise<AngelNumbersData> {
  return angelNumbersIntelligence.calculateAngelNumbersData(userId, fullName, birthDate)
}

export async function getAngelNumbersCoaching(
  userId: string,
  angelNumbersData: AngelNumbersData,
  query: string,
  context?: Partial<AngelNumbersCoachingContext>
): Promise<AngelNumbersCoachingResponse> {
  const coachingContext: AngelNumbersCoachingContext = {
    userId,
    angelNumbersData,
    userQuery: query,
    ...context
  }
  
  return angelNumbersIntelligence.provideCoaching(coachingContext)
}

export function getAngelNumbersSystemStatus() {
  return angelNumbersIntelligence.getSystemStatus()
} 