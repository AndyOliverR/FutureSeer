/**
 * Financial Astrology Seer State and Slice.
 * Rule: Financial Astrology evaluates timing and risk posture, not profit outcomes.
 * Financial Astrology manages exposure and timing, not wealth creation itself.
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

export type HouseStrength = 'strong' | 'average' | 'weak';

export interface FinancialAstrologyState {
  ascendant: string;
  money_houses: {
    2: { lord: string; strength: HouseStrength };
    11: { lord: string; strength: HouseStrength };
  };
  career_house: {
    10: { lord: string; strength: HouseStrength };
  };
  speculation_house: {
    5: { lord: string; strength: HouseStrength; afflicted: boolean };
  };
  loss_houses: {
    6: { lord: string; afflicted: boolean };
    8: { lord: string; afflicted: boolean };
    12: { lord: string; afflicted: boolean };
  };
  current_dasha?: { maha?: string; antara?: string } | string;
  risk_indicators: { saturn?: string; rahu?: string };
}

export type FinancialAstrologyQuestionType =
  | 'stable_period'
  | 'saving_vs_expansion'
  | 'speculation_favored'
  | 'when_cautious'
  | 'risk_profile'
  | 'general'
  | 'refusal';

/** Payload: natal chart with planets, houses, ascendant. Same shape as medical. */
export interface FinancialAstrologyChartPayload {
  data?: {
    chart?: {
      ascendant?: string;
      planets?: Record<string, { sign?: string; house?: number }>;
      houses?: Array<{ house?: number; sign?: string }>;
    };
    timing?: { currentDasha?: string; dasha?: string; maha?: string; antara?: string };
  };
  chart?: {
    ascendant?: string;
    planets?: Record<string, { sign?: string; house?: number }>;
    houses?: Array<{ house?: number; sign?: string }>;
  };
}

function strengthFromHouse(house: number): HouseStrength {
  if ([1, 4, 7, 10].includes(house)) return 'strong';
  if ([3, 6, 9, 12].includes(house)) return 'weak';
  return 'average';
}

function getHouseLord(houses: Array<{ house?: number; sign?: string }> | undefined, houseNum: number): string {
  if (!houses?.length) return 'Unknown';
  const h = houses.find((x) => x.house === houseNum);
  const sign = (h?.sign ?? '') as string;
  return (sign && SIGN_LORDS[sign]) || 'Unknown';
}

/**
 * Build FinancialAstrologyState from natal chart payload. Requires chart with planets and houses.
 */
export function buildFinancialAstrologyState(payload: FinancialAstrologyChartPayload): FinancialAstrologyState {
  const data = payload.data ?? {};
  const chart = data.chart ?? payload.chart ?? {};
  const planets = chart.planets ?? {};
  if (!chart || Object.keys(planets).length === 0) {
    throw new Error(
      'Financial Astrology requires natal chart data. Generate your chart first to use Ask the Seer.'
    );
  }
  const houses = chart.houses ?? [];
  const ascendantSign =
    chart.ascendant ??
    (houses.find((h: { house?: number }) => h.house === 1) as { sign?: string } | undefined)?.sign ??
    'Unknown';

  const malefics = ['Mars', 'Saturn', 'Rahu', 'Ketu'];
  const planetInHouse = (houseNum: number): string[] => {
    return Object.entries(planets)
      .filter(([, p]) => (p as { house?: number }).house === houseNum)
      .map(([name]) => name);
  };
  const afflicted = (houseNum: number) =>
    planetInHouse(houseNum).some((p) => malefics.includes(p));

  const timing = data.timing ?? {};
  const dasha = timing.currentDasha ?? timing.dasha;
  const saturn = planets.Saturn ?? planets.saturn;
  const rahu = planets.Rahu ?? planets.rahu;

  const risk_indicators: { saturn?: string; rahu?: string } = {};
  if (saturn && (saturn as { house?: number }).house) {
    const sh = (saturn as { house?: number }).house ?? 0;
    risk_indicators.saturn = [1, 4, 7, 10].includes(sh) ? 'strong' : [6, 8, 12].includes(sh) ? 'weak' : 'average';
  }
  if (rahu && (rahu as { house?: number }).house) {
    risk_indicators.rahu = 'active';
  }

  return {
    ascendant: ascendantSign as string,
    money_houses: {
      2: { lord: getHouseLord(houses, 2), strength: strengthFromHouse(2) },
      11: { lord: getHouseLord(houses, 11), strength: strengthFromHouse(11) },
    },
    career_house: {
      10: { lord: getHouseLord(houses, 10), strength: strengthFromHouse(10) },
    },
    speculation_house: {
      5: { lord: getHouseLord(houses, 5), strength: strengthFromHouse(5), afflicted: afflicted(5) },
    },
    loss_houses: {
      6: { lord: getHouseLord(houses, 6), afflicted: afflicted(6) },
      8: { lord: getHouseLord(houses, 8), afflicted: afflicted(8) },
      12: { lord: getHouseLord(houses, 12), afflicted: afflicted(12) },
    },
    current_dasha: typeof dasha === 'string' ? dasha : dasha ? { maha: (dasha as any).maha, antara: (dasha as any).antara } : undefined,
    risk_indicators,
  };
}

