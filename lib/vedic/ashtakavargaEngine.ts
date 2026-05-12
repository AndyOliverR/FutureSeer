/**
 * Full Bhinnashtakavarga Engine with Trikona and Ekadhipatya Shodhana
 *
 * Implements the complete Parashara Ashtakavarga system:
 *   1. Bhinnashtakavarga (BAV) — individual planet-wise benefic point tables
 *      with contributions from 7 planets + Lagna (8 contributors per planet)
 *   2. Sarvashtakavarga (SAV) — column-wise sum of all 7 BAV tables
 *   3. Trikona Shodhana — reduction by trine (1-5-9) positions
 *   4. Ekadhipatya Shodhana — reduction for signs with same lord
 *
 * Each of the 7 planets (Sun → Saturn) has its own BAV table of benefic
 * houses from each contributor, as specified in BPHS chapters 66-72.
 */

type PlanetKey = 'sun' | 'moon' | 'mars' | 'mercury' | 'jupiter' | 'venus' | 'saturn';

const PLANETS: PlanetKey[] = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];

/**
 * Parashara Bhinnashtakavarga benefic positions.
 *
 * BAV_RULES[target][contributor] = array of house offsets (1-based, from contributor's position)
 * where the contributor gives a bindu to the target planet.
 * 'lagna' means the Ascendant contributes.
 */
const BAV_RULES: Record<PlanetKey, Record<string, number[]>> = {
  sun: {
    sun:     [1, 2, 4, 7, 8, 9, 10, 11],
    moon:    [3, 6, 10, 11],
    mars:    [1, 2, 4, 7, 8, 9, 10, 11],
    mercury: [3, 5, 6, 9, 10, 11, 12],
    jupiter: [5, 6, 9, 11],
    venus:   [6, 7, 12],
    saturn:  [1, 2, 4, 7, 8, 9, 10, 11],
    lagna:   [3, 4, 6, 10, 11, 12],
  },
  moon: {
    sun:     [3, 6, 7, 8, 10, 11],
    moon:    [1, 3, 6, 7, 10, 11],
    mars:    [2, 3, 5, 6, 9, 10, 11],
    mercury: [1, 3, 4, 5, 7, 8, 10, 11],
    jupiter: [1, 4, 7, 8, 10, 11, 12],
    venus:   [3, 4, 5, 7, 9, 10, 11],
    saturn:  [3, 5, 6, 11],
    lagna:   [3, 6, 10, 11],
  },
  mars: {
    sun:     [3, 5, 6, 10, 11],
    moon:    [3, 6, 11],
    mars:    [1, 2, 4, 7, 8, 10, 11],
    mercury: [3, 5, 6, 11],
    jupiter: [6, 10, 11, 12],
    venus:   [6, 8, 11, 12],
    saturn:  [1, 4, 7, 8, 9, 10, 11],
    lagna:   [1, 3, 6, 10, 11],
  },
  mercury: {
    sun:     [5, 6, 9, 11, 12],
    moon:    [2, 4, 6, 8, 10, 11],
    mars:    [1, 2, 4, 7, 8, 9, 10, 11],
    mercury: [1, 3, 5, 6, 9, 10, 11, 12],
    jupiter: [6, 8, 11, 12],
    venus:   [1, 2, 3, 4, 5, 8, 9, 11],
    saturn:  [1, 2, 4, 7, 8, 9, 10, 11],
    lagna:   [1, 2, 4, 6, 8, 10, 11],
  },
  jupiter: {
    sun:     [1, 2, 3, 4, 7, 8, 9, 10, 11],
    moon:    [2, 5, 7, 9, 11],
    mars:    [1, 2, 4, 7, 8, 10, 11],
    mercury: [1, 2, 4, 5, 6, 9, 10, 11],
    jupiter: [1, 2, 3, 4, 7, 8, 10, 11],
    venus:   [2, 5, 6, 9, 10, 11],
    saturn:  [3, 5, 6, 12],
    lagna:   [1, 2, 4, 5, 6, 7, 9, 10, 11],
  },
  venus: {
    sun:     [8, 11, 12],
    moon:    [1, 2, 3, 4, 5, 8, 9, 11, 12],
    mars:    [3, 5, 6, 9, 11, 12],
    mercury: [3, 5, 6, 9, 11],
    jupiter: [5, 8, 9, 10, 11],
    venus:   [1, 2, 3, 4, 5, 8, 9, 10, 11],
    saturn:  [3, 4, 5, 8, 9, 10, 11],
    lagna:   [1, 2, 3, 4, 5, 8, 9, 11],
  },
  saturn: {
    sun:     [1, 2, 4, 7, 8, 10, 11],
    moon:    [3, 6, 11],
    mars:    [3, 5, 6, 10, 11, 12],
    mercury: [6, 8, 9, 10, 11, 12],
    jupiter: [5, 6, 11, 12],
    venus:   [6, 11, 12],
    saturn:  [3, 5, 6, 11],
    lagna:   [1, 3, 4, 6, 10, 11],
  },
};

