import { NextRequest, NextResponse } from 'next/server'
import { baziIntelligence } from '@/lib/baziIntelligence'
import { getUserProfile } from '@/lib/firebase'
import { devLog } from '@/lib/devLogger'

export const dynamic = 'force-static'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    devLog.info('🏮 Generating BaZi reading for user:', userId, 'bazi')

    // Fetch user profile
    let userProfile
    try {
      userProfile = await getUserProfile(userId)
    } catch (profileError) {
      console.error('⚠️ Failed to fetch user profile:', profileError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch user profile' },
        { status: 400 }
      )
    }

    // Check if profile is complete
    if (!userProfile?.birthDate || !userProfile?.birthTime || !userProfile?.birthPlace) {
      return NextResponse.json(
        { success: false, error: 'Complete profile (birth date, time, and place) is required for BaZi analysis' },
        { status: 400 }
      )
    }

    // Generate BaZi reading
    const reading = await baziIntelligence.getBaziReading(userId, userProfile)

    return NextResponse.json({
      success: true,
      data: {
        ...reading,
        metadata: {
          ...reading.metadata,
          lastUpdated: reading.metadata.lastUpdated.toISOString()
        }
      }
    })
  } catch (error: any) {
    console.error('Error generating BaZi reading:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to generate BaZi reading' 
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

    devLog.info('🏮 Fetching BaZi reading for user:', userId, 'bazi')

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
        { success: false, error: 'Complete profile (birth date, time, and place) is required for BaZi analysis' },
        { status: 400 }
      )
    }

    // Get BaZi reading (will use cache if available)
    const reading = await baziIntelligence.getBaziReading(userId, userProfile)

    return NextResponse.json({
      success: true,
      data: {
        ...reading,
        metadata: {
          ...reading.metadata,
          lastUpdated: reading.metadata.lastUpdated.toISOString()
        }
      }
    })
  } catch (error: any) {
    console.error('Error fetching BaZi reading:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch BaZi reading' 
      },
      { status: 500 }
    )
  }
}

