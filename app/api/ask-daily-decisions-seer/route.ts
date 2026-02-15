import { NextRequest, NextResponse } from 'next/server';
import { devLog } from '@/lib/devLogger';
import { createAIStream } from '@/lib/aiGateway';
import {
  buildDailyDecisionState,
  classifyDailyDecisionQuestion,
  getDailyDecisionSliceForQuestionType,
  type DailyDecisionQuestionType,
} from '@/lib/dailyDecisionsSeerState';
import type { DailyDecisionsAnalysis } from '@/lib/dailyDecisionsIntelligence';
import { buildDailyDecisionSeerSystemPrompt } from '@/lib/dailyDecisionsSeerPrompts';

interface AskDailyDecisionsSeerRequest {
  userId?: string;
  question: string;
  userProfile?: unknown;
  dailyDecisionsAnalysis?: DailyDecisionsAnalysis;
  selectedDate?: string;
}

const REFUSAL_MESSAGE =
  'Daily Decisions addresses timing suitability, not outcomes. I can tell you whether today is suitable for an activity and when to avoid inauspicious times.';

export async function POST(request: NextRequest) {
  try {
    const body: AskDailyDecisionsSeerRequest = await request.json();
    const { question, dailyDecisionsAnalysis, selectedDate } = body;

    if (!question || !question.trim()) {
      return NextResponse.json(
        { success: false, error: 'Question is required' },
        { status: 400 }
      );
    }

    if (!dailyDecisionsAnalysis) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Daily Decisions recommendations are required. Generate your recommendations first to use Ask the Seer.',
        },
        { status: 400 }
      );
    }

    const questionType = classifyDailyDecisionQuestion(question.trim());

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

    const state = buildDailyDecisionState(
      dailyDecisionsAnalysis,
      selectedDate ?? dailyDecisionsAnalysis.date
    );
    const chartSlice = getDailyDecisionSliceForQuestionType(questionType, state);

    const stream = await createAIStream({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: buildDailyDecisionSeerSystemPrompt(chartSlice, questionType),
        },
        { role: 'user', content: question.trim() },
      ],
      temperature: 0.5,
      maxTokens: 600,
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
            devLog.error('Daily Decisions Seer stream error:', error, 'route');
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
    devLog.error('Daily Decisions Seer API error:', error, 'route');
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to get response from Daily Decisions Seer',
      },
      { status: 500 }
    );
  }
}
