import { NextRequest } from 'next/server';
import { createAIStream } from '@/lib/aiGateway';
import { devLog } from '@/lib/devLogger';
import {
  buildRuneState,
  classifyRuneQuestion,
  getRunesSliceForQuestionType,
  type RuneQuestionType,
} from '@/lib/runesSeerState';
import type { RuneReading } from '@/lib/runesIntelligence';

interface RunesSeerRequest {
  userId: string;
  question: string;
  userProfile?: any;
  runeReading?: RuneReading | null;
  sessionId?: string;
}

const READING_REQUIRED_MESSAGE =
  'Cast runes first to use Ask the Seer. Perform a rune reading in the Reading tab.';

function getRefusalMessage(): string {
  return 'Runes indicate forces and consequences, not fixed outcomes. Runes reveal the nature of forces at play, not the certainty of results.';
}

export async function POST(request: NextRequest) {
  try {
    const body: RunesSeerRequest = await request.json();
    const { userId, question, userProfile, runeReading } = body;

    if (!userId || !question?.trim()) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required parameters: userId or question',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const hasRunes =
      Array.isArray(runeReading?.runes) && runeReading.runes.length > 0;

    if (!runeReading || !hasRunes) {
      return new Response(
        JSON.stringify({
          success: false,
          error: READING_REQUIRED_MESSAGE,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    let state;
    try {
      state = buildRuneState(runeReading);
    } catch {
      return new Response(
        JSON.stringify({
          success: false,
          error: READING_REQUIRED_MESSAGE,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const questionType = classifyRuneQuestion(question.trim()) as RuneQuestionType;
    devLog.info(
      'ᚱ Runes Seer API: Question type',
      questionType,
      'ask-runes-seer'
    );

    if (questionType === 'refusal') {
      const refusalText = getRefusalMessage();
      return new Response(
        new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode(refusalText));
            controller.close();
          },
        }),
        {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          },
        }
      );
    }

    const chartSlice = getRunesSliceForQuestionType(
      questionType,
      state,
      runeReading
    );

    const displayName = (userProfile?.displayName ?? '').trim();
    const namingRule = displayName
      ? `The user's display name is "${displayName}". Address them only by this name. Do not use generic terms.`
      : 'If no display name is provided, you may use a brief generic address.';

    const systemPrompt = `You are an expert Rune Divination reader (Elder Futhark). Runes describe forces and consequences, not guarantees or timelines.

RULES:
- ${namingRule}
- Interpret primary rune → position → orientation; then supporting runes. Do not draw many runes or stack meanings; use only the rune state provided (1–3 runes).
- Emphasize warning vs support: disruptive runes mean "do not proceed blindly," not "bad." State explicitly when a rune signals caution / disruption / correction.
- End with one clear action stance: Proceed / Proceed with caution / Pause / Adjust approach. No ambiguity.
- Focus on function + context (resources, direction, disruption, pause, clarity, etc.), not mythology or long stories.
- Do not predict dates, timelines, or guarantees. Refuse: "Will I succeed?", "When will this happen?", "Is this guaranteed?"
- Refuse repeated casts for the same question without change in circumstances. Say: "Runes should not be repeatedly cast for the same question without a change in circumstances."
- Permanent rule: Runes reveal the nature of forces at play, not the certainty of results.

RUNES STATE (use this only):
${chartSlice}

Answer the user's question using the rune state above. Keep language direct, grounded, and non-mystical.`;

    const userMessage = question.trim();

    const stream = await createAIStream({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.6,
      maxTokens: 800,
    });

    return new Response(
      new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of stream) {
              const content = chunk.choices[0]?.delta?.content ?? '';
              if (content) {
                controller.enqueue(new TextEncoder().encode(content));
              }
            }
          } catch (error) {
            console.error('Runes Seer stream error:', error);
            controller.enqueue(
              new TextEncoder().encode(
                'I encountered an error. Please try again.'
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
          'Connection': 'keep-alive',
        },
      }
    );
  } catch (error: unknown) {
    devLog.error('❌ Error in Runes Seer API:', error, 'ask-runes-seer');
    return new Response(
      JSON.stringify({
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to process question',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
