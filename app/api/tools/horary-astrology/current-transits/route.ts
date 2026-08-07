import { NextRequest, NextResponse } from 'next/server'
import { HoraryEngine } from '@/lib/horaryEngine'
import { devLog } from '@/lib/devLogger'
import { loadOwnedUserProfile } from '@/lib/security/loadOwnedUserProfile'
import { geocodePlace } from '@/services/geocoding'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, questionData } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Missing user ID' },
        { status: 400 }
      )
    }

    devLog.info('📊 Loading current transits for horary astrology user:', userId, 'horary')

    let questionPlace = questionData?.questionPlace || 'Current location'
    let latitude = questionData?.latitude ?? 12.2958
    let longitude = questionData?.longitude ?? 76.6394
    const timezone = questionData?.timezone ?? 5.5

    // Optional residence enrichment — only from an owned profile (never cross-user Admin reads).
    const hasExplicitCoords =
      questionData?.latitude != null &&
      questionData?.longitude != null &&
      Number.isFinite(Number(questionData.latitude)) &&
      Number.isFinite(Number(questionData.longitude))
    if (!hasExplicitCoords) {
      const loaded = await loadOwnedUserProfile(request, userId, 'horary-transits')
      if (loaded.ok) {
        const profile = loaded.profile as { currentLocation?: string; current_location?: string }
        const currentLocation = profile.currentLocation ?? profile.current_location
        const locationStr = typeof currentLocation === 'string' ? currentLocation.trim() : ''
        if (locationStr.length > 0) {
          try {
            const coords = await geocodePlace(locationStr)
            if (coords?.latitude != null && coords?.longitude != null) {
              questionPlace = locationStr
              latitude = coords.latitude
              longitude = coords.longitude
              devLog.debug('📍 Using current residence for horary transits:', locationStr, 'horary')
            }
          } catch {
            /* keep defaults */
          }
        }
      }
      // Stateless / unauthenticated callers keep questionData or defaults — no profile IDOR.
    }

    // Use our custom Horary engine for current transits
    const horaryEngine = new HoraryEngine()
    const currentTime = new Date().toISOString()
    const currentTransits = await horaryEngine.generateHoraryChart({
      question: 'Current planetary influences',
      questionTime: currentTime,
      questionPlace,
      latitude,
      longitude,
      timezone
    })

    // Extract relevant transit information
    const transitsData = {
      activeTransits: currentTransits.planetaryPositions?.map(planet => ({
        planet: planet.planet,
        sign: planet.sign,
        degree: planet.degree,
        house: planet.house,
        speed: planet.speed,
        retrograde: planet.retrograde,
        meaning: (planet as { meaning?: string }).meaning ?? ''
      })) || [],
      currentAspects: currentTransits.aspects?.map(aspect => ({
        planets: `${aspect.planet1} - ${aspect.planet2}`,
        aspect: aspect.aspect,
        orb: aspect.orb,
        applying: aspect.applying,
        description: (aspect as { description?: string }).description ?? ''
      })) || [],
      moonPhase: currentTransits.timing?.moonPhase || 'Unknown',
      moonSign: currentTransits.timing?.moonSign || 'Unknown',
      chartTime: currentTime,
      generatedAt: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      data: transitsData,
      cached: false
    })

  } catch (error: any) {
    devLog.error('❌ Current Transits API Error:', error, 'route')
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to load current transits' 
      },
      { status: 500 }
    )
  }
}
