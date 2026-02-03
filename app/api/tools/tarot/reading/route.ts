import { NextRequest, NextResponse } from 'next/server'
import { tarotIntelligence } from '@/lib/tarotIntelligence'
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

    devLog.info('🔮 Generating Tarot reading for user:', userId, 'tarot')
    devLog.debug('📝 Question:', question, 'tarot')
    devLog.debug('📊 Spread Type:', spreadType, 'tarot')

    // Fetch user profile to get display name
    let displayName: string | undefined = 'Seeker' // Default fallback
    if (userId) {
      try {
        const userProfile = await getUserProfile(userId)
        if (userProfile?.displayName) {
          displayName = userProfile.displayName
          devLog.debug('👤 Using display name:', displayName, 'tarot')
        }
      } catch (profileError) {
        devLog.warn('⚠️ Failed to fetch user profile (using default):', profileError, 'tarot')
        // Continue with default "Seeker"
      }
    }

    // Generate tarot reading
    const reading = await tarotIntelligence.drawCards(
      question.trim(),
      spreadType.trim(),
      displayName
    )

    // Save reading to database if userId provided
    if (userId) {
      try {
        await tarotIntelligence.saveReading(userId, reading)
        devLog.info('✅ Saved Tarot reading to database for user:', userId, 'tarot')
      } catch (saveError) {
        console.error('⚠️ Failed to save reading to database (non-critical):', saveError)
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
    console.error('Error generating tarot reading:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to generate tarot reading' 
      },
      { status: 500 }
    )
  }
}

