import { NextRequest, NextResponse } from 'next/server'
import { getUserProfile } from '@/lib/firebase'
import { getDocument } from '@/lib/firebase-admin'
import { calculateTransitData } from '@/lib/transitCalculatorServer'
import { getChart } from '@/lib/astronomia-vedic'
import { geocodePlace } from '@/services/geocoding'
import { devLog } from '@/lib/devLogger'

/**
 * Server-side geocoding with fallback to common Indian cities
 */
async function getCoordinatesWithFallback(place: string): Promise<{ latitude: number; longitude: number }> {
  try {
    devLog.debug('📍 Geocoding birth place:', place, 'kp-astrology')
    const coords = await geocodePlace(place)
    
    if (coords) {
      devLog.debug('✅ Geocoded successfully:', place, 'kp-astrology')
      return {
        latitude: coords.latitude,
        longitude: coords.longitude
      }
    }
  } catch (error) {
    devLog.error('❌ Geocoding error:', error, 'route')
  }
  
  // Fallback to common Indian cities
  const fallbacks: Record<string, { latitude: number; longitude: number }> = {
    'mumbai': { latitude: 19.0760, longitude: 72.8777 },
    'delhi': { latitude: 28.7041, longitude: 77.1025 },
    'bangalore': { latitude: 12.9716, longitude: 77.5946 },
    'mysore': { latitude: 12.2958, longitude: 76.6394 },
    'chennai': { latitude: 13.0827, longitude: 80.2707 },
    'kolkata': { latitude: 22.5726, longitude: 88.3639 },
    'hyderabad': { latitude: 17.3850, longitude: 78.4867 },
    'pune': { latitude: 18.5204, longitude: 73.8567 }
  }
  
  const placeLower = place.toLowerCase()
  for (const [city, coords] of Object.entries(fallbacks)) {
    if (placeLower.includes(city)) {
      devLog.debug('📍 Using fallback coordinates for:', place, 'kp-astrology')
      return coords
    }
  }
  
  // Ultimate fallback: Mumbai (center of India)
  devLog.warn('⚠️ Using default Mumbai coordinates for:', place, 'kp-astrology')
  return { latitude: 19.0760, longitude: 72.8777 }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, birthData } = body

    if (!userId && !birthData) {
      return NextResponse.json(
        { success: false, error: 'User ID or birth data is required' },
        { status: 400 }
      )
    }

    devLog.info('🔄 Calculating current transits for KP astrology...', undefined, 'kp-astrology')

    let userBirthData = birthData
    let coordinates: { latitude: number; longitude: number } | null = null

    // If userId provided, try to fetch profile (client SDK then Admin fallback)
    if (userId) {
      let userProfile: { birthDate?: string; birthTime?: string; birthPlace?: string; displayName?: string } | null = null
      try {
        userProfile = await getUserProfile(userId)
      } catch (err) {
        devLog.warn('⚠️ getUserProfile (client) failed, trying Admin:', err, 'route')
      }
      if (!userProfile && typeof getDocument === 'function') {
        try {
          const data = await getDocument('users', userId)
          if (data && typeof data === 'object') userProfile = data as { birthDate?: string; birthTime?: string; birthPlace?: string; displayName?: string }
        } catch (adminErr) {
          devLog.warn('⚠️ getDocument (admin) failed:', adminErr, 'route')
        }
      }
      if (userProfile?.birthDate && userProfile?.birthTime && userProfile?.birthPlace) {
        userBirthData = {
          birthDate: userProfile.birthDate,
          birthTime: userProfile.birthTime,
          birthPlace: userProfile.birthPlace,
          displayName: userProfile.displayName || 'User'
        }
      }
      // If still no birth data, use request body birthData so transits work when Firestore fails
      if (!userBirthData?.birthDate || !userBirthData?.birthTime || !userBirthData?.birthPlace) {
        if (birthData?.birthDate && birthData?.birthTime && birthData?.birthPlace) {
          userBirthData = {
            birthDate: birthData.birthDate,
            birthTime: birthData.birthTime,
            birthPlace: birthData.birthPlace,
            displayName: birthData.displayName || 'User'
          }
          devLog.debug('📋 Using birth data from request body (profile unavailable)', undefined, 'kp-astrology')
        }
      }
    }

    if (!userBirthData?.birthDate || !userBirthData?.birthTime || !userBirthData?.birthPlace) {
      return NextResponse.json(
        { success: false, error: 'Birth data is incomplete' },
        { status: 400 }
      )
    }

    // Get coordinates for birth place
    coordinates = await getCoordinatesWithFallback(userBirthData.birthPlace)

    // Parse birth date and time
    const [year, month, day] = userBirthData.birthDate.split('-').map(Number)
    const [hour, minute] = userBirthData.birthTime.split(':').map(Number)
    const birthDateTime = new Date(Date.UTC(year, month - 1, day, hour, minute))

    // Calculate natal chart for transit comparison
    const natalChart = getChart({
      date: birthDateTime,
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      birthDate: birthDateTime
    }, {
      ayanamsha: 'kp',
      houseSystem: 'placidus'
    })

    if (!natalChart) {
      return NextResponse.json(
        { success: false, error: 'Failed to calculate natal chart' },
        { status: 500 }
      )
    }

    devLog.debug('🔮 Natal chart calculated successfully:', {
      hasAscendant: !!natalChart.ascendant,
      hasPlanets: !!natalChart.planets,
      planetCount: natalChart.planets ? Object.keys(natalChart.planets).length : 0,
      ascendantLon: natalChart.ascendant?.lonSidereal
    }, 'kp-astrology')

    // Calculate transit data
    let transitData
    try {
      transitData = calculateTransitData(natalChart, {
        birthDate: userBirthData.birthDate,
        birthTime: userBirthData.birthTime,
        birthPlace: userBirthData.birthPlace,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude
      })

      devLog.debug('📊 Transit data calculated:', {
        favorable: transitData.favorable.length,
        challenging: transitData.challenging.length,
        upcoming: transitData.upcoming.length
      }, 'kp-astrology')
    } catch (transitError: any) {
      devLog.error('❌ Error in calculateTransitData:', transitError, 'route')
      devLog.error('Stack:', transitError.stack, 'route')
      return NextResponse.json(
        { 
          success: false, 
          error: `Transit calculation failed: ${transitError.message || 'Unknown error'}` 
        },
        { status: 500 }
      )
    }

    // Transform transit data to match UI format
    const activeTransits = [
      ...transitData.favorable.map((transit) => ({
        planet: transit.planet,
        target: `House ${transit.house} (${transit.sign})`,
        description: transit.description,
        startDate: new Date().toLocaleDateString(),
        endDate: getTransitEndDate(transit.planet, transit.house),
        type: 'favorable',
        intensity: transit.intensity
      })),
      ...transitData.challenging.map((transit) => ({
        planet: transit.planet,
        target: `House ${transit.house} (${transit.sign})`,
        description: transit.description,
        startDate: new Date().toLocaleDateString(),
        endDate: getTransitEndDate(transit.planet, transit.house),
        type: 'challenging',
        intensity: transit.intensity
      }))
    ]

    const upcomingTransits = transitData.upcoming.map((transit) => ({
      planet: extractPlanetFromTitle(transit.title),
      target: extractTargetFromTitle(transit.title),
      description: transit.description,
      startDate: new Date(transit.date).toLocaleDateString(),
      type: transit.significance.toLowerCase(),
      significance: transit.significance
    }))

    devLog.info('✅ Transit calculation completed:', {
      activeTransits: activeTransits.length,
      upcomingTransits: upcomingTransits.length,
      sampleActiveTransit: activeTransits[0],
      sampleUpcomingTransit: upcomingTransits[0]
    }, 'kp-astrology')

    return NextResponse.json({
      success: true,
      data: {
        activeTransits,
        upcomingTransits,
        favorableCount: transitData.favorable.length,
        challengingCount: transitData.challenging.length,
        generatedAt: new Date().toISOString()
      }
    })
  } catch (error: any) {
    devLog.error('❌ Error calculating current transits:', error, 'route')
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to calculate current transits' 
      },
      { status: 500 }
    )
  }
}

