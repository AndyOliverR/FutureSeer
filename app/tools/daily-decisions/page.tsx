"use client"

import { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { useToolReport } from '@/hooks/useComprehensiveMysticalProfile'
import { useToolReportUnlock } from '@/hooks/useToolReportUnlock'
import { useViralReportBypass } from '@/hooks/useViralReportBypass'
import { TeaserView } from '@/components/report-viral/TeaserView'
import { ShareCard } from '@/components/report-viral/ShareCard'
import { ViralLockOverlay } from '@/components/report-viral/LockedReportView'
import { buildToolTeaser } from '@/lib/report-viral/buildToolTeaser'
import { toolPathForSlug } from '@/lib/report-viral/toolSlugToPath'
import { cn } from '@/lib/utils'
import { ToolReportGuard } from '@/components/ToolReportGuard'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ToolIntroductionTab } from '@/components/ToolIntroductionTab'
import { isProfileComplete, getProfileCompletionStatus } from '@/lib/firebase'
import { DailyDecisionsAnalysis } from '@/lib/dailyDecisionsIntelligence'
import {
  DAILY_COLOR_GUIDE,
  SHOE_COLOR_BY_DAY,
  AVOIDANCE_LIST,
  SIGN_ELEMENT,
  ELEMENT_PALETTE,
  RISING_STYLE_HINT,
  VENUS_TEXTURE_HINT,
  NAILS_VEDIC_GUIDE,
  getWeekdayFromDate,
  getColorGuideForWeekday,
} from '@/lib/dailyDecisionsColorGuide'
import { 
  Calendar,
  AlertTriangle,
  Info,
  User,
  Loader2,
  BookOpen,
  Sparkles,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  Scissors,
  Droplet,
  Palette,
  Plane,
  Home,
  MessageCircle,
  Users,
} from 'lucide-react'
import { DailyDecisionsSeerChatInterface } from '@/components/DailyDecisionsSeerChatInterface'
import { DevotionistStyleCard } from '@/components/western/DevotionistStyleCard'

