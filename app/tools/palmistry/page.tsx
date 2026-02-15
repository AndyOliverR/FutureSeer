"use client"

import { useState, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { usePalmistry } from "@/hooks/use-palmistry"
import { useAuth } from "@/hooks/use-auth"
import { ToolIntroductionTab } from "@/components/ToolIntroductionTab"
import { PalmistryRemedies } from "@/components/palmistry/PalmistryRemedies"
import { PalmistryDashboardHero } from "@/components/palmistry/PalmistryDashboardHero"
import { LineAnalysisCard } from "@/components/palmistry/LineAnalysisCard"
import { MountDashboard } from "@/components/palmistry/MountDashboard"
import { FingerAnalysisCard } from "@/components/palmistry/FingerAnalysisCard"
import PalmistrySeerChatInterface from "@/components/palmistry/PalmistrySeerChatInterface"
import { DashboardSection } from "@/components/western/DashboardSection"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Activity, Star, Hand, Brain, Heart, Clock, Sparkles } from "lucide-react"

export default function PalmistryPage() {
  const { user, userProfile } = useAuth()
  const {
    analysis,
    isLoading,
    error
  } = usePalmistry()

  const [activeTab, setActiveTab] = useState<'introduction' | 'palmistry-analysis' | 'timing-guidance' | 'remedies' | 'ask-the-seer'>('introduction')

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value as typeof activeTab)
  }, [])

  const handleNavigateToTab = useCallback((tab: string) => {
    setActiveTab(tab as typeof activeTab)
  }, [])

  // Memoize analysis data to prevent unnecessary re-renders
  const analysisData = useMemo(() => analysis, [analysis])

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

          {/* Introduction Tab */}
          <AnimatePresence mode="wait">
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
          </AnimatePresence>

          {/* Palmistry Analysis Tab */}
          <AnimatePresence mode="wait">
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
                          whileHover={{ scale: 1.05 }}
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
                        whileHover={{ scale: 1.05 }}
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
          </AnimatePresence>

          {/* Timing & Guidance Tab */}
          <AnimatePresence mode="wait">
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
                                    "{affirmation}"
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
          </AnimatePresence>

          {/* Remedies Tab */}
          <AnimatePresence mode="wait">
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
          </AnimatePresence>

          {/* Ask the Seer Tab */}
          <AnimatePresence mode="wait">
            <TabsContent key="ask-the-seer" value="ask-the-seer" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
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
                      userId={user?.uid || ''}
                      userProfile={userProfile}
                      palmistryAnalysis={analysisData || undefined}
                    />
                  </div>
                </Card>
              </motion.div>
            </TabsContent>
          </AnimatePresence>
        </Tabs>
        </div>
      </div>
    </motion.div>
  )
}
