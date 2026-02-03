/**
 * Synastry Seer State and Slice Selector.
 * Relational mechanics, not destiny. Dual chart state; aspect priority; house overlays; malefic realism.
 * Rule: Synastry explains interaction patterns, not destiny.
 */

import type {
  SynastryCompatibility,
  PersonNatalSummary,
  SynastryAspect,
  HouseOverlay,
} from '@/hooks/useSynastry';

export interface SynastryDualChartState {
  person_a: PersonNatalSummary;
  person_b: PersonNatalSummary;
  aspects_priority: Array<{
    planet1: string;
    planet2: string;
    aspect: string;
    orb: number;
    influence: string;
  }>;
  house_overlays: Array<{ planet: string; house: number; person: string; description: string }>;
  composite_summary: string;
}

export type SynastryQuestionType =
  | 'attraction'
  | 'emotional_compatibility'
  | 'communication'
  | 'power_dynamics'
  | 'long_term_friction'
  | 'refusal'
  | 'general';

/** Aspect pair priority: 1 = highest (Moon–Moon, Moon–Sun, etc.), higher number = lower priority. */
const ASPECT_PRIORITY_ORDER: Array<[string, string]> = [
  ['Moon', 'Moon'],
  ['Moon', 'Sun'],
  ['Sun', 'Moon'],
  ['Sun', 'Sun'],
  ['Venus', 'Mars'],
  ['Mars', 'Venus'],
  ['Mercury', 'Mercury'],
];

function aspectPairKey(planet1: string, planet2: string): string {
  return [planet1, planet2].sort().join('-');
}

function priorityScore(planet1: string, planet2: string): number {
  const key = aspectPairKey(planet1, planet2);
  const idx = ASPECT_PRIORITY_ORDER.findIndex(
    ([a, b]) => aspectPairKey(a, b) === key
  );
  if (idx >= 0) return idx;
  const outer = ['Uranus', 'Neptune', 'Pluto'];
  if (outer.includes(planet1) || outer.includes(planet2)) return 100;
  return 50;
}

/**
 * Build SynastryDualChartState from SynastryCompatibility.
 * Requires analysis.person1Natal and analysis.person2Natal; throws if either missing.
 */
export function buildSynastryDualChartState(
  analysis: SynastryCompatibility
): SynastryDualChartState {
  if (!analysis.person1Natal || !analysis.person2Natal) {
    throw new Error(
      'Two complete charts are required. Run Synastry analysis for both people first to use Ask the Seer.'
    );
  }

  const aspects = analysis.aspects || [];
  const aspects_priority = [...aspects].sort((a, b) => {
    const scoreA = priorityScore(a.planet1, a.planet2);
    const scoreB = priorityScore(b.planet1, b.planet2);
    return scoreA - scoreB;
  }).map((a) => ({
    planet1: a.planet1,
    planet2: a.planet2,
    aspect: a.aspect,
    orb: a.orb,
    influence: a.influence,
  }));

  const house_overlays = (analysis.houseOverlays || []).map((o: HouseOverlay) => ({
    planet: o.planet,
    house: o.house,
    person: o.person === 'person1' ? 'Person 1' : 'Person 2',
    description: o.description,
  }));

  const comp = analysis.composite;
  const composite_summary = comp
    ? `Composite: ${comp.sunSign} Sun, ${comp.moonSign} Moon, ${comp.ascendant} Ascendant. ${comp.description}`
    : 'Composite not available.';

  return {
    person_a: analysis.person1Natal,
    person_b: analysis.person2Natal,
    aspects_priority,
    house_overlays,
    composite_summary,
  };
}

/**
 * Classify Synastry question. Refusal for marriage/divorce, soulmates, who loves more; valid for dynamics.
 */
