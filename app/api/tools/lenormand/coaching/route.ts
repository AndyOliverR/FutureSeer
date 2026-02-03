import { NextRequest, NextResponse } from 'next/server'
import { getUserProfile } from '@/lib/firebase'
import { LENORMAND_DECK } from '@/lib/lenormandIntelligence'
import { createAICompletion } from '@/lib/aiGateway'
import { devLog } from '@/lib/devLogger'


export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { question, userId } = body

    if (!question || !question.trim()) {
      return NextResponse.json(
        { success: false, error: 'Question is required' },
        { status: 400 }
      )
    }

    devLog.info('🌸 Generating Lenormand coaching response for user:', userId, 'lenormand')
    devLog.debug('📝 Question:', question, 'lenormand')

    // Fetch user profile to get display name
    let displayName: string | undefined = 'Seeker' // Default fallback
    if (userId) {
      try {
        const userProfile = await getUserProfile(userId)
        if (userProfile?.displayName) {
          displayName = userProfile.displayName
          devLog.debug('👤 Using display name:', displayName, 'lenormand')
        }
      } catch (profileError) {
        devLog.warn('⚠️ Failed to fetch user profile (using default):', profileError, 'lenormand')
        // Continue with default "Seeker"
      }
    }

    // Get all card names for context
    const cardNames = LENORMAND_DECK.map(card => card.name).join(', ')
    
    // Build system prompt for Lenormand coaching
    const systemPrompt = `You are a master Lenormand teacher and guide specializing in the 36-card Lenormand system. Your expertise includes:
- Traditional Lenormand card meanings and symbolism
- Card combination interpretations (how cards interact)
- Spread layouts and reading techniques
- Practical, everyday guidance (not deep psychology)
- Timing indicators and practical applications
- The grammatical/syntactic nature of Lenormand readings
- Historical context and traditional methods

You address students warmly but authoritatively, providing clear, practical answers. You focus on teaching how Lenormand actually works in practice.`

    const userPrompt = `${displayName} asks: "${question}"

Provide a helpful, educational response about Lenormand. Be specific, practical, and grounded in traditional Lenormand wisdom. If the question is about specific cards or combinations, reference the 36 traditional cards: ${cardNames}.

Keep your response conversational yet informative, helping ${displayName} deepen their understanding of Lenormand reading.`

    const result = await createAICompletion({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      maxTokens: 800
    })

    const aiResponse = result.content || ''
    
    devLog.info('✅ Groq generated coaching response successfully', undefined, 'lenormand')

    return NextResponse.json({
      success: true,
      data: {
        guidance: aiResponse
      }
    })

  } catch (error: any) {
    console.error('❌ Error generating Lenormand coaching:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate coaching response',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

