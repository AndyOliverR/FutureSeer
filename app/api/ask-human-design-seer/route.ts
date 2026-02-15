import { NextRequest, NextResponse } from 'next/server';
import { createAIStream } from '@/lib/aiGateway';
import { devLog } from '@/lib/devLogger';
import { buildHumanDesignSeerSystemPrompt } from '@/lib/humanDesignSeerPrompts';
import {
  buildHumanDesignState,
  classifyHumanDesignQuestion,
  getHumanDesignSliceForQuestionType,
  HUMAN_DESIGN_REFUSAL_DATA_PHRASE,
  HUMAN_DESIGN_REFUSAL_OUTCOME_PHRASE,
  type HumanDesignQuestionType,
} from '@/lib/humanDesignSeerState';

interface HumanDesignSeerRequest {
  userId: string;
  question: string;
  userProfile: any;
  humanDesignChart?: any;
  comprehensiveProfile?: any;
  sessionId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: HumanDesignSeerRequest = await request.json();
    const { userId, question: rawQuestion, userProfile } = body;
    let humanDesignChart = body.humanDesignChart;
    // Parse optional scope from question (injected by seer route after clarification)
    let question = (rawQuestion || '').trim();
    let scope: 'overview' | 'authority' | undefined;
    const scopeMatch = question.match(/^Scope:\s*(overview|authority)\s*\.\s*/i);
    if (scopeMatch) {
      scope = scopeMatch[1].toLowerCase() as 'overview' | 'authority';
      question = question.slice(scopeMatch[0].length).trim() || question;
    }
    if (!humanDesignChart && body.comprehensiveProfile) {
      humanDesignChart =
        body.comprehensiveProfile.humanDesign ??
        body.comprehensiveProfile['Human Design'];
    }

    if (!userId || !question || !userProfile) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameters: userId, question, or userProfile',
        },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    devLog.info(
      '🔮 Human Design Seer API: Processing question for user:',
      userId,
      'ask-human-design-seer'
    );

    // Require chart
    if (!humanDesignChart || !humanDesignChart.type || !humanDesignChart.authority) {
      return NextResponse.json(
        {
          success: false,
          error: HUMAN_DESIGN_REFUSAL_DATA_PHRASE,
        },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Classify question — refuse outcome/timing questions
    const questionType: HumanDesignQuestionType = classifyHumanDesignQuestion(question.trim());
    if (questionType === 'refusal') {
      return new Response(
        new ReadableStream({
          start(controller) {
            controller.enqueue(
              new TextEncoder().encode(HUMAN_DESIGN_REFUSAL_OUTCOME_PHRASE)
            );
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

    // Build state and slice
    let state;
    try {
      state = buildHumanDesignState(humanDesignChart);
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: HUMAN_DESIGN_REFUSAL_DATA_PHRASE,
        },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const slice = getHumanDesignSliceForQuestionType(questionType, state);
    const displayName =
      (userProfile?.displayName ?? userProfile?.display_name) ?? undefined;
    const systemPrompt = buildHumanDesignSeerSystemPrompt(slice, questionType, {
      displayName,
      scope,
    });

    const stream = await createAIStream({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question.trim() },
      ],
      temperature: 0.6,
      maxTokens: 800,
    });

    return new Response(
      new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of stream) {
              const content = chunk.choices?.[0]?.delta?.content ?? '';
              if (content) {
                controller.enqueue(new TextEncoder().encode(content));
              }
            }
          } catch (error) {
            devLog.error('Human Design Seer stream error:', error);
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
          Connection: 'keep-alive',
        },
      }
    );
  } catch (error: unknown) {
    devLog.error(
      '❌ Error in Human Design Seer API:',
      error,
      'ask-human-design-seer'
    );
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to process question',
      },
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
