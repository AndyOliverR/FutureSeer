import { NextRequest, NextResponse } from 'next/server'
import { enforceToolSeerGate } from '@/lib/enforceToolSeerGate'
import { appendAttribution } from '@/lib/attribution/attributionStamp';
import { getFirebaseDB } from '@/lib/firebase';
import { createAIStream } from '@/lib/aiGateway';
import { devLog } from '@/lib/devLogger';
import { ConversationalMemory, MemoryMessage } from '@/lib/conversationalMemory';
import {
  buildNavaratnaGemstoneState,
  classifyNavaratnaQuestion,
  getNavaratnaSliceForQuestionType,
  type NavaratnaQuestionType,
} from '@/lib/navaratnaSeerState';
import type { NavaratnaAnalysis } from '@/lib/navaratnaIntelligence';
import { buildNavaratnaSeerSystemPrompt } from '@/lib/navaratnaSeerPrompts';

const X_ROBOTS_TAG = 'noindex, nofollow, noarchive, nosnippet';
const SEER_MARKER_FAMILY = 'ask-navaratna-seer';

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


interface NavaratnaSeerRequest {
  userId: string;
  question: string;
  userProfile?: unknown;
  navaratnaAnalysis?: Record<string, unknown> & {
    chartSummary?: unknown;
    recommendations?: {
      lifeStone?: { gemstone?: { english?: string } };
      beneficStones?: Array<{ gemstone?: { english?: string } }>;
      avoidedStones?: Array<{ gemstone?: string }>;
      dashaStone?: { gemstone?: { english?: string } };
    };
    planetaryAnalysis?: Array<{ planet?: string }>;
    safetyWarnings?: string[];
  };
  comprehensiveProfile?: Record<string, unknown> & {
    navaratna?: { analysis?: NavaratnaSeerRequest['navaratnaAnalysis'] } | NavaratnaSeerRequest['navaratnaAnalysis'];
    navaratnaPlanetaryStones?: { analysis?: NavaratnaSeerRequest['navaratnaAnalysis'] } | NavaratnaSeerRequest['navaratnaAnalysis'];
  };
  sessionId?: string;
}

interface NavaratnaSeerResponse {
  success: boolean;
  data: {
    answer: string;
    confidence: number;
    gemstoneReferences: {
      lifeStone: string | null;
      beneficStones: string[];
      avoidedStones: string[];
      dashaStone: string | null;
    };
    planetaryInfluences: string[];
    guidance: string[];
    followUpQuestions: string[];
  };
  error?: string;
}

function getRefusalMessage(question: string): string {
  const lower = question.toLowerCase();
  if (
    /\b(ignore safety|skip testing|without (testing|consultation)|override (safety|rules))\b/.test(
      lower
    )
  ) {
    return 'Gemstone recommendations cannot be made safely without full chart validation.';
  }
  return 'Gemstones modify planetary expression; they do not override karma.';
}

