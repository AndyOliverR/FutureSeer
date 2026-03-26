'use client';

import { cn } from '@/lib/utils';

export type MysticalLoadingVariant = 'fullscreen' | 'card';

export interface MysticalLoadingStateProps {
  /** Primary line, e.g. "Loading Tarot…" or tool name */
  message: string;
  /** Optional second line; defaults on fullscreen only */
  subline?: string;
  variant?: MysticalLoadingVariant;
  className?: string;
}

/**
 * Branded loading UI (cosmic motif) for tool pages and in-card loaders.
 * Use for emotional consistency across waits—see docs/DESIGN_PRINCIPLES.md.
 */
export function MysticalLoadingState({
  message,
  subline,
  variant = 'card',
  className,
}: MysticalLoadingStateProps) {
  const defaultSub =
    variant === 'fullscreen' ? 'Aligning with your cosmic profile…' : undefined;
  const line2 = subline ?? defaultSub;

  const inner = (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 text-center',
        variant === 'card' && 'py-4',
        variant === 'fullscreen' && 'min-h-[16rem]',
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="relative" aria-hidden>
        <div className="absolute inset-0 scale-150 rounded-full bg-amber-400/25 blur-xl animate-pulse" />
        <div className="relative mx-auto h-12 w-12 rounded-full border-2 border-amber-400/40 border-t-amber-400 animate-spin" />
      </div>
      <div className="max-w-md px-2">
        <p className="font-medium tracking-wide text-amber-100/95">{message}</p>
        {line2 ? <p className="mt-1.5 text-sm text-slate-400">{line2}</p> : null}
      </div>
    </div>
  );

  if (variant === 'fullscreen') {
    return (
      <div className={cn('relative min-h-screen starfield-ultra-sharp', className)}>
        <div className="relative z-10 container mx-auto px-4 pt-4 pb-8">
          <div className="flex items-center justify-center">{inner}</div>
        </div>
      </div>
    );
  }

  return <div className={cn(className)}>{inner}</div>;
}
