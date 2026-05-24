'use client';

import type { JSX } from 'react';
import type { ShareCardOrnamentKind } from '@/lib/growth/mysticalShareCardTheme';

const ART_STROKE = 'rgba(251, 191, 36, 0.35)';
const ART_FILL = 'rgba(251, 191, 36, 0.06)';
const ART_STROKE_SOFT = 'rgba(251, 191, 36, 0.22)';

interface MysticalShareCardArtProps {
  kind: ShareCardOrnamentKind;
}

function ZodiacWheelArt() {
  return (
    <svg viewBox="0 0 280 280" fill="none" aria-hidden className="h-full w-full">
      <circle cx="140" cy="140" r="118" stroke={ART_STROKE} strokeWidth="1.2" />
      <circle cx="140" cy="140" r="88" stroke={ART_STROKE_SOFT} strokeWidth="0.8" />
      <circle cx="140" cy="140" r="58" stroke={ART_STROKE_SOFT} strokeWidth="0.8" />
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i * Math.PI) / 6 - Math.PI / 2;
        const x1 = 140 + Math.cos(a) * 58;
        const y1 = 140 + Math.sin(a) * 58;
        const x2 = 140 + Math.cos(a) * 118;
        const y2 = 140 + Math.sin(a) * 118;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={ART_STROKE_SOFT} strokeWidth="0.7" />;
      })}
      <circle cx="140" cy="140" r="22" fill={ART_FILL} stroke={ART_STROKE} strokeWidth="1" />
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i * Math.PI) / 4;
        const x = 140 + Math.cos(a) * 34;
        const y = 140 + Math.sin(a) * 34;
        return <circle key={i} cx={x} cy={y} r="3" fill="rgba(251, 191, 36, 0.25)" />;
      })}
    </svg>
  );
}

function VedicMandalaArt() {
  return (
    <svg viewBox="0 0 280 280" fill="none" aria-hidden className="h-full w-full">
      {Array.from({ length: 8 }).map((_, i) => (
        <ellipse
          key={i}
          cx="140"
          cy="140"
          rx="110"
          ry="28"
          transform={`rotate(${(i * 180) / 8} 140 140)`}
          stroke={ART_STROKE_SOFT}
          strokeWidth="0.8"
        />
      ))}
      <circle cx="140" cy="140" r="100" stroke={ART_STROKE} strokeWidth="1" />
      <circle cx="140" cy="140" r="72" stroke={ART_STROKE_SOFT} strokeWidth="0.8" />
      <circle cx="140" cy="140" r="44" fill={ART_FILL} stroke={ART_STROKE} strokeWidth="1" />
      <path
        d="M140 96 L152 128 L184 128 L158 148 L168 180 L140 162 L112 180 L122 148 L96 128 L128 128 Z"
        fill="rgba(245, 158, 11, 0.08)"
        stroke={ART_STROKE}
        strokeWidth="0.9"
      />
    </svg>
  );
}

function NumerologyGlyphsArt() {
  const nums = ['7', '3', '9', '1', '5', '11'];
  return (
    <svg viewBox="0 0 280 280" fill="none" aria-hidden className="h-full w-full">
      {nums.map((n, i) => {
        const a = (i * Math.PI) / 3 - Math.PI / 2;
        const x = 140 + Math.cos(a) * 72;
        const y = 140 + Math.sin(a) * 72;
        return (
          <text
            key={n}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="rgba(167, 139, 250, 0.35)"
            fontSize={i === 5 ? '22' : '28'}
            fontFamily="Georgia, serif"
            fontWeight="600"
          >
            {n}
          </text>
        );
      })}
      <circle cx="140" cy="140" r="36" stroke={ART_STROKE} strokeWidth="1" fill={ART_FILL} />
      <text x="140" y="148" textAnchor="middle" fill="rgba(251, 191, 36, 0.4)" fontSize="32" fontFamily="Georgia, serif">
        ∞
      </text>
    </svg>
  );
}

