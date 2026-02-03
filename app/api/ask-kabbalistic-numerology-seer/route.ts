import { NextRequest, NextResponse } from 'next/server';
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

/** Normalize kabbalistic payload from request or comprehensiveProfile. */
function normalizeToKabbalisticPayload(
  kabbalisticAnalysis: any,
  comprehensiveProfile?: any
): KabbalisticAnalysisPayload {
  if (kabbalisticAnalysis?.chart?.nameAnalysis) {
    return { chart: kabbalisticAnalysis.chart };
  }
  if (kabbalisticAnalysis?.nameAnalysis) {
    return {
      chart: { nameAnalysis: kabbalisticAnalysis.nameAnalysis },
      nameAnalysis: kabbalisticAnalysis.nameAnalysis,
    };
  }
  if (comprehensiveProfile) {
    const kabbalistic =
      comprehensiveProfile.kabbalisticNumerology ??
      comprehensiveProfile['Kabbalistic Numerology'];
    if (kabbalistic?.chart?.nameAnalysis) {
      return { chart: kabbalistic.chart };
    }
    if (kabbalistic?.nameAnalysis) {
      return {
        chart: { nameAnalysis: kabbalistic.nameAnalysis },
        nameAnalysis: kabbalistic.nameAnalysis,
      };
    }
  }
  throw new Error(
    'Kabbalistic Numerology requires name analysis. Generate your Kabbalistic analysis first to use Ask the Seer.'
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      question,
      userProfile,
      kabbalisticAnalysis,
      comprehensiveProfile,
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

    devLog.info('🔮 Kabbalistic Numerology Seer API: Processing question for user:', userId, 'ask-kabbalistic-numerology-seer');

    const questionType = classifyKabbalisticQuestion(question);
    if (questionType === 'refusal') {
      return NextResponse.json({
        response: KABBALISTIC_REFUSAL_PHRASE,
        refused: true,
      });
    }

    let payload: KabbalisticAnalysisPayload;
    try {
      payload = normalizeToKabbalisticPayload(kabbalisticAnalysis, comprehensiveProfile);
    } catch (err) {
      return NextResponse.json(
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
      return NextResponse.json(
        {
          success: false,
          error:
            'Kabbalistic Numerology requires name analysis. Generate your Kabbalistic analysis first to use Ask the Seer.',
        },
        { status: 400 }
      );
    }

    const systemPrompt = getKabbalisticSliceForQuestionType(questionType, state);

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
        ...conversationHistory.flatMap((h: { question: string; answer: string }) => [
          { role: 'user' as const, content: h.question },
          { role: 'assistant' as const, content: h.answer },
        ]),
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
            console.error('Error during streaming:', error);
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
    console.error('Error in Kabbalistic Numerology Seer API:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
