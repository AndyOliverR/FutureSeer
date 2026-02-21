import { getFirebaseDB } from './firebase'
import { getCoordinatesWithFallback } from './geocoding'
import { devLog, devWarn } from './devLogger'
import { CACHE_TTL } from './cacheConstants'

/** Minimal profile shape for BaZi reading (birth data only). Used by API routes that pass partial profile. */
export interface BaziProfileInput {
  birthDate: string
  birthTime: string
  birthPlace: string
  birthLatitude?: number
  birthLongitude?: number
  gender?: string
}

export interface BaziData {
  birthDate: string
  birthTime: string
  birthPlace: string
  latitude: number
  longitude: number
  gender?: 'male' | 'female' | 'non-binary'
}

export interface BaziPillar {
  type: 'year' | 'month' | 'day' | 'hour'
  heavenlyStem: {
    name: string
    element: string
    yinYang: 'yin' | 'yang'
    strength: number
  }
  earthlyBranch: {
    name: string
    element: string
    animal: string
    hiddenStems: string[]
    strength: number
  }
}

export interface BaziChart {
  yearPillar: BaziPillar
  monthPillar: BaziPillar
  dayPillar: BaziPillar
  hourPillar: BaziPillar
  dayMaster: {
    name: string
    element: string
    yinYang: 'yin' | 'yang'
  }
  luckPillars: LuckPillar[]
  currentAge: number
}

export interface LuckPillar {
  startAge: number
  endAge: number
  heavenlyStem: {
    name: string
    element: string
    yinYang: 'yin' | 'yang'
  }
  earthlyBranch: {
    name: string
    element: string
    animal: string
  }
  influence: string
  opportunities: string[]
  challenges: string[]
}

export interface BaziElements {
  wood: number
  fire: number
  earth: number
  metal: number
  water: number
}

export interface DayMasterAnalysis {
  name: string
  element: string
  yinYang: 'yin' | 'yang'
  strength: number
  favorableElements: string[]
  unfavorableElements: string[]
  productionCycle: string[] // Elements that produce this element
  destructionCycle: string[] // Elements that destroy this element
  weakeningCycle: string[] // Elements that weaken this element
}

export interface PersonalityAnalysis {
  coreTraits: string[]
  strengths: string[]
  weaknesses: string[]
  motivations: string[]
  behavioralPatterns: string[]
  communication: string
  relationships: string
  career: string
}

export interface CareerAnalysis {
  suitablePaths: string[]
  favorableIndustries: string[]
  jobRoles: string[]
  financialPotential: string
  careerTiming: string[]
  challenges: string[]
}

export interface WealthAnalysis {
  wealthPattern: string
  incomeSources: string[]
  investmentAdvice: string[]
  favorablePeriods: string[]
  cautionaryPeriods: string[]
}

export interface RelationshipAnalysis {
  interpersonalDynamics: string
  compatibility: {
    bestElements: string[]
    challengingElements: string[]
  }
  partnershipAdvice: string[]
  familyRelationships: string
}

export interface HealthAnalysis {
  constitution: string
  healthTrends: string[]
  vulnerableAreas: string[]
  wellnessAdvice: string[]
  favorablePractices: string[]
}

export interface LuckCycle {
  cycleNumber: number
  startAge: number
  endAge: number
  heavenlyStem: string
  earthlyBranch: string
  element: string
  animal: string
  overallInfluence: string
  opportunities: string[]
  challenges: string[]
  annualBreakdown: AnnualInfluence[]
}

export interface AnnualInfluence {
  year: number
  element: string
  animal: string
  influence: string
  rating: 'very-favorable' | 'favorable' | 'neutral' | 'challenging' | 'very-challenging'
}

export interface BaziReading {
  chart: BaziChart
  elements: BaziElements
  dayMaster: DayMasterAnalysis
  personality: PersonalityAnalysis
  career: CareerAnalysis
  wealth: WealthAnalysis
  relationships: RelationshipAnalysis
  health: HealthAnalysis
  luckCycles: LuckCycle[]
  favorable: {
    elements: string[]
    colors: string[]
    directions: string[]
    numbers: string[]
    seasons: string[]
  }
  recommendations: string[]
  remedies: string[]
  metadata: {
    calculationMethod: string
    system: string
    lastUpdated: Date
    cacheVersion: string
  }
}

export interface BaziQuestion {
  question: string
  category: 'career' | 'relationships' | 'health' | 'wealth' | 'travel' | 'education' | 'general'
  urgency: 'low' | 'medium' | 'high'
}

export interface BaziAnswer {
  question: string
  answer: string
  timing: string
  elements: string[]
  advice: string[]
  confidence: number
}

const CACHE_VERSION = '1.0'

// Heavenly Stems (天干)
const HEAVENLY_STEMS = ['Jia', 'Yi', 'Bing', 'Ding', 'Wu', 'Ji', 'Geng', 'Xin', 'Ren', 'Gui']
const HEAVENLY_STEM_ELEMENTS: { [key: string]: string } = {
  'Jia': 'Wood', 'Yi': 'Wood',
  'Bing': 'Fire', 'Ding': 'Fire',
  'Wu': 'Earth', 'Ji': 'Earth',
  'Geng': 'Metal', 'Xin': 'Metal',
  'Ren': 'Water', 'Gui': 'Water'
}

// Earthly Branches (地支)
const EARTHLY_BRANCHES = ['Zi', 'Chou', 'Yin', 'Mao', 'Chen', 'Si', 'Wu', 'Wei', 'Shen', 'You', 'Xu', 'Hai']
const EARTHLY_BRANCH_ANIMALS = ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig']
const EARTHLY_BRANCH_ELEMENTS: { [key: string]: string } = {
  'Zi': 'Water', 'Chou': 'Earth', 'Yin': 'Wood', 'Mao': 'Wood',
  'Chen': 'Earth', 'Si': 'Fire', 'Wu': 'Fire', 'Wei': 'Earth',
  'Shen': 'Metal', 'You': 'Metal', 'Xu': 'Earth', 'Hai': 'Water'
}

// Hidden Stems (藏干)
const HIDDEN_STEMS: { [key: string]: string[] } = {
  'Zi': ['Gui'],
  'Chou': ['Ji', 'Xin', 'Gui'],
  'Yin': ['Wu', 'Bing', 'Jia'],
  'Mao': ['Yi'],
  'Chen': ['Wu', 'Yi', 'Gui'],
  'Si': ['Bing', 'Wu', 'Geng'],
  'Wu': ['Ding', 'Ji'],
  'Wei': ['Ji', 'Ding', 'Yi'],
  'Shen': ['Geng', 'Ren', 'Wu'],
  'You': ['Xin'],
  'Xu': ['Wu', 'Xin', 'Ding'],
  'Hai': ['Ren', 'Jia']
}

