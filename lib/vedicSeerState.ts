/**
 * Vedic Seer State and Chart-Layer Router.
 * Structured state; Dasha supremacy; slice-by-question-type only.
 * Rule: Dasha decides possibility; transit decides timing; remedies reduce friction.
 */

export type VedicQuestionType =
  | 'timing'
  | 'event_confirmation'
  | 'career'
  | 'marriage'
  | 'health'
  | 'remedies'
  | 'dasha'
  | 'general'
  | 'refusal';

export interface VedicDashas {
  mahadasha: string;
  antardasha?: string;
  period: string;
  startDate?: string;
  endDate?: string;
}

const LAGNA_SIGN_TO_LORD: Record<string, string> = {
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
  Pisces: 'Jupiter'
};

function getLagnaLord(lagnaSign: string): string {
  if (!lagnaSign) return '';
  const key = lagnaSign.trim().charAt(0).toUpperCase() + lagnaSign.trim().slice(1).toLowerCase();
  return LAGNA_SIGN_TO_LORD[key] || '';
}

export interface VedicState {
  lagna: string;
  lagna_lord: string;
  moon_sign: string;
  nakshatra: string;
  dashas: VedicDashas | null;
  yogas: string[];
  doshas: string[];
  houses: Record<string, { lord: string; occupants: string[] }>;
  planet_strength: Record<string, string>;
  transits: Array<{ planet: string; house: number | string }> | Record<string, { house: number } | { house: string }>;
}

type ChartInput = {
  ascendant?: { signName?: string; sign?: string; degree?: number };
  planets?: Record<string, { signName?: string; sign?: string; house?: number; nakshatra?: string; dignity?: { strength?: string } }> | Array<{ name: string; signName?: string; sign?: string; house?: number; nakshatra?: string; dignity?: { strength?: string } }>;
  houses?: Record<string, { signName?: string; lord?: string; planets?: string[] }> | Array<{ signName?: string; lord?: string; planets?: string[] }>;
  currentDasha?: { planet?: string; name?: string; antardasha?: string; startDate?: string; endDate?: string; progress?: number };
  transits?: { favorable?: any[]; challenging?: any[]; [k: string]: any };
  yogas?: Array<{ name?: string } | string>;
  doshas?: string[];
};

/** One-line theme for current dasha (for slice). */
const DASHA_THEMES: Record<string, string> = {
  Sun: 'leadership, recognition, authority',
  Moon: 'emotions, intuition, nurturing',
  Mars: 'action, courage, initiative',
  Mercury: 'communication, learning, commerce',
  Jupiter: 'growth, wisdom, expansion',
  Venus: 'relationships, beauty, harmony',
  Saturn: 'discipline, structure, karma',
  Rahu: 'innovation, ambition, material drive',
  Ketu: 'spirituality, release, past karma'
};

function getPlanetMap(planets: ChartInput['planets']): Record<string, { sign?: string; house?: number; nakshatra?: string; strength?: string }> {
  const map: Record<string, { sign?: string; house?: number; nakshatra?: string; strength?: string }> = {};
  if (!planets) return map;
  if (Array.isArray(planets)) {
    for (const p of planets) {
      const name = p.name || '';
      if (!name) continue;
      const key = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
      map[key] = {
        sign: p.signName || p.sign,
        house: p.house,
        nakshatra: p.nakshatra,
        strength: (p.dignity as any)?.strength || 'average'
      };
    }
    return map;
  }
  for (const [name, data] of Object.entries(planets)) {
    if (!data || typeof data !== 'object') continue;
    const d = data as any;
    map[name] = {
      sign: d.signName || d.sign,
      house: d.house,
      nakshatra: d.nakshatra,
      strength: d.dignity?.strength || 'average'
    };
  }
  return map;
}

function getHousesMap(houses: ChartInput['houses']): Record<string, { lord: string; occupants: string[] }> {
  const result: Record<string, { lord: string; occupants: string[] }> = {};
  if (!houses) return result;
  if (Array.isArray(houses)) {
    houses.forEach((h, i) => {
      const num = String(i + 1);
      result[num] = {
        lord: (h as any).lord || '',
        occupants: Array.isArray((h as any).planets) ? (h as any).planets : []
      };
    });
    return result;
  }
  for (const [num, h] of Object.entries(houses)) {
    const data = h as any;
    result[num] = {
      lord: data?.lord || '',
      occupants: Array.isArray(data?.planets) ? data.planets : []
    };
  }
  return result;
}

