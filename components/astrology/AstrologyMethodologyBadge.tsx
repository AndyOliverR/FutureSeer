'use client';

import { useIsMobileLayout } from '@/hooks/useIsMobileLayout';
import { cn } from '@/lib/utils';

export type AstrologyMethodologyVariant =
  | 'vedic'
  | 'western'
  | 'kp'
  | 'hellenistic'
  | 'synastry'
  | 'financial'
  | 'advanced-educational';

export type MethodologyTier = 'computed' | 'ai-narrative' | 'educational';

const METHODOLOGY: Record<
  AstrologyMethodologyVariant,
  { zodiac: string; houses: string; engine?: string; tier: MethodologyTier }
> = {
  vedic: {
    zodiac: 'Sidereal (Lahiri ayanamsha)',
    houses: 'Whole sign houses',
    engine: 'Astronomia + Lahiri',
    tier: 'computed',
  },
  western: {
    zodiac: 'Tropical zodiac',
    houses: 'Placidus houses',
    engine: 'Astronomia tropical (Swiss WASM planets in prod where available)',
    tier: 'computed',
  },
  kp: {
    zodiac: 'Sidereal (KP ayanamsha)',
    houses: 'KP cusps & sub-lords',
    engine: 'Krishnamurti Paddhati · getChart',
    tier: 'computed',
  },
  hellenistic: {
    zodiac: 'Tropical zodiac',
    houses: 'Whole sign (Hellenistic tradition)',
    engine: 'Tropical ephemeris',
    tier: 'computed',
  },
  synastry: {
    zodiac: 'Tropical zodiac',
    houses: 'Placidus · dual charts',
    engine: 'Aspect-based synastry',
    tier: 'computed',
  },
  financial: {
    zodiac: 'Tropical natal + market overlay',
    houses: 'Wealth houses 2/5/8/10/11',
    engine: 'Natal wealth engine + Yahoo Finance prices',
    tier: 'ai-narrative',
  },
  'advanced-educational': {
    zodiac: 'Varies by technique',
    houses: 'Not computed live',
    engine: 'Reference material only',
    tier: 'educational',
  },
};

const TIER_LABEL: Record<MethodologyTier, string> = {
  computed: 'Computed chart data',
  'ai-narrative': 'AI interpretation (chart-grounded)',
  educational: 'Educational — no live chart',
};

type Props = {
  variant: AstrologyMethodologyVariant;
  tier?: MethodologyTier;
  className?: string;
};

/**
 * Surfaces calculation tradition and data tier on chart tools (trust / accuracy signal).
 */
export function AstrologyMethodologyBadge({ variant, tier, className }: Props) {
  const isMobile = useIsMobileLayout();
  const meta = METHODOLOGY[variant];
  const effectiveTier = tier ?? meta.tier;
  const label = `${meta.zodiac} · ${meta.houses}`;
  const title = [meta.engine, TIER_LABEL[effectiveTier]].filter(Boolean).join(' · ');

  const tierClass =
    effectiveTier === 'computed'
      ? 'text-emerald-300/90'
      : effectiveTier === 'ai-narrative'
        ? 'text-amber-200/90'
        : 'text-slate-400';

  if (isMobile) {
    return (
      <p
        className={cn(
          'mb-4 rounded-lg border border-outline-variant bg-surface-container-high px-3 py-2 text-xs text-on-surface-variant',
          className,
        )}
        title={title}
      >
        <span className="font-medium text-on-surface">Methodology:</span> {label}
        <span className={cn('block mt-1 text-[10px] uppercase tracking-wide', tierClass)}>
          {TIER_LABEL[effectiveTier]}
        </span>
      </p>
    );
  }

  return (
    <p
      className={cn(
        'mb-6 mx-auto max-w-2xl text-center text-xs text-slate-400 border border-amber-500/15 rounded-lg bg-slate-900/40 px-4 py-2',
        className,
      )}
      title={title}
    >
      <span className="text-amber-200/90 font-medium tracking-wide uppercase text-[10px] mr-2">
        Methodology
      </span>
      {label}
      <span className={cn('block mt-1 text-[10px] uppercase tracking-wide', tierClass)}>
        {TIER_LABEL[effectiveTier]}
      </span>
    </p>
  );
}
