/**
 * Comprehensive VedAstro API Service
 * Handles all VedAstro endpoints for strategic integration into FutureSeer
 */

export interface VedAstroApiConfig {
  baseUrl: string
  timeout: number
  retryAttempts: number
}

export interface BirthData {
  birthDate: string
  birthTime: string
  birthPlace: string
  latitude?: number
  longitude?: number
  timezone?: string
}

export interface VedAstroResponse<T = any> {
  Status: string
  Input: any
  Payload: T
  timestamp?: string
}

export class VedAstroApiService {
  private static instance: VedAstroApiService
  private config: VedAstroApiConfig

  constructor() {
    this.config = {
      baseUrl: 'https://api.vedastro.org',
      timeout: 10000,
      retryAttempts: 3
    }
  }

  static getInstance() {
    if (!VedAstroApiService.instance) {
      VedAstroApiService.instance = new VedAstroApiService()
    }
    return VedAstroApiService.instance
  }

  /**
   * Make API call to VedAstro with error handling and retries
   */
  private async makeApiCall<T>(
    endpoint: string, 
    data: any, 
    method: 'GET' | 'POST' = 'POST'
  ): Promise<VedAstroResponse<T>> {
    const url = `${this.config.baseUrl}${endpoint}`
    
    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      try {
        console.log(`🔄 VedAstro API Call (Attempt ${attempt}): ${endpoint}`)
        
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'FutureSeer/1.0',
            'Accept': 'application/json'
          },
          body: method === 'POST' ? JSON.stringify(data) : undefined,
          signal: AbortSignal.timeout(this.config.timeout)
        })

        if (!response.ok) {
          throw new Error(`VedAstro API returned ${response.status}: ${response.statusText}`)
        }

        const result = await response.json()
        console.log(`✅ VedAstro API Success: ${endpoint}`)
        return result

      } catch (error) {
        // Handle 404 errors more gracefully - these are expected for some endpoints
        if (error instanceof Error && error.message.includes('404')) {
          console.log(`ℹ️ VedAstro endpoint not available: ${endpoint}`)
          throw error
        }
        
        console.error(`❌ VedAstro API Error (Attempt ${attempt}):`, error)
        
        if (attempt === this.config.retryAttempts) {
          throw error
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
      }
    }
    
    throw new Error('All retry attempts failed')
  }

  // ==================== CORE CHART FEATURES ====================

  /**
   * Get Divisional Charts (D1-D60) - All 16 major divisional charts
   */
  async getDivisionalChart(chartType: string, birthData: BirthData): Promise<VedAstroResponse> {
    const endpoint = `/api/DivisionalChart`
    return this.makeApiCall(endpoint, {
      ...birthData,
      chartType: chartType.toUpperCase()
    })
  }

  /**
   * Get South/North Indian Charts
   */
  async getIndianChart(chartType: 'south' | 'north', birthData: BirthData): Promise<VedAstroResponse> {
    const endpoint = `/api/IndianChart`
    return this.makeApiCall(endpoint, {
      ...birthData,
      chartType: chartType
    })
  }

  /**
   * Get Western Chart (Circular)
   */
  async getWesternChart(birthData: BirthData): Promise<VedAstroResponse> {
    const endpoint = `/api/WesternChart`
    return this.makeApiCall(endpoint, birthData)
  }

  /**
   * Get Planet Positions
   */
  async getPlanetPositions(birthData: BirthData): Promise<VedAstroResponse> {
    const endpoint = `/api/PlanetPosition`
    return this.makeApiCall(endpoint, birthData)
  }

  /**
   * Get House Positions
   */
  async getHousePositions(birthData: BirthData): Promise<VedAstroResponse> {
    const endpoint = `/api/HousePosition`
    return this.makeApiCall(endpoint, birthData)
  }

  // ==================== PREDICTIVE FEATURES ====================

  /**
   * Get Dasa & Bhukti Analysis
   */
  async getDasaAnalysis(birthData: BirthData): Promise<VedAstroResponse> {
    const endpoint = `/api/DasaChart`
    return this.makeApiCall(endpoint, birthData)
  }

  /**
   * Get Dasa Timeline for specific range
   */
  async getDasaTimeline(birthData: BirthData, startDate: string, endDate: string): Promise<VedAstroResponse> {
    const endpoint = `/api/Horoscope/DasaAtRange`
    return this.makeApiCall(endpoint, {
      ...birthData,
      startDate,
      endDate
    })
  }

  /**
   * Get Horoscope Predictions
   */
  async getHoroscopePredictions(birthData: BirthData): Promise<VedAstroResponse> {
    const endpoint = `/api/Horoscope/Predictions`
    return this.makeApiCall(endpoint, birthData)
  }

  /**
   * Get Current Transits
   */
  async getCurrentTransits(birthData: BirthData): Promise<VedAstroResponse> {
    const endpoint = `/api/CurrentTransit`
    return this.makeApiCall(endpoint, birthData)
  }

  /**
   * Get Future Transits (2025-2030)
   */
  async getFutureTransits(birthData: BirthData, startDate: string = '2025-09-25', endDate: string = '2030-12-31'): Promise<VedAstroResponse> {
    const endpoint = `/api/FutureTransit`
    return this.makeApiCall(endpoint, {
      ...birthData,
      startDate,
      endDate
    })
  }

  /**
   * Get Gochara Analysis
   */
  async getGocharaAnalysis(birthData: BirthData): Promise<VedAstroResponse> {
    const endpoint = `/api/Gochara`
    return this.makeApiCall(endpoint, birthData)
  }

  /**
   * Get Antaram Analysis
   */
  async getAntaramAnalysis(birthData: BirthData): Promise<VedAstroResponse> {
    const endpoint = `/api/Antaram`
    return this.makeApiCall(endpoint, birthData)
  }

  /**
   * Get Sukshma Analysis
   */
  async getSukshmaAnalysis(birthData: BirthData): Promise<VedAstroResponse> {
    const endpoint = `/api/Sukshma`
    return this.makeApiCall(endpoint, birthData)
  }

  // ==================== DAILY FEATURES ====================

  /**
   * Get Panchanga (Daily Calendar)
   */
  async getPanchanga(birthData: BirthData, date?: string): Promise<VedAstroResponse> {
    const endpoint = `/api/Panchanga`
    return this.makeApiCall(endpoint, {
      ...birthData,
      date: date || '2025-09-25' // Today's date
    })
  }

  /**
   * Get Tarabala (Daily Auspiciousness)
   */
  async getTarabala(birthData: BirthData, date?: string): Promise<VedAstroResponse> {
    const endpoint = `/api/Tarabala`
    return this.makeApiCall(endpoint, {
      ...birthData,
      date: date || '2025-09-25' // Today's date
    })
  }

  /**
   * Get Nakshatra Analysis
   */
  async getNakshatraAnalysis(birthData: BirthData): Promise<VedAstroResponse> {
    const endpoint = `/api/Nakshatra`
    return this.makeApiCall(endpoint, birthData)
  }

  /**
   * Get Planetary Strength (Shadbala)
   */
  async getPlanetaryStrength(birthData: BirthData): Promise<VedAstroResponse> {
    const endpoint = `/api/Shadbala`
    return this.makeApiCall(endpoint, birthData)
  }

  /**
   * Get Muhurta (Auspicious Timing)
   */
  async getMuhurta(
    eventType: string, 
    birthData: BirthData, 
    preferredDate?: string
  ): Promise<VedAstroResponse> {
    const endpoint = `/api/Muhurta`
    return this.makeApiCall(endpoint, {
      ...birthData,
      eventType,
      preferredDate: preferredDate || '2025-09-25' // Today's date
    })
  }

  // ==================== PLANETARY ANALYSIS ====================

  /**
   * Get All Planet Data
   */
  async getAllPlanetData(birthData: BirthData): Promise<VedAstroResponse> {
    const endpoint = `/api/Horoscope/AllPlanetData`
    return this.makeApiCall(endpoint, birthData)
  }

  /**
   * Get All House Data
   */
  async getAllHouseData(birthData: BirthData): Promise<VedAstroResponse> {
    const endpoint = `/api/Horoscope/AllHouseData`
    return this.makeApiCall(endpoint, birthData)
  }

  /**
   * Get Nakshatra Analysis
   */
  async getNakshatraAnalysis(birthData: BirthData): Promise<VedAstroResponse> {
    const endpoint = `/api/Horoscope/NakshatraChart`
    return this.makeApiCall(endpoint, birthData)
  }

  // ==================== COMPATIBILITY FEATURES ====================

  /**
   * Get Compatibility Analysis (Kuta Matching)
   */
  async getCompatibilityAnalysis(
    birthData1: BirthData, 
    birthData2: BirthData
  ): Promise<VedAstroResponse> {
    const endpoint = `/api/Match/Kuta`
    return this.makeApiCall(endpoint, {
      person1: birthData1,
      person2: birthData2
    })
  }

  /**
   * Get Match Score
   */
  async getMatchScore(
    birthData1: BirthData, 
    birthData2: BirthData
  ): Promise<VedAstroResponse> {
    const endpoint = `/api/Match/Score`
    return this.makeApiCall(endpoint, {
      person1: birthData1,
      person2: birthData2
    })
  }

  // ==================== VISUAL & SYMBOLIC FEATURES ====================

  /**
   * Get SVG Chart Generation
   */
  async getSVGChart(chartType: string, birthData: BirthData): Promise<VedAstroResponse> {
    const endpoint = `/api/SVGChart`
    return this.makeApiCall(endpoint, {
      ...birthData,
      chartType
    })
  }

  /**
   * Get Chart Images (PNG/SVG)
   */
  async getChartImages(chartType: string, birthData: BirthData): Promise<VedAstroResponse> {
    const endpoint = `/api/ChartImages`
    return this.makeApiCall(endpoint, {
      ...birthData,
      chartType
    })
  }

  /**
   * Get Ancient Symbols Database
   */
  async getAncientSymbols(symbolType: string): Promise<VedAstroResponse> {
    const endpoint = `/api/AncientSymbols`
    return this.makeApiCall(endpoint, {
      symbolType
    })
  }

  /**
   * Get Planetary Glyphs
   */
  async getPlanetaryGlyphs(): Promise<VedAstroResponse> {
    const endpoint = `/api/PlanetaryGlyphs`
    return this.makeApiCall(endpoint, {})
  }

  /**
   * Get Nakshatra Symbols
   */
  async getNakshatraSymbols(): Promise<VedAstroResponse> {
    const endpoint = `/api/NakshatraSymbols`
    return this.makeApiCall(endpoint, {})
  }

  /**
   * Get Yantra Generation
   */
  async getYantraGeneration(planet: string, purpose: string): Promise<VedAstroResponse> {
    const endpoint = `/api/YantraGeneration`
    return this.makeApiCall(endpoint, {
      planet,
      purpose
    })
  }

  /**
   * Get Mandala Generation
   */
  async getMandalaGeneration(type: string, complexity: number): Promise<VedAstroResponse> {
    const endpoint = `/api/MandalaGeneration`
    return this.makeApiCall(endpoint, {
      type,
      complexity
    })
  }

  // ==================== ADVANCED FEATURES ====================

  /**
   * Get Ashtavarga Analysis
   */
  async getAshtavargaAnalysis(birthData: BirthData): Promise<VedAstroResponse> {
    const endpoint = `/api/Ashtavarga`
    return this.makeApiCall(endpoint, birthData)
  }

  /**
   * Get Vargas Analysis
   */
  async getVargasAnalysis(birthData: BirthData): Promise<VedAstroResponse> {
    const endpoint = `/api/Vargas`
    return this.makeApiCall(endpoint, birthData)
  }

  /**
   * Get Planetary Dignities
   */
  async getPlanetaryDignities(birthData: BirthData): Promise<VedAstroResponse> {
    const endpoint = `/api/PlanetaryDignities`
    return this.makeApiCall(endpoint, birthData)
  }

  /**
   * Get Aspect Analysis
   */
  async getAspectAnalysis(birthData: BirthData): Promise<VedAstroResponse> {
    const endpoint = `/api/AspectAnalysis`
    return this.makeApiCall(endpoint, birthData)
  }

  /**
   * Get Retrograde Analysis
   */
  async getRetrogradeAnalysis(birthData: BirthData): Promise<VedAstroResponse> {
    const endpoint = `/api/RetrogradeAnalysis`
    return this.makeApiCall(endpoint, birthData)
  }

  /**
   * Get Eclipse Analysis
   */
  async getEclipseAnalysis(birthData: BirthData): Promise<VedAstroResponse> {
    const endpoint = `/api/EclipseAnalysis`
    return this.makeApiCall(endpoint, birthData)
  }

  /**
   * Get Solar Return Analysis
   */
  async getSolarReturnAnalysis(birthData: BirthData, returnDate?: string): Promise<VedAstroResponse> {
    const endpoint = `/api/SolarReturn`
    return this.makeApiCall(endpoint, {
      ...birthData,
      returnDate: returnDate || '2025-09-25'
    })
  }

  /**
   * Get Lunar Return Analysis
   */
  async getLunarReturnAnalysis(birthData: BirthData, returnDate?: string): Promise<VedAstroResponse> {
    const endpoint = `/api/LunarReturn`
    return this.makeApiCall(endpoint, {
      ...birthData,
      returnDate: returnDate || '2025-09-25'
    })
  }

  /**
   * Get Panchanga (Daily Astrological Calendar)
   */
  async getPanchanga(date: string, latitude?: number, longitude?: number): Promise<VedAstroResponse> {
    const endpoint = `/api/Panchanga`
    return this.makeApiCall(endpoint, {
      date,
      latitude: latitude || 40.7128,
      longitude: longitude || -74.0060
    })
  }

  /**
   * Get Muhurta (Auspicious Timing)
   */
  async getMuhurta(
    eventType: string, 
    birthData: BirthData, 
    preferredDate?: string
  ): Promise<VedAstroResponse> {
    const endpoint = `/api/Muhurta`
    return this.makeApiCall(endpoint, {
      ...birthData,
      eventType,
      preferredDate: preferredDate || new Date().toISOString().split('T')[0]
    })
  }

  /**
   * Get Tarabala (Daily Auspiciousness)
   */
  async getTarabala(birthData: BirthData, date?: string): Promise<VedAstroResponse> {
    const endpoint = `/api/Tarabala`
    return this.makeApiCall(endpoint, {
      ...birthData,
      date: date || new Date().toISOString().split('T')[0]
    })
  }

  // ==================== REMEDIAL FEATURES ====================

  /**
   * Get Gemstone Recommendations
   */
  async getGemstoneRecommendations(birthData: BirthData): Promise<VedAstroResponse> {
    const endpoint = `/api/Remedies/Gemstones`
    return this.makeApiCall(endpoint, birthData)
  }

  /**
   * Get Mantra Recommendations
   */
  async getMantraRecommendations(birthData: BirthData): Promise<VedAstroResponse> {
    const endpoint = `/api/Remedies/Mantras`
    return this.makeApiCall(endpoint, birthData)
  }

  /**
   * Get Ritual Timing
   */
  async getRitualTiming(birthData: BirthData, ritualType: string): Promise<VedAstroResponse> {
    const endpoint = `/api/Remedies/RitualTiming`
    return this.makeApiCall(endpoint, {
      ...birthData,
      ritualType
    })
  }

  // ==================== EVENT FEATURES ====================

  /**
   * Get Life Events Timeline
   */
  async getLifeEventsTimeline(birthData: BirthData): Promise<VedAstroResponse> {
    const endpoint = `/api/Horoscope/LifeEvents`
    return this.makeApiCall(endpoint, birthData)
  }

  /**
   * Get Event Predictions
   */
  async getEventPredictions(
    birthData: BirthData, 
    eventType: string, 
    timeRange: string
  ): Promise<VedAstroResponse> {
    const endpoint = `/api/Horoscope/EventPredictions`
    return this.makeApiCall(endpoint, {
      ...birthData,
      eventType,
      timeRange
    })
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Test API connectivity
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/Health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      })
      return response.ok
    } catch (error) {
      console.error('VedAstro API connection test failed:', error)
      return false
    }
  }

  /**
   * Get API status and available endpoints
   */
  async getApiStatus(): Promise<any> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/Status`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      })
      return response.json()
    } catch (error) {
      console.error('Failed to get VedAstro API status:', error)
      return null
    }
  }

  /**
   * Batch API calls for multiple features
   */
  async getBatchAnalysis(
    birthData: BirthData, 
    features: string[]
  ): Promise<Record<string, VedAstroResponse>> {
    const results: Record<string, VedAstroResponse> = {}
    
    const promises = features.map(async (feature) => {
      try {
        switch (feature) {
          case 'dasa':
            results.dasa = await this.getDasaAnalysis(birthData)
            break
          case 'panchanga':
            results.panchanga = await this.getPanchanga(new Date().toISOString().split('T')[0])
            break
          case 'nakshatra':
            results.nakshatra = await this.getNakshatraAnalysis(birthData)
            break
          case 'planets':
            results.planets = await this.getAllPlanetData(birthData)
            break
          case 'houses':
            results.houses = await this.getAllHouseData(birthData)
            break
          case 'predictions':
            results.predictions = await this.getHoroscopePredictions(birthData)
            break
          case 'gochara':
            results.gochara = await this.getGocharaAnalysis(birthData)
            break
          case 'tarabala':
            results.tarabala = await this.getTarabala(birthData)
            break
          default:
            console.warn(`Unknown feature: ${feature}`)
        }
      } catch (error) {
        console.error(`Failed to fetch ${feature}:`, error)
        results[feature] = { Status: 'Error', Input: null, Payload: null }
      }
    })

    await Promise.all(promises)
    return results
  }
  // ==================== JOTHISHI AI-INSPIRED FEATURES ====================

  /**
   * Get Marriage Prediction Analysis (300+ rules)
   */
  async getMarriagePrediction(birthData: BirthData): Promise<VedAstroResponse> {
    const endpoint = `/api/MarriagePrediction`
    return this.makeApiCall(endpoint, {
      ...birthData,
      analysisType: 'comprehensive',
      rules: 300
    })
  }

  /**
   * Get Marriage Date Prediction
   */
  async getMarriageDatePrediction(birthData: BirthData): Promise<VedAstroResponse> {
    const endpoint = `/api/MarriageDatePrediction`
    return this.makeApiCall(endpoint, {
      ...birthData,
      predictionPeriod: '2025-2030'
    })
  }

  /**
   * Get Enhanced Compatibility Analysis (20+ parameters)
   */
  async getEnhancedCompatibility(person1: BirthData, person2: BirthData): Promise<VedAstroResponse> {
    const endpoint = `/api/EnhancedCompatibility`
    return this.makeApiCall(endpoint, {
      person1,
      person2,
      parameters: 20,
      analysisType: 'comprehensive'
    })
  }

  /**
   * Get Baby Names & Janam Patri
   */
  async getBabyNamesAndJanamPatri(birthData: BirthData): Promise<VedAstroResponse> {
    const endpoint = `/api/BabyNamesJanamPatri`
    return this.makeApiCall(endpoint, {
      ...birthData,
      nameCount: 50,
      includeJanamPatri: true
    })
  }

  /**
   * Get Career Analysis
   */
  async getCareerAnalysis(birthData: BirthData): Promise<VedAstroResponse> {
    const endpoint = `/api/CareerAnalysis`
    return this.makeApiCall(endpoint, {
      ...birthData,
      analysisType: 'comprehensive',
      focusAreas: ['profession', 'timing', 'success', 'challenges']
    })
  }

  /**
   * Get Relationship Analysis
   */
  async getRelationshipAnalysis(birthData: BirthData): Promise<VedAstroResponse> {
    const endpoint = `/api/RelationshipAnalysis`
    return this.makeApiCall(endpoint, {
      ...birthData,
      analysisType: 'comprehensive',
      focusAreas: ['marriage', 'compatibility', 'timing', 'challenges']
    })
  }

  /**
   * Get Saturn Transit Analysis (2025)
   */
  async getSaturnTransit2025(birthData: BirthData): Promise<VedAstroResponse> {
    const endpoint = `/api/SaturnTransit2025`
    return this.makeApiCall(endpoint, {
      ...birthData,
      transitPeriod: '2025-2027',
      analysisType: 'detailed'
    })
  }

  /**
   * Get Enterprise Astrology Services
   */
  async getEnterpriseAstrology(companyData: any): Promise<VedAstroResponse> {
    const endpoint = `/api/EnterpriseAstrology`
    return this.makeApiCall(endpoint, {
      ...companyData,
      services: ['executive-hire', 'merger-acquisition', 'brand-ambassador']
    })
  }

  // ==================== SPIRITUAL & CULTURAL FEATURES ====================

  /**
   * Get Jyothirlinga Analysis
   */
  async getJyothirlingaAnalysis(birthData: BirthData): Promise<VedAstroResponse> {
    const endpoint = `/api/JyothirlingaAnalysis`
    return this.makeApiCall(endpoint, birthData)
  }

  /**
   * Get Vedic Baby Names
   */
  async getVedicBabyNames(birthData: BirthData, gender: string): Promise<VedAstroResponse> {
    const endpoint = `/api/VedicBabyNames`
    return this.makeApiCall(endpoint, {
      ...birthData,
      gender,
      nameCount: 100,
      includeMeanings: true
    })
  }

  /**
   * Get Vishnu Sahasranamam
   */
  async getVishnuSahasranamam(birthData: BirthData): Promise<VedAstroResponse> {
    const endpoint = `/api/VishnuSahasranamam`
    return this.makeApiCall(endpoint, birthData)
  }

  /**
   * Get Vastu Analysis
   */
  async getVastuAnalysis(birthData: BirthData, propertyData?: any): Promise<VedAstroResponse> {
    const endpoint = `/api/VastuAnalysis`
    return this.makeApiCall(endpoint, {
      ...birthData,
      propertyData
    })
  }

  /**
   * Get Temples of India Analysis
   */
  async getTemplesOfIndiaAnalysis(birthData: BirthData): Promise<VedAstroResponse> {
    const endpoint = `/api/TemplesOfIndiaAnalysis`
    return this.makeApiCall(endpoint, birthData)
  }

  /**
   * Get Slokas and Mantras
   */
  async getSlokasAndMantras(birthData: BirthData): Promise<VedAstroResponse> {
    const endpoint = `/api/SlokasAndMantras`
    return this.makeApiCall(endpoint, birthData)
  }
}

// Export singleton instance
export const vedAstroApiService = VedAstroApiService.getInstance()

// Export types for use in other files
export type {
  VedAstroApiConfig,
  BirthData,
  VedAstroResponse
}
