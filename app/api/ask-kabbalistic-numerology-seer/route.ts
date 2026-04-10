import { NextRequest, NextResponse } from 'next/server'
import { enforceToolSeerGate } from '@/lib/enforceToolSeerGate'
import { appendAttribution } from '@/lib/attribution/attributionStamp';
import { getFirebaseDB } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { createAIStream } from '@/lib/aiGateway';
import { devLog } from '@/lib/devLogger';
import { ConversationalMemory, MemoryMessage } from '@/lib/conversationalMemory';
import {
  buildKabbalisticState,
  classifyKabbalisticQuestion,
  getKabbalisticSliceForQuestionType,
  KABBALISTIC_REFUSAL_PHRASE,
  type KabbalisticAnalysisPayload,
} from '@/lib/kabbalisticNumerologySeerState';
import { buildKabbalisticNumerologySeerSystemPrompt } from '@/lib/kabbalisticNumerologySeerPrompts';

const X_ROBOTS_TAG = 'noindex, nofollow, noarchive, nosnippet';
const SEER_MARKER_FAMILY = 'ask-kabbalistic-numerology-seer';

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


/** Normalize kabbalistic payload from request or comprehensiveProfile. */
function normalizeToKabbalisticPayload(
  kabbalisticAnalysis: unknown,
  comprehensiveProfile?: Record<string, unknown>
): KabbalisticAnalysisPayload {
  const asRoot = (v: unknown): Record<string, unknown> | undefined =>
    v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : undefined;

  const fromRoot = (root: Record<string, unknown> | undefined): KabbalisticAnalysisPayload | null => {
    if (!root) return null;
    const chart = asRoot(root.chart);
    if (chart?.nameAnalysis) {
      return { chart: chart as KabbalisticAnalysisPayload['chart'] };
    }
    if (root.nameAnalysis) {
      return {
        chart: { nameAnalysis: root.nameAnalysis as KabbalisticAnalysisPayload['nameAnalysis'] },
        nameAnalysis: root.nameAnalysis as KabbalisticAnalysisPayload['nameAnalysis'],
      };
    }
    return null;
  };

  const direct = fromRoot(asRoot(kabbalisticAnalysis));
  if (direct) return direct;

  if (comprehensiveProfile) {
    const kabbalistic = asRoot(
      comprehensiveProfile.kabbalisticNumerology ?? comprehensiveProfile['Kabbalistic Numerology']
    );
    const fromProfile = fromRoot(kabbalistic);
    if (fromProfile) return fromProfile;
  }
  throw new Error(
    'Kabbalistic Numerology requires name analysis. Generate your Kabbalistic analysis first to use Ask the Seer.'
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const __toolSeerGate = await enforceToolSeerGate(request, body, 'ask_kabbalistic_numerology_seer')
    if (__toolSeerGate) return __toolSeerGate

    const {
      userId,
      question,
      userProfile,
      kabbalisticAnalysis,
      comprehensiveProfile,
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

    devLog.info('🔮 Kabbalistic Numerology Seer API: Processing question for user:', userId, 'ask-kabbalistic-numerology-seer');

    const questionType = classifyKabbalisticQuestion(question);
    if (questionType === 'refusal') {
      return jsonWithRobots({
        response: KABBALISTIC_REFUSAL_PHRASE,
        refused: true,
      });
    }

    let payload: KabbalisticAnalysisPayload;
    try {
      payload = normalizeToKabbalisticPayload(kabbalisticAnalysis, comprehensiveProfile);
    } catch (err) {
      return jsonWithRobots(
        {
          success: false,
          error:
            err instanceof Error
              ? err.message
              : 'Kabbalistic Numerology requires name analysis. Generate your analysis first.',
        },
        { status: 400 }
      );
    }

    let state;
    try {
      state = buildKabbalisticState(payload);
    } catch {
      return jsonWithRobots(
        {
          success: false,
          error:
            'Kabbalistic Numerology requires name analysis. Generate your Kabbalistic analysis first to use Ask the Seer.',
        },
        { status: 400 }
      );
    }

    const slice = getKabbalisticSliceForQuestionType(questionType, state);
    const displayName = (userProfile?.displayName ?? '').trim();
    const systemPrompt = buildKabbalisticNumerologySeerSystemPrompt(slice, questionType, {
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

    const stream = await createAIStream({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.flatMap((h: { question: string; answer: string } | null) =>
          h ? [
            { role: 'user' as const, content: h.question },
            { role: 'assistant' as const, content: h.answer },
          ] : []
        ),
        { role: 'user', content: question },
      ],
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
              sources: ['kabbalistic-numerology'],
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
                    'kabbalisticSeerConversations',
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
            }
          } catch (error) {
            devLog.error('Error during streaming:', error);
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
    devLog.error('Error in Kabbalistic Numerology Seer API:', error);
    return jsonWithRobots(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
