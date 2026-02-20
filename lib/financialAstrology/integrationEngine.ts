/**
 * Integration Engine
 * Combines Natal Wealth Profile × Market Cycle Profile → Composite score and action bias.
 */

import type { NatalWealthProfile } from './natalWealthEngine';
import type { MarketCycleProfile } from './marketCycleEngine';

export type ActionBias = 'Accumulate' | 'Hold' | 'ReduceExposure' | 'Caution';

export interface AlignmentOutput {
  compositeScore: number; // 0-100
  actionBias: ActionBias;
  riskBand: 'low' | 'medium' | 'high';
  timingWindow: string;
  rationale: string;
}

export function computeAlignment(
  natal: NatalWealthProfile,
  market: MarketCycleProfile,
  natalWeight: number = 0.5,
  marketWeight: number = 0.5
): AlignmentOutput {
  const natalReadiness =
    (natal.incomeStabilityScore + natal.longTermAccumulationScore) / 2 -
    natal.liquidityStressIndex * 0.3;
  const marketOpportunity =
    market.expansionScore - market.volatilityIndex * 0.5 - (market.liquidityCompression ? 15 : 0);

  const natalNorm = Math.max(0, Math.min(100, 50 + natalReadiness * 0.5));
  const marketNorm = Math.max(0, Math.min(100, 50 + marketOpportunity * 0.5));

  const compositeScore = Math.round(natalNorm * natalWeight + marketNorm * marketWeight);
  const composite = Math.max(0, Math.min(100, compositeScore));

  let actionBias: ActionBias = 'Hold';
  let riskBand: 'low' | 'medium' | 'high' = 'medium';
  let timingWindow = 'Neutral timing. ';
  let rationale = '';

  if (composite >= 70 && market.currentPhase === 'Expansion' && natal.speculativeRiskIndex < 70) {
    actionBias = 'Accumulate';
    riskBand = natal.speculativeRiskIndex > 60 ? 'medium' : 'low';
    timingWindow = 'Favorable for gradual accumulation. ';
    rationale = `Natal readiness (${Math.round(natalNorm)}) and market expansion phase align. `;
  } else if (
    composite <= 40 ||
    market.currentPhase === 'Volatile' ||
    natal.liquidityStressIndex > 60
  ) {
    actionBias = 'ReduceExposure';
    riskBand = 'high';
    timingWindow = 'Reduce exposure; preserve capital. ';
    rationale = `Elevated volatility or liquidity stress suggests caution. `;
  } else if (market.currentPhase === 'Contraction' || market.volatilityIndex > 55) {
    actionBias = 'Caution';
    riskBand = 'medium';
    timingWindow = 'Moderate conditions; selective opportunities. ';
    rationale = `Market in ${market.currentPhase.toLowerCase()} phase. `;
  } else {
    actionBias = 'Hold';
    riskBand = natal.speculativeRiskIndex > 65 ? 'medium' : 'low';
    timingWindow = 'Hold and review. ';
    rationale = `Balanced alignment; no strong bias. `;
  }

  rationale += `Composite score: ${composite}/100. `;

  return {
    compositeScore: composite,
    actionBias,
    riskBand,
    timingWindow,
    rationale,
  };
}
