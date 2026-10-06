import { geocodePlaceCachedOccult } from '@/lib/occultBirthPlaceGeocodeCache';

export interface OccultBirthCoordinateInput {
  latitude?: unknown;
  longitude?: unknown;
  birthPlace?: string;
}

function isMissingCoordinate(value: unknown): boolean {
  return typeof value !== 'number' || !Number.isFinite(value);
}

function isZeroCoordinatePair(latitude: unknown, longitude: unknown): boolean {
  return latitude === 0 && longitude === 0;
}

/**
 * Stored profiles usually have a birth place and no coordinates. 0,0 is the
 * Gulf of Guinea, not a real birth location, so treat that pair as missing.
 */
export async function resolveOccultBirthCoordinates(
  birthData: OccultBirthCoordinateInput,
): Promise<{ latitude: number; longitude: number }> {
  let latitude = birthData.latitude;
  let longitude = birthData.longitude;
  const place = typeof birthData.birthPlace === 'string' ? birthData.birthPlace.trim() : '';

  if (
    (isMissingCoordinate(latitude) ||
      isMissingCoordinate(longitude) ||
      isZeroCoordinatePair(latitude, longitude)) &&
    place
  ) {
    const coords = await geocodePlaceCachedOccult(place);
    if (!coords || !Number.isFinite(coords.latitude) || !Number.isFinite(coords.longitude)) {
      throw new Error(
        `Unable to find coordinates for "${place}". Please verify the location spelling.`,
      );
    }
    latitude = coords.latitude;
    longitude = coords.longitude;
  }

  if (isMissingCoordinate(latitude) || isMissingCoordinate(longitude)) {
    throw new Error('Birth location is required for accurate chart calculation.');
  }

  return { latitude: latitude as number, longitude: longitude as number };
}

/**
 * Use real stored coordinates. Missing values and the 0,0 placeholder become
 * 0,0 so chart calculation can geocode `birthPlace` instead of a hardcoded city.
 */
export function coordinatesForBirthPlaceGeocode(
  latitude: unknown,
  longitude: unknown,
): { latitude: number; longitude: number } {
  const lat = typeof latitude === 'number' ? latitude : Number(latitude);
  const lon = typeof longitude === 'number' ? longitude : Number(longitude);
  if (Number.isFinite(lat) && Number.isFinite(lon) && !(lat === 0 && lon === 0)) {
    return { latitude: lat, longitude: lon };
  }
  return { latitude: 0, longitude: 0 };
}
