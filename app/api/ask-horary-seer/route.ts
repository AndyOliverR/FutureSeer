import { NextRequest } from 'next/server';
import { createAIStream } from '@/lib/aiGateway';
import { devLog } from '@/lib/devLogger';
import {
  buildHoraryState,
  classifyHoraryQuestion,
  getHorarySliceForQuestionType,
  getRadicalityVerdict,
  type HoraryQuestionType,
  type HoraryChartPayload,
} from '@/lib/horarySeerState';

interface HorarySeerRequest {
  userId: string;
  question: string;
  userProfile?: any;
  horaryData?: HoraryChartPayload | null;
  sessionId?: string;
}

const ANALYSIS_REQUIRED_MESSAGE =
  'Horary requires a question-moment chart with radicality data. Generate your horary chart first to use Ask the Seer.';

const REFUSAL_PHRASE =
  'This question is not suitable for horary judgment at this time.';

const RADICALITY_REFUSAL_PHRASE =
  'This question may be premature or already resolved. The chart is not suitable for judgment at this time.';

export async function POST(request: NextRequest) {
  try {
    const body: HorarySeerRequest = await request.json();
    const { userId, question, userProfile, horaryData } = body;

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

    const hasBasicInfo =
      horaryData?.basicInfo?.question &&
      horaryData?.basicInfo?.questionTime &&
      horaryData?.basicInfo?.questionPlace;
    const hasSeerState = !!horaryData?.seerState?.ascendantSign;

    if (!horaryData || !hasBasicInfo || !hasSeerState) {
      return new Response(
        JSON.stringify({
          success: false,
          error: ANALYSIS_REQUIRED_MESSAGE,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    let state;
    try {
      state = buildHoraryState(horaryData);
    } catch {
      return new Response(
        JSON.stringify({
          success: false,
          error: ANALYSIS_REQUIRED_MESSAGE,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const verdict = getRadicalityVerdict(state.radicality);
    const questionType = classifyHoraryQuestion(question.trim()) as HoraryQuestionType;

    devLog.info(
      '🔮 Horary Seer API: Question type',
      questionType,
      'verdict',
      verdict,
      'ask-horary-seer'
    );

    if (questionType === 'refusal') {
      return new Response(
        new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode(REFUSAL_PHRASE));
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

    if (verdict === 'refuse') {
      return new Response(
        new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode(RADICALITY_REFUSAL_PHRASE));
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

    const slice = getHorarySliceForQuestionType(questionType, state, verdict);

    const displayName = (userProfile?.displayName ?? '').trim();
    const namingRule = displayName
      ? `The user's display name is "${displayName}". Address them only by this name. Do not use generic terms.`
      : 'If no display name is provided, you may use a brief generic address.';

    const systemPrompt = `You are an expert Horary astrologer. Horary answers one sincere question, once, at the moment it is asked.

RULES:
- ${namingRule}
- Judge in order: (1) radicality, (2) significators, (3) planetary condition, (4) applying aspects, (5) reception, (6) Moon, (7) clear judgment. Do not interpret the whole chart.
- State significators explicitly: "You are signified by X; the matter is signified by Y."
- Only applying aspects matter. Aspect hierarchy: conjunction > trine/sextile > square (with effort) > opposition (with loss). Reception explains why an aspect works or fails.
- Moon: next applying aspect; void = no action. If Moon does not support, outcome weak or delayed.
- Answer Yes / No / Not now. Direct, decisive. Never hedge with "There is a chance."
- Refuse: no clear question; missing time/location; radicality failure; vague or life-advice questions.
- Permanent rule: Horary answers only one sincere question, once, at the moment it is asked.

HORARY STATE (use this only):
${slice}

Answer the user's question using the state above. Keep language direct, decisive, and actionable.`;

    const userMessage = question.trim();

    const stream = await createAIStream({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.5,
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
            console.error('Horary Seer stream error:', error);
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
    devLog.error(
      '❌ Error in Horary Seer API:',
      error,
      'ask-horary-seer'
    );
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
