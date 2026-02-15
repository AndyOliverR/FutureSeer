/**
 * Kabbalistic Astrology Ontology
 * Deterministic mappings: Hebrew months, Sefirot, decans to angels, elements, modalities.
 * No LLM - version-controlled symbolic layer for report generation.
 */

// ─── Hebrew Month ↔ Zodiac ─────────────────────────────────────────────────
/** Hebrew month names in order (Nisan = 1, spring). */
export const HEBREW_MONTHS = [
  'Nisan', 'Iyar', 'Sivan', 'Tammuz', 'Av', 'Elul',
  'Tishrei', 'Cheshvan', 'Kislev', 'Tevet', 'Shevat', 'Adar'
] as const;

/** Zodiac signs in tropical order. */
export const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
] as const;

/** Sign → element. */
const SIGN_ELEMENT: Record<string, 'fire' | 'earth' | 'air' | 'water'> = {
  Aries: 'fire', Taurus: 'earth', Gemini: 'air', Cancer: 'water',
  Leo: 'fire', Virgo: 'earth', Libra: 'air', Scorpio: 'water',
  Sagittarius: 'fire', Capricorn: 'earth', Aquarius: 'air', Pisces: 'water'
};

/** Sign → modality. */
const SIGN_MODALITY: Record<string, 'cardinal' | 'fixed' | 'mutable'> = {
  Aries: 'cardinal', Taurus: 'fixed', Gemini: 'mutable', Cancer: 'cardinal',
  Leo: 'fixed', Virgo: 'mutable', Libra: 'cardinal', Scorpio: 'fixed',
  Sagittarius: 'mutable', Capricorn: 'cardinal', Aquarius: 'fixed', Pisces: 'mutable'
};

/** Get Hebrew month for a zodiac sign (Nisan = Aries). */
export function getHebrewMonthForSign(signName: string): string {
  const idx = ZODIAC_SIGNS.indexOf(signName as (typeof ZODIAC_SIGNS)[number]);
  if (idx < 0) return 'Unknown';
  return HEBREW_MONTHS[idx];
}

/** Get zodiac sign index (0-11). */
export function getSignIndex(signName: string): number {
  const normalized = (signName || '').trim();
  const idx = ZODIAC_SIGNS.findIndex((s) => s.toLowerCase() === normalized.toLowerCase());
  return idx >= 0 ? idx : 0;
}

// ─── Planet → Sefirah ──────────────────────────────────────────────────────
/** Classical planet-to-Sefirah mapping (Tree of Life). */
export const PLANET_SEFIROT: Record<string, { sefirah: string; pillar: string; archetype: string }> = {
  Sun: { sefirah: 'Tiferet', pillar: 'Middle', archetype: 'Harmonized Self' },
  Moon: { sefirah: 'Yesod', pillar: 'Middle', archetype: 'Foundation' },
  Mercury: { sefirah: 'Hod', pillar: 'Left', archetype: 'Splendor' },
  Venus: { sefirah: 'Netzach', pillar: 'Right', archetype: 'Victory' },
  Mars: { sefirah: 'Gevurah', pillar: 'Left', archetype: 'Severity' },
  Jupiter: { sefirah: 'Chesed', pillar: 'Right', archetype: 'Mercy' },
  Saturn: { sefirah: 'Binah', pillar: 'Left', archetype: 'Understanding' },
};

// ─── Decan → Angel (36 decans, 72 Names tradition) ─────────────────────────
/** Primary angel for each decan (36 decans = 12 signs × 3). Based on 72 Names / Shem HaMephorash. */
const DECAN_ANGELS: string[] = [
  'Vehuiah', 'Jeliel', 'Sitael', 'Elemiah', 'Mahasiah', 'Lelahel',
  'Achaiah', 'Cahethel', 'Haziel', 'Aladiah', 'Lauviah', 'Hahaiah',
  'Iezalel', 'Mebahel', 'Hariel', 'Hekamiah', 'Asaliah', 'Caliel',
  'Leuviah', 'Pahaliah', 'Nelchael', 'Yeiayel', 'Melahel', 'Haheuiah',
  'Nith-Haiah', 'Haaiah', 'Yeratel', 'Seheiah', 'Reiyel', 'Omael',
  'Lecabel', 'Vasariah', 'Yehuiah', 'Lehahiah', 'Chavakiah', 'Menadel'
];

/** Get decan index (0-2) from degree within sign (0-29.99). */
export function getDecanIndex(degreeInSign: number): number {
  const d = Math.max(0, Math.min(29.99, Number(degreeInSign) || 0));
  if (d < 10) return 0;
  if (d < 20) return 1;
  return 2;
}

/** Get angel name for a decan. signIndex 0-11, decanIndex 0-2. */
export function getAngelForDecan(signIndex: number, decanIndex: number): string {
  const idx = Math.max(0, Math.min(35, signIndex * 3 + decanIndex));
  return DECAN_ANGELS[idx] || 'Unknown';
}

/** Get degree within sign from longitude. */
export function getDegreeInSign(longitude: number): number {
  return ((Number(longitude) || 0) % 360 + 360) % 360 % 30;
}

// ─── Element & Modal Distribution ──────────────────────────────────────────
export interface ElementDistribution {
  fire: number;
  earth: number;
  air: number;
  water: number;
}

export interface ModeDistribution {
  cardinal: number;
  fixed: number;
  mutable: number;
}

/** Count elements from planet signs. */
export function computeElementDistribution(planets: Array<{ sign?: { signName?: string } | string }>): ElementDistribution {
  const dist: ElementDistribution = { fire: 0, earth: 0, air: 0, water: 0 };
  for (const p of planets || []) {
    const sign = typeof p.sign === 'string' ? p.sign : (p.sign as { signName?: string })?.signName;
    if (!sign) continue;
    const el = SIGN_ELEMENT[sign];
    if (el && dist[el] !== undefined) dist[el]++;
  }
  return dist;
}

/** Count modalities from planet signs. */
export function computeModeDistribution(planets: Array<{ sign?: { signName?: string } | string }>): ModeDistribution {
  const dist: ModeDistribution = { cardinal: 0, fixed: 0, mutable: 0 };
  for (const p of planets || []) {
    const sign = typeof p.sign === 'string' ? p.sign : (p.sign as { signName?: string })?.signName;
    if (!sign) continue;
    const mod = SIGN_MODALITY[sign];
    if (mod && dist[mod] !== undefined) dist[mod]++;
  }
  return dist;
}

/** Get dominant element. */
export function getDominantElement(dist: ElementDistribution): string {
  const entries = Object.entries(dist) as [keyof ElementDistribution, number][];
  const max = entries.reduce((a, b) => (a[1] >= b[1] ? a : b), entries[0]);
  return max ? max[0].charAt(0).toUpperCase() + max[0].slice(1) : 'Unknown';
}

/** Get deficient element (lowest count). */
export function getDeficientElement(dist: ElementDistribution): string {
  const entries = Object.entries(dist) as [keyof ElementDistribution, number][];
  const min = entries.reduce((a, b) => (a[1] <= b[1] ? a : b), entries[0]);
  return min ? min[0].charAt(0).toUpperCase() + min[0].slice(1) : 'Unknown';
}