/**
 * Build Vedic state from chart data. Does not recompute Dasha; uses only what is passed.
 */
export function buildVedicState(
  vedicChartData: ChartInput | null | undefined,
  _userProfile?: { birthDate?: string } | null
): VedicState {
  if (!vedicChartData) {
    return {
      lagna: '',
      lagna_lord: '',
      moon_sign: '',
      nakshatra: '',
      dashas: null,
      yogas: [],
      doshas: [],
      houses: {},
      planet_strength: {},
      transits: []
    };
  }

  const lagna = vedicChartData.ascendant?.signName || vedicChartData.ascendant?.sign || '';
  const lagna_lord = getLagnaLord(lagna);
  const planetMap = getPlanetMap(vedicChartData.planets);
  const moon = planetMap['Moon'] || {};
  const moon_sign = moon.sign || '';
  const nakshatra = moon.nakshatra || '';

  let dashas: VedicDashas | null = null;
  const cur = vedicChartData.currentDasha;
  if (cur && (cur.planet || cur.name)) {
    const start = cur.startDate || '';
    const end = cur.endDate || '';
    dashas = {
      mahadasha: cur.planet || cur.name || '',
      antardasha: cur.antardasha,
      period: start && end ? `${start}–${end}` : start || end || 'current',
      startDate: start || undefined,
      endDate: end || undefined
    };
  }

  const housesMap = getHousesMap(vedicChartData.houses);
  const planet_strength: Record<string, string> = {};
  for (const [name, data] of Object.entries(planetMap)) {
    let str = (data as any).strength;
    if (!str || typeof str !== 'string') str = 'average';
    const lower = str.toLowerCase();
    if (lower.includes('exalt') || lower.includes('strong') || lower.includes('very strong')) planet_strength[name] = 'strong';
    else if (lower.includes('weak') || lower.includes('debilitat')) planet_strength[name] = 'weak';
    else planet_strength[name] = 'average';
  }

  let transits: VedicState['transits'] = [];
  const tr = vedicChartData.transits;
  if (tr && typeof tr === 'object') {
    if (Array.isArray(tr.favorable)) {
      for (const t of tr.favorable) {
        if (t && typeof t === 'object' && 'planet' in t) transits.push({ planet: (t as any).planet, house: (t as any).house ?? 0 });
      }
    }
    if (Array.isArray(tr.challenging)) {
      for (const t of tr.challenging) {
        if (t && typeof t === 'object' && 'planet' in t) transits.push({ planet: (t as any).planet, house: (t as any).house ?? 0 });
      }
    }
  }

  const rawYogas = (vedicChartData as any).yogas;
  const yogas: string[] = [];
  if (Array.isArray(rawYogas)) {
    for (const y of rawYogas) {
      if (typeof y === 'string') yogas.push(y);
      else if (y && typeof y === 'object' && (y as any).name) yogas.push((y as any).name);
    }
  }
  const rawDoshas = (vedicChartData as any).doshas;
  const doshas: string[] = Array.isArray(rawDoshas) ? rawDoshas.filter((d): d is string => typeof d === 'string') : [];

  return {
    lagna,
    lagna_lord,
    moon_sign,
    nakshatra,
    dashas,
    yogas,
    doshas,
    houses: housesMap,
    planet_strength,
    transits
  };
}

/**
 * Classify Vedic question. Returns refusal for medical diagnosis, death prediction, absolute certainty.
 */
export function classifyVedicQuestion(question: string): VedicQuestionType {
  const lower = question.toLowerCase().trim();

  if (
    /medical\s+diagnosis|diagnose\s+my|when\s+will\s+i\s+die|exact\s+time\s+of\s+death|time\s+of\s+death|will\s+i\s+definitely|100%\s+certain|absolute\s+certainty|guarantee\s+(i|that)|certain\s+outcome/.test(
      lower
    )
  ) {
    return 'refusal';
  }

  if (/when\s+will|when\s+can|when\s+should|timing|what\s+period|which\s+year|which\s+month/.test(lower)) return 'timing';
  if (/will\s+(this|i)\s+(get|have|happen|marry|find)|will\s+i\s+ever|will\s+it\s+happen/.test(lower)) return 'event_confirmation';
  if (/career|job|promotion|work|profession|10th\s+house|business/.test(lower)) return 'career';
  if (/marriage|marry|spouse|partner|7th\s+house|wedding|relationship/.test(lower)) return 'marriage';
  if (/health|wellness|6th\s+house|8th\s+house|12th\s+house|illness/.test(lower)) return 'health';
  if (/gemstone|which\s+gem|what\s+gem|most\s+apt\s+gem|buy\s+.*gem|purchase\s+.*gem|remedy|remedies|mitigation|upaya|what\s+can\s+i\s+do\s+to/.test(lower)) return 'remedies';
  if (/dasha|mahadasha|antardasha|planetary\s+period|current\s+period/.test(lower)) return 'dasha';

  return 'general';
}

