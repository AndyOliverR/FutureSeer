/**
 * VedicAstro Service - TypeScript implementation for Vercel compatibility
 * Ported from Python VedicAstro library to work with Next.js/Vercel
 */
import { devLog } from '@/lib/devLogger';

export interface BirthData {
  birthDate: string
  birthTime: string
  birthPlace: string
  latitude: number
  longitude: number
}

export interface ChartData {
  planets: PlanetData[]
  houses: HouseData[]
  ascendant: number
  chartType: string
}

export interface PlanetData {
  name: string
  sign: string
  degree: number
  house: number
  nakshatra: string
  pada: number
  isRetrograde: boolean
}

export interface HouseData {
  number: number
  sign: string
  degree: number
  lord: string
}

export interface DasaData {
  currentDasa: DasaPeriod
  currentBhukti: DasaPeriod
  dasaTimeline: DasaPeriod[]
  totalDuration: number
}

export interface DasaPeriod {
  planet: string
  startDate: string
  endDate: string
  duration: number
  isCurrent: boolean
  progress: number
}

export interface PanchangaData {
  date: string
  tithi: string
  nakshatra: string
  yoga: string
  karana: string
  sunrise: string
  sunset: string
  moonrise: string
  moonset: string
  auspiciousTimings: string[]
  inauspiciousTimings: string[]
}

export interface PlanetAnalysis {
  positions: PlanetPosition[]
  strengths: PlanetaryStrength[]
  aspects: any[]
  dignities: any[]
}

export interface PlanetPosition {
  name: string
  sign: string
  degree: number
  minute: number
  house: number
  nakshatra: string
  pada: number
  isRetrograde: boolean
  isCombust: boolean
  speed: number
  longitude: number
  latitude: number
}

export interface PlanetaryStrength {
  name: string
  strength: number
  status: string
  factors: string[]
}

class VedicAstroService {
  private baseUrl: string

  constructor() {
    this.baseUrl = '/api/vedic'
  }

  /**
   * Generate Vedic chart
   */
  async generateChart(birthData: BirthData, chartType: string = 'D1'): Promise<ChartData> {
    try {
      const response = await fetch(`${this.baseUrl}/chart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...birthData,
          chartType
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to generate chart')
      }

      return result.data
    } catch (error) {
      devLog.error('Error generating chart:', error, 'vedicAstroService')
      throw error
    }
  }

  /**
   * Calculate Vimshottari Dasa
   */
  async calculateDasa(birthData: BirthData): Promise<DasaData> {
    try {
      const response = await fetch(`${this.baseUrl}/dasa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(birthData),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to calculate Dasa')
      }

      return result.data
    } catch (error) {
      devLog.error('Error calculating Dasa:', error, 'vedicAstroService')
      throw error
    }
  }

  /**
   * Calculate planetary positions and analysis
   */
  async calculatePlanets(birthData: BirthData): Promise<PlanetAnalysis> {
    try {
      const response = await fetch(`${this.baseUrl}/planets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(birthData),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to calculate planetary positions')
      }

      return result.data
    } catch (error) {
      devLog.error('Error calculating planetary positions:', error, 'vedicAstroService')
      throw error
    }
  }

  /**
   * Calculate Panchanga
   */
  async calculatePanchanga(date?: string, latitude?: number, longitude?: number): Promise<PanchangaData> {
    try {
      const response = await fetch(`${this.baseUrl}/panchanga`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date,
          latitude,
          longitude
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to calculate Panchanga')
      }

      return result.data
    } catch (error) {
      devLog.error('Error calculating Panchanga:', error, 'vedicAstroService')
      throw error
    }
  }

  /**
   * Get comprehensive Vedic analysis
   */
  async getComprehensiveAnalysis(birthData: BirthData): Promise<{
    chart: ChartData
    dasa: DasaData
    planets: PlanetAnalysis
    panchanga: PanchangaData
  }> {
    try {
      devLog.debug('🔄 FutureSeer: Starting comprehensive Vedic analysis...')
      
      // Make all API calls in parallel
      const [chartResult, dasaResult, planetsResult, panchangaResult] = await Promise.allSettled([
        this.generateChart(birthData),
        this.calculateDasa(birthData),
        this.calculatePlanets(birthData),
        this.calculatePanchanga()
      ])

      // Check results
      if (chartResult.status === 'rejected') {
        throw new Error(`Chart generation failed: ${chartResult.reason}`)
      }
      if (dasaResult.status === 'rejected') {
        throw new Error(`Dasa calculation failed: ${dasaResult.reason}`)
      }
      if (planetsResult.status === 'rejected') {
        throw new Error(`Planetary analysis failed: ${planetsResult.reason}`)
      }
      if (panchangaResult.status === 'rejected') {
        throw new Error(`Panchanga calculation failed: ${panchangaResult.reason}`)
      }

      const result = {
        chart: chartResult.value,
        dasa: dasaResult.value,
        planets: planetsResult.value,
        panchanga: panchangaResult.value
      }

      devLog.debug('✅ FutureSeer: Comprehensive Vedic analysis completed')
      return result

    } catch (error) {
      devLog.error('❌ FutureSeer: Comprehensive Vedic analysis failed:', error, 'vedicAstroService')
      throw error
    }
  }
}

// Export singleton instance
export const vedicAstroService = new VedicAstroService()
export default vedicAstroService
