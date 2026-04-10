import { NextRequest, NextResponse } from 'next/server';
import { appendAttribution } from '@/lib/attribution/attributionStamp';
import { getFirebaseDB } from '@/lib/firebase';
import { createAIStream } from '@/lib/aiGateway';
import { devLog } from '@/lib/devLogger';
import { ConversationalMemory, MemoryMessage } from '@/lib/conversationalMemory';
import { SortilegeReading } from '@/lib/sortilegeIntelligence';
import {
  buildSortilegeState,
  classifySortilegeQuestion,
  getSortilegeSliceForQuestionType,
  SORTILEGE_REFUSAL_DATA_PHRASE,
  SORTILEGE_REFUSAL_SAFETY_PHRASE,
  SORTILEGE_REFUSAL_INVALID_CAST,
  type SortilegeQuestionType,
} from '@/lib/sortilegeSeerState';
import { buildSortilegeSeerSystemPrompt } from '@/lib/sortilegeSeerPrompts';

const X_ROBOTS_TAG = 'noindex, nofollow, noarchive, nosnippet';
const SEER_MARKER_FAMILY = 'ask-sortilege-seer';

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


interface SortilegeSeerRequest {
  userId: string;
  question: string;
  userProfile: Record<string, unknown>;
  sortilegeReading?: SortilegeReading;
  comprehensiveProfile?: Record<string, unknown>; // When called by SeerAggregator: derive analysis from this slice
  sessionId?: string;
}

interface SortilegeSeerResponse {
  success: boolean;
  data: {
    answer: string;
    confidence: number;
    castReferences: {
      method: string;
      symbols: string[];
      values: (number | string)[];
      interpretation: string;
    };
    guidance: string[];
    followUpQuestions: string[];
  };
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: SortilegeSeerRequest = await request.json();
    const { userId, question, userProfile, sessionId } = body;
    let sortilegeReading: SortilegeReading | undefined = body.sortilegeReading;
    if (!sortilegeReading && body.comprehensiveProfile) {
      const cp = body.comprehensiveProfile;
      const fromCp = cp.sortilege ?? cp['Sortilege'];
      if (fromCp && typeof fromCp === 'object' && !Array.isArray(fromCp)) {
        sortilegeReading = fromCp as SortilegeReading;
      }
    }

    if (!userId || !question || !userProfile) {
      return jsonWithRobots({
        success: false,
        error: 'Missing required parameters: userId, question, or userProfile'
      }, { status: 400 });
    }

    if (!sortilegeReading || !sortilegeReading.castResult) {
      return jsonWithRobots({
        success: false,
        error: SORTILEGE_REFUSAL_DATA_PHRASE
      }, { status: 400 });
    }

    let state;
    try {
      state = buildSortilegeState(sortilegeReading);
    } catch {
      return jsonWithRobots({
        success: false,
        error: SORTILEGE_REFUSAL_DATA_PHRASE
      }, { status: 400 });
    }

