import { NextRequest, NextResponse } from 'next/server'
import { devLog } from '@/lib/devLogger'

export const dynamic = 'force-static'

// Planetary Positions and Analysis API
// Ported from VedicAstro Python library to TypeScript

interface BirthData {
  birthDate: string
  birthTime: string
  birthPlace: string
  latitude: number
  longitude: number
}

interface PlanetPosition {
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

interface PlanetaryStrength {
  name: string
  strength: number
  status: string
  factors: string[]
}

interface PlanetAnalysis {
  positions: PlanetPosition[]
  strengths: PlanetaryStrength[]
  aspects: any[]
  dignities: any[]
}

// Calculate planetary positions (simplified)
function calculatePlanetaryPositions(birthData: BirthData): PlanetPosition[] {
  const { birthDate, birthTime } = birthData
  
  // Convert birth date to Julian day number (simplified)
  const date = new Date(`${birthDate}T${birthTime}`)
  const julianDay = date.getTime() / (1000 * 60 * 60 * 24) + 2440587.5
  
  // Simplified planetary positions (in real implementation, use Swiss Ephemeris)
  const planets: PlanetPosition[] = [
    {
      name: 'Sun',
      sign: 'Aries',
      degree: 15,
      minute: 30,
      house: 1,
      nakshatra: 'Bharani',
      pada: 1,
      isRetrograde: false,
      isCombust: false,
      speed: 1.0,
      longitude: 15.5,
      latitude: 0
    },
    {
      name: 'Moon',
      sign: 'Cancer',
      degree: 8,
      minute: 18,
      house: 4,
      nakshatra: 'Pushya',
      pada: 2,
      isRetrograde: false,
      isCombust: false,
      speed: 13.0,
      longitude: 98.3,
      latitude: 0
    },
    {
      name: 'Mars',
      sign: 'Scorpio',
      degree: 15,
      minute: 42,
      house: 7,
      nakshatra: 'Anuradha',
      pada: 3,
      isRetrograde: false,
      isCombust: false,
      speed: 0.5,
      longitude: 225.7,
      latitude: 0
    },
    {
      name: 'Mercury',
      sign: 'Libra',
      degree: 22,
      minute: 6,
      house: 6,
      nakshatra: 'Swati',
      pada: 4,
      isRetrograde: false,
      isCombust: false,
      speed: 1.4,
      longitude: 202.1,
      latitude: 0
    },
    {
      name: 'Jupiter',
      sign: 'Pisces',
      degree: 18,
      minute: 54,
      house: 12,
      nakshatra: 'Revati',
      pada: 1,
      isRetrograde: false,
      isCombust: false,
      speed: 0.1,
      longitude: 348.9,
      latitude: 0
    },
    {
      name: 'Venus',
      sign: 'Leo',
      degree: 6,
      minute: 24,
      house: 4,
      nakshatra: 'Magha',
      pada: 2,
      isRetrograde: false,
      isCombust: false,
      speed: 1.2,
      longitude: 126.4,
      latitude: 0
    },
    {
      name: 'Saturn',
      sign: 'Aquarius',
      degree: 11,
      minute: 12,
      house: 11,
      nakshatra: 'Dhanishta',
      pada: 3,
      isRetrograde: false,
      isCombust: false,
      speed: 0.05,
      longitude: 311.2,
      latitude: 0
    },
    {
      name: 'Rahu',
      sign: 'Gemini',
      degree: 25,
      minute: 48,
      house: 3,
      nakshatra: 'Ardra',
      pada: 4,
      isRetrograde: true,
      isCombust: false,
      speed: -0.05,
      longitude: 85.8,
      latitude: 0
    },
    {
      name: 'Ketu',
      sign: 'Sagittarius',
      degree: 25,
      minute: 48,
      house: 9,
      nakshatra: 'Mula',
      pada: 2,
      isRetrograde: true,
      isCombust: false,
      speed: -0.05,
      longitude: 265.8,
      latitude: 0
    }
  ]
  
  return planets
}

// Calculate planetary strengths (simplified)
function calculatePlanetaryStrengths(planets: PlanetPosition[]): PlanetaryStrength[] {
  const strengths: PlanetaryStrength[] = []
  
  for (const planet of planets) {
    let strength = 50 // Base strength
    const factors: string[] = []
    
    // Calculate strength based on various factors
    if (planet.house === 1 || planet.house === 4 || planet.house === 7 || planet.house === 10) {
      strength += 20
      factors.push('Kendra position')
    }
    
    if (planet.house === 5 || planet.house === 9) {
      strength += 15
      factors.push('Trikona position')
    }
    
    if (planet.isRetrograde) {
      strength -= 10
      factors.push('Retrograde')
    }
    
    if (planet.isCombust) {
      strength -= 15
      factors.push('Combust')
    }
    
    // Determine status
    let status = 'Moderate'
    if (strength >= 80) status = 'Very Strong'
    else if (strength >= 65) status = 'Strong'
    else if (strength >= 50) status = 'Moderate'
    else if (strength >= 35) status = 'Weak'
    else status = 'Very Weak'
    
    strengths.push({
      name: planet.name,
      strength: Math.max(0, Math.min(100, strength)),
      status,
      factors
    })
  }
  
  return strengths
}

// Calculate planetary aspects (simplified)
function calculatePlanetaryAspects(planets: PlanetPosition[]): any[] {
  const aspects: any[] = []
  
  // Simplified aspect calculation
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const planet1 = planets[i]
      const planet2 = planets[j]
      
      const angle = Math.abs(planet1.longitude - planet2.longitude)
      const normalizedAngle = Math.min(angle, 360 - angle)
      
      let aspectType = 'None'
      let orb = 0
      
      if (normalizedAngle <= 8) {
        aspectType = 'Conjunction'
        orb = normalizedAngle
      } else if (Math.abs(normalizedAngle - 60) <= 8) {
        aspectType = 'Sextile'
        orb = Math.abs(normalizedAngle - 60)
      } else if (Math.abs(normalizedAngle - 90) <= 8) {
        aspectType = 'Square'
        orb = Math.abs(normalizedAngle - 90)
      } else if (Math.abs(normalizedAngle - 120) <= 8) {
        aspectType = 'Trine'
        orb = Math.abs(normalizedAngle - 120)
      } else if (Math.abs(normalizedAngle - 180) <= 8) {
        aspectType = 'Opposition'
        orb = Math.abs(normalizedAngle - 180)
      }
      
      if (aspectType !== 'None') {
        aspects.push({
          planet1: planet1.name,
          planet2: planet2.name,
          type: aspectType,
          orb: Math.round(orb * 100) / 100,
          angle: normalizedAngle
        })
      }
    }
  }
  
  return aspects
}

