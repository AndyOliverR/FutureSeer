import { birthLocalToUTC } from '@/lib/birthDateTimeToUTC'
import { geocodePlaceCachedOccult } from '@/lib/occultBirthPlaceGeocodeCache'
import { calculateTropicalHouses, getTropicalSign } from '@/lib/western/tropicalCalculator'
import { getIntelligentHellenisticAstrologyData } from '@/lib/hellenisticAstrologyIntelligence'

jest.mock('@/lib/firebase', () => ({
  getFirebaseDB: () => null,
}))

jest.mock('@/lib/userSubcollectionFirestore', () => ({
  userSubdocGet: jest.fn(async () => null),
  userSubdocSet: jest.fn(async () => undefined),
}))

jest.mock('@/lib/occultBirthPlaceGeocodeCache', () => ({
  geocodePlaceCachedOccult: jest.fn(async () => ({
    latitude: 19.076,
    longitude: 72.8777,
    formattedAddress: 'Mumbai, Maharashtra, India',
  })),
}))

const BIRTH_DATE = '1990-06-15'
const BIRTH_TIME = '14:30:00'
const MUMBAI = { latitude: 19.076, longitude: 72.8777 }

function smallestAngleDelta(a: number, b: number): number {
  const raw = Math.abs(a - b) % 360
  return raw > 180 ? 360 - raw : raw
}

function ascendantAt(date: Date, latitude: number, longitude: number): number {
  const houses = calculateTropicalHouses(date, latitude, longitude)
  return houses[0]?.longitude ?? Number.NaN
}

describe('Hellenistic birth place and local time', () => {
  const geocode = geocodePlaceCachedOccult as jest.Mock

  beforeEach(() => {
    geocode.mockClear()
  })

  it('casts a 0,0 request for Mumbai at the birth place in local time', async () => {
    const expectedInstant = birthLocalToUTC(BIRTH_DATE, BIRTH_TIME, MUMBAI)
    const expectedAsc = ascendantAt(expectedInstant, MUMBAI.latitude, MUMBAI.longitude)
    const gulfInstant = new Date(Date.UTC(1990, 5, 15, 14, 30, 0))
    const gulfAsc = ascendantAt(gulfInstant, 0, 0)
    expect(getTropicalSign(expectedAsc)).toBe('Libra')
    expect(getTropicalSign(gulfAsc)).toBe('Scorpio')
    expect(smallestAngleDelta(expectedAsc, gulfAsc)).toBeGreaterThan(10)

    const reading = await getIntelligentHellenisticAstrologyData(
      'anonymous',
      BIRTH_DATE,
      BIRTH_TIME,
      'Mumbai, India',
      0,
      0,
    )

    expect(geocode).toHaveBeenCalledWith('Mumbai, India')
    expect(smallestAngleDelta(reading.ascendant.longitude, expectedAsc)).toBeLessThan(1)
    expect(reading.ascendant.sign).toBe('Libra')
    expect(reading.ascendant.sign).not.toBe(getTropicalSign(gulfAsc))
    expect(reading.houses[0]?.sign).toBe('Libra')
  })

  it('keeps explicit coordinates and still converts local birth time', async () => {
    const expectedInstant = birthLocalToUTC(BIRTH_DATE, BIRTH_TIME, MUMBAI)
    const expectedAsc = ascendantAt(expectedInstant, MUMBAI.latitude, MUMBAI.longitude)
    const unshiftedAsc = ascendantAt(new Date(`${BIRTH_DATE}T${BIRTH_TIME}`), MUMBAI.latitude, MUMBAI.longitude)
    expect(smallestAngleDelta(expectedAsc, unshiftedAsc)).toBeGreaterThan(30)

    const reading = await getIntelligentHellenisticAstrologyData(
      'anonymous',
      BIRTH_DATE,
      BIRTH_TIME,
      'Mumbai, India',
      MUMBAI.latitude,
      MUMBAI.longitude,
    )

    expect(geocode).not.toHaveBeenCalled()
    expect(smallestAngleDelta(reading.ascendant.longitude, expectedAsc)).toBeLessThan(1)
    expect(smallestAngleDelta(reading.ascendant.longitude, unshiftedAsc)).toBeGreaterThan(30)
  })

  it('refuses a Gulf of Guinea chart when the birth place cannot be geocoded', async () => {
    geocode.mockResolvedValueOnce(null)
    await expect(
      getIntelligentHellenisticAstrologyData('anonymous', BIRTH_DATE, BIRTH_TIME, 'Not A Real Place', 0, 0),
    ).rejects.toThrow(/Not A Real Place/)
  })
})
