import { NextRequest, NextResponse } from 'next/server'
import { lenormandIntelligence, LenormandReading } from '@/lib/lenormandIntelligence'
import { getUserProfile } from '@/lib/firebase'
import { analyzeSpreadCombinations, generateFallbackInterpretation } from '@/lib/lenormandCombinations'
import { callTextAI } from '@/lib/aiStructuredOutput'
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

    devLog.info('🌸 Generating Lenormand reading for user:', userId, 'lenormand')
    devLog.debug('📝 Question:', question, 'lenormand')
    devLog.debug('📊 Spread Type:', spreadType, 'lenormand')

    // Fetch display name / allow persist only for authenticated owner
    let displayName: string | undefined = 'Seeker' // Default fallback
    let canPersist = false
    if (userId && typeof userId === 'string') {
      const auth = await verifyUserRequest(request, 'lenormand')
      const access = decideUserScopedAccess(userId, auth)
      if (access.kind === 'owned') {
        canPersist = true
        try {
          const userProfile = await getUserProfile(access.userId)
          if (userProfile?.displayName) {
            displayName = userProfile.displayName
            devLog.debug('👤 Using display name:', displayName, 'lenormand')
          }
        } catch (profileError) {
          devLog.warn('⚠️ Failed to fetch user profile (using default):', profileError, 'lenormand')
        }
      }
    }

    // Generate card spread
    const spread = lenormandIntelligence['generateSpread'](question.trim(), spreadType.trim())
    const cards = spread.cards
    const positions = spread.positions

    // Get spread name for user-friendly display
    const spreadNames: Record<string, string> = {
      'single': 'Single Card',
      'three': 'Three-Card Spread',
      'nine': 'Nine-Card Spread (Petite Tableau)',
      'lineOfFive': 'Line of Five',
      'grandTableau': 'Grand Tableau'
    }
    const spreadName = spreadNames[spreadType] || spreadType

    // Analyze card combinations
    const cardCombinations = analyzeSpreadCombinations(cards)
    
    // Build base interpretations
    const individualCardReadings = cards.map((card, index) => {
      return {
        cardName: card.name,
        position: positions[index],
        interpretation: `${card.description}. Position: ${positions[index]}. Advice: ${card.advice}`
      }
    })

    // Generate overall reading using hybrid approach (pre-written + Groq)
    let overallReading = ''
    let combinationReadings: Array<{ cards: string[]; meaning: string }> = []
    let advice: string[] = []
    let timing = ''

    try {
      // Build context for Groq
      const cardDescriptions = cards.map((card, i) => 
        `${positions[i]}: ${card.name} - ${card.description}`
      ).join('\n')

      const combinationText = cardCombinations.length > 0
        ? cardCombinations.map(c => 
            `Combination: ${c.cards.join(' + ')} - ${c.combination.meaning}`
          ).join('\n')
        : 'No specific traditional combinations found'

      const systemPrompt = `You are a master Lenormand reader with deep knowledge of traditional Lenormand card reading. Lenormand readings are practical, direct, and focus on everyday life matters. Unlike Tarot, Lenormand cards are read syntactically (like words forming sentences) and emphasize card combinations.

Guidelines:
- Be practical and direct, focusing on external events and situations
- Emphasize card combinations - the meaning emerges from how cards relate
- Address the user by their name directly
- Provide clear timing indicators when possible
- Offer actionable, everyday advice
- No reversals in Lenormand - all cards have positive/neutral/negative based on context
- Focus on "what, when, and where" more than deep psychology`

      const userPrompt = `Generate a Lenormand reading for ${displayName}:

Question: ${question}

Spread: ${spreadName}
Cards drawn:
${cardDescriptions}

Card Combinations:
${combinationText}

Generate:
1. Overall reading: A cohesive narrative weaving all cards together (3-5 sentences)
2. Combination analysis: Brief interpretation of any combinations found (2-3 sentences)
3. Key advice: 3-5 actionable, practical pieces of guidance
4. Timing insights: When this situation might unfold based on card timing indicators

Write in a warm, practical voice addressing ${displayName} directly.`

      const result = await callTextAI({
        label: 'lenormand-reading',
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        maxTokens: 1500,
        maxAttempts: 2,
      })

      const aiResponse = result.content
      
      // Parse AI response into sections
      const sections = aiResponse.split(/\d+\.\s+(.+?):/g)
      overallReading = aiResponse.substring(0, 300).trim() // Fallback to first part
      
      // Try to extract structured sections
      for (let i = 0; i < sections.length; i += 2) {
        const sectionName = sections[i]?.toLowerCase() || ''
        const sectionContent = sections[i + 1]?.trim() || ''
        
        if (sectionName.includes('overall')) {
          overallReading = sectionContent
        } else if (sectionName.includes('combination')) {
          // Extract combination meanings
          const comboLines = sectionContent.split('\n')
          comboLines.forEach(line => {
            const match = line.match(/Combination:\s*(.+?)\s*[-–]\s*(.+)/)
            if (match) {
              combinationReadings.push({
                cards: match[1].split(' + '),
                meaning: match[2].trim()
              })
            }
          })
        } else if (sectionName.includes('advice')) {
          const adviceLines = sectionContent.split(/[•\-\n]/)
          advice = adviceLines
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .slice(0, 5)
        } else if (sectionName.includes('timing')) {
          timing = sectionContent
        }
      }

      // Fallback if parsing failed
      if (!overallReading || overallReading.length < 50) {
        overallReading = aiResponse
      }
      if (advice.length === 0) {
        advice = cards.slice(0, 3).map(c => c.advice)
      }

      devLog.info('✅ Groq generated reading successfully', undefined, 'lenormand')

    } catch (groqError: any) {
      devLog.warn('⚠️ Groq error, using fallback interpretations:', groqError.message, 'lenormand')
      
      // Fallback to pre-written interpretations
      overallReading = `The ${spreadName} reveals a story for ${displayName}. ${cards.map((card, i) => 
        `In the ${positions[i]} position, ${card.name} brings ${card.keywords.join(', ')}.`
      ).join(' ')}`
      
      combinationReadings = cardCombinations.map(c => ({
        cards: c.cards,
        meaning: c.combination.meaning
      }))
      
      advice = cards.slice(0, 5).map(c => c.advice)
      timing = cards.map(c => c.timing).filter(Boolean).join('; ') || 'Variable timing'
    }

    // Create reading object
    const reading: LenormandReading = {
      id: `lenormand_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      question: question.trim(),
      spreadType: spreadType,
      cards: cards,
      positions: positions,
      overallReading: overallReading,
      individualCardReadings: individualCardReadings,
      combinations: combinationReadings,
      advice: advice.slice(0, 5),
      timing: timing || cards.map(c => c.timing).find(t => t) || 'Timing will unfold naturally',
      timestamp: new Date()
    }

    // Persist only when the caller owns userId (Stage B / anonymous skip save).
    if (canPersist && userId) {
      try {
        await lenormandIntelligence.saveReading(userId, reading)
        devLog.info('✅ Saved Lenormand reading to database for user:', userId, 'lenormand')
      } catch (saveError) {
        devLog.error('Failed to save reading to database (non-critical)', saveError, 'lenormand-reading')
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
    devLog.error('Error generating Lenormand reading:', error, 'route')
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to generate Lenormand reading' 
      },
      { status: 500 }
    )
  }
}

