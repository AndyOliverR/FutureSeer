import { calculateKpSubLord, KP_SUBLORD_FORMULA_VERSION } from '@/lib/kp/kpSubLord'

const NAKSHATRA_SPAN = 360 / 27
const EQUAL_NINTH_SEQUENCE = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury']

/** Previous rule: nine equal slices of the nakshatra, still starting at the star lord. */
function equalNinthSubLord(longitude: number): string {
  const nakIndex = Math.floor(longitude / NAKSHATRA_SPAN)
  const within = (longitude % NAKSHATRA_SPAN) / NAKSHATRA_SPAN
  const subIndex = Math.floor(within * 9)
  return EQUAL_NINTH_SEQUENCE[(nakIndex % 9 + subIndex) % 9]
}

describe('calculateKpSubLord', () => {
  it('uses Vimshottari proportions inside Ashwini, not equal ninths', () => {
    // Ashwini star lord is Ketu. Ketu's sub is 7/120 of 13°20' = 0°46'40".
    expect(calculateKpSubLord(0)).toBe('Ketu')
    expect(calculateKpSubLord(0.7)).toBe('Ketu')
    // 1°00' is still inside Ketu under equal ninths (each ninth is ~1.481°)
    // and already Venus under KP.
    expect(equalNinthSubLord(1)).toBe('Ketu')
    expect(calculateKpSubLord(1)).toBe('Venus')
    // 4°00' is Sun under equal ninths and Moon under KP (Moon starts at 3°40').
    expect(equalNinthSubLord(4)).toBe('Sun')
    expect(calculateKpSubLord(4)).toBe('Moon')
    expect(calculateKpSubLord(3)).toBe('Sun')
    expect(KP_SUBLORD_FORMULA_VERSION).toBe(2)
  })

  it('starts the next nakshatra at its own star lord', () => {
    const bharani = NAKSHATRA_SPAN
    expect(calculateKpSubLord(bharani)).toBe('Venus')
    // 2° into Bharani is still Venus (20/120 of the nakshatra). Equal ninths would say Sun.
    expect(calculateKpSubLord(bharani + 2)).toBe('Venus')
    expect(calculateKpSubLord(bharani + 2.3)).toBe('Sun')
    // Ketu's sub ends at 0°46'40". That arcsecond belongs to Venus.
    expect(calculateKpSubLord((7 / 120) * NAKSHATRA_SPAN)).toBe('Venus')
  })

  it('keeps the end of Revati in Saturn, the last sub after Mercury', () => {
    expect(calculateKpSubLord(26 * NAKSHATRA_SPAN)).toBe('Mercury')
    expect(calculateKpSubLord(359.9)).toBe('Saturn')
  })
})
