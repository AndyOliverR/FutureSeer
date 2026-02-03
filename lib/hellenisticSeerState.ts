/**
 * Hellenistic Seer State and Slice Selector.
 * Rule-heavy, event-capable; no answer without sect and house rulership.
 * Rule: In Hellenistic astrology, planets act; signs color; houses decide topics; time-lords activate.
 */

import type { HellenisticAstrologyReading, PlanetaryDignity } from '@/lib/hellenisticAstrologyIntelligence';

export type HellenisticQuestionType =
  | 'career_status'
  | 'wealth_livelihood'
  | 'marriage_partnerships'
  | 'health_non_medical'
  | 'authority_recognition'
  | 'life_direction'
  | 'sect'
  | 'lots'
  | 'profections'
  | 'general'
  | 'refusal';

export type PlanetCondition = 'strong' | 'average' | 'weak';

export interface HellenisticState {
  sect: 'diurnal' | 'nocturnal';
  ascendant: string;
  houses: Record<string, { sign: string; ruler: string }>;
  planets: Record<string, { house: number; condition: PlanetCondition }>;
  lots: {
    fortune: { sign: string; house: number };
    spirit: { sign: string; house: number };
  };
  annual_profection: { age: number; house: number; lord: string };
  has_chart_data: boolean;
}

const TOPIC_TO_HOUSE: Record<string, number> = {
  career_status: 10,
  authority_recognition: 10,
  wealth_livelihood: 2,
  marriage_partnerships: 7,
  health_non_medical: 6,
  life_direction: 1, // 1st as primary; slice can add 9, 10
};

function planetCondition(
  dignity: PlanetaryDignity | undefined,
  sectType: 'day' | 'night',
  planetName: string
): PlanetCondition {
  if (!dignity) return 'average';
  const score = dignity.score ?? 0;
  const inSectBenefic =
    (sectType === 'day' && ['Sun', 'Jupiter', 'Saturn'].includes(planetName)) ||
    (sectType === 'night' && ['Moon', 'Venus', 'Mars'].includes(planetName));
  const outOfSectMalefic =
    (sectType === 'day' && ['Moon', 'Venus', 'Mars'].includes(planetName)) ||
    (sectType === 'night' && ['Sun', 'Jupiter', 'Saturn'].includes(planetName));
  const malefic = ['Mars', 'Saturn'].includes(planetName);

  if (score >= 4 && (inSectBenefic || !malefic)) return 'strong';
  if (score <= 1 || (outOfSectMalefic && malefic && score <= 2)) return 'weak';
  return 'average';
}

/**
 * Build HellenisticState from HellenisticAstrologyReading.
 */
export function buildHellenisticState(
  reading: HellenisticAstrologyReading | null | undefined
): HellenisticState {
  const empty: HellenisticState = {
    sect: 'diurnal',
    ascendant: '',
    houses: {},
    planets: {},
    lots: { fortune: { sign: '', house: 0 }, spirit: { sign: '', house: 0 } },
    annual_profection: { age: 0, house: 0, lord: '' },
    has_chart_data: false,
  };

  if (!reading) return empty;

  const sect: 'diurnal' | 'nocturnal' =
    reading.sect?.type === 'night' ? 'nocturnal' : 'diurnal';

  const houses: Record<string, { sign: string; ruler: string }> = {};
  for (const h of reading.houses || []) {
    const key = String(h.number);
    houses[key] = { sign: h.sign || '', ruler: h.ruler || '' };
  }

  const planets: Record<string, { house: number; condition: PlanetCondition }> = {};
  for (const p of reading.planets || []) {
    const dignity = reading.dignities?.[p.name];
    planets[p.name] = {
      house: p.house ?? 0,
      condition: planetCondition(dignity, reading.sect?.type || 'day', p.name),
    };
  }

  const fortune = reading.lots?.partOfFortune;
  const spirit = reading.lots?.partOfSpirit;
  const lots = {
    fortune: {
      sign: fortune?.sign || '',
      house: fortune?.house ?? 0,
    },
    spirit: {
      sign: spirit?.sign || '',
      house: spirit?.house ?? 0,
    },
  };

  const prof = reading.profections;
  const activatedHouse = prof?.activatedHouses?.[0] ?? 0;
  const annual_profection = {
    age: prof?.currentYear ?? 0,
    house: activatedHouse,
    lord: prof?.lord || '',
  };

  return {
    sect,
    ascendant: reading.ascendant?.sign || '',
    houses,
    planets,
    lots,
    annual_profection,
    has_chart_data: true,
  };
}

