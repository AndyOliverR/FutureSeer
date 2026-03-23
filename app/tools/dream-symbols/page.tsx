"use client"

import { useState, useMemo, useCallback } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { DreamSymbolsCoachInterface } from "@/components/DreamSymbolsCoachInterface"
import { useDreamSymbols } from "@/hooks/use-dream-symbols"
import { useAuth } from "@/hooks/use-auth"
import { useToolReportUnlock } from "@/hooks/useToolReportUnlock"
import { useViralReportBypass } from "@/hooks/useViralReportBypass"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ToolIntroductionTab } from "@/components/ToolIntroductionTab"
import DreamSymbolsSeerChatInterface from "@/components/DreamSymbolsSeerChatInterface"
import { TeaserView } from "@/components/report-viral/TeaserView"
import { ShareCard } from "@/components/report-viral/ShareCard"
import { ViralLockOverlay } from "@/components/report-viral/LockedReportView"
import { buildToolTeaser } from "@/lib/report-viral/buildToolTeaser"
import { toolPathForSlug } from "@/lib/report-viral/toolSlugToPath"
import { cn } from "@/lib/utils"
import { Moon, Sparkles, Loader2, ArrowLeft, MessageCircle, Users } from "lucide-react"

type DreamTabKey =
  | "introduction"
  | "overview"
  | "symbols"
  | "meaning"
  | "guidance"
  | "archetypes"
  | "ask-the-seer"

