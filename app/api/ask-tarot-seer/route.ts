import { NextRequest } from 'next/server'
import { enforceToolSeerGate } from '@/lib/enforceToolSeerGate'

import { appendAttribution } from '@/lib/attribution/attributionStamp'
import { callTextStream } from '@/lib/aiStructuredOutput';
import { cacheToolSeerAnswer } from '@/lib/toolSeerQuestionCache';
import { buildToolSeerMessages } from '@/lib/aiPromptBuilder'
import { historyFromSeerBody } from '@/lib/seerChatVoice';
import { devLog } from '@/lib/devLogger'
import {
  buildTarotState,
  classifyTarotQuestion,
  getTarotSliceForQuestionType
} from '@/lib/tarotSeerState'
import { buildTarotSeerSystemPrompt } from '@/lib/tarotSeerPrompts'
import { searchKnowledge, formatKnowledgeForPrompt, extractKeyTopics } from '@/lib/knowledgeLoader'
import { GROQ_DEFAULT_TEXT_MODEL } from '@/lib/groqModels';

const X_ROBOTS_TAG = 'noindex, nofollow, noarchive, nosnippet'
const SEER_MARKER_FAMILY = 'ask-tarot-seer'

function stampText(text: string): string {
  return appendAttribution(text, { markerFamily: SEER_MARKER_FAMILY })
}

function withRobotsResponse(body?: BodyInit | null, init?: ResponseInit): Response {
  const headers = new Headers(init?.headers)
  headers.set('X-Robots-Tag', X_ROBOTS_TAG)
  return new Response(body ?? null, { ...init, headers })
}

interface TarotSeerRequest {
  userId: string
  question: string
  userProfile: Record<string, unknown>
  tarotProfileData?: Record<string, unknown>
  westernAstrologyData?: Record<string, unknown>
  numerologyData?: Record<string, unknown>
  combinedSystemData?: { tarotProfile?: Record<string, unknown> }
  currentReading?: Record<string, unknown>
  sessionId?: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const __toolSeerGate = await enforceToolSeerGate(request, body, 'ask_tarot_seer')
    if (__toolSeerGate) return __toolSeerGate

    const {
      userId,
      question,
      userProfile,
      tarotProfileData,
      combinedSystemData,
      currentReading
    }: TarotSeerRequest = body

    if (!userId || !question || !userProfile) {
      return withRobotsResponse(
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

    const profileSource = tarotProfileData || combinedSystemData?.tarotProfile
    const tarotState = buildTarotState(profileSource, currentReading)
    const chartSlice = getTarotSliceForQuestionType(questionType, tarotState)

    let knowledgeContext = '';
    try {
      const topics = extractKeyTopics(question);
      const kbResults = searchKnowledge(topics.join(' '), ['tarot']);
      knowledgeContext = formatKnowledgeForPrompt(kbResults);
    } catch { /* KB is optional; do not fail the request */ }

    const systemPrompt = buildTarotSeerSystemPrompt(chartSlice, questionType, knowledgeContext)

    const { messages } = buildToolSeerMessages({
      systemContent: systemPrompt,
      userMessage: question.trim(),
      history: historyFromSeerBody(body),
    });

    const { stream } = await callTextStream({ label: 'ask-tarot-seer', model: GROQ_DEFAULT_TEXT_MODEL,
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
              await cacheToolSeerAnswer('ask-tarot-seer', userId, question, fullResponse);
            }
          } catch (error) {
            devLog.error('Error during Tarot Seer streaming', error, 'ask-tarot-seer')
            controller.enqueue(
              new TextEncoder().encode(stampText('I apologize, but I encountered an error. Please try again.'))
            )
          } finally {
            controller.enqueue(new TextEncoder().encode(stampText('')))
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
  } catch (error: unknown) {
    devLog.error('❌ Error in Tarot Seer API:', error, 'ask-tarot-seer')
    return withRobotsResponse(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process question'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
