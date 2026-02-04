import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseDB } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { createAIStream } from '@/lib/aiGateway';
import { devLog } from '@/lib/devLogger';
import { ConversationalMemory, MemoryMessage } from '@/lib/conversationalMemory';
import {
  buildVastuState,
  classifyVastuQuestion,
  getVastuSliceForQuestionType,
  VASTU_REFUSAL_DATA_PHRASE,
  VASTU_REFUSAL_OUTCOME_PHRASE,
  type VastuReadingPayload,
  type VastuLayoutInput,
} from '@/lib/vastuSeerState';

/** Normalize Vastu reading/analysis from request to VastuReadingPayload. */
function normalizeToVastuPayload(reading: any): VastuReadingPayload {
  if (!reading?.entranceDirection && !reading?.mainEntranceAnalysis?.houseFacing) {
    throw new Error(
      'Vastu requires orientation (entrance or facing direction). Complete your Vastu analysis or provide orientation to use Ask the Seer.'
    );
  }
  const rooms = reading.rooms ?? [];
  return {
    propertyType: reading.propertyType ?? 'residential',
    plotShape: reading.plotShape,
    entranceDirection:
      reading.entranceDirection ??
      reading.mainEntranceAnalysis?.houseFacing ??
      '',
    construction_stage: reading.construction_stage,
    rooms: rooms.map((r: any) => ({
      name: r.name ?? '',
      currentDirection: r.currentDirection ?? r.idealDirection,
      idealDirection: r.idealDirection ?? r.currentDirection,
      status: r.status,
    })),
    mainEntranceAnalysis: reading.mainEntranceAnalysis,
    occupant_context: reading.occupant_context,
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
      return NextResponse.json(
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
      return NextResponse.json({
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
      return NextResponse.json(
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
      return NextResponse.json(
        {
          success: false,
          error:
            'Vastu requires orientation and layout. Complete your Vastu analysis first to use Ask the Seer.',
        },
        { status: 400 }
      );
    }

    const systemPrompt = getVastuSliceForQuestionType(questionType, state);

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
      .filter((item: any) => item !== null)
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

    return new Response(
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
            console.error('Error during Vastu Seer streaming:', error);
            controller.enqueue(
              new TextEncoder().encode(
                'I apologize, but I encountered an error. Please try again.'
              )
            );
          } finally {
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
    console.error('Error in Vastu Seer API:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
