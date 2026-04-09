import { NextRequest, NextResponse } from 'next/server';
import { appendAttribution } from '@/lib/attribution/attributionStamp';
import { devLog } from '@/lib/devLogger';
import { createAIStream } from '@/lib/aiGateway';
import {
  buildSynastryDualChartState,
  classifySynastryQuestion,
  getSynastrySliceForQuestionType,
} from '@/lib/synastrySeerState';
import type { SynastryCompatibility } from '@/hooks/useSynastry';
import { buildSynastrySeerSystemPrompt } from '@/lib/synastrySeerPrompts';

const X_ROBOTS_TAG = 'noindex, nofollow, noarchive, nosnippet';
const SEER_MARKER_FAMILY = 'ask-synastry-seer';

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


interface AskSynastrySeerRequest {
  userId?: string;
  question: string;
  userProfile?: unknown;
  synastryAnalysis?: SynastryCompatibility;
}

const REFUSAL_MESSAGE =
  'Synastry describes interaction patterns, not fate outcomes. I can help with attraction, emotional compatibility, communication, power dynamics, or long-term friction—not marriage, breakup, or soulmate predictions.';

export async function POST(request: NextRequest) {
  try {
    const body: AskSynastrySeerRequest = await request.json();
    const { question, synastryAnalysis } = body;

    if (!question || !question.trim()) {
      return jsonWithRobots(
        { success: false, error: 'Question is required' },
        { status: 400 }
      );
    }

    if (
      !synastryAnalysis?.person1Natal ||
      !synastryAnalysis?.person2Natal
    ) {
      return jsonWithRobots(
        {
          success: false,
          error:
            'Two complete charts are required. Run Synastry analysis for both people first to use Ask the Seer.',
        },
        { status: 400 }
      );
    }

    const questionType = classifySynastryQuestion(question.trim());

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

    const state = buildSynastryDualChartState(synastryAnalysis);
    const chartSlice = getSynastrySliceForQuestionType(
      questionType,
      state,
      synastryAnalysis
    );

    const stream = await createAIStream({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: buildSynastrySeerSystemPrompt(chartSlice, questionType),
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
            devLog.error('Synastry Seer stream error:', error, 'route');
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
    devLog.error('Synastry Seer API error:', error, 'route');
    return jsonWithRobots(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to get response from Synastry Seer',
      },
      { status: 500 }
    );
  }
}
