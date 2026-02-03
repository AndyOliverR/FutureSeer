/**
 * Horary Astrology Seer State and Slice.
 * Rule: If the chart is not radical, Horary must refuse.
 * Horary answers one sincere question, once, at the moment it is asked.
 */

export interface HorarySeerStateRadicality {
  early_degree: boolean;
  late_degree: boolean;
  void_of_course_moon: boolean;
  saturn_in_first: boolean;
}

export interface HorarySeerStateMoon {
  sign: string;
  house: number;
  applying_aspect?: string;
  void_of_course: boolean;
}

export interface HorarySeerState {
  question: string;
  question_time: string;
  location: string;
  ascendant: string;
  ascendant_degree?: number;
  moon: HorarySeerStateMoon;
  radicality: HorarySeerStateRadicality;
  /** Summary for LLM: 1st house ruler (querent), quesited house ruler, key applying aspects */
  significators_summary?: string;
  aspects_summary?: string;
}

export type HoraryQuestionType =
  | 'will_yes_no'
  | 'outcome_tendency'
  | 'where_what'
  | 'general'
  | 'refusal';

/** Payload from client: basicInfo + optional seerState from generate-custom. */
export interface HoraryChartPayload {
  basicInfo: {
    question: string;
    questionTime: string;
    questionPlace: string;
    chartTime?: string;
  };
  seerState?: {
    ascendantSign: string;
    ascendantDegree: number;
    moonSign: string;
    moonHouse: number;
    moonApplyingAspect?: string;
    voidOfCourseMoon: boolean;
    saturnInFirst: boolean;
  };
  planetaryPositions?: Array<{ name: string; sign: string; degree: number; house: number }>;
  aspects?: Array<{ planets: string; type: string; applying: boolean }>;
  houseAnalysis?: Array<{ house: number; ruler: string }>;
}

/**
 * Build HorarySeerState from chart payload. Requires basicInfo and seerState (radicality data).
 * If seerState is missing, throws — chart is not suitable for horary judgment.
 */
export function buildHoraryState(payload: HoraryChartPayload): HorarySeerState {
  const { basicInfo, seerState } = payload;
  if (!basicInfo?.question?.trim() || !basicInfo?.questionTime || !basicInfo?.questionPlace?.trim()) {
    throw new Error(
      'Horary requires question, time, and location. Generate a horary chart first to use Ask the Seer.'
    );
  }
  if (!seerState?.ascendantSign) {
    throw new Error(
      'Horary chart must include radicality data. Generate a new horary chart to use Ask the Seer.'
    );
  }

  const ascendantDegree = seerState.ascendantDegree;
  const early_degree = ascendantDegree != null && ascendantDegree < 3;
  const late_degree = ascendantDegree != null && ascendantDegree > 27;
  const void_of_course_moon = seerState.voidOfCourseMoon ?? false;
  const saturn_in_first = seerState.saturnInFirst ?? false;

  return {
    question: basicInfo.question.trim(),
    question_time: basicInfo.questionTime,
    location: basicInfo.questionPlace.trim(),
    ascendant: seerState.ascendantSign,
    ascendant_degree: ascendantDegree,
    moon: {
      sign: seerState.moonSign ?? 'unknown',
      house: seerState.moonHouse ?? 0,
      applying_aspect: seerState.moonApplyingAspect,
      void_of_course: void_of_course_moon,
    },
    radicality: {
      early_degree,
      late_degree,
      void_of_course_moon,
      saturn_in_first,
    },
    significators_summary: buildSignificatorsSummary(payload),
    aspects_summary: buildAspectsSummary(payload),
  };
}

function buildSignificatorsSummary(payload: HoraryChartPayload): string {
  const houses = payload.houseAnalysis;
  if (!houses?.length) return 'Querent = 1st house ruler; quesited = house ruler of the matter.';
  const h1 = houses.find((h) => h.house === 1);
  return `Querent: 1st house ruler ${h1?.ruler ?? '—'}. Quesited: house ruler of the matter (job=10, marriage=7, money=2, lost object=2/4).`;
}

function buildAspectsSummary(payload: HoraryChartPayload): string {
  const aspects = payload.aspects?.filter((a) => a.applying) ?? [];
  if (!aspects.length) return 'No applying aspects listed.';
  return aspects.map((a) => `${a.planets} ${a.type} (applying)`).join('; ');
}

/**
 * Radicality gate: multiple severe → refuse; one severe → answer with caution.
 */
