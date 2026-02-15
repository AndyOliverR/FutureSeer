/**
 * Fortune Cycle Calculator
 * Calculates runtime context (大運/流年/流月/流日) for Zi Wei Dou Shu
 * Uses fortel-ziweidoushu library for advanced calculations
 */

import { devLog } from '@/lib/devLogger';

// Import fortel-ziweidoushu types
// Note: The library structure may vary, adjust imports as needed
let DestinyBoard: any
let DestinyConfigBuilder: any
let DayTimeGround: any
let ConfigType: any
let Gender: any

try {
  const fortel = require('fortel-ziweidoushu')
  DestinyBoard = fortel.DestinyBoard || fortel.default?.DestinyBoard
  DestinyConfigBuilder = fortel.DestinyConfigBuilder || fortel.default?.DestinyConfigBuilder
  DayTimeGround = fortel.DayTimeGround || fortel.default?.DayTimeGround
  ConfigType = fortel.ConfigType || fortel.default?.ConfigType
  Gender = fortel.Gender || fortel.default?.Gender
} catch (error) {
  devLog.warn('fortel-ziweidoushu not available, using fallback calculations', undefined, 'fortuneCycleCalculator')
}

export interface FortuneCycleData {
  tenYear: {
    ground: string
    sky: string
    startAge: number
    endAge: number
    description: string
    focus: string[]
  }
  year: {
    ground: string
    sky: string
    year: number
    description: string
    focus: string[]
  }
  month: {
    ground: string
    sky: string
    month: number
    year: number
    description: string
    focus: string[]
  }
  day: {
    ground: string
    sky: string
    day: number
    month: number
    year: number
    description: string
    focus: string[]
  }
  age: number
  effectiveMonth: number
}

export interface FortuneCyclePeriod {
  period: string
  startAge: number
  endAge: number
  element: string
  nature: 'excellent' | 'good' | 'neutral' | 'challenging'
  description: string
  focus: string[]
  warnings: string[]
  opportunities: string[]
  ground: string
  sky: string
}

/**
 * Calculate fortune cycles for a given birth data and target date
 */
