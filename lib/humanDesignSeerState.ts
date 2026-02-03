/**
 * Human Design Seer State and Slice.
 * Rule: Human Design governs decision mechanics, not destiny.
 * Mechanical, deterministic bodygraph system — Type, Strategy, Authority hierarchy.
 */

export interface HumanDesignState {
  type: string;
  strategy: string;
  authority: string;
  definition: string;
  profile: string;
  defined_centers: string[];
  undefined_centers: string[];
}

export type HumanDesignQuestionType =
  | 'decision_mechanics'
  | 'energy_drain'
  | 'work_style'
  | 'resistance'
  | 'general'
  | 'refusal';

/** Refusal phrase for missing chart data. */
export const HUMAN_DESIGN_REFUSAL_DATA_PHRASE =
  'Human Design requires your chart. Generate your Human Design report first.';

/** Refusal phrase for outcome/timing questions. */
export const HUMAN_DESIGN_REFUSAL_OUTCOME_PHRASE =
  'Human Design explains decision mechanics, not outcomes.';

/** Map center id to display name */
const CENTER_ID_TO_NAME: Record<string, string> = {
  head: 'Head',
  ajna: 'Ajna',
  throat: 'Throat',
  g: 'G',
  heart: 'Heart',
  solar_plexus: 'Solar Plexus',
  sacral: 'Sacral',
  root: 'Root',
  spleen: 'Spleen',
};

function mapCenterIdsToNames(ids: string[]): string[] {
  return ids.map((id) => CENTER_ID_TO_NAME[id] ?? id.charAt(0).toUpperCase() + id.slice(1));
}

/**
 * Build HumanDesignState from HumanDesignChart.
 * Requires chart.type, chart.authority, chart.strategy.
 */
export function buildHumanDesignState(chart: any): HumanDesignState {
  if (!chart) {
    throw new Error(HUMAN_DESIGN_REFUSAL_DATA_PHRASE);
  }

  const typeObj = chart.type;
  const authorityObj = chart.authority;
  const strategyVal = chart.strategy ?? typeObj?.strategy;

  if (!typeObj || !authorityObj || !strategyVal) {
    throw new Error(HUMAN_DESIGN_REFUSAL_DATA_PHRASE);
  }

  const typeId = (typeObj.id ?? typeObj.name ?? '').toString().toLowerCase().replace(/\s+/g, '_');
  const authorityId = (authorityObj.id ?? authorityObj.name ?? '')
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z_]/g, '');

  const centers = chart.centers ?? {};
  const definedRaw = Array.isArray(centers.defined) ? centers.defined : [];
  const undefinedRaw = Array.isArray(centers.undefined) ? centers.undefined : [];

  const profileObj = chart.profile;
  const profileId = profileObj?.id ?? profileObj?.name ?? '';
  const profileStr = typeof profileId === 'string' ? profileId : '';

  const defObj = chart.definition;
  const defType = defObj?.type ?? 'single';

  return {
    type: typeId || 'unknown',
    strategy: typeof strategyVal === 'string' ? strategyVal : String(strategyVal),
    authority: authorityId || 'unknown',
    definition: defType,
    profile: profileStr || 'unknown',
    defined_centers: mapCenterIdsToNames(definedRaw),
    undefined_centers: mapCenterIdsToNames(undefinedRaw),
  };
}

/**
 * Classify Human Design question.
 * Refuse: outcome prediction, timing, future, luck.
 * Valid: decision mechanics, energy drain, work style, resistance, type, strategy, authority.
 */
