import { NextRequest, NextResponse } from 'next/server'
import { kpAstrologyIntelligence, KPChartData } from '@/lib/kpAstrologyIntelligence'
import { getUserProfile } from '@/lib/firebase'
import { devLog } from '@/lib/devLogger'

interface Coordinates {
  latitude: number
  longitude: number
  displayName?: string
}

export const dynamic = 'force-dynamic'

/**
 * Server-side geocoding with fallback to common Indian cities
 * Uses services/geocoding.ts which is server-compatible
 */
async function getCoordinatesWithFallback(place: string): Promise<Coordinates> {
  try {
    // Dynamic import of server-compatible geocoding service
    const { geocodePlace } = await import('@/services/geocoding')
    
    devLog.debug('📍 Geocoding birth place:', place, 'kp-astrology')
    const coords = await geocodePlace(place)
    
    if (coords) {
      devLog.debug('✅ Geocoded successfully:', place, 'kp-astrology')
      return {
        latitude: coords.latitude,
        longitude: coords.longitude,
        displayName: coords.formattedAddress
      }
    }
  } catch (error) {
    devLog.error('❌ Geocoding error:', error, 'route')
  }
  
  // Fallback to common Indian cities
  const fallbacks: Record<string, Coordinates> = {
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

    devLog.info('🎯 Generating KP Astrology report...', undefined, 'kp-astrology')

    let userProfile = null
    let chartData: KPChartData | null = null

    // If userId provided, fetch profile
    if (userId) {
      try {
        userProfile = await getUserProfile(userId)
      } catch (profileError) {
        devLog.error('⚠️ Failed to fetch user profile:', profileError, 'route')
        return NextResponse.json(
          { success: false, error: 'Failed to fetch user profile' },
          { status: 400 }
        )
      }

      // Check if profile is complete
      if (!userProfile?.birthDate || !userProfile?.birthTime || !userProfile?.birthPlace) {
        return NextResponse.json(
          { success: false, error: 'Complete profile (birth date, time, and place) is required for KP astrology analysis' },
          { status: 400 }
        )
      }

      // Geocode birth place
      const coords = await getCoordinatesWithFallback(userProfile.birthPlace)
      
      chartData = {
        birthDate: userProfile.birthDate,
        birthTime: userProfile.birthTime,
        birthPlace: userProfile.birthPlace,
        latitude: coords.latitude,
        longitude: coords.longitude
      }
    } else if (birthData) {
      // Use provided birth data
      if (!birthData.birthDate || !birthData.birthTime || !birthData.birthPlace) {
        return NextResponse.json(
          { success: false, error: 'Birth date, time, and place are required' },
          { status: 400 }
        )
      }

      // Geocode if coordinates not provided
      let latitude = birthData.latitude
      let longitude = birthData.longitude

      if (!latitude || !longitude) {
        const coords = await getCoordinatesWithFallback(birthData.birthPlace)
        latitude = coords.latitude
        longitude = coords.longitude
      }

      chartData = {
        birthDate: birthData.birthDate,
        birthTime: birthData.birthTime,
        birthPlace: birthData.birthPlace,
        latitude,
        longitude
      }
    }

    if (!chartData) {
      return NextResponse.json(
        { success: false, error: 'Invalid birth data' },
        { status: 400 }
      )
    }

    // Generate KP analysis
    const analysis = await kpAstrologyIntelligence.analyzeChart(chartData)

    return NextResponse.json({
      success: true,
      data: analysis
    })
  } catch (error: any) {
    devLog.error('❌ Error generating KP astrology report:', error, 'route')
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to generate KP astrology report' 
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    devLog.info('🎯 Fetching KP astrology report for user:', userId, 'kp-astrology')

    // Fetch user profile
    const userProfile = await getUserProfile(userId)
    
    if (!userProfile) {
      return NextResponse.json(
        { success: false, error: 'User profile not found' },
        { status: 404 }
      )
    }

    // Check if profile is complete
    if (!userProfile.birthDate || !userProfile.birthTime || !userProfile.birthPlace) {
      return NextResponse.json(
        { success: false, error: 'Complete profile (birth date, time, and place) is required for KP astrology analysis' },
        { status: 400 }
      )
    }

    // Geocode birth place
    const coords = await getCoordinatesWithFallback(userProfile.birthPlace)
    
    const chartData: KPChartData = {
      birthDate: userProfile.birthDate,
      birthTime: userProfile.birthTime,
      birthPlace: userProfile.birthPlace,
      latitude: coords.latitude,
      longitude: coords.longitude
    }

    // Get KP analysis (will use cache if available)
    const analysis = await kpAstrologyIntelligence.analyzeChart(chartData)

    return NextResponse.json({
      success: true,
      data: analysis
    })
  } catch (error: any) {
    devLog.error('❌ Error fetching KP astrology report:', error, 'route')
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch KP astrology report' 
      },
      { status: 500 }
    )
  }
}
