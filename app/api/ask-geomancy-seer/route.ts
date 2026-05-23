import { NextRequest, NextResponse } from 'next/server'
import { enforceToolSeerGate } from '@/lib/enforceToolSeerGate'
import { appendAttribution } from '@/lib/attribution/attributionStamp';
import { getFirebaseDB } from '@/lib/firebase';
import { callTextStream } from '@/lib/aiStructuredOutput';
import { cacheToolSeerAnswer } from '@/lib/toolSeerQuestionCache';
import { buildToolSeerMessages } from '@/lib/aiPromptBuilder';
import { cacheSeerQuestionAnswer } from '@/lib/seerQuestionCache';
import { SEER_CACHE_KEYWORDS } from '@/lib/seerQuestionSimilarity';
import { devLog } from '@/lib/devLogger';
import { ConversationalMemory, MemoryMessage } from '@/lib/conversationalMemory';
import { buildGeomancySeerSystemPrompt } from '@/lib/geomancySeerPrompts';
import {
  buildGeomancyState,
  classifyGeomancyQuestion,
  getGeomancySliceForQuestionType,
  GEOMANCY_REFUSAL_DATA_PHRASE,
  GEOMANCY_REFUSAL_OUTCOME_PHRASE,
  type GeomancyQuestionType,
  type GeomancyState,
} from '@/lib/geomancySeerState';

const X_ROBOTS_TAG = 'noindex, nofollow, noarchive, nosnippet';
const SEER_MARKER_FAMILY = 'ask-geomancy-seer';

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


interface GeomancySeerRequest {
  userId: string;
  question: string;
  userProfile: Record<string, unknown>;
  geomancyAnalysis?: GeomancyAnalysisData;
  comprehensiveProfile?: Record<string, unknown>;
  sessionId?: string;
}

interface GeomancySeerResponse {
  success: boolean;
  data: {
    answer: string;
    confidence: number;
    figureReferences: {
      primaryFigures: string[];
      houses: number[];
      elements: string[];
      planets: string[];
    };
    timing: string[];
    guidance: string[];
    followUpQuestions: string[];
  };
  error?: string;
}

interface GeomancyFigureLike {
  name?: string;
  element?: string;
  planet?: string;
}

interface GeomancyHouseLike {
  house?: number;
}

interface GeomancyAnalysisData {
  figures?: unknown[];
  houses?: unknown[];
  timing?: { optimalPeriods?: string[] };
  advice?: { immediate?: string[] };
}

function isGeomancyAnalysisData(value: unknown): value is GeomancyAnalysisData {
  return typeof value === 'object' && value !== null;
}

