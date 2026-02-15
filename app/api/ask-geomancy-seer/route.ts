import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseDB } from '@/lib/firebase';
import { createAIStream } from '@/lib/aiGateway';
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

interface GeomancySeerRequest {
  userId: string;
  question: string;
  userProfile: any;
  geomancyAnalysis?: any;
  comprehensiveProfile?: any;
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, question, userProfile, sessionId } = body;
    let geomancyAnalysis = body.geomancyAnalysis;
    if (!geomancyAnalysis && body.comprehensiveProfile) {
      geomancyAnalysis =
        body.comprehensiveProfile.geomancy ?? body.comprehensiveProfile?.Geomancy;
    }

    if (!userId || !question || !userProfile) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameters: userId, question, or userProfile',
        },
        { status: 400 }
      );
    }

    if (!geomancyAnalysis || !Array.isArray(geomancyAnalysis.figures) || geomancyAnalysis.figures.length < 15) {
      return NextResponse.json(
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
      return new Response(
        new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode(GEOMANCY_REFUSAL_OUTCOME_PHRASE));
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

    const cachedResponse = await checkCachedQuestions(userId, question);
    if (cachedResponse) {
      devLog.info('🎯 Returning cached response for similar question', undefined, 'ask-geomancy-seer');
      return new Response(
        new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode(cachedResponse.answer));
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
      return NextResponse.json(
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

    return new Response(
      new ReadableStream({
        async start(controller) {
          try {
            const stream = await createAIStream({
              model: 'llama-3.3-70b-versatile',
              messages: [
                { role: 'system', content: systemPrompt },
                ...conversationHistory.flatMap((h) => [
                  { role: 'user' as const, content: h.question },
                  { role: 'assistant' as const, content: h.answer.substring(0, 500) + '...' },
                ]),
                { role: 'user', content: question.trim() },
              ],
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
                primaryFigures: geomancyAnalysis.figures?.slice(0, 4).map((f: any) => f.name ?? f) || [],
                houses: geomancyAnalysis.houses?.map((h: any) => h.house ?? h) || [],
                elements: [...new Set(geomancyAnalysis.figures?.map((f: any) => f.element ?? '') || [])].filter(Boolean) as string[],
                planets: [...new Set(geomancyAnalysis.figures?.map((f: any) => f.planet ?? '') || [])].filter(Boolean) as string[],
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
            await cacheQuestionAnswer(userId, question, fullResponse);
          } catch (error) {
            devLog.error('Error during Geomancy Seer streaming:', error);
            controller.enqueue(
              new TextEncoder().encode('I encountered an error. Please try again.')
            );
          } finally {
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
    return NextResponse.json(
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

function calculateSimilarity(question1: string, question2: string): number {
  const q1 = question1.toLowerCase();
  const q2 = question2.toLowerCase();
  const keywords = ['figure', 'house', 'judge', 'geomantic', 'condition', 'proceed', 'obstruction', 'stable'];
  let matches = 0;
  for (const kw of keywords) {
    if (q1.includes(kw) && q2.includes(kw)) matches += 2;
  }
  return matches;
}

async function checkCachedQuestions(userId: string, question: string): Promise<{ answer: string } | null> {
  try {
    const db = getFirebaseDB();
    if (!db) return null;
    const { collection, query, orderBy, limit, getDocs } = await import('firebase/firestore');
    const cacheRef = collection(db, 'geomancySeerCache', userId, 'questions');
    const q = query(cacheRef, orderBy('timestamp', 'desc'), limit(20));
    const snapshot = await getDocs(q);
    for (const d of snapshot.docs) {
      const cached = d.data();
      if (calculateSimilarity(question, cached.question) >= 5) {
        return { answer: cached.answer };
      }
    }
    return null;
  } catch {
    return null;
  }
}

async function cacheQuestionAnswer(userId: string, question: string, answer: string): Promise<void> {
  try {
    const db = getFirebaseDB();
    if (!db) return;
    const { doc, setDoc } = await import('firebase/firestore');
    const cacheId = `qa_${Date.now()}`;
    const cacheRef = doc(db, 'geomancySeerCache', userId, 'questions', cacheId);
    await setDoc(cacheRef, {
      question,
      answer,
      timestamp: Date.now(),
      ttl: Date.now() + 30 * 24 * 60 * 60 * 1000,
    });
    devLog.info('✅ Geomancy question cached', undefined, 'ask-geomancy-seer');
  } catch (error) {
    devLog.error('Error caching Geomancy question:', error);
  }
}
