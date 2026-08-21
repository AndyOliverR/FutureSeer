import { NextRequest, NextResponse } from 'next/server';
import { enforceToolSeerGate, resolveToolSeerUserId } from '@/lib/enforceToolSeerGate';
import { devLog } from '@/lib/devLogger';
import { callTextStream } from '@/lib/aiStructuredOutput';
import { cacheToolSeerAnswer } from '@/lib/toolSeerQuestionCache';
import {
  buildPalmState,
  classifyPalmQuestion,
  getPalmSliceForQuestionType,
  type PalmQuestionType,
} from '@/lib/palmSeerState';
import { buildPalmSeerSystemPrompt } from '@/lib/palmSeerPrompts';
import { GROQ_DEFAULT_TEXT_MODEL } from '@/lib/groqModels';
import { buildToolSeerMessages } from '@/lib/aiPromptBuilder';
import { historyFromSeerBody } from '@/lib/seerChatVoice';

const REFUSAL_MESSAGE =
  'Palmistry shows tendencies, not events. It does not determine timing, health outcomes, or exact life events. I can speak to your tendencies, strengths, and relationship style instead.';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const __toolSeerGate = await enforceToolSeerGate(request, body, 'palmistry_ask_seer');
    if (__toolSeerGate) return __toolSeerGate;

    const userId = await resolveToolSeerUserId(request, body, 'palmistry_ask_seer');
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const { question, palmistryContext, userProfile } = body;

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

    const { messages } = buildToolSeerMessages({
      systemContent: buildPalmSeerSystemPrompt(chartSlice, questionType),
      userMessage: question.trim(),
      history: historyFromSeerBody(body),
    });

    const { stream } = await callTextStream({ label: 'palmistry-ask-seer', model: GROQ_DEFAULT_TEXT_MODEL,
      userId,
      cacheQuestion: typeof question === 'string' ? question.trim() : String(question).trim(),
      messages,
      temperature: 0.7,
      maxTokens: 800,
    });

    return new Response(
      new ReadableStream({
        async start(controller) {
          try {
            let fullResponse = '';
            for await (const chunk of stream) {
              const content = chunk.choices[0]?.delta?.content || '';
              if (content) {
                fullResponse += content;
                controller.enqueue(new TextEncoder().encode(content));
              }
            }
            if (fullResponse.trim()) {
              await cacheToolSeerAnswer('palmistry-ask-seer', userId, question, fullResponse);
            }
          } catch (error) {
            devLog.error('Palmistry Seer stream error:', error, 'route');
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
    devLog.error('Palmistry Seer API error:', error, 'route');
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to get response from Palmistry Seer',
      },
      { status: 500 }
    );
  }
}
