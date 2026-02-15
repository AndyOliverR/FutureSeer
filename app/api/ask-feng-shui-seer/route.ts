import { NextRequest } from 'next/server';
import { createAIStream } from '@/lib/aiGateway';
import { devLog } from '@/lib/devLogger';
import { buildFengShuiSeerSystemPrompt } from '@/lib/fengShuiSeerPrompts';
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
    const systemPrompt = buildFengShuiSeerSystemPrompt(slice, questionType, {
      displayName: displayName || undefined,
    });

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
            devLog.error('Feng Shui Seer stream error:', error);
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
