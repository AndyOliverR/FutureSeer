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

function isCurrentPeriod(start: Date, end: Date): boolean {
  const now = Date.now();
  return now >= start.getTime() && now < end.getTime();
}

function progressOf(start: Date, end: Date): number {
  const now = Date.now();
  if (now <= start.getTime()) return 0;
  if (now >= end.getTime()) return 1;
  return (now - start.getTime()) / (end.getTime() - start.getTime());
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

function calcSubPeriods(
  parentStart: Date,
  parentDurationYears: number,
  startIdx: number,
  parentLord: string,
  level: 'antardasha' | 'pratyantardasha',
  recurse: boolean,
): DashaPeriod[] {
  const periods: DashaPeriod[] = [];
  let cursor = new Date(parentStart);

  for (let i = 0; i < 9; i++) {
    const entry = VIMSHOTTARI_SEQUENCE[(startIdx + i) % 9];
    const subDuration = (parentDurationYears * entry.years) / VIMSHOTTARI_TOTAL;
    const end = addYears(cursor, subDuration);
    const current = isCurrentPeriod(cursor, end);

    const period: DashaPeriod = {
      lord: entry.lord,
      startDate: isoDate(cursor),
      endDate: isoDate(end),
      durationYears: subDuration,
      level,
      isCurrent: current,
      progress: progressOf(cursor, end),
      parent: parentLord,
    };

    if (recurse && level === 'antardasha' && current) {
      const subIdx = VIMSHOTTARI_SEQUENCE.findIndex(s => s.lord === entry.lord);
      period.subPeriods = calcSubPeriods(
        cursor, subDuration, subIdx, entry.lord, 'pratyantardasha', false,
      );
    }

    periods.push(period);
    cursor = end;
  }

  return periods;
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
): DashaResult {
  const nakIndex = Math.floor((moonLonSidereal % 360) / (360 / 27));
  const startIdx = nakIndex % 9;

  const degreesInNak = moonLonSidereal % (360 / 27);
  const nakFraction = degreesInNak / (360 / 27);

  const firstEntry = VIMSHOTTARI_SEQUENCE[startIdx];
  const elapsedYears = firstEntry.years * nakFraction;
  const remainingYears = firstEntry.years - elapsedYears;

  const periods: DashaPeriod[] = [];
  let cursor = new Date(birthDate);

  let currentMaha: DashaPeriod | null = null;
  let currentAntar: DashaPeriod | null = null;
  let currentPratyantar: DashaPeriod | null = null;

  for (let i = 0; i < 9; i++) {
    const entry = VIMSHOTTARI_SEQUENCE[(startIdx + i) % 9];
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

    if (current) {
      const subIdx = VIMSHOTTARI_SEQUENCE.findIndex(s => s.lord === entry.lord);
      period.subPeriods = calcSubPeriods(cursor, duration, subIdx, entry.lord, 'antardasha', true);
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
