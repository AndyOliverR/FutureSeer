import { NextRequest } from 'next/server'
import { enforceToolSeerGate } from '@/lib/enforceToolSeerGate'
import { appendAttribution } from '@/lib/attribution/attributionStamp';
import { callTextStream } from '@/lib/aiStructuredOutput';
import { cacheToolSeerAnswer } from '@/lib/toolSeerQuestionCache';
import { buildToolSeerMessages } from '@/lib/aiPromptBuilder'
import { historyFromSeerBody } from '@/lib/seerChatVoice';
import { devLog } from '@/lib/devLogger';
import { buildKPSeerSystemPrompt } from '@/lib/kpSeerPrompts';
import {
  buildKPChartState,
  classifyKPQuestion,
  getKPSliceForQuestionType,
  type KPQuestionType,
} from '@/lib/kpSeerState';
import type { KPAnalysis } from '@/lib/kpAstrologyIntelligence';
import { GROQ_DEFAULT_TEXT_MODEL } from '@/lib/groqModels';

const X_ROBOTS_TAG = 'noindex, nofollow, noarchive, nosnippet';
const SEER_MARKER_FAMILY = 'ask-kp-astrology-seer';

function stampText(text: string): string {
  return appendAttribution(text, { markerFamily: SEER_MARKER_FAMILY });
}

function appendAttributionTail(controller: ReadableStreamDefaultController<Uint8Array>): void {
  controller.enqueue(new TextEncoder().encode(stampText('')));
}

function withRobotsResponse(body?: BodyInit | null, init?: ResponseInit): Response {
  const headers = new Headers(init?.headers);
  headers.set('X-Robots-Tag', X_ROBOTS_TAG);
  return new Response(body ?? null, { ...init, headers });
}


interface KPSeerRequest {
  userId: string;
  question: string;
  userProfile?: unknown;
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

function getDisplayName(userProfile: unknown): string | undefined {
  if (!userProfile || typeof userProfile !== 'object') return undefined;
  const displayName = (userProfile as Record<string, unknown>).displayName;
  if (typeof displayName !== 'string') return undefined;
  const trimmed = displayName.trim();
  return trimmed || undefined;
}

export async function POST(request: NextRequest) {
  try {
    const body: KPSeerRequest = await request.json();
    const __toolSeerGate = await enforceToolSeerGate(request, body, 'ask_kp_astrology_seer')
    if (__toolSeerGate) return __toolSeerGate

    const { userId, question, userProfile, kpAnalysis } = body;

    if (!userId || !question?.trim()) {
      return withRobotsResponse(
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
      return withRobotsResponse(
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
      return withRobotsResponse(
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
      return withRobotsResponse(
        new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode(refusalText));
            appendAttributionTail(controller);
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
      return withRobotsResponse(
        new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode(CLARIFICATION_TIMING_MESSAGE));
            appendAttributionTail(controller);
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

    const displayName = getDisplayName(userProfile);
    const systemPrompt = buildKPSeerSystemPrompt(chartSlice, questionType, {
      displayName,
    });

    const userMessage = question.trim();

    const { messages } = buildToolSeerMessages({
      systemContent: systemPrompt,
      userMessage: userMessage,
      history: historyFromSeerBody(body),
    });

    const { stream } = await callTextStream({ label: 'ask-kp-astrology-seer', model: GROQ_DEFAULT_TEXT_MODEL,
      userId,
      cacheQuestion: typeof question === 'string' ? question.trim() : String(question).trim(),
      messages,
      temperature: 0.5,
      maxTokens: 800,
    });

    return withRobotsResponse(
      new ReadableStream({
        async start(controller) {
          try {
            let fullResponse = '';
            for await (const chunk of stream) {
              const content = chunk.choices[0]?.delta?.content ?? '';
              if (content) {
                fullResponse += content;
                controller.enqueue(new TextEncoder().encode(content));
              }
            }
            if (fullResponse.trim()) {
              await cacheToolSeerAnswer('ask-kp-astrology-seer', userId, question, fullResponse);
            }
          } catch (error) {
            devLog.error('KP Astrology Seer stream error:', error);
            controller.enqueue(
              new TextEncoder().encode(
                'I encountered an error. Please try again.'
              )
            );
          } finally {
            appendAttributionTail(controller);
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
    return withRobotsResponse(
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
