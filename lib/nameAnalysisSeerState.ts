/**
 * Name Analysis Seer State and Slice.
 * Rule: Name Analysis evaluates expression and reception, not life outcomes.
 * A name shapes expression and perception, not destiny.
 */

export type AlignmentStatus = 'generally_supportive' | 'partial_support' | 'friction';

export interface NameState {
  full_name: string;
  name_type: string;
  name_vibration: number;
  root_number: number;
  expression_traits: string[];
  dominant_energy: string;
  conflict_energy: string;
  alignment_status: AlignmentStatus;
}

export type NameQuestionType =
  | 'perception'
  | 'career_support'
  | 'personality_alignment'
  | 'adjustment'
  | 'general'
  | 'refusal';

/** Payload: analysis from nameAnalysisIntelligence (fullName, nameVibration, lifePathNumber, personality, dominantElement, nameHarmony, etc.). */
export interface NameAnalysisPayload {
  fullName?: string;
  nameVibration?: number;
  lifePathNumber?: number;
  destinyNumber?: number;
  soulNumber?: number;
  personalityNumber?: number;
  nameHarmony?: number;
  nameBalance?: number;
  dominantElement?: string;
  personality?: {
    strengths?: string[];
    challenges?: string[];
  };
  missingElements?: string[];
}

const ROOT_TO_PLANET: Record<number, string> = {
  1: 'Sun',
  2: 'Moon',
  3: 'Jupiter',
  4: 'Uranus',
  5: 'Mercury',
  6: 'Venus',
  7: 'Neptune',
  8: 'Saturn',
  9: 'Mars',
  11: 'Moon',
  22: 'Uranus',
  33: 'Jupiter',
};

function reduceToSingleDigit(n: number): number {
  if (n <= 0) return 1;
  while (n > 9 && ![11, 22, 33].includes(n)) {
    n = String(n).split('').reduce((s, d) => s + parseInt(d, 10), 0);
  }
  return n > 9 ? reduceToSingleDigit(n) : n;
}

/**
 * Build NameState from analysis payload. Requires fullName and nameVibration or lifePathNumber.
 */
export function buildNameState(payload: NameAnalysisPayload): NameState {
  const full_name = payload.fullName ?? '';
  const name_vibration = payload.nameVibration ?? 0;
  const root_number = payload.lifePathNumber ?? (name_vibration > 0 ? reduceToSingleDigit(name_vibration) : (full_name ? 1 : 0));
  if (!full_name || root_number === 0) {
    throw new Error(
      'Name Analysis requires name data. Generate your name analysis first to use Ask the Seer.'
    );
  }
  const expression_traits = payload.personality?.strengths?.slice(0, 5) ?? [];
  const dominant_energy = ROOT_TO_PLANET[root_number] ?? 'Neptune';
  const challenges = payload.personality?.challenges ?? [];
  const conflict_energy = root_number === 6 ? 'Saturn' : root_number === 8 ? 'Venus' : root_number === 4 ? 'Uranus' : 'Saturn';
  const harmony = payload.nameHarmony ?? payload.nameBalance ?? 0;
  let alignment_status: AlignmentStatus = 'partial_support';
  if (harmony >= 70) alignment_status = 'generally_supportive';
  else if (harmony < 50) alignment_status = 'friction';

  return {
    full_name,
    name_type: 'public_use',
    name_vibration: name_vibration || root_number,
    root_number,
    expression_traits,
    dominant_energy,
    conflict_energy,
    alignment_status,
  };
}

/**
 * Classify Name Analysis question. Refusal: outcome guarantees, timing, forced name change. Valid: perception, career support, personality alignment, adjustment, general.
 */
