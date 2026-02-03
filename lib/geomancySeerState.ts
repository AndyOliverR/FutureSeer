/**
 * Geomancy Seer State and Slice.
 * Rule: In Geomancy, the Judge decides the answer.
 * Binary-structural divination system — Mothers, Daughters, Nieces, Judge, Reconciler.
 */

export interface GeomancyState {
  question: string;
  mothers: string[];
  daughters: string[];
  nieces: string[];
  judge: string;
  reconciler: string;
  house_focus?: number;
}

export type GeomancyQuestionType =
  | 'condition'
  | 'outcome_tendency'
  | 'obstruction'
  | 'stability'
  | 'general'
  | 'refusal';

/** Refusal phrase for missing chart data. */
export const GEOMANCY_REFUSAL_DATA_PHRASE =
  'Geomancy requires a full chart. Generate a reading first.';

/** Refusal phrase for invalid questions. */
export const GEOMANCY_REFUSAL_OUTCOME_PHRASE =
  'Geomancy addresses condition and outcome tendency, not detailed explanations or timing.';

function getFigureName(fig: any): string {
  return typeof fig === 'string' ? fig : fig?.name ?? 'Unknown';
}

/**
 * Infer house focus from question context.
 */
function inferHouseFocus(question: string): number | undefined {
  const lower = question.toLowerCase();
  if (/\b(career|job|work|authority|reputation|public)\b/.test(lower)) return 10;
  if (/\b(partner|relationship|marriage|other|enemy)\b/.test(lower)) return 7;
  if (/\b(home|family|foundation|roots)\b/.test(lower)) return 4;
  if (/\b(self|me|personality|identity)\b/.test(lower)) return 1;
  if (/\b(money|wealth|possessions|finance)\b/.test(lower)) return 2;
  if (/\b(communication|siblings|travel)\b/.test(lower)) return 3;
  if (/\b(creativity|children|romance)\b/.test(lower)) return 5;
  if (/\b(health|work|routine)\b/.test(lower)) return 6;
  if (/\b(transformation|death|shared)\b/.test(lower)) return 8;
  if (/\b(journey|philosophy|education)\b/.test(lower)) return 9;
  if (/\b(friends|hopes|groups)\b/.test(lower)) return 11;
  if (/\b(hidden|spirituality|subconscious)\b/.test(lower)) return 12;
  return undefined;
}

/**
 * Build GeomancyState from GeomanticAnalysis.
 * Requires analysis.figures with at least 15 elements; Judge at index 14.
 */
export function buildGeomancyState(analysis: any, question?: string): GeomancyState {
  if (!analysis) {
    throw new Error(GEOMANCY_REFUSAL_DATA_PHRASE);
  }

  const figures = analysis.figures;
  if (!Array.isArray(figures) || figures.length < 15) {
    throw new Error(GEOMANCY_REFUSAL_DATA_PHRASE);
  }

  const judgeFig = figures[14];
  if (!judgeFig) {
    throw new Error(GEOMANCY_REFUSAL_DATA_PHRASE);
  }

  const q = question ?? analysis.question ?? '';

  return {
    question: q,
    mothers: figures.slice(0, 4).map(getFigureName),
    daughters: figures.slice(4, 8).map(getFigureName),
    nieces: figures.slice(8, 12).map(getFigureName),
    judge: getFigureName(judgeFig),
    reconciler: getFigureName(figures[12]),
    house_focus: inferHouseFocus(q),
  };
}

/**
 * Classify Geomancy question.
 * Refuse: psychological, timing precision, "why", "what should I learn", "who am I".
 * Valid: will this proceed, is this stable, obstruction, condition of matter.
 */
export function classifyGeomancyQuestion(question: string): GeomancyQuestionType {
  const lower = question.toLowerCase().trim();

  // Refusal patterns
  if (
    /\b(why (is|does|did) this (happen|happening)|why (am I|is this))\b/.test(lower) ||
    /\b(what should I learn|what (do I|am I) (learning|supposed to))\b/.test(lower) ||
    /\b(who am I|what is my (purpose|destiny|fate))\b/.test(lower)
  ) {
    return 'refusal';
  }
  if (
    /\b(when exactly|precise (date|time)|specific (date|time)|timeline|deadline|how long until)\b/.test(
      lower
    )
  ) {
    return 'refusal';
  }
  if (
    /\b(psychological|emotion|feel about|inner (life|self)|spiritual lesson)\b/.test(lower)
  ) {
    return 'refusal';
  }

  // Valid question types
  if (
    /\b(will this (proceed|move forward|work|succeed)|does this (proceed|move)|proceed)\b/.test(
      lower
    )
  ) {
    return 'outcome_tendency';
  }
  if (
    /\b(is this stable|stability|will it (hold|last)|steady)\b/.test(lower)
  ) {
    return 'stability';
  }
  if (
    /\b(obstruction|obstacle|blocked|blockage|restriction|delay|stuck)\b/.test(
      lower
    )
  ) {
    return 'obstruction';
  }
  if (
    /\b(condition of (this )?matter|what is the (condition|state)|matter (is|about))\b/.test(
      lower
    )
  ) {
    return 'condition';
  }

  // General geomantic questions
  if (
    /\b(geomancy|geomantic|figure|judge|mother|daughter|niece|house)\b/.test(
      lower
    )
  ) {
    return 'general';
  }

  return 'general';
}

