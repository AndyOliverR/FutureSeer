import { NextRequest, NextResponse } from 'next/server';
import { enforceToolSeerGate } from '@/lib/enforceToolSeerGate';
import { appendAttribution } from '@/lib/attribution/attributionStamp';
import { getFirebaseDB } from '@/lib/firebase';
import {
  buildVedicSeerSystemPrompt,
  generateFollowUpQuestions,
  type VedicQuestionContext,
} from '@/lib/vedicSeerPrompts';
import { PredictiveSystem } from '@/lib/predictiveAlgorithms';
import { callTextStream } from '@/lib/aiStructuredOutput';
import { cacheToolSeerAnswer } from '@/lib/toolSeerQuestionCache';
import { devLog } from '@/lib/devLogger';
import { searchKnowledge, formatKnowledgeForPrompt, extractKeyTopics } from '@/lib/knowledgeLoader';
import { buildToolSeerMessages } from '@/lib/aiPromptBuilder';
import { ConversationalMemory, MemoryMessage } from '@/lib/conversationalMemory';
import {
  buildVedicState,
  classifyVedicQuestion,
  getVedicSliceForQuestionType,
} from '@/lib/vedicSeerState';
import {
  buildMarkovUserBehaviorSignals,
  formatPredictiveHintForVedicPrompt,
} from '@/lib/predictionUserSignals';
import {
  formatCareerReportForSeer,
  readVedicCareerCache,
} from '@/lib/vedic/vedicCareerReport';
import {
  formatRelationshipReportForSeer,
  readVedicRelationshipCache,
} from '@/lib/vedic/vedicRelationshipReport';
import type { VedicBirthProfile } from '@/lib/vedic/vedicReportFirestore';
import { GROQ_DEFAULT_TEXT_MODEL } from '@/lib/groqModels';

const X_ROBOTS_TAG = 'noindex, nofollow, noarchive, nosnippet';
const SEER_MARKER_FAMILY = 'ask-vedic-seer';

function stampText(text: string): string {
  return appendAttribution(text, { markerFamily: SEER_MARKER_FAMILY });
}

function stampAnswerFields(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stampAnswerFields);
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if ((k === 'answer' || k === 'response' || k === 'reply') && typeof v === 'string') {
        out[k] = stampText(v);
      } else {
        out[k] = stampAnswerFields(v);
      }
    }
    return out;
  }
  return value;
}

function jsonWithRobots(body: unknown, init?: ResponseInit): Response {
  const response = NextResponse.json(stampAnswerFields(body), init);
  response.headers.set('X-Robots-Tag', X_ROBOTS_TAG);
  return response;
}

function appendAttributionTail(controller: ReadableStreamDefaultController<Uint8Array>): void {
  controller.enqueue(new TextEncoder().encode(stampText('')));
}

function withRobotsResponse(body?: BodyInit | null, init?: ResponseInit): Response {
  const headers = new Headers(init?.headers);
  headers.set('X-Robots-Tag', X_ROBOTS_TAG);
  return new Response(body ?? null, { ...init, headers });
}

type VedicChartPayload = Record<string, unknown>;

type VedicSeerFocusLens = 'career' | 'relationships' | 'remedies';

interface VedicSeerRequest {
  userId: string;
  question: string;
  userProfile: Record<string, unknown>;
  vedicChartData: VedicChartPayload;
  vedicNumerologyData?: Record<string, unknown>;
  sessionId?: string;
  /** When set, inject the matching focused Vedic report into the system prompt. */
  focusLens?: VedicSeerFocusLens;
  planetFocus?: string;
}

interface VedicSeerStoredPayload {
  answer: string;
  confidence: number;
  chartReferences: {
    planets: string[];
    houses: number[];
    nakshatras: string[];
    dashas: string[];
  };
  timing: {
    favorable: string[];
    challenging: string[];
  };
  remedies: string[];
  followUpQuestions: string[];
}

