import { NextRequest, NextResponse } from 'next/server';
import { devLog } from '@/lib/devLogger';
import { createAIStream } from '@/lib/aiGateway';
import {
  buildAngelNumberState,
  classifyAngelNumberQuestion,
  getAngelNumberSliceForQuestionType,
  type AngelNumberQuestionType,
  type AngelNumbersContextInput,
  type AngelNumbersProfileInput,
} from '@/lib/angelNumbersSeerState';
import { buildAngelNumberSeerSystemPrompt } from '@/lib/angelNumbersSeerPrompts';

interface AskAngelNumbersSeerRequest {
  userId?: string;
  question: string;
  userProfile?: any;
  angelNumbersContext?: AngelNumbersContextInput;
  angelNumbersData?: {
    lifePathAngel?: number;
    destinyAngel?: number;
    soulAngel?: number;
    currentDateAngel?: number;
    personalYearAngel?: number;
  };
  lookupResult?: { number: number; originalInput?: string | number };
}

const REFUSAL_MESSAGE =
  'Angel Numbers are guidance symbols, not predictors of events. I can help you explore what theme is being reinforced and what to pay attention to right now.';

export async function POST(request: NextRequest) {
  try {
    const body: AskAngelNumbersSeerRequest = await request.json();
    const {
      question,
      userProfile,
      angelNumbersContext,
      angelNumbersData,
      lookupResult,
    } = body;

    if (!question || !question.trim()) {
      return NextResponse.json(
        { success: false, error: 'Question is required' },
        { status: 400 }
      );
    }

    const questionType = classifyAngelNumberQuestion(question.trim());

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

    const profile: AngelNumbersProfileInput | null = angelNumbersData
      ? {
          lifePathAngel: angelNumbersData.lifePathAngel,
          destinyAngel: angelNumbersData.destinyAngel,
          soulAngel: angelNumbersData.soulAngel,
          currentDateAngel: angelNumbersData.currentDateAngel,
          personalYearAngel: angelNumbersData.personalYearAngel,
        }
      : null;

    const state = buildAngelNumberState(
      angelNumbersContext ?? null,
      profile,
      lookupResult ?? null,
      question.trim()
    );

    const chartSlice = getAngelNumberSliceForQuestionType(questionType, state);

    const stream = await createAIStream({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: buildAngelNumberSeerSystemPrompt(chartSlice, questionType),
        },
        { role: 'user', content: question.trim() },
      ],
      temperature: 0.7,
      maxTokens: 800,
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
            devLog.error('Angel Numbers Seer stream error:', error, 'route');
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
    devLog.error('Angel Numbers Seer API error:', error, 'route');
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to get response from Angel Numbers Seer',
      },
      { status: 500 }
    );
  }
}
