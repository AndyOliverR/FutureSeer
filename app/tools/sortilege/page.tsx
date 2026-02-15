"use client"

import { useState, useEffect, useMemo } from 'react'
import { devLog } from '@/lib/devLogger';
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { useToolReport } from '@/hooks/useComprehensiveMysticalProfile'
import { ToolReportGuard } from '@/components/ToolReportGuard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ToolIntroductionTab } from '@/components/ToolIntroductionTab'
import SortilegeSeerChatInterface from '@/components/SortilegeSeerChatInterface'
import { SortilegeCastingInterface } from '@/components/sortilege/SortilegeCastingInterface'
import { SortilegeReport } from '@/components/sortilege/SortilegeReport'
import { SortilegeReading, CastingMethod } from '@/lib/sortilegeIntelligence'
import { isProfileComplete, getProfileCompletionStatus } from '@/lib/firebase'
import { 
  Wand2, 
  AlertTriangle,
  Info,
  User,
  Loader2,
  Dice6,
  Gem,
  Square,
  Circle,
  TreePine,
  MessageCircle,
  BookOpen,
  Sparkles,
  Lightbulb,
  Shield,
  Clock,
  TrendingUp
} from 'lucide-react'

const castingMethods: Array<{ value: CastingMethod; label: string; icon: any; description: string }> = [
  { 
    value: 'dice', 
    label: 'Dice (Cleromancy)', 
    icon: Dice6,
    description: 'Cast dice to determine fate through numbers and positions'
  },
  { 
    value: 'stones', 
    label: 'Stones (Lithomancy)', 
    icon: Gem,
    description: 'Cast stones with symbols to read patterns and meanings'
  },
  { 
    value: 'cards', 
    label: 'Cards (Cartomancy)', 
    icon: Square,
    description: 'Draw cards to reveal hidden truths and guidance'
  },
  { 
    value: 'coins', 
    label: 'Coins (I Ching)', 
    icon: Circle,
    description: 'Flip coins to generate hexagrams and ancient wisdom'
  },
  { 
    value: 'sticks', 
    label: 'Sticks', 
    icon: TreePine,
    description: 'Cast marked sticks to read positions and symbols'
  }
]

