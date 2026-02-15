import { NextRequest, NextResponse } from 'next/server'
import { navaratnaIntelligence } from '@/lib/navaratnaIntelligence'
import { getUserProfile, isProfileComplete } from '@/lib/firebase'
import { devLog, devWarn } from '@/lib/devLogger'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, userProfile: providedProfile, bodyWeightKg } = body

    devLog.debug('💎 [NAVARATNA API] Request received:', {
      hasUserId: !!userId,
      hasProfile: !!providedProfile,
      bodyWeightKg
    }, 'navaratna')

    // Validation
    if (!userId) {
      devLog.error('❌ [NAVARATNA API] Missing userId', undefined, 'route')
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Get user profile
    let userProfile = providedProfile
    if (!userProfile && userId) {
      try {
        devLog.debug('📂 [NAVARATNA API] Fetching user profile...', undefined, 'navaratna')
        userProfile = await getUserProfile(userId)
        devLog.debug('✅ [NAVARATNA API] Profile fetched:', {
          hasProfile: !!userProfile,
          hasBirthDate: !!userProfile?.birthDate,
          hasBirthTime: !!userProfile?.birthTime,
          hasBirthPlace: !!userProfile?.birthPlace
        }, 'navaratna')
      } catch (profileError) {
        devWarn('⚠️ [NAVARATNA API] Failed to fetch user profile:', profileError)
      }
    }

    // Validate required fields
    if (!userProfile) {
      return NextResponse.json(
        { success: false, error: 'User profile not found' },
        { status: 404 }
      )
    }

    if (!userProfile.birthDate || !userProfile.birthTime || !userProfile.birthPlace) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Complete birth data required. Please provide birth date, time, and place in your profile.' 
        },
        { status: 400 }
      )
    }

    // Check profile completeness
    const profileComplete = isProfileComplete(userProfile)
    if (!profileComplete) {
      devLog.warn('⚠️ [NAVARATNA API] Profile incomplete - analysis may have reduced accuracy', undefined, 'navaratna')
    } else {
      devLog.info('✅ [NAVARATNA API] Profile complete - generating personalized analysis', undefined, 'navaratna')
    }

    // Geocode birth place server-side
    let latitude = 19.0760
    let longitude = 72.8777

    try {
      const { geocodePlace } = await import('@/services/geocoding')
      const coords = await geocodePlace(userProfile.birthPlace)
      
      if (coords) {
        latitude = coords.latitude
        longitude = coords.longitude
        devLog.debug('✅ [NAVARATNA API] Geocoded successfully:', coords, 'navaratna')
      } else {
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
        
        const placeLower = userProfile.birthPlace.toLowerCase()
        let found = false
        for (const [city, coords] of Object.entries(fallbacks)) {
          if (placeLower.includes(city)) {
            latitude = coords.latitude
            longitude = coords.longitude
            found = true
            devLog.debug('📍 [NAVARATNA API] Using fallback coordinates:', city, 'navaratna')
            break
          }
        }
        
        if (!found) {
          // Ultimate fallback: Mumbai
          latitude = 19.0760
          longitude = 72.8777
          devLog.warn('⚠️ [NAVARATNA API] Using default Mumbai coordinates', undefined, 'navaratna')
        }
      }
    } catch (error) {
      devLog.error('❌ [NAVARATNA API] Geocoding error:', error, 'route')
      // Fallback to Mumbai
      latitude = 19.0760
      longitude = 72.8777
    }

    // Generate Navaratna analysis
    devLog.debug('🔮 [NAVARATNA API] Calling navaratnaIntelligence.analyzeGemstones...', undefined, 'navaratna')
    const analysis = await navaratnaIntelligence.analyzeGemstones(
      userId,
      userProfile.birthDate,
      userProfile.birthTime,
      userProfile.birthPlace,
      latitude,
      longitude,
      bodyWeightKg
    )

    devLog.info('✅ [NAVARATNA API] Analysis generated successfully:', {
      hasLifeStone: !!analysis.recommendations.lifeStone,
      beneficStonesCount: analysis.recommendations.beneficStones.length,
      hasDashaLord: !!analysis.recommendations.dashaStone,
      avoidedStonesCount: analysis.recommendations.avoidedStones.length,
      lagnesh: analysis.chartSummary.lagnesh
    }, 'navaratna')

    return NextResponse.json({
      success: true,
      data: {
        ...analysis,
        profileComplete
      }
    })
  } catch (error: any) {
    devLog.error('❌ [NAVARATNA API] Error generating Navaratna analysis:', error, 'route')
    devLog.error('❌ [NAVARATNA API] Error stack:', error.stack, 'route')
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to generate Navaratna analysis. Please try again.' 
      },
      { status: 500 }
    )
  }
}