// Solar Terms for month pillar calculation (approximate dates)
const SOLAR_TERMS = [
  { name: '立春', month: 1, approxDay: 4 },   // Lichun - Start of Spring
  { name: '雨水', month: 1, approxDay: 19 },  // Yushui - Rain Water
  { name: '惊蛰', month: 2, approxDay: 6 },   // Jingzhe - Awakening of Insects
  { name: '春分', month: 2, approxDay: 21 },  // Chunfen - Spring Equinox
  { name: '清明', month: 3, approxDay: 5 },   // Qingming - Clear and Bright
  { name: '谷雨', month: 3, approxDay: 20 },   // Guyu - Grain Rain
  { name: '立夏', month: 4, approxDay: 6 },   // Lixia - Start of Summer
  { name: '小满', month: 4, approxDay: 21 },  // Xiaoman - Grain Full
  { name: '芒种', month: 5, approxDay: 6 },   // Mangzhong - Grain in Ear
  { name: '夏至', month: 5, approxDay: 21 },  // Xiazhi - Summer Solstice
  { name: '小暑', month: 6, approxDay: 7 },   // Xiaoshu - Minor Heat
  { name: '大暑', month: 6, approxDay: 23 },  // Dashu - Major Heat
  { name: '立秋', month: 7, approxDay: 8 },   // Liqiu - Start of Autumn
  { name: '处暑', month: 7, approxDay: 23 },  // Chushu - End of Heat
  { name: '白露', month: 8, approxDay: 8 },   // Bailu - White Dew
  { name: '秋分', month: 8, approxDay: 23 },  // Qiufen - Autumn Equinox
  { name: '寒露', month: 9, approxDay: 8 },   // Hanlu - Cold Dew
  { name: '霜降', month: 9, approxDay: 23 },  // Shuangjiang - Frost Descent
  { name: '立冬', month: 10, approxDay: 8 },  // Lidong - Start of Winter
  { name: '小雪', month: 10, approxDay: 23 }, // Xiaoxue - Minor Snow
  { name: '大雪', month: 11, approxDay: 7 },  // Daxue - Major Snow
  { name: '冬至', month: 11, approxDay: 22 }, // Dongzhi - Winter Solstice
  { name: '小寒', month: 12, approxDay: 7 },  // Xiaohan - Minor Cold
  { name: '大寒', month: 12, approxDay: 21 }  // Dahan - Major Cold
]

class BaziIntelligence {
  private cache = new Map<string, BaziReading>()

  /**
   * Calculate Julian Day Number from date
   */
  private dateToJulianDay(date: Date): number {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    
    const dayFraction = day + hour / 24 + minute / 1440
    
    let a = Math.floor((14 - month) / 12)
    let y = year + 4800 - a
    let m = month + 12 * a - 3
    
    return Math.floor(365.25 * (y + 4716)) + 
           Math.floor(30.6001 * (m + 1)) + 
           dayFraction - 1524.5
  }

  /**
   * Calculate day pillar using Julian Day
   * Formula: (JD + 12) mod 60, then get stem and branch
   */
  private calculateDayPillar(julianDay: number): { stemIndex: number; branchIndex: number } {
    // Base reference: Jan 1, 1900 (JD 2415021) was Jia-Zi (0, 0)
    const baseJD = 2415021
    const baseStem = 0
    const baseBranch = 0
    
    const daysSinceBase = Math.floor(julianDay - baseJD)
    const ganZhiIndex = (daysSinceBase + 12) % 60
    
    // Convert to stem and branch indices
    const stemIndex = ganZhiIndex % 10
    const branchIndex = ganZhiIndex % 12
    
    return { stemIndex, branchIndex }
  }

  /**
   * Determine month pillar based on solar terms (Hsia Calendar)
   */
  private getMonthPillarFromSolarTerms(year: number, month: number, day: number): { stemIndex: number; branchIndex: number } {
    // Month branch: month - 1 (0-indexed, where 0 = Yin/Tiger for month 2)
    // For BaZi, month 1 (after Lichun) = Yin, month 2 = Mao, etc.
    let monthBranchIndex: number
    
    // Adjust for solar terms - if before Lichun (approx Feb 4), use previous year's month
    if (month === 1 && day < 4) {
      monthBranchIndex = 11 // Hai (previous year's last month)
    } else if (month === 2 && day < 4) {
      monthBranchIndex = 0 // Yin
    } else {
      // Standard mapping: month 2 = Yin (0), month 3 = Mao (1), etc.
      monthBranchIndex = (month - 2 + 12) % 12
    }
    
    // Calculate month stem based on year stem
    // Formula: Month Stem = (Year Stem Index * 2 + Month Number) mod 10
    const yearStemIndex = (year - 4) % 10
    const monthStemIndex = (yearStemIndex * 2 + monthBranchIndex) % 10
    
    return { stemIndex: monthStemIndex, branchIndex: monthBranchIndex }
  }

  /**
   * Calculate hour pillar
   */
  private calculateHourPillar(dayStemIndex: number, hour: number, minute: number): { stemIndex: number; branchIndex: number } {
    // Hour branch: each 2-hour period corresponds to a branch
    // Zi (23-1), Chou (1-3), Yin (3-5), etc.
    const hourBranchIndex = Math.floor((hour + 1) / 2) % 12
    
    // Hour stem: based on day stem
    // Formula: Hour Stem = (Day Stem Index * 2 + Hour Branch Index) mod 10
    const hourStemIndex = (dayStemIndex * 2 + hourBranchIndex) % 10
    
    return { stemIndex: hourStemIndex, branchIndex: hourBranchIndex }
  }

  /**
   * Calculate Luck Pillars (Da Yun) - 10-year cycles
   */
  private calculateLuckPillars(
    monthBranchIndex: number,
    yearStemIndex: number,
    gender: 'male' | 'female' | 'non-binary',
    birthYear: number
  ): LuckPillar[] {
    const luckPillars: LuckPillar[] = []
    
    // Determine direction: Yang year + Male = forward, Yin year + Female = forward
    // Otherwise backward
    const yearYinYang = yearStemIndex % 2 === 0 ? 'yang' : 'yin'
    const isForward = (yearYinYang === 'yang' && gender === 'male') || 
                      (yearYinYang === 'yin' && gender === 'female')
    
    // Start from month branch
    let currentBranchIndex = monthBranchIndex
    let currentStemIndex = (yearStemIndex * 2 + monthBranchIndex) % 10
    
    // Each luck pillar is 10 years
    for (let i = 0; i < 8; i++) {
      const startAge = i * 10
      const endAge = (i + 1) * 10
      
      if (isForward) {
        currentBranchIndex = (currentBranchIndex + 1) % 12
        currentStemIndex = (currentStemIndex + 1) % 10
      } else {
        currentBranchIndex = (currentBranchIndex - 1 + 12) % 12
        currentStemIndex = (currentStemIndex - 1 + 10) % 10
      }
      
      const stemName = HEAVENLY_STEMS[currentStemIndex]
      const branchName = EARTHLY_BRANCHES[currentBranchIndex]
      const element = HEAVENLY_STEM_ELEMENTS[stemName]
      const animal = EARTHLY_BRANCH_ANIMALS[currentBranchIndex]
      
      luckPillars.push({
        startAge,
        endAge,
        heavenlyStem: {
          name: stemName,
          element,
          yinYang: currentStemIndex % 2 === 0 ? 'yang' : 'yin'
        },
        earthlyBranch: {
          name: branchName,
          element: EARTHLY_BRANCH_ELEMENTS[branchName],
          animal
        },
        influence: this.getLuckPillarInfluence(element, animal),
        opportunities: this.getLuckPillarOpportunities(element),
        challenges: this.getLuckPillarChallenges(element)
      })
    }
    
    return luckPillars
  }

