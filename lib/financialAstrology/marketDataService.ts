import { devLog } from '@/lib/devLogger';

export interface MarketQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  currency: string;
  timestamp: number;
}

export interface HistoricalDataPoint {
  date: string;
  close: number;
  open: number;
  high: number;
  low: number;
  volume: number;
}

export interface MarketSnapshot {
  indices: MarketQuote[];
  crypto: MarketQuote[];
  commodities: MarketQuote[];
  fetchedAt: number;
}

export interface HistoricalSeries {
  symbol: string;
  name: string;
  data: HistoricalDataPoint[];
  fetchedAt: number;
}

const MARKET_SYMBOLS = {
  indices: [
    { symbol: '^GSPC', name: 'S&P 500' },
    { symbol: '^IXIC', name: 'NASDAQ' },
    { symbol: '^NSEI', name: 'Nifty 50' },
    { symbol: '^FTSE', name: 'FTSE 100' },
    { symbol: '^GDAXI', name: 'DAX' },
  ],
  crypto: [
    { symbol: 'BTC-USD', name: 'Bitcoin' },
    { symbol: 'ETH-USD', name: 'Ethereum' },
  ],
  commodities: [
    { symbol: 'GC=F', name: 'Gold' },
    { symbol: 'SI=F', name: 'Silver' },
    { symbol: 'CL=F', name: 'Crude Oil' },
  ],
};

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const snapshotCache: { entry: CacheEntry<MarketSnapshot> | null } = { entry: null };
const historicalCache = new Map<string, CacheEntry<HistoricalSeries>>();

const SNAPSHOT_TTL_MS = 15 * 60 * 1000;
const HISTORICAL_TTL_MS = 60 * 60 * 1000;

async function fetchQuote(symbol: string): Promise<MarketQuote | null> {
  try {
    const yahooFinance = (await import('yahoo-finance2')).default;
    const result = await yahooFinance.quote(symbol) as Record<string, unknown> | null;
    if (!result || !result.regularMarketPrice) return null;

    return {
      symbol,
      name: (result.shortName || result.longName || symbol) as string,
      price: result.regularMarketPrice as number,
      change: ((result.regularMarketChange ?? 0) as number),
      changePercent: ((result.regularMarketChangePercent ?? 0) as number),
      currency: (result.currency || 'USD') as string,
      timestamp: result.regularMarketTime
        ? new Date(String(result.regularMarketTime)).getTime()
        : Date.now(),
    };
  } catch (err) {
    devLog.warn(`[marketData] Failed to fetch quote for ${symbol}:`, err, 'marketDataService');
    return null;
  }
}

async function fetchQuotes(
  symbols: { symbol: string; name: string }[],
): Promise<MarketQuote[]> {
  const results = await Promise.allSettled(
    symbols.map((s) => fetchQuote(s.symbol)),
  );
  return results
    .map((r, i) => {
      if (r.status === 'fulfilled' && r.value) {
        return { ...r.value, name: symbols[i].name };
      }
      return null;
    })
    .filter((q): q is MarketQuote => q !== null);
}

export async function fetchMarketSnapshot(): Promise<MarketSnapshot> {
  if (snapshotCache.entry && Date.now() < snapshotCache.entry.expiresAt) {
    return snapshotCache.entry.data;
  }

  const [indices, crypto, commodities] = await Promise.all([
    fetchQuotes(MARKET_SYMBOLS.indices),
    fetchQuotes(MARKET_SYMBOLS.crypto),
    fetchQuotes(MARKET_SYMBOLS.commodities),
  ]);

  const snapshot: MarketSnapshot = {
    indices,
    crypto,
    commodities,
    fetchedAt: Date.now(),
  };

  snapshotCache.entry = {
    data: snapshot,
    expiresAt: Date.now() + SNAPSHOT_TTL_MS,
  };

  return snapshot;
}

export async function fetchHistoricalData(
  symbol: string,
  months = 12,
): Promise<HistoricalSeries | null> {
  const cacheKey = `${symbol}_${months}`;
  const cached = historicalCache.get(cacheKey);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.data;
  }

  try {
    const yahooFinance = (await import('yahoo-finance2')).default;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const result = await yahooFinance.chart(symbol, {
      period1: startDate,
      period2: endDate,
      interval: '1d',
    }) as Record<string, unknown> | null;

    const quotes = (result?.quotes ?? []) as Record<string, unknown>[];
    if (!result || quotes.length === 0) return null;

    const symbolInfo = MARKET_SYMBOLS.indices
      .concat(MARKET_SYMBOLS.crypto)
      .concat(MARKET_SYMBOLS.commodities)
      .find((s) => s.symbol === symbol);

    const series: HistoricalSeries = {
      symbol,
      name: symbolInfo?.name || symbol,
      data: quotes
        .filter((q) => q.close != null)
        .map((q) => ({
          date: new Date(String(q.date)).toISOString().split('T')[0],
          close: q.close as number,
          open: (q.open ?? q.close) as number,
          high: (q.high ?? q.close) as number,
          low: (q.low ?? q.close) as number,
          volume: (q.volume ?? 0) as number,
        })),
      fetchedAt: Date.now(),
    };

    historicalCache.set(cacheKey, {
      data: series,
      expiresAt: Date.now() + HISTORICAL_TTL_MS,
    });

    return series;
  } catch (err) {
    devLog.error(`[marketData] Failed to fetch historical data for ${symbol}:`, err, 'marketDataService');
    return null;
  }
}

export function getAvailableSymbols() {
  return MARKET_SYMBOLS;
}

export function formatMarketSnapshotForPrompt(snapshot: MarketSnapshot): string {
  const lines: string[] = ['Current Market Conditions:'];

  for (const q of snapshot.indices) {
    const dir = q.change >= 0 ? '+' : '';
    lines.push(`  ${q.name}: ${q.price.toLocaleString()} (${dir}${q.changePercent.toFixed(2)}%)`);
  }
  for (const q of snapshot.crypto) {
    const dir = q.change >= 0 ? '+' : '';
    lines.push(`  ${q.name}: $${q.price.toLocaleString()} (${dir}${q.changePercent.toFixed(2)}%)`);
  }
  for (const q of snapshot.commodities) {
    const dir = q.change >= 0 ? '+' : '';
    lines.push(`  ${q.name}: $${q.price.toLocaleString()} (${dir}${q.changePercent.toFixed(2)}%)`);
  }

  const ageMinutes = Math.round((Date.now() - snapshot.fetchedAt) / 60000);
  lines.push(`  (Data as of ${ageMinutes} minutes ago)`);

  return lines.join('\n');
}
