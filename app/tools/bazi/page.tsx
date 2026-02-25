'use client';

import { Suspense, useState, useMemo, useEffect } from 'react';
import { devLog } from '@/lib/devLogger';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { useToolReport } from '@/hooks/useComprehensiveMysticalProfile';
import { ToolReportGuard } from '@/components/ToolReportGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToolIntroductionTab } from '@/components/ToolIntroductionTab';
import { DevotionistStyleCard } from '@/components/western/DevotionistStyleCard';
import { BaZiCoachInterface } from '@/components/BaZiCoachInterface';
import type { BaziReading } from '@/lib/baziIntelligence';
import {
  Star,
  LayoutGrid,
  FileText,
  Heart,
  Briefcase,
  DollarSign,
  Activity,
  Calendar,
  TrendingUp,
  Palette,
  Compass,
  Hash,
  Leaf,
} from 'lucide-react';

type TabValue = 'introduction' | 'report' | 'ask-the-seer';

function BaziPageContent() {
  const { user, userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<TabValue>('introduction');
  const { report: pipelineReport, loading: isLoading, error, refreshProfile } = useToolReport('bazi');

  const baziReport = useMemo(() => {
    if (pipelineReport == null || typeof pipelineReport !== 'object') return null;
    const raw = pipelineReport as Record<string, unknown>;
    if (raw.placeholder === true) return null;
    return raw as unknown as BaziReading;
  }, [pipelineReport]);

  // Dev-only: log what the BaZi page received so we can verify report-after-generate-mystical
  useEffect(() => {
    if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') return;
    const hasReport = pipelineReport != null && typeof pipelineReport === 'object';
    const isPlaceholder = hasReport && (pipelineReport as Record<string, unknown>).placeholder === true;
    const hasRealReport = !!baziReport;
    devLog.debug(`[BaZi page] pipelineReport present: ${hasReport}, placeholder: ${isPlaceholder}, baziReport (real): ${hasRealReport}`, 'bazi');
  }, [pipelineReport, baziReport]);

  const comprehensiveAnalysis = useMemo(() => {
    if (!baziReport) return null;
    const comp = (baziReport as unknown as Record<string, unknown>).comprehensiveAnalysis as {
      chartOverview?: string;
      lifePathInsights?: string;
      elementHarmonization?: string;
      timingAndOpportunities?: string;
    } | undefined;
    return comp ?? null;
  }, [baziReport]);

  const [fetchedComprehensive, setFetchedComprehensive] = useState<typeof comprehensiveAnalysis>(null);
  const [isLoadingComprehensive, setIsLoadingComprehensive] = useState(false);
  const [isGeneratingBaziReport, setIsGeneratingBaziReport] = useState(false);
  const [baziGenerateError, setBaziGenerateError] = useState<string | null>(null);
  const effectiveComprehensive = comprehensiveAnalysis || fetchedComprehensive;

  const handleGenerateBaziReportNow = async () => {
    if (!user?.uid || !userProfile?.birthDate || !userProfile?.birthPlace || isGeneratingBaziReport) return;
    setBaziGenerateError(null);
    setIsGeneratingBaziReport(true);
    try {
      const res = await fetch('/api/tools/bazi/analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          userProfile: {
            birthDate: userProfile.birthDate,
            birthTime: userProfile.birthTime || '12:00',
            birthPlace: userProfile.birthPlace,
            birthLatitude: userProfile.birthLatitude,
            birthLongitude: userProfile.birthLongitude,
            gender: userProfile.gender,
          },
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setBaziGenerateError(json?.error || `Request failed (${res.status})`);
        return;
      }
      const data = json.data ?? json;
      if (!data || (data as Record<string, unknown>).placeholder === true) {
        setBaziGenerateError('BaZi reading could not be generated for this profile.');
        return;
      }
      const token = await user.getIdToken();
      const saveRes = await fetch('/api/profile/save-tool-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ toolSlug: 'bazi', data }),
      });
      if (saveRes.ok) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('futureSeer:toolReportSaved', { detail: { toolSlug: 'bazi', data } }));
        }
        await refreshProfile();
      } else {
        setBaziGenerateError('Report generated but failed to save. Try again.');
      }
    } catch (e) {
      setBaziGenerateError(e instanceof Error ? e.message : 'Something went wrong. Try again.');
    } finally {
      setIsGeneratingBaziReport(false);
    }
  };

  const hasCompleteDetails = !!(
    userProfile?.birthDate &&
    userProfile?.birthTime &&
    userProfile?.birthPlace
  );

  useEffect(() => {
    if (!user?.uid || !baziReport || comprehensiveAnalysis != null) return;
    const chart = (baziReport as BaziReading).chart;
    if (!chart?.dayMaster) return;
    let cancelled = false;
    setIsLoadingComprehensive(true);
    fetch('/api/bazi/comprehensive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.uid,
        reading: baziReport,
        userProfile: {
          displayName: userProfile?.displayName,
          fullName: userProfile?.fullName,
          birthDate: userProfile?.birthDate,
          birthTime: userProfile?.birthTime,
          birthPlace: userProfile?.birthPlace,
        },
      }),
    })
      .then((res) => res.json())
      .then(async (json) => {
        if (cancelled || !json?.success || !json?.data) return;
        const comp = json.data as typeof comprehensiveAnalysis;
        if (comp) {
          setFetchedComprehensive(comp);
          try {
            const token = await user.getIdToken();
            const saveRes = await fetch('/api/profile/save-tool-report', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({
                toolSlug: 'bazi',
                data: { ...baziReport, comprehensiveAnalysis: comp },
              }),
            });
            if (saveRes.ok) await refreshProfile();
          } catch {
            // non-blocking
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsLoadingComprehensive(false);
      });
    return () => { cancelled = true; };
  }, [user?.uid, user, baziReport, comprehensiveAnalysis, refreshProfile]);

  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const motionConfig = useMemo(
    () => (prefersReducedMotion ? {} : { duration: 0.3, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }),
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
              <Star className="w-12 h-12 text-amber-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">Profile Incomplete</h2>
              <p className="text-slate-200 mb-4">
                Complete your birth date, time, and place to unlock your BaZi (Four Pillars) chart.
              </p>
              <Button asChild className="bg-amber-500 hover:bg-amber-600 text-white">
                <Link href="/profile-setup">Complete Profile</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <ToolReportGuard loading={isLoading} error={error ?? null} toolLabel="BaZi (Four Pillars)">
      <div className="starfield-ultra-sharp min-h-screen p-4 overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto py-8">
          <div className="text-center mb-8 pt-4">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-semibold mb-6">
              <span className="text-yellow-400">🏮</span>{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600">
                BaZi (Four Pillars)
              </span>
            </h1>
            <p className="text-slate-200 leading-relaxed text-xl font-light">
              八字 — Four Pillars of Destiny: Heavenly Stems, Earthly Branches, Day Master, Luck Pillars
            </p>
          </div>

          <div className="rounded-2xl border border-amber-500/30 bg-slate-900/80 overflow-hidden">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)} className="w-full min-w-0">
              <TabsList className="flex w-full flex-nowrap overflow-x-auto gap-1 sm:gap-2 p-2 sm:p-3 bg-slate-800/50 border-b border-amber-500/20 rounded-none h-auto min-h-0 justify-start [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-amber-500/30">
                {tabsConfig.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="shrink-0 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 rounded-t-lg rounded-b-none px-4 py-2.5 text-sm font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 transition-all border border-transparent data-[state=inactive]:border-slate-600/50"
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
                      <ToolIntroductionTab toolSlug="bazi" />
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
                    <TabsContent value="report" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0 bg-gradient-to-b from-amber-50/98 to-slate-100/98 min-h-[60vh]">
                      {isLoading ? (
                        <div className="text-center py-8">
                          <motion.div
                            className="w-16 h-16 mx-auto mb-4 border-2 border-amber-300 border-t-amber-600 rounded-full"
                            animate={prefersReducedMotion ? {} : { rotate: 360 }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                          />
                          <p className="text-slate-700">Loading your report…</p>
                        </div>
                      ) : !baziReport ? (
                        <div className="text-center py-8">
                          <p className="text-slate-600 mb-4">Generate your mystical profile to unlock your BaZi report.</p>
                          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                            <Button asChild className="bg-amber-500 hover:bg-amber-600 text-white">
                              <Link href="/profile">Generate your mystical profile</Link>
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              className="border-amber-500/60 text-amber-800 bg-amber-50/80 hover:bg-amber-100/90"
                              onClick={handleGenerateBaziReportNow}
                              disabled={isGeneratingBaziReport}
                            >
                              {isGeneratingBaziReport ? 'Generating…' : 'Generate BaZi report now'}
                            </Button>
                          </div>
                          {baziGenerateError && (
                            <p className="mt-4 text-sm text-red-600" role="alert">
                              {baziGenerateError}
                            </p>
                          )}
                        </div>
                      ) : (
                        <ReportTabContent
                          report={baziReport}
                          comprehensive={effectiveComprehensive}
                          isLoadingComprehensive={isLoadingComprehensive}
                        />
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
                    <TabsContent value="ask-the-seer" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                      {baziReport ? (
                        <div className="h-[800px] min-h-0">
                          <BaZiCoachInterface reading={baziReport} />
                        </div>
                      ) : (
                        <div className="text-center py-8 text-slate-300">
                          <p className="mb-4">Generate your mystical profile to use Ask the Seer for BaZi.</p>
                          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                            <Button asChild className="bg-amber-500 hover:bg-amber-600 text-white">
                              <Link href="/profile">Generate your mystical profile</Link>
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              className="border-amber-500/60 text-amber-200 bg-slate-800/50 hover:bg-slate-700/50"
                              onClick={handleGenerateBaziReportNow}
                              disabled={isGeneratingBaziReport}
                            >
                              {isGeneratingBaziReport ? 'Generating…' : 'Generate BaZi report now'}
                            </Button>
                          </div>
                          {baziGenerateError && (
                            <p className="mt-4 text-sm text-amber-200/90" role="alert">
                              {baziGenerateError}
                            </p>
                          )}
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

function ReportTabContent({
  report,
  comprehensive,
  isLoadingComprehensive,
}: {
  report: BaziReading;
  comprehensive: {
    chartOverview?: string;
    lifePathInsights?: string;
    elementHarmonization?: string;
    timingAndOpportunities?: string;
  } | null;
  isLoadingComprehensive: boolean;
}) {
  const { chart, elements, dayMaster, personality, career, wealth, relationships, health, favorable } = report;
  const luckPillars = chart?.luckPillars ?? [];
  const totalElements = elements.wood + elements.fire + elements.earth + elements.metal + elements.water || 1;
  const elementPct = (v: number) => Math.round((v / totalElements) * 100);

  return (
    <div className="space-y-6">
      {/* Natal Chart 4x2 */}
      {chart && (
        <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-amber-900 flex items-center gap-2">
              <LayoutGrid className="w-5 h-5" />
              Four Pillars (八字)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-2 text-center">
              {(['yearPillar', 'monthPillar', 'dayPillar', 'hourPillar'] as const).map((key, i) => {
                const labels = ['Year', 'Month', 'Day', 'Hour'];
                const pillar = chart[key];
                if (!pillar) return null;
                const stem = pillar.heavenlyStem;
                const branch = pillar.earthlyBranch;
                return (
                  <div key={key} className="rounded-xl bg-white/80 border border-amber-200 p-3">
                    <div className="text-xs font-medium text-amber-800 mb-1">{labels[i]}</div>
                    <div className="font-semibold text-slate-800">{stem.name}</div>
                    <div className="text-xs text-slate-600">{stem.element} {stem.yinYang}</div>
                    <div className="mt-2 pt-2 border-t border-amber-100 font-semibold text-slate-800">{branch.name}</div>
                    <div className="text-xs text-slate-600">{branch.animal}</div>
                    {branch.hiddenStems?.length > 0 && (
                      <div className="text-[10px] text-slate-500 mt-1">Hidden: {branch.hiddenStems.join(', ')}</div>
                    )}
                  </div>
                );
              })}
            </div>
            {chart.dayMaster && (
              <p className="mt-3 text-sm text-amber-800">
                Day Master (日主): <strong>{chart.dayMaster.name}</strong> — {chart.dayMaster.element} {chart.dayMaster.yinYang}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Element balance */}
      <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-200 rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-cyan-900 flex items-center gap-2">
            <Leaf className="w-5 h-5" />
            Five Elements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[
            { key: 'wood', label: 'Wood', color: 'bg-green-400', value: elements.wood },
            { key: 'fire', label: 'Fire', color: 'bg-red-400', value: elements.fire },
            { key: 'earth', label: 'Earth', color: 'bg-amber-400', value: elements.earth },
            { key: 'metal', label: 'Metal', color: 'bg-slate-400', value: elements.metal },
            { key: 'water', label: 'Water', color: 'bg-blue-400', value: elements.water },
          ].map(({ key, label, color, value }) => (
            <div key={key} className="flex items-center gap-2">
              <span className="w-20 text-sm font-medium text-slate-700">{label}</span>
              <div className="flex-1 h-6 bg-white/60 rounded-full overflow-hidden">
                <div className={`h-full ${color} rounded-full`} style={{ width: `${elementPct(value)}%` }} />
              </div>
              <span className="text-sm text-slate-600 w-10">{elementPct(value)}%</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Day Master */}
      {dayMaster && (
        <DevotionistStyleCard
          icon={<Star className="w-5 h-5" />}
          title="Day Master (日主)"
          summary={`${dayMaster.name} — ${dayMaster.element} ${dayMaster.yinYang}. Strength: ${dayMaster.strength}. Favorable: ${dayMaster.favorableElements?.join(', ') ?? '—'}. Unfavorable: ${dayMaster.unfavorableElements?.join(', ') ?? '—'}.`}
          colorScheme="amber"
        />
      )}

      {/* AI narrative */}
      {isLoadingComprehensive && (
        <p className="text-slate-500 text-sm">Loading detailed analysis…</p>
      )}
      {comprehensive?.chartOverview && (
        <DevotionistStyleCard icon={<FileText className="w-5 h-5" />} title="Chart Overview" summary={comprehensive.chartOverview} colorScheme="amber" />
      )}
      {comprehensive?.lifePathInsights && (
        <DevotionistStyleCard icon={<TrendingUp className="w-5 h-5" />} title="Life Path Insights" summary={comprehensive.lifePathInsights} colorScheme="blue" />
      )}
      {comprehensive?.elementHarmonization && (
        <DevotionistStyleCard icon={<Leaf className="w-5 h-5" />} title="Element Harmonization" summary={comprehensive.elementHarmonization} colorScheme="green" />
      )}
      {comprehensive?.timingAndOpportunities && (
        <DevotionistStyleCard icon={<Calendar className="w-5 h-5" />} title="Timing & Opportunities" summary={comprehensive.timingAndOpportunities} colorScheme="purple" />
      )}

      {/* Luck Pillars */}
      {luckPillars.length > 0 && (
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-purple-900 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              10-Year Luck Pillars (大运)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {luckPillars.map((pillar, i) => (
                <div key={i} className="rounded-xl bg-white/80 border border-purple-200 p-3">
                  <div className="font-medium text-purple-900">
                    Ages {pillar.startAge}–{pillar.endAge}: {pillar.heavenlyStem.name} {pillar.earthlyBranch.name} ({pillar.heavenlyStem.element} / {pillar.earthlyBranch.animal})
                  </div>
                  <p className="text-sm text-slate-700 mt-1">{pillar.influence}</p>
                  {pillar.opportunities?.length > 0 && (
                    <p className="text-xs text-green-700 mt-1">Opportunities: {pillar.opportunities.slice(0, 3).join(', ')}</p>
                  )}
                  {pillar.challenges?.length > 0 && (
                    <p className="text-xs text-amber-700 mt-0.5">Challenges: {pillar.challenges.slice(0, 2).join(', ')}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Life domains */}
      {wealth && (
        <DevotionistStyleCard
          icon={<DollarSign className="w-5 h-5" />}
          title="Wealth"
          summary={wealth.wealthPattern}
          items={[
            ...(wealth.incomeSources?.slice(0, 3).map((t) => ({ text: t, type: 'positive' as const })) ?? []),
            ...(wealth.favorablePeriods?.slice(0, 2).map((t) => ({ text: `Favorable: ${t}`, type: 'neutral' as const })) ?? []),
          ]}
          colorScheme="green"
        />
      )}
      {career && (
        <DevotionistStyleCard
          icon={<Briefcase className="w-5 h-5" />}
          title="Career"
          summary={career.financialPotential}
          items={career.suitablePaths?.slice(0, 4).map((t) => ({ text: t, type: 'positive' as const }))}
          colorScheme="blue"
        />
      )}
      {health && (
        <DevotionistStyleCard
          icon={<Activity className="w-5 h-5" />}
          title="Health"
          summary={health.constitution}
          items={health.wellnessAdvice?.slice(0, 3).map((t) => ({ text: t, type: 'neutral' as const }))}
          colorScheme="orange"
        />
      )}
      {relationships && (
        <DevotionistStyleCard
          icon={<Heart className="w-5 h-5" />}
          title="Relationships"
          summary={relationships.interpersonalDynamics}
          items={relationships.partnershipAdvice?.slice(0, 3).map((t) => ({ text: t, type: 'positive' as const }))}
          colorScheme="pink"
        />
      )}

      {/* Favorable */}
      {favorable && (
        <Card className="bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-50 border-2 border-amber-200 rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-amber-900 flex items-center gap-2">
              <Star className="w-5 h-5" />
              Favorable
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-700">
            {favorable.elements?.length > 0 && (
              <div className="flex items-start gap-2">
                <Palette className="w-4 h-4 mt-0.5 text-amber-600" />
                <span><strong>Elements:</strong> {favorable.elements.join(', ')}</span>
              </div>
            )}
            {favorable.colors?.length > 0 && (
              <div className="flex items-start gap-2">
                <Palette className="w-4 h-4 mt-0.5 text-amber-600" />
                <span><strong>Colors:</strong> {favorable.colors.join(', ')}</span>
              </div>
            )}
            {favorable.directions?.length > 0 && (
              <div className="flex items-start gap-2">
                <Compass className="w-4 h-4 mt-0.5 text-amber-600" />
                <span><strong>Directions:</strong> {favorable.directions.join(', ')}</span>
              </div>
            )}
            {favorable.numbers?.length > 0 && (
              <div className="flex items-start gap-2">
                <Hash className="w-4 h-4 mt-0.5 text-amber-600" />
                <span><strong>Numbers:</strong> {favorable.numbers.join(', ')}</span>
              </div>
            )}
            {favorable.seasons?.length > 0 && (
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 mt-0.5 text-amber-600" />
                <span><strong>Seasons:</strong> {favorable.seasons.join(', ')}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function BaziPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-950"><div className="text-amber-400">Loading...</div></div>}>
      <BaziPageContent />
    </Suspense>
  );
}
