import { NextRequest } from 'next/server'
import { enforceToolSeerGate } from '@/lib/enforceToolSeerGate'
import { appendAttribution } from '@/lib/attribution/attributionStamp';
import { callTextStream } from '@/lib/aiStructuredOutput';
import { cacheToolSeerAnswer } from '@/lib/toolSeerQuestionCache';
import { buildToolSeerMessages } from '@/lib/aiPromptBuilder'
import { historyFromSeerBody } from '@/lib/seerChatVoice';
import { devLog } from '@/lib/devLogger';
import type { FaceReadingAnalysis } from '@/lib/faceReadingIntelligence';
import { buildFaceReadingSeerSystemPrompt } from '@/lib/faceReadingSeerPrompts';
import { GROQ_DEFAULT_TEXT_MODEL } from '@/lib/groqModels';
import {
  buildFaceReadingState,
  classifyFaceReadingQuestion,
  getFaceReadingSliceForQuestionType,
  type FaceReadingQuestionType,
} from '@/lib/faceReadingSeerState';

const X_ROBOTS_TAG = 'noindex, nofollow, noarchive, nosnippet';
const SEER_MARKER_FAMILY = 'ask-face-reading-seer';

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


interface FaceReadingSeerRequest {
  userId: string;
  question: string;
  userProfile?: unknown;
  faceReadingAnalysis?: unknown;
  comprehensiveProfile?: Record<string, unknown>;
  sessionId?: string;
}

function getDisplayName(userProfile: unknown): string | undefined {
  if (!userProfile || typeof userProfile !== 'object') return undefined;
  const displayName = (userProfile as Record<string, unknown>).displayName;
  if (typeof displayName !== 'string') return undefined;
  const trimmed = displayName.trim();
  return trimmed || undefined;
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isFaceReadingAnalysis(value: unknown): value is FaceReadingAnalysis {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.faceShape === 'string'
  );
}

const ANALYSIS_REQUIRED_MESSAGE =
  'Generate Face Reading analysis first to use Ask the Seer.';

function getRefusalMessage(): string {
  return 'Face reading reflects tendencies, not predictions. Face reading cannot determine this with certainty.';
}

export async function POST(request: NextRequest) {
  try {
    const body: FaceReadingSeerRequest = await request.json();
    const __toolSeerGate = await enforceToolSeerGate(request, body, 'ask_face_reading_seer')
    if (__toolSeerGate) return __toolSeerGate

    const { userId, question, userProfile } = body;
    let faceReadingAnalysis = isFaceReadingAnalysis(body.faceReadingAnalysis)
      ? body.faceReadingAnalysis
      : undefined;
    if (!faceReadingAnalysis && body.comprehensiveProfile) {
      const fallbackAnalysis =
        body.comprehensiveProfile.faceReading ??
        body.comprehensiveProfile['Face Reading'];
      if (isFaceReadingAnalysis(fallbackAnalysis)) {
        faceReadingAnalysis = fallbackAnalysis;
      }
    }

    if (!userId || !question) {
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

    if (!faceReadingAnalysis || !faceReadingAnalysis.faceShape) {
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
      state = buildFaceReadingState(faceReadingAnalysis);
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

    const questionType = classifyFaceReadingQuestion(question) as FaceReadingQuestionType;
    devLog.info(
      '🔮 Face Reading Seer API: Question type',
      questionType,
      'ask-face-reading-seer'
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

    devLog.info(
      '🔮 Face Reading Seer API: Processing question for user:',
      userId,
      'ask-face-reading-seer'
    );

    const chartSlice = getFaceReadingSliceForQuestionType(
      questionType,
      state,
      faceReadingAnalysis
    );

    const displayName = getDisplayName(userProfile);
    const systemPrompt = buildFaceReadingSeerSystemPrompt(chartSlice, questionType, {
      displayName,
    });

    const userMessage = question.trim();

    const { messages } = buildToolSeerMessages({
      systemContent: systemPrompt,
      userMessage: userMessage,
      history: historyFromSeerBody(body),
    });

    const { stream } = await callTextStream({ label: 'ask-face-reading-seer', model: GROQ_DEFAULT_TEXT_MODEL,
      userId,
      cacheQuestion: typeof question === 'string' ? question.trim() : String(question).trim(),
      messages,
      temperature: 0.7,
      maxTokens: 1000,
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
              await cacheToolSeerAnswer('ask-face-reading-seer', userId, question, fullResponse);
            }
          } catch (error) {
            devLog.error('Face Reading Seer stream error:', error);
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
          'Connection': 'keep-alive',
        },
      }
    );
  } catch (error: unknown) {
    devLog.error(
      '❌ Error in Face Reading Seer API:',
      error,
      'ask-face-reading-seer'
    );
    return withRobotsResponse(
      JSON.stringify({
        success: false,
        error: getErrorMessage(error, 'Failed to process question'),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
