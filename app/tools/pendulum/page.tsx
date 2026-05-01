"use client"

import { useState, useMemo, useCallback } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { PendulumCoachInterface } from "@/components/PendulumCoachInterface"
import PendulumSeerChatInterface from "@/components/PendulumSeerChatInterface"
import { usePendulum } from "@/hooks/use-pendulum"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, AlertCircle, MessageCircle, Users } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToolReportUnlock } from "@/hooks/useToolReportUnlock"
import { useViralReportBypass } from "@/hooks/useViralReportBypass"
import { TeaserView } from "@/components/report-viral/TeaserView"
import { ShareCard } from "@/components/report-viral/ShareCard"
import { ViralLockOverlay } from "@/components/report-viral/LockedReportView"
import { buildToolTeaser } from "@/lib/report-viral/buildToolTeaser"
import { toolPathForSlug } from "@/lib/report-viral/toolSlugToPath"
import { cn } from "@/lib/utils"

export default function PendulumPage() {
  const { user, userProfile } = useAuth()
  const {
    question,
    pendulumType,
    analysis,
    isLoading,
    error,
    setQuestion,
    setPendulumType,
    performPendulumReading,
    resetData
  } = usePendulum()

  const viralUnlock = useToolReportUnlock("pendulum")
  const bypassViral = useViralReportBypass()
  const [showShareCard, setShowShareCard] = useState(false)
  const [waitingLite, setWaitingLite] = useState(false)

  const showPendulumViral = Boolean(analysis) && !bypassViral
  const pendulumTeaser = useMemo(() => buildToolTeaser("pendulum", analysis), [analysis])

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
          text: `${pendulumTeaser.archetypeName}: ${pendulumTeaser.hookLine.slice(0, 120)}…`,
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
  }, [copyLink, viralUnlock, pendulumTeaser.archetypeName, pendulumTeaser.hookLine])

  const continueWithoutSharing = useCallback(() => {
    setWaitingLite(true)
    window.setTimeout(() => {
      viralUnlock.unlockLite()
      setWaitingLite(false)
    }, 4000)
  }, [viralUnlock])

  const pendulumCompareHref = useMemo(
    () => `/tools/${toolPathForSlug("pendulum")}?friend=compare&ref=share`,
    []
  )

  const pendulumLocked =
    showPendulumViral && viralUnlock.hydrated && !viralUnlock.isUnlocked && !bypassViral

  const [pageTab, setPageTab] = useState<"cast" | "ask-the-seer">("cast")
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="relative min-h-screen starfield-ultra-sharp">
      
      <div className="relative z-10 container mx-auto px-4 pt-4 pb-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 pt-4 text-center"
        >
          <h1 className="text-3xl font-serif bg-gradient-to-b from-amber-200 via-yellow-400 to-amber-600 bg-clip-text text-transparent mb-2">🌀 Pendulum Divination</h1>
          <p className="text-slate-300">
            Answer yes/no questions through the ancient art of pendulum divination
          </p>
        </motion.div>

        {showPendulumViral && !bypassViral && (
          <div className="mb-6 space-y-4">
            <TeaserView teaser={pendulumTeaser} />
            {showShareCard && (
              <ShareCard
                archetypeName={pendulumTeaser.archetypeName}
                hookLine={pendulumTeaser.hookLine}
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

        {showPendulumViral && viralUnlock.isUnlocked && !bypassViral && (
          <div className="mb-4 flex justify-center">
            <Link
              href={pendulumCompareHref}
              className="inline-flex items-center gap-2 rounded-full border border-violet-500/40 bg-violet-950/40 px-4 py-2 text-sm font-medium text-violet-100 hover:bg-violet-900/50"
            >
              <Users className="h-4 w-4" />
              Compare with a friend
            </Link>
          </div>
        )}

        {/* Page-level tabs: Cast Reading | Ask the Seer */}
        <div className="rounded-2xl border border-amber-500/30 bg-slate-900/80 overflow-hidden">
        <Tabs value={pageTab} onValueChange={(v) => setPageTab(v as "cast" | "ask-the-seer")} className="w-full min-w-0">
          <TabsList className="flex w-full flex-nowrap overflow-x-auto gap-1 sm:gap-2 p-2 sm:p-3 bg-slate-800/50 border-b border-amber-500/20 rounded-none h-auto min-h-0 justify-start [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-amber-500/30">
            <TabsTrigger value="cast" className="shrink-0 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:font-semibold data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 rounded-t-lg rounded-b-none px-4 py-2.5 text-sm font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 transition-all border border-transparent data-[state=inactive]:border-slate-600/50">Cast Reading</TabsTrigger>
            <TabsTrigger value="ask-the-seer" className="shrink-0 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:font-semibold data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 rounded-t-lg rounded-b-none px-4 py-2.5 text-sm font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 transition-all border border-transparent data-[state=inactive]:border-slate-600/50 flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Ask the Seer
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cast" className="pt-6 px-4 sm:px-6 pb-6 mt-0">
          {showPendulumViral && !viralUnlock.hydrated ? (
            <div className="py-12 text-center text-slate-400">Loading report…</div>
          ) : (
            <div className="relative min-h-[320px]">
              {pendulumLocked && (
                <ViralLockOverlay
                  onUnlockClick={handleShareToUnlock}
                  onContinueWithoutSharing={waitingLite ? () => {} : continueWithoutSharing}
                  continueDisabled={waitingLite}
                />
              )}
              <div
                className={cn(
                  pendulumLocked &&
                    "pointer-events-none select-none blur-sm filter transition-[filter] duration-300 [&_*]:pointer-events-none"
                )}
              >
        {/* Question Input Form */}
        {!analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto mb-8"
          >
            <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold text-amber-900 mb-6 text-center">Ask Your Pendulum Question</h2>
                <p className="text-slate-700 text-center mb-8">
                  The pendulum connects you to your higher self and subconscious mind, providing clear yes/no/maybe answers to your questions.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Question Input */}
                  <div className="md:col-span-2">
                    <label className="block text-slate-700 font-semibold mb-3">
                      <span className="mr-2">❓</span>
                      Your Question
                    </label>
                    <textarea
                      placeholder="Ask a specific yes/no question... (e.g., 'Is it in my best interest to accept this job offer?')"
                      value={question || ""}
                      onChange={(e) => setQuestion(e.target.value)}
                      className="w-full bg-white border-2 border-amber-300 rounded-2xl p-4 text-slate-800 placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-all duration-300 h-32 resize-none"
                    />
                    <p className="text-slate-600 text-sm mt-2">
                      Be specific and clear. Phrase questions to be answered with yes or no. Avoid using "should" or "supposed to."
                    </p>
                  </div>

                  {/* Pendulum Type - Optional */}
                  <div>
                    <label className="block text-slate-700 font-semibold mb-3">
                      <span className="mr-2">🌀</span>
                      Pendulum Type (Optional)
                    </label>
                    <select
                      value={pendulumType || ""}
                      onChange={(e) => setPendulumType(e.target.value)}
                      className="w-full bg-white border-2 border-amber-300 rounded-2xl p-4 text-slate-800 focus:outline-none focus:border-amber-400 transition-all duration-300 [&>option]:bg-white [&>option]:text-slate-900"
                    >
                      <option value="">Select Pendulum (Optional)</option>
                      <option value="crystal">Crystal Pendulum</option>
                      <option value="metal">Metal Pendulum</option>
                      <option value="wood">Wooden Pendulum</option>
                      <option value="stone">Stone Pendulum</option>
                    </select>
                    <p className="text-slate-600 text-sm mt-2">
                      Choose your pendulum type or leave blank for general reading
                    </p>
                  </div>

                  {/* Placeholder for future: Time/Place */}
                  <div className="opacity-60">
                    <label className="block text-slate-600 font-semibold mb-3">
                      <span className="mr-2">⏰</span>
                      Question Time (Auto-detected)
                    </label>
                    <input
                      type="text"
                      value="Current Time"
                      disabled
                      className="w-full bg-slate-100 border-2 border-amber-200 rounded-2xl p-4 text-slate-500 cursor-not-allowed"
                    />
                  </div>

                  {/* Generate Button */}
                  <div className="md:col-span-2 text-center">
                    <motion.button
                      onClick={performPendulumReading}
                      disabled={isLoading || !(question ?? '').trim()}
                      className="bg-gradient-to-r from-amber-600 to-yellow-600 text-white px-8 py-3 rounded-2xl font-semibold hover:from-amber-500 hover:to-yellow-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-amber-500 flex items-center justify-center gap-2 mx-auto"
                      whileHover={{}}
                      whileTap={{ scale: isLoading ? 1 : 0.95 }}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Consulting Pendulum...
                        </>
                      ) : (
                        <>
                          <span>🌀</span>
                          Cast Pendulum Reading
                        </>
                      )}
                    </motion.button>
                    <p className="text-slate-600 text-sm mt-2">
                      Click to receive your pendulum answer
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 max-w-4xl mx-auto"
          >
            <Alert variant="destructive" className="bg-red-50 border-2 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-900">{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Loading State */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-md mx-auto py-16"
          >
            <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md p-12 text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="text-6xl mb-6"
              >
                🌀
              </motion.div>
              <h3 className="text-2xl font-bold text-amber-900 mb-2">Consulting the Pendulum</h3>
              <p className="text-slate-700">Connecting to your higher self...</p>
            </Card>
          </motion.div>
        )}

        {/* Results Section */}
        {analysis && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-6xl mx-auto"
          >
            <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md">
              <CardContent className="p-6">
                {/* Action Buttons */}
                <div className="flex justify-end gap-4 mb-6">
                  <motion.button
                    onClick={resetData}
                    className="flex items-center gap-2 bg-white border-2 border-amber-300 text-slate-800 py-2 px-4 rounded-2xl font-semibold hover:bg-amber-50 transition-all duration-300"
                    whileHover={{}}
                    whileTap={{ scale: 0.95 }}
                  >
                    Ask New Question
                  </motion.button>
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {["overview", "answer", "interpretation", "guidance"].map((tab) => (
                    <motion.button
                      key={tab}
                      whileHover={{}}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 rounded-2xl font-medium transition-all duration-300 ${
                        activeTab === tab
                          ? "bg-gradient-to-r from-amber-600 to-yellow-600 text-white border-2 border-amber-500"
                          : "bg-white text-slate-700 hover:bg-amber-100/50 border-2 border-amber-200"
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </motion.button>
                  ))}
                </div>

                {/* Content */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <PendulumCoachInterface 
                      analysis={analysis}
                      activeTab={activeTab}
                      question={question}
                      pendulumType={pendulumType}
                    />
                  </motion.div>
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Info Section - Only show when no analysis */}
        {!analysis && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="max-w-4xl mx-auto mt-8"
          >
            <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-amber-900 mb-4 text-center">How to Use Your Pendulum</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-700">
                  <div>
                    <h4 className="text-amber-800 font-semibold mb-2">Clear Your Mind</h4>
                    <p className="text-sm">Free yourself from distractions and focus on your question.</p>
                  </div>
                  <div>
                    <h4 className="text-amber-800 font-semibold mb-2">Be Specific</h4>
                    <p className="text-sm">Phrase questions clearly to get accurate yes/no/maybe answers.</p>
                  </div>
                  <div>
                    <h4 className="text-amber-800 font-semibold mb-2">Trust the Answer</h4>
                    <p className="text-sm">The pendulum connects to your higher self for guidance.</p>
                  </div>
                  <div>
                    <h4 className="text-amber-800 font-semibold mb-2">Stay Open</h4>
                    <p className="text-sm">Remain neutral about the outcome to receive unbiased answers.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
              </div>
            </div>
          )}
          </TabsContent>

          <TabsContent value="ask-the-seer" className="pt-6 px-4 sm:px-6 pb-6 mt-0">
            <Card className="border-2 border-amber-300 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 shadow-lg rounded-3xl h-[600px] overflow-hidden">
              <div className="h-full bg-gradient-to-b from-transparent to-white/30 p-4">
                <PendulumSeerChatInterface
                  userId={user?.uid || ""}
                  userProfile={userProfile}
                  pendulumAnalysis={analysis}
                  sessionId={`pendulum_${user?.uid ?? 'session'}`}
                />
              </div>
            </Card>
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </div>
  )
} 