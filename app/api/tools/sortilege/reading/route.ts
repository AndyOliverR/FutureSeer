import { NextRequest, NextResponse } from 'next/server'
import { sortilegeIntelligence, CastingMethod } from '@/lib/sortilegeIntelligence'
import { getUserProfile, isProfileComplete } from '@/lib/firebase'
import { devLog, devWarn } from '@/lib/devLogger'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { question, method, userId, userProfile: providedProfile } = body

    devLog.debug('🪄 [SORTILEGE API] Request received:', {
      hasQuestion: !!question,
      method,
      hasUserId: !!userId,
      hasProfile: !!providedProfile
    }, 'sortilege')

    // Validation
    if (!question || !question.trim()) {
      console.error('❌ [SORTILEGE API] Missing question')
      return NextResponse.json(
        { success: false, error: 'Question is required' },
        { status: 400 }
      )
    }

    if (!method || !['dice', 'stones', 'cards', 'coins', 'sticks'].includes(method)) {
      console.error('❌ [SORTILEGE API] Invalid method:', method)
      return NextResponse.json(
        { success: false, error: 'Valid method (dice, stones, cards, coins, or sticks) is required' },
        { status: 400 }
      )
    }

    if (!userId) {
      console.error('❌ [SORTILEGE API] Missing userId')
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    devLog.info('🪄 [SORTILEGE API] Generating reading for user:', userId, 'sortilege')
    devLog.debug('📝 [SORTILEGE API] Question:', question, 'sortilege')
    devLog.debug('🎲 [SORTILEGE API] Method:', method, 'sortilege')

    // Get user profile
    let userProfile = providedProfile
    if (!userProfile && userId) {
      try {
        devLog.debug('📂 [SORTILEGE API] Fetching user profile...', undefined, 'sortilege')
        userProfile = await getUserProfile(userId)
        devLog.debug('✅ [SORTILEGE API] Profile fetched:', {
          hasProfile: !!userProfile,
          hasBirthDate: !!userProfile?.birthDate,
          hasBirthTime: !!userProfile?.birthTime,
          hasBirthPlace: !!userProfile?.birthPlace
        }, 'sortilege')
      } catch (profileError) {
        devWarn('⚠️ [SORTILEGE API] Failed to fetch user profile:', profileError)
      }
    }

    // Check profile completeness (optional but recommended for personalized readings)
    const profileComplete = userProfile ? isProfileComplete(userProfile) : false
    if (!profileComplete) {
      devLog.warn('⚠️ [SORTILEGE API] Profile incomplete - generating general reading', undefined, 'sortilege')
    } else {
      devLog.info('✅ [SORTILEGE API] Profile complete - generating personalized reading', undefined, 'sortilege')
    }

    // Generate sortilege reading
    devLog.debug('🔮 [SORTILEGE API] Calling sortilegeIntelligence.generateReading...', undefined, 'sortilege')
    const reading = await sortilegeIntelligence.generateReading(
      userId,
      question.trim(),
      method as CastingMethod,
      userProfile || undefined
    )

    devLog.info('✅ [SORTILEGE API] Reading generated successfully:', {
      id: reading.id,
      method: reading.method,
      hasCastResult: !!reading.castResult,
      hasComprehensiveReport: !!reading.comprehensiveReport,
      hasOverview: !!reading.comprehensiveReport?.overview,
      hasGuidance: !!reading.comprehensiveReport?.guidance?.length
    }, 'sortilege')

    return NextResponse.json({
      success: true,
      data: {
        ...reading,
        castResult: {
          ...reading.castResult,
          timestamp: reading.castResult.timestamp.toISOString()
        },
        profileComplete
      }
    })
  } catch (error: any) {
    console.error('❌ [SORTILEGE API] Error generating sortilege reading:', error)
    console.error('❌ [SORTILEGE API] Error stack:', error.stack)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to generate sortilege reading. Please try again.' 
      },
      { status: 500 }
    )
  }
}

