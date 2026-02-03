// Unified Prediction Engine for FutureSeer
// Coordinates all symbolic systems, AI predictions, and remedy generation

import { PredictiveSystem } from './predictiveAlgorithms'
import { generateAIPrediction, getSymbolicData, getRemedies } from './api'
import { getAstroData } from './api'
import { getUserProfile } from './firebase'

// Import all symbolic intelligence systems
import { getTarotReading } from './tarotIntelligence'
import { getVedicReading } from './vedicIntelligence'
import { getKPReading } from './kpAstrologyIntelligence'
// Chaldean intelligence not available - using numerology instead
import { getIChingReading } from './ichingIntelligence'
import { getRunesReading } from './runesIntelligence'
import { getPalmistryReading } from './palmistryIntelligence'
import { getFaceReading } from './faceReadingIntelligence'
import { getNumerologyReading } from './numerologyIntelligence'
import { getWesternAstrologyReading } from './westernAstrologyIntelligence'
import { getDreamSymbolsReading } from './dreamSymbolsIntelligence'
import { getAngelNumbersReading } from './angelNumbersIntelligence'
import { getBaziReading } from './baziIntelligence'
import { getKabbalisticReading } from './kabbalisticNumerologyIntelligence'
import { getGeomancyReading } from './geomancyIntelligence'
import { getLenormandReading } from './lenormandIntelligence'
import { getPendulumReading } from './pendulumIntelligence'
import { getVastuReading } from './vastuIntelligence'
import { getSynastryReading } from './synastryIntelligence'
import { getNameAnalysisReading } from './nameAnalysisIntelligence'
import { getMedicalAstrologyReading } from './medicalAstrologyIntelligence'
import { getMundaneAstrologyReading } from './mundaneAstrologyIntelligence'
import { getFinancialAstrologyReading } from './financialAstrologyIntelligence'
import { getHoraryAstrologyReading } from './horaryAstrologyIntelligence'
import { getThirteenSignsReading } from './thirteenSignsZodiacIntelligence'

// Import remedy generation
import { generateComprehensiveRemedies } from './comprehensiveRemedyGenerator'

// Types
export interface PredictionRequest {
  question: string
  userId: string
  userProfile?: any
  context?: {
    currentMood?: string
    lifeArea?: string
    urgency?: 'low' | 'medium' | 'high'
    specificFocus?: string
  }
}

export interface SymbolicReading {
  system: string
  reading: string
  confidence: number
  keywords: string[]
  timing?: string
  advice?: string
}

export interface UnifiedPrediction {
  question: string
  userId: string
  timestamp: number
  
  // Core predictions
  aiPrediction: {
    answer: string
    confidence: number
    reasoning: string[]
  }
  
  // Symbolic readings
  symbolicReadings: SymbolicReading[]
  
  // Advanced algorithms
  markovPrediction?: {
    prediction: string
    confidence: number
    timing: string
    recommendations: string[]
  }
  
  bayesianPrediction?: {
    prediction: string
    confidence: number
    factors: string[]
    reasoning: string[]
  }
  
  // Combined insights
  combinedInsight: {
    primaryMessage: string
    confidence: number
    timing: string
    keyFactors: string[]
    recommendations: string[]
  }
  
  // Remedies and actions
  remedies: {
    immediate: string[]
    shortTerm: string[]
    longTerm: string[]
    spiritual: string[]
    practical: string[]
  }
  
  // Metadata
  metadata: {
    systemsUsed: string[]
    dataQuality: 'high' | 'medium' | 'low'
    processingTime: number
    userProfileComplete: boolean
    astroDataAvailable: boolean
  }
}

export class PredictionEngine {
  private predictiveSystem: PredictiveSystem
  
  constructor() {
    this.predictiveSystem = new PredictiveSystem()
  }
  
