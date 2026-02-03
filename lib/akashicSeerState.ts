/**
 * Akashic Records Seer State and Slice.
 * Rule: Akashic Records provide symbolic insight into life themes, not factual history or future certainty.
 */

import type { AkashicReading, KarmicPattern, PastLife } from './akashicRecordsIntelligence';

export interface AkashicInquiryState {
  inquiry_focus: string;
  symbolic_impressions: string[];
  emotional_tone: string;
  clarity_level: string;
  current_life_context: string;
  themes_from_reading: string[];
}

export type AkashicQuestionType =
  | 'theme'
  | 'pattern'
  | 'purpose'
  | 'integration'
  | 'general'
  | 'refusal';

/** Refusal phrase for missing reading. */
export const AKASHIC_REFUSAL_DATA_PHRASE =
  'Akashic insights require a reading. Access your Akashic Records first.';

/** Refusal phrase for unsafe questions. */
export const AKASHIC_REFUSAL_SAFETY_PHRASE =
  'This system is not designed to answer that safely. Akashic insight reflects symbolic meaning, not objective destiny.';

/** Thematic vocabulary for symbolic extraction */
const THEMATIC_WORDS = new Set([
  'library', 'journey', 'teacher', 'healer', 'builder', 'witness', 'pattern',
  'integration', 'mission', 'evolution', 'growth', 'service', 'guidance',
  'wisdom', 'transition', 'emerging', 'returning', 'manuscript', 'path',
  'learning', 'purpose', 'theme', 'cycles', 'balance', 'expression',
]);

/** Extract thematic keywords from text (symbolic, not literal) */
function extractThematicKeywords(text: string): string[] {
  if (!text || typeof text !== 'string') return [];
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 3);
  return words.filter((w) => THEMATIC_WORDS.has(w));
}

/**
 * Build AkashicInquiryState from AkashicReading.
 * Requires reading with at least soulJourney OR lifePurpose.
 */
export function buildAkashicState(reading: AkashicReading | null | undefined): AkashicInquiryState {
  if (!reading) {
    throw new Error(AKASHIC_REFUSAL_DATA_PHRASE);
  }

  const soulJourney = reading.soulJourney;
  const lifePurpose = reading.lifePurpose;
  const hasSoul = soulJourney && (soulJourney.overview || soulJourney.currentStage);
  const hasPurpose = lifePurpose && (lifePurpose.mission || lifePurpose.expression);

  if (!hasSoul && !hasPurpose) {
    throw new Error(AKASHIC_REFUSAL_DATA_PHRASE);
  }

  const impressions: string[] = [];
  const themes: string[] = [];

  if (soulJourney?.overview) {
    const kw = extractThematicKeywords(soulJourney.overview);
    impressions.push(...kw);
    themes.push(...kw);
  }
  if (lifePurpose?.mission) {
    const kw = extractThematicKeywords(lifePurpose.mission);
    impressions.push(...kw);
    themes.push(...kw);
  }

  const karmicPatterns = reading.karmicPatterns?.patterns || [];
  for (const p of karmicPatterns as KarmicPattern[]) {
    if (p?.type) impressions.push(p.type.toLowerCase());
    if (p?.description) {
      const kw = extractThematicKeywords(p.description);
      impressions.push(...kw);
    }
  }

  const pastLives = reading.pastLives || [];
  for (const pl of pastLives as PastLife[]) {
    if (pl?.role) impressions.push(pl.role.toLowerCase());
    if (Array.isArray(pl?.lessons)) {
      for (const l of pl.lessons) {
        if (typeof l === 'string') {
          const kw = extractThematicKeywords(l);
          impressions.push(...kw);
        }
      }
    }
  }

  const uniqueImpressions = [...new Set(impressions)].filter(Boolean).slice(0, 15);
  const uniqueThemes = [...new Set(themes)].filter(Boolean).slice(0, 12);

  if (uniqueImpressions.length === 0) {
    uniqueImpressions.push('library', 'journey', 'evolution');
  }
  if (uniqueThemes.length === 0) {
    uniqueThemes.push('life theme', 'growth', 'purpose');
  }

  const currentStage = soulJourney?.currentStage || '';
  const expression = lifePurpose?.expression || '';
  const current_life_context = `${currentStage} ${expression}`.trim().slice(0, 200) || 'life exploration';

  return {
    inquiry_focus: 'life_theme',
    symbolic_impressions: uniqueImpressions,
    emotional_tone: 'neutral',
    clarity_level: 'moderate',
    current_life_context,
    themes_from_reading: uniqueThemes,
  };
}

