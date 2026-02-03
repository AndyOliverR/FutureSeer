import { NextRequest } from 'next/server';
import { createAIStream } from '@/lib/aiGateway';
import { devLog } from '@/lib/devLogger';
import {
  buildFaceReadingState,
  classifyFaceReadingQuestion,
  getFaceReadingSliceForQuestionType,
  type FaceReadingQuestionType,
} from '@/lib/faceReadingSeerState';

interface FaceReadingSeerRequest {
  userId: string;
  question: string;
  userProfile?: any;
  faceReadingAnalysis?: any;
  comprehensiveProfile?: any;
  sessionId?: string;
}

const ANALYSIS_REQUIRED_MESSAGE =
  'Generate Face Reading analysis first to use Ask the Seer.';

function getRefusalMessage(_question: string): string {
  return 'Face reading reflects tendencies, not predictions. Face reading cannot determine this with certainty.';
}

export async function POST(request: NextRequest) {
  try {
    const body: FaceReadingSeerRequest = await request.json();
    const { userId, question, userProfile, sessionId } = body;
    let faceReadingAnalysis = body.faceReadingAnalysis;
    if (!faceReadingAnalysis && body.comprehensiveProfile) {
      faceReadingAnalysis =
        body.comprehensiveProfile.faceReading ??
        body.comprehensiveProfile['Face Reading'];
    }

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

    if (!faceReadingAnalysis || !faceReadingAnalysis.faceShape) {
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
      state = buildFaceReadingState(faceReadingAnalysis);
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

    const questionType = classifyFaceReadingQuestion(question) as FaceReadingQuestionType;
    devLog.info(
      '🔮 Face Reading Seer API: Question type',
      questionType,
      'ask-face-reading-seer'
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
      '🔮 Face Reading Seer API: Processing question for user:',
      userId,
      'ask-face-reading-seer'
    );

    const chartSlice = getFaceReadingSliceForQuestionType(
      questionType,
      state,
      faceReadingAnalysis
    );

    const displayName = (userProfile?.displayName ?? '').trim();
    const namingRule = displayName
      ? `The user's display name is "${displayName}". Address them only by this name (e.g. "${displayName}" or "${displayName},"). Do not use their full name or generic terms like "Dear one".`
      : 'If no display name is provided, you may use a warm generic address.';

    const systemPrompt = `You are an expert Face Reading (Physiognomy) advisor. You describe tendencies and capacities, not fate or events.

RULES:
- ${namingRule}
- Face reading reflects how energy is expressed, not what the future will deliver.
- Anchor all analysis in the three zones (Upper: thinking/early life; Middle: career/action; Lower: stability/relationships). Apply feature hierarchy: face shape > zone dominance > major features (eyes, nose, mouth) > minor details.
- Resolve contradictions explicitly (e.g. dominant middle zone + soft jaw → "strong drive toward achievement, balanced by a cooperative approach rather than rigid control").
- Speak only in tendencies and capacities. Do not predict events, dates, or outcomes. Do not give health diagnosis or moral judgment. Emphasize current state vs permanent destiny.
- If asked about timing, outcomes, health, or morality, say: "Face reading cannot determine this with certainty."

STRUCTURED FACE STATE (use this morphology only):
${chartSlice}

Answer the user's question using the face state above. Keep language clear, warm, and devotionist-style.`;

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
            console.error('Face Reading Seer stream error:', error);
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
      '❌ Error in Face Reading Seer API:',
      error,
      'ask-face-reading-seer'
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
