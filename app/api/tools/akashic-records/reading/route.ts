import { NextRequest, NextResponse } from 'next/server'
import { akashicRecordsIntelligence } from '@/lib/akashicRecordsIntelligence'
import { getUserProfile } from '@/lib/firebase'
import { devLog } from '@/lib/devLogger'

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

    devLog.info('📚 Generating Akashic Records reading for user:', userId, 'akashic')

    // Fetch user profile
    let userProfile = null
    try {
      userProfile = await getUserProfile(userId)
      if (userProfile) {
        devLog.debug('👤 User profile loaded:', {
          displayName: userProfile.displayName,
          hasBirthDate: !!userProfile.birthDate,
          hasBirthTime: !!userProfile.birthTime,
          hasBirthPlace: !!userProfile.birthPlace
        }, 'akashic')
      }
    } catch (profileError) {
      devLog.warn('⚠️ Failed to fetch user profile (continuing with basic reading):', profileError, 'akashic')
      // Continue - will generate basic reading
    }

    // Check profile completeness
    const hasCompleteProfile = userProfile?.birthDate && 
                               userProfile?.birthTime && 
                               userProfile?.birthPlace

    if (!hasCompleteProfile) {
      devLog.info('ℹ️ Profile incomplete - generating basic reading with completion prompt', undefined, 'akashic')
    } else {
      devLog.info('✅ Profile complete - generating comprehensive reading', undefined, 'akashic')
    }

    // Generate Akashic Records reading
    const reading = await akashicRecordsIntelligence.accessRecords(
      userId,
      userProfile
    )

    devLog.info('✅ Akashic Records reading generated successfully', undefined, 'akashic')

    return NextResponse.json({
      success: true,
      data: reading,
      profileComplete: hasCompleteProfile
    })
  } catch (error: any) {
    console.error('❌ Error generating Akashic Records reading:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate Akashic Records reading',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    )
  }
}

