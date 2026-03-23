"use client";

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
import AstrocartographySeerChatInterface from '@/components/AstrocartographySeerChatInterface';
import { Globe, MapPin, Compass, Info, Sparkles, BookOpen, Layers, ListChecks, GitMerge, Briefcase, AlertCircle, ClipboardList } from 'lucide-react';

function AstrocartographyPageContent() {
  const { user, userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'introduction' | 'astrocartography' | 'ask-the-seer'>('introduction');
  const { report: pipelineReport, loading: isLoadingReport, error, hasReport } = useToolReport('astrocartography');
  const comprehensiveReport = useMemo(() => {
    if (pipelineReport == null || typeof pipelineReport !== 'object') return null;
    const raw = pipelineReport as Record<string, unknown>;
    return (raw.comprehensiveAnalysis as Record<string, unknown>) ?? raw;
  }, [pipelineReport]);

  const hasCompleteDetails = !!(userProfile?.birthDate && userProfile?.birthTime && userProfile?.birthPlace);

  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const motionConfig = useMemo(
    () => (prefersReducedMotion ? {} : { duration: 0.3, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }),
    [prefersReducedMotion]
  );

  const tabsConfig = useMemo(
    () => [
      { value: 'introduction', label: 'Introduction' },
      { value: 'astrocartography', label: 'Astrocartography' },
      { value: 'ask-the-seer', label: 'Ask the Seer' },
    ],
    []
  );

  if (!hasCompleteDetails) {
    return (
      <div className="relative min-h-screen starfield-ultra-sharp">
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md glass-card border-white/10 rounded-xl text-white">
            <CardContent className="p-6 text-center text-white">
              <Globe className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">Profile Incomplete</h2>
              <p className="text-slate-200 mb-4">Complete your profile (birth date, time, and place) to unlock your Astrocartography report</p>
              <motion.div
                whileHover={{}}
                whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
                transition={prefersReducedMotion ? {} : { type: 'spring', stiffness: 400, damping: 17 }}
              >
                <Button
                  onClick={() => (window.location.href = '/profile-setup')}
                  className="bg-cyan-500 hover:bg-cyan-600 text-white focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-transparent"
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

  return (
    <ToolReportGuard loading={isLoadingReport} error={error ?? null} toolLabel="Astrocartography">
    <div className="starfield-ultra-sharp min-h-screen p-4 overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto py-8">
        <div className="text-center mb-8 pt-4">
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-semibold mb-6">
            <span className="text-cyan-400">🌍</span>{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-teal-400 to-cyan-600">
              Astrocartography
            </span>
          </h1>
          <p className="text-slate-200 leading-relaxed text-xl font-light">
            Where planetary energies activate for you — location-based insight, not prediction
          </p>
        </div>

        <div className="rounded-2xl border border-amber-500/30 bg-slate-900/80 overflow-hidden">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="w-full min-w-0">
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
                      layoutId="activeTab"
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
                  <ToolIntroductionTab toolSlug="astrocartography" />
                </TabsContent>
              </motion.div>
            )}

            {activeTab === 'astrocartography' && (
              <motion.div
                key="astrocartography"
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? {} : { opacity: 0, y: -20 }}
                transition={motionConfig}
              >
                <TabsContent value="astrocartography" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                  {isLoadingReport && (
                    <div className="text-center py-12">
                      <motion.div
                        className="w-16 h-16 mx-auto mb-4"
                        animate={prefersReducedMotion ? {} : { rotate: 360 }}
                        transition={prefersReducedMotion ? {} : { duration: 1.5, repeat: Infinity, ease: 'linear' }}
                      >
                        <Globe className="w-16 h-16 text-cyan-400" />
                      </motion.div>
                      <p className="text-slate-200">Generating your Astrocartography report…</p>
                    </div>
                  )}
                  {error && (
                    <div className="text-center py-8">
                      <Info className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                      <p className="text-slate-200 mb-4">{error}</p>
                    </div>
                  )}
                  {!hasReport && !isLoadingReport && !error && (
                    <div className="text-center py-8">
                      <p className="text-slate-300 mb-4">Generate your mystical profile to unlock your Astrocartography report.</p>
                      <Button asChild className="bg-cyan-500 hover:bg-cyan-600 text-white">
                        <Link href="/profile">Generate your mystical profile</Link>
                      </Button>
                    </div>
                  )}
                  {hasReport && comprehensiveReport && (
                    <ToolReportViralShell toolSlug="astrocartography" reportForTeaser={pipelineReport}>
                    <div className="space-y-6">
                      {/* Cover / Metadata */}
                      {(comprehensiveReport.cover || userProfile) && (
                        <DashboardSection
                          title="Report for"
                          icon={<Globe className="w-6 h-6" />}
                          defaultExpanded={true}
                          colorScheme="cyan"
                          storageKey="astrocartography-cover"
                        >
                          <div className="prose prose-slate max-w-none text-slate-700">
                            <p className="font-medium text-cyan-900">
                              Astrocartography Report for {(comprehensiveReport.cover as { reportFor?: string })?.reportFor ?? userProfile?.fullName ?? userProfile?.displayName ?? 'You'}
                            </p>
                            <ul className="list-none space-y-1 mt-2 text-slate-600">
                              <li>Birth date: {(comprehensiveReport.cover as { birthDate?: string })?.birthDate ?? userProfile?.birthDate}</li>
                              <li>Birth time: {(comprehensiveReport.cover as { birthTime?: string })?.birthTime ?? userProfile?.birthTime ?? '—'}</li>
                              <li>Birth place: {(comprehensiveReport.cover as { birthPlace?: string })?.birthPlace ?? userProfile?.birthPlace}</li>
                              {(comprehensiveReport.cover as { calculationNote?: string })?.calculationNote && (
                                <li className="text-slate-500 text-sm mt-2">{(comprehensiveReport.cover as { calculationNote?: string }).calculationNote}</li>
                              )}
                            </ul>
                          </div>
                        </DashboardSection>
                      )}

                      {/* Overview */}
                      <DashboardSection
                        title="Overview"
                        icon={<Globe className="w-6 h-6" />}
                        defaultExpanded={true}
                        colorScheme="cyan"
                        storageKey="astrocartography-overview"
                      >
                        <div className="prose prose-slate max-w-none">
                          <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                            {typeof comprehensiveReport.overview === 'string'
                              ? comprehensiveReport.overview
                              : 'Overview will appear once your report is ready.'}
                          </p>
                        </div>
                      </DashboardSection>

                      {/* How to Read This Map */}
                      {comprehensiveReport.howToReadMap != null && comprehensiveReport.howToReadMap !== '' && (
                        <DashboardSection
                          title="How to Read This Map"
                          icon={<BookOpen className="w-6 h-6" />}
                          defaultExpanded={false}
                          colorScheme="cyan"
                          storageKey="astrocartography-how-to-read"
                        >
                          <div className="prose prose-slate max-w-none">
                            <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                              {typeof comprehensiveReport.howToReadMap === 'string'
                                ? comprehensiveReport.howToReadMap
                                : JSON.stringify(comprehensiveReport.howToReadMap)}
                            </p>
                          </div>
                        </DashboardSection>
                      )}

                      {/* Angles & Planetary Key + Orb of Influence */}
                      {(comprehensiveReport.angleExplanations != null || comprehensiveReport.planetaryKey != null || comprehensiveReport.orbOfInfluence != null) && (
                        <DashboardSection
                          title="Angles & Planetary Key"
                          icon={<Layers className="w-6 h-6" />}
                          defaultExpanded={false}
                          colorScheme="green"
                          storageKey="astrocartography-angles-planetary"
                        >
                          <div className="prose prose-slate max-w-none space-y-4 text-slate-700">
                            {comprehensiveReport.angleExplanations != null && (
                              <div>
                                <p className="font-medium text-cyan-800 mb-1">Angles</p>
                                <p className="leading-relaxed whitespace-pre-line">
                                  {typeof comprehensiveReport.angleExplanations === 'string'
                                    ? comprehensiveReport.angleExplanations
                                    : typeof comprehensiveReport.angleExplanations === 'object'
                                      ? Object.entries(comprehensiveReport.angleExplanations as Record<string, string>).map(([k, v]) => `${k}: ${v}`).join('\n')
                                      : String(comprehensiveReport.angleExplanations)}
                                </p>
                              </div>
                            )}
                            {comprehensiveReport.planetaryKey != null && (
                              <div>
                                <p className="font-medium text-cyan-800 mb-1">Planetary meanings</p>
                                <p className="leading-relaxed whitespace-pre-line">
                                  {typeof comprehensiveReport.planetaryKey === 'string'
                                    ? comprehensiveReport.planetaryKey
                                    : typeof comprehensiveReport.planetaryKey === 'object'
                                      ? Object.entries(comprehensiveReport.planetaryKey as Record<string, string>).map(([k, v]) => `${k}: ${v}`).join('\n')
                                      : String(comprehensiveReport.planetaryKey)}
                                </p>
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-cyan-800 mb-1">Orb of influence</p>
                              <p className="leading-relaxed">
                                {comprehensiveReport.orbOfInfluence != null && comprehensiveReport.orbOfInfluence !== ''
                                  ? (typeof comprehensiveReport.orbOfInfluence === 'string'
                                      ? comprehensiveReport.orbOfInfluence
                                      : String(comprehensiveReport.orbOfInfluence))
                                  : 'Influence is typically strong within about 300–500 miles (approx. 450–800 km) of a line.'}
                              </p>
                            </div>
                          </div>
                        </DashboardSection>
                      )}

                      {/* Key Planetary Lines */}
                      <DashboardSection
                        title="Key Planetary Lines"
                        icon={<Compass className="w-6 h-6" />}
                        badge="MC, IC, ASC, DSC"
                        defaultExpanded={true}
                        colorScheme="green"
                        storageKey="astrocartography-lines"
                      >
                        {Array.isArray(comprehensiveReport.keyPlanetaryLines) &&
                        comprehensiveReport.keyPlanetaryLines.length > 0 ? (
                          <ul className="space-y-3 text-slate-700">
                            {comprehensiveReport.keyPlanetaryLines.map(
                              (line: { angle?: string; planet?: string; theme?: string }, i: number) => (
                                <li key={i} className="flex gap-2">
                                  <span className="font-medium text-cyan-800">
                                    {line.planet} {line.angle}:
                                  </span>
                                  <span>{line.theme}</span>
                                </li>
                              )
                            )}
                          </ul>
                        ) : (
                          <p className="text-slate-600">Key planetary line themes will appear in your report.</p>
                        )}
                      </DashboardSection>

                      {/* Regions & Themes */}
                      <DashboardSection
                        title="Regions & Themes"
                        icon={<MapPin className="w-6 h-6" />}
                        defaultExpanded={false}
                        colorScheme="cyan"
                        storageKey="astrocartography-regions"
                      >
                        <div className="prose prose-slate max-w-none">
                          <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                            {typeof comprehensiveReport.themesByRegion === 'string'
                              ? comprehensiveReport.themesByRegion
                              : 'Regional themes will appear in your report.'}
                          </p>
                        </div>
                      </DashboardSection>

                      {/* Best Places Summary + Location Highlights */}
                      {(comprehensiveReport.bestPlacesSummary != null || (Array.isArray(comprehensiveReport.locationHighlights) && comprehensiveReport.locationHighlights.length > 0)) && (
                        <DashboardSection
                          title="Best Places Summary"
                          icon={<ListChecks className="w-6 h-6" />}
                          defaultExpanded={false}
                          colorScheme="green"
                          storageKey="astrocartography-best-places"
                        >
                          <div className="prose prose-slate max-w-none space-y-4 text-slate-700">
                            {comprehensiveReport.bestPlacesSummary != null && (
                              <div className="leading-relaxed whitespace-pre-line">
                                {typeof comprehensiveReport.bestPlacesSummary === 'string'
                                  ? comprehensiveReport.bestPlacesSummary
                                  : typeof comprehensiveReport.bestPlacesSummary === 'object'
                                    ? Object.entries(comprehensiveReport.bestPlacesSummary as Record<string, string>).map(([k, v]) => `${k}: ${v}`).join('\n\n')
                                    : String(comprehensiveReport.bestPlacesSummary)}
                              </div>
                            )}
                            {Array.isArray(comprehensiveReport.locationHighlights) && comprehensiveReport.locationHighlights.length > 0 && (
                              <ul className="space-y-2 list-disc pl-5">
                                {comprehensiveReport.locationHighlights.map(
                                  (item: { regionOrCity?: string; line?: string; interpretation?: string } | string, i: number) =>
                                    typeof item === 'string' ? (
                                      <li key={i}>{item}</li>
                                    ) : (
                                      <li key={i}>
                                        <span className="font-medium text-cyan-800">{item.regionOrCity ?? 'Location'}</span>
                                        {item.line && ` — ${item.line}`}
                                        {item.interpretation && `: ${item.interpretation}`}
                                      </li>
                                    )
                                )}
                              </ul>
                            )}
                          </div>
                        </DashboardSection>
                      )}

                      {/* Cross-Line Dynamics */}
                      {comprehensiveReport.crossLineDynamics != null && comprehensiveReport.crossLineDynamics !== '' && (
                        <DashboardSection
                          title="Cross-Line Dynamics"
                          icon={<GitMerge className="w-6 h-6" />}
                          defaultExpanded={false}
                          colorScheme="cyan"
                          storageKey="astrocartography-cross-line"
                        >
                          <div className="prose prose-slate max-w-none">
                            <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                              {typeof comprehensiveReport.crossLineDynamics === 'string'
                                ? comprehensiveReport.crossLineDynamics
                                : String(comprehensiveReport.crossLineDynamics)}
                            </p>
                          </div>
                        </DashboardSection>
                      )}

                      {/* Practical Scenarios */}
                      {comprehensiveReport.practicalScenarios != null && comprehensiveReport.practicalScenarios !== '' && (
                        <DashboardSection
                          title="Practical Scenarios"
                          icon={<Briefcase className="w-6 h-6" />}
                          defaultExpanded={false}
                          colorScheme="green"
                          storageKey="astrocartography-scenarios"
                        >
                          <div className="prose prose-slate max-w-none">
                            <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                              {typeof comprehensiveReport.practicalScenarios === 'string'
                                ? comprehensiveReport.practicalScenarios
                                : String(comprehensiveReport.practicalScenarios)}
                            </p>
                          </div>
                        </DashboardSection>
                      )}

                      {/* Relocation Guidance */}
                      <DashboardSection
                        title="Relocation Guidance"
                        icon={<Sparkles className="w-6 h-6" />}
                        defaultExpanded={false}
                        colorScheme="green"
                        storageKey="astrocartography-relocation"
                      >
                        <div className="prose prose-slate max-w-none">
                          <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                            {typeof comprehensiveReport.relocationGuidance === 'string'
                              ? comprehensiveReport.relocationGuidance
                              : 'Relocation guidance will appear in your report.'}
                          </p>
                        </div>
                      </DashboardSection>

                      {/* Limitations */}
                      <DashboardSection
                        title="Limitations"
                        icon={<AlertCircle className="w-6 h-6" />}
                        defaultExpanded={false}
                        colorScheme="cyan"
                        storageKey="astrocartography-limitations"
                      >
                        <div className="prose prose-slate max-w-none">
                          <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                            {comprehensiveReport.limitations != null && comprehensiveReport.limitations !== ''
                              ? (typeof comprehensiveReport.limitations === 'string'
                                  ? comprehensiveReport.limitations
                                  : String(comprehensiveReport.limitations))
                              : 'This report is interpretive, not deterministic; local culture, economics, and personal choice also matter.'}
                          </p>
                        </div>
                      </DashboardSection>

                      {/* Summary Snapshot */}
                      {comprehensiveReport.summarySnapshot != null && comprehensiveReport.summarySnapshot !== '' && (
                        <DashboardSection
                          title="Summary Snapshot"
                          icon={<ClipboardList className="w-6 h-6" />}
                          defaultExpanded={true}
                          colorScheme="green"
                          storageKey="astrocartography-snapshot"
                        >
                          <div className="prose prose-slate max-w-none">
                            {typeof comprehensiveReport.summarySnapshot === 'string' ? (
                              <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                                {comprehensiveReport.summarySnapshot}
                              </p>
                            ) : typeof comprehensiveReport.summarySnapshot === 'object' ? (
                              <ul className="space-y-2 list-disc pl-5 text-slate-700">
                                {Object.entries(comprehensiveReport.summarySnapshot as Record<string, string>).map(([k, v]) => (
                                  <li key={k}>
                                    <span className="font-medium text-cyan-800">{k}:</span> {v}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-slate-700">{String(comprehensiveReport.summarySnapshot)}</p>
                            )}
                          </div>
                        </DashboardSection>
                      )}
                    </div>
                    </ToolReportViralShell>
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
                    <AstrocartographySeerChatInterface
                      userId={user?.uid || ''}
                      userProfile={userProfile}
                      astrocartographyData={
                        comprehensiveReport
                          ? { comprehensiveAnalysis: comprehensiveReport }
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

export default function AstrocartographyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center starfield-ultra-sharp">
          <div className="animate-pulse text-cyan-400">Loading…</div>
        </div>
      }
    >
      <AstrocartographyPageContent />
    </Suspense>
  );
}