export function classifyHumanDesignQuestion(question: string): HumanDesignQuestionType {
  const lower = question.toLowerCase().trim();

  // Refusal patterns
  if (
    /\b(will this (succeed|work|fail)|when will (it|this) happen|is this lucky|what is my future|predict|guarantee|definitely (bring|get|happen)|will I (get|find|meet)|outcome|result)\b/.test(
      lower
    )
  ) {
    return 'refusal';
  }
  if (/\b(timing|when exactly|date|deadline)\b/.test(lower)) {
    return 'refusal';
  }
  if (/\b(motivation|manifest|purpose|destiny|fate)\b/.test(lower) && /\b(will|when|predict)\b/.test(lower)) {
    return 'refusal';
  }

  // Valid question types
  if (
    /\b(how (should|do) I (make|decide)|decision|decide|deciding)\b/.test(lower) ||
    /\b(what (is|should) my (strategy|authority))\b/.test(lower)
  ) {
    return 'decision_mechanics';
  }
  if (
    /\b(why (does this|do I) feel (draining|drained)|draining|exhausted|tired|burnout)\b/.test(lower) ||
    /\b(energy (drain|management))\b/.test(lower)
  ) {
    return 'energy_drain';
  }
  if (
    /\b(work style|working style|how (should|do) I work|career (style|approach)|job (fit|style))\b/.test(lower)
  ) {
    return 'work_style';
  }
  if (
    /\b(resistance|why (am I|do I) face resistance|stuck|blocked|forcing)\b/.test(lower) ||
    /\b(initiat(e|ing)|wait|respond|invitation)\b/.test(lower)
  ) {
    return 'resistance';
  }

  // General Human Design questions
  if (
    /\b(human design|bodygraph|energy type|type|strategy|authority|profile|centers?|gates?|channels?)\b/.test(
      lower
    )
  ) {
    return 'general';
  }

  return 'general';
}

/**
 * Build system prompt slice for Human Design.
 * Enforces Type → Strategy → Authority hierarchy. Never bypass authority.
 */
export function getHumanDesignSliceForQuestionType(
  questionType: HumanDesignQuestionType,
  state: HumanDesignState
): string {
  if (questionType === 'refusal') {
    return `Refuse with: "${HUMAN_DESIGN_REFUSAL_OUTCOME_PHRASE}" or "Human Design does not predict outcomes or timing." Do not guarantee results, predict timing, or promise outcomes. Human Design explains decision mechanics; it does not alter destiny.`;
  }

  const stateBlock = `
HUMAN DESIGN STATE (use this only):
- Type: ${state.type}
- Strategy: ${state.strategy}
- Authority: ${state.authority}
- Definition: ${state.definition}
- Profile: ${state.profile}
- Defined centers: ${state.defined_centers.join(', ') || 'none'}
- Undefined centers: ${state.undefined_centers.join(', ') || 'none'}
`.trim();

  const typeBlock = `
TYPE LOGIC (always state Type first):
- Manifestor: initiate carefully; waiting = stagnation.
- Generator / Manifesting Generator: respond, not force; forcing = resistance.
- Projector: wait for recognition; initiating = burnout.
- Reflector: sample over time; rushing = misalignment.
Any advice violating Type is invalid.
`.trim();

  const strategyBlock = `
STRATEGY ENFORCEMENT (non-negotiable):
Strategy defines correct engagement.
- Generator forcing = resistance
- Projector initiating = burnout
- Manifestor waiting = stagnation
- Reflector rushing = misalignment
Always say explicitly: "Your strategy here is…"
`.trim();

  const authorityBlock = `
AUTHORITY LOGIC (decision engine — never override with logic):
Authority determines HOW decisions are made.
- Sacral: gut response ("uh-huh" / "uh-uh")
- Emotional: wait for clarity; ride the emotional wave
- Splenic: immediate instinct
- Ego: willpower alignment
- Self-Projected: verbal clarity; speak to know
- Lunar / Environmental (Reflector): sample over time
Never override authority with logic. Frame as: "As a [Authority] authority, clarity comes from…"
`.trim();

  const centersBlock = `
DEFINED vs UNDEFINED CENTERS (energy management):
- Defined centers = consistent energy
- Undefined centers = amplification + conditioning
Frame as: "This feels intense because this center is undefined."
No pathology language.
`.trim();

  const profileBlock = `
PROFILE (behavioral lens, not fate):
Profile explains HOW (learning style, interaction pattern), not WHAT.
No ranking of profiles.
`.trim();

  const framingBlock = `
ANSWER FRAMING:
- Mechanical, grounded. Example: "As a Sacral authority, clarity comes from response, not planning. Acting now without a response may create resistance."
- Never say: "This aligns with your purpose" or motivational fluff.
- Allowed: how to decide, how to engage, why resistance appears, how to conserve energy.
- Never allowed: predicting success, timing events, motivational promises.
`.trim();

  const permanentRule = `
PERMANENT RULE:
Human Design governs decision mechanics, not destiny.
`.trim();

  return `${stateBlock}

${typeBlock}

${strategyBlock}

${authorityBlock}

${centersBlock}

${profileBlock}

${framingBlock}

${permanentRule}`;
}
