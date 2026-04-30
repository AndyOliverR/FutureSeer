// Tarot page: combined/system data from pipeline only (useToolReport). No auto-call to tool API.
"use client"

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import ErrorBoundary from '@/components/ErrorBoundary'
import { useAuth } from '@/hooks/use-auth'
import { useToolReport } from '@/hooks/useComprehensiveMysticalProfile'
import { ToolReportGuard } from '@/components/ToolReportGuard'
import { useTarot } from '@/hooks/use-tarot'
import { tarotIntelligence } from '@/lib/tarotIntelligence'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ToolIntroductionTab } from '@/components/ToolIntroductionTab'
import { CompatibilityTab } from '@/components/compatibility/CompatibilityTab'
import TarotSeerChatInterface from '@/components/TarotSeerChatInterface'
import { TarotCard } from '@/lib/tarotIntelligence'
import { SpreadType, CombinedSystemData, ProfileCardsData } from '@/types/tarot'
import { TarotDashboardHero } from '@/components/tarot/TarotDashboardHero'
import { TarotProfileDiagram } from '@/components/tarot/TarotProfileDiagram'
import { TarotLifePathMap } from '@/components/tarot/TarotLifePathMap'
import { ElementalBalanceWheel } from '@/components/tarot/ElementalBalanceWheel'
import { ArcanaDistributionChart } from '@/components/tarot/ArcanaDistributionChart'
import { TarotNumerologyIntegration } from '@/components/tarot/TarotNumerologyIntegration'
import { DashboardSection } from '@/components/western/DashboardSection'
import { ToolReportStatusChips } from '@/components/tool-status/ToolReportStatusChips'
import {
  Sparkles, 
  Calendar,
  Clock,
  RefreshCw,
  AlertTriangle,
  Info,
  Zap,
  Brain,
  User,
  Target,
  Activity,
  BookOpen,
  Star,
  Loader2,
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
import { applyTarotImageOnError, resolveTarotCardImageSrc } from '@/lib/tarotImageUrl'
import {
  calculateLifePathNumber,
  calculateDestinyNumber,
  calculateSoulNumber,
  calculatePersonalityNumber,
} from '@/lib/numerologyCalculations'

function TarotPage() {
  const router = useRouter()
  const { user, userProfile } = useAuth()
  const [activeTab, setActiveTab] = useState<'introduction' | 'tarot-profile' | 'reading' | 'cards' | 'combined-system' | 'compatibility' | 'ask-the-seer'>('introduction')
  
  // Use the tarot hook
  const {
    question,
    setQuestion,
    spreadType,
    setSpreadType,
    reading: currentReading,
    isLoading: isReadingLoading,
    error: readingError,
    performTarotReading,
    resetData: resetReading
  } = useTarot()

  // Get available spreads
  const [availableSpreads, setAvailableSpreads] = useState<SpreadType[]>([])
  const [allCards, setAllCards] = useState<TarotCard[]>([])
  
  const {
    report: pipelineReport,
    loading: isLoadingCombinedSystem,
    error: profileError,
    reportUpdatedAt,
    reportGeneratedAt,
    reportUnchanged,
  } = useToolReport('tarot')
  const freshnessLabel = useMemo(() => {
    const ts = reportUpdatedAt ?? reportGeneratedAt
    if (!ts) return null
    const ms = typeof ts === "number" ? ts : Date.parse(ts)
    if (!Number.isFinite(ms)) return null
    const delta = Date.now() - ms
    if (delta < 60_000) return "Updated just now"
    if (delta < 3_600_000) return `Updated ${Math.floor(delta / 60_000)} min ago`
    if (delta < 86_400_000) return `Updated ${Math.floor(delta / 3_600_000)}h ago`
    return `Updated ${Math.floor(delta / 86_400_000)}d ago`
  }, [reportGeneratedAt, reportUpdatedAt])
  const { report: westernReport } = useToolReport('western')
  const combinedSystemData = useMemo((): CombinedSystemData | null => {
    if (!pipelineReport || typeof pipelineReport !== 'object') return null
    const r = pipelineReport as Record<string, unknown>
    if (r.placeholder === true) return null
    const data = (r.data ?? r) as Record<string, unknown> | undefined
    if (!data || typeof data !== 'object') return null
    const hasProfileCards = data.profileCards ?? data.combinedAnalysis
    if (hasProfileCards && typeof hasProfileCards === 'object') return data as unknown as CombinedSystemData
    const storedProfile = data.profile ?? (r as Record<string, unknown>).profile
    if (storedProfile && typeof storedProfile === 'object' && 'birthCard' in (storedProfile as object)) {
      const tarotProfile = storedProfile as CombinedSystemData['tarotProfile']
      const fullName = userProfile?.fullName || userProfile?.displayName || ''
      const hasName = fullName.trim().length > 0
      const birthDate = userProfile?.birthDate
      const numerology =
        birthDate && hasName
          ? {
              lifePathNumber: calculateLifePathNumber(birthDate),
              destinyNumber: calculateDestinyNumber(fullName),
              soulNumber: calculateSoulNumber(fullName),
              personalityNumber: calculatePersonalityNumber(fullName),
            }
          : { lifePathNumber: 0, destinyNumber: 0, soulNumber: 0, personalityNumber: 0 }
      const rawWestern = westernReport as Record<string, unknown> | undefined
      const westernData = rawWestern?.data as Record<string, unknown> | undefined
      const chart = (rawWestern?.chart ?? westernData?.chart) as { planets?: Array<{ name?: string; sign?: string | { signName?: string } }> } | undefined
      const planets = chart?.planets
      const getSign = (name: string): string | undefined => {
        const p = planets?.find((pl) => pl?.name === name)
        if (!p?.sign) return undefined
        return typeof p.sign === 'string' ? p.sign : (p.sign as { signName?: string }).signName
      }
      const sunSign = getSign('Sun')
      const moonSign = getSign('Moon')
      const risingSign = getSign('Ascendant')
      const westernAstrology =
        sunSign || moonSign || risingSign
          ? { sunSign, moonSign, risingSign }
          : undefined
      return {
        tarotProfile,
        numerology,
        westernAstrology,
      } as CombinedSystemData
    }
    return null
  }, [pipelineReport, userProfile?.birthDate, userProfile?.fullName, userProfile?.displayName, westernReport])

  const viralUnlock = useToolReportUnlock('tarot')
  const bypassViral = useViralReportBypass()
  const [showShareCard, setShowShareCard] = useState(false)
  const [waitingLite, setWaitingLite] = useState(false)

  const showTarotViral = Boolean(combinedSystemData) && !bypassViral
  const tarotTeaser = useMemo(
    () => buildToolTeaser('tarot', pipelineReport ?? combinedSystemData),
    [pipelineReport, combinedSystemData]
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
          text: `${tarotTeaser.archetypeName}: ${tarotTeaser.hookLine.slice(0, 120)}…`,
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
  }, [copyLink, viralUnlock, tarotTeaser.archetypeName, tarotTeaser.hookLine])

  const continueWithoutSharing = useCallback(() => {
    setWaitingLite(true)
    window.setTimeout(() => {
      viralUnlock.unlockLite()
      setWaitingLite(false)
    }, 4000)
  }, [viralUnlock])

  const tarotCompareHref = useMemo(
    () => `/tools/${toolPathForSlug('tarot')}?friend=compare&ref=share`,
    []
  )

  const tarotLocked =
    showTarotViral && viralUnlock.hydrated && !viralUnlock.isUnlocked && !bypassViral

  useEffect(() => {
    const spreads = tarotIntelligence.getAvailableSpreads()
    setAvailableSpreads(spreads)
    const cards = tarotIntelligence.getAllCards()
    setAllCards(cards)
  }, [])

  // Calculate profile cards if birth date and name are available (memoized for performance)
  const { profileCards, profileCardsError } = useMemo((): {
    profileCards: ProfileCardsData | null
    profileCardsError: string | null
  } => {
    if (!userProfile?.birthDate) return { profileCards: null, profileCardsError: null }

    const fullName = userProfile.fullName || userProfile.displayName || ''
    if (!fullName) return { profileCards: null, profileCardsError: null }

    try {
      return {
        profileCards: tarotIntelligence.calculateProfileCards(userProfile.birthDate, fullName),
        profileCardsError: null,
      }
    } catch {
      return {
        profileCards: null,
        profileCardsError:
          'Unable to calculate your profile cards. Please check your birth date and name.',
      }
    }
  }, [userProfile])

  // Check for reduced motion preference
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  // Material 3 motion configuration - optimized for GPU acceleration
  const motionConfig = useMemo(() => {
    if (prefersReducedMotion) return { duration: 0 }
    return { duration: 0.3, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }
  }, [prefersReducedMotion])

  // Memoize tab configuration
  const tabsConfig = useMemo(() => [
    { value: 'introduction', label: 'Introduction', icon: null },
    { value: 'tarot-profile', label: 'Tarot Profile', icon: User },
    { value: 'reading', label: 'Reading', icon: Sparkles },
    { value: 'cards', label: 'Cards', icon: BookOpen },
    { value: 'combined-system', label: 'Combined', icon: Star },
    { value: 'compatibility', label: 'Compare', icon: null },
    { value: 'ask-the-seer', label: 'Ask the Seer', icon: Brain }
  ], [])

  return (
    <ToolReportGuard loading={isLoadingCombinedSystem} error={profileError ?? null} toolLabel="tarot">
    <div className="starfield-ultra-sharp min-h-screen w-full min-w-0 max-w-full p-4 overflow-x-hidden">
      <div className="relative z-10 max-w-7xl mx-auto py-8 w-full min-w-0">
        <div className="text-center mb-8 pt-4">
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-semibold mb-6">
            <span className="text-purple-300">🔮</span>{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-pink-400 to-purple-600">Tarot Divination</span>
          </h1>
          <p className="text-slate-200 leading-relaxed text-xl font-light">
            Ancient wisdom through the sacred art of Tarot card reading
          </p>
          <p className="text-slate-400 text-sm mt-3">Deck tip: use a trusted local or official deck source.</p>
          <ToolReportStatusChips
            freshnessLabel={freshnessLabel}
            reportUnchanged={reportUnchanged}
            className="mt-3"
          />
        </div>

        {showTarotViral && !bypassViral && (
          <div className="mb-6 space-y-4">
            <TeaserView teaser={tarotTeaser} />
            {showShareCard && (
              <ShareCard
                archetypeName={tarotTeaser.archetypeName}
                hookLine={tarotTeaser.hookLine}
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

        {showTarotViral && viralUnlock.isUnlocked && !bypassViral && (
          <div className="mb-4 flex justify-center">
            <Link
              href={tarotCompareHref}
              className="inline-flex items-center gap-2 rounded-full border border-violet-500/40 bg-violet-950/40 px-4 py-2 text-sm font-medium text-violet-100 hover:bg-violet-900/50"
            >
              <Users className="h-4 w-4" />
              Compare with a friend
            </Link>
          </div>
        )}

        {/* Main Content */}
        <div className="rounded-2xl border border-amber-500/30 bg-slate-900/80 overflow-hidden w-full min-w-0">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full min-w-0">
          <TabsList className="flex w-full min-w-0 flex-nowrap overflow-x-auto no-scrollbar gap-1 sm:gap-2 p-2 sm:p-3 bg-slate-800/50 border-b border-amber-500/20 rounded-none h-auto min-h-0 justify-start [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-amber-500/30">
            {tabsConfig.map((tab) => {
              const IconComponent = tab.icon
              return (
                <motion.div
                  key={tab.value}
                  whileHover={{}}
                  whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                  transition={prefersReducedMotion ? {} : { type: "spring", stiffness: 400, damping: 17 }}
                  className="relative shrink-0"
                >
                  <TabsTrigger 
                    value={tab.value} 
                    className="shrink-0 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 rounded-t-lg rounded-b-none px-4 py-2.5 text-sm font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 transition-all flex items-center justify-center relative overflow-hidden border border-transparent data-[state=inactive]:border-slate-600/50"
                  >
                    {IconComponent && <IconComponent className="w-4 h-4 mr-1.5" />}
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
              )
            })}
          </TabsList>

          {/* Tab Content: Ask the Seer stays outside viral blur */}
          {activeTab === 'ask-the-seer' ? (
          <AnimatePresence mode="wait">
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
                    <TarotSeerChatInterface
                      userId={user?.uid || ''}
                      userProfile={userProfile}
                      tarotProfileData={profileCards}
                      combinedSystemData={combinedSystemData}
                      currentReading={currentReading ?? undefined}
                      sessionId={`tarot-seer-${user?.uid ?? 'anonymous'}`}
                    />
                  </div>
                </TabsContent>
              </motion.div>
            )}
          </AnimatePresence>
          ) : showTarotViral && !viralUnlock.hydrated ? (
            <div className="py-12 text-center text-slate-400">Loading report…</div>
          ) : (
            <div className="relative min-h-[320px]">
              {tarotLocked && (
                <ViralLockOverlay
                  onUnlockClick={handleShareToUnlock}
                  onContinueWithoutSharing={waitingLite ? () => {} : continueWithoutSharing}
                  continueDisabled={waitingLite}
                />
              )}
              <div
                className={cn(
                  tarotLocked &&
                    'pointer-events-none select-none blur-sm filter transition-[filter] duration-300 [&_*]:pointer-events-none'
                )}
              >
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
                  <ToolIntroductionTab toolSlug="tarot" />
                </TabsContent>
              </motion.div>
            )}

            {/* Compatibility Tab */}
            {activeTab === 'compatibility' && (
              <motion.div
                key="compatibility"
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? {} : { opacity: 0, y: -20 }}
                transition={motionConfig}
              >
                <TabsContent value="compatibility" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                  <CompatibilityTab toolSlug="tarot" />
                </TabsContent>
              </motion.div>
            )}

            {/* Tarot Profile Tab - Main Dashboard */}
            {activeTab === 'tarot-profile' && (
              <motion.div
                key="tarot-profile"
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? {} : { opacity: 0, y: -20 }}
                transition={motionConfig}
              >
                <TabsContent value="tarot-profile" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
            {/* Loading State for Combined System in Hero */}
            {isLoadingCombinedSystem && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 shadow-lg rounded-2xl">
                  <CardContent className="p-6 text-center">
                    <motion.div
                      className="relative w-12 h-12 mx-auto mb-3"
                      animate={prefersReducedMotion ? {} : { rotate: 360 }}
                      transition={prefersReducedMotion ? {} : { duration: 1.5, repeat: Infinity, ease: "linear" }}
                      style={{ willChange: prefersReducedMotion ? 'auto' : 'transform' }}
                    >
                      <svg className="w-12 h-12" viewBox="0 0 24 24" style={{ willChange: 'auto' }}>
                        <circle
                          cx="12"
                          cy="12"
                          r="8"
                          stroke="rgba(217, 119, 6, 0.2)"
                          strokeWidth="2"
                          fill="none"
                        />
                        {!prefersReducedMotion && (
                          <motion.circle
                            cx="12"
                            cy="12"
                            r="8"
                            stroke="#d97706"
                            strokeWidth="2"
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray="50 30"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                            style={{ transformOrigin: "12px 12px", willChange: 'transform' }}
                          />
                        )}
                      </svg>
                    </motion.div>
                    <motion.p 
                      className="text-slate-700 text-sm"
                      initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
                      animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                      transition={prefersReducedMotion ? {} : { delay: 0.2 }}
                    >
                      Loading your comprehensive profile...
                    </motion.p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Error State for Profile Cards */}
            {profileCardsError && !profileCards && (
              <Card className="bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-300 shadow-lg rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-red-900 mb-2">Profile Cards Error</h3>
                      <p className="text-red-700 text-sm mb-3">{profileCardsError}</p>
                      <motion.div
                        whileHover={{}}
                        whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
                        transition={prefersReducedMotion ? {} : { type: "spring", stiffness: 400, damping: 17 }}
                      >
                        <Button
                          onClick={() => router.push('/profile-setup')}
                          size="sm"
                          className="bg-red-500 hover:bg-red-600 text-white relative overflow-hidden focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-transparent"
                        >
                          <span className="relative z-10">Update Profile</span>
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Hero Section - Always visible */}
            {!isLoadingCombinedSystem && (
              <TarotDashboardHero 
                profileCards={profileCards}
                userProfile={userProfile}
                combinedSystemData={combinedSystemData}
              />
            )}

            {/* Dashboard Sections */}
            {profileCards && !profileCardsError && (
              <div className="space-y-6 mt-8">
                {/* Section 1: Profile Cards Deep Dive */}
                <DashboardSection 
                  title="Your Profile Cards" 
                  icon={<User className="w-6 h-6" />}
                  badge="4 Sacred Cards"
                  defaultExpanded={true}
                  colorScheme="purple"
                  storageKey="tarot-profile-cards"
                >
                  <TarotProfileDiagram profileCards={profileCards} />
                </DashboardSection>

                {/* Section 2: Recent Readings */}
                <DashboardSection 
                  title="Your Readings" 
                  icon={<BookOpen className="w-6 h-6" />}
                  badge="History"
                  defaultExpanded={false}
                  colorScheme="amber"
                  storageKey="tarot-readings"
                >
                  {currentReading ? (
                    <div className="space-y-4">
                      <motion.div
                        initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
                        animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                        transition={motionConfig}
                        whileHover={prefersReducedMotion ? {} : { y: -4, transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] } }}
                      >
                        <Card className="bg-gradient-to-br from-blue-50/80 to-indigo-50/80 border-2 border-blue-200 shadow-sm hover:shadow-md rounded-xl transition-shadow duration-300">
                          <CardContent className="p-4">
                            <p className="text-slate-700 text-sm mb-2">
                              Last reading: <span className="font-semibold text-blue-800">{currentReading.spreadName}</span>
                            </p>
                            <div className="text-xs text-slate-600 mb-2">
                              Question: {currentReading.question.substring(0, 100)}...
                            </div>
                            <div className="text-xs text-slate-500">
                              {new Date(currentReading.timestamp).toLocaleDateString()}
                            </div>
                            <motion.div
                              whileHover={{}}
                              whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
                              transition={prefersReducedMotion ? {} : { type: "spring", stiffness: 400, damping: 17 }}
                              className="mt-3"
                            >
                              <Button
                                onClick={() => setActiveTab('reading')}
                                size="sm"
                                className="bg-blue-500 hover:bg-blue-600 text-white relative overflow-hidden focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-transparent"
                                aria-label="View your last tarot reading"
                              >
                                <span className="relative z-10">View Reading</span>
                              </Button>
                            </motion.div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Sparkles className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                      <p className="text-slate-600 mb-4">No readings performed yet</p>
                      <motion.div
                        whileHover={{}}
                        whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
                        transition={prefersReducedMotion ? {} : { type: "spring", stiffness: 400, damping: 17 }}
                      >
                        <Button
                          onClick={() => setActiveTab('reading')}
                          className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white relative overflow-hidden focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-transparent"
                          aria-label="Navigate to reading tab to start your first tarot reading"
                        >
                          <BookOpen className="w-4 h-4 mr-2 relative z-10" />
                          <span className="relative z-10">Start Your First Reading</span>
                        </Button>
                      </motion.div>
                    </div>
                  )}
                </DashboardSection>

                {/* Section 3: Life Journey & Timeline */}
                <DashboardSection 
                  title="Life Journey & Cycles" 
                  icon={<Calendar className="w-6 h-6" />}
                  badge="Your Timeline"
                  defaultExpanded={false}
                  colorScheme="cyan"
                  storageKey="tarot-life-journey"
                >
                  <TarotLifePathMap 
                    birthDate={userProfile?.birthDate || new Date().toISOString()}
                    profileCards={profileCards}
                    numerologyData={combinedSystemData?.numerology}
                  />
                </DashboardSection>

                {/* Section 4: Elemental Balance */}
                <DashboardSection 
                  title="Elemental Energies" 
                  icon={<Zap className="w-6 h-6" />}
                  badge="Fire, Water, Air, Earth"
                  defaultExpanded={false}
                  colorScheme="green"
                  storageKey="tarot-elements"
                >
                  <ElementalBalanceWheel 
                    profileCards={profileCards}
                    recentReadings={currentReading ? [currentReading] : []}
                  />
                </DashboardSection>

                {/* Section 5: Arcana Distribution */}
                <DashboardSection 
                  title="Arcana Influence" 
                  icon={<Sparkles className="w-6 h-6" />}
                  badge="Major & Minor"
                  defaultExpanded={false}
                  colorScheme="pink"
                  storageKey="tarot-arcana"
                >
                  <ArcanaDistributionChart profileCards={profileCards} />
                </DashboardSection>

                {/* Section 6: Tarot-Numerology Integration */}
                <DashboardSection 
                  title="Tarot & Numerology Synergy" 
                  icon={<Star className="w-6 h-6" />}
                  badge="Cross-System Insights"
                  defaultExpanded={false}
                  colorScheme="blue"
                  storageKey="tarot-numerology"
                >
                  <TarotNumerologyIntegration 
                    profileCards={profileCards}
                    numerologyData={combinedSystemData?.numerology}
                    combinedSystemData={combinedSystemData}
                  />
                </DashboardSection>

                {/* Section 7: Quick Actions */}
                <DashboardSection 
                  title="Quick Actions" 
                  icon={<Activity className="w-6 h-6" />}
                  defaultExpanded={false}
                  colorScheme="orange"
                  storageKey="tarot-actions"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <motion.div
                      whileHover={{}}
                      whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
                      transition={prefersReducedMotion ? {} : { type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <Button
                        onClick={() => setActiveTab('reading')}
                        className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white relative overflow-hidden focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-transparent w-full"
                      >
                        <Sparkles className="w-4 h-4 mr-2 relative z-10" />
                        <span className="relative z-10">New Reading</span>
                      </Button>
                    </motion.div>
                    <motion.div
                      whileHover={{}}
                      whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
                      transition={prefersReducedMotion ? {} : { type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <Button
                        onClick={() => setActiveTab('cards')}
                        variant="outline"
                        className="border-2 border-blue-300 text-blue-700 hover:bg-blue-50 focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-transparent w-full"
                      >
                        <BookOpen className="w-4 h-4 mr-2" />
                        Card Meanings
                      </Button>
                    </motion.div>
                    <motion.div
                      whileHover={{}}
                      whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
                      transition={prefersReducedMotion ? {} : { type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <Button
                        onClick={() => setActiveTab('combined-system')}
                        variant="outline"
                        className="border-2 border-purple-300 text-purple-700 hover:bg-purple-50 focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-transparent w-full"
                      >
                        <Star className="w-4 h-4 mr-2" />
                        Combined System
                      </Button>
                    </motion.div>
                  </div>
                </DashboardSection>
              </div>
            )}
                </TabsContent>
              </motion.div>
            )}

            {/* Reading Tab */}
            {activeTab === 'reading' && (
              <motion.div
                key="reading"
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? {} : { opacity: 0, y: -20 }}
                transition={motionConfig}
              >
                <TabsContent value="reading" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
            <Card className="bg-gradient-to-br from-slate-50 to-gray-100 border-2 border-amber-200 shadow-lg rounded-3xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-amber-900 text-2xl font-serif flex items-center">
                  <Sparkles className="w-6 h-6 mr-3 text-amber-600" />
                  Tarot Reading
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {!currentReading ? (
                  <div className="space-y-4">
                    {/* Question Input */}
                    <div>
                      <label htmlFor="tarot-question" className="block text-slate-800 text-sm font-semibold mb-2">
                        What would you like guidance on?
                      </label>
                      <textarea
                        id="tarot-question"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Ask your question here..."
                        className="w-full p-4 bg-white border-2 border-amber-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200 transition-all duration-300"
                        rows={3}
                        aria-label="Enter your tarot reading question"
                      />
                    </div>

                    {/* Spread Selection */}
                    <div>
                      <label className="block text-slate-800 text-sm font-semibold mb-3" id="spread-selection-label">
                        Choose a spread
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {availableSpreads.map((spread, index) => (
                          <motion.button
                            key={spread.name}
                            onClick={() => setSpreadType(spread.name)}
                            initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
                            animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                            transition={prefersReducedMotion ? {} : { duration: 0.3, delay: index * 0.1, ease: [0.4, 0, 0.2, 1] }}
                            className={`p-4 rounded-xl border-2 text-left transition-all relative overflow-hidden ${
                              spreadType === spread.name
                                ? 'border-amber-400 bg-gradient-to-br from-amber-100 to-yellow-100 text-amber-900 shadow-md'
                                : 'border-amber-200 bg-white text-slate-700 hover:border-amber-300 hover:bg-amber-50'
                            }`}
                            aria-label={`Select ${spread.name} spread with ${spread.cardCount} cards`}
                            aria-pressed={spreadType === spread.name}
                            role="radio"
                            aria-labelledby="spread-selection-label"
                            whileHover={{}}
                            whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                          >
                            {spreadType === spread.name && (
                              <motion.div
                                layoutId="selectedSpread"
                                className="absolute inset-0 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-xl -z-10"
                                transition={prefersReducedMotion ? {} : { type: "spring", stiffness: 300, damping: 30 }}
                              />
                            )}
                            <div className="font-semibold text-base mb-1 relative z-10">{spread.name}</div>
                            <div className="text-xs text-slate-600 mt-1 mb-2 relative z-10">
                              {spread.description}
                            </div>
                            <div className="text-xs font-medium text-amber-700 mt-1 relative z-10">
                              {spread.cardCount} card{spread.cardCount > 1 ? 's' : ''}
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Perform Reading Button */}
                  <motion.div
                    whileHover={{}}
                    whileTap={prefersReducedMotion || (!question.trim() || !spreadType || isReadingLoading) ? {} : { scale: 0.98 }}
                    transition={prefersReducedMotion ? {} : { type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <Button
                      onClick={() => performTarotReading()}
                      disabled={!question.trim() || !spreadType || isReadingLoading}
                      className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white shadow-lg relative overflow-hidden focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-transparent"
                      aria-label="Perform tarot reading"
                    >
                      {isReadingLoading ? (
                        <>
                          <motion.div
                            className="relative w-4 h-4 mr-2 inline-block"
                            animate={prefersReducedMotion ? {} : { rotate: 360 }}
                            transition={prefersReducedMotion ? {} : { duration: 1, repeat: Infinity, ease: "linear" }}
                            style={{ willChange: prefersReducedMotion ? 'auto' : 'transform' }}
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                              <circle
                                cx="12"
                                cy="12"
                                r="8"
                                stroke="currentColor"
                                strokeWidth="2"
                                fill="none"
                                strokeDasharray="20 10"
                                opacity="0.3"
                              />
                              {!prefersReducedMotion && (
                                <motion.circle
                                  cx="12"
                                  cy="12"
                                  r="8"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  fill="none"
                                  strokeLinecap="round"
                                  strokeDasharray="20 10"
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                  style={{ transformOrigin: "12px 12px", willChange: 'transform' }}
                                />
                              )}
                            </svg>
                          </motion.div>
                          Shuffling Cards...
                        </>
                      ) : (
                        <>
                          <BookOpen className="w-4 h-4 mr-2" />
                          Draw Cards
                        </>
                      )}
                    </Button>
                  </motion.div>

                    {readingError && (
                      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                        <p className="text-red-700 text-sm font-medium">{readingError}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Reading Header */}
                    <div className="text-center pb-4 border-b-2 border-amber-200">
                      <h3 className="text-2xl font-serif font-semibold text-amber-900 mb-2">{currentReading.spreadName}</h3>
                      <p className="text-slate-700 text-sm font-medium">Question: <span className="italic">{currentReading.question}</span></p>
                    </div>

                    {/* Cards Display */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {currentReading.cards.map((card: any, index: number) => (
                        <motion.div
                          key={index}
                          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                          animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                          transition={prefersReducedMotion ? {} : { duration: 0.3, delay: index * 0.1, ease: [0.4, 0, 0.2, 1] }}
                          whileHover={prefersReducedMotion ? {} : { y: -4, transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] } }}
                          className="bg-gradient-to-br from-purple-50/80 to-pink-50/80 rounded-xl p-4 border-2 border-purple-200 shadow-sm hover:shadow-md transition-shadow duration-300"
                        >
                          <div className="text-center">
                            <div className="text-sm font-semibold text-purple-800 mb-2 bg-purple-100 px-3 py-1 rounded-full inline-block">
                              {card.position}
                            </div>
                            {/* Card Image */}
                            <div className="mb-3 flex justify-center">
                              <div className={`relative w-32 h-48 rounded-lg overflow-hidden border-2 border-purple-300 shadow-md bg-white ${!card.isUpright ? 'transform rotate-180' : ''}`}>
                                <img
                                  src={resolveTarotCardImageSrc({ name: card.name, image: card.image })}
                                  alt={card.name}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                  onError={(e) => {
                                    applyTarotImageOnError(e.currentTarget, { name: card.name, image: card.image })
                                  }}
                                />
                              </div>
                            </div>
                            <div className="text-lg font-bold text-purple-900 mb-2">
                              {card.name}
                            </div>
                            <div className="text-xs text-slate-600 mb-2">
                              {card.arcana === 'major' ? 'Major Arcana' : `${card.suit || ''}`} • {card.element ? card.element.charAt(0).toUpperCase() + card.element.slice(1) : 'Unknown'}
                            </div>
                            <div className="text-xs mb-2">
                              <Badge 
                                variant="outline" 
                                className={`text-xs border-2 font-semibold ${
                                  card.isUpright 
                                    ? 'bg-amber-100 text-amber-800 border-amber-300' 
                                    : 'bg-purple-100 text-purple-800 border-purple-300'
                                }`}
                              >
                                {card.isUpright ? 'Upright' : 'Reversed'}
                              </Badge>
                            </div>
                            <div className="text-sm text-slate-700 mb-3 leading-relaxed">
                              {card.isUpright ? card.upright : card.reversed}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Individual Card Readings */}
                    {currentReading.individualCardReadings && currentReading.individualCardReadings.length > 0 && (
                      <motion.div
                        initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
                        animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                        transition={motionConfig}
                        whileHover={prefersReducedMotion ? {} : { y: -2, transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] } }}
                      >
                        <Card className="bg-gradient-to-br from-blue-50/80 to-indigo-50/80 border-2 border-blue-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                        <CardHeader>
                          <CardTitle className="text-blue-900 text-xl font-semibold flex items-center">
                            <Sparkles className="w-5 h-5 mr-2 text-blue-600" />
                            Individual Card Interpretations
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {currentReading.individualCardReadings.map((cardReading: any, index: number) => (
                              <div key={index} className="border-b-2 border-blue-200 pb-4 last:border-0 last:pb-0">
                                <div className="flex items-start gap-3">
                                  <div className={`mt-1 flex items-center justify-center w-8 h-8 rounded-full border-2 shadow-sm ${
                                    cardReading.isUpright 
                                      ? 'bg-amber-100 border-amber-300 text-amber-800' 
                                      : 'bg-purple-100 border-purple-300 text-purple-800'
                                  }`}>
                                    <span className="text-sm font-bold">
                                      {cardReading.isUpright ? '↑' : '↓'}
                                    </span>
                                  </div>
                                  <div className="flex-1">
                                    <div className="font-semibold text-blue-900 text-base mb-2">
                                      {cardReading.cardName} - {cardReading.position}
                                    </div>
                                    <p className="text-slate-700 text-sm leading-relaxed">
                                      {cardReading.interpretation}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                      </motion.div>
                    )}

                    {/* Detailed Interpretation */}
                    {currentReading.detailedInterpretation && (
                      <motion.div
                        initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
                        animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                        transition={motionConfig}
                        whileHover={prefersReducedMotion ? {} : { y: -2, transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] } }}
                      >
                        <Card className="bg-gradient-to-br from-amber-50/80 to-yellow-50/80 border-2 border-amber-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                        <CardHeader>
                          <CardTitle className="text-amber-900 text-xl font-semibold">Detailed Reading</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-slate-800 text-sm leading-relaxed whitespace-pre-line">
                            {currentReading.detailedInterpretation}
                          </div>
                        </CardContent>
                      </Card>
                      </motion.div>
                    )}

                    {/* Overall Reading Summary */}
                    <motion.div
                      initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
                      animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                      transition={motionConfig}
                      whileHover={prefersReducedMotion ? {} : { y: -2, transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] } }}
                    >
                      <Card className="bg-gradient-to-br from-green-50/80 to-emerald-50/80 border-2 border-green-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                      <CardHeader>
                        <CardTitle className="text-green-900 text-xl font-semibold flex items-center">
                          <Star className="w-5 h-5 mr-2 text-green-600" />
                          Reading Summary
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-slate-800 text-sm leading-relaxed">
                          {currentReading.overallReading}
                        </p>
                      </CardContent>
                    </Card>
                    </motion.div>

                    {/* Elemental Balance */}
                    {currentReading.elementalBalance && (
                      <motion.div
                        initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
                        animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                        transition={motionConfig}
                        whileHover={prefersReducedMotion ? {} : { y: -2, transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] } }}
                      >
                        <Card className="bg-gradient-to-br from-pink-50/80 to-rose-50/80 border-2 border-pink-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                        <CardHeader>
                          <CardTitle className="text-pink-900 text-xl font-semibold flex items-center">
                            <Zap className="w-5 h-5 mr-2 text-pink-600" />
                            Elemental Balance
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div className="bg-white/60 rounded-lg p-3 border-2 border-red-200">
                              <div className="text-red-700 text-xs font-semibold mb-1">Fire</div>
                              <div className="text-slate-800 font-bold text-lg">{currentReading.elementalBalance.fire}</div>
                            </div>
                            <div className="bg-white/60 rounded-lg p-3 border-2 border-blue-200">
                              <div className="text-blue-700 text-xs font-semibold mb-1">Water</div>
                              <div className="text-slate-800 font-bold text-lg">{currentReading.elementalBalance.water}</div>
                            </div>
                            <div className="bg-white/60 rounded-lg p-3 border-2 border-yellow-200">
                              <div className="text-yellow-700 text-xs font-semibold mb-1">Air</div>
                              <div className="text-slate-800 font-bold text-lg">{currentReading.elementalBalance.air}</div>
                            </div>
                            <div className="bg-white/60 rounded-lg p-3 border-2 border-green-200">
                              <div className="text-green-700 text-xs font-semibold mb-1">Earth</div>
                              <div className="text-slate-800 font-bold text-lg">{currentReading.elementalBalance.earth}</div>
                            </div>
                          </div>
                          <div className="text-sm text-slate-700 pt-3 border-t-2 border-pink-200">
                            Primary: <span className="font-semibold text-pink-800 capitalize">{currentReading.elementalBalance.primary}</span> • 
                            Secondary: <span className="font-semibold text-pink-800 capitalize">{currentReading.elementalBalance.secondary}</span>
                          </div>
                        </CardContent>
                      </Card>
                      </motion.div>
                    )}

                    {/* Recommendations */}
                    {currentReading.recommendations && currentReading.recommendations.length > 0 && (
                      <motion.div
                        initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
                        animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                        transition={motionConfig}
                        whileHover={prefersReducedMotion ? {} : { y: -2, transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] } }}
                      >
                        <Card className="bg-gradient-to-br from-slate-50 to-gray-100 border-2 border-amber-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                        <CardHeader>
                          <CardTitle className="text-amber-900 text-xl font-semibold flex items-center">
                            <Target className="w-5 h-5 mr-2 text-amber-600" />
                            Recommendations
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-3">
                            {currentReading.recommendations.map((rec: string, index: number) => (
                              <li key={index} className="text-slate-800 text-sm flex items-start">
                                <Star className="w-4 h-4 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                      </motion.div>
                    )}

                    {/* Reset Button */}
                    <div className="text-center pt-4">
                      <motion.div
                        whileHover={{}}
                        whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
                        transition={prefersReducedMotion ? {} : { type: "spring", stiffness: 400, damping: 17 }}
                      >
                        <Button
                          onClick={resetReading}
                          variant="outline"
                          className="border-2 border-amber-300 text-amber-700 hover:bg-amber-50 font-semibold relative overflow-hidden focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-transparent"
                          aria-label="Start a new tarot reading"
                        >
                          <span className="relative z-10 flex items-center">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            New Reading
                          </span>
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
                </TabsContent>
              </motion.div>
            )}

            {/* Cards Tab */}
            {activeTab === 'cards' && (
              <motion.div
                key="cards"
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? {} : { opacity: 0, y: -20 }}
                transition={motionConfig}
              >
                <TabsContent value="cards" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
            <Card className="bg-gradient-to-br from-slate-50 to-gray-100 border-2 border-amber-200 shadow-lg rounded-3xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-amber-900 text-2xl font-serif flex items-center">
                  <BookOpen className="w-6 h-6 mr-3 text-amber-600" />
                  Tarot Card Meanings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {/* Major Arcana Section */}
                  <div>
                    <div className="text-center mb-6 pb-4 border-b-2 border-amber-200">
                      <h3 className="text-2xl font-serif font-semibold text-amber-900 mb-2">Major Arcana</h3>
                      <p className="text-slate-700 text-sm">The 22 cards of the Major Arcana represent life's spiritual lessons and karmic influences</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {allCards.filter(card => card.arcana === 'major').map((card, index) => (
                        <motion.div
                          key={`major-${index}`}
                          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                          animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                          transition={prefersReducedMotion ? {} : { duration: 0.3, delay: index * 0.03, ease: [0.4, 0, 0.2, 1] }}
                          whileHover={{}}
                          className="bg-gradient-to-br from-purple-50/80 to-pink-50/80 rounded-xl p-4 border-2 border-purple-200 shadow-sm hover:border-purple-300 hover:shadow-md transition-all"
                        >
                          <div className="text-center">
                            <div className="mb-3 flex justify-center">
                              <div className="relative w-24 h-36 rounded-lg overflow-hidden border-2 border-purple-300 shadow-md bg-white">
                                <img
                                  src={resolveTarotCardImageSrc(card)}
                                  alt={card.name}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                  onError={(e) => {
                                    applyTarotImageOnError(e.currentTarget, card)
                                  }}
                                />
                              </div>
                            </div>
                            <div className="text-xs text-purple-700 font-semibold mb-1 bg-purple-100 px-2 py-0.5 rounded-full inline-block">
                              {card.number !== undefined ? `Card ${card.number}` : 'Major Arcana'}
                            </div>
                            <h4 className="font-semibold text-purple-900 mb-2 text-sm">{card.name}</h4>
                            <div className="text-xs text-slate-600 mb-2">
                              {card.element ? card.element.charAt(0).toUpperCase() + card.element.slice(1) : 'Unknown'}
                            </div>
                            <div className="text-xs text-slate-700 mb-2 leading-relaxed">
                              Upright: {card.upright.substring(0, 60)}...
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Minor Arcana Sections */}
                  {['wands', 'cups', 'swords', 'pentacles'].map(suit => {
                    const suitCards = allCards.filter(card => card.arcana === 'minor' && card.suit === suit)
                    if (suitCards.length === 0) return null
                    
                    const suitName = suit.charAt(0).toUpperCase() + suit.slice(1)
                    const elementMap: Record<string, string> = {
                      wands: 'Fire',
                      cups: 'Water',
                      swords: 'Air',
                      pentacles: 'Earth'
                    }
                    
                    const suitColors: Record<string, { bg: string; border: string; text: string }> = {
                      wands: { bg: 'from-red-50/80 to-orange-50/80', border: 'border-red-200', text: 'text-red-900' },
                      cups: { bg: 'from-blue-50/80 to-cyan-50/80', border: 'border-blue-200', text: 'text-blue-900' },
                      swords: { bg: 'from-yellow-50/80 to-amber-50/80', border: 'border-yellow-200', text: 'text-yellow-900' },
                      pentacles: { bg: 'from-green-50/80 to-emerald-50/80', border: 'border-green-200', text: 'text-green-900' }
                    }
                    const colors = suitColors[suit] || suitColors.wands

                    return (
                      <div key={suit}>
                        <div className="text-center mb-6 pb-4 border-b-2 border-amber-200">
                          <h3 className={`text-2xl font-serif font-semibold ${colors.text} mb-2`}>{suitName} ({elementMap[suit]})</h3>
                          <p className="text-slate-700 text-sm">The {suitName} suit represents {elementMap[suit].toLowerCase()} energy and practical aspects of life</p>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                          {suitCards.map((card, index) => (
                            <motion.div
                              key={`${suit}-${index}`}
                              initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                              animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                              transition={prefersReducedMotion ? {} : { duration: 0.3, delay: index * 0.02, ease: [0.4, 0, 0.2, 1] }}
                              whileHover={{}}
                              className={`bg-gradient-to-br ${colors.bg} rounded-xl p-3 border-2 ${colors.border} shadow-sm hover:shadow-md transition-all`}
                            >
                              <div className="text-center">
                                <div className="mb-2 flex justify-center">
                                  <div className={`relative w-20 h-28 rounded-lg overflow-hidden border-2 ${colors.border} shadow-md bg-white`}>
                                    <img
                                      src={resolveTarotCardImageSrc(card)}
                                      alt={card.name}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        applyTarotImageOnError(e.currentTarget, card)
                                      }}
                                    />
                                  </div>
                                </div>
                                <h4 className={`font-semibold ${colors.text} mb-1 text-xs`}>{card.name}</h4>
                                <div className="text-xs text-slate-600 mb-1">
                                  {card.number !== undefined ? `#${card.number}` : ''}
                                </div>
                                <div className="text-xs text-slate-700 leading-relaxed">
                                  {card.upright.substring(0, 40)}...
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
                </TabsContent>
              </motion.div>
            )}

                    {/* Combined System Tab */}
            {activeTab === 'combined-system' && (
              <motion.div
                key="combined-system"
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? {} : { opacity: 0, y: -20 }}
                transition={motionConfig}
              >
                <TabsContent value="combined-system" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                  <Card className="bg-gradient-to-br from-slate-50 to-gray-100 border-2 border-amber-200 shadow-lg rounded-3xl p-6">
              <CardHeader className="p-0 mb-4">
                <div className="flex items-center gap-4">
                  <Sparkles className="h-10 w-10 text-amber-500 flex-shrink-0" />
                  <div>
                    <CardTitle className="text-3xl font-serif text-amber-900">Combined Divination System</CardTitle>
                    <p className="text-slate-600 mt-1">Integrating Tarot, Western Astrology & Numerology for holistic insights</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {!userProfile?.birthDate || !userProfile?.fullName && !userProfile?.displayName ? (
                  <div className="text-center py-8">
                    <Info className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                    <p className="text-slate-700 mb-4">Complete your profile (birth date and name) to unlock the Combined Divination System</p>
                    <motion.div
                      whileHover={{}}
                      whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
                      transition={prefersReducedMotion ? {} : { type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <Button
                        onClick={() => router.push('/profile-setup')}
                        className="bg-amber-500 hover:bg-amber-600 text-white relative overflow-hidden focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-transparent"
                        aria-label="Navigate to profile setup page"
                      >
                        <span className="relative z-10">Complete Profile</span>
                      </Button>
                    </motion.div>
                  </div>
                ) : isLoadingCombinedSystem ? (
                  <motion.div 
                    className="text-center py-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div
                      className="relative w-16 h-16 mx-auto mb-4"
                      animate={prefersReducedMotion ? {} : { rotate: 360 }}
                      transition={prefersReducedMotion ? {} : { duration: 1.5, repeat: Infinity, ease: "linear" }}
                      style={{ willChange: prefersReducedMotion ? 'auto' : 'transform' }}
                    >
                      <svg className="w-16 h-16" viewBox="0 0 24 24" style={{ willChange: 'auto' }}>
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="rgba(251, 191, 36, 0.2)"
                          strokeWidth="2"
                          fill="none"
                        />
                        {!prefersReducedMotion && (
                          <motion.circle
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="#fbbf24"
                            strokeWidth="2"
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray="60 40"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                            style={{ transformOrigin: "12px 12px", willChange: 'transform' }}
                          />
                        )}
                      </svg>
                    </motion.div>
                    <motion.p 
                      className="text-slate-700"
                      initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
                      animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                      transition={prefersReducedMotion ? {} : { delay: 0.2 }}
                    >
                      Generating your comprehensive combined analysis...
                    </motion.p>
                  </motion.div>
                ) : combinedSystemData ? (
                  <div className="space-y-6">
                    {/* Profile Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Tarot Profile */}
                      <motion.div
                        initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
                        animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                        transition={prefersReducedMotion ? {} : { duration: 0.3, delay: 0, ease: [0.4, 0, 0.2, 1] }}
                        whileHover={prefersReducedMotion ? {} : { y: -4, transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] } }}
                      >
                        <Card className="bg-gradient-to-br from-purple-50/80 to-pink-50/80 border-2 border-purple-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-purple-900 text-lg flex items-center">
                            <BookOpen className="w-5 h-5 mr-2 text-purple-600" />
                            Tarot Profile
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="text-sm">
                            <span className="text-slate-600">Birth Card: </span>
                            <span className="font-semibold text-purple-800">{combinedSystemData.tarotProfile?.birthCard?.name || 'N/A'}</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-slate-600">Life Path Card: </span>
                            <span className="font-semibold text-purple-800">{combinedSystemData.tarotProfile?.lifePathCard?.name || 'N/A'}</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-slate-600">Soul Card: </span>
                            <span className="font-semibold text-purple-800">{combinedSystemData.tarotProfile?.soulCard?.name || 'N/A'}</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-slate-600">Personality Card: </span>
                            <span className="font-semibold text-purple-800">{combinedSystemData.tarotProfile?.personalityCard?.name || 'N/A'}</span>
                          </div>
                        </CardContent>
                      </Card>
                      </motion.div>

                      {/* Numerology */}
                      <motion.div
                        initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
                        animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                        transition={prefersReducedMotion ? {} : { duration: 0.3, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
                        whileHover={prefersReducedMotion ? {} : { y: -4, transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] } }}
                      >
                        <Card className="bg-gradient-to-br from-blue-50/80 to-indigo-50/80 border-2 border-blue-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-blue-900 text-lg flex items-center">
                            <Zap className="w-5 h-5 mr-2 text-blue-600" />
                            Numerology
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="text-sm">
                            <span className="text-slate-600">Life Path: </span>
                            <span className="font-semibold text-blue-800">{combinedSystemData.numerology?.lifePathNumber || 'N/A'}</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-slate-600">Destiny: </span>
                            <span className="font-semibold text-blue-800">{combinedSystemData.numerology?.destinyNumber || 'N/A'}</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-slate-600">Soul: </span>
                            <span className="font-semibold text-blue-800">{combinedSystemData.numerology?.soulNumber || 'N/A'}</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-slate-600">Personality: </span>
                            <span className="font-semibold text-blue-800">{combinedSystemData.numerology?.personalityNumber || 'N/A'}</span>
                          </div>
                          {combinedSystemData.numerology?.personalYearNumber && (
                            <div className="text-sm pt-2 border-t border-blue-200">
                              <span className="text-slate-600">Personal Year: </span>
                              <span className="font-bold text-blue-900">{combinedSystemData.numerology.personalYearNumber}</span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                      </motion.div>

                      {/* Western Astrology */}
                      <motion.div
                        initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
                        animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                        transition={prefersReducedMotion ? {} : { duration: 0.3, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
                        whileHover={prefersReducedMotion ? {} : { y: -4, transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] } }}
                      >
                        <Card className="bg-gradient-to-br from-amber-50/80 to-yellow-50/80 border-2 border-amber-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-amber-900 text-lg flex items-center">
                            <Star className="w-5 h-5 mr-2 text-amber-600" />
                            Astrology
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {combinedSystemData.westernAstrology?.sunSign ? (
                            <>
                              <div className="text-sm">
                                <span className="text-slate-600">Sun: </span>
                                <span className="font-semibold text-amber-800">{combinedSystemData.westernAstrology.sunSign}</span>
                              </div>
                              {combinedSystemData.westernAstrology.moonSign && (
                                <div className="text-sm">
                                  <span className="text-slate-600">Moon: </span>
                                  <span className="font-semibold text-amber-800">{combinedSystemData.westernAstrology.moonSign}</span>
                                </div>
                              )}
                              {combinedSystemData.westernAstrology.risingSign && (
                                <div className="text-sm">
                                  <span className="text-slate-600">Rising: </span>
                                  <span className="font-semibold text-amber-800">{combinedSystemData.westernAstrology.risingSign}</span>
                                </div>
                              )}
                            </>
                          ) : (
                            <p className="text-slate-600 text-sm">Complete birth time & place for astrological data</p>
                          )}
                        </CardContent>
                      </Card>
                      </motion.div>
                    </div>

                    {/* Holistic Analysis */}
                    {combinedSystemData.holisticAnalysis && (
                      <motion.div
                        initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
                        animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                        transition={motionConfig}
                        whileHover={prefersReducedMotion ? {} : { y: -2, transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] } }}
                      >
                        <Card className="bg-gradient-to-br from-green-50/80 to-emerald-50/80 border-2 border-green-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                        <CardHeader>
                          <CardTitle className="text-green-900 text-xl font-semibold">Holistic Analysis</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {combinedSystemData.holisticAnalysis.overview && (
                            <div>
                              <h4 className="font-semibold text-green-800 mb-2">Overview</h4>
                              <p className="text-slate-700 text-sm leading-relaxed">{combinedSystemData.holisticAnalysis.overview}</p>
                            </div>
                          )}
                          {combinedSystemData.holisticAnalysis.integration && (
                            <div>
                              <h4 className="font-semibold text-green-800 mb-2">Integration</h4>
                              <p className="text-slate-700 text-sm leading-relaxed">{combinedSystemData.holisticAnalysis.integration}</p>
                            </div>
                          )}
                          {combinedSystemData.holisticAnalysis.timing && (
                            <div>
                              <h4 className="font-semibold text-green-800 mb-2">Timing Insights</h4>
                              <p className="text-slate-700 text-sm leading-relaxed">{combinedSystemData.holisticAnalysis.timing}</p>
                            </div>
                          )}
                          {combinedSystemData.holisticAnalysis.guidance && (
                            <div>
                              <h4 className="font-semibold text-green-800 mb-2">Guidance</h4>
                              <p className="text-slate-700 text-sm leading-relaxed">{combinedSystemData.holisticAnalysis.guidance}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                      </motion.div>
                    )}

                    {/* Cross-References */}
                    {combinedSystemData.crossReferences && (
                      <div className="space-y-4">
                        {combinedSystemData.crossReferences.tarotNumerologyLinks && combinedSystemData.crossReferences.tarotNumerologyLinks.length > 0 && (
                          <motion.div
                            initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
                            animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                            transition={motionConfig}
                            whileHover={prefersReducedMotion ? {} : { y: -2, transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] } }}
                          >
                            <Card className="bg-gradient-to-br from-slate-50 to-gray-100 border-2 border-purple-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                            <CardHeader>
                              <CardTitle className="text-purple-900 text-xl font-semibold">Tarot & Numerology Connections</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                {combinedSystemData.crossReferences.tarotNumerologyLinks.map((link: any, index: number) => (
                                  <div key={index} className="border-l-4 border-purple-300 pl-4 py-2">
                                    <p className="text-slate-800 text-sm leading-relaxed">
                                      <span className="font-semibold text-purple-900">{link.tarotCard}</span> ↔ 
                                      <span className="font-semibold text-purple-900"> Number {link.numerologyNumber}</span>
                                      <br />
                                      <span className="text-slate-600">{link.connection}</span>
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                          </motion.div>
                        )}

                        {combinedSystemData.crossReferences.timingInsights && (
                          <motion.div
                            initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
                            animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                            transition={motionConfig}
                            whileHover={prefersReducedMotion ? {} : { y: -2, transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] } }}
                          >
                            <Card className="bg-gradient-to-br from-amber-50/80 to-yellow-50/80 border-2 border-amber-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                            <CardHeader>
                              <CardTitle className="text-amber-900 text-xl font-semibold flex items-center">
                                <Calendar className="w-5 h-5 mr-2" />
                                Timing Insights
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-slate-800 text-sm leading-relaxed">{combinedSystemData.crossReferences.timingInsights}</p>
                            </CardContent>
                          </Card>
                          </motion.div>
                        )}
                      </div>
                    )}

                    {/* Recommendations */}
                    {combinedSystemData.recommendations && combinedSystemData.recommendations.length > 0 && (
                      <motion.div
                        initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
                        animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                        transition={motionConfig}
                        whileHover={prefersReducedMotion ? {} : { y: -2, transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] } }}
                      >
                        <Card className="bg-gradient-to-br from-pink-50/80 to-rose-50/80 border-2 border-pink-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                        <CardHeader>
                          <CardTitle className="text-pink-900 text-xl font-semibold flex items-center">
                            <Target className="w-5 h-5 mr-2" />
                            Recommendations
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {combinedSystemData.recommendations.map((rec: string, index: number) => (
                              <li key={index} className="text-slate-800 text-sm flex items-start">
                                <Star className="w-4 h-4 text-pink-600 mr-2 mt-0.5 flex-shrink-0" />
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                      </motion.div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Info className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                    <p className="text-slate-700 mb-4">Generate your mystical profile once from your Profile page to see the Combined Divination System (Tarot, Astrology & Numerology) here.</p>
                    <Button asChild className="bg-amber-500 hover:bg-amber-600 text-white">
                      <Link href="/profile">
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate your mystical profile
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
                </TabsContent>
              </motion.div>
            )}
          </AnimatePresence>
              </div>
            </div>
          )}
        </Tabs>
        </div>
      </div>
    </div>
    </ToolReportGuard>
  )
}

// Wrap with error boundary for stability
export default function TarotPageWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <TarotPage />
    </ErrorBoundary>
  )
}