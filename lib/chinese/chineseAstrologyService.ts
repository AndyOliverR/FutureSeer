/**
 * Chinese Astrology Service
 * Wrapper for iztro and fortel-ziweidoushu libraries providing Zi Wei Dou Shu calculations
 */

import { astro, star } from 'iztro'
import { calculateFortuneCycles, generateTenYearCycles, FortuneCycleData } from './fortuneCycleCalculator'

export interface BirthInfo {
  solarDate: string // YYYY-MM-DD format
  solarTime: string // HH:mm format
  gender: 'male' | 'female'
  location?: {
    latitude: number
    longitude: number
    timezone: string
  }
}

export interface LunarDate {
  year: number
  month: number
  day: number
  isLeapMonth: boolean
  lunarYear: number // Chinese year with animal
  lunarMonth: string
  lunarDay: string
}

export interface Palace {
  name: string
  nameChinese: string
  englishName: string
  stars: Star[]
  element: string
  strength: number
  interpretation: string
  keywords: string[]
}

export interface Star {
  name: string
  nameChinese: string
  type: 'main' | 'supporting'
  brightness: 'bright' | 'dim' | 'normal'
  strength: number
  element: string
  nature: 'auspicious' | 'inauspicious' | 'neutral'
  interpretation: string
  keywords: string[]
}

export interface FourPillars {
  year: {
    heavenlyStem: string
    earthlyBranch: string
    element: string
  }
  month: {
    heavenlyStem: string
    earthlyBranch: string
    element: string
  }
  day: {
    heavenlyStem: string
    earthlyBranch: string
    element: string
  }
  hour: {
    heavenlyStem: string
    earthlyBranch: string
    element: string
  }
  elementBalance: ElementBalance
}

export interface ElementBalance {
  wood: number
  fire: number
  earth: number
  metal: number
  water: number
  dominant: string
  weak: string
  recommendations: string[]
}

export interface FortuneCycle {
  period: string
  startAge: number
  endAge: number
  element: string
  nature: 'excellent' | 'good' | 'neutral' | 'challenging'
  description: string
  focus: string[]
  warnings: string[]
  opportunities: string[]
}

export interface ChineseZodiac {
  animal: string
  element: string
  year: number
  personality: string[]
  compatibility: string[]
  luckyColors: string[]
  luckyNumbers: number[]
  luckyDirections: string[]
}

export interface RuntimeContextData {
  tenYear: FortuneCycleData['tenYear']
  year: FortuneCycleData['year']
  month: FortuneCycleData['month']
  day: FortuneCycleData['day']
  age: number
  effectiveMonth: number
}

export interface ZiWeiChartData {
  birthInfo: BirthInfo
  lunarDate: LunarDate
  palaces: Palace[]
  mainStars: Star[]
  supportingStars: Star[]
  fourPillars: FourPillars
  fortuneCycles: FortuneCycle[]
  elements: ElementBalance
  zodiacAnimal: ChineseZodiac
  runtimeContext?: RuntimeContextData
}

/**
 * Main Chinese Astrology Service Class
 */
export class ChineseAstrologyService {
  private chart: any

