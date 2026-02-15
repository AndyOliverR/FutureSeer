/**
 * Trichakra report: three fixed layers (body, mind, soul) for Seer and Main Seer consumption.
 * Every Trichakra report resolves to this shape so reasoning stays structured.
 */

import type { TrichakraAnalysis } from './trichakraIntelligence';

export interface TrichakraReportLayer {
  imbalance: string;
  indicators: string[];
  remedies: string[];
}

export interface TrichakraReport {
  body: TrichakraReportLayer;
  mind: TrichakraReportLayer;
  soul: TrichakraReportLayer;
}

function layerFromRemedies(
  remedies: { title: string; description?: string; system?: string }[],
  imbalanceLabel: string,
  indicators: string[]
): TrichakraReportLayer {
  const remedyLines = remedies.slice(0, 10).map((r) => r.title || r.description || '').filter(Boolean);
  return {
    imbalance: imbalanceLabel,
    indicators,
    remedies: remedyLines
  };
}

/**
 * Maps TrichakraAnalysis into the three-layer TrichakraReport shape.
 */
export function analysisToTrichakraReport(analysis: TrichakraAnalysis): TrichakraReport {
  const astro = analysis.astrologicalAnalysis ?? {};
  const num = analysis.numerologyAnalysis;
  const vastu = analysis.vastuAnalysis ?? {};
  const lal = analysis.lalKitabAnalysis ?? {};
  const weakPlanets = astro.weakPlanets ?? [];
  const unfavorableDirs = vastu.unfavorableDirections ?? [];
  const priorityPlanets = lal.priorityPlanets ?? [];

  const bodyIndicators: string[] = [];
  if (weakPlanets.length) bodyIndicators.push(...weakPlanets.map((p) => `${p} afflicted`));
  if (unfavorableDirs.length) bodyIndicators.push(`Unfavorable directions: ${unfavorableDirs.join(', ')}`);
  if (num?.lifePathNumber != null) bodyIndicators.push(`Life path ${num.lifePathNumber}`);
  if (priorityPlanets.length) bodyIndicators.push(`Lal Kitab priority: ${priorityPlanets.join(', ')}`);
  if (bodyIndicators.length === 0) bodyIndicators.push('Physical/directional and material focus');

  const mindIndicators: string[] = [];
  if (weakPlanets.some((p) => /moon|mercury|venus/i.test(p)))
    mindIndicators.push('Moon/Mercury/Venus stress');
  if (mindIndicators.length === 0 && (analysis.remedies.mind?.length ?? 0) > 0)
    mindIndicators.push('Mind-level remedies indicated');

  const soulIndicators: string[] = [];
  if (weakPlanets.some((p) => /saturn|karma|karmic/i.test(p))) soulIndicators.push('Saturn/karmic influence');
  if ((analysis.remedies.soul?.length ?? 0) > 0 && soulIndicators.length === 0)
    soulIndicators.push('Soul-level remedies indicated');

  const bodyRemedies = analysis.remedies?.body ?? [];
  const mindRemedies = analysis.remedies?.mind ?? [];
  const soulRemedies = analysis.remedies?.soul ?? [];

  return {
    body: layerFromRemedies(
      bodyRemedies,
      'Physical, directional, and material remedies',
      bodyIndicators.length ? bodyIndicators : ['Body layer has remedies from analysis']
    ),
    mind: layerFromRemedies(
      mindRemedies,
      'Mental, mantra, and behavioral remedies',
      mindIndicators.length ? mindIndicators : (mindRemedies.length ? ['Mind layer has remedies'] : [])
    ),
    soul: layerFromRemedies(
      soulRemedies,
      'Spiritual, ritual, and karmic remedies',
      soulIndicators.length ? soulIndicators : (soulRemedies.length ? ['Soul layer has remedies'] : [])
    )
  };
}
