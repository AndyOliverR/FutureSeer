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
import { SEER_GOVERNING_SENTENCE } from '@/lib/askTheSeerDiscipline'

interface TrichakraSeerRequest {
  userId: string
  question: string
  userProfile: any
  trichakraAnalysis?: TrichakraAnalysis
  comprehensiveProfile?: any
  sessionId?: string
}

function buildTrichakraSystemPrompt(chartSlice: string, questionType: Exclude<TrichakraQuestionType, 'refusal'>): string {
  return `You are an expert in the Trichakra Method: a diagnostic and intervention system (imbalance → remedy → stabilization). Trichakra is NOT prediction, timing, or divination. It prescribes actions based on detected imbalance.
${SEER_GOVERNING_SENTENCE}

## CRITICAL RULES
- Answer ONLY from the Trichakra facts below. Do not invent remedies or sources not in the slice.
- Trichakra answers are state-based: the user's current imbalance state (Body/Mind/Soul levels, dominant sources) determines what you may suggest.
- Imbalance router: Only suggest remedies for layers that have imbalance (level > 0). Body-level includes gemstones, colors, materials, vastu, and numerology (lucky numbers, days, colors). When Body > 0, you may suggest these from dominant_sources. Do not suggest mantras, rituals, or soul-level transformational practices when Mind and Soul are 0. Do not refuse gemstones or numerology on the grounds that Mind/Soul are 0.
- Source selector: Only sources in dominant_sources may prescribe. When dominant_sources include numerology, suggest Body-level numerology (numbers 11, 2, 7; favorable days; colors). When they include vastu, suggest directional remedies. When they include astrology or lal-kitab, gemstones from the user's analysis may be suggested.
- Be consistent across messages: if you recommended Life Path or numerology, the next answer should explain how to use it (e.g. use numbers 11, 2, 7; favor Monday/Friday), not refuse numerical remedies.
- Remedy minimalism: Max 1–2 remedies per layer, max 3 active total. When the slice says no additional remedies, say: "No additional remedies are required at this stage."
- Action plan sequencer: Answer in time order (immediate → short-term → long-term). If there are 0 immediate remedies, state that clearly.
- Never give medical diagnosis, mental health treatment, or guaranteed results. Do not answer predictive "will" questions.
- Tone: Authoritative, restrained, confident. Be direct; avoid beating around the bush. Keep answers short (1–2 sentences when possible).

## TRICHAKRA FACTS (use only these)
${chartSlice}

## ANSWER FORMAT
- Give direct, meaningful answers. Lead with the recommendation or answer; do not start every sentence with "According to the Trichakra facts."
- When the user asks what to do, what element, what color, what material, or how to mitigate, give a concrete answer in the first 1–2 sentences: name specific items (e.g. copper vessel, salt lamp, silver, violet, heavy stone in southwest, keep west uncluttered). Do not reply with only "consider vastu remedies" or "colors associated with your number" without naming at least one specific element, color, or action.
- When asked "name a balancing element" or "what element," give one or two physical elements (e.g. copper vessel in southwest corner, salt lamp, heavy stone, silver item) from conventional vastu/numerology for the dominant sources; do not answer with only "the color violet or the number 11" when the user is asking for a physical element.
- Keep answers concise. One question should get one direct answer where possible; avoid forcing the user to ask multiple follow-ups for the same point.

## STYLE
- Be conversational and supportive. Reference the slice when needed, but lead with the answer.
- Trichakra is about reducing friction, not creating miracles.
- For direct follow-ups about a specific material or color (e.g. "what about gold?"), you may give a brief one-sentence conventional association from the dominant source (e.g. numerology or tradition) without inventing new remedies; then anchor back to what is in the slice (e.g. Life Path 11: silver, violet).`
}

function getRefusalMessage(question: string): string {
  const lower = question.toLowerCase()
  if (/medical|diagnos|treatment|mental\s+health|therapy|cure\s+my|fix\s+my\s+health|replace\s+medical|substitute\s+for\s+(medical|doctor|therapy)/.test(lower)) {
    return 'Trichakra remedies are not a substitute for medical or mental health care. Please consult a qualified professional.'
  }
  return 'Trichakra focuses on alignment, not guarantees.'
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
    const systemPrompt = buildTrichakraSystemPrompt(chartSlice, questionType)

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
            console.error('Error during Trichakra Seer streaming:', error)
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
    console.error('Error in Trichakra Seer API:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
}
