import { NextRequest, NextResponse } from 'next/server'
import { bibliomancyIntelligence, SacredTextType } from '@/lib/bibliomancyIntelligence'
import { getUserProfile } from '@/lib/firebase'
import { devLog, devWarn } from '@/lib/devLogger'

const VALID_TEXT_TYPES: SacredTextType[] = ['bible', 'quran', 'bhagavad-gita', 'torah', 'hafez']

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, question, textType } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Validate textType
    const selectedTextType: SacredTextType = textType && VALID_TEXT_TYPES.includes(textType) 
      ? textType 
      : 'bible' // Default to bible for backward compatibility

    if (textType && !VALID_TEXT_TYPES.includes(textType)) {
      devWarn(`⚠️ Invalid textType "${textType}", defaulting to "bible"`)
    }

    devLog.info('📖 Generating bibliomancy reading for user:', userId, 'bibliomancy')

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
        }, 'bibliomancy')
      }
    } catch (profileError) {
      devWarn('⚠️ Failed to fetch user profile (continuing with basic reading):', profileError)
      // Continue - will generate basic reading
    }

    // Check profile completeness
    const hasCompleteProfile = userProfile?.birthDate && 
                               userProfile?.birthTime && 
                               userProfile?.birthPlace

    if (!hasCompleteProfile) {
      devLog.info('ℹ️ Profile incomplete - generating basic reading with completion prompt', undefined, 'bibliomancy')
    } else {
      devLog.info('✅ Profile complete - generating comprehensive reading', undefined, 'bibliomancy')
    }

    // Generate bibliomancy reading
    const reading = await bibliomancyIntelligence.generateReading(
      userId,
      userProfile,
      question,
      selectedTextType
    )

    devLog.info('✅ Bibliomancy reading generated successfully', undefined, 'bibliomancy')

    return NextResponse.json({
      success: true,
      data: reading,
      profileComplete: hasCompleteProfile
    })
  } catch (error: any) {
    devLog.error('❌ Error generating bibliomancy reading:', error, 'route')
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate bibliomancy reading',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    )
  }
}

