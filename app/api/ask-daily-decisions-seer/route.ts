import { NextRequest, NextResponse } from 'next/server';
import { createAIStream } from '@/lib/aiGateway';
import {
  buildDailyDecisionState,
  classifyDailyDecisionQuestion,
  getDailyDecisionSliceForQuestionType,
  type DailyDecisionQuestionType,
} from '@/lib/dailyDecisionsSeerState';
import type { DailyDecisionsAnalysis } from '@/lib/dailyDecisionsIntelligence';
import { SEER_GOVERNING_SENTENCE } from '@/lib/askTheSeerDiscipline';

interface AskDailyDecisionsSeerRequest {
  userId?: string;
  question: string;
  userProfile?: unknown;
  dailyDecisionsAnalysis?: DailyDecisionsAnalysis;
  selectedDate?: string;
}

function buildDailyDecisionSystemPrompt(
  chartSlice: string,
  questionType: DailyDecisionQuestionType
): string {
  return `You are an expert Daily Decisions (Vedic Panchanga) guide. You reason only from the state below. Daily Decisions addresses timing suitability, not outcomes.
${SEER_GOVERNING_SENTENCE}

## CRITICAL RULES
- **Vara (Sanskrit) to English**: Shukravar = Friday, Guruvar = Thursday, Ravivar = Sunday, Somavar = Monday, Mangalvar = Tuesday, Budhvar = Wednesday, Shanivar = Saturday. When referring to the day of the week, always use the English weekday (e.g. Friday). Never say Shukravar is Thursday. Shukravar is Friday. When stating what day today is, use the value of weekday_english from the state.
- **Mandatory state**: Do not answer without the Daily Decision state; the slice below is your only input.
- **Valid questions**: Only timing-suitability questions (e.g. "Is today good for X?", "When should I do X today?", "Should I avoid X today?"). Refuse outcome prediction: "Daily Decisions does not assess outcomes, only timing suitability."
- **Activity-specific rules**: Each activity has its own guidance; answer only for the activity in question. Do not use the word "rulebook" in your answers. Phrase in plain language (e.g. "Best days for lending money are Monday", "Avoid haircut on your Janma Tithi").
- **Absolute prohibitions gate**: If Janma Nakshatra day, Janma Tithi (for grooming), Rahu Kaal, Gulika Kaal, or after sunset (for grooming) applies, score cannot exceed 65 and you must explicitly say "avoid."
- **Scores**: Scores express ease of timing, not benefit or success.
- **Dasha**: Current Dasha modifies caution level only, not permission. Phrase: "Current Dasha suggests caution, not avoidance."
- **Time window resolver**: For "when today?" questions, remove Rahu Kaal, Gulika Kaal, and (for grooming) post-sunset; return only the remaining safe windows. No astrology narration.
- **Explanation style**: Short, rule-referenced, emotionless. Example: "Haircut is discouraged today because it coincides with your Janma Tithi."
- **Permanent rule**: Daily Decisions reduces avoidable friction; it does not create success.

## Daily Decision state (use only these)
${chartSlice}

## Question type
${questionType}

Answer the user's question with specific references to the state above.`;
}

const REFUSAL_MESSAGE =
  'Daily Decisions addresses timing suitability, not outcomes. I can tell you whether today is suitable for an activity and when to avoid inauspicious times.';

export async function POST(request: NextRequest) {
  try {
    const body: AskDailyDecisionsSeerRequest = await request.json();
    const { question, dailyDecisionsAnalysis, selectedDate } = body;

    if (!question || !question.trim()) {
      return NextResponse.json(
        { success: false, error: 'Question is required' },
        { status: 400 }
      );
    }

    if (!dailyDecisionsAnalysis) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Daily Decisions recommendations are required. Generate your recommendations first to use Ask the Seer.',
        },
        { status: 400 }
      );
    }

    const questionType = classifyDailyDecisionQuestion(question.trim());

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

    const state = buildDailyDecisionState(
      dailyDecisionsAnalysis,
      selectedDate ?? dailyDecisionsAnalysis.date
    );
    const chartSlice = getDailyDecisionSliceForQuestionType(questionType, state);

    const stream = await createAIStream({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: buildDailyDecisionSystemPrompt(chartSlice, questionType),
        },
        { role: 'user', content: question.trim() },
      ],
      temperature: 0.5,
      maxTokens: 600,
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
            console.error('Daily Decisions Seer stream error:', error);
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
    console.error('Daily Decisions Seer API error:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to get response from Daily Decisions Seer',
      },
      { status: 500 }
    );
  }
}
