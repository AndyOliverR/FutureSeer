import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseDB } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { createAIStream } from '@/lib/aiGateway';
import { devLog } from '@/lib/devLogger';
import { ConversationalMemory, MemoryMessage } from '@/lib/conversationalMemory';
import {
  buildLenormandState,
  classifyLenormandQuestion,
  getLenormandSliceForQuestionType,
  LENORMAND_REFUSAL_PHRASE,
  type LenormandReadingPayload,
} from '@/lib/lenormandSeerState';

/** Normalize reading from request to LenormandReadingPayload. */
function normalizeToLenormandPayload(reading: any): LenormandReadingPayload {
  if (!reading?.question && !reading?.cards?.length) {
    throw new Error(
      'Lenormand requires a reading. Perform a reading first to use Ask the Seer.'
    );
  }
  return {
    question: reading.question ?? '',
    spreadType: reading.spreadType ?? reading.spread_type ?? 'three',
    cards: (reading.cards ?? []).map((c: any) => ({
      name: c.name ?? '',
      number: c.number,
      keywords: c.keywords,
    })),
    positions: reading.positions ?? [],
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      question,
      userProfile,
      lenormandReading,
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
      '[ASK-LENORMAND-SEER] Lenormand Seer API: Processing question for user:',
      userId,
      'ask-lenormand-seer'
    );

    const questionType = classifyLenormandQuestion(question);
    if (questionType === 'refusal') {
      return NextResponse.json({
        response: LENORMAND_REFUSAL_PHRASE,
        refused: true,
      });
    }

    let payload: LenormandReadingPayload;
    try {
      payload = normalizeToLenormandPayload(lenormandReading);
    } catch (err) {
      return NextResponse.json(
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
      return NextResponse.json(
        {
          success: false,
          error:
            'Lenormand requires a reading. Perform a reading first to use Ask the Seer.',
        },
        { status: 400 }
      );
    }

    const systemPrompt = getLenormandSliceForQuestionType(questionType, state);

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
            }
          } catch (error) {
            console.error('Error during Lenormand Seer streaming:', error);
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
    console.error('Error in Lenormand Seer API:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
