/**
 * Chinese Calendar Utilities
 * Solar-Lunar calendar conversions and Chinese zodiac calculations
 */

export interface SolarDate {
  year: number
  month: number
  day: number
}

export interface LunarDate {
  year: number
  month: number
  day: number
  isLeapMonth: boolean
  leapMonth?: number
}

export interface ChineseZodiacInfo {
  animal: string
  animalChinese: string
  element: string
  elementChinese: string
  yinYang: 'yin' | 'yang'
  year: number
  startDate: string
  endDate: string
}

export interface HeavenlyStem {
  stem: string
  stemChinese: string
  element: string
  yinYang: 'yin' | 'yang'
  number: number
}

export interface EarthlyBranch {
  branch: string
  branchChinese: string
  animal: string
  element: string
  time: string
  direction: string
  number: number
}

export interface PillarInfo {
  heavenlyStem: HeavenlyStem
  earthlyBranch: EarthlyBranch
  element: string
  description: string
}

/**
 * Chinese Calendar Service
 */
export class ChineseCalendarService {
  // Heavenly Stems (天干)
  private readonly HEAVENLY_STEMS: HeavenlyStem[] = [
    { stem: 'Jia', stemChinese: '甲', element: 'wood', yinYang: 'yang', number: 1 },
    { stem: 'Yi', stemChinese: '乙', element: 'wood', yinYang: 'yin', number: 2 },
    { stem: 'Bing', stemChinese: '丙', element: 'fire', yinYang: 'yang', number: 3 },
    { stem: 'Ding', stemChinese: '丁', element: 'fire', yinYang: 'yin', number: 4 },
    { stem: 'Wu', stemChinese: '戊', element: 'earth', yinYang: 'yang', number: 5 },
    { stem: 'Ji', stemChinese: '己', element: 'earth', yinYang: 'yin', number: 6 },
    { stem: 'Geng', stemChinese: '庚', element: 'metal', yinYang: 'yang', number: 7 },
    { stem: 'Xin', stemChinese: '辛', element: 'metal', yinYang: 'yin', number: 8 },
    { stem: 'Ren', stemChinese: '壬', element: 'water', yinYang: 'yang', number: 9 },
    { stem: 'Gui', stemChinese: '癸', element: 'water', yinYang: 'yin', number: 10 }
  ]

  // Earthly Branches (地支)
  private readonly EARTHLY_BRANCHES: EarthlyBranch[] = [
    { branch: 'Zi', branchChinese: '子', animal: 'Rat', element: 'water', time: '23:00-01:00', direction: 'north', number: 1 },
    { branch: 'Chou', branchChinese: '丑', animal: 'Ox', element: 'earth', time: '01:00-03:00', direction: 'northeast', number: 2 },
    { branch: 'Yin', branchChinese: '寅', animal: 'Tiger', element: 'wood', time: '03:00-05:00', direction: 'northeast', number: 3 },
    { branch: 'Mao', branchChinese: '卯', animal: 'Rabbit', element: 'wood', time: '05:00-07:00', direction: 'east', number: 4 },
    { branch: 'Chen', branchChinese: '辰', animal: 'Dragon', element: 'earth', time: '07:00-09:00', direction: 'southeast', number: 5 },
    { branch: 'Si', branchChinese: '巳', animal: 'Snake', element: 'fire', time: '09:00-11:00', direction: 'southeast', number: 6 },
    { branch: 'Wu', branchChinese: '午', animal: 'Horse', element: 'fire', time: '11:00-13:00', direction: 'south', number: 7 },
    { branch: 'Wei', branchChinese: '未', animal: 'Goat', element: 'earth', time: '13:00-15:00', direction: 'southwest', number: 8 },
    { branch: 'Shen', branchChinese: '申', animal: 'Monkey', element: 'metal', time: '15:00-17:00', direction: 'southwest', number: 9 },
    { branch: 'You', branchChinese: '酉', animal: 'Rooster', element: 'metal', time: '17:00-19:00', direction: 'west', number: 10 },
    { branch: 'Xu', branchChinese: '戌', animal: 'Dog', element: 'earth', time: '19:00-21:00', direction: 'northwest', number: 11 },
    { branch: 'Hai', branchChinese: '亥', animal: 'Pig', element: 'water', time: '21:00-23:00', direction: 'northwest', number: 12 }
  ]

  // Chinese Zodiac Animals
  private readonly ZODIAC_ANIMALS = [
    'Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake',
    'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'
  ]

  private readonly ZODIAC_ANIMALS_CHINESE = [
    '鼠', '牛', '虎', '兔', '龙', '蛇',
    '马', '羊', '猴', '鸡', '狗', '猪'
  ]

