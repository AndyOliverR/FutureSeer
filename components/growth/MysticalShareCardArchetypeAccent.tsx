'use client';

import type { ReactNode } from 'react';
import type { ArchetypeAccentConfig, ArchetypeAccentKind } from '@/lib/growth/mysticalShareCardArchetypeAccent';

interface MysticalShareCardArchetypeAccentProps {
  accent: ArchetypeAccentConfig;
}

function TensionAccent({ stroke, fill }: ArchetypeAccentConfig) {
  return (
    <>
      <line x1="68" y1="68" x2="212" y2="212" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" />
      <line x1="212" y1="68" x2="68" y2="212" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="140" cy="140" r="18" fill={fill} stroke={stroke} strokeWidth="1.2" />
      <line x1="140" y1="48" x2="140" y2="100" stroke={stroke} strokeWidth="1.5" />
      <line x1="140" y1="180" x2="140" y2="232" stroke={stroke} strokeWidth="1.5" />
    </>
  );
}

function HarmonyAccent({ stroke, fill }: ArchetypeAccentConfig) {
  return (
    <polygon
      points="140,58 210,180 70,180"
      fill={fill}
      stroke={stroke}
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  );
}

function FocusAccent({ stroke, fill }: ArchetypeAccentConfig) {
  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i * Math.PI) / 4 - Math.PI / 2;
        return (
          <line
            key={i}
            x1={140 + Math.cos(a) * 36}
            y1={140 + Math.sin(a) * 36}
            x2={140 + Math.cos(a) * 108}
            y2={140 + Math.sin(a) * 108}
            stroke={stroke}
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        );
      })}
      <circle cx="140" cy="140" r="24" fill={fill} stroke={stroke} strokeWidth="1.5" />
      {[0, 1, 2].map((i) => {
        const a = -Math.PI / 3 + (i * Math.PI) / 6;
        const x = 140 + Math.cos(a) * 52;
        const y = 140 + Math.sin(a) * 52;
        return <circle key={i} cx={x} cy={y} r="5" fill={stroke} opacity="0.65" />;
      })}
    </>
  );
}

function FateAccent({ stroke, fill }: ArchetypeAccentConfig) {
  return (
    <>
      <polygon points="140,62 178,195 102,195" fill={fill} stroke={stroke} strokeWidth="1.2" />
      <circle cx="140" cy="118" r="8" fill={stroke} opacity="0.7" />
      <line x1="140" y1="126" x2="140" y2="168" stroke={stroke} strokeWidth="1.5" />
    </>
  );
}

function AnchorAccent({ stroke, fill }: ArchetypeAccentConfig) {
  return (
    <>
      <rect x="88" y="188" width="104" height="10" rx="3" fill={fill} stroke={stroke} strokeWidth="1" />
      <rect x="128" y="98" width="24" height="90" rx="4" fill={fill} stroke={stroke} strokeWidth="1.2" />
      <path d="M118 98 L162 98 L140 72 Z" fill={fill} stroke={stroke} strokeWidth="1" />
    </>
  );
}

function StormAccent({ stroke }: ArchetypeAccentConfig) {
  return (
    <>
      {[0, 1, 2, 3].map((i) => (
        <line
          key={i}
          x1={60 + i * 18}
          y1={220 - i * 8}
          x2={200 - i * 12}
          y2={80 + i * 10}
          stroke={stroke}
          strokeWidth="1.4"
          strokeLinecap="round"
          opacity={0.5 + i * 0.12}
        />
      ))}
    </>
  );
}

function WeaverAccent({ stroke, fill }: ArchetypeAccentConfig) {
  return (
    <>
      <path d="M70 120 Q140 80 210 120 Q140 160 70 120" fill="none" stroke={stroke} strokeWidth="1.2" />
      <path d="M70 160 Q140 120 210 160 Q140 200 70 160" fill="none" stroke={stroke} strokeWidth="1.2" />
      <circle cx="140" cy="140" r="14" fill={fill} stroke={stroke} strokeWidth="1" />
    </>
  );
}

function WalkerAccent({ stroke, fill }: ArchetypeAccentConfig) {
  return (
    <>
      <path
        d="M100 210 Q120 170 140 180 T180 120 T160 80"
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={120 + i * 24} cy={190 - i * 36} r="4" fill={fill} stroke={stroke} strokeWidth="0.8" />
      ))}
    </>
  );
}

function WitnessAccent({ stroke, fill }: ArchetypeAccentConfig) {
  return (
    <>
      <ellipse cx="140" cy="140" rx="52" ry="32" fill={fill} stroke={stroke} strokeWidth="1.2" />
      <circle cx="140" cy="140" r="14" fill={stroke} opacity="0.55" />
      <circle cx="140" cy="140" r="5" fill="rgba(15, 23, 42, 0.85)" />
    </>
  );
}

function SeekerAccent({ stroke, fill }: ArchetypeAccentConfig) {
  return (
    <>
      <circle cx="140" cy="140" r="56" stroke={stroke} strokeWidth="1" fill="none" strokeDasharray="3 5" />
      <polygon points="140,88 148,132 140,124 132,132" fill={fill} stroke={stroke} strokeWidth="1" />
      <circle cx="140" cy="140" r="6" fill={stroke} opacity="0.6" />
    </>
  );
}

function MessengerAccent({ stroke, fill }: ArchetypeAccentConfig) {
  return (
    <>
      <path d="M88 150 Q140 110 192 150" fill="none" stroke={stroke} strokeWidth="1.2" />
      <path d="M88 150 Q140 190 192 150" fill="none" stroke={stroke} strokeWidth="1.2" />
      <ellipse cx="140" cy="150" rx="22" ry="10" fill={fill} stroke={stroke} strokeWidth="1" />
    </>
  );
}

function ForgerAccent({ stroke, fill }: ArchetypeAccentConfig) {
  return (
    <>
      <path
        d="M90 170 L130 110 L150 130 L190 90"
        fill="none"
        stroke={stroke}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path d="M118 198 L140 150 L162 198 Z" fill={fill} stroke={stroke} strokeWidth="1" />
    </>
  );
}

const ACCENT_RENDERERS: Record<ArchetypeAccentKind, (accent: ArchetypeAccentConfig) => ReactNode> = {
  tension: (a) => <TensionAccent {...a} />,
  harmony: (a) => <HarmonyAccent {...a} />,
  focus: (a) => <FocusAccent {...a} />,
  fate: (a) => <FateAccent {...a} />,
  anchor: (a) => <AnchorAccent {...a} />,
  storm: (a) => <StormAccent {...a} />,
  weaver: (a) => <WeaverAccent {...a} />,
  walker: (a) => <WalkerAccent {...a} />,
  witness: (a) => <WitnessAccent {...a} />,
  seeker: (a) => <SeekerAccent {...a} />,
  messenger: (a) => <MessengerAccent {...a} />,
  forger: (a) => <ForgerAccent {...a} />,
};

/** Archetype-specific SVG overlay — second layer on tool base art. */
export function MysticalShareCardArchetypeAccent({ accent }: MysticalShareCardArchetypeAccentProps) {
  const render = ACCENT_RENDERERS[accent.kind];
  return (
    <div
      className="pointer-events-none absolute left-1/2 -translate-x-1/2"
      style={{
        top: 200,
        width: 280,
        height: 280,
        opacity: 0.72,
      }}
      aria-hidden
    >
      <svg viewBox="0 0 280 280" fill="none" className="h-full w-full">
        {render(accent)}
      </svg>
    </div>
  );
}
