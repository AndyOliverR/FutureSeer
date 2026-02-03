import { NextRequest, NextResponse } from 'next/server';
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

interface IChingSeerRequest {
  userId: string;
  question: string;
  userProfile?: any;
  ichingAnalysis: any;
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
    const { userId, question, userProfile, ichingAnalysis, sessionId }: IChingSeerRequest = await request.json();

    if (!userId || !question) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: userId or question'
      }, { status: 400 });
    }

    if (!ichingAnalysis || !ichingAnalysis.hexagram) {
      return NextResponse.json({
        success: false,
        error: 'Run an I Ching reading first to use Ask the Seer.'
      }, { status: 400 });
    }

    let state;
    try {
      state = buildIChingState(ichingAnalysis);
    } catch (err) {
      return NextResponse.json({
        success: false,
        error: 'Run an I Ching reading first to use Ask the Seer.'
      }, { status: 400 });
    }

    const questionType = classifyIChingQuestion(question) as IChingQuestionType;
    devLog.debug('🔍 Question type:', questionType, 'ask-iching-seer');

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

    devLog.info('🔮 I Ching Seer API: Processing question for user:', userId, 'ask-iching-seer');

    const cachedResponse = await checkCachedQuestions(userId, question);
    if (cachedResponse) {
      devLog.info('🎯 Returning cached response for similar question', undefined, 'ask-iching-seer');
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

    const chartSlice = getIChingSliceForQuestionType(questionType, state, ichingAnalysis);
    const systemPrompt = buildIChingSystemPrompt(chartSlice, questionType);

    return new Response(
      new ReadableStream({
        async start(controller) {
          try {
            const stream = await createAIStream({
              model: 'llama-3.3-70b-versatile',
              messages: [
                { role: 'system', content: systemPrompt },
                ...conversationHistory.map(item => ({
                  role: 'user' as const,
                  content: item.question
                })),
                ...conversationHistory.map(item => ({
                  role: 'assistant' as const,
                  content: item.answer.substring(0, 500) + '...'
                })),
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
                hexagramNumber: ichingAnalysis.hexagram.number,
                hexagramName: ichingAnalysis.hexagram.name,
                changingLines: (ichingAnalysis.hexagram.lines || [])
                  .filter((l: any) => l.changing)
                  .map((l: any) => l.position) || [],
                trigrams: [
                  ichingAnalysis.hexagram.trigramUpper || '',
                  ichingAnalysis.hexagram.trigramLower || ''
                ].filter(Boolean),
                elements: [
                  ichingAnalysis.hexagram.elementUpper || '',
                  ichingAnalysis.hexagram.elementLower || ''
                ].filter(Boolean)
              },
              timing: [],
              guidance: ichingAnalysis.recommendations || [],
              followUpQuestions: generateFollowUpQuestions(questionType, { ichingAnalysis })
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
    console.error('Error in I Ching Seer API:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}

function buildIChingSystemPrompt(chartSlice: string, questionType: IChingQuestionType): string {
  return `You are an expert I Ching interpreter. I Ching is a state-transition system: it describes movement between states, not final outcomes. Your answers must reflect this.

CORE RULES (non-negotiable):
1. I Ching answers describe movement between states, not final outcomes. Never predict what will happen or when.
2. Interpret in strict order: primary hexagram (current state) → changing lines only (bottom to top, pressure points) → resulting hexagram (emerging state). Do not interpret non-changing lines.
3. Trigram logic: upper = external conditions, lower = internal condition. Synthesize "inner readiness vs outer reality."
4. Every answer must conclude with exactly one of: Advance (act deliberately), Hold (maintain position), or Withdraw (pause or disengage). No ambiguity, no emotional hedging.
5. Do not give timing, dates, or outcome guarantees. Do not answer medical or legal questions with I Ching.
6. Permanent rule: "I Ching advises how to move, not what will happen."

HEXAGRAM DATA (use only this):
${chartSlice}

Be conversational and direct. Use "you" and "your." Reference the hexagram number and name. Explain only the changing lines when present. End with a clear Advance, Hold, or Withdraw. No markdown headers.`;
}

function generateFollowUpQuestions(questionType: IChingQuestionType, context: any): string[] {
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

async function getConversationHistory(userId: string, sessionId?: string): Promise<any[]> {
  try {
    const db = getFirebaseDB();
    const { collection, query, orderBy, limit, getDocs } = await import('firebase/firestore');
    const session = sessionId || `session_${Date.now()}`;
    
    // Use proper Firestore collection reference
    const messagesRef = collection(db, 'ichingSeerConversations', userId, 'sessions', session, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'desc'), limit(10));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => doc.data()).reverse(); // Reverse to get chronological order
  } catch (error) {
    console.error('Error getting conversation history:', error);
    return []; // Return empty array on error
  }
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
    console.error('Error storing conversation:', error);
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
async function checkCachedQuestions(userId: string, question: string): Promise<any | null> {
  try {
    const db = getFirebaseDB();
    const { collection, query, orderBy, limit, getDocs } = await import('firebase/firestore');
    
    const cacheRef = collection(db, 'ichingSeerCache', userId, 'questions');
    const q = query(cacheRef, orderBy('timestamp', 'desc'), limit(20));
    const snapshot = await getDocs(q);
    
    for (const doc of snapshot.docs) {
      const cachedQA = doc.data();
      const similarity = calculateSimilarity(question, cachedQA.question);
      
      if (similarity >= 5) { // Threshold for similarity
        devLog.debug(`🎯 Found similar I Ching question with similarity score: ${similarity}`, undefined, 'ask-iching-seer');
        return cachedQA;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error checking cached questions:', error);
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
    console.error('Error caching question:', error);
  }
}