function TarotCelestialArt() {
  return (
    <svg viewBox="0 0 280 280" fill="none" aria-hidden className="h-full w-full">
      <circle cx="140" cy="118" r="52" fill="rgba(251, 191, 36, 0.1)" stroke={ART_STROKE} strokeWidth="1.2" />
      {Array.from({ length: 16 }).map((_, i) => {
        const a = (i * Math.PI) / 8 - Math.PI / 2;
        const long = i % 2 === 0;
        const r1 = long ? 58 : 52;
        const r2 = long ? 88 : 72;
        return (
          <line
            key={i}
            x1={140 + Math.cos(a) * r1}
            y1={118 + Math.sin(a) * r1}
            x2={140 + Math.cos(a) * r2}
            y2={118 + Math.sin(a) * r2}
            stroke={ART_STROKE}
            strokeWidth={long ? '1.2' : '0.8'}
          />
        );
      })}
      <ellipse cx="140" cy="200" rx="90" ry="28" fill="rgba(244, 114, 182, 0.06)" stroke={ART_STROKE_SOFT} strokeWidth="0.8" />
      <path d="M60 210 Q100 180 140 195 T220 210" stroke="rgba(45, 212, 191, 0.25)" strokeWidth="1" fill="none" />
    </svg>
  );
}

function BodygraphArt() {
  return (
    <svg viewBox="0 0 280 280" fill="none" aria-hidden className="h-full w-full">
      <rect x="118" y="70" width="44" height="36" rx="8" stroke={ART_STROKE} strokeWidth="1" fill={ART_FILL} />
      <path d="M140 106 L140 168" stroke={ART_STROKE} strokeWidth="1.2" />
      <path d="M100 130 L180 130" stroke={ART_STROKE_SOFT} strokeWidth="1" />
      <path d="M118 168 L100 220" stroke={ART_STROKE_SOFT} strokeWidth="1" />
      <path d="M162 168 L180 220" stroke={ART_STROKE_SOFT} strokeWidth="1" />
      <path d="M118 168 L162 168" stroke={ART_STROKE} strokeWidth="1" />
      <circle cx="100" cy="130" r="8" stroke="rgba(239, 68, 68, 0.35)" strokeWidth="1" fill="rgba(239, 68, 68, 0.08)" />
      <circle cx="180" cy="130" r="8" stroke="rgba(251, 191, 36, 0.35)" strokeWidth="1" fill="rgba(251, 191, 36, 0.08)" />
      <circle cx="140" cy="168" r="10" stroke={ART_STROKE} strokeWidth="1" fill={ART_FILL} />
    </svg>
  );
}

