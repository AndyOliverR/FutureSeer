import { NextRequest, NextResponse } from 'next/server'
import { enforceToolSeerGate } from '@/lib/enforceToolSeerGate'
import { appendAttribution } from '@/lib/attribution/attributionStamp';
import { callTextStream } from '@/lib/aiStructuredOutput';
import { cacheToolSeerAnswer } from '@/lib/toolSeerQuestionCache';
import { buildToolSeerMessages } from '@/lib/aiPromptBuilder';
import { devLog } from '@/lib/devLogger';
import { buildHumanDesignSeerSystemPrompt } from '@/lib/humanDesignSeerPrompts';
import {
  buildHumanDesignState,
  classifyHumanDesignQuestion,
  getHumanDesignSliceForQuestionType,
  HUMAN_DESIGN_REFUSAL_DATA_PHRASE,
  HUMAN_DESIGN_REFUSAL_OUTCOME_PHRASE,
  type HumanDesignQuestionType,
} from '@/lib/humanDesignSeerState';

const X_ROBOTS_TAG = 'noindex, nofollow, noarchive, nosnippet';
const SEER_MARKER_FAMILY = 'ask-human-design-seer';

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

type HumanDesignChartFields = Record<string, unknown> & { type?: string; authority?: string };

function coerceHumanDesignChart(v: unknown): HumanDesignChartFields | undefined {
  if (v && typeof v === 'object' && !Array.isArray(v)) {
    return v as HumanDesignChartFields;
  }
  return undefined;
}

interface HumanDesignSeerRequest {
  userId: string;
  question: string;
  userProfile: Record<string, unknown>;
  humanDesignChart?: Record<string, unknown> & {
    type?: string;
    authority?: string;
  };
  comprehensiveProfile?: Record<string, unknown> & {
    humanDesign?: (Record<string, unknown> & { type?: string; authority?: string }) | unknown;
    'Human Design'?: (Record<string, unknown> & { type?: string; authority?: string }) | unknown;
  };
  sessionId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: HumanDesignSeerRequest = await request.json();
    const __toolSeerGate = await enforceToolSeerGate(request, body, 'ask_human_design_seer')
    if (__toolSeerGate) return __toolSeerGate

    const { userId, question: rawQuestion, userProfile } = body;
    let humanDesignChart = coerceHumanDesignChart(body.humanDesignChart);
    // Parse optional scope from question (injected by seer route after clarification)
    let question = (rawQuestion || '').trim();
    let scope: 'overview' | 'authority' | undefined;
    const scopeMatch = question.match(/^Scope:\s*(overview|authority)\s*\.\s*/i);
    if (scopeMatch) {
      scope = scopeMatch[1].toLowerCase() as 'overview' | 'authority';
      question = question.slice(scopeMatch[0].length).trim() || question;
    }
    if (!humanDesignChart && body.comprehensiveProfile) {
      const cp = body.comprehensiveProfile;
      humanDesignChart =
        coerceHumanDesignChart(cp.humanDesign) ??
        coerceHumanDesignChart(cp['Human Design']);
    }

    if (!userId || !question || !userProfile) {
      return jsonWithRobots(
        {
          success: false,
          error: 'Missing required parameters: userId, question, or userProfile',
        },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    devLog.info(
      '🔮 Human Design Seer API: Processing question for user:',
      userId,
      'ask-human-design-seer'
    );

    // Require chart
    if (!humanDesignChart || !humanDesignChart.type || !humanDesignChart.authority) {
      return jsonWithRobots(
        {
          success: false,
          error: HUMAN_DESIGN_REFUSAL_DATA_PHRASE,
        },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Classify question — refuse outcome/timing questions
    const questionType: HumanDesignQuestionType = classifyHumanDesignQuestion(question.trim());
    if (questionType === 'refusal') {
      return withRobotsResponse(
        new ReadableStream({
          start(controller) {
            controller.enqueue(
              new TextEncoder().encode(stampText(HUMAN_DESIGN_REFUSAL_OUTCOME_PHRASE))
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

    // Build state and slice
    let state;
    try {
      state = buildHumanDesignState(humanDesignChart);
    } catch {
      return jsonWithRobots(
        {
          success: false,
          error: HUMAN_DESIGN_REFUSAL_DATA_PHRASE,
        },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const slice = getHumanDesignSliceForQuestionType(questionType, state);
    const dnRaw = userProfile.displayName ?? userProfile.display_name;
    const displayName =
      typeof dnRaw === 'string' && dnRaw.trim() ? dnRaw.trim() : undefined;
    const systemPrompt = buildHumanDesignSeerSystemPrompt(slice, questionType, {
      displayName,
      scope,
    });

    const { messages } = buildToolSeerMessages({
      systemContent: systemPrompt,
      userMessage: question.trim(),
    });

    const { stream } = await callTextStream({ label: 'ask-human-design-seer', model: 'llama-3.3-70b-versatile',
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
              await cacheToolSeerAnswer('ask-human-design-seer', userId, question, fullResponse);
            }
          } catch (error) {
            devLog.error('Human Design Seer stream error:', error);
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
          Connection: 'keep-alive',
        },
      }
    );
  } catch (error: unknown) {
    devLog.error(
      '❌ Error in Human Design Seer API:',
      error,
      'ask-human-design-seer'
    );
    return jsonWithRobots(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to process question',
      },
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