/**
 * Classify Financial Astrology question. Valid: stable period, saving vs expansion, speculation, when cautious, risk profile. Invalid: stock pick, returns, buy/sell timing.
 */
export function classifyFinancialAstrologyQuestion(question: string): FinancialAstrologyQuestionType {
  const lower = question.toLowerCase().trim();

  if (
    /\b(which stock|what stock|buy (which|what)|sell (which|what)|how much will i earn|will this investment double|exact (buy|sell) timing|buy\/sell|trading timing|investment selection|price prediction|profit guarantee|which (sector|industry) (to )?invest|what (to )?invest in|recommend (a )?(stock|investment|asset)|predict (returns|gains|profits))\b/.test(
      lower
    )
  ) {
    return 'refusal';
  }
  if (
    /\b(is this a stable period|stable (period|phase) financially|financial stability)\b/.test(lower)
  ) {
    return 'stable_period';
  }
  if (
    /\b(should i prioritize (saving|expansion)|saving (or|vs) expansion|save (or|vs) spend)\b/.test(lower)
  ) {
    return 'saving_vs_expansion';
  }
  if (
    /\b(is speculation (favored|discouraged)|speculation (favored|good|bad)|speculate)\b/.test(lower)
  ) {
    return 'speculation_favored';
  }
  if (
    /\b(when (should i be )?cautious (with )?money|when to (be )?careful|caution with (money|finances))\b/.test(lower)
  ) {
    return 'when_cautious';
  }
  if (
    /\b(risk (profile|posture|level)|(my )?risk (tolerance|phase)|conservative|opportunistic)\b/.test(lower)
  ) {
    return 'risk_profile';
  }
  if (
    /\b(financ(e|ial)|money|wealth|income|savings|budget|investment (timing|readiness)|2nd|5th|8th|10th|11th|12th (house)|dasha)\b/.test(lower)
  ) {
    return 'general';
  }

  return 'general';
}

/** Mandatory disclaimer to include in every response. */
export const FINANCIAL_DISCLAIMER =
  'This analysis is based on traditional astrological interpretations and does not constitute financial advice.';

/**
 * Build slice for system prompt: state, house routing, house-lord supremacy, dasha timing, risk profiling, allowed framing, forbidden, disclaimer.
 */
