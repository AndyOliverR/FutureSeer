import { NextRequest, NextResponse } from 'next/server'
import { HoraryEngine } from '@/lib/horaryEngine'
import { devLog } from '@/lib/devLogger'

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

    // Use our custom Horary engine for current transits
    const horaryEngine = new HoraryEngine()
    
    // Generate current transits using real astronomical data
    const currentTime = new Date().toISOString()
    const currentTransits = await horaryEngine.generateHoraryChart({
      question: 'Current planetary influences',
      questionTime: currentTime,
      questionPlace: questionData?.questionPlace || 'Current location',
      latitude: questionData?.latitude || 12.2958,
      longitude: questionData?.longitude || 76.6394,
      timezone: questionData?.timezone || 5.5
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
