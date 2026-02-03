import { NextRequest } from 'next/server'
import { createAIStream } from '@/lib/aiGateway'
import { devLog } from '@/lib/devLogger'
import {
  buildTarotState,
  classifyTarotQuestion,
  getTarotSliceForQuestionType,
  SPREAD_SUGGESTION_BY_TYPE,
  type TarotQuestionType
} from '@/lib/tarotSeerState'
import { SEER_GOVERNING_SENTENCE } from '@/lib/askTheSeerDiscipline'

interface TarotSeerRequest {
  userId: string
  question: string
  userProfile: any
  tarotProfileData?: any
  westernAstrologyData?: any
  numerologyData?: any
  combinedSystemData?: any
  currentReading?: any
  sessionId?: string
}

function buildTarotSystemPrompt(chartSlice: string, questionType: TarotQuestionType): string {
  const suggestedSpread =
    questionType !== 'refusal' && questionType !== 'profile_only'
      ? SPREAD_SUGGESTION_BY_TYPE[questionType]
      : null

  return `You are an expert Tarot reader. You must reason ONLY from the Tarot facts provided below. Do not invent cards or positions not in the slice.
${SEER_GOVERNING_SENTENCE}

## CRITICAL RULES
- Answer strictly using the Tarot facts below (profile + current reading if any). Do not use generic Tarot knowledge beyond what the slice supports.
- Never say "there is no information" or "no chart" when profile or reading is present in the slice. The facts below are from the user's Tarot profile and/or their last reading on this page.
- Use only: card names, positions, orientation (upright/reversed), elements (Wands=Fire, Cups=Water, Swords=Air, Pentacles=Earth). Explain relationships between cards and positions, not just individual meanings.

## TAROT REASONING
- Position first: a "good" card in a challenging position is still a challenge; position meaning matters more than card meaning alone.
- Major Arcana carry more narrative weight than Minor Arcana.
- Suits = domains: Wands=action/fire, Cups=emotion/water, Swords=mind/air, Pentacles=resources/earth.
- Explain flow between cards (e.g. conflict to resolution, block to action to outcome).

## VALIDITY AND LIMITS
- Readings apply to the next 4–6 weeks. Tarot does not predict exact dates or long-term fate.
- When there is no reading in context (slice says "No reading in context"), you must first answer using the Tarot profile (Birth, Life Path, Soul, Personality) to give practical guidance; then you may suggest a spread for more detail. Do not only suggest a spread without giving profile-based guidance.
- Never claim exact timing or a definitive yes/no when the spread does not support it.

## CHART FACTS (use only these)
${chartSlice}
${suggestedSpread ? `\nSuggested spread for this type of question: ${suggestedSpread}` : ''}

## STYLE
- Keep answers short: 1–2 sentences when possible; expand only if the user asks for more.
- Be conversational, warm, and supportive. State why you're saying something by referencing the slice explicitly. Be direct; no beating around the bush. Descriptive but brief.`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const {
      userId,
      question,
      userProfile,
      tarotProfileData,
      westernAstrologyData,
      numerologyData,
      combinedSystemData,
      currentReading,
      sessionId
    }: TarotSeerRequest = body

    if (!userId || !question || !userProfile) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required parameters: userId, question, or userProfile'
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    devLog.info('🔮 Tarot Seer API: Processing question for user:', userId, 'ask-tarot-seer')

    const questionType = classifyTarotQuestion(question)

    // Refusal: stream a short message and exit
    if (questionType === 'refusal') {
      const refusalMessage =
        "Tarot cannot determine exact dates or long-term fate. Would you like a spread for the next 4–6 weeks? Do a reading in the Reading tab, then ask about it here."
      return new Response(
        new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode(refusalMessage))
            controller.close()
          }
        }),
        {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
          }
        }
      )
    }

    const profileSource = tarotProfileData || combinedSystemData?.tarotProfile
    const tarotState = buildTarotState(profileSource, currentReading)
    const chartSlice = getTarotSliceForQuestionType(questionType, tarotState)
    const systemPrompt = buildTarotSystemPrompt(chartSlice, questionType)

    const stream = await createAIStream({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question.trim() }
      ],
      temperature: 0.7,
      maxTokens: 1000
    })

    return new Response(
      new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of stream) {
              const content = chunk.choices[0]?.delta?.content || ''
              if (content) controller.enqueue(new TextEncoder().encode(content))
            }
          } catch (error) {
            console.error('Error during Tarot Seer streaming:', error)
            controller.enqueue(
              new TextEncoder().encode('I apologize, but I encountered an error. Please try again.')
            )
          } finally {
            controller.close()
          }
        }
      }),
      {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        }
      }
    )
  } catch (error: any) {
    devLog.error('❌ Error in Tarot Seer API:', error, 'ask-tarot-seer')
    return new Response(
      JSON.stringify({
        success: false,
        error: error?.message || 'Failed to process question'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