export function getRadicalityVerdict(radicality: HorarySeerStateRadicality): 'refuse' | 'caution' | 'ok' {
  const { early_degree, late_degree, void_of_course_moon, saturn_in_first } = radicality;
  const issues = [early_degree, late_degree, void_of_course_moon, saturn_in_first].filter(Boolean).length;
  if (issues >= 2) return 'refuse';
  if (issues === 1) return 'caution';
  return 'ok';
}

/**
 * Classify Horary question. Valid: will/outcome/where/what. Invalid: why, life advice, future, vague.
 */
export function classifyHoraryQuestion(question: string): HoraryQuestionType {
  const lower = question.toLowerCase().trim();

  if (
    /\b(why is this happening|what should i do with my life|describe my future|what do i do\b|re-?ask|ask again)\b/.test(
      lower
    )
  ) {
    return 'refusal';
  }
  if (
    /\b(will i get (the |this )?job|will (the )?deal go through|will (the )?person contact me|is the lost item recoverable|will (i|we|they))\b/.test(
      lower
    )
  ) {
    return 'will_yes_no';
  }
  if (/\b(where (is|did)|what happened|outcome|tendency)\b/.test(lower)) {
    return 'where_what';
  }
  if (
    /\b(will\s|will the |will this |will it |horary|chart|question)\b/.test(lower) ||
    /\?\s*$/.test(question.trim())
  ) {
    return 'general';
  }

  return 'refusal';
}

/**
 * Build slice for system prompt: state, radicality gate, significators, aspect logic, Moon, answer framing, refusal.
 */
export function getHorarySliceForQuestionType(
  questionType: HoraryQuestionType,
  state: HorarySeerState,
  verdict: 'refuse' | 'caution' | 'ok'
): string {
  if (questionType === 'refusal') {
    return 'Refuse with: "This question is not suitable for horary judgment at this time." Horary requires a single, precise question (will/outcome/where).';
  }

  if (verdict === 'refuse') {
    return `RADICALITY FAILURE: Chart is not radical (multiple warnings: early/late ascendant, void Moon, Saturn in 1st). Refuse with: "This question may be premature or already resolved. The chart is not suitable for judgment at this time."`;
  }

  const stateBlock = `
HORARY STATE (use this only):
- Question: ${state.question}
- Question time: ${state.question_time}
- Location: ${state.location}
- Ascendant: ${state.ascendant}${state.ascendant_degree != null ? ` ${state.ascendant_degree}°` : ''}
- Moon: ${state.moon.sign}, house ${state.moon.house}${state.moon.applying_aspect ? `; applying ${state.moon.applying_aspect}` : ''}${state.moon.void_of_course ? '; VOID OF COURSE' : ''}
- Radicality: early_degree=${state.radicality.early_degree}, late_degree=${state.radicality.late_degree}, void_moon=${state.radicality.void_of_course_moon}, saturn_1st=${state.radicality.saturn_in_first}
- Significators: ${state.significators_summary ?? 'Querent = 1st ruler; quesited = matter house ruler.'}
- Applying aspects: ${state.aspects_summary ?? 'See chart.'}
`.trim();

  const radicalityBlock =
    verdict === 'caution'
      ? `
RADICALITY CAUTION: One warning (early/late ascendant, void Moon, or Saturn in 1st). Answer with caution; preface with: "The chart has a traditional caution; judgment is given with reserve."
`.trim()
      : '';

  const orderBlock = `
JUDGMENT ORDER (follow exactly):
1. State significators: "You are signified by X; the matter is signified by Y."
2. Planetary condition (dignity/debility only if relevant).
3. Applying aspects only (separating = already happened). Aspect hierarchy: conjunction > trine/sextile > square (with effort) > opposition (with loss).
4. Reception (mutual = cooperation; one-sided = imbalance; none = weak).
5. Moon: next applying aspect; void = no action. Translation/collection of light if relevant.
6. Clear judgment: Yes / No / Not now. Direct, decisive.
`.trim();

  const answerBlock = `
ANSWER FRAMING (direct, decisive):
- Good: "Yes. The ruler of the 1st applies to the ruler of the 10th by trine, with reception, indicating the matter is likely to conclude favorably."
- Bad: "There is a chance." Never hedge unnecessarily.
- One sincere question, once, at the moment it was asked. Do not re-interpret the question.
`.trim();

  const disciplineBlock = `
DISCIPLINE (non-negotiable):
- Only applying aspects matter. No modern orbs or psychological language.
- Refuse: no clear question; missing time/location; radicality failure; vague or life-advice questions.
- Permanent rule: Horary answers only one sincere question, once, at the moment it is asked.
`.trim();

  return `${stateBlock}
${radicalityBlock}

${orderBlock}

${answerBlock}

${disciplineBlock}`;
}