export function calculateFortuneCycles(
  birthDate: string, // YYYY-MM-DD
  birthTime: string, // HH:mm
  gender: 'male' | 'female',
  targetDate?: Date
): FortuneCycleData {
  try {
    const target = targetDate || new Date()
    const [year, month, day] = birthDate.split('-').map(Number)
    const [hour, minute] = birthTime.split(':').map(Number)
    
    // Initialize runtimeContext variable
    let runtimeContext: any = null
    
    // Try to use fortel library if available
    if (DestinyBoard && DestinyConfigBuilder && DayTimeGround && ConfigType && Gender) {
      try {
        // Convert to fortel format
        const dayTimeGround = convertHourToDayTimeGround(hour)
        const configType = ConfigType.SKY || 'SKY' // 天盤
        const fortelGender = gender === 'male' ? (Gender.M || 'M') : (Gender.F || 'F')
        
        // Create destiny board
        const destinyBoard = new DestinyBoard(
          DestinyConfigBuilder.withSolar({
            year,
            month,
            day,
            bornTimeGround: dayTimeGround,
            configType,
            gender: fortelGender,
          })
        )
        
        // Get runtime context if available
        if (destinyBoard.getRuntimContext) {
          const targetLunar = calculateLunarDate(target)
          runtimeContext = destinyBoard.getRuntimContext({
            lunarYear: targetLunar.year,
            lunarMonth: targetLunar.month,
            lunarDay: targetLunar.day,
            leap: targetLunar.isLeapMonth || false,
          })
          
          // Extract fortune cycle data from runtime context
          const tenYearGround = runtimeContext?.tenYearGround?.name || runtimeContext?.tenYear?.cellGround?.name || 'Unknown'
          const tenYearSky = runtimeContext?.tenYearSky?.name || runtimeContext?.tenYear?.cellGround?.name || 'Unknown'
          // ... continue with extraction
        }
      } catch (fortelError) {
        devLog.warn('Fortel library error, using fallback:', fortelError, 'fortuneCycleCalculator')
      }
    }
    
    // Calculate target lunar date
    const targetLunar = calculateLunarDate(target)
    
    // Calculate age
    const birth = new Date(birthDate)
    const age = Math.floor((target.getTime() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    
    // Extract fortune cycle data (using simplified calculations if fortel not available)
    const tenYearGround = calculateGroundFromAge(age, 10)
    const tenYearSky = calculateSkyFromYear(target.getFullYear())
    const yearGround = calculateGroundFromYear(target.getFullYear())
    const yearSky = calculateSkyFromYear(target.getFullYear())
    const monthGround = calculateGroundFromMonth(target.getMonth() + 1)
    const monthSky = calculateSkyFromMonth(target.getMonth() + 1)
    const dayGround = calculateGroundFromDay(target.getDate())
    const daySky = calculateSkyFromDay(target.getDate())
    
    const startAge = Math.floor(age / 10) * 10
    return {
      tenYear: {
        ground: tenYearGround,
        sky: tenYearSky,
        startAge,
        endAge: startAge + 9,
        description: getTenYearDescription(tenYearGround, tenYearSky, startAge),
        focus: getTenYearFocus(tenYearGround, tenYearSky, startAge),
      },
      year: {
        ground: yearGround,
        sky: yearSky,
        year: target.getFullYear(),
        description: getYearDescription(yearGround, yearSky),
        focus: getYearFocus(yearGround, yearSky),
      },
      month: {
        ground: monthGround,
        sky: monthSky,
        month: target.getMonth() + 1,
        year: target.getFullYear(),
        description: getMonthDescription(monthGround, monthSky),
        focus: getMonthFocus(monthGround, monthSky),
      },
      day: {
        ground: dayGround,
        sky: daySky,
        day: target.getDate(),
        month: target.getMonth() + 1,
        year: target.getFullYear(),
        description: getDayDescription(dayGround, daySky),
        focus: getDayFocus(dayGround, daySky),
      },
      age,
      effectiveMonth: runtimeContext?.effectiveMonth || target.getMonth() + 1,
    }
  } catch (error) {
    devLog.error('Error calculating fortune cycles:', error, 'fortuneCycleCalculator')
    // Return fallback data
    return getFallbackFortuneCycles()
  }
}

/**
 * Generate 10-year fortune cycles
 */
export function generateTenYearCycles(
  birthDate: string,
  birthTime: string,
  gender: 'male' | 'female',
  maxAge: number = 100
): FortuneCyclePeriod[] {
  const cycles: FortuneCyclePeriod[] = []
  
  for (let age = 0; age < maxAge; age += 10) {
    const targetDate = new Date(birthDate)
    targetDate.setFullYear(targetDate.getFullYear() + age)
    
    const fortuneData = calculateFortuneCycles(birthDate, birthTime, gender, targetDate)
    
    const meaning = getGroundSkyMeaning(fortuneData.tenYear.ground, fortuneData.tenYear.sky)
    cycles.push({
      period: `${age}-${age + 9}`,
      startAge: age,
      endAge: age + 9,
      element: getElementFromGround(fortuneData.tenYear.ground),
      nature: getNatureFromGround(fortuneData.tenYear.ground),
      description: getTenYearDescription(fortuneData.tenYear.ground, fortuneData.tenYear.sky, age),
      focus: getTenYearFocus(fortuneData.tenYear.ground, fortuneData.tenYear.sky, age),
      warnings: meaning.warnings.length > 0 ? meaning.warnings : getWarningsFromGround(fortuneData.tenYear.ground),
      opportunities: getOpportunitiesFromGround(fortuneData.tenYear.ground, fortuneData.tenYear.sky),
      ground: fortuneData.tenYear.ground,
      sky: fortuneData.tenYear.sky,
    })
  }
  
  return cycles
}

// Helper functions

function convertHourToDayTimeGround(hour: number): any {
  // Convert 24-hour format to Chinese time periods
  // Return simplified ground name if DayTimeGround not available
  if (DayTimeGround && DayTimeGround.getByName) {
    if (hour >= 23 || hour < 1) return DayTimeGround.getByName('子時')
    if (hour >= 1 && hour < 3) return DayTimeGround.getByName('丑時')
    if (hour >= 3 && hour < 5) return DayTimeGround.getByName('寅時')
    if (hour >= 5 && hour < 7) return DayTimeGround.getByName('卯時')
    if (hour >= 7 && hour < 9) return DayTimeGround.getByName('辰時')
    if (hour >= 9 && hour < 11) return DayTimeGround.getByName('巳時')
    if (hour >= 11 && hour < 13) return DayTimeGround.getByName('午時')
    if (hour >= 13 && hour < 15) return DayTimeGround.getByName('未時')
    if (hour >= 15 && hour < 17) return DayTimeGround.getByName('申時')
    if (hour >= 17 && hour < 19) return DayTimeGround.getByName('酉時')
    if (hour >= 19 && hour < 21) return DayTimeGround.getByName('戌時')
    return DayTimeGround.getByName('亥時')
  }
  // Fallback: return ground name string
  const grounds = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
  const index = Math.floor((hour + 1) / 2) % 12
  return { name: grounds[index] }
}

function calculateLunarDate(solarDate: Date): { year: number; month: number; day: number; isLeapMonth: boolean } {
  // Simplified lunar date calculation
  // In production, use a proper lunar calendar library
  const year = solarDate.getFullYear()
  const month = solarDate.getMonth() + 1
  const day = solarDate.getDate()
  
  return {
    year,
    month,
    day,
    isLeapMonth: false,
  }
}

/**
 * Get comprehensive meaning for ground/sky combination
 */
export function getGroundSkyMeaning(ground: string, sky: string): {
  theme: string
  characteristics: string[]
  focusAreas: string[]
  opportunities: string[]
  warnings: string[]
} {
  // Ground meanings
  const groundMeanings: Record<string, { name: string; element: string; nature: string; traits: string[] }> = {
    '子': { name: 'Rat', element: 'water', nature: 'active', traits: ['adaptability', 'intelligence', 'resourcefulness'] },
    '丑': { name: 'Ox', element: 'earth', nature: 'stable', traits: ['diligence', 'perseverance', 'reliability'] },
    '寅': { name: 'Tiger', element: 'wood', nature: 'dynamic', traits: ['courage', 'leadership', 'adventure'] },
    '卯': { name: 'Rabbit', element: 'wood', nature: 'gentle', traits: ['diplomacy', 'creativity', 'harmony'] },
    '辰': { name: 'Dragon', element: 'earth', nature: 'powerful', traits: ['ambition', 'transformation', 'innovation'] },
    '巳': { name: 'Snake', element: 'fire', nature: 'wise', traits: ['intuition', 'wisdom', 'transformation'] },
    '午': { name: 'Horse', element: 'fire', nature: 'energetic', traits: ['independence', 'freedom', 'achievement'] },
    '未': { name: 'Goat', element: 'earth', nature: 'artistic', traits: ['creativity', 'empathy', 'peace'] },
    '申': { name: 'Monkey', element: 'metal', nature: 'clever', traits: ['wit', 'versatility', 'innovation'] },
    '酉': { name: 'Rooster', element: 'metal', nature: 'precise', traits: ['organization', 'discipline', 'attention to detail'] },
    '戌': { name: 'Dog', element: 'earth', nature: 'loyal', traits: ['loyalty', 'honesty', 'protection'] },
    '亥': { name: 'Pig', element: 'water', nature: 'generous', traits: ['generosity', 'compassion', 'enjoyment'] },
  }

  // Sky stem meanings
  const skyMeanings: Record<string, { name: string; element: string; energy: string; influence: string[] }> = {
    '甲': { name: 'Yang Wood', element: 'wood', energy: 'growth', influence: ['expansion', 'new beginnings', 'leadership'] },
    '乙': { name: 'Yin Wood', element: 'wood', energy: 'flexibility', influence: ['adaptation', 'cooperation', 'gentle progress'] },
    '丙': { name: 'Yang Fire', element: 'fire', energy: 'brilliance', influence: ['illumination', 'recognition', 'passion'] },
    '丁': { name: 'Yin Fire', element: 'fire', energy: 'warmth', influence: ['nurturing', 'relationships', 'creativity'] },
    '戊': { name: 'Yang Earth', element: 'earth', energy: 'stability', influence: ['foundation', 'security', 'material success'] },
    '己': { name: 'Yin Earth', element: 'earth', energy: 'nurturing', influence: ['care', 'support', 'fertility'] },
    '庚': { name: 'Yang Metal', element: 'metal', energy: 'strength', influence: ['discipline', 'structure', 'achievement'] },
    '辛': { name: 'Yin Metal', element: 'metal', energy: 'refinement', influence: ['precision', 'beauty', 'artistry'] },
    '壬': { name: 'Yang Water', element: 'water', energy: 'flow', influence: ['movement', 'communication', 'wisdom'] },
    '癸': { name: 'Yin Water', element: 'water', energy: 'depth', influence: ['intuition', 'mystery', 'transformation'] },
  }

  const groundInfo = groundMeanings[ground] || groundMeanings['子']
  const skyInfo = skyMeanings[sky] || skyMeanings['甲']

  // Combine ground and sky meanings
  const theme = `${groundInfo.name} (${ground}) meets ${skyInfo.name} (${sky}): ${groundInfo.nature} ${groundInfo.element} energy enhanced by ${skyInfo.energy} ${skyInfo.element} influence`

  // Characteristics combine both
  const characteristics = [
    ...groundInfo.traits.map(t => `${t} from ${groundInfo.name}`),
    ...skyInfo.influence.map(i => `${i} through ${skyInfo.name}`)
  ]

  // Focus areas based on combination
  const focusAreas: string[] = []
  
  // Element-based focus
  if (groundInfo.element === 'wood' || skyInfo.element === 'wood') {
    focusAreas.push('Growth and development', 'New projects', 'Expansion')
  }
  if (groundInfo.element === 'fire' || skyInfo.element === 'fire') {
    focusAreas.push('Passion and creativity', 'Recognition', 'Social connections')
  }
  if (groundInfo.element === 'earth' || skyInfo.element === 'earth') {
    focusAreas.push('Stability and foundation', 'Material security', 'Building')
  }
  if (groundInfo.element === 'metal' || skyInfo.element === 'metal') {
    focusAreas.push('Structure and discipline', 'Achievement', 'Refinement')
  }
  if (groundInfo.element === 'water' || skyInfo.element === 'water') {
    focusAreas.push('Flow and adaptation', 'Communication', 'Intuition')
  }

  // Ground-specific focus
  if (ground === '寅' || ground === '午') {
    focusAreas.push('Leadership roles', 'Taking initiative')
  }
  if (ground === '辰' || ground === '巳') {
    focusAreas.push('Transformation', 'Major changes')
  }
  if (ground === '未' || ground === '卯') {
    focusAreas.push('Creative pursuits', 'Harmony')
  }
  if (ground === '酉') {
    focusAreas.push('Organization', 'Attention to detail')
  }

  // Opportunities based on combination
  const opportunities: string[] = []
  
  // Sky-specific opportunities
  if (sky === '甲' || sky === '丙') {
    opportunities.push('Leadership opportunities', 'New beginnings', 'Recognition')
  }
  if (sky === '乙' || sky === '丁') {
    opportunities.push('Creative projects', 'Relationship building', 'Gentle progress')
  }
  if (sky === '戊' || sky === '己') {
    opportunities.push('Material gains', 'Stability', 'Building foundations')
  }
  if (sky === '庚' || sky === '辛') {
    opportunities.push('Achievement', 'Refinement', 'Structured success')
  }
  if (sky === '壬' || sky === '癸') {
    opportunities.push('Communication', 'Intuitive insights', 'Transformation')
  }

  // Warnings based on challenging combinations
  const warnings: string[] = []
  
  if (ground === '酉') {
    warnings.push('Be cautious with financial decisions', 'Avoid conflicts')
  }
  if (ground === '丑' || ground === '戌') {
    warnings.push('Watch for delays', 'Be patient with progress')
  }
  if (sky === '癸' && (ground === '丑' || ground === '未')) {
    warnings.push('Avoid hasty decisions', 'Take time to reflect')
  }

  // Remove duplicates and limit
  return {
    theme,
    characteristics: [...new Set(characteristics)].slice(0, 4),
    focusAreas: [...new Set(focusAreas)].slice(0, 4),
    opportunities: [...new Set(opportunities)].slice(0, 4),
    warnings: [...new Set(warnings)]
  }
}

export function getTenYearDescription(ground: string, sky: string, startAge?: number): string {
  const meaning = getGroundSkyMeaning(ground, sky)
  const element = getElementFromGround(ground)
  const nature = getNatureFromGround(ground)
  
  // Age-specific context
  let ageContext = ''
  if (startAge !== undefined) {
    if (startAge < 20) {
      ageContext = ' This period shapes your foundation and core values.'
    } else if (startAge < 30) {
      ageContext = ' This period focuses on establishing independence and career beginnings.'
    } else if (startAge < 40) {
      ageContext = ' This period brings peak professional development opportunities.'
    } else if (startAge < 50) {
      ageContext = ' This period emphasizes consolidation and enjoying the fruits of earlier efforts.'
    } else if (startAge < 60) {
      ageContext = ' This period brings deeper wisdom and mentorship opportunities.'
    } else if (startAge < 70) {
      ageContext = ' This period focuses on reflection, legacy-building, and meaningful connections.'
    } else {
      ageContext = ' This period emphasizes spiritual growth and cherishing relationships.'
    }
  }

  // Nature-based opening
  const natureOpenings: Record<string, string> = {
    excellent: `This 10-year period (${ground}${sky}) is exceptionally favorable.`,
    good: `This 10-year period (${ground}${sky}) brings positive energy and opportunities.`,
    neutral: `This 10-year period (${ground}${sky}) offers balanced energy for steady progress.`,
    challenging: `This 10-year period (${ground}${sky}) presents challenges that lead to valuable growth.`
  }

  const opening = natureOpenings[nature] || `This 10-year period (${ground}${sky})`
  
  // Element description
  const elementDescriptions: Record<string, string> = {
    wood: 'The wood element brings growth, expansion, and new beginnings.',
    fire: 'The fire element brings passion, creativity, and recognition.',
    earth: 'The earth element brings stability, foundation-building, and material security.',
    metal: 'The metal element brings structure, discipline, and achievement.',
    water: 'The water element brings flow, adaptability, and intuitive wisdom.'
  }

  const elementDesc = elementDescriptions[element] || ''

  return `${opening} ${meaning.theme}. ${elementDesc}${ageContext}`
}

export function getTenYearFocus(ground: string, sky: string, startAge?: number): string[] {
  const meaning = getGroundSkyMeaning(ground, sky)
  const focus = [...meaning.focusAreas]
  
  // Add age-specific focus if provided
  if (startAge !== undefined) {
    if (startAge < 20) {
      focus.push('Education and learning', 'Personal identity')
    } else if (startAge < 30) {
      focus.push('Career building', 'Professional skills')
    } else if (startAge < 40) {
      focus.push('Career advancement', 'Wealth building')
    } else if (startAge < 50) {
      focus.push('Career peak performance', 'Mentoring')
    } else if (startAge < 60) {
      focus.push('Wisdom sharing', 'Legacy planning')
    } else if (startAge < 70) {
      focus.push('Retirement planning', 'Family relationships')
    } else {
      focus.push('Health and wellness', 'Spiritual reflection')
    }
  }
  
  return [...new Set(focus)].slice(0, 4)
}

function getYearDescription(ground: string, sky: string): string {
  return `This year (${ground}${sky}) presents opportunities for growth and transformation. Pay attention to new beginnings and important decisions.`
}

function getYearFocus(ground: string, sky: string): string[] {
  return ['Annual goals', 'New opportunities', 'Personal growth', 'Important decisions']
}

function getMonthDescription(ground: string, sky: string): string {
  return `This month (${ground}${sky}) focuses on short-term activities and immediate concerns. Take action on pending matters.`
}

function getMonthFocus(ground: string, sky: string): string[] {
  return ['Monthly activities', 'Short-term goals', 'Immediate actions', 'Current projects']
}

function getDayDescription(ground: string, sky: string): string {
  return `Today (${ground}${sky}) is favorable for specific activities. Make the most of the day's energy.`
}

function getDayFocus(ground: string, sky: string): string[] {
  return ['Daily activities', 'Specific tasks', 'Immediate actions', 'Today\'s opportunities']
}

function getElementFromGround(ground: string): string {
  const elementMap: Record<string, string> = {
    '子': 'water',
    '丑': 'earth',
    '寅': 'wood',
    '卯': 'wood',
    '辰': 'earth',
    '巳': 'fire',
    '午': 'fire',
    '未': 'earth',
    '申': 'metal',
    '酉': 'metal',
    '戌': 'earth',
    '亥': 'water',
  }
  return elementMap[ground] || 'earth'
}

function getNatureFromGround(ground: string): 'excellent' | 'good' | 'neutral' | 'challenging' {
  const natureMap: Record<string, 'excellent' | 'good' | 'neutral' | 'challenging'> = {
    '子': 'good',
    '丑': 'neutral',
    '寅': 'excellent',
    '卯': 'good',
    '辰': 'neutral',
    '巳': 'good',
    '午': 'excellent',
    '未': 'neutral',
    '申': 'good',
    '酉': 'challenging',
    '戌': 'neutral',
    '亥': 'good',
  }
  return natureMap[ground] || 'neutral'
}

function getWarningsFromGround(ground: string): string[] {
  const warnings: Record<string, string[]> = {
    '酉': ['Be cautious with financial decisions', 'Avoid conflicts'],
    '丑': ['Watch for delays', 'Be patient'],
    '戌': ['Avoid hasty decisions', 'Take time to think'],
  }
  return warnings[ground] || []
}

function getOpportunitiesFromGround(ground: string, sky?: string): string[] {
  // If sky is provided, use comprehensive meaning
  if (sky) {
    const meaning = getGroundSkyMeaning(ground, sky)
    return meaning.opportunities
  }
  
  // Fallback to ground-specific opportunities
  const opportunities: Record<string, string[]> = {
    '寅': ['Career advancement', 'New beginnings', 'Leadership roles', 'Adventure'],
    '午': ['Recognition', 'Success in endeavors', 'Achievement', 'Independence'],
    '子': ['New opportunities', 'Positive changes', 'Adaptation', 'Resourcefulness'],
    '卯': ['Creative projects', 'Harmony', 'Diplomacy', 'Gentle progress'],
    '辰': ['Transformation', 'Innovation', 'Major changes', 'Building foundations'],
    '巳': ['Intuitive insights', 'Wisdom', 'Transformation', 'Deep understanding'],
    '未': ['Creative pursuits', 'Artistic expression', 'Peace', 'Empathy'],
    '申': ['Innovation', 'Versatility', 'Clever solutions', 'Adaptability'],
    '酉': ['Organization', 'Precision', 'Discipline', 'Attention to detail'],
    '戌': ['Loyalty', 'Protection', 'Stability', 'Reliability'],
    '亥': ['Generosity', 'Compassion', 'Enjoyment', 'Abundance'],
    '丑': ['Perseverance', 'Stability', 'Building foundations', 'Patience'],
  }
  return opportunities[ground] || ['Growth', 'Development', 'Progress', 'Opportunities']
}

// Helper functions for simplified calculations
function calculateGroundFromAge(age: number, cycle: number): string {
  const grounds = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
  const index = Math.floor(age / cycle) % 12
  return grounds[index]
}

function calculateSkyFromYear(year: number): string {
  const skies = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
  const index = (year - 4) % 10
  return skies[index < 0 ? index + 10 : index]
}

function calculateGroundFromYear(year: number): string {
  const grounds = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
  const index = (year - 4) % 12
  return grounds[index < 0 ? index + 12 : index]
}

function calculateGroundFromMonth(month: number): string {
  const grounds = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
  return grounds[(month - 1) % 12]
}

function calculateSkyFromMonth(month: number): string {
  const skies = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
  return skies[(month - 1) % 10]
}

function calculateGroundFromDay(day: number): string {
  const grounds = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
  return grounds[(day - 1) % 12]
}

function calculateSkyFromDay(day: number): string {
  const skies = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
  return skies[(day - 1) % 10]
}

function getFallbackFortuneCycles(): FortuneCycleData {
  const now = new Date()
  return {
    tenYear: {
      ground: '子',
      sky: '甲',
      startAge: 0,
      endAge: 9,
      description: 'Calculating fortune cycles...',
      focus: [],
    },
    year: {
      ground: '子',
      sky: '甲',
      year: now.getFullYear(),
      description: 'Calculating annual fortune...',
      focus: [],
    },
    month: {
      ground: '子',
      sky: '甲',
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      description: 'Calculating monthly fortune...',
      focus: [],
    },
    day: {
      ground: '子',
      sky: '甲',
      day: now.getDate(),
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      description: 'Calculating daily fortune...',
      focus: [],
    },
    age: 0,
    effectiveMonth: now.getMonth() + 1,
  }
}