    if (state.validity !== 'valid') {
      return withRobotsResponse(
        new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode(stampText(SORTILEGE_REFUSAL_INVALID_CAST)));
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

    const questionType = classifySortilegeQuestion(question.trim()) as SortilegeQuestionType;
    devLog.debug('🔍 Question type:', questionType, 'ask-sortilege-seer');

    if (questionType === 'refusal') {
      return withRobotsResponse(
        new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode(stampText(SORTILEGE_REFUSAL_SAFETY_PHRASE)));
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

    // Check cache only after validity and refusal (prefer refusal over cached answer)
    const cachedResponse = await checkCachedQuestions(userId, question);
    if (cachedResponse) {
      devLog.info('🎯 Returning cached response for similar question', undefined, 'ask-sortilege-seer');
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

    const slice = getSortilegeSliceForQuestionType(questionType, state);
    const systemPrompt = buildSortilegeSeerSystemPrompt(slice, questionType);

    // Initialize conversational memory for storage after stream
    const memory = new ConversationalMemory(userId);
    await memory.initializeAllMemory(true);

    // Stream response via AI Gateway or direct Groq
    return withRobotsResponse(
      new ReadableStream({
        async start(controller) {
          try {
            const stream = await createAIStream({
              model: 'llama-3.3-70b-versatile',
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: question }
              ],
              temperature: 0.6,
              maxTokens: 800
            });

            let fullResponse = '';
            for await (const chunk of stream) {
              const content = chunk.choices[0]?.delta?.content || '';
              if (content) {
                fullResponse += content;
                controller.enqueue(new TextEncoder().encode(content));
              }
            }

            // Store conversation after streaming completes
            const responseData: SortilegeSeerResponse['data'] = {
              answer: fullResponse,
              confidence: 0.85,
              castReferences: {
                method: sortilegeReading.method,
                symbols: sortilegeReading.castResult.interpretation.symbols.map(s => s.name),
                values: sortilegeReading.castResult.cast.objects.map(obj => obj.value || obj.symbol || ''),
                interpretation: sortilegeReading.castResult.interpretation.primary
              },
              guidance: sortilegeReading.comprehensiveReport.guidance || [],
              followUpQuestions: generateFollowUpQuestions(questionType, sortilegeReading)
            };

            // Store in unified memory system
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
              sources: ['sortilege']
            };
            
            await memory.addExchange(userMessage);
            await memory.addExchange(seerMessage);
            memory.addRecentQuestion(question);
            await memory.saveAllMemory();
            
            // Also store in old format for backward compatibility
            await storeConversation(userId, sessionId, question, responseData);

            // Cache the Q&A for future similar questions
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
    devLog.error('Error in Sortilege Seer API:', error);
    return jsonWithRobots({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}

function generateFollowUpQuestions(
  questionType: SortilegeQuestionType,
  sortilegeReading: SortilegeReading
): string[] {
  const method = sortilegeReading.method;
  const base = [
    `What does my ${method} cast mean?`,
    'What guidance does the cast provide?',
    'How should I interpret the cast results?'
  ];
  const byType: Partial<Record<SortilegeQuestionType, string[]>> = {
    yes_no: ['Is this cast supportive or obstructive?', 'What does the cast suggest I do next?', ...base],
    directional: ['What direction does the cast indicate?', 'Is action or restraint advised?', ...base],
    alignment: ['Is this aligned with my path?', 'What does the cast say about alignment?', ...base],
    conditional: ['What conditions does the cast suggest?', 'How should I adjust my approach?', ...base],
    interpretation: ['Explain the symbols in my reading', 'What do the values and positions mean?', ...base],
    general: base
  };
  return byType[questionType] ?? base;
}

async function storeConversation(userId: string, sessionId: string | undefined, question: string, response: SortilegeSeerResponse['data']) {
  try {
    const db = getFirebaseDB();
    const { doc, setDoc } = await import('firebase/firestore');
    const session = sessionId || `session_${Date.now()}`;
    const timestamp = Date.now();
    
    const messageId = `msg_${timestamp}`;
    const messageRef = doc(db, 'sortilegeSeerConversations', userId, 'sessions', session, 'messages', messageId);
    
    await setDoc(messageRef, {
      question,
      answer: response.answer,
      timestamp,
      confidence: response.confidence,
      castReferences: response.castReferences,
      guidance: response.guidance
    });
    
    devLog.info('✅ Sortilege conversation stored successfully', undefined, 'ask-sortilege-seer');
  } catch (error) {
    devLog.error('Error storing conversation:', error);
  }
}

function calculateSimilarity(question1: string, question2: string): number {
  const q1Lower = question1.toLowerCase();
  const q2Lower = question2.toLowerCase();
  
  const keywords = ['cast', 'dice', 'stone', 'card', 'coin', 'stick', 'symbol', 'interpretation', 'guidance', 'sortilege'];
  
  let matches = 0;
  keywords.forEach(kw => {
    if (q1Lower.includes(kw) && q2Lower.includes(kw)) matches += 2;
  });
  
  return matches;
}

async function checkCachedQuestions(userId: string, question: string): Promise<{ answer: string; question?: string } | null> {
  try {
    const db = getFirebaseDB();
    const { collection, query, orderBy, limit, getDocs } = await import('firebase/firestore');
    
    const cacheRef = collection(db, 'sortilegeSeerCache', userId, 'questions');
    const q = query(cacheRef, orderBy('timestamp', 'desc'), limit(20));
    const snapshot = await getDocs(q);
    
    for (const doc of snapshot.docs) {
      const cachedQA = doc.data() as { answer?: unknown; question?: unknown };
      if (typeof cachedQA.question !== 'string' || typeof cachedQA.answer !== 'string') {
        continue;
      }
      const similarity = calculateSimilarity(question, cachedQA.question);
      
      if (similarity >= 5) {
        devLog.debug(`🎯 Found similar sortilege question with similarity score: ${similarity}`, undefined, 'ask-sortilege-seer');
        return { answer: cachedQA.answer, question: cachedQA.question };
      }
    }
    
    return null;
  } catch (error) {
    devLog.error('Error checking cached questions:', error);
    return null;
  }
}

async function cacheQuestionAnswer(userId: string, question: string, answer: string): Promise<void> {
  try {
    const db = getFirebaseDB();
    const { doc, setDoc } = await import('firebase/firestore');
    
    const cacheId = `qa_${Date.now()}`;
    const cacheRef = doc(db, 'sortilegeSeerCache', userId, 'questions', cacheId);
    
    await setDoc(cacheRef, {
      question,
      answer,
      timestamp: Date.now(),
      ttl: Date.now() + (30 * 24 * 60 * 60 * 1000)
    });
    
    devLog.info('✅ Sortilege question cached for future similar questions', undefined, 'ask-sortilege-seer');
  } catch (error) {
    devLog.error('Error caching question:', error);
  }
}
