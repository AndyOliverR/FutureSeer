import { getChart } from '@/lib/astronomia-vedic'
import { birthLocalToUTC } from '@/lib/birthDateTimeToUTC'
import { kpAstrologyIntelligence } from '@/lib/kpAstrologyIntelligence'

const MUMBAI = {
  birthDate: '1990-06-15',
  birthTime: '14:30:00',
  birthPlace: 'Mumbai, India',
  latitude: 19.076,
  longitude: 72.8777,
}

function ascendantSign(date: Date): string {
  const chart = getChart(
    {
      date,
      latitude: MUMBAI.latitude,
      longitude: MUMBAI.longitude,
      birthDate: date,
    },
    { ayanamsha: 'kp', houseSystem: 'placidus' },
  )
  const sign = chart.ascendant?.signName
  if (!sign) {
    throw new Error('ascendant missing')
  }
  return sign
}

describe('KP birth instant', () => {
  it('uses local birth time at the given coordinates, not the clock time as UTC', async () => {
    const treatedAsUtc = new Date(Date.UTC(1990, 5, 15, 14, 30, 0))
    const birthUtc = birthLocalToUTC(MUMBAI.birthDate, MUMBAI.birthTime, {
      latitude: MUMBAI.latitude,
      longitude: MUMBAI.longitude,
    })
    const utcLabeledSign = ascendantSign(treatedAsUtc)
    const localSign = ascendantSign(birthUtc)

    expect(utcLabeledSign).not.toBe(localSign)

    const analysis = await kpAstrologyIntelligence.analyzeChart(MUMBAI)
    expect(analysis.ascendant.sign).toBe(localSign)
  })
})
