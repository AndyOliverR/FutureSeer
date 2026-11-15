/**
 * Comprehensive Dasha Calculator
 *
 * Implements three classical Vedic timing systems:
 *   1. Vimshottari Dasha (120-year, 9-lord cycle) with Mahadasha → Antardasha → Pratyantardasha
 *   2. Yogini Dasha (36-year, 8-goddess cycle)
 *   3. Ashtottari Dasha (108-year, 8-planet cycle)
 *
 * All calculations follow the rules in Brihat Parashara Hora Shastra.
 */

// ---------------------------------------------------------------------------
// SHARED TYPES
// ---------------------------------------------------------------------------

export interface DashaPeriod {
  lord: string;
  startDate: string;        // ISO date
  endDate: string;          // ISO date
  durationYears: number;
  level: 'mahadasha' | 'antardasha' | 'pratyantardasha';
  isCurrent: boolean;
  progress: number;         // 0–1
  parent?: string;          // lord of enclosing period
  subPeriods?: DashaPeriod[];
}

export interface DashaResult {
  system: 'vimshottari' | 'yogini' | 'ashtottari';
  totalCycleYears: number;
  periods: DashaPeriod[];
  currentMaha: DashaPeriod | null;
  currentAntar: DashaPeriod | null;
  currentPratyantar: DashaPeriod | null;
}

const MS_PER_YEAR = 365.25 * 24 * 3600 * 1000;

function addYears(date: Date, years: number): Date {
  return new Date(date.getTime() + years * MS_PER_YEAR);
}

function isoDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

function isCurrentPeriod(start: Date, end: Date, nowMs: number = Date.now()): boolean {
  return nowMs >= start.getTime() && nowMs < end.getTime();
}

function progressOf(start: Date, end: Date, nowMs: number = Date.now()): number {
  if (nowMs <= start.getTime()) return 0;
  if (nowMs >= end.getTime()) return 1;
  return (nowMs - start.getTime()) / (end.getTime() - start.getTime());
}

// ---------------------------------------------------------------------------
// VIMSHOTTARI DASHA (120-year cycle)
// ---------------------------------------------------------------------------

const VIMSHOTTARI_SEQUENCE = [
  { lord: 'Ketu',    years: 7 },
  { lord: 'Venus',   years: 20 },
  { lord: 'Sun',     years: 6 },
  { lord: 'Moon',    years: 10 },
  { lord: 'Mars',    years: 7 },
  { lord: 'Rahu',    years: 18 },
  { lord: 'Jupiter', years: 16 },
  { lord: 'Saturn',  years: 19 },
  { lord: 'Mercury', years: 17 },
];

const VIMSHOTTARI_TOTAL = 120; // sum of all years

/** More than two days short of the lord's full years means the opening balance, not a full mahadasha. */
const PARTIAL_MAHADASHA_SLACK_MS = 2 * 24 * 3600 * 1000;

export interface VimshottariAntardashaView {
  planet: string;
  startDate: string;
  endDate: string;
  duration: number;
  /** 0–100. Completed periods are 100; only `isCurrent` is the running sub-period. */
  progress: number;
  isCurrent: boolean;
  dashaType: 'antardasha';
}

export interface StoredMahadasha {
  planet?: string;
  lord?: string;
  startDate?: string;
  endDate?: string;
  antardashas?: VimshottariAntardashaView[];
  antardasha?: string;
  isCurrent?: boolean;
  [key: string]: unknown;
}

function vimshottariLordYears(lord: string): number | null {
  return VIMSHOTTARI_SEQUENCE.find((entry) => entry.lord === lord)?.years ?? null;
}

/**
 * Antardashas of one mahadasha.
 * Sequence starts at the mahadasha lord. The full lord-years are subdivided,
 * including the portion already elapsed before birth. Slices that ended before
 * `windowStart` are omitted.
 */
