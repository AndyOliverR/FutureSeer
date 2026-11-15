/**
 * Vimshottari antardashas follow the mahadasha lord and the balance already elapsed at birth.
 * @jest-environment node
 */

import { calculateVimshottariDasha } from '@/lib/astronomia-vedic';
import {
  calculateFullVimshottariDasha,
  currentAntardashaPlanet,
  repairVedicChartDasha,
} from '@/lib/vedic/dashaCalculator';

const MS_PER_DAY = 24 * 3600 * 1000;

describe('Vimshottari antardasha', () => {
  it('places birth halfway through Mars nakshatra in Mars-Mercury, not Mars or Ketu', () => {
    const birth = new Date(Date.UTC(1990, 0, 1));
    const moonLon = 180; // exact midpoint of Chitra → Mars, half the dasha already elapsed

    const chart = calculateVimshottariDasha(moonLon, birth, birth);
    const current = chart.find((row) => row.isCurrent);
    expect(current?.planet).toBe('Mars');
    expect(current?.antardasha).toBe('Mercury');
    expect(currentAntardashaPlanet(current?.antardashas)).toBe('Mercury');
    expect(current?.antardashas?.filter((row) => row.isCurrent)).toHaveLength(1);
    expect(current?.antardashas?.[0]?.planet).not.toBe('Ketu');

    const full = calculateFullVimshottariDasha(moonLon, birth, birth);
    expect(full.currentMaha?.lord).toBe('Mars');
    expect(full.currentAntar?.lord).toBe('Mercury');
  });

  it('moves a full Ketu mahadasha from Ketu-Ketu into Ketu-Venus after 200 days', () => {
    const birth = new Date(Date.UTC(1990, 0, 1));
    const now = new Date(birth.getTime() + 200 * MS_PER_DAY);
    const chart = calculateVimshottariDasha(0, birth, now);
    const current = chart.find((row) => row.isCurrent);
    expect(current?.planet).toBe('Ketu');
    expect(current?.antardasha).toBe('Venus');
    const ketuSlice = current?.antardashas?.find((row) => row.planet === 'Ketu');
    expect(ketuSlice?.isCurrent).toBe(false);
    expect(ketuSlice?.progress).toBe(100);
  });

  it('repairs a stored Moon mahadasha that still lists Ketu as the running antardasha', () => {
    const now = new Date(Date.UTC(2026, 10, 15));
    const repaired = repairVedicChartDasha(
      {
        dasha: [
          {
            planet: 'Moon',
            startDate: '2023-01-01',
            endDate: '2033-01-01',
            dashaType: 'mahadasha',
            isCurrent: true,
            antardasha: 'Ketu',
            antardashas: [
              { planet: 'Ketu', startDate: '2023-01-01', endDate: '2023-08-01', progress: 100, isCurrent: false, dashaType: 'antardasha' as const },
              { planet: 'Venus', startDate: '2023-08-01', endDate: '2025-04-01', progress: 100, isCurrent: false, dashaType: 'antardasha' as const },
            ],
          },
        ],
        currentDasha: { planet: 'Moon', antardasha: 'Ketu' },
      },
      now,
    );
    const current = (repaired.currentDasha ?? {}) as { antardasha?: string; antardashas?: Array<{ planet: string; isCurrent: boolean; progress: number }> };
    expect(current.antardasha).toBe('Jupiter');
    expect(currentAntardashaPlanet(current.antardashas)).toBe('Jupiter');
    expect(current.antardashas?.filter((row) => row.progress === 100 && row.isCurrent)).toHaveLength(0);
  });
});
