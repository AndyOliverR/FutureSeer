'use client';

import Link from 'next/link';
import type { GrahaGuidance, PlanetaryAction } from '@/lib/vedic/planetaryGuidance';
import { buildVedicSeerHref } from '@/lib/vedic/planetaryGuidance';
import { useIsMobileLayout } from '@/hooks/useIsMobileLayout';

interface PlanetaryGuidancePanelProps {
  graha: GrahaGuidance;
}

function ActionBlock({
  heading,
  actions,
  isMobileLayout,
}: {
  heading: string;
  actions: PlanetaryAction[];
  isMobileLayout: boolean;
}) {
  if (actions.length === 0) return null;
  const headingClass = isMobileLayout
    ? 'text-sm font-semibold uppercase tracking-wide text-amber-400'
    : 'font-heading text-sm uppercase tracking-[0.18em] text-amber-300';
  const bodyClass = isMobileLayout ? 'text-sm text-surface-on-variant' : 'text-sm text-white/75';

  return (
    <div className="space-y-3">
      <h4 className={headingClass}>{heading}</h4>
      {actions.map((action) => (
        <div
          key={`${action.kind}-${action.title}`}
          className={
            isMobileLayout
              ? 'rounded-xl border border-outline-variant bg-surface-container p-3'
              : 'rounded-2xl border border-amber-500/20 bg-slate-950/30 p-4'
          }
        >
          <p className={isMobileLayout ? 'font-medium text-surface-on' : 'text-amber-100'}>{action.title}</p>
          {action.traditionLabel ? (
            <p className={isMobileLayout ? 'mt-1 text-xs text-surface-on-variant' : 'mt-1 text-xs uppercase tracking-wide text-amber-400/80'}>
              {action.traditionLabel}
            </p>
          ) : null}
          <p className={`mt-2 ${bodyClass}`}>{action.description}</p>
          {action.instructions && action.instructions.length > 0 ? (
            <ul className={`mt-2 list-disc space-y-1 pl-5 ${bodyClass}`}>
              {action.instructions.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ul>
          ) : null}
          {action.contraindications && action.contraindications.length > 0 ? (
            <p className={isMobileLayout ? 'mt-2 text-xs text-amber-700' : 'mt-2 text-xs text-amber-200/90'}>
              Caution: {action.contraindications.join(' ')}
            </p>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function PlanetaryGuidancePanel({ graha }: PlanetaryGuidancePanelProps) {
  const isMobileLayout = useIsMobileLayout();
  const { placement } = graha;
  const shell = isMobileLayout
    ? 'rounded-2xl border border-outline-variant bg-surface-container-high p-4 shadow-sm'
    : 'rounded-3xl border border-amber-500/30 bg-slate-900/40 p-6 backdrop-blur-sm';
  const titleClass = isMobileLayout
    ? 'text-xl font-semibold text-amber-400'
    : 'font-heading text-2xl uppercase tracking-[0.18em] text-amber-200';
  const muted = isMobileLayout ? 'text-sm text-surface-on-variant' : 'text-sm text-white/75';

  const placementBits = [
    placement.sign,
    placement.house != null ? `House ${placement.house}` : null,
    placement.dignity,
    placement.functionalRole?.replace('_', ' '),
    placement.isLagnesh ? 'Lagnesh' : null,
    placement.isDashaLord ? 'Dasha lord' : null,
  ].filter(Boolean);

  return (
    <article className={shell} data-testid="planetary-guidance-panel">
      <h3 className={titleClass}>{graha.planet}</h3>
      <p className={`mt-2 ${muted}`}>
        <span className={isMobileLayout ? 'font-medium text-surface-on' : 'text-amber-100'}>Your placement: </span>
        {placementBits.length > 0 ? placementBits.join(' · ') : 'Not recorded in the generated report. Conduct and traditional practices below do not invent a sign or house.'}
      </p>
      {placement.nakshatra ? <p className={`mt-1 ${muted}`}>Nakshatra: {placement.nakshatra}</p> : null}

      <div className="mt-5 space-y-6">
        <section>
          <h4 className={isMobileLayout ? 'text-sm font-semibold uppercase tracking-wide text-amber-400' : 'font-heading text-sm uppercase tracking-[0.18em] text-amber-300'}>
            What this planet wants
          </h4>
          <p className={`mt-2 ${muted}`}>{graha.wants}</p>
        </section>

        <section>
          <h4 className={isMobileLayout ? 'text-sm font-semibold uppercase tracking-wide text-amber-400' : 'font-heading text-sm uppercase tracking-[0.18em] text-amber-300'}>
            When it is ignored
          </h4>
          <p className={`mt-2 ${muted}`}>{graha.whenIgnored}</p>
        </section>

        <section>
          <h4 className={isMobileLayout ? 'text-sm font-semibold uppercase tracking-wide text-amber-400' : 'font-heading text-sm uppercase tracking-[0.18em] text-amber-300'}>
            What this planet is teaching
          </h4>
          <p className={`mt-2 ${muted}`}>{graha.teaching}</p>
          {graha.evidence.length > 0 ? (
            <ul className={`mt-2 list-disc space-y-1 pl-5 ${muted}`}>
              {graha.evidence.map((item) => (
                <li key={item.code}>{item.reason}</li>
              ))}
            </ul>
          ) : null}
        </section>

        <ActionBlock heading="Start here" actions={graha.startHere} isMobileLayout={isMobileLayout} />
        <ActionBlock heading="Deepen the practice" actions={graha.deepenPractice} isMobileLayout={isMobileLayout} />
        <ActionBlock heading="Traditional upayas" actions={graha.traditionalUpayas} isMobileLayout={isMobileLayout} />
        {graha.gemstoneGuidance ? (
          <ActionBlock heading="Gemstone guidance" actions={[graha.gemstoneGuidance]} isMobileLayout={isMobileLayout} />
        ) : null}

        <Link
          href={buildVedicSeerHref(graha.planet)}
          className={
            isMobileLayout
              ? 'inline-flex h-12 w-full items-center justify-center rounded-xl bg-primary text-sm font-medium text-primary-foreground'
              : 'inline-flex items-center justify-center rounded-full border border-amber-400/60 bg-amber-500/20 px-5 py-3 font-heading text-sm uppercase tracking-[0.16em] text-amber-100 hover:bg-amber-500/30'
          }
        >
          Ask the Vedic Seer about {graha.planet}
        </Link>
      </div>
    </article>
  );
}