export function classifyNameQuestion(question: string): NameQuestionType {
  const lower = question.toLowerCase().trim();

  if (
    /\b(will this name make me (successful|rich|famous)|will changing my name change my fate|when will (results|success) come|is this a lucky name|will (i|my) (succeed|win|get))\b/.test(lower)
  ) {
    return 'refusal';
  }
  if (
    /\b(outcome (guarantee|prediction)|(guarantee|predict) (success|failure)|(when|what date|how long))\b/.test(lower)
  ) {
    return 'refusal';
  }
  if (
    /\b(force(d)? name change|change (my )?name (to )?match|override (astrology|numerology))\b/.test(lower)
  ) {
    return 'refusal';
  }

  if (
    /\b(how does my name affect (how i'm )?perceived|how am i perceived|first impression|(public |brand )?perception)\b/.test(lower)
  ) {
    return 'perception';
  }
  if (
    /\b(is my name (supportive|good) for (my )?career|(career|business|professional) name|(brand|public) name)\b/.test(lower)
  ) {
    return 'career_support';
  }
  if (
    /\b(does (this )?name align with my personality|(name|personality) (alignment|match)|(fit|suit) my (personality|character))\b/.test(lower)
  ) {
    return 'personality_alignment';
  }
  if (
    /\b(should i consider (a )?(minor )?adjustment|(minor |slight )?(spelling|usage) (change|adjustment)|(name )?refinement)\b/.test(lower)
  ) {
    return 'adjustment';
  }
  if (
    /\b(name|expression|vibration|branding|identity|how (others|people) see)\b/.test(lower)
  ) {
    return 'general';
  }

  return 'general';
}

/** Mandatory refusal phrase. */
export const NAME_REFUSAL_PHRASE =
  'Name analysis does not determine life events or timing.';

/**
 * Build slice for system prompt: state, name-type supremacy, vibration vs core self, trait translation, adjustment logic, allowed/forbidden, permanent rule.
 */
export function getNameSliceForQuestionType(
  questionType: NameQuestionType,
  state: NameState
): string {
  if (questionType === 'refusal') {
    return `Refuse with: "${NAME_REFUSAL_PHRASE}" Do not guarantee outcomes, predict timing, or recommend forced name changes. Name analysis reflects expression and resonance, not guarantees.`;
  }

  const stateBlock = `
NAME ANALYSIS STATE (use this only):
- Full name: ${state.full_name}
- Name type: ${state.name_type}
- Name vibration: ${state.name_vibration}
- Root number: ${state.root_number}
- Expression traits: ${state.expression_traits.length ? state.expression_traits.join(', ') : 'n/a'}
- Dominant energy: ${state.dominant_energy}
- Conflict energy: ${state.conflict_energy}
- Alignment status: ${state.alignment_status}
`.trim();

  const nameTypeBlock = `
NAME-TYPE SUPREMACY:
- Always state which name is being analyzed (birth / calling / public). Here: ${state.name_type}.
- No mixing of name types in one answer.
`.trim();

  const vibrationBlock = `
VIBRATION VS CORE SELF:
- Supportive vibration → smoother expression
- Excess vibration → imbalance or overemphasis
- Clashing vibration → friction, not failure
- Your name amplifies / moderates / conflicts with your core tendencies. Say which, based on alignment_status.
`.trim();

  const traitBlock = `
TRAIT TRANSLATION (observable traits, not fate):
- Soft / Venusian → approachable, creative
- Sharp / Mercurial → communicative, agile
- Heavy / Saturnine → serious, authoritative
- Frame as how others experience the person, not destiny.
`.trim();

  const adjustmentBlock = `
ADJUSTMENT LOGIC:
- Adjust only if persistent friction or name clashes with intended role (e.g. brand).
- Prefer minor spelling or usage changes.
- Never recommend full name change lightly.
- Phrase: "A slight adjustment can soften expression, not alter destiny."
`.trim();

  const allowedBlock = `
ALLOWED OUTPUTS:
- Expression and perception description, career-facing suitability, personality alignment, minimal adjustments when justified.
`.trim();

  const forbiddenBlock = `
FORBIDDEN:
- Outcome guarantees, timing questions, forced name change advice, using name analysis to override astrology/numerology.
`.trim();

  const disciplineBlock = `
PERMANENT RULE:
A name shapes expression and perception, not destiny.
`.trim();

  return `${stateBlock}

${nameTypeBlock}

${vibrationBlock}

${traitBlock}

${adjustmentBlock}

${allowedBlock}

${forbiddenBlock}

${disciplineBlock}`;
}
