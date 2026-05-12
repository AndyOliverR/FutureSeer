/**
 * Privacy-safe signals for Markov / predictive layers.
 * No raw PII — only coarse themes, tool slugs, and session context tokens.
 */

import { getUserActivity, type UserActivityItem } from '@/lib/firebase';

export interface MarkovBehaviorContext {
  userId: string;
  question: string;
  questionType: string;
  /** Recent user↔seer exchanges from conversational memory (optional). */
  recentExchanges?: Array<{ question: string; answer?: string }>;
}

const MAX_ACTIVITY = 8;

/** Map free text + question type into non-identifying behavior tokens for LifePathMarkovChain. */
export async function buildMarkovUserBehaviorSignals(
  ctx: MarkovBehaviorContext
): Promise<string[]> {
  const tokens: string[] = [];

  const qt = String(ctx.questionType || 'general').toLowerCase();
  tokens.push(`theme:${qt}`);

  const q = ctx.question.slice(0, 400).toLowerCase();
  if (/\b(career|job|work|promotion|business)\b/.test(q)) tokens.push('focus:career');
  if (/\b(love|marriage|relationship|partner|spouse)\b/.test(q)) tokens.push('focus:relationship');
  if (/\b(spiritual|meditation|dharma|karma|remedy)\b/.test(q)) tokens.push('focus:spiritual');
  if (/\b(health|illness|body|medical)\b/.test(q)) tokens.push('focus:health');
  if (/\b(wealth|money|finance|property)\b/.test(q)) tokens.push('focus:wealth');
  if (/\b(when|timing|dasha|period|month|year)\b/.test(q)) tokens.push('focus:timing');

  if (ctx.recentExchanges?.length) {
    const topics = ctx.recentExchanges
      .slice(-5)
      .map((e) => e.question.slice(0, 120).toLowerCase())
      .join(' ');
    if (topics.includes('career') || topics.includes('work')) tokens.push('session:career_thread');
    if (topics.includes('marriage') || topics.includes('love')) tokens.push('session:relationship_thread');
    if (topics.includes('spiritual') || topics.includes('dasha')) tokens.push('session:spiritual_thread');
  }

  try {
    const acts: UserActivityItem[] = await getUserActivity(ctx.userId, MAX_ACTIVITY);
    const slugs = new Set<string>();
    for (const a of acts) {
      const slug =
        (typeof a.toolSlug === 'string' && a.toolSlug) ||
        (typeof a.type === 'string' && a.type.startsWith('tool:') ? a.type.replace(/^tool:/, '') : '');
      if (slug) slugs.add(slug.replace(/[^a-z0-9_-]/gi, '').slice(0, 48));
    }
    slugs.forEach((s) => tokens.push(`recent_tool:${s}`));
  } catch {
    /* Firestore optional; prediction still works */
  }

  return [...new Set(tokens)];
}

import type { CalibratedConfidence, EvidenceLevel } from '@/lib/predictiveAlgorithms';

const LEVEL_LABELS: Record<CalibratedConfidence['level'], string> = {
  low: 'LOW',
  moderate: 'MODERATE',
  high: 'HIGH',
  very_high: 'VERY HIGH',
};

const EVIDENCE_STRENGTH_PREFIX: Record<EvidenceLevel, string> = {
  strong: 'Strong',
  moderate: 'Moderate',
  weak: 'Weak',
  neutral: 'Neutral',
};

/** Short prose for the Vedic Seer system prompt — dasha/chart remain authoritative. */
export function formatPredictiveHintForVedicPrompt(predictive: {
  combinedPrediction?: string;
  confidence?: number;
  calibratedConfidence?: CalibratedConfidence;
  timing?: string;
  recommendations?: string[];
} | null): string | undefined {
  if (!predictive) return undefined;
  const parts: string[] = [];
  if (predictive.combinedPrediction) {
    parts.push(`Life-phase orientation (supporting, not overriding dasha): ${predictive.combinedPrediction}`);
  }

  const cal = predictive.calibratedConfidence;
  if (cal) {
    parts.push(`Confidence: ${LEVEL_LABELS[cal.level]} (${cal.evidenceCount} evidence source${cal.evidenceCount !== 1 ? 's' : ''}, strongest: ${cal.strongestEvidence})`);

    if (cal.evidenceSummary.length > 0) {
      parts.push('Evidence summary:');
      for (const e of cal.evidenceSummary.slice(0, 5)) {
        const prefix = EVIDENCE_STRENGTH_PREFIX[e.level] || 'Neutral';
        parts.push(`  - ${prefix}: ${e.label} -- likelihood ratio ${e.ratio.toFixed(1)}:1`);
      }
    }

    if (cal.convergent) {
      parts.push('Markov + Bayesian convergent: Yes (both models point to the same outcome)');
    }

    parts.push('When explaining confidence to the user, cite the strongest evidence source specifically.');
  } else if (typeof predictive.confidence === 'number') {
    parts.push(`Model confidence (probabilistic layer): ${Math.round(Math.min(1, Math.max(0, predictive.confidence)) * 100)}%`);
  }

  if (predictive.timing) {
    parts.push(`Suggested framing for timing language: ${predictive.timing}`);
  }
  if (predictive.recommendations?.length) {
    parts.push(`User-resonant angles: ${predictive.recommendations.slice(0, 3).join(' · ')}`);
  }
  if (parts.length === 0) return undefined;
  return parts.join('\n');
}
