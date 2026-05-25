'use client';

import type { UserProfile } from '@/lib/firebase';
import { cn } from '@/lib/utils';

/** Exact mnemonic display requested for palm scans. */
export const PALM_HAND_GUIDANCE_DISPLAY = '🫲🏻♂️-♀️🫱🏻';

interface PalmHandGuidanceHintProps {
  gender?: UserProfile['gender'];
  className?: string;
  /** Compact single line for tight layouts. */
  compact?: boolean;
}

export function PalmHandGuidanceHint({
  gender,
  className,
  compact = false,
}: PalmHandGuidanceHintProps) {
  const showBoth = !gender || gender === 'non-binary';
  const emphasizeMale = showBoth || gender === 'male';
  const emphasizeFemale = showBoth || gender === 'female';

  if (compact) {
    return (
      <p
        className={cn(
          'text-sm leading-snug text-center tracking-wide',
          className,
        )}
        role="note"
        aria-label="Palm scan guide: left palm for women, right palm for men"
      >
        <span
          className={cn(
            'font-medium',
            emphasizeMale ? 'text-amber-200' : 'text-slate-500',
          )}
          aria-hidden
        >
          {PALM_HAND_GUIDANCE_DISPLAY}
        </span>
      </p>
    );
  }

  return (
    <div
      className={cn(
        'rounded-xl border border-amber-500/25 bg-amber-950/20 px-3 py-3 text-center',
        className,
      )}
      role="note"
      aria-label="Which palm to photograph"
    >
      <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400/90 mb-2">
        Which palm to scan?
      </p>
      <p
        className="text-xl sm:text-2xl font-medium tracking-wide text-amber-100/95 mb-2"
        aria-hidden
      >
        {PALM_HAND_GUIDANCE_DISPLAY}
      </p>
      <p className="text-[10px] text-slate-400 leading-relaxed">
        <span className={emphasizeFemale ? 'text-amber-200/90' : ''}>Women · left palm</span>
        <span className="mx-1.5 opacity-40" aria-hidden>
          ·
        </span>
        <span className={emphasizeMale ? 'text-amber-200/90' : ''}>Men · right palm</span>
      </p>
      {showBoth ? (
        <p className="mt-2 text-[10px] text-slate-500">
          Set gender in your profile to highlight your hand when you upload.
        </p>
      ) : null}
    </div>
  );
}