export default function SortilegePage() {
  const { user, userProfile } = useAuth()
  const router = useRouter()
  const [reading, setReading] = useState<SortilegeReading | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'introduction' | 'casting' | 'report' | 'ask-seer'>('introduction')
  const [activeReportTab, setActiveReportTab] = useState<'overview' | 'interpretation' | 'insights' | 'guidance' | 'remedies' | 'history'>('overview')
  const [question, setQuestion] = useState('')
  const [selectedMethod, setSelectedMethod] = useState<CastingMethod>('dice')
  const { report: pipelineReport, loading: profileLoading, error: profileError } = useToolReport('sortilege')
  const pipelineReading = useMemo((): SortilegeReading | null => {
    if (!pipelineReport || typeof pipelineReport !== 'object') return null
    const r = pipelineReport as Record<string, unknown>
    if (r.placeholder === true) return null
    const data = (r.data ?? r) as SortilegeReading | undefined
    return data && typeof data === 'object' && (data as unknown as Record<string, unknown>).outcome != null ? data : null
  }, [pipelineReport])
  const displayReading = reading ?? pipelineReading

  const hasCompleteProfile = userProfile ? isProfileComplete(userProfile) : false
  const profileStatus = userProfile ? getProfileCompletionStatus(userProfile) : { isComplete: false, missingFields: [], completionPercentage: 0 }

  // No mount-triggered API; readings come from pipeline or user-initiated flow (replaced with CTA)
  const loadSortilegeReading = async () => {
    if (!question.trim()) {
      setError('Please enter a question')
      return
    }

    if (!user?.uid) {
      setError('Please sign in to use Sortilege Divination')
      return
    }

    try {
      setIsLoading(true)
      setIsAnimating(true)
      setError(null)

      devLog.debug('🪄 Starting Sortilege reading...', {
        userId: user.uid,
        question: question.trim(),
        method: selectedMethod,
        hasProfile: !!userProfile
      })

      // Start animation
      setTimeout(() => setIsAnimating(false), 2000)

      const response = await fetch('/api/tools/sortilege/reading', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user.uid,
          question: question.trim(),
          method: selectedMethod,
          userProfile: userProfile
        })
      })

      devLog.debug('📡 API Response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        devLog.error('❌ API Error:', errorData, 'page')
        throw new Error(errorData.error || `Failed to generate reading (${response.status})`)
      }

      const result = await response.json()
      devLog.debug('✅ API Response:', { success: result.success, hasData: !!result.data })

      if (result.success && result.data) {
        devLog.debug('📚 Setting reading data:', {
          id: result.data.id,
          method: result.data.method,
          hasCastResult: !!result.data.castResult,
          hasComprehensiveReport: !!result.data.comprehensiveReport
        })
        setReading(result.data)
        setActiveTab('casting')
        setActiveReportTab('overview')
      } else {
        devLog.error('❌ Invalid response format:', result, 'page')
        throw new Error(result.error || 'Invalid response from server')
      }
    } catch (err) {
      devLog.error('❌ Sortilege reading error:', err, 'page')
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate reading'
      setError(errorMessage)
      setIsAnimating(false)
    } finally {
      setIsLoading(false)
    }
  }

  const resetReading = () => {
    devLog.debug('🔄 Resetting reading state')
    setReading(null)
    setQuestion('')
    setError(null)
    setActiveTab('introduction')
    setActiveReportTab('overview')
    setIsAnimating(false)
  }

  // Debug: Log state changes
  useEffect(() => {
    devLog.debug('📊 [SORTILEGE PAGE] State update:', {
      activeTab,
      activeReportTab,
      hasReading: !!reading,
      isLoading,
      isAnimating,
      error,
      question: question.substring(0, 50) + '...'
    })
  }, [activeTab, activeReportTab, reading, isLoading, isAnimating, error, question])

  return (
    <ToolReportGuard loading={profileLoading} error={profileError ?? null} toolLabel="Sortilege">
      {isLoading && !displayReading ? (
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
                🪄
              </motion.div>
              <h3 className="text-2xl font-bold bg-gradient-to-b from-amber-200 via-yellow-400 to-amber-600 bg-clip-text text-transparent mb-2">
                Casting the Lots
              </h3>
              <p className="text-slate-300">Consulting the divine through {selectedMethod}...</p>
            </div>
          </div>
        </div>
      </div>
      ) : (
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
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8 text-center pt-4"
          >
            <h1 className="text-5xl font-serif font-semibold mb-6">
              <span className="text-yellow-400">🪄</span>{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600">Sortilege Divination</span>
            </h1>
            <p className="text-slate-200 leading-relaxed text-xl font-light">
              Cast lots through dice, stones, cards, coins, or sticks to receive divine guidance
            </p>
          </motion.div>

          {/* Profile Completion Alert */}
          {!hasCompleteProfile && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <Alert className="bg-amber-600/20 border-amber-500/50 backdrop-blur-sm">
                <Info className="h-4 w-4 text-amber-400" />
                <AlertDescription className="text-amber-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <strong>Complete your profile</strong> for personalized readings. 
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

          {/* Tabs */}
          <div className="rounded-2xl border border-amber-500/30 bg-slate-900/80 overflow-hidden">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full min-w-0">
            <TabsList className="flex w-full flex-nowrap overflow-x-auto gap-1 sm:gap-2 p-2 sm:p-3 bg-slate-800/50 border-b border-amber-500/20 rounded-none h-auto min-h-0 justify-start [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-amber-500/30">
              <TabsTrigger 
                value="introduction" 
                className="shrink-0 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 rounded-t-lg rounded-b-none px-4 py-2.5 text-sm font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 transition-all border border-transparent data-[state=inactive]:border-slate-600/50"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Introduction
              </TabsTrigger>
              <TabsTrigger 
                value="casting" 
                className={`shrink-0 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md rounded-t-lg rounded-b-none px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 transition-all ${
                  !reading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={!displayReading}
                onClick={() => {
                  if (!reading) {
                    setActiveTab('introduction')
                  }
                }}
              >
                <Wand2 className="w-4 h-4 mr-2" />
                Casting
              </TabsTrigger>
              <TabsTrigger 
                value="report" 
                className={`shrink-0 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md rounded-t-lg rounded-b-none px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 transition-all ${
                  !reading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={!displayReading}
                onClick={() => {
                  if (!reading) {
                    setActiveTab('introduction')
                  }
                }}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Report
              </TabsTrigger>
              <TabsTrigger 
                value="ask-seer" 
                className="shrink-0 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 rounded-t-lg rounded-b-none px-4 py-2.5 text-sm font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 transition-all border border-transparent data-[state=inactive]:border-slate-600/50"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Ask The Seer
              </TabsTrigger>
            </TabsList>

            {/* Introduction Tab */}
            <TabsContent value="introduction" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
              <ToolIntroductionTab toolSlug="sortilege" />
              
              {/* Question Input Form */}
              {!reading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md">
                    <CardHeader>
                      <CardTitle className="text-amber-900 flex items-center gap-2">
                        <MessageCircle className="h-5 w-5 text-amber-700" />
                        Ask Your Question
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-amber-800 mb-2">
                          Divination Method
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                          {castingMethods.map((method) => {
                            const Icon = method.icon
                            return (
                              <button
                                key={method.value}
                                onClick={() => setSelectedMethod(method.value)}
                                className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                                  selectedMethod === method.value
                                    ? 'border-amber-400 bg-amber-100 shadow-md'
                                    : 'border-amber-200 bg-white hover:border-amber-300 hover:shadow-sm'
                                }`}
                              >
                                <Icon className={`w-6 h-6 mx-auto mb-2 ${
                                  selectedMethod === method.value ? 'text-amber-700' : 'text-amber-600'
                                }`} />
                                <div className={`text-sm font-semibold ${
                                  selectedMethod === method.value ? 'text-amber-900' : 'text-amber-800'
                                }`}>
                                  {method.label.split(' ')[0]}
                                </div>
                                <div className="text-xs text-slate-600 mt-1">
                                  {method.description}
                                </div>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-amber-800 mb-2">
                          Your Question
                        </label>
                        <textarea
                          value={question}
                          onChange={(e) => setQuestion(e.target.value)}
                          placeholder="What guidance do you seek? (e.g., 'Should I pursue this opportunity?', 'What does the future hold for my relationship?')"
                          className="w-full p-4 bg-white border border-amber-200 rounded-xl text-slate-800 placeholder-slate-500 focus:ring-2 focus:ring-amber-500 focus:border-amber-400 h-32 resize-none"
                        />
                        <p className="text-slate-600 text-xs mt-2">
                          Be specific and clear. The more focused your question, the clearer the guidance.
                        </p>
                      </div>
                      <Button asChild className="w-full bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white font-semibold">
                        <Link href="/profile">
                          <Sparkles className="h-4 w-4 mr-2" />
                          Generate your mystical profile
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </TabsContent>

            {/* Casting Tab */}
            <TabsContent value="casting" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
              {displayReading && displayReading.castResult ? (
                <>
                  <SortilegeCastingInterface 
                    castResult={displayReading.castResult} 
                    isAnimating={isAnimating}
                  />
                  <div className="flex justify-end gap-4">
                    <Button
                      onClick={resetReading}
                      variant="outline"
                      className="border-slate-700 text-slate-300 hover:bg-slate-800"
                    >
                      Ask New Question
                    </Button>
                    <Button
                      onClick={() => {
                        setActiveTab('report')
                        setActiveReportTab('overview')
                      }}
                      className="bg-amber-600 hover:bg-amber-700 text-white"
                    >
                      View Full Report
                    </Button>
                  </div>
                </>
              ) : (
                <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md">
                  <CardContent className="p-6 text-center">
                    <Info className="w-12 h-12 text-amber-700 mx-auto mb-4" />
                    <h3 className="text-amber-900 font-semibold mb-2 text-xl">No Casting Data</h3>
                    <p className="text-slate-700 mb-4">
                      Please perform a reading first to view the casting results.
                    </p>
                    <Button
                      onClick={() => setActiveTab('introduction')}
                      className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl"
                    >
                      Go to Introduction
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Report Tab with Nested Tabs */}
            <TabsContent value="report" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
              {displayReading && displayReading.comprehensiveReport ? (
                <Tabs value={activeReportTab} onValueChange={(value) => setActiveReportTab(value as any)} className="space-y-6">
                  <TabsList className="grid w-full grid-cols-6 bg-transparent p-0 gap-2">
                    <TabsTrigger 
                      value="overview" 
                      className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md rounded-xl px-3 py-2 text-xs font-medium text-slate-300 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 transition-all"
                    >
                      <BookOpen className="w-3 h-3 mr-1" />
                      Overview
                    </TabsTrigger>
                    <TabsTrigger 
                      value="interpretation" 
                      className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md rounded-xl px-3 py-2 text-xs font-medium text-slate-300 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 transition-all"
                    >
                      <Sparkles className="w-3 h-3 mr-1" />
                      Interpretation
                    </TabsTrigger>
                    <TabsTrigger 
                      value="insights" 
                      className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md rounded-xl px-3 py-2 text-xs font-medium text-slate-300 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 transition-all"
                    >
                      <Lightbulb className="w-3 h-3 mr-1" />
                      Insights
                    </TabsTrigger>
                    <TabsTrigger 
                      value="guidance" 
                      className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md rounded-xl px-3 py-2 text-xs font-medium text-slate-300 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 transition-all"
                    >
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Guidance
                    </TabsTrigger>
                    <TabsTrigger 
                      value="remedies" 
                      className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md rounded-xl px-3 py-2 text-xs font-medium text-slate-300 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 transition-all"
                    >
                      <Shield className="w-3 h-3 mr-1" />
                      Remedies
                    </TabsTrigger>
                    <TabsTrigger 
                      value="history" 
                      className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md rounded-xl px-3 py-2 text-xs font-medium text-slate-300 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 transition-all"
                    >
                      <Clock className="w-3 h-3 mr-1" />
                      History
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-6">
                    <SortilegeReport reading={displayReading} activeTab="overview" />
                  </TabsContent>
                  <TabsContent value="interpretation" className="space-y-6">
                    <SortilegeReport reading={displayReading} activeTab="interpretation" />
                  </TabsContent>
                  <TabsContent value="insights" className="space-y-6">
                    <SortilegeReport reading={displayReading} activeTab="insights" />
                  </TabsContent>
                  <TabsContent value="guidance" className="space-y-6">
                    <SortilegeReport reading={displayReading} activeTab="guidance" />
                  </TabsContent>
                  <TabsContent value="remedies" className="space-y-6">
                    <SortilegeReport reading={displayReading} activeTab="remedies" />
                  </TabsContent>
                  <TabsContent value="history" className="space-y-6">
                    <SortilegeReport reading={displayReading} activeTab="history" />
                  </TabsContent>
                </Tabs>
              ) : (
                <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md">
                  <CardContent className="p-6 text-center">
                    <Info className="w-12 h-12 text-amber-700 mx-auto mb-4" />
                    <h3 className="text-amber-900 font-semibold mb-2 text-xl">No Report Data</h3>
                    <p className="text-slate-700 mb-4">
                      Please perform a reading first to view the comprehensive report.
                    </p>
                    <Button
                      onClick={() => setActiveTab('introduction')}
                      className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl"
                    >
                      Go to Introduction
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Ask The Seer Tab */}
            <TabsContent value="ask-seer" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
              {user && userProfile ? (
                reading ? (
                  <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md">
                    <CardContent className="p-6">
                      <SortilegeSeerChatInterface 
                        userId={user.uid} 
                        userProfile={userProfile}
                        sortilegeReading={displayReading ?? undefined}
                      />
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md">
                    <CardContent className="p-6 text-center">
                      <Info className="w-12 h-12 text-amber-700 mx-auto mb-4" />
                      <h3 className="text-amber-900 font-semibold mb-2 text-xl">Generate a Reading First</h3>
                      <p className="text-slate-700 mb-4">
                        Please generate a Sortilege reading first to use Ask the Seer. The seer specializes in Sortilege Divination and needs your cast results to provide guidance.
                      </p>
                      <Button
                        onClick={() => setActiveTab('introduction')}
                        className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl"
                      >
                        Go to Introduction
                      </Button>
                    </CardContent>
                  </Card>
                )
              ) : (
                <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md">
                  <CardContent className="p-6 text-center">
                    <Info className="w-12 h-12 text-amber-700 mx-auto mb-4" />
                    <h3 className="text-amber-900 font-semibold mb-2 text-xl">Sign In Required</h3>
                    <p className="text-slate-700 mb-4">
                      Please sign in to use Ask The Seer
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
          </div>

          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6"
            >
              <Alert variant="destructive" className="bg-red-500/10 border-red-500/50">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-red-300">{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}

          {/* Method Descriptions */}
          {!reading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-12 grid grid-cols-1 md:grid-cols-5 gap-6"
            >
              {castingMethods.map((method) => {
                const Icon = method.icon
                return (
                  <Card key={method.value} className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md">
                    <CardHeader>
                      <CardTitle className="text-amber-900 flex items-center gap-2">
                        <Icon className="h-5 w-5 text-amber-700" />
                        {method.label.split(' ')[0]}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-700 text-sm">
                        {method.description}
                      </p>
                    </CardContent>
                  </Card>
                )
              })}
            </motion.div>
          )}
        </div>
      </div>
    </div>
      )}
    </ToolReportGuard>
  )
}
