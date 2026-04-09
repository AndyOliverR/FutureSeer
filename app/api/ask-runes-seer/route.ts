import { NextRequest } from 'next/server';
import { appendAttribution } from '@/lib/attribution/attributionStamp';
import { createAIStream } from '@/lib/aiGateway';
import { devLog } from '@/lib/devLogger';
import { buildRunesSeerSystemPrompt } from '@/lib/runesSeerPrompts';
import {
  buildRuneState,
  classifyRuneQuestion,
  getRunesSliceForQuestionType,
  type RuneQuestionType,
} from '@/lib/runesSeerState';
import type { RuneReading } from '@/lib/runesIntelligence';

const X_ROBOTS_TAG = 'noindex, nofollow, noarchive, nosnippet';
const SEER_MARKER_FAMILY = 'ask-runes-seer';

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


interface RunesSeerRequest {
  userId: string;
  question: string;
  userProfile?: unknown;
  runeReading?: RuneReading | null;
  sessionId?: string;
}

function getDisplayName(userProfile: unknown): string | undefined {
  if (!userProfile || typeof userProfile !== 'object') return undefined;
  const displayName = (userProfile as Record<string, unknown>).displayName;
  if (typeof displayName !== 'string') return undefined;
  const trimmed = displayName.trim();
  return trimmed || undefined;
}

const READING_REQUIRED_MESSAGE =
  'Cast runes first to use Ask the Seer. Perform a rune reading in the Reading tab.';

function getRefusalMessage(): string {
  return 'Runes indicate forces and consequences, not fixed outcomes. Runes reveal the nature of forces at play, not the certainty of results.';
}

export async function POST(request: NextRequest) {
  try {
    const body: RunesSeerRequest = await request.json();
    const { userId, question, userProfile, runeReading } = body;

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

    const hasRunes =
      Array.isArray(runeReading?.runes) && runeReading.runes.length > 0;

    if (!runeReading || !hasRunes) {
      return withRobotsResponse(
        JSON.stringify({
          success: false,
          error: READING_REQUIRED_MESSAGE,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    let state;
    try {
      state = buildRuneState(runeReading);
    } catch {
      return withRobotsResponse(
        JSON.stringify({
          success: false,
          error: READING_REQUIRED_MESSAGE,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const questionType = classifyRuneQuestion(question.trim()) as RuneQuestionType;
    devLog.info(
      'ᚱ Runes Seer API: Question type',
      questionType,
      'ask-runes-seer'
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

    const chartSlice = getRunesSliceForQuestionType(
      questionType,
      state,
      runeReading
    );

    const displayName = getDisplayName(userProfile);
    const systemPrompt = buildRunesSeerSystemPrompt(chartSlice, questionType, {
      displayName,
    });

    const userMessage = question.trim();

    const stream = await createAIStream({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.6,
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
            devLog.error('Runes Seer stream error:', error);
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
    devLog.error('❌ Error in Runes Seer API:', error, 'ask-runes-seer');
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