export async function POST(request: NextRequest) {
  try {
    const body: NavaratnaSeerRequest = await request.json();
    const __toolSeerGate = await enforceToolSeerGate(request, body, 'ask_navaratna_seer')
    if (__toolSeerGate) return __toolSeerGate

    const { userId, question, sessionId } = body;
    let rawNavaratna: unknown = body.navaratnaAnalysis;
    if (!rawNavaratna && body.comprehensiveProfile) {
      const cp = body.comprehensiveProfile;
      rawNavaratna =
        cp.navaratna?.analysis ??
        cp.navaratna ??
        cp.navaratnaPlanetaryStones?.analysis ??
        cp.navaratnaPlanetaryStones;
    }

    if (!userId || !question) {
      return jsonWithRobots({
        success: false,
        error: 'Missing required parameters: userId or question'
      }, { status: 400 });
    }

    const navaratnaAnalysis =
      rawNavaratna &&
      typeof rawNavaratna === 'object' &&
      !Array.isArray(rawNavaratna) &&
      (rawNavaratna as Record<string, unknown>).chartSummary != null
        ? (rawNavaratna as NavaratnaAnalysis)
        : null;

    if (!navaratnaAnalysis) {
      return jsonWithRobots({
        success: false,
        error: 'Gemstone recommendations cannot be made safely without full chart validation.'
      }, { status: 400 });
    }

    let state;
    try {
      state = buildNavaratnaGemstoneState(navaratnaAnalysis);
    } catch {
      return jsonWithRobots({
        success: false,
        error: 'Gemstone recommendations cannot be made safely without full chart validation.'
      }, { status: 400 });
    }

    const questionType = classifyNavaratnaQuestion(question) as NavaratnaQuestionType;
    devLog.debug('🔍 Question type:', questionType, 'ask-navaratna-seer');

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

    devLog.info('💎 Navaratna Seer API: Processing question for user:', userId, 'ask-navaratna-seer');

    const cachedResponse = await checkCachedQuestions(userId, question);
    if (cachedResponse) {
      devLog.info('🎯 Returning cached response for similar question', undefined, 'ask-navaratna-seer');
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

    const chartSlice = getNavaratnaSliceForQuestionType(questionType, state, navaratnaAnalysis);
    const systemPrompt = buildNavaratnaSeerSystemPrompt(chartSlice, questionType);

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

            const responseData: NavaratnaSeerResponse['data'] = {
              answer: fullResponse,
              confidence: 0.85,
              gemstoneReferences: {
                lifeStone: navaratnaAnalysis.recommendations?.lifeStone?.gemstone?.english ?? null,
                beneficStones: navaratnaAnalysis.recommendations?.beneficStones?.map((s) => s.gemstone?.english ?? '')?.filter(Boolean) || [],
                avoidedStones: navaratnaAnalysis.recommendations?.avoidedStones?.map((s) => s.gemstone ?? '')?.filter(Boolean) || [],
                dashaStone: navaratnaAnalysis.recommendations?.dashaStone?.gemstone?.english ?? null,
              },
              planetaryInfluences: navaratnaAnalysis.planetaryAnalysis?.map((p) => p.planet ?? '')?.filter(Boolean) || [],
              guidance: navaratnaAnalysis.safetyWarnings || [],
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
              sources: ['navaratna']
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
    devLog.error('Error in Navaratna Seer API:', error);
    return jsonWithRobots({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}

function generateFollowUpQuestions(questionType: NavaratnaQuestionType): string[] {
  const followUps: { [key in NavaratnaQuestionType]?: string[] } = {
    which_stone: [
      'What is my Life Stone and why?',
      'Is [X] gemstone safe for me?',
      'Why should I avoid this stone?'
    ],
    is_safe: [
      'Which gemstone should I wear?',
      'What is my Life Stone and why?',
      'How should I wear my Life Stone?'
    ],
    dasha_stone: [
      'Which gemstone should I wear?',
      'What should I wear in my current Dasha?',
      'Why should I avoid this stone?'
    ],
    why_avoid: [
      'Which gemstone should I wear?',
      'What is my Life Stone and why?',
      'Is [X] gemstone safe for me?'
    ],
    general: [
      'Which gemstone should I wear?',
      'What is my Life Stone and why?',
      'How should I wear my Life Stone?'
    ]
  };
  return followUps[questionType] || [
    'Which gemstone should I wear?',
    'What is my Life Stone and why?',
    'How should I wear my Life Stone?'
  ];
}

async function storeConversation(userId: string, sessionId: string | undefined, question: string, response: NavaratnaSeerResponse['data']) {
  try {
    const db = getFirebaseDB();
    const { doc, setDoc } = await import('firebase/firestore');
    const session = sessionId || `session_${Date.now()}`;
    const timestamp = Date.now();
    
    const messageId = `msg_${timestamp}`;
    const messageRef = doc(db, 'navaratnaSeerConversations', userId, 'sessions', session, 'messages', messageId);
    
    await setDoc(messageRef, {
      question,
      answer: response.answer,
      timestamp,
      confidence: response.confidence,
      gemstoneReferences: response.gemstoneReferences,
      guidance: response.guidance
    });
    
    devLog.info('✅ Navaratna conversation stored successfully', undefined, 'ask-navaratna-seer');
  } catch (error) {
    devLog.error('Error storing conversation:', error);
  }
}

function calculateSimilarity(question1: string, question2: string): number {
  const q1Lower = question1.toLowerCase();
  const q2Lower = question2.toLowerCase();
  
  const keywords = ['gemstone', 'stone', 'lagnesh', 'life stone', 'dasha', 'planet', 'wear', 'mantra', 'benefit', 'avoid'];
  
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
    
    const cacheRef = collection(db, 'navaratnaSeerCache', userId, 'questions');
    const q = query(cacheRef, orderBy('timestamp', 'desc'), limit(20));
    const snapshot = await getDocs(q);
    
    for (const doc of snapshot.docs) {
      const cachedQA = doc.data() as { answer?: unknown; question?: unknown };
      if (typeof cachedQA.question !== 'string' || typeof cachedQA.answer !== 'string') {
        continue;
      }
      const similarity = calculateSimilarity(question, cachedQA.question);
      
      if (similarity >= 5) {
        devLog.debug(`🎯 Found similar Navaratna question with similarity score: ${similarity}`, undefined, 'ask-navaratna-seer');
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
    const cacheRef = doc(db, 'navaratnaSeerCache', userId, 'questions', cacheId);
    
    await setDoc(cacheRef, {
      question,
      answer,
      timestamp: Date.now(),
      ttl: Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 days TTL
    });
    
    devLog.info('✅ Navaratna question cached for future similar questions', undefined, 'ask-navaratna-seer');
  } catch (error) {
    devLog.error('Error caching question:', error);
  }
}
