/**
 * Angel Numbers Seer State and Slice Selector.
 * Contextual, attention-alignment only. Themes, not outcomes.
 * Rule: Angel Numbers guide attention, not destiny.
 */

export type AngelNumberQuestionType =
  | 'why_seeing'
  | 'meaning_for_situation'
  | 'what_to_focus_on'
  | 'refusal'
  | 'general';

export type AngelNumberContextDomain =
  | 'career_decision'
  | 'relationship'
  | 'health'
  | 'creativity'
  | 'general'
  | null;

export type AngelNumberFrequency = 'high' | 'medium' | 'low' | 'unknown';

export interface AngelNumberState {
  observed_number: string;
  frequency: AngelNumberFrequency;
  context: AngelNumberContextDomain;
  user_state: { current_focus?: string; emotional_state?: string };
  dominant_numerology: number | null;
  theme: string;
  has_context: boolean;
}

/** Theme keywords only (not outcomes). Maps dominant number to theme. */
const NUMBER_TO_THEME: Record<number, string> = {
  0: 'divine guidance, spiritual awareness',
  1: 'alignment, intention clarity, new beginnings',
  2: 'balance, patience, cooperation',
  3: 'support, growth, guidance, creativity',
  4: 'structure, stability, foundation',
  5: 'change, transition, release',
  6: 'love, responsibility, nurturing',
  7: 'wisdom, intuition, spiritual path',
  8: 'abundance, possibility, flow',
  9: 'completion, service, compassion',
  11: 'alignment, intention clarity, awakening',
  22: 'balance, building, practical manifestation',
  33: 'support, guidance, teaching',
  111: 'alignment, intention clarity',
  222: 'balance, patience, cooperation',
  333: 'support, growth, guidance',
  444: 'structure, stability, foundation',
  555: 'change, transition, release',
  666: 'balance, material and spiritual',
  777: 'wisdom, spiritual alignment',
  888: 'abundance, flow',
  999: 'completion, release',
  1111: 'alignment, intention clarity, awakening',
};

function normalizeObservedNumber(input: string | undefined): number | null {
  if (!input || typeof input !== 'string') return null;
  let cleaned = input.trim();
  if (cleaned.includes(':')) cleaned = cleaned.replace(/:/g, '');
  cleaned = cleaned.replace(/\D/g, '');
  if (!cleaned) return null;
  const num = parseInt(cleaned, 10);
  return isNaN(num) || num < 0 ? null : num;
}

function resolveToDominantNumber(num: number): number {
  if (NUMBER_TO_THEME[num] != null) return num;
  const str = num.toString();
  if (/^(\d)\1+$/.test(str)) return num;
  if (str.length >= 2) {
    const firstTwo = parseInt(str.substring(0, 2), 10);
    if ([11, 22, 33].includes(firstTwo)) return firstTwo;
  }
  let reduced = num;
  while (reduced > 33 && reduced !== 11 && reduced !== 22 && reduced !== 33) {
    const digits = reduced.toString().split('');
    reduced = digits.reduce((sum, d) => sum + parseInt(d, 10), 0);
    if ([11, 22, 33].includes(reduced)) break;
  }
  if (NUMBER_TO_THEME[reduced] != null) return reduced;
  while (reduced > 9 && reduced !== 11 && reduced !== 22 && reduced !== 33) {
    const digits = reduced.toString().split('');
    reduced = digits.reduce((sum, d) => sum + parseInt(d, 10), 0);
  }
  return reduced <= 9 ? reduced : 0;
}

function getThemeForNumber(num: number): string {
  const dominant = resolveToDominantNumber(num);
  return NUMBER_TO_THEME[dominant] ?? NUMBER_TO_THEME[0];
}

function parseNumberFromQuestion(question: string): { num: number; raw: string } | null {
  const timeMatch = question.match(/(\d{1,2}:\d{1,2})/);
  if (timeMatch) {
    const raw = timeMatch[1];
    const normalized = normalizeObservedNumber(raw);
    if (normalized != null) return { num: resolveToDominantNumber(normalized), raw };
  }
  const match = question.match(/\b(1{2,4}|2{2,3}|3{2,3}|4{2,3}|5{2,3}|6{2,3}|7{2,3}|8{2,3}|9{2,3})\b/);
  if (match) {
    const raw = match[1];
    const normalized = normalizeObservedNumber(raw);
    if (normalized != null) return { num: resolveToDominantNumber(normalized), raw };
  }
  const anyNum = question.match(/\b(\d{1,4})\b/g);
  if (anyNum) {
    for (const s of anyNum) {
      const n = parseInt(s, 10);
      if (NUMBER_TO_THEME[n] != null || (n <= 9 && n >= 0)) {
        const dominant = resolveToDominantNumber(n);
        return { num: dominant, raw: s };
      }
    }
  }
  return null;
}

function parseContextFromQuestion(question: string): AngelNumberContextDomain {
  const lower = question.toLowerCase();
  if (/career|job|work|business|promotion|10th/.test(lower)) return 'career_decision';
  if (/relationship|partner|love|marriage|7th|family/.test(lower)) return 'relationship';
  if (/health|body|wellness|illness|6th/.test(lower)) return 'health';
  if (/creativ|art|project|launch/.test(lower)) return 'creativity';
  return 'general';
}

function parseFrequencyFromQuestion(question: string): AngelNumberFrequency {
  const lower = question.toLowerCase();
  if (/repeatedly|keep seeing|all the time|constantly|often/.test(lower)) return 'high';
  if (/sometimes|few times|occasionally/.test(lower)) return 'medium';
  if (/once|saw once|just saw/.test(lower)) return 'low';
  return 'unknown';
}

