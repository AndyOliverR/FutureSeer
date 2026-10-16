import { getChart } from '@/lib/astronomia-vedic'
import { getNakshatraLord, nakshatraFromLongitude } from '@/lib/vedic-core'

/**
 * Krishnamurti Paddhati reads the sub-lord of each Placidus cusp.
 * Whole-sign cusps sit at 0° of the sign, so the star and sub-lord change.
 */
describe('getChart houseSystem', () => {
  const birth = {
    date: new Date(Date.UTC(1990, 5, 15, 9, 0, 0)),
    latitude: 19.076,
    longitude: 72.8777,
    birthDate: new Date(Date.UTC(1990, 5, 15, 9, 0, 0)),
  }

  it('keeps Vedic charts on whole-sign houses when no system is requested', () => {
    const chart = getChart(birth, { ayanamsha: 'lahiri' })
    expect(chart.metadata.system).toBe('whole-sign')
    expect(chart.houses[0].cuspLonSid % 30).toBeCloseTo(0, 4)
  })

  it('casts KP cusps with Placidus instead of the sign boundary', () => {
    const whole = getChart(birth, { ayanamsha: 'kp', houseSystem: 'whole-sign' })
    const placidus = getChart(birth, { ayanamsha: 'kp', houseSystem: 'placidus' })
    const equal = getChart(birth, { ayanamsha: 'kp', houseSystem: 'equal' })

    expect(whole.metadata.system).toBe('whole-sign')
    expect(placidus.metadata.system).toBe('placidus')
    expect(equal.metadata.system).toBe('equal')

    const asc = placidus.ascendant.lonSidereal as number
    const degreeInSign = ((asc % 30) + 30) % 30
    expect(degreeInSign).toBeGreaterThan(0.5)
    expect(degreeInSign).toBeLessThan(29.5)

    expect(whole.houses[0].cuspLonSid % 30).toBeCloseTo(0, 4)
    // Placidus cusp 1 is the ascendant, not 0° of the rising sign.
    expect(Math.abs(placidus.houses[0].cuspLonSid - asc)).toBeLessThan(1)
    expect(Math.abs(placidus.houses[0].cuspLonSid - whole.houses[0].cuspLonSid)).toBeGreaterThan(0.5)

    const wholeStar = getNakshatraLord(nakshatraFromLongitude(whole.houses[0].cuspLonSid).index)
    const placidusStar = getNakshatraLord(nakshatraFromLongitude(placidus.houses[0].cuspLonSid).index)
    expect(placidusStar).not.toBe(wholeStar)

    expect(equal.houses[0].cuspLonSid).toBeCloseTo(asc, 4)
    const equalSpan =
      (((equal.houses[1].cuspLonSid - equal.houses[0].cuspLonSid) % 360) + 360) % 360
    expect(equalSpan).toBeCloseTo(30, 4)

    const placidusSpan =
      (((placidus.houses[1].cuspLonSid - placidus.houses[0].cuspLonSid) % 360) + 360) % 360
    expect(Math.abs(placidusSpan - 30)).toBeGreaterThan(0.5)

    const tenthGap = Math.abs(placidus.houses[9].cuspLonSid - whole.houses[9].cuspLonSid)
    const tenthWrap = Math.min(tenthGap, 360 - tenthGap)
    expect(tenthWrap).toBeGreaterThan(1)
  })
})
