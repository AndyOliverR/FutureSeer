import { NextRequest, NextResponse } from 'next/server'
import { enforceToolSeerGate, resolveToolSeerUserId } from '@/lib/enforceToolSeerGate'
import { appendAttribution } from '@/lib/attribution/attributionStamp';
import { devLog } from '@/lib/devLogger';
import { callTextStream } from '@/lib/aiStructuredOutput';
import { cacheToolSeerAnswer } from '@/lib/toolSeerQuestionCache';
import { buildToolSeerMessages } from '@/lib/aiPromptBuilder';
import { buildOghamSeerSystemPrompt } from '@/lib/oghamSeerPrompts';
import {
  buildOghamState,
  classifyOghamQuestion,
  getOghamSliceForQuestionType,
  OGHAM_REFUSAL_DATA_PHRASE,
  OGHAM_REFUSAL_OUTCOME_PHRASE,
  type OghamQuestionType,
} from '@/lib/oghamSeerState';

const X_ROBOTS_TAG = 'noindex, nofollow, noarchive, nosnippet';
const SEER_MARKER_FAMILY = 'ask-ogham-seer';

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


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const __toolSeerGate = await enforceToolSeerGate(request, body, 'ask_ogham_seer')
    if (__toolSeerGate) return __toolSeerGate

    const userId = await resolveToolSeerUserId(request, body, 'ask_ogham_seer')
    if (!userId) {
      return jsonWithRobots({ error: 'Unauthorized' }, { status: 401 })
    }

    const { question } = body;
    let oghamReport = body.oghamReport;
    if (!oghamReport && body.comprehensiveProfile) {
      oghamReport = body.comprehensiveProfile.ogham ?? body.comprehensiveProfile['Ogham'];
    }

    if (!question?.trim()) {
      return jsonWithRobots(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    const reportData = oghamReport?.data ?? oghamReport;
    let state;
    try {
      state = buildOghamState(reportData);
    } catch {
      return jsonWithRobots(
        { error: OGHAM_REFUSAL_DATA_PHRASE },
        { status: 400 }
      );
    }

    const questionType = classifyOghamQuestion(question.trim()) as OghamQuestionType;

    if (questionType === 'refusal') {
      return withRobotsResponse(
        new ReadableStream({
          start(controller) {
            controller.enqueue(
              new TextEncoder().encode(stampText(OGHAM_REFUSAL_OUTCOME_PHRASE))
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

    const slice = getOghamSliceForQuestionType(questionType, state);
    const systemPrompt = buildOghamSeerSystemPrompt(slice, questionType);

    const { messages } = buildToolSeerMessages({
      systemContent: systemPrompt,
      userMessage: question.trim(),
    });

    const { stream } = await callTextStream({ label: 'ask-ogham-seer', model: 'llama-3.3-70b-versatile',
      userId,
      cacheQuestion: typeof question === 'string' ? question.trim() : String(question).trim(),
      messages,
      temperature: 0.6,
      maxTokens: 800,
    });

    return withRobotsResponse(
      new ReadableStream({
        async start(controller) {
          try {
            let fullResponse = '';
            for await (const chunk of stream) {
              const content = chunk.choices?.[0]?.delta?.content ?? '';
              if (content) {
                fullResponse += content;
                controller.enqueue(new TextEncoder().encode(content));
              }
            }
            if (fullResponse.trim()) {
              await cacheToolSeerAnswer('ask-ogham-seer', userId, question, fullResponse);
            }
          } catch (error) {
            devLog.error('Error during Ogham seer streaming:', error, 'route');
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
    devLog.error('Ogham Seer API error:', error, 'route');
    return jsonWithRobots(
      {
        error:
          error instanceof Error ? error.message : 'Failed to generate response',
      },
      { status: 500 }
    );
  }
}
