import { NextRequest, NextResponse } from 'next/server'
import { akashicRecordsIntelligence } from '@/lib/akashicRecordsIntelligence'
import { loadOwnedUserProfile } from '@/lib/security/loadOwnedUserProfile'
import { devLog } from '@/lib/devLogger'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, userProfile: providedProfile } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    devLog.info('📚 Generating Akashic Records reading for user:', userId, 'akashic')

    // Prefer body profile (Stage B). Firestore load requires ownership.
    let userProfile = providedProfile ?? null
    if (!userProfile) {
      const loaded = await loadOwnedUserProfile(request, userId, 'akashic')
      if (!loaded.ok) {
        return NextResponse.json(
          { success: false, error: loaded.error },
          { status: loaded.status },
        )
      }
      userProfile = loaded.profile
      devLog.debug('👤 Owned user profile loaded:', {
        displayName: userProfile.displayName,
        hasBirthDate: !!userProfile.birthDate,
        hasBirthTime: !!userProfile.birthTime,
        hasBirthPlace: !!userProfile.birthPlace
      }, 'akashic')
    } else {
      devLog.debug('👤 Using profile from request (pipeline)', undefined, 'akashic')
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
    devLog.error('❌ Error generating Akashic Records reading:', error, 'route')
    
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

