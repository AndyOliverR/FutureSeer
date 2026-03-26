import { devLog } from '@/lib/devLogger';
import { createTtlCache } from '@/lib/server/integrationsCache';

export interface NewsHeadlineItem {
  title: string;
  url: string;
  source: string;
}

const cache = createTtlCache<string, NewsHeadlineItem[]>(15 * 60 * 1000);

/** Map profile country hint to NewsAPI country code. */
export function newsCountryFromProfile(profile: { country?: string } | null | undefined): string {
  const raw = (profile?.country || '').trim().toUpperCase();
  if (raw === 'IN' || raw === 'INDIA') return 'in';
  return 'us';
}

const ALLOWED = new Set(
  'ae ar at au be bg br ca ch cn co cu cz de eg fr gb gr hk hu id ie il in it jp kr lt lv ma mx my ng nl no nz ph pl pt ro rs ru sa se sg si sk th tr tw ua us ve za'.split(
    ' '
  )
);

export async function fetchTopHeadlines(options: {
  country?: string;
  category?: string;
  pageSize?: number;
}): Promise<NewsHeadlineItem[]> {
  const country = (options.country || 'us').toLowerCase();
  if (!ALLOWED.has(country)) {
    return fetchTopHeadlines({ ...options, country: 'us' });
  }
  const pageSize = Math.min(10, Math.max(1, options.pageSize ?? 5));
  const cat = options.category?.trim() || '';
  const cacheKey = `${country}|${cat}|${pageSize}`;
  const hit = cache.get(cacheKey);
  if (hit) return hit;

  const apiKey = process.env.NEWS_API_KEY?.trim();
  if (!apiKey) return [];

  const url = new URL('https://newsapi.org/v2/top-headlines');
  url.searchParams.set('country', country);
  url.searchParams.set('pageSize', String(pageSize));
  if (cat && cat !== 'general') url.searchParams.set('category', cat);
  url.searchParams.set('apiKey', apiKey);

  try {
    const res = await fetch(url.toString(), { signal: AbortSignal.timeout(12_000) });
    if (!res.ok) {
      devLog.warn('News API HTTP error', { status: res.status }, 'newsHeadlines');
      return [];
    }
    const data = (await res.json()) as {
      status?: string;
      articles?: Array<{ title?: string; url?: string; source?: { name?: string } }>;
    };
    if (data.status !== 'ok' || !Array.isArray(data.articles)) return [];

    const items: NewsHeadlineItem[] = [];
    for (const a of data.articles) {
      if (!a.title || !a.url) continue;
      items.push({
        title: a.title,
        url: a.url,
        source: a.source?.name || 'News',
      });
      if (items.length >= pageSize) break;
    }
    cache.set(cacheKey, items);
    return items;
  } catch (e) {
    devLog.warn('News API fetch failed', { err: e }, 'newsHeadlines');
    return [];
  }
}
