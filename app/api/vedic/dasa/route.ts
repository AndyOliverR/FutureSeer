import { NextRequest, NextResponse } from 'next/server'
import { devLog } from '@/lib/devLogger'

// Vimshottari Dasa Calculation API
// Ported from VedicAstro Python library to TypeScript

interface BirthData {
  birthDate: string
  birthTime: string
  birthPlace: string
  latitude: number
  longitude: number
}

interface DasaPeriod {
  planet: string
  startDate: string
  endDate: string
  duration: number
  isCurrent: boolean
  progress: number
}

interface DasaData {
  currentDasa: DasaPeriod
  currentBhukti: DasaPeriod
  dasaTimeline: DasaPeriod[]
  totalDuration: number
}

// Vimshottari Dasa periods in years
const DASA_PERIODS: { [key: string]: number } = {
  'Sun': 6,
  'Moon': 10,
  'Mars': 7,
  'Rahu': 18,
  'Jupiter': 16,
  'Saturn': 19,
  'Mercury': 17,
  'Ketu': 7,
  'Venus': 20
}

// Dasa sequence
const DASA_SEQUENCE = ['Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury', 'Ketu', 'Venus']

// Calculate birth nakshatra (simplified)
function calculateBirthNakshatra(birthDate: string, birthTime: string): string {
  // Simplified calculation - in real implementation, use Swiss Ephemeris
  const date = new Date(`${birthDate}T${birthTime}`)
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24))
  
  // Simplified nakshatra calculation based on day of year
  const nakshatras = [
    'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
    'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
    'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
    'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
    'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
  ]
  
  return nakshatras[dayOfYear % 27]
}

// Get starting planet for Dasa
function getStartingPlanet(nakshatra: string): string {
  const nakshatraLords: { [key: string]: string } = {
    'Ashwini': 'Ketu', 'Bharani': 'Venus', 'Krittika': 'Sun', 'Rohini': 'Moon',
    'Mrigashira': 'Mars', 'Ardra': 'Rahu', 'Punarvasu': 'Jupiter', 'Pushya': 'Saturn',
    'Ashlesha': 'Mercury', 'Magha': 'Ketu', 'Purva Phalguni': 'Venus', 'Uttara Phalguni': 'Sun',
    'Hasta': 'Moon', 'Chitra': 'Mars', 'Swati': 'Rahu', 'Vishakha': 'Jupiter',
    'Anuradha': 'Saturn', 'Jyeshtha': 'Mercury', 'Mula': 'Ketu', 'Purva Ashadha': 'Venus',
    'Uttara Ashadha': 'Sun', 'Shravana': 'Moon', 'Dhanishta': 'Mars', 'Shatabhisha': 'Rahu',
    'Purva Bhadrapada': 'Jupiter', 'Uttara Bhadrapada': 'Saturn', 'Revati': 'Mercury'
  }
  
  return nakshatraLords[nakshatra] || 'Sun'
}

