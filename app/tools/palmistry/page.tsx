"use client"

import { useState, useMemo, useCallback } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { usePalmistry } from "@/hooks/use-palmistry"
import type { PalmistryAnalysis } from "@/lib/palmistryIntelligence"
import { useToolReport } from "@/hooks/useComprehensiveMysticalProfile"
import { useAuth } from "@/hooks/use-auth"
import { ToolIntroductionTab } from "@/components/ToolIntroductionTab"
import { Button } from "@/components/ui/button"
import { PalmistryRemedies } from "@/components/palmistry/PalmistryRemedies"
import { PalmistryDashboardHero } from "@/components/palmistry/PalmistryDashboardHero"
import { LineAnalysisCard } from "@/components/palmistry/LineAnalysisCard"
import { MountDashboard } from "@/components/palmistry/MountDashboard"
import { FingerAnalysisCard } from "@/components/palmistry/FingerAnalysisCard"
import PalmistrySeerChatInterface from "@/components/palmistry/PalmistrySeerChatInterface"
import { DashboardSection } from "@/components/western/DashboardSection"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Activity, Star, Hand, Brain, Heart, Clock, Sparkles, Users } from "lucide-react"
import { useToolReportUnlock } from "@/hooks/useToolReportUnlock"
import { useViralReportBypass } from "@/hooks/useViralReportBypass"
import { TeaserView } from "@/components/report-viral/TeaserView"
import { ShareCard } from "@/components/report-viral/ShareCard"
import { ViralLockOverlay } from "@/components/report-viral/LockedReportView"
import { buildToolTeaser } from "@/lib/report-viral/buildToolTeaser"
import { toolPathForSlug } from "@/lib/report-viral/toolSlugToPath"
import { cn } from "@/lib/utils"

type PalmistryTabKey =
  | "introduction"
  | "palmistry-analysis"
  | "timing-guidance"
  | "remedies"
  | "ask-the-seer"

