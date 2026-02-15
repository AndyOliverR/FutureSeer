import { NextRequest, NextResponse } from 'next/server';
import { devLog } from '@/lib/devLogger';
import { createAIStream } from '@/lib/aiGateway';
import {
  buildSynastryDualChartState,
  classifySynastryQuestion,
  getSynastrySliceForQuestionType,
} from '@/lib/synastrySeerState';
import type { SynastryCompatibility } from '@/hooks/useSynastry';
import { buildSynastrySeerSystemPrompt } from '@/lib/synastrySeerPrompts';

interface AskSynastrySeerRequest {
  userId?: string;
  question: string;
  userProfile?: unknown;
  synastryAnalysis?: SynastryCompatibility;
}

const REFUSAL_MESSAGE =
  'Synastry describes interaction patterns, not fate outcomes. I can help with attraction, emotional compatibility, communication, power dynamics, or long-term friction—not marriage, breakup, or soulmate predictions.';

export async function POST(request: NextRequest) {
  try {
    const body: AskSynastrySeerRequest = await request.json();
    const { question, synastryAnalysis } = body;

    if (!question || !question.trim()) {
      return NextResponse.json(
        { success: false, error: 'Question is required' },
        { status: 400 }
      );
    }

    if (
      !synastryAnalysis?.person1Natal ||
      !synastryAnalysis?.person2Natal
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Two complete charts are required. Run Synastry analysis for both people first to use Ask the Seer.',
        },
        { status: 400 }
      );
    }

    const questionType = classifySynastryQuestion(question.trim());

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

    const state = buildSynastryDualChartState(synastryAnalysis);
    const chartSlice = getSynastrySliceForQuestionType(
      questionType,
      state,
      synastryAnalysis
    );

    const stream = await createAIStream({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: buildSynastrySeerSystemPrompt(chartSlice, questionType),
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
            devLog.error('Synastry Seer stream error:', error, 'route');
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
    devLog.error('Synastry Seer API error:', error, 'route');
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to get response from Synastry Seer',
      },
      { status: 500 }
    );
  }
}
