import { NextRequest, NextResponse } from 'next/server'
import { enforceToolSeerGate } from '@/lib/enforceToolSeerGate'
import { appendAttribution } from '@/lib/attribution/attributionStamp';
import { getFirebaseDB } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { callTextStream } from '@/lib/aiStructuredOutput';
import { cacheToolSeerAnswer } from '@/lib/toolSeerQuestionCache';
import { buildToolSeerMessages } from '@/lib/aiPromptBuilder';
import { devLog } from '@/lib/devLogger';
import { ConversationalMemory, MemoryMessage } from '@/lib/conversationalMemory';
import { buildLenormandSeerSystemPrompt } from '@/lib/lenormandSeerPrompts';
import {
  buildLenormandState,
  classifyLenormandQuestion,
  getLenormandSliceForQuestionType,
  LENORMAND_REFUSAL_PHRASE,
  type LenormandReadingPayload,
} from '@/lib/lenormandSeerState';

const X_ROBOTS_TAG = 'noindex, nofollow, noarchive, nosnippet';
const SEER_MARKER_FAMILY = 'ask-lenormand-seer';

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


/** Normalize reading from request to LenormandReadingPayload. */
function normalizeToLenormandPayload(reading: unknown): LenormandReadingPayload {
  const r =
    reading && typeof reading === 'object' && !Array.isArray(reading)
      ? (reading as Record<string, unknown>)
      : null;
  if (!r) {
    throw new Error(
      'Lenormand requires a reading. Perform a reading first to use Ask the Seer.'
    );
  }
  const cardsRaw = Array.isArray(r.cards) ? r.cards : [];
  const q = r.question;
  if ((!q || typeof q !== 'string' || !q.trim()) && cardsRaw.length === 0) {
    throw new Error(
      'Lenormand requires a reading. Perform a reading first to use Ask the Seer.'
    );
  }
  return {
    question: typeof q === 'string' ? q : '',
    spreadType: String(r.spreadType ?? r.spread_type ?? 'three'),
    cards: cardsRaw.map((c) => {
      const row = c && typeof c === 'object' && !Array.isArray(c) ? (c as Record<string, unknown>) : {};
      const kw = row.keywords;
      const keywords =
        Array.isArray(kw) ? kw.filter((x): x is string => typeof x === 'string') : undefined;
      return {
        name: typeof row.name === 'string' ? row.name : '',
        number: typeof row.number === 'number' ? row.number : undefined,
        keywords,
      };
    }),
    positions: Array.isArray(r.positions)
      ? r.positions.filter((x): x is string => typeof x === 'string')
      : [],
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const __toolSeerGate = await enforceToolSeerGate(request, body, 'ask_lenormand_seer')
    if (__toolSeerGate) return __toolSeerGate

    const {
      userId,
      question,
      userProfile,
      lenormandReading,
      sessionId,
    } = body;

    if (!userId || !question || !userProfile) {
      return jsonWithRobots(
        {
          success: false,
          error: 'Missing required parameters: userId, question, or userProfile',
        },
        { status: 400 }
      );
    }

    devLog.info(
      '[ASK-LENORMAND-SEER] Lenormand Seer API: Processing question for user:',
      userId,
      'ask-lenormand-seer'
    );

    const questionType = classifyLenormandQuestion(question);
    if (questionType === 'refusal') {
      return jsonWithRobots({
        response: LENORMAND_REFUSAL_PHRASE,
        refused: true,
      });
    }

    let payload: LenormandReadingPayload;
    try {
      payload = normalizeToLenormandPayload(lenormandReading);
    } catch (err) {
      return jsonWithRobots(
        {
          success: false,
          error:
            err instanceof Error
              ? err.message
              : 'Lenormand requires a reading. Perform a reading first.',
        },
        { status: 400 }
      );
    }

    let state;
    try {
      state = buildLenormandState(payload);
    } catch {
      return jsonWithRobots(
        {
          success: false,
          error:
            'Lenormand requires a reading. Perform a reading first to use Ask the Seer.',
        },
        { status: 400 }
      );
    }

    const slice = getLenormandSliceForQuestionType(questionType, state);
    const displayName = (userProfile?.displayName ?? '').trim();
    const systemPrompt = buildLenormandSeerSystemPrompt(slice, questionType, {
      displayName: displayName || undefined,
    });

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
      .filter((item): item is { question: string; answer: string } => item !== null)
      .slice(-10);

    const { messages } = buildToolSeerMessages({
      systemContent: systemPrompt,
      userMessage: question,
      history: conversationHistory,
    });

    const { stream } = await callTextStream({ label: 'ask-lenormand-seer', model: 'llama-3.3-70b-versatile',
      userId,
      cacheQuestion: typeof question === 'string' ? question.trim() : String(question).trim(),
      messages,
      temperature: 0.6,
      maxTokens: 800,
    });

    return withRobotsResponse(
      new ReadableStream({
        async start(controller) {
          let fullResponse = '';
          try {
            for await (const chunk of stream) {
              const content = chunk.choices?.[0]?.delta?.content || '';
              if (content) {
                fullResponse += content;
                controller.enqueue(new TextEncoder().encode(content));
              }
            }
            const userMessage: MemoryMessage = {
              id: `msg_${Date.now()}_user`,
              timestamp: Date.now(),
              type: 'user',
              content: question,
              questionType: questionType,
              keywords: question.split(' ').slice(0, 5),
            };
            const seerMessage: MemoryMessage = {
              id: `msg_${Date.now()}_seer`,
              timestamp: Date.now(),
              type: 'seer',
              content: fullResponse,
              questionType: questionType,
              confidence: 0.85,
              sources: ['lenormand'],
            };
            await memory.addExchange(userMessage);
            await memory.addExchange(seerMessage);
            memory.addRecentQuestion(question);
            await memory.saveAllMemory();
            try {
              const db = getFirebaseDB();
              if (db) {
                const session = sessionId || `session_${Date.now()}`;
                await setDoc(
                  doc(
                    db,
                    'lenormandSeerConversations',
                    userId,
                    'sessions',
                    session,
                    'messages',
                    `msg_${Date.now()}`
                  ),
                  {
                    question,
                    answer: fullResponse,
                    timestamp: Date.now(),
                    confidence: 0.85,
                  }
                );
              }
            } catch {
              /* non-fatal */
            if (fullResponse.trim()) {
              await cacheToolSeerAnswer('ask-lenormand-seer', userId, question, fullResponse);
            }
            }
          } catch (error) {
            devLog.error('Error during Lenormand Seer streaming:', error);
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
          Connection: 'keep-alive',
        },
      }
    );
  } catch (error) {
    devLog.error('Error in Lenormand Seer API:', error);
    return jsonWithRobots(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
