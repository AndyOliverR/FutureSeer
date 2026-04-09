import { NextRequest, NextResponse } from 'next/server';
import { appendAttribution } from '@/lib/attribution/attributionStamp';
import { devLog } from '@/lib/devLogger';
import { createAIStream } from '@/lib/aiGateway';
import {
  buildEnergyState,
  classifyEnergyQuestion,
  getEnergySliceForQuestionType,
  ENERGY_REFUSAL_DATA_PHRASE,
  ENERGY_REFUSAL_MEDICAL_PHRASE,
  type EnergyQuestionType,
} from '@/lib/energyHealingSeerState';
import { buildEnergyHealingSeerSystemPrompt } from '@/lib/energyHealingSeerPrompts';

const X_ROBOTS_TAG = 'noindex, nofollow, noarchive, nosnippet';
const SEER_MARKER_FAMILY = 'ask-energy-healing-seer';

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


interface EnergyHealingSeerRequest {
  question: string;
  analysis?: any;
  conversationHistory?: Array<{ question: string; answer: string }>;
  /** Aggregator contract */
  userId?: string;
  userProfile?: any;
  comprehensiveProfile?: any;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      question,
      analysis: bodyAnalysis,
      conversationHistory = [],
      comprehensiveProfile,
    }: EnergyHealingSeerRequest = body;
    const analysis = bodyAnalysis ?? comprehensiveProfile?.energyHealing ?? comprehensiveProfile?.['Energy & Healing'];

    if (!question?.trim()) {
      return jsonWithRobots({ error: 'Question is required' }, { status: 400 });
    }

    if (!process.env.GROQ_API_KEY) {
      return jsonWithRobots(
        { error: 'GROQ_API_KEY is not configured' },
        { status: 500 }
      );
    }

    // Data requirement: need sufficient analysis
    let state;
    try {
      state = buildEnergyState(analysis);
    } catch {
      return jsonWithRobots(
        { error: ENERGY_REFUSAL_DATA_PHRASE },
        { status: 400 }
      );
    }

    const questionType = classifyEnergyQuestion(question.trim()) as EnergyQuestionType;

    if (questionType === 'refusal') {
      return withRobotsResponse(
        new ReadableStream({
          start(controller) {
            controller.enqueue(
              new TextEncoder().encode(stampText(ENERGY_REFUSAL_MEDICAL_PHRASE))
            );
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

    const slice = getEnergySliceForQuestionType(questionType, state);
    const systemPrompt = buildEnergyHealingSeerSystemPrompt(slice, questionType);

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...conversationHistory.flatMap((item) => [
        { role: 'user' as const, content: item.question },
        { role: 'assistant' as const, content: item.answer },
      ]),
      { role: 'user' as const, content: question.trim() },
    ];

    const stream = await createAIStream({
      model: 'llama-3.3-70b-versatile',
      messages,
      temperature: 0.6,
      maxTokens: 800,
    });

    return withRobotsResponse(
      new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of stream) {
              const content = chunk.choices?.[0]?.delta?.content ?? '';
              if (content) {
                controller.enqueue(new TextEncoder().encode(content));
              }
            }
          } catch (error) {
            devLog.error('Error during energy healing seer streaming:', error, 'route');
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
    devLog.error('Error in energy healing seer:', error, 'route');
    return jsonWithRobots(
      {
        error:
          error instanceof Error ? error.message : 'Failed to get response',
      },
      { status: 500 }
    );
  }
}
