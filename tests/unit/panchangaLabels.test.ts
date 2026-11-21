import { calculateAccuratePanchanga } from '@/lib/enhancedPanchangaCalculator'
import {
  karanaFromElongation,
  karanaFromLongitudes,
  tithiFromLongitudes,
  tithiSignificance,
} from '@/lib/panchangaLabels'
import { calculatePanchanga } from '@/lib/panchanga'

describe('panchanga tithi and karana names', () => {
  it('names the bright fortnight from Pratipada through Purnima', () => {
    expect(tithiFromLongitudes(0, 6)).toMatchObject({
      number: 1,
      name: 'Pratipada',
      paksha: 'Shukla',
    })
    expect(tithiFromLongitudes(10, 52)).toMatchObject({
      number: 4,
      name: 'Chaturthi',
      paksha: 'Shukla',
    })
    expect(tithiFromLongitudes(0, 174)).toMatchObject({
      number: 15,
      name: 'Purnima',
      paksha: 'Shukla',
    })
  })

  it('names the dark fortnight from Pratipada through Amavasya', () => {
    expect(tithiFromLongitudes(0, 186)).toMatchObject({
      number: 16,
      name: 'Pratipada',
      paksha: 'Krishna',
    })
    expect(tithiFromLongitudes(0, 354)).toMatchObject({
      number: 30,
      name: 'Amavasya',
      paksha: 'Krishna',
    })
    expect(tithiSignificance(30, 'Krishna')).toBe('New Moon - New beginnings')
    expect(tithiSignificance(15, 'Shukla')).toBe('Full Moon - Peak energy')
    expect(tithiSignificance(23, 'Krishna')).toBe('Good for transformation and change')
  })

  it('keeps fixed karanas at the two ends of the lunar month', () => {
    expect(karanaFromLongitudes(0, 0)).toMatchObject({ number: 1, name: 'Kimstughna' })
    expect(karanaFromLongitudes(0, 6)).toMatchObject({ number: 2, name: 'Bava' })
    expect(karanaFromElongation(336)).toMatchObject({ name: 'Vishti' })
    expect(karanaFromElongation(342)).toMatchObject({ name: 'Shakuni' })
    expect(karanaFromElongation(348)).toMatchObject({ name: 'Chatushpada' })
    expect(karanaFromElongation(354)).toMatchObject({ name: 'Naga' })
  })

  it('labels a chart elongation of 42° as Shukla Chaturthi', () => {
    const result = calculateAccuratePanchanga(
      {
        planets: {
          sun: { lonSidereal: 0 },
          moon: { lonSidereal: 42 },
        },
        metadata: { latitude: 19.076, longitude: 72.8777 },
      },
      { birthDate: '1990-06-15', birthTime: '12:00', birthPlace: 'Mumbai' },
    )

    expect(result?.tithi).toMatchObject({
      number: 4,
      name: 'Chaturthi',
      paksha: 'Shukla',
    })
    expect(result?.karana.name).toBe('Vishti')
    expect(result?.tithi.significance).toBe('Good for spiritual practices')
  })

  it('uses the same tithi name for the Vastu date calculator', () => {
    const panchanga = calculatePanchanga('2000-01-01', '12:00', 19.076, 72.8777)
    // Mirrors the mean-longitude steps in lib/panchanga.ts for this date.
    const elongation = (() => {
      const year = 2000
      const month = 1
      const day = 1
      const hour = 12
      const minute = 0
      const a = Math.floor((14 - month) / 12)
      const y = year + 4800 - a
      const m = month + 12 * a - 3
      const jd = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045 + (hour + minute / 60) / 24
      const T = (jd - 2451545.0) / 36525.0
      const sun = ((280.46646 + 36000.76983 * T + 0.0003032 * T * T) % 360 + 360) % 360
      const moon = ((218.3164477 + 481267.88123421 * T - 0.0015786 * T * T) % 360 + 360) % 360
      return ((moon - sun) % 360 + 360) % 360
    })()

    expect(panchanga.tithi).toMatchObject(tithiFromLongitudes(0, elongation))
  })
})
