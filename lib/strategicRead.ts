import type { ComprehensiveMysticalProfile } from '@/contexts/MysticalProfileContext';
import { buildDailyInsightCardData } from '@/lib/dailyInsightForHome';
import type { ActionBand } from '@/lib/dailyDecisionBands';
import { actionBandLabel } from '@/lib/dailyDecisionBands';

export type StrategicSignal = {
  id: string;
  label: string;
  source: string;
};

export type StrategicReadData = {
  headline: string;
  signals: StrategicSignal[];
  patternTitle: string;
  patternSummary: string;
  actionBand: ActionBand;
  actionBandLabel: string;
  scenarioPrompts: [string, string];
  ctaHref: string;
  ctaLabel: string;
};

const MALEFIC_DASHA = new Set(['Sun', 'Mars', 'Saturn', 'Rahu', 'Ketu']);

const THEME_KEYWORDS: Record<string, RegExp> = {
  career: /\b(career|work|profession|business|purpose|dharma|success)\b/i,
  relationship: /\b(relationship|love|marriage|partner|family|harmony|venus)\b/i,
  inner: /\b(intuition|emotion|moon|spirit|inner|healing|mind)\b/i,
  timing: /\b(timing|window|dasha|transit|period|phase|momentum)\b/i,
};

function extractMoonSign(profile: ComprehensiveMysticalProfile | null): string | null {
  if (!profile) return null;
  const planets = profile.vedic?.planets;
  if (Array.isArray(planets)) {
    for (const p of planets) {
      const rec = p as Record<string, unknown>;
      const name = String(rec.name ?? rec.planet ?? '').toLowerCase();
      if (name === 'moon' && rec.sign) return String(rec.sign);
    }
  }
  const western = profile.western as { moonSign?: string } | undefined;
  if (western?.moonSign) return western.moonSign;
  return null;
}

function clip(text: string, max: number): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

function collectSignals(
  profile: ComprehensiveMysticalProfile | null,
  now: Date,
): StrategicSignal[] {
  const signals: StrategicSignal[] = [];
  const daily = buildDailyInsightCardData(profile, null, now);

  signals.push({
    id: 'day-ruler',
    label: `${daily.rulingPlanet} rules today — ${daily.accentLabel.toLowerCase()}`,
    source: 'Calendar',
  });

  const moonSign = extractMoonSign(profile);
  if (moonSign) {
    signals.push({
      id: 'moon-sign',
      label: `Moon in ${moonSign} colors emotional tone`,
      source: 'Vedic chart',
    });
  }

  if (!profile) return signals;

  const dashaPlanet = profile.vedic?.currentDasha?.planet;
  if (typeof dashaPlanet === 'string' && dashaPlanet.trim()) {
    signals.push({
      id: 'dasha',
      label: `Current dasha highlights ${dashaPlanet.trim()}`,
      source: 'Vedic timing',
    });
  }

  const careerLine =
    profile.interpretations?.career?.overview ||
    profile.interpretations?.career?.timing ||
    profile.interpretations?.career?.successFactors?.[0];
  if (typeof careerLine === 'string' && careerLine.trim()) {
    signals.push({
      id: 'career',
      label: clip(careerLine, 72),
      source: 'Career themes',
    });
  }

  const relationshipLine =
    profile.interpretations?.relationships?.overview ||
    profile.interpretations?.relationships?.compatibility;
  if (typeof relationshipLine === 'string' && relationshipLine.trim()) {
    signals.push({
      id: 'relationship',
      label: clip(relationshipLine, 72),
      source: 'Relationship themes',
    });
  }

  const timingLine =
    profile.interpretations?.dasha?.timing ||
    profile.interpretations?.dasha?.overview;
  if (typeof timingLine === 'string' && timingLine.trim()) {
    signals.push({
      id: 'timing',
      label: clip(timingLine, 72),
      source: 'Timing',
    });
  }

  const strength = profile.interpretations?.personality?.strengths?.[0];
  if (typeof strength === 'string' && strength.trim()) {
    signals.push({
      id: 'strength',
      label: clip(strength, 72),
      source: 'Core strength',
    });
  }

  return signals.slice(0, 5);
}

