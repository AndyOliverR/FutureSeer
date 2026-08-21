import { NextRequest, NextResponse } from 'next/server'
import { tarotIntelligence } from '@/lib/tarotIntelligence'
import { getUserProfile } from '@/lib/firebase'
import { verifyUserRequest } from '@/lib/userApiAuth'
import { decideUserScopedAccess } from '@/lib/security/userScopedAccess'
import { devLog } from '@/lib/devLogger'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { question, spreadType, userId } = body

    if (!question || !question.trim()) {
      return NextResponse.json(
        { success: false, error: 'Question is required' },
        { status: 400 }
      )
    }

    if (!spreadType || !spreadType.trim()) {
      return NextResponse.json(
        { success: false, error: 'Spread type is required' },
        { status: 400 }
      )
    }

    devLog.info('🔮 Generating Tarot reading for user:', userId, 'tarot')
    devLog.debug('📝 Question:', question, 'tarot')
    devLog.debug('📊 Spread Type:', spreadType, 'tarot')

    let displayName: string | undefined = 'Seeker'
    let canPersist = false
    if (userId && typeof userId === 'string') {
      const auth = await verifyUserRequest(request, 'tarot')
      const access = decideUserScopedAccess(userId, auth)
      if (access.kind === 'owned') {
        canPersist = true
        try {
          const userProfile = await getUserProfile(access.userId)
          if (userProfile?.displayName) {
            displayName = userProfile.displayName
            devLog.debug('👤 Using display name:', displayName, 'tarot')
          }
        } catch (profileError) {
          devLog.warn('⚠️ Failed to fetch user profile (using default):', profileError, 'tarot')
        }
      }
    }

    const reading = await tarotIntelligence.drawCards(
      question.trim(),
      spreadType.trim(),
      displayName
    )

    if (canPersist && userId) {
      try {
        await tarotIntelligence.saveReading(userId, reading)
        devLog.info('✅ Saved Tarot reading to database for user:', userId, 'tarot')
      } catch (saveError) {
        devLog.error('Failed to save reading to database (non-critical)', saveError, 'tarot-reading')
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ...reading,
        timestamp: reading.timestamp.toISOString()
      }
    })
  } catch (error: any) {
    devLog.error('Error generating tarot reading:', error, 'route')
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to generate tarot reading' 
      },
      { status: 500 }
    )
  }
}
