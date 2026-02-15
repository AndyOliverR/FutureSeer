import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseDB } from '@/lib/firebase';
import { createAIStream } from '@/lib/aiGateway';
import { devLog } from '@/lib/devLogger';
import { ConversationalMemory, MemoryMessage } from '@/lib/conversationalMemory';
import {
  buildScryingState,
  classifyScryingQuestion,
  getScryingSliceForQuestionType,
  SCRYING_REFUSAL_DATA_PHRASE,
  SCRYING_REFUSAL_SAFETY_PHRASE,
  type ScryingQuestionType,
} from '@/lib/scryingSeerState';
import { buildScryingSeerSystemPrompt } from '@/lib/scryingSeerPrompts';

interface ScryingSeerRequest {
  userId: string;
  question: string;
  userProfile: any;
  scryingVision?: any;
  scryingMethod?: 'crystal-ball' | 'mirror';
  sessionId?: string;
  /** Aggregator contract: pass comprehensiveProfile to derive scrying vision */
  comprehensiveProfile?: any;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      question,
      userProfile,
      scryingVision: bodyScryingVision,
      scryingMethod: bodyScryingMethod,
      sessionId,
      comprehensiveProfile,
    }: ScryingSeerRequest = body;
    const scryingVision = bodyScryingVision ?? comprehensiveProfile?.scrying ?? comprehensiveProfile?.['Scrying'];
    const scryingMethod = bodyScryingMethod ?? scryingVision?.method ?? 'crystal-ball';

    if (!userId || !question || !userProfile) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameters: userId, question, or userProfile',
        },
        { status: 400 }
      );
    }

    devLog.info('🔮 Scrying Seer API: Processing question for user:', userId, 'ask-scrying-seer');

    // Data requirement: need sufficient vision
    let state;
    try {
      state = buildScryingState(scryingVision, scryingMethod);
    } catch {
      return NextResponse.json(
        { success: false, error: SCRYING_REFUSAL_DATA_PHRASE },
        { status: 400 }
      );
    }

    const questionType = classifyScryingQuestion(question.trim()) as ScryingQuestionType;

    if (questionType === 'refusal') {
      return new Response(
        new ReadableStream({
          start(controller) {
            controller.enqueue(
              new TextEncoder().encode(SCRYING_REFUSAL_SAFETY_PHRASE)
            );
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

    const slice = getScryingSliceForQuestionType(questionType, state);
    const systemPrompt = buildScryingSeerSystemPrompt(slice, questionType);

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

    return new Response(
      new ReadableStream({
        async start(controller) {
          try {
            const stream = await createAIStream({
              model: 'llama-3.3-70b-versatile',
              messages: [
                { role: 'system', content: systemPrompt },
                ...conversationHistory.flatMap((h) => [
                  { role: 'user' as const, content: h.question },
                  {
                    role: 'assistant' as const,
                    content: h.answer.substring(0, 500) + '...',
                  },
                ]),
                { role: 'user', content: question.trim() },
              ],
              temperature: 0.6,
              maxTokens: 800,
            });

            let fullResponse = '';
            for await (const chunk of stream) {
              const content = chunk.choices?.[0]?.delta?.content ?? '';
              if (content) {
                fullResponse += content;
                controller.enqueue(new TextEncoder().encode(content));
              }
            }

            const userMessage: MemoryMessage = {
              id: `msg_${Date.now()}_user`,
              timestamp: Date.now(),
              type: 'user',
              content: question.trim(),
              questionType: String(questionType),
              keywords: question.trim().split(' ').slice(0, 5),
            };

            const seerMessage: MemoryMessage = {
              id: `msg_${Date.now()}_seer`,
              timestamp: Date.now(),
              type: 'seer',
              content: fullResponse,
              questionType: String(questionType),
              confidence: 0.85,
              sources: ['scrying'],
            };

            await memory.addExchange(userMessage);
            await memory.addExchange(seerMessage);
            memory.addRecentQuestion(question.trim());
            await memory.saveAllMemory();
          } catch (error) {
            devLog.error('Error during scrying seer streaming:', error);
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
    devLog.error('Error in Scrying Seer API:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
