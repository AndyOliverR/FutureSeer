import { NextRequest, NextResponse } from 'next/server';
import { fetchCurrentWeather, isValidLatLon } from '@/lib/server/openWeather';
import { withRateLimit, rateLimiters, getClientIdentifier } from '@/lib/rateLimit';

async function handleWeather(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD === '1') {
    return NextResponse.json({ error: 'Not available in static export' }, { status: 404 });
  }

  if (!process.env.OPENWEATHER_API_KEY?.trim()) {
    return NextResponse.json({ enabled: false, error: 'Weather integration not configured.' }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get('lat') || '');
  const lon = parseFloat(searchParams.get('lon') || '');

  if (!isValidLatLon(lat, lon)) {
    return NextResponse.json({ error: 'Valid lat and lon query parameters are required.' }, { status: 400 });
  }

  const data = await fetchCurrentWeather(lat, lon);
  if (!data) {
    return NextResponse.json({ enabled: true, error: 'Weather unavailable.' }, { status: 502 });
  }

  return NextResponse.json({ enabled: true, data });
}

export const GET = withRateLimit(
  handleWeather,
  rateLimiters.api,
  'integrations_weather',
  getClientIdentifier,
);
