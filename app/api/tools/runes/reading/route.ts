import { NextRequest, NextResponse } from 'next/server'
import { runesIntelligence } from '@/lib/runesIntelligence'
import { getUserProfile } from '@/lib/firebase'
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

    // Fetch user profile to get display name
    let displayName: string | undefined = undefined
    if (userId) {
      try {
        const userProfile = await getUserProfile(userId)
        if (userProfile?.displayName) {
          displayName = userProfile.displayName
          devLog.debug('👤 Using display name:', displayName, 'runes')
        }
      } catch (profileError) {
        devLog.warn('⚠️ Failed to fetch user profile (using default):', profileError, 'runes')
        // Continue without display name - readings work without it
      }
    }

    // Generate rune reading
    const reading = await runesIntelligence.castRunes(
      question.trim(),
      spreadType.trim(),
      displayName
    )

    // Save reading to database if userId provided
    if (userId) {
      try {
        await runesIntelligence.saveReading(userId, reading)
        devLog.info('✅ Saved Runes reading to database for user:', userId, 'runes')
      } catch (saveError) {
        devLog.error('Failed to save reading to database (non-critical)', saveError, 'runes-reading')
        // Continue even if save fails
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

