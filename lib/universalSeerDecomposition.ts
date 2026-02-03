/**
 * Question Decomposition Engine for Universal Ask the Seer.
 * Produces intent, scope, timeframe, risk_level, and domains_required (via jurisdiction matrix).
 */

import { getDomainsRequired } from './universalSeerJurisdiction';

export type DecomposedIntent =
  | 'decision'
  | 'identity'
  | 'timing'
  | 'alignment'
  | 'confirmation'
  | 'general';

export type DecomposedScope = 'personal' | 'situational' | 'collective';

export type DecomposedTimeframe = 'now' | 'short-term' | 'long-term' | 'timeless';

export type DecomposedRiskLevel = 'low' | 'medium' | 'high';

export interface DecomposedQuery {
  intent: DecomposedIntent;
  scope: DecomposedScope;
  timeframe: DecomposedTimeframe;
  risk_level: DecomposedRiskLevel;
  domains_required: string[];
}

// Intent: keyword/regex rules
const INTENT_PATTERNS: Array<{ pattern: RegExp | ((q: string) => boolean); intent: DecomposedIntent }> = [
  { pattern: /\b(should i|shall i|ought i|whether to|decide|choice|choose|proceed|go ahead|take (this|that)|accept|reject)\b/i, intent: 'decision' },
  { pattern: /\b(who am i|identity|purpose|soul|expression|name (vibration|meaning)|how (am i|do i) (seen|perceived)|personality|life path number)\b/i, intent: 'identity' },
  { pattern: /\b(when|timing|date|time|period|dasha|transit|auspicious|inauspicious|best time|window|year|month)\b/i, intent: 'timing' },
  { pattern: /\b(aligned|alignment|supported|confirm|compatible|harmony|direction|proceed|yes or no)\b/i, intent: 'alignment' },
  { pattern: /\b(confirm|confirmation|is this (right|correct|aligned)|should i proceed)\b/i, intent: 'confirmation' },
];

// Scope
const SCOPE_PATTERNS: Array<{ pattern: RegExp | ((q: string) => boolean); scope: DecomposedScope }> = [
  { pattern: /\b(my |me |i |myself)\b/i, scope: 'personal' },
  { pattern: /\b(situation|current|right now|this (moment|phase)|what('s| is) happening)\b/i, scope: 'situational' },
  { pattern: /\b(world|collective|society|market|global)\b/i, scope: 'collective' },
];

// Timeframe
const TIMEFRAME_PATTERNS: Array<{ pattern: RegExp | ((q: string) => boolean); timeframe: DecomposedTimeframe }> = [
  { pattern: /\b(now|today|immediate|asap|urgent|right now)\b/i, timeframe: 'now' },
  { pattern: /\b(this week|this month|soon|next (week|month)|few (days|weeks)|short term)\b/i, timeframe: 'short-term' },
  { pattern: /\b(next year|long term|future|years ahead|life (path|purpose))\b/i, timeframe: 'long-term' },
  { pattern: /\b(always|ever|in general|timeless|nature)\b/i, timeframe: 'timeless' },
];

// Risk level (for disclaimer / tone)
const RISK_PATTERNS: Array<{ pattern: RegExp | ((q: string) => boolean); risk: DecomposedRiskLevel }> = [
  { pattern: /\b(health|medical|disease|illness|treatment|surgery)\b/i, risk: 'high' },
  { pattern: /\b(money|financial|investment|loan|legal|marriage|divorce)\b/i, risk: 'medium' },
];

function matchIntent(query: string): DecomposedIntent {
  const lower = query.toLowerCase();
  for (const { pattern, intent } of INTENT_PATTERNS) {
    const matched = typeof pattern === 'function' ? pattern(lower) : pattern.test(lower);
    if (matched) return intent;
  }
  return 'general';
}

function matchScope(query: string): DecomposedScope {
  const lower = query.toLowerCase();
  for (const { pattern, scope } of SCOPE_PATTERNS) {
    const matched = typeof pattern === 'function' ? pattern(lower) : pattern.test(lower);
    if (matched) return scope;
  }
  return 'personal';
}

function matchTimeframe(query: string): DecomposedTimeframe {
  const lower = query.toLowerCase();
  for (const { pattern, timeframe } of TIMEFRAME_PATTERNS) {
    const matched = typeof pattern === 'function' ? pattern(lower) : pattern.test(lower);
    if (matched) return timeframe;
  }
  return 'timeless';
}

function matchRiskLevel(query: string): DecomposedRiskLevel {
  const lower = query.toLowerCase();
  for (const { pattern, risk } of RISK_PATTERNS) {
    const matched = typeof pattern === 'function' ? pattern(lower) : pattern.test(lower);
    if (matched) return risk;
  }
  return 'low';
}

/**
 * Decomposes a user query into intent, scope, timeframe, risk_level, and domains_required.
 * domains_required is derived from the jurisdiction matrix (getDomainsRequired).
 */
export function decomposeQuery(query: string): DecomposedQuery {
  const trimmed = (query || '').trim();
  const intent = matchIntent(trimmed);
  const scope = matchScope(trimmed);
  const timeframe = matchTimeframe(trimmed);
  const risk_level = matchRiskLevel(trimmed);
  const domains_required = getDomainsRequired(intent, scope);
  return {
    intent,
    scope,
    timeframe,
    risk_level,
    domains_required,
  };
}
