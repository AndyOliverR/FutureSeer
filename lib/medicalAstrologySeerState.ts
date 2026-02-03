/**
 * Medical Astrology Seer State and Slice.
 * Rule: Medical Astrology describes tendencies and cycles, not diagnoses or treatments.
 * Medical Astrology informs awareness and timing, not medical action.
 */

const SIGN_LORDS: Record<string, string> = {
  Aries: 'Mars',
  Taurus: 'Venus',
  Gemini: 'Mercury',
  Cancer: 'Moon',
  Leo: 'Sun',
  Virgo: 'Mercury',
  Libra: 'Venus',
  Scorpio: 'Mars',
  Sagittarius: 'Jupiter',
  Capricorn: 'Saturn',
  Aquarius: 'Saturn',
  Pisces: 'Jupiter',
};

export type PlanetStrength = 'strong' | 'average' | 'weak';

export interface MedicalAstrologyState {
  ascendant: string;
  ascendant_lord: string;
  moon: { sign: string; strength: PlanetStrength };
  sun: { sign: string; strength: PlanetStrength };
  health_houses: {
    6: { lord: string; afflicted: boolean };
    8: { lord: string; afflicted: boolean };
    12: { lord: string; afflicted: boolean };
  };
  current_dasha?: string;
  key_afflictions: string[];
}

export type MedicalAstrologyQuestionType =
  | 'health_areas'
  | 'when_cautious'
  | 'recovery_stress'
  | 'lifestyle_balance'
  | 'general'
  | 'refusal';

/** Payload from client: analysis.data from medical chart API. */
export interface MedicalAstrologyChartPayload {
  data?: {
    chart?: {
      ascendant?: string;
      planets?: Record<string, { sign?: string; house?: number }>;
      houses?: Array<{ house?: number; sign?: string }>;
    };
    healthIndicators?: Array<{ name: string; status?: string }>;
    bodySystems?: Array<{ system: string; riskLevel?: string }>;
    timing?: { currentDasha?: string; dasha?: string };
  };
  chart?: Record<string, { sign?: string; house?: number }>;
}

function strengthFromHouse(house: number): PlanetStrength {
  if ([1, 4, 7, 10].includes(house)) return 'strong';
  if ([6, 8, 12].includes(house)) return 'weak';
  return 'average';
}

function getHouseLord(houses: Array<{ house?: number; sign?: string }> | undefined, houseNum: number): string {
  if (!houses?.length) return 'Unknown';
  const h = houses.find((x) => x.house === houseNum);
  const sign = h?.sign ?? '';
  return (sign && SIGN_LORDS[sign]) || 'Unknown';
}

/**
 * Build MedicalAstrologyState from analysis payload. Requires data.chart with planets.
 */
export function buildMedicalAstrologyState(payload: MedicalAstrologyChartPayload): MedicalAstrologyState {
  const data = payload.data ?? {};
  const chart = data.chart ?? {};
  const planets = chart.planets ?? {};
  if (!chart || Object.keys(planets).length === 0) {
    throw new Error(
      'Medical Astrology requires chart data. Generate your medical astrology analysis first to use Ask the Seer.'
    );
  }
  const houses = chart.houses ?? [];
  const ascendantSign =
    chart.ascendant ??
    (houses.find((h: { house?: number }) => h.house === 1) as { sign?: string } | undefined)?.sign ??
    'Unknown';
  const ascendantLord = (ascendantSign && SIGN_LORDS[ascendantSign]) || 'Unknown';

  const sun = planets.Sun ?? planets.sun ?? {};
  const moon = planets.Moon ?? planets.moon ?? {};
  const sunHouse = sun.house ?? 0;
  const moonHouse = moon.house ?? 0;

  const malefics = ['Mars', 'Saturn'];
  const planetInHouse = (houseNum: number): string[] => {
    return Object.entries(planets)
      .filter(([, p]) => (p as { house?: number }).house === houseNum)
      .map(([name]) => name);
  };
  const afflicted = (houseNum: number) =>
    planetInHouse(houseNum).some((p) => malefics.includes(p));

  const key_afflictions: string[] = [];
  [6, 8, 12].forEach((h) => {
    const inH = planetInHouse(h);
    inH.forEach((p) => key_afflictions.push(`${p} in ${h}th house`));
  });

  const current_dasha =
    data.timing?.currentDasha ?? (data.timing as { dasha?: string })?.dasha;

  return {
    ascendant: ascendantSign,
    ascendant_lord: ascendantLord,
    moon: {
      sign: (moon.sign ?? 'Unknown') as string,
      strength: strengthFromHouse(moonHouse),
    },
    sun: {
      sign: (sun.sign ?? 'Unknown') as string,
      strength: strengthFromHouse(sunHouse),
    },
    health_houses: {
      6: { lord: getHouseLord(houses, 6), afflicted: afflicted(6) },
      8: { lord: getHouseLord(houses, 8), afflicted: afflicted(8) },
      12: { lord: getHouseLord(houses, 12), afflicted: afflicted(12) },
    },
    current_dasha: current_dasha ?? undefined,
    key_afflictions: key_afflictions.slice(0, 8),
  };
}

/**
 * Classify Medical Astrology question. Valid: health areas, when cautious, recovery/stress, lifestyle. Invalid: diagnosis, medication, will I recover, how long live.
 */
