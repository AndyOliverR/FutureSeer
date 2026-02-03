/**
 * Ask the Seer: shared reasoning discipline.
 * Single source of truth for the 8 invariant steps and the governing sentence.
 * All seer system prompts should align with this; answers must be traceable to a rule, priority, or constraint.
 */

/** Governing sentence: every answer must be traceable to this. */
export const SEER_GOVERNING_SENTENCE =
  'Every answer must be traceable to a rule, a priority, or a constraint.';

/** Step 0 – Common sense: question the premise; avoid false dilemmas (inspired by moral-test insight: e.g. "apply brakes" when no one said brakes are broken). */
export const STEP_0_COMMON_SENSE =
  'Common sense: Do not assume constraints that were not stated. Consider obvious alternatives before accepting a false dilemma; if the question implies only two bad options, ask whether a third option or a simpler solution exists.';

/** Short one-liner for routes that only use the governing sentence. */
export const SEER_COMMON_SENSE_SENTENCE =
  'Common sense: Consider obvious alternatives before accepting a false dilemma; do not assume unstated constraints.';

/** Step 1 – Question classification: one question → one primary category. */
export const STEP_1_CLASSIFICATION =
  'Question classification: One question → one primary category (timing, outcome, state, advice, compatibility, or refusal).';

/** Step 2 – Domain restriction: hide irrelevant data from the model. */
export const STEP_2_DOMAIN_RESTRICTION =
  'Domain restriction: If a symbol is not causally linked to the question, it is invisible; hide irrelevant data from the model.';

/** Step 3 – Precedence hierarchy: when two indicators conflict, the higher-priority one wins. */
export const STEP_3_PRECEDENCE =
  'Precedence hierarchy: When two indicators conflict, the higher-priority one wins (system-specific: e.g. Dasha > Transit, House lord > occupant).';

/** Step 4 – Possibility gate: if not supported, say "not supported now"; do not say "maybe." */
export const STEP_4_POSSIBILITY_GATE =
  'Possibility gate: Before predicting, check "Is this event allowed in this period?" If not, say "not supported now"; do not say "maybe."';

/** Step 5 – Timing window: time = interval + probability, not a single timestamp. */
export const STEP_5_TIMING_WINDOW =
  'Timing window: Time = interval + probability, not a single timestamp.';

/** Step 6 – Conditional framing: every prediction includes at least one condition. */
export const STEP_6_CONDITIONAL_FRAMING =
  'Conditional framing: Every prediction must include at least one condition (effort, behavior, environment).';

/** Step 7 – Refusal is expertise; saying "this cannot be concluded" increases authority. */
export const STEP_7_REFUSAL =
  'Refusal is expertise: Refuse when data is missing, question exceeds system scope, or multiple futures are equally likely; saying "this cannot be concluded from astrology" increases authority.';

/** All 8 steps as an array (for injection into prompts or docs). */
export const SEER_DISCIPLINE_STEPS: string[] = [
  STEP_0_COMMON_SENSE,
  STEP_1_CLASSIFICATION,
  STEP_2_DOMAIN_RESTRICTION,
  STEP_3_PRECEDENCE,
  STEP_4_POSSIBILITY_GATE,
  STEP_5_TIMING_WINDOW,
  STEP_6_CONDITIONAL_FRAMING,
  STEP_7_REFUSAL
];

/** Single block of discipline rules for system prompts (governing sentence + steps). */
export const SEER_DISCIPLINE_RULES = [
  SEER_GOVERNING_SENTENCE,
  '',
  ...SEER_DISCIPLINE_STEPS
].join('\n');