/**
 * Sign lords used for Ekadhipatya Shodhana (dual-ruled signs).
 * Index = sign (0=Aries..11=Pisces), value = ruling planet.
 */
const SIGN_LORDS: PlanetKey[] = [
  'mars',    // Aries
  'venus',   // Taurus
  'mercury', // Gemini
  'moon',    // Cancer
  'sun',     // Leo
  'mercury', // Virgo
  'venus',   // Libra
  'mars',    // Scorpio
  'jupiter', // Sagittarius
  'saturn',  // Capricorn
  'saturn',  // Aquarius
  'jupiter', // Pisces
];

export interface BhinnashtakavargaTable {
  planet: PlanetKey;
  bindus: number[];              // 12 signs, raw bindu count (0-8 each)
  totalBindus: number;
  contributors: Record<string, number[]>; // per-contributor row of 0/1
}

export interface FullAshtakavargaResult {
  bav: Record<PlanetKey, BhinnashtakavargaTable>;
  sav: number[];                 // 12 signs — Sarvashtakavarga
  savTotal: number;
  trikonaShodhana: Record<PlanetKey, number[]>;
  ekadhipatyaShodhana: Record<PlanetKey, number[]>;
  shodhitSav: number[];
  strongSigns: number[];         // sign indices with SAV >= 28
  weakSigns: number[];           // sign indices with SAV < 25
}

/**
 * Get sign index (0-11) for a planet from its sidereal longitude.
 */
function signOf(lonSidereal: number): number {
  return Math.floor(((lonSidereal % 360) + 360) % 360 / 30);
}

/**
 * Compute full Bhinnashtakavarga for all 7 planets.
 *
 * @param planets — planet map where each has `lonSidereal` (0-360) or `sign` (0-11)
 * @param ascLonSidereal — sidereal longitude of the Ascendant
 */
