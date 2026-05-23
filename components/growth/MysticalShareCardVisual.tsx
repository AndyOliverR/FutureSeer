'use client';

import { forwardRef } from 'react';
import type { MysticalSharePayload } from '@/lib/growth/mysticalShareCard';

export const MYSTICAL_SHARE_CARD_EXPORT_WIDTH = 540;
export const MYSTICAL_SHARE_CARD_EXPORT_HEIGHT = 540;

interface MysticalShareCardVisualProps {
  payload: MysticalSharePayload;
}

/**
 * Fixed-size card for html-to-image export (Instagram / WhatsApp / stories).
 * Always dark cosmic branding so exports match FutureSeer identity.
 */
export const MysticalShareCardVisual = forwardRef<HTMLDivElement, MysticalShareCardVisualProps>(
  function MysticalShareCardVisual({ payload }, ref) {
    return (
      <div
        ref={ref}
        className="relative overflow-hidden text-center"
        style={{
          width: MYSTICAL_SHARE_CARD_EXPORT_WIDTH,
          height: MYSTICAL_SHARE_CARD_EXPORT_HEIGHT,
          fontFamily: 'Georgia, "Times New Roman", serif',
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(251, 191, 36, 0.22) 0%, transparent 55%), radial-gradient(ellipse 70% 50% at 50% 100%, rgba(99, 102, 241, 0.2) 0%, transparent 50%), linear-gradient(165deg, #020617 0%, #0f172a 42%, #1e1b4b 100%)',
          }}
        />
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 30%, rgba(251,191,36,0.15) 0%, transparent 40%), radial-gradient(circle at 80% 70%, rgba(148,163,184,0.12) 0%, transparent 35%)',
          }}
        />

        <div className="relative z-10 flex h-full flex-col justify-between px-8 py-10">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-amber-200/80">
              My mystical profile
            </p>
            <p className="mt-6 text-lg font-medium text-amber-100/90">{payload.displayName}</p>
            <h2
              className="mt-3 text-[2rem] font-bold leading-tight text-white"
              style={{ textShadow: '0 0 24px rgba(251, 191, 36, 0.35)' }}
            >
              {payload.archetypeTitle}
            </h2>
            <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-amber-400/90">
              {payload.rarityLabel}
            </p>
          </div>

          <div className="space-y-3 px-1">
            <p className="text-[15px] leading-relaxed text-slate-200">{payload.hookLine}</p>
            {payload.subLine ? (
              <p className="text-[13px] leading-relaxed text-slate-400 line-clamp-3">{payload.subLine}</p>
            ) : null}
            <p className="text-[10px] uppercase tracking-wider text-slate-500">
              From {payload.highlightToolName} · 50+ traditions on FutureSeer
            </p>
          </div>

          <div className="pt-2">
            <p
              className="text-2xl font-bold tracking-wide"
              style={{
                background: 'linear-gradient(180deg, #fef3c7 0%, #fbbf24 35%, #d97706 70%, #fcd34d 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(0 0 12px rgba(251, 191, 36, 0.75)) drop-shadow(0 0 28px rgba(251, 191, 36, 0.45))',
              }}
            >
              futureseer.app
            </p>
            <p className="mt-2 text-[10px] uppercase tracking-[0.25em] text-amber-200/60">
              One chart · Many paths · Ask the Seer
            </p>
          </div>
        </div>
      </div>
    );
  },
);
