import { NextRequest } from 'next/server'
import { enforceToolSeerGate } from '@/lib/enforceToolSeerGate'
import { appendAttribution } from '@/lib/attribution/attributionStamp';
import { callTextStream } from '@/lib/aiStructuredOutput';
import { cacheToolSeerAnswer } from '@/lib/toolSeerQuestionCache';
import { buildToolSeerMessages } from '@/lib/aiPromptBuilder';
import { devLog } from '@/lib/devLogger';
import type { DreamAnalysis, DreamData } from '@/lib/dreamSymbolsIntelligence';
import { buildDreamSymbolsSeerSystemPrompt } from '@/lib/dreamSymbolsSeerPrompts';
import {
  buildDreamState,
  classifyDreamSymbolsQuestion,
  getDreamSymbolsSliceForQuestionType,
  type DreamSymbolsQuestionType,
} from '@/lib/dreamSymbolsSeerState';

const X_ROBOTS_TAG = 'noindex, nofollow, noarchive, nosnippet';
const SEER_MARKER_FAMILY = 'ask-dream-symbols-seer';

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


interface DreamSymbolsSeerRequest {
  userId: string;
  question: string;
  userProfile?: unknown;
  dreamSymbolsAnalysis?: unknown;
  dreamData?: unknown;
  comprehensiveProfile?: Record<string, unknown>;
  sessionId?: string;
}

function getDisplayName(userProfile: unknown): string | undefined {
  if (!userProfile || typeof userProfile !== 'object') return undefined;
  const displayName = (userProfile as Record<string, unknown>).displayName;
  if (typeof displayName !== 'string') return undefined;
  const trimmed = displayName.trim();
  return trimmed || undefined;
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isDreamAnalysis(value: unknown): value is DreamAnalysis {
  if (!isRecord(value)) return false;

  const hasDescription =
    typeof value.dreamDescription === 'string' &&
    value.dreamDescription.trim().length > 0;
  const hasSymbols = Array.isArray(value.symbols) && value.symbols.length > 0;

  return hasDescription || hasSymbols;
}

function isDreamData(value: unknown): value is DreamData {
  if (!isRecord(value)) return false;
  if (typeof value.dreamType !== 'string') return false;
  const validDreamTypes = new Set([
    'lucid',
    'recurring',
    'nightmare',
    'prophetic',
    'ordinary',
  ]);
  return validDreamTypes.has(value.dreamType);
}

const ANALYSIS_REQUIRED_MESSAGE =
  'Generate Dream Symbols analysis first to use Ask the Seer.';

function getRefusalMessage(): string {
  return 'Dream symbols cannot determine external outcomes. Dreams symbolize internal processing, not literal events.';
}

export async function POST(request: NextRequest) {
  try {
    const body: DreamSymbolsSeerRequest = await request.json();
    const __toolSeerGate = await enforceToolSeerGate(request, body, 'ask_dream_symbols_seer')
    if (__toolSeerGate) return __toolSeerGate

    const { userId, question, userProfile } = body;
    let dreamSymbolsAnalysis = isDreamAnalysis(body.dreamSymbolsAnalysis)
      ? body.dreamSymbolsAnalysis
      : undefined;
    if (!dreamSymbolsAnalysis && body.comprehensiveProfile) {
      const fallbackAnalysis =
        body.comprehensiveProfile.dreamSymbols ??
        body.comprehensiveProfile['Dream Symbols'];
      if (isDreamAnalysis(fallbackAnalysis)) {
        dreamSymbolsAnalysis = fallbackAnalysis;
      }
    }
    const dreamData = isDreamData(body.dreamData) ? body.dreamData : null;

    if (!userId || !question) {
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

    const hasDescription =
      typeof dreamSymbolsAnalysis?.dreamDescription === 'string' &&
      dreamSymbolsAnalysis.dreamDescription.trim().length > 0;
    const hasSymbols =
      Array.isArray(dreamSymbolsAnalysis?.symbols) &&
      dreamSymbolsAnalysis.symbols.length > 0;

    if (!dreamSymbolsAnalysis || (!hasDescription && !hasSymbols)) {
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
      state = buildDreamState(dreamSymbolsAnalysis, dreamData);
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

    const questionType = classifyDreamSymbolsQuestion(
      question
    ) as DreamSymbolsQuestionType;
    devLog.info(
      '🔮 Dream Symbols Seer API: Question type',
      questionType,
      'ask-dream-symbols-seer'
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

    devLog.info(
      '🔮 Dream Symbols Seer API: Processing question for user:',
      userId,
      'ask-dream-symbols-seer'
    );

    const chartSlice = getDreamSymbolsSliceForQuestionType(
      questionType,
      state,
      dreamSymbolsAnalysis
    );

    const displayName = getDisplayName(userProfile);
    const systemPrompt = buildDreamSymbolsSeerSystemPrompt(chartSlice, questionType, {
      displayName,
    });

    const userMessage = question.trim();

    const { messages } = buildToolSeerMessages({
      systemContent: systemPrompt,
      userMessage: userMessage,
    });

    const { stream } = await callTextStream({ label: 'ask-dream-symbols-seer', model: 'llama-3.3-70b-versatile',
      userId,
      cacheQuestion: typeof question === 'string' ? question.trim() : String(question).trim(),
      messages,
      temperature: 0.7,
      maxTokens: 1000,
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
              await cacheToolSeerAnswer('ask-dream-symbols-seer', userId, question, fullResponse);
            }
          } catch (error) {
            devLog.error('Dream Symbols Seer stream error:', error);
            controller.enqueue(
              new TextEncoder().encode(
                'I apologize, but I encountered an error. Please try again.'
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
      '❌ Error in Dream Symbols Seer API:',
      error,
      'ask-dream-symbols-seer'
    );
    return withRobotsResponse(
      JSON.stringify({
        success: false,
        error: getErrorMessage(error, 'Failed to process question'),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
