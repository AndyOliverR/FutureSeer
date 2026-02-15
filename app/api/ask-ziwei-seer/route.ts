import { NextRequest, NextResponse } from 'next/server';
import { devLog } from '@/lib/devLogger';
import { createAIStream } from '@/lib/aiGateway';
import {
  buildZiWeiChartState,
  classifyZiWeiQuestion,
  getZiWeiSliceForQuestionType,
} from '@/lib/ziweiSeerState';
import type { ZiWeiChartData } from '@/lib/chinese/chineseAstrologyService';
import type { ZiWeiReport } from '@/lib/chinese/ziweiReportGenerator';
import { buildZiWeiSeerSystemPrompt } from '@/lib/ziweiSeerPrompts';

interface AskZiWeiSeerRequest {
  userId?: string;
  question: string;
  userProfile?: unknown;
  ziweiChartData?: ZiWeiChartData;
  ziweiReport?: ZiWeiReport;
}

const REFUSAL_MESSAGE =
  'Zi Wei Dou Shu evaluates life areas and fortune phases, not daily moments. I can help with career, wealth, relationships, health, life direction, property, or travel by palace and cycle.';

export async function POST(request: NextRequest) {
  try {
    const body: AskZiWeiSeerRequest = await request.json();
    const { question, ziweiChartData, ziweiReport } = body;

    if (!question || !question.trim()) {
      return NextResponse.json(
        { success: false, error: 'Question is required' },
        { status: 400 }
      );
    }

    if (!ziweiChartData || !ziweiReport) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Zi Wei chart and report are required. Generate your Zi Wei Dou Shu chart and report first to use Ask the Seer.',
        },
        { status: 400 }
      );
    }

    const questionType = classifyZiWeiQuestion(question.trim());

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

    const state = buildZiWeiChartState(ziweiChartData, ziweiReport);
    const chartSlice = getZiWeiSliceForQuestionType(
      questionType,
      state,
      ziweiReport
    );

    const stream = await createAIStream({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: buildZiWeiSeerSystemPrompt(chartSlice, questionType),
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
            devLog.error('Zi Wei Seer stream error:', error, 'route');
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
    devLog.error('Zi Wei Seer API error:', error, 'route');
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to get response from Zi Wei Seer',
      },
      { status: 500 }
    );
  }
}
