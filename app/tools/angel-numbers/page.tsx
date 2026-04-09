"use client"

import { useState, useCallback, useMemo } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Users } from "lucide-react"
import { useAngelNumbersData } from "@/hooks/use-angel-numbers-data"
import { useToolReportUnlock } from "@/hooks/useToolReportUnlock"
import { useViralReportBypass } from "@/hooks/useViralReportBypass"
import { ToolIntroductionTab } from "@/components/ToolIntroductionTab"
import { AngelNumbersCoachInterface } from "@/components/AngelNumbersCoachInterface"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { AngelNumbersLookup } from "@/components/angel-numbers/AngelNumbersLookup"
import { AngelNumbersAnalysis } from "@/components/angel-numbers/AngelNumbersAnalysis"
import { NumerologyPracticalGuidance } from "@/components/numerology/NumerologyPracticalGuidance"
import { ANGEL_NUMBERS_CONSTANTS, MATERIAL3_EASING } from "@/components/angel-numbers/constants"
import { lookupAngelNumber } from "@/lib/angelNumbersLookup"
import { TeaserView } from "@/components/report-viral/TeaserView"
import { ShareCard } from "@/components/report-viral/ShareCard"
import { ViralLockOverlay } from "@/components/report-viral/LockedReportView"
import { buildToolTeaser } from "@/lib/report-viral/buildToolTeaser"
import { toolPathForSlug } from "@/lib/report-viral/toolSlugToPath"
import { cn } from "@/lib/utils"

