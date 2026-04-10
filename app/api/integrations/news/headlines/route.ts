import { NextRequest, NextResponse } from 'next/server';
import { fetchTopHeadlines } from '@/lib/server/newsHeadlines';
import { withRateLimit, rateLimiters, getClientIdentifier } from '@/lib/rateLimit';

async function handleNewsHeadlines(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD === '1') {
    return NextResponse.json({ error: 'Not available in static export' }, { status: 404 });
  }

  if (!process.env.NEWS_API_KEY?.trim()) {
    return NextResponse.json({ enabled: false, error: 'News integration not configured.' }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const country = (searchParams.get('country') || 'us').toLowerCase();
  const category = searchParams.get('category') || '';
  const pageSize = Math.min(10, Math.max(1, parseInt(searchParams.get('pageSize') || '5', 10) || 5));

  const items = await fetchTopHeadlines({ country, category, pageSize });
  return NextResponse.json({ enabled: true, items });
}

export const GET = withRateLimit(
  handleNewsHeadlines,
  rateLimiters.api,
  'integrations_news_headlines',
  getClientIdentifier,
);
