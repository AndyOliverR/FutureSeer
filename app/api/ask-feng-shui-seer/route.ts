import { NextRequest } from 'next/server';
import { createAIStream } from '@/lib/aiGateway';
import { devLog } from '@/lib/devLogger';
import {
  buildFengShuiState,
  classifyFengShuiQuestion,
  getFengShuiSliceForQuestionType,
  type FengShuiQuestionType,
} from '@/lib/fengShuiSeerState';
import type { FengShuiAnalysis } from '@/lib/fengshui/fengShuiService';

interface FengShuiSeerRequest {
  userId: string;
  question: string;
  userProfile?: any;
  fengShuiAnalysis?: FengShuiAnalysis | null;
  comprehensiveProfile?: any;
  sessionId?: string;
  /** User-provided facing direction (e.g. North, East). Enables layout-aware advice. */
  facing_direction?: string;
  /** User-provided layout: main_door, bedroom, kitchen, toilet directions. */
  layout?: { main_door?: string; bedroom?: string; kitchen?: string; toilet?: string };
  property_type?: string;
  usage?: string;
}

const ANALYSIS_REQUIRED_MESSAGE =
  'Feng Shui analysis requires profile data. Complete your profile and generate Feng Shui analysis first to use Ask the Seer.';

function getRefusalMessage(): string {
  return 'Feng Shui adjusts environmental influence, not destiny. Feng Shui analysis requires accurate spatial data to be reliable.';
}

export async function POST(request: NextRequest) {
  try {
    const body: FengShuiSeerRequest = await request.json();
    const {
      userId,
      question,
      userProfile,
      fengShuiAnalysis: bodyAnalysis,
      facing_direction,
      layout,
      property_type,
      usage,
    } = body;
    let fengShuiAnalysis = body.fengShuiAnalysis;
    if (!fengShuiAnalysis && body.comprehensiveProfile) {
      const cp = body.comprehensiveProfile;
      fengShuiAnalysis = cp.fengShui ?? cp['Feng Shui'] ?? cp.vastu ?? cp['Vastu'];
    }

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

    const hasKua = fengShuiAnalysis?.kua != null;

    if (!fengShuiAnalysis || !hasKua) {
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
      state = buildFengShuiState(fengShuiAnalysis, {
        facing_direction,
        layout,
        property_type,
        usage,
      });
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

    const questionType = classifyFengShuiQuestion(question.trim()) as FengShuiQuestionType;
    devLog.info(
      '🔮 Feng Shui Seer API: Question type',
      questionType,
      'ask-feng-shui-seer'
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

    const slice = getFengShuiSliceForQuestionType(
      questionType,
      state,
      fengShuiAnalysis
    );

    const displayName = (userProfile?.displayName ?? '').trim();
    const namingRule = displayName
      ? `The user's display name is "${displayName}". Address them only by this name. Do not use generic terms.`
      : 'If no display name is provided, you may use a brief generic address.';

    const systemPrompt = `You are an expert Feng Shui advisor (environmental systems). Feng Shui optimizes space; it does not force results.

RULES:
- ${namingRule}
- Apply Form School first: Qi must enter, circulate, settle. Evaluate entrance, flow path, rest areas, work areas. If Form is bad, do not apply advanced cures.
- Respect occupant compatibility (Eight Mansions / Kua): Say "This space is supportive / draining for you specifically." No generic advice.
- Lock to one school per answer. Never mix Form School, Eight Mansions, and Flying Star rules mid-answer.
- Recommend minimal, specific corrections only: repositioning, decluttering, light, airflow, color moderation. One issue → one correction. No symbol stacking or aggressive remedies.
- Do not predict outcomes, guarantee success, or promise wealth. Refuse: "Will this bring money?", "Will this guarantee success?", "When will things change?"
- Refuse without sufficient spatial data when critical. Say: "Feng Shui analysis requires accurate spatial data to be reliable."
- Permanent rule: Feng Shui removes resistance; it does not replace effort.

FENG SHUI STATE (use this only):
${slice}

Answer the user's question using the state above. Keep language practical, unemotional, and actionable.`;

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
            console.error('Feng Shui Seer stream error:', error);
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
      '❌ Error in Feng Shui Seer API:',
      error,
      'ask-feng-shui-seer'
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
