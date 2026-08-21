import { NextRequest } from 'next/server'
import { enforceToolSeerGate } from '@/lib/enforceToolSeerGate'
import { appendAttribution } from '@/lib/attribution/attributionStamp';
import { callTextStream } from '@/lib/aiStructuredOutput';
import { cacheToolSeerAnswer } from '@/lib/toolSeerQuestionCache';
import { buildToolSeerMessages } from '@/lib/aiPromptBuilder'
import { historyFromSeerBody } from '@/lib/seerChatVoice';
import { devLog } from '@/lib/devLogger';
import {
  buildHoraryState,
  classifyHoraryQuestion,
  getHorarySliceForQuestionType,
  getRadicalityVerdict,
  type HoraryQuestionType,
  type HoraryChartPayload,
} from '@/lib/horarySeerState';
import { buildHorarySeerSystemPrompt } from '@/lib/horarySeerPrompts';
import { GROQ_DEFAULT_TEXT_MODEL } from '@/lib/groqModels';

const X_ROBOTS_TAG = 'noindex, nofollow, noarchive, nosnippet';
const SEER_MARKER_FAMILY = 'ask-horary-seer';

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


interface HorarySeerRequest {
  userId: string;
  question: string;
  userProfile?: unknown;
  horaryData?: HoraryChartPayload | null;
  sessionId?: string;
}

function getDisplayName(userProfile: unknown): string | undefined {
  if (!userProfile || typeof userProfile !== 'object') return undefined;
  const displayName = (userProfile as Record<string, unknown>).displayName;
  if (typeof displayName !== 'string') return undefined;
  const trimmed = displayName.trim();
  return trimmed || undefined;
}

const ANALYSIS_REQUIRED_MESSAGE =
  'Horary requires a question-moment chart with radicality data. Generate your horary chart first to use Ask the Seer.';

const REFUSAL_PHRASE =
  'This question is not suitable for horary judgment at this time.';

const RADICALITY_REFUSAL_PHRASE =
  'This question may be premature or already resolved. The chart is not suitable for judgment at this time.';

export async function POST(request: NextRequest) {
  try {
    const body: HorarySeerRequest = await request.json();
    const __toolSeerGate = await enforceToolSeerGate(request, body, 'ask_horary_seer')
    if (__toolSeerGate) return __toolSeerGate

    const { userId, question, userProfile, horaryData } = body;

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

    const hasBasicInfo =
      horaryData?.basicInfo?.question &&
      horaryData?.basicInfo?.questionTime &&
      horaryData?.basicInfo?.questionPlace;
    const hasSeerState = !!horaryData?.seerState?.ascendantSign;

    if (!horaryData || !hasBasicInfo || !hasSeerState) {
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
      state = buildHoraryState(horaryData);
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

    const verdict = getRadicalityVerdict(state.radicality);
    const questionType = classifyHoraryQuestion(question.trim()) as HoraryQuestionType;

    devLog.info(
      '🔮 Horary Seer API: Question type',
      { questionType, verdict },
      'ask-horary-seer'
    );

    if (questionType === 'refusal') {
      return withRobotsResponse(
        new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode(stampText(REFUSAL_PHRASE)));
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

    if (verdict === 'refuse') {
      return withRobotsResponse(
        new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode(stampText(RADICALITY_REFUSAL_PHRASE)));
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

    const slice = getHorarySliceForQuestionType(questionType, state, verdict);

    const displayName = getDisplayName(userProfile);
    const systemPrompt = buildHorarySeerSystemPrompt(slice, questionType, {
      displayName,
    });

    const userMessage = question.trim();

    const { messages } = buildToolSeerMessages({
      systemContent: systemPrompt,
      userMessage: userMessage,
      history: historyFromSeerBody(body),
    });

    const { stream } = await callTextStream({ label: 'ask-horary-seer', model: GROQ_DEFAULT_TEXT_MODEL,
      userId,
      cacheQuestion: typeof question === 'string' ? question.trim() : String(question).trim(),
      messages,
      temperature: 0.5,
      maxTokens: 800,
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
              await cacheToolSeerAnswer('ask-horary-seer', userId, question, fullResponse);
            }
          } catch (error) {
            devLog.error('Horary Seer stream error:', error);
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
    devLog.error(
      '❌ Error in Horary Seer API:',
      error,
      'ask-horary-seer'
    );
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
