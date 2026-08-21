/**
 * Deterministic Navagraha guidance from persisted Vedic + Navaratna reports.
 * No LLM calls. Does not invent chart facts that are not in the input.
 */

import { COLOR_THERAPY, MUDRA_DATABASE } from '@/lib/remedyDatabase';
import { getLalKitabRemediesForPlanet, type LalKitabRemedy } from '@/lib/lalKitabRemedies';
import type { GemstoneRecommendation, NavaratnaAnalysis, PlanetaryAnalysis } from '@/lib/navaratnaIntelligence';

export const GRAHA_NAMES = [
  'Sun',
  'Moon',
  'Mars',
  'Mercury',
  'Jupiter',
  'Venus',
  'Saturn',
  'Rahu',
  'Ketu',
] as const;

export type GrahaName = (typeof GRAHA_NAMES)[number];

export type EvidenceCode =
  | 'current_dasha'
  | 'antardasha'
  | 'debilitated'
  | 'weak_dignity'
  | 'difficult_house'
  | 'functional_malefic'
  | 'functional_benefic'
  | 'navaratna_caution'
  | 'navaratna_recommended'
  | 'navaratna_avoid'
  | 'is_lagnesh'
  | 'is_dasha_lord';

export type FunctionalRole = 'functional_benefic' | 'functional_malefic' | 'mixed';

export type GuidanceViewState = 'loading' | 'signed_out' | 'no_profile' | 'partial' | 'personalized';

export type PlanetaryActionKind =
  | 'conduct'
  | 'service'
  | 'mantra'
  | 'color'
  | 'mudra'
  | 'upaya'
  | 'gemstone';

export type GemstoneStance = 'recommended' | 'avoid' | 'consult' | 'none';

export interface EvidenceItem {
  code: EvidenceCode;
  reason: string;
}

export interface PlanetPlacement {
  planet: GrahaName;
  sign: string | null;
  house: number | null;
  nakshatra: string | null;
  dignity: string | null;
  functionalRole: FunctionalRole | null;
  isNaturalBenefic: boolean;
  isNaturalMalefic: boolean;
  isLagnesh: boolean;
  isDashaLord: boolean;
  isAntardashaLord: boolean;
}

export interface PlanetaryAction {
  kind: PlanetaryActionKind;
  title: string;
  description: string;
  instructions?: string[];
  traditionLabel?: string;
  contraindications?: string[];
  gemstoneStance?: GemstoneStance;
}

export interface GrahaGuidance {
  planet: GrahaName;
  placement: PlanetPlacement;
  /** Clear weekly demand from this graha. */
  wants: string;
  /** Lived pattern when that demand is avoided. */
  whenIgnored: string;
  /** Chart-aware teaching (base demand + placement/dignity notes). */
  teaching: string;
  evidence: EvidenceItem[];
  attentionScore: number;
  startHere: PlanetaryAction[];
  deepenPractice: PlanetaryAction[];
  traditionalUpayas: PlanetaryAction[];
  gemstoneGuidance: PlanetaryAction | null;
}

export interface PlanetaryGuidance {
  hasVedicChart: boolean;
  hasNavaratna: boolean;
  currentDashaPlanet: GrahaName | null;
  currentAntardashaPlanet: GrahaName | null;
  lagnaSign: string | null;
  rankedPlanets: GrahaName[];
  topPlanets: GrahaName[];
  grahas: Record<GrahaName, GrahaGuidance>;
}

const NATURAL_BENEFICS: ReadonlySet<GrahaName> = new Set(['Jupiter', 'Venus', 'Mercury', 'Moon']);
const NATURAL_MALEFICS: ReadonlySet<GrahaName> = new Set(['Sun', 'Mars', 'Saturn', 'Rahu', 'Ketu']);
const DIFFICULT_HOUSES = new Set([6, 8, 12]);

const GRAHA_ALIASES: Record<string, GrahaName> = {
  sun: 'Sun',
  surya: 'Sun',
  ravi: 'Sun',
  moon: 'Moon',
  chandra: 'Moon',
  soma: 'Moon',
  mars: 'Mars',
  mangal: 'Mars',
  kuja: 'Mars',
  angaraka: 'Mars',
  mercury: 'Mercury',
  budha: 'Mercury',
  budh: 'Mercury',
  jupiter: 'Jupiter',
  guru: 'Jupiter',
  brihaspati: 'Jupiter',
  venus: 'Venus',
  shukra: 'Venus',
  saturn: 'Saturn',
  shani: 'Saturn',
  rahu: 'Rahu',
  'north node': 'Rahu',
  ketu: 'Ketu',
  'south node': 'Ketu',
};

const DEMAND_BY_GRAHA: Record<
  GrahaName,
  { wants: string; whenIgnored: string; teachingBase: string }
