import { NextRequest, NextResponse } from 'next/server';
import { createAIStream } from '@/lib/aiGateway';
import { devLog } from '@/lib/devLogger';
import {
  buildHellenisticState,
  classifyHellenisticQuestion,
  getHellenisticSliceForQuestionType,
  type HellenisticQuestionType,
} from '@/lib/hellenisticSeerState';
import { SEER_GOVERNING_SENTENCE } from '@/lib/askTheSeerDiscipline';

interface HellenisticSeerRequest {
  userId: string;
  question: string;
  userProfile: any;
  hellenisticContext?: any;
  sessionId?: string;
}

function buildHellenisticSystemPrompt(
  chartSlice: string,
  questionType: HellenisticQuestionType
): string {
  return `You are an expert Hellenistic astrologer. You reason only from the chart state below. No Hellenistic answer is valid without sect and house rulership. In Hellenistic astrology, planets act; signs color; houses decide topics; time-lords activate.
${SEER_GOVERNING_SENTENCE}

## CRITICAL RULES
- **Topic → House → Ruler**: Route every topic question: identify the relevant house, its ruler, then the ruler's condition. Outcome quality follows ruler condition (e.g. weak ruler → improvement limited or delayed).
- **Sect logic**: Day chart: Sun, Jupiter, Saturn stronger. Night chart: Moon, Venus, Mars stronger. Out-of-sect malefic is more difficult. Reference sect explicitly when relevant.
- **Lots**: Lot of Fortune = material circumstances, things that happen. Lot of Spirit = intentional actions, career drive. If the user asks about what they do → Spirit; about what happens to them → Fortune.
- **Time hierarchy**: Profections first, then time lord (profected ruler). Transits only for confirmation. Never lead with transits.
- **Condition**: Use relative condition (strong/average/weak) from sect and dignity. Angular houses strengthen; cadent weaken.
- **Answer framing**: Authoritative and rule-based. Conditional outcomes (e.g. "Because the ruler of the 10th is weak and cadent, career advancement exists but requires sustained effort and may not be publicly visible yet"). No vague psychological phrasing.
- **Refusal reminder**: Do not use psychological therapy language, free-will absolutism, or mix systems. Say: "Hellenistic astrology cannot judge this without the relevant house and ruler."
- Be direct and concise; descriptive but brief.

## Hellenistic chart state (use only these)
${chartSlice}

## Question type
${questionType}

Answer the user's question with specific references to the chart state above.`;
}

const REFUSAL_MESSAGE =
  "Hellenistic astrology cannot judge this without the relevant house and ruler. I do not mix systems or use psychological therapy language. I can answer about career, wealth, marriage, health, sect, lots, and profections from your chart.";

export async function POST(request: NextRequest) {
  try {
    const { userId, question, userProfile, hellenisticContext, sessionId }: HellenisticSeerRequest =
      await request.json();

    if (!question || !question.trim()) {
      return NextResponse.json(
        { success: false, error: 'Question is required' },
        { status: 400 }
      );
    }

    if (!hellenisticContext) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing Hellenistic chart data. Please generate a reading first.',
        },
        { status: 400 }
      );
    }

    devLog.info('🔮 Hellenistic Seer API: Processing question for user:', userId, 'ask-hellenistic-seer');

    const questionType = classifyHellenisticQuestion(question.trim());

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

    const state = buildHellenisticState(hellenisticContext);
    const chartSlice = getHellenisticSliceForQuestionType(questionType, state);

    const stream = await createAIStream({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: buildHellenisticSystemPrompt(chartSlice, questionType),
        },
        { role: 'user', content: question.trim() },
      ],
      temperature: 0.7,
      maxTokens: 1000,
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
            console.error('Hellenistic Seer stream error:', error);
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
    console.error('Hellenistic Seer API error:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error.message || 'Failed to get response from Hellenistic Seer',
      },
      { status: 500 }
    );
  }
}
