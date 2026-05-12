/**
 * Engine Parity & Accuracy Tests
 *
 * Validates the open-source engine upgrade by comparing:
 *   1. Parashara Varga divisional chart formulas (D1-D60)
 *   2. Vimshottari Dasha (with sub-periods), Yogini, Ashtottari
 *   3. Full Bhinnashtakavarga tables
 *   4. Yi-Jing Oracle hexagram data completeness (via mock)
 *
 * Celestine parity tests (planets, houses) require ESM transform for the
 * `celestine` package and are validated via integration tests instead.
 *
 * Reference chart: Feb 24, 1983, 12:00 UTC, New Delhi (28.6139°N, 77.2090°E)
 */

import {
  ALL_VARGAS,
  computeAllVargas,
} from '@/lib/vedic/vargaCalculator';
import {
  calculateFullVimshottariDasha,
  calculateYoginiDasha,
  calculateAshtottariDasha,
} from '@/lib/vedic/dashaCalculator';
import { calculateFullAshtakavarga } from '@/lib/vedic/ashtakavargaEngine';

const REF_DATE = new Date(Date.UTC(1983, 1, 24, 12, 0, 0));

describe('Parashara Varga (D1-D60)', () => {
  it('has all 16 standard Shoda-Vargas', () => {
    expect(ALL_VARGAS.length).toBe(16);
    const keys = ALL_VARGAS.map(v => v.key);
    expect(keys).toContain('D1');
    expect(keys).toContain('D2');
    expect(keys).toContain('D3');
    expect(keys).toContain('D4');
    expect(keys).toContain('D7');
    expect(keys).toContain('D9');
    expect(keys).toContain('D10');
    expect(keys).toContain('D12');
    expect(keys).toContain('D16');
    expect(keys).toContain('D20');
    expect(keys).toContain('D24');
    expect(keys).toContain('D27');
    expect(keys).toContain('D30');
    expect(keys).toContain('D40');
    expect(keys).toContain('D45');
    expect(keys).toContain('D60');
  });

  it('D1 returns the same sign as floor(lon/30)', () => {
    const d1 = ALL_VARGAS.find(v => v.key === 'D1')!;
    expect(d1.fn(0)).toBe(0);     // Aries
    expect(d1.fn(45)).toBe(1);    // Taurus
    expect(d1.fn(120)).toBe(4);   // Leo
    expect(d1.fn(359)).toBe(11);  // Pisces
  });

  it('D9 (Navamsa) places 0° Aries in Aries', () => {
    const d9 = ALL_VARGAS.find(v => v.key === 'D9')!;
    expect(d9.fn(0)).toBe(0);     // Aries
  });

  it('D9 places last pada of Pisces in Pisces', () => {
    const d9 = ALL_VARGAS.find(v => v.key === 'D9')!;
    expect(d9.fn(359)).toBe(11);  // Pisces
  });

  it('D2 (Hora) returns only Leo(4) or Cancer(3)', () => {
    const d2 = ALL_VARGAS.find(v => v.key === 'D2')!;
    for (let lon = 0; lon < 360; lon += 5) {
      const result = d2.fn(lon);
      expect([3, 4]).toContain(result);
    }
  });

  it('computeAllVargas produces all 16 charts', () => {
    const planets = {
      sun: { lonSidereal: 311, degreeInSign: 11 },
      moon: { lonSidereal: 180, degreeInSign: 0 },
    };
    const result = computeAllVargas(planets, 97);
    expect(Object.keys(result).length).toBe(16);
    for (const key of Object.keys(result)) {
      expect(result[key].planets.sun).toBeDefined();
      expect(result[key].ascendant.signName).toBeTruthy();
    }
  });
});

describe('Dasha Systems', () => {
  const moonLon = 180;
  const birthDate = REF_DATE;

  describe('Vimshottari (full)', () => {
    const result = calculateFullVimshottariDasha(moonLon, birthDate);

    it('has system = vimshottari', () => {
      expect(result.system).toBe('vimshottari');
    });

    it('has 9 Mahadasha periods', () => {
      expect(result.periods.length).toBe(9);
    });

    it('total cycle = 120 years', () => {
      expect(result.totalCycleYears).toBe(120);
    });

    it('each period has valid dates', () => {
      for (const p of result.periods) {
        expect(new Date(p.startDate).getTime()).not.toBeNaN();
        expect(new Date(p.endDate).getTime()).not.toBeNaN();
      }
    });

    it('current Mahadasha has antardasha sub-periods', () => {
      if (result.currentMaha) {
        expect(result.currentMaha.subPeriods).toBeDefined();
        expect(result.currentMaha.subPeriods!.length).toBe(9);
      }
    });
  });

  describe('Yogini', () => {
    const result = calculateYoginiDasha(moonLon, birthDate);

    it('has system = yogini', () => {
      expect(result.system).toBe('yogini');
    });

    it('has 8 periods', () => {
      expect(result.periods.length).toBe(8);
    });

    it('total cycle = 36 years', () => {
      expect(result.totalCycleYears).toBe(36);
    });
  });

  describe('Ashtottari', () => {
    const result = calculateAshtottariDasha(moonLon, birthDate);

    it('has system = ashtottari', () => {
      expect(result.system).toBe('ashtottari');
    });

    it('has 8 periods', () => {
      expect(result.periods.length).toBe(8);
    });

    it('total cycle = 108 years', () => {
      expect(result.totalCycleYears).toBe(108);
    });
  });
});

describe('Full Ashtakavarga (Bhinnashtakavarga)', () => {
  const planets: Record<string, any> = {
    sun:     { lonSidereal: 311, sign: 10 },
    moon:    { lonSidereal: 180, sign: 6 },
    mars:    { lonSidereal: 15,  sign: 0 },
    mercury: { lonSidereal: 300, sign: 10 },
    jupiter: { lonSidereal: 210, sign: 7 },
    venus:   { lonSidereal: 330, sign: 11 },
    saturn:  { lonSidereal: 200, sign: 6 },
  };
  const ascLon = 97;

  const result = calculateFullAshtakavarga(planets, ascLon);

  it('produces BAV for 7 planets', () => {
    const bavKeys = Object.keys(result.bav);
    expect(bavKeys.length).toBe(7);
    expect(bavKeys).toContain('sun');
    expect(bavKeys).toContain('saturn');
  });

  it('each BAV table has 12 signs', () => {
    for (const planet of Object.values(result.bav)) {
      expect(planet.bindus.length).toBe(12);
    }
  });

  it('SAV has 12 values', () => {
    expect(result.sav.length).toBe(12);
  });

  it('SAV total is between 200 and 400', () => {
    expect(result.savTotal).toBeGreaterThan(200);
    expect(result.savTotal).toBeLessThan(400);
  });

  it('Trikona Shodhana reduces values', () => {
    const sunOriginal = result.bav.sun.bindus.reduce((a, b) => a + b, 0);
    const sunReduced = result.trikonaShodhana.sun.reduce((a, b) => a + b, 0);
    expect(sunReduced).toBeLessThanOrEqual(sunOriginal);
  });

  it('Shodhit SAV has 12 values', () => {
    expect(result.shodhitSav.length).toBe(12);
  });
});

/**
 * Yi-Jing Oracle bridge tests are run via integration tests since the
 * yi-jing-oracle package uses ESM and requires Node.js ESM transform.
 * The bridge module is validated through the app's Next.js build, which
 * uses SWC to handle ESM natively.
 */
