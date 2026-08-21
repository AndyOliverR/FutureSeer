'use client';

import type { GrahaName, PlanetaryGuidance } from '@/lib/vedic/planetaryGuidance';
import { useIsMobileLayout } from '@/hooks/useIsMobileLayout';

interface PlanetaryGuidanceSummaryProps {
  guidance: PlanetaryGuidance;
  selectedPlanet: GrahaName;
  onSelectPlanet: (planet: GrahaName) => void;
}

export function PlanetaryGuidanceSummary({
  guidance,
  selectedPlanet,
  onSelectPlanet,
}: PlanetaryGuidanceSummaryProps) {
  const isMobileLayout = useIsMobileLayout();
  const top = guidance.topPlanets;
  const cardClass = isMobileLayout
    ? 'rounded-2xl border border-outline-variant bg-surface-container-high p-4 shadow-sm'
    : 'rounded-3xl border border-amber-500/30 bg-slate-900/40 p-6 backdrop-blur-sm';
  const titleClass = isMobileLayout
    ? 'text-lg font-semibold text-amber-400'
    : 'font-heading text-xl uppercase tracking-[0.2em] text-amber-300';

  return (
    <section className={cardClass} data-testid="planetary-guidance-summary">
      <h2 className={titleClass}>Work With Your Planets</h2>
      <p className={isMobileLayout ? 'mt-2 text-sm text-surface-on-variant' : 'mt-3 text-sm text-white/75'}>
        Sidereal Vedic guidance from your generated chart
        {guidance.lagnaSign ? ` (Lagna ${guidance.lagnaSign})` : ''}.
        {guidance.currentDashaPlanet ? ` Current dasha: ${guidance.currentDashaPlanet}.` : ''}
        {' '}This is traditional Jyotish support, not a scientific or guaranteed outcome.
      </p>
      {top.length > 0 ? (
        <ul className="mt-4 space-y-3">
          {top.map((planet) => {
            const graha = guidance.grahas[planet];
            return (
              <li key={planet}>
                <button
                  type="button"
                  onClick={() => onSelectPlanet(planet)}
                  className={
                    selectedPlanet === planet
                      ? isMobileLayout
                        ? 'w-full rounded-xl bg-primary px-3 py-3 text-left text-primary-foreground'
                        : 'w-full rounded-2xl border border-amber-400/80 bg-amber-500/15 px-4 py-3 text-left'
                      : isMobileLayout
                        ? 'w-full rounded-xl bg-surface-container px-3 py-3 text-left text-surface-on'
                        : 'w-full rounded-2xl border border-amber-500/20 bg-slate-950/40 px-4 py-3 text-left hover:border-amber-400/50'
                  }
                >
                  <span className={isMobileLayout ? 'font-medium' : 'font-heading tracking-wide text-amber-200'}>
                    {planet}
                  </span>
                  <span className={isMobileLayout ? 'mt-1 block text-sm opacity-80' : 'mt-1 block text-sm text-white/70'}>
                    {graha.evidence[0]?.reason ?? graha.teaching}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className={isMobileLayout ? 'mt-3 text-sm text-surface-on-variant' : 'mt-3 text-sm text-white/70'}>
          No planet is singled out from explicit chart evidence. Explore each graha below for conduct and traditional practice.
        </p>
      )}
    </section>
  );
}
