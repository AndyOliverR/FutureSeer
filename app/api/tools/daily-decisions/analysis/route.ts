import { NextRequest, NextResponse } from 'next/server'
import { dailyDecisionsIntelligence } from '@/lib/dailyDecisionsIntelligence'
import { isProfileComplete } from '@/lib/firebase'
import { loadOwnedUserProfile } from '@/lib/security/loadOwnedUserProfile'
import { devLog } from '@/lib/devLogger'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, userProfile: providedProfile, date } = body

    devLog.debug('📅 [DAILY DECISIONS API] Request received:', {
      hasUserId: !!userId,
      hasProfile: !!providedProfile,
      date
    }, 'daily-decisions')

    // Validation
    if (!userId) {
      devLog.error('❌ [DAILY DECISIONS API] Missing userId', undefined, 'route')
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Prefer body profile (Stage B / orchestrator). Firestore load requires ownership.
    let userProfile = providedProfile
    if (!userProfile && userId) {
      const loaded = await loadOwnedUserProfile(request, userId, 'daily-decisions')
      if (!loaded.ok) {
        return NextResponse.json(
          { success: false, error: loaded.error },
          { status: loaded.status },
        )
      }
      userProfile = loaded.profile
      devLog.debug('✅ [DAILY DECISIONS API] Owned profile fetched:', {
        hasBirthDate: !!userProfile?.birthDate,
        hasBirthTime: !!userProfile?.birthTime,
        hasBirthPlace: !!userProfile?.birthPlace
      }, 'daily-decisions')
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
      devLog.warn('⚠️ [DAILY DECISIONS API] Profile incomplete - analysis may have reduced accuracy', undefined, 'daily-decisions')
    } else {
      devLog.info('✅ [DAILY DECISIONS API] Profile complete - generating personalized analysis', undefined, 'daily-decisions')
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
        devLog.debug('✅ [DAILY DECISIONS API] Geocoded successfully:', coords, 'daily-decisions')
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
            devLog.debug('📍 [DAILY DECISIONS API] Using fallback coordinates:', city, 'daily-decisions')
            break
          }
        }
        
        if (!found) {
          // Ultimate fallback: Mumbai
          latitude = 19.0760
          longitude = 72.8777
          devLog.warn('⚠️ [DAILY DECISIONS API] Using default Mumbai coordinates', undefined, 'daily-decisions')
        }
      }
    } catch (error) {
      devLog.error('❌ [DAILY DECISIONS API] Geocoding error:', error, 'route')
      // Fallback to Mumbai
      latitude = 19.0760
      longitude = 72.8777
    }

    // Generate Daily Decisions analysis
    devLog.debug('🔮 [DAILY DECISIONS API] Calling dailyDecisionsIntelligence.getRecommendations...', undefined, 'daily-decisions')
    const analysis = await dailyDecisionsIntelligence.getRecommendations(
      userId,
      userProfile.birthDate,
      userProfile.birthTime,
      userProfile.birthPlace,
      latitude,
      longitude,
      date // Optional target date
    )

    devLog.info('✅ [DAILY DECISIONS API] Analysis generated successfully:', {
      date: analysis.date,
      hasRecommendations: !!analysis.recommendations,
      rahuKaal: analysis.rahuKaal.formatted,
      gulikaKaal: analysis.gulikaKaal.formatted
    }, 'daily-decisions')

    return NextResponse.json({
      success: true,
      data: {
        ...analysis,
        profileComplete
      }
    })
  } catch (error: any) {
    devLog.error('❌ [DAILY DECISIONS API] Error generating analysis:', error, 'route')
    devLog.error('❌ [DAILY DECISIONS API] Error stack:', error.stack, 'route')
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to generate daily decisions analysis. Please try again.' 
      },
      { status: 500 }
    )
  }
}
