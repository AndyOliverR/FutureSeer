"use client"

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { useToolReport } from '@/hooks/useComprehensiveMysticalProfile'
import { ToolReportGuard } from '@/components/ToolReportGuard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ToolIntroductionTab } from '@/components/ToolIntroductionTab'
import { isProfileComplete, getProfileCompletionStatus } from '@/lib/firebase'
import { NavaratnaAnalysis as NavaratnaAnalysisType } from '@/lib/navaratnaIntelligence'
import { NavaratnaAnalysis } from '@/components/navaratna/NavaratnaAnalysis'
import NavaratnaSeerChatInterface from '@/components/navaratna/NavaratnaSeerChatInterface'
import { 
  Gem, 
  AlertTriangle,
  Info,
  User,
  Loader2,
  BookOpen,
  Sparkles,
  Shield,
  Clock,
  TrendingUp,
  CheckCircle,
  XCircle
} from 'lucide-react'

export default function NavaratnaPage() {
  const { user, userProfile } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'introduction' | 'analysis' | 'recommendations' | 'ask-seer'>('introduction')
  const [bodyWeightKg, setBodyWeightKg] = useState<number | undefined>(undefined)
  const { report: pipelineReport, loading: isLoading, error, hasReport } = useToolReport('navaratna')
  const analysis = useMemo(() => {
    const raw = pipelineReport as NavaratnaAnalysisType | Record<string, unknown> | undefined
    if (!raw || typeof raw !== 'object') return null
    if ((raw as NavaratnaAnalysisType).chartSummary && (raw as NavaratnaAnalysisType).recommendations) return raw as NavaratnaAnalysisType
    const data = (raw as Record<string, unknown>).data
    return (data as NavaratnaAnalysisType) ?? null
  }, [pipelineReport])

  const hasCompleteProfile = userProfile ? isProfileComplete(userProfile) : false
  const profileStatus = userProfile ? getProfileCompletionStatus(userProfile) : { isComplete: false, missingFields: [], completionPercentage: 0 }

  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  const motionConfig = useMemo(() => {
    if (prefersReducedMotion) return { duration: 0 }
    return { duration: 0.3, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }
  }, [prefersReducedMotion])

  return (
    <ToolReportGuard loading={isLoading} error={error ?? null} toolLabel="Navaratna">
    <div className="relative min-h-screen">
      {/* Starfield background */}
      <div 
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: 'var(--starfield-image)',
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          backgroundColor: '#030711',
          imageRendering: '-webkit-optimize-contrast',
        }}
      />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8 text-center pt-4"
          >
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-semibold mb-6">
              <span className="text-yellow-400">💎</span>{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600">Navaratna & Planetary Stones</span>
            </h1>
            <p className="text-slate-200 leading-relaxed text-xl font-light">
              Personalized gemstone recommendations based on Vedic astrology
            </p>
          </motion.div>

          {/* Profile Completion Alert */}
          {!hasCompleteProfile && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <Alert className="bg-amber-100 border-2 border-amber-300 rounded-2xl">
                <Info className="h-4 w-4 text-amber-700" />
                <AlertDescription className="text-amber-900">
                  <div className="flex items-center justify-between">
                    <div>
                      <strong>Complete your profile</strong> with birth date, time, and place for accurate gemstone recommendations. 
                      Missing: {profileStatus.missingFields.join(', ')}
                    </div>
                    <Button
                      onClick={() => router.push('/profile')}
                      size="sm"
                      className="bg-amber-500 hover:bg-amber-600 text-white ml-4"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Complete Profile
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          {/* Error Alert */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <Alert className="bg-red-100 border-2 border-red-300 rounded-2xl">
                <AlertTriangle className="h-4 w-4 text-red-700" />
                <AlertDescription className="text-red-900">
                  {error}
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          {/* Tabs */}
          <div className="rounded-2xl border border-amber-500/30 bg-slate-900/80 overflow-hidden">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full min-w-0">
            <TabsList className="flex w-full flex-nowrap overflow-x-auto gap-1 sm:gap-2 p-2 sm:p-3 bg-slate-800/50 border-b border-amber-500/20 rounded-none h-auto min-h-0 justify-start [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-amber-500/30">
              {[
                { value: 'introduction', label: 'Introduction', icon: BookOpen },
                { value: 'analysis', label: 'Analysis', icon: Sparkles, disabled: !analysis },
                { value: 'recommendations', label: 'Recommendations', icon: Gem, disabled: !analysis },
                { value: 'ask-seer', label: 'Ask The Seer', icon: Sparkles, disabled: !analysis, longLabel: 'Ask The Seer' }
              ].map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  disabled={tab.disabled}
                  className={`shrink-0 rounded-t-lg rounded-b-none px-4 py-2.5 text-sm font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 border border-transparent data-[state=inactive]:border-slate-600/50 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 transition-all flex items-center justify-center gap-2 ${
                    tab.disabled ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.longLabel ? (
                    <>
                      <span className="hidden md:inline">{tab.longLabel}</span>
                      <span className="md:hidden">{tab.label}</span>
                    </>
                  ) : (
                    tab.label
                  )}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Tab Content with Material 3 Transitions */}
            <AnimatePresence mode="wait">
              {/* Introduction Tab */}
              {activeTab === 'introduction' && (
                <motion.div
                  key="introduction"
                  initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                  animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                  exit={prefersReducedMotion ? {} : { opacity: 0, y: -20 }}
                  transition={motionConfig}
                >
                  <TabsContent value="introduction" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                    <ToolIntroductionTab toolSlug="navaratna-planetary-stones" />
                  </TabsContent>
                </motion.div>
              )}

              {/* Analysis Tab */}
              {activeTab === 'analysis' && (
                <motion.div
                  key="analysis"
                  initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                  animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                  exit={prefersReducedMotion ? {} : { opacity: 0, y: -20 }}
                  transition={motionConfig}
                >
                  <TabsContent value="analysis" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                    {analysis ? (
                      <div className="space-y-6">
                    {/* Chart Summary */}
                    <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300">
                      <CardHeader>
                        <CardTitle className="text-amber-900 font-serif flex items-center gap-2">
                          <Sparkles className="w-5 h-5" />
                          Chart Summary
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-200 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 p-4">
                            <div className="text-slate-600 text-sm mb-1">Ascendant</div>
                            <div className="text-cyan-900 text-xl font-semibold font-serif">
                              {analysis.chartSummary.ascendant.sign}
                            </div>
                            <div className="text-slate-700 text-sm">
                              {analysis.chartSummary.ascendant.degree.toFixed(2)}°
                            </div>
                          </div>
                          <div className="bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-200 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 p-4">
                            <div className="text-slate-600 text-sm mb-1">Lagnesh (Life Stone Planet)</div>
                            <div className="text-cyan-900 text-xl font-semibold font-serif">
                              {analysis.chartSummary.lagnesh || 'Calculating...'}
                            </div>
                            <div className="text-slate-700 text-sm">
                              {analysis.recommendations.lifeStone?.gemstone.english || 'N/A'}
                            </div>
                          </div>
                          {analysis.chartSummary.currentDasha && (
                            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-200 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 p-4">
                              <div className="text-slate-600 text-sm mb-1">Current Dasha</div>
                              <div className="text-cyan-900 text-xl font-semibold font-serif">
                                {analysis.chartSummary.currentDasha.planet}
                              </div>
                              <div className="text-slate-700 text-sm">
                                {analysis.chartSummary.currentDasha.progress.toFixed(1)}% complete
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Recommendations Summary */}
                    <Card className="bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 border-2 border-purple-200 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300">
                      <CardHeader>
                        <CardTitle className="text-purple-900 font-serif flex items-center gap-2">
                          <Gem className="w-5 h-5" />
                          Recommendations Summary
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle className="w-5 h-5 text-green-700" />
                              <div className="text-green-900 font-semibold">Recommended</div>
                            </div>
                            <div className="text-2xl font-bold text-green-800">
                              {1 + analysis.recommendations.beneficStones.length + (analysis.recommendations.dashaStone ? 1 : 0)}
                            </div>
                            <div className="text-green-700 text-sm">Gemstones</div>
                          </div>
                          <div className="bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-200 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <XCircle className="w-5 h-5 text-red-700" />
                              <div className="text-red-900 font-semibold">Avoid</div>
                            </div>
                            <div className="text-2xl font-bold text-red-800">
                              {analysis.recommendations.avoidedStones.length}
                            </div>
                            <div className="text-red-700 text-sm">Gemstones</div>
                          </div>
                          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Shield className="w-5 h-5 text-amber-700" />
                              <div className="text-amber-900 font-semibold">Safety Warnings</div>
                            </div>
                            <div className="text-2xl font-bold text-amber-800">
                              {analysis.safetyWarnings.length}
                            </div>
                            <div className="text-amber-700 text-sm">Important Notes</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                      </div>
                    ) : (
                  <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md">
                    <CardContent className="py-12 text-center">
                      <Gem className="w-16 h-16 text-amber-600 mx-auto mb-4" />
                      <p className="text-slate-700 mb-4">No analysis yet. Generate your mystical profile to see Navaratna recommendations.</p>
                      <Button asChild className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600">
                        <Link href="/profile">
                          <Sparkles className="w-4 h-4 mr-2" />
                          Generate your mystical profile
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                )}
                  </TabsContent>
                </motion.div>
              )}

              {/* Recommendations Tab */}
              {activeTab === 'recommendations' && (
                <motion.div
                  key="recommendations"
                  initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                  animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                  exit={prefersReducedMotion ? {} : { opacity: 0, y: -20 }}
                  transition={motionConfig}
                >
                  <TabsContent value="recommendations" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">

                    {analysis ? (
                      <NavaratnaAnalysis analysis={analysis} />
                    ) : (
                      <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md">
                        <CardContent className="py-12 text-center">
                          <Gem className="w-16 h-16 text-amber-600 mx-auto mb-4" />
                          <p className="text-slate-700 mb-4">Generate your mystical profile to see recommendations.</p>
                          <Button asChild className="bg-amber-500 hover:bg-amber-600">
                            <Link href="/profile">
                              <Sparkles className="w-4 h-4 mr-2" />
                              Generate your mystical profile
                            </Link>
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>
                </motion.div>
              )}

              {/* Ask the Seer Tab */}
              {activeTab === 'ask-seer' && (
                <motion.div
                  key="ask-seer"
                  initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                  animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                  exit={prefersReducedMotion ? {} : { opacity: 0, y: -20 }}
                  transition={motionConfig}
                >
                  <TabsContent value="ask-seer" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                    <NavaratnaSeerChatInterface
                      analysis={analysis}
                      userId={user?.uid}
                      userProfile={userProfile}
                      sessionId={analysis ? `navaratna_${analysis.userId || Date.now()}` : undefined}
                    />
                  </TabsContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Tabs>
          </div>
        </div>
      </div>
    </div>
    </ToolReportGuard>
  )
}
