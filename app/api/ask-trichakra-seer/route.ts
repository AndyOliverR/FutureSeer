import { NextRequest, NextResponse } from 'next/server'
import { enforceToolSeerGate } from '@/lib/enforceToolSeerGate'

import { appendAttribution } from '@/lib/attribution/attributionStamp'
import { callTextStream } from '@/lib/aiStructuredOutput';
import { cacheToolSeerAnswer } from '@/lib/toolSeerQuestionCache';
import { buildToolSeerMessages } from '@/lib/aiPromptBuilder';
import { devLog } from '@/lib/devLogger'
import {
  buildTrichakraState,
  classifyTrichakraQuestion,
  getTrichakraSliceForQuestionType
} from '@/lib/trichakraSeerState'
import type { TrichakraAnalysis } from '@/lib/trichakraIntelligence'
import { buildTrichakraSeerSystemPrompt } from '@/lib/trichakraSeerPrompts'

const X_ROBOTS_TAG = 'noindex, nofollow, noarchive, nosnippet'
const SEER_MARKER_FAMILY = 'ask-trichakra-seer'

function stampText(text: string): string {
  return appendAttribution(text, { markerFamily: SEER_MARKER_FAMILY })
}

function withRobotsResponse(body?: BodyInit | null, init?: ResponseInit): Response {
  const headers = new Headers(init?.headers)
  headers.set('X-Robots-Tag', X_ROBOTS_TAG)
  return new Response(body ?? null, { ...init, headers })
}

function jsonWithRobots(body: unknown, init?: ResponseInit): Response {
  const response = NextResponse.json(body, init)
  response.headers.set('X-Robots-Tag', X_ROBOTS_TAG)
  return response
}

interface TrichakraSeerRequest {
  userId: string
  question: string
  userProfile: Record<string, unknown>
  trichakraAnalysis?: unknown
  comprehensiveProfile?: Record<string, unknown>
  sessionId?: string
}

function getRefusalMessage(question: string): string {
  const lower = question.toLowerCase()
  if (/medical|diagnos|treatment|mental\s+health|therapy|cure\s+my|fix\s+my\s+health|replace\s+medical|substitute\s+for\s+(medical|doctor|therapy)/.test(lower)) {
    return 'Trichakra remedies are not a substitute for medical or mental health care. Please consult a qualified professional.'
  }
  return 'This question requires a predictive system, not a remedial one.'
}

function isTrichakraAnalysis(value: unknown): value is TrichakraAnalysis {
  return (
    typeof value === 'object' &&
    value !== null &&
    'userProfile' in value &&
    'remedies' in value
  )
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({})) as TrichakraSeerRequest
    const __toolSeerGate = await enforceToolSeerGate(request, body, 'ask_trichakra_seer')
    if (__toolSeerGate) return __toolSeerGate

    const { userId, question, userProfile } = body
    let trichakraAnalysis = isTrichakraAnalysis(body.trichakraAnalysis)
      ? body.trichakraAnalysis
      : undefined
    if (!trichakraAnalysis && body.comprehensiveProfile) {
      const cp = body.comprehensiveProfile
      const fallbackAnalysis = cp.trichakraMethod ?? cp.trichakra ?? cp['Trichakra']
      if (isTrichakraAnalysis(fallbackAnalysis)) {
        trichakraAnalysis = fallbackAnalysis
      }
    }

    if (!userId || !question || !userProfile) {
      return jsonWithRobots(
        { success: false, error: 'Missing required parameters: userId, question, or userProfile' },
        { status: 400 }
      )
    }

    if (!trichakraAnalysis) {
      return jsonWithRobots(
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
      return withRobotsResponse(
        new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode(stampText(refusalMessage)))
            controller.enqueue(new TextEncoder().encode(stampText('')))
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

    const { messages } = buildToolSeerMessages({
      systemContent: systemPrompt,
      userMessage: question.trim(),
    });

    const { stream } = await callTextStream({ label: 'ask-trichakra-seer', model: 'llama-3.3-70b-versatile',
      userId,
      cacheQuestion: typeof question === 'string' ? question.trim() : String(question).trim(),
      messages,
      temperature: 0.7,
      maxTokens: 1000
    })

    return withRobotsResponse(
      new ReadableStream({
        async start(controller) {
          try {
            let fullResponse = '';
            for await (const chunk of stream) {
              const content = chunk.choices[0]?.delta?.content || ''
              if (content) {
                fullResponse += content;
                controller.enqueue(new TextEncoder().encode(content));
              }
            }
            if (fullResponse.trim()) {
              await cacheToolSeerAnswer('ask-trichakra-seer', userId, question, fullResponse);
            }
          } catch (error) {
            devLog.error('Error during Trichakra Seer streaming:', error)
            controller.enqueue(
              new TextEncoder().encode(stampText('I apologize, but I encountered an error. Please try again.'))
            )
          } finally {
            controller.enqueue(new TextEncoder().encode(stampText('')))
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
    return jsonWithRobots(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
}
