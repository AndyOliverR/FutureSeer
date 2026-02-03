import { NextRequest, NextResponse } from 'next/server';
import { createAIStream } from '@/lib/aiGateway';
import {
  buildAkashicState,
  classifyAkashicQuestion,
  getAkashicSliceForQuestionType,
  AKASHIC_REFUSAL_DATA_PHRASE,
  AKASHIC_REFUSAL_SAFETY_PHRASE,
  type AkashicQuestionType,
} from '@/lib/akashicSeerState';

export async function POST(request: NextRequest) {
  try {
    const { question, reading, userProfile } = await request.json();

    if (!question?.trim()) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    const readingData = reading?.data ?? reading;
    let state;
    try {
      state = buildAkashicState(readingData);
    } catch {
      return NextResponse.json(
        { error: AKASHIC_REFUSAL_DATA_PHRASE },
        { status: 400 }
      );
    }

    const questionType = classifyAkashicQuestion(question.trim()) as AkashicQuestionType;

    if (questionType === 'refusal') {
      return new Response(
        new ReadableStream({
          start(controller) {
            controller.enqueue(
              new TextEncoder().encode(AKASHIC_REFUSAL_SAFETY_PHRASE)
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

    const systemPrompt = getAkashicSliceForQuestionType(questionType, state);

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
            console.error('Error during Akashic seer streaming:', error);
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
    console.error('Akashic Seer API error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to generate response',
      },
      { status: 500 }
    );
  }
}
