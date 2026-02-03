import { NextRequest, NextResponse } from 'next/server';
import { createAIStream } from '@/lib/aiGateway';
import {
  buildZiWeiChartState,
  classifyZiWeiQuestion,
  getZiWeiSliceForQuestionType,
  type ZiWeiQuestionType,
} from '@/lib/ziweiSeerState';
import type { ZiWeiChartData } from '@/lib/chinese/chineseAstrologyService';
import type { ZiWeiReport } from '@/lib/chinese/ziweiReportGenerator';
import { SEER_GOVERNING_SENTENCE } from '@/lib/askTheSeerDiscipline';

interface AskZiWeiSeerRequest {
  userId?: string;
  question: string;
  userProfile?: unknown;
  ziweiChartData?: ZiWeiChartData;
  ziweiReport?: ZiWeiReport;
}

function buildZiWeiSystemPrompt(
  chartSlice: string,
  questionType: ZiWeiQuestionType
): string {
  return `You are an expert Zi Wei Dou Shu (紫微斗數) practitioner. You reason only from the state below. Zi Wei is a deterministic, hierarchical, palace-centric system; it evaluates life areas and fortune phases, not daily moments.
${SEER_GOVERNING_SENTENCE}

## CRITICAL RULES
- **Palace routing**: No Zi Wei answer is valid without palace routing. Every answer must anchor to a palace (e.g. Career Palace 官祿宮, Wealth Palace 財帛宮). Pipeline: Question → Relevant Palace → Main Star(s) → Star quality → Four Transformations → Fortune Cycle activation → Outcome framing.
- **Main star supremacy**: Main stars dominate; supporting stars modify; minor stars only refine. If minor stars contradict main stars, main stars win.
- **Four Transformations (四化)**: Hua Lu (化祿) = gain/flow; Hua Quan (化權) = power/responsibility; Hua Ke (化科) = reputation/protection; Hua Ji (化忌) = blockage/stress. Always explain what transforms, where it transforms, and how it manifests.
- **Fortune cycle supremacy**: If the palace is not activated by fortune cycles, outcomes remain latent. Timing hierarchy: 10-year fortune (大限) first, then annual, then month.
- **Refusals**: Refuse daily timing, mixing BaZi/Vedic logic, and guarantees. Say: "Zi Wei Dou Shu cannot assess this without the relevant palace and fortune cycle."
- **Permanent rule**: Zi Wei answers must always state: palace, star, and cycle. If any of the three are missing, the answer is invalid.
- **Mandatory state**: Do not answer without the Zi Wei Chart State; the slice below is your only input.

## Zi Wei Chart state (use only these)
${chartSlice}

## Question type
${questionType}

Answer the user's question with specific references to the state above.`;
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
          content: buildZiWeiSystemPrompt(chartSlice, questionType),
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
            console.error('Zi Wei Seer stream error:', error);
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
    console.error('Zi Wei Seer API error:', error);
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