> = {
  Sun: {
    wants: 'Lead one area of life this week and put your name on it — without burning the people beside you.',
    whenIgnored:
      'Shrinking in rooms that matter, chasing approval, deleting what you almost posted, confidence that collapses under a raised eyebrow.',
    teachingBase:
      'Identity and integrity — the Sun asks you to exist fully. Recognition follows when purpose is clean and ownership is real.',
  },
  Moon: {
    wants: 'Feel what is actually happening inside without immediately fixing, scrolling, or explaining it away — and keep one steady sleep rhythm.',
    whenIgnored:
      'Sourceless anxiety, sleep that never satisfies, comfort-seeking that does not comfort, mood shifts you cannot name.',
    teachingBase:
      'Emotional rhythm and care — the Moon asks for honesty of feeling and boundaries that protect it. Rhythm steadies more than intensity.',
  },
  Mars: {
    wants: 'Finish one thing you have been avoiding — specifically because you do not feel like it — instead of starting six new ones.',
    whenIgnored:
      'Hot starts and quiet abandonments, sideways irritability, fights that escalate past the situation, heat with nowhere useful to go.',
    teachingBase:
      'Courage and clean effort — Mars wants discipline in the unglamorous middle, not another burst of motivation.',
  },
  Mercury: {
    wants: 'Say or write one clear true thing, and keep one account, message, or list accurate.',
    whenIgnored:
      'Scattered attention, half-finished conversations, nervous overthinking, clever talk that avoids the real point.',
    teachingBase:
      'Clear speech and honest skill — the mind settles when you say one true thing and keep one account straight.',
  },
  Jupiter: {
    wants: 'Study one page of something meaningful and share one useful kindness without overpromising.',
    whenIgnored:
      'Empty optimism, advice without practice, expansion that skips ethics, teaching others while skipping your own homework.',
    teachingBase:
      'Wisdom and generosity — expansion lands when learning, teaching, and ethics stay together.',
  },
  Venus: {
    wants: 'Choose one pleasure or relationship act that truly nourishes instead of numbing or buying approval.',
    whenIgnored:
      'Excess without satisfaction, charm without care, beauty treated as distraction, relationships run on performance.',
    teachingBase:
      'Value, beauty, and relationship — Venus asks you to choose what nourishes over what only distracts.',
  },
  Saturn: {
    wants: 'Keep one promise on time — preferably something overdue and unglamorous.',
    whenIgnored:
      'Avoidance dressed as waiting, dread around structure, broken small commitments, delays that accumulate into weight.',
    teachingBase:
      'Patience, structure, and kept promises — delays often mean refinement, not rejection. Saturn respects repeated honesty.',
  },
  Rahu: {
    wants: 'Name one strong desire and take one honest skill step — without switching paths for status or novelty.',
    whenIgnored:
      'Restless comparison, shiny new starts, hunger that runs the whole life, chasing image instead of craft.',
    teachingBase:
      'Desire and unfamiliar paths — growth comes from naming the hunger without letting it run the whole life.',
  },
  Ketu: {
    wants: 'Release one unused hold — an object, habit, or identity story — and sit with the quiet that follows.',
    whenIgnored:
      'Clinging to what no longer serves, spiritual bypass, detachment that is really avoidance, noise where simplicity is needed.',
    teachingBase:
      'Release and inner clarity — what falls away can make room for a simpler, truer practice.',
  },
};