  /**
   * Calculate Zi Wei Dou Shu chart
   */
  calculateZiWeiChart(birthInfo: BirthInfo, includeRuntimeContext: boolean = true): ZiWeiChartData {
    try {
      // Initialize iztro chart with error handling
      try {
        // Validate input data before calling iztro
        if (!birthInfo.solarDate || !birthInfo.solarTime) {
          throw new Error('Missing birth date or time')
        }
        
        // Format date and time for iztro (expects YYYY-MM-DD and HH:mm)
        const dateParts = birthInfo.solarDate.split('-')
        if (dateParts.length !== 3) {
          throw new Error('Invalid date format')
        }
        
        const timeParts = birthInfo.solarTime.split(':')
        if (timeParts.length < 2) {
          throw new Error('Invalid time format')
        }
        
        // Call iztro with proper error handling
        // Note: iztro API uses timeIndex (0-12) for Chinese hours, need to convert HH:mm to timeIndex
        const timeIndex = this.convertTimeToIndex(birthInfo.solarTime)
        this.chart = astro.astrolabeBySolarDate(
          birthInfo.solarDate,
          timeIndex,
          birthInfo.gender,
          true, // fixLeap
          'en-US' // language
        )
        
        // Verify chart was created successfully
        if (!this.chart) {
          throw new Error('Iztro chart creation returned null')
        }
        
        // Debug: Log chart structure for investigation (only in development)
        if (process.env.NODE_ENV === 'development') {
          console.log('🔮 Iztro Chart Structure:', {
            hasPalaces: !!this.chart.palaces,
            palaceCount: this.chart.palaces?.length,
            firstPalace: this.chart.palaces?.[0] ? {
              name: this.chart.palaces[0].name,
              majorStars: this.chart.palaces[0].majorStars?.map((s: any) => ({
                name: s.name,
                type: s.type,
                brightness: s.brightness
              })),
              minorStars: this.chart.palaces[0].minorStars?.length
            } : null
          })
        }
      } catch (iztroError) {
        // Iztro library may have issues in browser environment, use fallback gracefully
        console.warn('Iztro library unavailable, using fallback calculation:', iztroError instanceof Error ? iztroError.message : 'Unknown error')
        // Create a fallback chart structure if iztro fails
        this.chart = this.createFallbackChart(birthInfo)
      }

      // Get all chart data
      const lunarDate = this.convertToLunarDate(birthInfo.solarDate)
      const palaces = this.analyzePalaces()
      const mainStars = this.calculateMainStars()
      const supportingStars = this.calculateSupportingStars()
      const fourPillars = this.analyzeFourPillars(birthInfo)
      
      // Use fortel for more accurate fortune cycles
      let fortuneCycles: FortuneCycle[]
      let runtimeContext: RuntimeContextData | undefined
      
      try {
        // Try to use fortel for fortune cycles
        const fortelCycles = generateTenYearCycles(
          birthInfo.solarDate,
          birthInfo.solarTime,
          birthInfo.gender
        )
        fortuneCycles = fortelCycles
        
        // Calculate runtime context if requested
        if (includeRuntimeContext) {
          const fortuneData = calculateFortuneCycles(
            birthInfo.solarDate,
            birthInfo.solarTime,
            birthInfo.gender
          )
          runtimeContext = {
            tenYear: fortuneData.tenYear,
            year: fortuneData.year,
            month: fortuneData.month,
            day: fortuneData.day,
            age: fortuneData.age,
            effectiveMonth: fortuneData.effectiveMonth,
          }
        }
      } catch (fortelError) {
        console.warn('Fortel calculation failed, using fallback:', fortelError)
        // Fallback to original method
        fortuneCycles = this.generateFortunePredictions()
      }
      
      const elements = this.calculateElementBalance(fourPillars)
      const zodiacAnimal = this.getChineseZodiac(lunarDate.year)

      return {
        birthInfo,
        lunarDate,
        palaces,
        mainStars,
        supportingStars,
        fourPillars,
        fortuneCycles,
        elements,
        zodiacAnimal,
        runtimeContext
      }
    } catch (error) {
      console.error('Error calculating Zi Wei chart:', error)
      throw new Error('Failed to calculate Chinese astrology chart')
    }
  }

  /**
   * Get runtime context for a specific date
   */
  getRuntimeContext(birthInfo: BirthInfo, targetDate?: Date): RuntimeContextData {
    try {
      const fortuneData = calculateFortuneCycles(
        birthInfo.solarDate,
        birthInfo.solarTime,
        birthInfo.gender,
        targetDate
      )
      
      return {
        tenYear: fortuneData.tenYear,
        year: fortuneData.year,
        month: fortuneData.month,
        day: fortuneData.day,
        age: fortuneData.age,
        effectiveMonth: fortuneData.effectiveMonth,
      }
    } catch (error) {
      console.error('Error calculating runtime context:', error)
      throw new Error('Failed to calculate runtime context')
    }
  }

  /**
   * Convert solar date to lunar date
   */
  convertToLunarDate(solarDate: string): LunarDate {
    try {
      const [year, month, day] = solarDate.split('-').map(Number)
      
      // Get lunar date from iztro if available
      let lunarInfo: any
      if (this.chart && this.chart.lunar) {
        lunarInfo = this.chart.lunar
      } else {
        // Fallback: use solar date as lunar date (simplified)
        lunarInfo = {
          year,
          month,
          day,
          isLeapMonth: false
        }
      }
      
      return {
        year: lunarInfo.year || year,
        month: lunarInfo.month || month,
        day: lunarInfo.day || day,
        isLeapMonth: lunarInfo.isLeapMonth || false,
        lunarYear: lunarInfo.year || year,
        lunarMonth: this.getChineseMonthName(lunarInfo.month || month),
        lunarDay: this.getChineseDayName(lunarInfo.day || day)
      }
    } catch (error) {
      console.error('Error converting to lunar date:', error)
      // Fallback to solar date
      const [year, month, day] = solarDate.split('-').map(Number)
      return {
        year,
        month,
        day,
        isLeapMonth: false,
        lunarYear: year,
        lunarMonth: this.getChineseMonthName(month),
        lunarDay: this.getChineseDayName(day)
      }
    }
  }

