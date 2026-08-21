'use client';

import { useMemo, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { useIsMobileLayout } from '@/hooks/useIsMobileLayout';
import { useToolReport } from '@/hooks/useComprehensiveMysticalProfile';
import { Material3LoadingSpinner } from '@/components/angel-numbers/Material3LoadingSpinner';
import {
  GRAHA_NAMES,
  buildPlanetaryGuidance,
  parseGrahaName,
  resolveGuidanceViewState,
  type GrahaName,
  type GuidanceViewState,
  type PlanetaryGuidance,
} from '@/lib/vedic/planetaryGuidance';
import { PlanetaryGuidanceSummary } from '@/components/remedies/PlanetaryGuidanceSummary';
import { PlanetaryGuidancePanel } from '@/components/remedies/PlanetaryGuidancePanel';

export interface PlanetaryGuidanceViewProps {
  viewState: GuidanceViewState;
  guidance: PlanetaryGuidance;
  selectedPlanet: GrahaName;
  onSelectPlanet: (planet: GrahaName) => void;
  isMobileLayout: boolean;
}

function FallbackCard({
  title,
  children,
  isMobileLayout,
}: {
  title: string;
  children: ReactNode;
  isMobileLayout: boolean;
}) {
  return (
    <div
      data-testid="planetary-guidance-fallback"
      className={
        isMobileLayout
          ? 'rounded-2xl border border-outline-variant bg-surface-container-high p-4 shadow-sm'
          : 'rounded-3xl border border-amber-500/30 bg-slate-900/40 p-6 backdrop-blur-sm'
      }
    >
      <h2 className={isMobileLayout ? 'text-lg font-semibold text-amber-400' : 'font-heading text-xl uppercase tracking-[0.2em] text-amber-300'}>
        {title}
      </h2>
      <div className={isMobileLayout ? 'mt-2 text-sm text-surface-on-variant' : 'mt-3 text-sm text-white/75'}>{children}</div>
    </div>
  );
}

export function PlanetaryGuidanceView({
  viewState,
  guidance,
  selectedPlanet,
  onSelectPlanet,
  isMobileLayout,
}: PlanetaryGuidanceViewProps) {
  if (viewState === 'loading') {
    return (
      <div data-testid="planetary-guidance-loading" className="flex flex-col items-center gap-3 py-10">
        {isMobileLayout ? <Material3LoadingSpinner size={48} /> : <div className="h-10 w-10 animate-spin rounded-full border-2 border-amber-400/30 border-t-amber-300" />}
        <p className={isMobileLayout ? 'text-sm text-surface-on-variant' : 'text-sm text-white/70'}>Loading your planetary guidance…</p>
      </div>
    );
  }

  if (viewState === 'signed_out') {
    return (
      <FallbackCard title="Work With Your Planets" isMobileLayout={isMobileLayout}>
        <p>Sign in to see chart-grounded Navagraha guidance. The Remedy Library stays available without an account.</p>
        <Link
          href="/signin"
          className={
            isMobileLayout
              ? 'mt-4 inline-flex h-12 items-center justify-center rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground'
              : 'mt-4 inline-flex rounded-full border border-amber-400/60 bg-amber-500/20 px-5 py-3 font-heading text-sm uppercase tracking-[0.16em] text-amber-100'
          }
        >
          Sign in
        </Link>
      </FallbackCard>
    );
  }

  if (viewState === 'no_profile') {
    return (
      <FallbackCard title="Generate your mystical profile" isMobileLayout={isMobileLayout}>
        <p>
          Personalized planetary guidance uses your generated Vedic report. Complete your birth details and generate the full
          mystical profile first.
        </p>
        <Link
          href="/profile"
          className={
            isMobileLayout
              ? 'mt-4 inline-flex h-12 items-center justify-center rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground'
              : 'mt-4 inline-flex rounded-full border border-amber-400/60 bg-amber-500/20 px-5 py-3 font-heading text-sm uppercase tracking-[0.16em] text-amber-100'
          }
        >
          Open profile
        </Link>
      </FallbackCard>
    );
  }

  const selected = guidance.grahas[selectedPlanet];

  return (
    <div className="space-y-6" data-testid="planetary-guidance-personalized">
      {viewState === 'partial' ? (
        <p
          data-testid="planetary-guidance-partial"
          className={
            isMobileLayout
              ? 'rounded-xl border border-outline-variant bg-surface-container px-3 py-2 text-sm text-surface-on-variant'
              : 'rounded-2xl border border-amber-500/20 bg-slate-950/40 px-4 py-3 text-sm text-amber-100/80'
          }
        >
          Showing what your generated reports already contain.
          {!guidance.hasNavaratna
            ? ' Gemstone advice appears only after a Navaratna report — we will not infer a stone from generic planet lists.'
            : ' Some placement fields are missing, so those facts are left blank rather than guessed.'}
        </p>
      ) : null}

      <PlanetaryGuidanceSummary
        guidance={guidance}
        selectedPlanet={selectedPlanet}
        onSelectPlanet={onSelectPlanet}
      />

      <div className={isMobileLayout ? 'flex gap-2 overflow-x-auto pb-1' : 'flex flex-wrap gap-2'} role="tablist" aria-label="Nine grahas">
        {GRAHA_NAMES.map((planet) => {
          const active = planet === selectedPlanet;
          return (
            <button
              key={planet}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onSelectPlanet(planet)}
              className={
                isMobileLayout
                  ? active
                    ? 'shrink-0 rounded-full bg-primary px-3 py-2 text-sm font-medium text-primary-foreground'
                    : 'shrink-0 rounded-full bg-surface-container-high px-3 py-2 text-sm text-surface-on'
                  : active
                    ? 'rounded-full border border-amber-300 bg-amber-400/20 px-4 py-2 font-heading text-xs uppercase tracking-[0.16em] text-amber-100'
                    : 'rounded-full border border-amber-500/25 bg-slate-950/30 px-4 py-2 font-heading text-xs uppercase tracking-[0.16em] text-white/70 hover:border-amber-400/50'
              }
            >
              {planet}
            </button>
          );
        })}
      </div>

      <PlanetaryGuidancePanel graha={selected} />
    </div>
  );
}

export function PlanetaryGuidanceExperience() {
  const isMobileLayout = useIsMobileLayout();
  const { user, loading: authLoading } = useAuth();
  const vedic = useToolReport('vedic');
  const navaratna = useToolReport('navaratna');
  const [selectedPlanet, setSelectedPlanet] = useState<GrahaName>('Sun');

  const guidance = useMemo(
    () => buildPlanetaryGuidance(vedic.report, navaratna.report),
    [vedic.report, navaratna.report],
  );

  const viewState = resolveGuidanceViewState({
    authLoading,
    reportsLoading: vedic.loading || navaratna.loading,
    signedIn: Boolean(user),
    hasVedicReport: vedic.hasReport,
    hasNavaratnaReport: navaratna.hasReport,
    hasChartFacts: guidance.hasVedicChart,
  });

  const safeSelected = parseGrahaName(selectedPlanet) ?? 'Sun';

  return (
    <PlanetaryGuidanceView
      viewState={viewState}
      guidance={guidance}
      selectedPlanet={safeSelected}
      onSelectPlanet={setSelectedPlanet}
      isMobileLayout={isMobileLayout}
    />
  );
}