  /**
   * Convert solar date to lunar date
   * Note: This is a simplified conversion. For accurate lunar dates,
   * use a proper lunar calendar library or API
   */
  solarToLunar(solarDate: SolarDate): LunarDate {
    try {
      // Simplified conversion - in reality, this requires complex calculations
      // The iztro library handles this internally
      const { year, month, day } = solarDate
      
      // Basic approximation (this is not astronomically accurate)
      const lunarYear = year
      const lunarMonth = month
      const lunarDay = day
      const isLeapMonth = false // Simplified

      return {
        year: lunarYear,
        month: lunarMonth,
        day: lunarDay,
        isLeapMonth
      }
    } catch (error) {
      console.error('Error converting solar to lunar:', error)
      throw new Error('Failed to convert solar date to lunar')
    }
  }

  /**
   * Convert lunar date to solar date
   * Note: This is a simplified conversion
   */
  lunarToSolar(lunarDate: LunarDate): SolarDate {
    try {
      // Simplified conversion - in reality, this requires complex calculations
      const { year, month, day } = lunarDate
      
      return {
        year,
        month,
        day
      }
    } catch (error) {
      console.error('Error converting lunar to solar:', error)
      throw new Error('Failed to convert lunar date to solar')
    }
  }

  /**
   * Get Chinese zodiac animal for a given year
   */
  getChineseZodiacAnimal(year: number): ChineseZodiacInfo {
    try {
      // Chinese zodiac cycle starts from 1900 (Rat year)
      const zodiacIndex = (year - 1900) % 12
      const animalIndex = zodiacIndex < 0 ? zodiacIndex + 12 : zodiacIndex
      
      const animal = this.ZODIAC_ANIMALS[animalIndex]
      const animalChinese = this.ZODIAC_ANIMALS_CHINESE[animalIndex]
      
      // Get element based on year
      const element = this.getElementForYear(year)
      const elementChinese = this.getElementChinese(element)
      
      // Determine yin/yang (even years are yin, odd are yang)
      const yinYang = year % 2 === 0 ? 'yin' : 'yang'
      
      // Approximate year boundaries (simplified)
      const startDate = `${year}-02-05` // Spring Festival approximation
      const endDate = `${year + 1}-02-04`

      return {
        animal,
        animalChinese,
        element,
        elementChinese,
        yinYang,
        year,
        startDate,
        endDate
      }
    } catch (error) {
      console.error('Error getting Chinese zodiac:', error)
      throw new Error('Failed to get Chinese zodiac animal')
    }
  }

  /**
   * Get heavenly stem for a given value
   */
  getHeavenlyStem(index: number): HeavenlyStem {
    const stemIndex = (index - 1) % 10
    return this.HEAVENLY_STEMS[stemIndex < 0 ? stemIndex + 10 : stemIndex]
  }

  /**
   * Get earthly branch for a given value
   */
  getEarthlyBranch(index: number): EarthlyBranch {
    const branchIndex = (index - 1) % 12
    return this.EARTHLY_BRANCHES[branchIndex < 0 ? branchIndex + 12 : branchIndex]
  }

  /**
   * Calculate Four Pillars (Ba Zi) for birth date and time
   */
  calculateFourPillars(birthDate: SolarDate, birthTime: { hour: number; minute: number }): {
    year: PillarInfo
    month: PillarInfo
    day: PillarInfo
    hour: PillarInfo
  } {
    try {
      const { year, month, day } = birthDate
      const { hour } = birthTime

      // Calculate year pillar
      const yearStem = this.getHeavenlyStem(year)
      const yearBranch = this.getEarthlyBranch(year)
      
      // Calculate month pillar (simplified)
      const monthStem = this.getHeavenlyStem(month)
      const monthBranch = this.getEarthlyBranch(month)
      
      // Calculate day pillar (simplified)
      const dayStem = this.getHeavenlyStem(day)
      const dayBranch = this.getEarthlyBranch(day)
      
      // Calculate hour pillar
      const hourBranch = this.getEarthlyBranchFromHour(hour)
      const hourStem = this.getHeavenlyStem(hour)

      return {
        year: {
          heavenlyStem: yearStem,
          earthlyBranch: yearBranch,
          element: this.getCombinedElement(yearStem.element, yearBranch.element),
          description: `Year of ${yearBranch.animal} (${yearStem.element} ${yearBranch.element})`
        },
        month: {
          heavenlyStem: monthStem,
          earthlyBranch: monthBranch,
          element: this.getCombinedElement(monthStem.element, monthBranch.element),
          description: `Month of ${monthBranch.animal} (${monthStem.element} ${monthBranch.element})`
        },
        day: {
          heavenlyStem: dayStem,
          earthlyBranch: dayBranch,
          element: this.getCombinedElement(dayStem.element, dayBranch.element),
          description: `Day of ${dayBranch.animal} (${dayStem.element} ${dayBranch.element})`
        },
        hour: {
          heavenlyStem: hourStem,
          earthlyBranch: hourBranch,
          element: this.getCombinedElement(hourStem.element, hourBranch.element),
          description: `Hour of ${hourBranch.animal} (${hourStem.element} ${hourBranch.element})`
        }
      }
    } catch (error) {
      console.error('Error calculating Four Pillars:', error)
      throw new Error('Failed to calculate Four Pillars')
    }
  }

