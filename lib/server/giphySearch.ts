import { devLog } from '@/lib/devLogger';

export interface GiphyItem {
  id: string;
  title: string;
  url: string;
  previewUrl: string;
  width: number;
  height: number;
}

const ATTRIBUTION =
  'Powered by GIPHY — https://giphy.com/ — Use of GIPHY content requires attribution.';

export function getGiphyAttribution(): string {
  return ATTRIBUTION;
}

export async function searchGiphy(query: string, limit = 12): Promise<GiphyItem[]> {
  const q = query.trim().slice(0, 100);
  if (q.length < 1) return [];

  const apiKey = process.env.GIPHY_API_KEY?.trim();
  if (!apiKey) return [];

  const url = new URL('https://api.giphy.com/v1/gifs/search');
  url.searchParams.set('api_key', apiKey);
  url.searchParams.set('q', q);
  url.searchParams.set('limit', String(Math.min(25, Math.max(1, limit))));
  url.searchParams.set('rating', 'pg-13');

  try {
    const res = await fetch(url.toString(), { signal: AbortSignal.timeout(12_000) });
    if (!res.ok) {
      devLog.warn('Giphy HTTP error', { status: res.status }, 'giphySearch');
      return [];
    }
    const data = (await res.json()) as {
      data?: Array<{
        id?: string;
        title?: string;
        images?: {
          fixed_height_small?: { url?: string; width?: string; height?: string };
          downsized_small?: { url?: string; width?: string; height?: string };
        };
      }>;
    };
    const out: GiphyItem[] = [];
    for (const g of data.data || []) {
      const img = g.images?.fixed_height_small || g.images?.downsized_small;
      const u = img?.url;
      if (!g.id || !u) continue;
      out.push({
        id: g.id,
        title: g.title || 'GIF',
        url: u,
        previewUrl: u,
        width: parseInt(img?.width || '0', 10) || 160,
        height: parseInt(img?.height || '0', 10) || 160,
      });
    }
    return out;
  } catch (e) {
    devLog.warn('Giphy fetch failed', { err: e }, 'giphySearch');
    return [];
  }
}