export default function AngelNumbersPage() {
  const {
    angelNumbersData,
    loading,
    error,
    refresh,
    clearCache
  } = useAngelNumbersData()

  const viralUnlock = useToolReportUnlock("angel-numbers")
  const bypassViral = useViralReportBypass()
  const [showShareCard, setShowShareCard] = useState(false)
  const [waitingLite, setWaitingLite] = useState(false)

  const [activeTab, setActiveTab] = useState<'introduction' | 'lookup' | 'analysis' | 'quick-guidance' | 'ask-the-seer'>('introduction')
  const [lastLookupResult, setLastLookupResult] = useState<ReturnType<typeof lookupAngelNumber> | null>(null)

  const showAngelViral = Boolean(angelNumbersData) && !bypassViral
  const angelTeaser = useMemo(
    () => buildToolTeaser("angel-numbers", angelNumbersData),
    [angelNumbersData]
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
          text: `${angelTeaser.archetypeName}: ${angelTeaser.hookLine.slice(0, 120)}…`,
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
  }, [copyLink, viralUnlock, angelTeaser.archetypeName, angelTeaser.hookLine])

  const continueWithoutSharing = useCallback(() => {
    setWaitingLite(true)
    window.setTimeout(() => {
      viralUnlock.unlockLite()
      setWaitingLite(false)
    }, 4000)
  }, [viralUnlock])

  const angelCompareHref = useMemo(
    () => `/tools/${toolPathForSlug("angel-numbers")}?friend=compare&ref=share`,
    []
  )

  const angelLocked =
    showAngelViral && viralUnlock.hydrated && !viralUnlock.isUnlocked && !bypassViral

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value as 'introduction' | 'lookup' | 'analysis' | 'quick-guidance' | 'ask-the-seer')
  }, [])

  const handleLookupComplete = useCallback((result: ReturnType<typeof lookupAngelNumber>) => {
    setLastLookupResult(result)
  }, [])

  return (
    <div className="starfield-ultra-sharp min-h-screen w-full min-w-0 max-w-full p-4 pt-4 overflow-x-hidden">
      {/* Softening overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/10 via-slate-900/30 to-slate-900/40 pointer-events-none"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto py-8 w-full min-w-0">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-semibold mb-6">
            <span className="text-yellow-400">👼</span>{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600">Angel Numbers</span>
          </h1>
          <p className="text-slate-200 leading-relaxed text-xl font-light">
            Divine messages from the angels through sacred number sequences
          </p>
        </div>

        {showAngelViral && !bypassViral && (
          <div className="mb-6 space-y-4">
            <TeaserView teaser={angelTeaser} />
            {showShareCard && (
              <ShareCard
                archetypeName={angelTeaser.archetypeName}
                hookLine={angelTeaser.hookLine}
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

        {showAngelViral && viralUnlock.isUnlocked && !bypassViral && (
          <div className="mb-4 flex justify-center">
            <Link
              href={angelCompareHref}
              className="inline-flex items-center gap-2 rounded-full border border-violet-500/40 bg-violet-950/40 px-4 py-2 text-sm font-medium text-violet-100 hover:bg-violet-900/50"
            >
              <Users className="h-4 w-4" />
              Compare with a friend
            </Link>
          </div>
        )}

        {/* Tabs */}
        <div className="rounded-2xl border border-amber-500/30 bg-slate-900/80 overflow-hidden w-full min-w-0">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full min-w-0">
          <TabsList className="flex w-full min-w-0 flex-nowrap overflow-x-auto no-scrollbar gap-1 sm:gap-2 p-2 sm:p-3 bg-slate-800/50 border-b border-amber-500/20 rounded-none h-auto min-h-0 justify-start [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-amber-500/30">
            <TabsTrigger 
              value="introduction" 
              className="shrink-0 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 rounded-t-lg rounded-b-none px-4 py-2.5 text-sm font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 transition-all flex items-center justify-center border border-transparent data-[state=inactive]:border-slate-600/50"
            >
              Introduction
            </TabsTrigger>
            <TabsTrigger 
              value="lookup" 
              className="shrink-0 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 rounded-t-lg rounded-b-none px-4 py-2.5 text-sm font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 transition-all flex items-center justify-center border border-transparent data-[state=inactive]:border-slate-600/50"
            >
              Number Lookup
            </TabsTrigger>
            <TabsTrigger 
              value="analysis" 
              className="shrink-0 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 rounded-t-lg rounded-b-none px-4 py-2.5 text-sm font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 transition-all flex items-center justify-center border border-transparent data-[state=inactive]:border-slate-600/50"
            >
              Your Analysis
            </TabsTrigger>
            <TabsTrigger 
              value="quick-guidance" 
              className="shrink-0 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 rounded-t-lg rounded-b-none px-4 py-2.5 text-sm font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 transition-all flex items-center justify-center border border-transparent data-[state=inactive]:border-slate-600/50"
            >
              Quick guidance
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
            <AngelNumbersCoachInterface
              observedNumber={
                lastLookupResult?.originalInput != null
                  ? String(lastLookupResult.originalInput)
                  : undefined
              }
            />
          </TabsContent>
          ) : showAngelViral && !viralUnlock.hydrated ? (
            <div className="py-12 text-center text-slate-400">Loading report…</div>
          ) : (
            <div className={cn(showAngelViral && "relative min-h-[320px]")}>
              {showAngelViral && angelLocked && (
                <ViralLockOverlay
                  onUnlockClick={handleShareToUnlock}
                  onContinueWithoutSharing={waitingLite ? () => {} : continueWithoutSharing}
                  continueDisabled={waitingLite}
                />
              )}
              <div
                className={cn(
                  showAngelViral &&
                    angelLocked &&
                    'pointer-events-none select-none blur-sm filter transition-[filter] duration-300 [&_*]:pointer-events-none'
                )}
              >
          {/* Introduction Tab */}
          <TabsContent value="introduction" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
            <ToolIntroductionTab toolSlug="angel-numbers" />
          </TabsContent>

          {/* Number Lookup Tab */}
          <TabsContent value="lookup" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
            <AngelNumbersLookup onLookupComplete={handleLookupComplete} />
          </TabsContent>

          {/* Analysis Tab */}
          <TabsContent value="analysis" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
            {angelNumbersData ? (
              <AngelNumbersAnalysis
                angelNumbersData={angelNumbersData}
                loading={loading}
                error={error}
                onRefresh={refresh}
                onClearCache={clearCache}
              />
            ) : (
              <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-3xl">
                <CardContent className="p-8 text-center">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4, ease: MATERIAL3_EASING.decelerated }}
                    className="text-6xl mb-6"
                  >
                    👼
                  </motion.div>
                  <h3 className="text-2xl font-semibold text-amber-900 mb-4">
                    {ANGEL_NUMBERS_CONSTANTS.MESSAGES.READY_FOR_GUIDANCE}
                  </h3>
                  <p className="text-slate-700 leading-relaxed mb-6">
                    {ANGEL_NUMBERS_CONSTANTS.MESSAGES.CLICK_REFRESH}
                  </p>
                  <motion.button
                    whileHover={{}}
                    whileTap={{ scale: 0.95, y: 0 }}
                    onClick={refresh}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    className="px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-xl font-semibold hover:shadow-xl transition-all duration-300"
                  >
                    {ANGEL_NUMBERS_CONSTANTS.BUTTONS.GET_ANGEL_NUMBERS}
                  </motion.button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="quick-guidance" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
            <NumerologyPracticalGuidance
              anchorNumber={angelNumbersData?.lifePathAngel}
              heading="Angel number practical guidance"
            />
          </TabsContent>
              </div>
            </div>
          )}
        </Tabs>
        </div>
      </div>
    </div>
  )
}
