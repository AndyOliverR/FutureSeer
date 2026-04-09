/**
 * Feng Shui Seer State and Slice.
 * Feng Shui optimizes space; it does not force results.
 * Rule: Feng Shui removes resistance; it does not replace effort.
 */

import type { FengShuiAnalysis } from '@/lib/fengshui/fengShuiService';
import { PRACTICAL_GUIDE_SLICE_BULLETS } from '@/lib/fengshui/practicalGuides';

export interface FengShuiState {
  property_type: string;
  usage: string;
  facing_direction: string;
  current_period?: number;
  occupant_profile: {
    kua_number: number;
    life_element: string;
    favorable_directions: { success: string; health: string; relationships: string; wisdom: string };
    unfavorable_directions: string[];
  };
  layout?: {
    main_door?: string;
    bedroom?: string;
    kitchen?: string;
    toilet?: string;
  };
}

export type FengShuiQuestionType =
  | 'layout_supportive'
  | 'where_to_place'
  | 'blockage'
  | 'improve_stability_health_focus'
  | 'general'
  | 'refusal';

/** Optional overrides for layout and facing when provided by the user. */
export interface FengShuiStateOverrides {
  facing_direction?: string;
  layout?: FengShuiState['layout'];
  property_type?: string;
  usage?: string;
}

/**
 * Build FengShuiState from FengShuiAnalysis. Layout/facing default to unknown when not provided.
 * Pass optional overrides (e.g. from client layout form) to use user-provided facing and layout.
 */
export function buildFengShuiState(
  analysis: FengShuiAnalysis,
  overrides?: FengShuiStateOverrides
): FengShuiState {
  if (!analysis?.kua) {
    throw new Error(
      'Feng Shui analysis requires Kua and occupant data. Complete your profile and generate analysis first.'
    );
  }

  const kua = analysis.kua;
  const layout = overrides?.layout;
  const hasLayout =
    layout &&
    (layout.main_door != null ||
      layout.bedroom != null ||
      layout.kitchen != null ||
      layout.toilet != null);

  return {
    property_type: overrides?.property_type ?? 'residential',
    usage: overrides?.usage ?? 'residential',
    facing_direction:
      overrides?.facing_direction?.trim() && overrides.facing_direction.toLowerCase() !== 'unknown'
        ? overrides.facing_direction.trim()
        : 'unknown',
    current_period: 9,
    occupant_profile: {
      kua_number: kua.number,
      life_element: kua.element,
      favorable_directions: kua.favorableDirections,
      unfavorable_directions: kua.unfavorableDirections ?? [],
    },
    layout: hasLayout ? layout : undefined,
  };
}

/**
 * Classify Feng Shui question. Refuse predictions, guarantees, timing.
 */
export function classifyFengShuiQuestion(question: string): FengShuiQuestionType {
  const lower = question.toLowerCase().trim();

  if (
    /\b(will this bring (money|wealth|success)|will this guarantee|when will (things )?change|predict|guarantee|certain (to|that)|definitely (bring|get))\b/.test(
      lower
    )
  ) {
    return 'refusal';
  }
  if (
    /\b(is (this )?layout supportive|layout (supportive|good)|space (supportive|support))\b/.test(
      lower
    )
  ) {
    return 'layout_supportive';
  }
  if (
    /\b(where (should|can) i place|where to put|where to place|placement (of|for))\b/.test(
      lower
    )
  ) {
    return 'where_to_place';
  }
  if (
    /\b(what (area|zone) (is )?causing (blockage|problem)|blockage|blocked (qi|energy)|obstruction)\b/.test(
      lower
    )
  ) {
    return 'blockage';
  }
  if (
    /\b(how (can i |to )?improve (stability|health|work focus|focus|productivity|relationships)|improve (stability|health|focus))\b/.test(
      lower
    )
  ) {
    return 'improve_stability_health_focus';
  }
  if (
    /\b(feng shui|chi|qi|bagua|kua|element|room|space|layout|direction)\b/.test(
      lower
    )
  ) {
    return 'general';
  }

  return 'refusal';
}

/**
 * Build slice for system prompt: state, Form School first, occupant compatibility, minimal cures, school isolation, permanent rule.
 */
