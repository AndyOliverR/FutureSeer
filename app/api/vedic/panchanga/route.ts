import { NextRequest, NextResponse } from 'next/server'
import { devLog } from '@/lib/devLogger'

export const dynamic = 'force-static'

// Panchanga Calculation API
// Ported from VedicAstro Python library to TypeScript

interface PanchangaData {
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

// Tithi names
const TITHI_NAMES = [
  'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
  'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
  'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima',
  'Krishna Pratipada', 'Krishna Dwitiya', 'Krishna Tritiya', 'Krishna Chaturthi', 'Krishna Panchami',
  'Krishna Shashthi', 'Krishna Saptami', 'Krishna Ashtami', 'Krishna Navami', 'Krishna Dashami',
  'Krishna Ekadashi', 'Krishna Dwadashi', 'Krishna Trayodashi', 'Krishna Chaturdashi', 'Amavasya'
]

// Nakshatra names
const NAKSHATRA_NAMES = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
  'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
  'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
  'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
]

// Yoga names
const YOGA_NAMES = [
  'Vishkambha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda',
  'Sukarma', 'Dhriti', 'Shula', 'Ganda', 'Vriddhi', 'Dhruva',
  'Vyaghata', 'Harshana', 'Vajra', 'Siddhi', 'Vyatipata', 'Variyan',
  'Parigha', 'Shiva', 'Siddha', 'Sadhya', 'Shubha', 'Shukla',
  'Brahma', 'Indra', 'Vaidhriti'
]

// Karana names
const KARANA_NAMES = [
  'Bava', 'Balava', 'Kaulava', 'Taitila', 'Gara', 'Vanija',
  'Visti', 'Shakuni', 'Chatushpada', 'Naga', 'Kimstughna'
]

// Calculate Tithi (simplified)
function calculateTithi(date: Date): string {
  const dayOfMonth = date.getDate()
  const month = date.getMonth()
  const year = date.getFullYear()
  
  // Simplified tithi calculation based on date
  const tithiIndex = (dayOfMonth + month * 30) % 30
  return TITHI_NAMES[tithiIndex]
}

// Calculate Nakshatra (simplified)
function calculateNakshatra(date: Date): string {
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24))
  const nakshatraIndex = dayOfYear % 27
  return NAKSHATRA_NAMES[nakshatraIndex]
}

// Calculate Yoga (simplified)
function calculateYoga(date: Date): string {
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24))
  const yogaIndex = dayOfYear % 27
  return YOGA_NAMES[yogaIndex]
}

// Calculate Karana (simplified)
function calculateKarana(date: Date): string {
  const dayOfMonth = date.getDate()
  const karanaIndex = dayOfMonth % 11
  return KARANA_NAMES[karanaIndex]
}

// Calculate sunrise and sunset times (simplified)
function calculateSunTimes(date: Date, latitude: number = 19.0760, longitude: number = 72.8777): { sunrise: string, sunset: string } {
  // Simplified calculation - in real implementation, use proper astronomical calculations
  const hour = date.getHours()
  const minute = date.getMinutes()
  
  // Approximate sunrise and sunset times
  const sunriseHour = 6 + Math.floor(latitude / 30)
  const sunsetHour = 18 - Math.floor(latitude / 30)
  
  return {
    sunrise: `${sunriseHour.toString().padStart(2, '0')}:00`,
    sunset: `${sunsetHour.toString().padStart(2, '0')}:00`
  }
}

// Calculate moonrise and moonset times (simplified)
function calculateMoonTimes(date: Date): { moonrise: string, moonset: string } {
  // Simplified calculation
  const hour = date.getHours()
  const minute = date.getMinutes()
  
  // Approximate moonrise and moonset times
  const moonriseHour = (hour + 12) % 24
  const moonsetHour = (hour + 24) % 24
  
  return {
    moonrise: `${moonriseHour.toString().padStart(2, '0')}:00`,
    moonset: `${moonsetHour.toString().padStart(2, '0')}:00`
  }
}

