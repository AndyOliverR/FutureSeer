import { NextRequest, NextResponse } from 'next/server';
import { appendAttribution } from '@/lib/attribution/attributionStamp';
import { getFirebaseDB } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { createAIStream } from '@/lib/aiGateway';
import { devLog } from '@/lib/devLogger';
import { ConversationalMemory, MemoryMessage } from '@/lib/conversationalMemory';
import { buildVastuSeerSystemPrompt } from '@/lib/vastuSeerPrompts';
import {
  buildVastuState,
  classifyVastuQuestion,
  getVastuSliceForQuestionType,
  VASTU_REFUSAL_DATA_PHRASE,
  VASTU_REFUSAL_OUTCOME_PHRASE,
  type VastuReadingPayload,
  type VastuLayoutInput,
} from '@/lib/vastuSeerState';

const X_ROBOTS_TAG = 'noindex, nofollow, noarchive, nosnippet';
const SEER_MARKER_FAMILY = 'ask-vastu-seer';

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


/** Normalize Vastu reading/analysis from request to VastuReadingPayload. */
function normalizeToVastuPayload(reading: unknown): VastuReadingPayload {
  const r =
    reading && typeof reading === 'object' && !Array.isArray(reading)
      ? (reading as Record<string, unknown>)
      : null;
  if (!r) {
    throw new Error(
      'Vastu requires orientation (entrance or facing direction). Complete your Vastu analysis or provide orientation to use Ask the Seer.'
    );
  }
  const mainEnt =
    r.mainEntranceAnalysis && typeof r.mainEntranceAnalysis === 'object' && !Array.isArray(r.mainEntranceAnalysis)
      ? (r.mainEntranceAnalysis as Record<string, unknown>)
      : undefined;
  const facingFromMain =
    mainEnt && typeof mainEnt.houseFacing === 'string' ? mainEnt.houseFacing : undefined;
  const entranceDir = typeof r.entranceDirection === 'string' ? r.entranceDirection : undefined;
  if (!entranceDir?.trim() && !facingFromMain?.trim()) {
    throw new Error(
      'Vastu requires orientation (entrance or facing direction). Complete your Vastu analysis or provide orientation to use Ask the Seer.'
    );
  }
  const roomsRaw = Array.isArray(r.rooms) ? r.rooms : [];
  return {
    propertyType: typeof r.propertyType === 'string' ? r.propertyType : 'residential',
    plotShape: r.plotShape as VastuReadingPayload['plotShape'],
    entranceDirection: entranceDir ?? facingFromMain ?? '',
    construction_stage: r.construction_stage as VastuReadingPayload['construction_stage'],
    rooms: roomsRaw.map((item) => {
      const row =
        item && typeof item === 'object' && !Array.isArray(item)
          ? (item as Record<string, unknown>)
          : {};
      return {
        name: typeof row.name === 'string' ? row.name : '',
        currentDirection:
          (typeof row.currentDirection === 'string' ? row.currentDirection : undefined) ??
          (typeof row.idealDirection === 'string' ? row.idealDirection : undefined),
        idealDirection:
          (typeof row.idealDirection === 'string' ? row.idealDirection : undefined) ??
          (typeof row.currentDirection === 'string' ? row.currentDirection : undefined),
        status: row.status as string | undefined,
      };
    }),
    mainEntranceAnalysis: r.mainEntranceAnalysis as VastuReadingPayload['mainEntranceAnalysis'],
    occupant_context: r.occupant_context as VastuReadingPayload['occupant_context'],
  };
}

/** Build payload from user-provided layout (facing + room directions). Enables Ask the Seer without full analysis. */
function payloadFromLayout(layoutInput: VastuLayoutInput): VastuReadingPayload {
  const facing = layoutInput.facing_direction?.trim();
  if (!facing || facing.toLowerCase() === 'unknown') {
    throw new Error(
      'Please fill in the facing direction so Ask the Seer can give layout-specific advice.'
    );
  }
  const hasLayout =
    layoutInput.kitchen ||
    layoutInput.bedroom ||
    layoutInput.toilet ||
    layoutInput.main_door ||
    layoutInput.living_room ||
    layoutInput.prayer_room ||
    layoutInput.center;
  if (!hasLayout) {
    throw new Error(
      'Please fill in at least one room placement (e.g. Kitchen in Southeast) for layout-specific advice.'
    );
  }
  return {
    propertyType: 'residential',
    entranceDirection: facing,
    layout: layoutInput,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      question,
      userProfile,
      vastuAnalysis,
      vastuReading,
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
      '[ASK-VASTU-SEER] Vastu Seer API: Processing question for user:',
      userId,
      'ask-vastu-seer'
    );

    const questionType = classifyVastuQuestion(question);
    if (questionType === 'refusal') {
      return jsonWithRobots({
        response: VASTU_REFUSAL_OUTCOME_PHRASE,
        refused: true,
      });
    }

    const source = vastuAnalysis ?? vastuReading ?? body.comprehensiveProfile?.vastu ?? body.comprehensiveProfile?.['Vastu'];
    const layoutInput = body.vastuLayout ?? body.layout;
    let payload: VastuReadingPayload;
    try {
      if (layoutInput?.facing_direction) {
        payload = payloadFromLayout(layoutInput);
      } else if (source) {
        payload = normalizeToVastuPayload(source);
        if (layoutInput && (layoutInput.kitchen || layoutInput.bedroom || layoutInput.toilet || layoutInput.main_door || layoutInput.living_room || layoutInput.prayer_room || layoutInput.center)) {
          payload.layout = layoutInput;
        }
      } else {
        throw new Error(
          'Vastu requires orientation and layout. Fill in your current residence details (facing direction + room placements) or complete Vastu analysis to use Ask the Seer.'
        );
      }
    } catch (err) {
      return jsonWithRobots(
        {
          success: false,
          error:
            err instanceof Error
              ? err.message
              : VASTU_REFUSAL_DATA_PHRASE,
        },
        { status: 400 }
      );
    }

    let state;
    try {
      state = buildVastuState(payload);
    } catch {
      return jsonWithRobots(
        {
          success: false,
          error:
            'Vastu requires orientation and layout. Complete your Vastu analysis first to use Ask the Seer.',
        },
        { status: 400 }
      );
    }

    const slice = getVastuSliceForQuestionType(questionType, state);
    const displayName = (userProfile?.displayName ?? '').trim();
    const systemPrompt = buildVastuSeerSystemPrompt(slice, questionType, {
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
              sources: ['vastu'],
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
                    'vastuSeerConversations',
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
            devLog.error('Error during Vastu Seer streaming:', error);
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
    devLog.error('Error in Vastu Seer API:', error);
    return jsonWithRobots(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
