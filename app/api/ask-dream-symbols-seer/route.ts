import { NextRequest } from 'next/server';
import { createAIStream } from '@/lib/aiGateway';
import { devLog } from '@/lib/devLogger';
import {
  buildDreamState,
  classifyDreamSymbolsQuestion,
  getDreamSymbolsSliceForQuestionType,
  type DreamSymbolsQuestionType,
} from '@/lib/dreamSymbolsSeerState';

interface DreamSymbolsSeerRequest {
  userId: string;
  question: string;
  userProfile?: any;
  dreamSymbolsAnalysis?: any;
  dreamData?: any;
  comprehensiveProfile?: any;
  sessionId?: string;
}

const ANALYSIS_REQUIRED_MESSAGE =
  'Generate Dream Symbols analysis first to use Ask the Seer.';

function getRefusalMessage(_question: string): string {
  return 'Dream symbols cannot determine external outcomes. Dreams symbolize internal processing, not literal events.';
}

export async function POST(request: NextRequest) {
  try {
    const body: DreamSymbolsSeerRequest = await request.json();
    const { userId, question, userProfile, sessionId } = body;
    let dreamSymbolsAnalysis = body.dreamSymbolsAnalysis;
    if (!dreamSymbolsAnalysis && body.comprehensiveProfile) {
      dreamSymbolsAnalysis =
        body.comprehensiveProfile.dreamSymbols ??
        body.comprehensiveProfile['Dream Symbols'];
    }
    const dreamData = body.dreamData ?? null;

    if (!userId || !question) {
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

    const hasDescription =
      typeof dreamSymbolsAnalysis?.dreamDescription === 'string' &&
      dreamSymbolsAnalysis.dreamDescription.trim().length > 0;
    const hasSymbols =
      Array.isArray(dreamSymbolsAnalysis?.symbols) &&
      dreamSymbolsAnalysis.symbols.length > 0;

    if (!dreamSymbolsAnalysis || (!hasDescription && !hasSymbols)) {
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
      state = buildDreamState(dreamSymbolsAnalysis, dreamData);
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

    const questionType = classifyDreamSymbolsQuestion(
      question
    ) as DreamSymbolsQuestionType;
    devLog.info(
      '🔮 Dream Symbols Seer API: Question type',
      questionType,
      'ask-dream-symbols-seer'
    );

    if (questionType === 'refusal') {
      const refusalText = getRefusalMessage(question);
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

    devLog.info(
      '🔮 Dream Symbols Seer API: Processing question for user:',
      userId,
      'ask-dream-symbols-seer'
    );

    const chartSlice = getDreamSymbolsSliceForQuestionType(
      questionType,
      state,
      dreamSymbolsAnalysis
    );

    const displayName = (userProfile?.displayName ?? '').trim();
    const namingRule = displayName
      ? `The user's display name is "${displayName}". Address them only by this name (e.g. "${displayName}" or "${displayName},"). Do not use their full name or generic terms like "Dear one".`
      : 'If no display name is provided, you may use a warm generic address.';

    const systemPrompt = `You are an expert Dream Symbols interpreter. Dream symbols describe inner state and processing, not external fate.

RULES:
- ${namingRule}
- Emotional tone overrides symbol dictionary; same symbol + different emotion = different meaning. Always anchor interpretation to emotional tone.
- Apply role logic (participant = active conflict, observer = awareness, victim = overwhelm, controller = responsibility).
- Apply recurrence gate: one-time = transient; repeating = unresolved. Do not dramatize one-time dreams.
- Classify symbols by type (Universal, Personal, Cultural, Situational, Archetypal); do not assume universality without context.
- End with integration guidance (reflect, journal, address conflict, slow down, set boundaries). Do not give predictive action, fear-based advice, or external blame.
- Refuse event prediction, medical/mental health diagnosis, fatalistic interpretations. Say: "Dream symbols cannot determine external outcomes."
- Permanent rule: Dream interpretation translates subconscious signals into awareness, not destiny.

STRUCTURED DREAM STATE (use this only):
${chartSlice}

Answer the user's question using the dream state above. Keep language calm, grounded, and devotionist-style.`;

    const userMessage = question.trim();

    const stream = await createAIStream({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.7,
      maxTokens: 1000,
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
            console.error('Dream Symbols Seer stream error:', error);
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
          'Connection': 'keep-alive',
        },
      }
    );
  } catch (error: any) {
    devLog.error(
      '❌ Error in Dream Symbols Seer API:',
      error,
      'ask-dream-symbols-seer'
    );
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to process question',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
