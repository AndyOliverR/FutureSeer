/**
 * Scrying Report Generator
 * Orchestrates: moon phase, symbol selection, context engine, thematic clustering,
 * risk/opportunity scoring, narrative sections. Returns full report object.
 */

import type { UserProfileForScrying } from './contextEngine';
import {
  profileSeed,
  selectSymbolsForProfile,
  buildDomainInterpretations,
  getElementalBalance,
  getArchetypalPattern,
  getRiskIndicatorSymbols,
  getOpportunityIndicatorSymbols,
  getTimelineOrientation,
} from './contextEngine';
import { getSymbolById } from './symbolOntology';

const MOON_PHASES = [
  'New Moon',
  'Waxing Crescent',
  'First Quarter',
  'Waxing Gibbous',
  'Full Moon',
  'Waning Gibbous',
  'Last Quarter',
  'Waning Crescent',
] as const;

const SCRYING_MEDIUMS = [
  'Black Obsidian Mirror',
  'Crystal Ball',
  'Bowl of Water (Hydromancy)',
  'Flame (Pyromancy)',
] as const;

function getMoonPhaseName(date: Date): string {
  const daysSinceNewMoon =
    (date.getTime() / (1000 * 60 * 60 * 24)) % 29.530588;
  const index = Math.floor((daysSinceNewMoon / 29.530588) * 8) % 8;
  return MOON_PHASES[index];
}

function selectMedium(seed: number): string {
  return SCRYING_MEDIUMS[seed % SCRYING_MEDIUMS.length];
}

export interface ScryingReport {
  scrying_session: {
    id: string;
    timestamp: string;
    context: {
      moon_phase: string;
      tool: string;
      lighting: string;
      intent: string;
      emotional_state: string;
    };
    observations: {
      duration_minutes: number;
      visuals: string[];
      physical_sensations: string[];
      clarity_score: number;
      dominant_emotion: string;
      intensity: number;
    };
    interpretation: {
      summary: string;
      tags: string[];
    };
  };
  sessionOverview: string;
  dominantSymbolThemes: string[];
  elementalBalance: Record<string, number>;
  elementalBalanceSummary: string;
  archetypalEnergyPattern: string;
  riskIndicators: string[];
  opportunityIndicators: string[];
  timelineOrientation: {
    past: string;
    present: string;
    future: string;
  };
  strategicGuidance: string;
  domainInterpretations: Record<
    string,
    string[]
  >;
}

/**
 * Generate a full scrying report for the user profile.
 * Deterministic for same profile; uses generation date for moon phase and timestamp.
 */
export function generateScryingReport(
  userProfile: UserProfileForScrying,
  generatedAt: Date = new Date()
): ScryingReport {
  const seed = profileSeed(userProfile);
  const timestamp = generatedAt.toISOString();
  const moonPhase = getMoonPhaseName(generatedAt);
  const medium = selectMedium(seed);

  const symbolIds = selectSymbolsForProfile(userProfile, 7);
  const symbols = symbolIds
    .map((id) => getSymbolById(id))
    .filter((s): s is NonNullable<typeof s> => s != null);

  const domainInterpretations = buildDomainInterpretations(symbolIds, userProfile);
  const elementalBalance = getElementalBalance(symbolIds);
  const archetypalPattern = getArchetypalPattern(symbolIds);
  const riskIds = getRiskIndicatorSymbols(symbolIds);
  const opportunityIds = getOpportunityIndicatorSymbols(symbolIds);
  const timeline = getTimelineOrientation(symbolIds);

  const visuals = symbols.map((s) => s.label);
  const physicalSensations = [
    'Calm focus',
    'Slight temperature shift',
    'Quiet mind',
  ];
  const clarityScore = 5 + (seed % 4);
  const dominantEmotion = seed % 3 === 0 ? 'Calm' : seed % 3 === 1 ? 'Receptive' : 'Focused';
  const intensity = 4 + (seed % 4);

  const displayName =
    (userProfile.fullName || 'Seeker').trim().split(/\s+/)[0] || 'Seeker';

  const topThemes = symbols.slice(0, 3).map((s) => s.label);
  const sessionOverview = `${displayName}'s symbolic reading was generated under ${moonPhase}, using ${medium} as the focal medium. The session reflects a ${dominantEmotion.toLowerCase()} state and is intended as guidance aligned to your current life phase. This is a symbolic introspection report, not a literal scrying session.`;

  const elementalEntries = Object.entries(elementalBalance).filter(
    ([_, v]) => v > 0
  );
  const dominantElement = elementalEntries.sort((a, b) => b[1] - a[1])[0];
  const elementalBalanceSummary =
    dominantElement && dominantElement[1] > 0
      ? `${dominantElement[0].charAt(0).toUpperCase() + dominantElement[0].slice(1)} energy is most present in the symbolic field, with balanced influence from other elements.`
      : 'Elemental influences are balanced across the symbolic field.';

  const riskLabels = riskIds
    .map((id) => getSymbolById(id)?.label)
    .filter(Boolean) as string[];
  const opportunityLabels = opportunityIds
    .map((id) => getSymbolById(id)?.label)
    .filter(Boolean) as string[];

  const riskTexts =
    riskLabels.length > 0
      ? riskLabels.map(
          (l) =>
            `${l} suggests awareness of shadow or hidden factors; integrate rather than resist.`
        )
      : ['No strong risk symbols dominate; proceed with normal caution.'];

  const opportunityTexts =
    opportunityLabels.length > 0
      ? opportunityLabels.map(
          (l) => `${l} indicates potential for growth or positive development.`
        )
      : ['Light and rising motifs suggest gradual opportunity ahead.'];

  const strategicGuidance = `Based on the symbolic pattern (${archetypalPattern}), prioritize clarity in communication and small, consistent steps. Align actions with the ${dominantEmotion.toLowerCase()} quality of your reading. This is symbolic guidance only—not predictive certainty.`;

  const summary = `The vision field emphasizes ${topThemes.join(', ')}. ${elementalBalanceSummary} The ${archetypalPattern} pattern suggests this is a time for awareness and intentional action.`;

  const tags = [
    ...topThemes.map((t) => t.toLowerCase().replace(/\s+/g, '-')),
    archetypalPattern,
    moonPhase.replace(/\s+/g, '-').toLowerCase(),
    'symbolic-introspection',
  ];

  return {
    scrying_session: {
      id: `scrying-${Date.now()}-${seed.toString(36)}`,
      timestamp,
      context: {
        moon_phase: moonPhase,
        tool: medium,
        lighting: 'Soft ambient (symbolic session)',
        intent: 'Guidance aligned to your current life phase',
        emotional_state: dominantEmotion,
      },
      observations: {
        duration_minutes: 15,
        visuals,
        physical_sensations: physicalSensations,
        clarity_score: Math.min(10, clarityScore),
        dominant_emotion: dominantEmotion,
        intensity: Math.min(10, intensity),
      },
      interpretation: {
        summary,
        tags,
      },
    },
    sessionOverview,
    dominantSymbolThemes: topThemes,
    elementalBalance,
    elementalBalanceSummary,
    archetypalEnergyPattern: archetypalPattern,
    riskIndicators: riskTexts,
    opportunityIndicators: opportunityTexts,
    timelineOrientation: timeline,
    strategicGuidance,
    domainInterpretations: domainInterpretations as Record<string, string[]>,
  };
}
