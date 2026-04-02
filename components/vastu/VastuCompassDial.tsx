'use client';

import type { VastuCompassMode } from '@/lib/vastuDirections';

const LABELS_16 = [
  'N',
  'NNE',
  'NE',
  'ENE',
  'E',
  'ESE',
  'SE',
  'SSE',
  'S',
  'SSW',
  'SW',
  'WSW',
  'W',
  'WNW',
  'NW',
  'NNW',
] as const;

const LABELS_8 = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'] as const;

/** 0° = North at top; degrees clockwise from North. */
function polar(cx: number, cy: number, r: number, degFromNorth: number) {
  const rad = ((degFromNorth - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

export interface VastuCompassDialProps {
  headingDeg: number | null;
  mode: VastuCompassMode;
  size?: number;
  /** Material 3 (mobile) vs devotionist web */
  variant: 'web' | 'm3';
}

export function VastuCompassDial({ headingDeg, mode, size = 220, variant }: VastuCompassDialProps) {
  const cx = 100;
  const cy = 100;
  const outer = 90;
  const inner = 28;
  const n =
    mode === '4'
      ? 4
      : mode === '8'
        ? 8
        : mode === '16'
          ? 16
          : mode === '32'
            ? 32
            : 45;

  const rotation = headingDeg != null ? -headingDeg : 0;

  const strokeRing = variant === 'web' ? 'rgba(120, 53, 15, 0.45)' : 'rgba(255, 255, 255, 0.35)';
  const strokeLine = variant === 'web' ? 'rgba(120, 53, 15, 0.3)' : 'rgba(255, 255, 255, 0.22)';
  const strokeBold = variant === 'web' ? 'rgba(146, 64, 14, 0.55)' : 'rgba(251, 191, 36, 0.5)';

  const radialLines: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const deg = (360 / n) * i;
    const isCardinal = deg % 90 === 0;
    const p0 = polar(cx, cy, inner, deg);
    const p1 = polar(cx, cy, outer, deg);
    radialLines.push(
      <line
        key={i}
        x1={p0.x}
        y1={p0.y}
        x2={p1.x}
        y2={p1.y}
        stroke={isCardinal ? strokeBold : strokeLine}
        strokeWidth={isCardinal ? 1.4 : mode === '45' || mode === '32' ? 0.5 : 0.9}
      />
    );
  }

  const labels: { x: number; y: number; t: string; key: string }[] = [];
  if (mode === '4') {
    for (let i = 0; i < 4; i++) {
      const mid = (360 / 4) * i + 360 / 8;
      const p = polar(cx, cy, (inner + outer) / 2 + 6, mid);
      labels.push({ x: p.x, y: p.y, t: ['N', 'E', 'S', 'W'][i]!, key: `4-${i}` });
    }
  } else if (mode === '8') {
    for (let i = 0; i < 8; i++) {
      const mid = (360 / 8) * i + 360 / 16;
      const p = polar(cx, cy, (inner + outer) / 2 + 4, mid);
      labels.push({ x: p.x, y: p.y, t: LABELS_8[i]!, key: `8-${i}` });
    }
  } else if (mode === '16') {
    for (let i = 0; i < 16; i++) {
      const mid = (360 / 16) * i + 360 / 32;
      const p = polar(cx, cy, (inner + outer) / 2 + 2, mid);
      labels.push({ x: p.x, y: p.y, t: LABELS_16[i]!, key: `16-${i}` });
    }
  }

  const labelClass =
    variant === 'web'
      ? 'fill-amber-900 pointer-events-none font-semibold'
      : 'fill-amber-100 pointer-events-none font-semibold';

  return (
    <div className="relative mx-auto flex flex-col items-center" style={{ width: size, height: size }} aria-hidden>
      <svg width={size} height={size} viewBox="0 0 200 200" className="drop-shadow-sm">
        <defs>
          <marker id="vastu-compass-arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <polygon points="0 0, 6 3, 0 6" fill={variant === 'web' ? '#b45309' : '#fbbf24'} />
          </marker>
        </defs>
        <g style={{ transform: `rotate(${rotation}deg)`, transformOrigin: '100px 100px' }}>
          <circle
            cx={cx}
            cy={cy}
            r={outer}
            fill="none"
            stroke={strokeRing}
            strokeWidth={variant === 'web' ? 2.2 : 1.8}
          />
          <circle cx={cx} cy={cy} r={inner} fill="none" stroke={strokeRing} strokeWidth={1} opacity={0.6} />
          {radialLines}
          {labels.map((l) => (
            <text
              key={l.key}
              x={l.x}
              y={l.y}
              textAnchor="middle"
              dominantBaseline="central"
              className={labelClass}
              style={{ fontSize: mode === '16' ? 10 : 12 }}
            >
              {l.t}
            </text>
          ))}
          {(mode === '32' || mode === '45') &&
            [0, 90, 180, 270].map((deg, idx) => {
              const p = polar(cx, cy, outer - 10, deg);
              return (
                <text
                  key={`card-${deg}`}
                  x={p.x}
                  y={p.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className={variant === 'web' ? 'fill-amber-800 text-[13px] font-bold' : 'fill-amber-200 text-[12px] font-bold'}
                >
                  {['N', 'E', 'S', 'W'][idx]}
                </text>
              );
            })}
        </g>
        <line
          x1={100}
          y1={100}
          x2={100}
          y2={16}
          stroke={variant === 'web' ? '#b45309' : '#fbbf24'}
          strokeWidth={3}
          strokeLinecap="round"
          markerEnd="url(#vastu-compass-arrow)"
        />
        <circle
          cx={100}
          cy={100}
          r={6}
          fill={variant === 'web' ? '#fef3c7' : '#1e293b'}
          stroke={variant === 'web' ? '#b45309' : '#fbbf24'}
          strokeWidth={2}
        />
      </svg>
    </div>
  );
}
