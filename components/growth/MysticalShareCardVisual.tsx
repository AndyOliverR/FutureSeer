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
  textShadow: '0 1px 3px rgba(0, 0, 0, 0.45)',
} as const;

const BODY_TEXT = {
  color: '#f1f5f9',
  textShadow: '0 1px 2px rgba(0, 0, 0, 0.35)',
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

        <div className="relative z-10 flex h-full flex-col px-7 pt-7 pb-7">
          <p
            className="font-light tracking-[0.06em]"
            style={{ ...SHINY_GOLD_TEXT, fontSize: 22, lineHeight: 1.2 }}
          >
            {theme.topMark}
          </p>

          <div>
            <p
              className="mt-3 font-semibold uppercase text-amber-100/90"
              style={{ ...SHINY_GOLD_TEXT, fontSize: 14, letterSpacing: '0.28em', lineHeight: 1.35 }}
            >
              My mystical profile
            </p>
            <p
              className="mt-4 font-semibold tracking-wide text-amber-50"
              style={{ fontSize: 22, lineHeight: 1.25, ...BODY_TEXT }}
            >
              {payload.displayName}
            </p>
            <h2
              className="mt-3 px-1 font-bold uppercase"
              style={{
                ...TITLE_TEXT,
                fontSize: 42,
                lineHeight: 1.1,
                letterSpacing: '0.04em',
              }}
            >
              {payload.archetypeTitle}
            </h2>
            <p
              className="mt-2.5 font-bold uppercase text-amber-100"
              style={{ ...SHINY_GOLD_TEXT, fontSize: 15, letterSpacing: '0.22em', lineHeight: 1.3 }}
            >
              {payload.rarityLabel}
            </p>
          </div>

          <div className="flex flex-1 flex-col justify-center gap-3 px-0.5 py-3">
            <p style={{ ...BODY_TEXT, fontSize: 20, lineHeight: 1.5, fontWeight: 500 }}>
              {payload.hookLine}
            </p>
            {payload.subLine ? (
              <p
                className="line-clamp-4"
                style={{ ...BODY_TEXT, fontSize: 18, lineHeight: 1.48, color: '#e2e8f0' }}
              >
                {payload.subLine}
              </p>
            ) : null}
            <p
              className="pt-0.5 uppercase text-slate-300/90"
              style={{ fontSize: 13, letterSpacing: '0.14em', lineHeight: 1.35 }}
            >
              From {payload.highlightToolName} · 50+ traditions
            </p>
          </div>

          <div
            className="mx-auto w-full max-w-[360px] rounded-lg px-5 py-3.5"
            style={{
              background: palette.nameplateBg,
              border: palette.nameplateBorder,
              boxShadow: 'inset 0 1px 0 rgba(254, 243, 199, 0.12)',
            }}
          >
            <p
              className="font-semibold tracking-wide"
              style={{ ...SHINY_GOLD_TEXT, fontSize: 32, lineHeight: 1.15 }}
            >
              futureseer.app
            </p>
            <p className="mt-2.5 leading-snug">
              <span
                className="block uppercase text-amber-100/80"
                style={{ fontSize: 13, letterSpacing: '0.18em' }}
              >
                One chart · Many paths
              </span>
              <span
                className="mt-1 block font-bold uppercase"
                style={{ ...SHINY_GOLD_TEXT, fontSize: 15, letterSpacing: '0.2em' }}
              >
                ASK THE
              </span>
              <span
                className="block font-bold uppercase"
                style={{ ...SHINY_GOLD_TEXT, fontSize: 15, letterSpacing: '0.2em' }}
              >
                SEER
              </span>
            </p>
          </div>
        </div>
      </div>
    );
  },
);