  /**
   * Create fallback chart structure when iztro fails
   */
  private createFallbackChart(birthInfo: BirthInfo): any {
    return {
      lunar: {
        year: new Date(birthInfo.solarDate).getFullYear(),
        month: new Date(birthInfo.solarDate).getMonth() + 1,
        day: new Date(birthInfo.solarDate).getDate(),
        isLeapMonth: false
      },
      palaces: Array(12).fill(null).map(() => ({
        majorStars: [],
        minorStars: []
      }))
    }
  }

  /**
   * Analyze 12 palaces
   */
  analyzePalaces(): Palace[] {
    try {
      const palaces = this.chart?.palaces || Array(12).fill(null).map(() => ({ majorStars: [], minorStars: [] }))
      const palaceList: Palace[] = []

      // Palace names in Chinese and English
      const palaceNames = [
        { chinese: '命宫', english: 'Life Palace', element: 'wood' },
        { chinese: '兄弟宫', english: 'Sibling Palace', element: 'earth' },
        { chinese: '夫妻宫', english: 'Marriage Palace', element: 'water' },
        { chinese: '子女宫', english: 'Children Palace', element: 'fire' },
        { chinese: '财帛宫', english: 'Wealth Palace', element: 'metal' },
        { chinese: '疾厄宫', english: 'Health Palace', element: 'earth' },
        { chinese: '迁移宫', english: 'Travel Palace', element: 'water' },
        { chinese: '奴仆宫', english: 'Friendship Palace', element: 'fire' },
        { chinese: '官禄宫', english: 'Career Palace', element: 'wood' },
        { chinese: '田宅宫', english: 'Property Palace', element: 'metal' },
        { chinese: '福德宫', english: 'Fortune Palace', element: 'fire' },
        { chinese: '父母宫', english: 'Parents Palace', element: 'earth' }
      ]

      palaces.forEach((palace: any, index: number) => {
        const palaceName = palaceNames[index]
        
        // Combine major and minor stars
        const majorStars = this.parseStarsInPalace(palace.majorStars || [])
        const minorStars = this.parseStarsInPalace(palace.minorStars || [])
        const allStars = [...majorStars, ...minorStars]
        
        palaceList.push({
          name: palaceName.english.toLowerCase().replace(' ', '_'),
          nameChinese: palaceName.chinese,
          englishName: palaceName.english,
          stars: allStars,
          element: palaceName.element,
          strength: this.calculatePalaceStrength(palace),
          interpretation: this.getPalaceInterpretation(palaceName.chinese, palace),
          keywords: this.getPalaceKeywords(palaceName.chinese)
        })
      })

      return palaceList
    } catch (error) {
      console.error('Error analyzing palaces:', error)
      throw new Error('Failed to analyze palaces')
    }
  }

  /**
   * Calculate main stars - only return stars actually in the chart
   */
  calculateMainStars(): Star[] {
    try {
      if (!this.chart || !this.chart.palaces) {
        return [] // Return empty if no chart data
      }
      
      // Collect all unique main stars from all palaces
      const starMap = new Map<string, Star>()
      
      this.chart.palaces.forEach((palace: any) => {
        if (palace.majorStars && Array.isArray(palace.majorStars)) {
          palace.majorStars.forEach((star: any) => {
            if (star.type === 'major' && star.name) {
              const starNameChinese = star.name
              if (!starMap.has(starNameChinese)) {
                const starName = this.translateStarName(starNameChinese)
                const brightness = this.mapBrightness(star.brightness || '')
                const starInfo = this.getStarInfo(starNameChinese)
                
                starMap.set(starNameChinese, {
                  name: starName,
                  nameChinese: starNameChinese,
                  type: 'main' as const,
                  brightness: brightness,
                  strength: this.calculateStarStrengthFromBrightness(brightness),
                  element: starInfo.element,
                  nature: starInfo.nature,
                  interpretation: starInfo.interpretation,
                  keywords: starInfo.keywords
                })
              }
            }
          })
        }
      })
      
      return Array.from(starMap.values())
    } catch (error) {
      console.error('Error calculating main stars:', error)
      throw new Error('Failed to calculate main stars')
    }
  }

