"use client";

import Link from "next/link";
import { Moon, Sparkles } from "lucide-react";
import type { DailyInsightCardData } from "@/lib/dailyInsightForHome";
import { useIsMobileLayout } from "@/hooks/useIsMobileLayout";
import { cn } from "@/lib/utils";

export interface DailyInsightCardProps {
  data: DailyInsightCardData;
  className?: string;
}

export function DailyInsightCard({ data, className }: DailyInsightCardProps) {
  const isMobile = useIsMobileLayout();

  if (isMobile) {
    return (
      <section
        className={cn(
          "rounded-2xl border border-[var(--m3-outline-variant)] bg-[var(--m3-surface-container-high)] p-5 m3-elevation-1",
          className,
        )}
        aria-labelledby="daily-insight-heading"
      >
        <div className="flex items-start gap-3 mb-4">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--m3-primary-container)] text-[var(--m3-on-primary-container)]"
            aria-hidden
          >
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="m3-label-small uppercase tracking-widest text-[var(--m3-primary)]">{data.accentLabel}</p>
            <h2 id="daily-insight-heading" className="m3-headline-small text-[var(--m3-on-surface)] normal-case tracking-normal">
              {data.headline}
            </h2>
          </div>
        </div>

        <p className="m3-body-large text-[var(--m3-on-surface-variant)] leading-relaxed mb-5">{data.summary}</p>

        <dl className="grid grid-cols-2 gap-3 mb-5">
          <div className="rounded-xl bg-[var(--m3-surface-container)] px-3 py-2.5 border border-[var(--m3-outline-variant)]">
            <dt className="m3-label-small text-[var(--m3-on-surface-variant)]">Lucky color</dt>
            <dd className="m3-title-small text-[var(--m3-on-surface)]">{data.luckyColor}</dd>
          </div>
          <div className="rounded-xl bg-[var(--m3-surface-container)] px-3 py-2.5 border border-[var(--m3-outline-variant)]">
            <dt className="m3-label-small text-[var(--m3-on-surface-variant)]">Lucky number</dt>
            <dd className="m3-title-small text-[var(--m3-on-surface)]">{data.luckyNumber}</dd>
          </div>
        </dl>

        {data.moonSign ? (
          <p className="flex items-center gap-2 m3-body-small text-[var(--m3-on-surface-variant)] mb-4">
            <Moon className="h-4 w-4 text-[var(--m3-primary)]" aria-hidden />
            Moon in {data.moonSign}
          </p>
        ) : null}

        <Link
          href={data.ctaHref}
          className="inline-flex min-h-[44px] w-full items-center justify-center rounded-xl bg-[var(--m3-primary)] px-4 py-3 m3-label-large text-[var(--m3-on-primary)] m3-elevation-1"
        >
          {data.ctaLabel}
        </Link>
      </section>
    );
  }

  return (
    <section
      className={cn(
        "rounded-2xl border border-amber-500/25 bg-slate-900/60 backdrop-blur-sm p-6 shadow-lg shadow-amber-500/5",
        className,
      )}
      aria-labelledby="daily-insight-heading-web"
    >
      <div className="flex items-start gap-4 mb-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-300" aria-hidden>
          <Sparkles className="h-7 w-7" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-amber-400/80">{data.accentLabel}</p>
          <h2 id="daily-insight-heading-web" className="font-heading text-2xl text-amber-100 normal-case tracking-wide">
            {data.headline}
          </h2>
        </div>
      </div>
      <p className="text-slate-300 leading-relaxed mb-5 max-w-2xl">{data.summary}</p>
      <div className="flex flex-wrap gap-4 text-sm text-slate-400 mb-5">
        <span>
          <span className="text-amber-400/90">Color:</span> {data.luckyColor}
        </span>
        <span>
          <span className="text-amber-400/90">Number:</span> {data.luckyNumber}
        </span>
        {data.moonSign ? (
          <span className="inline-flex items-center gap-1.5">
            <Moon className="h-4 w-4 text-amber-400" aria-hidden />
            Moon in {data.moonSign}
          </span>
        ) : null}
      </div>
      <Link
        href={data.ctaHref}
        className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-amber-500/40 bg-amber-500/10 px-6 py-2.5 text-sm font-medium text-amber-200 hover:bg-amber-500/20 transition-colors"
      >
        {data.ctaLabel}
      </Link>
    </section>
  );
}
