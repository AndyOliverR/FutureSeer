'use client';

import { Suspense, useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { useToolReport } from '@/hooks/useComprehensiveMysticalProfile';
import { ToolReportGuard } from '@/components/ToolReportGuard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToolIntroductionTab } from '@/components/ToolIntroductionTab';
import { DashboardSection } from '@/components/western/DashboardSection';
import HermeticSeerChatInterface from '@/components/HermeticSeerChatInterface';
import {
  Star,
  AlertTriangle,
  Info,
  Sparkles,
  Flame,
  Scale,
  Target,
  Compass,
  Zap,
  ArrowRight,
  Beaker,
  Sun,
  Moon,
  Anchor,
  LayoutGrid,
  Focus,
} from 'lucide-react';

type TabValue = 'introduction' | 'report' | 'ask-the-seer';

function HermeticAstrologyPageContent() {
  const { userProfile, user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabValue>('introduction');
  const { report: pipelineReport, loading: isLoading, error, hasReport } = useToolReport('hermeticAstrology');
  const comprehensiveHermeticReport = useMemo(() => {
    if (pipelineReport == null || typeof pipelineReport !== 'object') return null;
    const raw = pipelineReport as Record<string, unknown>;
    return (raw.comprehensiveAnalysis as Record<string, unknown>) ?? raw;
  }, [pipelineReport]);

  const westernChartData = useMemo(() => {
    if (pipelineReport == null || typeof pipelineReport !== 'object') return undefined;
    const raw = pipelineReport as Record<string, unknown>;
    return raw.data as Record<string, unknown> | undefined;
  }, [pipelineReport]);

  const hasCompleteDetails = !!(
    userProfile?.birthDate &&
    userProfile?.birthTime &&
    userProfile?.birthPlace
  );

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
    { value: 'report', label: 'Your Alchemical Chart' },
    { value: 'ask-the-seer', label: 'Ask the Seer' },
  ];

  if (!hasCompleteDetails) {
    return (
      <div className="relative min-h-screen starfield-ultra-sharp">
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md glass-card border-white/10 rounded-xl text-white">
            <CardContent className="p-6 text-center text-white">
              <Star className="w-12 h-12 text-teal-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">Profile Incomplete</h2>
              <p className="text-slate-200 mb-4">
                Complete your profile to unlock your Hermetic Astrology alchemical chart
              </p>
              <motion.div
                whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
                transition={prefersReducedMotion ? {} : { type: 'spring', stiffness: 400, damping: 17 }}
              >
                <Button
                  onClick={() => (window.location.href = '/profile-setup')}
                  className="bg-teal-500 hover:bg-teal-600 text-white focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 focus:ring-offset-transparent"
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

  const report = comprehensiveHermeticReport as Record<string, unknown> | undefined;
  const planetaryDynamics = report?.planetary_dynamics && typeof report.planetary_dynamics === 'object' && !Array.isArray(report.planetary_dynamics)
    ? (report.planetary_dynamics as Record<string, string>)
    : {};

  return (
    <ToolReportGuard loading={isLoading} error={error ?? null} toolLabel="Hermetic Astrology">
    <div className="starfield-ultra-sharp min-h-screen p-4 overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto py-8">
        <div className="text-center mb-8 pt-4">
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-semibold mb-6">
            <span className="text-teal-300">🔱</span>{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-200 via-teal-400 to-emerald-600">
              Hermetic Astrology
            </span>
          </h1>
          <p className="text-slate-200 leading-relaxed text-xl font-light">
            Spiritual mechanics and inner alchemy — not prediction
          </p>
        </div>

        <div className="rounded-2xl border border-amber-500/30 bg-slate-900/80 overflow-hidden">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)} className="w-full min-w-0">
          <TabsList className="flex w-full flex-nowrap overflow-x-auto gap-1 sm:gap-2 p-2 sm:p-3 bg-slate-800/50 border-b border-amber-500/20 rounded-none h-auto min-h-0 justify-start [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-amber-500/30">
            {tabsConfig.map((tab) => (
              <motion.div
                key={tab.value}
                whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                transition={prefersReducedMotion ? {} : { type: 'spring', stiffness: 400, damping: 17 }}
                className="relative shrink-0"
              >
                <TabsTrigger
                  value={tab.value}
                  className="shrink-0 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 rounded-t-lg rounded-b-none px-4 py-2.5 text-sm font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 transition-all flex items-center justify-center relative overflow-hidden border border-transparent data-[state=inactive]:border-slate-600/50"
                >
                  {tab.label}
                  {activeTab === tab.value && (
                    <motion.div
                      layoutId="activeTabHermetic"
                      className="absolute inset-0 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-t-lg rounded-b-none -z-10"
                      transition={prefersReducedMotion ? {} : { type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
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
                <TabsContent value="introduction" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                  <ToolIntroductionTab toolSlug="hermetic-astrology" />
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
                <TabsContent value="report" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                  {isLoading ? (
                    <div className="text-center py-8">
                      <motion.div
                        className="w-16 h-16 mx-auto mb-4 border-2 border-teal-300 border-t-teal-600 rounded-full"
                        animate={prefersReducedMotion ? {} : { rotate: 360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                      />
                      <p className="text-slate-200">Loading your report…</p>
                    </div>
                  ) : error ? (
                    <div className="text-center py-8">
                      <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                      <p className="text-red-300 mb-4">{error}</p>
                    </div>
                  ) : !hasReport ? (
                    <div className="text-center py-8">
                      <p className="text-slate-300 mb-4">Generate your mystical profile to unlock your Hermetic Astrology report.</p>
                      <Button asChild className="bg-teal-500 hover:bg-teal-600 text-white">
                        <Link href="/profile">Generate your mystical profile</Link>
                      </Button>
                    </div>
                  ) : report ? (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300 text-sm">Your alchemical chart</span>
                      </div>
                      {String(report.sect_summary ?? '').trim() && (
                        <DashboardSection
                          title="The Light of Your Life (Sect)"
                          icon={<Sun className="w-6 h-6" />}
                          defaultExpanded
                          colorScheme="orange"
                          storageKey="hermetic-sect"
                        >
                          <p className="text-slate-700 leading-relaxed">
                            {String(report.sect_summary)}
                          </p>
                        </DashboardSection>
                      )}
                      {(String(report.lot_of_fortune_summary ?? '').trim() || String(report.lot_of_spirit_summary ?? '').trim()) && (
                        <DashboardSection
                          title="The Two Paths (Lots)"
                          icon={<Moon className="w-6 h-6" />}
                          defaultExpanded
                          colorScheme="blue"
                          storageKey="hermetic-lots"
                        >
                          <div className="space-y-4">
                            {String(report.lot_of_fortune_summary ?? '').trim() && (
                              <div>
                                <p className="text-teal-800 font-semibold mb-1">Your Body & Fate (Lot of Fortune)</p>
                                <p className="text-slate-700 leading-relaxed">{String(report.lot_of_fortune_summary)}</p>
                              </div>
                            )}
                            {String(report.lot_of_spirit_summary ?? '').trim() && (
                              <div>
                                <p className="text-teal-800 font-semibold mb-1">Your Will & Career (Lot of Spirit)</p>
                                <p className="text-slate-700 leading-relaxed">{String(report.lot_of_spirit_summary)}</p>
                              </div>
                            )}
                          </div>
                        </DashboardSection>
                      )}
                      {String(report.helmsman_summary ?? '').trim() && (
                        <DashboardSection
                          title="The Helmsman (Chart Ruler)"
                          icon={<Anchor className="w-6 h-6" />}
                          defaultExpanded
                          colorScheme="purple"
                          storageKey="hermetic-helmsman"
                        >
                          <p className="text-slate-700 leading-relaxed">
                            {String(report.helmsman_summary)}
                          </p>
                        </DashboardSection>
                      )}
                      {report.life_arenas && typeof report.life_arenas === 'object' && !Array.isArray(report.life_arenas) && Object.keys(report.life_arenas as Record<string, string>).length > 0 ? (
                        <DashboardSection
                          title="Life Arenas"
                          icon={<LayoutGrid className="w-6 h-6" />}
                          badge={`${Object.keys(report.life_arenas as Record<string, string>).length} houses`}
                          defaultExpanded={false}
                          colorScheme="green"
                          storageKey="hermetic-life-arenas"
                        >
                          <ul className="space-y-3 text-slate-700">
                            {Object.entries(report.life_arenas as Record<string, string>).map(([house, text]) =>
                              text ? (
                                <li key={house}>
                                  <strong className="text-teal-800">House {house}:</strong> {String(text)}
                                </li>
                              ) : null
                            )}
                          </ul>
                        </DashboardSection>
                      ) : null}
                      {String(report.predominator_note ?? '').trim() && (
                        <DashboardSection
                          title="Life Focus (Predominator)"
                          icon={<Focus className="w-6 h-6" />}
                          defaultExpanded
                          colorScheme="cyan"
                          storageKey="hermetic-predominator"
                        >
                          <p className="text-slate-700 leading-relaxed">
                            {String(report.predominator_note)}
                          </p>
                        </DashboardSection>
                      )}
                      <DashboardSection
                        title="Dominant Element"
                        icon={<Flame className="w-6 h-6" />}
                        defaultExpanded
                        colorScheme="orange"
                        storageKey="hermetic-dominant-element"
                      >
                        <p className="text-slate-700 leading-relaxed">
                          {String(report.dominant_element ?? '—')}
                        </p>
                      </DashboardSection>
                      <DashboardSection
                        title="Elemental Imbalance"
                        icon={<Scale className="w-6 h-6" />}
                        defaultExpanded
                        colorScheme="blue"
                        storageKey="hermetic-elemental-imbalance"
                      >
                        <p className="text-slate-700 leading-relaxed">
                          {String(report.elemental_imbalance ?? '—')}
                        </p>
                      </DashboardSection>
                      <DashboardSection
                        title="Polarity Balance"
                        icon={<Zap className="w-6 h-6" />}
                        defaultExpanded={false}
                        colorScheme="purple"
                        storageKey="hermetic-polarity-balance"
                      >
                        <p className="text-slate-700 leading-relaxed">
                          {String(report.polarity_balance ?? '—')}
                        </p>
                      </DashboardSection>
                      <DashboardSection
                        title="Archetypal Theme"
                        icon={<Target className="w-6 h-6" />}
                        defaultExpanded
                        colorScheme="green"
                        storageKey="hermetic-archetypal-theme"
                      >
                        <p className="text-slate-700 leading-relaxed">
                          {String(report.archetypal_theme ?? '—')}
                        </p>
                      </DashboardSection>
                      <DashboardSection
                        title="Planetary Dynamics"
                        icon={<Sparkles className="w-6 h-6" />}
                        badge={Object.keys(planetaryDynamics).length ? `${Object.keys(planetaryDynamics).length} planets` : undefined}
                        defaultExpanded={false}
                        colorScheme="pink"
                        storageKey="hermetic-planetary-dynamics"
                      >
                        {Object.keys(planetaryDynamics).length ? (
                          <ul className="list-disc list-inside text-slate-700 space-y-1">
                            {Object.entries(planetaryDynamics).map(([planet, desc]) => (
                              <li key={planet}><strong>{planet}:</strong> {desc}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-slate-700">—</p>
                        )}
                      </DashboardSection>
                      <DashboardSection
                        title="Alchemical Lesson"
                        icon={<Beaker className="w-6 h-6" />}
                        defaultExpanded
                        colorScheme="cyan"
                        storageKey="hermetic-alchemical-lesson"
                      >
                        <p className="text-slate-700 leading-relaxed">
                          {String(report.alchemical_lesson ?? '—')}
                        </p>
                      </DashboardSection>
                      <DashboardSection
                        title="Integration Guidance"
                        icon={<Compass className="w-6 h-6" />}
                        defaultExpanded={false}
                        colorScheme="cyan"
                        storageKey="hermetic-integration-guidance"
                      >
                        <p className="text-slate-700 leading-relaxed">
                          {String(report.integration_guidance ?? '—')}
                        </p>
                      </DashboardSection>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Info className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                      <p className="text-slate-200 mb-4">Generate your mystical profile to unlock your Hermetic Astrology report.</p>
                      <Button asChild className="bg-teal-500 hover:bg-teal-600 text-white">
                        <Link href="/profile">Generate your mystical profile</Link>
                      </Button>
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
                <TabsContent value="ask-the-seer" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                  <div className="h-[800px] min-h-0">
                    <HermeticSeerChatInterface
                      userId={user?.uid || ''}
                      userProfile={userProfile}
                      westernChartData={westernChartData}
                      hermeticReport={
                        comprehensiveHermeticReport
                          ? { comprehensiveAnalysis: comprehensiveHermeticReport }
                          : undefined
                      }
                    />
                  </div>
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

export default function HermeticAstrologyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center starfield-ultra-sharp">
          <div className="animate-pulse text-teal-400">Loading…</div>
        </div>
      }
    >
      <HermeticAstrologyPageContent />
    </Suspense>
  );
}
