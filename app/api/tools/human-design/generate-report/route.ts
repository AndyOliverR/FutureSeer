/**
 * Human Design Report Generation API
 * Generates comprehensive personalized Human Design reports
 */

import { NextRequest, NextResponse } from 'next/server'
import { calculateHumanDesignChart, BirthData } from '@/lib/humanDesign/humanDesignCalculator'
import { generateHumanDesignReport } from '@/lib/humanDesign/humanDesignReportGenerator'
import { UserProfile, getUserProfile } from '@/lib/firebase'
import { geocodePlace } from '@/services/geocoding'
import { devLog } from '@/lib/devLogger'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, birthData, userProfile: providedProfile } = body

    // Validate userId is provided (user authentication required)
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User authentication required' },
        { status: 401 }
      )
    }

    // Get user profile if not provided
    let userProfile: UserProfile | null = providedProfile || null
    
    if (!userProfile && userId) {
      try {
        userProfile = await getUserProfile(userId)
      } catch (error) {
        devLog.warn('Could not fetch user profile:', error, 'human-design')
      }
    }

    // Use birth data from request or profile
    let finalBirthData: BirthData | null = null

    if (birthData) {
      // Use provided birth data
      let latitude = birthData.latitude
      let longitude = birthData.longitude

      // Geocode if coordinates missing
      if ((!latitude || !longitude) && birthData.birthPlace) {
        try {
          const coords = await geocodePlace(birthData.birthPlace)
          if (coords) {
            latitude = coords.latitude
            longitude = coords.longitude
          }
        } catch (error) {
          devLog.warn('Geocoding failed:', error, 'human-design')
        }
      }

      finalBirthData = {
        birthDate: birthData.birthDate,
        birthTime: birthData.birthTime,
        birthPlace: birthData.birthPlace,
        latitude: latitude || 0,
        longitude: longitude || 0
      }
    } else if (userProfile) {
      // Use profile birth data
      if (!userProfile.birthDate || !userProfile.birthTime || !userProfile.birthPlace) {
        return NextResponse.json(
          { success: false, error: 'Complete birth data (date, time, place) is required' },
          { status: 400 }
        )
      }

      let latitude = userProfile.birthLatitude
      let longitude = userProfile.birthLongitude

      // Geocode if coordinates missing
      if ((!latitude || !longitude) && userProfile.birthPlace) {
        try {
          const coords = await geocodePlace(userProfile.birthPlace)
          if (coords) {
            latitude = coords.latitude
            longitude = coords.longitude
          }
        } catch (error) {
          devLog.warn('Geocoding failed:', error, 'human-design')
        }
      }

      finalBirthData = {
        birthDate: userProfile.birthDate,
        birthTime: userProfile.birthTime || '12:00',
        birthPlace: userProfile.birthPlace,
        latitude: latitude || 0,
        longitude: longitude || 0
      }
    } else {
      return NextResponse.json(
        { success: false, error: 'Birth data or user profile is required' },
        { status: 400 }
      )
    }

    // Validate birth data
    if (!finalBirthData.birthDate || !finalBirthData.birthTime || !finalBirthData.birthPlace) {
      return NextResponse.json(
        { success: false, error: 'Complete birth data (date, time, place) is required' },
        { status: 400 }
      )
    }

    devLog.info('🧬 Generating Human Design report for user:', userId || 'anonymous', 'human-design')
    devLog.debug('🧬 Birth data:', {
      birthDate: finalBirthData.birthDate,
      birthTime: finalBirthData.birthTime,
      birthPlace: finalBirthData.birthPlace,
      latitude: finalBirthData.latitude,
      longitude: finalBirthData.longitude
    }, 'human-design')

    // Calculate Human Design chart
    const chartData = await calculateHumanDesignChart(finalBirthData)

    devLog.debug('✅ Human Design chart calculated:', {
      type: chartData.type.name,
      strategy: chartData.strategy,
      authority: chartData.authority.name,
      profile: chartData.profile.name,
      definedCenters: chartData.centers.defined.length,
      activeChannels: chartData.channels.length
    }, 'human-design')

    // Generate comprehensive report
    const report = await generateHumanDesignReport(chartData, userProfile)

    devLog.info('✅ Human Design report generated successfully', undefined, 'human-design')

    return NextResponse.json({
      success: true,
      data: {
        chart: chartData,
        report,
        birthData: finalBirthData,
        generatedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('❌ Error generating Human Design report:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate Human Design report',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    )
  }
}