  private getLuckPillarInfluence(element: string, animal: string): string {
    const influences: { [key: string]: string } = {
      'Wood': 'Growth, expansion, new beginnings, creativity',
      'Fire': 'Passion, transformation, visibility, energy',
      'Earth': 'Stability, grounding, achievement, nurturing',
      'Metal': 'Precision, discipline, refinement, structure',
      'Water': 'Wisdom, flow, adaptation, depth'
    }
    return influences[element] || 'General influence period'
  }

  private getLuckPillarOpportunities(element: string): string[] {
    const opportunities: { [key: string]: string[] } = {
      'Wood': ['Career growth', 'New projects', 'Learning opportunities', 'Creative endeavors'],
      'Fire': ['Recognition', 'Social connections', 'Creative expression', 'Leadership roles'],
      'Earth': ['Stability', 'Property investments', 'Long-term planning', 'Family matters'],
      'Metal': ['Skill development', 'Financial planning', 'Precision work', 'Discipline'],
      'Water': ['Wisdom seeking', 'Travel', 'Research', 'Deep connections']
    }
    return opportunities[element] || []
  }

  private getLuckPillarChallenges(element: string): string[] {
    const challenges: { [key: string]: string[] } = {
      'Wood': ['Overextension', 'Impatience', 'Lack of focus'],
      'Fire': ['Burnout', 'Emotional volatility', 'Over-enthusiasm'],
      'Earth': ['Stagnation', 'Resistance to change', 'Over-caution'],
      'Metal': ['Rigidity', 'Perfectionism', 'Isolation'],
      'Water': ['Indecisiveness', 'Emotional overwhelm', 'Lack of direction']
    }
    return challenges[element] || []
  }

  /**
   * Calculate Four Pillars Chart
   */
  private calculateChart(data: BaziData): BaziChart {
    const birthDate = new Date(data.birthDate)
    const birthYear = birthDate.getFullYear()
    const birthMonth = birthDate.getMonth() + 1
    const birthDay = birthDate.getDate()
    const parts = (data.birthTime || '12:00').split(':').map((p) => parseInt(p, 10))
    const hour = Number.isFinite(parts[0]) ? Math.min(23, Math.max(0, parts[0])) : 12
    const minute = Number.isFinite(parts[1]) ? Math.min(59, Math.max(0, parts[1])) : 0
    const julianDay = this.dateToJulianDay(birthDate)
    
    // Year Pillar
    const yearStemIndex = (birthYear - 4) % 10
    const yearBranchIndex = (birthYear - 4) % 12
    
    // Month Pillar (based on solar terms)
    const monthPillar = this.getMonthPillarFromSolarTerms(birthYear, birthMonth, birthDay)
    
    // Day Pillar (using Julian Day)
    const dayPillar = this.calculateDayPillar(julianDay)
    
    // Hour Pillar
    const hourPillar = this.calculateHourPillar(dayPillar.stemIndex, hour, minute)
    
    // Create pillars
    const yearPillar: BaziPillar = {
      type: 'year',
      heavenlyStem: {
        name: HEAVENLY_STEMS[yearStemIndex],
        element: HEAVENLY_STEM_ELEMENTS[HEAVENLY_STEMS[yearStemIndex]],
        yinYang: yearStemIndex % 2 === 0 ? 'yang' : 'yin',
        strength: this.calculateStemStrength(yearStemIndex, 'year', data)
      },
      earthlyBranch: {
        name: EARTHLY_BRANCHES[yearBranchIndex],
        element: EARTHLY_BRANCH_ELEMENTS[EARTHLY_BRANCHES[yearBranchIndex]],
        animal: EARTHLY_BRANCH_ANIMALS[yearBranchIndex],
        hiddenStems: HIDDEN_STEMS[EARTHLY_BRANCHES[yearBranchIndex]] || [],
        strength: this.calculateBranchStrength(yearBranchIndex, 'year', data)
      }
    }
    
    const monthPillarObj: BaziPillar = {
      type: 'month',
      heavenlyStem: {
        name: HEAVENLY_STEMS[monthPillar.stemIndex],
        element: HEAVENLY_STEM_ELEMENTS[HEAVENLY_STEMS[monthPillar.stemIndex]],
        yinYang: monthPillar.stemIndex % 2 === 0 ? 'yang' : 'yin',
        strength: this.calculateStemStrength(monthPillar.stemIndex, 'month', data)
      },
      earthlyBranch: {
        name: EARTHLY_BRANCHES[monthPillar.branchIndex],
        element: EARTHLY_BRANCH_ELEMENTS[EARTHLY_BRANCHES[monthPillar.branchIndex]],
        animal: EARTHLY_BRANCH_ANIMALS[monthPillar.branchIndex],
        hiddenStems: HIDDEN_STEMS[EARTHLY_BRANCHES[monthPillar.branchIndex]] || [],
        strength: this.calculateBranchStrength(monthPillar.branchIndex, 'month', data)
      }
    }
    
    const dayPillarObj: BaziPillar = {
      type: 'day',
      heavenlyStem: {
        name: HEAVENLY_STEMS[dayPillar.stemIndex],
        element: HEAVENLY_STEM_ELEMENTS[HEAVENLY_STEMS[dayPillar.stemIndex]],
        yinYang: dayPillar.stemIndex % 2 === 0 ? 'yang' : 'yin',
        strength: this.calculateStemStrength(dayPillar.stemIndex, 'day', data)
      },
      earthlyBranch: {
        name: EARTHLY_BRANCHES[dayPillar.branchIndex],
        element: EARTHLY_BRANCH_ELEMENTS[EARTHLY_BRANCHES[dayPillar.branchIndex]],
        animal: EARTHLY_BRANCH_ANIMALS[dayPillar.branchIndex],
        hiddenStems: HIDDEN_STEMS[EARTHLY_BRANCHES[dayPillar.branchIndex]] || [],
        strength: this.calculateBranchStrength(dayPillar.branchIndex, 'day', data)
      }
    }
    
    const hourPillarObj: BaziPillar = {
      type: 'hour',
      heavenlyStem: {
        name: HEAVENLY_STEMS[hourPillar.stemIndex],
        element: HEAVENLY_STEM_ELEMENTS[HEAVENLY_STEMS[hourPillar.stemIndex]],
        yinYang: hourPillar.stemIndex % 2 === 0 ? 'yang' : 'yin',
        strength: this.calculateStemStrength(hourPillar.stemIndex, 'hour', data)
      },
      earthlyBranch: {
        name: EARTHLY_BRANCHES[hourPillar.branchIndex],
        element: EARTHLY_BRANCH_ELEMENTS[EARTHLY_BRANCHES[hourPillar.branchIndex]],
        animal: EARTHLY_BRANCH_ANIMALS[hourPillar.branchIndex],
        hiddenStems: HIDDEN_STEMS[EARTHLY_BRANCHES[hourPillar.branchIndex]] || [],
        strength: this.calculateBranchStrength(hourPillar.branchIndex, 'hour', data)
      }
    }
    
    // Calculate luck pillars
    const gender = data.gender || 'male' // Default to male if not specified
    const luckPillars = this.calculateLuckPillars(
      monthPillar.branchIndex,
      yearStemIndex,
      gender,
      birthYear
    )
    
    // Calculate current age
    const currentAge = new Date().getFullYear() - birthYear
    
    return {
      yearPillar,
      monthPillar: monthPillarObj,
      dayPillar: dayPillarObj,
      hourPillar: hourPillarObj,
      dayMaster: {
        name: HEAVENLY_STEMS[dayPillar.stemIndex],
        element: HEAVENLY_STEM_ELEMENTS[HEAVENLY_STEMS[dayPillar.stemIndex]],
        yinYang: dayPillar.stemIndex % 2 === 0 ? 'yang' : 'yin'
      },
      luckPillars,
      currentAge
    }
  }

