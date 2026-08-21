import { NextRequest, NextResponse } from 'next/server';
import { enforceToolSeerGate, resolveToolSeerUserId } from '@/lib/enforceToolSeerGate';
import { appendAttribution } from '@/lib/attribution/attributionStamp';
import { devLog } from '@/lib/devLogger';
import { callTextStream } from '@/lib/aiStructuredOutput';
import { cacheToolSeerAnswer } from '@/lib/toolSeerQuestionCache';
import { buildToolSeerMessages } from '@/lib/aiPromptBuilder'
import { historyFromSeerBody } from '@/lib/seerChatVoice';
import { buildAkashicSeerSystemPrompt } from '@/lib/akashicSeerPrompts';
import { GROQ_DEFAULT_TEXT_MODEL } from '@/lib/groqModels';
import {
  buildAkashicState,
  classifyAkashicQuestion,
  getAkashicSliceForQuestionType,
  AKASHIC_REFUSAL_DATA_PHRASE,
  AKASHIC_REFUSAL_SAFETY_PHRASE,
  type AkashicQuestionType,
} from '@/lib/akashicSeerState';

const X_ROBOTS_TAG = 'noindex, nofollow, noarchive, nosnippet';
const SEER_MARKER_FAMILY = 'ask-akashic-seer';

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
    const __toolSeerGate = await enforceToolSeerGate(request, body, 'ask_akashic_seer');
    if (__toolSeerGate) return __toolSeerGate;
    const userId = await resolveToolSeerUserId(request, body, 'ask_akashic_seer');
    if (!userId) {
      return jsonWithRobots({ error: 'Unauthorized' }, { status: 401 });
    }
    const { question, reading: readingInput, comprehensiveProfile } = body;

    if (!question?.trim()) {
      return jsonWithRobots(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    // Aggregator can send comprehensiveProfile; derive reading from profile when not provided
    const reading =
      readingInput ??
      comprehensiveProfile?.akashicRecords ??
      comprehensiveProfile?.['Akashic Records'];

    const readingData = reading?.data ?? reading;
    let state;
    try {
      state = buildAkashicState(readingData);
    } catch {
      return jsonWithRobots(
        { error: AKASHIC_REFUSAL_DATA_PHRASE },
        { status: 400 }
      );
    }

    const questionType = classifyAkashicQuestion(question.trim()) as AkashicQuestionType;

    if (questionType === 'refusal') {
      return withRobotsResponse(
        new ReadableStream({
          start(controller) {
            controller.enqueue(
              new TextEncoder().encode(stampText(AKASHIC_REFUSAL_SAFETY_PHRASE))
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

    const slice = getAkashicSliceForQuestionType(questionType, state);
    const systemPrompt = buildAkashicSeerSystemPrompt(slice, questionType);

    const { messages } = buildToolSeerMessages({
      systemContent: systemPrompt,
      userMessage: question.trim(),
      history: historyFromSeerBody(body),
    });

    const { stream } = await callTextStream({ label: 'ask-akashic-seer', model: GROQ_DEFAULT_TEXT_MODEL,
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
              await cacheToolSeerAnswer('ask-akashic-seer', userId, question, fullResponse);
            }
          } catch (error) {
            devLog.error('Error during Akashic seer streaming:', error, 'route');
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
    devLog.error('Akashic Seer API error:', error, 'route');
    return jsonWithRobots(
      {
        error:
          error instanceof Error ? error.message : 'Failed to generate response',
      },
      { status: 500 }
    );
  }
}