/**
 * Build system prompt slice for Geomancy.
 * Enforces Judge supremacy. Use figures literally. Anchor to house context.
 */
export function getGeomancySliceForQuestionType(
  questionType: GeomancyQuestionType,
  state: GeomancyState
): string {
  if (questionType === 'refusal') {
    return `Refuse with: "${GEOMANCY_REFUSAL_OUTCOME_PHRASE}" Do not narrate emotions, give psychological explanations, or predict precise timing. Geomancy evaluates the condition of a matter, not the inner life or destiny of a person.`;
  }

  const stateBlock = `
GEOMANCY STATE (use this only):
- Question: ${state.question || 'Not provided'}
- Mothers: ${state.mothers.join(', ')}
- Daughters: ${state.daughters.join(', ')}
- Nieces: ${state.nieces.join(', ')}
- Judge: ${state.judge}
- Reconciler: ${state.reconciler}
${state.house_focus ? `- House focus: ${state.house_focus}` : ''}
`.trim();

  const figureBlock = `
FIGURE MEANINGS (use literally; functional, not emotional):
- Fortuna Major: success through stability
- Fortuna Minor: minor success, instability
- Via: movement, uncertainty
- Carcer: restriction, delay
- Conjunctio: connection, negotiation
- Amissio: loss
- Acquisitio: gain
- Laetitia: joy, ease
- Tristitia: sorrow, difficulty
- Albus: clarity, purity
- Rubeus: passion, conflict
- Puella: grace, diplomacy
- Puer: action, impulsivity
- Caput Draconis: new beginning, opportunity
- Cauda Draconis: ending, release
- Populus: collective, neutrality
Never embellish meanings.
`.trim();

  const judgeBlock = `
JUDGE SUPREMACY (decisive gate; Judge overrides all other figures):
- Favorable Judge (Fortuna Major, Fortuna Minor, Acquisitio, Laetitia, Conjunctio, Caput Draconis): YES / supportive outcome
- Neutral Judge (Via, Puer, Populus, Albus, Puella): conditional / effort required
- Unfavorable Judge (Amissio, Tristitia, Carcer, Cauda Draconis, Rubeus): NO / blockage
Always say explicitly: "The Judge indicates…"
`.trim();

  const reconcilerBlock = `
RECONCILER LOGIC (nuance layer):
- Reconciler never reverses the Judge
- It suggests adjustment, not salvation
- Example: Negative Judge + Conjunctio = negotiate, do not force
`.trim();

  const houseBlock = `
HOUSE PLACEMENT (context filter):
- 1st: self, identity
- 2nd: money, possessions
- 3rd: communication, siblings
- 4th: foundation, home, family
- 5th: creativity, children, romance
- 6th: health, work, routine
- 7th: others, partnerships
- 8th: transformation, shared resources
- 9th: journey, philosophy
- 10th: career, authority, reputation
- 11th: friends, hopes
- 12th: hidden, spirituality
Anchor conclusions to the relevant house when applicable.
`.trim();

  const framingBlock = `
ANSWER FRAMING:
- Direct, classical. Example: "The Judge is Carcer, indicating restriction and delay. The matter is currently blocked."
- No mysticism. No coaching language. No "spiritually blocked."
- Allowed: condition of matter, outcome tendency, stability vs change, obstacles vs flow, yes/no + condition
- Never allowed: psychological narrative, timing precision, free interpretation
`.trim();

  const permanentRule = `
PERMANENT RULE:
Geomancy evaluates the condition of a matter, not the inner life or destiny of a person.
`.trim();

  return `${stateBlock}

${figureBlock}

${judgeBlock}

${reconcilerBlock}

${houseBlock}

${framingBlock}

${permanentRule}`;
}
