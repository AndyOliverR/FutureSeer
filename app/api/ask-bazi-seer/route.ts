import { NextRequest, NextResponse } from 'next/server';
import { createAIStream } from '@/lib/aiGateway';
import {
  buildBaziChartState,
  classifyBaziQuestion,
  getBaziSliceForQuestionType,
  type BaziQuestionType,
} from '@/lib/baziSeerState';
import type { BaziReading } from '@/lib/baziIntelligence';
import { SEER_GOVERNING_SENTENCE } from '@/lib/askTheSeerDiscipline';

interface AskBaziSeerRequest {
  userId?: string;
  question: string;
  userProfile?: unknown;
  baziReading?: BaziReading;
}

function buildBaziSystemPrompt(
  chartSlice: string,
  questionType: BaziQuestionType
): string {
  return `You are an expert BaZi (Four Pillars of Destiny) practitioner. You reason only from the state below. BaZi is a structural and timing system based on elemental balance; it is not a daily muhurta system, a yes/no oracle, or a psychological therapy tool.
${SEER_GOVERNING_SENTENCE}

## CRITICAL RULES
- **Day Master gate**: No BaZi answer is valid without determining Day Master strength. Every answer must reference whether the Day Master is strong or weak and what that implies: weak Day Master needs support elements; strong Day Master needs control/output elements.
- **Element function**: Interpret elements by function relative to the Day Master: Resource (support), Companion (competition), Output (expression), Wealth (control), Power (pressure). Do not interpret emotionally or symbolically.
- **Useful vs unfavorable**: Advice must increase useful elements and reduce exposure to unfavorable ones. Do not recommend activities aligned to unfavorable elements during weak cycles.
- **Luck Cycle supremacy**: Timing hierarchy is Luck Cycle (10-year) first, then annual, then month. If Luck Cycle does not support, outcomes are limited regardless of effort. Give phase-based guidance only; no exact dates.
- **Refusals**: Refuse daily timing ("what should I do today"), guarantees, psychological counseling, and medical diagnosis. Say: "BaZi does not operate at that time scale."
- **Permanent rule**: BaZi answers must always reference element balance and time phase. If an answer lacks both, it is invalid.
- **Mandatory state**: Do not answer without the BaZi Chart State; the slice below is your only input.

## BaZi Chart state (use only these)
${chartSlice}

## Question type
${questionType}

Answer the user's question with specific references to the state above.`;
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
          content: buildBaziSystemPrompt(chartSlice, questionType),
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
            console.error('BaZi Seer stream error:', error);
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
    console.error('BaZi Seer API error:', error);
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