  /**
   * Calculate supporting stars - only return stars actually in the chart
   */
  calculateSupportingStars(): Star[] {
    try {
      if (!this.chart || !this.chart.palaces) {
        return [] // Return empty if no chart data
      }
      
      // Collect all unique supporting/minor stars from all palaces
      const starMap = new Map<string, Star>()
      
      this.chart.palaces.forEach((palace: any) => {
        // Check minorStars (supporting stars)
        if (palace.minorStars && Array.isArray(palace.minorStars)) {
          palace.minorStars.forEach((star: any) => {
            if (star.name && (star.type === 'soft' || star.type === 'tough' || star.type === 'tianma' || star.type === 'lucun')) {
              const starNameChinese = star.name
              if (!starMap.has(starNameChinese)) {
                const starName = this.translateStarName(starNameChinese)
                const brightness = this.mapBrightness(star.brightness || '')
                const starInfo = this.getStarInfo(starNameChinese)
                
                starMap.set(starNameChinese, {
                  name: starName,
                  nameChinese: starNameChinese,
                  type: 'supporting' as const,
                  brightness: brightness,
                  strength: this.calculateStarStrengthFromBrightness(brightness),
                  element: starInfo.element,
                  nature: starInfo.nature,
                  interpretation: starInfo.interpretation,
                  keywords: starInfo.keywords
                })
              }
            }
          })
        }
        
        // Also check majorStars for stars that are not main stars (like Tian Ma, Lu Cun)
        if (palace.majorStars && Array.isArray(palace.majorStars)) {
          palace.majorStars.forEach((star: any) => {
            if (star.name && (star.type === 'tianma' || star.type === 'lucun')) {
              const starNameChinese = star.name
              if (!starMap.has(starNameChinese)) {
                const starName = this.translateStarName(starNameChinese)
                const brightness = this.mapBrightness(star.brightness || '')
                const starInfo = this.getStarInfo(starNameChinese)
                
                starMap.set(starNameChinese, {
                  name: starName,
                  nameChinese: starNameChinese,
                  type: 'supporting' as const,
                  brightness: brightness,
                  strength: this.calculateStarStrengthFromBrightness(brightness),
                  element: starInfo.element,
                  nature: starInfo.nature,
                  interpretation: starInfo.interpretation,
                  keywords: starInfo.keywords
                })
              }
            }
          })
        }
      })
      
      return Array.from(starMap.values())
    } catch (error) {
      console.error('Error calculating supporting stars:', error)
      throw new Error('Failed to calculate supporting stars')
    }
  }

  /**
   * Analyze Four Pillars (Ba Zi)
   */
  analyzeFourPillars(birthInfo: BirthInfo): FourPillars {
    try {
      const [year, month, day, hour] = birthInfo.solarDate.split('-')
      const [hourStr, minuteStr] = birthInfo.solarTime.split(':')
      
      // Simplified Four Pillars calculation
      // In a real implementation, this would use proper Ba Zi calculations
      const yearPillar = this.calculatePillar(parseInt(year), 'year')
      const monthPillar = this.calculatePillar(parseInt(month), 'month')
      const dayPillar = this.calculatePillar(parseInt(day), 'day')
      const hourPillar = this.calculatePillar(parseInt(hourStr), 'hour')

      return {
        year: yearPillar,
        month: monthPillar,
        day: dayPillar,
        hour: hourPillar,
        elementBalance: this.calculateElementBalance([yearPillar, monthPillar, dayPillar, hourPillar])
      }
    } catch (error) {
      console.error('Error analyzing Four Pillars:', error)
      throw new Error('Failed to analyze Four Pillars')
    }
  }

  /**
   * Generate fortune predictions
   */
  generateFortunePredictions(): FortuneCycle[] {
    try {
      const fortuneCycles: FortuneCycle[] = []
      
      // Generate 10-year fortune cycles
      for (let age = 0; age < 100; age += 10) {
        const cycle = this.calculateFortuneCycle(age, age + 10)
        fortuneCycles.push(cycle)
      }

      return fortuneCycles
    } catch (error) {
      console.error('Error generating fortune predictions:', error)
      throw new Error('Failed to generate fortune predictions')
    }
  }

  /**
   * Calculate element balance
   */
  calculateElementBalance(fourPillars: FourPillars): ElementBalance {
    const elements = {
      wood: 0,
      fire: 0,
      earth: 0,
      metal: 0,
      water: 0
    }

    // Count elements from Four Pillars
    Object.values(fourPillars).forEach(pillar => {
      if (pillar && typeof pillar === 'object' && 'element' in pillar) {
        elements[pillar.element as keyof typeof elements]++
      }
    })

    const dominant = Object.keys(elements).reduce((a, b) => 
      elements[a as keyof typeof elements] > elements[b as keyof typeof elements] ? a : b
    )
    
    const weak = Object.keys(elements).reduce((a, b) => 
      elements[a as keyof typeof elements] < elements[b as keyof typeof elements] ? a : b
    )

    return {
      ...elements,
      dominant,
      weak,
      recommendations: this.getElementRecommendations(dominant, weak)
    }
  }

