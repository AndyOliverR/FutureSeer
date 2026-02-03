/**
 * Mundane Astrology Seer State and Slice.
 * Rule: Mundane Astrology describes collective conditions and pressures, not specific outcomes.
 */

export interface MundaneState {
  scope: string;
  reference_chart: string;
  slow_planets: Record<string, string>;
  key_cycles: string[];
  eclipse_axis?: string;
  sector_focus: string[];
  country?: string;
}

export type MundaneQuestionType =
  | 'themes'
  | 'pressures'
  | 'stability'
  | 'sectors'
  | 'general'
  | 'refusal';

/** Refusal phrase for missing chart. */
export const MUNDANE_REFUSAL_DATA_PHRASE =
  'Mundane astrology insights require a chart. Generate your mundane analysis first.';

/** Refusal phrase for event prediction. */
export const MUNDANE_REFUSAL_EVENT_PHRASE =
  'Mundane astrology does not predict specific events or outcomes.';

/** Extract planet sign from cycle name like "Pluto in Capricorn" or "Saturn in Pisces" */
function parsePlanetSign(name: string): { planet: string; sign: string } | null {
  const match = name.match(/^(Pluto|Saturn|Jupiter|Uranus|Neptune)\s+in\s+(\w+)/i);
  if (!match) return null;
  return { planet: match[1].toLowerCase(), sign: match[2].toLowerCase() };
}

/** Default slow planet positions (fallback when cycles don't provide them) */
const DEFAULT_SLOW_PLANETS: Record<string, string> = {
  saturn: 'pisces',
  jupiter: 'gemini',
  uranus: 'taurus',
  neptune: 'pisces',
  pluto: 'aquarius',
};

/**
 * Build MundaneState from analysis data.
 * Requires at least ingressCharts OR planetaryCycles.
 */
export function buildMundaneState(data: any): MundaneState {
  if (!data) {
    throw new Error(MUNDANE_REFUSAL_DATA_PHRASE);
  }

  const ingressCharts = data.ingressCharts || [];
  const planetaryCycles = data.planetaryCycles || [];
  const analysisCycles = data.analysis?.cycles || [];
  const hasIngress = Array.isArray(ingressCharts) && ingressCharts.length > 0;
  const hasCycles =
    (Array.isArray(planetaryCycles) && planetaryCycles.length > 0) ||
    (Array.isArray(analysisCycles) && analysisCycles.length > 0);

  if (!hasIngress && !hasCycles) {
    throw new Error(MUNDANE_REFUSAL_DATA_PHRASE);
  }

  const scope = data.country ? 'country' : 'global';
  const year = data.eventDate
    ? new Date(data.eventDate).getFullYear()
    : new Date().getFullYear();

  let reference_chart = `Aries_Ingress_${year}`;
  if (ingressCharts[0]?.type) {
    reference_chart = `${String(ingressCharts[0].type).replace(/\s+/g, '_')}_${year}`;
  }

  const slow_planets: Record<string, string> = { ...DEFAULT_SLOW_PLANETS };
  const cycleSources = analysisCycles.length > 0 ? analysisCycles : planetaryCycles;
  for (const c of cycleSources) {
    const name = typeof c === 'string' ? c : c?.name;
    if (!name) continue;
    const parsed = parsePlanetSign(name);
    if (parsed) {
      slow_planets[parsed.planet] = parsed.sign;
    }
  }
  for (const c of planetaryCycles) {
    const currentSign = c?.currentSign;
    if (currentSign && c?.name) {
      if (/Jupiter-Saturn|Great Conjunction/i.test(c.name)) {
        slow_planets.jupiter = currentSign.toLowerCase().split(/[\s/]/)[0] || slow_planets.jupiter;
        slow_planets.saturn = slow_planets.jupiter;
      } else if (/Saturn-Pluto/i.test(c.name)) {
        slow_planets.saturn = currentSign.toLowerCase().split(/[\s/]/)[0] || slow_planets.saturn;
        slow_planets.pluto = slow_planets.saturn;
      } else if (/Jupiter-Neptune/i.test(c.name)) {
        slow_planets.neptune = currentSign.toLowerCase();
      }
    }
  }

  const key_cycles = [
    ...planetaryCycles.map((c: any) => c?.name).filter(Boolean),
    ...analysisCycles.map((c: any) => (typeof c === 'string' ? c : c?.name)).filter(Boolean),
  ].filter(Boolean);
  const uniqueCycles = [...new Set(key_cycles)];

  let eclipse_axis: string | undefined;
  const eclipseCharts = data.eclipseCharts || [];
  if (eclipseCharts.length > 0) {
    const signs = eclipseCharts
      .map((e: any) => e?.sign?.toLowerCase())
      .filter(Boolean);
    if (signs.length > 0) {
      const axisMap: Record<string, string> = {
        aries: 'libra',
        libra: 'aries',
        taurus: 'scorpio',
        scorpio: 'taurus',
        gemini: 'sagittarius',
        sagittarius: 'gemini',
        cancer: 'capricorn',
        capricorn: 'cancer',
        leo: 'aquarius',
        aquarius: 'leo',
        virgo: 'pisces',
        pisces: 'virgo',
      };
      const first = signs[0];
      const opposite = axisMap[first];
      eclipse_axis = opposite ? `${first}-${opposite}` : signs.join('-');
    }
  }

  const sectorForecasts = data.sectorForecasts || [];
  const sector_focus = sectorForecasts.map((s: any) => (s?.sector || '').toLowerCase()).filter(Boolean);

  return {
    scope,
    reference_chart,
    slow_planets,
    key_cycles: uniqueCycles,
    eclipse_axis,
    sector_focus: sector_focus.length > 0 ? sector_focus : ['governance', 'economy', 'technology'],
    country: data.country,
  };
}