/**
 * Helper function to calculate transit end date based on planet speed
 */
function getTransitEndDate(planet: string, house: number): string {
  const now = new Date()
  const planetSpeeds: Record<string, number> = {
    'Sun': 30, // days per house
    'Moon': 2.5,
    'Mercury': 20,
    'Venus': 25,
    'Mars': 45,
    'Jupiter': 360,
    'Saturn': 810,
    'Rahu': 540,
    'Ketu': 540
  }
  
  const daysInHouse = planetSpeeds[planet] || 30
  const endDate = new Date(now.getTime() + daysInHouse * 24 * 60 * 60 * 1000)
  return endDate.toLocaleDateString()
}

/**
 * Extract planet name from transit title
 */
function extractPlanetFromTitle(title: string): string {
  const planets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Rahu', 'Ketu']
  for (const planet of planets) {
    if (title.includes(planet)) {
      return planet
    }
  }
  return 'Unknown'
}

/**
 * Extract target from transit title
 */
function extractTargetFromTitle(title: string): string {
  // Try to extract house number or sign from title
  const houseMatch = title.match(/House (\d+)/i)
  if (houseMatch) {
    return `House ${houseMatch[1]}`
  }
  const signMatch = title.match(/(Aries|Taurus|Gemini|Cancer|Leo|Virgo|Libra|Scorpio|Sagittarius|Capricorn|Aquarius|Pisces)/i)
  if (signMatch) {
    return signMatch[1]
  }
  return 'Transit'
}

