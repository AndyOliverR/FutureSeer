/**
 * Question Decomposition Engine for Universal Ask the Seer.
 * Produces intent, scope, timeframe, risk_level, and domains_required (via jurisdiction matrix).
 */

import { getDomainsRequired } from './universalSeerJurisdiction';

export type DecomposedIntent =
  | 'decision'
  | 'identity'
  | 'purpose'
  | 'timing'
  | 'alignment'
  | 'confirmation'
  | 'family'
  | 'relocation'
  | 'truth-seeking'
  | 'remedies'
  | 'health'
  | 'world_events'
  | 'symbolic'
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

// Intent: keyword/regex rules (first match wins)
const INTENT_PATTERNS: Array<{ pattern: RegExp | ((q: string) => boolean); intent: DecomposedIntent }> = [
  { pattern: /\b(should i|shall i|ought i|whether to|decide|choice|choose|proceed|go ahead|take (this|that)|accept|reject)\b/i, intent: 'decision' },
  { pattern: /\b(which option|choose a|choose b|crossroads|better for me|safest decision|option a|option b)\b/i, intent: 'decision' },
  { pattern: /\b(family|children|property|ancestral|elders|tension at home|family conflict)\b/i, intent: 'family' },
  { pattern: /\b(foreign|visa|migration|country|abroad|settlement|relocate|relocation)\b/i, intent: 'relocation' },
  { pattern: /\b(accurate|predictions|different systems|reliable|intuition|truth|denying|avoiding)\b/i, intent: 'truth-seeking' },
  { pattern: /\b(life purpose|life path|dharma|why am i here|mission|soul purpose|what (should i )?focus on first|where to start)\b/i, intent: 'purpose' },
  { pattern: /\b(who am i|identity|soul|expression|name (vibration|meaning)|how (am i|do i) (seen|perceived)|personality|life path number)\b/i, intent: 'identity' },
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

/** Name-only questions: restrict to nameAnalysis only; no astrology/tarot unless explicitly requested. */
export function isNameAnalysisOnlyQuestion(query: string): boolean {
  const lower = (query || '').trim().toLowerCase();
  return (
    /\b(what does my name (say|reveal|tell)|analyze my (full )?name|what (does|about) my name)\b/i.test(lower) ||
    /\b(is my name lucky|should i change my name|full name analysis)\b/i.test(lower) ||
    /\b(name (vibration|meaning|say|reveal|tell))\b/i.test(lower)
  );
}

/** Lenormand-only: situational, yes/no, outcome. Exclude purpose/identity so "What is my life purpose?" does not trigger lenormand. */
export function isLenormandOnlyQuestion(query: string): boolean {
  const lower = (query || '').trim().toLowerCase();
  if (/\b(life purpose|life path|dharma|why am i here|mission|soul purpose|soul (lesson|path)|destiny|who am i|identity|personality)\b/i.test(lower)) {
    return false;
  }
  return (
    /\b(is this (deal|partnership|relationship) good for me|will this (relationship|deal|job) work|what is (happening|the outcome)|what should i expect|should i move forward|what is the outcome of this situation)\b/i.test(lower) ||
    /\b(will i get (this job|the job|it)|will (they|he|she) (call|reply|accept)|is (it|this) (likely|going to happen)|should i (expect|get))\b/i.test(lower) ||
    /\b(lenormand|(what do )?(the|these) cards (say|mean)|what does the spread say)\b/i.test(lower)
  );
}

/** True when query is a vague Lenormand request without a clear situation (e.g. "what do the cards say" with no "about this job"). */
export function isVagueLenormandQuery(query: string): boolean {
  const lower = (query || '').trim().toLowerCase();
  const looksLikeCards = /\b(what do (the|these) cards (say|mean)|what does the spread say|what do they mean)\b/i.test(lower);
  const hasSituation = /\b(about (this|the|my|our)|regarding|re:)\s+\w+/i.test(lower) ||
    /\b(this (job|deal|relationship|offer|situation)|the (job|deal|offer)|my (job|deal|relationship))\b/i.test(lower);
  return looksLikeCards && !hasSituation;
}

/** Vastu-only: spatial, corrective, "what should I change in my space?". Exclude purpose, timing, personality, marriage/career prediction. */
export function isVastuOnlyQuestion(query: string): boolean {
  const lower = (query || '').trim().toLowerCase();
  if (
    /\b(life purpose|when will|career success|marriage (prediction|time)|personality|predict (my|when)|destiny|dharma)\b/i.test(lower)
  ) {
    return false;
  }
  return (
    /\b(house|office|room (placement|place)|entrance (direction|facing|face)|bed (position|place)|desk (alignment|placement|place)|energy of (a )?space|relocation of furniture|business space (harmony)?|north-facing|south-facing|east-facing|west-facing|where (should i|to) (place|put|sleep)|vastu (compliant)?|prosperity in (my )?home|which direction (should i|to) (sleep|place)|(main )?entrance (faces?|facing)|improve (my )?(home|space)|is my house (good|vastu))\b/i.test(lower)
  );
}

/** True when query is vastu-related but lacks spatial context (no direction, no room/area). */
export function isVagueVastuQuery(query: string): boolean {
  const lower = (query || '').trim().toLowerCase();
  const looksLikeVastu =
    /\b(house|home|space|vastu|room|improve|prosperity|harmony|good|compliant)\b/i.test(lower) &&
    (/\b(is my (house|home) (good)?|how can i improve (my )?(space|home)|(is|does) (my )?(house|home))\b/i.test(lower) ||
      /\bimprove (prosperity|harmony)|space (good|harmony)\b/i.test(lower));
  const hasDirection = /\b(north|south|east|west|facing|direction|entrance (faces?|facing))\b/i.test(lower);
  const hasRoomOrArea = /\b(kitchen|bedroom|bed|desk|office|main door|living room|prayer room|room|area)\b/i.test(lower);
  return looksLikeVastu && !hasDirection && !hasRoomOrArea;
}

/** Human Design–only: identity/decision-mechanics (type, strategy, authority, energy). Exclude timing, prediction, remedies, vastu, name-only. */
export function isHumanDesignOnlyQuestion(query: string): boolean {
  const lower = (query || '').trim().toLowerCase();
  if (isNameAnalysisOnlyQuestion(query)) return false;
  if (
    /\b(when will|yes or no|will (i|this)|predict|remedy|remedies|vastu|house|desk|entrance (direction|facing))\b/i.test(lower)
  ) {
    return false;
  }
  return (
    /\b(human design|bodygraph|energy type|strategy|authority|profile|centers|gates|channels)\b/i.test(lower) ||
    /\b(how should i make decisions|what is my authority|why do i feel drained|how does my energy work)\b/i.test(lower) ||
    /\b(how should i approach (work|relationships)|decision mechanics|burnout|respond (vs |or )?initiate)\b/i.test(lower) ||
    /\b(drained around people|my (type|strategy|authority))\b/i.test(lower)
  );
}

/** True when question is Human Design but generic (could be full overview or authority-only). */
export function isGenericHumanDesignQuery(query: string): boolean {
  const lower = (query || '').trim().toLowerCase();
  if (!isHumanDesignOnlyQuestion(query)) return false;
  return (
    /\b(what is my human design|tell me about my design|what('s| is) my (type|human design)|human design (overview|summary|chart))\b/i.test(lower) ||
    /\b(what (am i|is my type)|my (design|chart))\b/i.test(lower)
  );
}

/** Geomancy-only: situational, outcome, proceed, influencing, hidden, figures. Exclude purpose, personality, remedies, timing. */
export function isGeomancyOnlyQuestion(query: string): boolean {
  const lower = (query || '').trim().toLowerCase();
  if (/\b(life purpose|personality|remedy|remedies|when will)\b/i.test(lower)) return false;
  return (
    /\b(what is happening in this situation|what is the outcome|should i proceed|what is influencing (this)?|what is hidden)\b/i.test(lower) ||
    /\b(what do the figures say|geomancy|geomantic|judge|figures)\b/i.test(lower) ||
    /\b(outcome of this (situation|deal|contract)|will this succeed)\b/i.test(lower)
  );
}

/** True when query is Geomancy-like but has no situation context (e.g. "What do the figures say?" without "about this job"). */
export function isVagueGeomancyQuery(query: string): boolean {
  const lower = (query || '').trim().toLowerCase();
  const looksLikeGeomancy =
    /\b(what do the figures say|what do (the|these) figures mean|geomancy|geomantic|judge|figures|what is the outcome)\b/i.test(lower);
  const hasSituation =
    /\b(about (this|the|my|our)|regarding|re:)\s+\w+/i.test(lower) ||
    /\b(this (job|deal|relationship|offer|situation|contract)|the (job|deal|offer|contract)|my (job|deal|relationship))\b/i.test(lower) ||
    /\b(should i (proceed|move forward)|outcome of this)\b/i.test(lower);
  return looksLikeGeomancy && !hasSituation;
}

/** Energy & Healing only: chakra, aura, reiki, crystal, balance, grounding. Exclude timing, destiny, karma, financial, yes/no, medical/diagnosis/cure. */
export function isEnergyHealingOnlyQuestion(query: string): boolean {
  const lower = (query || '').trim().toLowerCase();
  if (
    /\b(timing|when will|destiny|karma|financial|yes or no|will (i|this)|diagnosis|diagnose|cure|disease|illness|medication|treatment (for|of))\b/i.test(lower)
  ) {
    return false;
  }
  return (
    /\b(chakra|aura|reiki|crystal|energy (balance|flow|healing|center)|grounding|grounded)\b/i.test(lower) ||
    /\b(emotional imbalance|spiritual fatigue|energetic overwhelm|which chakra (is )?blocked|how is my aura)\b/i.test(lower) ||
    /\b(what healing practice suits me|energy level|feel heavy)\b/i.test(lower)
  );
}

/** True when query is energy-like but ambiguous (e.g. "How is my energy?" without physical/emotional/spiritual). */
export function isVagueEnergyQuery(query: string): boolean {
  const lower = (query || '').trim().toLowerCase();
  const looksLikeEnergy =
    /\b(how is my energy|my energy|energy level)\b/i.test(lower) &&
    !/\b(chakra|aura|grounding|physical vitality|emotional balance|spiritual energy)\b/i.test(lower);
  return looksLikeEnergy;
}

/** Akashic-only: soul lesson, pattern repeat, deeper meaning, Records say, soul theme. Exclude timing, yes/no, remedy-only, mundane. */
export function isAkashicOnlyQuestion(query: string): boolean {
  const lower = (query || '').trim().toLowerCase();
  if (
    /\b(when will|what date|yes or no|will (i|this)|which gemstone|remedies for|election|market|global)\b/i.test(lower)
  ) {
    return false;
  }
  return (
    /\b(soul lesson|(why does )?this pattern (keep )?(repeating|repeat)|deeper meaning|what am i here to learn|(what )?karmic theme (is )?active|(what do )?the Records say|akashic (records?)?|(what )?soul theme (is )?active|why does this keep happening)\b/i.test(lower)
  );
}

/** True when query is Akashic-like but has no area of life (e.g. "What do the Records say?" without relationship/career/purpose/health/family). */
export function isVagueAkashicQuery(query: string): boolean {
  const lower = (query || '').trim().toLowerCase();
  const looksLikeAkashic =
    /\b(what do the Records say|Records say|akashic|soul (lesson|theme)|pattern (keep )?repeat|deeper meaning|what am i here to learn|karmic theme)\b/i.test(lower);
  const hasAreaOfLife =
    /\b(about (my )?(relationship|career|purpose|health|family|life|work|love)|relationship|career|purpose|health|family|work|love|partners?|job)\b/i.test(lower);
  return looksLikeAkashic && !hasAreaOfLife;
}

/** Ogham-only: Celtic tree symbolism, natural force, growth stage, quality to cultivate. Exclude timing, yes/no, prediction. */
export function isOghamOnlyQuestion(query: string): boolean {
  const lower = (query || '').trim().toLowerCase();
  if (
    /\b(when will|yes or no|predict|outcome|guarantee)\b/i.test(lower)
  ) {
    return false;
  }
  return (
    /\b((what does )?the ogham say|ogham (tree|script|symbol)?|celtic tree (alphabet)?|(what )?natural force (is )?influencing|(what )?stage of (growth|life)|(what )?quality (should i )?cultivate|(what is )?blocking my growth|(what )?energy supports (me )?(right )?now|(how can i )?move forward wisely|(what does )?this situation (teach|teaching) me|tree (alphabet|symbolism))\b/i.test(lower)
  );
}

/** Sortilege-only: casting lots, cast result, directional guidance from cast. Exclude timing, dates, outcome guarantee. */
export function isSortilegeOnlyQuestion(query: string): boolean {
  const lower = (query || '').trim().toLowerCase();
  if (
    /\b(when will|give (me )?dates|predict (timeline|outcome)|guarantee)\b/i.test(lower)
  ) {
    return false;
  }
  return (
    /\b(sortilege|casting|drawing lots|cast (the )?dice|cast (the )?stones|cast (the )?cards|cast (the )?coins|cast (the )?sticks|(what does )?(my )?cast (say|reveal|show)|is this favorable|momentum present|resistance strong|directional guidance (from (my )?cast)?|(my )?cast (result|reading))\b/i.test(lower)
  );
}

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
  let intent = matchIntent(trimmed);
  const scope = matchScope(trimmed);
  const timeframe = matchTimeframe(trimmed);
  const risk_level = matchRiskLevel(trimmed);
  let domains_required = getDomainsRequired(intent, scope);
  if (isNameAnalysisOnlyQuestion(trimmed)) {
    domains_required = ['nameAnalysis'];
    intent = 'identity';
  } else if (isLenormandOnlyQuestion(trimmed)) {
    domains_required = ['lenormand'];
    intent = 'decision';
  } else if (isVastuOnlyQuestion(trimmed)) {
    domains_required = ['vastu'];
    intent = 'remedies';
  } else if (isHumanDesignOnlyQuestion(trimmed)) {
    domains_required = ['humanDesign'];
    intent = 'identity';
  } else if (isGeomancyOnlyQuestion(trimmed)) {
    domains_required = ['geomancy'];
    intent = 'decision';
  } else if (isEnergyHealingOnlyQuestion(trimmed)) {
    domains_required = ['energyHealing'];
    intent = 'health';
  } else if (isAkashicOnlyQuestion(trimmed)) {
    domains_required = ['akashicRecords'];
    intent = 'identity';
  } else if (isOghamOnlyQuestion(trimmed)) {
    domains_required = ['ogham'];
    intent = 'symbolic';
  } else if (isSortilegeOnlyQuestion(trimmed)) {
    domains_required = ['sortilege'];
    intent = 'decision';
  }
  return {
    intent,
    scope,
    timeframe,
    risk_level,
    domains_required,
  };
}