export default function DreamSymbolsPage() {
  const { user, userProfile } = useAuth()
  const {
    dreamDescription,
    symbols,
    analysis,
    isLoading,
    error,
    setDreamDescription,
    setSymbols,
    performDreamAnalysis,
    resetData,
  } = useDreamSymbols()

  const [activeTab, setActiveTab] = useState<DreamTabKey>("introduction")
  const [patternType, setPatternType] = useState<'dreams' | 'tea-leaves' | 'bone-throwing'>('dreams')
  
  // Check if user has complete birth details (similar to tarot page pattern)
  const hasCompleteDetails = userProfile?.birthDate && userProfile?.birthPlace

  const viralUnlock = useToolReportUnlock("dreamSymbols")
  const bypassViral = useViralReportBypass()
  const [showShareCard, setShowShareCard] = useState(false)
  const [waitingLite, setWaitingLite] = useState(false)

  const showDreamViral = Boolean(analysis) && !bypassViral
  const dreamTeaser = useMemo(
    () => buildToolTeaser("dreamSymbols", analysis),
    [analysis]
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
          text: `${dreamTeaser.archetypeName}: ${dreamTeaser.hookLine.slice(0, 120)}…`,
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
  }, [copyLink, viralUnlock, dreamTeaser.archetypeName, dreamTeaser.hookLine])

  const continueWithoutSharing = useCallback(() => {
    setWaitingLite(true)
    window.setTimeout(() => {
      viralUnlock.unlockLite()
      setWaitingLite(false)
    }, 4000)
  }, [viralUnlock])

  const dreamCompareHref = useMemo(
    () => `/tools/${toolPathForSlug("dreamSymbols")}?friend=compare&ref=share`,
    []
  )

  const dreamLocked =
    showDreamViral && viralUnlock.hydrated && !viralUnlock.isUnlocked && !bypassViral

  const tabTriggerClass =
    'shrink-0 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 rounded-t-lg rounded-b-none px-4 py-2.5 text-sm font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 border border-transparent data-[state=inactive]:border-slate-600/50 transition-all'

  return (
    <div className="min-h-screen starfield-ultra-sharp text-white p-4 overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 pt-4"
        >
          <div className="flex items-center justify-center mb-4">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-semibold mb-6">
              <span className="text-yellow-400">🌙</span>{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600">Dream Symbols</span>
            </h1>
          </div>
          <p className="text-slate-200 leading-relaxed text-xl font-light mb-8">
            Unlock the hidden messages of your subconscious through ancient dream symbolism
          </p>
          {/* Inspirational Quote */}
          <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 shadow-lg rounded-3xl max-w-2xl mx-auto">
            <CardContent className="p-6">
              <p className="text-xl italic text-amber-900 font-serif mb-2">
                {'\u201cDreams are the royal road to the unconscious, where symbols speak the language of the soul.\u201d'}
              </p>
              <p className="text-slate-600 text-sm">— Carl Jung</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Section */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-1"
          >
            <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 shadow-lg rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-amber-100 to-yellow-100 rounded-t-3xl">
                <CardTitle className="text-2xl text-amber-900 text-center">Subconscious Messages</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 bg-gradient-to-br from-amber-50 to-yellow-50">
                {/* Dream Description */}
                <div>
                  <h3 className="text-lg text-amber-700 mb-4 flex items-center">
                    <Moon className="w-5 h-5 mr-2" />
                    Your Dream
                  </h3>
                  <textarea
                    placeholder="Describe your dream in detail, including emotions and key elements..."
                    value={dreamDescription || ""}
                    onChange={(e) => setDreamDescription(e.target.value)}
                    className="w-full bg-white border-2 border-amber-200 rounded-lg p-3 text-slate-700 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all duration-300 h-32 resize-none"
                  />
                </div>

                {/* Key Symbols */}
                <div>
                  <h3 className="text-lg text-amber-700 mb-4 flex items-center">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Key Symbols
                  </h3>
                  <textarea
                    placeholder="List the main symbols, objects, or themes from your dream..."
                    value={symbols || ""}
                    onChange={(e) => setSymbols(e.target.value)}
                    className="w-full bg-white border-2 border-amber-200 rounded-lg p-3 text-slate-700 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all duration-300 h-24 resize-none"
                  />
                </div>

                {/* Instructions */}
                <div className="p-4 rounded-lg bg-amber-100 border-2 border-amber-300">
                  <h4 className="text-amber-800 font-semibold mb-2 flex items-center">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Dream Insights
                  </h4>
                  <ul className="space-y-1 text-sm text-slate-700">
                    <li>• Subconscious messages</li>
                    <li>• Archetypal symbols</li>
                    <li>• Personal meaning</li>
                    <li>• Life guidance</li>
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="space-y-4">
                  <Button
                    onClick={performDreamAnalysis}
                    disabled={isLoading || !dreamDescription.trim()}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold active:scale-[0.98] active:opacity-90 transition-transform"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Moon className="w-4 h-4 mr-2" />
                        Interpret Dream
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={resetData}
                    variant="outline"
                    className="w-full border-slate-600 text-slate-300 hover:bg-slate-800"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Results Section */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 shadow-lg rounded-3xl overflow-hidden">
              <CardContent className="p-6 bg-gradient-to-br from-amber-50 to-yellow-50">
                {/* Pattern Reading Type Selector */}
                <div className="mb-6">
                  <h3 className="text-lg text-amber-800 mb-4 flex items-center">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Pattern Reading Type
                  </h3>
                  <div className="flex gap-2 mb-4">
                    {[
                      { value: 'dreams' as const, label: 'Dream Symbols', icon: '🌙' },
                      { value: 'tea-leaves' as const, label: 'Tea Leaves', icon: '🍵' },
                      { value: 'bone-throwing' as const, label: 'Bone Throwing', icon: '🦴' }
                    ].map((type) => (
                      <motion.button
                        key={type.value}
                        whileHover={{}}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setPatternType(type.value)}
                        className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                          patternType === type.value
                            ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-white shadow-md"
                            : "bg-white border-2 border-amber-200 text-slate-700 hover:border-amber-300"
                        }`}
                      >
                        <span className="mr-2">{type.icon}</span>
                        {type.label}
                      </motion.button>
                    ))}
                  </div>
                  <div className="p-3 bg-amber-100 border-2 border-amber-300 rounded-lg">
                    <p className="text-sm text-slate-700">
                      {patternType === 'dreams' && "Interpret subconscious symbols and archetypal meanings from your dreams."}
                      {patternType === 'tea-leaves' && "Read patterns formed by tea leaves (tasseography) for divinatory insights."}
                      {patternType === 'bone-throwing' && "Traditional bone throwing divination interpreting the patterns of cast bones."}
                    </p>
                  </div>
                </div>

                {showDreamViral && !bypassViral && (
                  <div className="mb-4 space-y-4">
                    <TeaserView teaser={dreamTeaser} />
                    {showShareCard && (
                      <ShareCard
                        archetypeName={dreamTeaser.archetypeName}
                        hookLine={dreamTeaser.hookLine}
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

                {showDreamViral && viralUnlock.isUnlocked && !bypassViral && (
                  <div className="mb-4 flex justify-center">
                    <Link
                      href={dreamCompareHref}
                      className="inline-flex items-center gap-2 rounded-full border border-violet-500/40 bg-violet-950/40 px-4 py-2 text-sm font-medium text-violet-100 hover:bg-violet-900/50"
                    >
                      <Users className="h-4 w-4" />
                      Compare with a friend
                    </Link>
                  </div>
                )}

                {/* Tabs — strip and content share px-4 sm:px-6 for alignment */}
                <div className="rounded-2xl border border-amber-500/30 bg-slate-900/80 overflow-hidden">
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as DreamTabKey)} className="w-full min-w-0">
                  <TabsList className="flex w-full flex-nowrap overflow-x-auto gap-1 sm:gap-2 px-4 sm:px-6 py-2 bg-slate-800/50 border-b border-amber-500/20 rounded-none h-auto min-h-0 justify-start [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-amber-500/30">
                    <TabsTrigger value="introduction" className={tabTriggerClass}>
                      Introduction
                    </TabsTrigger>
                    <TabsTrigger value="overview" className={tabTriggerClass}>
                      Overview
                    </TabsTrigger>
                    <TabsTrigger value="symbols" className={tabTriggerClass}>
                      Symbols
                    </TabsTrigger>
                    <TabsTrigger value="meaning" className={tabTriggerClass}>
                      Meaning
                    </TabsTrigger>
                    <TabsTrigger value="guidance" className={tabTriggerClass}>
                      Guidance
                    </TabsTrigger>
                    <TabsTrigger value="archetypes" className={tabTriggerClass}>
                      Archetypes
                    </TabsTrigger>
                    <TabsTrigger value="ask-the-seer" className={tabTriggerClass}>
                      Ask the Seer
                    </TabsTrigger>
                  </TabsList>

                  {activeTab === "ask-the-seer" ? (
                  <TabsContent value="ask-the-seer" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                    {user?.uid ? (
                      <DreamSymbolsSeerChatInterface
                        analysis={analysis ?? undefined}
                        userId={user.uid}
                        userProfile={userProfile}
                        sessionId={undefined}
                      />
                    ) : (
                      <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 shadow-lg rounded-3xl overflow-hidden">
                        <CardContent className="bg-gradient-to-br from-amber-50 to-yellow-50 text-center py-12">
                          <MessageCircle className="w-12 h-12 text-amber-700 mx-auto mb-4" />
                          <p className="text-slate-700 mb-4">Please sign in to ask The Seer about your dreams</p>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>
                  ) : showDreamViral && !viralUnlock.hydrated ? (
                    <div className="py-12 text-center text-slate-400">Loading report…</div>
                  ) : (
                    <div className={cn(showDreamViral && "relative min-h-[320px]")}>
                      {showDreamViral && dreamLocked && (
                        <ViralLockOverlay
                          onUnlockClick={handleShareToUnlock}
                          onContinueWithoutSharing={waitingLite ? () => {} : continueWithoutSharing}
                          continueDisabled={waitingLite}
                        />
                      )}
                      <div
                        className={cn(
                          showDreamViral &&
                            dreamLocked &&
                            "pointer-events-none select-none blur-sm filter transition-[filter] duration-300 [&_*]:pointer-events-none"
                        )}
                      >
                  {/* Introduction Tab */}
                  <TabsContent value="introduction" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                    <ToolIntroductionTab toolSlug="dream-symbols" />
                  </TabsContent>

                  {/* Overview Tab */}
                  <TabsContent value="overview" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                    <AnimatePresence mode="wait">
                      {isLoading ? (
                        <motion.div
                          key="loading"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="text-center py-16"
                        >
                          <motion.div
                            animate={{ 
                              rotate: 360,
                              scale: [1, 1.2, 1]
                            }}
                            transition={{ 
                              rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                              scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                            }}
                            className="mb-4 inline-block"
                          >
                            <Moon className="w-16 h-16 text-amber-400" />
                          </motion.div>
                          <motion.p 
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="text-slate-700 text-lg mt-4"
                          >
                            Decoding the symbols of your subconscious...
                          </motion.p>
                          <div className="flex justify-center gap-2 mt-6">
                            {[0, 1, 2].map((i) => (
                              <motion.div
                                key={i}
                                className="w-2 h-2 bg-amber-400 rounded-full"
                                animate={{
                                  scale: [1, 1.5, 1],
                                  opacity: [0.5, 1, 0.5]
                                }}
                                transition={{
                                  duration: 1.5,
                                  repeat: Infinity,
                                  delay: i * 0.2
                                }}
                              />
                            ))}
                          </div>
                        </motion.div>
                      ) : error ? (
                        <motion.div
                          key="error"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="text-center py-16"
                        >
                          <div className="text-6xl mb-4 animate-pulse">⚠️</div>
                          <p className="text-red-600 text-lg mb-2 font-semibold">Analysis Error</p>
                          <p className="text-slate-700 mb-4">{error}</p>
                          <Button
                            onClick={performDreamAnalysis}
                            className="bg-amber-500 hover:bg-amber-600 text-slate-900"
                          >
                            Try Again
                          </Button>
                        </motion.div>
                      ) : analysis ? (
                        <motion.div
                          key="results"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <DreamSymbolsCoachInterface 
                            analysis={analysis}
                            activeTab={activeTab}
                            dreamDescription={dreamDescription}
                            symbols={symbols}
                          />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="empty"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="text-center py-16"
                        >
                          <motion.div
                            animate={{ 
                              y: [0, -10, 0],
                              rotate: [0, 5, -5, 0]
                            }}
                            transition={{ 
                              duration: 3,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                            className="mb-6 inline-block"
                          >
                            <Moon className="w-20 h-20 text-amber-400" />
                          </motion.div>
                          <h3 className="text-3xl font-bold text-amber-800 mb-4">Ready to Decode Your Dreams?</h3>
                          <p className="text-slate-700 leading-relaxed text-lg mb-6 max-w-2xl mx-auto">
                            Share your dream above and let us unlock the hidden messages 
                            from your subconscious mind through ancient symbolism and Jungian archetypes.
                          </p>
                          {!hasCompleteDetails && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-6 p-4 bg-amber-100 border-2 border-amber-300 rounded-xl max-w-md mx-auto"
                            >
                              <p className="text-sm text-amber-800">
                                💡 For enhanced interpretations, complete your profile with birth details
                              </p>
                            </motion.div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </TabsContent>

                  {/* Symbols Tab */}
                  <TabsContent value="symbols" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                    <AnimatePresence mode="wait">
                      {isLoading ? (
                        <motion.div
                          key="loading"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="text-center py-16"
                        >
                          <motion.div
                            animate={{ 
                              rotate: 360,
                              scale: [1, 1.2, 1]
                            }}
                            transition={{ 
                              rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                              scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                            }}
                            className="mb-4 inline-block"
                          >
                            <Moon className="w-16 h-16 text-amber-400" />
                          </motion.div>
                          <motion.p 
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="text-slate-700 text-lg mt-4"
                          >
                            Decoding the symbols of your subconscious...
                          </motion.p>
                        </motion.div>
                      ) : error ? (
                        <motion.div
                          key="error"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="text-center py-16"
                        >
                          <div className="text-6xl mb-4 animate-pulse">⚠️</div>
                          <p className="text-red-600 text-lg mb-2 font-semibold">Analysis Error</p>
                          <p className="text-slate-700 mb-4">{error}</p>
                        </motion.div>
                      ) : analysis ? (
                        <motion.div
                          key="results"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <DreamSymbolsCoachInterface 
                            analysis={analysis}
                            activeTab={activeTab}
                            dreamDescription={dreamDescription}
                            symbols={symbols}
                          />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="empty"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="text-center py-16"
                        >
                          <Moon className="w-20 h-20 text-amber-400 mx-auto mb-4" />
                          <p className="text-slate-700">Complete dream analysis to view symbols</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </TabsContent>

                  {/* Meaning Tab */}
                  <TabsContent value="meaning" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                    <AnimatePresence mode="wait">
                      {isLoading ? (
                        <motion.div
                          key="loading"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="text-center py-16"
                        >
                          <Moon className="w-16 h-16 text-amber-400 mx-auto mb-4 animate-spin" />
                          <p className="text-slate-700 text-lg">Decoding the symbols of your subconscious...</p>
                        </motion.div>
                      ) : error ? (
                        <motion.div
                          key="error"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="text-center py-16"
                        >
                          <div className="text-6xl mb-4 animate-pulse">⚠️</div>
                          <p className="text-red-600 text-lg mb-2 font-semibold">Analysis Error</p>
                          <p className="text-slate-700 mb-4">{error}</p>
                        </motion.div>
                      ) : analysis ? (
                        <motion.div
                          key="results"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <DreamSymbolsCoachInterface 
                            analysis={analysis}
                            activeTab={activeTab}
                            dreamDescription={dreamDescription}
                            symbols={symbols}
                          />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="empty"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="text-center py-16"
                        >
                          <Moon className="w-20 h-20 text-amber-400 mx-auto mb-4" />
                          <p className="text-slate-700">Complete dream analysis to view meaning</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </TabsContent>

                  {/* Guidance Tab */}
                  <TabsContent value="guidance" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                    <AnimatePresence mode="wait">
                      {isLoading ? (
                        <motion.div
                          key="loading"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="text-center py-16"
                        >
                          <Moon className="w-16 h-16 text-amber-400 mx-auto mb-4 animate-spin" />
                          <p className="text-slate-700 text-lg">Decoding the symbols of your subconscious...</p>
                        </motion.div>
                      ) : error ? (
                        <motion.div
                          key="error"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="text-center py-16"
                        >
                          <div className="text-6xl mb-4 animate-pulse">⚠️</div>
                          <p className="text-red-600 text-lg mb-2 font-semibold">Analysis Error</p>
                          <p className="text-slate-700 mb-4">{error}</p>
                        </motion.div>
                      ) : analysis ? (
                        <motion.div
                          key="results"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <DreamSymbolsCoachInterface 
                            analysis={analysis}
                            activeTab={activeTab}
                            dreamDescription={dreamDescription}
                            symbols={symbols}
                          />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="empty"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="text-center py-16"
                        >
                          <Moon className="w-20 h-20 text-amber-400 mx-auto mb-4" />
                          <p className="text-slate-700">Complete dream analysis to view guidance</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </TabsContent>

                  {/* Archetypes Tab */}
                  <TabsContent value="archetypes" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                    <AnimatePresence mode="wait">
                      {isLoading ? (
                        <motion.div
                          key="loading"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="text-center py-16"
                        >
                          <Moon className="w-16 h-16 text-amber-400 mx-auto mb-4 animate-spin" />
                          <p className="text-slate-700 text-lg">Decoding the symbols of your subconscious...</p>
                        </motion.div>
                      ) : error ? (
                        <motion.div
                          key="error"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="text-center py-16"
                        >
                          <div className="text-6xl mb-4 animate-pulse">⚠️</div>
                          <p className="text-red-600 text-lg mb-2 font-semibold">Analysis Error</p>
                          <p className="text-slate-700 mb-4">{error}</p>
                        </motion.div>
                      ) : analysis ? (
                        <motion.div
                          key="results"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <DreamSymbolsCoachInterface 
                            analysis={analysis}
                            activeTab={activeTab}
                            dreamDescription={dreamDescription}
                            symbols={symbols}
                          />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="empty"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="text-center py-16"
                        >
                          <Moon className="w-20 h-20 text-amber-400 mx-auto mb-4" />
                          <p className="text-slate-700">Complete dream analysis to view archetypes</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </TabsContent>
                      </div>
                    </div>
                  )}
                </Tabs>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Features Highlight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12"
        >
          <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 shadow-lg rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-amber-100 to-yellow-100 rounded-t-3xl">
              <CardTitle className="text-2xl text-amber-900 text-center flex items-center justify-center gap-2">
                <Sparkles className="w-6 h-6" />
                Dream Symbol Features
              </CardTitle>
            </CardHeader>
            <CardContent className="bg-gradient-to-br from-amber-50 to-yellow-50">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-4xl mb-3">🌙</div>
                  <h4 className="text-amber-800 font-semibold mb-2">Subconscious</h4>
                  <p className="text-slate-600 text-sm">Hidden messages</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-3">🔮</div>
                  <h4 className="text-amber-800 font-semibold mb-2">Archetypes</h4>
                  <p className="text-slate-600 text-sm">Universal symbols</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-3">💭</div>
                  <h4 className="text-amber-800 font-semibold mb-2">Personal</h4>
                  <p className="text-slate-600 text-sm">Individual meaning</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-3">✨</div>
                  <h4 className="text-amber-800 font-semibold mb-2">Jungian</h4>
                  <p className="text-slate-600 text-sm">Depth psychology</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
} 