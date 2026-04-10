import { NextRequest } from 'next/server'
import { enforceToolSeerGate } from '@/lib/enforceToolSeerGate'
import { appendAttribution } from '@/lib/attribution/attributionStamp';
import { createAIStream } from '@/lib/aiGateway';
import { devLog } from '@/lib/devLogger';
import { buildFengShuiSeerSystemPrompt } from '@/lib/fengShuiSeerPrompts';
import {
  buildFengShuiState,
  classifyFengShuiQuestion,
  getFengShuiSliceForQuestionType,
  type FengShuiQuestionType,
} from '@/lib/fengShuiSeerState';
import type { FengShuiAnalysis } from '@/lib/fengshui/fengShuiService';

const X_ROBOTS_TAG = 'noindex, nofollow, noarchive, nosnippet';
const SEER_MARKER_FAMILY = 'ask-feng-shui-seer';

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


interface FengShuiSeerRequest {
  userId: string;
  question: string;
  userProfile?: unknown;
  fengShuiAnalysis?: FengShuiAnalysis | null;
  comprehensiveProfile?: Record<string, unknown>;
  sessionId?: string;
  /** User-provided facing direction (e.g. North, East). Enables layout-aware advice. */
  facing_direction?: string;
  /** User-provided layout: main_door, bedroom, kitchen, toilet directions. */
  layout?: { main_door?: string; bedroom?: string; kitchen?: string; toilet?: string };
  property_type?: string;
  usage?: string;
}

function getDisplayName(userProfile: unknown): string | undefined {
  if (!userProfile || typeof userProfile !== 'object') return undefined;
  const displayName = (userProfile as Record<string, unknown>).displayName;
  if (typeof displayName !== 'string') return undefined;
  const trimmed = displayName.trim();
  return trimmed || undefined;
}

function isFengShuiAnalysis(value: unknown): value is FengShuiAnalysis {
  return (
    typeof value === 'object' &&
    value !== null &&
    'kua' in value &&
    typeof (value as { kua?: unknown }).kua === 'object' &&
    (value as { kua?: unknown }).kua !== null
  );
}

const ANALYSIS_REQUIRED_MESSAGE =
  'Feng Shui analysis requires profile data. Complete your profile and generate Feng Shui analysis first to use Ask the Seer.';

function getRefusalMessage(): string {
  return 'Feng Shui adjusts environmental influence, not destiny. Feng Shui analysis requires accurate spatial data to be reliable.';
}

export async function POST(request: NextRequest) {
  try {
    const body: FengShuiSeerRequest = await request.json();
    const __toolSeerGate = await enforceToolSeerGate(request, body, 'ask_feng_shui_seer')
    if (__toolSeerGate) return __toolSeerGate

    const {
      userId,
      question,
      userProfile,
      facing_direction,
      layout,
      property_type,
      usage,
    } = body;
    let fengShuiAnalysis = isFengShuiAnalysis(body.fengShuiAnalysis)
      ? body.fengShuiAnalysis
      : null;
    if (!fengShuiAnalysis && body.comprehensiveProfile) {
      const cp = body.comprehensiveProfile;
      const fallbackAnalysis =
        cp.fengShui ?? cp['Feng Shui'] ?? cp.vastu ?? cp['Vastu'];
      if (isFengShuiAnalysis(fallbackAnalysis)) {
        fengShuiAnalysis = fallbackAnalysis;
      }
    }

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

    const hasKua = fengShuiAnalysis?.kua != null;

    if (!fengShuiAnalysis || !hasKua) {
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
      state = buildFengShuiState(fengShuiAnalysis, {
        facing_direction,
        layout,
        property_type,
        usage,
      });
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

    const questionType = classifyFengShuiQuestion(question.trim()) as FengShuiQuestionType;
    devLog.info(
      '🔮 Feng Shui Seer API: Question type',
      questionType,
      'ask-feng-shui-seer'
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

    const slice = getFengShuiSliceForQuestionType(
      questionType,
      state,
      fengShuiAnalysis
    );

    const displayName = getDisplayName(userProfile);
    const systemPrompt = buildFengShuiSeerSystemPrompt(slice, questionType, {
      displayName,
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

    return withRobotsResponse(
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
            devLog.error('Feng Shui Seer stream error:', error);
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
      '❌ Error in Feng Shui Seer API:',
      error,
      'ask-feng-shui-seer'
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