export function calculateFullAshtakavarga(
  planets: Record<string, any>,
  ascLonSidereal: number,
): FullAshtakavargaResult {
  const getSign = (key: string): number => {
    if (key === 'lagna') return signOf(ascLonSidereal);
    const p = planets[key];
    if (!p) return 0;
    if (typeof p.sign === 'number') return p.sign;
    if (typeof p.lonSidereal === 'number') return signOf(p.lonSidereal);
    return 0;
  };

  const bav: Record<string, BhinnashtakavargaTable> = {};
  const sav = Array(12).fill(0);

  for (const target of PLANETS) {
    const rules = BAV_RULES[target];
    const bindus = Array(12).fill(0);
    const contributors: Record<string, number[]> = {};

    for (const [contributor, offsets] of Object.entries(rules)) {
      const contribSign = getSign(contributor);
      const row = Array(12).fill(0);

      for (const offset of offsets) {
        const targetSign = (contribSign + offset - 1) % 12;
        row[targetSign] = 1;
        bindus[targetSign]++;
      }
      contributors[contributor] = row;
    }

    for (let i = 0; i < 12; i++) sav[i] += bindus[i];

    bav[target] = {
      planet: target,
      bindus,
      totalBindus: bindus.reduce((a, b) => a + b, 0),
      contributors,
    };
  }

  // -----------------------------------------------------------------------
  // TRIKONA SHODHANA (reduction by trines: signs 1-5-9)
  // -----------------------------------------------------------------------
  const trikonaShodhana: Record<string, number[]> = {};

  for (const target of PLANETS) {
    const reduced = [...bav[target].bindus];

    for (let base = 0; base < 4; base++) {
      const trio = [base, base + 4, base + 8];
      const minVal = Math.min(...trio.map(i => reduced[i]));
      for (const idx of trio) {
        reduced[idx] -= minVal;
      }
    }
    trikonaShodhana[target] = reduced;
  }

  // -----------------------------------------------------------------------
  // EKADHIPATYA SHODHANA (reduction for dual-lordship signs)
  // -----------------------------------------------------------------------
  const ekadhipatyaShodhana: Record<string, number[]> = {};

  const dualPairs: [number, number][] = [
    [0, 7],   // Mars rules Aries & Scorpio
    [2, 5],   // Mercury rules Gemini & Virgo
    [6, 1],   // Venus rules Libra & Taurus
    [8, 11],  // Jupiter rules Sagittarius & Pisces
    [9, 10],  // Saturn rules Capricorn & Aquarius
  ];

  for (const target of PLANETS) {
    const reduced = [...(trikonaShodhana[target] ?? bav[target].bindus)];

    for (const [signA, signB] of dualPairs) {
      const a = reduced[signA];
      const b = reduced[signB];
      if (a === 0 || b === 0) continue;
      const minVal = Math.min(a, b);
      reduced[signA] -= minVal;
      reduced[signB] -= minVal;
      const larger = a >= b ? signA : signB;
      reduced[larger] += minVal;
    }
    ekadhipatyaShodhana[target] = reduced;
  }

  // -----------------------------------------------------------------------
  // SHODHIT (reduced) SAV
  // -----------------------------------------------------------------------
  const shodhitSav = Array(12).fill(0);
  for (const target of PLANETS) {
    const red = ekadhipatyaShodhana[target];
    for (let i = 0; i < 12; i++) shodhitSav[i] += red[i];
  }

  const strongSigns: number[] = [];
  const weakSigns: number[] = [];
  for (let i = 0; i < 12; i++) {
    if (sav[i] >= 28) strongSigns.push(i);
    if (sav[i] < 25) weakSigns.push(i);
  }

  return {
    bav: bav as Record<PlanetKey, BhinnashtakavargaTable>,
    sav,
    savTotal: sav.reduce((a, b) => a + b, 0),
    trikonaShodhana: trikonaShodhana as Record<PlanetKey, number[]>,
    ekadhipatyaShodhana: ekadhipatyaShodhana as Record<PlanetKey, number[]>,
    shodhitSav,
    strongSigns,
    weakSigns,
  };
}

/**
 * Generate human-readable interpretation of the Ashtakavarga result.
 */
export function interpretFullAshtakavarga(result: FullAshtakavargaResult): string[] {
  const signs = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
  ];

  const lines: string[] = [];

  lines.push(`Sarvashtakavarga Total: ${result.savTotal} bindus`);

  if (result.savTotal >= 337) {
    lines.push('Overall planetary strength is exceptional (337+). All areas of life receive strong support.');
  } else if (result.savTotal >= 300) {
    lines.push('Overall planetary strength is above average. Most areas of life are well supported.');
  } else if (result.savTotal >= 250) {
    lines.push('Overall planetary strength is moderate. Focused effort needed in weak areas.');
  } else {
    lines.push('Overall planetary strength is below average. Remedial measures recommended.');
  }

  if (result.strongSigns.length > 0) {
    lines.push(`Strong signs (SAV >= 28): ${result.strongSigns.map(i => signs[i]).join(', ')}`);
  }
  if (result.weakSigns.length > 0) {
    lines.push(`Weak signs (SAV < 25): ${result.weakSigns.map(i => signs[i]).join(', ')}`);
  }

  for (const planet of PLANETS) {
    const tab = result.bav[planet];
    const maxSign = tab.bindus.indexOf(Math.max(...tab.bindus));
    lines.push(
      `${planet.charAt(0).toUpperCase() + planet.slice(1)}: total ${tab.totalBindus} bindus, strongest in ${signs[maxSign]}`,
    );
  }

  return lines;
}