  /**
   * Get Chinese zodiac animal
   */
  getChineseZodiac(year: number): ChineseZodiac {
    const animals = ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig']
    const animalIndex = (year - 4) % 12
    const animal = animals[animalIndex < 0 ? animalIndex + 12 : animalIndex]

    return {
      animal,
      element: this.getAnimalElement(year),
      year,
      personality: this.getAnimalPersonality(animal),
      compatibility: this.getAnimalCompatibility(animal),
      luckyColors: this.getAnimalLuckyColors(animal),
      luckyNumbers: this.getAnimalLuckyNumbers(animal),
      luckyDirections: this.getAnimalLuckyDirections(animal)
    }
  }

  // Helper methods
  
  /**
   * Convert time string (HH:mm) to iztro timeIndex (0-12)
   * Chinese hours: 0=子时(23:00-01:00), 1=丑时(01:00-03:00), ..., 11=亥时(21:00-23:00)
   */
  private convertTimeToIndex(timeStr: string): number {
    const [hour, minute] = timeStr.split(':').map(Number)
    const totalMinutes = hour * 60 + (minute || 0)
    
    // Chinese hour calculation: each hour is 2 hours long
    // 子时(23:00-01:00) = 0, 丑时(01:00-03:00) = 1, etc.
    if (totalMinutes >= 23 * 60 || totalMinutes < 1 * 60) {
      return 0 // 子时
    } else if (totalMinutes >= 1 * 60 && totalMinutes < 3 * 60) {
      return 1 // 丑时
    } else if (totalMinutes >= 3 * 60 && totalMinutes < 5 * 60) {
      return 2 // 寅时
    } else if (totalMinutes >= 5 * 60 && totalMinutes < 7 * 60) {
      return 3 // 卯时
    } else if (totalMinutes >= 7 * 60 && totalMinutes < 9 * 60) {
      return 4 // 辰时
    } else if (totalMinutes >= 9 * 60 && totalMinutes < 11 * 60) {
      return 5 // 巳时
    } else if (totalMinutes >= 11 * 60 && totalMinutes < 13 * 60) {
      return 6 // 午时
    } else if (totalMinutes >= 13 * 60 && totalMinutes < 15 * 60) {
      return 7 // 未时
    } else if (totalMinutes >= 15 * 60 && totalMinutes < 17 * 60) {
      return 8 // 申时
    } else if (totalMinutes >= 17 * 60 && totalMinutes < 19 * 60) {
      return 9 // 酉时
    } else if (totalMinutes >= 19 * 60 && totalMinutes < 21 * 60) {
      return 10 // 戌时
    } else {
      return 11 // 亥时
    }
  }
  
  /**
   * Parse stars from iztro palace data
   * Extracts actual star information from iztro chart object
   */
  private parseStarsInPalace(stars: any[]): Star[] {
    if (!stars || stars.length === 0) return []
    
    return stars.map((star: any) => {
      // Extract star name (iztro returns Chinese names)
      const starNameChinese = star.name || '未知'
      const starName = this.translateStarName(starNameChinese)
      
      // Map iztro brightness to our brightness enum
      // iztro brightness: '庙'(temple/exalted), '旺'(prosperous), '得'(obtain), '利'(benefit), '平'(average), '不'(not), '陷'(fall)
      const brightness = this.mapBrightness(star.brightness || '')
      
      // Determine star type based on iztro type
      const starType = star.type === 'major' ? 'main' : 'supporting'
      
      // Get star properties from database
      const starInfo = this.getStarInfo(starNameChinese)
      
      return {
        name: starName,
        nameChinese: starNameChinese,
        type: starType as 'main' | 'supporting',
        brightness: brightness,
        strength: this.calculateStarStrengthFromBrightness(brightness),
        element: starInfo.element,
        nature: starInfo.nature,
        interpretation: starInfo.interpretation,
        keywords: starInfo.keywords
      }
    })
  }
  
  /**
   * Map iztro brightness values to our brightness enum
   */
  private mapBrightness(iztroBrightness: string): 'bright' | 'dim' | 'normal' {
    // iztro brightness mapping:
    // '庙' (temple/exalted) = bright
    // '旺' (prosperous) = bright
    // '得' (obtain) = normal
    // '利' (benefit) = normal
    // '平' (average) = normal
    // '不' (not) = dim
    // '陷' (fall) = dim
    if (iztroBrightness === '庙' || iztroBrightness === '旺') {
      return 'bright'
    } else if (iztroBrightness === '不' || iztroBrightness === '陷') {
      return 'dim'
    } else {
      return 'normal'
    }
  }
  