const CONDUCT_BY_GRAHA: Record<GrahaName, PlanetaryAction> = {
  Sun: {
    kind: 'conduct',
    title: 'Own one thing this week',
    description:
      'Pick one area of life and lead it visibly. Morning daylight and clean speech support Surya as lifestyle — not as medical protocol.',
    instructions: [
      'Choose one responsibility and put your name on a decision or deliverable.',
      'If practical, take a short morning pause outdoors facing the light (no guarantees — just rhythm).',
      'Speak one true opinion without shrinking or exaggerating.',
    ],
    traditionLabel: 'Lifestyle',
  },
  Moon: {
    kind: 'conduct',
    title: 'Steady rhythm; feel without fixing',
    description:
      'Protect the same bedtime and wake time for a week. Feed the Moon honesty of feeling before distraction.',
    instructions: [
      'Keep the same sleep window for seven days, even when mood shifts.',
      'Journal one feeling at night (feelings, not a to-do list).',
      'Sit near water or drink slowly once today — as calming rhythm, not a cure.',
    ],
    traditionLabel: 'Lifestyle',
  },
  Mars: {
    kind: 'conduct',
    title: 'Finish the avoided task',
    description:
      'Mars relaxes when you complete something you did not feel like finishing. Channel heat into completion, not argument.',
    instructions: [
      'Pick one avoided task and finish it completely this week.',
      'Do purposeful movement (walk, stretch, or physical work) once when irritability rises.',
      'Pause three breaths before a sharp reply.',
    ],
    traditionLabel: 'Lifestyle',
  },
  Mercury: {
    kind: 'conduct',
    title: 'One clear true message',
    description: 'Mercury steadies when speech, writing, and accounts stay honest and specific.',
    instructions: [
      'Write or send one accurate sentence about what you need.',
      'Correct one small error in a list, message, or bill.',
      'Listen fully before answering once today.',
    ],
    traditionLabel: 'Lifestyle',
  },
  Jupiter: {
    kind: 'conduct',
    title: 'Study and share one useful thing',
    description: 'Wisdom grows when optimism meets a real practice of learning and generosity.',
    instructions: [
      'Read or study one page of a meaningful text.',
      'Share knowledge or a meal without keeping score.',
      'Avoid overpromising; keep counsel modest and useful.',
    ],
    traditionLabel: 'Lifestyle',
  },
  Venus: {
    kind: 'conduct',
    title: 'Nourish instead of numb',
    description: 'Care for one relationship, space, or craft with quality rather than accumulation.',
    instructions: [
      'Beautify or clean one small space with attention.',
      'Offer kindness in a relationship without buying approval.',
      'Choose one pleasure that restores rather than numbs.',
    ],
    traditionLabel: 'Lifestyle',
  },
  Saturn: {
    kind: 'conduct',
    title: 'Keep one promise on time',
    description: 'Saturn teaches through structure. Small, repeated honesty outweighs dramatic effort.',
    instructions: [
      'Complete one overdue task, even a small one.',
      'Show up on time for one obligation.',
      'Simplify one commitment instead of adding another.',
    ],
    traditionLabel: 'Lifestyle',
  },
  Rahu: {
    kind: 'conduct',
    title: 'Name the desire; stay with the skill',
    description: 'Rahu grows useful when novelty is noticed and skill is practiced longer than the itch to switch.',
    instructions: [
      'Write down one strong desire and one next honest step.',
      'Stay with an existing skill for a set period instead of starting a new one.',
      'Notice where comparison or status is driving a choice.',
    ],
    traditionLabel: 'Lifestyle',
  },
  Ketu: {
    kind: 'conduct',
    title: 'Release one unused hold',
    description: 'Ketu clarifies through letting go — a habit, object, or identity that no longer serves.',
    instructions: [
      'Give away or discard one unused item.',
      'Sit in silence for a few minutes without a goal.',
      'Practice not explaining yourself once today.',
    ],
    traditionLabel: 'Lifestyle',
  },
};

const MANTRA_BY_GRAHA: Record<GrahaName, PlanetaryAction> = {
  Sun: {
    kind: 'mantra',
    title: 'Om Suryaya Namah',
    description: 'A traditional Surya namah practice for clarity of purpose. Treat this as spiritual practice, not a guaranteed outcome.',
    instructions: ['Sit quietly in the morning if possible.', 'Recite “Om Suryaya Namah” 11 or 108 times.', 'Keep the mind on integrity rather than status.'],
    traditionLabel: 'Mantra practice',
  },
  Moon: {
    kind: 'mantra',
    title: 'Om Chandraya Namah',
    description: 'A traditional Chandra namah practice for emotional steadiness.',
    instructions: ['Prefer evening or a calm indoor space.', 'Recite “Om Chandraya Namah” 11 or 108 times.', 'Breathe slowly and do not force a mood.'],
    traditionLabel: 'Mantra practice',
  },
  Mars: {
    kind: 'mantra',
    title: 'Om Mangalaya Namah',
    description: 'A traditional Mangala namah practice for clean courage.',
    instructions: ['Recite “Om Mangalaya Namah” 11 or 108 times.', 'Follow with one completed physical task.', 'Do not use this to justify aggression.'],
    traditionLabel: 'Mantra practice',
  },
  Mercury: {
    kind: 'mantra',
    title: 'Om Budhaya Namah',
    description: 'A traditional Budha namah practice for clear speech and learning.',
    instructions: ['Recite “Om Budhaya Namah” 11 or 108 times.', 'Speak one sentence more carefully than usual afterward.'],
    traditionLabel: 'Mantra practice',
  },
  Jupiter: {
    kind: 'mantra',
    title: 'Om Gurave Namah',
    description: 'A traditional Guru namah practice for humility and wisdom.',
    instructions: ['Recite “Om Gurave Namah” 11 or 108 times.', 'Follow with a small act of teaching, study, or generosity.'],
    traditionLabel: 'Mantra practice',
  },
  Venus: {
    kind: 'mantra',
    title: 'Om Shukraya Namah',
    description: 'A traditional Shukra namah practice for right relationship and taste.',
    instructions: ['Recite “Om Shukraya Namah” 11 or 108 times.', 'Choose one kind or beautiful action without excess.'],
    traditionLabel: 'Mantra practice',
  },
  Saturn: {
    kind: 'mantra',
    title: 'Om Shanaye Namah',
    description: 'A traditional Shani namah practice for patience and responsibility.',
    instructions: ['Recite “Om Shanaye Namah” 11 or 108 times.', 'Keep one promise afterward, however small.'],
    traditionLabel: 'Mantra practice',
  },
  Rahu: {
    kind: 'mantra',
    title: 'Om Rahave Namah',
    description: 'A traditional Rahu namah practice for conscious desire. Use as awareness, not as a way to force results.',
    instructions: ['Recite “Om Rahave Namah” 11 or 108 times.', 'Afterward, name one desire and one ethical limit.'],
    traditionLabel: 'Mantra practice',
  },
  Ketu: {
    kind: 'mantra',
    title: 'Om Ketave Namah',
    description: 'A traditional Ketu namah practice for release and inner quiet.',
    instructions: ['Recite “Om Ketave Namah” 11 or 108 times.', 'Sit in silence for a few breaths afterward.'],
    traditionLabel: 'Mantra practice',
  },
};