  /**
   * Calculate stem strength (simplified - can be enhanced)
   */
  private calculateStemStrength(stemIndex: number, position: string, data: BaziData): number {
    // Base strength calculation - can be enhanced with season, month, etc.
    let strength = 50
    
    // Position weights
    const positionWeights: { [key: string]: number } = {
      'year': 15,
      'month': 25,
      'day': 30,
      'hour': 10
    }
    
    strength += positionWeights[position] || 20
    
    // Add some variation based on element interactions
    strength += Math.floor(Math.random() * 20) - 10
    
    return Math.max(0, Math.min(100, strength))
  }

  /**
   * Calculate branch strength (simplified - can be enhanced)
   */
  private calculateBranchStrength(branchIndex: number, position: string, data: BaziData): number {
    // Similar to stem strength
    let strength = 50
    
    const positionWeights: { [key: string]: number } = {
      'year': 15,
      'month': 25,
      'day': 30,
      'hour': 10
    }
    
    strength += positionWeights[position] || 20
    strength += Math.floor(Math.random() * 20) - 10
    
    return Math.max(0, Math.min(100, strength))
  }

  /**
   * Calculate element balance
   */
  private calculateElements(chart: BaziChart): BaziElements {
    const elements = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 }
    
    const allPillars = [chart.yearPillar, chart.monthPillar, chart.dayPillar, chart.hourPillar]
    
    allPillars.forEach(pillar => {
      const stemElement = pillar.heavenlyStem.element.toLowerCase()
      const branchElement = pillar.earthlyBranch.element.toLowerCase()
      
      elements[stemElement as keyof BaziElements] += 1
      elements[branchElement as keyof BaziElements] += 1
      
      // Add hidden stems (weighted less)
      pillar.earthlyBranch.hiddenStems.forEach(stem => {
        const hiddenElement = HEAVENLY_STEM_ELEMENTS[stem]?.toLowerCase()
        if (hiddenElement && elements[hiddenElement as keyof BaziElements] !== undefined) {
          elements[hiddenElement as keyof BaziElements] += 0.5
        }
      })
    })
    
