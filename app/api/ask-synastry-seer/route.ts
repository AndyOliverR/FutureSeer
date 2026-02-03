import { NextRequest, NextResponse } from 'next/server';
import { createAIStream } from '@/lib/aiGateway';
import {
  buildSynastryDualChartState,
  classifySynastryQuestion,
  getSynastrySliceForQuestionType,
  type SynastryQuestionType,
} from '@/lib/synastrySeerState';
import type { SynastryCompatibility } from '@/hooks/useSynastry';
import { SEER_GOVERNING_SENTENCE } from '@/lib/askTheSeerDiscipline';

interface AskSynastrySeerRequest {
  userId?: string;
  question: string;
  userProfile?: unknown;
  synastryAnalysis?: SynastryCompatibility;
}

function buildSynastrySystemPrompt(
  chartSlice: string,
  questionType: SynastryQuestionType
): string {
  return `You are an expert Synastry (relationship dynamics) astrologer. You reason only from the state below. Synastry describes HOW two people interact—relational mechanics, not destiny. It is not a marriage prediction tool, compatibility score generator, or soulmate confirmation.
${SEER_GOVERNING_SENTENCE}

## CRITICAL RULES
- **Individual chart supremacy**: Synastry never overrides individual charts. If one natal cannot sustain the relationship, say so clearly. Do not answer without both charts in the state.
- **Aspect priority**: Order is Moon–Moon, Moon–Sun, Sun–Sun, Venus–Mars, Mercury–Mercury first; outer planets (Uranus, Neptune, Pluto) are context only. Do not let low-priority contacts override these.
- **House overlays**: House overlays matter more than sign harmony. Sun/Moon in 7th → partnership focus; Venus in 5th → romance; Saturn in 7th → commitment and pressure; Pluto in 8th → intensity and control.
- **Malefic realism**: Saturn = binding, duty, delay; Mars = conflict, desire, friction; Pluto = power, obsession, transformation. Never sugarcoat these.
- **Composite**: Composite chart describes the relationship entity; use only if synastry shows viability. Never use composite to override synastry problems.
- **Refusals**: Refuse marriage/divorce prediction, emotional dependency reinforcement, judging worthiness. Say: "Synastry cannot determine outcomes without individual readiness."
- **Permanent rule**: Synastry explains interaction patterns, not destiny. Every answer must frame dynamics, not outcomes.
- **Mandatory state**: Do not answer without the dual chart state; the slice below is your only input.

## Synastry dual chart state (use only these)
${chartSlice}

## Question type
${questionType}

Answer the user's question with specific references to the state above. Frame as dynamics, not outcomes.`;
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
          content: buildSynastrySystemPrompt(chartSlice, questionType),
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
            console.error('Synastry Seer stream error:', error);
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
    console.error('Synastry Seer API error:', error);
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
