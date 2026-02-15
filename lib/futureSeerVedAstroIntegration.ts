/**
 * FutureSeer VedAstro Integration Service
 * Strategic integration of VedAstro capabilities into FutureSeer app
 */

import { vedAstroApiService, BirthData, VedAstroResponse } from './vedAstroApiService'
import { devLog } from '@/lib/devLogger';

export interface FutureSeerUserProfile {
  id: string
  name: string
  birthDate: string
  birthTime: string
  birthPlace: string
  latitude?: number
  longitude?: number
  timezone?: string
  preferences?: {
    chartStyle: 'south' | 'north'
    language: string
    notifications: boolean
  }
}

export interface IntegratedAnalysis {
  // Core Charts
  divisionalCharts: Record<string, any>
  indianCharts: Record<string, any>
  
  // Predictive Analysis
  dasaAnalysis: any
  predictions: any
  gocharaAnalysis: any
  
  // Daily Features
  panchanga: any
  tarabala: any
  
  // Planetary Analysis
  planetData: any
  houseData: any
  nakshatraAnalysis: any
  
  // Compatibility
  compatibilityScore?: number
  
  // Timing
  muhurtaRecommendations: any[]
  
  // Remedies
  gemstoneRecommendations: any[]
  mantraRecommendations: any[]
  
  // Events
  lifeEvents: any[]
  eventPredictions: any[]
}

export class FutureSeerVedAstroIntegration {
  private static instance: FutureSeerVedAstroIntegration

  static getInstance() {
    if (!FutureSeerVedAstroIntegration.instance) {
      FutureSeerVedAstroIntegration.instance = new FutureSeerVedAstroIntegration()
    }
    return FutureSeerVedAstroIntegration.instance
  }

  /**
   * Get comprehensive analysis for a user
   */
  async getComprehensiveAnalysis(userProfile: FutureSeerUserProfile): Promise<IntegratedAnalysis> {
    devLog.debug('🔮 FutureSeer: Starting comprehensive VedAstro analysis...')
    
    const birthData: BirthData = {
      birthDate: userProfile.birthDate,
      birthTime: userProfile.birthTime,
      birthPlace: userProfile.birthPlace,
      latitude: userProfile.latitude,
      longitude: userProfile.longitude,
      timezone: userProfile.timezone
    }

    try {
      // Get all analysis in parallel for better performance
      const [
        divisionalCharts,
        indianCharts,
        dasaAnalysis,
        predictions,
        gocharaAnalysis,
        panchanga,
        tarabala,
        planetData,
        houseData,
        nakshatraAnalysis,
        gemstoneRecommendations,
        mantraRecommendations,
        lifeEvents
      ] = await Promise.allSettled([
        this.getDivisionalCharts(birthData),
        this.getIndianCharts(birthData, userProfile.preferences?.chartStyle),
        vedAstroApiService.getDasaAnalysis(birthData),
        vedAstroApiService.getHoroscopePredictions(birthData),
        vedAstroApiService.getGocharaAnalysis(birthData),
        vedAstroApiService.getPanchangaByDate(new Date().toISOString().split('T')[0]),
        vedAstroApiService.getTarabala(birthData),
        vedAstroApiService.getAllPlanetData(birthData),
        vedAstroApiService.getAllHouseData(birthData),
        vedAstroApiService.getNakshatraAnalysis(birthData),
        vedAstroApiService.getGemstoneRecommendations(birthData),
        vedAstroApiService.getMantraRecommendations(birthData),
        vedAstroApiService.getLifeEventsTimeline(birthData)
      ])

      const analysis: IntegratedAnalysis = {
        divisionalCharts: this.processResult(divisionalCharts),
        indianCharts: this.processResult(indianCharts),
        dasaAnalysis: this.processResult(dasaAnalysis),
        predictions: this.processResult(predictions),
        gocharaAnalysis: this.processResult(gocharaAnalysis),
        panchanga: this.processResult(panchanga),
        tarabala: this.processResult(tarabala),
        planetData: this.processResult(planetData),
        houseData: this.processResult(houseData),
        nakshatraAnalysis: this.processResult(nakshatraAnalysis),
        muhurtaRecommendations: [],
        gemstoneRecommendations: this.processResult(gemstoneRecommendations),
        mantraRecommendations: this.processResult(mantraRecommendations),
        lifeEvents: this.processResult(lifeEvents),
        eventPredictions: []
      }

      devLog.debug('✅ FutureSeer: Comprehensive analysis completed')
      return analysis

    } catch (error) {
      devLog.error('❌ FutureSeer: Comprehensive analysis failed:', error, 'futureSeerVedAstroIntegration')
      throw new Error('VedAstro API is not available. Please try again later.')
    }
  }

