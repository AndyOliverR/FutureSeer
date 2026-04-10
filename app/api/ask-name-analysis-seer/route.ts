import { NextRequest, NextResponse } from 'next/server'
import { enforceToolSeerGate } from '@/lib/enforceToolSeerGate'
import { appendAttribution } from '@/lib/attribution/attributionStamp';
import { getFirebaseDB } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { createAIStream } from '@/lib/aiGateway';
import { devLog } from '@/lib/devLogger';
import { ConversationalMemory, MemoryMessage } from '@/lib/conversationalMemory';
import {
  buildNameState,
  classifyNameQuestion,
  getNameSliceForQuestionType,
  NAME_REFUSAL_PHRASE,
  type NameAnalysisPayload,
} from '@/lib/nameAnalysisSeerState';
import { buildNameAnalysisSeerSystemPrompt } from '@/lib/nameAnalysisSeerPrompts';

const X_ROBOTS_TAG = 'noindex, nofollow, noarchive, nosnippet';
const SEER_MARKER_FAMILY = 'ask-name-analysis-seer';

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


/** Normalize name analysis from request or comprehensiveProfile to NameAnalysisPayload. */
function normalizeToNamePayload(
  nameAnalysis: unknown,
  comprehensiveProfile?: Record<string, unknown>
): NameAnalysisPayload {
  const raw =
    nameAnalysis ??
    comprehensiveProfile?.nameAnalysis ??
    comprehensiveProfile?.['Name Analysis'];
  const source =
    raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as Record<string, unknown>) : null;
  if (!source) {
    throw new Error(
      'Name Analysis requires name data. Generate your name analysis first to use Ask the Seer.'
    );
  }
  const str = (a: unknown, b: unknown): string | undefined => {
    if (typeof a === 'string' && a) return a;
    if (typeof b === 'string' && b) return b;
    return undefined;
  };
  const num = (a: unknown, b: unknown): number | undefined => {
    if (typeof a === 'number' && !Number.isNaN(a)) return a;
    if (typeof b === 'number' && !Number.isNaN(b)) return b;
    return undefined;
  };
  const miss =
    Array.isArray(source.missingElements) ? source.missingElements :
    Array.isArray(source.missing_elements) ? source.missing_elements :
    undefined;
  const pers =
    source.personality && typeof source.personality === 'object' && !Array.isArray(source.personality)
      ? (source.personality as NameAnalysisPayload['personality'])
      : undefined;

  return {
    fullName: str(source.fullName, source.full_name),
    nameVibration: num(source.nameVibration, source.name_vibration),
    lifePathNumber: num(source.lifePathNumber, source.life_path_number),
    destinyNumber: num(source.destinyNumber, source.destiny_number),
    soulNumber: num(source.soulNumber, source.soul_number),
    personalityNumber: num(source.personalityNumber, source.personality_number),
    nameHarmony: num(source.nameHarmony, source.name_harmony),
    nameBalance: num(source.nameBalance, source.name_balance),
    dominantElement: str(source.dominantElement, source.dominant_element),
    personality: pers,
    missingElements: miss as string[] | undefined,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const __toolSeerGate = await enforceToolSeerGate(request, body, 'ask_name_analysis_seer')
    if (__toolSeerGate) return __toolSeerGate

    const {
      userId,
      question,
      userProfile,
      nameAnalysis,
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

    devLog.info('Name Analysis Seer API: Processing question for user:', userId, 'ask-name-analysis-seer');

    const questionType = classifyNameQuestion(question);
    if (questionType === 'refusal') {
      return jsonWithRobots({
        response: NAME_REFUSAL_PHRASE,
        refused: true,
      });
    }

    let payload: NameAnalysisPayload;
    try {
      payload = normalizeToNamePayload(nameAnalysis, comprehensiveProfile);
    } catch (err) {
      return jsonWithRobots(
        {
          success: false,
          error:
            err instanceof Error
              ? err.message
              : 'Name Analysis requires name data. Generate your analysis first.',
        },
        { status: 400 }
      );
    }

    let state;
    try {
      state = buildNameState(payload);
    } catch {
      return jsonWithRobots(
        {
          success: false,
          error:
            'Name Analysis requires name data. Generate your name analysis first to use Ask the Seer.',
        },
        { status: 400 }
      );
    }

    const slice = getNameSliceForQuestionType(questionType, state);
    const displayName = (userProfile?.displayName ?? '').trim();
    const systemPrompt = buildNameAnalysisSeerSystemPrompt(slice, questionType, {
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
              sources: ['name-analysis'],
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
                    'nameAnalysisSeerConversations',
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
    devLog.error('Error in Name Analysis Seer API:', error);
    return jsonWithRobots(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
