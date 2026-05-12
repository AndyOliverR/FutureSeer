import { NextRequest, NextResponse } from 'next/server';
import {
  fetchMarketSnapshot,
  fetchHistoricalData,
  getAvailableSymbols,
} from '@/lib/financialAstrology/marketDataService';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'snapshot';

  try {
    if (type === 'snapshot') {
      const snapshot = await fetchMarketSnapshot();
      return NextResponse.json(snapshot);
    }

    if (type === 'historical') {
      const symbol = searchParams.get('symbol');
      const months = parseInt(searchParams.get('months') || '12', 10);

      if (!symbol) {
        return NextResponse.json(
          { error: 'Missing required parameter: symbol' },
          { status: 400 },
        );
      }

      const data = await fetchHistoricalData(symbol, months);
      if (!data) {
        return NextResponse.json(
          { error: `No data available for symbol: ${symbol}` },
          { status: 404 },
        );
      }

      return NextResponse.json(data);
    }

    if (type === 'symbols') {
      return NextResponse.json(getAvailableSymbols());
    }

    return NextResponse.json(
      { error: 'Invalid type. Use: snapshot, historical, symbols' },
      { status: 400 },
    );
  } catch (error) {
    console.error('[market-data] API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch market data' },
      { status: 500 },
    );
  }
}
