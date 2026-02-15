import { NextRequest } from 'next/server'
import { createAIStream } from '@/lib/aiGateway'
import { devLog } from '@/lib/devLogger'
import {
  buildTarotState,
  classifyTarotQuestion,
  getTarotSliceForQuestionType,
  type TarotQuestionType
} from '@/lib/tarotSeerState'
import { buildTarotSeerSystemPrompt } from '@/lib/tarotSeerPrompts'

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
        "Tarot is not designed to answer this precisely (e.g. medical diagnosis, legal verdict, or exact numeric outcomes). Would you like a spread for situational guidance or readiness instead? Do a reading in the Reading tab, then ask about it here."
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
    const systemPrompt = buildTarotSeerSystemPrompt(chartSlice, questionType)

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
            devLog.error('Error during Tarot Seer streaming', error, 'ask-tarot-seer')
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