export async function POST(request: NextRequest) {
  try {
    const body: GeomancySeerRequest = await request.json();
    const __toolSeerGate = await enforceToolSeerGate(request, body, 'ask_geomancy_seer')
    if (__toolSeerGate) return __toolSeerGate

    const { userId, question, userProfile, sessionId } = body;
    let geomancyAnalysis = body.geomancyAnalysis;
    if (!geomancyAnalysis && body.comprehensiveProfile) {
      const fallbackAnalysis =
        body.comprehensiveProfile.geomancy ?? body.comprehensiveProfile?.Geomancy;
      if (isGeomancyAnalysisData(fallbackAnalysis)) {
        geomancyAnalysis = fallbackAnalysis;
      }
    }

    if (!userId || !question || !userProfile) {
      return jsonWithRobots(
        {
          success: false,
          error: 'Missing required parameters: userId, question, or userProfile',
        },
        { status: 400 }
      );
    }

    if (!geomancyAnalysis || !Array.isArray(geomancyAnalysis.figures) || geomancyAnalysis.figures.length < 15) {
      return jsonWithRobots(
        {
          success: false,
          error: GEOMANCY_REFUSAL_DATA_PHRASE,
        },
        { status: 400 }
      );
    }

    devLog.info('🌍 Geomancy Seer API: Processing question for user:', userId, 'ask-geomancy-seer');

    const questionType = classifyGeomancyQuestion(question.trim()) as GeomancyQuestionType;
    if (questionType === 'refusal') {
      return withRobotsResponse(
        new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode(stampText(GEOMANCY_REFUSAL_OUTCOME_PHRASE)));
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

    let state;
    try {
      state = buildGeomancyState(geomancyAnalysis, question.trim());
    } catch {
      return jsonWithRobots(
        { success: false, error: GEOMANCY_REFUSAL_DATA_PHRASE },
        { status: 400 }
      );
    }

    const slice = getGeomancySliceForQuestionType(questionType, state);
    const systemPrompt = buildGeomancySeerSystemPrompt(slice, questionType);

    const memory = new ConversationalMemory(userId);
    await memory.initializeAllMemory(true);
    const workingMemory = memory.getWorkingMemory();
    const conversationHistory = workingMemory.lastExchanges
      .filter((msg: MemoryMessage) => msg.type === 'user' || msg.type === 'seer')
      .map((msg: MemoryMessage, index: number, arr: MemoryMessage[]) => {
        if (msg.type === 'user') {
          const seerResponse = arr[index + 1];
          return {
            question: msg.content,
            answer: seerResponse?.type === 'seer' ? seerResponse.content : '',
          };
        }
        return null;
      })
      .filter((item: unknown): item is { question: string; answer: string } => item !== null)
      .slice(-10);

    return withRobotsResponse(
      new ReadableStream({
        async start(controller) {
          try {
            const { messages } = buildToolSeerMessages({
              systemContent: systemPrompt,
              userMessage: question.trim(),
              history: conversationHistory,
              truncateHistoryAnswers: 500,
            });

            const { stream } = await callTextStream({
              label: 'ask-geomancy-seer',
              model: 'llama-3.3-70b-versatile',
      userId,
      cacheQuestion: typeof question === 'string' ? question.trim() : String(question).trim(),
              messages,
              temperature: 0.6,
              maxTokens: 800,
            });

            let fullResponse = '';
            for await (const chunk of stream) {
              const content = chunk.choices?.[0]?.delta?.content ?? '';
              if (content) {
                fullResponse += content;
                controller.enqueue(new TextEncoder().encode(content));
              }
            }

            const responseData: GeomancySeerResponse['data'] = {
              answer: fullResponse,
              confidence: 0.85,
              figureReferences: {
                primaryFigures:
                  geomancyAnalysis.figures
                    ?.slice(0, 4)
                    .map((f: unknown) => {
                      if (typeof f === 'string') return f;
                      if (f && typeof f === 'object' && typeof (f as GeomancyFigureLike).name === 'string') {
                        return (f as GeomancyFigureLike).name as string;
                      }
                      return '';
                    })
                    .filter(Boolean) || [],
                houses:
                  geomancyAnalysis.houses
                    ?.map((h: unknown) => {
                      if (typeof h === 'number') return h;
                      if (h && typeof h === 'object' && typeof (h as GeomancyHouseLike).house === 'number') {
                        return (h as GeomancyHouseLike).house as number;
                      }
                      return undefined;
                    })
                    .filter((house): house is number => house !== undefined) || [],
                elements:
                  [...new Set(
                    geomancyAnalysis.figures
                      ?.map((f: unknown) => {
                        if (f && typeof f === 'object' && typeof (f as GeomancyFigureLike).element === 'string') {
                          return (f as GeomancyFigureLike).element as string;
                        }
                        return '';
                      }) || []
                  )].filter(Boolean) as string[],
                planets:
                  [...new Set(
                    geomancyAnalysis.figures
                      ?.map((f: unknown) => {
                        if (f && typeof f === 'object' && typeof (f as GeomancyFigureLike).planet === 'string') {
                          return (f as GeomancyFigureLike).planet as string;
                        }
                        return '';
                      }) || []
                  )].filter(Boolean) as string[],
              },
              timing: geomancyAnalysis.timing?.optimalPeriods || [],
              guidance: geomancyAnalysis.advice?.immediate || [],
              followUpQuestions: generateFollowUpQuestions(questionType, state),
            };

            const userMessage: MemoryMessage = {
              id: `msg_${Date.now()}_user`,
              timestamp: Date.now(),
              type: 'user',
              content: question.trim(),
              questionType: String(questionType),
              keywords: question.trim().split(' ').slice(0, 5),
            };
            const seerMessage: MemoryMessage = {
              id: `msg_${Date.now()}_seer`,
              timestamp: Date.now(),
              type: 'seer',
              content: fullResponse,
              questionType: String(questionType),
              confidence: 0.85,
              sources: ['geomancy'],
            };
            await memory.addExchange(userMessage);
            await memory.addExchange(seerMessage);
            memory.addRecentQuestion(question.trim());
            await memory.saveAllMemory();

            await storeConversation(userId, sessionId, question, responseData);
            await cacheToolSeerAnswer('ask-geomancy-seer', userId, question, fullResponse);
          } catch (error) {
            devLog.error('Error during Geomancy Seer streaming:', error);
            controller.enqueue(
              new TextEncoder().encode(stampText('I encountered an error. Please try again.'))
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
  } catch (error) {
    devLog.error('Error in Geomancy Seer API:', error);
    return jsonWithRobots(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

function generateFollowUpQuestions(questionType: GeomancyQuestionType, state: GeomancyState): string[] {
  const judge = state.judge;
  const base = [
    `What does ${judge} mean for this situation?`,
    'How do the Mothers and Daughters support or challenge the outcome?',
    'What does the Reconciler suggest?',
  ];
  if (state.house_focus) {
    base.push(`How does House ${state.house_focus} affect this matter?`);
  }
  return base;
}

async function storeConversation(
  userId: string,
  sessionId: string | undefined,
  question: string,
  response: GeomancySeerResponse['data']
) {
  try {
    const db = getFirebaseDB();
    if (!db) return;
    const { doc, setDoc } = await import('firebase/firestore');
    const session = sessionId || `session_${Date.now()}`;
    const messageId = `msg_${Date.now()}`;
    const messageRef = doc(db, 'geomancySeerConversations', userId, 'sessions', session, 'messages', messageId);
    await setDoc(messageRef, {
      question,
      answer: response.answer,
      timestamp: Date.now(),
      confidence: response.confidence,
      figureReferences: response.figureReferences,
      guidance: response.guidance,
    });
    devLog.info('✅ Geomancy conversation stored successfully', undefined, 'ask-geomancy-seer');
  } catch (error) {
    devLog.error('Error storing Geomancy conversation:', error);
  }
}
