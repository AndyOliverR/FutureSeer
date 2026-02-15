import { NextRequest, NextResponse } from 'next/server';
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

/** Normalize name analysis from request or comprehensiveProfile to NameAnalysisPayload. */
function normalizeToNamePayload(
  nameAnalysis: any,
  comprehensiveProfile?: any
): NameAnalysisPayload {
  const source = nameAnalysis ?? comprehensiveProfile?.nameAnalysis ?? comprehensiveProfile?.['Name Analysis'];
  if (!source) {
    throw new Error(
      'Name Analysis requires name data. Generate your name analysis first to use Ask the Seer.'
    );
  }
  return {
    fullName: source.fullName ?? source.full_name,
    nameVibration: source.nameVibration ?? source.name_vibration,
    lifePathNumber: source.lifePathNumber ?? source.life_path_number,
    destinyNumber: source.destinyNumber ?? source.destiny_number,
    soulNumber: source.soulNumber ?? source.soul_number,
    personalityNumber: source.personalityNumber ?? source.personality_number,
    nameHarmony: source.nameHarmony ?? source.name_harmony,
    nameBalance: source.nameBalance ?? source.name_balance,
    dominantElement: source.dominantElement ?? source.dominant_element,
    personality: source.personality,
    missingElements: source.missingElements ?? source.missing_elements,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      question,
      userProfile,
      nameAnalysis,
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

    devLog.info('Name Analysis Seer API: Processing question for user:', userId, 'ask-name-analysis-seer');

    const questionType = classifyNameQuestion(question);
    if (questionType === 'refusal') {
      return NextResponse.json({
        response: NAME_REFUSAL_PHRASE,
        refused: true,
      });
    }

    let payload: NameAnalysisPayload;
    try {
      payload = normalizeToNamePayload(nameAnalysis, comprehensiveProfile);
    } catch (err) {
      return NextResponse.json(
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
      return NextResponse.json(
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
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
