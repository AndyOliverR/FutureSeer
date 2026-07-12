import { cn } from '@/lib/utils'

/**
 * Adaptive surfaces: solid Material 3 on mobile layout, Devotionist glass on md+.
 * Use inside tool routes and shared guards (see DESIGN.md § dual design system).
 */
export const fsAdaptivePanel = cn(
  'rounded-xl border',
  'bg-[var(--m3-surface-container-high)] border-[var(--m3-outline-variant)]',
  'md:backdrop-blur-sm md:bg-slate-900/50 md:border-amber-500/30',
)

export const fsAdaptivePanelStrong = cn(
  'rounded-2xl border',
  'bg-[var(--m3-surface-container-high)] border-[var(--m3-outline-variant)] m3-elevation-1',
  'md:backdrop-blur-sm md:bg-slate-900/90 md:border-amber-500/30 md:shadow-xl',
)

export const fsAdaptiveCard = cn(
  'rounded-2xl border shadow-sm',
  'bg-[var(--m3-surface-container)] border-[var(--m3-outline-variant)]',
  'md:backdrop-blur-md md:bg-slate-800/20 md:border-slate-700/50 md:shadow-xl',
)

export const fsAdaptiveTabsList = cn(
  'rounded-2xl border p-1',
  'bg-[var(--m3-surface-container-low)] border-[var(--m3-outline-variant)]',
  'md:bg-slate-800/50 md:backdrop-blur-md md:border-slate-700/50',
)

export const fsAdaptiveInnerPanel = cn(
  'rounded-2xl border',
  'bg-[var(--m3-surface-container)] border-[var(--m3-outline-variant)]',
  'md:bg-slate-900/40 md:border-amber-500/20',
)

export const fsToolsDisclaimer = cn(
  'text-[11px] md:text-xs rounded-md px-3 py-2 border',
  'text-[var(--m3-on-surface-variant)] border-[var(--m3-outline-variant)] bg-[var(--m3-surface-container-low)]',
  'md:text-slate-300/80 md:border-amber-400/20 md:bg-slate-900/35',
)
