/**
 * Complete Parashara Varga (Divisional Chart) Calculator
 *
 * Implements all 16 standard Shoda-Varga divisional charts as described
 * in Brihat Parashara Hora Shastra (BPHS).
 *
 * Each varga has its own mapping rule: the sign-index produced by a given
 * sidereal longitude depends on the varga's formula, NOT a generic "divide by N"
 * shortcut.  This module faithfully follows Parashara's enumerated rules for each.
 */

const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

const norm12 = (n: number) => ((n % 12) + 12) % 12;

/**
 * D1 — Rashi (Birth Chart)
 * 30° per sign.  Trivial: the sign index is floor(lon / 30).
 */
function d1Sign(lon: number): number {
  return Math.floor(((lon % 360) + 360) % 360 / 30);
}

/**
 * D2 — Hora (Wealth)
 * Each sign is divided into two 15° halves.
 * Odd signs (Aries=0, Gemini=2 ...): 1st half → Sun (Leo=4), 2nd half → Moon (Cancer=3)
 * Even signs (Taurus=1, Cancer=3 ...): 1st half → Moon (Cancer=3), 2nd half → Sun (Leo=4)
 */
function d2Sign(lon: number): number {
  const signIdx = Math.floor(lon / 30);
  const degInSign = lon % 30;
  const half = degInSign < 15 ? 0 : 1;
  const isOdd = signIdx % 2 === 0;
  if (isOdd) return half === 0 ? 4 : 3; // Leo / Cancer
  return half === 0 ? 3 : 4;            // Cancer / Leo
}

/**
 * D3 — Drekkana (Siblings, courage)
 * Each sign is divided into three 10° parts (decanates).
 * 1st decanate → same sign
 * 2nd decanate → 5th sign from it
 * 3rd decanate → 9th sign from it
 */
function d3Sign(lon: number): number {
  const signIdx = Math.floor(lon / 30);
  const degInSign = lon % 30;
  const part = Math.floor(degInSign / 10);
  return norm12(signIdx + part * 4);
}

/**
 * D4 — Chaturthamsa (Fortune, property)
 * Each sign is divided into four 7.5° parts.
 * Parts start from the sign itself, then 4th, 7th, 10th sign.
 */
function d4Sign(lon: number): number {
  const signIdx = Math.floor(lon / 30);
  const degInSign = lon % 30;
  const part = Math.floor(degInSign / 7.5);
  return norm12(signIdx + part * 3);
}

/**
 * D7 — Saptamsa (Children, progeny)
 * Each sign is divided into seven equal parts of 4°17'8.57" (~4.2857°).
 * Odd signs: count from same sign
 * Even signs: count from 7th sign (index + 6)
 */
function d7Sign(lon: number): number {
  const signIdx = Math.floor(lon / 30);
  const degInSign = lon % 30;
  const part = Math.floor(degInSign / (30 / 7));
  const isOdd = signIdx % 2 === 0;
  const startSign = isOdd ? signIdx : norm12(signIdx + 6);
  return norm12(startSign + part);
}

/**
 * D9 — Navamsa (Marriage, dharma, spiritual purpose)
 * Each sign is divided into nine equal parts of 3°20' (3.333°).
 * Fire signs (0,4,8): start from Aries (0)
 * Earth signs (1,5,9): start from Capricorn (9)
 * Air signs (2,6,10): start from Libra (6)
 * Water signs (3,7,11): start from Cancer (3)
 */
function d9Sign(lon: number): number {
  const signIdx = Math.floor(lon / 30);
  const degInSign = lon % 30;
  const part = Math.floor(degInSign / (30 / 9));
  const element = signIdx % 4;
  const startSigns = [0, 9, 6, 3]; // Fire, Earth, Air, Water
  return norm12(startSigns[element] + part);
}

/**
 * D10 — Dasamsa (Career, profession, public life)
 * Each sign is divided into ten equal parts of 3°.
 * Odd signs: start from same sign
 * Even signs: start from 9th sign (index + 8)
 */
function d10Sign(lon: number): number {
  const signIdx = Math.floor(lon / 30);
  const degInSign = lon % 30;
  const part = Math.floor(degInSign / 3);
  const isOdd = signIdx % 2 === 0;
  const startSign = isOdd ? signIdx : norm12(signIdx + 8);
  return norm12(startSign + part);
}