  /**
   * Calculate star strength from brightness
   */
  private calculateStarStrengthFromBrightness(brightness: 'bright' | 'dim' | 'normal'): number {
    switch (brightness) {
      case 'bright':
        return 0.8 + Math.random() * 0.2 // 0.8-1.0
      case 'dim':
        return 0.2 + Math.random() * 0.2 // 0.2-0.4
      case 'normal':
        return 0.5 + Math.random() * 0.2 // 0.5-0.7
      default:
        return 0.5
    }
  }
  
  /**
   * Translate Chinese star name to English
   */
  private translateStarName(chineseName: string): string {
    const translations: Record<string, string> = {
      '紫微': 'Purple Star',
      '天機': 'Heavenly Secret',
      '太陽': 'Sun',
      '武曲': 'Wu Qu',
      '天同': 'Heavenly Virtue',
      '廉貞': 'Lian Zhen',
      '天府': 'Heavenly Official',
      '太陰': 'Tai Yin',
      '貪狼': 'Greedy Wolf',
      '巨門': 'Great General',
      '天相': 'Heavenly Premier',
      '七殺': 'Seven Killings',
      '破軍': 'Breaking Army',
      '天梁': 'Heavenly Beam',
      '左輔': 'Left Assistant',
      '右弼': 'Right Assistant',
      '文昌': 'Civil Star',
      '文曲': 'Literary Star',
      '天馬': 'Sky Horse',
      '祿存': 'Lu Cun',
      '天魁': 'Heavenly Noble',
      '天鉞': 'Heavenly Noble',
      '火星': 'Mars',
      '鈴星': 'Bell Star',
      '擎羊': 'Qing Yang',
      '陀羅': 'Tuo Luo',
      '地空': 'Earth Empty',
      '地劫': 'Earth Robbery'
    }
    return translations[chineseName] || chineseName
  }
  
  /**
   * Get star information (element, nature, interpretation, keywords)
   */
  private getStarInfo(starNameChinese: string): {
    element: string
    nature: 'auspicious' | 'inauspicious' | 'neutral'
    interpretation: string
    keywords: string[]
  } {
    const starDatabase: Record<string, {
      element: string
      nature: 'auspicious' | 'inauspicious' | 'neutral'
      interpretation: string
      keywords: string[]
    }> = {
      '紫微': {
        element: 'earth',
        nature: 'auspicious',
        interpretation: 'The Purple Star represents leadership, authority, and noble qualities. It brings dignity and respect.',
        keywords: ['leadership', 'authority', 'nobility', 'dignity']
      },
      '天機': {
        element: 'wood',
        nature: 'neutral',
        interpretation: 'Heavenly Secret represents intelligence, adaptability, and strategic thinking.',
        keywords: ['intelligence', 'adaptability', 'strategy', 'wisdom']
      },
      '太陽': {
        element: 'fire',
        nature: 'auspicious',
        interpretation: 'The Sun represents brightness, warmth, and positive energy. It brings success and recognition.',
        keywords: ['brightness', 'success', 'recognition', 'warmth']
      },
      '武曲': {
        element: 'metal',
        nature: 'auspicious',
        interpretation: 'Wu Qu represents martial arts, wealth, and determination. It brings financial success.',
        keywords: ['wealth', 'determination', 'martial', 'success']
      },
      '天同': {
        element: 'water',
        nature: 'auspicious',
        interpretation: 'Heavenly Virtue represents harmony, peace, and good fortune. It brings blessings.',
        keywords: ['harmony', 'peace', 'blessings', 'fortune']
      },
      '廉貞': {
        element: 'fire',
        nature: 'neutral',
        interpretation: 'Lian Zhen represents passion, intensity, and strong emotions. It can bring both challenges and opportunities.',
        keywords: ['passion', 'intensity', 'emotions', 'challenges']
      },
      '天府': {
        element: 'earth',
        nature: 'auspicious',
        interpretation: 'Heavenly Official represents stability, wealth, and good fortune. It brings prosperity.',
        keywords: ['stability', 'wealth', 'prosperity', 'fortune']
      },
      '太陰': {
        element: 'water',
        nature: 'auspicious',
        interpretation: 'Tai Yin represents femininity, intuition, and emotional depth. It brings sensitivity and understanding.',
        keywords: ['intuition', 'emotions', 'sensitivity', 'understanding']
      },
      '貪狼': {
        element: 'water',
        nature: 'neutral',
        interpretation: 'Greedy Wolf represents desire, ambition, and pursuit of goals. It brings drive and determination.',
        keywords: ['desire', 'ambition', 'drive', 'determination']
      },
      '巨門': {
        element: 'water',
        nature: 'neutral',
        interpretation: 'Great General represents communication, expression, and sometimes conflict. It brings eloquence.',
        keywords: ['communication', 'expression', 'eloquence', 'conflict']
      },
      '天相': {
        element: 'water',
        nature: 'auspicious',
        interpretation: 'Heavenly Premier represents assistance, support, and good relationships. It brings harmony.',
        keywords: ['assistance', 'support', 'relationships', 'harmony']
      },
      '七殺': {
        element: 'metal',
        nature: 'neutral',
        interpretation: 'Seven Killings represents courage, action, and sometimes conflict. It brings determination.',
        keywords: ['courage', 'action', 'determination', 'conflict']
      },
      '破軍': {
        element: 'water',
        nature: 'neutral',
        interpretation: 'Breaking Army represents change, transformation, and breaking old patterns. It brings renewal.',
        keywords: ['change', 'transformation', 'renewal', 'breaking']
      },
      '天梁': {
        element: 'earth',
        nature: 'auspicious',
        interpretation: 'Heavenly Beam represents protection, support, and longevity. It brings stability and care.',
        keywords: ['protection', 'support', 'longevity', 'stability']
      },
      '左輔': {
        element: 'earth',
        nature: 'auspicious',
        interpretation: 'Left Assistant represents help, support, and assistance. It brings aid and cooperation.',
        keywords: ['help', 'support', 'assistance', 'cooperation']
      },
      '右弼': {
        element: 'water',
        nature: 'auspicious',
        interpretation: 'Right Assistant represents help, support, and assistance. It brings aid and cooperation.',
        keywords: ['help', 'support', 'assistance', 'cooperation']
      },
      '文昌': {
        element: 'metal',
        nature: 'auspicious',
        interpretation: 'Civil Star represents literature, learning, and academic success. It brings intelligence.',
        keywords: ['literature', 'learning', 'academic', 'intelligence']
      },
      '文曲': {
        element: 'water',
        nature: 'auspicious',
        interpretation: 'Literary Star represents arts, creativity, and expression. It brings artistic talent.',
        keywords: ['arts', 'creativity', 'expression', 'talent']
      },
      '天馬': {
        element: 'fire',
        nature: 'neutral',
        interpretation: 'Sky Horse represents movement, travel, and change. It brings mobility and adventure.',
        keywords: ['movement', 'travel', 'mobility', 'adventure']
      },
      '祿存': {
        element: 'earth',
        nature: 'auspicious',
        interpretation: 'Lu Cun represents wealth, prosperity, and material success. It brings financial gain.',
        keywords: ['wealth', 'prosperity', 'material', 'success']
      }
    }
    
    return starDatabase[starNameChinese] || {
      element: 'earth',
      nature: 'neutral',
      interpretation: `${starNameChinese} influences various aspects of life and personality.`,
      keywords: ['influence', 'energy', 'star']
    }
  }

