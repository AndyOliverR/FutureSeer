/**
 * Navaratna Seer State and Slice Selector.
 * Vedic remedial system: Lagnesh supremacy, functional benefic/malefic, Maraka hard-block.
 * Rule: No gemstone unless planet is functionally benefic and safe to strengthen.
 */

import type { NavaratnaAnalysis, PlanetaryAnalysis } from '@/lib/navaratnaIntelligence';

export interface GemstoneEligibilityState {
  ascendant: string;
  lagnesh: string;
  functional_benefics: string[];
  functional_malefics: string[];
  maraka_planets: string[];
  planet_strength: Record<string, string>;
  current_dasha: string | null;
  allowed_gemstones: string[];
  forbidden_gemstones: string[];
  safety_warnings: string[];
}

export type NavaratnaQuestionType =
  | 'which_stone'
  | 'is_safe'
  | 'dasha_stone'
  | 'why_avoid'
  | 'general'
  | 'refusal';

/**
 * Build GemstoneEligibilityState from NavaratnaAnalysis.
 * Requires analysis.chartSummary and ascendant/lagnesh; throws if essential data missing.
 */
export function buildNavaratnaGemstoneState(
  analysis: NavaratnaAnalysis
): GemstoneEligibilityState {
  if (!analysis?.chartSummary) {
    throw new Error(
      'Gemstone recommendations cannot be made safely without full chart validation.'
    );
  }

  const chartSummary = analysis.chartSummary;
  const ascendantSign =
    typeof chartSummary.ascendant === 'object' && chartSummary.ascendant?.sign
      ? chartSummary.ascendant.sign
      : (chartSummary as any).ascendant;
  const lagnesh = chartSummary.lagnesh || (chartSummary.ascendant as any)?.lord;
  if (!lagnesh && !ascendantSign) {
    throw new Error(
      'Gemstone recommendations cannot be made safely without full chart validation.'
    );
  }

  const planetaryAnalysis = analysis.planetaryAnalysis || [];
  const functional_benefics = planetaryAnalysis
    .filter((p: PlanetaryAnalysis) => p.isFunctionalBenefic)
    .map((p: PlanetaryAnalysis) => p.planet);
  const functional_malefics = planetaryAnalysis
    .filter((p: PlanetaryAnalysis) => p.isFunctionalMalefic)
    .map((p: PlanetaryAnalysis) => p.planet);
  const maraka_planets = planetaryAnalysis
    .filter((p: PlanetaryAnalysis) => p.isMaraka)
    .map((p: PlanetaryAnalysis) => p.planet);

  const planet_strength: Record<string, string> = {};
  planetaryAnalysis.forEach((p: PlanetaryAnalysis) => {
    planet_strength[p.planet] = p.strength;
  });

  const current_dasha = chartSummary.currentDasha?.planet ?? null;

  const allowed_gemstones: string[] = [];
  const recs = analysis.recommendations || {};
  if (recs.lifeStone?.gemstone?.english) {
    allowed_gemstones.push(recs.lifeStone.gemstone.english);
  }
  (recs.beneficStones || []).forEach((s: any) => {
    if (s?.gemstone?.english && !allowed_gemstones.includes(s.gemstone.english)) {
      allowed_gemstones.push(s.gemstone.english);
    }
  });
  if (recs.dashaStone?.gemstone?.english && !allowed_gemstones.includes(recs.dashaStone.gemstone.english)) {
    allowed_gemstones.push(recs.dashaStone.gemstone.english);
  }

  const forbidden_gemstones = (recs.avoidedStones || []).map(
    (s: { planet: string; gemstone: string; reason: string }) => s.gemstone
  );

  const safety_warnings = analysis.safetyWarnings || [];

  return {
    ascendant: ascendantSign || 'Unknown',
    lagnesh: lagnesh || 'Unknown',
    functional_benefics,
    functional_malefics,
    maraka_planets,
    planet_strength,
    current_dasha,
    allowed_gemstones,
    forbidden_gemstones,
    safety_warnings,
  };
}