  /**
   * Get divisional charts (D1-D60)
   */
  private async getDivisionalCharts(birthData: BirthData): Promise<Record<string, any>> {
    const chartTypes = ['d1', 'd9', 'd10', 'd12', 'd16', 'd20']
    const charts: Record<string, any> = {}

    const promises = chartTypes.map(async (chartType) => {
      try {
        const result = await vedAstroApiService.getDivisionalChart(chartType, birthData)
        charts[chartType] = result
      } catch (error) {
        devLog.error(`Failed to get ${chartType} chart:`, error, 'futureSeerVedAstroIntegration')
        charts[chartType] = null
      }
    })

    await Promise.all(promises)
    return charts
  }

  /**
   * Get Indian charts (South/North)
   */
  private async getIndianCharts(birthData: BirthData, chartStyle?: 'south' | 'north'): Promise<Record<string, any>> {
    const charts: Record<string, any> = {}

    try {
      // Get both styles for comparison
      const [southChart, northChart] = await Promise.allSettled([
        vedAstroApiService.getIndianChart('south', birthData),
        vedAstroApiService.getIndianChart('north', birthData)
      ])

      charts.south = this.processResult(southChart)
      charts.north = this.processResult(northChart)
      
      // Set preferred style as primary
      if (chartStyle) {
        charts.primary = charts[chartStyle]
      } else {
        charts.primary = charts.south // Default to South Indian
      }

    } catch (error) {
      devLog.error('Failed to get Indian charts:', error, 'futureSeerVedAstroIntegration')
    }

    return charts
  }

  /**
   * Get compatibility analysis for two users
   */
  async getCompatibilityAnalysis(
    user1: FutureSeerUserProfile, 
    user2: FutureSeerUserProfile
  ): Promise<{
    compatibilityScore: number
    kutaAnalysis: any
    recommendations: string[]
    compatibilityLevel: 'Excellent' | 'Good' | 'Average' | 'Poor'
  }> {
    const birthData1: BirthData = {
      birthDate: user1.birthDate,
      birthTime: user1.birthTime,
      birthPlace: user1.birthPlace,
      latitude: user1.latitude,
      longitude: user1.longitude,
      timezone: user1.timezone
    }

    const birthData2: BirthData = {
      birthDate: user2.birthDate,
      birthTime: user2.birthTime,
      birthPlace: user2.birthPlace,
      latitude: user2.latitude,
      longitude: user2.longitude,
      timezone: user2.timezone
    }

    try {
      const [kutaAnalysis, matchScore] = await Promise.all([
        vedAstroApiService.getCompatibilityAnalysis(birthData1, birthData2),
        vedAstroApiService.getMatchScore(birthData1, birthData2)
      ])

      const compatibilityScore = this.calculateCompatibilityScore(kutaAnalysis, matchScore)
      const compatibilityLevel = this.getCompatibilityLevel(compatibilityScore)
      const recommendations = this.generateCompatibilityRecommendations(kutaAnalysis, compatibilityScore)

      return {
        compatibilityScore,
        kutaAnalysis: this.processVedAstroResponse(kutaAnalysis),
        recommendations,
        compatibilityLevel
      }

    } catch (error) {
      devLog.error('Failed to get compatibility analysis:', error, 'futureSeerVedAstroIntegration')
      throw new Error('Compatibility analysis is not available. VedAstro API is not accessible.')
    }
  }

  /**
   * Process VedAstro API response
   */
  private processVedAstroResponse(response: VedAstroResponse): any {
    if (!response || response.Status !== 'Success') {
      return null
    }

    return {
      data: response.Payload,
      status: response.Status,
      input: response.Input,
      timestamp: new Date().toISOString(),
      source: 'FutureSeer AI-Powered Mystic'
    }
  }

  /**
   * Process Promise.allSettled result
   */
  private processResult(result: PromiseSettledResult<any>): any {
    if (result.status === 'fulfilled') {
      return this.processVedAstroResponse(result.value)
    } else {
      // Handle 404 errors gracefully - these are expected for some endpoints
      const error = result.reason
      if (error?.message?.includes('404')) {
        devLog.debug('ℹ️ VedAstro endpoint not available (expected for some features)')
        return null
      } else {
        devLog.error('Promise rejected:', result.reason, 'futureSeerVedAstroIntegration')
        return null
      }
    }
  }