const HOUSE_THEME: Record<number, string> = {
  1: 'self and life approach',
  2: 'speech, resources, and family values',
  3: 'effort, skill, and courage',
  4: 'home, mother, and inner security',
  5: 'creativity, intelligence, and children',
  6: 'service, conflict, and daily discipline',
  7: 'partnership and the other',
  8: 'shared resources, depth, and transformation',
  9: 'dharma, teachers, and longer meaning',
  10: 'vocation, status, and public work',
  11: 'gains, networks, and hopes',
  12: 'release, solitude, and unseen costs',
};

const SCORE_WEIGHT: Record<EvidenceCode, number> = {
  current_dasha: 40,
  antardasha: 20,
  debilitated: 25,
  weak_dignity: 18,
  difficult_house: 12,
  functional_malefic: 10,
  functional_benefic: 6,
  navaratna_caution: 15,
  navaratna_recommended: 8,
  navaratna_avoid: 12,
  is_lagnesh: 6,
  is_dasha_lord: 4,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function asTrimmedString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function asHouseNumber(value: unknown): number | null {
  const n = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
  if (!Number.isInteger(n) || n < 1 || n > 12) return null;
  return n;
}

export function parseGrahaName(value: unknown): GrahaName | null {
  if (typeof value !== 'string') return null;
  const key = value.trim().toLowerCase();
  return GRAHA_ALIASES[key] ?? null;
}

export function buildVedicSeerHref(planet: GrahaName): string {
  return `/tools/vedic?tab=ask-the-seer&planet=${encodeURIComponent(planet)}`;
}

export function resolveGuidanceViewState(input: {
  authLoading: boolean;
  reportsLoading: boolean;
  signedIn: boolean;
  hasVedicReport: boolean;
  hasNavaratnaReport: boolean;
  hasChartFacts: boolean;
}): GuidanceViewState {
  if (input.authLoading || input.reportsLoading) return 'loading';
  if (!input.signedIn) return 'signed_out';
  if (!input.hasVedicReport) return 'no_profile';
  if (!input.hasChartFacts || !input.hasNavaratnaReport) return 'partial';
  return 'personalized';
}

function unwrapRecord(source: unknown): Record<string, unknown> | null {
  if (!isRecord(source)) return null;
  let merged: Record<string, unknown> = { ...source };
  const layers = [source.data, source.chartData, source.vedic, source.analysis];
  for (const candidate of layers) {
    if (isRecord(candidate)) {
      merged = { ...merged, ...candidate };
    }
  }
  const innerLayers = [merged.data, merged.chartData, merged.vedic, merged.analysis];
  for (const candidate of innerLayers) {
    if (isRecord(candidate)) {
      merged = { ...merged, ...candidate };
    }
  }
  return merged;
}

function extractLagnaSign(report: Record<string, unknown>): string | null {
  const asc = isRecord(report.ascendant) ? report.ascendant : isRecord(report.lagna) ? report.lagna : null;
  if (asc) {
    return asTrimmedString(asc.signName) ?? asTrimmedString(asc.sign);
  }
  const chartSummary = isRecord(report.chartSummary) ? report.chartSummary : null;
  const summaryAsc = chartSummary && isRecord(chartSummary.ascendant) ? chartSummary.ascendant : null;
  if (summaryAsc) {
    return asTrimmedString(summaryAsc.signName) ?? asTrimmedString(summaryAsc.sign);
  }
  return asTrimmedString(report.lagnaSign);
}

function extractDashaPlanet(report: Record<string, unknown>): { maha: GrahaName | null; antar: GrahaName | null } {
  const current = isRecord(report.currentDasha) ? report.currentDasha : null;
  const fromCurrent =
    parseGrahaName(current?.planet) ??
    parseGrahaName(current?.mahadasha) ??
    parseGrahaName(current?.name);
  const antar = parseGrahaName(current?.antardasha) ?? parseGrahaName(current?.antardashaPlanet);

  if (fromCurrent) {
    return { maha: fromCurrent, antar };
  }

  const dashaList = Array.isArray(report.dasha) ? report.dasha : Array.isArray(report.dashas) ? report.dashas : [];
  const now = Date.now();
  for (const entry of dashaList) {
    if (!isRecord(entry)) continue;
    const planet = parseGrahaName(entry.planet) ?? parseGrahaName(entry.name);
    if (!planet) continue;
    if (entry.isCurrent === true) {
      return { maha: planet, antar: parseGrahaName(entry.antardasha) };
    }
    const start = typeof entry.startDate === 'string' ? Date.parse(entry.startDate) : NaN;
    const end = typeof entry.endDate === 'string' ? Date.parse(entry.endDate) : NaN;
    if (Number.isFinite(start) && Number.isFinite(end) && now >= start && now <= end) {
      return { maha: planet, antar: parseGrahaName(entry.antardasha) };
    }
  }

  const chartSummary = isRecord(report.chartSummary) ? report.chartSummary : null;
  const summaryDasha = chartSummary && isRecord(chartSummary.currentDasha) ? chartSummary.currentDasha : null;
  return {
    maha: parseGrahaName(summaryDasha?.planet),
    antar: parseGrahaName(summaryDasha?.antardasha),
  };
}

interface RawPlanetRow {
  name: GrahaName;
  sign: string | null;
  house: number | null;
  nakshatra: string | null;
  dignity: string | null;
}

function readPlanetRow(value: unknown, fallbackName?: string): RawPlanetRow | null {
  if (!isRecord(value) && !fallbackName) return null;
  const rec = isRecord(value) ? value : {};
  const name = parseGrahaName(rec.name) ?? parseGrahaName(rec.planet) ?? parseGrahaName(fallbackName);
  if (!name) return null;
  const dignityObj = isRecord(rec.dignity) ? rec.dignity : null;
  const dignity =
    asTrimmedString(dignityObj?.strength) ??
    asTrimmedString(rec.strength) ??
    asTrimmedString(rec.dignity);
  const signRaw = rec.signName ?? rec.sign;
  const sign = typeof signRaw === 'string' ? asTrimmedString(signRaw) : null;
  return {
    name,
    sign,
    house: asHouseNumber(rec.house) ?? asHouseNumber(rec.houseNumber),
    nakshatra: asTrimmedString(rec.nakshatra),
    dignity,
  };
}

function extractPlanetRows(report: Record<string, unknown>): RawPlanetRow[] {
  const planets = report.planets;
  const rows: RawPlanetRow[] = [];
  if (Array.isArray(planets)) {
    for (const item of planets) {
      const row = readPlanetRow(item);
      if (row) rows.push(row);
    }
    return rows;
  }
  if (isRecord(planets)) {
    for (const [key, value] of Object.entries(planets)) {
      const row = readPlanetRow(value, key);
      if (row) rows.push(row);
    }
  }
  return rows;
}

function unwrapNavaratna(source: unknown): NavaratnaAnalysis | null {
  if (!isRecord(source)) return null;
  const direct = source as unknown as NavaratnaAnalysis;
  if (direct.chartSummary && direct.recommendations && Array.isArray(direct.planetaryAnalysis)) {
    return direct;
  }
  if (isRecord(source.data)) {
    const inner = source.data as unknown as NavaratnaAnalysis;
    if (inner.chartSummary && inner.recommendations && Array.isArray(inner.planetaryAnalysis)) {
      return inner;
    }
  }
  if (Array.isArray(source.planetaryAnalysis) && isRecord(source.recommendations)) {
    return source as unknown as NavaratnaAnalysis;
  }
  return null;
}

function navaratnaForPlanet(analysis: NavaratnaAnalysis | null, planet: GrahaName): PlanetaryAnalysis | null {
  if (!analysis) return null;
  return analysis.planetaryAnalysis.find((item) => parseGrahaName(item.planet) === planet) ?? null;
}

function dignityFromNavaratna(row: PlanetaryAnalysis | null, fallback: string | null): string | null {
  if (!row) return fallback;
  if (row.dignity?.debilitated) return 'debilitated';
  if (row.dignity?.exalted) return 'exalted';
  if (row.dignity?.moolatrikona) return 'moolatrikona';
  if (row.dignity?.ownSign) return 'own sign';
  if (row.strength) return row.strength;
  return fallback;
}

function functionalRoleFromNavaratna(row: PlanetaryAnalysis | null): FunctionalRole | null {
  if (!row) return null;
  if (row.isFunctionalBenefic && row.isFunctionalMalefic) return 'mixed';
  if (row.isFunctionalBenefic) return 'functional_benefic';
  if (row.isFunctionalMalefic) return 'functional_malefic';
  return null;
}

function isWeakDignity(dignity: string | null, nav: PlanetaryAnalysis | null): boolean {
  const text = (dignity ?? '').toLowerCase();
  if (text.includes('debilitat') || text.includes('very weak') || text === 'weak') return true;
  if (nav?.strength === 'Weak' || nav?.strength === 'Very Weak') return true;
  return false;
}

function isDebilitated(dignity: string | null, nav: PlanetaryAnalysis | null): boolean {
  if (nav?.dignity?.debilitated) return true;
  return (dignity ?? '').toLowerCase().includes('debilitat');
}

function collectEvidence(input: {
  planet: GrahaName;
  placement: PlanetPlacement;
  nav: PlanetaryAnalysis | null;
  dashaPlanet: GrahaName | null;
  antarPlanet: GrahaName | null;
}): EvidenceItem[] {
  const { planet, placement, nav, dashaPlanet, antarPlanet } = input;
  const evidence: EvidenceItem[] = [];

  if (dashaPlanet === planet) {
    evidence.push({
      code: 'current_dasha',
      reason: `${planet} is the current mahadasha lord — this chapter is active now.`,
    });
  }
  if (antarPlanet === planet) {
    evidence.push({
      code: 'antardasha',
      reason: `${planet} is running as antardasha, coloring the current mahadasha.`,
    });
  }
  if (placement.isDashaLord && dashaPlanet !== planet) {
    evidence.push({
      code: 'is_dasha_lord',
      reason: `${planet} is marked as dasha lord in the persisted Navaratna analysis.`,
    });
  }
  if (isDebilitated(placement.dignity, nav)) {
    evidence.push({
      code: 'debilitated',
      reason: `${planet} is debilitated in the persisted chart data — extra care, not a verdict of failure.`,
    });
  } else if (isWeakDignity(placement.dignity, nav)) {
    evidence.push({
      code: 'weak_dignity',
      reason: `${planet} is described as weak in dignity/strength. Weakness asks for support, not punishment.`,
    });
  }
  if (placement.house != null && DIFFICULT_HOUSES.has(placement.house)) {
    evidence.push({
      code: 'difficult_house',
      reason: `${planet} occupies house ${placement.house} (${HOUSE_THEME[placement.house]}) — a dusthana theme of effort, depth, or release.`,
    });
  }
  if (placement.functionalRole === 'functional_malefic') {
    evidence.push({
      code: 'functional_malefic',
      reason: `${planet} is a functional malefic for this lagna. Attention here is about skillful handling, not “this planet is bad.”`,
    });
  }
  if (placement.functionalRole === 'functional_benefic') {
    evidence.push({
      code: 'functional_benefic',
      reason: `${planet} is a functional benefic for this lagna — support is available when you work with its theme.`,
    });
  }
  if (placement.isLagnesh) {
    evidence.push({
      code: 'is_lagnesh',
      reason: `${planet} is lagnesh (ascendant lord), so its condition colors the whole chart.`,
    });
  }
  if (nav?.recommendation === 'caution') {
    evidence.push({
      code: 'navaratna_caution',
      reason: nav.reason || `Navaratna analysis flags ${planet} gemstone use with caution.`,
    });
  } else if (nav?.recommendation === 'avoid') {
    evidence.push({
      code: 'navaratna_avoid',
      reason: nav.reason || `Navaratna analysis advises avoiding a ${planet} gemstone.`,
    });
  } else if (nav?.recommendation === 'recommended') {
    evidence.push({
      code: 'navaratna_recommended',
      reason: nav.reason || `Navaratna analysis lists ${planet} among chart-approved gemstone considerations.`,
    });
  }

  return evidence;
}

function scoreEvidence(evidence: EvidenceItem[]): number {
  return evidence.reduce((sum, item) => sum + SCORE_WEIGHT[item.code], 0);
}

function teachingFor(placement: PlanetPlacement): string {
  const base = DEMAND_BY_GRAHA[placement.planet].teachingBase;
  const parts = [base];
  if (placement.sign) {
    parts.push(`Placement noted: ${placement.planet} in ${placement.sign}${placement.house ? `, house ${placement.house}` : ''}.`);
  } else if (placement.house) {
    parts.push(`House context: ${HOUSE_THEME[placement.house] ?? `house ${placement.house}`}.`);
  }
  if (placement.dignity) {
    parts.push(`Dignity/strength on file: ${placement.dignity}.`);
  }
  return parts.join(' ');
}

function isDonationRemedy(remedy: LalKitabRemedy): boolean {
  const blob = `${remedy.title} ${remedy.description} ${remedy.instructions.join(' ')}`.toLowerCase();
  return /donat|give |charity|feed |offer /.test(blob);
}

function toUpayaAction(remedy: LalKitabRemedy, kind: 'service' | 'upaya'): PlanetaryAction {
  return {
    kind,
    title: remedy.title,
    description: remedy.description,
    instructions: remedy.instructions,
    traditionLabel: 'Lal Kitab (traditional)',
    contraindications: remedy.contraindications,
  };
}

function colorActionFor(planet: GrahaName): PlanetaryAction | null {
  for (const [color, therapy] of Object.entries(COLOR_THERAPY)) {
    if (!therapy.planetaryRulers?.some((ruler) => parseGrahaName(ruler) === planet)) continue;
    return {
      kind: 'color',
      title: `${color} — ${therapy.title}`,
      description: therapy.description,
      instructions: therapy.instructions,
      traditionLabel: 'Color practice',
    };
  }
  return null;
}

function mudraActionFor(planet: GrahaName): PlanetaryAction | null {
  for (const mudra of Object.values(MUDRA_DATABASE)) {
    if (!mudra.planetaryRulers?.some((ruler) => parseGrahaName(ruler) === planet)) continue;
    return {
      kind: 'mudra',
      title: mudra.title,
      description: mudra.description,
      instructions: mudra.instructions,
      traditionLabel: 'Mudra practice',
    };
  }
  return null;
}

function recommendedGemForPlanet(navaratna: NavaratnaAnalysis | null, planet: GrahaName): GemstoneRecommendation | null {
  if (!navaratna) return null;
  const recs = navaratna.recommendations;
  const candidates = [recs.lifeStone, recs.dashaStone, ...(recs.beneficStones ?? [])].filter(
    (item): item is GemstoneRecommendation => Boolean(item) && parseGrahaName(item?.planet) === planet,
  );
  return candidates[0] ?? null;
}

function avoidedGemForPlanet(navaratna: NavaratnaAnalysis | null, planet: GrahaName): { gemstone: string; reason: string } | null {
  if (!navaratna) return null;
  const hit = navaratna.recommendations.avoidedStones?.find((item) => parseGrahaName(item.planet) === planet);
  if (!hit) return null;
  return { gemstone: hit.gemstone, reason: hit.reason };
}

function gemstoneAction(
  planet: GrahaName,
  nav: PlanetaryAnalysis | null,
  navaratna: NavaratnaAnalysis | null,
): PlanetaryAction | null {
  if (!navaratna) {
    return {
      kind: 'gemstone',
      title: 'Gemstone guidance needs your Navaratna report',
      description: `FutureSeer does not infer a gem from generic ${planet} correspondence. Generate or open your Navaratna report to see chart-approved stones, avoid lists, and cautions.`,
      gemstoneStance: 'none',
      traditionLabel: 'Navaratna',
    };
  }

  const avoided = avoidedGemForPlanet(navaratna, planet);
  const analysisAvoid = nav?.recommendation === 'avoid';
  if (avoided || analysisAvoid) {
    return {
      kind: 'gemstone',
      title: `Avoid a ${planet} gemstone unless an astrologer revisits this chart`,
      description:
        avoided?.reason ||
        nav?.reason ||
        `Your persisted Navaratna report advises against strengthening ${planet} with a gemstone.`,
      gemstoneStance: 'avoid',
      traditionLabel: 'Navaratna',
      contraindications: ['Do not self-prescribe this planet’s gem from generic lists.'],
    };
  }

  if (nav?.recommendation === 'caution') {
    return {
      kind: 'gemstone',
      title: `Consult before wearing a ${planet} stone`,
      description:
        nav.reason ||
        `Navaratna marks ${planet} with caution. A gem is not recommended from this screen.`,
      gemstoneStance: 'consult',
      traditionLabel: 'Navaratna',
      contraindications: ['Do not start a gemstone practice from a caution flag alone.'],
    };
  }

  const recommended = recommendedGemForPlanet(navaratna, planet);
  if (recommended && nav?.recommendation === 'recommended') {
    return {
      kind: 'gemstone',
      title: `${recommended.gemstone.english} (${recommended.gemstone.sanskrit})`,
      description: `${recommended.reason} This is chart-approved in your persisted Navaratna report — still a traditional suggestion, not a medical or guaranteed result.`,
      instructions: [
        `Type: ${recommended.type.replace('_', ' ')}`,
        `Priority: ${recommended.priority}`,
        recommended.wearingInstructions.day ? `Traditional wearing day: ${recommended.wearingInstructions.day}` : '',
        ...recommended.warnings.slice(0, 2),
      ].filter(Boolean),
      gemstoneStance: 'recommended',
      traditionLabel: 'Navaratna',
      contraindications: recommended.warnings,
    };
  }

  return {
    kind: 'gemstone',
    title: `No ${planet} gemstone is prescribed from this chart`,
    description: `Your Navaratna report does not list a ${planet} stone to wear. We will not invent one from planet-to-gem folklore.`,
    gemstoneStance: 'none',
    traditionLabel: 'Navaratna',
  };
}

function buildActions(planet: GrahaName, gem: PlanetaryAction | null): {
  startHere: PlanetaryAction[];
  deepenPractice: PlanetaryAction[];
  traditionalUpayas: PlanetaryAction[];
  gemstoneGuidance: PlanetaryAction | null;
} {
  const lalKitab = getLalKitabRemediesForPlanet(planet);
  const donation = lalKitab.find((item) => isDonationRemedy(item) && (item.cost === 'free' || item.cost === 'low'));
  const otherUpayas = lalKitab
    .filter((item) => item.id !== donation?.id)
    .sort((a, b) => {
      const rank = (item: LalKitabRemedy) =>
        (item.difficulty === 'beginner' ? 0 : 1) + (item.cost === 'free' ? 0 : item.cost === 'low' ? 1 : 2);
      return rank(a) - rank(b);
    })
    .slice(0, 2);

  const deepen: PlanetaryAction[] = [];
  if (donation) deepen.push(toUpayaAction(donation, 'service'));
  deepen.push(MANTRA_BY_GRAHA[planet]);
  const color = colorActionFor(planet);
  if (color) deepen.push(color);
  const mudra = mudraActionFor(planet);
  if (mudra) deepen.push(mudra);

  return {
    startHere: [CONDUCT_BY_GRAHA[planet]],
    deepenPractice: deepen,
    traditionalUpayas: otherUpayas.map((item) => toUpayaAction(item, 'upaya')),
    gemstoneGuidance: gem,
  };
}

function assertNever(value: never): never {
  throw new Error(`Unhandled graha: ${String(value)}`);
}

function grahaIndex(planet: GrahaName): number {
  switch (planet) {
    case 'Sun':
      return 0;
    case 'Moon':
      return 1;
    case 'Mars':
      return 2;
    case 'Mercury':
      return 3;
    case 'Jupiter':
      return 4;
    case 'Venus':
      return 5;
    case 'Saturn':
      return 6;
    case 'Rahu':
      return 7;
    case 'Ketu':
      return 8;
    default:
      return assertNever(planet);
  }
}

export function buildPlanetaryGuidance(
  vedicReport: unknown,
  navaratnaReport: unknown,
): PlanetaryGuidance {
  const vedic = unwrapRecord(vedicReport);
  const navaratna = unwrapNavaratna(navaratnaReport);
  const planetRows = vedic ? extractPlanetRows(vedic) : [];
  const dasha = vedic ? extractDashaPlanet(vedic) : { maha: null, antar: null };
  const lagnaSign =
    (vedic ? extractLagnaSign(vedic) : null) ?? navaratna?.chartSummary?.ascendant?.sign ?? null;
  const navDasha = parseGrahaName(navaratna?.chartSummary?.currentDasha?.planet);
  const currentDashaPlanet = dasha.maha ?? navDasha;
  const currentAntardashaPlanet = dasha.antar;
  const lagnesh = parseGrahaName(navaratna?.chartSummary?.lagnesh);

  const hasVedicChart = Boolean(
    planetRows.length > 0 || currentDashaPlanet || lagnaSign || (vedic && (vedic.planetaryAnalysis || vedic.chartOverview)),
  );
  const hasNavaratna = Boolean(navaratna);

  const rowByPlanet = new Map<GrahaName, RawPlanetRow>();
  for (const row of planetRows) {
    rowByPlanet.set(row.name, row);
  }

  const grahas = {} as Record<GrahaName, GrahaGuidance>;

  for (const planet of GRAHA_NAMES) {
    const row = rowByPlanet.get(planet);
    const nav = navaratnaForPlanet(navaratna, planet);
    const placement: PlanetPlacement = {
      planet,
      sign: row?.sign ?? null,
      house: row?.house ?? (typeof nav?.house === 'number' ? nav.house : null),
      nakshatra: row?.nakshatra ?? null,
      dignity: dignityFromNavaratna(nav, row?.dignity ?? null),
      functionalRole: functionalRoleFromNavaratna(nav),
      isNaturalBenefic: nav?.isNaturalBenefic ?? NATURAL_BENEFICS.has(planet),
      isNaturalMalefic: nav?.isNaturalMalefic ?? NATURAL_MALEFICS.has(planet),
      isLagnesh: nav?.isLagnesh ?? lagnesh === planet,
      isDashaLord: nav?.isDashaLord ?? currentDashaPlanet === planet,
      isAntardashaLord: currentAntardashaPlanet === planet,
    };

    const evidence = collectEvidence({
      planet,
      placement,
      nav,
      dashaPlanet: currentDashaPlanet,
      antarPlanet: currentAntardashaPlanet,
    });
    const actions = buildActions(planet, gemstoneAction(planet, nav, navaratna));

    const demand = DEMAND_BY_GRAHA[planet];
    grahas[planet] = {
      planet,
      placement,
      wants: demand.wants,
      whenIgnored: demand.whenIgnored,
      teaching: teachingFor(placement),
      evidence,
      attentionScore: scoreEvidence(evidence),
      ...actions,
    };
  }

  const rankedPlanets = [...GRAHA_NAMES].sort((a, b) => {
    const scoreDiff = grahas[b].attentionScore - grahas[a].attentionScore;
    if (scoreDiff !== 0) return scoreDiff;
    return grahaIndex(a) - grahaIndex(b);
  });

  const withEvidence = rankedPlanets.filter((planet) => grahas[planet].attentionScore > 0);
  const topPlanets = withEvidence.slice(0, 3);

  return {
    hasVedicChart,
    hasNavaratna,
    currentDashaPlanet,
    currentAntardashaPlanet,
    lagnaSign,
    rankedPlanets,
    topPlanets,
    grahas,
  };
}
