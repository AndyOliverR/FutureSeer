'use client';

import { Suspense, useState, useMemo, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
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
import type { AstroEvent } from '@/lib/financialAstrology/astroMarketCorrelation';
import { AstrologyMethodologyBadge } from '@/components/astrology/AstrologyMethodologyBadge';
import FinancialSeerChatInterface from '@/components/FinancialSeerChatInterface';
import { MarketOverviewCards } from '@/components/charts/MarketOverviewCards';
import { MarketTransitChart } from '@/components/charts/MarketTransitChart';
import { TemperamentGauge } from '@/components/charts/TemperamentGauge';
import { ClimateHeatmap } from '@/components/charts/ClimateHeatmap';
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Shield,
  BookOpen,
  FileText,
  Zap,
  Loader2,
  Globe,
  Star,
} from 'lucide-react';

type TabValue = 'introduction' | 'report' | 'ask-the-seer';

function FinancialAstrologyPageContent() {
  const { user, userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<TabValue>('introduction');
  const { report: pipelineReport, loading: isLoading, error, hasReport, refreshProfile } =
    useToolReport('financialAstrology');
  const [onDemandReport, setOnDemandReport] = useState<Record<string, unknown> | null>(null);
  const [onDemandLoading, setOnDemandLoading] = useState(false);
  const [onDemandError, setOnDemandError] = useState<string | null>(null);
  const onDemandFetchedRef = useRef(false);
  const refreshProfileRef = useRef(refreshProfile);
  useLayoutEffect(() => {
    refreshProfileRef.current = refreshProfile;
  }, [refreshProfile]);

  const [marketSnapshot, setMarketSnapshot] = useState<Record<string, unknown> | null>(null);
  const [marketLoading, setMarketLoading] = useState(false);
  const [historicalData, setHistoricalData] = useState<Array<{ date: string; close: number }>>([]);
  const [astroEvents, setAstroEvents] = useState<AstroEvent[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState('^GSPC');

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
    () => !!(pipelineInner && (pipelineInner as Record<string, unknown>).financialTemperamentProfile),
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

    currentUser
      .getIdToken()
      .then((token) =>
        fetch('/api/financial-astrology/comprehensive', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
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
        }),
      )
      .then((res) => res.json())
      .then(async (json) => {
        if (cancelled) return;
        const data = json?.data;
        const analysis = data?.comprehensiveAnalysis ?? data;
        const hasValidShape = analysis && typeof analysis === 'object' && (analysis as Record<string, unknown>).financialTemperamentProfile;
        if (hasValidShape) {
          const reportData = analysis as Record<string, unknown>;
          setOnDemandReport(reportData);
          setOnDemandError(null);
          try {
            const token = await currentUser.getIdToken();
            const saveRes = await fetch('/api/profile/save-tool-report', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ toolSlug: 'financialAstrology', data: { comprehensiveAnalysis: reportData } }),
            });
            if (saveRes.ok) refreshProfileRef.current?.();
          } catch {
            // Non-blocking
          }
        } else {
          setOnDemandError((json?.error as string) ?? 'Financial astrology report unavailable');
          onDemandFetchedRef.current = false;
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setOnDemandError(err instanceof Error ? err.message : 'Failed to load financial astrology report');
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

  useEffect(() => {
    if (activeTab !== 'report') return;
    let cancelled = false;
    setMarketLoading(true);
    fetch('/api/market-data?type=snapshot')
      .then((r) => r.json())
      .then((data) => { if (!cancelled) setMarketSnapshot(data); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setMarketLoading(false); });
    return () => { cancelled = true; };
  }, [activeTab]);

  const handleSymbolChange = useCallback((symbol: string) => {
    setSelectedSymbol(symbol);
  }, []);

  useEffect(() => {
    if (activeTab !== 'report') return;
    let cancelled = false;
    fetch(`/api/market-data?type=historical&symbol=${encodeURIComponent(selectedSymbol)}&months=12`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data?.data) setHistoricalData(data.data);
        else if (Array.isArray(data)) setHistoricalData(data);
      })
      .catch(() => {});

    const now = new Date();
    const yearAgo = new Date();
    yearAgo.setFullYear(yearAgo.getFullYear() - 1);
    fetch(`/api/market-data?type=snapshot`)
      .then(() => {
        import('@/lib/financialAstrology/astroMarketCorrelation').then((mod) => {
          if (cancelled) return;
          const events = mod.getAstrologicalEventsForPeriod(yearAgo, now);
          setAstroEvents(events);
        });
      })
      .catch(() => {});

    return () => { cancelled = true; };
  }, [activeTab, selectedSymbol]);

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

  const isReportComplete = useMemo(
    () => !!(comprehensiveReport && (comprehensiveReport as Record<string, unknown>).financialTemperamentProfile),
    [comprehensiveReport]
  );

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
              <TrendingUp className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">Profile Incomplete</h2>
              <p className="text-slate-200 mb-4">
                Complete your profile to unlock your Financial Astrology report
              </p>
              <motion.div
                whileHover={{}}
                whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
                transition={
                  prefersReducedMotion ? {} : { type: 'spring', stiffness: 400, damping: 17 }
                }
              >
                <Button
                  onClick={() => (window.location.href = '/profile-setup')}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-transparent"
                >
                  Complete Profile
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const report = comprehensiveReport as Record<string, unknown> | undefined;
  const temperament = report?.financialTemperamentProfile as Record<string, unknown> | undefined;
  const alignment = report?.alignmentScore as Record<string, unknown> | undefined;
  const wealthHouses = (report?.wealthHouses as Array<Record<string, unknown>>) ?? [];
  const wealthPlanets = (report?.wealthPlanets as Array<Record<string, unknown>>) ?? [];
  const volatilityWindows = (report?.volatilityWindows as Array<Record<string, unknown>>) ?? [];
  const climateMap = (report?.climateMap12Months as string[]) ?? [];
  const strategic = report?.strategicRecommendations as Record<string, unknown> | undefined;
  const recommendations = (strategic?.strategic_recommendations as string[]) ?? [];
  const legalDisclaimer = (report?.legalDisclaimer as string) ?? '';

  return (
    <ToolReportGuard loading={effectiveLoading} error={effectiveError ?? null} toolLabel="Financial Astrology">
      <div className="starfield-ultra-sharp min-h-screen px-2 sm:px-4 overflow-x-hidden">
        <div className="relative z-10 max-w-7xl mx-auto py-8">
          <div className="text-center mb-8 pt-4">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-semibold mb-6">
              <span className="text-amber-300">📈</span>{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-green-400 to-cyan-500">
                Financial Astrology
              </span>
            </h1>
            <p className="text-slate-200 leading-relaxed text-xl font-light">
              Natal wealth analysis and market cycle timing — not financial advice
            </p>
            <AstrologyMethodologyBadge variant="financial" className="mt-4 mb-0" />
          </div>

          <div className="rounded-2xl border border-emerald-500/40 bg-slate-900/80 overflow-hidden shadow-[0_0_30px_rgba(16,185,129,0.1)]">
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as TabValue)}
              className="w-full min-w-0"
            >
              <TabsList className="flex w-full flex-nowrap overflow-x-auto gap-1 sm:gap-2 p-2 sm:p-3 bg-slate-800/50 border-b border-emerald-500/25 rounded-none h-auto min-h-0 justify-start [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-emerald-500/40">
                {tabsConfig.map((tab) => (
                  <motion.div
                    key={tab.value}
                    whileHover={{}}
                    whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                    transition={
                      prefersReducedMotion ? {} : { type: 'spring', stiffness: 400, damping: 17 }
                    }
                    className="relative shrink-0"
                  >
                    <TabsTrigger
                      value={tab.value}
                      className="shrink-0 data-[state=active]:bg-gradient-to-br data-[state=active]:from-emerald-100 data-[state=active]:to-cyan-100 data-[state=active]:text-emerald-900 data-[state=active]:shadow-md data-[state=active]:border-b-2 data-[state=active]:border-b-emerald-400/80 rounded-t-lg rounded-b-none px-4 py-2.5 text-sm font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 transition-all flex items-center justify-center relative overflow-hidden border border-transparent data-[state=inactive]:border-slate-600/50"
                    >
                      {tab.label}
                    </TabsTrigger>
                  </motion.div>
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
                    <TabsContent
                      value="introduction"
                      className="space-y-6 pt-6 px-2 sm:px-6 pb-6 mt-0"
                    >
                      <ToolIntroductionTab toolSlug="financial-astrology" />
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
                    <TabsContent
                      value="report"
                      className="space-y-6 pt-6 px-2 sm:px-6 pb-6 mt-0"
                    >
                      {effectiveLoading ? (
                        <div className="text-center py-12">
                          <Loader2 className="w-12 h-12 text-emerald-400 mx-auto mb-4 animate-spin" />
                          <p className="text-slate-300 mb-2">
                            {pipelineInner && !(pipelineInner as Record<string, unknown>).financialTemperamentProfile
                              ? "Your report appears incomplete. We're generating a full report for you."
                              : 'Generating your Financial Astrology report...'}
                          </p>
                          <MarketOverviewCards snapshot={marketSnapshot as Parameters<typeof MarketOverviewCards>[0]['snapshot']} loading={marketLoading} />
                        </div>
                      ) : effectiveError ? (
                        <div className="text-center py-8">
                          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                          <p className="text-red-300 mb-4">{effectiveError}</p>
                          {hasCompleteDetails && (
                            <Button
                              onClick={() => {
                                onDemandFetchedRef.current = false;
                                setOnDemandError(null);
                                setOnDemandReport(null);
                              }}
                              className="bg-emerald-500 hover:bg-emerald-600 text-white"
                            >
                              Retry generating report
                            </Button>
                          )}
                        </div>
                      ) : !hasReport && !onDemandReport ? (
                        <div className="text-center py-8">
                          <p className="text-slate-300 mb-4">
                            Generate your mystical profile to unlock your Financial Astrology report.
                          </p>
                          <Button asChild className="bg-emerald-500 hover:bg-emerald-600 text-white">
                            <Link href="/profile">Generate your mystical profile</Link>
                          </Button>
                        </div>
                      ) : report ? (
                        <ToolReportViralShell toolSlug="financialAstrology" reportForTeaser={effectiveReport ?? pipelineReport}>
                        <div className="space-y-6">
                          <MarketOverviewCards snapshot={marketSnapshot as Parameters<typeof MarketOverviewCards>[0]['snapshot']} loading={marketLoading} />

                          <DashboardSection
                            title="Disclaimer"
                            icon={<Shield className="w-6 h-6" />}
                            defaultExpanded={false}
                            colorScheme="amber"
                            storageKey="financial-disclaimer"
                          >
                            <p className="text-slate-700 text-sm leading-relaxed">
                              {legalDisclaimer || 'This report is for educational and cyclical modeling only. Not financial advice. No price targets or deterministic predictions.'}
                            </p>
                          </DashboardSection>

                          {temperament && (
                            <DashboardSection
                              title="Financial Temperament Profile"
                              icon={<DollarSign className="w-6 h-6" />}
                              defaultExpanded
                              colorScheme="green"
                              storageKey="financial-temperament"
                            >
                              <div className="space-y-4">
                                <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
                                  <TemperamentGauge
                                    label="Income Stability"
                                    value={Number(temperament.incomeStabilityScore ?? 0)}
                                  />
                                  <TemperamentGauge
                                    label="Speculative Risk"
                                    value={Number(temperament.speculativeRiskIndex ?? 0)}
                                  />
                                  <TemperamentGauge
                                    label="Long-Term Accumulation"
                                    value={Number(temperament.longTermAccumulationScore ?? 0)}
                                  />
                                  <TemperamentGauge
                                    label="Liquidity Stress"
                                    value={Number(temperament.liquidityStressIndex ?? 0)}
                                  />
                                </div>
                                {(temperament.temperamentSummary as string) && (
                                  <p className="text-sm leading-relaxed text-slate-700 text-center">
                                    {String(temperament.temperamentSummary)}
                                  </p>
                                )}
                              </div>
                            </DashboardSection>
                          )}

                          {alignment && (
                            <DashboardSection
                              title="Alignment Score"
                              icon={<BarChart3 className="w-6 h-6" />}
                              defaultExpanded
                              colorScheme="blue"
                              storageKey="financial-alignment"
                            >
                              <div className="space-y-2 text-slate-700">
                                <p>
                                  <strong>Composite:</strong> {`${alignment.compositeScore ?? '—'}/100`}
                                </p>
                                <p>
                                  <strong>Action Bias:</strong> {String(alignment.actionBias ?? '—')}
                                </p>
                                <p>
                                  <strong>Risk Band:</strong> {String(alignment.riskBand ?? '—')}
                                </p>
                                {(alignment.rationale as string) && (
                                  <p className="text-sm">{String(alignment.rationale)}</p>
                                )}
                              </div>
                            </DashboardSection>
                          )}

                          {historicalData.length > 0 && (
                            <DashboardSection
                              title="Market-Transit Correlation"
                              icon={<Globe className="w-6 h-6" />}
                              defaultExpanded
                              colorScheme="green"
                              storageKey="financial-market-transit"
                            >
                              <MarketTransitChart
                                historicalData={historicalData}
                                astroEvents={astroEvents}
                                selectedSymbol={selectedSymbol}
                                onSymbolChange={handleSymbolChange}
                              />
                            </DashboardSection>
                          )}

                          {wealthPlanets.length > 0 && (
                            <DashboardSection
                              title="Wealth Planets"
                              icon={<Star className="w-6 h-6" />}
                              defaultExpanded
                              colorScheme="purple"
                              storageKey="financial-wealth-planets"
                            >
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {wealthPlanets.map((p, i) => {
                                  const dignity = String(p.dignity ?? '');
                                  const isStrong = ['domicile', 'exalted', 'own sign'].some((d) => dignity.toLowerCase().includes(d));
                                  return (
                                    <div key={i} className="rounded-lg border border-slate-700/40 bg-slate-800/30 p-3">
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-semibold text-white">{String(p.planet ?? '')}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${isStrong ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700/50 text-slate-400'}`}>
                                          {dignity || 'Neutral'}
                                        </span>
                                      </div>
                                      <p className="text-xs text-slate-400">
                                        {String(p.sign ?? '')} in House {String(p.house ?? '')}
                                      </p>
                                      {p.score != null && (
                                        <div className="mt-2 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                          <div
                                            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-500"
                                            style={{ width: `${Math.min(Number(p.score), 100)}%` }}
                                          />
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </DashboardSection>
                          )}

                          {wealthHouses.length > 0 && (
                            <DashboardSection
                              title="Wealth Houses"
                              icon={<FileText className="w-6 h-6" />}
                              defaultExpanded
                              colorScheme="purple"
                              storageKey="financial-wealth-houses"
                            >
                              <div className="space-y-2 text-slate-700 text-sm">
                                {wealthHouses.map((h, i) => (
                                  <div key={i} className="border-b border-slate-200 pb-2 last:border-0">
                                    <p className="font-medium">
                                      {`House ${h.houseNumber} (${String(h.sign ?? '')}): ${String(h.label ?? '')}`}
                                    </p>
                                    <p className="text-slate-600">
                                      {String(h.summary ?? '')}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </DashboardSection>
                          )}

                          {volatilityWindows.length > 0 && (
                            <DashboardSection
                              title="Volatility Windows"
                              icon={<Zap className="w-6 h-6" />}
                              defaultExpanded
                              colorScheme="orange"
                              storageKey="financial-volatility"
                            >
                              <ul className="space-y-2 text-slate-700 text-sm list-disc list-inside">
                                {volatilityWindows.map((w, i) => (
                                  <li key={i}>
                                    {String(w.name ?? '')}: {String(w.description ?? '')}
                                  </li>
                                ))}
                              </ul>
                            </DashboardSection>
                          )}

                          {recommendations.length > 0 && (
                            <DashboardSection
                              title="Strategic Recommendations"
                              icon={<BookOpen className="w-6 h-6" />}
                              defaultExpanded
                              colorScheme="cyan"
                              storageKey="financial-recommendations"
                            >
                              <ul className="space-y-2 text-slate-700 text-sm list-disc list-inside">
                                {recommendations.map((r, i) => (
                                  <li key={i}>{String(r)}</li>
                                ))}
                              </ul>
                            </DashboardSection>
                          )}

                          {climateMap.length > 0 && (
                            <DashboardSection
                              title="12-Month Financial Climate Map"
                              icon={<TrendingDown className="w-6 h-6" />}
                              defaultExpanded
                              colorScheme="pink"
                              storageKey="financial-climate-map"
                            >
                              <ClimateHeatmap
                                months={climateMap.slice(0, 12).map((m, i) => {
                                  const text = String(m);
                                  const monthLabel = text.split(':')[0]?.trim() || `Month ${i + 1}`;
                                  const desc = text.split(':').slice(1).join(':').trim() || text;
                                  const isHighVol = /high volatility|mercury rx|mars-uranus/i.test(text);
                                  const isCaution = /caution|retrograde|stress/i.test(text);
                                  const isMod = /moderate/i.test(text);
                                  const score = isHighVol ? 20 : isCaution ? 35 : isMod ? 55 : 75;
                                  return { label: monthLabel, score, description: desc };
                                })}
                              />
                            </DashboardSection>
                          )}
                        </div>
                        </ToolReportViralShell>
                      ) : (
                        <div className="text-center py-8">
                          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                          <p className="text-red-300 mb-4">{error ?? 'Failed to load report'}</p>
                        </div>
                      )}
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
                    <TabsContent
                      value="ask-the-seer"
                      className="pt-6 px-2 sm:px-6 pb-6 mt-0"
                    >
                      {user?.uid && (
                        <FinancialSeerChatInterface
                          userId={user.uid}
                          userProfile={userProfile}
                          financialReport={effectiveReport as Record<string, unknown>}
                        />
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

export default function FinancialAstrologyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
          <div className="text-amber-400">Loading...</div>
        </div>
      }
    >
      <FinancialAstrologyPageContent />
    </Suspense>
  );
}