export default function PalmistryPage() {
  const { user, userProfile } = useAuth()
  const { report: pipelineReport, loading: pipelineLoading, error: profileError, hasReport: hasStoredReport } = useToolReport('palmistry')
  const {
    analysis: liveAnalysis,
    isLoading: isLiveLoading,
    error: liveError
  } = usePalmistry()

  const [activeTab, setActiveTab] = useState<PalmistryTabKey>("introduction")

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value as PalmistryTabKey)
  }, [])

  const handleNavigateToTab = useCallback((tab: string) => {
    setActiveTab(tab as PalmistryTabKey)
  }, [])

  // Prefer stored report from mystical profile when available and not a placeholder
  const storedAnalysis = useMemo(() => {
    if (!pipelineReport || typeof pipelineReport !== 'object' || (pipelineReport as { placeholder?: boolean }).placeholder) return null
    const raw = (pipelineReport as { analysis?: unknown; palmistryContext?: unknown }).analysis
      ?? (pipelineReport as { analysis?: unknown; palmistryContext?: unknown }).palmistryContext
    return raw && typeof raw === 'object' && ('lines' in (raw as object) || 'mounts' in (raw as object)) ? raw : null
  }, [pipelineReport])

  const effectiveAnalysis = storedAnalysis ?? liveAnalysis
  const isLoading = pipelineLoading || isLiveLoading
  const error = liveError ?? null

  const analysisData = useMemo((): PalmistryAnalysis | null => (effectiveAnalysis ? (effectiveAnalysis as unknown as PalmistryAnalysis) : null), [effectiveAnalysis])

  const viralUnlock = useToolReportUnlock("palmistry")
  const bypassViral = useViralReportBypass()
  const [showShareCard, setShowShareCard] = useState(false)
  const [waitingLite, setWaitingLite] = useState(false)

  const showPalmViral = Boolean(analysisData) && !bypassViral
  const palmTeaser = useMemo(
    () => buildToolTeaser("palmistry", pipelineReport ?? analysisData),
    [pipelineReport, analysisData]
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
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "FutureSeer — my reading",
          text: `${palmTeaser.archetypeName}: ${palmTeaser.hookLine.slice(0, 120)}…`,
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
  }, [copyLink, viralUnlock, palmTeaser.archetypeName, palmTeaser.hookLine])

  const continueWithoutSharing = useCallback(() => {
    setWaitingLite(true)
    window.setTimeout(() => {
      viralUnlock.unlockLite()
      setWaitingLite(false)
    }, 4000)
  }, [viralUnlock])

  const palmCompareHref = useMemo(
    () => `/tools/${toolPathForSlug("palmistry")}?friend=compare&ref=share`,
    []
  )

  const palmLocked =
    showPalmViral && viralUnlock.hydrated && !viralUnlock.isUnlocked && !bypassViral

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  }

  const cardVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 }
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="starfield-ultra-sharp min-h-screen p-4 pt-4 overflow-hidden"
    >
      <div className="relative z-10 max-w-7xl mx-auto py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center mb-8"
        >
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-semibold mb-6">
            <span className="text-amber-400">🤲</span>{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600">Palmistry</span>
          </h1>
          <p className="text-slate-200 leading-relaxed text-xl font-light">Ancient wisdom revealed in the lines of your hands</p>
        </motion.div>

        {showPalmViral && !bypassViral && (
          <div className="mb-6 space-y-4">
            <TeaserView teaser={palmTeaser} />
            {showShareCard && (
              <ShareCard
                archetypeName={palmTeaser.archetypeName}
                hookLine={palmTeaser.hookLine}
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

        {showPalmViral && viralUnlock.isUnlocked && !bypassViral && (
          <div className="mb-4 flex justify-center">
            <Link
              href={palmCompareHref}
              className="inline-flex items-center gap-2 rounded-full border border-violet-500/40 bg-violet-950/40 px-4 py-2 text-sm font-medium text-violet-100 hover:bg-violet-900/50"
            >
              <Users className="h-4 w-4" />
              Compare with a friend
            </Link>
          </div>
        )}

        {/* Tabs */}
        <div className="rounded-2xl border border-amber-500/30 bg-slate-900/80 overflow-hidden">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full min-w-0">
          <TabsList className="flex w-full flex-nowrap overflow-x-auto gap-1 sm:gap-2 p-2 sm:p-3 bg-slate-800/50 border-b border-amber-500/20 rounded-none h-auto min-h-0 justify-start [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-amber-500/30" role="tablist" aria-label="Palmistry navigation tabs">
            <TabsTrigger 
              value="introduction" 
              className="shrink-0 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 rounded-t-lg rounded-b-none px-4 py-2.5 text-sm font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 border border-transparent data-[state=inactive]:border-slate-600/50 transition-all"
              role="tab"
              aria-label="Introduction to Palmistry"
            >
              Introduction
            </TabsTrigger>
            <TabsTrigger 
              value="palmistry-analysis" 
              className="shrink-0 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 rounded-t-lg rounded-b-none px-4 py-2.5 text-sm font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 border border-transparent data-[state=inactive]:border-slate-600/50 transition-all"
              role="tab"
              aria-label="View your comprehensive palm analysis"
            >
              Palm Analysis
            </TabsTrigger>
            <TabsTrigger 
              value="timing-guidance" 
              className="shrink-0 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 rounded-t-lg rounded-b-none px-4 py-2.5 text-sm font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 border border-transparent data-[state=inactive]:border-slate-600/50 transition-all"
              role="tab"
              aria-label="View timing and life guidance"
            >
              Timing & Guidance
            </TabsTrigger>
            <TabsTrigger 
              value="remedies" 
              className="shrink-0 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 rounded-t-lg rounded-b-none px-4 py-2.5 text-sm font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 border border-transparent data-[state=inactive]:border-slate-600/50 transition-all"
              role="tab"
              aria-label="View personalized palmistry remedies"
            >
              Remedies
            </TabsTrigger>
            <TabsTrigger 
              value="ask-the-seer" 
              className="shrink-0 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 rounded-t-lg rounded-b-none px-4 py-2.5 text-sm font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 border border-transparent data-[state=inactive]:border-slate-600/50 transition-all"
              role="tab"
              aria-label="Ask palmistry questions to the expert seer"
            >
              Ask the Seer
            </TabsTrigger>
          </TabsList>

          {activeTab === "ask-the-seer" ? (
          <TabsContent value="ask-the-seer" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
            <motion.div
              variants={cardVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50 border-2 border-purple-200 shadow-lg hover:shadow-xl transition-shadow duration-200 rounded-3xl h-[800px] overflow-hidden">
                <div className="h-full bg-gradient-to-b from-transparent to-white/30">
                  <PalmistrySeerChatInterface
                    userId={user?.uid || ""}
                    userProfile={userProfile}
                    palmistryAnalysis={analysisData || undefined}
                  />
                </div>
              </Card>
            </motion.div>
          </TabsContent>
          ) : showPalmViral && !viralUnlock.hydrated ? (
            <div className="py-12 text-center text-slate-400">Loading report…</div>
          ) : (
            <div className={cn(showPalmViral && "relative min-h-[320px]")}>
              {showPalmViral && palmLocked && (
                <ViralLockOverlay
                  onUnlockClick={handleShareToUnlock}
                  onContinueWithoutSharing={waitingLite ? () => {} : continueWithoutSharing}
                  continueDisabled={waitingLite}
                />
              )}
              <div
                className={cn(
                  showPalmViral &&
                    palmLocked &&
                    "pointer-events-none select-none blur-sm filter transition-[filter] duration-300 [&_*]:pointer-events-none"
                )}
              >
          {/* Introduction Tab */}
            <TabsContent key="introduction" value="introduction" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
              <motion.div
                variants={cardVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <ToolIntroductionTab toolSlug="palmistry" />
              </motion.div>
            </TabsContent>

          {/* Palmistry Analysis Tab */}
            <TabsContent key="palmistry-analysis" value="palmistry-analysis" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
              {isLoading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8"
                >
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4"></div>
                  <p className="text-slate-200">Analyzing your palm...</p>
                </motion.div>
              ) : !analysisData && profileError && !hasStoredReport ? (
                <motion.div
                  variants={cardVariants}
                  initial="initial"
                  animate="animate"
                  className="text-center py-8"
                >
                  <p className="text-slate-200 mb-4">Generate your mystical profile to see your palm reading here.</p>
                  <Button asChild className="bg-amber-500 hover:bg-amber-600 text-white">
                    <Link href="/profile">Generate my mystical profile</Link>
                  </Button>
                </motion.div>
              ) : error ? (
                <motion.div
                  variants={cardVariants}
                  initial="initial"
                  animate="animate"
                >
                  <Card className="bg-gradient-to-br from-red-50 to-amber-50 border-2 border-red-300 rounded-3xl shadow-lg hover:shadow-xl transition-shadow duration-200">
                    <CardContent className="p-8 text-center">
                      <div className="text-4xl mb-4">⚠️</div>
                      <p className="text-red-700 mb-4">{error}</p>
                      {!userProfile?.palmPhotoUrl && (
                        <motion.a
                          href="/profile"
                          whileHover={{}}
                          whileTap={{ scale: 0.95 }}
                          className="inline-block bg-gradient-to-r from-amber-500 to-red-600 text-white rounded-xl px-6 py-3 font-semibold hover:shadow-xl transition-all duration-300"
                        >
                          Upload Palm Image →
                        </motion.a>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ) : analysisData ? (
                <motion.div
                  variants={cardVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                >
                  {/* Hero Section */}
                  <PalmistryDashboardHero 
                    analysis={analysisData}
                    userProfile={userProfile}
                  />

                  {/* Dashboard Sections */}
                  <div className="space-y-6 mt-8">
                    
                    {/* Major Lines */}
                    <DashboardSection 
                      title="Major Lines" 
                      icon={<Activity className="w-6 h-6" />}
                      badge={`${analysisData.lines?.length || 0} Lines`}
                      defaultExpanded={true}
                      colorScheme="purple"
                      storageKey="major-lines"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {analysisData.lines?.map((line, index) => (
                          <motion.div
                            key={line.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                          >
                            <LineAnalysisCard line={line} />
                          </motion.div>
                        ))}
                      </div>
                    </DashboardSection>

                    {/* Mounts */}
                    <DashboardSection 
                      title="Palm Mounts" 
                      icon={<Star className="w-6 h-6" />}
                      badge={`${analysisData.mounts?.length || 0} Mounts`}
                      defaultExpanded={false}
                      colorScheme="green"
                      storageKey="mounts"
                    >
                      <MountDashboard mounts={analysisData.mounts || []} />
                    </DashboardSection>

                    {/* Fingers & Hand Shape */}
                    <DashboardSection 
                      title="Fingers & Hand Shape" 
                      icon={<Hand className="w-6 h-6" />}
                      badge="5 Fingers"
                      defaultExpanded={false}
                      colorScheme="blue"
                      storageKey="fingers"
                    >
                      <FingerAnalysisCard fingers={analysisData.fingers} />
                    </DashboardSection>

                    {/* Life Path & Overall Reading */}
                    <DashboardSection 
                      title="Life Path & Overall Reading" 
                      icon={<Sparkles className="w-6 h-6" />}
                      defaultExpanded={false}
                      colorScheme="pink"
                      storageKey="life-path"
                    >
                      <div className="space-y-4">
                        {analysisData.lifePath && (
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4 }}
                          >
                            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-200">
                              <CardContent className="p-6">
                                <h4 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
                                  <Star className="w-4 h-4" />
                                  Your Life Path
                                </h4>
                                <p className="text-slate-700 leading-relaxed">{analysisData.lifePath}</p>
                              </CardContent>
                            </Card>
                          </motion.div>
                        )}
                        
                        {analysisData.overallReading && (
                          <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: 0.1 }}
                          >
                            <Card className="bg-gradient-to-br from-amber-50 to-amber-50 border-2 border-amber-200 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-200">
                              <CardContent className="p-6">
                                <h4 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
                                  <Sparkles className="w-4 h-4" />
                                  Overall Reading
                                </h4>
                                <p className="text-slate-700 leading-relaxed">{analysisData.overallReading}</p>
                              </CardContent>
                            </Card>
                          </motion.div>
                        )}
                      </div>
                    </DashboardSection>

                  </div>
                </motion.div>
              ) : (
                <motion.div
                  variants={cardVariants}
                  initial="initial"
                  animate="animate"
                >
                  <Card className="bg-gradient-to-br from-amber-50 to-amber-50 border-2 border-amber-300 rounded-3xl shadow-lg hover:shadow-xl transition-shadow duration-200">
                    <CardContent className="p-8 text-center">
                      <div className="text-6xl mb-6">🤲</div>
                      <h3 className="text-2xl font-bold text-amber-900 mb-4">Upload Your Palm Image</h3>
                      <p className="text-slate-700 mb-6">
                        Upload a clear palm photo to receive your personalized palmistry analysis
                      </p>
                      <motion.a
                        href="/profile"
                        whileHover={{}}
                        whileTap={{ scale: 0.95 }}
                        className="inline-block bg-gradient-to-r from-amber-500 to-red-600 text-white rounded-xl px-6 py-3 font-semibold hover:shadow-xl transition-all duration-300"
                      >
                        Go to Profile →
                      </motion.a>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </TabsContent>

          {/* Timing & Guidance Tab */}
            <TabsContent key="timing-guidance" value="timing-guidance" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
              {analysisData ? (
                <motion.div
                  variants={cardVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Current Life Phase */}
                  <DashboardSection 
                    title="Current Life Phase" 
                    icon={<Clock className="w-6 h-6" />}
                    defaultExpanded={true}
                    colorScheme="cyan"
                    storageKey="life-phase"
                  >
                    <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-200 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-200">
                      <CardContent className="p-6">
                        <h3 className="text-xl font-bold text-cyan-900 mb-3">{analysisData.timing?.currentPhase}</h3>
                        <p className="text-slate-700 leading-relaxed">{analysisData.overallReading}</p>
                        
                        {/* Favorable Periods */}
                        {analysisData.timing?.favorablePeriods && analysisData.timing.favorablePeriods.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-cyan-300">
                            <h4 className="font-semibold text-cyan-900 mb-2">Favorable Periods</h4>
                            <ul className="space-y-1">
                              {analysisData.timing.favorablePeriods.map((period, idx) => (
                                <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                                  <span className="text-cyan-600">✦</span>
                                  {period}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Opportunities */}
                        {analysisData.timing?.opportunities && analysisData.timing.opportunities.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-cyan-300">
                            <h4 className="font-semibold text-cyan-900 mb-2">Opportunities</h4>
                            <ul className="space-y-1">
                              {analysisData.timing.opportunities.map((opp, idx) => (
                                <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                                  <span className="text-green-600">+</span>
                                  {opp}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </DashboardSection>

                  {/* Life Guidance */}
                  <DashboardSection 
                    title="Life Guidance" 
                    icon={<Sparkles className="w-6 h-6" />}
                    defaultExpanded={true}
                    colorScheme="purple"
                    storageKey="guidance"
                  >
                    <div className="space-y-4">
                      {/* Strengths */}
                      {analysisData.coaching?.strengths && analysisData.coaching.strengths.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-200">
                            <CardContent className="p-4">
                              <h4 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                                <Star className="w-4 h-4" />
                                Your Strengths
                              </h4>
                              <ul className="space-y-2">
                                {analysisData.coaching.strengths.map((strength, idx) => (
                                  <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                                    <span className="text-green-600 mt-1">✓</span>
                                    {strength}
                                  </li>
                                ))}
                              </ul>
                            </CardContent>
                          </Card>
                        </motion.div>
                      )}

                      {/* Growth Areas */}
                      {analysisData.coaching?.growthAreas && analysisData.coaching.growthAreas.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.1 }}
                        >
                          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-200">
                            <CardContent className="p-4">
                              <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                                <Brain className="w-4 h-4" />
                                Growth Areas
                              </h4>
                              <ul className="space-y-2">
                                {analysisData.coaching.growthAreas.map((area, idx) => (
                                  <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                                    <span className="text-blue-600 mt-1">→</span>
                                    {area}
                                  </li>
                                ))}
                              </ul>
                            </CardContent>
                          </Card>
                        </motion.div>
                      )}

                      {/* Affirmations */}
                      {analysisData.coaching?.affirmations && analysisData.coaching.affirmations.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.2 }}
                        >
                          <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-200">
                            <CardContent className="p-4">
                              <h4 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
                                <Heart className="w-4 h-4" />
                                Daily Affirmations
                              </h4>
                              <div className="space-y-2">
                                {analysisData.coaching.affirmations.map((affirmation, idx) => (
                                  <p key={idx} className="text-sm text-slate-700 italic bg-white/60 p-3 rounded-lg">
                                    {`\u201c${affirmation}\u201d`}
                                  </p>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      )}

                      {/* Recommendations */}
                      {analysisData.recommendations && analysisData.recommendations.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.3 }}
                        >
                          <Card className="bg-gradient-to-br from-pink-50 to-rose-50 border-2 border-pink-200 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-200">
                            <CardContent className="p-4">
                              <h4 className="font-bold text-pink-900 mb-3 flex items-center gap-2">
                                <Sparkles className="w-4 h-4" />
                                Recommendations
                              </h4>
                              <ul className="space-y-2">
                                {analysisData.recommendations.map((rec, idx) => (
                                  <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                                    <span className="text-pink-600 mt-1">◆</span>
                                    {rec}
                                  </li>
                                ))}
                              </ul>
                            </CardContent>
                          </Card>
                        </motion.div>
                      )}
                    </div>
                  </DashboardSection>
                </motion.div>
              ) : (
                <motion.div
                  variants={cardVariants}
                  initial="initial"
                  animate="animate"
                >
                  <Card className="bg-gradient-to-br from-amber-50 to-amber-50 border-2 border-amber-300 rounded-3xl shadow-lg hover:shadow-xl transition-shadow duration-200">
                    <CardContent className="p-8 text-center">
                      <Clock className="w-16 h-16 text-amber-600 mx-auto mb-4" />
                      <p className="text-slate-700">Complete your palm analysis to view timing and guidance.</p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </TabsContent>

          {/* Remedies Tab */}
            <TabsContent key="remedies" value="remedies" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
              <motion.div
                variants={cardVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <PalmistryRemedies 
                  palmistryData={analysisData}
                  onNavigateToTab={handleNavigateToTab}
                />
              </motion.div>
            </TabsContent>
              </div>
            </div>
          )}
        </Tabs>
        </div>
      </div>
    </motion.div>
  )
}
