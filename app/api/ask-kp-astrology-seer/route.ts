import { NextRequest } from 'next/server';
import { createAIStream } from '@/lib/aiGateway';
import { devLog } from '@/lib/devLogger';
import { buildKPSeerSystemPrompt } from '@/lib/kpSeerPrompts';
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

const CLARIFICATION_TIMING_MESSAGE =
  "To give timing in KP astrology, I need the exact outcome you're asking about. For example: 'Will my app launch succeed, and when?'";

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

    if (questionType === 'clarification_timing') {
      return new Response(
        new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode(CLARIFICATION_TIMING_MESSAGE));
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
    const systemPrompt = buildKPSeerSystemPrompt(chartSlice, questionType, {
      displayName: displayName || undefined,
    });

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
            devLog.error('KP Astrology Seer stream error:', error);
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
