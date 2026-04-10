import { NextRequest, NextResponse } from 'next/server';
import { enforceToolSeerGate } from '@/lib/enforceToolSeerGate';
import { createAIStream } from '@/lib/aiGateway';
import { devLog } from '@/lib/devLogger';
import {
  buildHellenisticState,
  classifyHellenisticQuestion,
  getHellenisticSliceForQuestionType,
  type HellenisticQuestionType,
} from '@/lib/hellenisticSeerState';
import { buildHellenisticSeerSystemPrompt } from '@/lib/hellenisticSeerPrompts';

interface HellenisticSeerRequest {
  userId: string;
  question: string;
  userProfile: any;
  hellenisticContext?: any;
  sessionId?: string;
}

const REFUSAL_MESSAGE =
  "Hellenistic astrology cannot judge this without the relevant house and ruler. I do not mix systems or use psychological therapy language. I can answer about career, wealth, marriage, health, sect, lots, and profections from your chart.";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as HellenisticSeerRequest;
    const __toolSeerGate = await enforceToolSeerGate(request, body, 'hellenistic_ask_seer');
    if (__toolSeerGate) return __toolSeerGate;
    const { userId, question, userProfile, hellenisticContext, sessionId } = body;

    if (!question || !question.trim()) {
      return NextResponse.json(
        { success: false, error: 'Question is required' },
        { status: 400 }
      );
    }

    if (!hellenisticContext) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing Hellenistic chart data. Please generate a reading first.',
        },
        { status: 400 }
      );
    }

    devLog.info('🔮 Hellenistic Seer API: Processing question for user:', userId, 'ask-hellenistic-seer');

    const questionType = classifyHellenisticQuestion(question.trim());

    if (questionType === 'refusal') {
      return new Response(
        new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode(REFUSAL_MESSAGE));
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

    const state = buildHellenisticState(hellenisticContext);
    const chartSlice = getHellenisticSliceForQuestionType(questionType, state);

    const stream = await createAIStream({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: buildHellenisticSeerSystemPrompt(chartSlice, questionType),
        },
        { role: 'user', content: question.trim() },
      ],
      temperature: 0.7,
      maxTokens: 1000,
    });

    return new Response(
      new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of stream) {
              const content = chunk.choices[0]?.delta?.content || '';
              if (content) {
                controller.enqueue(new TextEncoder().encode(content));
              }
            }
          } catch (error) {
            devLog.error('Hellenistic Seer stream error:', error);
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
  } catch (error: any) {
    devLog.error('Hellenistic Seer API error:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error.message || 'Failed to get response from Hellenistic Seer',
      },
      { status: 500 }
    );
  }
}
