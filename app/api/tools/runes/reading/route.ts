import { NextRequest, NextResponse } from 'next/server'
import { runesIntelligence } from '@/lib/runesIntelligence'
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

    devLog.info('ᚱ Generating Runes reading for user:', userId, 'runes')
    devLog.debug('📝 Question:', question, 'runes')
    devLog.debug('📊 Spread Type:', spreadType, 'runes')

    let displayName: string | undefined = undefined
    let canPersist = false
    if (userId && typeof userId === 'string') {
      const auth = await verifyUserRequest(request, 'runes')
      const access = decideUserScopedAccess(userId, auth)
      if (access.kind === 'owned') {
        canPersist = true
        try {
          const userProfile = await getUserProfile(access.userId)
          if (userProfile?.displayName) {
            displayName = userProfile.displayName
            devLog.debug('👤 Using display name:', displayName, 'runes')
          }
        } catch (profileError) {
          devLog.warn('⚠️ Failed to fetch user profile (using default):', profileError, 'runes')
        }
      }
    }

    const reading = await runesIntelligence.castRunes(
      question.trim(),
      spreadType.trim(),
      displayName
    )

    if (canPersist && userId) {
      try {
        await runesIntelligence.saveReading(userId, reading)
        devLog.info('✅ Saved Runes reading to database for user:', userId, 'runes')
      } catch (saveError) {
        devLog.error('Failed to save reading to database (non-critical)', saveError, 'runes-reading')
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
    devLog.error('Error generating runes reading:', error, 'route')
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to generate runes reading' 
      },
      { status: 500 }
    )
  }
}