const DASHA_DEPENDENT_TYPES: VedicQuestionType[] = ['timing', 'event_confirmation', 'career', 'marriage', 'dasha'];

/**
 * Build slice for system prompt: only layers allowed for this question type.
 * If Dasha is missing and type requires it, include Missing Dasha line.
 */
export function getVedicSliceForQuestionType(questionType: VedicQuestionType, state: VedicState): string {
  if (questionType === 'refusal') return '';

  const lines: string[] = [];
  lines.push('# Vedic chart state (use only these to answer)');
  lines.push('');
  lines.push('Rule: Dasha decides possibility; transit decides timing; remedies reduce friction.');
  lines.push('');

  const needsDasha = DASHA_DEPENDENT_TYPES.includes(questionType);
  if (needsDasha && !state.dashas) {
    lines.push('Missing Dasha. User must generate Vedic report with birth time to get Dasha. Ask once or refuse prediction.');
    return lines.join('\n').trim();
  }

  switch (questionType) {
    case 'timing':
      if (state.dashas) {
        lines.push('## Dasha');
        lines.push(`- Mahadasha: ${state.dashas.mahadasha}, Antardasha: ${state.dashas.antardasha || 'N/A'}, Period: ${state.dashas.period}`);
        const theme = DASHA_THEMES[state.dashas.mahadasha];
        if (theme) lines.push(`- Current dasha theme: ${theme}`);
        lines.push('');
      }
      if (state.transits && (Array.isArray(state.transits) ? state.transits.length : Object.keys(state.transits).length)) {
        lines.push('## Transits (confirm timing only; do not override Dasha)');
        if (Array.isArray(state.transits)) {
          state.transits.forEach(t => lines.push(`- ${t.planet} in house ${t.house}`));
        } else {
          Object.entries(state.transits).forEach(([pl, h]) => lines.push(`- ${pl}: house ${(h as any).house}`));
        }
        lines.push('');
      }
      break;

    case 'event_confirmation':
      if (state.dashas) {
        lines.push('## Dasha');
        lines.push(`- Mahadasha: ${state.dashas.mahadasha}, Antardasha: ${state.dashas.antardasha || 'N/A'}, Period: ${state.dashas.period}`);
        const themeEc = DASHA_THEMES[state.dashas.mahadasha];
        if (themeEc) lines.push(`- Current dasha theme: ${themeEc}`);
        lines.push('');
      }
      lines.push('## Houses (lord, occupants)');
      for (const [num, h] of Object.entries(state.houses)) {
        if (num && h.lord) lines.push(`- House ${num}: Lord ${h.lord}, Occupants: ${(h.occupants || []).join(', ') || 'None'}`);
      }
      lines.push('');
      lines.push('## Planet strength');
      for (const [pl, str] of Object.entries(state.planet_strength)) {
        lines.push(`- ${pl}: ${str}`);
      }
      lines.push('');
      break;

    case 'career':
      if (state.dashas) {
        lines.push('## Dasha');
        lines.push(`- Mahadasha: ${state.dashas.mahadasha}, Antardasha: ${state.dashas.antardasha || 'N/A'}, Period: ${state.dashas.period}`);
        const themeCar = DASHA_THEMES[state.dashas.mahadasha];
        if (themeCar) lines.push(`- Current dasha theme: ${themeCar}`);
        lines.push('');
      }
      for (const key of ['10', '2', '6', '11']) {
        const h = state.houses[key];
        if (h) lines.push(`- House ${key}: Lord ${h.lord}, Occupants: ${(h.occupants || []).join(', ') || 'None'}`);
      }
      const careerPlanets = ['Mercury', 'Jupiter', 'Saturn', 'Mars'];
      careerPlanets.forEach(pl => {
        if (state.planet_strength[pl]) lines.push(`- ${pl} strength: ${state.planet_strength[pl]}`);
      });
      lines.push('');
      break;

    case 'marriage':
      if (state.dashas) {
        lines.push('## Dasha');
        lines.push(`- Mahadasha: ${state.dashas.mahadasha}, Antardasha: ${state.dashas.antardasha || 'N/A'}, Period: ${state.dashas.period}`);
        const themeMar = DASHA_THEMES[state.dashas.mahadasha];
        if (themeMar) lines.push(`- Current dasha theme: ${themeMar}`);
        lines.push('');
      }
      const h7 = state.houses['7'];
      if (h7) lines.push(`- House 7: Lord ${h7.lord}, Occupants: ${(h7.occupants || []).join(', ') || 'None'}`);
      if (state.planet_strength['Venus']) lines.push(`- Venus strength: ${state.planet_strength['Venus']}`);
      if (state.planet_strength['Jupiter']) lines.push(`- Jupiter strength: ${state.planet_strength['Jupiter']}`);
      lines.push('');
      break;

    case 'health':
      for (const key of ['6', '8', '12']) {
        const h = state.houses[key];
        if (h) lines.push(`- House ${key}: Lord ${h.lord}, Occupants: ${(h.occupants || []).join(', ') || 'None'}`);
      }
      lines.push('(Non-medical framing only; no diagnosis.)');
      lines.push('');
      break;

    case 'remedies':
      lines.push('## Lagna and Lagna lord (for gemstone/remedy)');
      const llStrength = state.lagna_lord ? (state.planet_strength[state.lagna_lord] || 'average') : 'N/A';
      lines.push(`- Lagna: ${state.lagna || 'N/A'}, Lagna lord: ${state.lagna_lord || 'N/A'}, Strength: ${llStrength}`);
      lines.push('');
      lines.push('## Weak/afflicted planets (1 planet → 1 remedy set)');
      for (const [pl, str] of Object.entries(state.planet_strength)) {
        if (str === 'weak') lines.push(`- ${pl}: weak`);
      }
      if (state.dashas) {
        lines.push(`- Current Dasha: ${state.dashas.mahadasha} (${state.dashas.period})`);
      }
      lines.push('');
      break;

    case 'dasha':
      if (state.dashas) {
        lines.push('## Dasha');
        lines.push(`- Mahadasha: ${state.dashas.mahadasha}, Antardasha: ${state.dashas.antardasha || 'N/A'}`);
        lines.push(`- Period: ${state.dashas.period}`);
        if (state.dashas.startDate) lines.push(`- Start: ${state.dashas.startDate}`);
        if (state.dashas.endDate) lines.push(`- End: ${state.dashas.endDate}`);
        const themeD = DASHA_THEMES[state.dashas.mahadasha];
        if (themeD) lines.push(`- Current dasha theme: ${themeD}`);
        lines.push('');
      }
      break;

    default:
      lines.push('## Core');
      lines.push(`- Lagna: ${state.lagna || 'N/A'}, Moon sign: ${state.moon_sign || 'N/A'}, Nakshatra: ${state.nakshatra || 'N/A'}`);
      if (state.dashas) {
        lines.push(`- Dasha: ${state.dashas.mahadasha} (${state.dashas.period})`);
        const themeG = DASHA_THEMES[state.dashas.mahadasha];
        if (themeG) lines.push(`- Current dasha theme: ${themeG}`);
      }
      lines.push('');
      for (const [num, h] of Object.entries(state.houses)) {
        if (num && h.lord) lines.push(`- House ${num}: Lord ${h.lord}, Occupants: ${(h.occupants || []).join(', ') || 'None'}`);
      }
      lines.push('');
      break;
  }

  const sliceTypesWithYogasDoshas: VedicQuestionType[] = ['general', 'career', 'marriage', 'event_confirmation'];
  if (sliceTypesWithYogasDoshas.includes(questionType)) {
    if (state.yogas?.length) {
      lines.push('## Yogas');
      state.yogas.forEach(name => lines.push(`- ${name}`));
      lines.push('');
    }
    if (state.doshas?.length) {
      lines.push('## Doshas');
      state.doshas.forEach(d => lines.push(`- ${d}`));
      lines.push('');
    }
  }

  return lines.join('\n').trim();
}