/**
 * Classify Mundane Astrology question.
 * Refuse: event prediction, election winners, market forecasts.
 * Valid: themes, pressures, stability, sectors.
 */
export function classifyMundaneQuestion(question: string): MundaneQuestionType {
  const lower = question.toLowerCase().trim();

  // Refusal - event prediction
  if (
    /\b(will (a |the )?war (start|break)|will the market crash|who will win|exact event|when will .+ happen)\b/.test(
      lower
    )
  ) {
    return 'refusal';
  }
  if (
    /\b(predict (the |specific)|forecast (exact|specific|price)|guarantee|definitely (will|won't))\b/.test(
      lower
    )
  ) {
    return 'refusal';
  }

  // Valid question types
  if (
    /\b(what themes (define|for) (this )?year|themes (for |of )?(this )?year|global themes)\b/.test(
      lower
    )
  ) {
    return 'themes';
  }
  if (
    /\b(what pressures (affect|on)|pressures (affect|on) (government|governments)|government pressures)\b/.test(
      lower
    )
  ) {
    return 'pressures';
  }
  if (
    /\b(stabilizing or volatile|stable period|volatile period|is this (a )?(stable|volatile))\b/.test(
      lower
    )
  ) {
    return 'stability';
  }
  if (
    /\b(which sectors (face|have)|sectors face disruption|sector disruption)\b/.test(lower)
  ) {
    return 'sectors';
  }

  // General mundane questions
  if (
    /\b(mundane|collective|global (trend|cycle)|national (trend|mood)|ingress|eclipse)\b/.test(
      lower
    )
  ) {
    return 'general';
  }

  return 'general';
}

/**
 * Build system prompt slice for Mundane Astrology.
 * Enforces reference-chart supremacy, slow-planet dominance, theme-only framing.
 */
export function getMundaneSliceForQuestionType(
  questionType: MundaneQuestionType,
  state: MundaneState
): string {
  if (questionType === 'refusal') {
    return `Refuse with: "${MUNDANE_REFUSAL_EVENT_PHRASE}" Do not predict wars, crashes, election winners, or exact events. Mundane astrology reflects collective trends, not specific events.`;
  }

  const slowPlanetEntries = Object.entries(state.slow_planets)
    .map(([k, v]) => `- ${k}: ${v}`)
    .join('\n');

  const stateBlock = `
MUNDANE STATE (use this only):
- Scope: ${state.scope}
- Reference chart: ${state.reference_chart}
${state.country ? `- Country: ${state.country}` : ''}
- Slow planets:
${slowPlanetEntries}
- Key cycles: ${state.key_cycles.join(', ') || 'none'}
${state.eclipse_axis ? `- Eclipse axis: ${state.eclipse_axis}` : ''}
- Sector focus: ${state.sector_focus.join(', ')}
`.trim();

  const referenceBlock = `
REFERENCE-CHART SUPREMACY:
Ingress charts (Aries, Cancer, Libra, Capricorn) define tone. National charts apply only when scope = country. Personal charts are irrelevant.
Always state explicitly: "This is based on the ${state.reference_chart.replace(/_/g, ' ')} for the period."
`.trim();

  const slowPlanetBlock = `
SLOW-PLANET DOMINANCE:
Mundane astrology prioritizes: Saturn (structure, authority), Jupiter (expansion, policy), Uranus (disruption, reform), Neptune (confusion, ideology), Pluto (power shifts). Fast planets are noise, not drivers.
`.trim();

  const cycleBlock = `
CYCLE INTERPRETATION (pressure, not prophecy):
Hard aspects = tension, restructuring. Soft aspects = integration, adjustment. New sign ingresses = phase change.
Say "This suggests increased pressure around…" Never say "This will cause…"
`.trim();

  const sectorBlock = `
SECTOR MAPPING:
- 10th / Saturn: governments
- 2nd / 8th: economy, debt
- 11th / Uranus: technology, networks
- 4th: land, housing, nationalism
`.trim();

  const timeBlock = `
TIME FRAMING:
Use months, quarters, years only. Never days or exact dates. Eclipses = heightened sensitivity windows, not events.
`.trim();

  const framingBlock = `
ANSWER FRAMING:
Measured, analytical. Example: "This period emphasizes restructuring of authority and rapid technological shifts, increasing uncertainty before new systems stabilize."
No alarmism. No "this year will be chaotic." Describe themes and pressures, not outcomes.
`.trim();

  const permanentRule = `
PERMANENT RULE:
Mundane Astrology interprets collective cycles and pressures, not individual or event-level certainty.
`.trim();

  return `${stateBlock}

${referenceBlock}

${slowPlanetBlock}

${cycleBlock}

${sectorBlock}

${timeBlock}

${framingBlock}

${permanentRule}`;
}
