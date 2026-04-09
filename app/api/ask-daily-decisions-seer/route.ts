import { NextRequest, NextResponse } from 'next/server';
import { appendAttribution } from '@/lib/attribution/attributionStamp';
import { devLog } from '@/lib/devLogger';
import { createAIStream } from '@/lib/aiGateway';
import {
  buildDailyDecisionState,
  classifyDailyDecisionQuestion,
  getDailyDecisionSliceForQuestionType,
} from '@/lib/dailyDecisionsSeerState';
import type { DailyDecisionsAnalysis } from '@/lib/dailyDecisionsIntelligence';
import { buildDailyDecisionSeerSystemPrompt } from '@/lib/dailyDecisionsSeerPrompts';

const X_ROBOTS_TAG = 'noindex, nofollow, noarchive, nosnippet';
const SEER_MARKER_FAMILY = 'ask-daily-decisions-seer';

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


interface AskDailyDecisionsSeerRequest {
  userId?: string;
  question: string;
  userProfile?: unknown;
  dailyDecisionsAnalysis?: DailyDecisionsAnalysis;
  selectedDate?: string;
}

const REFUSAL_MESSAGE =
  'Daily Decisions addresses timing suitability, not outcomes. I can tell you whether today is suitable for an activity and when to avoid inauspicious times.';

export async function POST(request: NextRequest) {
  try {
    const body: AskDailyDecisionsSeerRequest = await request.json();
    const { question, dailyDecisionsAnalysis, selectedDate } = body;

    if (!question || !question.trim()) {
      return jsonWithRobots(
        { success: false, error: 'Question is required' },
        { status: 400 }
      );
    }

    if (!dailyDecisionsAnalysis) {
      return jsonWithRobots(
        {
          success: false,
          error:
            'Daily Decisions recommendations are required. Generate your recommendations first to use Ask the Seer.',
        },
        { status: 400 }
      );
    }

    const questionType = classifyDailyDecisionQuestion(question.trim());

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

    const state = buildDailyDecisionState(
      dailyDecisionsAnalysis,
      selectedDate ?? dailyDecisionsAnalysis.date
    );
    const chartSlice = getDailyDecisionSliceForQuestionType(questionType, state);

    const stream = await createAIStream({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: buildDailyDecisionSeerSystemPrompt(chartSlice, questionType),
        },
        { role: 'user', content: question.trim() },
      ],
      temperature: 0.5,
      maxTokens: 600,
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
            devLog.error('Daily Decisions Seer stream error:', error, 'route');
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
    devLog.error('Daily Decisions Seer API error:', error, 'route');
    const message = error instanceof Error ? error.message : '';
    const isRateLimit =
      (error as { status?: number })?.status === 429 ||
      message.includes('429') ||
      message.includes('rate limit') ||
      message.includes('Rate limit');
    if (isRateLimit) {
      return jsonWithRobots(
        {
          success: false,
          error:
            'Our AI service is temporarily rate-limited. Please try again in about 15 minutes, or upgrade your API tier for higher limits.',
        },
        { status: 503 }
      );
    }
    return jsonWithRobots(
      {
        success: false,
        error:
          message || 'Failed to get response from Daily Decisions Seer',
      },
      { status: 500 }
    );
  }
}