function scoreThemes(signals: StrategicSignal[]): Record<string, number> {
  const scores: Record<string, number> = {
    career: 0,
    relationship: 0,
    inner: 0,
    timing: 0,
  };
  for (const signal of signals) {
    const blob = `${signal.label} ${signal.source}`;
    for (const [theme, re] of Object.entries(THEME_KEYWORDS)) {
      if (re.test(blob)) scores[theme] += 1;
    }
  }
  return scores;
}

const PATTERN_COPY: Record<string, { title: string; summary: string }> = {
  career: {
    title: 'Career momentum forming',
    summary: 'Chart clues point toward work, craft, and visible progress — align one concrete task with that thread.',
  },
  relationship: {
    title: 'Relationship field active',
    summary: 'Emotional and relational themes are surfacing — listen before you negotiate or commit.',
  },
  inner: {
    title: 'Inner rhythm first',
    summary: 'Subtle emotional and spiritual signals want attention before outward pushes.',
  },
  timing: {
    title: 'Timing window in focus',
    summary: 'Cycles and windows matter more than speed — match action to the phase you are in.',
  },
  mixed: {
    title: 'Cross-currents this week',
    summary: 'Several themes are active at once — prioritize one lane instead of forcing everything forward.',
  },
  guest: {
    title: 'Scan your environment',
    summary: 'Complete your profile for chart-grounded signals; until then, notice one quiet clue you keep dismissing.',
  },
};

function resolvePattern(signals: StrategicSignal[], hasProfile: boolean): { title: string; summary: string } {
  if (!hasProfile) return PATTERN_COPY.guest;
  const scores = scoreThemes(signals);
  const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const top = ranked[0];
  const second = ranked[1];
  if (!top || top[1] === 0) return PATTERN_COPY.mixed;
  if (second && second[1] === top[1] && top[1] > 0) return PATTERN_COPY.mixed;
  return PATTERN_COPY[top[0]] ?? PATTERN_COPY.mixed;
}

function resolveActionBand(
  profile: ComprehensiveMysticalProfile | null,
  patternKey: string,
): ActionBand {
  if (!profile?.metadata?.generatedAt) return 'neutral';
  const dashaPlanet = profile.vedic?.currentDasha?.planet;
  const dashaHeavy = typeof dashaPlanet === 'string' && MALEFIC_DASHA.has(dashaPlanet);
  const challengeCount = profile.interpretations?.personality?.challenges?.length ?? 0;

  if (patternKey === 'timing' && !dashaHeavy) return 'favorable';
  if (patternKey === 'career' && !dashaHeavy) return 'favorable';
  if (dashaHeavy && challengeCount >= 2) return 'observe';
  if (dashaHeavy) return 'neutral';
  return 'neutral';
}

function scenarioPrompts(band: ActionBand, patternTitle: string): [string, string] {
  if (band === 'favorable') {
    return [
      `If "${patternTitle}" is your best case, what is the smallest step you can take in the next 48 hours?`,
      'What would you stop doing to make room for that step?',
    ];
  }
  if (band === 'observe') {
    return [
      `If "${patternTitle}" is asking you to wait, what are you being pushed to notice instead?`,
      'What would a low-risk experiment look like before you commit?',
    ];
  }
  return [
    `Where does "${patternTitle}" show up in one conversation or habit this week?`,
    'What is one adjustment that reduces friction without forcing an outcome?',
  ];
}

export function buildStrategicReadData(
  profile: ComprehensiveMysticalProfile | null,
  displayName?: string | null,
  now: Date = new Date(),
): StrategicReadData {
  const hasProfile = Boolean(profile?.metadata?.generatedAt);
  const signals = collectSignals(profile, now);
  const pattern = resolvePattern(signals, hasProfile);
  const patternKey =
    Object.entries(PATTERN_COPY).find(([, v]) => v.title === pattern.title)?.[0] ?? 'mixed';
  const actionBand = resolveActionBand(profile, patternKey);
  const firstName = displayName?.trim().split(/\s+/)[0];
  const headline = firstName ? `Strategic read for ${firstName}` : 'Your strategic read';

  return {
    headline,
    signals,
    patternTitle: pattern.title,
    patternSummary: pattern.summary,
    actionBand,
    actionBandLabel: actionBandLabel(actionBand),
    scenarioPrompts: scenarioPrompts(actionBand, pattern.title),
    ctaHref: hasProfile ? '/seer' : '/profile',
    ctaLabel: hasProfile ? 'Ask the Seer' : 'Complete your profile',
  };
}