export default function DailyDecisionsPage() {
  const { user, userProfile } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'introduction' | 'recommendations' | 'ask-the-seer'>('introduction')
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [localDecisionsReport, setLocalDecisionsReport] = useState<DailyDecisionsAnalysis | null>(null)
  const [generatingDecisions, setGeneratingDecisions] = useState(false)
  const [decisionsError, setDecisionsError] = useState<string | null>(null)

  const { report: pipelineReport, loading: isLoading, error, hasReport } = useToolReport('dailyDecisions')
  const analysis = useMemo(() => {
    const report = pipelineReport as (DailyDecisionsAnalysis & { placeholder?: boolean }) | undefined
    if (!report || report.placeholder === true) return null
    return report as DailyDecisionsAnalysis
  }, [pipelineReport])

  const hasCompleteProfile = userProfile ? isProfileComplete(userProfile) : false
  const effectiveAnalysis = localDecisionsReport ?? analysis

  const viralUnlock = useToolReportUnlock('dailyDecisions')
  const bypassViral = useViralReportBypass()
  const [showShareCard, setShowShareCard] = useState(false)
  const [waitingLite, setWaitingLite] = useState(false)

  const showDailyViral = Boolean(effectiveAnalysis) && !bypassViral
  const dailyTeaser = useMemo(
    () => buildToolTeaser('dailyDecisions', effectiveAnalysis ?? pipelineReport),
    [effectiveAnalysis, pipelineReport]
  )

  const handleShareToUnlock = useCallback(() => {
    setShowShareCard(true)
  }, [])

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(viralUnlock.shareUrl)
    } catch {
      /* ignore */
    }
    viralUnlock.unlockFull()
    setShowShareCard(false)
  }, [viralUnlock])

  const nativeShare = useCallback(async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'FutureSeer — my reading',
          text: `${dailyTeaser.archetypeName}: ${dailyTeaser.hookLine.slice(0, 120)}…`,
          url: viralUnlock.shareUrl,
        })
        viralUnlock.unlockFull()
        setShowShareCard(false)
        return
      } catch {
        /* cancelled */
      }
    }
    await copyLink()
  }, [copyLink, viralUnlock, dailyTeaser.archetypeName, dailyTeaser.hookLine])

  const continueWithoutSharing = useCallback(() => {
    setWaitingLite(true)
    window.setTimeout(() => {
      viralUnlock.unlockLite()
      setWaitingLite(false)
    }, 4000)
  }, [viralUnlock])

  const dailyCompareHref = useMemo(
    () => `/tools/${toolPathForSlug('dailyDecisions')}?friend=compare&ref=share`,
    []
  )

  const dailyLocked =
    showDailyViral && viralUnlock.hydrated && !viralUnlock.isUnlocked && !bypassViral

  const handleGenerateCurrentDecisions = useCallback(async () => {
    if (!user?.uid || !hasCompleteProfile) return
    setGeneratingDecisions(true)
    setDecisionsError(null)
    try {
      const res = await fetch('/api/tools/daily-decisions/analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid, userProfile: userProfile ?? undefined, date: selectedDate }),
      })
      const json = await res.json()
      if (!res.ok) {
        setDecisionsError((json as { error?: string })?.error ?? 'Failed to generate recommendations.')
        return
      }
      if (!(json as { success?: boolean }).success || !(json as { data?: unknown }).data) {
        setDecisionsError('Invalid response from server.')
        return
      }
      const data = (json as { data: DailyDecisionsAnalysis }).data
      setLocalDecisionsReport(data)
      setActiveTab('recommendations')
    } catch (err) {
      setDecisionsError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setGeneratingDecisions(false)
    }
  }, [user?.uid, userProfile, hasCompleteProfile, selectedDate])

  const profileStatus = userProfile ? getProfileCompletionStatus(userProfile) : { isComplete: false, missingFields: [], completionPercentage: 0 }

  // Check for reduced motion preference
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBadge = (score: number) => {
    if (score >= 80) return <CheckCircle className="w-5 h-5 text-green-600" />
    if (score >= 60) return <Clock className="w-5 h-5 text-yellow-600" />
    return <XCircle className="w-5 h-5 text-red-600" />
  }

  return (
    <ToolReportGuard loading={isLoading} error={error ?? null} toolLabel="Daily Decisions">
    <div className="min-h-screen starfield-ultra-sharp">
      <div className="fixed inset-0 -z-10 starfield-ultra-sharp" />
      
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
              <span className="text-yellow-400">📅</span>{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600">Daily Decisions</span>
            </h1>
            <p className="text-slate-200 leading-relaxed text-xl font-light">
              Personalized Vedic astrology guidance for daily life decisions
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
                      <strong>Complete your profile</strong> with birth date, time, and place for accurate recommendations. 
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

          {/* Decisions API error (on-demand generate) */}
          {decisionsError && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <Alert className="bg-red-100 border-2 border-red-300 rounded-2xl">
                <AlertTriangle className="h-4 w-4 text-red-700" />
                <AlertDescription className="text-red-900">
                  {decisionsError}
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          {/* Date Picker */}
          {hasCompleteProfile && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <Card className="bg-slate-800/50 border-2 border-slate-700 rounded-2xl">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Calendar className="w-5 h-5 text-amber-400" />
                    <label className="text-slate-200 font-medium">Select Date:</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => {
                        setSelectedDate(e.target.value)
                      }}
                      className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 [color-scheme:dark]"
                    />
                    <Button
                      onClick={handleGenerateCurrentDecisions}
                      disabled={!user?.uid || !hasCompleteProfile || generatingDecisions}
                      className="bg-amber-500 hover:bg-amber-600 text-white"
                    >
                      {generatingDecisions ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating…
                        </>
                      ) : (
                        'Generate Current Decisions'
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {showDailyViral && !bypassViral && (
            <div className="mb-6 space-y-4">
              <TeaserView teaser={dailyTeaser} />
              {showShareCard && (
                <ShareCard
                  archetypeName={dailyTeaser.archetypeName}
                  hookLine={dailyTeaser.hookLine}
                  shareUrl={viralUnlock.shareUrl}
                  onCopy={copyLink}
                  onShare={nativeShare}
                />
              )}
              {waitingLite && (
                <p className="text-center text-sm text-amber-200/90">Unlocking lighter view in a few seconds…</p>
              )}
            </div>
          )}

          {showDailyViral && viralUnlock.isUnlocked && !bypassViral && (
            <div className="mb-4 flex justify-center">
              <Link
                href={dailyCompareHref}
                className="inline-flex items-center gap-2 rounded-full border border-violet-500/40 bg-violet-950/40 px-4 py-2 text-sm font-medium text-violet-100 hover:bg-violet-900/50"
              >
                <Users className="h-4 w-4" />
                Compare with a friend
              </Link>
            </div>
          )}

          {/* Tabs */}
          <div className="rounded-2xl border border-amber-500/30 bg-slate-900/80 overflow-hidden">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'introduction' | 'recommendations' | 'ask-the-seer')} className="w-full min-w-0">
            <TabsList className="flex w-full flex-nowrap overflow-x-auto gap-1 sm:gap-2 p-2 sm:p-3 bg-slate-800/50 border-b border-amber-500/20 rounded-none h-auto min-h-0 justify-start [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-amber-500/30">
              {[
                { value: 'introduction', label: 'Introduction', icon: BookOpen },
                { value: 'recommendations', label: 'Recommendations', icon: Sparkles, disabled: !effectiveAnalysis },
                { value: 'ask-the-seer', label: 'Ask the Seer', icon: MessageCircle, disabled: !effectiveAnalysis }
              ].map((tab) => (
                <motion.div
                  key={tab.value}
                  whileHover={{}}
                  whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                  transition={prefersReducedMotion ? {} : { type: "spring", stiffness: 400, damping: 17 }}
                  className="relative shrink-0"
                >
                  <TabsTrigger 
                    value={tab.value}
                    disabled={tab.disabled}
                    className={`shrink-0 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 rounded-t-lg rounded-b-none px-4 py-2.5 text-sm font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 transition-all flex items-center justify-center relative overflow-hidden border border-transparent data-[state=inactive]:border-slate-600/50 ${
                      tab.disabled ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <tab.icon className="w-4 h-4 mr-2" />
                    {tab.label}
                    {activeTab === tab.value && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-t-lg rounded-b-none -z-10"
                        transition={prefersReducedMotion ? {} : { type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </TabsTrigger>
                </motion.div>
              ))}
            </TabsList>

            {activeTab === 'ask-the-seer' ? (
                  <TabsContent value="ask-the-seer" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                    <DailyDecisionsSeerChatInterface
                      analysis={effectiveAnalysis}
                      selectedDate={selectedDate}
                      userId={user?.uid}
                      userProfile={userProfile}
                    />
                  </TabsContent>
            ) : showDailyViral && !viralUnlock.hydrated ? (
                  <div className="py-12 text-center text-slate-400">Loading report…</div>
            ) : (
                  <div className="relative min-h-[320px]">
                    {dailyLocked && (
                      <ViralLockOverlay
                        onUnlockClick={handleShareToUnlock}
                        onContinueWithoutSharing={waitingLite ? () => {} : continueWithoutSharing}
                        continueDisabled={waitingLite}
                      />
                    )}
                    <div
                      className={cn(
                        dailyLocked &&
                          'pointer-events-none select-none blur-sm filter transition-[filter] duration-300 [&_*]:pointer-events-none'
                      )}
                    >
                  <TabsContent value="introduction" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                    <ToolIntroductionTab toolSlug="daily-decisions" />
                  </TabsContent>

                  <TabsContent value="recommendations" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                    {isLoading ? (
                      <DevotionistStyleCard
                        icon={<Loader2 className="w-5 h-5 animate-spin" />}
                        title="Calculating recommendations"
                        summary="Calculating personalized recommendations..."
                        colorScheme="amber"
                      />
                    ) : effectiveAnalysis ? (
                      <div className="space-y-6">
                        {/* Rahu Kaal & Gulika Kaal Alert */}
                        <DevotionistStyleCard
                          icon={<AlertTriangle className="w-5 h-5" />}
                          title="Inauspicious Times - Avoid These Periods"
                          variant="callout"
                          colorScheme="orange"
                        >
                          <div className="space-y-3">
                            <div className="bg-white rounded-lg p-4 border border-orange-200">
                              <div className="font-semibold text-orange-800 mb-1">Rahu Kaal</div>
                              <div className="text-orange-700">{effectiveAnalysis.rahuKaal?.formatted ?? '—'}</div>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-orange-200">
                              <div className="font-semibold text-orange-800 mb-1">Gulika Kaal</div>
                              <div className="text-orange-700">{effectiveAnalysis.gulikaKaal?.formatted ?? '—'}</div>
                            </div>
                          </div>
                        </DevotionistStyleCard>

                        {/* Panchanga Summary */}
                        <DevotionistStyleCard
                          icon={<Calendar className="w-5 h-5" />}
                          title={`Today's Panchanga (${effectiveAnalysis.date ?? '—'})`}
                          variant="callout"
                          colorScheme="blue"
                        >
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <div className="text-sm text-blue-700 mb-1">Tithi</div>
                              <div className="font-semibold text-blue-900">{effectiveAnalysis.panchangaSummary?.tithi ?? '—'}</div>
                            </div>
                            <div>
                              <div className="text-sm text-blue-700 mb-1">Nakshatra</div>
                              <div className="font-semibold text-blue-900">{effectiveAnalysis.panchangaSummary?.nakshatra ?? '—'}</div>
                            </div>
                            <div>
                              <div className="text-sm text-blue-700 mb-1">Vara</div>
                              <div className="font-semibold text-blue-900">{effectiveAnalysis.panchangaSummary?.vara ?? '—'}</div>
                            </div>
                            <div>
                              <div className="text-sm text-blue-700 mb-1">Yoga</div>
                              <div className="font-semibold text-blue-900">{effectiveAnalysis.panchangaSummary?.yoga ?? '—'}</div>
                            </div>
                            {effectiveAnalysis.panchangaSummary?.sunrise != null && (
                              <div>
                                <div className="text-sm text-blue-700 mb-1">Sunrise</div>
                                <div className="font-semibold text-blue-900">{effectiveAnalysis.panchangaSummary.sunrise}</div>
                              </div>
                            )}
                            {effectiveAnalysis.panchangaSummary?.sunset != null && (
                              <div>
                                <div className="text-sm text-blue-700 mb-1">Sunset</div>
                                <div className="font-semibold text-blue-900">{effectiveAnalysis.panchangaSummary.sunset}</div>
                              </div>
                            )}
                          </div>
                        </DevotionistStyleCard>

                        {/* User Context */}
                        <DevotionistStyleCard
                          icon={<User className="w-5 h-5" />}
                          title="Your Chart Context"
                          variant="callout"
                          colorScheme="purple"
                        >
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div>
                              <div className="text-sm text-purple-700 mb-1">Janma Nakshatra</div>
                              <div className="font-semibold text-purple-900">{effectiveAnalysis.userContext?.janmaNakshatra ?? '—'}</div>
                            </div>
                            <div>
                              <div className="text-sm text-purple-700 mb-1">Janma Tithi</div>
                              <div className="font-semibold text-purple-900">{effectiveAnalysis.userContext?.janmaTithi ?? '—'}</div>
                            </div>
                            <div>
                              <div className="text-sm text-purple-700 mb-1">Ascendant</div>
                              <div className="font-semibold text-purple-900">{effectiveAnalysis.userContext?.ascendant ?? '—'}</div>
                            </div>
                            {effectiveAnalysis.userContext?.currentDasha && (
                              <div>
                                <div className="text-sm text-purple-700 mb-1">Current Dasha</div>
                                <div className="font-semibold text-purple-900">
                                  {effectiveAnalysis.userContext.currentDasha.planet} ({effectiveAnalysis.userContext.currentDasha.progress.toFixed(1)}%)
                                </div>
                              </div>
                            )}
                          </div>
                        </DevotionistStyleCard>

                        {/* Color & Style */}
                        <div className="space-y-6">
                          <h2 className="text-2xl font-serif font-semibold text-amber-200 mb-2">Color & Style</h2>

                          {/* Daily Color Guide */}
                          <DevotionistStyleCard
                            icon={<Palette className="w-5 h-5" />}
                            title="Daily Color Guide for Clothes & Accessories"
                            summary="Wearing the color of the day helps align your personal energy with the prevailing planetary frequency."
                            variant="callout"
                            colorScheme="amber"
                          >
                            <div className="space-y-4">
                              <div className="overflow-x-auto rounded-xl border border-slate-200">
                                <table className="w-full text-left text-sm">
                                  <thead>
                                    <tr className="border-b border-slate-200 bg-slate-100">
                                      <th className="px-4 py-3 font-semibold text-slate-900">Day</th>
                                      <th className="px-4 py-3 font-semibold text-slate-900">Ruling Planet</th>
                                      <th className="px-4 py-3 font-semibold text-slate-900">Primary Colors</th>
                                      <th className="px-4 py-3 font-semibold text-slate-900">Beneficial Actions</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {DAILY_COLOR_GUIDE.map((row) => {
                                      const weekday = getWeekdayFromDate(effectiveAnalysis.date ?? new Date().toISOString().slice(0, 10));
                                      const isToday = row.weekday === weekday;
                                      return (
                                        <tr
                                          key={row.day}
                                          className={`border-b border-slate-100 ${isToday ? 'bg-amber-100' : 'hover:bg-slate-50'}`}
                                        >
                                          <td className="px-4 py-3 font-medium text-slate-900">{row.day}</td>
                                          <td className="px-4 py-3 text-slate-700">{row.rulingPlanet}</td>
                                          <td className="px-4 py-3 text-slate-700">{row.primaryColors}</td>
                                          <td className="px-4 py-3 text-slate-700">{row.beneficialActions}</td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                              {(() => {
                                const w = getWeekdayFromDate(effectiveAnalysis.date ?? new Date().toISOString().slice(0, 10));
                                const today = getColorGuideForWeekday(w);
                                const shoe = SHOE_COLOR_BY_DAY[w];
                                return (
                                  <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-4">
                                    <div className="mb-2 text-xs font-medium uppercase tracking-wide text-amber-700">
                                      Based on {today.day} ({effectiveAnalysis.date})
                                    </div>
                                    <div className="grid gap-2 text-slate-800 sm:grid-cols-2">
                                      <div>
                                        <span className="font-semibold">Colors:</span> {today.primaryColors}
                                      </div>
                                      <div>
                                        <span className="font-semibold">Actions:</span> {today.beneficialActions}
                                      </div>
                                      {shoe && (
                                        <div className="sm:col-span-2">
                                          <span className="font-semibold">Shoes:</span> {shoe}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                          </DevotionistStyleCard>

                          {/* Specialized Activities 2026 */}
                          <DevotionistStyleCard
                            icon={<Sparkles className="w-5 h-5" />}
                            title="Specialized Activity Suggestions for 2026"
                            variant="callout"
                            colorScheme="purple"
                          >
                            <div className="space-y-3 text-slate-700">
                              <p>
                                <strong>Buying clothes:</strong> For maximum benefit, start the year with new clothes to reset your energy. Friday is generally the best day for fashion-related purchases (ruled by Venus).
                              </p>
                              <p>
                                <strong>Buying shoes:</strong> Match your shoe color to the day&apos;s planet for grounding energy (e.g. black on Saturday for Saturn&apos;s protection). Today: {SHOE_COLOR_BY_DAY[getWeekdayFromDate(effectiveAnalysis.date ?? new Date().toISOString().slice(0, 10))]}.
                              </p>
                            </div>
                          </DevotionistStyleCard>

                          {/* Personalization by Profile */}
                          {(() => {
                            const uc = effectiveAnalysis.userContext;
                            if (!uc) return null;
                            const signKey = (s: string | undefined) =>
                              s && typeof s === 'string' && s !== 'Unknown'
                                ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
                                : '';
                            const sun = uc.sunSign;
                            const rising = uc.ascendant;
                            const venus = uc.venusSign;
                            const hasAny = signKey(sun) || signKey(rising) || signKey(venus);
                            if (!hasAny) return null;
                            return (
                              <DevotionistStyleCard
                                icon={<User className="w-5 h-5" />}
                                title="Personalization by Profile"
                                variant="callout"
                                colorScheme="pink"
                              >
                                <div className="space-y-3 text-slate-700">
                                  {signKey(sun) && (() => {
                                    const el = SIGN_ELEMENT[signKey(sun)!];
                                    const pal = el ? ELEMENT_PALETTE[el] : null;
                                    return (
                                      <p>
                                        <strong>Sun sign:</strong> Use for your core clothing palette. Your Sun is in {sun} {el ? `(${el})` : ''}. {pal ? `Lean into ${pal}.` : ''}
                                      </p>
                                    );
                                  })()}
                                  {signKey(rising) && RISING_STYLE_HINT[signKey(rising)!] && (
                                    <p>
                                      <strong>Rising sign (Ascendant):</strong> Dress for this sign to improve how others perceive you. {rising} Rising: {RISING_STYLE_HINT[signKey(rising)!]}.
                                    </p>
                                  )}
                                  {signKey(venus) && VENUS_TEXTURE_HINT[signKey(venus)!] && (
                                    <p>
                                      <strong>Venus sign:</strong> Fabrics and textures that make you feel most attractive. {VENUS_TEXTURE_HINT[signKey(venus)!]}
                                    </p>
                                  )}
                                </div>
                              </DevotionistStyleCard>
                            );
                          })()}

                          {/* Daily Life Best Practices 2026 */}
                          <DevotionistStyleCard
                            icon={<CheckCircle className="w-5 h-5" />}
                            title="Daily Life Best Practices (2026 Focus)"
                            variant="callout"
                            colorScheme="cyan"
                          >
                            <div className="space-y-2 text-slate-700">
                              <p><strong>Energy cleansing:</strong> Monday is the ideal day to clear &quot;emotional clutter&quot; at home.</p>
                              <p><strong>Shopping habits:</strong> In 2026, favor sustainable &quot;investment&quot; pieces over fast fashion to align with the year&apos;s more intentional energy.</p>
                            </div>
                          </DevotionistStyleCard>

                          {/* Avoidance List */}
                          <DevotionistStyleCard
                            icon={<AlertTriangle className="w-5 h-5" />}
                            title="Avoidance List"
                            variant="callout"
                            colorScheme="orange"
                          >
                            <ul className="list-inside list-disc space-y-1 text-slate-700">
                              {AVOIDANCE_LIST.map((item, i) => (
                                <li key={i}>{item.text}</li>
                              ))}
                            </ul>
                          </DevotionistStyleCard>
                        </div>

                        {/* Recommendations */}
                        <div className="space-y-4">
                          <h2 className="text-2xl font-serif font-semibold text-amber-200 mb-4">Finance & Grooming</h2>
                          {!effectiveAnalysis.recommendations ? (
                            <DevotionistStyleCard
                              icon={<DollarSign className="w-5 h-5" />}
                              title="Finance & Grooming"
                              summary="Recommendations for this section are not available for this date."
                              colorScheme="amber"
                            />
                          ) : (
                          <>
                          {effectiveAnalysis.recommendations.lendMoney && (
                          <DevotionistStyleCard
                            icon={<DollarSign className="w-5 h-5" />}
                            title="Lend Money"
                            variant="callout"
                            colorScheme="green"
                          >
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-green-800">Score:</span>
                                <span className={`font-bold ${getScoreColor(effectiveAnalysis.recommendations.lendMoney.score ?? 0)}`}>
                                  {(effectiveAnalysis.recommendations.lendMoney.score ?? 0)}/100
                                </span>
                              </div>
                              <div>
                                <div className="font-semibold text-green-800 mb-1">Best Days:</div>
                                <div className="text-green-700">{effectiveAnalysis.recommendations.lendMoney.bestDays?.join(', ') ?? '—'}</div>
                              </div>
                              {(effectiveAnalysis.recommendations.lendMoney.avoidDays?.length ?? 0) > 0 && (
                                <div>
                                  <div className="font-semibold text-red-700 mb-1">Avoid Days:</div>
                                  <div className="text-red-600">{effectiveAnalysis.recommendations.lendMoney.avoidDays?.join(', ')}</div>
                                </div>
                              )}
                              {(effectiveAnalysis.recommendations.lendMoney.avoidTimes?.length ?? 0) > 0 && (
                                <div>
                                  <div className="font-semibold text-red-700 mb-1">Avoid Times:</div>
                                  <div className="text-red-600">{effectiveAnalysis.recommendations.lendMoney.avoidTimes?.join(', ')}</div>
                                </div>
                              )}
                              <div className="bg-white rounded-lg p-3 border border-green-200">
                                <div className="text-sm text-green-800">{effectiveAnalysis.recommendations.lendMoney.personalizedNote ?? '—'}</div>
                              </div>
                            </div>
                          </DevotionistStyleCard>
                          )}

                          {effectiveAnalysis.recommendations.borrowMoney && (
                          <DevotionistStyleCard
                            icon={<DollarSign className="w-5 h-5" />}
                            title="Borrow Money"
                            variant="callout"
                            colorScheme="blue"
                          >
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-blue-800">Score:</span>
                                <span className={`font-bold ${getScoreColor(effectiveAnalysis.recommendations.borrowMoney.score ?? 0)}`}>
                                  {(effectiveAnalysis.recommendations.borrowMoney.score ?? 0)}/100
                                </span>
                              </div>
                              <div>
                                <div className="font-semibold text-blue-800 mb-1">Best Days:</div>
                                <div className="text-blue-700">{effectiveAnalysis.recommendations.borrowMoney.bestDays?.join(', ') ?? '—'}</div>
                              </div>
                              {(effectiveAnalysis.recommendations.borrowMoney.avoidDays?.length ?? 0) > 0 && (
                                <div>
                                  <div className="font-semibold text-red-700 mb-1">Avoid Days:</div>
                                  <div className="text-red-600">{effectiveAnalysis.recommendations.borrowMoney.avoidDays?.join(', ')}</div>
                                </div>
                              )}
                              <div className="bg-white rounded-lg p-3 border border-blue-200">
                                <div className="text-sm text-blue-800">{effectiveAnalysis.recommendations.borrowMoney.personalizedNote ?? '—'}</div>
                              </div>
                            </div>
                          </DevotionistStyleCard>
                          )}

                          {effectiveAnalysis.recommendations.payBackDebts && (
                          <DevotionistStyleCard
                            icon={<DollarSign className="w-5 h-5" />}
                            title="Pay Back Debts"
                            variant="callout"
                            colorScheme="orange"
                          >
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-orange-800">Score:</span>
                                <span className={`font-bold ${getScoreColor(effectiveAnalysis.recommendations.payBackDebts.score ?? 0)}`}>
                                  {(effectiveAnalysis.recommendations.payBackDebts.score ?? 0)}/100
                                </span>
                              </div>
                              <div>
                                <div className="font-semibold text-orange-800 mb-1">Best Days:</div>
                                <div className="text-orange-700">{effectiveAnalysis.recommendations.payBackDebts.bestDays?.join(', ') ?? '—'}</div>
                              </div>
                              {(effectiveAnalysis.recommendations.payBackDebts.avoidTimes?.length ?? 0) > 0 && (
                                <div>
                                  <div className="font-semibold text-green-700 mb-1">Recommended Times:</div>
                                  <div className="text-green-600">{effectiveAnalysis.recommendations.payBackDebts.avoidTimes?.join(', ')}</div>
                                </div>
                              )}
                              <div className="bg-white rounded-lg p-3 border border-orange-200">
                                <div className="text-sm text-orange-800">{effectiveAnalysis.recommendations.payBackDebts.personalizedNote ?? '—'}</div>
                              </div>
                            </div>
                          </DevotionistStyleCard>
                          )}

                          {effectiveAnalysis.recommendations.travel && (
                          <DevotionistStyleCard
                            icon={<Plane className="w-5 h-5" />}
                            title="Travel"
                            variant="callout"
                            colorScheme="blue"
                          >
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-blue-800">Score:</span>
                                <span className={`font-bold ${getScoreColor(effectiveAnalysis.recommendations.travel.score ?? 0)}`}>
                                  {(effectiveAnalysis.recommendations.travel.score ?? 0)}/100
                                </span>
                              </div>
                              <div>
                                <div className="font-semibold text-blue-800 mb-1">Best Days:</div>
                                <div className="text-blue-700">{effectiveAnalysis.recommendations.travel.bestDays?.join(', ') ?? '—'}</div>
                              </div>
                              {(effectiveAnalysis.recommendations.travel.avoidDays?.length ?? 0) > 0 && (
                                <div>
                                  <div className="font-semibold text-red-700 mb-1">Avoid Days:</div>
                                  <div className="text-red-600">{effectiveAnalysis.recommendations.travel.avoidDays?.join(', ')}</div>
                                </div>
                              )}
                              {(effectiveAnalysis.recommendations.travel.avoidTimes?.length ?? 0) > 0 && (
                                <div>
                                  <div className="font-semibold text-red-700 mb-1">Avoid Starting Journey During:</div>
                                  <ul className="list-inside list-disc space-y-0.5 text-red-600 text-sm">
                                    {effectiveAnalysis.recommendations.travel.avoidTimes?.map((t, i) => (
                                      <li key={i}>{t}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              <div className="bg-white rounded-lg p-3 border border-blue-200">
                                <div className="text-sm text-blue-800">{effectiveAnalysis.recommendations.travel.personalizedNote ?? '—'}</div>
                              </div>
                            </div>
                          </DevotionistStyleCard>
                          )}

                          {/* Property / construction / moving (Vastu-based) */}
                          {effectiveAnalysis.propertyConstruction != null && (
                            <DevotionistStyleCard
                              icon={<Home className="w-5 h-5" />}
                              title="Property / construction / moving"
                              summary="Vastu-based timing for the selected date. Best and avoid activities for construction, moving, or renovations."
                              variant="callout"
                              colorScheme="amber"
                            >
                              <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-amber-800">Auspicious score:</span>
                                  <span className={`font-bold ${getScoreColor(effectiveAnalysis.propertyConstruction.auspiciousScore)}`}>
                                    {effectiveAnalysis.propertyConstruction.auspiciousScore}/100
                                  </span>
                                  {effectiveAnalysis.propertyConstruction.isAuspicious ? (
                                    <span className="text-sm text-green-600">— Favorable</span>
                                  ) : (
                                    <span className="text-sm text-amber-600">— Consider postponing major work</span>
                                  )}
                                </div>
                                {effectiveAnalysis.propertyConstruction.bestActivities.length > 0 && (
                                  <div>
                                    <div className="font-semibold text-amber-800 mb-1">Best activities:</div>
                                    <ul className="list-inside list-disc space-y-0.5 text-amber-700 text-sm">
                                      {effectiveAnalysis.propertyConstruction.bestActivities.map((a, i) => (
                                        <li key={i}>{a}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                {effectiveAnalysis.propertyConstruction.avoidActivities.length > 0 && (
                                  <div>
                                    <div className="font-semibold text-red-700 mb-1">Avoid:</div>
                                    <ul className="list-inside list-disc space-y-0.5 text-red-600 text-sm">
                                      {effectiveAnalysis.propertyConstruction.avoidActivities.map((a, i) => (
                                        <li key={i}>{a}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                {effectiveAnalysis.propertyConstruction.recommendations.length > 0 && (
                                  <div>
                                    <div className="font-semibold text-amber-800 mb-1">Recommendations:</div>
                                    <ul className="list-inside list-disc space-y-0.5 text-amber-700 text-sm">
                                      {effectiveAnalysis.propertyConstruction.recommendations.slice(0, 4).map((r, i) => (
                                        <li key={i}>{r}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </DevotionistStyleCard>
                          )}

                          {effectiveAnalysis.recommendations.haircut && (
                          <DevotionistStyleCard
                            icon={<Scissors className="w-5 h-5" />}
                            title="Haircut"
                            variant="callout"
                            colorScheme="pink"
                          >
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-pink-800">Score:</span>
                                <span className={`font-bold ${getScoreColor(effectiveAnalysis.recommendations.haircut.score ?? 0)}`}>
                                  {(effectiveAnalysis.recommendations.haircut.score ?? 0)}/100
                                </span>
                              </div>
                              <div>
                                <div className="font-semibold text-pink-800 mb-1">Best Days:</div>
                                <div className="text-pink-700">{effectiveAnalysis.recommendations.haircut.bestDays?.join(', ') ?? '—'}</div>
                              </div>
                              {(effectiveAnalysis.recommendations.haircut.avoidDays?.length ?? 0) > 0 && (
                                <div>
                                  <div className="font-semibold text-red-700 mb-1">Avoid Days:</div>
                                  <div className="text-red-600">{effectiveAnalysis.recommendations.haircut.avoidDays?.join(', ')}</div>
                                </div>
                              )}
                              <div className="bg-white rounded-lg p-3 border border-pink-200">
                                <div className="text-sm text-pink-800">{effectiveAnalysis.recommendations.haircut.personalizedNote ?? '—'}</div>
                              </div>
                            </div>
                          </DevotionistStyleCard>
                          )}

                          {effectiveAnalysis.recommendations.cutNails && (
                          <DevotionistStyleCard
                            icon={<Scissors className="w-5 h-5" />}
                            title="Cut Nails (Fingers & Toes) — Nail cutting (Vedic)"
                            summary="According to traditional Vedic beliefs, the timing of cutting finger or toe nails is believed to impact fortune, wealth, and health. Avoid specific days and after sunset to prevent negative energy and financial loss."
                            variant="callout"
                            colorScheme="purple"
                          >
                            <div className="space-y-4">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-purple-800">Score:</span>
                                <span className={`font-bold ${getScoreColor(effectiveAnalysis.recommendations.cutNails.score ?? 0)}`}>
                                  {(effectiveAnalysis.recommendations.cutNails.score ?? 0)}/100
                                </span>
                              </div>
                              <div>
                                <div className="font-semibold text-purple-800 mb-1">Best Days:</div>
                                <div className="text-purple-700">{effectiveAnalysis.recommendations.cutNails.bestDays?.join(', ') ?? '—'}</div>
                              </div>
                              {(effectiveAnalysis.recommendations.cutNails.avoidDays?.length ?? 0) > 0 && (
                                <div>
                                  <div className="font-semibold text-red-700 mb-1">Avoid Days:</div>
                                  <div className="text-red-600">{effectiveAnalysis.recommendations.cutNails.avoidDays?.join(', ')}</div>
                                </div>
                              )}
                              {(effectiveAnalysis.recommendations.cutNails.avoidTimes?.length ?? 0) > 0 && (
                                <div>
                                  <div className="font-semibold text-red-700 mb-1">Avoid Times:</div>
                                  <ul className="list-inside list-disc space-y-0.5 text-red-600 text-sm">
                                    {effectiveAnalysis.recommendations.cutNails.avoidTimes?.map((t, i) => (
                                      <li key={i}>{t}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              <div>
                                <div className="font-semibold text-purple-800 mb-1">Best Timing:</div>
                                <div className="text-purple-700">{NAILS_VEDIC_GUIDE.bestTiming}</div>
                              </div>
                              <div>
                                <div className="font-semibold text-purple-800 mb-1">Disposal:</div>
                                <div className="text-purple-700">{NAILS_VEDIC_GUIDE.disposalTip}</div>
                              </div>
                              <div>
                                <div className="font-semibold text-purple-800 mb-1">Key Takeaways:</div>
                                <ul className="list-inside list-disc space-y-0.5 text-purple-700 text-sm">
                                  {NAILS_VEDIC_GUIDE.keyTakeaways.map((t, i) => (
                                    <li key={i}>{t}</li>
                                  ))}
                                </ul>
                              </div>
                              {(effectiveAnalysis.recommendations.cutNails.tips?.length ?? 0) > 0 && (
                                <div>
                                  <div className="font-semibold text-purple-800 mb-1">Tips:</div>
                                  <ul className="list-inside list-disc space-y-0.5 text-purple-700 text-sm">
                                    {effectiveAnalysis.recommendations.cutNails.tips?.map((t, i) => (
                                      <li key={i}>{t}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              <div className="bg-white rounded-lg p-3 border border-purple-200">
                                <div className="text-sm text-purple-800">{effectiveAnalysis.recommendations.cutNails.personalizedNote ?? '—'}</div>
                              </div>
                              <p className="text-xs italic text-purple-600">
                                {NAILS_VEDIC_GUIDE.disclaimer}
                              </p>
                            </div>
                          </DevotionistStyleCard>
                          )}

                          {effectiveAnalysis.recommendations.hairOil && (
                          <DevotionistStyleCard
                            icon={<Droplet className="w-5 h-5" />}
                            title="Apply Hair Oil"
                            variant="callout"
                            colorScheme="cyan"
                          >
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-cyan-800">Score:</span>
                                <span className={`font-bold ${getScoreColor(effectiveAnalysis.recommendations.hairOil.score ?? 0)}`}>
                                  {(effectiveAnalysis.recommendations.hairOil.score ?? 0)}/100
                                </span>
                              </div>
                              <div>
                                <div className="font-semibold text-cyan-800 mb-1">Best Days:</div>
                                <div className="text-cyan-700">{effectiveAnalysis.recommendations.hairOil.bestDays?.join(', ') ?? '—'}</div>
                              </div>
                              {(effectiveAnalysis.recommendations.hairOil.avoidDays?.length ?? 0) > 0 && (
                                <div>
                                  <div className="font-semibold text-red-700 mb-1">Avoid Days:</div>
                                  <div className="text-red-600">{effectiveAnalysis.recommendations.hairOil.avoidDays?.join(', ')}</div>
                                </div>
                              )}
                              <div className="bg-white rounded-lg p-3 border border-cyan-200">
                                <div className="text-sm text-cyan-800">{effectiveAnalysis.recommendations.hairOil.personalizedNote ?? '—'}</div>
                              </div>
                            </div>
                          </DevotionistStyleCard>
                          )}
                          </>
                          )}
                        </div>

                        {/* Disclaimer */}
                        <DevotionistStyleCard
                          icon={<Info className="w-5 h-5" />}
                          title="Disclaimer"
                          summary="Astrology is a traditional belief system. Recommendations are based on interpretation, not scientific proof. These suggestions are for cultural and traditional guidance only and should not override urgent health, legal, or financial decisions."
                          colorScheme="amber"
                        />
                      </div>
                    ) : (
                      <DevotionistStyleCard
                        icon={<Calendar className="w-5 h-5" />}
                        title="No report yet"
                        summary="Select a date and click &quot;Generate Current Decisions&quot; to see personalized guidance."
                        variant="callout"
                        colorScheme="amber"
                      >
                        <div className="mt-4 flex justify-center">
                          <Button
                            onClick={handleGenerateCurrentDecisions}
                            disabled={!user?.uid || !hasCompleteProfile || generatingDecisions}
                            className="bg-amber-500 hover:bg-amber-600 text-white"
                          >
                            {generatingDecisions ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Generating…
                              </>
                            ) : (
                              'Generate Current Decisions'
                            )}
                          </Button>
                        </div>
                      </DevotionistStyleCard>
                    )}
                  </TabsContent>
                    </div>
                  </div>
            )}
          </Tabs>
          </div>
        </div>
      </div>
    </div>
    </ToolReportGuard>
  )
}
