'use client';

import { Suspense, useState, useMemo } from 'react';
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
import PsychologicalSeerChatInterface from '@/components/PsychologicalSeerChatInterface';
import {
  Star,
  AlertTriangle,
  Sparkles,
  Heart,
  Shield,
  Compass,
  ArrowRight,
  Brain,
  Users,
  Target,
  MessageSquare,
  Activity,
  Navigation,
  Layers,
} from 'lucide-react';

type TabValue = 'introduction' | 'report' | 'ask-the-seer';

function PsychologicalAstrologyPageContent() {
  const { userProfile, user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabValue>('introduction');
  const { report: pipelineReport, loading: isLoading, error, hasReport } = useToolReport('psychologicalAstrology');
  const comprehensivePsychologicalReport = useMemo(() => {
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
    { value: 'report', label: 'Your Psychological Chart' },
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
                Complete your profile to unlock your Psychological Astrology chart
              </p>
              <motion.div
                whileHover={{}}
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

  const report = comprehensivePsychologicalReport as Record<string, unknown> | undefined;
  const defenseMechanisms = Array.isArray(report?.defense_mechanisms)
    ? (report.defense_mechanisms as string[])
    : [];
  const execOverview = report?.executive_overview as Record<string, string> | undefined;
  const hasExtendedReport =
    execOverview && typeof execOverview === 'object' && (
      execOverview.core_personality_pattern ||
      execOverview.identity_summary ||
      report?.personality_structure
    );

  return (
    <ToolReportGuard loading={isLoading} error={error ?? null} toolLabel="Psychological Astrology">
    <div className="starfield-ultra-sharp min-h-screen p-4 overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto py-8">
        <div className="text-center mb-8 pt-4">
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-semibold mb-6">
            <span className="text-teal-300">🧠</span>{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-200 via-teal-400 to-cyan-600">
              Psychological Astrology
            </span>
          </h1>
          <p className="text-slate-200 leading-relaxed text-xl font-light">
            Inner patterns and emotional dynamics — not prediction
          </p>
        </div>

        <div className="rounded-2xl border border-amber-500/30 bg-slate-900/80 overflow-hidden">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)} className="w-full min-w-0">
          <TabsList className="flex w-full flex-nowrap overflow-x-auto gap-1 sm:gap-2 p-2 sm:p-3 bg-slate-800/50 border-b border-amber-500/20 rounded-none h-auto min-h-0 justify-start [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-amber-500/30">
            {tabsConfig.map((tab) => (
              <motion.div
                key={tab.value}
                whileHover={{}}
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
                      layoutId="activeTabPsychological"
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
                  <ToolIntroductionTab toolSlug="psychological-astrology" />
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
                      <p className="text-slate-300 mb-4">Generate your mystical profile to unlock your Psychological Astrology report.</p>
                      <Button asChild className="bg-teal-500 hover:bg-teal-600 text-white">
                        <Link href="/profile">Generate your mystical profile</Link>
                      </Button>
                    </div>
                  ) : report ? (
                    <ToolReportViralShell toolSlug="psychologicalAstrology" reportForTeaser={pipelineReport}>
                    <div className="space-y-6">
                      {hasExtendedReport && execOverview != null ? (
                        <DashboardSection
                          title="Executive Psychological Overview"
                          icon={<Compass className="w-6 h-6" />}
                          defaultExpanded
                          colorScheme="cyan"
                          storageKey="psychological-executive-overview"
                        >
                          <div className="space-y-3 text-slate-700">
                            {(execOverview.core_personality_pattern || execOverview.identity_summary) && (
                              <p className="leading-relaxed font-medium">
                                {execOverview.core_personality_pattern || execOverview.identity_summary}
                              </p>
                            )}
                            {execOverview.dominant_drives && (
                              <p className="leading-relaxed">
                                <span className="font-medium">Dominant drives: </span>
                                {execOverview.dominant_drives}
                              </p>
                            )}
                            {execOverview.primary_inner_conflict && (
                              <p className="leading-relaxed">
                                <span className="font-medium">Primary inner conflict: </span>
                                {execOverview.primary_inner_conflict}
                              </p>
                            )}
                            {execOverview.core_developmental_task && (
                              <p className="leading-relaxed">
                                <span className="font-medium">Core developmental task: </span>
                                {execOverview.core_developmental_task}
                              </p>
                            )}
                            {execOverview.identity_summary && execOverview.core_personality_pattern && execOverview.identity_summary !== execOverview.core_personality_pattern && (
                              <p className="leading-relaxed italic">
                                {execOverview.identity_summary}
                              </p>
                            )}
                          </div>
                        </DashboardSection>
                      ) : null}
                      {hasExtendedReport && String(report.personality_structure ?? '').trim() ? (
                        <DashboardSection
                          title="Personality Structure (Sun–Moon–Ascendant)"
                          icon={<Brain className="w-6 h-6" />}
                          defaultExpanded
                          colorScheme="cyan"
                          storageKey="psychological-personality-structure"
                        >
                          <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                            {String(report.personality_structure)}
                          </p>
                        </DashboardSection>
                      ) : (
                        <DashboardSection
                          title="Core Identity Pattern"
                          icon={<Brain className="w-6 h-6" />}
                          defaultExpanded
                          colorScheme="cyan"
                          storageKey="psychological-core-identity"
                        >
                          <p className="text-slate-700 leading-relaxed">
                            {String(report.core_identity_pattern ?? '—')}
                          </p>
                        </DashboardSection>
                      )}
                      {hasExtendedReport && String(report.ego_development ?? '').trim() ? (
                        <DashboardSection
                          title="Ego Development & Self-Concept"
                          icon={<Target className="w-6 h-6" />}
                          defaultExpanded={false}
                          colorScheme="amber"
                          storageKey="psychological-ego-development"
                        >
                          <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                            {String(report.ego_development)}
                          </p>
                        </DashboardSection>
                      ) : null}
                      {(hasExtendedReport && String(report.emotional_patterning ?? '').trim()) ? (
                        <DashboardSection
                          title="Emotional Patterning & Attachment"
                          icon={<Heart className="w-6 h-6" />}
                          defaultExpanded
                          colorScheme="pink"
                          storageKey="psychological-emotional-patterning"
                        >
                          <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                            {String(report.emotional_patterning)}
                          </p>
                        </DashboardSection>
                      ) : (
                        <DashboardSection
                          title="Emotional Signature"
                          icon={<Heart className="w-6 h-6" />}
                          defaultExpanded
                          colorScheme="pink"
                          storageKey="psychological-emotional-signature"
                        >
                          <p className="text-slate-700 leading-relaxed">
                            {String(report.emotional_signature ?? '—')}
                          </p>
                        </DashboardSection>
                      )}
                      <DashboardSection
                        title="Defense Mechanisms"
                        icon={<Shield className="w-6 h-6" />}
                        badge={defenseMechanisms.length ? `${defenseMechanisms.length} themes` : undefined}
                        defaultExpanded={false}
                        colorScheme="orange"
                        storageKey="psychological-defense-mechanisms"
                      >
                        {defenseMechanisms.length ? (
                          <ul className="list-disc list-inside text-slate-700 space-y-1">
                            {defenseMechanisms.map((c, i) => (
                              <li key={i}>{c}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-slate-700">—</p>
                        )}
                      </DashboardSection>
                      {(hasExtendedReport && String(report.shadow_projection ?? '').trim()) ? (
                        <DashboardSection
                          title="Shadow & Projection Dynamics"
                          icon={<Sparkles className="w-6 h-6" />}
                          defaultExpanded={false}
                          colorScheme="purple"
                          storageKey="psychological-shadow-projection"
                        >
                          <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                            {String(report.shadow_projection)}
                          </p>
                        </DashboardSection>
                      ) : (
                        <DashboardSection
                          title="Shadow Theme"
                          icon={<Sparkles className="w-6 h-6" />}
                          defaultExpanded={false}
                          colorScheme="purple"
                          storageKey="psychological-shadow-theme"
                        >
                          <p className="text-slate-700 leading-relaxed">
                            {String(report.shadow_theme ?? '—')}
                          </p>
                        </DashboardSection>
                      )}
                      {hasExtendedReport && String(report.cognitive_style ?? '').trim() ? (
                        <DashboardSection
                          title="Cognitive Style & Communication"
                          icon={<MessageSquare className="w-6 h-6" />}
                          defaultExpanded={false}
                          colorScheme="blue"
                          storageKey="psychological-cognitive-style"
                        >
                          <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                            {String(report.cognitive_style)}
                          </p>
                        </DashboardSection>
                      ) : null}
                      {hasExtendedReport && String(report.conflict_defense ?? '').trim() ? (
                        <DashboardSection
                          title="Conflict & Defense Mechanisms"
                          icon={<Shield className="w-6 h-6" />}
                          defaultExpanded={false}
                          colorScheme="orange"
                          storageKey="psychological-conflict-defense"
                        >
                          <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                            {String(report.conflict_defense)}
                          </p>
                        </DashboardSection>
                      ) : null}
                      {(hasExtendedReport && String(report.relationship_psychology ?? '').trim()) ? (
                        <DashboardSection
                          title="Relationship Psychology"
                          icon={<Users className="w-6 h-6" />}
                          defaultExpanded={false}
                          colorScheme="blue"
                          storageKey="psychological-relationship-psychology"
                        >
                          <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                            {String(report.relationship_psychology)}
                          </p>
                        </DashboardSection>
                      ) : (
                        <DashboardSection
                          title="Relationship Pattern"
                          icon={<Users className="w-6 h-6" />}
                          defaultExpanded={false}
                          colorScheme="blue"
                          storageKey="psychological-relationship-pattern"
                        >
                          <p className="text-slate-700 leading-relaxed">
                            {String(report.relationship_pattern ?? '—')}
                          </p>
                        </DashboardSection>
                      )}
                      {(hasExtendedReport && String(report.life_themes ?? '').trim()) ? (
                        <DashboardSection
                          title="Life Themes & Developmental Arcs"
                          icon={<Activity className="w-6 h-6" />}
                          defaultExpanded={false}
                          colorScheme="green"
                          storageKey="psychological-life-themes"
                        >
                          <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                            {String(report.life_themes)}
                          </p>
                        </DashboardSection>
                      ) : (
                        <DashboardSection
                          title="Growth Focus"
                          icon={<Target className="w-6 h-6" />}
                          defaultExpanded
                          colorScheme="green"
                          storageKey="psychological-growth-focus"
                        >
                          <p className="text-slate-700 leading-relaxed">
                            {String(report.growth_focus ?? '—')}
                          </p>
                        </DashboardSection>
                      )}
                      {hasExtendedReport && String(report.life_path ?? '').trim() ? (
                        <DashboardSection
                          title="Life Path (North Node & South Node)"
                          icon={<Navigation className="w-6 h-6" />}
                          defaultExpanded={false}
                          colorScheme="green"
                          storageKey="psychological-life-path"
                        >
                          <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                            {String(report.life_path)}
                          </p>
                        </DashboardSection>
                      ) : null}
                      {hasExtendedReport && String(report.inner_dynamics ?? '').trim() ? (
                        <DashboardSection
                          title="Inner Dynamics (Major Aspects)"
                          icon={<Layers className="w-6 h-6" />}
                          defaultExpanded={false}
                          colorScheme="purple"
                          storageKey="psychological-inner-dynamics"
                        >
                          <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                            {String(report.inner_dynamics)}
                          </p>
                        </DashboardSection>
                      ) : null}
                      {(hasExtendedReport && String(report.integration_growth_plan ?? '').trim()) ? (
                        <DashboardSection
                          title="Integration & Growth Plan"
                          icon={<ArrowRight className="w-6 h-6" />}
                          defaultExpanded
                          colorScheme="cyan"
                          storageKey="psychological-integration-growth-plan"
                        >
                          <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                            {String(report.integration_growth_plan)}
                          </p>
                        </DashboardSection>
                      ) : (
                        <DashboardSection
                          title="Integration Guidance"
                          icon={<ArrowRight className="w-6 h-6" />}
                          defaultExpanded={false}
                          colorScheme="cyan"
                          storageKey="psychological-integration"
                        >
                          <p className="text-slate-700 leading-relaxed">
                            {String(report.integration_guidance ?? '—')}
                          </p>
                        </DashboardSection>
                      )}
                    </div>
                    </ToolReportViralShell>
                  ) : (
                    <div className="text-center py-8">
                      <Brain className="w-12 h-12 text-teal-400 mx-auto mb-4" />
                      <p className="text-slate-200 mb-4">Generate your mystical profile to unlock your Psychological Astrology report.</p>
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
                    <PsychologicalSeerChatInterface
                      userId={user?.uid || ''}
                      userProfile={userProfile}
                      westernChartData={westernChartData}
                      psychologicalReport={
                        comprehensivePsychologicalReport
                          ? { comprehensiveAnalysis: comprehensivePsychologicalReport }
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

export default function PsychologicalAstrologyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center starfield-ultra-sharp">
          <div className="animate-pulse text-teal-400">Loading…</div>
        </div>
      }
    >
      <PsychologicalAstrologyPageContent />
    </Suspense>
  );
}