export interface AngelNumbersContextInput {
  observed_number?: string;
  frequency?: string;
  context?: string;
  current_focus?: string;
  emotional_state?: string;
}

export interface AngelNumbersProfileInput {
  lifePathAngel?: number;
  destinyAngel?: number;
  soulAngel?: number;
  currentDateAngel?: number;
  personalYearAngel?: number;
}

/**
 * Build AngelNumberState from context, optional profile, optional lookup result, and optional question (to parse number/context/frequency).
 */
export function buildAngelNumberState(
  angelNumbersContext?: AngelNumbersContextInput | null,
  profile?: AngelNumbersProfileInput | null,
  lookupResult?: { number: number; originalInput?: string | number } | null,
  question?: string
): AngelNumberState {
  let observed_number = angelNumbersContext?.observed_number ?? '';
  let frequency: AngelNumberFrequency =
    (angelNumbersContext?.frequency as AngelNumberFrequency) ?? 'unknown';
  let context: AngelNumberContextDomain =
    (angelNumbersContext?.context as AngelNumberContextDomain) ?? null;
  const user_state = {
    current_focus: angelNumbersContext?.current_focus,
    emotional_state: angelNumbersContext?.emotional_state,
  };

  if (lookupResult) {
    if (!observed_number && lookupResult.originalInput != null) {
      observed_number =
        typeof lookupResult.originalInput === 'number'
          ? String(lookupResult.originalInput)
          : String(lookupResult.originalInput);
    }
  }

  if (question) {
    const parsedNum = parseNumberFromQuestion(question);
    if (parsedNum && !observed_number) {
      observed_number = parsedNum.raw;
    }
    if (frequency === 'unknown') frequency = parseFrequencyFromQuestion(question);
    if (context === null || context === 'general') context = parseContextFromQuestion(question);
  }

  let dominant_numerology: number | null = null;
  let theme = '';

  if (lookupResult) {
    dominant_numerology = lookupResult.number;
    theme = getThemeForNumber(lookupResult.number);
  } else if (observed_number) {
    const normalized = normalizeObservedNumber(observed_number);
    if (normalized != null) {
      dominant_numerology = resolveToDominantNumber(normalized);
      theme = getThemeForNumber(dominant_numerology);
    }
  }

  if (dominant_numerology == null && profile?.lifePathAngel != null) {
    dominant_numerology = resolveToDominantNumber(profile.lifePathAngel);
    theme = getThemeForNumber(dominant_numerology);
  }

  const has_context =
    !!observed_number || !!context || !!user_state.current_focus || !!user_state.emotional_state;

  return {
    observed_number,
    frequency,
    context,
    user_state,
    dominant_numerology,
    theme,
    has_context,
  };
}

/**
 * Classify Angel Number question. Returns refusal for event prediction, guarantees, dependency.
 */
export function classifyAngelNumberQuestion(question: string): AngelNumberQuestionType {
  const lower = question.toLowerCase().trim();

  if (
    /will\s+this\s+happen|will\s+i\s+get|when\s+will\s+it\s+happen|when\s+will\s+i|guarantee|certain\s+outcome|proof\s+that|if\s+i\s+see\s+.*\s+then\s+.*\s+must|must\s+happen|predict/.test(
      lower
    )
  ) {
    return 'refusal';
  }

  if (
    /why\s+am\s+i\s+seeing|why\s+do\s+i\s+keep\s+seeing|why\s+do\s+i\s+see|why\s+am\s+i\s+noticing/.test(
      lower
    )
  ) {
    return 'why_seeing';
  }

  if (
    /what\s+does\s+this\s+number\s+mean\s+for\s+my\s+situation|what\s+does\s+it\s+mean\s+for\s+my|meaning\s+for\s+my\s+situation|what\s+does\s+\d+\s+mean\s+for/.test(
      lower
    )
  ) {
    return 'meaning_for_situation';
  }

  if (
    /what\s+should\s+i\s+focus\s+on|what\s+should\s+i\s+pay\s+attention\s+to|what\s+to\s+focus\s+on|what\s+to\s+pay\s+attention|focus\s+right\s+now/.test(
      lower
    )
  ) {
    return 'what_to_focus_on';
  }

  return 'general';
}

/**
 * Build slice for system prompt. If no context, suggest one clarifying question.
 */
export function getAngelNumberSliceForQuestionType(
  _questionType: AngelNumberQuestionType,
  state: AngelNumberState
): string {
  if (!state.has_context) {
    return 'Context missing. Ask which number the user is seeing or what area of life they were focused on when they noticed it.';
  }

  const lines: string[] = [];
  if (state.observed_number) lines.push(`number_sequence: ${state.observed_number}`);
  else lines.push('If no specific number was given, ask which number the user is seeing or generalize cautiously.');
  lines.push(`frequency: ${state.frequency}`);
  if (state.context) lines.push(`context: ${state.context}`);
  if (state.user_state.current_focus)
    lines.push(`current_focus: ${state.user_state.current_focus}`);
  if (state.user_state.emotional_state)
    lines.push(`emotional_state: ${state.user_state.emotional_state}`);
  if (state.dominant_numerology != null)
    lines.push(`dominant_numerology: ${state.dominant_numerology}`);
  if (state.theme) lines.push(`theme (core_meaning): ${state.theme}`);

  lines.push('');
  lines.push('Respond with: meaning (theme), guidance, emotional_tone (reassurance/direction), suggested_response when relevant.');

  return lines.join('\n');
}