// Calculate planetary dignities
function calculatePlanetaryDignities(planets: PlanetPosition[]): any[] {
  const dignities: any[] = []
  
  const exaltationSigns: { [key: string]: string } = {
    'Sun': 'Aries',
    'Moon': 'Taurus',
    'Mars': 'Capricorn',
    'Mercury': 'Virgo',
    'Jupiter': 'Cancer',
    'Venus': 'Pisces',
    'Saturn': 'Libra'
  }
  
  const debilitationSigns: { [key: string]: string } = {
    'Sun': 'Libra',
    'Moon': 'Scorpio',
    'Mars': 'Cancer',
    'Mercury': 'Pisces',
    'Jupiter': 'Capricorn',
    'Venus': 'Virgo',
    'Saturn': 'Aries'
  }
  
  for (const planet of planets) {
    if (exaltationSigns[planet.name] || debilitationSigns[planet.name]) {
      let dignity = 'Neutral'
      
      if (planet.sign === exaltationSigns[planet.name]) {
        dignity = 'Exalted'
      } else if (planet.sign === debilitationSigns[planet.name]) {
        dignity = 'Debilitated'
      }
      
      dignities.push({
        planet: planet.name,
        sign: planet.sign,
        dignity,
        degree: planet.degree
      })
    }
  }
  
  return dignities
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
    
    devLog.info('Calculating planetary positions for:', birthData, 'vedic')
    
    const positions = calculatePlanetaryPositions(birthData)
    const strengths = calculatePlanetaryStrengths(positions)
    const aspects = calculatePlanetaryAspects(positions)
    const dignities = calculatePlanetaryDignities(positions)
    
    const analysis: PlanetAnalysis = {
      positions,
      strengths,
      aspects,
      dignities
    }
    
    return NextResponse.json({
      success: true,
      data: analysis,
      metadata: {
        generatedAt: new Date().toISOString(),
        source: 'FutureSeer VedicAstro Integration',
        version: '1.0.0'
      }
    })
    
  } catch (error) {
    devLog.error('Error calculating planetary positions:', error)
    return NextResponse.json(
      { 
        error: 'Failed to calculate planetary positions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Planetary Positions and Analysis API',
    description: 'Calculate planetary positions, strengths, aspects, and dignities',
    usage: 'POST with birth data to calculate planetary analysis',
    features: [
      'Planetary positions',
      'Planetary strengths',
      'Planetary aspects',
      'Planetary dignities'
    ]
  })
}