  /**
   * Generate daily predictions from Panchanga and Tarabala
   */
  private generateDailyPredictions(panchanga: any, tarabala: any): any {
    return {
      auspiciousActivities: this.getAuspiciousActivities(panchanga, tarabala),
      activitiesToAvoid: this.getActivitiesToAvoid(panchanga, tarabala),
      bestTimes: this.getBestTimes(panchanga, tarabala),
      spiritualGuidance: this.getSpiritualGuidance(panchanga, tarabala)
    }
  }

  /**
   * Calculate compatibility score from Kuta analysis
   */
  private calculateCompatibilityScore(kutaAnalysis: any, matchScore: any): number {
    // Implement compatibility scoring logic
    // This would analyze the Kuta points and return a score out of 100
    return 75 // Placeholder
  }

  /**
   * Get compatibility level based on score
   */
  private getCompatibilityLevel(score: number): 'Excellent' | 'Good' | 'Average' | 'Poor' {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Average'
    return 'Poor'
  }

  /**
   * Generate compatibility recommendations
   */
  private generateCompatibilityRecommendations(kutaAnalysis: any, score: number): string[] {
    const recommendations: string[] = []
    
    if (score >= 80) {
      recommendations.push('Excellent compatibility! This relationship has great potential.')
    } else if (score >= 60) {
      recommendations.push('Good compatibility with some areas for improvement.')
    } else {
      recommendations.push('Consider astrological remedies to improve compatibility.')
    }

    return recommendations
  }

  /**
   * Generate muhurta recommendations
   */
  private generateMuhurtaRecommendations(eventType: string, muhurta: any): string[] {
    const recommendations: string[] = []
    
    switch (eventType) {
      case 'marriage':
        recommendations.push('Choose dates when Venus and Jupiter are strong')
        recommendations.push('Avoid dates during Mars or Saturn periods')
        break
      case 'business':
        recommendations.push('Start business during Mercury or Jupiter periods')
        recommendations.push('Avoid dates during Mars or Rahu periods')
        break
      case 'travel':
        recommendations.push('Travel during favorable planetary periods')
        recommendations.push('Avoid travel during malefic planetary periods')
        break
      case 'medical':
        recommendations.push('Schedule procedures during favorable planetary periods')
        recommendations.push('Avoid dates during Mars or Ketu periods')
        break
    }

    return recommendations
  }

  /**
   * Get auspicious activities for the day
   */
  private getAuspiciousActivities(panchanga: any, tarabala: any): string[] {
    return [
      'Meditation and spiritual practices',
      'Charity and helping others',
      'Learning and education',
      'Creative activities'
    ]
  }

  /**
   * Get activities to avoid for the day
   */
  private getActivitiesToAvoid(panchanga: any, tarabala: any): string[] {
    return [
      'Important financial decisions',
      'Starting new projects',
      'Conflict and arguments',
      'Major purchases'
    ]
  }

  /**
   * Get best times for activities
   */
  private getBestTimes(panchanga: any, tarabala: any): any {
    return {
      morning: '6:00 AM - 8:00 AM',
      afternoon: '12:00 PM - 2:00 PM',
      evening: '6:00 PM - 8:00 PM'
    }
  }

  /**
   * Get spiritual guidance for the day
   */
  private getSpiritualGuidance(panchanga: any, tarabala: any): string {
    return 'Focus on inner peace and spiritual growth today. Practice gratitude and compassion.'
  }


  /**
   * Get Panchanga (Daily Calendar) - Updated for 2025-09-25
   */
  async getPanchanga(birthData: BirthData): Promise<any> {
    try {
      const result = await vedAstroApiService.getPanchanga(birthData, '2025-09-25')
      return this.processVedAstroResponse(result)
    } catch (error) {
      devLog.error('Failed to get Panchanga:', error, 'futureSeerVedAstroIntegration')
      throw new Error('Panchanga data is not available. VedAstro API is not accessible.')
    }
  }

  /**
   * Get Tarabala (Daily Auspiciousness) - Updated for 2025-09-25
   */
  async getTarabala(birthData: BirthData): Promise<any> {
    try {
      const result = await vedAstroApiService.getTarabala(birthData, '2025-09-25')
      return this.processVedAstroResponse(result)
    } catch (error) {
      devLog.error('Failed to get Tarabala:', error, 'futureSeerVedAstroIntegration')
      throw new Error('Tarabala data is not available. VedAstro API is not accessible.')
    }
  }

