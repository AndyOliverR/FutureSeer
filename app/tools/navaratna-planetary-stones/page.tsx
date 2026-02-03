"use client"

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ToolIntroductionTab } from '@/components/ToolIntroductionTab'
import { BackButton } from '@/components/navigation/BackButton'
import { isProfileComplete, getProfileCompletionStatus } from '@/lib/firebase'
import { NavaratnaAnalysis as NavaratnaAnalysisType } from '@/lib/navaratnaIntelligence'
import { NavaratnaAnalysis } from '@/components/navaratna/NavaratnaAnalysis'
import NavaratnaSeerChatInterface from '@/components/navaratna/NavaratnaSeerChatInterface'
import { 
  Gem, 
  AlertTriangle,
  Info,
  User,
  Loader2,
  BookOpen,
  Sparkles,
  Shield,
  Clock,
  TrendingUp,
  CheckCircle,
  XCircle
} from 'lucide-react'

export default function NavaratnaPage() {
  const { user, userProfile } = useAuth()
  const router = useRouter()
  const [analysis, setAnalysis] = useState<NavaratnaAnalysisType | null>(null)
  const [isLoading, setIsLoading] = useState(true) // Start with true for auto-generation
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'introduction' | 'analysis' | 'recommendations' | 'ask-seer'>('introduction')
  const [bodyWeightKg, setBodyWeightKg] = useState<number | undefined>(undefined)

  const hasCompleteProfile = userProfile ? isProfileComplete(userProfile) : false
  const profileStatus = userProfile ? getProfileCompletionStatus(userProfile) : { isComplete: false, missingFields: [], completionPercentage: 0 }

  // Check for reduced motion preference
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  // Material 3 motion configuration
  const motionConfig = useMemo(() => {
    if (prefersReducedMotion) return { duration: 0 }
    return { duration: 0.3, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }
  }, [prefersReducedMotion])

  // Load Navaratna Analysis
  const loadNavaratnaAnalysis = async () => {
    if (!user?.uid) {
      setError('Please sign in to use Navaratna & Planetary Stones')
      return
    }

    if (!hasCompleteProfile) {
      setError('Please complete your profile with birth date, time, and place')
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      console.log('💎 Starting Navaratna analysis...', {
        userId: user.uid,
        hasProfile: !!userProfile,
        bodyWeightKg
      })

      const response = await fetch('/api/tools/navaratna-planetary-stones/analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user.uid,
          userProfile: userProfile,
          bodyWeightKg: bodyWeightKg
        })
      })

      console.log('📡 API Response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('❌ API Error:', errorData)
        throw new Error(errorData.error || `Failed to generate analysis (${response.status})`)
      }

      const result = await response.json()
      console.log('✅ API Response:', { success: result.success, hasData: !!result.data })

      if (result.success && result.data) {
        console.log('💎 Setting analysis data:', {
          hasLifeStone: !!result.data.recommendations.lifeStone,
          beneficStonesCount: result.data.recommendations.beneficStones.length,
          lagnesh: result.data.chartSummary.lagnesh
        })
        setAnalysis(result.data)
        setActiveTab('recommendations') // Switch to recommendations tab to show detailed report
      } else {
        console.error('❌ Invalid response format:', result)
        throw new Error(result.error || 'Invalid response from server')
      }
    } catch (err) {
      console.error('❌ Navaratna analysis error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate analysis'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const resetAnalysis = () => {
    console.log('🔄 Resetting analysis state')
    setAnalysis(null)
    setError(null)
    setActiveTab('introduction')
    setBodyWeightKg(undefined)
  }

  // Auto-generate report on page load if profile is complete
  useEffect(() => {
    const autoGenerateReport = async () => {
      if (!userProfile) {
        setIsLoading(false)
        return
      }

      if (!userProfile.birthDate || !userProfile.birthTime || !userProfile.birthPlace) {
        setError("Please complete your profile with birth date, time, and place to generate your Navaratna gemstone recommendations.")
        setIsLoading(false)
        return
      }

      // Auto-generate the report
      await loadNavaratnaAnalysis()
    }

    if (user && userProfile) {
      autoGenerateReport()
    } else {
      setIsLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, userProfile])

  // Loading state
  if (isLoading && !analysis) {
    return (
      <div className="relative min-h-screen">
        <div className="fixed inset-0 -z-10 starfield-ultra-sharp" />
        <div className="relative z-10 container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <motion.div
                animate={{ 
                  scale: [1, 1.15, 1],
                  opacity: [0.8, 1, 0.8],
                  y: [0, -10, 0]
                }}
                transition={{ 
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="text-6xl mb-6"
              >
                💎
              </motion.div>
              <h3 className="text-2xl font-bold bg-gradient-to-b from-amber-200 via-yellow-400 to-amber-600 bg-clip-text text-transparent mb-2">
                Analyzing Your Chart
              </h3>
              <p className="text-slate-300">Calculating Lagnesh and planetary influences...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen">
      {/* Starfield background */}
      <div 
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: 'var(--starfield-image)',
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          backgroundColor: '#030711',
          imageRendering: '-webkit-optimize-contrast',
        }}
      />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-4">
            <BackButton href="/tools" label="Back to Tools" />
          </div>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8 text-center pt-4"
          >
            <h1 className="text-5xl font-serif font-semibold mb-6">
              <span className="text-yellow-400">💎</span>{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600">Navaratna & Planetary Stones</span>
            </h1>
            <p className="text-slate-200 leading-relaxed text-xl font-light">
              Personalized gemstone recommendations based on Vedic astrology
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
                      <strong>Complete your profile</strong> with birth date, time, and place for accurate gemstone recommendations. 
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

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-transparent p-0 gap-2">
              {[
                { value: 'introduction', label: 'Introduction', icon: BookOpen },
                { value: 'analysis', label: 'Analysis', icon: Sparkles, disabled: !analysis },
                { value: 'recommendations', label: 'Recommendations', icon: Gem, disabled: !analysis },
                { value: 'ask-seer', label: 'Ask The Seer', icon: Sparkles, disabled: !analysis, longLabel: 'Ask The Seer' }
              ].map((tab) => (
                <motion.div
                  key={tab.value}
                  whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
                  whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                  transition={prefersReducedMotion ? {} : { type: "spring", stiffness: 400, damping: 17 }}
                  className="relative"
                >
                  <TabsTrigger 
                    value={tab.value}
                    disabled={tab.disabled}
                    className={`data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md rounded-xl px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 transition-all flex items-center justify-center relative overflow-hidden ${
                      tab.disabled ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    onClick={() => {
                      if (!analysis && hasCompleteProfile && tab.value === 'analysis') {
                        loadNavaratnaAnalysis()
                      }
                    }}
                  >
                    <tab.icon className="w-4 h-4 mr-2" />
                    {tab.longLabel ? (
                      <>
                        <span className="hidden md:inline">{tab.longLabel}</span>
                        <span className="md:hidden">{tab.label}</span>
                      </>
                    ) : (
                      tab.label
                    )}
                    {activeTab === tab.value && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-xl -z-10"
                        transition={prefersReducedMotion ? {} : { type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </TabsTrigger>
                </motion.div>
              ))}
            </TabsList>

            {/* Tab Content with Material 3 Transitions */}
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
                  <TabsContent value="introduction" className="space-y-6 mt-6">
                    <ToolIntroductionTab toolSlug="navaratna-planetary-stones" />
                  </TabsContent>
                </motion.div>
              )}

              {/* Analysis Tab */}
              {activeTab === 'analysis' && (
                <motion.div
                  key="analysis"
                  initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                  animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                  exit={prefersReducedMotion ? {} : { opacity: 0, y: -20 }}
                  transition={motionConfig}
                >
                  <TabsContent value="analysis" className="space-y-6 mt-6">
                    {analysis ? (
                      <div className="space-y-6">
                    {/* Chart Summary */}
                    <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300">
                      <CardHeader>
                        <CardTitle className="text-amber-900 font-serif flex items-center gap-2">
                          <Sparkles className="w-5 h-5" />
                          Chart Summary
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-200 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 p-4">
                            <div className="text-slate-600 text-sm mb-1">Ascendant</div>
                            <div className="text-cyan-900 text-xl font-semibold font-serif">
                              {analysis.chartSummary.ascendant.sign}
                            </div>
                            <div className="text-slate-700 text-sm">
                              {analysis.chartSummary.ascendant.degree.toFixed(2)}°
                            </div>
                          </div>
                          <div className="bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-200 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 p-4">
                            <div className="text-slate-600 text-sm mb-1">Lagnesh (Life Stone Planet)</div>
                            <div className="text-cyan-900 text-xl font-semibold font-serif">
                              {analysis.chartSummary.lagnesh || 'Calculating...'}
                            </div>
                            <div className="text-slate-700 text-sm">
                              {analysis.recommendations.lifeStone?.gemstone.english || 'N/A'}
                            </div>
                          </div>
                          {analysis.chartSummary.currentDasha && (
                            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-200 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 p-4">
                              <div className="text-slate-600 text-sm mb-1">Current Dasha</div>
                              <div className="text-cyan-900 text-xl font-semibold font-serif">
                                {analysis.chartSummary.currentDasha.planet}
                              </div>
                              <div className="text-slate-700 text-sm">
                                {analysis.chartSummary.currentDasha.progress.toFixed(1)}% complete
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Recommendations Summary */}
                    <Card className="bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 border-2 border-purple-200 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300">
                      <CardHeader>
                        <CardTitle className="text-purple-900 font-serif flex items-center gap-2">
                          <Gem className="w-5 h-5" />
                          Recommendations Summary
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle className="w-5 h-5 text-green-700" />
                              <div className="text-green-900 font-semibold">Recommended</div>
                            </div>
                            <div className="text-2xl font-bold text-green-800">
                              {1 + analysis.recommendations.beneficStones.length + (analysis.recommendations.dashaStone ? 1 : 0)}
                            </div>
                            <div className="text-green-700 text-sm">Gemstones</div>
                          </div>
                          <div className="bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-200 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <XCircle className="w-5 h-5 text-red-700" />
                              <div className="text-red-900 font-semibold">Avoid</div>
                            </div>
                            <div className="text-2xl font-bold text-red-800">
                              {analysis.recommendations.avoidedStones.length}
                            </div>
                            <div className="text-red-700 text-sm">Gemstones</div>
                          </div>
                          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Shield className="w-5 h-5 text-amber-700" />
                              <div className="text-amber-900 font-semibold">Safety Warnings</div>
                            </div>
                            <div className="text-2xl font-bold text-amber-800">
                              {analysis.safetyWarnings.length}
                            </div>
                            <div className="text-amber-700 text-sm">Important Notes</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                      </div>
                    ) : (
                  <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md">
                    <CardContent className="py-12 text-center">
                      <Gem className="w-16 h-16 text-amber-600 mx-auto mb-4" />
                      <p className="text-slate-700 mb-4">No analysis generated yet.</p>
                      {hasCompleteProfile ? (
                        <Button
                          onClick={loadNavaratnaAnalysis}
                          disabled={isLoading}
                          className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Analyzing...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 mr-2" />
                              Generate Analysis
                            </>
                          )}
                        </Button>
                      ) : (
                        <Button
                          onClick={() => router.push('/profile')}
                          className="bg-amber-500 hover:bg-amber-600"
                        >
                          <User className="w-4 h-4 mr-2" />
                          Complete Profile First
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}
                  </TabsContent>
                </motion.div>
              )}

              {/* Recommendations Tab */}
              {activeTab === 'recommendations' && (
                <motion.div
                  key="recommendations"
                  initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                  animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                  exit={prefersReducedMotion ? {} : { opacity: 0, y: -20 }}
                  transition={motionConfig}
                >
                  <TabsContent value="recommendations" className="space-y-6 mt-6">

                    {analysis ? (
                      <NavaratnaAnalysis analysis={analysis} />
                    ) : (
                      <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md">
                        <CardContent className="py-12 text-center">
                          <Gem className="w-16 h-16 text-amber-600 mx-auto mb-4" />
                          <p className="text-slate-700">Generate analysis first to see recommendations.</p>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>
                </motion.div>
              )}

              {/* Ask Seer Tab */}
              {activeTab === 'ask-seer' && (
                <motion.div
                  key="ask-seer"
                  initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                  animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                  exit={prefersReducedMotion ? {} : { opacity: 0, y: -20 }}
                  transition={motionConfig}
                >
                  <TabsContent value="ask-seer" className="space-y-6 mt-6">
                    <NavaratnaSeerChatInterface
                      analysis={analysis}
                      userId={user?.uid}
                      userProfile={userProfile}
                      sessionId={analysis ? `navaratna_${analysis.userId || Date.now()}` : undefined}
                    />
                  </TabsContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
