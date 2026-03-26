import { devLog } from '@/lib/devLogger';
import { createTtlCache } from '@/lib/server/integrationsCache';

export interface CurrentWeatherResult {
  tempC: number;
  feelsLikeC: number;
  description: string;
  iconCode: string;
  locationLabel: string;
  humidity?: number;
}

const cache = createTtlCache<string, CurrentWeatherResult>(5 * 60 * 1000);

function roundCoord(n: number, places: number): number {
  const p = 10 ** places;
  return Math.round(n * p) / p;
}

export function isValidLatLon(lat: number, lon: number): boolean {
  return Number.isFinite(lat) && Number.isFinite(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
}

export async function fetchCurrentWeather(lat: number, lon: number): Promise<CurrentWeatherResult | null> {
  const key = `${roundCoord(lat, 3)}_${roundCoord(lon, 3)}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const apiKey = process.env.OPENWEATHER_API_KEY?.trim();
  if (!apiKey) return null;

  if (!isValidLatLon(lat, lon)) return null;

  const url = new URL('https://api.openweathermap.org/data/2.5/weather');
  url.searchParams.set('lat', String(lat));
  url.searchParams.set('lon', String(lon));
  url.searchParams.set('units', 'metric');
  url.searchParams.set('appid', apiKey);

  try {
    const res = await fetch(url.toString(), { signal: AbortSignal.timeout(12_000) });
    if (!res.ok) {
      devLog.warn('OpenWeather HTTP error', { status: res.status }, 'openWeather');
      return null;
    }
    const data = (await res.json()) as {
      name?: string;
      main?: { temp?: number; feels_like?: number; humidity?: number };
      weather?: Array<{ description?: string; icon?: string }>;
    };
    const w = data.weather?.[0];
    const main = data.main;
    if (main?.temp == null || !w?.description) return null;

    const result: CurrentWeatherResult = {
      tempC: Math.round(main.temp * 10) / 10,
      feelsLikeC: main.feels_like != null ? Math.round(main.feels_like * 10) / 10 : Math.round(main.temp * 10) / 10,
      description: w.description,
      iconCode: w.icon || '01d',
      locationLabel: data.name || 'Location',
      humidity: main.humidity,
    };
    cache.set(key, result);
    return result;
  } catch (e) {
    devLog.warn('OpenWeather fetch failed', { err: e }, 'openWeather');
    return null;
  }
}
