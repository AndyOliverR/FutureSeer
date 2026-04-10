import { NextRequest, NextResponse } from 'next/server';
import { appendAttribution } from '@/lib/attribution/attributionStamp';
import { getFirebaseDB } from '@/lib/firebase';
import { createAIStream } from '@/lib/aiGateway';
import { devLog } from '@/lib/devLogger';
import { ConversationalMemory, MemoryMessage } from '@/lib/conversationalMemory';
import {
  buildIChingState,
  classifyIChingQuestion,
  getIChingSliceForQuestionType,
  type IChingQuestionType,
} from '@/lib/ichingSeerState';
import type { IChingAnalysis } from '@/lib/ichingIntelligence';
import { buildIChingSeerSystemPrompt } from '@/lib/ichingSeerPrompts';

const X_ROBOTS_TAG = 'noindex, nofollow, noarchive, nosnippet';
const SEER_MARKER_FAMILY = 'ask-iching-seer';

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


interface IChingSeerRequest {
  userId: string;
  question: string;
  userProfile?: unknown;
  ichingAnalysis: Record<string, unknown> & {
    hexagram?: {
      number?: number;
      name?: string;
      lines?: Array<{ changing?: boolean; position?: number }>;
      trigramUpper?: string;
      trigramLower?: string;
      elementUpper?: string;
      elementLower?: string;
    };
    recommendations?: string[];
  };
  sessionId?: string;
}

interface IChingSeerResponse {
  success: boolean;
  data: {
    answer: string;
    confidence: number;
    hexagramReferences: {
      hexagramNumber: number;
      hexagramName: string;
      changingLines: number[];
      trigrams: string[];
      elements: string[];
    };
    timing: string[];
    guidance: string[];
    followUpQuestions: string[];
  };
  error?: string;
}

function getRefusalMessage(question: string): string {
  const lower = question.toLowerCase();
  if (
    /\b(same question|ask again|re-?ask|ask the same|without change)\b/.test(
      lower
    )
  ) {
    return 'I Ching guidance applies to the current state and should not be re-queried without change.';
  }
  if (
    /\b(when|date|time|timeline|schedule|deadline|how long|until)\b/.test(lower)
  ) {
    return 'I Ching does not provide timing or dates; it advises on alignment with the present situation.';
  }
  return 'I Ching does not predict outcomes; it advises on alignment.';
}