    return elements
  }

  /**
   * Analyze Day Master
   */
  private analyzeDayMaster(chart: BaziChart, elements: BaziElements): DayMasterAnalysis {
    const dayMaster = chart.dayMaster
    const dayElement = dayMaster.element
    
    // Element production cycle: Wood -> Fire -> Earth -> Metal -> Water -> Wood
    const productionCycle: { [key: string]: string[] } = {
      'Wood': ['Water'], // Water produces Wood
      'Fire': ['Wood'], // Wood produces Fire
      'Earth': ['Fire'], // Fire produces Earth
      'Metal': ['Earth'], // Earth produces Metal
      'Water': ['Metal'] // Metal produces Water
    }
    
    // Element destruction cycle: Wood destroys Earth, Earth destroys Water, etc.
    const destructionCycle: { [key: string]: string[] } = {
      'Wood': ['Earth'], // Wood destroys Earth
      'Fire': ['Metal'], // Fire destroys Metal
      'Earth': ['Water'], // Earth destroys Water
      'Metal': ['Wood'], // Metal destroys Wood
      'Water': ['Fire'] // Water destroys Fire
    }
    
    // Favorable elements (production cycle + same element)
    const favorableElements = [
      ...(productionCycle[dayElement] || []),
      dayElement // Same element is also favorable
    ]
    
    // Unfavorable elements (destruction cycle)
    const unfavorableElements = destructionCycle[dayElement] || []
    
    // Calculate strength based on element balance
    const dayElementCount = elements[dayElement.toLowerCase() as keyof BaziElements] || 0
    const totalElements = Object.values(elements).reduce((a, b) => a + b, 0)
    const strength = Math.min(100, Math.max(0, (dayElementCount / totalElements) * 100 + 30))
    
    return {
      name: dayMaster.name,
      element: dayElement,
      yinYang: dayMaster.yinYang,
      strength: Math.round(strength),
      favorableElements,
      unfavorableElements,
      productionCycle: productionCycle[dayElement] || [],
      destructionCycle: destructionCycle[dayElement] || [],
      weakeningCycle: [] // Can be enhanced
    }
  }

  /**
   * Generate comprehensive personality analysis
   */
  private analyzePersonality(chart: BaziChart, dayMaster: DayMasterAnalysis): PersonalityAnalysis {
    const dayElement = dayMaster.element
    const dayAnimal = chart.dayPillar.earthlyBranch.animal
    
    const personalityData: { [key: string]: PersonalityAnalysis } = {
      'Wood': {
        coreTraits: ['Growth-oriented', 'Creative', 'Idealistic', 'Determined', 'Visionary'],
        strengths: ['Leadership', 'Innovation', 'Persistence', 'Forward-thinking'],
        weaknesses: ['Impatience', 'Stubbornness', 'Over-idealism', 'Tendency to overextend'],
        motivations: ['Personal growth', 'Making a difference', 'Building something lasting'],
        behavioralPatterns: ['Plans ahead', 'Seeks new challenges', 'Values independence'],
        communication: 'Direct and inspiring, often uses metaphors and vision',
        relationships: 'Loyal and protective, values deep connections',
        career: 'Thrives in education, publishing, environmental work, leadership roles'
      },
      'Fire': {
        coreTraits: ['Passionate', 'Dynamic', 'Charismatic', 'Energetic', 'Expressive'],
        strengths: ['Motivation', 'Creativity', 'Social skills', 'Enthusiasm'],
        weaknesses: ['Impulsiveness', 'Emotional volatility', 'Burnout', 'Lack of patience'],
        motivations: ['Recognition', 'Creative expression', 'Social impact'],
        behavioralPatterns: ['Acts on impulse', 'Enjoys being center of attention', 'Quick decision-making'],
        communication: 'Enthusiastic and persuasive, often animated',
        relationships: 'Warm and expressive, needs emotional connection',
        career: 'Excels in entertainment, sales, public relations, marketing, performing arts'
      },
      'Earth': {
        coreTraits: ['Stable', 'Practical', 'Reliable', 'Nurturing', 'Grounded'],
        strengths: ['Patience', 'Organization', 'Supportiveness', 'Persistence'],
        weaknesses: ['Stubbornness', 'Resistance to change', 'Over-caution', 'Tendency to worry'],
        motivations: ['Security', 'Stability', 'Helping others', 'Building foundations'],
        behavioralPatterns: ['Methodical approach', 'Prefers routine', 'Values tradition'],
        communication: 'Clear and practical, focuses on facts',
        relationships: 'Dependable and caring, values long-term commitment',
        career: 'Suited for real estate, agriculture, healthcare, construction, finance'
      },
      'Metal': {
        coreTraits: ['Precise', 'Disciplined', 'Analytical', 'Determined', 'Focused'],
        strengths: ['Focus', 'Efficiency', 'Quality control', 'Determination'],
        weaknesses: ['Rigidity', 'Perfectionism', 'Coldness', 'Difficulty expressing emotions'],
        motivations: ['Excellence', 'Achievement', 'Order and structure'],
        behavioralPatterns: ['Systematic approach', 'Values precision', 'Prefers structure'],
        communication: 'Clear and structured, often concise and direct',
        relationships: 'Loyal but reserved, values quality over quantity',
        career: 'Thrives in finance, law, engineering, technology, quality control'
      },
      'Water': {
        coreTraits: ['Adaptable', 'Intuitive', 'Wise', 'Flexible', 'Reflective'],
        strengths: ['Intelligence', 'Adaptability', 'Insight', 'Wisdom'],
        weaknesses: ['Indecisiveness', 'Emotional sensitivity', 'Isolation', 'Tendency to overthink'],
        motivations: ['Understanding', 'Wisdom', 'Deep connections', 'Exploration'],
        behavioralPatterns: ['Reflective', 'Adapts to situations', 'Values knowledge'],
        communication: 'Thoughtful and diplomatic, often indirect',
        relationships: 'Deep and meaningful, values emotional depth',
        career: 'Suited for research, consulting, travel, shipping, philosophy, psychology'
      }
    }
    
    return personalityData[dayElement] || personalityData['Earth']
  }

  /**
   * Generate career analysis
   */
  private analyzeCareer(chart: BaziChart, dayMaster: DayMasterAnalysis, elements: BaziElements): CareerAnalysis {
    const dayElement = dayMaster.element
    
    const careerData: { [key: string]: CareerAnalysis } = {
      'Wood': {
        suitablePaths: ['Education', 'Publishing', 'Environmental Science', 'Agriculture', 'Leadership'],
        favorableIndustries: ['Education', 'Media', 'Non-profit', 'Environmental', 'Consulting'],
        jobRoles: ['Teacher', 'Writer', 'Environmental Consultant', 'Manager', 'Researcher'],
        financialPotential: 'Moderate to high, grows steadily over time',
        careerTiming: ['Ages 24-30: Foundation building', 'Ages 36-42: Leadership opportunities', 'Ages 48-54: Peak influence'],
        challenges: ['Avoid overextension', 'Balance idealism with practicality', 'Develop patience']
      },
      'Fire': {
        suitablePaths: ['Entertainment', 'Sales', 'Public Relations', 'Marketing', 'Performing Arts'],
        favorableIndustries: ['Media', 'Entertainment', 'Retail', 'Hospitality', 'Creative'],
        jobRoles: ['Sales Manager', 'Marketing Director', 'Performer', 'Event Planner', 'Public Speaker'],
        financialPotential: 'Variable, can be high with right opportunities',
        careerTiming: ['Ages 22-28: Passion projects', 'Ages 34-40: Creative peak', 'Ages 46-52: Influence expansion'],
        challenges: ['Manage energy levels', 'Avoid burnout', 'Develop long-term planning']
      },
      'Earth': {
        suitablePaths: ['Real Estate', 'Agriculture', 'Healthcare', 'Construction', 'Finance'],
        favorableIndustries: ['Real Estate', 'Healthcare', 'Construction', 'Banking', 'Food'],
        jobRoles: ['Real Estate Agent', 'Healthcare Professional', 'Project Manager', 'Accountant', 'Farmer'],
        financialPotential: 'Stable and consistent, builds gradually',
        careerTiming: ['Ages 26-32: Career stability', 'Ages 38-44: Achievement peak', 'Ages 50-56: Recognition phase'],
        challenges: ['Embrace change when needed', 'Avoid excessive caution', 'Develop flexibility']
      },
      'Metal': {
        suitablePaths: ['Finance', 'Law', 'Engineering', 'Technology', 'Quality Control'],
        favorableIndustries: ['Banking', 'Legal', 'Technology', 'Manufacturing', 'Precision'],
        jobRoles: ['Financial Analyst', 'Lawyer', 'Engineer', 'Quality Manager', 'Data Analyst'],
        financialPotential: 'High, through precision and expertise',
        careerTiming: ['Ages 28-34: Skill mastery', 'Ages 40-46: Precision peak', 'Ages 52-58: Teaching phase'],
        challenges: ['Develop emotional intelligence', 'Avoid excessive rigidity', 'Balance work and life']
      },
      'Water': {
        suitablePaths: ['Research', 'Consulting', 'Travel', 'Shipping', 'Philosophy'],
        favorableIndustries: ['Research', 'Consulting', 'Travel', 'Shipping', 'Education'],
        jobRoles: ['Researcher', 'Consultant', 'Travel Agent', 'Philosopher', 'Psychologist'],
        financialPotential: 'Variable, depends on specialization',
        careerTiming: ['Ages 30-36: Wisdom development', 'Ages 42-48: Insight peak', 'Ages 54-60: Guidance phase'],
        challenges: ['Make decisions confidently', 'Avoid overthinking', 'Develop assertiveness']
      }
    }
    
    return careerData[dayElement] || careerData['Earth']
  }

  /**
   * Generate wealth analysis
   */
  private analyzeWealth(chart: BaziChart, dayMaster: DayMasterAnalysis): WealthAnalysis {
    const dayElement = dayMaster.element
    
    const wealthData: { [key: string]: WealthAnalysis } = {
      'Wood': {
        wealthPattern: 'Steady growth through investments and career development',
        incomeSources: ['Career advancement', 'Investments', 'Consulting', 'Education-related'],
        investmentAdvice: ['Long-term investments', 'Real estate', 'Education funds', 'Sustainable businesses'],
        favorablePeriods: ['Wood and Water years', 'Spring seasons', 'Ages 30-50'],
        cautionaryPeriods: ['Metal years (may face challenges)', 'Overextension periods']
      },
      'Fire': {
        wealthPattern: 'Variable income with potential for high peaks',
        incomeSources: ['Sales commissions', 'Creative projects', 'Public appearances', 'Entrepreneurship'],
        investmentAdvice: ['Diversified portfolio', 'Creative ventures', 'Social media businesses', 'Entertainment industry'],
        favorablePeriods: ['Fire and Wood years', 'Summer seasons', 'Ages 25-45'],
        cautionaryPeriods: ['Water years (may face setbacks)', 'Burnout periods']
      },
      'Earth': {
        wealthPattern: 'Stable and consistent accumulation',
        incomeSources: ['Real estate', 'Traditional businesses', 'Healthcare', 'Agriculture'],
        investmentAdvice: ['Real estate', 'Stable stocks', 'Property investments', 'Traditional businesses'],
        favorablePeriods: ['Earth and Fire years', 'Late summer/early fall', 'Ages 35-55'],
        cautionaryPeriods: ['Wood years (may face challenges)', 'Stagnation periods']
      },
      'Metal': {
        wealthPattern: 'Accumulation through expertise and precision',
        incomeSources: ['Professional services', 'Finance', 'Technology', 'Precision work'],
        investmentAdvice: ['Precious metals', 'Technology stocks', 'Financial instruments', 'Quality investments'],
        favorablePeriods: ['Metal and Earth years', 'Fall seasons', 'Ages 40-60'],
        cautionaryPeriods: ['Fire years (may face challenges)', 'Over-perfectionism periods']
      },
      'Water': {
        wealthPattern: 'Variable, often through knowledge and consulting',
        incomeSources: ['Consulting', 'Research', 'Travel-related', 'Intellectual property'],
        investmentAdvice: ['Diversified portfolio', 'International investments', 'Research-based', 'Flexible investments'],
        favorablePeriods: ['Water and Metal years', 'Winter seasons', 'Ages 35-55'],
        cautionaryPeriods: ['Earth years (may face challenges)', 'Indecision periods']
      }
    }
    
    return wealthData[dayElement] || wealthData['Earth']
  }

  /**
   * Generate relationship analysis
   */
  private analyzeRelationships(chart: BaziChart, dayMaster: DayMasterAnalysis): RelationshipAnalysis {
    const dayElement = dayMaster.element
    
    const relationshipData: { [key: string]: RelationshipAnalysis } = {
      'Wood': {
        interpersonalDynamics: 'Growth-oriented relationships, values mutual development',
        compatibility: {
          bestElements: ['Water', 'Fire'],
          challengingElements: ['Metal', 'Earth']
        },
        partnershipAdvice: ['Seek partners who support growth', 'Avoid overly rigid partners', 'Value independence'],
        familyRelationships: 'Protective and nurturing, values family traditions'
      },
      'Fire': {
        interpersonalDynamics: 'Passionate and expressive, needs emotional connection',
        compatibility: {
          bestElements: ['Wood', 'Earth'],
          challengingElements: ['Water', 'Metal']
        },
        partnershipAdvice: ['Seek partners who appreciate passion', 'Avoid overly reserved partners', 'Value emotional expression'],
        familyRelationships: 'Warm and expressive, creates lively family atmosphere'
      },
      'Earth': {
        interpersonalDynamics: 'Stable and dependable, values long-term commitment',
        compatibility: {
          bestElements: ['Fire', 'Metal'],
          challengingElements: ['Wood', 'Water']
        },
        partnershipAdvice: ['Seek partners who value stability', 'Avoid overly impulsive partners', 'Value commitment'],
        familyRelationships: 'Nurturing and supportive, creates stable family foundation'
      },
      'Metal': {
        interpersonalDynamics: 'Reserved but loyal, values quality over quantity',
        compatibility: {
          bestElements: ['Earth', 'Water'],
          challengingElements: ['Fire', 'Wood']
        },
        partnershipAdvice: ['Seek partners who appreciate precision', 'Avoid overly emotional partners', 'Value quality connections'],
        familyRelationships: 'Loyal and structured, values family traditions and order'
      },
      'Water': {
        interpersonalDynamics: 'Deep and meaningful, values emotional depth',
        compatibility: {
          bestElements: ['Metal', 'Wood'],
          challengingElements: ['Earth', 'Fire']
        },
        partnershipAdvice: ['Seek partners who value depth', 'Avoid overly superficial partners', 'Value emotional connection'],
        familyRelationships: 'Intuitive and understanding, creates harmonious family environment'
      }
    }
    
    return relationshipData[dayElement] || relationshipData['Earth']
  }

  /**
   * Generate health analysis
   */
  private analyzeHealth(chart: BaziChart, dayMaster: DayMasterAnalysis, elements: BaziElements): HealthAnalysis {
    const dayElement = dayMaster.element
    
    const healthData: { [key: string]: HealthAnalysis } = {
      'Wood': {
        constitution: 'Strong liver and gallbladder, benefits from regular exercise',
        healthTrends: ['Generally good energy', 'May experience stress-related issues', 'Benefits from outdoor activities'],
        vulnerableAreas: ['Liver', 'Gallbladder', 'Eyes', 'Tendons'],
        wellnessAdvice: ['Regular exercise', 'Time in nature', 'Stress management', 'Adequate rest'],
        favorablePractices: ['Yoga', 'Walking', 'Green foods', 'Spring cleaning']
      },
      'Fire': {
        constitution: 'Strong heart and small intestine, needs energy management',
        healthTrends: ['High energy levels', 'May experience burnout', 'Benefits from cooling activities'],
        vulnerableAreas: ['Heart', 'Small Intestine', 'Circulatory System', 'Emotional balance'],
        wellnessAdvice: ['Energy management', 'Cooling foods', 'Meditation', 'Adequate hydration'],
        favorablePractices: ['Meditation', 'Swimming', 'Red foods in moderation', 'Emotional balance']
      },
      'Earth': {
        constitution: 'Strong spleen and stomach, benefits from regular routine',
        healthTrends: ['Stable health', 'May experience digestive issues', 'Benefits from regular meals'],
        vulnerableAreas: ['Spleen', 'Stomach', 'Digestive System', 'Muscles'],
        wellnessAdvice: ['Regular meals', 'Digestive health', 'Grounding exercises', 'Moderate exercise'],
        favorablePractices: ['Regular routine', 'Yellow/brown foods', 'Walking', 'Stability practices']
      },
      'Metal': {
        constitution: 'Strong lungs and large intestine, needs respiratory care',
        healthTrends: ['Generally good', 'May experience respiratory issues', 'Benefits from fresh air'],
        vulnerableAreas: ['Lungs', 'Large Intestine', 'Skin', 'Respiratory System'],
        wellnessAdvice: ['Fresh air', 'Respiratory exercises', 'Skin care', 'Precision in health practices'],
        favorablePractices: ['Breathing exercises', 'White foods', 'Clean environments', 'Discipline in health']
      },
      'Water': {
        constitution: 'Strong kidneys and bladder, needs kidney support',
        healthTrends: ['Variable energy', 'May experience kidney issues', 'Benefits from hydration'],
        vulnerableAreas: ['Kidneys', 'Bladder', 'Bones', 'Ears'],
        wellnessAdvice: ['Adequate hydration', 'Kidney support', 'Rest', 'Warmth'],
        favorablePractices: ['Water activities', 'Blue/black foods', 'Rest', 'Fluid balance']
      }
    }
    
    return healthData[dayElement] || healthData['Earth']
  }

  /**
   * Generate luck cycles with annual breakdown
   */
  private generateLuckCycles(chart: BaziChart, birthYear: number): LuckCycle[] {
    const cycles: LuckCycle[] = []
    
    chart.luckPillars.forEach((pillar, index) => {
      const annualBreakdown: AnnualInfluence[] = []
      
      // Generate annual influences for each year in the cycle
      for (let year = 0; year < 10; year++) {
        const cycleYear = birthYear + pillar.startAge + year
        const yearStemIndex = (cycleYear - 4) % 10
        const yearBranchIndex = (cycleYear - 4) % 12
        
        const yearElement = HEAVENLY_STEM_ELEMENTS[HEAVENLY_STEMS[yearStemIndex]]
        const yearAnimal = EARTHLY_BRANCH_ANIMALS[yearBranchIndex]
        
        // Determine rating based on element compatibility
        const rating = this.getYearRating(pillar.heavenlyStem.element, yearElement)
        
        annualBreakdown.push({
          year: cycleYear,
          element: yearElement,
          animal: yearAnimal,
          influence: this.getYearInfluence(yearElement, pillar.heavenlyStem.element),
          rating
        })
      }
      
      cycles.push({
        cycleNumber: index + 1,
        startAge: pillar.startAge,
        endAge: pillar.endAge,
        heavenlyStem: pillar.heavenlyStem.name,
        earthlyBranch: pillar.earthlyBranch.name,
        element: pillar.heavenlyStem.element,
        animal: pillar.earthlyBranch.animal,
        overallInfluence: pillar.influence,
        opportunities: pillar.opportunities,
        challenges: pillar.challenges,
        annualBreakdown
      })
    })
    
    return cycles
  }

  private getYearRating(pillarElement: string, yearElement: string): AnnualInfluence['rating'] {
    // Production cycle: favorable
    const productionCycle: { [key: string]: string } = {
      'Wood': 'Water',
      'Fire': 'Wood',
      'Earth': 'Fire',
      'Metal': 'Earth',
      'Water': 'Metal'
    }
    
    // Destruction cycle: challenging
    const destructionCycle: { [key: string]: string } = {
      'Wood': 'Metal',
      'Fire': 'Water',
      'Earth': 'Wood',
      'Metal': 'Fire',
      'Water': 'Earth'
    }
    
    if (productionCycle[pillarElement] === yearElement || pillarElement === yearElement) {
      return 'very-favorable'
    } else if (destructionCycle[pillarElement] === yearElement) {
      return 'very-challenging'
    } else {
      return 'neutral'
    }
  }

  private getYearInfluence(yearElement: string, pillarElement: string): string {
    const influences: { [key: string]: string } = {
      'Wood': 'Growth and expansion',
      'Fire': 'Passion and transformation',
      'Earth': 'Stability and grounding',
      'Metal': 'Precision and refinement',
      'Water': 'Wisdom and flow'
    }
    
    return influences[yearElement] || 'General influence'
  }

  /**
   * Get favorable elements, colors, directions, numbers
   */
  private getFavorableItems(dayMaster: DayMasterAnalysis): BaziReading['favorable'] {
    const dayElement = dayMaster.element
    
    const favorableData: { [key: string]: BaziReading['favorable'] } = {
      'Wood': {
        elements: ['Water', 'Wood'],
        colors: ['Green', 'Blue', 'Black'],
        directions: ['East', 'Southeast'],
        numbers: ['3', '4', '8'],
        seasons: ['Spring']
      },
      'Fire': {
        elements: ['Wood', 'Fire'],
        colors: ['Red', 'Orange', 'Pink'],
        directions: ['South'],
        numbers: ['2', '7', '9'],
        seasons: ['Summer']
      },
      'Earth': {
        elements: ['Fire', 'Earth'],
        colors: ['Yellow', 'Brown', 'Beige'],
        directions: ['Center', 'Northeast', 'Southwest'],
        numbers: ['5', '8', '0'],
        seasons: ['Late Summer']
      },
      'Metal': {
        elements: ['Earth', 'Metal'],
        colors: ['White', 'Silver', 'Gold'],
        directions: ['West', 'Northwest'],
        numbers: ['6', '7', '9'],
        seasons: ['Autumn']
      },
      'Water': {
        elements: ['Metal', 'Water'],
        colors: ['Blue', 'Black', 'Dark Blue'],
        directions: ['North'],
        numbers: ['1', '6', '8'],
        seasons: ['Winter']
      }
    }
    
    return favorableData[dayElement] || favorableData['Earth']
  }

  /**
   * Generate recommendations and remedies
   */
  private generateRecommendations(chart: BaziChart, dayMaster: DayMasterAnalysis, elements: BaziElements): {
    recommendations: string[]
    remedies: string[]
  } {
    const dayElement = dayMaster.element
    const recommendations: string[] = []
    const remedies: string[] = []
    
    // Element balance recommendations
    const elementCounts = Object.entries(elements)
    const maxElement = elementCounts.reduce((a, b) => elements[a[0] as keyof BaziElements] > elements[b[0] as keyof BaziElements] ? a : b)[0]
    const minElement = elementCounts.reduce((a, b) => elements[a[0] as keyof BaziElements] < elements[b[0] as keyof BaziElements] ? a : b)[0]
    
    if (maxElement !== dayElement.toLowerCase()) {
      recommendations.push(`Strengthen ${dayElement} element through favorable activities`)
    }
    
    if (minElement && elements[minElement as keyof BaziElements] < 1) {
      recommendations.push(`Balance chart by incorporating ${minElement} element`)
    }
    
    // Day Master specific recommendations
    recommendations.push(`Focus on ${dayMaster.favorableElements.join(' and ')} elements for support`)
    recommendations.push(`Be cautious during ${dayMaster.unfavorableElements.join(' and ')} element periods`)
    
    // Remedies based on element
    const elementRemedies: { [key: string]: string[] } = {
      'Wood': [
        'Wear green, blue, or black colors',
        'Spend time in nature regularly',
        'Practice growth mindset and learning',
        'Use wooden objects in living space',
        'Meditate in natural settings'
      ],
      'Fire': [
        'Wear red, orange, or pink colors',
        'Engage in creative activities',
        'Practice passion and enthusiasm',
        'Use candles or fire elements',
        'Maintain social connections'
      ],
      'Earth': [
        'Wear yellow, brown, or beige colors',
        'Practice grounding exercises',
        'Maintain stability and routine',
        'Use earth elements in decor',
        'Spend time in gardens or nature'
      ],
      'Metal': [
        'Wear white, silver, or gold colors',
        'Practice precision and discipline',
        'Use metal objects in environment',
        'Maintain clean and organized spaces',
        'Focus on quality over quantity'
      ],
      'Water': [
        'Wear blue, black, or dark blue colors',
        'Engage in water activities',
        'Practice flow and adaptability',
        'Use water features in environment',
        'Maintain adequate hydration'
      ]
    }
    
    remedies.push(...(elementRemedies[dayElement] || []))
    remedies.push('Meditation and mindfulness practices')
    remedies.push('Balanced diet aligned with element')
    remedies.push('Regular exercise appropriate for constitution')
    
    return { recommendations, remedies }
  }

  /**
   * Main analysis function
   */
  async analyzeBazi(data: BaziData): Promise<BaziReading> {
    const cacheKey = `${data.birthDate}-${data.birthTime}-${data.birthPlace}`
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!
    }

    const reading = await this.calculateBazi(data)
    this.cache.set(cacheKey, reading)
    
    return reading
  }

  /**
   * Calculate comprehensive BaZi reading
   */
  private async calculateBazi(data: BaziData): Promise<BaziReading> {
    const chart = this.calculateChart(data)
    const elements = this.calculateElements(chart)
    const dayMaster = this.analyzeDayMaster(chart, elements)
    const personality = this.analyzePersonality(chart, dayMaster)
    const career = this.analyzeCareer(chart, dayMaster, elements)
    const wealth = this.analyzeWealth(chart, dayMaster)
    const relationships = this.analyzeRelationships(chart, dayMaster)
    const health = this.analyzeHealth(chart, dayMaster, elements)
    const luckCycles = this.generateLuckCycles(chart, new Date(data.birthDate).getFullYear())
    const favorable = this.getFavorableItems(dayMaster)
    const { recommendations, remedies } = this.generateRecommendations(chart, dayMaster, elements)

    return {
      chart,
      elements,
      dayMaster,
      personality,
      career,
      wealth,
      relationships,
      health,
      luckCycles,
      favorable,
      recommendations,
      remedies,
      metadata: {
        calculationMethod: 'Four Pillars of Destiny (BaZi)',
        system: 'Hsia Calendar with Solar Terms',
        lastUpdated: new Date(),
        cacheVersion: CACHE_VERSION
      }
    }
  }

  /**
   * Get BaZi reading for user (with Firebase caching)
   */
  async getBaziReading(userId: string, userProfile: BaziProfileInput): Promise<BaziReading> {
    if (!userProfile.birthDate || !userProfile.birthTime || !userProfile.birthPlace) {
      throw new Error('Complete birth information required for BaZi analysis')
    }

    // Use provided coordinates when available (e.g. from API route); otherwise resolve via geocoding
    const hasCoords =
      typeof userProfile.birthLatitude === 'number' &&
      typeof userProfile.birthLongitude === 'number'
    const coords = hasCoords
      ? {
          latitude: userProfile.birthLatitude,
          longitude: userProfile.birthLongitude
        }
      : await getCoordinatesWithFallback(userProfile.birthPlace)

    const baziData: BaziData = {
      birthDate: userProfile.birthDate,
      birthTime: userProfile.birthTime,
      birthPlace: userProfile.birthPlace,
      latitude: coords.latitude,
      longitude: coords.longitude,
      gender: userProfile.gender
    }

    // On the server (e.g. API route / orchestrator), skip Firebase client SDK cache to avoid "client function from server" errors
    if (typeof window === 'undefined') {
      return await this.analyzeBazi(baziData)
    }

    // Client: use Firebase cache when available
    try {
      const db = getFirebaseDB()
      if (db) {
        const { doc, getDoc, setDoc } = await import('firebase/firestore')
        const birthDataKey = `${userProfile.birthDate}_${userProfile.birthTime}_${userProfile.birthPlace}`
        const cacheDocRef = doc(db, 'users', userId, 'baziReports', 'current')
        const docSnap = await getDoc(cacheDocRef)
        
        if (docSnap.exists()) {
          const cachedData = docSnap.data() as BaziReading
          const cachedBirthKey = cachedData.metadata?.lastUpdated ? 
            `${userProfile.birthDate}_${userProfile.birthTime}_${userProfile.birthPlace}` : null
          
          if (cachedBirthKey === birthDataKey) {
            const lastUpdated = cachedData.metadata?.lastUpdated
            if (lastUpdated) {
              const cacheAge = new Date().getTime() - new Date(lastUpdated).getTime()
              if (cacheAge < CACHE_TTL.REPORTS) {
                devLog.info('Returning cached BaZi reading for user:', userId, 'bazi')
                return cachedData
              }
            }
          }
        }
        
        const reading = await this.analyzeBazi(baziData)
        await setDoc(cacheDocRef, {
          ...reading,
          birthDataKey,
          lastUpdated: new Date()
        })
        devLog.info('Cached BaZi reading for user:', userId, 'bazi')
        return reading
      }
    } catch (error) {
      devWarn('Error with Firebase cache, using in-memory:', error)
    }

    return await this.analyzeBazi(baziData)
  }

  async answerQuestion(reading: BaziReading, question: BaziQuestion): Promise<BaziAnswer> {
    const dayElement = reading.dayMaster.element
    const category = question.category
    
    const answers: { [key: string]: any } = {
      'career': {
        answer: `Based on ${dayElement} day master, career opportunities in ${reading.career.favorableIndustries.join(', ')} are favorable. Your chart shows strength in ${reading.career.suitablePaths.join(' and ')} paths.`,
        timing: 'Within 6-12 months, especially during favorable element periods',
        elements: reading.dayMaster.favorableElements,
        advice: (reading.career as { recommendations?: string[] }).recommendations || ['Focus on your strengths', 'Network with compatible elements', 'Develop relevant skills']
      },
      'relationships': {
        answer: `Your ${dayElement} nature is most compatible with ${reading.relationships.compatibility.bestElements.join(' and ')} elements. ${reading.relationships.interpersonalDynamics}`,
        timing: 'Within 3-6 months, during favorable periods',
        elements: reading.relationships.compatibility.bestElements,
        advice: reading.relationships.partnershipAdvice || ['Be authentic to your nature', 'Seek complementary partners', 'Practice patience']
      },
      'health': {
        answer: `Your ${dayElement} constitution benefits from ${reading.health.favorablePractices.join(', ')}. ${reading.health.constitution}`,
        timing: 'Ongoing improvement through consistent practices',
        elements: reading.dayMaster.favorableElements,
        advice: reading.health.wellnessAdvice || ['Maintain element balance', 'Follow seasonal rhythms', 'Practice stress management']
      },
      'wealth': {
        answer: `Wealth building for ${dayElement} individuals follows the pattern: ${reading.wealth.wealthPattern}. Favorable income sources include ${reading.wealth.incomeSources.join(', ')}.`,
        timing: 'Within 1-2 years, during favorable periods',
        elements: reading.dayMaster.favorableElements,
        advice: reading.wealth.investmentAdvice || ['Invest in compatible industries', 'Build stable foundations', 'Practice financial discipline']
      },
      'general': {
        answer: `Your ${dayElement} day master indicates a period of ${reading.luckCycles[0]?.overallInfluence || 'general influence'}. Focus on ${reading.recommendations[0] || 'maintaining balance'}.`,
        timing: 'Current cycle focus',
        elements: reading.dayMaster.favorableElements,
        advice: reading.recommendations.slice(0, 3) || ['Embrace current opportunities', 'Work with natural cycles', 'Maintain balance']
      }
    }

    const response = answers[category] || answers['general']
    
    return {
      question: question.question,
      answer: response.answer,
      timing: response.timing,
      elements: response.elements,
      advice: response.advice,
      confidence: 85
    }
  }

  getSystemStatus() {
    return {
      status: 'operational',
      accuracy: 94,
      lastUpdate: new Date().toISOString(),
      features: [
        'Four Pillars Calculation',
        'Element Analysis',
        'Day Master Analysis',
        'Life Path Prediction',
        'Compatibility Analysis',
        'Luck Cycles (Da Yun)',
        'Career & Wealth Analysis',
        'Health Analysis'
      ]
    }
  }
}

export const baziIntelligence = new BaziIntelligence()
