"use client";

import React from 'react';
import { UnifiedChartRenderer } from './UnifiedChartRenderer';
import type { UnifiedChartData } from '@/lib/charts/schema';

export function Phase2VisualPanel({ charts }: { charts: UnifiedChartData[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {charts.map((chart) => (
        <div key={chart.id} className="rounded-xl border border-slate-300 bg-white p-3">
          <h3 className="text-sm font-semibold text-slate-700 mb-2">{chart.title}</h3>
          <UnifiedChartRenderer chart={chart} />
        </div>
      ))}
    </div>
  );
}

