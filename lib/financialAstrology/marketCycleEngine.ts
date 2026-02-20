/**
 * Market Cycle Engine
 * Detects planetary cycles, Mercury retrograde, volatility windows.
 * Uses date-based calculations; no external APIs.
 */

export type MarketPhase = 'Expansion' | 'Neutral' | 'Contraction' | 'Volatile';

export interface CycleEvent {
  name: string;
  phase: string;
  description: string;
  startDate?: string;
  endDate?: string;
  severity?: 'high' | 'medium' | 'low' | 'positive';
}

export interface MarketCycleProfile {
  currentPhase: MarketPhase;
  expansionScore: number; // 0-100
  contractionScore: number; // 0-100
  volatilityIndex: number; // 0-100
  liquidityCompression: boolean;
  cycles: CycleEvent[];
  volatilityWindows: CycleEvent[];
  next12MonthsOverview: string[];
}

// Mercury retrograde periods (approximate; 3-4 per year, ~3 weeks each)
// Real implementation would use Swiss Ephemeris; this is a simplified date-based heuristic
function getMercuryRetrogradePeriods(year: number): { start: Date; end: Date }[] {
  const periods: { start: Date; end: Date }[] = [];
  const base = [
    [1, 15, 2, 5],
    [4, 25, 5, 15],
    [8, 15, 9, 5],
    [12, 1, 12, 22],
  ];
  for (const [sm, sd, em, ed] of base) {
    periods.push({
      start: new Date(year, sm - 1, sd),
      end: new Date(year, em - 1, ed),
    });
  }
  return periods;
}

function isMercuryRetrograde(date: Date): boolean {
  const year = date.getFullYear();
  const periods = [
    ...getMercuryRetrogradePeriods(year),
    ...getMercuryRetrogradePeriods(year + 1),
  ];
  const t = date.getTime();
  return periods.some(
    (p) => t >= p.start.getTime() && t <= p.end.getTime()
  );
}

function getNextMercuryRetrograde(date: Date): { start: Date; end: Date } | null {
  const year = date.getFullYear();
  const periods = [
    ...getMercuryRetrogradePeriods(year),
    ...getMercuryRetrogradePeriods(year + 1),
  ];
  const t = date.getTime();
  const next = periods.find((p) => p.start.getTime() > t);
  return next ?? null;
}

// Jupiter-Saturn cycle (~20 years); simplified phase
function getJupiterSaturnPhase(date: Date): 'expansion' | 'contraction' | 'transition' {
  const year = date.getFullYear();
  const lastConjunction = 2020;
  const cycleYears = 20;
  const pos = ((year - lastConjunction) / cycleYears) % 1;
  if (pos < 0.25) return 'expansion';
  if (pos < 0.5) return 'expansion';
  if (pos < 0.75) return 'contraction';
  return 'transition';
}

// Simplified Mars-Uranus "stress" windows (square/opposition seasons; approximate)
function getMarsUranusStressWindow(date: Date): boolean {
  const month = date.getMonth();
  const year = date.getFullYear();
  const rough = (year * 12 + month) % 24;
  return rough >= 10 && rough <= 14;
}

export function computeMarketCycleProfile(referenceDate: Date = new Date()): MarketCycleProfile {
  const now = referenceDate;
  const cycles: CycleEvent[] = [];
  const volatilityWindows: CycleEvent[] = [];
  let expansionScore = 50;
  let contractionScore = 50;
  let volatilityIndex = 30;
  let liquidityCompression = false;

  const jupSatPhase = getJupiterSaturnPhase(now);
  if (jupSatPhase === 'expansion') {
    expansionScore = 70;
    contractionScore = 30;
    cycles.push({
      name: 'Jupiter-Saturn Cycle',
      phase: 'Expansion',
      description: 'Macro cycle favors growth and expansion phases.',
      severity: 'positive',
    });
  } else if (jupSatPhase === 'contraction') {
    expansionScore = 35;
    contractionScore = 65;
    liquidityCompression = true;
    cycles.push({
      name: 'Jupiter-Saturn Cycle',
      phase: 'Contraction',
      description: 'Macro cycle emphasizes consolidation and caution.',
      severity: 'medium',
    });
  } else {
    cycles.push({
      name: 'Jupiter-Saturn Cycle',
      phase: 'Transition',
      description: 'Cycle in transition; mixed signals.',
      severity: 'low',
    });
  }

  const mercRetro = isMercuryRetrograde(now);
  if (mercRetro) {
    volatilityIndex = Math.min(100, volatilityIndex + 35);
    const next = getNextMercuryRetrograde(now);
    volatilityWindows.push({
      name: 'Mercury Retrograde',
      phase: 'Active',
      description: 'Communication and data errors more likely; review positions, avoid major new commitments.',
      startDate: next ? next.start.toISOString().split('T')[0] : undefined,
      endDate: next ? next.end.toISOString().split('T')[0] : undefined,
      severity: 'high',
    });
  } else {
    const next = getNextMercuryRetrograde(now);
    if (next) {
      volatilityWindows.push({
        name: 'Mercury Retrograde',
        phase: 'Upcoming',
        description: 'Plan for reduced trading activity during retrograde.',
        startDate: next.start.toISOString().split('T')[0],
        endDate: next.end.toISOString().split('T')[0],
        severity: 'medium',
      });
    }
  }

  const marsUranus = getMarsUranusStressWindow(now);
  if (marsUranus) {
    volatilityIndex = Math.min(100, volatilityIndex + 25);
    volatilityWindows.push({
      name: 'Mars-Uranus Stress Window',
      phase: 'Active',
      description: 'Sudden spikes and unexpected events more likely; avoid over-leveraging.',
      severity: 'high',
    });
  }

  let currentPhase: MarketPhase = 'Neutral';
  if (expansionScore > 65 && volatilityIndex < 50) currentPhase = 'Expansion';
  else if (contractionScore > 60) currentPhase = 'Contraction';
  else if (volatilityIndex > 55) currentPhase = 'Volatile';

  const next12MonthsOverview: string[] = [];
  for (let m = 0; m < 12; m++) {
    const d = new Date(now.getFullYear(), now.getMonth() + m, 1);
    const mr = isMercuryRetrograde(d);
    const mu = getMarsUranusStressWindow(d);
    const label = d.toLocaleString('default', { month: 'short', year: 'numeric' });
    if (mr && mu) next12MonthsOverview.push(`${label}: High volatility (Mercury Rx + Mars-Uranus)`);
    else if (mr) next12MonthsOverview.push(`${label}: Mercury retrograde; caution with new moves`);
    else if (mu) next12MonthsOverview.push(`${label}: Mars-Uranus stress window; expect surprises`);
    else next12MonthsOverview.push(`${label}: Moderate conditions`);
  }

  return {
    currentPhase,
    expansionScore,
    contractionScore,
    volatilityIndex,
    liquidityCompression,
    cycles,
    volatilityWindows,
    next12MonthsOverview,
  };
}