/**
 * Classify Navaratna question. Refusal for outcome promises, arbitrary multi-stone, override-safety.
 */
export function classifyNavaratnaQuestion(
  question: string
): NavaratnaQuestionType {
  const lower = question.toLowerCase().trim();

  if (
    /\b(will (this|gemstone|stone) make me (rich|successful|famous)|guarantee|change destiny|override karma|promise.*(result|outcome))\b/.test(
      lower
    )
  ) {
    return 'refusal';
  }
  if (
    /\b(wear multiple stones? together|multiple gemstones? (at once|together)|can i wear (all|several) stones?)\b/.test(
      lower
    )
  ) {
    return 'refusal';
  }
  if (
    /\b(ignore safety|skip testing|without (testing|consultation)|override (safety|rules))\b/.test(
      lower
    )
  ) {
    return 'refusal';
  }

  if (
    /which gemstone should i wear|what (stone|gemstone) (should i |to )?wear|recommend (a )?gemstone/.test(
      lower
    )
  ) {
    return 'which_stone';
  }
  if (
    /is (.+ )?(gemstone|stone) safe for me|safe to wear|suitable for (my )?chart/.test(
      lower
    )
  ) {
    return 'is_safe';
  }
  if (
    /(what should i wear in )?(my )?current dasha|dasha (stone|period)|wear in dasha/.test(
      lower
    )
  ) {
    return 'dasha_stone';
  }
  if (
    /why (should i )?avoid (this )?(stone|gemstone)|avoid (this )?gemstone|should i avoid/.test(
      lower
    )
  ) {
    return 'why_avoid';
  }

  return 'general';
}

/**
 * Build slice for system prompt: ascendant, Lagnesh, functional benefics/malefics, Maraka, strength, Dasha, allowed/forbidden, safety; Lagnesh supremacy and discipline note.
 */
