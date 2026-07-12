'use client';

import Link from 'next/link';
import { Compass, Radar } from 'lucide-react';
import type { StrategicReadData } from '@/lib/strategicRead';
import { useIsMobileLayout } from '@/hooks/useIsMobileLayout';
import { cn } from '@/lib/utils';

const BAND_STYLES = {
  observe: {
    m3: 'bg-[var(--m3-error-container)] text-[var(--m3-on-error-container)]',
    web: 'bg-red-950/40 text-red-200 border-red-500/30',
  },
  neutral: {
    m3: 'bg-[var(--m3-tertiary-container)] text-[var(--m3-on-tertiary-container)]',
    web: 'bg-amber-950/40 text-amber-100 border-amber-500/30',
  },
  favorable: {
    m3: 'bg-[var(--m3-primary-container)] text-[var(--m3-on-primary-container)]',
    web: 'bg-emerald-950/40 text-emerald-100 border-emerald-500/30',
  },
} as const;

export function StrategicReadCard({
  data,
  className,
}: {
  data: StrategicReadData;
  className?: string;
}) {
  const isMobile = useIsMobileLayout();
  const bandStyle = BAND_STYLES[data.actionBand];

  if (isMobile) {
    return (
      <section
        className={cn(
          'rounded-2xl border border-[var(--m3-outline-variant)] bg-[var(--m3-surface-container-high)] p-5 m3-elevation-1',
          className,
        )}
        aria-labelledby="strategic-read-heading"
      >
        <div className="flex items-start gap-3 mb-4">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--m3-secondary-container)] text-[var(--m3-on-secondary-container)]"
            aria-hidden
          >
            <Compass className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="m3-label-small uppercase tracking-widest text-[var(--m3-primary)]">Strategic read</p>
            <h2 id="strategic-read-heading" className="m3-headline-small text-[var(--m3-on-surface)] normal-case tracking-normal">
              {data.headline}
            </h2>
          </div>
        </div>

        <div className="mb-4">
          <p className="m3-label-medium text-[var(--m3-on-surface-variant)] mb-2 flex items-center gap-1.5">
            <Radar className="h-4 w-4" aria-hidden />
            Signals
          </p>
          <ul className="space-y-2">
            {data.signals.map((s) => (
              <li key={s.id} className="rounded-xl bg-[var(--m3-surface-container)] px-3 py-2 border border-[var(--m3-outline-variant)]">
                <p className="m3-body-medium text-[var(--m3-on-surface)]">{s.label}</p>
                <p className="m3-label-small text-[var(--m3-on-surface-variant)]">{s.source}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-4">
          <p className="m3-title-small text-[var(--m3-on-surface)] mb-1">{data.patternTitle}</p>
          <p className="m3-body-medium text-[var(--m3-on-surface-variant)]">{data.patternSummary}</p>
        </div>

        <p className={cn('inline-flex rounded-full px-3 py-1 m3-label-medium mb-4', bandStyle.m3)}>
          {data.actionBandLabel}
        </p>

        <ol className="list-decimal pl-5 space-y-2 mb-5 m3-body-small text-[var(--m3-on-surface-variant)]">
          {data.scenarioPrompts.map((q) => (
            <li key={q}>{q}</li>
          ))}
        </ol>

        <Link
          href={data.ctaHref}
          className="inline-flex min-h-[44px] w-full items-center justify-center rounded-xl border border-[var(--m3-outline-variant)] bg-[var(--m3-surface-container)] px-4 py-3 m3-label-large text-[var(--m3-primary)]"
        >
          {data.ctaLabel}
        </Link>
      </section>
    );
  }

  return (
    <section
      className={cn(
        'rounded-2xl border border-amber-500/20 bg-slate-900/55 backdrop-blur-sm p-6 shadow-lg',
        className,
      )}
      aria-labelledby="strategic-read-heading-web"
    >
      <div className="flex items-start gap-4 mb-5">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-200" aria-hidden>
          <Compass className="h-7 w-7" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-amber-400/80">Strategic read</p>
          <h2 id="strategic-read-heading-web" className="font-heading text-2xl text-amber-100 normal-case tracking-wide">
            {data.headline}
          </h2>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-5">
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">Signals</p>
          <ul className="space-y-2">
            {data.signals.map((s) => (
              <li key={s.id} className="rounded-lg border border-slate-700/60 bg-slate-900/40 px-3 py-2">
                <p className="text-sm text-slate-200">{s.label}</p>
                <p className="text-xs text-slate-500">{s.source}</p>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">Pattern</p>
          <p className="text-lg font-serif text-amber-200 mb-2">{data.patternTitle}</p>
          <p className="text-slate-300 text-sm leading-relaxed mb-4">{data.patternSummary}</p>
          <p className={cn('inline-flex rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-wide', bandStyle.web)}>
            {data.actionBandLabel}
          </p>
        </div>
      </div>

      <div className="mb-5">
        <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">Foresight prompts</p>
        <ol className="list-decimal pl-5 space-y-2 text-sm text-slate-400">
          {data.scenarioPrompts.map((q) => (
            <li key={q}>{q}</li>
          ))}
        </ol>
      </div>

      <Link
        href={data.ctaHref}
        className="inline-flex items-center justify-center rounded-lg border border-amber-500/40 px-5 py-2.5 text-sm font-medium text-amber-200 hover:bg-amber-500/10 transition-colors"
      >
        {data.ctaLabel}
      </Link>
    </section>
  );
}
