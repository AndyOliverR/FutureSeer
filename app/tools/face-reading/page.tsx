"use client"

import { useState, useMemo, useCallback } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Users } from "lucide-react"
import { FaceReadingCoachInterface } from "@/components/FaceReadingCoachInterface"
import { useFaceReading } from "@/hooks/use-face-reading"
import { useToolReport } from "@/hooks/useComprehensiveMysticalProfile"
import { useAuth } from "@/hooks/use-auth"
import { useToolReportUnlock } from "@/hooks/useToolReportUnlock"
import { useViralReportBypass } from "@/hooks/useViralReportBypass"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { TeaserView } from "@/components/report-viral/TeaserView"
import { ShareCard } from "@/components/report-viral/ShareCard"
import { ViralLockOverlay } from "@/components/report-viral/LockedReportView"
import { buildToolTeaser } from "@/lib/report-viral/buildToolTeaser"
import { toolPathForSlug } from "@/lib/report-viral/toolSlugToPath"
import { cn } from "@/lib/utils"
import type { FaceReadingAnalysis } from "@/lib/faceReadingIntelligence"

export default function FaceReadingPage() {
  const { userProfile } = useAuth()
  const { report: pipelineReport, loading: pipelineLoading, error: profileError, hasReport: hasStoredReport } = useToolReport('faceReading')
  const {
    faceData,
    analysis: liveAnalysis,
    isLoading: isLiveLoading,
    error: liveError,
    setFaceData,
    performFaceReading,
    resetData
  } = useFaceReading()

  // Prefer stored report from mystical profile when available and not a placeholder
  const storedAnalysis = useMemo(() => {
    if (!pipelineReport || typeof pipelineReport !== 'object' || (pipelineReport as { placeholder?: boolean }).placeholder) return null
    const raw = (pipelineReport as { analysis?: FaceReadingAnalysis; faceReadingContext?: FaceReadingAnalysis }).analysis
      ?? (pipelineReport as { analysis?: FaceReadingAnalysis; faceReadingContext?: FaceReadingAnalysis }).faceReadingContext
    return raw && typeof raw === 'object' && 'faceShape' in raw ? (raw as FaceReadingAnalysis) : null
  }, [pipelineReport])

  const effectiveAnalysis = storedAnalysis ?? liveAnalysis
  const isLoading = pipelineLoading || isLiveLoading
  const error = liveError ?? null

  const viralUnlock = useToolReportUnlock("faceReading")
  const bypassViral = useViralReportBypass()
  const [showShareCard, setShowShareCard] = useState(false)
  const [waitingLite, setWaitingLite] = useState(false)

  const showFaceViral = Boolean(effectiveAnalysis) && !bypassViral
  const faceTeaser = useMemo(
    () => buildToolTeaser("faceReading", effectiveAnalysis),
    [effectiveAnalysis]
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
          text: `${faceTeaser.archetypeName}: ${faceTeaser.hookLine.slice(0, 120)}…`,
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
  }, [copyLink, viralUnlock, faceTeaser.archetypeName, faceTeaser.hookLine])

  const continueWithoutSharing = useCallback(() => {
    setWaitingLite(true)
    window.setTimeout(() => {
      viralUnlock.unlockLite()
      setWaitingLite(false)
    }, 4000)
  }, [viralUnlock])

  const faceCompareHref = useMemo(
    () => `/tools/${toolPathForSlug("faceReading")}?friend=compare&ref=share`,
    []
  )

  const faceLocked =
    showFaceViral && viralUnlock.hydrated && !viralUnlock.isUnlocked && !bypassViral

  const [activeTab, setActiveTab] = useState("overview")
  const [readingMethod, setReadingMethod] = useState<'modern' | 'chinese'>('modern')

  // Check for reduced motion preference
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  return (
    <div className="min-h-screen p-4 starfield-ultra-sharp">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 pt-4"
        >
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-semibold mb-6">
            <span className="text-yellow-400">👁️</span>{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600">Face Reading</span>
          </h1>
          <p className="text-slate-200 leading-relaxed text-lg mb-4">
            Ancient physiognomy revealing personality through facial features
          </p>
          {/* Inspirational Quote */}
          <Card 
            elevation={2} 
            className="bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 border-2 border-purple-200 shadow-lg m3-elevation-transition rounded-2xl max-w-2xl mx-auto"
          >
            <CardContent className="p-6">
              <p className="text-xl italic text-purple-900 font-serif mb-2">
                {'\u201cThe face is the mirror of the soul, and every feature tells the story of character written by the hand of destiny.\u201d'}
              </p>
              <p className="text-slate-700 text-sm">— Aristotle</p>
            </CardContent>
          </Card>
        </motion.div>

        {showFaceViral && !bypassViral && (
          <div className="max-w-5xl mx-auto mb-6 space-y-4">
            <TeaserView teaser={faceTeaser} />
            {showShareCard && (
              <ShareCard
                archetypeName={faceTeaser.archetypeName}
                hookLine={faceTeaser.hookLine}
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

        {showFaceViral && viralUnlock.isUnlocked && !bypassViral && (
          <div className="max-w-5xl mx-auto mb-4 flex justify-center">
            <Link
              href={faceCompareHref}
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
            <Card 
              elevation={1} 
              className="bg-amber-50/80 border-2 border-amber-300 shadow-md m3-elevation-transition rounded-3xl"
            >
              <CardContent className="p-6">
                <h2 className="text-2xl text-amber-900 font-semibold mb-6 text-center">Facial Wisdom</h2>
              
              {/* Profile Image Display */}
              {userProfile?.facePhotoUrl && (
                <div className="mb-6 text-center">
                  <div className="relative inline-block">
                    {/* eslint-disable-next-line @next/next/no-img-element -- profile photo URL from Firebase */}
                    <img
                      src={userProfile.facePhotoUrl}
                      alt="Your face photo"
                      className="w-32 h-32 rounded-full mx-auto mb-3 object-cover border-2 border-pink-400/50"
                    />
                    <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1">
                      <span className="text-xs">✓</span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600">
                    Analyzing from your profile photo
                  </p>
                  {effectiveAnalysis && (
                    <p className="text-xs text-green-600 mt-1">
                      ✓ Analysis complete
                    </p>
                  )}
                </div>
              )}

              {/* Reading Method Selector */}
              <div className="mb-6">
                <h3 className="text-lg text-amber-900 mb-4 flex items-center">
                  <span className="mr-2">🎯</span>
                  Reading Method
                </h3>
                <div className="flex gap-2 mb-4">
                  <motion.button
                    whileHover={{}}
                    whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
                    onClick={() => setReadingMethod('modern')}
                    className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all duration-300 cursor-pointer ${
                      readingMethod === 'modern'
                        ? "bg-gradient-to-br from-amber-100 to-yellow-100 text-amber-900 shadow-md hover:shadow-lg active:shadow-sm"
                        : "bg-white border-2 border-amber-200 text-slate-700 hover:bg-amber-50 hover:border-amber-300"
                    }`}
                  >
                    Modern Physiognomy
                  </motion.button>
                  <motion.button
                    whileHover={{}}
                    whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
                    onClick={() => setReadingMethod('chinese')}
                    className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all duration-300 cursor-pointer ${
                      readingMethod === 'chinese'
                        ? "bg-gradient-to-br from-amber-100 to-yellow-100 text-amber-900 shadow-md hover:shadow-lg active:shadow-sm"
                        : "bg-white border-2 border-amber-200 text-slate-700 hover:bg-amber-50 hover:border-amber-300"
                    }`}
                  >
                    Traditional Chinese
                  </motion.button>
                </div>
                <div className="p-3 bg-amber-100/50 border-2 border-amber-200 rounded-lg">
                  <p className="text-sm text-slate-700">
                    {readingMethod === 'modern' 
                      ? "Modern physiognomy analyzes facial features using Western psychological principles and character analysis."
                      : "Traditional Chinese face reading (面相学) uses ancient principles to determine health, destiny, and personality through facial features and bone structure."}
                  </p>
                </div>
              </div>

              {/* Face Features */}
              <div className="mb-6">
                <h3 className="text-lg text-amber-900 mb-4 flex items-center">
                  <span className="mr-2">👁️</span>
                  Facial Features
                  {userProfile?.facePhotoUrl && (
                    <span className="ml-2 text-xs text-slate-500">(Optional - using profile photo)</span>
                  )}
                </h3>
                {userProfile?.facePhotoUrl && (
                  <p className="text-xs text-slate-500 mb-3">
                    Manual input is optional when profile photo is available
                  </p>
                )}
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Eye Shape"
                    value={faceData.eyeShape || ""}
                    onChange={(e) => setFaceData({ ...faceData, eyeShape: e.target.value })}
                    className="w-full bg-white border-2 border-amber-200 rounded-xl p-3 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-amber-400 transition-all duration-300"
                  />
                  <input
                    type="text"
                    placeholder="Nose Type"
                    value={faceData.noseType || ""}
                    onChange={(e) => setFaceData({ ...faceData, noseType: e.target.value })}
                    className="w-full bg-white border-2 border-amber-200 rounded-xl p-3 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-amber-400 transition-all duration-300"
                  />
                  <input
                    type="text"
                    placeholder="Mouth Shape"
                    value={faceData.mouthShape || ""}
                    onChange={(e) => setFaceData({ ...faceData, mouthShape: e.target.value })}
                    className="w-full bg-white border-2 border-amber-200 rounded-xl p-3 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-amber-400 transition-all duration-300"
                  />
                  <input
                    type="text"
                    placeholder="Forehead Type"
                    value={faceData.foreheadType || ""}
                    onChange={(e) => setFaceData({ ...faceData, foreheadType: e.target.value })}
                    className="w-full bg-white border-2 border-amber-200 rounded-xl p-3 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-amber-400 transition-all duration-300"
                  />
                </div>
              </div>

              {/* Analysis Focus */}
              <div className="mb-6">
                <h3 className="text-lg text-amber-900 mb-4 flex items-center">
                  <span className="mr-2">🎯</span>
                  Analysis Focus
                </h3>
                <select
                  value={faceData.analysisFocus || ""}
                  onChange={(e) => setFaceData({ ...faceData, analysisFocus: e.target.value })}
                  className="w-full bg-white border-2 border-amber-200 rounded-xl p-3 text-slate-700 focus:outline-none focus:border-amber-400 transition-all duration-300 [&>option]:bg-white [&>option]:text-slate-900"
                >
                  <option value="" className="bg-white text-slate-700">Select Focus</option>
                  <option value="personality" className="bg-white text-slate-700">Personality Traits</option>
                  <option value="character" className="bg-white text-slate-700">Character Analysis</option>
                  <option value="destiny" className="bg-white text-slate-700">Life Destiny</option>
                  <option value="relationships" className="bg-white text-slate-700">Relationship Patterns</option>
                  <option value="career" className="bg-white text-slate-700">Career Aptitude</option>
                  <option value="comprehensive" className="bg-white text-slate-700">Comprehensive Reading</option>
                </select>
              </div>

              {/* Instructions */}
              <div className="mb-8 p-4 rounded-xl bg-gradient-to-r from-amber-100/50 to-yellow-100/50 border-2 border-amber-200">
                <h4 className="text-amber-900 font-semibold mb-2 flex items-center">
                  <span className="mr-2">💡</span>
                  Face Reading Insights
                </h4>
                <ul className="space-y-1 text-sm text-slate-700">
                  <li>• Ancient physiognomy</li>
                  <li>• Character analysis</li>
                  <li>• Personality traits</li>
                  <li>• Life destiny</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <motion.button
                  whileHover={{}}
                  whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
                  onClick={() => performFaceReading(userProfile?.facePhotoUrl)}
                  disabled={isLoading || (!userProfile?.facePhotoUrl && (!faceData.eyeShape || !faceData.noseType || !faceData.mouthShape || !faceData.foreheadType || !faceData.analysisFocus))}
                  className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-xl p-4 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-2xl hover:shadow-amber-500/50 active:shadow-lg active:shadow-amber-500/30 cursor-pointer transition-all duration-300"
                >
                  {isLoading ? "👁️ Reading..." : userProfile?.facePhotoUrl ? "👁️ Re-analyze Your Face" : "👁️ Read Your Face"}
                </motion.button>
                
                <motion.button
                  whileHover={{}}
                  whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                  onClick={resetData}
                  className="w-full bg-white border-2 border-amber-200 text-slate-700 rounded-xl p-4 font-semibold hover:bg-amber-50 hover:border-amber-300 transition-all duration-300"
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
            <Card 
              elevation={1} 
              className="bg-blue-50/80 border-2 border-blue-300 shadow-md m3-elevation-transition rounded-3xl"
            >
              <CardContent className="p-6">
                <div className="rounded-2xl border border-amber-500/30 bg-slate-900/80 overflow-hidden">
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value)} className="w-full min-w-0">
                  <TabsList className="flex w-full flex-nowrap overflow-x-auto gap-1 sm:gap-2 p-2 sm:p-3 bg-slate-800/50 border-b border-amber-500/20 rounded-none h-auto min-h-0 justify-start [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-amber-500/30">
                    {["overview", "features", "personality", "character", "destiny", "ask-the-seer"].map((tab) => (
                      <TabsTrigger
                        key={tab}
                        value={tab}
                        className="shrink-0 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 rounded-t-lg rounded-b-none px-4 py-2.5 text-sm font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 border border-transparent data-[state=inactive]:border-slate-600/50 transition-all flex items-center justify-center"
                      >
                        {tab === 'ask-the-seer' ? 'Ask the Seer' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {/* Content */}
                  <div className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
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
                      👁️
                    </motion.div>
                    <p className="text-slate-700 text-lg">Reading the wisdom written in your features...</p>
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
                    <p className="text-red-600 text-lg mb-2">Reading Error</p>
                    <p className="text-slate-700">{error}</p>
                  </motion.div>
                ) : effectiveAnalysis ? (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {activeTab === "ask-the-seer" ? (
                      <FaceReadingCoachInterface 
                        analysis={effectiveAnalysis}
                        activeTab={activeTab}
                        faceData={faceData}
                        readingMethod={readingMethod}
                      />
                    ) : showFaceViral && !viralUnlock.hydrated ? (
                      <div className="text-center py-12 text-slate-400">Loading report…</div>
                    ) : (
                      <div className={cn(showFaceViral && "relative min-h-[240px]")}>
                        {showFaceViral && faceLocked && (
                          <ViralLockOverlay
                            onUnlockClick={handleShareToUnlock}
                            onContinueWithoutSharing={waitingLite ? () => {} : continueWithoutSharing}
                            continueDisabled={waitingLite}
                          />
                        )}
                        <div
                          className={cn(
                            showFaceViral &&
                              faceLocked &&
                              "pointer-events-none select-none blur-sm filter transition-[filter] duration-300 [&_*]:pointer-events-none"
                          )}
                        >
                          <FaceReadingCoachInterface 
                            analysis={effectiveAnalysis}
                            activeTab={activeTab}
                            faceData={faceData}
                            readingMethod={readingMethod}
                          />
                        </div>
                      </div>
                    )}
                  </motion.div>
                ) : profileError && !hasStoredReport ? (
                  <motion.div
                    key="profile-cta"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-16"
                  >
                    <p className="text-slate-700 mb-4">Generate your mystical profile to see your face reading here.</p>
                    <Button asChild className="bg-amber-500 hover:bg-amber-600 text-white">
                      <Link href="/profile">Generate my mystical profile</Link>
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-16"
                  >
                    <div className="text-6xl mb-6">👁️</div>
                    <h3 className="text-2xl text-blue-900 font-semibold mb-4">Ready to Read Your Face?</h3>
                    <p className="text-slate-700 leading-relaxed">
                      Upload a face photo in your profile and generate your mystical profile, or enter your facial features above to discover the character and destiny written in the wisdom of physiognomy.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
                  </div>
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
        >
          <Card 
            elevation={2} 
            className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 shadow-lg m3-elevation-transition rounded-3xl mt-12"
          >
            <CardContent className="p-8">
              <h3 className="text-2xl text-amber-900 font-semibold mb-6 text-center">✨ Face Reading Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-3">👁️</div>
              <h4 className="text-slate-700 font-semibold mb-2">Eye Reading</h4>
              <p className="text-slate-600 text-sm">Window to the soul</p>
              </div>
            <div className="text-center">
              <div className="text-3xl mb-3">👃</div>
              <h4 className="text-slate-700 font-semibold mb-2">Nose Analysis</h4>
              <p className="text-slate-600 text-sm">Character traits</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">👄</div>
              <h4 className="text-slate-700 font-semibold mb-2">Mouth Reading</h4>
              <p className="text-slate-600 text-sm">Communication style</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">🧠</div>
              <h4 className="text-slate-700 font-semibold mb-2">Forehead Wisdom</h4>
              <p className="text-slate-600 text-sm">Intellectual capacity</p>
            </div>
          </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
} 