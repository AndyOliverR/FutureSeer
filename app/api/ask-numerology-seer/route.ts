import { NextRequest, NextResponse } from 'next/server';
import { enforceToolSeerGate } from '@/lib/enforceToolSeerGate';
import { appendAttribution } from '@/lib/attribution/attributionStamp';
import { getFirebaseDB } from '@/lib/firebase';
import { doc, setDoc, collection } from 'firebase/firestore';
import { callTextStream } from '@/lib/aiStructuredOutput';
import { cacheToolSeerAnswer } from '@/lib/toolSeerQuestionCache';
import { buildToolSeerMessages } from '@/lib/aiPromptBuilder';
import { devLog } from '@/lib/devLogger';
import { ConversationalMemory, MemoryMessage } from '@/lib/conversationalMemory';
import {
  buildChaldeanState,
  classifyChaldeanQuestion,
  getChaldeanSliceForQuestionType,
} from '@/lib/chaldeanSeerState';
import { buildChaldeanSeerSystemPrompt } from '@/lib/chaldeanSeerPrompts';
import { GROQ_DEFAULT_TEXT_MODEL } from '@/lib/groqModels';

const X_ROBOTS_TAG = 'noindex, nofollow, noarchive, nosnippet';
const SEER_MARKER_FAMILY = 'ask-numerology-seer';

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


interface NumerologySeerRequest {
  userId: string;
  question: string;
  userProfile: Record<string, unknown>;
  numerologyData: {
    lifePathNumber?: number;
    expressionNumber?: number;
    soulUrgeNumber?: number;
    personalityNumber?: number;
    destinyNumber?: number;
    birthdayNumber?: number;
    maturityNumber?: number;
    personalYearNumber?: number;
    breakdown?: Record<string, unknown>;
  };
  comprehensiveReport?: Record<string, unknown>;
  sessionId?: string;
}

// Store conversation
async function storeConversation(
  userId: string,
  sessionId: string | undefined,
  question: string,
  response: { answer: string; confidence?: number; followUpQuestions?: string[] }
): Promise<void> {
  try {
    const db = getFirebaseDB();
    if (!db) return;

    const session = sessionId || 'default';
    const messagesRef = collection(db, 'users', userId, 'numerologyConversations', session, 'messages');
    
    await setDoc(doc(messagesRef), {
      question,
      answer: response.answer,
      confidence: response.confidence || 0.85,
      timestamp: Date.now(),
      followUpQuestions: response.followUpQuestions || []
    });
  } catch (error) {
    devLog.error('Error storing conversation:', error);
  }
}

// Generate follow-up questions
function generateNumerologyFollowUpQuestions(questionType: string, numerologyData: NumerologySeerRequest['numerologyData']): string[] {
  const lifePath = numerologyData.lifePathNumber || 0;
  const expression = numerologyData.expressionNumber || numerologyData.destinyNumber || 0;
  
  const questions: string[] = [];
  
  if (questionType !== 'life_path') {
    questions.push(`What does my Life Path Number ${lifePath} reveal about my life purpose?`);
  }
  
  if (questionType !== 'expression') {
    questions.push(`How can I express my Expression Number ${expression} more authentically?`);
  }
  
  if (questionType !== 'personal_year') {
    questions.push(`What should I focus on during my current Personal Year?`);
  }
  
  questions.push(`What are the challenges and opportunities in my numerology profile?`);
  questions.push(`How can I use numerology to improve my relationships?`);
  
  return questions.slice(0, 4);
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as NumerologySeerRequest;
    const __toolSeerGate = await enforceToolSeerGate(request, body, 'ask_numerology_seer');
    if (__toolSeerGate) return __toolSeerGate;
    const { userId, question, userProfile, numerologyData, comprehensiveReport, sessionId } = body;

    if (!userId || !question || !userProfile || !numerologyData) {
      return jsonWithRobots({
        success: false,
        error: 'Missing required parameters: userId, question, userProfile, or numerologyData'
      }, { status: 400 });
    }

    devLog.info('🔮 Numerology Seer API: Processing question for user:', userId, 'ask-numerology-seer');

    // Classify question; refuse exact timing, medical, legal, wealth certainty, etc.
    const questionType = classifyChaldeanQuestion(question);
    if (questionType === 'refusal') {
      const refusalMessage =
        'Numerology describes alignment, not guarantees. It cannot give exact dates or deterministic outcomes. I can help with name vibration, cycles, and alignment instead.';
      return withRobotsResponse(
        new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode(stampText(refusalMessage)));
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

    // Build state and slice (expert: reason only from slice)
    const state = buildChaldeanState(numerologyData, userProfile, comprehensiveReport);
    const chartSlice = getChaldeanSliceForQuestionType(questionType, state);

    // Initialize conversational memory with cross-session context
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

    // Stream conversational response via AI Gateway (slice-based prompt)
    const { messages } = buildToolSeerMessages({
      systemContent: buildChaldeanSeerSystemPrompt(chartSlice, questionType),
      userMessage: question,
      history: conversationHistory,
    });

    const { stream } = await callTextStream({ label: 'ask-numerology-seer', model: GROQ_DEFAULT_TEXT_MODEL,
      userId,
      cacheQuestion: typeof question === 'string' ? question.trim() : String(question).trim(),
      messages,
      temperature: 0.7,
      maxTokens: 1000,
    });

    // Return streaming response
    return withRobotsResponse(
      new ReadableStream({
        async start(controller) {
          let fullResponse = '';
          
          try {
            for await (const chunk of stream) {
              const content = chunk.choices[0]?.delta?.content || '';
              if (content) {
                fullResponse += content;
                controller.enqueue(new TextEncoder().encode(content));
              }
            }
            
            // Store in unified memory system
            const userMessage: MemoryMessage = {
              id: `msg_${Date.now()}_user`,
              timestamp: Date.now(),
              type: 'user',
              content: question,
              questionType: questionType as string,
              keywords: question.split(' ').slice(0, 5),
            };

            const seerMessage: MemoryMessage = {
              id: `msg_${Date.now()}_seer`,
              timestamp: Date.now(),
              type: 'seer',
              content: fullResponse,
              questionType: questionType as string,
              confidence: 0.9,
              sources: ['numerology'],
            };

            await memory.addExchange(userMessage);
            await memory.addExchange(seerMessage);
            memory.addRecentQuestion(question);
            await memory.saveAllMemory();

            await storeConversation(userId, sessionId, question, {
              answer: fullResponse,
              confidence: 0.90,
              followUpQuestions: generateNumerologyFollowUpQuestions(questionType as string, numerologyData),
            });
          await cacheToolSeerAnswer('ask-numerology-seer', userId, question, fullResponse);
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
    devLog.error('Error in Numerology Seer API:', error);
    return jsonWithRobots({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}

