// Intelligent Numerology System
// Prioritizes internal calculations, learns from external data, and provides coaching

import { generateNumerologyProfile, validateNumerologyData } from './numerologyCalculations'
import { doc, setDoc, getDoc, collection, addDoc } from 'firebase/firestore'
import { getFirebaseDB } from './firebase';

interface NumerologyData {
  userId: string
  fullName: string
  birthDate: string
  lastFetched: number
  
  // Core numbers
  lifePathNumber: number
  destinyNumber: number
  soulNumber: number
  personalityNumber: number
  birthDayNumber: number
  maturityNumber: number
  
  // Current numbers
  personalYearNumber: number
  personalMonthNumber: number
  personalDayNumber: number
  
  // Special numbers
  karmicDebts: number[]
  masterNumbers: number[]
  pinnacles: number[]
  challenges: number[]
  
  // Analysis
  letterAnalysis: { [key: string]: number }
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
    reportId: string
    version: string
    source: string
    isComprehensive: boolean
    systemConfidence?: number
    learningApplied?: boolean
  }
}

interface NumerologyCoachingContext {
  userId: string
  numerologyData: NumerologyData
  userQuery: string
  currentFocus?: string
  goals?: string[]
  challenges?: string[]
}

interface NumerologyCoachingResponse {
  guidance: string
  suggestions: string[]
  insights: string[]
  actionableSteps: string[]
  encouragement: string
  relatedNumbers: number[]
  confidence: number
  personalization: string
}

class NumerologyIntelligence {
  private numerologyCache = new Map<string, NumerologyData>()
  private systemMetrics = {
    totalCalculations: 0,
    internalAccuracy: 0.95, // Numerology is very accurate internally
    externalUsage: 0,
    learningOpportunities: 0,
    lastImprovement: Date.now(),
    confidence: 0.95
  }

  // Main intelligent calculation method
  async calculateNumerologyData(
    userId: string,
    fullName: string,
    birthDate: string,
    forceExternal: boolean = false
  ): Promise<NumerologyData> {
    console.log('🔢 NumerologyIntelligence: Starting intelligent calculation...')
    
    // Validate input data
    const validation = validateNumerologyData(fullName, birthDate)
    if (!validation.isValid) {
      throw new Error(`Invalid numerology data: ${validation.errors.join(', ')}`)
    }

    // Check cache first
    if (this.numerologyCache.has(userId)) {
      const cached = this.numerologyCache.get(userId)!
      if (Date.now() - cached.lastFetched < 24 * 60 * 60 * 1000) {
        console.log('Using cached numerology data for user:', userId)
        return cached
      }
    }

    // Check Firebase storage
    try {
      const db = getFirebaseDB();
      const docRef = doc(db, 'users', userId, 'numerologyProfile', 'comprehensive')
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        const storedData = docSnap.data() as NumerologyData
        if (Date.now() - storedData.lastFetched < 24 * 60 * 60 * 1000 &&
            storedData.fullName === fullName &&
            storedData.birthDate === birthDate) {
          console.log('Using stored numerology data for user:', userId)
          this.numerologyCache.set(userId, storedData)
          return storedData
        }
      }
    } catch (error) {
      console.warn('Error checking stored numerology data:', error)
    }

    // Generate internal calculation
    console.log('🔢 NumerologyIntelligence: Using internal calculations...')
    const internalProfile = generateNumerologyProfile(fullName, birthDate)
    
    // Transform to comprehensive format
    const numerologyData: NumerologyData = {
      userId,
      fullName,
      birthDate,
      lastFetched: Date.now(),
      
      lifePathNumber: internalProfile.lifePathNumber,
      destinyNumber: internalProfile.destinyNumber,
      soulNumber: internalProfile.soulNumber,
      personalityNumber: internalProfile.personalityNumber,
      birthDayNumber: internalProfile.birthDayNumber,
      maturityNumber: internalProfile.maturityNumber,
      
      personalYearNumber: internalProfile.personalYearNumber,
      personalMonthNumber: internalProfile.personalMonthNumber,
      personalDayNumber: internalProfile.personalDayNumber,
      
      karmicDebts: internalProfile.karmicDebts,
      masterNumbers: internalProfile.masterNumbers,
      pinnacles: internalProfile.pinnacles,
      challenges: internalProfile.challenges,
      
      letterAnalysis: internalProfile.letters,
      insights: internalProfile.insights,
      
      metadata: {
        reportId: `numerology_${userId}_${Date.now()}`,
        version: internalProfile.metadata.version,
        source: 'intelligent_system',
        isComprehensive: true,
        systemConfidence: this.systemMetrics.confidence,
        learningApplied: false
      }
    }