  async generateUnifiedPrediction(request: PredictionRequest): Promise<UnifiedPrediction> {
    const startTime = Date.now()
    
    try {
      console.log('🔮 PredictionEngine: Starting unified prediction...')
      
      // Get user profile and astro data
      const userProfile = request.userProfile || await getUserProfile(request.userId)
      const astroData = userProfile?.birthDate && userProfile?.birthPlace 
        ? await getAstroData(userProfile.birthDate, userProfile.birthPlace, request.userId)
        : null
      
      // Generate AI prediction
      const aiPrediction = await this.generateAIPrediction(request.question, astroData)
      
      // Generate symbolic readings
      const symbolicReadings = await this.generateSymbolicReadings(request.question, astroData, userProfile)
      
      // Generate advanced algorithmic predictions
      const advancedPredictions = await this.generateAdvancedPredictions(request, astroData, userProfile)
      
      // Generate remedies
      const remedies = await this.generateRemedies(request.question, symbolicReadings, astroData)
      
      // Combine insights
      const combinedInsight = this.combineInsights(aiPrediction, symbolicReadings, advancedPredictions)
      
      const processingTime = Date.now() - startTime
      
      return {
        question: request.question,
        userId: request.userId,
        timestamp: Date.now(),
        aiPrediction,
        symbolicReadings,
        ...advancedPredictions,
        combinedInsight,
        remedies,
        metadata: {
          systemsUsed: this.getSystemsUsed(symbolicReadings),
          dataQuality: this.assessDataQuality(userProfile, astroData),
          processingTime,
          userProfileComplete: this.isProfileComplete(userProfile),
          astroDataAvailable: !!astroData
        }
      }
      
    } catch (error) {
      console.error('❌ PredictionEngine: Error generating prediction:', error)
      throw new Error(`Failed to generate prediction: ${error.message}`)
    }
  }
  
  private async generateAIPrediction(question: string, astroData: any) {
    try {
      const symbolicData = getSymbolicData(question, astroData)
      const aiResult = await generateAIPrediction(question, astroData, symbolicData)
      
      return {
        answer: aiResult.answer,
        confidence: aiResult.confidence || 0.7,
        reasoning: aiResult.reasoning || []
      }
    } catch (error) {
      console.warn('⚠️ AI prediction failed, using fallback:', error)
      return {
        answer: "I sense the energies around your question. The cosmic forces suggest a period of reflection and careful consideration.",
        confidence: 0.5,
        reasoning: ["Using intuitive fallback due to technical limitations"]
      }
    }
  }
  