export function classifyMedicalAstrologyQuestion(question: string): MedicalAstrologyQuestionType {
  const lower = question.toLowerCase().trim();

  if (
    /\b(what (disease|illness|condition) do i have|diagnose|should i stop (taking )?medication|will i recover from|how long will i live|what (is )?wrong with me|do i have (cancer|diabetes|heart disease)|emergency|mental health crisis|suicide|self[- ]harm|prescribe|recommend (medication|a pill|drugs)|will i get better|what('s| is) wrong with my (head|heart|liver|kidney|stomach))\b/.test(
      lower
    )
  ) {
    return 'refusal';
  }
  if (
    /\b(what (health )?areas (need |require )?attention|health (areas|focus)|areas to (watch|attend))\b/.test(
      lower
    )
  ) {
    return 'health_areas';
  }
  if (
    /\b(when (should i be )?more cautious (about )?energy|when (to )?rest|low[- ]?energy (phase|period)|caution)\b/.test(
      lower
    )
  ) {
    return 'when_cautious';
  }
  if (
    /\b(what (affects |influences )?(my )?recovery|(recovery|stress) (level|pattern)|stress (management|level))\b/.test(
      lower
    )
  ) {
    return 'recovery_stress';
  }
  if (
    /\b(lifestyle (focus|balance)|(rest|exertion) balance|wellness (focus|balance)|routine (regularity|balance))\b/.test(
      lower
    )
  ) {
    return 'lifestyle_balance';
  }
  if (
    /\b(health|vitality|constitution|tendenc|medical astrology|chart|6th|8th|12th)\b/.test(
      lower
    )
  ) {
    return 'general';
  }
  if (
    /\b(drink|eat|coffee|tea|caffeine|food|beverage|diet|alcohol|sugar|dairy|gluten)\b/.test(lower) &&
    /\b(good|bad|suit|okay|beneficial|fit|overall)\b/.test(lower)
  ) {
    return 'lifestyle_balance';
  }

  return 'general';
}

/** Mandatory disclaimer to include in every response. */
export const MEDICAL_DISCLAIMER =
  'This insight is based on traditional astrological interpretations and is not a substitute for medical advice, diagnosis, or treatment.';

/**
 * Build slice for system prompt: state, house-to-body, planet-to-function, affliction logic, dasha timing, lifestyle only, disclaimer, refusals.
 */
export function getMedicalAstrologySliceForQuestionType(
  questionType: MedicalAstrologyQuestionType,
  state: MedicalAstrologyState
): string {
  if (questionType === 'refusal') {
    return `Refuse with: "This question requires professional medical evaluation." Do not diagnose, suggest medication changes, or address emergency or mental health crisis. Medical astrology highlights tendencies, not medical conclusions.`;
  }

  const stateBlock = `
MEDICAL ASTROLOGY STATE (use this only):
- Ascendant: ${state.ascendant}; Lord: ${state.ascendant_lord}
- Moon: ${state.moon.sign}, strength ${state.moon.strength}
- Sun: ${state.sun.sign}, strength ${state.sun.strength}
- Health houses: 6th lord ${state.health_houses[6].lord}, afflicted=${state.health_houses[6].afflicted}; 8th lord ${state.health_houses[8].lord}, afflicted=${state.health_houses[8].afflicted}; 12th lord ${state.health_houses[12].lord}, afflicted=${state.health_houses[12].afflicted}
- Current dasha: ${state.current_dasha ?? 'unknown'}
- Key afflictions: ${state.key_afflictions.length ? state.key_afflictions.join('; ') : 'none listed'}
`.trim();

  const houseBodyBlock = `
HOUSE-TO-BODY (symbolic correspondences only; no disease naming):
- 1st house / Ascendant: overall vitality
- 6th house: illness patterns, inflammation, imbalance
- 8th house: chronic strain, regeneration
- 12th house: hospitalization, depletion, sleep
Always anchor statements to houses, not disease labels.
`.trim();

  const planetFunctionBlock = `
PLANET-TO-FUNCTION (describe functions, not diseases):
- Sun: vitality, heart, immunity
- Moon: fluids, digestion, emotional health
- Mercury: nerves, respiration
- Mars: inflammation, injuries
- Saturn: chronic stress, rigidity
Describe functions and tendencies only.
`.trim();

  const afflictionBlock = `
AFFLICTION LOGIC:
- Afflictions indicate sensitivity, slower recovery, need for caution. No fear language.
- Multiple afflictions → heightened awareness, not alarm. Benefic support → resilience. Malefic periods → rest and moderation.
`.trim();

  const timingBlock = `
DASHA / TRANSIT (timing, not outcome):
- Only: low-energy phases, better recovery windows, periods requiring caution.
- Never: predict illness onset, predict recovery certainty.
- Phrase: "This period favors rest and preventative care."
`.trim();

  const lifestyleBlock = `
LIFESTYLE FRAMING (allowed only):
- Rest vs exertion balance, stress management emphasis, routine regularity, general wellness focus.
- FORBIDDEN: supplements, treatments, medications, clinical instructions.
`.trim();

  const disclaimerBlock = `
MANDATORY DISCLAIMER (include in every response):
"${MEDICAL_DISCLAIMER}"
`.trim();

  const disciplineBlock = `
DISCIPLINE (non-negotiable):
- Medical Astrology describes tendencies and cycles, not diagnoses or treatments.
- Refuse: diagnosis requests, medication changes, emergency conditions, mental health crisis.
- Permanent rule: Medical Astrology informs awareness and timing, not medical action.
`.trim();

  return `${stateBlock}

${houseBodyBlock}

${planetFunctionBlock}

${afflictionBlock}

${timingBlock}

${lifestyleBlock}

${disclaimerBlock}

${disciplineBlock}`;
}