    // Store in Firebase
    try {
      const db = getFirebaseDB();
      const docRef = doc(db, 'users', userId, 'numerologyProfile', 'comprehensive')
      await setDoc(docRef, numerologyData)
      console.log('Stored intelligent numerology data in Firebase for user:', userId)
    } catch (storageError) {
      console.warn('Error storing numerology data in Firebase:', storageError)
    }

    // Store in cache
    this.numerologyCache.set(userId, numerologyData)
    this.updateMetrics('internal_success')

    return numerologyData
  }

  // Provide personalized numerology coaching
  async provideCoaching(context: NumerologyCoachingContext): Promise<NumerologyCoachingResponse> {
    console.log('🔢 NumerologyIntelligence: Providing personalized coaching...')
    
    const { numerologyData, userQuery } = context
    const query = userQuery.toLowerCase()
    
    // Generate personalized response based on numerology profile
    const response = await this.generatePersonalizedResponse(context)
    
    return response
  }

  // Generate personalized coaching response
  private async generatePersonalizedResponse(context: NumerologyCoachingContext): Promise<NumerologyCoachingResponse> {
    const { numerologyData, userQuery } = context
    const query = userQuery.toLowerCase()
    
    const guidance = this.generateGuidance(query, numerologyData)
    const suggestions = this.generateSuggestions(query, numerologyData)
    const insights = this.generateInsights(query, numerologyData)
    const actionableSteps = this.generateActionableSteps(query, numerologyData)
    const encouragement = this.generateEncouragement(numerologyData)
    const relatedNumbers = this.generateRelatedNumbers(query, numerologyData)
    
    return {
      guidance,
      suggestions,
      insights,
      actionableSteps,
      encouragement,
      relatedNumbers,
      confidence: 0.95,
      personalization: `Based on your Life Path ${numerologyData.lifePathNumber} and Destiny Number ${numerologyData.destinyNumber}`
    }
  }

  // Generate personalized guidance
  private generateGuidance(query: string, data: NumerologyData): string {
    const lifePath = data.lifePathNumber
    const destiny = data.destinyNumber
    const personalYear = data.personalYearNumber
    
    if (query.includes('career') || query.includes('work') || query.includes('job')) {
      return `Your Life Path ${lifePath} combined with Destiny Number ${destiny} shows you're naturally suited for ${data.insights.careerPaths[0] || 'leadership roles'}. This Personal Year ${personalYear} is perfect for ${this.getPersonalYearFocus(personalYear)}. Focus on your natural strengths: ${data.insights.strengths[0] || 'leadership'}.`
    }
    
    if (query.includes('relationship') || query.includes('love') || query.includes('partner')) {
      return `Your Soul Number ${data.soulNumber} reveals your deepest desires in relationships. You're most compatible with Life Path Numbers: ${data.insights.compatibility.slice(0, 3).join(', ')}. Your Personality Number ${data.personalityNumber} shows how you present yourself to others.`
    }
    
    if (query.includes('purpose') || query.includes('meaning') || query.includes('life')) {
      return `Your Life Path ${lifePath} reveals your core purpose: ${data.insights.lifePurpose}. Your Destiny Number ${destiny} shows your natural talents. Together, they guide you toward ${data.insights.personalGrowth[0] || 'personal fulfillment'}.`
    }
    
    if (query.includes('challenge') || query.includes('difficulty') || query.includes('problem')) {
      return `Your Life Path ${lifePath} challenges you to develop ${data.insights.challenges[0] || 'patience'}. Your karmic debts ${data.karmicDebts.join(', ')} indicate lessons to learn. This Personal Year ${personalYear} is about ${this.getPersonalYearFocus(personalYear)}.`
    }
    
    return `Your Life Path ${lifePath} and Destiny Number ${destiny} create a unique combination. Your strengths include ${data.insights.strengths[0] || 'leadership'} and ${data.insights.strengths[1] || 'creativity'}. Focus on developing your ${data.insights.personalGrowth[0] || 'natural talents'}.`
  }

  // Generate personalized suggestions
  private generateSuggestions(query: string, data: NumerologyData): string[] {
    const suggestions: string[] = []
    const lifePath = data.lifePathNumber
    const personalYear = data.personalYearNumber
    
    if (query.includes('career') || query.includes('work')) {
      suggestions.push(`Focus on your Life Path ${lifePath} strengths: ${data.insights.strengths[0] || 'leadership'}`)
      suggestions.push(`This Personal Year ${personalYear} is perfect for ${this.getPersonalYearFocus(personalYear)}`)
      suggestions.push(`Consider careers in: ${data.insights.careerPaths.slice(0, 2).join(', ')}`)
      suggestions.push(`Work on developing your ${data.insights.challenges[0] || 'patience'}`)
    }
    
    if (query.includes('relationship') || query.includes('love')) {
      suggestions.push(`Seek partners with Life Path Numbers: ${data.insights.compatibility.slice(0, 2).join(', ')}`)
      suggestions.push(`Express your Soul Number ${data.soulNumber} desires authentically`)
      suggestions.push(`Balance your Personality Number ${data.personalityNumber} with inner truth`)
      suggestions.push(`Focus on your nurturing qualities (Life Path ${lifePath})`)
    }
    
    if (query.includes('purpose') || query.includes('meaning')) {
      suggestions.push(`Embrace your Life Path ${lifePath} purpose: ${data.insights.lifePurpose}`)
      suggestions.push(`Develop your Destiny Number ${data.destinyNumber} talents`)
      suggestions.push(`Work through karmic lessons: ${data.karmicDebts.join(', ')}`)
      suggestions.push(`Focus on personal growth areas: ${data.insights.personalGrowth[0]}`)
    }
    
    // Add general suggestions
    suggestions.push(`Pay attention to your Personal Year ${personalYear} energy`)
    suggestions.push(`Use your Life Path ${lifePath} strengths daily`)
    suggestions.push(`Work on your karmic debts: ${data.karmicDebts.join(', ')}`)
    
    return suggestions.slice(0, 4)
  }

  // Generate personalized insights
  private generateInsights(query: string, data: NumerologyData): string[] {
    const insights: string[] = []
    
    insights.push(`Your Life Path ${data.lifePathNumber} reveals your core purpose: ${data.insights.lifePurpose}`)
    insights.push(`Your Destiny Number ${data.destinyNumber} shows your natural talents and abilities`)
    insights.push(`Your Soul Number ${data.soulNumber} represents your deepest desires and inner self`)
    insights.push(`Your Personality Number ${data.personalityNumber} shows how others see you`)
    
    if (data.masterNumbers.length > 0) {
      insights.push(`You have Master Numbers: ${data.masterNumbers.join(', ')} - indicating spiritual gifts`)
    }
    
    if (data.karmicDebts.length > 0) {
      insights.push(`Your karmic debts ${data.karmicDebts.join(', ')} indicate important life lessons`)
    }
    
    return insights
  }

  // Generate actionable steps
  private generateActionableSteps(query: string, data: NumerologyData): string[] {
    const steps: string[] = []
    
    steps.push(`Focus on your Life Path ${data.lifePathNumber} strengths this week`)
    steps.push(`Work on your Personal Year ${data.personalYearNumber} goals`)
    steps.push(`Develop your Destiny Number ${data.destinyNumber} talents`)
    steps.push(`Address your karmic debts: ${data.karmicDebts.join(', ')}`)
    
    return steps
  }

  // Generate encouragement
  private generateEncouragement(data: NumerologyData): string {
    const lifePath = data.lifePathNumber
    const destiny = data.destinyNumber
    const personalYear = data.personalYearNumber
    
    return `Your Life Path ${lifePath} and Destiny Number ${destiny} create a powerful combination. You have the natural abilities to achieve great things. This Personal Year ${personalYear} brings ${this.getPersonalYearFocus(personalYear)}. Trust in your numerological gifts and embrace your unique path. Your numbers show you're exactly where you need to be.`
  }

  // Generate related numbers
  private generateRelatedNumbers(query: string, data: NumerologyData): number[] {
    const numbers: number[] = []
    
    numbers.push(data.lifePathNumber)
    numbers.push(data.destinyNumber)
    numbers.push(data.soulNumber)
    numbers.push(data.personalityNumber)
    numbers.push(data.personalYearNumber)
    
    if (data.masterNumbers.length > 0) {
      numbers.push(...data.masterNumbers)
    }
    
    return numbers
  }

  // Get personal year focus
  private getPersonalYearFocus(personalYear: number): string {
    const focuses: { [key: number]: string } = {
      1: 'new beginnings and leadership',
      2: 'partnerships and cooperation',
      3: 'creativity and self-expression',
      4: 'building foundations and hard work',
      5: 'change and adventure',
      6: 'responsibility and nurturing',
      7: 'spiritual growth and analysis',
      8: 'achievement and material success',
      9: 'completion and humanitarian work'
    }
    
    return focuses[personalYear] || 'personal growth and development'
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
export const numerologyIntelligence = new NumerologyIntelligence()

// Helper functions for external use
export async function getIntelligentNumerologyData(
  userId: string,
  fullName: string,
  birthDate: string
): Promise<NumerologyData> {
  return numerologyIntelligence.calculateNumerologyData(userId, fullName, birthDate)
}

export async function getNumerologyCoaching(
  userId: string,
  numerologyData: NumerologyData,
  query: string,
  context?: Partial<NumerologyCoachingContext>
): Promise<NumerologyCoachingResponse> {
  const coachingContext: NumerologyCoachingContext = {
    userId,
    numerologyData,
    userQuery: query,
    ...context
  }
  
  return numerologyIntelligence.provideCoaching(coachingContext)
}

export function getNumerologySystemStatus() {
  return numerologyIntelligence.getSystemStatus()
} 