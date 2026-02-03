import { NextRequest } from 'next/server';
import { createAIStream } from '@/lib/aiGateway';
import { devLog } from '@/lib/devLogger';
import {
  buildKPChartState,
  classifyKPQuestion,
  getKPSliceForQuestionType,
  type KPQuestionType,
} from '@/lib/kpSeerState';
import type { KPAnalysis } from '@/lib/kpAstrologyIntelligence';

interface KPSeerRequest {
  userId: string;
  question: string;
  userProfile?: any;
  kpAnalysis?: KPAnalysis | null;
  sessionId?: string;
}

const ANALYSIS_REQUIRED_MESSAGE =
  'KP astrology requires a precise question and exact chart data. Generate your KP analysis first to use Ask the Seer.';

function getRefusalMessage(): string {
  return 'KP astrology requires a precise question and exact chart data. KP astrology answers outcome-based questions, not explanations.';
}

export async function POST(request: NextRequest) {
  try {
    const body: KPSeerRequest = await request.json();
    const { userId, question, userProfile, kpAnalysis } = body;

    if (!userId || !question?.trim()) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required parameters: userId or question',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const hasCusps =
      Array.isArray(kpAnalysis?.cusps) && kpAnalysis.cusps.length > 0;
    const hasTiming = !!kpAnalysis?.timingAnalysis;

    if (!kpAnalysis || !hasCusps || !hasTiming) {
      return new Response(
        JSON.stringify({
          success: false,
          error: ANALYSIS_REQUIRED_MESSAGE,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    let state;
    try {
      state = buildKPChartState(kpAnalysis, question.trim());
    } catch {
      return new Response(
        JSON.stringify({
          success: false,
          error: ANALYSIS_REQUIRED_MESSAGE,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const questionType = classifyKPQuestion(question.trim()) as KPQuestionType;
    devLog.info(
      '🔮 KP Astrology Seer API: Question type',
      questionType,
      'ask-kp-astrology-seer'
    );

    if (questionType === 'refusal') {
      const refusalText = getRefusalMessage();
      return new Response(
        new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode(refusalText));
            controller.close();
          },
        }),
        {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          },
        }
      );
    }

    const chartSlice = getKPSliceForQuestionType(
      questionType,
      state,
      kpAnalysis
    );

    const displayName = (userProfile?.displayName ?? '').trim();
    const namingRule = displayName
      ? `The user's display name is "${displayName}". Address them only by this name. Do not use generic terms.`
      : 'If no display name is provided, you may use a brief generic address.';

    const systemPrompt = `You are an expert KP (Krishnamurti Paddhati) astrologer. In KP, the Sub-Lord decides. Always.

RULES:
- ${namingRule}
- Answer only outcome-based, binary questions (yes / no / conditional or delayed). Do not narrate stories or give personality readings.
- Follow the MATTER RULE in the chart state: for questions with NO denial houses (e.g. job, venture, loan, litigation win), say YES if the relevant cusp sub-lords signify ANY of the support houses listed; say NO only when they do NOT signify any support house. Do not invent "denial" or "neutral" when the matter has no denial houses.
- Do not default to NO. Judge only from the cusp sub-lords of the RELEVANT houses and the Significators map (a planet signifies the houses listed next to it). A sub-lord supports the outcome if it signifies a support house for this matter.
- Use the KP chart state below. Route strictly via relevant houses; let the cusp sub-lord decide. Rank significators: planet in house > lord of house > star-lord of planet in house.
- Dasha confirms timing; it cannot override a denying sub-lord. Favorable sub-lord + wrong Dasha → delay, not denial.
- State which houses support or deny the matter. Answer directly and traceably.
- Refuse: no clear question, non-binary questions, "why/what should I do", "when exactly", or remedy requests. Say: "KP astrology requires a precise question and exact chart data."
- Permanent rule: KP answers outcomes; Vedic answers periods; Tarot answers process.

KP CHART STATE (use this only):
${chartSlice}

Answer the user's question using the chart state above. Keep language direct, traceable, and non-emotional.`;

    const userMessage = question.trim();

    const stream = await createAIStream({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.5,
      maxTokens: 800,
    });

    return new Response(
      new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of stream) {
              const content = chunk.choices[0]?.delta?.content ?? '';
              if (content) {
                controller.enqueue(new TextEncoder().encode(content));
              }
            }
          } catch (error) {
            console.error('KP Astrology Seer stream error:', error);
            controller.enqueue(
              new TextEncoder().encode(
                'I encountered an error. Please try again.'
              )
            );
          } finally {
            controller.close();
          }
        },
      }),
      {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      }
    );
  } catch (error: unknown) {
    devLog.error(
      '❌ Error in KP Astrology Seer API:',
      error,
      'ask-kp-astrology-seer'
    );
    return new Response(
      JSON.stringify({
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to process question',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
