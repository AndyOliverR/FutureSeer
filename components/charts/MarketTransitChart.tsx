'use client';

import { useMemo, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';

const AreaChart = dynamic(() => import('recharts').then((m) => m.AreaChart), { ssr: false });
const Area = dynamic(() => import('recharts').then((m) => m.Area), { ssr: false });
const XAxis = dynamic(() => import('recharts').then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then((m) => m.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then((m) => m.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then((m) => m.Tooltip), { ssr: false });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ReferenceArea = dynamic(() => import('recharts').then((m) => m.ReferenceArea as any) as any, { ssr: false }) as any;
const ResponsiveContainer = dynamic(() => import('recharts').then((m) => m.ResponsiveContainer), { ssr: false });

interface HistoricalDataPoint {
  date: string;
  close: number;
}

interface AstroEvent {
  id: string;
  name: string;
  type: string;
  startDate: string;
  endDate: string;
  color: string;
  description: string;
}

interface MarketTransitChartProps {
  historicalData: HistoricalDataPoint[];
  astroEvents: AstroEvent[];
  selectedSymbol: string;
  onSymbolChange: (symbol: string) => void;
}

const SYMBOLS = [
  { symbol: '^GSPC', label: 'S&P 500' },
  { symbol: '^IXIC', label: 'NASDAQ' },
  { symbol: '^NSEI', label: 'Nifty 50' },
  { symbol: 'BTC-USD', label: 'Bitcoin' },
  { symbol: 'GC=F', label: 'Gold' },
];

const EVENT_LEGEND = [
  { type: 'mercury_retrograde', color: '#ef4444', label: 'Mercury Retrograde' },
  { type: 'eclipse', color: '#a855f7', label: 'Eclipse Window' },
  { type: 'mars_uranus', color: '#f97316', label: 'Mars-Uranus Stress' },
  { type: 'jupiter_saturn', color: '#3b82f6', label: 'Jupiter-Saturn Phase' },
];

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-xl">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className="text-sm font-semibold text-white">
        {payload[0].value?.toLocaleString('en', { maximumFractionDigits: 2 })}
      </p>
    </div>
  );
}

export function MarketTransitChart({
  historicalData,
  astroEvents,
  selectedSymbol,
  onSymbolChange,
}: MarketTransitChartProps) {
  const [mounted, setMounted] = useState(false);

  useMemo(() => {
    setMounted(true);
  }, []);

  const formatDate = useCallback((dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en', { month: 'short', year: '2-digit' });
  }, []);

  const chartData = useMemo(
    () => historicalData.map((d) => ({ ...d, formattedDate: formatDate(d.date) })),
    [historicalData, formatDate],
  );

  const eventBands = useMemo(() => {
    if (!chartData.length) return [];
    const dates = chartData.map((d) => d.date);
    const firstDate = dates[0];
    const lastDate = dates[dates.length - 1];

    return astroEvents
      .filter((e) => e.endDate >= firstDate && e.startDate <= lastDate)
      .map((e) => ({
        ...e,
        clampedStart: e.startDate < firstDate ? firstDate : e.startDate,
        clampedEnd: e.endDate > lastDate ? lastDate : e.endDate,
      }));
  }, [chartData, astroEvents]);

  if (!mounted || chartData.length === 0) {
    return (
      <div className="h-[300px] md:h-[400px] flex items-center justify-center text-slate-500">
        Loading chart data...
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        {SYMBOLS.map((s) => (
          <button
            key={s.symbol}
            onClick={() => onSymbolChange(s.symbol)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedSymbol === s.symbol
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'bg-slate-800/50 text-slate-400 border border-slate-700/40 hover:border-slate-600'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="h-[300px] md:h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="formattedDate"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
              domain={['auto', 'auto']}
              tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)}
            />
            <Tooltip content={<CustomTooltip />} />

            {eventBands.map((band) => (
              <ReferenceArea
                key={band.id}
                x1={formatDate(band.clampedStart)}
                x2={formatDate(band.clampedEnd)}
                fill={band.color}
                fillOpacity={0.08}
                stroke={band.color}
                strokeOpacity={0.3}
                strokeDasharray="3 3"
              />
            ))}

            <Area
              type="monotone"
              dataKey="close"
              stroke="#f59e0b"
              strokeWidth={2}
              fill="url(#priceGradient)"
              dot={false}
              activeDot={{ r: 4, fill: '#f59e0b', stroke: '#1e293b', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap gap-3 mt-3">
        {EVENT_LEGEND.map((e) => (
          <div key={e.type} className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: e.color, opacity: 0.6 }}
            />
            <span className="text-xs text-slate-400">{e.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
