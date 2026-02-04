import { NextRequest, NextResponse } from 'next/server';
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

interface NavaratnaSeerRequest {
  userId: string;
  question: string;
  userProfile?: any;
  navaratnaAnalysis?: any;
  comprehensiveProfile?: any;
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
    const { userId, question, userProfile, sessionId } = body;
    let navaratnaAnalysis = body.navaratnaAnalysis;
    if (!navaratnaAnalysis && body.comprehensiveProfile) {
      const cp = body.comprehensiveProfile;
      navaratnaAnalysis = cp.navaratna?.analysis ?? cp.navaratna ?? cp.navaratnaPlanetaryStones?.analysis ?? cp.navaratnaPlanetaryStones;
    }

    if (!userId || !question) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: userId or question'
      }, { status: 400 });
    }

    if (!navaratnaAnalysis || !navaratnaAnalysis.chartSummary) {
      return NextResponse.json({
        success: false,
        error: 'Gemstone recommendations cannot be made safely without full chart validation.'
      }, { status: 400 });
    }

    let state;
    try {
      state = buildNavaratnaGemstoneState(navaratnaAnalysis);
    } catch (err) {
      return NextResponse.json({
        success: false,
        error: 'Gemstone recommendations cannot be made safely without full chart validation.'
      }, { status: 400 });
    }

    const questionType = classifyNavaratnaQuestion(question) as NavaratnaQuestionType;
    devLog.debug('🔍 Question type:', questionType, 'ask-navaratna-seer');

    if (questionType === 'refusal') {
      const refusalText = getRefusalMessage(question);
      return new Response(
        new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode(refusalText));
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
      return new Response(
        new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode(cachedResponse.answer));
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
      .filter((item: any) => item !== null)
      .slice(-10);

    const chartSlice = getNavaratnaSliceForQuestionType(questionType, state, navaratnaAnalysis);
    const systemPrompt = buildNavaratnaSystemPrompt(chartSlice, questionType);

    return new Response(
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
                lifeStone: navaratnaAnalysis.recommendations?.lifeStone?.gemstone.english || null,
                beneficStones: navaratnaAnalysis.recommendations?.beneficStones?.map((s: any) => s.gemstone.english) || [],
                avoidedStones: navaratnaAnalysis.recommendations?.avoidedStones?.map((s: any) => s.gemstone) || [],
                dashaStone: navaratnaAnalysis.recommendations?.dashaStone?.gemstone.english || null
              },
              planetaryInfluences: navaratnaAnalysis.planetaryAnalysis?.map((p: any) => p.planet) || [],
              guidance: navaratnaAnalysis.safetyWarnings || [],
              followUpQuestions: generateFollowUpQuestions(questionType, { navaratnaAnalysis })
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
            console.error('Error during streaming:', error);
            controller.enqueue(new TextEncoder().encode('I apologize, but I encountered an error. Please try again.'));
          } finally {
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
    console.error('Error in Navaratna Seer API:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}

function buildNavaratnaSystemPrompt(chartSlice: string, _questionType: NavaratnaQuestionType): string {
  return `You are an expert Vedic astrologer and Navaratna gemstone specialist. Navaratna is a Vedic remedial system (Upaya); gemstones strengthen or stabilize planetary influences only when the planet is functionally benefic and safe to strengthen.

CORE RULES (non-negotiable):
1. No gemstone may be recommended unless the planet is both functionally benefic and safe to strengthen.
2. Lagnesh supremacy: Life Stone = Lagnesh gemstone. When recommending the Life Stone, state explicitly: "This is your Life Stone because it strengthens the Ascendant."
3. Never recommend gemstones for Maraka planets. No exceptions.
4. Dasha: Strengthen Dasha lord only if functionally benefic and not Maraka; otherwise say: "Even though this planet is active in Dasha, strengthening it is not advised."
5. Give complete procedural details (day, time, metal, finger, hand, weight, mantra, purification) from the provided data in your response; do not be vague. When the data includes wearing instructions and weight, state them explicitly (e.g. "Wear on Wednesday, in silver, on the little finger of the right hand, 5–7 ratti"). Recommend minimum gemstones only; cite exact values from the data.
6. You are the expert. Do not tell the user to "consult an experienced Vedic astrologer" or to seek another source for procedural details—provide the details yourself from the data above.
7. Include testing period for intense stones (e.g. Blue Sapphire); contraindication warnings; explicit avoidance list where relevant.
8. Permanent rule: "Gemstones amplify planetary energy; they do not discriminate between good and bad outcomes."
9. Do not promise outcomes (wealth, success, destiny change). Do not recommend multiple stones casually.
10. You may mention that authentic, purified gemstones are essential and that a trusted source for purchasing can be recommended when available (no external link or "consult" redirect here).

GEMSTONE ELIGIBILITY DATA (use only this):
${chartSlice}

Be conversational and direct. Use "you" and "your." Reference Lagnesh, Life Stone, allowed/forbidden gemstones. Cite the exact wearing instructions (day, metal, finger, weight, mantra, purification) from the data when answering how to wear a stone. Explain why stones are avoided (Maraka, malefic). Include safety/testing where relevant. No markdown headers.`;
}

function generateFollowUpQuestions(questionType: NavaratnaQuestionType, context: any): string[] {
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

async function getConversationHistory(userId: string, sessionId?: string): Promise<any[]> {
  try {
    const db = getFirebaseDB();
    const { collection, query, orderBy, limit, getDocs } = await import('firebase/firestore');
    const session = sessionId || `session_${Date.now()}`;
    
    const messagesRef = collection(db, 'navaratnaSeerConversations', userId, 'sessions', session, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'desc'), limit(10));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => doc.data()).reverse();
  } catch (error) {
    console.error('Error getting conversation history:', error);
    return [];
  }
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
    console.error('Error storing conversation:', error);
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

async function checkCachedQuestions(userId: string, question: string): Promise<any | null> {
  try {
    const db = getFirebaseDB();
    const { collection, query, orderBy, limit, getDocs } = await import('firebase/firestore');
    
    const cacheRef = collection(db, 'navaratnaSeerCache', userId, 'questions');
    const q = query(cacheRef, orderBy('timestamp', 'desc'), limit(20));
    const snapshot = await getDocs(q);
    
    for (const doc of snapshot.docs) {
      const cachedQA = doc.data();
      const similarity = calculateSimilarity(question, cachedQA.question);
      
      if (similarity >= 5) {
        devLog.debug(`🎯 Found similar Navaratna question with similarity score: ${similarity}`, undefined, 'ask-navaratna-seer');
        return cachedQA;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error checking cached questions:', error);
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
    console.error('Error caching question:', error);
  }
}
