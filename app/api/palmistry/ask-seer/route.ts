import { NextRequest, NextResponse } from 'next/server';
import { devLog } from '@/lib/devLogger';
import { createAIStream } from '@/lib/aiGateway';
import {
  buildPalmState,
  classifyPalmQuestion,
  getPalmSliceForQuestionType,
  type PalmQuestionType,
} from '@/lib/palmSeerState';
import { buildPalmSeerSystemPrompt } from '@/lib/palmSeerPrompts';

const REFUSAL_MESSAGE =
  'Palmistry shows tendencies, not events. It does not determine timing, health outcomes, or exact life events. I can speak to your tendencies, strengths, and relationship style instead.';

export async function POST(request: NextRequest) {
  try {
    const { userId, question, palmistryContext, sessionId, userProfile } = await request.json();

    if (!question || !question.trim()) {
      return NextResponse.json(
        { success: false, error: 'Question is required' },
        { status: 400 }
      );
    }

    const questionType = classifyPalmQuestion(question.trim());

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

    const state = buildPalmState(palmistryContext ?? null, userProfile);
    const chartSlice = getPalmSliceForQuestionType(questionType, state);

    const stream = await createAIStream({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: buildPalmSeerSystemPrompt(chartSlice, questionType) },
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
            devLog.error('Palmistry Seer stream error:', error, 'route');
            controller.enqueue(
              new TextEncoder().encode('I apologize, but I encountered an error. Please try again.')
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
    devLog.error('Palmistry Seer API error:', error, 'route');
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to get response from Palmistry Seer',
      },
      { status: 500 }
    );
  }
}
