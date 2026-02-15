import { NextRequest, NextResponse } from 'next/server';
import { devLog } from '@/lib/devLogger';
import { createAIStream } from '@/lib/aiGateway';
import { buildOghamSeerSystemPrompt } from '@/lib/oghamSeerPrompts';
import {
  buildOghamState,
  classifyOghamQuestion,
  getOghamSliceForQuestionType,
  OGHAM_REFUSAL_DATA_PHRASE,
  OGHAM_REFUSAL_OUTCOME_PHRASE,
  type OghamQuestionType,
} from '@/lib/oghamSeerState';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, question, userProfile, sessionId } = body;
    let oghamReport = body.oghamReport;
    if (!oghamReport && body.comprehensiveProfile) {
      oghamReport = body.comprehensiveProfile.ogham ?? body.comprehensiveProfile['Ogham'];
    }

    if (!question?.trim()) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    const reportData = oghamReport?.data ?? oghamReport;
    let state;
    try {
      state = buildOghamState(reportData);
    } catch {
      return NextResponse.json(
        { error: OGHAM_REFUSAL_DATA_PHRASE },
        { status: 400 }
      );
    }

    const questionType = classifyOghamQuestion(question.trim()) as OghamQuestionType;

    if (questionType === 'refusal') {
      return new Response(
        new ReadableStream({
          start(controller) {
            controller.enqueue(
              new TextEncoder().encode(OGHAM_REFUSAL_OUTCOME_PHRASE)
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

    const slice = getOghamSliceForQuestionType(questionType, state);
    const systemPrompt = buildOghamSeerSystemPrompt(slice, questionType);

    const stream = await createAIStream({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question.trim() },
      ],
      temperature: 0.6,
      maxTokens: 800,
    });

    return new Response(
      new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of stream) {
              const content = chunk.choices?.[0]?.delta?.content ?? '';
              if (content) {
                controller.enqueue(new TextEncoder().encode(content));
              }
            }
          } catch (error) {
            devLog.error('Error during Ogham seer streaming:', error, 'route');
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
    devLog.error('Ogham Seer API error:', error, 'route');
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to generate response',
      },
      { status: 500 }
    );
  }
}