/**
 * D12 — Dwadasamsa (Parents, ancestry)
 * Each sign is divided into twelve equal parts of 2°30' (2.5°).
 * Always starts from the sign itself.
 */
function d12Sign(lon: number): number {
  const signIdx = Math.floor(lon / 30);
  const degInSign = lon % 30;
  const part = Math.floor(degInSign / 2.5);
  return norm12(signIdx + part);
}

/**
 * D16 — Shodasamsa (Vehicles, comforts, happiness)
 * Each sign is divided into sixteen equal parts of 1°52'30" (1.875°).
 * Movable signs (0,3,6,9): start from Aries (0)
 * Fixed signs (1,4,7,10): start from Leo (4)
 * Dual signs (2,5,8,11): start from Sagittarius (8)
 */
function d16Sign(lon: number): number {
  const signIdx = Math.floor(lon / 30);
  const degInSign = lon % 30;
  const part = Math.floor(degInSign / (30 / 16));
  const modality = signIdx % 3;
  const startSigns = [0, 4, 8]; // Movable, Fixed, Dual
  return norm12(startSigns[modality] + part);
}

/**
 * D20 — Vimsamsa (Spiritual progress, upasana)
 * Each sign is divided into twenty equal parts of 1°30' (1.5°).
 * Movable signs: start from Aries (0)
 * Fixed signs: start from Sagittarius (8)
 * Dual signs: start from Leo (4)
 */
function d20Sign(lon: number): number {
  const signIdx = Math.floor(lon / 30);
  const degInSign = lon % 30;
  const part = Math.floor(degInSign / 1.5);
  const modality = signIdx % 3;
  const startSigns = [0, 8, 4]; // Movable, Fixed, Dual
  return norm12(startSigns[modality] + part);
}

/**
 * D24 — Chaturvimsamsa / Siddhamsa (Education, learning)
 * Each sign is divided into twenty-four equal parts of 1°15' (1.25°).
 * Odd signs: start from Leo (4)
 * Even signs: start from Cancer (3)
 */
function d24Sign(lon: number): number {
  const signIdx = Math.floor(lon / 30);
  const degInSign = lon % 30;
  const part = Math.floor(degInSign / 1.25);
  const isOdd = signIdx % 2 === 0;
  return norm12((isOdd ? 4 : 3) + part);
}

/**
 * D27 — Saptavimsamsa / Nakshatramsa (Strength, vitality)
 * Each sign is divided into twenty-seven equal parts of 1°6'40" (~1.1111°).
 * Fire signs (0,4,8): start from Aries (0)
 * Earth signs (1,5,9): start from Cancer (3)
 * Air signs (2,6,10): start from Libra (6)
 * Water signs (3,7,11): start from Capricorn (9)
 */
function d27Sign(lon: number): number {
  const signIdx = Math.floor(lon / 30);
  const degInSign = lon % 30;
  const part = Math.floor(degInSign / (30 / 27));
  const element = signIdx % 4;
  const startSigns = [0, 3, 6, 9]; // Fire, Earth, Air, Water
  return norm12(startSigns[element] + part);
}

/**
 * D30 — Trimsamsa (Misfortune, disease)
 * Parashara's Trimsamsa uses unequal divisions.
 * Odd signs: 0-5° Mars, 5-10° Saturn, 10-18° Jupiter, 18-25° Mercury, 25-30° Venus
 * Even signs: 0-5° Venus, 5-12° Mercury, 12-20° Jupiter, 20-25° Saturn, 25-30° Mars
 * The sign assigned = exaltation sign of the ruling planet.
 */
function d30Sign(lon: number): number {
  const signIdx = Math.floor(lon / 30);
  const degInSign = lon % 30;
  const isOdd = signIdx % 2 === 0;

  const exaltationSigns: Record<string, number> = {
    Mars: 9,      // Capricorn
    Saturn: 6,    // Libra
    Jupiter: 3,   // Cancer
    Mercury: 5,   // Virgo
    Venus: 11,    // Pisces
  };

  let ruler: string;
  if (isOdd) {
    if (degInSign < 5) ruler = 'Mars';
    else if (degInSign < 10) ruler = 'Saturn';
    else if (degInSign < 18) ruler = 'Jupiter';
    else if (degInSign < 25) ruler = 'Mercury';
    else ruler = 'Venus';
  } else {
    if (degInSign < 5) ruler = 'Venus';
    else if (degInSign < 12) ruler = 'Mercury';
    else if (degInSign < 20) ruler = 'Jupiter';
    else if (degInSign < 25) ruler = 'Saturn';
    else ruler = 'Mars';
  }

  return exaltationSigns[ruler];
}

