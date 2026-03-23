"use client"

import { useState, useMemo, useCallback } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { GeomancyCoachInterface } from "@/components/GeomancyCoachInterface"
import GeomancySeerChatInterface from "@/components/GeomancySeerChatInterface"
import { useGeomancy } from "@/hooks/useGeomancy"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent } from "@/components/ui/card"
import { Users } from "lucide-react"
import { useToolReportUnlock } from "@/hooks/useToolReportUnlock"
import { useViralReportBypass } from "@/hooks/useViralReportBypass"
import { TeaserView } from "@/components/report-viral/TeaserView"
import { ShareCard } from "@/components/report-viral/ShareCard"
import { ViralLockOverlay } from "@/components/report-viral/LockedReportView"
import { buildToolTeaser } from "@/lib/report-viral/buildToolTeaser"
import { toolPathForSlug } from "@/lib/report-viral/toolSlugToPath"
import { cn } from "@/lib/utils"

export default function GeomancyPage() {
  const { user, userProfile } = useAuth()
  const {
    question,
    analysis,
    isLoading,
    error,
    setQuestion,
    performGeomancyAnalysis,
    resetData
  } = useGeomancy()

  const viralUnlock = useToolReportUnlock("geomancy")
  const bypassViral = useViralReportBypass()
  const [showShareCard, setShowShareCard] = useState(false)
  const [waitingLite, setWaitingLite] = useState(false)

  const showGeomancyViral = Boolean(analysis) && !bypassViral
  const geomancyTeaser = useMemo(() => buildToolTeaser("geomancy", analysis), [analysis])

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
          text: `${geomancyTeaser.archetypeName}: ${geomancyTeaser.hookLine.slice(0, 120)}…`,
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
  }, [copyLink, viralUnlock, geomancyTeaser.archetypeName, geomancyTeaser.hookLine])

  const continueWithoutSharing = useCallback(() => {
    setWaitingLite(true)
    window.setTimeout(() => {
      viralUnlock.unlockLite()
      setWaitingLite(false)
    }, 4000)
  }, [viralUnlock])

  const geomancyCompareHref = useMemo(
    () => `/tools/${toolPathForSlug("geomancy")}?friend=compare&ref=share`,
    []
  )

  const geomancyLocked =
    showGeomancyViral && viralUnlock.hydrated && !viralUnlock.isUnlocked && !bypassViral

  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="relative min-h-screen overflow-hidden starfield-ultra-sharp">
      <div className="relative z-10 p-4">
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 pt-4"
        >
          <h1 className="text-5xl font-bold gold-glow mb-4">🌍 Geomancy</h1>
          <p className="text-slate-200 leading-relaxed text-lg mb-4">
            Medieval earth divination through sacred geometry and elemental wisdom
          </p>
          {/* Inspirational Quote */}
          <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 shadow-lg rounded-2xl max-w-2xl mx-auto m3-elevation-2">
            <CardContent className="p-6">
              <p className="text-xl italic text-amber-900 font-serif mb-2">
                "The earth speaks in patterns, and those who listen to her sacred geometry find answers in the soil of wisdom."
              </p>
              <p className="text-slate-600 text-sm">— Medieval Geomantic Tradition</p>
            </CardContent>
          </Card>
        </motion.div>

        {showGeomancyViral && !bypassViral && (
          <div className="mb-6 space-y-4">
            <TeaserView teaser={geomancyTeaser} />
            {showShareCard && (
              <ShareCard
                archetypeName={geomancyTeaser.archetypeName}
                hookLine={geomancyTeaser.hookLine}
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

        {showGeomancyViral && viralUnlock.isUnlocked && !bypassViral && (
          <div className="mb-4 flex justify-center">
            <Link
              href={geomancyCompareHref}
              className="inline-flex items-center gap-2 rounded-full border border-violet-500/40 bg-violet-950/40 px-4 py-2 text-sm font-medium text-violet-100 hover:bg-violet-900/50"
            >
              <Users className="h-4 w-4" />
              Compare with a friend
            </Link>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Section */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-1"
          >
            <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 shadow-lg rounded-2xl">
              <CardContent className="p-6">
                <h2 className="text-2xl text-amber-900 mb-6 text-center font-bold">Earth Divination</h2>
                
                {/* Question Input */}
                <div className="mb-6">
                  <h3 className="text-lg text-amber-900 mb-4 flex items-center font-semibold">
                    <span className="mr-2">❓</span>
                    Your Question
                  </h3>
                  <textarea
                    placeholder="Ask the earth for guidance on any matter..."
                    value={question || ""}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="w-full bg-white border-2 border-amber-200 rounded-xl p-3 text-slate-700 placeholder-slate-400 focus:outline-none focus:border-amber-400 transition-all duration-300 h-32 resize-none"
                  />
                </div>

                {/* Instructions */}
                <div className="mb-8 p-4 rounded-xl bg-gradient-to-r from-amber-100 to-yellow-100 border-2 border-amber-300">
                  <h4 className="text-amber-900 font-semibold mb-2 flex items-center">
                    <span className="mr-2">💡</span>
                    Geomantic Insights
                  </h4>
                  <ul className="space-y-1 text-sm text-slate-700">
                    <li>• Sacred geometry patterns</li>
                    <li>• Elemental wisdom</li>
                    <li>• Earth-based divination</li>
                    <li>• Medieval traditions</li>
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="space-y-4">
                  <motion.button
                    whileHover={{}}
                    whileTap={{ scale: 0.98 }}
                    onClick={performGeomancyAnalysis}
                    disabled={isLoading || !question.trim()}
                    className="w-full bg-gradient-to-r from-blue-700 via-blue-600 to-amber-500 hover:from-blue-600 hover:via-blue-500 hover:to-amber-400 text-white rounded-xl p-4 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl hover:shadow-amber-500/50 transition-all duration-300"
                  >
                    {isLoading ? "🌍 Consulting..." : "🌍 Consult the Earth"}
                  </motion.button>
                  
                  <motion.button
                    whileHover={{}}
                    whileTap={{ scale: 0.98 }}
                    onClick={resetData}
                    className="w-full bg-white border-2 border-amber-400 text-amber-700 hover:text-amber-900 hover:border-amber-500 rounded-xl p-4 font-semibold hover:bg-amber-50 transition-all duration-300"
                  >
                    🔄 Reset
                  </motion.button>
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
            <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 shadow-lg rounded-2xl">
              <CardContent className="p-6">
                {/* Tabs */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {["overview", "figures", "houses", "interpretation", "timing", "advice", "ask-the-seer"].map((tab) => (
                    <motion.button
                      key={tab}
                      whileHover={{}}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                        activeTab === tab
                          ? "bg-gradient-to-br from-amber-100 to-yellow-100 text-amber-900 shadow-md m3-elevation-1"
                          : "bg-white border border-amber-200 text-slate-600 hover:bg-amber-50 hover:text-amber-900"
                      }`}
                    >
                      {tab === "ask-the-seer" ? "Ask the Seer" : tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </motion.button>
                  ))}
                </div>

                {/* Content */}
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
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="text-4xl mb-4"
                      >
                        🌍
                      </motion.div>
                      <p className="text-slate-700 text-lg">Consulting the earth's wisdom...</p>
                    </motion.div>
                  ) : error ? (
                    <motion.div
                      key="error"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center py-16"
                    >
                      <div className="text-4xl mb-4">⚠️</div>
                      <p className="text-red-600 text-lg mb-2">Divination Error</p>
                      <p className="text-slate-700">{error}</p>
                    </motion.div>
                  ) : analysis ? (
                    <motion.div
                      key="results"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {activeTab === "ask-the-seer" ? (
                        user ? (
                          <GeomancySeerChatInterface
                            userId={user.uid}
                            userProfile={userProfile}
                            geomancyAnalysis={analysis}
                          />
                        ) : (
                          <div className="text-center py-8 text-slate-700">Please sign in to use Ask the Seer.</div>
                        )
                      ) : showGeomancyViral && !viralUnlock.hydrated ? (
                        <div className="py-12 text-center text-slate-500">Loading report…</div>
                      ) : (
                        <div className="relative min-h-[200px]">
                          {geomancyLocked && (
                            <ViralLockOverlay
                              onUnlockClick={handleShareToUnlock}
                              onContinueWithoutSharing={waitingLite ? () => {} : continueWithoutSharing}
                              continueDisabled={waitingLite}
                            />
                          )}
                          <div
                            className={cn(
                              geomancyLocked &&
                                "pointer-events-none select-none blur-sm filter transition-[filter] duration-300 [&_*]:pointer-events-none"
                            )}
                          >
                            <GeomancyCoachInterface
                              analysis={analysis}
                              activeTab={activeTab}
                              question={question}
                            />
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center py-16"
                    >
                      <div className="text-6xl mb-6">🌍</div>
                      <h3 className="text-2xl text-amber-900 mb-4 font-bold">Ready for Earth Divination?</h3>
                      <p className="text-slate-700 leading-relaxed">
                        Ask your question above to receive guidance through the ancient 
                        art of geomantic divination and sacred geometry.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
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
          <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 shadow-lg rounded-2xl">
            <CardContent className="p-8">
              <h3 className="text-2xl text-amber-900 mb-6 text-center font-bold">✨ Geomancy Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl mb-3">🔺</div>
                  <h4 className="text-amber-900 font-semibold mb-2">Sacred Geometry</h4>
                  <p className="text-slate-700 text-sm">Ancient geometric patterns reveal hidden truths</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-3">🌍</div>
                  <h4 className="text-amber-900 font-semibold mb-2">Earth Wisdom</h4>
                  <p className="text-slate-700 text-sm">Connect with elemental forces and natural cycles</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-3">⚡</div>
                  <h4 className="text-amber-900 font-semibold mb-2">Quick Answers</h4>
                  <p className="text-slate-700 text-sm">Rapid divination for immediate guidance</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-3">🏰</div>
                  <h4 className="text-amber-900 font-semibold mb-2">Medieval Tradition</h4>
                  <p className="text-slate-700 text-sm">Ancient European divination practice</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        </div>
      </div>
    </div>
  )
} 