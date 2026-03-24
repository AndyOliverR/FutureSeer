'use client';

import { Suspense, useState, useMemo, useEffect, useLayoutEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { useToolReport } from '@/hooks/useComprehensiveMysticalProfile';
import { ToolReportGuard } from '@/components/ToolReportGuard';
import { ToolReportViralShell } from '@/components/report-viral/ToolReportViralShell';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToolIntroductionTab } from '@/components/ToolIntroductionTab';
import { DashboardSection } from '@/components/western/DashboardSection';
import MundaneSeerChatInterface from '@/components/MundaneSeerChatInterface';
import {
  Globe,
  AlertTriangle,
  Shield,
  Loader2,
  BookOpen,
  BarChart3,
} from 'lucide-react';

type TabValue = 'introduction' | 'report' | 'ask-the-seer';

function MundaneAstrologyPageContent() {
  const { user, userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<TabValue>('introduction');
  const {
    report: pipelineReport,
    loading: isLoading,
    error,
    hasReport,
    refreshProfile,
  } = useToolReport('mundaneAstrology');
  const [onDemandReport, setOnDemandReport] = useState<Record<string, unknown> | null>(null);
  const [onDemandLoading, setOnDemandLoading] = useState(false);
  const [onDemandError, setOnDemandError] = useState<string | null>(null);
  const onDemandFetchedRef = useRef(false);
  const refreshProfileRef = useRef(refreshProfile);
  useLayoutEffect(() => {
    refreshProfileRef.current = refreshProfile;
  }, [refreshProfile]);

  const hasCompleteDetails = useMemo(
    () => !!(userProfile?.birthDate && userProfile?.birthTime && userProfile?.birthPlace),
    [userProfile?.birthDate, userProfile?.birthTime, userProfile?.birthPlace]
  );

  const pipelineInner = useMemo(() => {
    if (pipelineReport == null || typeof pipelineReport !== 'object') return null;
    const raw = pipelineReport as Record<string, unknown>;
    if (raw.placeholder === true) return null;
    return (raw.comprehensiveAnalysis as Record<string, unknown>) ?? raw;
  }, [pipelineReport]);

  const hasCompletePipelineReport = useMemo(
    () => !!(pipelineInner && (pipelineInner as Record<string, unknown>).sections),
    [pipelineInner]
  );

  useEffect(() => {
    if (!user?.uid || !userProfile || !hasCompleteDetails || hasCompletePipelineReport || isLoading) return;
    if (onDemandFetchedRef.current || onDemandReport) return;
    if (onDemandLoading) return;

    let cancelled = false;
    const uid = user.uid;
    const profile = userProfile;
    const currentUser = user;

    setOnDemandError(null);
    setOnDemandLoading(true);
    onDemandFetchedRef.current = true;

    fetch('/api/mundane-astrology/comprehensive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: uid,
        userProfile: {
          birthDate: profile.birthDate,
          birthTime: profile.birthTime ?? '12:00:00',
          birthPlace: profile.birthPlace,
          birthLatitude: profile.birthLatitude ?? 0,
          birthLongitude: profile.birthLongitude ?? 0,
        },
      }),
    })
      .then((res) => res.json())
      .then(async (json) => {
        if (cancelled) return;
        const data = json?.data;
        const analysis = data?.comprehensiveAnalysis ?? data;
        const hasValidShape = analysis && typeof analysis === 'object' && (analysis as Record<string, unknown>).sections;
        if (hasValidShape) {
          const reportData = analysis as Record<string, unknown>;
          setOnDemandReport(reportData);
          setOnDemandError(null);
          try {
            const token = await currentUser.getIdToken();
            const saveRes = await fetch('/api/profile/save-tool-report', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ toolSlug: 'mundaneAstrology', data: { comprehensiveAnalysis: reportData } }),
            });
            if (saveRes.ok) refreshProfileRef.current?.();
          } catch {
            // Non-blocking
          }
        } else {
          setOnDemandError((json?.error as string) ?? 'Mundane astrology report unavailable');
          onDemandFetchedRef.current = false;
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setOnDemandError(err instanceof Error ? err.message : 'Failed to load mundane astrology report');
          onDemandFetchedRef.current = false;
        }
      })
      .finally(() => {
        if (!cancelled) setOnDemandLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user?.uid, userProfile, hasCompleteDetails, hasCompletePipelineReport, isLoading, onDemandLoading, onDemandReport]);

  const effectiveReport = useMemo(() => {
    if (onDemandReport) return { comprehensiveAnalysis: onDemandReport } as Record<string, unknown>;
    if (pipelineReport != null && typeof pipelineReport === 'object') return pipelineReport as Record<string, unknown>;
    return null;
  }, [onDemandReport, pipelineReport]);

  const comprehensiveReport = useMemo(() => {
    if (effectiveReport == null || typeof effectiveReport !== 'object') return null;
    const raw = effectiveReport as Record<string, unknown>;
    return (raw.comprehensiveAnalysis as Record<string, unknown>) ?? raw;
  }, [effectiveReport]);

  const effectiveLoading = !comprehensiveReport && (isLoading || onDemandLoading);
  const effectiveError = error ?? onDemandError;

  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const motionConfig = useMemo(
    () =>
      prefersReducedMotion ? {} : { duration: 0.3, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] },
    [prefersReducedMotion]
  );

  const tabsConfig: { value: TabValue; label: string }[] = [
    { value: 'introduction', label: 'Introduction' },
    { value: 'report', label: 'Your Report' },
    { value: 'ask-the-seer', label: 'Ask the Seer' },
  ];

  if (!hasCompleteDetails) {
    return (
      <div className="relative min-h-screen starfield-ultra-sharp">
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md glass-card border-white/10 rounded-xl text-white">
            <CardContent className="p-6 text-center text-white">
              <Globe className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">Profile Incomplete</h2>
              <p className="text-slate-200 mb-4">
                Complete your profile (birth date, time, and place) to unlock your Mundane Astrology report.
              </p>
              <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white">
                <Link href="/profile-setup">Complete Profile</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const report = comprehensiveReport as Record<string, unknown> | undefined;
  const reportSections = report?.sections && typeof report.sections === 'object' ? (report.sections as Record<string, unknown>) : null;
  const sections: Record<string, string> = reportSections
    ? {
        executiveOverview: String(reportSections.executiveOverview ?? ''),
        governmentStability: String(reportSections.governmentStability ?? ''),
        economicPressure: String(reportSections.economicPressure ?? ''),
        foreignRelationsAndConflictRisk: String(reportSections.foreignRelationsAndConflictRisk ?? ''),
        socialUnrestIndicators: String(reportSections.socialUnrestIndicators ?? ''),
        legislativeAndInstitutionalHealth: String(reportSections.legislativeAndInstitutionalHealth ?? ''),
        twelveMonthForecast: String(reportSections.twelveMonthForecast ?? ''),
        fiveYearStructuralOutlook: String(reportSections.fiveYearStructuralOutlook ?? ''),
      }
    : {
        executiveOverview: String(report?.executiveOverview ?? ''),
        governmentStability: String(report?.governmentStability ?? ''),
        economicPressure: String(report?.economicPressure ?? ''),
        foreignRelationsAndConflictRisk: String(report?.foreignRelationsAndConflictRisk ?? ''),
        socialUnrestIndicators: String(report?.socialUnrestIndicators ?? ''),
        legislativeAndInstitutionalHealth: String(report?.legislativeAndInstitutionalHealth ?? ''),
        twelveMonthForecast: String(report?.twelveMonthForecast ?? ''),
        fiveYearStructuralOutlook: String(report?.fiveYearStructuralOutlook ?? ''),
      };
  const riskBandsRaw = report?.riskBands ?? (report?.riskScores as Record<string, unknown>)?.bands;
  const riskBands = (riskBandsRaw && typeof riskBandsRaw === 'object' ? riskBandsRaw as Record<string, string> : undefined);
  const disclaimer = (report?.disclaimer as string) ?? '';
  const sectionFallback = 'This section was not generated. Regenerate your mystical profile from your Profile page to update it.';

  return (
    <ToolReportGuard loading={effectiveLoading} error={effectiveError ?? null} toolLabel="Mundane Astrology">
      <div className="starfield-ultra-sharp min-h-screen p-4 overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto py-8">
          <div className="text-center mb-8 pt-4">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-semibold mb-6">
              <span className="text-indigo-300">🌍</span>{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-purple-400 to-blue-600">
                Mundane Astrology
              </span>
            </h1>
            <p className="text-slate-200 leading-relaxed text-xl font-light">
              Political and national astrology — cyclical geopolitical modeling, not prediction
            </p>
          </div>

          <div className="rounded-2xl border border-purple-500/40 bg-slate-900/80 overflow-hidden shadow-[0_0_30px_rgba(139,92,246,0.15)]">
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as TabValue)}
              className="w-full min-w-0"
            >
              <TabsList className="flex w-full flex-nowrap overflow-x-auto gap-1 sm:gap-2 p-2 sm:p-3 bg-slate-800/50 border-b border-purple-500/25 rounded-none h-auto min-h-0 justify-start [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-purple-500/30">
                {tabsConfig.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="shrink-0 data-[state=active]:bg-gradient-to-br data-[state=active]:from-purple-100 data-[state=active]:to-pink-100 data-[state=active]:text-purple-900 data-[state=active]:shadow-md data-[state=active]:border-b-2 data-[state=active]:border-b-purple-400/80 rounded-t-lg px-4 py-2.5 text-sm font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 transition-all border border-transparent data-[state=inactive]:border-slate-600/50"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <AnimatePresence mode="wait">
                {activeTab === 'introduction' && (
                  <motion.div
                    key="introduction"
                    initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                    animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                    exit={prefersReducedMotion ? {} : { opacity: 0, y: -20 }}
                    transition={motionConfig}
                  >
                    <TabsContent value="introduction" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                      <ToolIntroductionTab toolSlug="mundane-astrology" />
                    </TabsContent>
                  </motion.div>
                )}

                {activeTab === 'report' && (
                  <motion.div
                    key="report"
                    initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                    animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                    exit={prefersReducedMotion ? {} : { opacity: 0, y: -20 }}
                    transition={motionConfig}
                  >
                    <TabsContent value="report" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0 bg-gradient-to-b from-purple-50/98 via-indigo-50/50 to-slate-100/98 min-h-[60vh] border-0">
                      {effectiveLoading ? (
                        <div className="text-center py-12">
                          <Loader2 className="w-12 h-12 text-purple-500 mx-auto mb-4 animate-spin" />
                          <p className="text-slate-600">Generating your Mundane Astrology report...</p>
                        </div>
                      ) : effectiveError ? (
                        <div className="text-center py-8">
                          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                          <p className="text-red-600 mb-4">{effectiveError}</p>
                          <Button
                            onClick={() => {
                              onDemandFetchedRef.current = false;
                              setOnDemandError(null);
                              setOnDemandReport(null);
                            }}
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                          >
                            Retry generating report
                          </Button>
                        </div>
                      ) : !hasReport && !onDemandReport ? (
                        <div className="text-center py-8">
                          <p className="text-slate-600 mb-4">
                            Generate your mystical profile to unlock your Mundane Astrology report.
                          </p>
                          <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white">
                            <Link href="/profile">Generate your mystical profile</Link>
                          </Button>
                        </div>
                      ) : report ? (
                        <ToolReportViralShell toolSlug="mundaneAstrology" reportForTeaser={pipelineReport ?? comprehensiveReport}>
                        <div className="space-y-6">
                          <DashboardSection
                            title="Disclaimer"
                            icon={<Shield className="w-6 h-6" />}
                            defaultExpanded={false}
                            colorScheme="purple"
                            storageKey="mundane-disclaimer"
                          >
                            <p className="text-slate-700 text-sm leading-relaxed">
                              {disclaimer ||
                                'This report is for reflection and cyclical context only. It is not deterministic prediction, political advice, or a substitute for professional analysis.'}
                            </p>
                          </DashboardSection>

                          <DashboardSection
                            title="Report scope"
                            icon={<Globe className="w-6 h-6" />}
                            defaultExpanded={false}
                            colorScheme="cyan"
                            storageKey="mundane-scope"
                          >
                            <p className="text-slate-700 text-sm">
                              {report.countryName ? (
                                <>{(report.countryName as string)} (capital: {String(report.capitalName ?? '—')}), year {String(report.year ?? '—')}.{report.ingressDatetime && <> Aries Ingress: {new Date(String(report.ingressDatetime)).toUTCString()}.</>}</>
                              ) : (
                                <>Scope not set. Regenerate your mystical profile from your Profile page to update.</>
                              )}
                            </p>
                          </DashboardSection>

                          <DashboardSection
                            title="Risk bands"
                            icon={<BarChart3 className="w-6 h-6" />}
                            defaultExpanded
                            colorScheme="blue"
                            storageKey="mundane-bands"
                          >
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-700 text-sm">
                              <div>
                                <p className="text-xs text-slate-500">Economic stress</p>
                                <p className="font-medium capitalize">{riskBands?.economic ?? '—'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500">Political stability</p>
                                <p className="font-medium capitalize">{riskBands?.political ?? '—'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500">Conflict risk</p>
                                <p className="font-medium capitalize">{riskBands?.conflict ?? '—'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500">Volatility score</p>
                                <p className="font-medium">{`${(report.riskScores as Record<string, unknown>)?.geopoliticalVolatilityScore ?? '—'}/100`}</p>
                              </div>
                            </div>
                          </DashboardSection>

                          <DashboardSection
                            title="Executive national climate overview"
                            icon={<BookOpen className="w-6 h-6" />}
                            defaultExpanded
                            colorScheme="purple"
                            storageKey="mundane-exec"
                          >
                            <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
                              {sections.executiveOverview?.trim() || sectionFallback}
                            </p>
                          </DashboardSection>
                          <DashboardSection
                            title="Government stability assessment"
                            icon={<Shield className="w-6 h-6" />}
                            defaultExpanded={false}
                            colorScheme="pink"
                            storageKey="mundane-gov"
                          >
                            <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
                              {sections.governmentStability?.trim() || sectionFallback}
                            </p>
                          </DashboardSection>
                          <DashboardSection
                            title="Economic pressure outlook"
                            icon={<BarChart3 className="w-6 h-6" />}
                            defaultExpanded={false}
                            colorScheme="blue"
                            storageKey="mundane-econ"
                          >
                            <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
                              {sections.economicPressure?.trim() || sectionFallback}
                            </p>
                          </DashboardSection>
                          <DashboardSection
                            title="Foreign relations & conflict risk"
                            icon={<Globe className="w-6 h-6" />}
                            defaultExpanded={false}
                            colorScheme="cyan"
                            storageKey="mundane-foreign"
                          >
                            <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
                              {sections.foreignRelationsAndConflictRisk?.trim() || sectionFallback}
                            </p>
                          </DashboardSection>
                          <DashboardSection
                            title="Social unrest indicators"
                            icon={<AlertTriangle className="w-6 h-6" />}
                            defaultExpanded={false}
                            colorScheme="orange"
                            storageKey="mundane-social"
                          >
                            <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
                              {sections.socialUnrestIndicators?.trim() || sectionFallback}
                            </p>
                          </DashboardSection>
                          <DashboardSection
                            title="Legislative & institutional health"
                            icon={<BookOpen className="w-6 h-6" />}
                            defaultExpanded={false}
                            colorScheme="green"
                            storageKey="mundane-leg"
                          >
                            <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
                              {sections.legislativeAndInstitutionalHealth?.trim() || sectionFallback}
                            </p>
                          </DashboardSection>
                          <DashboardSection
                            title="12‑month forecast window"
                            icon={<BarChart3 className="w-6 h-6" />}
                            defaultExpanded={false}
                            colorScheme="purple"
                            storageKey="mundane-12m"
                          >
                            <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
                              {sections.twelveMonthForecast?.trim() || sectionFallback}
                            </p>
                          </DashboardSection>
                          <DashboardSection
                            title="5‑year structural shift outlook"
                            icon={<Globe className="w-6 h-6" />}
                            defaultExpanded={false}
                            colorScheme="blue"
                            storageKey="mundane-5y"
                          >
                            <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
                              {sections.fiveYearStructuralOutlook?.trim() || sectionFallback}
                            </p>
                          </DashboardSection>
                        </div>
                        </ToolReportViralShell>
                      ) : null}
                    </TabsContent>
                  </motion.div>
                )}

                {activeTab === 'ask-the-seer' && (
                  <motion.div
                    key="ask-the-seer"
                    initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                    animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                    exit={prefersReducedMotion ? {} : { opacity: 0, y: -20 }}
                    transition={motionConfig}
                  >
                    <TabsContent value="ask-the-seer" className="pt-6 px-4 sm:px-6 pb-6 mt-0">
                      {user?.uid ? (
                        <MundaneSeerChatInterface
                          userId={user.uid}
                          mundaneReport={comprehensiveReport as Record<string, unknown> | null}
                        />
                      ) : (
                        <div className="rounded-xl border border-purple-500/40 bg-slate-900/60 p-6 text-center">
                          <p className="text-slate-300 mb-4">Sign in to use Ask the Seer for Mundane Astrology.</p>
                          <Button asChild variant="outline" className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10">
                            <Link href="/signin">Sign in</Link>
                          </Button>
                        </div>
                      )}
                    </TabsContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Tabs>
          </div>
        </div>
      </div>
    </ToolReportGuard>
  );
}

export default function MundaneAstrologyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen starfield-ultra-sharp flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-purple-400 animate-spin" />
        </div>
      }
    >
      <MundaneAstrologyPageContent />
    </Suspense>
  );
}