  /**
   * Determine element for a given year
   */
  getElementForYear(year: number): string {
    // Simplified element calculation based on year
    const elementCycle = ['wood', 'fire', 'earth', 'metal', 'water']
    const elementIndex = Math.floor((year - 1900) / 2) % 5
    return elementCycle[elementIndex < 0 ? elementIndex + 5 : elementIndex]
  }

  /**
   * Get Chinese name for element
   */
  getElementChinese(element: string): string {
    const elementMap: Record<string, string> = {
      'wood': '木',
      'fire': '火',
      'earth': '土',
      'metal': '金',
      'water': '水'
    }
    return elementMap[element] || '未知'
  }

  /**
   * Check if a month is a leap month
   */
  isLeapMonth(year: number, month: number): boolean {
    // Simplified leap month calculation
    // In reality, this requires complex astronomical calculations
    return false
  }

  /**
   * Get earthly branch from hour
   */
  private getEarthlyBranchFromHour(hour: number): EarthlyBranch {
    // Convert 24-hour format to earthly branch
    let branchIndex: number
    
    if (hour === 23 || hour === 0) branchIndex = 0 // Zi (Rat)
    else if (hour >= 1 && hour < 3) branchIndex = 1 // Chou (Ox)
    else if (hour >= 3 && hour < 5) branchIndex = 2 // Yin (Tiger)
    else if (hour >= 5 && hour < 7) branchIndex = 3 // Mao (Rabbit)
    else if (hour >= 7 && hour < 9) branchIndex = 4 // Chen (Dragon)
    else if (hour >= 9 && hour < 11) branchIndex = 5 // Si (Snake)
    else if (hour >= 11 && hour < 13) branchIndex = 6 // Wu (Horse)
    else if (hour >= 13 && hour < 15) branchIndex = 7 // Wei (Goat)
    else if (hour >= 15 && hour < 17) branchIndex = 8 // Shen (Monkey)
    else if (hour >= 17 && hour < 19) branchIndex = 9 // You (Rooster)
    else if (hour >= 19 && hour < 21) branchIndex = 10 // Xu (Dog)
    else branchIndex = 11 // Hai (Pig)

    return this.EARTHLY_BRANCHES[branchIndex]
  }

  /**
   * Get combined element from two elements
   */
  private getCombinedElement(element1: string, element2: string): string {
    // Simplified element combination
    if (element1 === element2) return element1
    
    // Element generation cycle
    const generationCycle: Record<string, string> = {
      'wood': 'fire',
      'fire': 'earth',
      'earth': 'metal',
      'metal': 'water',
      'water': 'wood'
    }
    
    // Element destruction cycle
    const destructionCycle: Record<string, string> = {
      'wood': 'earth',
      'fire': 'metal',
      'earth': 'water',
      'metal': 'wood',
      'water': 'fire'
    }
    
    // Return the stronger element or a balanced combination
    return element1
  }

  /**
   * Get current Chinese zodiac year
   */
  getCurrentChineseYear(): ChineseZodiacInfo {
    const currentYear = new Date().getFullYear()
    return this.getChineseZodiacAnimal(currentYear)
  }

  /**
   * Get zodiac compatibility between two animals
   */
  getZodiacCompatibility(animal1: string, animal2: string): {
    compatibility: 'excellent' | 'good' | 'neutral' | 'challenging'
    description: string
  } {
    // Simplified compatibility matrix
    const compatibilityMatrix: Record<string, Record<string, string>> = {
      'Rat': {
        'Dragon': 'excellent',
        'Monkey': 'excellent',
        'Ox': 'good',
        'Tiger': 'neutral',
        'Rabbit': 'challenging',
        'Snake': 'neutral',
        'Horse': 'challenging',
        'Goat': 'challenging',
        'Rooster': 'neutral',
        'Dog': 'neutral',
        'Pig': 'neutral'
      }
      // Add more animals as needed
    }

    const compatibility = compatibilityMatrix[animal1]?.[animal2] || 'neutral'
    
    const descriptions: Record<string, string> = {
      'excellent': 'Excellent compatibility - strong harmony and mutual support',
      'good': 'Good compatibility - generally harmonious relationship',
      'neutral': 'Neutral compatibility - relationship depends on other factors',
      'challenging': 'Challenging compatibility - requires effort and understanding'
    }

    return {
      compatibility: compatibility as 'excellent' | 'good' | 'neutral' | 'challenging',
      description: descriptions[compatibility]
    }
  }
}

// Export singleton instance
export const chineseCalendarService = new ChineseCalendarService()
