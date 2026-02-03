import { NextRequest, NextResponse } from 'next/server';
import { createAIStream } from '@/lib/aiGateway';
import {
  buildMundaneState,
  classifyMundaneQuestion,
  getMundaneSliceForQuestionType,
  MUNDANE_REFUSAL_DATA_PHRASE,
  MUNDANE_REFUSAL_EVENT_PHRASE,
  type MundaneQuestionType,
} from '@/lib/mundaneSeerState';

export async function POST(request: NextRequest) {
  try {
    const { question, analysis, userProfile } = await request.json();

    if (!question?.trim()) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    const data = analysis?.data ?? analysis;
    let state;
    try {
      state = buildMundaneState(data);
    } catch {
      return NextResponse.json(
        { error: MUNDANE_REFUSAL_DATA_PHRASE },
        { status: 400 }
      );
    }

    const questionType = classifyMundaneQuestion(question.trim()) as MundaneQuestionType;

    if (questionType === 'refusal') {
      return new Response(
        new ReadableStream({
          start(controller) {
            controller.enqueue(
              new TextEncoder().encode(MUNDANE_REFUSAL_EVENT_PHRASE)
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

    const systemPrompt = getMundaneSliceForQuestionType(questionType, state);

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
            console.error('Error during mundane seer streaming:', error);
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
    console.error('Mundane Seer API error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to generate response',
      },
      { status: 500 }
    );
  }
}
