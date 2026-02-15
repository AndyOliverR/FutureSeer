import { NextRequest, NextResponse } from 'next/server';
import { devLog } from '@/lib/devLogger';
import { createAIStream } from '@/lib/aiGateway';
import {
  buildBaziChartState,
  classifyBaziQuestion,
  getBaziSliceForQuestionType,
} from '@/lib/baziSeerState';
import type { BaziReading } from '@/lib/baziIntelligence';
import { buildBaziSeerSystemPrompt } from '@/lib/baziSeerPrompts';

interface AskBaziSeerRequest {
  userId?: string;
  question: string;
  userProfile?: unknown;
  baziReading?: BaziReading;
}

const REFUSAL_MESSAGE =
  'BaZi works in phases, not daily moments. I can help with life direction, career suitability, wealth patterns, relationship tendency, health constitution, or timing by decade (Luck Cycle).';

export async function POST(request: NextRequest) {
  try {
    const body: AskBaziSeerRequest = await request.json();
    const { question, baziReading } = body;

    if (!question || !question.trim()) {
      return NextResponse.json(
        { success: false, error: 'Question is required' },
        { status: 400 }
      );
    }

    if (!baziReading) {
      return NextResponse.json(
        {
          success: false,
          error:
            'BaZi reading is required. Generate your BaZi reading first to use Ask the Seer.',
        },
        { status: 400 }
      );
    }

    const questionType = classifyBaziQuestion(question.trim());

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

    const state = buildBaziChartState(baziReading);
    const chartSlice = getBaziSliceForQuestionType(
      questionType,
      state,
      baziReading
    );

    const stream = await createAIStream({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: buildBaziSeerSystemPrompt(chartSlice, questionType),
        },
        { role: 'user', content: question.trim() },
      ],
      temperature: 0.5,
      maxTokens: 700,
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
            devLog.error('BaZi Seer stream error:', error, 'route');
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
  } catch (error: unknown) {
    devLog.error('BaZi Seer API error:', error, 'route');
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to get response from BaZi Seer',
      },
      { status: 500 }
    );
  }
}