function transitSummaryFromChart(
  chart: VedicChartPayload
): { favorable: string[]; challenging: string[] } {
  const t = chart.transits;
  if (t && typeof t === 'object' && !Array.isArray(t)) {
    const o = t as { favorable?: string[]; challenging?: string[] };
    return {
      favorable: Array.isArray(o.favorable) ? o.favorable : [],
      challenging: Array.isArray(o.challenging) ? o.challenging : [],
    };
  }
  return { favorable: [], challenging: [] };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as VedicSeerRequest;
    const __toolSeerGate = await enforceToolSeerGate(request, body, 'ask_vedic_seer');
    if (__toolSeerGate) return __toolSeerGate;
    const { userId, question, userProfile, vedicChartData, vedicNumerologyData, sessionId, focusLens, planetFocus } =
      body;

    if (!userId || !question || !userProfile) {
      return jsonWithRobots(
        {
          success: false,
          error: 'Missing required parameters: userId, question, or userProfile',
        },
        { status: 400 }
      );
    }

    if (!vedicChartData) {
      return jsonWithRobots(
        {
          success: false,
          error: 'Missing Vedic chart data. Please ensure you are accessing this from the Vedic astrology page.',
        },
        { status: 400 }
      );
    }

    devLog.info('🔮 Vedic Seer API: Processing question for user:', userId, 'vedic-seer');

    let questionType = classifyVedicQuestion(question);
    if (focusLens === 'career' && questionType === 'general') {
      questionType = 'career';
    }
    if (focusLens === 'relationships' && (questionType === 'general' || questionType === 'career')) {
      questionType = 'marriage';
    }
    if ((focusLens === 'remedies' || Boolean(planetFocus)) && questionType === 'general') {
      questionType = 'remedies';
    }
    if (questionType === 'refusal') {
      const refusalMessage =
        'Vedic astrology indicates tendencies and periods, not certainties. I cannot give medical diagnosis, death prediction, or absolute certainty. I can help with timing, career, marriage, and remedies within the astrological framework.';
      return withRobotsResponse(
        new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode(stampText(refusalMessage)));
            appendAttributionTail(controller);
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

    const state = buildVedicState(vedicChartData, userProfile);
    const chartSlice = getVedicSliceForQuestionType(questionType, state);

    const memory = new ConversationalMemory(userId);
    await memory.initializeAllMemory(true);

    const workingMemory = memory.getWorkingMemory();
    const conversationHistory = workingMemory.lastExchanges
      .filter((msg: MemoryMessage) => msg.type === 'user' || msg.type === 'seer')
      .map((msg: MemoryMessage, index: number, arr: MemoryMessage[]) => {
        if (msg.type === 'user') {
          const seerResponse = arr[index + 1];
          return {
            question: msg.content,
            answer: seerResponse?.type === 'seer' ? seerResponse.content : '',
          };
        }
        return null;
      })
      .filter((item): item is { question: string; answer: string } => item !== null)
      .slice(-10);

    const behaviorSignals = await buildMarkovUserBehaviorSignals({
      userId,
      question,
      questionType,
      recentExchanges: conversationHistory.map((h) => ({ question: h.question, answer: h.answer })),
    });

    const predictiveAnalysis = await generatePredictiveAnalysis(
      vedicChartData,
      question,
      userId,
      vedicNumerologyData,
      behaviorSignals,
      questionType
    );
    const predictiveHint = formatPredictiveHintForVedicPrompt(predictiveAnalysis);

    let knowledgeContext = '';
    try {
      const topics = extractKeyTopics(question);
      if (planetFocus) topics.push(planetFocus, 'upaya', 'remedies');
      const kbResults = searchKnowledge(topics.join(' '), ['astrology/vedic', 'astrology']);
      knowledgeContext = formatKnowledgeForPrompt(kbResults);
    } catch { /* KB is optional; do not fail the request */ }

    let focusedLensReport: string | undefined;
    const birthProfile: VedicBirthProfile = {
      birthDate: String(userProfile.birthDate ?? ''),
      birthTime: String(userProfile.birthTime ?? '12:00:00'),
      birthPlace: String(userProfile.birthPlace ?? ''),
    };
    if (focusLens === 'career' && birthProfile.birthDate && birthProfile.birthPlace) {
      const career = await readVedicCareerCache(userId, birthProfile, { allowStale: true });
      if (career) focusedLensReport = formatCareerReportForSeer(career);
    }
    if (focusLens === 'relationships' && birthProfile.birthDate && birthProfile.birthPlace) {
      const rel = await readVedicRelationshipCache(userId, birthProfile, { allowStale: true });
      if (rel) focusedLensReport = formatRelationshipReportForSeer(rel);
    }

    const { messages } = buildToolSeerMessages({
      systemContent: buildVedicSeerSystemPrompt(
        chartSlice,
        questionType,
        predictiveHint,
        knowledgeContext,
        focusedLensReport,
      ),
      userMessage: question,
      history: conversationHistory,
      maxHistoryTurns: 5,
    });

    const { stream } = await callTextStream({
      label: 'ask-vedic-seer',
      model: GROQ_DEFAULT_TEXT_MODEL,
      userId,
      cacheQuestion: typeof question === 'string' ? question.trim() : String(question).trim(),
      messages,
      temperature: 0.7,
      maxTokens: 1000,
    });

    const transitTiming = transitSummaryFromChart(vedicChartData);

    return withRobotsResponse(
      new ReadableStream({
        async start(controller) {
          let fullResponse = '';

          try {
            for await (const chunk of stream) {
              const content = chunk.choices[0]?.delta?.content || '';
              if (content) {
                fullResponse += content;
                controller.enqueue(new TextEncoder().encode(content));
              }
            }

            const userMessage: MemoryMessage = {
              id: `msg_${Date.now()}_user`,
              timestamp: Date.now(),
              type: 'user',
              content: question,
              questionType: questionType,
              keywords: question.split(' ').slice(0, 5),
            };

            const seerMessage: MemoryMessage = {
              id: `msg_${Date.now()}_seer`,
              timestamp: Date.now(),
              type: 'seer',
              content: fullResponse,
              questionType: questionType,
              confidence: 0.8,
              sources: ['vedic-astrology'],
            };

            await memory.addExchange(userMessage);
            await memory.addExchange(seerMessage);
            memory.addRecentQuestion(question);
            await memory.saveAllMemory();

            await storeConversation(userId, sessionId, question, {
              answer: fullResponse,
              confidence: 0.9,
              chartReferences: extractChartReferences(fullResponse, vedicChartData),
              timing: transitTiming,
              remedies: [],
              followUpQuestions: generateFollowUpQuestions(
                String(questionType),
                {
                  userProfile,
                  vedicChart: vedicChartData,
                  conversationHistory: conversationHistory.map((h) => ({
                    question: h.question,
                    answer: h.answer,
                    timestamp: 0,
                  })),
                } as VedicQuestionContext
              ),
            });

            await cacheToolSeerAnswer('ask-vedic-seer', userId, question, fullResponse);
          } catch (error) {
            devLog.error('Error during streaming:', error);
            controller.enqueue(
              new TextEncoder().encode(stampText('I apologize, but I encountered an error. Please try again.'))
            );
          } finally {
            appendAttributionTail(controller);
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
  } catch (error) {
    devLog.error('Error in Vedic Seer API:', error);
    return jsonWithRobots(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

function mapQuestionToState(questionType: string): string {
  const stateMap: Record<string, string> = {
    marriage: 'relationship_seeking',
    career: 'career_transition',
    business: 'entrepreneurial_phase',
    wealth: 'financial_growth',
    health: 'health_concern',
    timing: 'life_timing',
    dasha: 'dasha_period',
    remedies: 'spiritual_support',
    general: 'general_life',
    event_confirmation: 'life_timing',
    life_purpose: 'soul_seeking',
    existential: 'meaning_crisis',
    control: 'empowerment_seeking',
    transformation: 'personal_growth',
  };
  return stateMap[questionType] || 'general_life';
}

async function generatePredictiveAnalysis(
  vedicChartData: VedicChartPayload,
  question: string,
  userId: string,
  numerologyData: Record<string, unknown> | undefined,
  userBehavior: string[],
  vedicQuestionType: string
): Promise<Record<string, unknown> | null> {
  try {
    const predictiveSystem = new PredictiveSystem();
    const currentState = mapQuestionToState(vedicQuestionType);

    const prediction = await predictiveSystem.generateComprehensivePrediction(
      userId,
      currentState,
      vedicChartData,
      numerologyData ?? {},
      userBehavior,
      { question, questionType: vedicQuestionType }
    );

    return {
      markovPrediction: prediction.markovPrediction,
      bayesianPrediction: prediction.bayesianPrediction,
      combinedPrediction: prediction.combinedPrediction,
      confidence: prediction.confidence,
      calibratedConfidence: prediction.calibratedConfidence,
      recommendations: prediction.recommendations,
      timing: prediction.timing,
    };
  } catch (error) {
    devLog.error('Error generating predictive analysis:', error);
    return null;
  }
}

function planetNameAndRow(
  chart: VedicChartPayload
): Array<{ name: string; row: Record<string, unknown> }> {
  const p = chart.planets;
  if (!p || typeof p !== 'object') return [];
  if (Array.isArray(p)) {
    return p
      .filter((x): x is Record<string, unknown> => x !== null && typeof x === 'object' && !Array.isArray(x))
      .map((row) => ({
        name: String(row.name ?? ''),
        row,
      }))
      .filter((x) => x.name !== '');
  }
  return Object.entries(p as Record<string, unknown>).map(([name, row]) => ({
    name,
    row: row !== null && typeof row === 'object' && !Array.isArray(row) ? (row as Record<string, unknown>) : {},
  }));
}

function extractChartReferences(
  answer: string,
  vedicChart: VedicChartPayload
): VedicSeerStoredPayload['chartReferences'] {
  const planets: string[] = [];
  const houses: number[] = [];
  const nakshatras: string[] = [];
  const dashas: string[] = [];
  const lower = answer.toLowerCase();

  for (const { name } of planetNameAndRow(vedicChart)) {
    if (name && lower.includes(name.toLowerCase())) {
      planets.push(name);
    }
  }

  for (let i = 1; i <= 12; i++) {
    if (
      answer.includes(`${i}th house`) ||
      answer.includes(`${i}st house`) ||
      answer.includes(`${i}nd house`) ||
      answer.includes(`${i}rd house`)
    ) {
      houses.push(i);
    }
  }

  for (const { row } of planetNameAndRow(vedicChart)) {
    const nk = row.nakshatra;
    if (typeof nk === 'string' && answer.includes(nk)) {
      nakshatras.push(nk);
    }
  }

  const cd = vedicChart.currentDasha;
  if (cd && typeof cd === 'object' && !Array.isArray(cd)) {
    const o = cd as Record<string, unknown>;
    const md = o.mahadasha ?? o.planet ?? o.name;
    if (typeof md === 'string' && answer.includes(md)) {
      dashas.push(md);
    }
  }

  return { planets, houses, nakshatras, dashas };
}

async function storeConversation(
  userId: string,
  sessionId: string | undefined,
  question: string,
  response: VedicSeerStoredPayload
) {
  try {
    const db = getFirebaseDB();
    const { doc, setDoc } = await import('firebase/firestore');
    const session = sessionId || `session_${Date.now()}`;
    const timestamp = Date.now();
    const messageId = `msg_${timestamp}`;
    const messageRef = doc(db, 'vedicSeerConversations', userId, 'sessions', session, 'messages', messageId);

    await setDoc(messageRef, {
      question,
      answer: response.answer,
      timestamp,
      confidence: response.confidence,
      chartReferences: response.chartReferences,
      remedies: response.remedies,
    });

    devLog.info('✅ Conversation stored successfully', undefined, 'vedic-seer');
  } catch (error) {
    devLog.error('Error storing conversation:', error);
  }
}
