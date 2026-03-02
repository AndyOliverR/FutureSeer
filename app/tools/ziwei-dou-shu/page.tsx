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
import { DevotionistStyleCard } from '@/components/western/DevotionistStyleCard';
import {
  Star,
  AlertTriangle,
  LayoutGrid,
  FileText,
  Heart,
  Briefcase,
  DollarSign,
  Activity,
  Calendar,
  TrendingUp,
} from 'lucide-react';
import ZiWeiDouShuSeerChatInterface from '@/components/ZiWeiDouShuSeerChatInterface';

type TabValue = 'introduction' | 'chart' | 'report' | 'ask-the-seer';

function ZiWeiDouShuPageContent() {
  const { user, userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<TabValue>('introduction');
  const { report: pipelineReport, loading: isLoading, error, hasReport } = useToolReport('ziweiDouShu');

  const ziweiReport = useMemo(() => {
    if (pipelineReport == null || typeof pipelineReport !== 'object') return null;
    const raw = pipelineReport as Record<string, unknown>;
    if (raw.placeholder === true) return null;
    return raw;
  }, [pipelineReport]);

  const chartData = useMemo(() => {
    if (!ziweiReport) return null;
    const chart = (ziweiReport.chartData ?? ziweiReport.chart ?? ziweiReport.astrolabe) as Record<string, unknown> | undefined;
    return chart ?? null;
  }, [ziweiReport]);

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
    { value: 'chart', label: 'Chart' },
    { value: 'report', label: 'Report' },
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
                Complete your birth date, time, and place to unlock your Zi Wei Dou Shu chart.
              </p>
              <motion.div
                whileHover={{}}
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

  const report = ziweiReport as Record<string, unknown> | undefined;

  return (
    <ToolReportGuard loading={isLoading} error={error ?? null} toolLabel="Zi Wei Dou Shu">
      <div className="starfield-ultra-sharp min-h-screen p-4 overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto py-8">
          <div className="text-center mb-8 pt-4">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-semibold mb-6">
              <span className="text-yellow-400">🏮</span>{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600">
                Zi Wei Dou Shu
              </span>
            </h1>
            <p className="text-slate-200 leading-relaxed text-xl font-light">
              紫微斗數 — Purple Star Astrology: 12 palaces, 14 major stars, Four Transformations
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
                      className="w-full sm:w-auto shrink-0 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 rounded-t-lg rounded-b-none px-4 py-2.5 text-sm font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 transition-all flex items-center justify-center relative overflow-hidden border border-transparent data-[state=inactive]:border-slate-600/50"
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
                      <ToolIntroductionTab toolSlug="ziwei-dou-shu" />
                    </TabsContent>
                  </motion.div>
                )}

                {activeTab === 'chart' && (
                  <motion.div
                    key="chart"
                    initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                    animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                    exit={prefersReducedMotion ? {} : { opacity: 0, y: -20 }}
                    transition={motionConfig}
                  >
                    <TabsContent value="chart" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                      {isLoading ? (
                        <div className="text-center py-8">
                          <motion.div
                            className="w-16 h-16 mx-auto mb-4 border-2 border-amber-300 border-t-amber-600 rounded-full"
                            animate={prefersReducedMotion ? {} : { rotate: 360 }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                          />
                          <p className="text-slate-200">Loading your chart…</p>
                        </div>
                      ) : !hasReport || !ziweiReport ? (
                        <div className="text-center py-8">
                          <p className="text-slate-300 mb-4">Generate your mystical profile to unlock your Zi Wei Dou Shu chart.</p>
                          <Button asChild className="bg-amber-500 hover:bg-amber-600 text-white">
                            <Link href="/profile">Generate your mystical profile</Link>
                          </Button>
                        </div>
                      ) : chartData && Array.isArray((chartData as { palaces?: unknown }).palaces) ? (
                        <div className="space-y-4">
                          <p className="text-slate-300 text-sm font-medium">12 Palaces (宮) — Life, Siblings, Spouse, Children, Wealth, Health, Travel, Friends, Career, Property, Mental/Karma, Parents</p>
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                            {((chartData as { palaces: Array<Record<string, unknown>> }).palaces).map((palace: Record<string, unknown>, i: number) => {
                              const starList = Array.isArray(palace.stars)
                                ? (palace.stars as unknown[])
                                    .map((s: unknown) =>
                                      typeof s === 'string' ? s : String((s as Record<string, unknown>)?.name ?? (s as Record<string, unknown>)?.starName ?? '')
                                    )
                                    .join(', ')
                                : '—';
                              return (
                                <DevotionistStyleCard
                                  key={i}
                                  icon={<Star className="w-4 h-4" />}
                                  title={String(palace.name ?? palace.palaceName ?? `Palace ${i + 1}`)}
                                  summary={starList}
                                  colorScheme="amber"
                                  className="h-full min-h-0"
                                />
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-slate-300">
                          <LayoutGrid className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>Chart data will appear here after you generate your mystical profile.</p>
                          <Button asChild className="mt-4 bg-amber-500 hover:bg-amber-600 text-white">
                            <Link href="/profile">Generate your mystical profile</Link>
                          </Button>
                        </div>
                      )}
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
                      ) : !hasReport || !report ? (
                        <div className="text-center py-8">
                          <p className="text-slate-300 mb-4">Generate your mystical profile to unlock your Zi Wei Dou Shu report.</p>
                          <Button asChild className="bg-amber-500 hover:bg-amber-600 text-white">
                            <Link href="/profile">Generate your mystical profile</Link>
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-300 text-sm">Comprehensive Zi Wei Dou Shu report — 三合派</span>
                          </div>
                          {report.executiveSummary ? (
                            <DevotionistStyleCard
                              icon={<FileText className="w-5 h-5" />}
                              title="Executive Destiny Summary"
                              summary={String(report.executiveSummary)}
                              colorScheme="amber"
                            />
                          ) : null}
                          {report.lifePalace ? (
                            <DevotionistStyleCard
                              icon={<Star className="w-5 h-5" />}
                              title="Life Palace (命宮)"
                              summary={String(report.lifePalace)}
                              colorScheme="amber"
                            />
                          ) : null}
                          {report.wealth ? (
                            <DevotionistStyleCard
                              icon={<DollarSign className="w-5 h-5" />}
                              title="Wealth Architecture (財帛宮 + 官祿宮)"
                              summary={String(report.wealth)}
                              colorScheme="green"
                            />
                          ) : null}
                          {report.career ? (
                            <DevotionistStyleCard
                              icon={<Briefcase className="w-5 h-5" />}
                              title="Career Pattern"
                              summary={String(report.career)}
                              colorScheme="blue"
                            />
                          ) : null}
                          {report.relationships ? (
                            <DevotionistStyleCard
                              icon={<Heart className="w-5 h-5" />}
                              title="Relationship Dynamics (夫妻宮)"
                              summary={String(report.relationships)}
                              colorScheme="pink"
                            />
                          ) : null}
                          {report.health ? (
                            <DevotionistStyleCard
                              icon={<Activity className="w-5 h-5" />}
                              title="Health & Risk (疾厄宮)"
                              summary={String(report.health)}
                              colorScheme="orange"
                            />
                          ) : null}
                          {report.tenYearLuck ? (
                            <DevotionistStyleCard
                              icon={<Calendar className="w-5 h-5" />}
                              title="10-Year Luck Roadmap (大限)"
                              summary={String(report.tenYearLuck)}
                              colorScheme="cyan"
                            />
                          ) : null}
                          {report.currentThreeYearOutlook ? (
                            <DevotionistStyleCard
                              icon={<TrendingUp className="w-5 h-5" />}
                              title="Current 3-Year Outlook (流年)"
                              summary={String(report.currentThreeYearOutlook)}
                              colorScheme="purple"
                            />
                          ) : null}
                          {!report.executiveSummary && !report.lifePalace && !report.wealth && !report.career && !report.relationships && !report.health && !report.tenYearLuck && !report.currentThreeYearOutlook ? (
                            <p className="text-slate-400 text-center py-6">Report sections will appear after generation. Generate your mystical profile to populate this report.</p>
                          ) : null}
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
                        <ZiWeiDouShuSeerChatInterface
                          userId={user?.uid ?? ''}
                          userProfile={userProfile ?? undefined}
                          ziweiReport={ziweiReport ?? undefined}
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

export default function ZiWeiDouShuPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-950"><div className="text-amber-400">Loading...</div></div>}>
      <ZiWeiDouShuPageContent />
    </Suspense>
  );
}
