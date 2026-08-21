import { NextRequest, NextResponse } from 'next/server'
import { enforceToolSeerGate, resolveToolSeerUserId } from '@/lib/enforceToolSeerGate'
import { appendAttribution } from '@/lib/attribution/attributionStamp';
import { devLog } from '@/lib/devLogger';
import { callTextStream } from '@/lib/aiStructuredOutput';
import { cacheToolSeerAnswer } from '@/lib/toolSeerQuestionCache';
import { buildToolSeerMessages } from '@/lib/aiPromptBuilder'
import { historyFromSeerBody } from '@/lib/seerChatVoice';
import {
  buildAngelNumberState,
  classifyAngelNumberQuestion,
  getAngelNumberSliceForQuestionType,
  type AngelNumbersContextInput,
  type AngelNumbersProfileInput,
} from '@/lib/angelNumbersSeerState';
import { buildAngelNumberSeerSystemPrompt } from '@/lib/angelNumbersSeerPrompts';
import { GROQ_DEFAULT_TEXT_MODEL } from '@/lib/groqModels';

const X_ROBOTS_TAG = 'noindex, nofollow, noarchive, nosnippet';
const SEER_MARKER_FAMILY = 'ask-angel-numbers-seer';

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


interface AskAngelNumbersSeerRequest {
  userId?: string;
  question: string;
  userProfile?: unknown;
  angelNumbersContext?: AngelNumbersContextInput;
  angelNumbersData?: {
    lifePathAngel?: number;
    destinyAngel?: number;
    soulAngel?: number;
    currentDateAngel?: number;
    personalYearAngel?: number;
  };
  lookupResult?: { number: number; originalInput?: string | number };
}

const REFUSAL_MESSAGE =
  'Angel Numbers are guidance symbols, not predictors of events. I can help you explore what theme is being reinforced and what to pay attention to right now.';

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export async function POST(request: NextRequest) {
  try {
    const body: AskAngelNumbersSeerRequest = await request.json();
    const __toolSeerGate = await enforceToolSeerGate(request, body, 'ask_angel_numbers_seer')
    if (__toolSeerGate) return __toolSeerGate

    const userId = await resolveToolSeerUserId(request, body, 'ask_angel_numbers_seer');
    if (!userId) {
      return jsonWithRobots({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      question,
      angelNumbersContext,
      angelNumbersData,
      lookupResult,
    } = body;

    if (!question || !question.trim()) {
      return jsonWithRobots(
        { success: false, error: 'Question is required' },
        { status: 400 }
      );
    }

    const questionType = classifyAngelNumberQuestion(question.trim());

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

    const profile: AngelNumbersProfileInput | null = angelNumbersData
      ? {
          lifePathAngel: angelNumbersData.lifePathAngel,
          destinyAngel: angelNumbersData.destinyAngel,
          soulAngel: angelNumbersData.soulAngel,
          currentDateAngel: angelNumbersData.currentDateAngel,
          personalYearAngel: angelNumbersData.personalYearAngel,
        }
      : null;

    const state = buildAngelNumberState(
      angelNumbersContext ?? null,
      profile,
      lookupResult ?? null,
      question.trim()
    );

    const chartSlice = getAngelNumberSliceForQuestionType(questionType, state);

    const { messages } = buildToolSeerMessages({
      systemContent: buildAngelNumberSeerSystemPrompt(chartSlice, questionType),
      userMessage: question.trim(),
      history: historyFromSeerBody(body),
    });

    const { stream } = await callTextStream({ label: 'ask-angel-numbers-seer', model: GROQ_DEFAULT_TEXT_MODEL,
      userId,
      cacheQuestion: typeof question === 'string' ? question.trim() : String(question).trim(),
      messages,
      temperature: 0.7,
      maxTokens: 800,
    });

    return withRobotsResponse(
      new ReadableStream({
        async start(controller) {
          try {
            let fullResponse = '';
            for await (const chunk of stream) {
              const content = chunk.choices[0]?.delta?.content || '';
              if (content) {
                fullResponse += content;
                controller.enqueue(new TextEncoder().encode(content));
              }
            }
            if (fullResponse.trim()) {
              await cacheToolSeerAnswer('ask-angel-numbers-seer', userId, question, fullResponse);
            }
          } catch (error) {
            devLog.error('Angel Numbers Seer stream error:', error, 'route');
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
    devLog.error('Angel Numbers Seer API error:', error, 'route');
    return jsonWithRobots(
      {
        success: false,
        error: getErrorMessage(error, 'Failed to get response from Angel Numbers Seer'),
      },
      { status: 500 }
    );
  }
}