function calcSubPeriods(
  parentStart: Date,
  parentFullYears: number,
  startIdx: number,
  parentLord: string,
  level: 'antardasha' | 'pratyantardasha',
  windowStart: Date,
  nowMs: number,
  recurse: boolean,
): DashaPeriod[] {
  const periods: DashaPeriod[] = [];
  let cursor = new Date(parentStart);

  for (let i = 0; i < 9; i++) {
    const entry = VIMSHOTTARI_SEQUENCE[(startIdx + i) % 9];
    const subDuration = (parentFullYears * entry.years) / VIMSHOTTARI_TOTAL;
    const end = addYears(cursor, subDuration);
    if (end.getTime() <= windowStart.getTime()) {
      cursor = end;
      continue;
    }
    const visibleStart = cursor.getTime() < windowStart.getTime() ? windowStart : cursor;
    const current = isCurrentPeriod(visibleStart, end, nowMs);

    const period: DashaPeriod = {
      lord: entry.lord,
      startDate: isoDate(visibleStart),
      endDate: isoDate(end),
      durationYears: subDuration,
      level,
      isCurrent: current,
      progress: progressOf(visibleStart, end, nowMs),
      parent: parentLord,
    };

    if (recurse && level === 'antardasha' && current) {
      const subIdx = VIMSHOTTARI_SEQUENCE.findIndex(s => s.lord === entry.lord);
      period.subPeriods = calcSubPeriods(
        cursor, subDuration, subIdx, entry.lord, 'pratyantardasha', visibleStart, nowMs, false,
      );
    }

    periods.push(period);
    cursor = end;
  }

  return periods;
}

function mahadashaPeriodStart(lord: string, windowStart: Date, windowEnd: Date): Date | null {
  const fullYears = vimshottariLordYears(lord);
  if (!fullYears || windowEnd.getTime() <= windowStart.getTime()) return null;
  const spanMs = windowEnd.getTime() - windowStart.getTime();
  const fullMs = fullYears * MS_PER_YEAR;
  const isPartial = spanMs < fullMs - PARTIAL_MAHADASHA_SLACK_MS;
  return isPartial ? addYears(windowEnd, -fullYears) : windowStart;
}

export function vimshottariAntardashaViews(params: {
  lord: string;
  windowStart: Date;
  windowEnd: Date;
  now?: Date;
}): VimshottariAntardashaView[] {
  const startIdx = VIMSHOTTARI_SEQUENCE.findIndex((entry) => entry.lord === params.lord);
  const fullYears = vimshottariLordYears(params.lord);
  const periodStart = mahadashaPeriodStart(params.lord, params.windowStart, params.windowEnd);
  if (startIdx < 0 || fullYears == null || !periodStart) return [];
  const nowMs = (params.now ?? new Date()).getTime();
  return calcSubPeriods(
    periodStart,
    fullYears,
    startIdx,
    params.lord,
    'antardasha',
    params.windowStart,
    nowMs,
    false,
  ).map((period) => ({
    planet: period.lord,
    startDate: period.startDate,
    endDate: period.endDate,
    duration: period.durationYears,
    progress: Math.round(period.progress * 100),
    isCurrent: period.isCurrent,
    dashaType: 'antardasha' as const,
  }));
}

export function antardashasForStoredMahadasha(
  md: { planet?: string; lord?: string; startDate?: string; endDate?: string },
  now: Date = new Date(),
): VimshottariAntardashaView[] | null {
  const lord = md.planet || md.lord;
  if (!lord || !md.startDate || !md.endDate) return null;
  const windowStart = new Date(md.startDate);
  const windowEnd = new Date(md.endDate);
  if (Number.isNaN(windowStart.getTime()) || Number.isNaN(windowEnd.getTime())) return null;
  const views = vimshottariAntardashaViews({ lord, windowStart, windowEnd, now });
  return views.length > 0 ? views : null;
}

/** The running antardasha. Completed slices stay at progress 100 and are not selected. */
export function currentAntardashaPlanet(
  antardashas: Array<{ planet?: string; isCurrent?: boolean; progress?: number }> | undefined,
): string | undefined {
  if (!antardashas?.length) return undefined;
  const flagged = antardashas.find((row) => row.isCurrent && row.planet);
  if (flagged?.planet) return flagged.planet;
  const partial = antardashas.find((row) => {
    const progress = row.progress ?? 0;
    return progress > 0 && progress < 100 && !!row.planet;
  });
  return partial?.planet;
}