/**
 * Classify Hellenistic question. Returns refusal for therapy language, free-will absolutism, mixing systems.
 */
export function classifyHellenisticQuestion(question: string): HellenisticQuestionType {
  const lower = question.toLowerCase().trim();

  if (
    /therapy|heal\s+your\s+inner|psychological|only\s+you\s+decide|astrology\s+doesn't\s+determine|free\s+will|combine\s+with\s+vedic|combine\s+with\s+western|mix\s+(vedic|western|systems)/.test(
      lower
    )
  ) {
    return 'refusal';
  }

  if (
    /career|job|status|profession|work|promotion|10th\s+house|business/.test(lower)
  ) {
    return 'career_status';
  }

  if (
    /wealth|money|livelihood|income|2nd\s+house|financial|riches/.test(lower)
  ) {
    return 'wealth_livelihood';
  }

  if (
    /marriage|partner|relationship|spouse|7th\s+house|wedding|love\s+life/.test(
      lower
    )
  ) {
    return 'marriage_partnerships';
  }

  if (
    /health|constitution|6th\s+house|vitality|wellness|body/.test(lower)
  ) {
    return 'health_non_medical';
  }

  if (
    /authority|recognition|reputation|public\s+image|fame/.test(lower)
  ) {
    return 'authority_recognition';
  }

  if (
    /life\s+direction|life\s+purpose|purpose|destiny|soul|meaning\s+of\s+life/.test(
      lower
    )
  ) {
    return 'life_direction';
  }

  if (
    /sect|day\s+chart|night\s+chart|diurnal|nocturnal|sect\s+benefic|sect\s+malefic/.test(
      lower
    )
  ) {
    return 'sect';
  }

  if (
    /lot|part\s+of\s+fortune|part\s+of\s+spirit|fortune|spirit\s+lot/.test(lower)
  ) {
    return 'lots';
  }

  if (
    /profection|profected|year\s+lord|timing|when\s+will|current\s+year\s+of\s+life|activated\s+house/.test(
      lower
    )
  ) {
    return 'profections';
  }

  return 'general';
}

/**
 * Topic -> house number for routing.
 */
function getHouseForTopic(questionType: HellenisticQuestionType): number | null {
  const house = TOPIC_TO_HOUSE[questionType];
  return house != null ? house : null;
}

/**
 * Build slice for system prompt: sect, ascendant, houses, planets, lots, profection; topic->house->ruler->condition for topic types.
 */
export function getHellenisticSliceForQuestionType(
  questionType: HellenisticQuestionType,
  state: HellenisticState
): string {
  const lines: string[] = [];

  if (!state.has_chart_data) {
    return 'Hellenistic chart data missing. Cannot answer without sect and house rulership.';
  }

  lines.push(`sect: ${state.sect}`);
  lines.push(`ascendant: ${state.ascendant}`);

  const topicHouse = getHouseForTopic(questionType);
  if (topicHouse != null) {
    const key = String(topicHouse);
    const houseData = state.houses[key];
    if (houseData) {
      const ruler = houseData.ruler;
      const planetData = state.planets[ruler];
      const cond = planetData?.condition ?? 'average';
      const topicLabel =
        questionType === 'career_status' || questionType === 'authority_recognition'
          ? 'Career/status (10th house)'
          : questionType === 'wealth_livelihood'
            ? 'Wealth (2nd house)'
            : questionType === 'marriage_partnerships'
              ? 'Marriage (7th house)'
              : questionType === 'health_non_medical'
                ? 'Health (6th house)'
                : 'Life direction (1st house)';
      lines.push(
        `${topicLabel}: sign ${houseData.sign}, ruler ${ruler}. ${ruler} condition: ${cond}.`
      );
    }
  }

  lines.push('houses:');
  for (let i = 1; i <= 12; i++) {
    const h = state.houses[String(i)];
    if (h) lines.push(`  ${i}: ${h.sign} ruler ${h.ruler}`);
  }

  lines.push('planets (house, condition):');
  for (const [name, data] of Object.entries(state.planets)) {
    lines.push(`  ${name}: house ${data.house} condition ${data.condition}`);
  }

  lines.push('lots:');
  lines.push(
    `  fortune: ${state.lots.fortune.sign} house ${state.lots.fortune.house}`
  );
  lines.push(
    `  spirit: ${state.lots.spirit.sign} house ${state.lots.spirit.house}`
  );

  lines.push('annual_profection:');
  lines.push(
    `  age ${state.annual_profection.age} house ${state.annual_profection.house} lord ${state.annual_profection.lord}`
  );

  return lines.join('\n');
}