export function getNavaratnaSliceForQuestionType(
  questionType: NavaratnaQuestionType,
  state: GemstoneEligibilityState,
  analysis: NavaratnaAnalysis
): string {
  if (questionType === 'refusal') {
    return 'Refuse with: "Gemstones modify planetary expression; they do not override karma." or for override/safety: "Gemstone recommendations cannot be made safely without full chart validation."';
  }

  const recs = analysis.recommendations || {};
  const lifeStone = recs.lifeStone;
  const lifeStoneName = lifeStone?.gemstone?.english;

  const lagneshBlock = `
ASCENDANT: ${state.ascendant}
LAGNESH (Ascendant Lord): ${state.lagnesh}
LAGNESH SUPREMACY: Life Stone = Lagnesh gemstone. When recommending the Life Stone, state explicitly: "This is your Life Stone because it strengthens the Ascendant."
${lifeStoneName ? `LIFE STONE (recommended): ${lifeStoneName}` : ''}
`.trim();

  const formatWearing = (stone: {
    gemstone?: { english?: string };
    wearingInstructions?: { day?: string; time?: string; metal?: string; finger?: string; hand?: string; mantra?: string; purification?: string; special?: string };
    weight?: { min?: string; ideal?: string; max?: string; note?: string };
  }) => {
    const wi = stone.wearingInstructions || {};
    const w = stone.weight || {};
    const lines: string[] = [];
    if (stone.gemstone?.english) lines.push(`Gemstone: ${stone.gemstone.english}`);
    if (wi.day) lines.push(`Day: ${wi.day}`);
    if (wi.time) lines.push(`Time: ${wi.time}`);
    if (wi.metal) lines.push(`Metal: ${wi.metal}`);
    if (wi.finger) lines.push(`Finger: ${wi.finger}${wi.hand ? `, ${wi.hand} hand` : ''}`);
    if (w.ideal || w.min || w.max) lines.push(`Weight: ${w.min || w.ideal || '—'}–${w.max || w.ideal || '—'} ratti (ideal: ${w.ideal || '—'})${w.note ? `. ${w.note}` : ''}`);
    if (wi.mantra) lines.push(`Mantra: ${wi.mantra}`);
    if (wi.purification) lines.push(`Purification: ${wi.purification}`);
    if (wi.special) lines.push(`Special: ${wi.special}`);
    return lines.join('\n');
  };

  const wearingBlocks: string[] = [];
  if (lifeStone) {
    wearingBlocks.push(`LIFE STONE WEARING INSTRUCTIONS:\n${formatWearing(lifeStone)}`);
  }
  const dashaStone = recs.dashaStone;
  if (dashaStone) {
    wearingBlocks.push(`DASHA STONE WEARING INSTRUCTIONS:\n${formatWearing(dashaStone)}`);
  }
  const beneficStones = recs.beneficStones || [];
  if (beneficStones.length > 0) {
    const beneficLines = beneficStones.map((s: any) => {
      const wi = s.wearingInstructions || {};
      const w = s.weight || {};
      return `${s.gemstone?.english || s.planet}: Day ${wi.day || '—'}, Metal ${wi.metal || '—'}, Finger ${wi.finger || '—'}, Weight ${w.ideal || '—'} ratti, Mantra: ${wi.mantra || '—'}`;
    });
    wearingBlocks.push(`BENEFIC STONES WEARING INSTRUCTIONS:\n${beneficLines.join('\n')}`);
  }
  const wearingBlock =
    wearingBlocks.length > 0
      ? `
WEARING INSTRUCTIONS (cite these exact values when answering how to wear a recommended gemstone; do not say "correct weight/metal/finger" without giving the values):
${wearingBlocks.join('\n\n')}
`.trim()
      : '';

  const functionalBlock = `
FUNCTIONAL BENEFICS (may be strengthened if weak/safe): ${state.functional_benefics.join(', ') || 'None'}
FUNCTIONAL MALEFICS (do not strengthen with gemstones): ${state.functional_malefics.join(', ') || 'None'}
MARAKA PLANETS (NEVER recommend gemstones for these): ${state.maraka_planets.join(', ') || 'None'}
`.trim();

  const strengthBlock =
    Object.keys(state.planet_strength).length > 0
      ? `
PLANET STRENGTH:
${Object.entries(state.planet_strength)
  .map(([p, s]) => `  ${p}: ${s}`)
  .join('\n')}
`.trim()
      : '';

  const dashaBlock = state.current_dasha
    ? `
CURRENT DASHA: ${state.current_dasha}
DASHA RULE: Dasha planet may be strengthened only if functionally benefic and not Maraka. Otherwise say: "Even though this planet is active in Dasha, strengthening it is not advised."
`.trim()
    : 'CURRENT DASHA: Not available.';

  const stonesBlock = `
ALLOWED GEMSTONES (chart-supported): ${state.allowed_gemstones.join(', ') || 'None'}
FORBIDDEN GEMSTONES (avoid): ${state.forbidden_gemstones.join(', ') || 'None'}
`.trim();

  const safetyBlock =
    state.safety_warnings.length > 0
      ? `
SAFETY WARNINGS:
${state.safety_warnings.map((w) => `  - ${w}`).join('\n')}
Include testing period for intense stones (e.g. Blue Sapphire). State: "This gemstone should not be worn without testing due to its intensity." where relevant.
`.trim()
      : 'SAFETY: Include testing period for intense stones (e.g. Blue Sapphire) and contraindication warnings when relevant.';

  const disciplineNote = `
DISCIPLINE (non-negotiable):
- No gemstone may be recommended unless the planet is both FUNCTIONALLY BENEFIC and SAFE TO STRENGTHEN.
- Never recommend gemstones for Maraka planets.
- Recommend minimum gemstones only; procedural accuracy (weight, metal, finger, day, mantra) from analysis.
- Gemstones amplify planetary energy; they do not discriminate between good and bad outcomes.
`.trim();

  return `${lagneshBlock}
${wearingBlock ? `\n\n${wearingBlock}` : ''}

${functionalBlock}
${strengthBlock}

${dashaBlock}

${stonesBlock}
${safetyBlock}

${disciplineNote}`;
}
