'use client';

import { useState, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';

const BarChart = dynamic(() => import('recharts').then((m) => m.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then((m) => m.Bar), { ssr: false });
const XAxis = dynamic(() => import('recharts').then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then((m) => m.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then((m) => m.CartesianGrid), { ssr: false });
const Cell = dynamic(() => import('recharts').then((m) => m.Cell), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then((m) => m.ResponsiveContainer), { ssr: false });

interface ClimateMonth {
  label: string;
  score: number;
  description: string;
}

interface ClimateHeatmapProps {
  months: ClimateMonth[];
}

function getBarColor(score: number): string {
  if (score >= 70) return '#10b981';
  if (score >= 50) return '#22c55e';
  if (score >= 35) return '#f59e0b';
  if (score >= 20) return '#f97316';
  return '#ef4444';
}

export function ClimateHeatmap({ months }: ClimateHeatmapProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useMemo(() => { setMounted(true); }, []);

  const chartData = useMemo(
    () => months.map((m, i) => ({ ...m, index: i })),
    [months],
  );

  const handleClick = useCallback((_: unknown, index: number) => {
    setSelectedIndex((prev) => (prev === index ? null : index));
  }, []);

  if (!mounted || months.length === 0) {
    return (
      <div className="h-[200px] flex items-center justify-center text-slate-500">
        No climate data available
      </div>
    );
  }

  return (
    <div>
      <div className="h-[200px] md:h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={50}
            />
            <YAxis
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
            />
            <Bar
              dataKey="score"
              radius={[4, 4, 0, 0]}
              cursor="pointer"
              onClick={handleClick}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getBarColor(entry.score)}
                  opacity={selectedIndex !== null && selectedIndex !== index ? 0.4 : 0.85}
                  className="transition-opacity duration-200"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {selectedIndex !== null && months[selectedIndex] && (
        <div className="mt-3 p-3 rounded-lg border border-slate-700/40 bg-slate-800/40">
          <p className="text-sm font-medium text-emerald-400 mb-1">{months[selectedIndex].label}</p>
          <p className="text-xs text-slate-300 leading-relaxed">{months[selectedIndex].description}</p>
        </div>
      )}

      <div className="flex items-center justify-center gap-4 mt-3">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-emerald-500" />
          <span className="text-xs text-slate-400">Favorable</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-amber-500" />
          <span className="text-xs text-slate-400">Moderate</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-red-500" />
          <span className="text-xs text-slate-400">Challenging</span>
        </div>
      </div>
    </div>
  );
}
