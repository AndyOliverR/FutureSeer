import { NextRequest, NextResponse } from 'next/server'
import { createAIStream } from '@/lib/aiGateway'
import { devLog } from '@/lib/devLogger'
import {
  buildTrichakraState,
  classifyTrichakraQuestion,
  getTrichakraSliceForQuestionType,
  type TrichakraQuestionType
} from '@/lib/trichakraSeerState'
import type { TrichakraAnalysis } from '@/lib/trichakraIntelligence'
import { buildTrichakraSeerSystemPrompt } from '@/lib/trichakraSeerPrompts'

interface TrichakraSeerRequest {
  userId: string
  question: string
  userProfile: any
  trichakraAnalysis?: TrichakraAnalysis
  comprehensiveProfile?: any
  sessionId?: string
}

function getRefusalMessage(question: string): string {
  const lower = question.toLowerCase()
  if (/medical|diagnos|treatment|mental\s+health|therapy|cure\s+my|fix\s+my\s+health|replace\s+medical|substitute\s+for\s+(medical|doctor|therapy)/.test(lower)) {
    return 'Trichakra remedies are not a substitute for medical or mental health care. Please consult a qualified professional.'
  }
  return 'This question requires a predictive system, not a remedial one.'
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({})) as TrichakraSeerRequest
    const { userId, question, userProfile } = body
    let trichakraAnalysis = body.trichakraAnalysis
    if (!trichakraAnalysis && body.comprehensiveProfile) {
      const cp = body.comprehensiveProfile
      trichakraAnalysis = cp.trichakraMethod ?? cp.trichakra ?? cp['Trichakra']
    }

    if (!userId || !question || !userProfile) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters: userId, question, or userProfile' },
        { status: 400 }
      )
    }

    if (!trichakraAnalysis) {
      return NextResponse.json(
        {
          success: false,
          error: 'Your current Trichakra state is unavailable. Should I regenerate it?'
        },
        { status: 400 }
      )
    }

    devLog.info('✨ Trichakra Seer API: Processing question for user:', userId, 'ask-trichakra-seer')

    const state = buildTrichakraState(trichakraAnalysis)
    const questionType = classifyTrichakraQuestion(question)

    if (questionType === 'refusal') {
      const refusalMessage = getRefusalMessage(question)
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

    const chartSlice = getTrichakraSliceForQuestionType(questionType, state)
    const systemPrompt = buildTrichakraSeerSystemPrompt(chartSlice, questionType)

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
            devLog.error('Error during Trichakra Seer streaming:', error)
            controller.enqueue(
              new TextEncoder().encode('I apologize, but I encountered an error. Please try again.')
            )
          }
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
  } catch (error) {
    devLog.error('Error in Trichakra Seer API:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
}
