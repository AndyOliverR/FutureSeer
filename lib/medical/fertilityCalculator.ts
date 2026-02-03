// Dr. Eugen Jonas Fertility Calendar Calculator
// Based on lunar phase methods and astrological timing for conception

import { calculateJulianDay } from '../astroCalculations'

/**
 * Calculate lunar phase based on date
 * Returns: 'new', 'waxing', 'full', or 'waning'
 */
function getLunarPhase(date: Date): string {
  const lunarCycleDays = 29.53058867
  const knownNewMoon = new Date(2000, 0, 6) // Jan 6, 2000 - known new moon
  const daysSinceKnown = Math.floor((date.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24))
  const lunarAge = daysSinceKnown % lunarCycleDays
  
  if (lunarAge < 1.84566) return 'new'
  if (lunarAge < 7.38264) return 'waxing'
  if (lunarAge < 14.76529) return 'full'
  if (lunarAge < 22.14793) return 'waning'
  return 'new'
}

export interface FertileWindow {
  date: string
  type: 'optimal' | 'fertile' | 'neutral' | 'avoid'
  lunarPhase: string
  genderPrediction?: 'male' | 'female'
  confidence: number
  description: string
  astrologicalFactors: string[]
}

export interface FertilityCalendar {
  month: number
  year: number
  fertileWindows: FertileWindow[]
  lunarPhaseTiming: {
    newMoon: string[]
    waxing: string[]
    fullMoon: string[]
    waning: string[]
  }
  genderPredictionWindows: {
    male: string[]
    female: string[]
  }
  optimalConceptionDates: string[]
}

/**
 * Calculate fertile windows based on natal Sun-Moon angle
 * Dr. Eugen Jonas method: Monthly recurrence of fertile periods
 */
export function calculateFertileWindows(
  natalDate: string,
  month: number,
  year: number
): FertileWindow[] {
  const windows: FertileWindow[] = []
  
  // Parse natal date to get Sun-Moon angle
  const natalDateObj = new Date(natalDate)
  const daysInMonth = new Date(year, month, 0).getDate()

  // Calculate natal Sun-Moon angle (simplified calculation)
  const natalSun = natalDateObj.getDate()
  const natalMoon = calculateNatalMoonPosition(natalDateObj)
  
  // For each day in the month
  for (let day = 1; day <= daysInMonth; day++) {
    const currentDate = new Date(year, month - 1, day)
    const dayOfMonth = currentDate.getDate()
    
    // Calculate lunar phase
    const lunarPhase = getLunarPhase(currentDate)
    
    // Determine fertility based on recurring Sun-Moon angle
    const daysFromNatal = Math.abs(dayOfMonth - natalSun)
    const isFertileWindow = daysFromNatal <= 3 || daysFromNatal >= 27
    
    // Calculate optimal timing (24-48 hour window)
    const isOptimal = daysFromNatal === 0 || daysFromNatal === 28
    
    let windowType: FertileWindow['type']
    let confidence = 0
    let description = ''
    
    if (isOptimal && lunarPhase === 'new') {
      windowType = 'optimal'
      confidence = 95
      description = 'Optimal conception window - highest fertility'
    } else if (isFertileWindow) {
      windowType = 'fertile'
      confidence = 75
      description = 'Fertile window - good for conception'
    } else {
      windowType = 'neutral'
      confidence = 40
      description = 'Neutral period'
    }
    
    // Gender prediction based on lunar phase and sign
    const genderPrediction = predictGender(lunarPhase, dayOfMonth)
    
    // Astrological factors
    const astrologicalFactors = [
      `Lunar Phase: ${lunarPhase}`,
      genderPrediction ? `Gender bias: ${genderPrediction}` : 'Neutral gender timing',
      `Day from natal angle: ${daysFromNatal}`
    ]
    
    windows.push({
      date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      type: windowType,
      lunarPhase,
      genderPrediction: windowType === 'optimal' ? genderPrediction : undefined,
      confidence,
      description,
      astrologicalFactors
    })
  }
  
  return windows
}

/**
 * Predict baby's gender based on lunar phase and sign
 * Masculine signs (Aries, Gemini, Leo, Libra, Sagittarius, Aquarius)
 * Feminine signs (Taurus, Cancer, Virgo, Scorpio, Capricorn, Pisces)
 */
function predictGender(lunarPhase: string, dayOfMonth: number): 'male' | 'female' | undefined {
  // Determine sign based on day of month
  const sign = determineSignFromDay(dayOfMonth)
  
  const masculineSigns = ['Aries', 'Gemini', 'Leo', 'Libra', 'Sagittarius', 'Aquarius']
  const feminineSigns = ['Taurus', 'Cancer', 'Virgo', 'Scorpio', 'Capricorn', 'Pisces']
  
  if (masculineSigns.includes(sign)) {
    return 'male'
  } else if (feminineSigns.includes(sign)) {
    return 'female'
  }
  
  return undefined
}

/**
 * Determine zodiac sign from day of month
 */