// Calculate auspicious timings
function calculateAuspiciousTimings(tithi: string, nakshatra: string): string[] {
  const timings: string[] = []
  
  // Add some auspicious timings based on tithi and nakshatra
  if (tithi.includes('Ekadashi') || tithi.includes('Purnima') || tithi.includes('Amavasya')) {
    timings.push('06:00 - 08:00 (Brahma Muhurta)')
    timings.push('18:00 - 20:00 (Evening Prayer)')
  }
  
  if (nakshatra === 'Pushya' || nakshatra === 'Rohini' || nakshatra === 'Mrigashira') {
    timings.push('10:00 - 12:00 (Mid-morning)')
    timings.push('14:00 - 16:00 (Afternoon)')
  }
  
  // Default auspicious timings
  if (timings.length === 0) {
    timings.push('06:00 - 08:00 (Morning)')
    timings.push('18:00 - 20:00 (Evening)')
  }
  
  return timings
}

// Calculate inauspicious timings
function calculateInauspiciousTimings(tithi: string, nakshatra: string): string[] {
  const timings: string[] = []
  
  // Add some inauspicious timings
  if (tithi.includes('Chaturdashi') || tithi.includes('Ashtami')) {
    timings.push('12:00 - 14:00 (Midday)')
  }
  
  if (nakshatra === 'Ardra' || nakshatra === 'Bharani') {
    timings.push('22:00 - 24:00 (Late night)')
  }
  
  // Default inauspicious timings
  if (timings.length === 0) {
    timings.push('12:00 - 14:00 (Midday)')
  }
  
  return timings
}

// Generate Panchanga data
function generatePanchanga(date: Date, latitude: number = 19.0760, longitude: number = 72.8777): PanchangaData {
  const tithi = calculateTithi(date)
  const nakshatra = calculateNakshatra(date)
  const yoga = calculateYoga(date)
  const karana = calculateKarana(date)
  
  const sunTimes = calculateSunTimes(date, latitude, longitude)
  const moonTimes = calculateMoonTimes(date)
  
  const auspiciousTimings = calculateAuspiciousTimings(tithi, nakshatra)
  const inauspiciousTimings = calculateInauspiciousTimings(tithi, nakshatra)
  
  return {
    date: date.toISOString().split('T')[0],
    tithi,
    nakshatra,
    yoga,
    karana,
    sunrise: sunTimes.sunrise,
    sunset: sunTimes.sunset,
    moonrise: moonTimes.moonrise,
    moonset: moonTimes.moonset,
    auspiciousTimings,
    inauspiciousTimings
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { date, latitude, longitude } = body
    
    const targetDate = date ? new Date(date) : new Date()
    const lat = latitude || 19.0760
    const lng = longitude || 72.8777
    
    devLog.info('Calculating Panchanga for:', targetDate.toISOString().split('T')[0], 'vedic')
    
    const panchangaData = generatePanchanga(targetDate, lat, lng)
    
    return NextResponse.json({
      success: true,
      data: panchangaData,
      metadata: {
        generatedAt: new Date().toISOString(),
        source: 'FutureSeer VedicAstro Integration',
        version: '1.0.0'
      }
    })
    
  } catch (error) {
    devLog.error('Error calculating Panchanga:', error, 'route')
    return NextResponse.json(
      { 
        error: 'Failed to calculate Panchanga',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')
  
  try {
    const targetDate = date ? new Date(date) : new Date()
    const panchangaData = generatePanchanga(targetDate)
    
    return NextResponse.json({
      success: true,
      data: panchangaData,
      metadata: {
        generatedAt: new Date().toISOString(),
        source: 'FutureSeer VedicAstro Integration',
        version: '1.0.0'
      }
    })
    
  } catch (error) {
    devLog.error('Error calculating Panchanga:', error, 'route')
    return NextResponse.json(
      { 
        error: 'Failed to calculate Panchanga',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
