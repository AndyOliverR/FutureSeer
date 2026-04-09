import { NextRequest, NextResponse } from 'next/server';
import { appendAttribution } from '@/lib/attribution/attributionStamp';
import { devLog } from '@/lib/devLogger';
import { createAIStream } from '@/lib/aiGateway';
import {
  buildBaziChartState,
  classifyBaziQuestion,
  getBaziSliceForQuestionType,
} from '@/lib/baziSeerState';
import type { BaziReading } from '@/lib/baziIntelligence';
import { buildBaziSeerSystemPrompt } from '@/lib/baziSeerPrompts';

const X_ROBOTS_TAG = 'noindex, nofollow, noarchive, nosnippet';
const SEER_MARKER_FAMILY = 'ask-bazi-seer';

function stampText(text: string): string {
  return appendAttribution(text, { markerFamily: SEER_MARKER_FAMILY });
}

function stampAnswerFields(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stampAnswerFields);
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if ((k === 'answer' || k === 'response' || k === 'reply') && typeof v === 'string') {
        out[k] = stampText(v);
      } else {
        out[k] = stampAnswerFields(v);
      }
    }
    return out;
  }
  return value;
}

function jsonWithRobots(body: unknown, init?: ResponseInit): Response {
  const response = NextResponse.json(stampAnswerFields(body), init);
  response.headers.set('X-Robots-Tag', X_ROBOTS_TAG);
  return response;
}

function appendAttributionTail(controller: ReadableStreamDefaultController<Uint8Array>): void {
  controller.enqueue(new TextEncoder().encode(stampText('')));
}

function withRobotsResponse(body?: BodyInit | null, init?: ResponseInit): Response {
  const headers = new Headers(init?.headers);
  headers.set('X-Robots-Tag', X_ROBOTS_TAG);
  return new Response(body ?? null, { ...init, headers });
}


interface AskBaziSeerRequest {
  userId?: string;
  question: string;
  userProfile?: unknown;
  baziReading?: BaziReading;
}

const REFUSAL_MESSAGE =
  'BaZi works in phases, not daily moments. I can help with life direction, career suitability, wealth patterns, relationship tendency, health constitution, or timing by decade (Luck Cycle).';

export async function POST(request: NextRequest) {
  try {
    const body: AskBaziSeerRequest = await request.json();
    const { question, baziReading } = body;

    if (!question || !question.trim()) {
      return jsonWithRobots(
        { success: false, error: 'Question is required' },
        { status: 400 }
      );
    }

    if (!baziReading) {
      return jsonWithRobots(
        {
          success: false,
          error:
            'BaZi reading is required. Generate your BaZi reading first to use Ask the Seer.',
        },
        { status: 400 }
      );
    }

    const questionType = classifyBaziQuestion(question.trim());

    if (questionType === 'refusal') {
      return withRobotsResponse(
        new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode(stampText(REFUSAL_MESSAGE)));
            appendAttributionTail(controller);
            controller.close();
          },
        }),
        {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
          },
        }
      );
    }

    const state = buildBaziChartState(baziReading);
    const chartSlice = getBaziSliceForQuestionType(
      questionType,
      state,
      baziReading
    );

    const stream = await createAIStream({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: buildBaziSeerSystemPrompt(chartSlice, questionType),
        },
        { role: 'user', content: question.trim() },
      ],
      temperature: 0.5,
      maxTokens: 700,
    });

    return withRobotsResponse(
      new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of stream) {
              const content = chunk.choices[0]?.delta?.content || '';
              if (content) {
                controller.enqueue(new TextEncoder().encode(content));
              }
            }
          } catch (error) {
            devLog.error('BaZi Seer stream error:', error, 'route');
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
          Connection: 'keep-alive',
        },
      }
    );
  } catch (error: unknown) {
    devLog.error('BaZi Seer API error:', error, 'route');
    return jsonWithRobots(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to get response from BaZi Seer',
      },
      { status: 500 }
    );
  }
}
