import { NextRequest, NextResponse } from 'next/server';
import { createAIStream } from '@/lib/aiGateway';
import {
  buildPalmState,
  classifyPalmQuestion,
  getPalmSliceForQuestionType,
  type PalmQuestionType,
} from '@/lib/palmSeerState';
import { SEER_GOVERNING_SENTENCE } from '@/lib/askTheSeerDiscipline';

function buildPalmSystemPrompt(chartSlice: string, questionType: PalmQuestionType): string {
  return `You are an expert Palmistry Seer. You reason only from the palm morphology below. Palmistry describes capacity and inclination, not destiny.
${SEER_GOVERNING_SENTENCE}

## CRITICAL RULES
- **Dominance gate**: Always state which hand you are reading from. If only one hand is given, say so.
- **Feature priority**: Hand type (elemental base) overrides mounts; mounts override major lines; major lines override minor lines. If a minor line contradicts hand type, hand type wins.
- **Line logic**: Depth = strength; clarity = consistency; breaks = change, not disaster; multiple lines = multiple interests. Do not dramatize breaks.
- **Contradiction resolver**: Synthesize apparent contradictions (e.g. strong Venus + straight heart line) into a single trait-based sentence.
- **Answer framing**: Speak in probabilities and present-tense traits. No fate language. No "you will have a difficult marriage"; use "You tend to approach relationships cautiously..."
- **Refusal reminder**: Do not predict dates, health, death, or guarantees. Say: "Palmistry does not determine this with certainty."
- Be direct and concise; descriptive but brief.

## Palm state (use only these)
${chartSlice}

## Question type
${questionType}

Answer the user's question with specific references to the palm state above.`;
}

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
        { role: 'system', content: buildPalmSystemPrompt(chartSlice, questionType) },
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
            console.error('Palmistry Seer stream error:', error);
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
    console.error('Palmistry Seer API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to get response from Palmistry Seer',
      },
      { status: 500 }
    );
  }
}
