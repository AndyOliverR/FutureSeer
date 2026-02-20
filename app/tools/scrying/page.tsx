'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { useToolReport, useComprehensiveMysticalProfile } from '@/hooks/useComprehensiveMysticalProfile';
import { ToolReportGuard } from '@/components/ToolReportGuard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToolIntroductionTab } from '@/components/ToolIntroductionTab';
import {
  Eye,
  Sparkles,
  FileText,
  AlertTriangle,
  Loader2,
  Flame,
  Droplets,
  Wind,
  Mountain,
  TrendingUp,
  Clock,
  Target,
  MessageCircle,
} from 'lucide-react';
import { ScryingSeerChatInterface } from '@/components/ScryingSeerChatInterface';

type TabValue = 'introduction' | 'report' | 'ask-the-seer';

function ScryingPageContent() {
  const { user, userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<TabValue>('introduction');
  const { report: pipelineReport, loading: isLoading, error, hasReport } = useToolReport('scrying');
  const { profile } = useComprehensiveMysticalProfile();

  const scryingReport = useMemo(() => {
    if (pipelineReport == null || typeof pipelineReport !== 'object') return null;
    const outer = pipelineReport as Record<string, unknown>;
    const raw = (outer?.data ?? outer) as Record<string, unknown>;
    const hasRealContent = raw?.sessionOverview != null || (raw?.scrying_session != null && typeof raw.scrying_session === 'object');
    if (raw?.placeholder === true && !hasRealContent) return null;
    return raw;
  }, [pipelineReport]);

  const toolReports = (profile as Record<string, unknown> | null)?.toolReports as Record<string, { status?: string }> | undefined;
  const scryingFailed = Boolean(
    userProfile?.mysticalProfileGenerated && toolReports?.scrying?.status === 'failed'
  );

  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const motionConfig = useMemo(
    () =>
      prefersReducedMotion
        ? {}
        : { duration: 0.3, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] },
    [prefersReducedMotion]
  );

  const tabsConfig: { value: TabValue; label: string }[] = [
    { value: 'introduction', label: 'Introduction' },
    { value: 'report', label: 'Your Report' },
    { value: 'ask-the-seer', label: 'Ask the Seer' },
  ];

  return (
    <ToolReportGuard loading={isLoading} error={error ?? null} toolLabel="Scrying">
      <div className="starfield-ultra-sharp min-h-screen p-4 overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto py-8">
          <div className="text-center mb-8 pt-4">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-semibold mb-6">
              <span className="text-purple-400">🔮</span>{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-violet-400 to-purple-600">
                Scrying
              </span>
            </h1>
            <p className="text-slate-200 leading-relaxed text-xl font-light">
              Crystal, mirror, water & fire divination — symbolic introspection and archetype-based guidance
            </p>
          </div>

          <div className="rounded-2xl border border-purple-500/30 bg-slate-900/80 overflow-hidden">
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as TabValue)}
              className="w-full min-w-0"
            >
              <TabsList className="flex w-full flex-nowrap overflow-x-auto gap-1 sm:gap-2 p-2 sm:p-3 bg-slate-800/50 border-b border-purple-500/20 rounded-none h-auto min-h-0 justify-start [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-purple-500/30">
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
                      className="w-full sm:w-auto shrink-0 data-[state=active]:bg-gradient-to-br data-[state=active]:from-purple-100 data-[state=active]:to-violet-100 data-[state=active]:text-purple-900 data-[state=active]:shadow-md data-[state=active]:border-b-2 data-[state=active]:border-b-purple-400/80 rounded-t-lg rounded-b-none px-4 py-2.5 text-sm font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 transition-all flex items-center justify-center relative overflow-hidden border border-transparent data-[state=inactive]:border-slate-600/50"
                    >
                      {tab.label}
                      {activeTab === tab.value && (
                        <motion.div
                          layoutId="scryingActiveTab"
                          className="absolute inset-0 bg-gradient-to-br from-purple-100 to-violet-100 rounded-t-lg rounded-b-none -z-10"
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
                    <TabsContent
                      value="introduction"
                      className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0"
                    >
                      <ToolIntroductionTab toolSlug="scrying" />
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
                    className="bg-gradient-to-b from-purple-50/98 to-slate-100/98 min-h-[60vh]"
                  >
                    <TabsContent
                      value="report"
                      className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0 border-0 bg-transparent"
                    >
                      {isLoading ? (
                        <div className="text-center py-12">
                          <Loader2 className="w-12 h-12 mx-auto mb-4 text-purple-400 animate-spin" />
                          <p className="text-slate-200">Loading your scrying report…</p>
                        </div>
                      ) : !hasReport || !scryingReport ? (
                        <div className="text-center py-12">
                          <Eye className="w-14 h-14 text-purple-400/70 mx-auto mb-4" />
                          {scryingFailed ? (
                            <>
                              <p className="text-slate-300 mb-4">
                                Scrying couldn&apos;t be generated in the last run. Generate your mystical profile again from your Profile page to include it.
                              </p>
                              <Button asChild className="bg-purple-500 hover:bg-purple-600 text-white">
                                <Link href="/profile">
                                  <Sparkles className="w-4 h-4 mr-2" />
                                  Regenerate mystical profile
                                </Link>
                              </Button>
                            </>
                          ) : (
                            <>
                              <p className="text-slate-300 mb-4">
                                Generate your mystical profile to unlock your Scrying report. Your
                                personalized symbolic reading will appear here.
                              </p>
                              <div className="flex flex-wrap gap-3 justify-center">
                                <Button asChild className="bg-purple-500 hover:bg-purple-600 text-white">
                                  <Link href="/profile">
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Generate your mystical profile
                                  </Link>
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                      ) : (
                        <ScryingReportView report={scryingReport} />
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
                      className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0"
                    >
                      {!hasReport || !scryingReport ? (
                        <div className="text-center py-12">
                          <MessageCircle className="w-14 h-14 text-purple-400/70 mx-auto mb-4" />
                          {scryingFailed ? (
                            <>
                              <p className="text-slate-300 mb-4">
                                Scrying couldn&apos;t be generated in the last run. Generate your mystical profile again from your Profile page to include it.
                              </p>
                              <Button asChild className="bg-purple-500 hover:bg-purple-600 text-white">
                                <Link href="/profile">
                                  <Sparkles className="w-4 h-4 mr-2" />
                                  Regenerate mystical profile
                                </Link>
                              </Button>
                            </>
                          ) : (
                            <>
                              <p className="text-slate-300 mb-4">
                                Generate your mystical profile once from your Profile page to unlock Scrying and use Ask the Seer.
                              </p>
                              <Button asChild className="bg-purple-500 hover:bg-purple-600 text-white">
                                <Link href="/profile">
                                  <Sparkles className="w-4 h-4 mr-2" />
                                  Generate your mystical profile
                                </Link>
                              </Button>
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="h-[800px] min-h-0">
                          <ScryingSeerChatInterface
                            report={scryingReport}
                            userProfile={userProfile as Record<string, unknown>}
                            userId={user?.uid}
                          />
                        </div>
                      )}
                    </TabsContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Tabs>
          </div>

          <p className="text-slate-500 text-xs text-center mt-6 max-w-2xl mx-auto">
            Scrying is offered as symbolic introspection only. It is not diagnostic, financial, or
            legal advice and does not provide predictive certainty.
          </p>
        </div>
      </div>
    </ToolReportGuard>
  );
}

function ScryingReportView({ report }: { report: Record<string, unknown> }) {
  const session = report.scrying_session as Record<string, unknown> | undefined;
  const context = session?.context as Record<string, unknown> | undefined;
  const observations = session?.observations as Record<string, unknown> | undefined;
  const sessionOverview = report.sessionOverview as string | undefined;
  const dominantSymbolThemes = report.dominantSymbolThemes as string[] | undefined;
  const elementalBalance = report.elementalBalance as Record<string, number> | undefined;
  const elementalBalanceSummary = report.elementalBalanceSummary as string | undefined;
  const archetypalEnergyPattern = report.archetypalEnergyPattern as string | undefined;
  const riskIndicators = report.riskIndicators as string[] | undefined;
  const opportunityIndicators = report.opportunityIndicators as string[] | undefined;
  const timelineOrientation = report.timelineOrientation as
    | { past: string; present: string; future: string }
    | undefined;
  const strategicGuidance = report.strategicGuidance as string | undefined;
  const domainInterpretations = report.domainInterpretations as Record<string, string[]> | undefined;

  const elementIcons: Record<string, React.ReactNode> = {
    fire: <Flame className="w-4 h-4" />,
    water: <Droplets className="w-4 h-4" />,
    wind: <Wind className="w-4 h-4" />,
    earth: <Mountain className="w-4 h-4" />,
  };

  return (
    <div className="space-y-6">
      <p className="text-slate-600 text-xs italic">
        This reading is personalized to your profile (name, birth date, time, and place).
      </p>
      {sessionOverview && (
        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-2 border-purple-200 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-purple-700" />
              <h3 className="font-semibold text-purple-900">Session Overview</h3>
            </div>
            <p className="text-slate-700 text-sm leading-relaxed">{sessionOverview}</p>
            {context && (
              <div className="mt-3 flex flex-wrap gap-2">
                {context.moon_phase && (
                  <span className="inline-flex items-center rounded-full bg-purple-200/80 px-2.5 py-0.5 text-xs text-purple-800">
                    {String(context.moon_phase)}
                  </span>
                )}
                {context.tool && (
                  <span className="inline-flex items-center rounded-full bg-purple-200/80 px-2.5 py-0.5 text-xs text-purple-800">
                    {String(context.tool)}
                  </span>
                )}
                {context.emotional_state && (
                  <span className="inline-flex items-center rounded-full bg-purple-200/80 px-2.5 py-0.5 text-xs text-purple-800">
                    {String(context.emotional_state)}
                  </span>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {dominantSymbolThemes && dominantSymbolThemes.length > 0 && (
        <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-amber-700" />
              <h3 className="font-semibold text-amber-900">Dominant Symbol Themes</h3>
            </div>
            <ul className="list-disc list-inside text-slate-700 text-sm space-y-1">
              {dominantSymbolThemes.map((theme, i) => (
                <li key={i}>{theme}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {(elementalBalance || elementalBalanceSummary) && (
        <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-200 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-4 sm:p-6">
            <h3 className="font-semibold text-cyan-900 mb-2">Elemental Balance</h3>
            {elementalBalance && Object.keys(elementalBalance).length > 0 && (
              <div className="flex flex-wrap gap-3 mb-3">
                {Object.entries(elementalBalance).map(([name, value]) => (
                  <div
                    key={name}
                    className="flex items-center gap-2 rounded-lg bg-white/70 border border-cyan-200 px-3 py-2"
                  >
                    {elementIcons[name] ?? null}
                    <span className="text-slate-700 capitalize">{name}</span>
                    <span className="text-cyan-700 font-medium">{value}</span>
                  </div>
                ))}
              </div>
            )}
            {elementalBalanceSummary && (
              <p className="text-slate-700 text-sm leading-relaxed">{elementalBalanceSummary}</p>
            )}
          </CardContent>
        </Card>
      )}

      {archetypalEnergyPattern && (
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-4 sm:p-6">
            <h3 className="font-semibold text-blue-900 mb-2">Archetypal Energy Pattern</h3>
            <p className="text-slate-700 text-sm capitalize">{archetypalEnergyPattern}</p>
          </CardContent>
        </Card>
      )}

      {riskIndicators && riskIndicators.length > 0 && (
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-amber-700" />
              <h3 className="font-semibold text-amber-900">Risk Indicators</h3>
            </div>
            <ul className="list-disc list-inside text-slate-700 text-sm space-y-1">
              {riskIndicators.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {opportunityIndicators && opportunityIndicators.length > 0 && (
        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-emerald-700" />
              <h3 className="font-semibold text-emerald-900">Opportunity Indicators</h3>
            </div>
            <ul className="list-disc list-inside text-slate-700 text-sm space-y-1">
              {opportunityIndicators.map((o, i) => (
                <li key={i}>{o}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {timelineOrientation && (
        <Card className="bg-gradient-to-br from-violet-50 to-purple-50 border-2 border-violet-200 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-violet-700" />
              <h3 className="font-semibold text-violet-900">Timeline Orientation</h3>
            </div>
            <div className="space-y-2 text-sm text-slate-700">
              <p><strong className="text-slate-900">Past:</strong> {timelineOrientation.past}</p>
              <p><strong className="text-slate-900">Present:</strong> {timelineOrientation.present}</p>
              <p><strong className="text-slate-900">Future:</strong> {timelineOrientation.future}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {strategicGuidance && (
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-purple-700" />
              <h3 className="font-semibold text-purple-900">Strategic Guidance</h3>
            </div>
            <p className="text-slate-700 text-sm leading-relaxed">{strategicGuidance}</p>
          </CardContent>
        </Card>
      )}

      {domainInterpretations && Object.keys(domainInterpretations).length > 0 && (
        <Card className="bg-gradient-to-br from-slate-50 to-blue-50/50 border-2 border-slate-200 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-4 sm:p-6">
            <h3 className="font-semibold text-slate-900 mb-3">Domain Interpretations</h3>
            <div className="space-y-3">
              {Object.entries(domainInterpretations).map(([domain, lines]) =>
                lines && lines.length > 0 ? (
                  <div key={domain}>
                    <h4 className="text-purple-800 text-sm font-medium capitalize mb-1">
                      {domain.replace(/([A-Z])/g, ' $1').trim()}
                    </h4>
                    <ul className="list-disc list-inside text-slate-700 text-xs space-y-0.5">
                      {lines.map((line, i) => (
                        <li key={i}>{line}</li>
                      ))}
                    </ul>
                  </div>
                ) : null
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {observations && (observations.visuals as string[] | undefined)?.length > 0 && (
        <Card className="bg-gradient-to-br from-pink-50 to-rose-50 border-2 border-pink-200 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-4 sm:p-6">
            <h3 className="font-semibold text-pink-900 mb-2">Visual Symbols</h3>
            <p className="text-slate-700 text-sm">
              {(observations.visuals as string[]).join(', ')}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function ScryingPage() {
  return <ScryingPageContent />;
}
