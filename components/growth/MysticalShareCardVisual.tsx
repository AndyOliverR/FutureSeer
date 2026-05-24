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

const GOLD_GLOW_TEXT = {
  color: '#fde68a',
  textShadow:
    '0 0 6px rgba(253, 224, 71, 0.95), 0 0 18px rgba(251, 191, 36, 0.65), 0 0 36px rgba(251, 191, 36, 0.35), 0 0 56px rgba(251, 191, 36, 0.2)',
} as const;

const SOFT_WHITE_GLOW = {
  textShadow: '0 0 20px rgba(255, 255, 255, 0.35), 0 0 40px rgba(251, 191, 36, 0.15)',
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
            boxShadow: 'inset 0 0 24px rgba(251, 191, 36, 0.06)',
          }}
        />

        <CornerOrnament className="absolute left-5 top-5" palette={palette} />
        <CornerOrnament className="absolute right-5 top-5" palette={palette} />
        <CornerOrnament className="absolute bottom-[72px] left-5" palette={palette} />
        <CornerOrnament className="absolute bottom-[72px] right-5" palette={palette} />

        <div className="relative z-10 flex h-full flex-col px-9 pt-9 pb-8">
          <p
            className="text-lg font-light tracking-[0.08em]"
            style={{
              ...GOLD_GLOW_TEXT,
              textShadow: `${GOLD_GLOW_TEXT.textShadow}, ${palette.accentGlow}`,
            }}
          >
            {theme.topMark}
          </p>

          <div>
            <p
              className="mt-4 text-[10px] font-semibold uppercase tracking-[0.42em] text-amber-100/75"
              style={GOLD_GLOW_TEXT}
            >
              My mystical profile
            </p>
            <p className="mt-5 text-base font-medium tracking-wide text-amber-50/90">{payload.displayName}</p>
            <h2
              className="mt-4 px-2 text-[1.85rem] font-bold uppercase leading-[1.15] tracking-[0.06em] text-white"
              style={SOFT_WHITE_GLOW}
            >
              {payload.archetypeTitle}
            </h2>
            <p
              className="mt-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-amber-200/85"
              style={{ textShadow: palette.accentGlow }}
            >
              {payload.rarityLabel}
            </p>
          </div>

          <div className="flex flex-1 flex-col justify-center space-y-3 px-1 py-4">
            <p className="text-[14px] leading-[1.65] text-slate-100/95">{payload.hookLine}</p>
            {payload.subLine ? (
              <p className="text-[12px] leading-[1.6] text-slate-400/95 line-clamp-4">{payload.subLine}</p>
            ) : null}
            <p className="pt-1 text-[9px] uppercase tracking-[0.22em] text-slate-500/90">
              From {payload.highlightToolName} · 50+ traditions
            </p>
          </div>

          <div
            className="mx-auto w-full max-w-[340px] rounded-lg px-4 py-3"
            style={{
              background: palette.nameplateBg,
              border: palette.nameplateBorder,
              boxShadow: '0 0 20px rgba(251, 191, 36, 0.12), inset 0 1px 0 rgba(254, 243, 199, 0.12)',
            }}
          >
            <p className="text-xl font-semibold tracking-wide" style={GOLD_GLOW_TEXT}>
              futureseer.app
            </p>
            <p
              className="mt-1.5 text-[9px] uppercase tracking-[0.28em] text-amber-100/55"
              style={{ textShadow: '0 0 8px rgba(251, 191, 36, 0.25)' }}
            >
              One chart · Many paths · Ask the Seer
            </p>
          </div>
        </div>
      </div>
    );
  },
);
