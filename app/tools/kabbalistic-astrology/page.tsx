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
import KabbalisticAstrologySeerChatInterface from '@/components/KabbalisticAstrologySeerChatInterface';
import {
  Star,
  AlertTriangle,
  Info,
  Sparkles,
  BookOpen,
  RotateCcw,
  Target,
  Heart,
  ArrowRight,
  Compass,
  FileText,
  Map,
  Sun,
  Moon,
  DoorOpen,
  Layers,
  Scale,
  Zap,
  Shield,
  Calendar,
} from 'lucide-react';

type TabValue = 'introduction' | 'report' | 'ask-the-seer';

function KabbalisticAstrologyPageContent() {
  const { user, userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<TabValue>('introduction');
  const { report: pipelineReport, loading: isLoading, error, hasReport } = useToolReport('kabbalisticAstrology');
  const comprehensiveKabbalisticReport = useMemo(() => {
    if (pipelineReport == null || typeof pipelineReport !== 'object') return null;
    const raw = pipelineReport as Record<string, unknown>;
    return (raw.comprehensiveAnalysis as Record<string, unknown>) ?? raw;
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
    { value: 'report', label: 'Your Spiritual Blueprint' },
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
                Complete your profile to unlock your Kabbalistic Astrology spiritual blueprint
              </p>
              <motion.div
                whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
                transition={prefersReducedMotion ? {} : { type: 'spring', stiffness: 400, damping: 17 }}
              >
                <Button
                  onClick={() => (window.location.href = '/profile-setup')}
                  className="bg-amber-500 hover:bg-amber-600 text-white focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-transparent"
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

  const report = comprehensiveKabbalisticReport as Record<string, unknown> | undefined;

  return (
    <ToolReportGuard loading={isLoading} error={error ?? null} toolLabel="Kabbalistic Astrology">
    <div className="starfield-ultra-sharp min-h-screen p-4 overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto py-8">
        <div className="text-center mb-8 pt-4">
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-semibold mb-6">
            <span className="text-amber-300">🪬</span>{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-600">
              Kabbalistic Astrology
            </span>
          </h1>
          <p className="text-slate-200 leading-relaxed text-xl font-light">
            Spiritual blueprint and karmic correction (Tikkun) — not prediction
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
                      layoutId="activeTabKabbalistic"
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
                  <ToolIntroductionTab toolSlug="kabbalistic-astrology" />
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
                        className="w-16 h-16 mx-auto mb-4 border-2 border-amber-300 border-t-amber-600 rounded-full"
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
                      <p className="text-slate-300 mb-4">Generate your mystical profile to unlock your Kabbalistic Astrology report.</p>
                      <Button asChild className="bg-amber-500 hover:bg-amber-600 text-white">
                        <Link href="/profile">Generate your mystical profile</Link>
                      </Button>
                    </div>
                  ) : report ? (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300 text-sm">Your spiritual blueprint</span>
                      </div>
                      <DashboardSection
                        title="Executive Summary"
                        icon={<FileText className="w-6 h-6" />}
                        defaultExpanded
                        colorScheme="amber"
                        storageKey="kabbalistic-executive-summary"
                      >
                        <p className="text-slate-700 leading-relaxed">
                          {String(report.executive_summary ?? '—')}
                        </p>
                      </DashboardSection>
                      <DashboardSection
                        title="Natal Chart Overview"
                        icon={<Map className="w-6 h-6" />}
                        defaultExpanded={false}
                        colorScheme="blue"
                        storageKey="kabbalistic-natal-overview"
                      >
                        <p className="text-slate-700 leading-relaxed">
                          {String(report.natal_overview || '—')}
                        </p>
                      </DashboardSection>
                      <DashboardSection
                        title="Sun Through the Tree of Life"
                        icon={<Sun className="w-6 h-6" />}
                        defaultExpanded={false}
                        colorScheme="amber"
                        storageKey="kabbalistic-sun-tree-of-life"
                      >
                        <p className="text-slate-700 leading-relaxed">
                          {String(report.sun_through_tree_of_life || '—')}
                        </p>
                      </DashboardSection>
                      <DashboardSection
                        title="Moon & Emotional Root"
                        icon={<Moon className="w-6 h-6" />}
                        defaultExpanded={false}
                        colorScheme="cyan"
                        storageKey="kabbalistic-moon-emotional-root"
                      >
                        <p className="text-slate-700 leading-relaxed">
                          {String(report.moon_emotional_root || '—')}
                        </p>
                      </DashboardSection>
                      <DashboardSection
                        title="Ascendant & Path of Manifestation"
                        icon={<DoorOpen className="w-6 h-6" />}
                        defaultExpanded={false}
                        colorScheme="purple"
                        storageKey="kabbalistic-ascendant-path"
                      >
                        <p className="text-slate-700 leading-relaxed">
                          {String(report.ascendant_path || '—')}
                        </p>
                      </DashboardSection>
                      <DashboardSection
                        title="Hebrew Sign (Mazal)"
                        icon={<BookOpen className="w-6 h-6" />}
                        defaultExpanded
                        colorScheme="amber"
                        storageKey="kabbalistic-hebrew-sign"
                      >
                        <p className="text-slate-700 leading-relaxed">
                          {String(report.hebrew_sign ?? '—')}
                        </p>
                      </DashboardSection>
                      <DashboardSection
                        title="Sefirotic Mapping"
                        icon={<Layers className="w-6 h-6" />}
                        defaultExpanded={false}
                        colorScheme="purple"
                        storageKey="kabbalistic-sefirotic-mapping"
                      >
                        <p className="text-slate-700 leading-relaxed">
                          {String(report.sefirotic_mapping || '—')}
                        </p>
                      </DashboardSection>
                      <DashboardSection
                        title="Tikkun Theme"
                        icon={<Sparkles className="w-6 h-6" />}
                        defaultExpanded
                        colorScheme="purple"
                        storageKey="kabbalistic-tikkun-theme"
                      >
                        <p className="text-slate-700 leading-relaxed">
                          {String(report.tikkun_theme ?? '—')}
                        </p>
                      </DashboardSection>
                      <DashboardSection
                        title="Tikkun Axis"
                        icon={<Target className="w-6 h-6" />}
                        defaultExpanded={false}
                        colorScheme="blue"
                        storageKey="kabbalistic-tikkun-axis"
                      >
                        <p className="text-slate-700 leading-relaxed">
                          {String(report.tikkun_axis || '—')}
                        </p>
                      </DashboardSection>
                      <DashboardSection
                        title="Past-Life Residue"
                        icon={<RotateCcw className="w-6 h-6" />}
                        defaultExpanded={false}
                        colorScheme="pink"
                        storageKey="kabbalistic-past-life-residue"
                      >
                        <p className="text-slate-700 leading-relaxed">
                          {String(report.past_life_residue ?? '—')}
                        </p>
                      </DashboardSection>
                      <DashboardSection
                        title="Core Correction"
                        icon={<Target className="w-6 h-6" />}
                        defaultExpanded
                        colorScheme="blue"
                        storageKey="kabbalistic-core-correction"
                      >
                        <p className="text-slate-700 leading-relaxed">
                          {String(report.core_correction ?? '—')}
                        </p>
                      </DashboardSection>
                      <DashboardSection
                        title="Elemental & Modal Balance"
                        icon={<Scale className="w-6 h-6" />}
                        defaultExpanded={false}
                        colorScheme="green"
                        storageKey="kabbalistic-elemental-modal-balance"
                      >
                        <p className="text-slate-700 leading-relaxed">
                          {String(report.elemental_modal_balance || '—')}
                        </p>
                      </DashboardSection>
                      <DashboardSection
                        title="Challenging Aspects"
                        icon={<Zap className="w-6 h-6" />}
                        defaultExpanded={false}
                        colorScheme="orange"
                        storageKey="kabbalistic-challenging-aspects"
                      >
                        <p className="text-slate-700 leading-relaxed">
                          {String(report.challenging_aspects || '—')}
                        </p>
                      </DashboardSection>
                      <DashboardSection
                        title="Angelic Correspondence"
                        icon={<Shield className="w-6 h-6" />}
                        defaultExpanded={false}
                        colorScheme="purple"
                        storageKey="kabbalistic-angelic-correspondence"
                      >
                        <p className="text-slate-700 leading-relaxed">
                          {String(report.angelic_correspondence || '—')}
                        </p>
                      </DashboardSection>
                      <DashboardSection
                        title="Lunar Influence"
                        icon={<Calendar className="w-6 h-6" />}
                        defaultExpanded={false}
                        colorScheme="cyan"
                        storageKey="kabbalistic-lunar-influence"
                      >
                        <p className="text-slate-700 leading-relaxed">
                          {String(report.lunar_influence || '—')}
                        </p>
                      </DashboardSection>
                      <DashboardSection
                        title="Spiritual Strength"
                        icon={<Heart className="w-6 h-6" />}
                        defaultExpanded={false}
                        colorScheme="green"
                        storageKey="kabbalistic-spiritual-strength"
                      >
                        <p className="text-slate-700 leading-relaxed">
                          {String(report.spiritual_strength ?? '—')}
                        </p>
                      </DashboardSection>
                      <DashboardSection
                        title="Growth Path"
                        icon={<ArrowRight className="w-6 h-6" />}
                        defaultExpanded={false}
                        colorScheme="orange"
                        storageKey="kabbalistic-growth-path"
                      >
                        <p className="text-slate-700 leading-relaxed">
                          {String(report.growth_path ?? '—')}
                        </p>
                      </DashboardSection>
                      <DashboardSection
                        title="Integration Guidance"
                        icon={<Compass className="w-6 h-6" />}
                        defaultExpanded={false}
                        colorScheme="cyan"
                        storageKey="kabbalistic-integration-guidance"
                      >
                        <p className="text-slate-700 leading-relaxed">
                          {String(report.integration_guidance ?? '—')}
                        </p>
                      </DashboardSection>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Info className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                      <p className="text-slate-200 mb-4">Generate your mystical profile to unlock your Kabbalistic Astrology report.</p>
                      <Button asChild className="bg-amber-500 hover:bg-amber-600 text-white">
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
                    <KabbalisticAstrologySeerChatInterface
                      userId={user?.uid || ''}
                      userProfile={userProfile}
                      westernChartData={undefined}
                      kabbalisticReport={
                        comprehensiveKabbalisticReport
                          ? { comprehensiveAnalysis: comprehensiveKabbalisticReport }
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

export default function KabbalisticAstrologyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center starfield-ultra-sharp">
          <div className="animate-pulse text-amber-400">Loading…</div>
        </div>
      }
    >
      <KabbalisticAstrologyPageContent />
    </Suspense>
  );
}