function determineSignFromDay(day: number): string {
  // Approximate sign based on birth date
  const signs = [
    'Capricorn', 'Aquarius', 'Pisces', 'Aries', 'Taurus', 'Gemini',
    'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius'
  ]
  
  // Days 1-10: Capricorn, 11-20: Aquarius, etc.
  const signIndex = Math.floor((day - 1) / 10) % 12
  return signs[signIndex]
}

/**
 * Calculate natal Moon position (simplified)
 */
function calculateNatalMoonPosition(date: Date): number {
  // Simplified calculation - in real implementation, use Swiss Ephemeris
  const lunarCycleDays = 29.5
  const newYearDate = new Date(date.getFullYear(), 0, 1)
  const daysFromNewYear = Math.floor((date.getTime() - newYearDate.getTime()) / (1000 * 60 * 60 * 24))
  return daysFromNewYear % lunarCycleDays
}

/**
 * Generate complete fertility calendar for a month
 */
export function generateFertilityCalendar(
  natalDate: string,
  month: number,
  year: number
): FertilityCalendar {
  const fertileWindows = calculateFertileWindows(natalDate, month, year)
  
  const optimalConceptionDates = fertileWindows
    .filter(w => w.type === 'optimal')
    .map(w => w.date)
  
  const lunarPhaseTiming = {
    newMoon: fertileWindows.filter(w => w.lunarPhase === 'new').map(w => w.date),
    waxing: fertileWindows.filter(w => w.lunarPhase === 'waxing').map(w => w.date),
    fullMoon: fertileWindows.filter(w => w.lunarPhase === 'full').map(w => w.date),
    waning: fertileWindows.filter(w => w.lunarPhase === 'waning').map(w => w.date)
  }
  
  const genderPredictionWindows = {
    male: fertileWindows.filter(w => w.genderPrediction === 'male' && w.type === 'optimal').map(w => w.date),
    female: fertileWindows.filter(w => w.genderPrediction === 'female' && w.type === 'optimal').map(w => w.date)
  }
  
  return {
    month,
    year,
    fertileWindows,
    lunarPhaseTiming,
    genderPredictionWindows,
    optimalConceptionDates
  }
}

/**
 * Get fertile windows for next 6 months
 */
export function getSixMonthFertility(natalDate: string, startMonth: number, startYear: number): FertilityCalendar[] {
  const calendars: FertilityCalendar[] = []
  
  for (let i = 0; i < 6; i++) {
    let month = startMonth + i
    let year = startYear
    
    // Handle year rollover
    if (month > 12) {
      month -= 12
      year += 1
    }
    
    calendars.push(generateFertilityCalendar(natalDate, month, year))
  }
  
  return calendars
}

/**
 * Calculate optimal conception timing with astrological considerations
 */
export function getOptimalConceptionTiming(
  natalDate: string,
  currentDate: Date = new Date()
): {
  nextOptimalWindow: string
  daysUntilWindow: number
  confidence: number
  astrologicalFactors: string[]
} {
  const month = currentDate.getMonth() + 1
  const year = currentDate.getFullYear()
  const fertileWindows = calculateFertileWindows(natalDate, month, year)
  
  // Find next optimal window
  const today = currentDate.getDate()
  const optimalWindows = fertileWindows
    .filter(w => {
      const windowDate = new Date(w.date).getDate()
      return windowDate >= today && w.type === 'optimal'
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  
  if (optimalWindows.length === 0) {
    // Look in next month
    const nextMonth = month === 12 ? 1 : month + 1
    const nextYear = month === 12 ? year + 1 : year
    const nextMonthWindows = calculateFertileWindows(natalDate, nextMonth, nextYear)
    const optimalWindow = nextMonthWindows.find(w => w.type === 'optimal')
    
    if (optimalWindow) {
      const daysUntil = Math.ceil((new Date(optimalWindow.date).getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))
      return {
        nextOptimalWindow: optimalWindow.date,
        daysUntilWindow: daysUntil,
        confidence: optimalWindow.confidence,
        astrologicalFactors: optimalWindow.astrologicalFactors
      }
    }
    
    // SAFETY: Return safe defaults if no optimal windows found
    return {
      nextOptimalWindow: '',
      daysUntilWindow: 0,
      confidence: 0,
      astrologicalFactors: []
    }
  }
  
  // SAFETY CHECK: Verify array is not empty before accessing
  if (!optimalWindows || optimalWindows.length === 0) {
    return {
      nextOptimalWindow: '',
      daysUntilWindow: 0,
      confidence: 0,
      astrologicalFactors: []
    }
  }
  
  const nextWindow = optimalWindows[0]
  const daysUntil = Math.ceil((new Date(nextWindow.date).getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))
  
  return {
    nextOptimalWindow: nextWindow?.date || '',
    daysUntilWindow: daysUntil || 0,
    confidence: nextWindow?.confidence || 0,
    astrologicalFactors: nextWindow?.astrologicalFactors || []
  }
}

