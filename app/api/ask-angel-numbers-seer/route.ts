import { NextRequest, NextResponse } from 'next/server';
import { createAIStream } from '@/lib/aiGateway';
import {
  buildAngelNumberState,
  classifyAngelNumberQuestion,
  getAngelNumberSliceForQuestionType,
  type AngelNumberQuestionType,
  type AngelNumbersContextInput,
  type AngelNumbersProfileInput,
} from '@/lib/angelNumbersSeerState';
import { SEER_GOVERNING_SENTENCE } from '@/lib/askTheSeerDiscipline';

interface AskAngelNumbersSeerRequest {
  userId?: string;
  question: string;
  userProfile?: any;
  angelNumbersContext?: AngelNumbersContextInput;
  angelNumbersData?: {
    lifePathAngel?: number;
    destinyAngel?: number;
    soulAngel?: number;
    currentDateAngel?: number;
    personalYearAngel?: number;
  };
  lookupResult?: { number: number; originalInput?: string | number };
}

function buildAngelNumberSystemPrompt(
  chartSlice: string,
  questionType: AngelNumberQuestionType
): string {
  return `You are an expert Angel Numbers guide. You reason only from the state below. Angel Numbers guide attention, not destiny.
${SEER_GOVERNING_SENTENCE}

## CRITICAL RULES
- **Rule**: Angel Numbers never introduce new information; they reinforce existing themes. Resolve numbers into themes, not outcomes.
- **Context anchor**: Angel Numbers amplify the user's active domain. Always state what area of life the message applies to (e.g. career, relationship, general awareness).
- **Alignment action**: End with one reflective or alignment action (e.g. pause and clarify intention; recheck alignment; proceed consciously; maintain patience; strengthen structure). Never end with a prediction or guarantee.
- **Frequency**: Frequency increases salience, not certainty. Phrase: "Repeated sightings suggest your attention is being drawn repeatedly to this theme."
- **Refusal**: Do not predict events, promise outcomes, or encourage dependency. Say: "Angel Numbers are guidance symbols, not predictors of events."
- **Missing context**: If context (life area or situation) is missing, ask one brief clarifying question only (e.g. What area of life were you focused on when you noticed this number?).
- Be direct and concise; descriptive but brief.

## Angel Numbers state (use only these)
${chartSlice}

## Question type
${questionType}

Answer the user's question with specific references to the state above.`;
}

const REFUSAL_MESSAGE =
  'Angel Numbers are guidance symbols, not predictors of events. I can help you explore what theme is being reinforced and what to pay attention to right now.';

export async function POST(request: NextRequest) {
  try {
    const body: AskAngelNumbersSeerRequest = await request.json();
    const {
      question,
      userProfile,
      angelNumbersContext,
      angelNumbersData,
      lookupResult,
    } = body;

    if (!question || !question.trim()) {
      return NextResponse.json(
        { success: false, error: 'Question is required' },
        { status: 400 }
      );
    }

    const questionType = classifyAngelNumberQuestion(question.trim());

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

    const profile: AngelNumbersProfileInput | null = angelNumbersData
      ? {
          lifePathAngel: angelNumbersData.lifePathAngel,
          destinyAngel: angelNumbersData.destinyAngel,
          soulAngel: angelNumbersData.soulAngel,
          currentDateAngel: angelNumbersData.currentDateAngel,
          personalYearAngel: angelNumbersData.personalYearAngel,
        }
      : null;

    const state = buildAngelNumberState(
      angelNumbersContext ?? null,
      profile,
      lookupResult ?? null,
      question.trim()
    );

    const chartSlice = getAngelNumberSliceForQuestionType(questionType, state);

    const stream = await createAIStream({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: buildAngelNumberSystemPrompt(chartSlice, questionType),
        },
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
            console.error('Angel Numbers Seer stream error:', error);
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
  } catch (error: any) {
    console.error('Angel Numbers Seer API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to get response from Angel Numbers Seer',
      },
      { status: 500 }
    );
  }
}
