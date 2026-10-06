/**
 * Western natal charts must use the birth place, not 0°N 0°E.
 * @jest-environment node
 */

import { NextRequest } from 'next/server';
import { birthLocalToUTC } from '@/lib/birthDateTimeToUTC';
import { calculateTropicalHouses } from '@/lib/western/tropicalCalculator';
import {
  coordinatesForBirthPlaceGeocode,
  resolveOccultBirthCoordinates,
} from '@/lib/occultBirthCoordinates';

const geocodePlaceCachedOccult = jest.fn();

jest.mock('@/lib/occultBirthPlaceGeocodeCache', () => ({
  geocodePlaceCachedOccult: (...args: unknown[]) => geocodePlaceCachedOccult(...args),
}));

import { POST } from '@/app/api/occult/universal/route';

const MUMBAI = {
  latitude: 19.076,
  longitude: 72.8777,
  formattedAddress: 'Mumbai, India',
};

describe('resolveOccultBirthCoordinates', () => {
  beforeEach(() => {
    geocodePlaceCachedOccult.mockReset();
    geocodePlaceCachedOccult.mockResolvedValue(MUMBAI);
  });

  it('geocodes a birth place when coordinates are the 0,0 placeholder', async () => {
    const coords = await resolveOccultBirthCoordinates({
      latitude: 0,
      longitude: 0,
      birthPlace: 'Mumbai, India',
    });
    expect(geocodePlaceCachedOccult).toHaveBeenCalledWith('Mumbai, India');
    expect(coords).toEqual({ latitude: MUMBAI.latitude, longitude: MUMBAI.longitude });
  });

  it('keeps explicit non-zero coordinates', async () => {
    const coords = await resolveOccultBirthCoordinates({
      latitude: 51.5074,
      longitude: -0.1278,
      birthPlace: 'London',
    });
    expect(geocodePlaceCachedOccult).not.toHaveBeenCalled();
    expect(coords).toEqual({ latitude: 51.5074, longitude: -0.1278 });
  });

  it('throws when the birth place cannot be geocoded', async () => {
    geocodePlaceCachedOccult.mockResolvedValue(null);
    await expect(
      resolveOccultBirthCoordinates({
        latitude: 0,
        longitude: 0,
        birthPlace: 'Not A Real Place',
      }),
    ).rejects.toThrow('Unable to find coordinates');
  });
});

describe('coordinatesForBirthPlaceGeocode', () => {
  it('does not substitute a hardcoded city for missing coordinates', () => {
    expect(coordinatesForBirthPlaceGeocode(undefined, undefined)).toEqual({
      latitude: 0,
      longitude: 0,
    });
    expect(coordinatesForBirthPlaceGeocode(40.7128, -74.006)).toEqual({
      latitude: 40.7128,
      longitude: -74.006,
    });
  });
});

describe('POST /api/occult/universal western', () => {
  beforeEach(() => {
    geocodePlaceCachedOccult.mockReset();
    geocodePlaceCachedOccult.mockResolvedValue(MUMBAI);
  });

  it('casts houses for the geocoded birth place when the profile only has 0,0', async () => {
    const birthDate = '1990-06-15';
    const birthTime = '14:30:00';
    const utcMumbai = birthLocalToUTC(birthDate, birthTime, MUMBAI);
    const utcGulf = birthLocalToUTC(birthDate, birthTime, { latitude: 0, longitude: 0 });
    const mumbaiAsc = calculateTropicalHouses(utcMumbai, MUMBAI.latitude, MUMBAI.longitude)[0]
      .longitude;
    const gulfAsc = calculateTropicalHouses(utcGulf, 0, 0)[0].longitude;

    const req = new NextRequest('http://localhost:3000/api/occult/universal', {
      method: 'POST',
      body: JSON.stringify({
        system: 'western',
        birthData: {
          birthDate,
          birthTime,
          birthPlace: 'Mumbai, India',
          latitude: 0,
          longitude: 0,
        },
      }),
    });
    const res = await POST(req);
    const body = (await res.json()) as {
      success?: boolean;
      data?: { houses?: Array<{ longitude: number }> };
      error?: string;
    };

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    const asc = body.data?.houses?.[0]?.longitude;
    expect(asc).toBeCloseTo(mumbaiAsc, 4);
    expect(Math.abs((asc ?? 0) - gulfAsc)).toBeGreaterThan(10);
  });
});