// Calculate Dasa periods
function calculateVimshottariDasa(birthData: BirthData): DasaData {
  const { birthDate, birthTime } = birthData
  
  // Calculate birth nakshatra
  const birthNakshatra = calculateBirthNakshatra(birthDate, birthTime)
  const startingPlanet = getStartingPlanet(birthNakshatra)
  
  // Find starting planet index
  const startingIndex = DASA_SEQUENCE.indexOf(startingPlanet)
  
  // Calculate birth date
  const birthDateObj = new Date(`${birthDate}T${birthTime}`)
  const currentDate = new Date()
  
  // Calculate elapsed time since birth
  const elapsedYears = (currentDate.getTime() - birthDateObj.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
  
  // Generate Dasa timeline
  const dasaTimeline: DasaPeriod[] = []
  let currentDasa: DasaPeriod | null = null
  let currentBhukti: DasaPeriod | null = null
  
  let totalElapsed = 0
  let currentDasaStart = 0
  
  // Generate main Dasa periods
  for (let i = 0; i < DASA_SEQUENCE.length; i++) {
    const planetIndex = (startingIndex + i) % DASA_SEQUENCE.length
    const planet = DASA_SEQUENCE[planetIndex]
    const duration = DASA_PERIODS[planet]
    
    const startDate = new Date(birthDateObj.getTime() + (totalElapsed * 365.25 * 24 * 60 * 60 * 1000))
    const endDate = new Date(birthDateObj.getTime() + ((totalElapsed + duration) * 365.25 * 24 * 60 * 60 * 1000))
    
    const isCurrent = elapsedYears >= totalElapsed && elapsedYears < totalElapsed + duration
    const progress = isCurrent ? ((elapsedYears - totalElapsed) / duration) * 100 : 0
    
    const dasaPeriod: DasaPeriod = {
      planet,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      duration,
      isCurrent,
      progress: Math.round(progress)
    }
    
    dasaTimeline.push(dasaPeriod)
    
    if (isCurrent) {
      currentDasa = dasaPeriod
      currentDasaStart = totalElapsed
    }
    
    totalElapsed += duration
  }
  
  // Calculate current Bhukti (sub-period)
  if (currentDasa) {
    const bhuktiElapsed = elapsedYears - currentDasaStart
    const bhuktiDuration = currentDasa.duration / 9 // Simplified bhukti calculation
    
    // Find current bhukti planet
    const bhuktiIndex = Math.floor(bhuktiElapsed / bhuktiDuration) % 9
    const bhuktiPlanet = DASA_SEQUENCE[(startingIndex + bhuktiIndex) % 9]
    
    const bhuktiStart = currentDasaStart + (bhuktiIndex * bhuktiDuration)
    const bhuktiEnd = currentDasaStart + ((bhuktiIndex + 1) * bhuktiDuration)
    
    const bhuktiStartDate = new Date(birthDateObj.getTime() + (bhuktiStart * 365.25 * 24 * 60 * 60 * 1000))
    const bhuktiEndDate = new Date(birthDateObj.getTime() + (bhuktiEnd * 365.25 * 24 * 60 * 60 * 1000))
    
    const bhuktiProgress = ((elapsedYears - bhuktiStart) / bhuktiDuration) * 100
    
    currentBhukti = {
      planet: bhuktiPlanet,
      startDate: bhuktiStartDate.toISOString().split('T')[0],
      endDate: bhuktiEndDate.toISOString().split('T')[0],
      duration: bhuktiDuration,
      isCurrent: true,
      progress: Math.round(bhuktiProgress)
    }
  }
  
  return {
    currentDasa: currentDasa || dasaTimeline[0],
    currentBhukti: currentBhukti || dasaTimeline[0],
    dasaTimeline,
    totalDuration: 120 // Total Vimshottari Dasa duration
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { birthDate, birthTime, birthPlace, latitude, longitude } = body
    
    if (!birthDate || !birthTime || !birthPlace) {
      return NextResponse.json(
        { error: 'Missing required fields: birthDate, birthTime, birthPlace' },
        { status: 400 }
      )
    }
    
    const birthData: BirthData = {
      birthDate,
      birthTime,
      birthPlace,
      latitude: latitude || 19.0760,
      longitude: longitude || 72.8777
    }
    
    devLog.info('Calculating Vimshottari Dasa for:', birthData, 'vedic')
    
    const dasaData = calculateVimshottariDasa(birthData)
    
    return NextResponse.json({
      success: true,
      data: dasaData,
      metadata: {
        generatedAt: new Date().toISOString(),
        source: 'FutureSeer VedicAstro Integration',
        version: '1.0.0'
      }
    })
    
  } catch (error) {
    console.error('Error calculating Vimshottari Dasa:', error)
    return NextResponse.json(
      { 
        error: 'Failed to calculate Dasa',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Vimshottari Dasa Calculation API',
    description: 'Calculate Vimshottari Dasa periods for Vedic astrology',
    usage: 'POST with birth data to calculate Dasa periods',
    dasaPlanets: DASA_SEQUENCE,
    totalDuration: '120 years'
  })
}
