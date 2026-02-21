'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { useToolReport, useComprehensiveMysticalProfile } from '@/hooks/useComprehensiveMysticalProfile';
import { ToolReportGuard } from '@/components/ToolReportGuard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToolIntroductionTab } from '@/components/ToolIntroductionTab';
import { Eye, Sparkles, MessageCircle } from 'lucide-react';
import { BibliomancyReportView } from '@/components/BibliomancyReportView';
import { BibliomancySeerChatInterface } from '@/components/BibliomancySeerChatInterface';

type TabValue = 'introduction' | 'report' | 'ask-the-seer';

function BibliomancyPageContent() {
  const { user, userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<TabValue>('introduction');
  const { report: pipelineReport, loading: isLoading, error, hasReport } = useToolReport('bibliomancy');
  const { profile } = useComprehensiveMysticalProfile();

  const bibliomancyReport = useMemo(() => {
    if (pipelineReport == null || typeof pipelineReport !== 'object') return null;
    const outer = pipelineReport as Record<string, unknown>;
    const raw = outer?.texts != null ? outer : (outer?.data ?? outer) as Record<string, unknown>;
    if (raw?.placeholder === true && !raw?.texts) return null;
    return raw;
  }, [pipelineReport]);

  const toolReports = (profile as Record<string, unknown> | null)?.toolReports as Record<string, { status?: string }> | undefined;
  const bibliomancyFailed = Boolean(
    userProfile?.mysticalProfileGenerated && toolReports?.bibliomancy?.status === 'failed'
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
    <ToolReportGuard loading={isLoading} error={error ?? null} toolLabel="Bibliomancy">
      <div className="starfield-ultra-sharp min-h-screen p-4 overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto py-8">
          <div className="text-center mb-8 pt-4">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-semibold mb-6">
              <span className="text-amber-400">📖</span>{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-600">
                Bibliomancy
              </span>
            </h1>
            <p className="text-slate-200 leading-relaxed text-xl font-light">
              Sacred text divination — Bible, Quran, Bhagavad Gita, Torah & Hafez for symbolic reflection
            </p>
          </div>

          <div className="rounded-2xl border border-amber-500/30 bg-slate-900/80 overflow-hidden">
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as TabValue)}
              className="w-full min-w-0"
            >
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
                      className="w-full sm:w-auto shrink-0 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 rounded-t-lg rounded-b-none px-4 py-2.5 text-sm font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 transition-all flex items-center justify-center relative overflow-hidden border border-transparent data-[state=inactive]:border-slate-600/50"
                    >
                      {tab.label}
                      {activeTab === tab.value && (
                        <motion.div
                          layoutId="bibliomancyActiveTab"
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
                    <TabsContent
                      value="introduction"
                      className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0"
                    >
                      <ToolIntroductionTab toolSlug="bibliomancy" />
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
                    className="bg-gradient-to-b from-amber-50/98 to-slate-100/98 min-h-[60vh]"
                  >
                    <TabsContent
                      value="report"
                      className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0 border-0 bg-transparent"
                    >
                      {isLoading ? (
                        <div className="text-center py-12">
                          <div className="w-12 h-12 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                          <p className="text-slate-200">Loading your bibliomancy report…</p>
                        </div>
                      ) : !hasReport || !bibliomancyReport ? (
                        <div className="text-center py-12">
                          <Eye className="w-14 h-14 text-amber-400/70 mx-auto mb-4" />
                          {bibliomancyFailed ? (
                            <>
                              <p className="text-slate-300 mb-4">
                                Bibliomancy couldn&apos;t be generated in the last run. Generate your mystical profile again from your Profile page to include it.
                              </p>
                              <Button asChild className="bg-amber-500 hover:bg-amber-600 text-white">
                                <Link href="/profile">
                                  <Sparkles className="w-4 h-4 mr-2" />
                                  Regenerate mystical profile
                                </Link>
                              </Button>
                            </>
                          ) : (
                            <>
                              <p className="text-slate-300 mb-4">
                                Generate your mystical profile to unlock your Bibliomancy report. Your
                                personalized sacred-text reading will appear here.
                              </p>
                              <div className="flex flex-wrap gap-3 justify-center">
                                <Button asChild className="bg-amber-500 hover:bg-amber-600 text-white">
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
                        <BibliomancyReportView report={bibliomancyReport} />
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
                      {!hasReport || !bibliomancyReport ? (
                        <div className="text-center py-12">
                          <MessageCircle className="w-14 h-14 text-amber-400/70 mx-auto mb-4" />
                          {bibliomancyFailed ? (
                            <>
                              <p className="text-slate-300 mb-4">
                                Bibliomancy couldn&apos;t be generated in the last run. Generate your mystical profile again from your Profile page.
                              </p>
                              <Button asChild className="bg-amber-500 hover:bg-amber-600 text-white">
                                <Link href="/profile">
                                  <Sparkles className="w-4 h-4 mr-2" />
                                  Regenerate mystical profile
                                </Link>
                              </Button>
                            </>
                          ) : (
                            <>
                              <p className="text-slate-300 mb-4">
                                Generate your mystical profile once from your Profile page to unlock Bibliomancy and use Ask the Seer.
                              </p>
                              <Button asChild className="bg-amber-500 hover:bg-amber-600 text-white">
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
                          <BibliomancySeerChatInterface
                            report={bibliomancyReport}
                            userProfile={userProfile as unknown as Record<string, unknown>}
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
            Bibliomancy is offered as symbolic reflection only. It is not prophecy, theological authority, or substitute for religious guidance.
          </p>
        </div>
      </div>
    </ToolReportGuard>
  );
}

export default function BibliomancyPage() {
  return <BibliomancyPageContent />;
}
