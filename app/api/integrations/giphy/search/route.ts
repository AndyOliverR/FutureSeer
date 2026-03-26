import { NextRequest, NextResponse } from 'next/server';
import { getGiphyAttribution, searchGiphy } from '@/lib/server/giphySearch';
import { withRateLimit, rateLimiters, getClientIdentifier } from '@/lib/rateLimit';

async function handleGiphySearch(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD === '1') {
    return NextResponse.json({ error: 'Not available in static export' }, { status: 404 });
  }

  if (!process.env.GIPHY_API_KEY?.trim()) {
    return NextResponse.json({ enabled: false, error: 'GIPHY integration not configured.' }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const limit = Math.min(25, Math.max(1, parseInt(searchParams.get('limit') || '12', 10) || 12));

  if (!q.trim()) {
    return NextResponse.json({ error: 'Query parameter q is required.' }, { status: 400 });
  }

  const items = await searchGiphy(q, limit);
  return NextResponse.json({
    enabled: true,
    attribution: getGiphyAttribution(),
    items,
  });
}

export const GET = withRateLimit(handleGiphySearch, rateLimiters.api, getClientIdentifier);