  private async generateSymbolicReadings(question: string, astroData: any, userProfile: any): Promise<SymbolicReading[]> {
    const readings: SymbolicReading[] = []
    const systems = [
      { name: 'Tarot', fn: getTarotReading },
      { name: 'Vedic', fn: getVedicReading },
      { name: 'KP Astrology', fn: getKPReading },
      { name: 'I Ching', fn: getIChingReading },
      { name: 'Runes', fn: getRunesReading },
      { name: 'Numerology', fn: getNumerologyReading },
      { name: 'Western Astrology', fn: getWesternAstrologyReading },
      { name: 'Angel Numbers', fn: getAngelNumbersReading },
      { name: 'Bazi', fn: getBaziReading },
      { name: 'Kabbalistic Numerology', fn: getKabbalisticReading },
      { name: 'Geomancy', fn: getGeomancyReading },
      { name: 'Lenormand', fn: getLenormandReading },
      { name: 'Pendulum', fn: getPendulumReading },
      { name: 'Vastu', fn: getVastuReading },
      { name: 'Synastry', fn: getSynastryReading },
      { name: 'Name Analysis', fn: getNameAnalysisReading },
      { name: 'Medical Astrology', fn: getMedicalAstrologyReading },
      { name: 'Mundane Astrology', fn: getMundaneAstrologyReading },
      { name: 'Financial Astrology', fn: getFinancialAstrologyReading },
      { name: 'Horary Astrology', fn: getHoraryAstrologyReading },
      { name: 'Thirteen Signs', fn: getThirteenSignsReading }
    ]
    
    // Add palmistry and face reading if user has photos
    if (userProfile?.palmPhotoUrl) {
      systems.push({ name: 'Palmistry', fn: getPalmistryReading })
    }
    if (userProfile?.facePhotoUrl) {
      systems.push({ name: 'Face Reading', fn: getFaceReading })
    }
    
    // Generate readings in parallel with timeout
    const readingPromises = systems.map(async (system) => {
      try {
        const result = await Promise.race([
          system.fn(question, astroData, userProfile),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 5000)
          )
        ])
        
        return {
          system: system.name,
          reading: result.reading || result.answer || result.prediction || "The energies are unclear at this moment.",
          confidence: result.confidence || 0.6,
          keywords: result.keywords || [],
          timing: result.timing,
          advice: result.advice
        }
      } catch (error) {
        console.warn(`⚠️ ${system.name} reading failed:`, error)
        return null
      }
    })
    
    const results = await Promise.all(readingPromises)
    return results.filter(Boolean) as SymbolicReading[]
  }
  
  private async generateAdvancedPredictions(request: PredictionRequest, astroData: any, userProfile: any) {
    try {
      if (!userProfile?.birthDate) {
        return {}
      }
      
      const currentState = this.determineCurrentState(request.question, request.context)
      const userBehavior = this.extractUserBehavior(request.question, request.context)
      
      const comprehensivePrediction = await this.predictiveSystem.generateComprehensivePrediction(
        request.userId,
        currentState,
        astroData,
        this.generateNumerologyData(userProfile),
        userBehavior,
        { question: request.question, context: request.context }
      )
      
      return {
        markovPrediction: {
          prediction: comprehensivePrediction.markovPrediction.possibleTransitions[0]?.nextState || "Transition period",
          confidence: comprehensivePrediction.markovPrediction.confidence,
          timing: comprehensivePrediction.timing,
          recommendations: comprehensivePrediction.recommendations
        },
        bayesianPrediction: {
          prediction: comprehensivePrediction.bayesianPrediction.prediction,
          confidence: comprehensivePrediction.bayesianPrediction.confidence,
          factors: comprehensivePrediction.bayesianPrediction.factors,
          reasoning: comprehensivePrediction.bayesianPrediction.reasoning
        }
      }
    } catch (error) {
      console.warn('⚠️ Advanced predictions failed:', error)
      return {}
    }
  }
  
  private async generateRemedies(question: string, symbolicReadings: SymbolicReading[], astroData: any) {
    try {
      const symbolicData = {
        readings: symbolicReadings,
        dominantThemes: this.extractDominantThemes(symbolicReadings),
        astroData
      }
      
      const remedies = await generateComprehensiveRemedies(question, symbolicData)
      
      return {
        immediate: remedies.immediate || [],
        shortTerm: remedies.shortTerm || [],
        longTerm: remedies.longTerm || [],
        spiritual: remedies.spiritual || [],
        practical: remedies.practical || []
      }
    } catch (error) {
      console.warn('⚠️ Remedy generation failed:', error)
      return {
        immediate: ["Take a moment to breathe deeply and center yourself"],
        shortTerm: ["Practice mindfulness and stay present"],
        longTerm: ["Consider developing a regular spiritual practice"],
        spiritual: ["Connect with your higher self through meditation"],
        practical: ["Focus on what you can control and take small steps forward"]
      }
    }
  }
  
  private combineInsights(
    aiPrediction: any,
    symbolicReadings: SymbolicReading[],
    advancedPredictions: any
  ) {
    // Extract key themes from all readings
    const allKeywords = symbolicReadings.flatMap(r => r.keywords)
    const keywordFrequency = this.countKeywordFrequency(allKeywords)
    const dominantThemes = Object.entries(keywordFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([keyword]) => keyword)
    
    // Calculate combined confidence
    const confidences = [
      aiPrediction.confidence,
      ...symbolicReadings.map(r => r.confidence),
      advancedPredictions.markovPrediction?.confidence,
      advancedPredictions.bayesianPrediction?.confidence
    ].filter(Boolean)
    
    const averageConfidence = confidences.reduce((a, b) => a + b, 0) / confidences.length
    
    // Generate primary message
    const primaryMessage = this.generatePrimaryMessage(aiPrediction, symbolicReadings, dominantThemes)
    
    // Combine recommendations
    const allRecommendations = [
      ...(advancedPredictions.markovPrediction?.recommendations || []),
      ...(advancedPredictions.bayesianPrediction?.reasoning || []),
      ...symbolicReadings.flatMap(r => r.advice ? [r.advice] : [])
    ].filter(Boolean)
    
    const uniqueRecommendations = [...new Set(allRecommendations)].slice(0, 5)
    
    return {
      primaryMessage,
      confidence: averageConfidence,
      timing: advancedPredictions.markovPrediction?.timing || "Within the next few weeks",
      keyFactors: dominantThemes,
      recommendations: uniqueRecommendations
    }
  }
  
  // Helper methods
  private determineCurrentState(question: string, context?: any): string {
    const questionLower = question.toLowerCase()
    
    if (questionLower.includes('career') || questionLower.includes('job') || questionLower.includes('work')) {
      return 'career_decision'
    } else if (questionLower.includes('love') || questionLower.includes('relationship') || questionLower.includes('romance')) {
      return 'relationship_phase'
    } else if (questionLower.includes('health') || questionLower.includes('wellness') || questionLower.includes('healing')) {
      return 'health_focus'
    } else if (questionLower.includes('money') || questionLower.includes('finance') || questionLower.includes('wealth')) {
      return 'financial_planning'
    } else if (questionLower.includes('travel') || questionLower.includes('journey') || questionLower.includes('move')) {
      return 'transition_period'
    } else {
      return 'general_inquiry'
    }
  }
  
  private extractUserBehavior(question: string, context?: any): string[] {
    const behaviors: string[] = []
    const questionLower = question.toLowerCase()
    
    if (questionLower.includes('urgent') || questionLower.includes('immediate')) {
      behaviors.push('urgent_decision_maker')
    }
    if (questionLower.includes('careful') || questionLower.includes('thoughtful')) {
      behaviors.push('cautious_planner')
    }
    if (questionLower.includes('change') || questionLower.includes('transition')) {
      behaviors.push('embracing_change')
    }
    if (questionLower.includes('stuck') || questionLower.includes('confused')) {
      behaviors.push('seeking_clarity')
    }
    
    return behaviors
  }
  
  private generateNumerologyData(userProfile: any) {
    if (!userProfile?.birthDate) return {}
    
    const birthDate = new Date(userProfile.birthDate)
    const currentYear = new Date().getFullYear()
    const personalYear = this.calculatePersonalYear(birthDate, currentYear)
    
    return {
      personalYear,
      lifePathNumber: this.calculateLifePathNumber(birthDate),
      destinyNumber: this.calculateDestinyNumber(userProfile.displayName || ''),
      soulNumber: this.calculateSoulNumber(userProfile.displayName || '')
    }
  }
  
  private calculatePersonalYear(birthDate: Date, currentYear: number): number {
    const month = birthDate.getMonth() + 1
    const day = birthDate.getDate()
    const yearSum = currentYear.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0)
    const personalYear = month + day + yearSum
    
    return personalYear > 9 ? Math.floor(personalYear / 10) + (personalYear % 10) : personalYear
  }
  
  private calculateLifePathNumber(birthDate: Date): number {
    const dateString = birthDate.toISOString().split('T')[0].replace(/-/g, '')
    const sum = dateString.split('').reduce((acc, digit) => acc + parseInt(digit), 0)
    return sum > 9 ? Math.floor(sum / 10) + (sum % 10) : sum
  }
  
  private calculateDestinyNumber(name: string): number {
    const nameSum = name.replace(/\s/g, '').toLowerCase().split('').reduce((sum, char) => {
      const charCode = char.charCodeAt(0) - 96
      return sum + (charCode >= 1 && charCode <= 26 ? charCode : 0)
    }, 0)
    return nameSum > 9 ? Math.floor(nameSum / 10) + (nameSum % 10) : nameSum
  }
  
  private calculateSoulNumber(name: string): number {
    const vowels = name.replace(/\s/g, '').toLowerCase().split('').filter(char => 'aeiou'.includes(char))
    const vowelSum = vowels.reduce((sum, char) => {
      const charCode = char.charCodeAt(0) - 96
      return sum + charCode
    }, 0)
    return vowelSum > 9 ? Math.floor(vowelSum / 10) + (vowelSum % 10) : vowelSum
  }
  
  private extractDominantThemes(readings: SymbolicReading[]): string[] {
    const allKeywords = readings.flatMap(r => r.keywords)
    const keywordFrequency = this.countKeywordFrequency(allKeywords)
    return Object.entries(keywordFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([keyword]) => keyword)
  }
  
  private countKeywordFrequency(keywords: string[]): Record<string, number> {
    return keywords.reduce((acc, keyword) => {
      acc[keyword] = (acc[keyword] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }
  
  private generatePrimaryMessage(aiPrediction: any, symbolicReadings: SymbolicReading[], dominantThemes: string[]) {
    if (aiPrediction.confidence > 0.8) {
      return aiPrediction.answer
    }
    
    const highConfidenceReadings = symbolicReadings.filter(r => r.confidence > 0.7)
    if (highConfidenceReadings.length > 0) {
      return highConfidenceReadings[0].reading
    }
    
    return `The cosmic energies suggest ${dominantThemes.join(', ')} are prominent in your current situation. Trust your intuition and remain open to the guidance that comes your way.`
  }
  
  private getSystemsUsed(readings: SymbolicReading[]): string[] {
    return readings.map(r => r.system)
  }
  
  private assessDataQuality(userProfile: any, astroData: any): 'high' | 'medium' | 'low' {
    if (userProfile?.birthDate && userProfile?.birthPlace && astroData && userProfile?.palmPhotoUrl) {
      return 'high'
    } else if (userProfile?.birthDate && userProfile?.birthPlace) {
      return 'medium'
    } else {
      return 'low'
    }
  }
  
  private isProfileComplete(userProfile: any): boolean {
    return !!(userProfile?.birthDate && userProfile?.birthPlace && userProfile?.gender)
  }
}

// Export singleton instance
export const predictionEngine = new PredictionEngine()

// Export convenience function
export async function generatePrediction(request: PredictionRequest): Promise<UnifiedPrediction> {
  return predictionEngine.generateUnifiedPrediction(request)
}