  /**
   * Calculate palace strength based on actual stars and their brightness
   */
  private calculatePalaceStrength(palace: any): number {
    if (!palace || !palace.majorStars) {
      return 0.3 // Weak if no stars
    }
    
    const majorStars = palace.majorStars || []
    const minorStars = palace.minorStars || []
    
    // Base strength from major stars
    let strength = 0.3 // Base strength
    
    majorStars.forEach((star: any) => {
      const brightness = this.mapBrightness(star.brightness || '')
      switch (brightness) {
        case 'bright':
          strength += 0.15 // Strong positive influence
          break
        case 'normal':
          strength += 0.08 // Moderate positive influence
          break
        case 'dim':
          strength += 0.02 // Weak positive influence
          break
      }
    })
    
    // Add minor stars influence (smaller impact)
    minorStars.forEach((star: any) => {
      const brightness = this.mapBrightness(star.brightness || '')
      switch (brightness) {
        case 'bright':
          strength += 0.05
          break
        case 'normal':
          strength += 0.03
          break
        case 'dim':
          strength += 0.01
          break
      }
    })
    
    // Cap strength between 0.1 and 1.0
    return Math.min(Math.max(strength, 0.1), 1.0)
  }

  private getPalaceInterpretation(palaceName: string, palace: any): string {
    const interpretations: Record<string, string> = {
      '命宫': 'Life Palace represents your core personality and destiny path.',
      '兄弟宫': 'Sibling Palace shows relationships with siblings and close friends.',
      '夫妻宫': 'Marriage Palace indicates romantic relationships and partnerships.',
      '子女宫': 'Children Palace relates to children, creativity, and legacy.',
      '财帛宫': 'Wealth Palace shows money matters and material prosperity.',
      '疾厄宫': 'Health Palace indicates physical health and vitality.',
      '迁移宫': 'Travel Palace relates to relocation, travel, and change.',
      '奴仆宫': 'Friendship Palace shows social relationships and helpers.',
      '官禄宫': 'Career Palace indicates profession and social status.',
      '田宅宫': 'Property Palace relates to real estate and home life.',
      '福德宫': 'Fortune Palace shows blessings and spiritual fortune.',
      '父母宫': 'Parents Palace relates to parents and authority figures.'
    }
    return interpretations[palaceName] || 'This palace influences various aspects of life.'
  }

