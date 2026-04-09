import { NextRequest, NextResponse } from 'next/server';
import { appendAttribution } from '@/lib/attribution/attributionStamp';
import { devLog } from '@/lib/devLogger';
import { pendulumIntelligence } from '@/lib/pendulumIntelligence';
import {
  classifyPendulumQuestion,
  sanitizePendulumQuestion,
  buildPendulumState,
  formatPendulumResponse,
  PENDULUM_REFUSAL_PHRASE,
  PENDULUM_DEPENDENCY_PHRASE,
} from '@/lib/pendulumSeerState';

const X_ROBOTS_TAG = 'noindex, nofollow, noarchive, nosnippet';
const SEER_MARKER_FAMILY = 'ask-pendulum-seer';

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

function normalizeForDependencyCheck(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ');
}

function isSameOrSimilarQuestion(
  current: string,
  recent: string[],
  threshold = 0.85
): boolean {
  const norm = normalizeForDependencyCheck(current);
  if (!norm) return false;
  for (const r of recent) {
    const rn = normalizeForDependencyCheck(r);
    if (!rn) continue;
    if (norm === rn) return true;
    const longer = norm.length >= rn.length ? norm : rn;
    const shorter = norm.length < rn.length ? norm : rn;
    if (longer.includes(shorter) && shorter.length >= 8) return true;
    const words = new Set(norm.split(' ').filter(Boolean));
    const rWords = new Set(rn.split(' ').filter(Boolean));
    const overlap = [...words].filter((w) => rWords.has(w)).length;
    const union = new Set([...words, ...rWords]).size;
    if (union > 0 && overlap / union >= threshold) return true;
  }
  return false;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      question,
      pendulumAnalysis,
      conversationHistory,
    } = body;

    if (!question || typeof question !== 'string') {
      return jsonWithRobots(
        { success: false, error: 'Question is required' },
        { status: 400 }
      );
    }

    const trimmed = question.trim();
    if (!trimmed) {
      return jsonWithRobots(
        { success: false, error: 'Question is required' },
        { status: 400 }
      );
    }

    const questionType = classifyPendulumQuestion(trimmed);
    if (questionType === 'refusal') {
      return jsonWithRobots({
        response: PENDULUM_REFUSAL_PHRASE,
        refused: true,
        confidence: 0,
        timestamp: new Date().toISOString(),
      });
    }

    const history = Array.isArray(conversationHistory) ? conversationHistory : [];
    const recentUserQuestions = history
      .filter((h: { type?: string; content?: string }) => h.type === 'user' && h.content)
      .map((h: { content: string }) => h.content)
      .slice(-10);
    if (recentUserQuestions.length > 0 && isSameOrSimilarQuestion(trimmed, recentUserQuestions)) {
      return jsonWithRobots({
        response: PENDULUM_DEPENDENCY_PHRASE,
        refused: true,
        confidence: 0,
        timestamp: new Date().toISOString(),
      });
    }

    const sanitizedQuestion = sanitizePendulumQuestion(trimmed);

    let analysis: { question: string; answer: 'yes' | 'no' | 'maybe'; confidence: number; swingDirection?: string };
    const priorQuestion =
      pendulumAnalysis?.question && typeof pendulumAnalysis.question === 'string'
        ? pendulumAnalysis.question.trim()
        : '';
    const canUsePrior =
      pendulumAnalysis &&
      typeof pendulumAnalysis.answer === 'string' &&
      ['yes', 'no', 'maybe'].includes(pendulumAnalysis.answer) &&
      typeof pendulumAnalysis.confidence === 'number' &&
      priorQuestion &&
      isSameOrSimilarQuestion(sanitizedQuestion, [priorQuestion], 0.7);

    if (canUsePrior) {
      analysis = {
        question: sanitizedQuestion,
        answer: pendulumAnalysis.answer as 'yes' | 'no' | 'maybe',
        confidence: pendulumAnalysis.confidence,
        swingDirection: pendulumAnalysis.swingDirection,
      };
    } else {
      const result = await pendulumIntelligence.answerQuestion(sanitizedQuestion);
      analysis = {
        question: sanitizedQuestion,
        answer: result.answer,
        confidence: result.confidence,
        swingDirection: result.swingDirection,
      };
    }

    const state = buildPendulumState(analysis);
    const response = formatPendulumResponse(state);

    return jsonWithRobots({
      response,
      confidence: analysis.confidence,
      refused: false,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    devLog.error('Ask Pendulum Seer API error:', error, 'route');
    return jsonWithRobots(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'An error occurred processing your request.',
      },
      { status: 500 }
    );
  }
}
