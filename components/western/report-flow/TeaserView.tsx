'use client'

import type { WesternTeaserPayload } from '@/lib/western/buildWesternTeaser'

interface TeaserViewProps {
  teaser: WesternTeaserPayload
}

export function TeaserView({ teaser }: TeaserViewProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-amber-400/50 bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900 p-6 sm:p-8 shadow-xl">
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-amber-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-violet-500/15 blur-2xl" />

      <div className="relative z-10 flex flex-col gap-4 text-center sm:text-left">
        <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
          <span className="rounded-full border border-amber-400/60 bg-amber-500/15 px-3 py-1 text-xs font-bold uppercase tracking-widest text-amber-200">
            {teaser.rarityLabel}
          </span>
          <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-sm font-serif font-semibold text-white">
            {teaser.archetypeName}
          </span>
        </div>

        <h2 className="font-serif text-2xl font-bold leading-tight text-white sm:text-3xl md:text-4xl">
          {teaser.hookLine}
        </h2>

        <p className="text-base leading-relaxed text-slate-300 sm:text-lg">{teaser.subLine}</p>

        {teaser.patternName && (
          <p className="text-sm font-medium text-amber-200/90">
            Pattern spotlight: <span className="text-white">{teaser.patternName}</span>
          </p>
        )}
      </div>
    </div>
  )
}
