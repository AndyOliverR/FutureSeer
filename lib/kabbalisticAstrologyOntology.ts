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
/** Classical planet-to-Sefirah mapping (Tree of Life). Extended with outer planets and Ascendant/Earth. */
export const PLANET_SEFIROT: Record<string, { sefirah: string; pillar: string; archetype: string }> = {
  Sun: { sefirah: 'Tiferet', pillar: 'Middle', archetype: 'Harmonized Self' },
  Moon: { sefirah: 'Yesod', pillar: 'Middle', archetype: 'Foundation' },
  Mercury: { sefirah: 'Hod', pillar: 'Left', archetype: 'Splendor' },
  Venus: { sefirah: 'Netzach', pillar: 'Right', archetype: 'Victory' },
  Mars: { sefirah: 'Gevurah', pillar: 'Left', archetype: 'Severity' },
  Jupiter: { sefirah: 'Chesed', pillar: 'Right', archetype: 'Mercy' },
  Saturn: { sefirah: 'Binah', pillar: 'Left', archetype: 'Understanding' },
  Uranus: { sefirah: 'Chokmah', pillar: 'Right', archetype: 'Wisdom' },
  Neptune: { sefirah: 'Keter', pillar: 'Middle', archetype: 'Crown' },
  Ascendant: { sefirah: 'Malkuth', pillar: 'Middle', archetype: 'Kingdom' },
  Earth: { sefirah: 'Malkuth', pillar: 'Middle', archetype: 'Kingdom' },
};

// ─── Sign / Planet → Hebrew Letter (Sefer Yetzirah / Mazal DNA) ─────────────
/** Zodiac sign → Hebrew letter (Sefer Yetzirah tradition). */
export const SIGN_HEBREW_LETTER: Record<string, string> = {
  Aries: 'Hei', Taurus: 'Vav', Gemini: 'Zayin', Cancer: 'Chet', Leo: 'Tet', Virgo: 'Yod',
  Libra: 'Lamed', Scorpio: 'Nun', Sagittarius: 'Samech', Capricorn: 'Ayin', Aquarius: 'Tzadi', Pisces: 'Kuf'
};

/** Classical ruler of sign → Hebrew letter (letter of planet for Mazal). */
export const PLANET_RULER_LETTER: Record<string, string> = {
  Mars: 'Bet', Venus: 'Dalet', Mercury: 'Resh', Moon: 'Gimel', Sun: 'Tet',
  Jupiter: 'Kaf', Saturn: 'Tav', Uranus: 'Tzadi', Neptune: 'Kuf'
};

/** Get letter of the sign (zodiac constellation). */
export function getLetterOfSign(signName: string): string {
  return SIGN_HEBREW_LETTER[signName || ''] || 'Unknown';
}

/** Get letter of the planet (ruler of Sun sign). Sun sign's ruler → letter. */
export function getLetterOfPlanetForSign(signName: string): string {
  const ruler: Record<string, string> = {
    Aries: 'Mars', Taurus: 'Venus', Gemini: 'Mercury', Cancer: 'Moon', Leo: 'Sun',
    Virgo: 'Mercury', Libra: 'Venus', Scorpio: 'Mars', Sagittarius: 'Jupiter',
    Capricorn: 'Saturn', Aquarius: 'Uranus', Pisces: 'Neptune'
  };
  const p = ruler[signName || ''];
  return p ? (PLANET_RULER_LETTER[p] || 'Unknown') : 'Unknown';
}

// ─── 72 Names of God (Shem HaMephorash) ────────────────────────────────────
/** 72 Names of God: 5° per segment (0°–5° = 1, 5°–10° = 2, …). Standard list from Exodus 14:19–21. */
export const NAMES_72: readonly string[] = [
  'Vehuiah', 'Jeliel', 'Sitael', 'Elemiah', 'Mahasiah', 'Lelahel',
  'Achaiah', 'Cahethel', 'Haziel', 'Aladiah', 'Lauviah', 'Hahaiah',
  'Iezalel', 'Mebahel', 'Hariel', 'Hekamiah', 'Asaliah', 'Caliel',
  'Leuviah', 'Pahaliah', 'Nelchael', 'Yeiayel', 'Melahel', 'Haheuiah',
  'Nith-Haiah', 'Haaiah', 'Yeratel', 'Seheiah', 'Reiyel', 'Omael',
  'Lecabel', 'Vasariah', 'Yehuiah', 'Lehahiah', 'Chavakiah', 'Menadel',
  'Aniel', 'Haamiah', 'Rehael', 'Ieiazel', 'Hahahel', 'Mikael',
  'Veualiah', 'Yelaiah', 'Sealiah', 'Ariel', 'Ashael', 'Mihael',
  'Vehuel', 'Daniel', 'Hahasiah', 'Imamiah', 'Nanael', 'Nithael',
  'Mebahiah', 'Poyel', 'Nemamiah', 'Yeialel', 'Harahel', 'Mitzrael',
  'Umabel', 'Iahhel', 'Anauel', 'Mehiel', 'Damabiah', 'Manakel',
  'Eiael', 'Habuiah', 'Rochel', 'Ibamiah', 'Haiaiel', 'Mumiah'
];

/** Get 72 Name of God by ecliptic longitude (0–360). Index 1-based for display, 0-based internally. */
export function get72NameFromLongitude(longitude: number): { index: number; name: string } {
  const lon = ((Number(longitude) ?? 0) % 360 + 360) % 360;
  const idx = Math.min(71, Math.floor(lon / 5));
  return { index: idx + 1, name: NAMES_72[idx] ?? 'Unknown' };
}

// ─── Decan → Angel (36 decans) ─────────────────────────────────────────────
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

// ─── Sephirotic activation (for report context) ───────────────────────────
export interface SephiroticActivation {
  counts: Record<string, number>;
  dominant: string[];
  underdeveloped: string[];
}

const ALL_SEFIROT = ['Keter', 'Chokmah', 'Binah', 'Chesed', 'Gevurah', 'Tiferet', 'Netzach', 'Hod', 'Yesod', 'Malkuth'];

/** Given planets (with name and optional house), return per-Sefirah counts and dominant/underdeveloped. */
export function computeSephiroticActivation(
  planets: Array<{ name?: string; house?: number }>
): SephiroticActivation {
  const counts: Record<string, number> = {};
  for (const s of ALL_SEFIROT) counts[s] = 0;

  for (const p of planets || []) {
    const name = (p.name || '').trim();
    if (!name) continue;
    const mapping = PLANET_SEFIROT[name];
    if (mapping?.sefirah) counts[mapping.sefirah] = (counts[mapping.sefirah] ?? 0) + 1;
  }

  const entries = Object.entries(counts).filter(([, n]) => n >= 0);
  const maxCount = Math.max(0, ...entries.map(([, n]) => n));
  const minCount = Math.min(...entries.map(([, n]) => n), 10);
  const dominant = entries.filter(([, n]) => n === maxCount && n > 0).map(([s]) => s);
  const underdeveloped = entries.filter(([, n]) => n === minCount).map(([s]) => s);

  return { counts, dominant, underdeveloped };
}
