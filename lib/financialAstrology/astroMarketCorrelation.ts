/**
 * Astro-Market Correlation Engine
 * Overlays astrological events (Mercury retrograde, Jupiter-Saturn cycles,
 * Mars-Uranus stress, eclipses) onto market price data for chart rendering.
 */

export interface AstroEvent {
  id: string;
  name: string;
  type: 'mercury_retrograde' | 'jupiter_saturn' | 'mars_uranus' | 'eclipse' | 'ingress';
  startDate: string;
  endDate: string;
  color: string;
  severity: 'high' | 'medium' | 'low' | 'positive';
  description: string;
}

export interface MarketDataPoint {
  date: string;
  close: number;
  open?: number;
  high?: number;
  low?: number;
}

export interface CorrelatedDataPoint extends MarketDataPoint {
  events: string[];
  eventColors: string[];
}

const MERCURY_RETRO_PERIODS: { year: number; periods: [number, number, number, number][] }[] = [
  { year: 2025, periods: [[3, 15, 4, 7], [7, 18, 8, 11], [11, 26, 12, 15]] },
  { year: 2026, periods: [[1, 15, 2, 5], [4, 25, 5, 15], [8, 15, 9, 5], [12, 1, 12, 22]] },
  { year: 2027, periods: [[1, 8, 1, 28], [5, 10, 6, 2], [9, 3, 9, 25], [12, 20, 12, 31]] },
];

const ECLIPSE_DATES: { date: string; type: 'solar' | 'lunar'; description: string }[] = [
  { date: '2025-03-29', type: 'solar', description: 'Partial Solar Eclipse in Aries' },
  { date: '2025-09-21', type: 'solar', description: 'Partial Solar Eclipse in Virgo' },
  { date: '2026-02-17', type: 'lunar', description: 'Total Lunar Eclipse in Leo' },
  { date: '2026-03-03', type: 'solar', description: 'Annular Solar Eclipse in Pisces' },
  { date: '2026-08-12', type: 'lunar', description: 'Partial Lunar Eclipse in Aquarius' },
  { date: '2026-08-28', type: 'solar', description: 'Total Solar Eclipse in Virgo' },
  { date: '2027-02-06', type: 'lunar', description: 'Penumbral Lunar Eclipse in Leo' },
  { date: '2027-02-20', type: 'solar', description: 'Annular Solar Eclipse in Pisces' },
  { date: '2027-07-18', type: 'solar', description: 'Total Solar Eclipse in Cancer' },
  { date: '2027-08-02', type: 'lunar', description: 'Penumbral Lunar Eclipse in Aquarius' },
];

const EVENT_COLORS = {
  mercury_retrograde: '#ef4444',
  jupiter_saturn: '#3b82f6',
  mars_uranus: '#f97316',
  eclipse: '#a855f7',
  ingress: '#06b6d4',
};

function getMercuryRetrogradePeriods(startDate: Date, endDate: Date): AstroEvent[] {
  const events: AstroEvent[] = [];
  const startYear = startDate.getFullYear();
  const endYear = endDate.getFullYear();

  for (const yearData of MERCURY_RETRO_PERIODS) {
    if (yearData.year < startYear - 1 || yearData.year > endYear + 1) continue;
    for (const [sm, sd, em, ed] of yearData.periods) {
      const pStart = new Date(yearData.year, sm - 1, sd);
      const pEnd = new Date(yearData.year, em - 1, ed);
      if (pEnd < startDate || pStart > endDate) continue;

      events.push({
        id: `merc_rx_${yearData.year}_${sm}_${sd}`,
        name: 'Mercury Retrograde',
        type: 'mercury_retrograde',
        startDate: pStart.toISOString().split('T')[0],
        endDate: pEnd.toISOString().split('T')[0],
        color: EVENT_COLORS.mercury_retrograde,
        severity: 'high',
        description: `Mercury Retrograde ${pStart.toLocaleDateString('en', { month: 'short', day: 'numeric' })} - ${pEnd.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}. Caution with contracts, technology, and communication-dependent sectors.`,
      });
    }
  }

  return events;
}

function getJupiterSaturnPhaseEvents(startDate: Date, endDate: Date): AstroEvent[] {
  const lastConjunction = 2020;
  const cycleYears = 20;
  const events: AstroEvent[] = [];

  const midYear = (startDate.getFullYear() + endDate.getFullYear()) / 2;
  const pos = ((midYear - lastConjunction) / cycleYears) % 1;

  let phase: string;
  let severity: AstroEvent['severity'];
  if (pos < 0.5) {
    phase = 'Expansion Phase';
    severity = 'positive';
  } else if (pos < 0.75) {
    phase = 'Contraction Phase';
    severity = 'medium';
  } else {
    phase = 'Transition Phase';
    severity = 'low';
  }

  events.push({
    id: `jup_sat_${startDate.getFullYear()}`,
    name: `Jupiter-Saturn: ${phase}`,
    type: 'jupiter_saturn',
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    color: EVENT_COLORS.jupiter_saturn,
    severity,
    description: `The 20-year Jupiter-Saturn cycle (last conjunction Dec 2020) is in ${phase.toLowerCase()}. ${pos < 0.5 ? 'Favors growth, risk-on assets, and expansion strategies.' : 'Favors consolidation, value investing, and defensive positions.'}`,
  });

  return events;
}

