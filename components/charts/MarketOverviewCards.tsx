'use client';

import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MarketQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  currency: string;
}

interface MarketSnapshot {
  indices: MarketQuote[];
  crypto: MarketQuote[];
  commodities: MarketQuote[];
  fetchedAt: number;
}

interface MarketOverviewCardsProps {
  snapshot: MarketSnapshot | null;
  loading: boolean;
}

function SkeletonCard() {
  return (
    <div className="min-w-[160px] rounded-xl border border-slate-700/50 bg-slate-800/60 p-4 animate-pulse">
      <div className="h-3 w-20 bg-slate-700 rounded mb-3" />
      <div className="h-5 w-24 bg-slate-700 rounded mb-2" />
      <div className="h-3 w-16 bg-slate-700 rounded" />
    </div>
  );
}

function QuoteCard({ quote }: { quote: MarketQuote }) {
  const isPositive = quote.change >= 0;
  const isFlat = Math.abs(quote.changePercent) < 0.01;

  const formattedPrice = useMemo(() => {
    if (quote.price >= 1000) return quote.price.toLocaleString('en', { maximumFractionDigits: 0 });
    if (quote.price >= 1) return quote.price.toLocaleString('en', { maximumFractionDigits: 2 });
    return quote.price.toLocaleString('en', { maximumFractionDigits: 4 });
  }, [quote.price]);

  const currencyPrefix = ['BTC-USD', 'ETH-USD', 'GC=F', 'SI=F', 'CL=F'].includes(quote.symbol) ? '$' : '';

  return (
    <div className="min-w-[160px] rounded-xl border border-slate-700/40 bg-slate-800/40 backdrop-blur-sm p-4 hover:border-emerald-500/30 hover:bg-slate-800/60 transition-all duration-200">
      <p className="text-xs text-slate-400 font-medium mb-1 truncate">{quote.name}</p>
      <p className="text-lg font-semibold text-white mb-1">
        {currencyPrefix}{formattedPrice}
      </p>
      <div className={`flex items-center gap-1 text-sm font-medium ${
        isFlat ? 'text-slate-400' : isPositive ? 'text-emerald-400' : 'text-red-400'
      }`}>
        {isFlat ? (
          <Minus className="w-3 h-3" />
        ) : isPositive ? (
          <TrendingUp className="w-3 h-3" />
        ) : (
          <TrendingDown className="w-3 h-3" />
        )}
        <span>{isPositive ? '+' : ''}{quote.changePercent.toFixed(2)}%</span>
      </div>
    </div>
  );
}

export function MarketOverviewCards({ snapshot, loading }: MarketOverviewCardsProps) {
  const dataAge = useMemo(() => {
    if (!snapshot) return '';
    const mins = Math.round((Date.now() - snapshot.fetchedAt) / 60000);
    if (mins < 1) return 'Just now';
    if (mins === 1) return '1 min ago';
    return `${mins} mins ago`;
  }, [snapshot]);

  if (loading) {
    return (
      <div className="mb-6">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!snapshot) return null;

  const allQuotes = [...snapshot.indices, ...snapshot.crypto, ...snapshot.commodities];
  if (allQuotes.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-slate-400">Market Overview</h3>
        <span className="text-xs text-slate-500">{dataAge} (delayed)</span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700">
        {allQuotes.map((q) => (
          <QuoteCard key={q.symbol} quote={q} />
        ))}
      </div>
    </div>
  );
}