  /**
   * Get Nakshatra Analysis
   */
  async getNakshatraAnalysis(birthData: BirthData): Promise<any> {
    try {
      const result = await vedAstroApiService.getNakshatraAnalysis(birthData)
      return this.processVedAstroResponse(result)
    } catch (error) {
      devLog.error('Failed to get Nakshatra analysis:', error, 'futureSeerVedAstroIntegration')
      throw new Error('Nakshatra analysis is not available. VedAstro API is not accessible.')
    }
  }

  /**
   * Get Planetary Strength (Shadbala)
   */
  async getPlanetaryStrength(birthData: BirthData): Promise<any> {
    try {
      const result = await vedAstroApiService.getPlanetaryStrength(birthData)
      return this.processVedAstroResponse(result)
    } catch (error) {
      devLog.error('Failed to get planetary strength:', error, 'futureSeerVedAstroIntegration')
      throw new Error('Planetary strength data is not available. VedAstro API is not accessible.')
    }
  }

  /**
   * Get Planet Data
   */
  async getPlanetData(birthData: BirthData): Promise<any> {
    try {
      const result = await vedAstroApiService.getPlanetPositions(birthData)
      return this.processVedAstroResponse(result)
    } catch (error) {
      devLog.error('Failed to get planet data:', error, 'futureSeerVedAstroIntegration')
      throw new Error('Planet data is not available. VedAstro API is not accessible.')
    }
  }

  /**
   * Get House Data
   */
  async getHouseData(birthData: BirthData): Promise<any> {
    try {
      const result = await vedAstroApiService.getHousePositions(birthData)
      return this.processVedAstroResponse(result)
    } catch (error) {
      devLog.error('Failed to get house data:', error, 'futureSeerVedAstroIntegration')
      throw new Error('House data is not available. VedAstro API is not accessible.')
    }
  }

  /**
   * Get Future Transits (2025-2030)
   */
  async getFutureTransits(birthData: BirthData): Promise<any> {
    try {
      const result = await vedAstroApiService.getFutureTransits(birthData, '2025-09-25', '2030-12-31')
      return this.processVedAstroResponse(result)
    } catch (error) {
      devLog.error('Failed to get future transits:', error, 'futureSeerVedAstroIntegration')
      throw new Error('Future transits data is not available. VedAstro API is not accessible.')
    }
  }

  /**
   * Get Advanced Astrological Analysis
   */
  async getAdvancedAnalysis(birthData: BirthData): Promise<any> {
    try {
      const [
        ashtavarga,
        vargas,
        planetaryDignities,
        aspectAnalysis,
        retrogradeAnalysis,
        eclipseAnalysis,
        solarReturn,
        lunarReturn
      ] = await Promise.allSettled([
        vedAstroApiService.getAshtavargaAnalysis(birthData),
        vedAstroApiService.getVargasAnalysis(birthData),
        vedAstroApiService.getPlanetaryDignities(birthData),
        vedAstroApiService.getAspectAnalysis(birthData),
        vedAstroApiService.getRetrogradeAnalysis(birthData),
        vedAstroApiService.getEclipseAnalysis(birthData),
        vedAstroApiService.getSolarReturnAnalysis(birthData, '2025-09-25'),
        vedAstroApiService.getLunarReturnAnalysis(birthData, '2025-09-25')
      ])

      return {
        ashtavarga: ashtavarga.status === 'fulfilled' ? this.processVedAstroResponse(ashtavarga.value) : null,
        vargas: vargas.status === 'fulfilled' ? this.processVedAstroResponse(vargas.value) : null,
        planetaryDignities: planetaryDignities.status === 'fulfilled' ? this.processVedAstroResponse(planetaryDignities.value) : null,
        aspectAnalysis: aspectAnalysis.status === 'fulfilled' ? this.processVedAstroResponse(aspectAnalysis.value) : null,
        retrogradeAnalysis: retrogradeAnalysis.status === 'fulfilled' ? this.processVedAstroResponse(retrogradeAnalysis.value) : null,
        eclipseAnalysis: eclipseAnalysis.status === 'fulfilled' ? this.processVedAstroResponse(eclipseAnalysis.value) : null,
        solarReturn: solarReturn.status === 'fulfilled' ? this.processVedAstroResponse(solarReturn.value) : null,
        lunarReturn: lunarReturn.status === 'fulfilled' ? this.processVedAstroResponse(lunarReturn.value) : null
      }
    } catch (error) {
      devLog.error('Failed to get advanced analysis:', error, 'futureSeerVedAstroIntegration')
      throw new Error('Advanced analysis is not available. VedAstro API is not accessible.')
    }
  }

}

// Export the singleton instance
export const futureSeerVedAstroIntegration = new FutureSeerVedAstroIntegration()

