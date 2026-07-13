/**
 * Current sidereal transit positions (computed via getChart).
 * Replaces static 2025 tables — positions update with the live ephemeris.
 */

import { getChart } from '@/lib/astronomia-vedic';
import { nakshatraFromLongitude } from '@/lib/vedic-core';
import { devLog } from '@/lib/devLogger';

export interface CurrentTransit {
  planet: string;
  currentSign: string;
  enteredDate: string;
  exitDate: string;
  influence: string;
  significance: string;
  impact: 'positive' | 'negative' | 'neutral';
  house: number;
  nakshatra: string;
}

const TRANSIT_GRAHAS = [
  { key: 'sun', label: 'Sun' },
  { key: 'moon', label: 'Moon' },
  { key: 'mars', label: 'Mars' },
  { key: 'mercury', label: 'Mercury' },
  { key: 'jupiter', label: 'Jupiter' },
  { key: 'venus', label: 'Venus' },
  { key: 'saturn', label: 'Saturn' },
  { key: 'rahu', label: 'Rahu' },
  { key: 'ketu', label: 'Ketu' },
] as const;

const SIGN_NAMES = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
] as const;

type ChartPlanetRow = {
  signName?: string;
  sign?: number;
  house?: number;
  lonSidereal?: number;
};

function buildTransitRow(
  planet: string,
  signName: string,
  house: number,
  lonSidereal: number,
  now: Date,
): CurrentTransit {
  const nk = nakshatraFromLongitude(lonSidereal);
  const today = now.toISOString().split('T')[0];
  return {
    planet,
    currentSign: signName,
    enteredDate: today,
    exitDate: '—',
    influence: `${planet} currently transits ${signName} (sidereal Lahiri, computed).`,
    significance: `Nakshatra: ${nk.name} (pada ${nk.pada}). House ${house} in reference whole-sign frame.`,
    impact: 'neutral',
    house,
    nakshatra: nk.name,
  };
}

function computeSiderealTransits(now = new Date()): CurrentTransit[] {
  const chart = getChart(
    {
      date: now,
      latitude: 0,
      longitude: 0,
      name: 'Current sky',
      place: 'Reference',
      birthDate: undefined,
    },
    { ayanamsha: 'lahiri', houseSystem: 'whole-sign' },
  );

  if (!chart?.planets) return [];

  const planets = chart.planets as Record<string, ChartPlanetRow>;

  const ascSign =
    typeof chart.ascendant?.sign === 'number'
      ? chart.ascendant.sign
      : typeof chart.ascendant?.signName === 'string'
        ? SIGN_NAMES.indexOf(chart.ascendant.signName as (typeof SIGN_NAMES)[number])
        : 0;

  return TRANSIT_GRAHAS.flatMap(({ key, label }) => {
    const data = planets[key];
    if (!data) return [];
    const signName =
      data.signName ??
      SIGN_NAMES[typeof data.sign === 'number' ? data.sign : 0];
    const house =
      typeof data.house === 'number'
        ? data.house
        : ((typeof data.sign === 'number' ? data.sign : 0) - ascSign + 12) % 12 + 1;
    const lon = typeof data.lonSidereal === 'number' ? data.lonSidereal : 0;
    return [buildTransitRow(label, signName, house, lon, now)];
  });
}

export class CurrentTransitService {
  private static instance: CurrentTransitService;

  static getInstance() {
    if (!CurrentTransitService.instance) {
      CurrentTransitService.instance = new CurrentTransitService();
    }
    return CurrentTransitService.instance;
  }

  async getCurrentTransits(): Promise<CurrentTransit[]> {
    try {
      const rows = computeSiderealTransits(new Date());
      devLog.debug(`✅ Computed ${rows.length} sidereal transits`);
      return rows;
    } catch (error) {
      devLog.error('❌ Error computing current transits:', error, 'currentTransitService');
      throw error;
    }
  }

  /** Major slow-planet sign changes (computed positions only; ingress dates TBD in P2). */
  async getUpcomingEvents(): Promise<CurrentTransit[]> {
    try {
      const slow = ['Jupiter', 'Saturn', 'Rahu', 'Ketu'];
      const current = await this.getCurrentTransits();
      return current.filter((t) => slow.includes(t.planet));
    } catch (error) {
      devLog.error('❌ Error computing upcoming transit events:', error, 'currentTransitService');
      throw error;
    }
  }
}

export const currentTransitService = CurrentTransitService.getInstance();
