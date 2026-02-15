/**
 * Topic Anchor for Main Seer
 * Defines which questions count as in-domain follow-ups so we keep session-bound
 * topic continuity and never trigger generic clarification mid-thread.
 */

/** Intents that participate in topic anchoring (same tool cluster until user changes domain). */
export const ANCHORED_INTENTS = [
  'purpose',
  'career',
  'timing',
  'relationship',
  'health',
  'relocation',
] as const;

export type AnchoredIntent = (typeof ANCHORED_INTENTS)[number];

/** Patterns per intent: question must match at least one to be treated as in-domain follow-up. */
const DOMAIN_FOLLOW_UP_PATTERNS: Record<AnchoredIntent, RegExp[]> = {
  purpose: [
    /\b(obstacles?|obstacle)\b/i,
    /\b(practices?|spiritual practices)\b/i,
    /\b(align(ment)?|align with (my )?purpose)\b/i,
    /\b(shadow|shadow side)\b/i,
    /\b(manifestation|manifest|when will (my )?purpose manifest)\b/i,
    /\b(service path|path of service)\b/i,
    /\b(what blocks me|what gets in the way|what (might )?i face)\b/i,
    /\b(how can i align|first focus|channel|teach|guide|heal)\b/i,
    /\b(dharma|life (theme|direction)|soul (purpose|path))\b/i,
  ],
  career: [
    /\b(obstacles?|obstacle)\b/i,
    /\b(career )?timing|when (will|should)|promotion|breakthrough\b/i,
    /\b(change job|next step|transition)\b/i,
    /\b(success factors?|what (will |could )?(help|block))\b/i,
  ],
  timing: [
    /\b(when|period|delay|year|month)\b/i,
    /\b(favorable time|best time|right time)\b/i,
    /\b(launch|release|soft launch|hard launch)\b/i,
    /\b(next (best )?date|next (best )?day|another date|different (date|month)|what'?s the next (best )?date\b)/i,
    /\b(best date|good date|auspicious (date|day)|when (should|to) (start|launch|move)\b)/i,
  ],
  relationship: [
    /\b(obstacles?|obstacle)\b/i,
    /\b(compatibility|when will i meet|next partner)\b/i,
    /\b(relationship (timing|obstacles?)|marriage (timing|when))\b/i,
  ],
  health: [
    /\b(obstacles?|obstacle)\b/i,
    /\b(root cause|healing path|what blocks)\b/i,
    /\b(health (obstacles?|blocks?)|blocks? (my )?healing)\b/i,
  ],
  relocation: [
    /\b(permanent|temporary|long-term|short-term)\b/i,
    /\b(will it be|will (this |the )?move be)\b/i,
    /\b(succeed|fail|favorable|work out)\b/i,
    /\b(which (city|country|place)|where (to |should i))\b/i,
    /\b(visa|migration|settle)\b/i,
  ],
};

/**
 * Returns the list of intents that participate in topic anchoring.
 */
export function getAnchoredIntents(): string[] {
  return [...ANCHORED_INTENTS];
}

/**
 * True if activeIntent is anchored and the question matches that domain's follow-up patterns.
 * Used to keep the user in the same tool cluster (no re-classification, no generic clarification).
 */
export function isInDomainFollowUp(activeIntent: string, question: string): boolean {
  if (!activeIntent || typeof question !== 'string') return false;
  const intent = activeIntent.trim().toLowerCase();
  if (!ANCHORED_INTENTS.includes(intent as AnchoredIntent)) return false;
  const patterns = DOMAIN_FOLLOW_UP_PATTERNS[intent as AnchoredIntent];
  if (!patterns?.length) return false;
  const q = question.trim().toLowerCase();
  return patterns.some((re) => re.test(q));
}
