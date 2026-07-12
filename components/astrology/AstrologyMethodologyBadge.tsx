'use client';

import { useIsMobileLayout } from '@/hooks/useIsMobileLayout';
import { cn } from '@/lib/utils';

export type AstrologyMethodologyVariant = 'vedic' | 'western' | 'kp';

const METHODOLOGY: Record<
  AstrologyMethodologyVariant,
  { zodiac: string; houses: string; engine?: string }
> = {
  vedic: {
    zodiac: 'Sidereal (Lahiri ayanamsha)',
    houses: 'Whole sign houses',
    engine: 'Astronomia + Lahiri',
  },
  western: {
    zodiac: 'Tropical zodiac',
    houses: 'Placidus houses',
    engine: 'Tropical ephemeris',
  },
  kp: {
    zodiac: 'Sidereal (Lahiri ayanamsha)',
    houses: 'KP cusps & sub-lords',
    engine: 'Krishnamurti Paddhati',
  },
};

type Props = {
  variant: AstrologyMethodologyVariant;
  className?: string;
};

/**
 * P2-1 lite: surfaces calculation tradition on chart tools (accuracy / trust signal).
 */
export function AstrologyMethodologyBadge({ variant, className }: Props) {
  const isMobile = useIsMobileLayout();
  const meta = METHODOLOGY[variant];
  const label = `${meta.zodiac} · ${meta.houses}`;

  if (isMobile) {
    return (
      <p
        className={cn(
          'mb-4 rounded-lg border border-outline-variant bg-surface-container-high px-3 py-2 text-xs text-on-surface-variant',
          className,
        )}
        title={meta.engine}
      >
        <span className="font-medium text-on-surface">Methodology:</span> {label}
      </p>
    );
  }

  return (
    <p
      className={cn(
        'mb-6 mx-auto max-w-2xl text-center text-xs text-slate-400 border border-amber-500/15 rounded-lg bg-slate-900/40 px-4 py-2',
        className,
      )}
      title={meta.engine}
    >
      <span className="text-amber-200/90 font-medium tracking-wide uppercase text-[10px] mr-2">
        Methodology
      </span>
      {label}
    </p>
  );
}
