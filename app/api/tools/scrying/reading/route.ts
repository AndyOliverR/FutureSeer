import { NextRequest, NextResponse } from 'next/server'
import { scryingIntelligence } from '@/lib/scryingIntelligence'
import { getUserProfile } from '@/lib/firebase'
import { devLog } from '@/lib/devLogger'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { question, method, userId } = body

    if (!question || !question.trim()) {
      return NextResponse.json(
        { success: false, error: 'Question is required' },
        { status: 400 }
      )
    }

    if (!method || !['crystal-ball', 'mirror'].includes(method)) {
      return NextResponse.json(
        { success: false, error: 'Valid method (crystal-ball or mirror) is required' },
        { status: 400 }
      )
    }

    devLog.info('🔮 Generating Scrying vision for user:', userId, 'scrying')
    devLog.debug('📝 Question:', question, 'scrying')
    devLog.debug('🔍 Method:', method, 'scrying')

    // Fetch user profile to get display name
    let displayName: string | undefined = 'Seeker' // Default fallback
    let birthDate: string | undefined
    let fullName: string | undefined
    
    if (userId) {
      try {
        const userProfile = await getUserProfile(userId)
        if (userProfile?.displayName) {
          displayName = userProfile.displayName
          devLog.debug('👤 Using display name:', displayName, 'scrying')
        }
        birthDate = userProfile?.birthDate
        fullName = userProfile?.fullName || userProfile?.displayName
      } catch (profileError) {
        devLog.warn('⚠️ Failed to fetch user profile (using default):', profileError, 'scrying')
        // Continue with default "Seeker"
      }
    }

    // Generate scrying vision
    const vision = await scryingIntelligence.generateVision(
      method,
      question.trim(),
      birthDate,
      fullName,
      displayName
    )

    // Save reading to database if userId provided
    if (userId) {
      try {
        await scryingIntelligence.saveReading(userId, vision)
        devLog.info('✅ Saved Scrying reading to database for user:', userId, 'scrying')
      } catch (saveError) {
        console.error('⚠️ Failed to save reading to database (non-critical):', saveError)
        // Continue even if save fails
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ...vision,
        timestamp: vision.timestamp.toISOString()
      }
    })
  } catch (error: any) {
    console.error('Error generating scrying vision:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to generate scrying vision' 
      },
      { status: 500 }
    )
  }
}

