// Streamlined Numerology page: reads only from pipeline cache (useToolReport).
"use client"

import { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/use-auth'
import { useToolReport } from '@/hooks/useComprehensiveMysticalProfile'
import { ToolReportGuard } from '@/components/ToolReportGuard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ToolIntroductionTab } from '@/components/ToolIntroductionTab'
import { CompatibilityTab } from '@/components/compatibility/CompatibilityTab'
import { NumerologyRemedies } from '@/components/numerology/NumerologyRemedies'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { detectKarmicDebtNumbers, karmicDebtShortMeaning } from '@/lib/numerology/karmicDebt'
import { DashboardSection } from '@/components/western/DashboardSection'
import { 
  Hash, 
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  AlertTriangle,
  Info,
  Brain,
  Gem,
  MessageCircle,
  User,
  Eye,
  Heart,
  Target,
  Activity,
  Sun,
  Moon,
  Sparkles,
  Calculator,
  BookOpen,
  Compass,
  Star,
  Briefcase,
  ActivityIcon,
  TrendingUp,
  Users,
} from 'lucide-react'
import { useToolReportUnlock } from '@/hooks/useToolReportUnlock'
import { useViralReportBypass } from '@/hooks/useViralReportBypass'
import { TeaserView } from '@/components/report-viral/TeaserView'
import { ShareCard } from '@/components/report-viral/ShareCard'
import { ViralLockOverlay } from '@/components/report-viral/LockedReportView'
import { buildToolTeaser } from '@/lib/report-viral/buildToolTeaser'
import { toolPathForSlug } from '@/lib/report-viral/toolSlugToPath'
import { cn } from '@/lib/utils'
import LoShuGrid from '@/components/numerology/LoShuGrid'
import { LuckyEssentials } from '@/components/numerology/LuckyEssentials'
import { NamePlanes } from '@/components/numerology/NamePlanes'
import { calcPersonalYear } from '@/lib/numerology/personalYear'
import { calcDriver, calcConductor } from '@/lib/numerology/driverConductor'
import { getZodiacFromDate } from '@/lib/numerology/zodiac'
import { getFavorables } from '@/lib/numerology/favorables'
import { getKuaResult } from '@/lib/numerology/kua'
import { calcChallengeCycles } from '@/lib/numerology/cycles'
import { generateMonthForecast } from '@/lib/numerology/forecast'
import { getSummaryNumbers } from '@/lib/numerology/summary'
import ComprehensiveNumerologyReport, { type ComprehensiveAnalysis } from '@/components/numerology/ComprehensiveNumerologyReport'
import NumerologySeerChatInterface from '@/components/numerology/NumerologySeerChatInterface'
import { DevotionistStyleCard } from '@/components/western/DevotionistStyleCard'
import { ChaldeanInterpretations } from '@/lib/numerology/chaldean'
import { toIntegerOrNull, toIntegerOrUndefined } from '@/lib/utils/coerceNumber'

/** Map pipeline report (numbers, breakdown, etc.) to page-style numerology data. */
function numerologyDataFromReport(report: unknown): Record<string, unknown> | null {
  if (!report || typeof report !== 'object') return null
  const r = report as Record<string, unknown>
  if (r.placeholder === true) return null
  const data = (r.data ?? r) as Record<string, unknown>
  const numbers = (data?.numbers ?? r.numbers) as Record<string, number> | undefined
  const breakdown = (data?.breakdown ?? r.breakdown) as Record<string, unknown> | undefined
  if (!numbers) return null
  return {
    life_path_number: numbers.lifePath,
    life_path: numbers.lifePath,
    expression_number: numbers.destiny,
    soul_number: numbers.soulUrge,
    soul_urge: numbers.soulUrge,
    personality_number: numbers.personality,
    destiny_number: numbers.destiny,
    birthday_number: numbers.birthday,
    maturity_number: numbers.maturity,
    breakdown: breakdown ?? {},
    interpretations: (data?.interpretations ?? r.interpretations) ?? {},
  }
}

type NumerologyTabKey =
  | 'introduction'
  | 'overview'
  | 'report'
  | 'numbers'
  | 'compatibility'
  | 'guidance'
  | 'remedies'
  | 'ask-the-seer'

export default function NumerologyPage() {
  const { user, userProfile } = useAuth()
  const [activeTab, setActiveTab] = useState<NumerologyTabKey>('introduction')
  const { report: pipelineReport, loading: isLoading, error } = useToolReport('numerology')
  const numerologyData = useMemo(() => numerologyDataFromReport(pipelineReport), [pipelineReport])

  const viralUnlock = useToolReportUnlock('numerology')
  const bypassViral = useViralReportBypass()
  const [showShareCard, setShowShareCard] = useState(false)
  const [waitingLite, setWaitingLite] = useState(false)

  const showNumerologyViral = Boolean(numerologyData) && !bypassViral
  const numerologyTeaser = useMemo(
    () => buildToolTeaser('numerology', pipelineReport ?? numerologyData),
    [pipelineReport, numerologyData]
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
          text: `${numerologyTeaser.archetypeName}: ${numerologyTeaser.hookLine.slice(0, 120)}…`,
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
  }, [copyLink, viralUnlock, numerologyTeaser.archetypeName, numerologyTeaser.hookLine])

  const continueWithoutSharing = useCallback(() => {
    setWaitingLite(true)
    window.setTimeout(() => {
      viralUnlock.unlockLite()
      setWaitingLite(false)
    }, 4000)
  }, [viralUnlock])

  const numerologyCompareHref = useMemo(
    () => `/tools/${toolPathForSlug('numerology')}?friend=compare&ref=share`,
    []
  )

  const numerologyLocked =
    showNumerologyViral && viralUnlock.hydrated && !viralUnlock.isUnlocked && !bypassViral

  const comprehensiveReport = useMemo(() => {
    if (!pipelineReport || typeof pipelineReport !== 'object') return null
    const r = pipelineReport as Record<string, unknown>
    const data = (r.data ?? r) as Record<string, unknown>
    return (data?.comprehensiveAnalysis ?? r.comprehensiveAnalysis) as Record<string, unknown> | null ?? null
  }, [pipelineReport])

  const hasCompleteDetails = !!(userProfile?.birthDate && userProfile?.birthTime && userProfile?.birthPlace)

  // Memoized calculations for performance
  const driverConductor = useMemo(() => ({
    driver: calcDriver(userProfile?.birthDate),
    conductor: calcConductor(userProfile?.birthDate)
  }), [userProfile?.birthDate])

  const personalYear = useMemo(() => 
    calcPersonalYear(userProfile?.birthDate || ''), 
    [userProfile?.birthDate]
  )

  const zodiacInfo = useMemo(() => 
    getZodiacFromDate(userProfile?.birthDate), 
    [userProfile?.birthDate]
  )

  const favorables = useMemo(() => 
    getFavorables(driverConductor.driver.reduced), 
    [driverConductor.driver.reduced]
  )

  const kuaNumber = useMemo(() => {
    const birthYear = userProfile?.birthDate ? parseInt(userProfile.birthDate.split('-')[0], 10) : undefined
    if (!birthYear) return null
    const isMale = userProfile?.gender !== 'female'
    return getKuaResult(birthYear, isMale)
  }, [userProfile])

  const luckyEssentials = useMemo(() => {
    const birthYear = userProfile?.birthDate ? parseInt(userProfile.birthDate.split('-')[0], 10) : undefined
    return { driver: driverConductor.driver.reduced, conductor: driverConductor.conductor.reduced, birthYear }
  }, [driverConductor.driver.reduced, driverConductor.conductor.reduced, userProfile])

  const challengeCycles = useMemo(() => 
    calcChallengeCycles(userProfile?.birthDate), 
    [userProfile?.birthDate]
  )

  const summaryNumbers = useMemo(() => {
    return getSummaryNumbers(
      toIntegerOrNull(numerologyData?.life_path_number ?? numerologyData?.life_path) ?? null,
      toIntegerOrNull(numerologyData?.destiny_number) ?? null,
      toIntegerOrNull(numerologyData?.birthday_number) ?? null
    )
  }, [numerologyData?.life_path_number, numerologyData?.life_path, numerologyData?.destiny_number, numerologyData?.birthday_number])

  // Memoize current month to avoid recalculation on every render
  const currentMonth = useMemo(() => new Date().getMonth() + 1, [])
  
  const monthlyForecast = useMemo(() => {
    const py = personalYear
    const birthYear = userProfile?.birthDate ? parseInt(userProfile.birthDate.split('-')[0], 10) : null
    if (!py || !birthYear) return []
    return generateMonthForecast(py, birthYear, currentMonth)
  }, [personalYear, userProfile, currentMonth])

  const karmicDebts = useMemo(() => {
    return detectKarmicDebtNumbers([
      toIntegerOrNull(numerologyData?.life_path_number ?? numerologyData?.life_path),
      toIntegerOrNull(numerologyData?.expression_number),
      toIntegerOrNull(numerologyData?.destiny_number),
      toIntegerOrNull(numerologyData?.birthday_number),
      toIntegerOrNull(numerologyData?.maturity_number),
    ])
  }, [numerologyData?.life_path_number, numerologyData?.life_path, numerologyData?.expression_number, numerologyData?.destiny_number, numerologyData?.birthday_number, numerologyData?.maturity_number])

  return (
    <ToolReportGuard loading={isLoading} error={error ?? null} toolLabel="numerology data">
      {!hasCompleteDetails ? (
        <div className="relative min-h-screen starfield-ultra-sharp">
          <div className="relative z-10 container mx-auto px-4 pt-4 pb-8">
            <div className="backdrop-blur-sm bg-slate-900/50 border-amber-500/50 rounded-xl p-6 text-center">
              <Info className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="m3-title-large text-slate-300 font-semibold mb-2">Complete Your Profile</h3>
              <p className="m3-body-medium text-slate-400 mb-4">
                Please complete your birth date, time, and place in your profile to generate numerology insights.
              </p>
              <Button asChild className="m3-ripple m3-button-bounce m3-elevation-1 hover:m3-elevation-2 m3-elevation-transition bg-[var(--m3-primary)] text-[var(--m3-on-primary)] hover:bg-[var(--m3-primary)]/90">
                <Link href="/profile">
                  <User className="w-4 h-4 mr-2" />
                  Complete Profile
                </Link>
              </Button>
            </div>
          </div>
        </div>
      ) : !numerologyData ? (
        <div className="relative min-h-screen starfield-ultra-sharp">
          <div className="relative z-10 container mx-auto px-4 pt-4 pb-8">
            <div className="backdrop-blur-sm bg-slate-900/50 border-amber-500/50 rounded-xl p-6 text-center">
              <Info className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="m3-title-large text-slate-300 font-semibold mb-2">Numerology Report</h3>
              <p className="m3-body-medium text-slate-400 mb-4">Generate your mystical profile to see your Chaldean numerology report.</p>
              <Button asChild className="m3-ripple m3-button-bounce m3-elevation-1 hover:m3-elevation-2 m3-elevation-transition bg-[var(--m3-primary)] text-[var(--m3-on-primary)] hover:bg-[var(--m3-primary)]/90">
                <Link href="/profile">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate your mystical profile
                </Link>
              </Button>
            </div>
          </div>
        </div>
      ) : (
    <div className="relative min-h-screen">
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 pt-4 pb-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="m3-headline-large mb-6 flex items-center justify-center gap-3">
            <span className="text-amber-400">🔢</span>
            <span className="bg-gradient-to-b from-amber-200 via-yellow-400 to-amber-600 bg-clip-text text-transparent">Numerology</span>
          </h1>
          <p className="m3-body-large text-slate-300">
            Ancient Babylonian number system revealing life patterns and destiny
          </p>
          
          {/* Data Source Indicators */}
          {/* Data source pills removed per request */}
          
          {/* Debug info removed for production */}
        </div>

        {showNumerologyViral && !bypassViral && (
          <div className="mb-6 space-y-4">
            <TeaserView teaser={numerologyTeaser} />
            {showShareCard && (
              <ShareCard
                archetypeName={numerologyTeaser.archetypeName}
                hookLine={numerologyTeaser.hookLine}
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

        {showNumerologyViral && viralUnlock.isUnlocked && !bypassViral && (
          <div className="mb-4 flex justify-center">
            <Link
              href={numerologyCompareHref}
              className="inline-flex items-center gap-2 rounded-full border border-violet-500/40 bg-violet-950/40 px-4 py-2 text-sm font-medium text-violet-100 hover:bg-violet-900/50"
            >
              <Users className="h-4 w-4" />
              Compare with a friend
            </Link>
          </div>
        )}

        {/* Main Content */}
        <div className="rounded-2xl border border-amber-500/30 bg-slate-900/80 overflow-hidden">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as NumerologyTabKey)} className="w-full min-w-0">
          <TabsList className="flex w-full flex-nowrap overflow-x-auto gap-1 sm:gap-2 p-2 sm:p-3 bg-slate-800/50 border-b border-amber-500/20 rounded-none h-auto min-h-0 justify-start [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-amber-500/30">
            <TabsTrigger 
              value="introduction" 
              className="shrink-0 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 rounded-t-lg rounded-b-none px-4 py-2.5 text-sm font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 transition-all flex items-center justify-center border border-transparent data-[state=inactive]:border-slate-600/50"
            >
              Introduction
            </TabsTrigger>
            <TabsTrigger 
              value="overview" 
              className="shrink-0 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 rounded-t-lg rounded-b-none px-4 py-2.5 text-sm font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 transition-all flex items-center justify-center border border-transparent data-[state=inactive]:border-slate-600/50"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="report" 
              className="shrink-0 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 rounded-t-lg rounded-b-none px-4 py-2.5 text-sm font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 transition-all flex items-center justify-center border border-transparent data-[state=inactive]:border-slate-600/50"
            >
              Report
            </TabsTrigger>
            <TabsTrigger 
              value="compatibility" 
              className="shrink-0 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 rounded-t-lg rounded-b-none px-4 py-2.5 text-sm font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 transition-all flex items-center justify-center border border-transparent data-[state=inactive]:border-slate-600/50"
            >
              Compare
            </TabsTrigger>
            <TabsTrigger 
              value="numbers" 
              className="shrink-0 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 rounded-t-lg rounded-b-none px-4 py-2.5 text-sm font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 transition-all flex items-center justify-center border border-transparent data-[state=inactive]:border-slate-600/50"
            >
              Numbers
            </TabsTrigger>
            <TabsTrigger 
              value="remedies" 
              className="shrink-0 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 rounded-t-lg rounded-b-none px-4 py-2.5 text-sm font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 transition-all flex items-center justify-center border border-transparent data-[state=inactive]:border-slate-600/50"
            >
              Remedies
            </TabsTrigger>
            <TabsTrigger 
              value="guidance" 
              className="shrink-0 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 rounded-t-lg rounded-b-none px-4 py-2.5 text-sm font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 transition-all flex items-center justify-center border border-transparent data-[state=inactive]:border-slate-600/50"
            >
              Guidance
            </TabsTrigger>
            <TabsTrigger 
              value="ask-the-seer" 
              className="shrink-0 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 rounded-t-lg rounded-b-none px-4 py-2.5 text-sm font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 transition-all flex items-center justify-center border border-transparent data-[state=inactive]:border-slate-600/50"
            >
              Ask the Seer
            </TabsTrigger>
          </TabsList>

          {activeTab === 'ask-the-seer' ? (
          <TabsContent value="ask-the-seer" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
            >
            {user?.uid && numerologyData ? (
              <NumerologySeerChatInterface
                userId={user.uid}
                userProfile={userProfile}
                numerologyData={{
                  lifePathNumber: toIntegerOrUndefined(numerologyData.life_path_number ?? numerologyData.life_path),
                  expressionNumber: toIntegerOrUndefined(numerologyData.expression_number),
                  soulUrgeNumber: toIntegerOrUndefined(numerologyData.soul_number ?? numerologyData.soul_urge),
                  personalityNumber: toIntegerOrUndefined(numerologyData.personality_number),
                  destinyNumber: toIntegerOrUndefined(numerologyData.destiny_number),
                  birthdayNumber: toIntegerOrUndefined(numerologyData.birthday_number),
                  maturityNumber: toIntegerOrUndefined(numerologyData.maturity_number),
                  personalYearNumber: toIntegerOrUndefined((numerologyData as Record<string, unknown>).personal_year_number)
                }}
                comprehensiveReport={comprehensiveReport}
              />
            ) : (
              <Card className="bg-slate-900/50 border-amber-500/50 backdrop-blur-sm rounded-xl" elevation={1}>
                <CardHeader>
                  <CardTitle className="m3-title-medium flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-amber-400" />
                    <span className="text-amber-200">AI Numerology Coach</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center py-8">
                  <div className="space-y-4">
                    <div className="w-16 h-16 backdrop-blur-sm bg-slate-900/50 border-amber-500/50 rounded-full flex items-center justify-center mx-auto">
                      <Brain className="w-8 h-8 text-amber-300" />
                    </div>
                    <h3 className="m3-title-large font-serif text-amber-300">Ask the Seer</h3>
                    <p className="m3-body-medium text-slate-300">
                      Please wait while we load your numerology data...
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
            </motion.div>
          </TabsContent>
          ) : showNumerologyViral && !viralUnlock.hydrated ? (
            <div className="py-12 text-center text-slate-400">Loading report…</div>
          ) : (
            <div className="relative min-h-[320px]">
              {numerologyLocked && (
                <ViralLockOverlay
                  onUnlockClick={handleShareToUnlock}
                  onContinueWithoutSharing={waitingLite ? () => {} : continueWithoutSharing}
                  continueDisabled={waitingLite}
                />
              )}
              <div
                className={cn(
                  numerologyLocked &&
                    'pointer-events-none select-none blur-sm filter transition-[filter] duration-300 [&_*]:pointer-events-none'
                )}
              >
          {/* Introduction Tab */}
          <TabsContent value="introduction" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
            >
              <ToolIntroductionTab toolSlug="numerology" />
            </motion.div>
          </TabsContent>

          {/* Report Tab */}
          <TabsContent value="report" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
            >
              <ComprehensiveNumerologyReport
                userId={user?.uid}
                numerologyData={numerologyData}
                userProfile={userProfile}
                cachedReport={comprehensiveReport as ComprehensiveAnalysis | null | undefined}
                isLoadingReport={isLoading}
              />
            </motion.div>
          </TabsContent>

          {/* Compatibility Tab */}
          <TabsContent value="compatibility" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
            >
              <CompatibilityTab toolSlug="numerology" />
            </motion.div>
          </TabsContent>

          {/* Remedies Tab */}
          <TabsContent value="remedies" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
            >
              <NumerologyRemedies 
                numerologyData={numerologyData} 
                birthDate={userProfile?.birthDate}
                onNavigateToTab={(tab) => setActiveTab(tab as NumerologyTabKey)}
              />
            </motion.div>
          </TabsContent>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
              className="space-y-6"
            >
            {/* Birth Information Section */}
            <DashboardSection
              title="Birth Information"
              icon={<User className="w-6 h-6" />}
              colorScheme="amber"
              defaultExpanded={true}
              storageKey="numerology-birth-info"
            >
              <DevotionistStyleCard
                icon={<User className="w-5 h-5" />}
                title="Your Birth Details"
                items={[
                  { text: `Date: ${userProfile?.birthDate || 'Not set'}`, icon: <Calendar className="w-4 h-4" /> },
                  { text: `Time: ${userProfile?.birthTime || 'Not set'}`, icon: <Clock className="w-4 h-4" /> },
                  { text: `Place: ${userProfile?.birthPlace || 'Not set'}`, icon: <MapPin className="w-4 h-4" /> }
                ]}
                colorScheme="amber"
              />
            </DashboardSection>

            {/* Core Numbers Summary Section */}
            <DashboardSection
              title="Core Numbers Summary"
              icon={<Hash className="w-6 h-6" />}
              badge="Primary Profile"
              colorScheme="blue"
              defaultExpanded={true}
              storageKey="numerology-core-numbers"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DevotionistStyleCard
                  icon={<Hash className="w-5 h-5" />}
                  title="Core Numbers"
                  summary={numerologyData && typeof numerologyData === 'object' 
                    ? `Your numerological blueprint reveals key patterns in your life journey.`
                    : 'No numerology data available'}
                  items={numerologyData && typeof numerologyData === 'object' ? [
                    { text: `Life Path: ${numerologyData.life_path_number || numerologyData.life_path || 'N/A'}`, highlight: true },
                    { text: `Expression: ${numerologyData.expression_number || 'N/A'}` },
                    { text: `Soul Urge: ${numerologyData.soul_number || numerologyData.soul_urge || 'N/A'}` },
                    { text: `Personality: ${numerologyData.personality_number || 'N/A'}` },
                    { text: `Destiny: ${numerologyData.destiny_number || 'N/A'}` }
                  ] : undefined}
                  colorScheme="blue"
                />

                {/* Lo Shu Grid - Enhanced Display */}
                <div className="space-y-4">
                  <LoShuGrid
                    birthDateISO={userProfile?.birthDate}
                    driverReduced={driverConductor.driver.reduced}
                    conductorReduced={driverConductor.conductor.reduced}
                  />
                  <DevotionistStyleCard
                    icon={<Calculator className="w-5 h-5" />}
                    title="Data Source"
                    items={[
                      { text: 'Source: Calculated', icon: <CheckCircle className="w-4 h-4" /> },
                      { text: 'System: Chaldean' },
                      { text: 'Status: Ready', icon: <CheckCircle className="w-4 h-4 text-green-600" /> }
                    ]}
                    colorScheme="cyan"
                  />
                </div>
              </div>
            </DashboardSection>

            {/* Karmic Indicators Section */}
            {karmicDebts.length > 0 && (
              <DashboardSection
                title="Karmic Indicators"
                icon={<AlertTriangle className="w-6 h-6" />}
                badge={`${karmicDebts.length} Detected`}
                colorScheme="orange"
                defaultExpanded={false}
                storageKey="numerology-karmic-debts"
              >
                <DevotionistStyleCard
                  icon={<AlertTriangle className="w-5 h-5" />}
                  title="Karmic Debts"
                  summary="These numbers indicate lessons to be learned in this lifetime."
                  items={karmicDebts.map((kd) => ({
                    text: `KD ${kd}: ${karmicDebtShortMeaning(kd)}`,
                    type: 'challenge' as const
                  }))}
                  colorScheme="orange"
                />
              </DashboardSection>
            )}
            </motion.div>
          </TabsContent>

          {/* Numbers Tab */}
          <TabsContent value="numbers" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
              className="space-y-6"
            >
            {/* Primary Numbers Section */}
            <DashboardSection
              title="Primary Numbers"
              icon={<Target className="w-6 h-6" />}
              badge="Core Identity"
              colorScheme="amber"
              defaultExpanded={true}
              storageKey="numerology-primary-numbers"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Life Path Number */}
                <DevotionistStyleCard
                  icon={<Target className="w-5 h-5" />}
                  title={`Life Path Number ${numerologyData?.life_path_number || numerologyData?.life_path || 'N/A'}`}
                  summary={(() => {
                    const n = toIntegerOrNull(numerologyData?.life_path_number ?? numerologyData?.life_path)
                    return n != null ? (ChaldeanInterpretations[n] || "Your life's purpose and the lessons you're here to learn") : "Your life's purpose and the lessons you're here to learn"
                  })()}
                  colorScheme="amber"
                />

                {/* Expression Number */}
                <DevotionistStyleCard
                  icon={<BookOpen className="w-5 h-5" />}
                  title={`Expression Number ${numerologyData?.expression_number || 'N/A'}`}
                  summary={(() => {
                    const n = toIntegerOrNull(numerologyData?.expression_number)
                    return n != null ? (ChaldeanInterpretations[n] || "Your natural talents and abilities revealed through your name") : "Your natural talents and abilities"
                  })()}
                  colorScheme="blue"
                />

                {/* Soul Urge Number */}
                <DevotionistStyleCard
                  icon={<Heart className="w-5 h-5" />}
                  title={`Soul Urge Number ${numerologyData?.soul_number || numerologyData?.soul_urge || 'N/A'}`}
                  summary={(() => {
                    const n = toIntegerOrNull(numerologyData?.soul_number ?? numerologyData?.soul_urge)
                    return n != null ? (ChaldeanInterpretations[n] || "Your inner desires and motivations that drive your choices") : "Your inner desires and motivations"
                  })()}
                  colorScheme="pink"
                />
              </div>
            </DashboardSection>

            {/* Secondary Numbers Section */}
            <DashboardSection
              title="Secondary Numbers"
              icon={<Eye className="w-6 h-6" />}
              colorScheme="blue"
              defaultExpanded={true}
              storageKey="numerology-secondary-numbers"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personality Number */}
                <DevotionistStyleCard
                  icon={<Eye className="w-5 h-5" />}
                  title={`Personality Number ${numerologyData?.personality_number || 'N/A'}`}
                  summary={(() => {
                    const n = toIntegerOrNull(numerologyData?.personality_number)
                    return n != null ? (ChaldeanInterpretations[n] || "How others perceive you based on your outer expression") : "How others perceive you"
                  })()}
                  colorScheme="purple"
                />

                {/* Destiny Number */}
                <DevotionistStyleCard
                  icon={<Sparkles className="w-5 h-5" />}
                  title={`Destiny Number ${numerologyData?.destiny_number || 'N/A'}`}
                  summary={(() => {
                    const n = toIntegerOrNull(numerologyData?.destiny_number)
                    return n != null ? (ChaldeanInterpretations[n] || "Your ultimate life purpose and the path you're meant to walk") : "Your ultimate life purpose"
                  })()}
                  colorScheme="green"
                />

                {/* Birthday & Maturity Numbers */}
                {numerologyData?.birthday_number != null ? (
                  <DevotionistStyleCard
                    icon={<Calendar className="w-5 h-5" />}
                    title={`Birthday Number ${numerologyData.birthday_number}`}
                    summary="Special gift or talent you bring to this life"
                    colorScheme="cyan"
                  />
                ) : null}
                {numerologyData?.maturity_number != null ? (
                  <DevotionistStyleCard
                    icon={<Sparkles className="w-5 h-5" />}
                    title={`Maturity Number ${numerologyData.maturity_number}`}
                    summary="The ultimate goal you're working toward in the second half of life"
                    colorScheme="amber"
                  />
                ) : null}
              </div>
            </DashboardSection>

            {/* Cycles & Timing Section */}
            <DashboardSection
              title="Cycles & Timing"
              icon={<Sun className="w-6 h-6" />}
              colorScheme="purple"
              defaultExpanded={false}
              storageKey="numerology-cycles-timing"
            >
              <div className="space-y-6">
                {/* Personal Year */}
                <DevotionistStyleCard
                  icon={<Sun className="w-5 h-5" />}
                  title={`Personal Year ${personalYear ?? '—'}`}
                  summary="Focus theme for this year based on your birth date"
                  colorScheme="orange"
                />

                {/* Driver & Conductor */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DevotionistStyleCard
                    icon={<Moon className="w-5 h-5" />}
                    title={`Driver (Day): ${driverConductor.driver.master ? `${driverConductor.driver.master} (→ ${driverConductor.driver.reduced})` : driverConductor.driver.reduced ?? '—'}`}
                    summary="The Driver reflects your everyday operating style and immediate instincts. It shapes first moves, habits, and how you act under pressure."
                    colorScheme="cyan"
                  />
                  <DevotionistStyleCard
                    icon={<Moon className="w-5 h-5" />}
                    title={`Conductor (Full Date): ${driverConductor.conductor.master ? `${driverConductor.conductor.master} (→ ${driverConductor.conductor.reduced})` : driverConductor.conductor.reduced ?? '—'}`}
                    summary="The Conductor sets your life's broader rhythm and timing—how people, places, and events align around you across years."
                    colorScheme="cyan"
                  />
                </div>
              </div>
            </DashboardSection>

            {/* Lucky Elements Section */}
            <DashboardSection
              title="Lucky Elements"
              icon={<Star className="w-6 h-6" />}
              colorScheme="green"
              defaultExpanded={false}
              storageKey="numerology-lucky-elements"
            >
              <div className="space-y-6">
                {/* Lucky Essentials */}
                <LuckyEssentials
                  driver={luckyEssentials.driver}
                  conductor={luckyEssentials.conductor}
                  birthYear={luckyEssentials.birthYear}
                />

                {/* Zodiac */}
                {zodiacInfo && (
                  <DevotionistStyleCard
                    icon={<Sparkles className="w-5 h-5" />}
                    title={`Your Zodiac: ${zodiacInfo.sign}`}
                    summary={zodiacInfo.description}
                    items={zodiacInfo.traits.map(t => ({ text: t }))}
                    colorScheme="purple"
                  />
                )}

                {/* Favorables */}
                <DevotionistStyleCard
                  icon={<Star className="w-5 h-5" />}
                  title="Favorables"
                  summary="Favorable elements aligned with your numerology profile"
                  items={[
                    { text: `Days: ${favorables.days.join(', ')}` },
                    { text: `Alphabets: ${favorables.alphabets.slice(0, 5).join(', ')}` },
                    { text: `Direction: ${favorables.direction}` },
                    { text: `Ruling Deity: ${favorables.deity}` },
                    { text: `Mantra: ${favorables.mantra}`, highlight: true }
                  ]}
                  colorScheme="amber"
                />

                {/* Kua Number */}
                {kuaNumber && (
                  <DevotionistStyleCard
                    icon={<Compass className="w-5 h-5" />}
                    title={`Kua Number: ${kuaNumber.number}`}
                    summary={kuaNumber.attributes}
                    items={[
                      { text: `Success: ${kuaNumber.directions.success}` },
                      { text: `Health: ${kuaNumber.directions.health}` },
                      { text: `Relationships: ${kuaNumber.directions.relationships}` },
                      { text: `Wisdom: ${kuaNumber.directions.wisdom}` }
                    ]}
                    colorScheme="green"
                  />
                )}

                {/* Name Planes */}
                <NamePlanes
                  firstName={userProfile?.fullName ?? userProfile?.displayName ?? user?.displayName ?? undefined}
                  nameNumber={toIntegerOrUndefined(numerologyData?.expression_number) ?? toIntegerOrUndefined(numerologyData?.destiny_number)}
                />
              </div>
            </DashboardSection>
            </motion.div>
          </TabsContent>


          {/* Guidance Tab */}
          <TabsContent value="guidance" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
              className="space-y-6"
            >
            {/* Health Blueprint Section */}
            {driverConductor.driver.reduced === 6 && (
              <DashboardSection
                title="Health & Immunity Blueprint"
                icon={<Activity className="w-6 h-6" />}
                colorScheme="orange"
                defaultExpanded={false}
                storageKey="numerology-health-blueprint"
              >
                <DevotionistStyleCard
                  icon={<Activity className="w-5 h-5" />}
                  title="Health Considerations"
                  summary="See Remedies section for support."
                  items={[
                    'Excess mucus leading to lung issues',
                    'Nerve weakness from emotional sensitivity',
                    'Kidney and urinary problems',
                    'Susceptibility to colds',
                    'Constipation from preference for sweets and oily foods',
                  ].map(issue => ({ text: issue, type: 'challenge' as const }))}
                  colorScheme="orange"
                />
              </DashboardSection>
            )}

            {/* Career Pathways Section */}
            {(() => {
              const lp = numerologyData?.life_path_number || numerologyData?.life_path
              const dest = numerologyData?.destiny_number
              const hasCareerGuidance = lp === 6 && dest === 2
              if (!hasCareerGuidance) return null
              const careers = [
                { role: 'Counseling or Therapy', strengths: ['Emotional support', 'Guidance'], challenges: ['Handling conflict'] },
                { role: 'Human Resources', strengths: ['Harmonious work environment', 'Relationship building'], challenges: ['Setting boundaries'] },
                { role: 'Event Planning', strengths: ['Balanced experiences', 'Organization'], challenges: ['Managing stress'] },
                { role: 'Interior Design', strengths: ['Balance and harmony', 'Aesthetic sense'], challenges: ['Client expectations'] },
                { role: 'Social Work', strengths: ['Community contribution', 'Addressing imbalances'], challenges: ['Emotional boundaries'] },
              ]
              return (
                <DashboardSection
                  title="Career Pathways"
                  icon={<Briefcase className="w-6 h-6" />}
                  badge={`${careers.length} Recommended`}
                  colorScheme="blue"
                  defaultExpanded={false}
                  storageKey="numerology-career-pathways"
                >
                  <div className="space-y-4">
                    {careers.map((career, idx) => (
                      <DevotionistStyleCard
                        key={idx}
                        icon={<Briefcase className="w-5 h-5" />}
                        title={career.role}
                        items={[
                          ...career.strengths.map(s => ({ text: s, type: 'positive' as const })),
                          ...career.challenges.map(c => ({ text: c, type: 'challenge' as const }))
                        ]}
                        colorScheme="blue"
                      />
                    ))}
                  </div>
                </DashboardSection>
              )
            })()}

            {/* Monthly Forecast Section */}
            {monthlyForecast.length > 0 && (
              <DashboardSection
                title="Monthly Forecast"
                icon={<Calendar className="w-6 h-6" />}
                badge={`${monthlyForecast.length} Months`}
                colorScheme="amber"
                defaultExpanded={false}
                storageKey="numerology-monthly-forecast"
              >
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {monthlyForecast.map((month, idx) => (
                    <DevotionistStyleCard
                      key={idx}
                      icon={<Calendar className="w-5 h-5" />}
                      title={`${month.month} ${month.year}`}
                      subtitle={month.theme}
                      summary={month.advice}
                      items={month.expectations.slice(0, 4).map(exp => ({ text: exp }))}
                      variant="timeline"
                      colorScheme="amber"
                    />
                  ))}
                </div>
              </DashboardSection>
            )}

            {/* Challenge Cycles Section */}
            {challengeCycles.length > 0 && (
              <DashboardSection
                title="Challenge Cycles"
                icon={<TrendingUp className="w-6 h-6" />}
                badge={`${challengeCycles.length} Cycles`}
                colorScheme="cyan"
                defaultExpanded={false}
                storageKey="numerology-challenge-cycles"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {challengeCycles.map((cycle, idx) => (
                    <DevotionistStyleCard
                      key={idx}
                      icon={<TrendingUp className="w-5 h-5" />}
                      title={`Challenge ${cycle.number} (Ages ${cycle.range})`}
                      summary={cycle.attributes}
                      items={[{ text: `Focus: ${cycle.focus}`, highlight: true }]}
                      colorScheme="orange"
                    />
                  ))}
                </div>
              </DashboardSection>
            )}

            {/* Success Indicators Section */}
            <DashboardSection
              title="Success Indicators"
              icon={<ActivityIcon className="w-6 h-6" />}
              colorScheme="green"
              defaultExpanded={false}
              storageKey="numerology-success-indicators"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <DevotionistStyleCard
                  icon={<ActivityIcon className="w-5 h-5" />}
                  title={`Success Number ${summaryNumbers.success.number}`}
                  items={summaryNumbers.success.qualities.map(q => ({ text: q, type: 'positive' as const }))}
                  colorScheme="green"
                />
                <DevotionistStyleCard
                  icon={<ActivityIcon className="w-5 h-5" />}
                  title={`Connection Number ${summaryNumbers.connection.number}`}
                  summary={summaryNumbers.connection.focus}
                  colorScheme="blue"
                />
                <DevotionistStyleCard
                  icon={<ActivityIcon className="w-5 h-5" />}
                  title={`Maturity Number ${summaryNumbers.maturity.number}`}
                  subtitle={summaryNumbers.maturity.note}
                  items={summaryNumbers.maturity.traits.map(t => ({ text: t }))}
                  colorScheme="purple"
                />
              </div>
            </DashboardSection>

            {/* Remedies Section */}
            <DashboardSection
              title="Quick Remedies"
              icon={<Gem className="w-6 h-6" />}
              colorScheme="amber"
              defaultExpanded={false}
              storageKey="numerology-quick-remedies"
            >
              <DevotionistStyleCard
                icon={<Gem className="w-5 h-5" />}
                title="Remedies Guide"
                summary="Choose up to 3 remedies that resonate most with you. Focus and dedication enhance their effectiveness."
                items={[
                  { text: 'For Missing Numbers (Lo Shu Grid): See the Remedies tab for comprehensive remedies based on your missing numbers and numerology profile.' },
                  { text: 'Health Mantra: Mrityunjaya Beeja Mantra - Om Haum Jum Sah', highlight: true },
                  { text: 'Chant 108 times daily for healing and protection.' }
                ]}
                colorScheme="amber"
              />
            </DashboardSection>

            {/* Final Note */}
            <DevotionistStyleCard
              icon={<Sparkles className="w-5 h-5" />}
              title="Final Note"
              summary="This fortune report is a spark—let your actions be the flame. Integrate the recommendations that resonate, and use them as a guide to create a more fulfilling and prosperous life."
              colorScheme="cyan"
              variant="callout"
            />
            </motion.div>
          </TabsContent>
              </div>
            </div>
          )}
        </Tabs>
        </div>
      </div>
    </div>
      )}
    </ToolReportGuard>
  )
}
