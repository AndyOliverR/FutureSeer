"use client";

import React from 'react';
import { adaptVedicToUnified, adaptWesternToUnified } from '@/lib/charts/adapters';
import { isGroqChartExperimentEnabled } from '@/lib/charts/featureFlags';
import { applyGroqStyleVariant, validateGeometryIntegrity } from '@/lib/charts/groqVisualExperiments';
import { getChartTokens, getChartVisualSpec } from '@/lib/charts/visualTokens';
import type { UnifiedChartData } from '@/lib/charts/schema';

const ZODIAC_SYMBOLS = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
const NAKSHATRAS = ['Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra','Punarvasu','Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni','Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha','Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishtha','Shatabhisha','Purva Bhadrapada','Uttara Bhadrapada','Revati'];

function polar(center: number, radius: number, degree: number) {
  const rad = (degree - 90) * (Math.PI / 180);
  return { x: center + radius * Math.cos(rad), y: center + radius * Math.sin(rad) };
}

function WesternWheel({ chart }: { chart: UnifiedChartData }) {
  const size = 520;
  const center = size / 2;
  const tokens = getChartTokens(chart.system, chart.tokens);
  const visual = getChartVisualSpec(chart.system);
  const clustered = chart.points.map((point, idx) => {
    const nearby = chart.points.filter((p) => {
      const diff = Math.abs(p.longitude - point.longitude);
      return Math.min(diff, 360 - diff) < 10;
    });
    const sortedIds = nearby.map((p) => p.id).sort();
    const clusterIndex = sortedIds.indexOf(point.id);
    return { point, idx, clusterIndex, clusterSize: nearby.length };
  });
  return (
    <svg viewBox={`0 0 ${size} ${size}`} preserveAspectRatio="xMidYMid meet" className="w-full h-auto">
      <rect width={size} height={size} fill={tokens.background} />
      <circle cx={center} cy={center} r={220} fill="none" stroke={tokens.ringStroke} strokeWidth={visual.ringStrokeWidth} />
      <circle cx={center} cy={center} r={165} fill="none" stroke={tokens.ringStroke} strokeWidth={visual.secondaryStrokeWidth} />
      {Array.from({ length: 12 }, (_, i) => {
        const a = i * 30;
        const p = polar(center, 220, a);
        const symbol = ZODIAC_SYMBOLS[i];
        const t = polar(center, 192, a + 15);
        return (
          <g key={`z-${a}`}>
            <line x1={center} y1={center} x2={p.x} y2={p.y} stroke={tokens.ringStroke} strokeWidth={visual.secondaryStrokeWidth * 0.8} opacity="0.35" />
            <text x={t.x} y={t.y} textAnchor="middle" dominantBaseline="middle" fontSize={visual.baseFont + 5} fill={tokens.textPrimary}>{symbol}</text>
          </g>
        );
      })}
      {chart.aspects?.map((aspect, i) => {
        const p1 = chart.points.find((p) => p.id === aspect.fromId);
        const p2 = chart.points.find((p) => p.id === aspect.toId);
        if (!p1 || !p2) return null;
        const a = polar(center, 135, p1.longitude);
        const b = polar(center, 135, p2.longitude);
        return <line key={`a-${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={tokens.accent} strokeWidth="1.2" opacity="0.7" />;
      })}
      {clustered.map(({ point, clusterIndex, clusterSize }) => {
        const centeredIdx = clusterIndex - (clusterSize - 1) / 2;
        const p = polar(center, 145 + centeredIdx * 9, point.longitude);
        return (
          <g key={point.id}>
            <circle cx={p.x} cy={p.y} r={12.5} fill={tokens.background} stroke={tokens.ringStroke} strokeWidth={visual.secondaryStrokeWidth + 0.3} />
            <text x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" fontSize={visual.pointFont + 1} fontFamily="Arial, Helvetica, sans-serif" fontWeight="700" fill={tokens.textPrimary}>{point.shortLabel ?? point.label.slice(0, 2)}</text>
          </g>
        );
      })}
    </svg>
  );
}

function VedicGrid({ chart, south }: { chart: UnifiedChartData; south?: boolean }) {
  const size = 480;
  const box = size / 4;
  const tokens = getChartTokens(chart.system, chart.tokens);
  const visual = getChartVisualSpec(chart.system);
  const layout: Record<number, { row: number; col: number }> = south
    ? { 1: { row: 2, col: 1 }, 2: { row: 3, col: 0 }, 3: { row: 2, col: 0 }, 4: { row: 1, col: 0 }, 5: { row: 0, col: 0 }, 6: { row: 0, col: 1 }, 7: { row: 0, col: 2 }, 8: { row: 0, col: 3 }, 9: { row: 1, col: 3 }, 10: { row: 2, col: 3 }, 11: { row: 3, col: 3 }, 12: { row: 3, col: 2 } }
    : { 1: { row: 0, col: 1 }, 2: { row: 0, col: 0 }, 3: { row: 1, col: 0 }, 4: { row: 2, col: 0 }, 5: { row: 3, col: 0 }, 6: { row: 3, col: 1 }, 7: { row: 3, col: 2 }, 8: { row: 3, col: 3 }, 9: { row: 2, col: 3 }, 10: { row: 1, col: 3 }, 11: { row: 0, col: 3 }, 12: { row: 0, col: 2 } };
  return (
    <svg viewBox={`0 0 ${size} ${size}`} preserveAspectRatio="xMidYMid meet" className="w-full h-auto">
      <rect width={size} height={size} fill={tokens.background} />
      {Array.from({ length: 16 }, (_, i) => {
        const row = Math.floor(i / 4);
        const col = i % 4;
        return <rect key={i} x={col * box} y={row * box} width={box} height={box} fill="none" stroke={tokens.ringStroke} strokeWidth={visual.secondaryStrokeWidth} />;
      })}
      {chart.houses.map((house) => {
        const cell = layout[house.number];
        if (!cell) return null;
        const x = cell.col * box;
        const y = cell.row * box;
        const housePoints = chart.points.filter((p) => p.house === house.number);
        return (
          <g key={`h-${house.number}`}>
            <text x={x + 8} y={y + 15} fontSize={visual.baseFont} fontWeight="600" fill={tokens.textSecondary}>{house.number}</text>
            <text x={x + box / 2} y={y + 24} textAnchor="middle" fontSize={visual.baseFont + 4} fontWeight="700" fill={tokens.textPrimary}>{ZODIAC_SYMBOLS[(house.number - 1 + 12) % 12]}</text>
            {housePoints.slice(0, 4).map((p, idx) => (
              <text key={p.id} x={x + box / 2} y={y + 43 + idx * 16} textAnchor="middle" fontSize={visual.pointFont + 2} fontWeight="600" fill={tokens.textPrimary}>
                {p.shortLabel ?? p.label.slice(0, 2)}
              </text>
            ))}
          </g>
        );
      })}
    </svg>
  );
}

function NakshatraWheel({ chart }: { chart: UnifiedChartData }) {
  const size = 520;
  const center = size / 2;
  const tokens = getChartTokens('nakshatra', chart.tokens);
  const visual = getChartVisualSpec('nakshatra');
  return (
    <svg viewBox={`0 0 ${size} ${size}`} preserveAspectRatio="xMidYMid meet" className="w-full h-auto">
      <rect width={size} height={size} fill={tokens.background} />
      <circle cx={center} cy={center} r={225} fill="none" stroke={tokens.ringStroke} strokeWidth={visual.ringStrokeWidth} />
      <circle cx={center} cy={center} r={170} fill="none" stroke={tokens.ringStroke} strokeWidth={visual.secondaryStrokeWidth + 0.1} />
      <circle cx={center} cy={center} r={120} fill="none" stroke={tokens.ringStroke} strokeWidth={visual.secondaryStrokeWidth} />
      {Array.from({ length: 27 }, (_, i) => {
        const a = i * (360 / 27);
        const p1 = polar(center, 120, a);
        const p2 = polar(center, 225, a);
        const t = polar(center, 198, a + (360 / 27 / 2));
        return (
          <g key={i}>
            <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={tokens.ringStroke} strokeWidth={visual.secondaryStrokeWidth * 0.6} opacity="0.55" />
            <text x={t.x} y={t.y} textAnchor="middle" dominantBaseline="middle" fontSize={visual.baseFont - 0.5} fontWeight="600" fill={tokens.textSecondary}>
              {NAKSHATRAS[i]}
            </text>
          </g>
        );
      })}
      {chart.points.map((point, idx) => {
        const p = polar(center, 105 - (idx % 3) * 12, point.longitude);
        return (
          <text key={point.id} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" fontSize={visual.pointFont + 2} fontWeight="700" fill={tokens.textPrimary}>
            {point.shortLabel ?? point.label.slice(0, 2)}
          </text>
        );
      })}
    </svg>
  );
}

function GridPreview({ chart }: { chart: UnifiedChartData }) {
  const points = chart.points.slice(0, 9);
  return (
    <div className="grid grid-cols-3 gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
      {Array.from({ length: 9 }, (_, i) => {
        const point = points[i];
        return (
          <div
            key={point?.id ?? `cell-${i}`}
            className="flex min-h-[64px] items-center justify-center rounded border border-slate-200 bg-white px-2 text-center"
          >
            <span className="text-sm font-semibold text-slate-700">
              {point ? point.shortLabel ?? point.label : '—'}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function CompassPreview({ chart }: { chart: UnifiedChartData }) {
  const ordered = [...chart.points].sort((a, b) => a.longitude - b.longitude);
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="grid grid-cols-2 gap-2">
        {ordered.map((point) => (
          <div
            key={point.id}
            className="rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
          >
            <span className="font-semibold">{point.shortLabel ?? point.label}</span>
            <span className="ml-2 text-xs text-slate-500">{Math.round(point.longitude)}°</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function UnifiedChartRenderer({ chart, visualVariant }: { chart: UnifiedChartData; visualVariant?: string }) {
  let renderData = chart;
  if (isGroqChartExperimentEnabled()) {
    const experimental = applyGroqStyleVariant(chart, visualVariant);
    if (validateGeometryIntegrity(chart, experimental)) renderData = experimental;
  }

  if (renderData.layout === 'western-wheel') return <WesternWheel chart={renderData} />;
  if (renderData.layout === 'nakshatra-wheel') return <NakshatraWheel chart={renderData} />;
  if (renderData.layout === 'grid') return <GridPreview chart={renderData} />;
  if (renderData.layout === 'compass') return <CompassPreview chart={renderData} />;
  if (renderData.layout === 'vedic-south') return <VedicGrid chart={renderData} south />;
  return <VedicGrid chart={renderData} />;
}

export function createWesternChartData(input: {
  planets?: Array<Record<string, unknown>>;
  houses?: Array<Record<string, unknown>>;
  aspects?: Array<Record<string, unknown>>;
  title?: string;
}) {
  return adaptWesternToUnified(input);
}

export function createVedicChartData(input: {
  houses?: Array<Record<string, unknown>>;
  planets?: Record<string, Record<string, unknown>>;
  title?: string;
  layout?: 'vedic-north' | 'vedic-south' | 'nakshatra-wheel';
}) {
  return adaptVedicToUnified(input);
}