function getEclipseEvents(startDate: Date, endDate: Date): AstroEvent[] {
  return ECLIPSE_DATES
    .filter((e) => {
      const d = new Date(e.date);
      return d >= startDate && d <= endDate;
    })
    .map((e) => {
      const d = new Date(e.date);
      const windowStart = new Date(d);
      windowStart.setDate(windowStart.getDate() - 3);
      const windowEnd = new Date(d);
      windowEnd.setDate(windowEnd.getDate() + 3);

      return {
        id: `eclipse_${e.date}`,
        name: e.description,
        type: 'eclipse' as const,
        startDate: windowStart.toISOString().split('T')[0],
        endDate: windowEnd.toISOString().split('T')[0],
        color: EVENT_COLORS.eclipse,
        severity: 'high' as const,
        description: `${e.description}. Eclipse windows (+/- 3 days) historically correlate with heightened volatility and trend reversals.`,
      };
    });
}

function getMarsUranusStressEvents(startDate: Date, endDate: Date): AstroEvent[] {
  const events: AstroEvent[] = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    const month = current.getMonth();
    const year = current.getFullYear();
    const rough = (year * 12 + month) % 24;

    if (rough >= 10 && rough <= 14) {
      const windowStart = new Date(year, month, 1);
      const windowEnd = new Date(year, month + 1, 0);
      const id = `mars_uranus_${year}_${month}`;

      if (!events.some((e) => e.id === id)) {
        events.push({
          id,
          name: 'Mars-Uranus Stress Window',
          type: 'mars_uranus',
          startDate: windowStart.toISOString().split('T')[0],
          endDate: windowEnd.toISOString().split('T')[0],
          color: EVENT_COLORS.mars_uranus,
          severity: 'high',
          description: 'Mars-Uranus hard aspect period. Associated with sudden market shocks, flash crashes, and unexpected geopolitical events.',
        });
      }
    }

    current.setMonth(current.getMonth() + 1);
  }

  return events;
}

/**
 * Get all astrological events for a given date range.
 */
export function getAstrologicalEventsForPeriod(
  startDate: Date,
  endDate: Date,
): AstroEvent[] {
  return [
    ...getMercuryRetrogradePeriods(startDate, endDate),
    ...getJupiterSaturnPhaseEvents(startDate, endDate),
    ...getEclipseEvents(startDate, endDate),
    ...getMarsUranusStressEvents(startDate, endDate),
  ].sort((a, b) => a.startDate.localeCompare(b.startDate));
}

/**
 * Overlay astrological event markers onto market price data.
 * Each data point gets annotated with active events for that date.
 */
export function overlayEventsOnMarketData(
  marketData: MarketDataPoint[],
  astroEvents: AstroEvent[],
): CorrelatedDataPoint[] {
  return marketData.map((point) => {
    const activeEvents = astroEvents.filter(
      (e) => point.date >= e.startDate && point.date <= e.endDate,
    );

    return {
      ...point,
      events: activeEvents.map((e) => e.name),
      eventColors: activeEvents.map((e) => e.color),
    };
  });
}

/**
 * Get a summary of current astrological market conditions for prompt injection.
 */
export function getCurrentAstroMarketSummary(): string {
  const now = new Date();
  const threeMonthsOut = new Date();
  threeMonthsOut.setMonth(threeMonthsOut.getMonth() + 3);

  const events = getAstrologicalEventsForPeriod(now, threeMonthsOut);
  const today = now.toISOString().split('T')[0];

  const activeNow = events.filter(
    (e) => today >= e.startDate && today <= e.endDate,
  );

  const upcoming = events.filter((e) => e.startDate > today).slice(0, 5);

  const lines = ['Astrological Market Conditions:'];

  if (activeNow.length > 0) {
    lines.push('  Currently Active:');
    for (const e of activeNow) {
      lines.push(`    - ${e.name}: ${e.description}`);
    }
  }

  if (upcoming.length > 0) {
    lines.push('  Upcoming Events:');
    for (const e of upcoming) {
      lines.push(`    - ${e.name} (${e.startDate}): ${e.description}`);
    }
  }

  return lines.join('\n');
}