export function classifySynastryQuestion(
  question: string
): SynastryQuestionType {
  const lower = question.toLowerCase().trim();

  if (
    /will we (marry|get married|marriage)|when will we (break up|divorce|split)|soulmate|soul mate|who loves (more|most)|are we meant to be|prediction.*(marriage|divorce)|will (we|they) (marry|divorce)/.test(
      lower
    )
  ) {
    return 'refusal';
  }

  if (
    /attraction|chemistry|spark|drawn to|attracted|magnetic/.test(lower)
  ) {
    return 'attraction';
  }
  if (
    /emotional (compatibility|connection|fit)|feelings|nurturing|emotional needs/.test(
      lower
    )
  ) {
    return 'emotional_compatibility';
  }
  if (
    /communication|communicate|talk|conversation|intellectual|mind|mercury/.test(
      lower
    )
  ) {
    return 'communication';
  }
  if (
    /power|control|dominance|conflict|friction|mars|pluto|saturn.*relationship/.test(
      lower
    )
  ) {
    return 'power_dynamics';
  }
  if (
    /long-?term|sustainability|lasting|durability|friction points|challenges|growth areas/.test(
      lower
    )
  ) {
    return 'long_term_friction';
  }

  return 'general';
}

/**
 * Build slice for system prompt. Include person_a, person_b, aspects_priority, house_overlays, composite_summary; discipline note.
 */
export function getSynastrySliceForQuestionType(
  questionType: SynastryQuestionType,
  state: SynastryDualChartState,
  analysis: SynastryCompatibility
): string {
  if (questionType === 'refusal') {
    return 'Synastry describes interaction patterns, not fate outcomes. Refuse with: "Synastry cannot determine outcomes without individual readiness."';
  }

  const personABlock = `
person_a (Person 1 natal):
  sun: ${state.person_a.sun.sign} (house ${state.person_a.sun.house})
  moon: ${state.person_a.moon.sign} (house ${state.person_a.moon.house})
  venus: ${state.person_a.venus.sign} (house ${state.person_a.venus.house})
  mars: ${state.person_a.mars.sign} (house ${state.person_a.mars.house})
`.trim();

  const personBBlock = `
person_b (Person 2 natal):
  sun: ${state.person_b.sun.sign} (house ${state.person_b.sun.house})
  moon: ${state.person_b.moon.sign} (house ${state.person_b.moon.house})
  venus: ${state.person_b.venus.sign} (house ${state.person_b.venus.house})
  mars: ${state.person_b.mars.sign} (house ${state.person_b.mars.house})
`.trim();

  const aspectsBlock =
    state.aspects_priority.length > 0
      ? `aspects (priority order: Moon–Moon, Moon–Sun, Sun–Sun, Venus–Mars, Mercury–Mercury first):\n${state.aspects_priority
          .slice(0, 20)
          .map(
            (a) =>
              `  ${a.planet1}-${a.planet2} ${a.aspect} (orb ${a.orb.toFixed(1)}) ${a.influence}`
          )
          .join('\n')}`
      : 'No aspects in state.';

  const keyOverlays = state.house_overlays.filter(
    (o) => [5, 7, 8].includes(o.house) && ['Sun', 'Moon', 'Venus', 'Mars', 'Saturn', 'Pluto'].includes(o.planet)
  );
  const overlaysBlock =
    keyOverlays.length > 0
      ? `house_overlays (key: 5th=romance, 7th=partnership, 8th=intensity):\n${keyOverlays
          .map((o) => `  ${o.planet} in ${o.person}'s house ${o.house}: ${o.description}`)
          .join('\n')}`
      : `house_overlays:\n${state.house_overlays.slice(0, 15).map((o) => `  ${o.planet} in ${o.person}'s house ${o.house}`).join('\n')}`;

  const disciplineNote =
    'Individual chart supremacy: synastry never overrides individual charts. Aspect order: Moon–Moon, Moon–Sun, Sun–Sun, Venus–Mars, Mercury–Mercury; outer planets context only. House overlays matter more than sign harmony. Malefics (Saturn, Mars, Pluto) are binding/friction/power—do not sugarcoat. Composite describes the relationship entity; use only secondarily. Frame as dynamics, not outcomes.';

  return `${personABlock}

${personBBlock}

${aspectsBlock}

${overlaysBlock}

${state.composite_summary}

${disciplineNote}`;
}
