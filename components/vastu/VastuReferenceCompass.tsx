'use client';

import { useCallback, useState } from 'react';
import { VASTU_16_ZONES } from '@/lib/vastuDirections';
import { VASTU_16_ZONE_REFERENCE, type VastuZoneKey } from '@/lib/vastu16ZoneReference';
import { useIsMobileLayout } from '@/hooks/useIsMobileLayout';
import { cn } from '@/lib/utils';

function polar(cx: number, cy: number, r: number, degFromNorth: number) {
  const rad = ((degFromNorth - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function sectorPath(cx: number, cy: number, rInner: number, rOuter: number, startDeg: number, endDeg: number): string {
  const outerStart = polar(cx, cy, rOuter, startDeg);
  const outerEnd = polar(cx, cy, rOuter, endDeg);
  const innerEnd = polar(cx, cy, rInner, endDeg);
  const innerStart = polar(cx, cy, rInner, startDeg);
  const sweep = 1;
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${rOuter} ${rOuter} 0 ${largeArc} ${sweep} ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${rInner} ${rInner} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y}`,
    'Z',
  ].join(' ');
}

export function VastuReferenceCompass({ className }: { className?: string }) {
  const isMobile = useIsMobileLayout();
  const [selected, setSelected] = useState<VastuZoneKey | null>(null);
  const cx = 100;
  const cy = 100;
  const rOuter = 88;
  const rInner = 24;
  const n = 16;

  const strokeRing = isMobile ? 'rgba(255,255,255,0.35)' : 'rgba(15, 23, 42, 0.35)';
  const strokeFine = isMobile ? 'rgba(255,255,255,0.2)' : 'rgba(15, 23, 42, 0.15)';

  const onPick = useCallback((z: VastuZoneKey) => {
    setSelected((prev) => (prev === z ? null : z));
  }, []);

  return (
    <div className={cn('flex flex-col items-center gap-10', className)}>
      <div className="flex w-full justify-center px-2 py-6 sm:px-4 sm:py-8">
        <div className="w-full max-w-[min(400px,85vw)] [perspective:900px]">
          <div className="transform-gpu drop-shadow-xl transition-transform duration-300 [transform-style:preserve-3d] [transform:rotateX(6deg)_rotateY(14deg)] motion-reduce:transform-none">
            <svg
              viewBox="-14 -14 228 228"
              className="max-h-[min(380px,72vw)] w-full max-w-full overflow-visible"
              role="img"
              aria-label="Sixteen-zone Vastu reference compass, North up"
            >
        <defs>
          <filter id="vastuRefInnerShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodOpacity="0.25" />
          </filter>
        </defs>
        {VASTU_16_ZONES.map((zone, i) => {
          const startDeg = (360 / n) * i;
          const endDeg = (360 / n) * (i + 1);
          const ref = VASTU_16_ZONE_REFERENCE[zone];
          const isSel = selected === zone;
          const d = sectorPath(cx, cy, rInner, rOuter, startDeg, endDeg);
          const mid = (startDeg + endDeg) / 2;
          const lp = polar(cx, cy, (rInner + rOuter) / 2 + 2, mid);
          return (
            <g key={zone}>
              <path
                d={d}
                fill={isSel ? ref.fillMuted : ref.fill}
                fillOpacity={isSel ? 0.95 : 0.82}
                stroke={strokeRing}
                strokeWidth={isSel ? 1.6 : 0.9}
                className="cursor-pointer transition-all duration-150 hover:opacity-100"
                style={{ filter: isSel ? 'url(#vastuRefInnerShadow)' : undefined }}
                onClick={() => onPick(zone)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onPick(zone);
                  }
                }}
                tabIndex={0}
              />
              <text
                x={lp.x}
                y={lp.y}
                textAnchor="middle"
                dominantBaseline="central"
                className="pointer-events-none select-none font-semibold"
                fill={isMobile ? 'rgba(255,255,255,0.95)' : 'rgba(15,23,42,0.92)'}
                style={{ fontSize: 9 }}
              >
                {ref.abbrev}
              </text>
            </g>
          );
        })}
        {/* Cardinal ticks */}
        {[0, 90, 180, 270].map((deg) => {
          const p0 = polar(cx, cy, rOuter, deg);
          const p1 = polar(cx, cy, rOuter + 6, deg);
          return (
            <line
              key={deg}
              x1={p0.x}
              y1={p0.y}
              x2={p1.x}
              y2={p1.y}
              stroke={strokeFine}
              strokeWidth={2}
            />
          );
        })}
        {['N', 'E', 'S', 'W'].map((label, idx) => {
          const deg = idx * 90;
          const p = polar(cx, cy, rOuter + 14, deg);
          return (
            <text
              key={label}
              x={p.x}
              y={p.y}
              textAnchor="middle"
              dominantBaseline="central"
              className="font-bold"
              fill={isMobile ? '#fef3c7' : '#78350f'}
              style={{ fontSize: 12 }}
            >
              {label}
            </text>
          );
        })}
        <circle cx={cx} cy={cy} r={rInner - 2} fill={isMobile ? 'rgba(15,23,42,0.85)' : 'rgba(255,251,235,0.95)'} stroke={strokeRing} strokeWidth={1} />
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="central"
          className="font-semibold"
          fill={isMobile ? '#fde68a' : '#92400e'}
          style={{ fontSize: 8 }}
        >
          16 zones
        </text>
            </svg>
          </div>
        </div>
      </div>
      {selected && (
        <div
          className={cn(
            'mt-2 w-full max-w-md rounded-xl border px-4 py-3 text-sm',
            isMobile ? 'border-amber-700/40 bg-slate-900/90 text-amber-50' : 'border-amber-300 bg-amber-50/95 text-slate-800'
          )}
        >
          <p className={cn('font-semibold', isMobile ? 'text-amber-200' : 'text-amber-900')}>{selected}</p>
          <p className={cn('mt-1', isMobile ? 'text-slate-200' : 'text-slate-700')}>
            {VASTU_16_ZONE_REFERENCE[selected].theme}
          </p>
          <p className={cn('mt-2 text-xs', isMobile ? 'text-slate-400' : 'text-slate-500')}>
            Tap another sector to compare.
          </p>
        </div>
      )}
    </div>
  );
}
