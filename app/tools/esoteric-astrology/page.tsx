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
import EsotericSeerChatInterface from '@/components/EsotericSeerChatInterface';
import {
  Star,
  AlertTriangle,
  Info,
  Sparkles,
  Heart,
  Target,
  Compass,
  Shield,
  ArrowRight,
  BookOpen,
  Moon,
  Cross,
  Triangle,
  TrendingUp,
  FileText,
} from 'lucide-react';

type TabValue = 'introduction' | 'report' | 'ask-the-seer';

function EsotericAstrologyPageContent() {
  const { user, userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<TabValue>('introduction');
  const { report: pipelineReport, loading: isLoading, error, hasReport } = useToolReport('esotericAstrology');
  const comprehensiveEsotericReport = useMemo(() => {
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
    { value: 'report', label: 'Your Soul Chart' },
    { value: 'ask-the-seer', label: 'Ask the Seer' },
  ];

  if (!hasCompleteDetails) {
    return (
      <div className="relative min-h-screen starfield-ultra-sharp">
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md glass-card border-white/10 rounded-xl text-white">
            <CardContent className="p-6 text-center text-white">
              <Star className="w-12 h-12 text-violet-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">Profile Incomplete</h2>
              <p className="text-slate-200 mb-4">
                Complete your profile to unlock your Esoteric Astrology soul chart
              </p>
              <motion.div
                whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
                transition={prefersReducedMotion ? {} : { type: 'spring', stiffness: 400, damping: 17 }}
              >
                <Button
                  onClick={() => (window.location.href = '/profile-setup')}
                  className="bg-violet-500 hover:bg-violet-600 text-white focus:ring-2 focus:ring-violet-400 focus:ring-offset-2 focus:ring-offset-transparent"
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

  const report = comprehensiveEsotericReport as Record<string, unknown> | undefined;
  const spiritualChallenges = Array.isArray(report?.spiritual_challenges)
    ? (report.spiritual_challenges as string[])
    : [];

  return (
    <ToolReportGuard loading={isLoading} error={error ?? null} toolLabel="Esoteric Astrology">
    <div className="starfield-ultra-sharp min-h-screen p-4 overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto py-8">
        <div className="text-center mb-8 pt-4">
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-semibold mb-6">
            <span className="text-violet-300">✨</span>{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-200 via-violet-400 to-indigo-600">
              Esoteric Astrology
            </span>
          </h1>
          <p className="text-slate-200 leading-relaxed text-xl font-light">
            Soul evolution and spiritual purpose — not prediction
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
                      layoutId="activeTabEsoteric"
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
                  <ToolIntroductionTab toolSlug="esoteric-astrology" />
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
                        className="w-16 h-16 mx-auto mb-4 border-2 border-violet-300 border-t-violet-600 rounded-full"
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
                      <p className="text-slate-300 mb-4">Generate your mystical profile to unlock your Esoteric Astrology report.</p>
                      <Button asChild className="bg-violet-500 hover:bg-violet-600 text-white">
                        <Link href="/profile">Generate your mystical profile</Link>
                      </Button>
                    </div>
                  ) : report ? (
                    <div className="space-y-6">
                      <DashboardSection
                        title="How to read this report"
                        icon={<BookOpen className="w-6 h-6" />}
                        defaultExpanded={false}
                        colorScheme="blue"
                        storageKey="esoteric-how-to-read-v2"
                      >
                        <div className="text-slate-700 space-y-3 text-sm leading-relaxed">
                          <p>
                            This report describes your soul purpose and evolutionary themes, not personality traits or
                            predictions. It answers &quot;why you are here&quot; and what your soul seeks to develop.
                          </p>
                          <p className="font-medium text-slate-800">Glossary:</p>
                          <ul className="list-disc list-inside space-y-1">
                            <li><strong>Soul Ray / Soul Purpose</strong> — The spiritual quality your soul is here to express.</li>
                            <li><strong>Personality Ray</strong> — The energy that shapes your current outer expression.</li>
                            <li><strong>North / South Node</strong> — The Moon’s nodes: South = past mastery and comfort zone; North = growth direction.</li>
                            <li><strong>Esoteric Ruler</strong> — The planet that guides your Ascendant from a soul perspective (different from the traditional ruler).</li>
                            <li><strong>Evolutionary Axis</strong> — The tension between what you’ve outgrown and what you’re moving toward.</li>
                          </ul>
                        </div>
                      </DashboardSection>

                      <DashboardSection
                        title="I — The Soul's Purpose (Ascendant)"
                        icon={<Heart className="w-6 h-6" />}
                        defaultExpanded
                        colorScheme="purple"
                        storageKey="esoteric-soul-purpose-v2"
                      >
                        <div className="text-slate-700 space-y-3 leading-relaxed">
                          <p><strong>Esoteric Ruler:</strong> {String(report.esoteric_ruler ?? report.soul_ruler ?? '—')}</p>
                          {(report.key_mantra as string) && (
                            <p><strong>Key Mantra:</strong> &quot;{String(report.key_mantra)}&quot;</p>
                          )}
                          {(report.soul_purpose_interpretation as string) && (
                            <p>{String(report.soul_purpose_interpretation)}</p>
                          )}
                          {!(report.soul_purpose_interpretation as string) && !(report.key_mantra as string) && (
                            <p>{String(report.soul_ruler ?? '—')}</p>
                          )}
                        </div>
                      </DashboardSection>

                      <DashboardSection
                        title="II — The Instrument (Sun & Rays)"
                        icon={<Target className="w-6 h-6" />}
                        defaultExpanded
                        colorScheme="pink"
                        storageKey="esoteric-instrument-v2"
                      >
                        <div className="text-slate-700 space-y-3 leading-relaxed">
                          {(report.instrument_paragraph as string) && (
                            <p>{String(report.instrument_paragraph)}</p>
                          )}
                          <p><strong>Personality Ruler:</strong> {String(report.personality_ruler ?? '—')}</p>
                          <p><strong>Dominant Ray:</strong> {String(report.dominant_ray ?? '—')}</p>
                          {!(report.instrument_paragraph as string) && (
                            <p>{String(report.soul_ruler ?? '—')}</p>
                          )}
                        </div>
                      </DashboardSection>

                      <DashboardSection
                        title="III — Prison of the Soul (Moon)"
                        icon={<Moon className="w-6 h-6" />}
                        defaultExpanded={false}
                        colorScheme="cyan"
                        storageKey="esoteric-moon-v2"
                      >
                        <div className="text-slate-700 space-y-3 leading-relaxed">
                          {(report.moon_warning as string) && (
                            <p><strong>Warning:</strong> {String(report.moon_warning)}</p>
                          )}
                          {(report.moon_esoteric_task as string) && (
                            <p><strong>Esoteric task:</strong> {String(report.moon_esoteric_task)}</p>
                          )}
                          {!(report.moon_warning as string) && !(report.moon_esoteric_task as string) && (
                            <p>—</p>
                          )}
                        </div>
                      </DashboardSection>

                      <DashboardSection
                        title="IV — Life Direction (The Crosses)"
                        icon={<Cross className="w-6 h-6" />}
                        defaultExpanded
                        colorScheme="amber"
                        storageKey="esoteric-life-direction-v2"
                      >
                        <p className="text-slate-700 leading-relaxed">
                          {String(report.life_direction_sentence ?? report.life_direction_cross ?? '—')}
                        </p>
                      </DashboardSection>

                      {(report.major_energy_circuit as string) && (
                        <DashboardSection
                          title="V — Spiritual Triangles"
                          icon={<Triangle className="w-6 h-6" />}
                          defaultExpanded={false}
                          colorScheme="purple"
                          storageKey="esoteric-triangles-v2"
                        >
                          <p className="text-slate-700 leading-relaxed">
                            {String(report.major_energy_circuit)}
                          </p>
                        </DashboardSection>
                      )}

                      <DashboardSection
                        title="Karmic Axis (Nodes)"
                        icon={<Compass className="w-6 h-6" />}
                        defaultExpanded
                        colorScheme="blue"
                        storageKey="esoteric-karmic-axis-v2"
                      >
                        <div className="text-slate-700 space-y-3 leading-relaxed">
                          {(report.south_node_theme as string) && (
                            <p><strong>South Node (past mastery / comfort zone):</strong> {String(report.south_node_theme)}</p>
                          )}
                          {(report.north_node_theme as string) && (
                            <p><strong>North Node (growth direction):</strong> {String(report.north_node_theme)}</p>
                          )}
                          {Array.isArray(report.karmic_axis_actions) && report.karmic_axis_actions.length > 0 && (
                            <>
                              <p className="font-medium text-slate-800">Actions to consider:</p>
                              <ul className="list-disc list-inside space-y-1">
                                {(report.karmic_axis_actions as string[]).map((a, i) => (
                                  <li key={i}>{a}</li>
                                ))}
                              </ul>
                            </>
                          )}
                          {!(report.south_node_theme as string) && !(report.north_node_theme as string) && !(Array.isArray(report.karmic_axis_actions) && report.karmic_axis_actions.length) && (
                            <p>—</p>
                          )}
                        </div>
                      </DashboardSection>

                      <DashboardSection
                        title="Evolutionary Theme"
                        icon={<Sparkles className="w-6 h-6" />}
                        defaultExpanded
                        colorScheme="blue"
                        storageKey="esoteric-evolutionary-theme-v2"
                      >
                        <p className="text-slate-700 leading-relaxed">
                          {String(report.evolutionary_theme ?? '—')}
                        </p>
                      </DashboardSection>

                      <DashboardSection
                        title="Spiritual Challenges"
                        icon={<Shield className="w-6 h-6" />}
                        badge={spiritualChallenges.length ? `${spiritualChallenges.length} themes` : undefined}
                        defaultExpanded={false}
                        colorScheme="orange"
                        storageKey="esoteric-spiritual-challenges-v2"
                      >
                        {spiritualChallenges.length ? (
                          <ul className="list-disc list-inside text-slate-700 space-y-1">
                            {spiritualChallenges.map((c, i) => (
                              <li key={i}>{c}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-slate-700">—</p>
                        )}
                      </DashboardSection>

                      <DashboardSection
                        title="Soul Growth Focus"
                        icon={<ArrowRight className="w-6 h-6" />}
                        defaultExpanded
                        colorScheme="green"
                        storageKey="esoteric-soul-growth-v2"
                      >
                        <p className="text-slate-700 leading-relaxed">
                          {String(report.soul_growth_focus ?? '—')}
                        </p>
                      </DashboardSection>

                      <DashboardSection
                        title="Integration Guidance"
                        icon={<Compass className="w-6 h-6" />}
                        defaultExpanded={false}
                        colorScheme="cyan"
                        storageKey="esoteric-integration-v2"
                      >
                        <p className="text-slate-700 leading-relaxed">
                          {String(report.integration_guidance ?? '—')}
                        </p>
                      </DashboardSection>

                      {(Array.isArray(report.growth_strengths) && report.growth_strengths.length > 0) ||
                       (Array.isArray(report.growth_patterns_to_transcend) && report.growth_patterns_to_transcend.length > 0) ||
                       (Array.isArray(report.growth_habits) && report.growth_habits.length > 0) ||
                       (Array.isArray(report.growth_mindset_shifts) && report.growth_mindset_shifts.length > 0) ? (
                        <DashboardSection
                          title="Growth Roadmap"
                          icon={<TrendingUp className="w-6 h-6" />}
                          defaultExpanded={false}
                          colorScheme="green"
                          storageKey="esoteric-growth-roadmap-v2"
                        >
                          <div className="text-slate-700 space-y-4 leading-relaxed">
                            {Array.isArray(report.growth_strengths) && report.growth_strengths.length > 0 && (
                              <div>
                                <p className="font-medium text-slate-800">Strengths to leverage</p>
                                <ul className="list-disc list-inside space-y-1">
                                  {(report.growth_strengths as string[]).map((s, i) => (
                                    <li key={i}>{s}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {Array.isArray(report.growth_patterns_to_transcend) && report.growth_patterns_to_transcend.length > 0 && (
                              <div>
                                <p className="font-medium text-slate-800">Patterns to transcend</p>
                                <ul className="list-disc list-inside space-y-1">
                                  {(report.growth_patterns_to_transcend as string[]).map((p, i) => (
                                    <li key={i}>{p}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {Array.isArray(report.growth_habits) && report.growth_habits.length > 0 && (
                              <div>
                                <p className="font-medium text-slate-800">Habits to cultivate</p>
                                <ul className="list-disc list-inside space-y-1">
                                  {(report.growth_habits as string[]).map((h, i) => (
                                    <li key={i}>{h}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {Array.isArray(report.growth_mindset_shifts) && report.growth_mindset_shifts.length > 0 && (
                              <div>
                                <p className="font-medium text-slate-800">Mindset shifts</p>
                                <ul className="list-disc list-inside space-y-1">
                                  {(report.growth_mindset_shifts as string[]).map((m, i) => (
                                    <li key={i}>{m}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </DashboardSection>
                      ) : null}

                      {(report.core_soul_theme as string) ||
                       (report.primary_karmic_lesson as string) ||
                       (report.key_life_arena as string) ||
                       (report.growth_strategy as string) ? (
                        <DashboardSection
                          title="Summary Snapshot"
                          icon={<FileText className="w-6 h-6" />}
                          defaultExpanded={false}
                          colorScheme="purple"
                          storageKey="esoteric-summary-v2"
                        >
                          <div className="text-slate-700 space-y-2 leading-relaxed text-sm">
                            {(report.core_soul_theme as string) && (
                              <p><strong>Core soul theme:</strong> {String(report.core_soul_theme)}</p>
                            )}
                            {(report.primary_karmic_lesson as string) && (
                              <p><strong>Primary karmic lesson:</strong> {String(report.primary_karmic_lesson)}</p>
                            )}
                            {(report.key_life_arena as string) && (
                              <p><strong>Key life arena:</strong> {String(report.key_life_arena)}</p>
                            )}
                            {(report.growth_strategy as string) && (
                              <p><strong>Growth strategy:</strong> {String(report.growth_strategy)}</p>
                            )}
                          </div>
                        </DashboardSection>
                      ) : null}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Info className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                      <p className="text-slate-200 mb-4">Generate your mystical profile to unlock your Esoteric Astrology report.</p>
                      <Button asChild className="bg-violet-500 hover:bg-violet-600 text-white">
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
                    <EsotericSeerChatInterface
                      userId={user?.uid || ''}
                      userProfile={userProfile}
                      westernChartData={undefined}
                      esotericReport={
                        comprehensiveEsotericReport
                          ? { comprehensiveAnalysis: comprehensiveEsotericReport }
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

export default function EsotericAstrologyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center starfield-ultra-sharp">
          <div className="animate-pulse text-violet-400">Loading…</div>
        </div>
      }
    >
      <EsotericAstrologyPageContent />
    </Suspense>
  );
}
