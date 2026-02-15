import { NextRequest, NextResponse } from 'next/server'
import { scryingIntelligence } from '@/lib/scryingIntelligence'
import { getUserProfile } from '@/lib/firebase'
import { devLog } from '@/lib/devLogger'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, method } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    const scryingMethod = method || 'crystal-ball'
    if (!['crystal-ball', 'mirror'].includes(scryingMethod)) {
      return NextResponse.json(
        { success: false, error: 'Valid method (crystal-ball or mirror) is required' },
        { status: 400 }
      )
    }

    devLog.info('🔮 Auto-generating Scrying profile for user:', userId, 'scrying')
    devLog.debug('🔍 Method:', scryingMethod, 'scrying')

    // Fetch user profile
    let userProfile
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
        { success: false, error: 'Complete profile (birth date, time, and place) is required for auto-generation' },
        { status: 400 }
      )
    }

    const birthDate = userProfile.birthDate
    const fullName = userProfile.fullName || userProfile.displayName || 'Seeker'
    const displayName = userProfile.displayName || fullName

    // Generate auto scrying profile
    const vision = await scryingIntelligence.generateVision(
      scryingMethod,
      undefined, // No question for auto-generation
      birthDate,
      fullName,
      displayName
    )

    // Save profile to database
    try {
      await scryingIntelligence.saveUserScryingProfile(userId, vision)
      devLog.info('✅ Saved Scrying profile to database for user:', userId, 'scrying')
    } catch (saveError) {
      devLog.error('Failed to save profile to database (non-critical)', saveError, 'scrying-generate')
      // Continue even if save fails
    }

    return NextResponse.json({
      success: true,
      data: {
        ...vision,
        timestamp: vision.timestamp.toISOString()
      }
    })
  } catch (error: any) {
    devLog.error('Error auto-generating scrying profile:', error, 'route')
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to generate scrying profile' 
      },
      { status: 500 }
    )
  }
}