/**
 * Classify Akashic question.
 * Refuse: destiny, past-life factual, external authority, prediction.
 * Valid: theme, pattern, purpose, integration.
 */
export function classifyAkashicQuestion(question: string): AkashicQuestionType {
  const lower = question.toLowerCase().trim();

  // Refusal - past-life factual
  if (/\b(who was I (in a )?past life|past life verification|verify (my )?past life)\b/.test(lower)) {
    return 'refusal';
  }
  if (/\b(what will happen to me|what is my destiny|destiny certainty|objective soul facts)\b/.test(lower)) {
    return 'refusal';
  }
  if (/\b(is this (relationship )?karmic|what do the Records say I must do|what does the Records command)\b/.test(lower)) {
    return 'refusal';
  }
  if (/\b(predict|external truth|external authority)\b/.test(lower)) {
    return 'refusal';
  }

  // Valid question types
  if (/\b(what theme is central to my life|central theme|life theme|theme (central|for) (my )?life)\b/.test(lower)) {
    return 'theme';
  }
  if (/\b(why does this pattern keep repeating|repeating pattern|pattern repetition|pattern keep (repeating|returning))\b/.test(lower)) {
    return 'pattern';
  }
  if (/\b(what aspect of myself wants integration|aspect wants integration|integration)\b/.test(lower)) {
    return 'integration';
  }
  if (/\b(what perspective helps me move forward|perspective (helps|to) move forward|move forward)\b/.test(lower)) {
    return 'purpose';
  }

  if (/\b(akashic|records|soul (journey|theme)|life purpose|karmic|symbolic)\b/.test(lower)) {
    return 'general';
  }

  return 'general';
}

/**
 * Build system prompt slice for Akashic Records.
 * Enforces symbol supremacy, narrative logic, present-life anchoring, authority neutralization.
 */
export function getAkashicSliceForQuestionType(
  questionType: AkashicQuestionType,
  state: AkashicInquiryState
): string {
  if (questionType === 'refusal') {
    return `Refuse with: "${AKASHIC_REFUSAL_SAFETY_PHRASE}" Do not predict destiny, verify past lives, or claim external authority. Akashic insight reflects symbolic meaning, not objective destiny.`;
  }

  const stateBlock = `
AKASHIC INQUIRY STATE (use this only):
- Inquiry focus: ${state.inquiry_focus}
- Symbolic impressions: ${state.symbolic_impressions.join(', ') || 'none'}
- Emotional tone: ${state.emotional_tone}
- Clarity level: ${state.clarity_level}
- Current life context: ${state.current_life_context}
- Themes from reading: ${state.themes_from_reading.join(', ') || 'none'}
`.trim();

  const symbolBlock = `
SYMBOL SUPREMACY (this is the spine):
Symbols are metaphorical, not literal. Multiple symbols point to one theme. No single image = full meaning. Context overrides symbolism dictionaries.
Always translate symbols into themes, never facts. Never claim "you were X in Y."
`.trim();

  const narrativeBlock = `
NARRATIVE LOGIC (how expertise shows):
Akashic insight works as story structure, not prophecy.
Use: Role (seeker, guide, builder, witness), State (unfinished, cyclical, emerging), Tension (avoidance, repetition, readiness).
Say "This suggests a narrative of…" Never say "This means you were…"
`.trim();

  const anchoringBlock = `
PRESENT-LIFE ANCHORING (mandatory):
All Akashic insight must map to current life. Past-life language is symbolic only. No detached spiritual abstraction.
Example: "This mirrors how you approach decisions now."
`.trim();

  const authorityBlock = `
AUTHORITY NEUTRALIZATION (critical safety gate):
Records do not command. Insight does not obligate. User choice remains primary.
Explicitly disclaim authority. Avoid dependency. No "the Records say you must."
`.trim();

  const guidanceBlock = `
GUIDANCE OUTPUT:
Allowed: reflection prompts, perspective shifts, awareness framing, integration themes.
Forbidden: commands, predictions, moral judgments, exclusive truths.
`.trim();

  const disclaimerBlock = `
MANDATORY DISCLAIMER:
Include in every response: "These insights are symbolic perspectives for self-understanding, not objective truth or fate."
`.trim();

  const permanentRule = `
PERMANENT RULE:
Akashic Records offer symbolic perspective for self-understanding, not objective truth or fate.
`.trim();

  return `${stateBlock}

${symbolBlock}

${narrativeBlock}

${anchoringBlock}

${authorityBlock}

${guidanceBlock}

${disclaimerBlock}

${permanentRule}`;
}