  private getPalaceKeywords(palaceName: string): string[] {
    const keywords: Record<string, string[]> = {
      '命宫': ['personality', 'destiny', 'core self'],
      '兄弟宫': ['siblings', 'friends', 'relationships'],
      '夫妻宫': ['marriage', 'partnership', 'love'],
      '子女宫': ['children', 'creativity', 'legacy'],
      '财帛宫': ['wealth', 'money', 'prosperity'],
      '疾厄宫': ['health', 'vitality', 'wellness'],
      '迁移宫': ['travel', 'change', 'relocation'],
      '奴仆宫': ['friends', 'helpers', 'social'],
      '官禄宫': ['career', 'status', 'profession'],
      '田宅宫': ['property', 'home', 'real estate'],
      '福德宫': ['blessings', 'fortune', 'spirituality'],
      '父母宫': ['parents', 'authority', 'guidance']
    }
    return keywords[palaceName] || ['influence', 'aspect']
  }


  private calculatePillar(value: number, type: string): { heavenlyStem: string; earthlyBranch: string; element: string } {
    // Simplified pillar calculation
    const stems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
    const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
    const elements = ['wood', 'wood', 'fire', 'fire', 'earth', 'earth', 'metal', 'metal', 'water', 'water']

    return {
      heavenlyStem: stems[value % 10],
      earthlyBranch: branches[value % 12],
      element: elements[value % 10]
    }
  }

  private calculateFortuneCycle(startAge: number, endAge: number): FortuneCycle {
    const natures: ('excellent' | 'good' | 'neutral' | 'challenging')[] = ['excellent', 'good', 'neutral', 'challenging']
    const nature = natures[Math.floor(Math.random() * natures.length)]

    return {
      period: `${startAge}-${endAge}`,
      startAge,
      endAge,
      element: 'wood',
      nature,
      description: `This ${endAge - startAge}-year period brings ${nature} fortune.`,
      focus: ['personal growth', 'relationships'],
      warnings: [],
      opportunities: ['new opportunities', 'growth']
    }
  }

  private getElementRecommendations(dominant: string, weak: string): string[] {
    return [
      `Strengthen ${weak} element`,
      `Balance with ${dominant} element`,
      'Maintain harmony in daily life'
    ]
  }

  private getChineseMonthName(month: number): string {
    const months = ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '冬月', '腊月']
    return months[month - 1] || '未知'
  }

  private getChineseDayName(day: number): string {
    // Simplified day name calculation
    return `第${day}日`
  }

  private getAnimalElement(year: number): string {
    const elements = ['wood', 'fire', 'earth', 'metal', 'water']
    return elements[Math.floor((year - 1900) / 2) % 5]
  }

  private getAnimalPersonality(animal: string): string[] {
    const personalities: Record<string, string[]> = {
      'Rat': ['intelligent', 'adaptable', 'quick-witted'],
      'Ox': ['diligent', 'dependable', 'strong'],
      'Tiger': ['brave', 'confident', 'competitive'],
      'Rabbit': ['gentle', 'quiet', 'elegant'],
      'Dragon': ['confident', 'intelligent', 'enthusiastic'],
      'Snake': ['enigmatic', 'intelligent', 'wise'],
      'Horse': ['energetic', 'independent', 'free-spirited'],
      'Goat': ['creative', 'empathetic', 'peaceful'],
      'Monkey': ['intelligent', 'witty', 'inventive'],
      'Rooster': ['honest', 'observant', 'hardworking'],
      'Dog': ['loyal', 'honest', 'cautious'],
      'Pig': ['compassionate', 'generous', 'diligent']
    }
    return personalities[animal] || ['unique', 'special']
  }

  private getAnimalCompatibility(animal: string): string[] {
    // Simplified compatibility
    return ['Most compatible', 'Good match', 'Neutral']
  }

  private getAnimalLuckyColors(animal: string): string[] {
    return ['red', 'gold', 'blue']
  }

  private getAnimalLuckyNumbers(animal: string): number[] {
    return [1, 3, 7, 9]
  }

  private getAnimalLuckyDirections(animal: string): string[] {
    return ['north', 'east', 'south']
  }
}

// Export singleton instance
export const chineseAstrologyService = new ChineseAstrologyService()