export function repairVimshottariDashaList<T extends StoredMahadasha>(
  dashaList: T[] | undefined,
  now: Date = new Date(),
): T[] | undefined {
  if (!Array.isArray(dashaList)) return dashaList;
  const nowMs = now.getTime();
  return dashaList.map((dasha) => {
    const lord = dasha.planet || dasha.lord;
    if (!lord || !dasha.startDate || !dasha.endDate) return dasha;
    const start = new Date(dasha.startDate);
    const end = new Date(dasha.endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return dasha;
    const isCurrent = nowMs >= start.getTime() && nowMs < end.getTime();
    if (!isCurrent) {
      return { ...dasha, isCurrent: false };
    }
    const antardashas = antardashasForStoredMahadasha(dasha, now);
    if (!antardashas) return { ...dasha, isCurrent: true };
    return {
      ...dasha,
      isCurrent: true,
      antardashas,
      antardasha: currentAntardashaPlanet(antardashas) ?? dasha.antardasha,
    };
  });
}

/** Rebuild antardashas on a stored Vedic chart so the displayed lord is the one running now. */
export function repairVedicChartDasha<T extends Record<string, unknown>>(
  chart: T,
  now: Date = new Date(),
): T {
  const dasha = chart.dasha;
  if (!Array.isArray(dasha)) return chart;
  const repaired = repairVimshottariDashaList(dasha as StoredMahadasha[], now);
  if (!repaired) return chart;
  const current = repaired.find((row) => row.isCurrent === true);
  const previous = chart.currentDasha;
  const nextCurrent = current
    ? {
        ...(previous && typeof previous === 'object' && !Array.isArray(previous) ? previous : {}),
        ...current,
      }
    : previous;
  return {
    ...chart,
    dasha: repaired,
    currentDasha: nextCurrent,
  };
}

/**
 * Full Vimshottari Dasha with Antardasha and Pratyantardasha.
 *
 * @param moonLonSidereal - Moon's sidereal longitude (0-360)
 * @param birthDate - Birth date/time (UTC)
 */
export function calculateFullVimshottariDasha(
  moonLonSidereal: number,
  birthDate: Date,
  now: Date = new Date(),
): DashaResult {
  const nakIndex = Math.floor((moonLonSidereal % 360) / (360 / 27));
  const startIdx = nakIndex % 9;

  const degreesInNak = moonLonSidereal % (360 / 27);
  const nakFraction = degreesInNak / (360 / 27);

  const firstEntry = VIMSHOTTARI_SEQUENCE[startIdx];
  const elapsedYears = firstEntry.years * nakFraction;
  const remainingYears = firstEntry.years - elapsedYears;
  const nowMs = now.getTime();

  const periods: DashaPeriod[] = [];
  let cursor = new Date(birthDate);

  let currentMaha: DashaPeriod | null = null;
  let currentAntar: DashaPeriod | null = null;
  let currentPratyantar: DashaPeriod | null = null;

  for (let i = 0; i < 9; i++) {
    const entry = VIMSHOTTARI_SEQUENCE[(startIdx + i) % 9];
    const duration = i === 0 ? remainingYears : entry.years;
    const windowStart = new Date(cursor);
    const end = addYears(cursor, duration);
    const current = isCurrentPeriod(windowStart, end, nowMs);
    const periodStart = i === 0 ? addYears(birthDate, -elapsedYears) : windowStart;

    const period: DashaPeriod = {
      lord: entry.lord,
      startDate: isoDate(windowStart),
      endDate: isoDate(end),
      durationYears: duration,
      level: 'mahadasha',
      isCurrent: current,
      progress: progressOf(windowStart, end, nowMs),
    };

    if (current) {
      const subIdx = VIMSHOTTARI_SEQUENCE.findIndex(s => s.lord === entry.lord);
      period.subPeriods = calcSubPeriods(
        periodStart, entry.years, subIdx, entry.lord, 'antardasha', windowStart, nowMs, true,
      );
      currentMaha = period;
      currentAntar = period.subPeriods.find(s => s.isCurrent) ?? null;
      if (currentAntar?.subPeriods) {
        currentPratyantar = currentAntar.subPeriods.find(s => s.isCurrent) ?? null;
      }
    }

    periods.push(period);
    cursor = end;
  }

  return {
    system: 'vimshottari',
    totalCycleYears: VIMSHOTTARI_TOTAL,
    periods,
    currentMaha,
    currentAntar,
    currentPratyantar,
  };
}

// ---------------------------------------------------------------------------
// YOGINI DASHA (36-year cycle)
// ---------------------------------------------------------------------------

const YOGINI_SEQUENCE = [
  { lord: 'Moon',    yogini: 'Mangala',   years: 1 },
  { lord: 'Sun',     yogini: 'Pingala',   years: 2 },
  { lord: 'Jupiter', yogini: 'Dhanya',    years: 3 },
  { lord: 'Mars',    yogini: 'Bhramari',  years: 4 },
  { lord: 'Mercury', yogini: 'Bhadrika',  years: 5 },
  { lord: 'Saturn',  yogini: 'Ulka',      years: 6 },
  { lord: 'Venus',   yogini: 'Siddha',    years: 7 },
  { lord: 'Rahu',    yogini: 'Sankata',   years: 8 },
];

const YOGINI_TOTAL = 36;

/**
 * Yogini Dasha — a 36-year, 8-goddess timing system.
 *
 * Determination: (Nakshatra number + 3) mod 8 gives starting Yogini index.
 */
export function calculateYoginiDasha(
  moonLonSidereal: number,
  birthDate: Date,
): DashaResult {
  const nakIndex = Math.floor((moonLonSidereal % 360) / (360 / 27));
  const startIdx = (nakIndex + 3) % 8;

  const degreesInNak = moonLonSidereal % (360 / 27);
  const nakFraction = degreesInNak / (360 / 27);

  const firstEntry = YOGINI_SEQUENCE[startIdx];
  const remainingYears = firstEntry.years * (1 - nakFraction);

  const periods: DashaPeriod[] = [];
  let cursor = new Date(birthDate);
  let currentMaha: DashaPeriod | null = null;

  for (let i = 0; i < 8; i++) {
    const entry = YOGINI_SEQUENCE[(startIdx + i) % 8];
    const duration = i === 0 ? remainingYears : entry.years;
    const end = addYears(cursor, duration);
    const current = isCurrentPeriod(cursor, end);

    const period: DashaPeriod = {
      lord: `${entry.yogini} (${entry.lord})`,
      startDate: isoDate(cursor),
      endDate: isoDate(end),
      durationYears: duration,
      level: 'mahadasha',
      isCurrent: current,
      progress: progressOf(cursor, end),
    };

    if (current) currentMaha = period;
    periods.push(period);
    cursor = end;
  }

  return {
    system: 'yogini',
    totalCycleYears: YOGINI_TOTAL,
    periods,
    currentMaha,
    currentAntar: null,
    currentPratyantar: null,
  };
}

// ---------------------------------------------------------------------------
// ASHTOTTARI DASHA (108-year cycle)
// ---------------------------------------------------------------------------

const ASHTOTTARI_SEQUENCE = [
  { lord: 'Sun',     years: 6 },
  { lord: 'Moon',    years: 15 },
  { lord: 'Mars',    years: 8 },
  { lord: 'Mercury', years: 17 },
  { lord: 'Saturn',  years: 14 },
  { lord: 'Jupiter', years: 19 },
  { lord: 'Rahu',    years: 12 },
  { lord: 'Venus',   years: 17 },
];

const ASHTOTTARI_TOTAL = 108;

const ASHTOTTARI_NAK_MAP: Record<number, number> = {
  5: 0,   // Ardra → Sun
  6: 1,   // Punarvasu → Moon
  7: 2,   // Pushya → Mars
  8: 3,   // Ashlesha → Mercury
  14: 4,  // Swati → Saturn
  15: 5,  // Vishakha → Jupiter
  16: 6,  // Anuradha → Rahu
  17: 7,  // Jyeshtha → Venus
  23: 0,  // Shatabhisha → Sun
  24: 1,  // Purva Bhadrapada → Moon
  25: 2,  // Uttara Bhadrapada → Mars
  26: 3,  // Revati → Mercury
};

/**
 * Ashtottari Dasha — a 108-year, 8-planet cycle.
 *
 * Applicable when Rahu is in a kendra or trikona from the lagna lord.
 * Uses a specific nakshatra-to-lord mapping.
 */
export function calculateAshtottariDasha(
  moonLonSidereal: number,
  birthDate: Date,
): DashaResult {
  const nakIndex = Math.floor((moonLonSidereal % 360) / (360 / 27));
  const startIdx = ASHTOTTARI_NAK_MAP[nakIndex] ?? (nakIndex % 8);

  const degreesInNak = moonLonSidereal % (360 / 27);
  const nakFraction = degreesInNak / (360 / 27);

  const firstEntry = ASHTOTTARI_SEQUENCE[startIdx];
  const remainingYears = firstEntry.years * (1 - nakFraction);

  const periods: DashaPeriod[] = [];
  let cursor = new Date(birthDate);
  let currentMaha: DashaPeriod | null = null;

  for (let i = 0; i < 8; i++) {
    const entry = ASHTOTTARI_SEQUENCE[(startIdx + i) % 8];
    const duration = i === 0 ? remainingYears : entry.years;
    const end = addYears(cursor, duration);
    const current = isCurrentPeriod(cursor, end);

    const period: DashaPeriod = {
      lord: entry.lord,
      startDate: isoDate(cursor),
      endDate: isoDate(end),
      durationYears: duration,
      level: 'mahadasha',
      isCurrent: current,
      progress: progressOf(cursor, end),
    };

    if (current) currentMaha = period;
    periods.push(period);
    cursor = end;
  }

  return {
    system: 'ashtottari',
    totalCycleYears: ASHTOTTARI_TOTAL,
    periods,
    currentMaha,
    currentAntar: null,
    currentPratyantar: null,
  };
}