function RuneStoneArt() {
  return (
    <svg viewBox="0 0 280 280" fill="none" aria-hidden className="h-full w-full">
      <path
        d="M90 210 Q80 140 110 90 Q140 60 170 90 Q200 140 190 210 Q140 230 90 210 Z"
        fill="rgba(148, 163, 184, 0.08)"
        stroke={ART_STROKE}
        strokeWidth="1.2"
      />
      <path
        d="M140 95 L140 185 M115 140 L165 140 M125 115 L155 165 M155 115 L125 165"
        stroke="rgba(203, 213, 225, 0.4)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LenormandBirdArt() {
  return (
    <svg viewBox="0 0 280 280" fill="none" aria-hidden className="h-full w-full">
      <path d="M80 170 Q120 120 160 140 Q200 160 210 110" stroke="rgba(45, 212, 191, 0.35)" strokeWidth="1.2" fill="none" />
      <path
        d="M160 140 Q175 100 200 95 Q185 115 195 130"
        fill="rgba(45, 212, 191, 0.12)"
        stroke="rgba(45, 212, 191, 0.35)"
        strokeWidth="1"
      />
      <ellipse cx="130" cy="185" rx="55" ry="18" fill="rgba(254, 243, 199, 0.05)" stroke={ART_STROKE_SOFT} strokeWidth="0.8" />
      <rect x="95" y="200" width="36" height="48" rx="4" stroke={ART_STROKE_SOFT} strokeWidth="0.8" fill="rgba(45, 212, 191, 0.05)" />
      <rect x="149" y="208" width="36" height="40" rx="4" stroke={ART_STROKE_SOFT} strokeWidth="0.8" fill="rgba(45, 212, 191, 0.05)" />
    </svg>
  );
}

function IchingHexagramArt() {
  const lines = [1, 1, 0, 1, 0, 1];
  return (
    <svg viewBox="0 0 280 280" fill="none" aria-hidden className="h-full w-full">
      <circle cx="140" cy="140" r="100" stroke={ART_STROKE_SOFT} strokeWidth="0.8" />
      {lines.map((solid, i) => {
        const y = 88 + i * 22;
        if (solid) {
          return <rect key={i} x="95" y={y} width="90" height="8" rx="2" fill="rgba(251, 191, 36, 0.28)" />;
        }
        return (
          <g key={i}>
            <rect x="95" y={y} width="38" height="8" rx="2" fill="rgba(251, 191, 36, 0.28)" />
            <rect x="147" y={y} width="38" height="8" rx="2" fill="rgba(251, 191, 36, 0.28)" />
          </g>
        );
      })}
    </svg>
  );
}

function PalmLinesArt() {
  return (
    <svg viewBox="0 0 280 280" fill="none" aria-hidden className="h-full w-full">
      <path
        d="M140 230 Q110 200 105 150 Q100 100 130 75 Q155 55 175 80 Q195 105 190 150 Q185 200 140 230 Z"
        fill="rgba(244, 114, 182, 0.06)"
        stroke={ART_STROKE}
        strokeWidth="1"
      />
      <path d="M125 95 Q115 140 130 185" stroke="rgba(244, 114, 182, 0.35)" strokeWidth="1.2" fill="none" />
      <path d="M155 90 Q175 130 165 190" stroke={ART_STROKE} strokeWidth="1" fill="none" />
      <path d="M110 155 Q140 165 170 150" stroke={ART_STROKE_SOFT} strokeWidth="1" fill="none" />
    </svg>
  );
}

function FengShuiCompassArt() {
  return (
    <svg viewBox="0 0 280 280" fill="none" aria-hidden className="h-full w-full">
      <circle cx="140" cy="140" r="105" stroke={ART_STROKE} strokeWidth="1" />
      <circle cx="140" cy="140" r="75" stroke={ART_STROKE_SOFT} strokeWidth="0.8" />
      <path d="M140 35 L140 245 M35 140 L245 140" stroke={ART_STROKE_SOFT} strokeWidth="0.8" />
      <path d="M68 68 L212 212 M212 68 L68 212" stroke={ART_STROKE_SOFT} strokeWidth="0.6" />
      <polygon points="140,55 155,125 140,110 125,125" fill="rgba(34, 197, 94, 0.15)" stroke="rgba(34, 197, 94, 0.35)" strokeWidth="0.8" />
      <polygon points="140,225 125,155 140,170 155,155" fill="rgba(251, 191, 36, 0.1)" stroke={ART_STROKE_SOFT} strokeWidth="0.8" />
    </svg>
  );
}

function CosmicDefaultArt() {
  return (
    <svg viewBox="0 0 280 280" fill="none" aria-hidden className="h-full w-full">
      {Array.from({ length: 24 }).map((_, i) => {
        const a = (i * Math.PI * 2) / 24;
        const r = 40 + (i % 5) * 16;
        const x = 140 + Math.cos(a) * r;
        const y = 140 + Math.sin(a) * r;
        return <circle key={i} cx={x} cy={y} r={1.2 + (i % 3) * 0.4} fill="rgba(251, 191, 36, 0.35)" />;
      })}
      <circle cx="140" cy="140" r="68" stroke={ART_STROKE} strokeWidth="1" strokeDasharray="4 6" />
      <circle cx="140" cy="140" r="28" fill={ART_FILL} stroke={ART_STROKE} strokeWidth="1" />
    </svg>
  );
}

const ART_BY_KIND: Record<ShareCardOrnamentKind, () => JSX.Element> = {
  'zodiac-wheel': ZodiacWheelArt,
  'vedic-mandala': VedicMandalaArt,
  'numerology-glyphs': NumerologyGlyphsArt,
  'tarot-celestial': TarotCelestialArt,
  bodygraph: BodygraphArt,
  'rune-stone': RuneStoneArt,
  'lenormand-bird': LenormandBirdArt,
  'iching-hexagram': IchingHexagramArt,
  'palm-lines': PalmLinesArt,
  'feng-shui-compass': FengShuiCompassArt,
  'cosmic-default': CosmicDefaultArt,
};

/** Center-field symbolic art keyed to highlight tool tradition. */
export function MysticalShareCardArt({ kind }: MysticalShareCardArtProps) {
  const Art = ART_BY_KIND[kind];
  return (
    <div
      className="pointer-events-none absolute left-1/2 -translate-x-1/2"
      style={{
        top: 200,
        width: 280,
        height: 280,
        opacity: 0.55,
        filter: 'blur(0.2px)',
      }}
      aria-hidden
    >
      <Art />
    </div>
  );
}

/** Subtle paper grain overlay for tarot-card tactility. */
export function MysticalShareCardGrain() {
  return (
    <div
      className="pointer-events-none absolute inset-0 opacity-[0.07]"
      aria-hidden
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")",
        backgroundSize: '128px 128px',
      }}
    />
  );
}