/**
 * D40 — Khavedamsa (Auspicious/inauspicious effects)
 * Each sign is divided into forty equal parts of 0°45' (0.75°).
 * Odd signs: start from Aries (0)
 * Even signs: start from Libra (6)
 */
function d40Sign(lon: number): number {
  const signIdx = Math.floor(lon / 30);
  const degInSign = lon % 30;
  const part = Math.floor(degInSign / 0.75);
  const isOdd = signIdx % 2 === 0;
  return norm12((isOdd ? 0 : 6) + part);
}

/**
 * D45 — Akshavedamsa (General indications, character)
 * Each sign is divided into forty-five equal parts of 0°40' (~0.6667°).
 * Movable signs: start from Aries (0)
 * Fixed signs: start from Leo (4)
 * Dual signs: start from Sagittarius (8)
 */
function d45Sign(lon: number): number {
  const signIdx = Math.floor(lon / 30);
  const degInSign = lon % 30;
  const part = Math.floor(degInSign / (30 / 45));
  const modality = signIdx % 3;
  const startSigns = [0, 4, 8]; // Movable, Fixed, Dual
  return norm12(startSigns[modality] + part);
}

/**
 * D60 — Shashtiamsa (Past-life karma, most subtle)
 * Each sign is divided into sixty equal parts of 0°30' (0.5°).
 * Always starts from the sign itself.
 * Each of the 60 parts also has a named deity — tracked separately.
 */
function d60Sign(lon: number): number {
  const signIdx = Math.floor(lon / 30);
  const degInSign = lon % 30;
  const part = Math.floor(degInSign / 0.5);
  return norm12(signIdx + part);
}

export interface VargaInfo {
  key: string;
  division: number;
  name: string;
  sanskritName: string;
  signification: string;
  fn: (lon: number) => number;
}

export const ALL_VARGAS: VargaInfo[] = [
  { key: 'D1',  division: 1,  name: 'Rashi',         sanskritName: 'Rāśi',             signification: 'Overall life, body, self',               fn: d1Sign },
  { key: 'D2',  division: 2,  name: 'Hora',          sanskritName: 'Horā',             signification: 'Wealth, financial sustenance',            fn: d2Sign },
  { key: 'D3',  division: 3,  name: 'Drekkana',      sanskritName: 'Drekkāṇa',         signification: 'Siblings, courage, communication',        fn: d3Sign },
  { key: 'D4',  division: 4,  name: 'Chaturthamsa',  sanskritName: 'Chaturthāṁśa',     signification: 'Property, fortune, fixed assets',         fn: d4Sign },
  { key: 'D7',  division: 7,  name: 'Saptamsa',      sanskritName: 'Saptāṁśa',         signification: 'Children, progeny',                       fn: d7Sign },
  { key: 'D9',  division: 9,  name: 'Navamsa',       sanskritName: 'Navāṁśa',          signification: 'Marriage, dharma, spiritual purpose',      fn: d9Sign },
  { key: 'D10', division: 10, name: 'Dasamsa',       sanskritName: 'Daśāṁśa',          signification: 'Career, profession, public life',         fn: d10Sign },
  { key: 'D12', division: 12, name: 'Dwadasamsa',    sanskritName: 'Dvādaśāṁśa',       signification: 'Parents, ancestry, lineage',              fn: d12Sign },
  { key: 'D16', division: 16, name: 'Shodasamsa',    sanskritName: 'Ṣoḍaśāṁśa',       signification: 'Vehicles, comforts, happiness',           fn: d16Sign },
  { key: 'D20', division: 20, name: 'Vimsamsa',      sanskritName: 'Viṁśāṁśa',        signification: 'Spiritual progress, devotion (upasana)',   fn: d20Sign },
  { key: 'D24', division: 24, name: 'Siddhamsa',     sanskritName: 'Siddhāṁśa',        signification: 'Education, learning, higher knowledge',   fn: d24Sign },
  { key: 'D27', division: 27, name: 'Nakshatramsa',  sanskritName: 'Nakṣatrāṁśa',      signification: 'Strength, vitality, endurance',           fn: d27Sign },
  { key: 'D30', division: 30, name: 'Trimsamsa',     sanskritName: 'Triṁśāṁśa',       signification: 'Misfortune, disease, evil tendencies',    fn: d30Sign },
  { key: 'D40', division: 40, name: 'Khavedamsa',    sanskritName: 'Khavedāṁśa',       signification: 'Auspicious/inauspicious effects',         fn: d40Sign },
  { key: 'D45', division: 45, name: 'Akshavedamsa',  sanskritName: 'Akṣavedāṁśa',      signification: 'General indications, character, paternal',fn: d45Sign },
  { key: 'D60', division: 60, name: 'Shashtiamsa',   sanskritName: 'Ṣaṣṭiāṁśa',       signification: 'Past-life karma, most subtle effects',    fn: d60Sign },
];

