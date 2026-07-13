import { getTropicalSkyBodies } from '@/lib/astrology/computedSkyPositions';

const SIGNS = [
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces',
];

describe('computedSkyPositions', () => {
  it('returns ten standard bodies with valid signs and longitudes', () => {
    const bodies = getTropicalSkyBodies(new Date('2026-07-13T12:00:00Z'));
    expect(bodies).toHaveLength(10);
    for (const body of bodies) {
      expect(SIGNS).toContain(body.sign);
      expect(body.longitude).toBeGreaterThanOrEqual(0);
      expect(body.longitude).toBeLessThan(360);
      expect(body.degree).toBeGreaterThanOrEqual(0);
      expect(body.degree).toBeLessThan(30);
    }
  });

  it('includes Sun and Moon with distinct longitudes', () => {
    const bodies = getTropicalSkyBodies(new Date('2026-07-13T12:00:00Z'));
    const sun = bodies.find((b) => b.name === 'Sun');
    const moon = bodies.find((b) => b.name === 'Moon');
    expect(sun).toBeDefined();
    expect(moon).toBeDefined();
    expect(sun!.longitude).not.toBe(moon!.longitude);
  });
});