export function getFinancialAstrologySliceForQuestionType(
  questionType: FinancialAstrologyQuestionType,
  state: FinancialAstrologyState
): string {
  if (questionType === 'refusal') {
    return `Refuse with: "Financial astrology does not evaluate specific investments or predict returns." Do not name assets, give return percentages, or suggest trading strategies.`;
  }

  const dashaStr = typeof state.current_dasha === 'string'
    ? state.current_dasha
    : state.current_dasha
      ? `Maha: ${(state.current_dasha as any).maha ?? 'unknown'}, Antara: ${(state.current_dasha as any).antara ?? 'unknown'}`
      : 'unknown';

  const stateBlock = `
FINANCIAL ASTROLOGY STATE (use this only):
- Ascendant: ${state.ascendant}
- Money houses: 2nd lord ${state.money_houses[2].lord}, strength ${state.money_houses[2].strength}; 11th lord ${state.money_houses[11].lord}, strength ${state.money_houses[11].strength}
- Career house: 10th lord ${state.career_house[10].lord}, strength ${state.career_house[10].strength}
- Speculation house: 5th lord ${state.speculation_house[5].lord}, afflicted=${state.speculation_house[5].afflicted}
- Loss houses: 6th ${state.loss_houses[6].lord} afflicted=${state.loss_houses[6].afflicted}; 8th ${state.loss_houses[8].lord} afflicted=${state.loss_houses[8].afflicted}; 12th ${state.loss_houses[12].lord} afflicted=${state.loss_houses[12].afflicted}
- Current dasha: ${dashaStr}
- Risk indicators: Saturn ${state.risk_indicators.saturn ?? 'n/a'}, Rahu ${state.risk_indicators.rahu ?? 'n/a'}
`.trim();

  const houseRoutingBlock = `
HOUSE ROUTING (financial domains):
- Income: 2nd, 11th houses
- Career income: 10th, 11th houses
- Savings: 2nd house
- Speculation: 5th house
- Loss/debt: 6th, 8th, 12th houses
- Assets: 4th, 11th houses
Always state: "This assessment is based on the 2nd and 11th houses" (or relevant houses). No symbolism dumping.
`.trim();

  const houseLordBlock = `
HOUSE LORD SUPREMACY:
- House lord condition > planets sitting in house
- Strong lord → stable expression; weak/afflicted lord → volatility or delay
- If house lord is weak, no transit optimism overrides it.
`.trim();

  const dashaBlock = `
DASHA TIMING:
- Dasha decides whether money themes activate
- Benefic dasha → smoother flow; malefic dasha → conservation and caution
- Dasha never guarantees gain. Phrase: "This period favors consolidation / caution / gradual growth."
`.trim();

  const riskBlock = `
RISK PROFILING (output risk posture only, not advice):
- Strong Saturn → slow, disciplined growth
- Active Rahu → temptation, volatility
- Afflicted 5th → speculation discouraged
- Strong 2nd + 11th → income stability
Classify: Conservative phase | Neutral phase | Opportunistic phase (rare)
`.trim();

  const allowedBlock = `
ALLOWED to say:
- Favorable periods for: budgeting, long-term planning, consolidation, reducing exposure
- Unfavorable periods for: speculation, leverage, impulsive spending
`.trim();

  const forbiddenBlock = `
FORBIDDEN:
- Asset names, return percentages, trading strategies
- "Buy/sell now", stock picks, sector recommendations
- Profit predictions, exact gains
`.trim();

  const framingBlock = `
ANSWER FRAMING (firm, unemotional):
Bad: "You will make good money."
Expert: "This period supports financial stability through controlled spending and long-term planning rather than risk-taking."
`.trim();

  const disclaimerBlock = `
MANDATORY DISCLAIMER (include in every response):
"${FINANCIAL_DISCLAIMER}"
`.trim();

  const disciplineBlock = `
DISCIPLINE (non-negotiable):
- Financial Astrology evaluates timing and risk posture, not profit outcomes.
- Financial Astrology manages exposure and timing, not wealth creation itself.
- Refuse: investment selection, price prediction, trading timing, high-risk encouragement.
`.trim();

  return `${stateBlock}

${houseRoutingBlock}

${houseLordBlock}

${dashaBlock}

${riskBlock}

${allowedBlock}

${forbiddenBlock}

${framingBlock}

${disclaimerBlock}

${disciplineBlock}`;
}