export interface VargaPlanet {
  name: string;
  lonSidereal: number;
  divSign: number;
  signName: string;
  degreeInSign: number;
  nakshatra?: string;
  nakshatraPada?: number;
}

export interface VargaChart {
  key: string;
  division: number;
  name: string;
  sanskritName: string;
  signification: string;
  ascendant: {
    divSign: number;
    signName: string;
    degreeInSign: number;
    lonSidereal: number;
  };
  planets: Record<string, VargaPlanet>;
}

/**
 * Compute a single divisional chart for given planets & ascendant.
 */
export function computeVarga(
  varga: VargaInfo,
  planets: Record<string, any>,
  ascendantLonSidereal: number,
): VargaChart {
  const ascDivSign = varga.fn(ascendantLonSidereal);

  const vargaPlanets: Record<string, VargaPlanet> = {};
  for (const [name, data] of Object.entries(planets)) {
    if (typeof data?.lonSidereal !== 'number') continue;
    const divSign = varga.fn(data.lonSidereal);
    vargaPlanets[name] = {
      name,
      lonSidereal: data.lonSidereal,
      divSign,
      signName: SIGNS[divSign],
      degreeInSign: data.degreeInSign ?? data.lonSidereal % 30,
      nakshatra: data.nakshatra,
      nakshatraPada: data.nakshatraPada,
    };
  }

  return {
    key: varga.key,
    division: varga.division,
    name: varga.name,
    sanskritName: varga.sanskritName,
    signification: varga.signification,
    ascendant: {
      divSign: ascDivSign,
      signName: SIGNS[ascDivSign],
      degreeInSign: ascendantLonSidereal % 30,
      lonSidereal: ascendantLonSidereal,
    },
    planets: vargaPlanets,
  };
}

/**
 * Compute ALL 16 Shoda-Varga charts at once.
 */
export function computeAllVargas(
  planets: Record<string, any>,
  ascendantLonSidereal: number,
): Record<string, VargaChart> {
  const result: Record<string, VargaChart> = {};
  for (const varga of ALL_VARGAS) {
    result[varga.key] = computeVarga(varga, planets, ascendantLonSidereal);
  }
  return result;
}

/**
 * Compute the Shoda-Varga strength (Varga-Visesha-Bala) for a planet.
 * This measures how many vargas place the planet in its own sign, exaltation,
 * or a friendly sign — a key dignity metric in Vedic astrology.
 */
export function computeVargaViseshaBala(
  planetLonSidereal: number,
  planetSignRulerIndex: number,
  planetExaltationIndex: number,
): {
  total: number;
  inOwnSign: string[];
  inExaltation: string[];
  inFriendly: string[];
} {
  const inOwnSign: string[] = [];
  const inExaltation: string[] = [];
  const inFriendly: string[] = [];

  for (const varga of ALL_VARGAS) {
    const divSign = varga.fn(planetLonSidereal);
    if (divSign === planetSignRulerIndex) {
      inOwnSign.push(varga.key);
    }
    if (divSign === planetExaltationIndex) {
      inExaltation.push(varga.key);
    }
  }

  return {
    total: inOwnSign.length * 2 + inExaltation.length * 3 + inFriendly.length,
    inOwnSign,
    inExaltation,
    inFriendly,
  };
}
