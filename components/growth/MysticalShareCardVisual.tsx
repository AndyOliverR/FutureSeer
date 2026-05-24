'use client';

import { forwardRef, useMemo } from 'react';
import type { MysticalSharePayload } from '@/lib/growth/mysticalShareCard';
import { resolveMysticalShareCardTheme } from '@/lib/growth/mysticalShareCardTheme';
import type { MysticalShareCardPalette } from '@/lib/growth/mysticalShareCardTheme';
import { MysticalShareCardArt, MysticalShareCardGrain } from '@/components/growth/MysticalShareCardArt';
import { MysticalShareCardArchetypeAccent } from '@/components/growth/MysticalShareCardArchetypeAccent';
import {
  blendHaloWithAccent,
  resolveArchetypeAccent,
} from '@/lib/growth/mysticalShareCardArchetypeAccent';

/** Tarot-adjacent portrait ratio (5:8) — phone-friendly share & desktop preview. */
export const MYSTICAL_SHARE_CARD_EXPORT_WIDTH = 540;
export const MYSTICAL_SHARE_CARD_EXPORT_HEIGHT = 864;

interface MysticalShareCardVisualProps {
  payload: MysticalSharePayload;
}

const SHINY_GOLD_TEXT = {
  background: 'linear-gradient(180deg, #fef9c3 0%, #fde047 38%, #fbbf24 72%, #d97706 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
} as const;

const TITLE_TEXT = {
  color: '#fafafa',
} as const;

function CornerOrnament({ className, palette }: { className: string; palette: MysticalShareCardPalette }) {
  return (
    <div
      className={className}
      aria-hidden
      style={{
        width: 28,
        height: 28,
        borderRadius: '50%',
        border: `1.5px solid ${palette.cornerBorder}`,
        boxShadow: palette.cornerGlow,
        background:
          'radial-gradient(circle at 35% 35%, rgba(254, 243, 199, 0.35) 0%, rgba(251, 191, 36, 0.08) 45%, transparent 70%)',
      }}
    />
  );
}

/**
 * Fixed-size portrait card for html-to-image export (feed, stories, WhatsApp).
 * Tarot-inspired frame with tool-keyed palette, center art, and soft golden glow.
 */
export const MysticalShareCardVisual = forwardRef<HTMLDivElement, MysticalShareCardVisualProps>(
  function MysticalShareCardVisual({ payload }, ref) {
    const theme = useMemo(
      () => resolveMysticalShareCardTheme(payload.highlightToolSlug),
      [payload.highlightToolSlug],
    );
    const accent = useMemo(
      () => resolveArchetypeAccent(payload.archetypeTitle),
      [payload.archetypeTitle],
    );
    const { palette } = theme;
    const halo = useMemo(() => blendHaloWithAccent(palette.halo, accent), [palette.halo, accent]);

    return (
      <div
        ref={ref}
        className="relative overflow-hidden text-center"
        style={{
          width: MYSTICAL_SHARE_CARD_EXPORT_WIDTH,
          height: MYSTICAL_SHARE_CARD_EXPORT_HEIGHT,
          fontFamily: 'Georgia, "Times New Roman", serif',
          borderRadius: 22,
        }}
      >
        <div className="absolute inset-0" style={{ background: palette.baseGradient }} />
        <div className="absolute inset-0 opacity-50" style={{ backgroundImage: palette.bokehGradient }} />
        <MysticalShareCardGrain />

        <MysticalShareCardArt kind={theme.ornament} />
        <MysticalShareCardArchetypeAccent accent={accent} />

        <div
          className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
          style={{
            top: 168,
            width: 320,
            height: 320,
            borderRadius: '50%',
            background: halo,
            filter: 'blur(2px)',
          }}
        />

        <div
          className="absolute inset-0 pointer-events-none"
          style={{ borderRadius: 22, boxShadow: palette.frameOuter }}
        />

        <div
          className="absolute pointer-events-none"
          style={{
            inset: 14,
            borderRadius: 14,
            border: palette.frameInner,
            boxShadow: 'inset 0 0 12px rgba(251, 191, 36, 0.04)',
          }}
        />

        <CornerOrnament className="absolute left-5 top-5" palette={palette} />
        <CornerOrnament className="absolute right-5 top-5" palette={palette} />
        <CornerOrnament className="absolute bottom-[72px] left-5" palette={palette} />
        <CornerOrnament className="absolute bottom-[72px] right-5" palette={palette} />

        <div className="relative z-10 flex h-full flex-col px-8 pt-9 pb-8">
          <p className="text-xl font-light tracking-[0.08em]" style={SHINY_GOLD_TEXT}>
            {theme.topMark}
          </p>

          <div>
            <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.38em] text-amber-100/80" style={SHINY_GOLD_TEXT}>
              My mystical profile
            </p>
            <p className="mt-5 text-lg font-medium tracking-wide text-amber-50/95">{payload.displayName}</p>
            <h2
              className="mt-4 px-2 text-[2.15rem] font-bold uppercase leading-[1.12] tracking-[0.05em]"
              style={TITLE_TEXT}
            >
              {payload.archetypeTitle}
            </h2>
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.28em] text-amber-200/90" style={SHINY_GOLD_TEXT}>
              {payload.rarityLabel}
            </p>
          </div>

          <div className="flex flex-1 flex-col justify-center space-y-3.5 px-1 py-4">
            <p className="text-[16px] leading-[1.6] text-slate-100">{payload.hookLine}</p>
            {payload.subLine ? (
              <p className="text-[14px] leading-[1.55] text-slate-300/95 line-clamp-4">{payload.subLine}</p>
            ) : null}
            <p className="pt-1 text-[10px] uppercase tracking-[0.2em] text-slate-400/95">
              From {payload.highlightToolName} · 50+ traditions
            </p>
          </div>

          <div
            className="mx-auto w-full max-w-[340px] rounded-lg px-4 py-3"
            style={{
              background: palette.nameplateBg,
              border: palette.nameplateBorder,
              boxShadow: 'inset 0 1px 0 rgba(254, 243, 199, 0.12)',
            }}
          >
            <p className="text-2xl font-semibold tracking-wide" style={SHINY_GOLD_TEXT}>
              futureseer.app
            </p>
            <p className="mt-2 text-[10px] uppercase tracking-[0.24em] leading-relaxed">
              <span className="text-amber-100/70">One chart · Many paths</span>
              <br />
              <span style={SHINY_GOLD_TEXT}>ASK THE</span>
              <br />
              <span style={SHINY_GOLD_TEXT}>SEER</span>
            </p>
          </div>
        </div>
      </div>
    );
  },
);