export function getFengShuiSliceForQuestionType(
  questionType: FengShuiQuestionType,
  state: FengShuiState,
  _analysis: FengShuiAnalysis
): string {
  if (questionType === 'refusal') {
    return 'Refuse with: "Feng Shui adjusts environmental influence, not destiny." or "Feng Shui analysis requires accurate spatial data to be reliable."';
  }

  const occ = state.occupant_profile;
  const fav = occ.favorable_directions;
  const unfav = occ.unfavorable_directions;

  const stateBlock = `
FENG SHUI STATE (use this only):
- Property type: ${state.property_type}; Usage: ${state.usage}
- Facing direction: ${state.facing_direction}
- Current period: ${state.current_period ?? 'unknown'}
- Occupant: Kua ${occ.kua_number}, ${occ.life_element} element
- Favorable directions: Success ${fav.success}, Health ${fav.health}, Relationships ${fav.relationships}, Wisdom ${fav.wisdom}
- Unfavorable directions: ${unfav.length ? unfav.join(', ') : 'none listed'}
- Layout: ${state.layout ? `main_door ${state.layout.main_door ?? '?'}, bedroom ${state.layout.bedroom ?? '?'}, kitchen ${state.layout.kitchen ?? '?'}, toilet ${state.layout.toilet ?? '?'}` : 'unknown (base advice on occupant and Form School principles only)'}
`.trim();

  const formSchoolBlock = `
FORM SCHOOL (always first; non-negotiable):
- Qi must enter, circulate, and settle. Evaluate: entrance, flow path, rest areas, work areas.
- Blocked doors = blocked opportunity. Sharp corners = stress. Toilets at center = instability.
- If Form is bad, do not apply advanced cures. Address flow and blockage first.
`.trim();

  const occupantBlock = `
OCCUPANT COMPATIBILITY (Eight Mansions / Kua):
- Kua determines favorable directions for this person. Sleeping, working, sitting direction matters.
- Say: "This space is supportive / draining for you specifically." No generic advice.
- Incompatible directions = fatigue, resistance.
`.trim();

  const cureBlock = `
CURE LOGIC (minimalism is expertise):
- Allowed: repositioning, decluttering, light, airflow, color moderation, subtle elemental balance.
- Forbidden: excess objects, symbol stacking, aggressive remedies.
- Rule: One issue → one correction.
`.trim();

  const schoolBlock = `
SCHOOL ISOLATION (critical):
- Lock to one school per answer. Hierarchy: (1) Form School first, (2) Eight Mansions (Kua) for occupant suitability, (3) Flying Star only if time-based and precise.
- Never mix rules mid-answer.
`.trim();

  const disciplineBlock = `
DISCIPLINE (non-negotiable):
- No predictions, no promises (e.g. "this will bring wealth"). Feng Shui optimizes space; it does not force results.
- Answer practical, unemotional. Example: "Repositioning the work desk improves focus and reduces obstruction, supporting steadier output."
- Refuse: missing facing/layout when critical; requests for guarantees; mixing astrology outcomes.
- Permanent rule: Feng Shui removes resistance; it does not replace effort.
`.trim();

  const facingUnknown =
    !state.facing_direction ||
    state.facing_direction.trim() === '' ||
    state.facing_direction.toLowerCase() === 'unknown';
  const layoutMissing =
    !state.layout ||
    (state.layout.main_door == null &&
      state.layout.bedroom == null &&
      state.layout.kitchen == null &&
      state.layout.toilet == null);
  const spatialIncomplete = facingUnknown || layoutMissing;
  const caveat = spatialIncomplete
    ? '\n\nSpatial data is incomplete; offer general principles, not specific placements.'
    : '';

  const practicalBlock = `
ON-PAGE PRACTICAL GUIDES (align answers with these themes when relevant; still no guarantees):
${PRACTICAL_GUIDE_SLICE_BULLETS}
`.trim();

  return `${stateBlock}

${formSchoolBlock}

${occupantBlock}

${cureBlock}

${schoolBlock}

${disciplineBlock}

${practicalBlock}${caveat}`;
}