export async function POST(request: NextRequest) {
  try {
    const { userId, question, ichingAnalysis, sessionId }: IChingSeerRequest = await request.json();

    if (!userId || !question) {
      return jsonWithRobots({
        success: false,
        error: 'Missing required parameters: userId or question'
      }, { status: 400 });
    }

    if (!ichingAnalysis || !ichingAnalysis.hexagram) {
      return jsonWithRobots({
        success: false,
        error: 'Run an I Ching reading first to use Ask the Seer.'
      }, { status: 400 });
    }

    const ichingForLib = ichingAnalysis as unknown as IChingAnalysis;
    const hex = ichingForLib.hexagram;

    let state;
    try {
      state = buildIChingState(ichingForLib);
    } catch {
      return jsonWithRobots({
        success: false,
        error: 'Run an I Ching reading first to use Ask the Seer.'
      }, { status: 400 });
    }

    const questionType = classifyIChingQuestion(question) as IChingQuestionType;
    devLog.debug('🔍 Question type:', questionType, 'ask-iching-seer');

    if (questionType === 'refusal') {
      const refusalText = getRefusalMessage(question);
      return withRobotsResponse(
        new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode(refusalText));
            appendAttributionTail(controller);
            controller.close();
          }
        }),
        {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
          }
        }
      );
    }

    devLog.info('🔮 I Ching Seer API: Processing question for user:', userId, 'ask-iching-seer');

    const cachedResponse = await checkCachedQuestions(userId, question);
    if (cachedResponse) {
      devLog.info('🎯 Returning cached response for similar question', undefined, 'ask-iching-seer');
      return withRobotsResponse(
        new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode(cachedResponse.answer));
            appendAttributionTail(controller);
            controller.close();
          }
        }),
        {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
          }
        }
      );
    }

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
            answer: seerResponse?.type === 'seer' ? seerResponse.content : ''
          };
        }
        return null;
      })
      .filter((item): item is { question: string; answer: string } => item !== null)
      .slice(-10);

    const chartSlice = getIChingSliceForQuestionType(questionType, state, ichingForLib);
    const systemPrompt = buildIChingSeerSystemPrompt(chartSlice, questionType);

    return withRobotsResponse(
      new ReadableStream({
        async start(controller) {
          try {
            const stream = await createAIStream({
              model: 'llama-3.3-70b-versatile',
              messages: [
                { role: 'system', content: systemPrompt },
                ...conversationHistory.filter((item): item is NonNullable<typeof item> => item != null).flatMap(item => [
                  { role: 'user' as const, content: item.question },
                  { role: 'assistant' as const, content: item.answer.substring(0, 500) + '...' }
                ]),
                { role: 'user', content: question }
              ],
              temperature: 0.7,
              maxTokens: 2000
            });

            let fullResponse = '';

            for await (const chunk of stream) {
              const content = chunk.choices[0]?.delta?.content || '';
              if (content) {
                fullResponse += content;
                controller.enqueue(new TextEncoder().encode(content));
              }
            }

            const responseData: IChingSeerResponse['data'] = {
              answer: fullResponse,
              confidence: 0.85,
              hexagramReferences: {
                hexagramNumber: hex.number ?? 0,
                hexagramName: hex.name ?? '',
                changingLines: (hex.lines || [])
                  .filter((l) => Boolean(l.changing))
                  .map((l) => l.position ?? 0),
                trigrams: [hex.trigramUpper || '', hex.trigramLower || ''].filter(Boolean),
                elements: [hex.elementUpper || '', hex.elementLower || ''].filter(Boolean),
              },
              timing: [],
              guidance: ichingForLib.recommendations || [],
              followUpQuestions: generateFollowUpQuestions(questionType)
            };

            const userMessage: MemoryMessage = {
              id: `msg_${Date.now()}_user`,
              timestamp: Date.now(),
              type: 'user',
              content: question,
              questionType: questionType,
              keywords: question.split(' ').slice(0, 5)
            };
            const seerMessage: MemoryMessage = {
              id: `msg_${Date.now()}_seer`,
              timestamp: Date.now(),
              type: 'seer',
              content: fullResponse,
              questionType: questionType,
              confidence: 0.85,
              sources: ['iching']
            };
            await memory.addExchange(userMessage);
            await memory.addExchange(seerMessage);
            memory.addRecentQuestion(question);
            await memory.saveAllMemory();
            await storeConversation(userId, sessionId, question, responseData);
            await cacheQuestionAnswer(userId, question, fullResponse);
          } catch (error) {
            devLog.error('Error during streaming:', error);
            controller.enqueue(new TextEncoder().encode(stampText('I apologize, but I encountered an error. Please try again.')));
          } finally {
            appendAttributionTail(controller);
            controller.close();
          }
        }
      }),
      {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        }
      }
    );

  } catch (error) {
    devLog.error('Error in I Ching Seer API:', error);
    return jsonWithRobots({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}

function generateFollowUpQuestions(questionType: IChingQuestionType): string[] {
  const followUps: { [key in IChingQuestionType]?: string[] } = {
    nature_of_situation: [
      'How should I approach this situation?',
      'What direction is this moving toward?',
      'Should I advance or wait?'
    ],
    how_to_approach: [
      'What is the nature of this situation?',
      'What direction do the changing lines suggest?',
      'Should I advance or hold?'
    ],
    direction: [
      'What is the nature of this situation?',
      'How should I approach this?',
      'Should I advance or withdraw?'
    ],
    advance_or_wait: [
      'What is the nature of this situation?',
      'How do the trigrams suggest I proceed?',
      'What do the changing lines indicate?'
    ],
    general: [
      'What is the nature of this situation?',
      'How should I approach this?',
      'Should I advance, hold, or withdraw?'
    ]
  };
  return followUps[questionType] || [
    'What is the nature of this situation?',
    'How should I approach this?',
    'Should I advance, hold, or withdraw?'
  ];
}

async function storeConversation(userId: string, sessionId: string | undefined, question: string, response: IChingSeerResponse['data']) {
  try {
    const db = getFirebaseDB();
    const { doc, setDoc } = await import('firebase/firestore');
    const session = sessionId || `session_${Date.now()}`;
    const timestamp = Date.now();
    
    // Use proper Firestore document reference
    const messageId = `msg_${timestamp}`;
    const messageRef = doc(db, 'ichingSeerConversations', userId, 'sessions', session, 'messages', messageId);
    
    await setDoc(messageRef, {
      question,
      answer: response.answer,
      timestamp,
      confidence: response.confidence,
      hexagramReferences: response.hexagramReferences,
      guidance: response.guidance
    });
    
    devLog.info('✅ I Ching conversation stored successfully', undefined, 'ask-iching-seer');
  } catch (error) {
    devLog.error('Error storing conversation:', error);
    // Don't throw - conversation storage failure shouldn't break the response
  }
}

// Helper function to calculate question similarity
function calculateSimilarity(question1: string, question2: string): number {
  const q1Lower = question1.toLowerCase();
  const q2Lower = question2.toLowerCase();
  
  // Extract key terms
  const keywords = ['hexagram', 'changing', 'line', 'trigram', 'element', 'timing', 'guidance', 'decision'];
  
  let matches = 0;
  keywords.forEach(kw => {
    if (q1Lower.includes(kw) && q2Lower.includes(kw)) matches += 2;
  });
  
  return matches;
}

// Check for cached similar questions
async function checkCachedQuestions(userId: string, question: string): Promise<{ answer: string; question?: string } | null> {
  try {
    const db = getFirebaseDB();
    const { collection, query, orderBy, limit, getDocs } = await import('firebase/firestore');
    
    const cacheRef = collection(db, 'ichingSeerCache', userId, 'questions');
    const q = query(cacheRef, orderBy('timestamp', 'desc'), limit(20));
    const snapshot = await getDocs(q);
    
    for (const doc of snapshot.docs) {
      const cachedQA = doc.data() as { answer?: unknown; question?: unknown };
      if (typeof cachedQA.question !== 'string' || typeof cachedQA.answer !== 'string') {
        continue;
      }
      const similarity = calculateSimilarity(question, cachedQA.question);
      
      if (similarity >= 5) { // Threshold for similarity
        devLog.debug(`🎯 Found similar I Ching question with similarity score: ${similarity}`, undefined, 'ask-iching-seer');
        return { answer: cachedQA.answer, question: cachedQA.question };
      }
    }
    
    return null;
  } catch (error) {
    devLog.error('Error checking cached questions:', error);
    return null;
  }
}

// Cache question and answer for future similar questions
async function cacheQuestionAnswer(userId: string, question: string, answer: string): Promise<void> {
  try {
    const db = getFirebaseDB();
    const { doc, setDoc } = await import('firebase/firestore');
    
    const cacheId = `qa_${Date.now()}`;
    const cacheRef = doc(db, 'ichingSeerCache', userId, 'questions', cacheId);
    
    await setDoc(cacheRef, {
      question,
      answer,
      timestamp: Date.now(),
      ttl: Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 days TTL
    });
    
    devLog.info('✅ I Ching question cached for future similar questions', undefined, 'ask-iching-seer');
  } catch (error) {
    devLog.error('Error caching question:', error);
  }
}

