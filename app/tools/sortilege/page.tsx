"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { BackButton } from '@/components/navigation/BackButton'
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

  const hasCompleteProfile = userProfile ? isProfileComplete(userProfile) : false
  const profileStatus = userProfile ? getProfileCompletionStatus(userProfile) : { isComplete: false, missingFields: [], completionPercentage: 0 }

  // Load Sortilege Reading
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

      console.log('🪄 Starting Sortilege reading...', {
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

      console.log('📡 API Response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('❌ API Error:', errorData)
        throw new Error(errorData.error || `Failed to generate reading (${response.status})`)
      }

      const result = await response.json()
      console.log('✅ API Response:', { success: result.success, hasData: !!result.data })

      if (result.success && result.data) {
        console.log('📚 Setting reading data:', {
          id: result.data.id,
          method: result.data.method,
          hasCastResult: !!result.data.castResult,
          hasComprehensiveReport: !!result.data.comprehensiveReport
        })
        setReading(result.data)
        setActiveTab('casting')
        setActiveReportTab('overview')
      } else {
        console.error('❌ Invalid response format:', result)
        throw new Error(result.error || 'Invalid response from server')
      }
    } catch (err) {
      console.error('❌ Sortilege reading error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate reading'
      setError(errorMessage)
      setIsAnimating(false)
    } finally {
      setIsLoading(false)
    }
  }

  const resetReading = () => {
    console.log('🔄 Resetting reading state')
    setReading(null)
    setQuestion('')
    setError(null)
    setActiveTab('introduction')
    setActiveReportTab('overview')
    setIsAnimating(false)
  }

  // Debug: Log state changes
  useEffect(() => {
    console.log('📊 [SORTILEGE PAGE] State update:', {
      activeTab,
      activeReportTab,
      hasReading: !!reading,
      isLoading,
      isAnimating,
      error,
      question: question.substring(0, 50) + '...'
    })
  }, [activeTab, activeReportTab, reading, isLoading, isAnimating, error, question])

  // Loading state
  if (isLoading && !reading) {
    return (
      <div className="relative min-h-screen">
        <div className="fixed inset-0 -z-10 starfield-ultra-sharp" />
        <div className="relative z-10 container mx-auto px-4 py-8">
          <div className="mb-4">
            <BackButton href="/tools" label="Back to Tools" />
          </div>
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
        <div className="mb-4">
          <BackButton href="/tools" label="Back to Tools" />
        </div>
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
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-transparent p-0 gap-2">
              <TabsTrigger 
                value="introduction" 
                className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md rounded-xl px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 transition-all"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Introduction
              </TabsTrigger>
              <TabsTrigger 
                value="casting" 
                className={`data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md rounded-xl px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 transition-all ${
                  !reading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={!reading}
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
                className={`data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md rounded-xl px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 transition-all ${
                  !reading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={!reading}
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
                className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md rounded-xl px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 transition-all"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Ask The Seer
              </TabsTrigger>
            </TabsList>

            {/* Introduction Tab */}
            <TabsContent value="introduction" className="space-y-6">
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
                      <Button 
                        onClick={loadSortilegeReading}
                        disabled={isLoading || !question.trim()}
                        className="w-full bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white font-semibold"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Casting the Lots...
                          </>
                        ) : (
                          <>
                            <Wand2 className="h-4 w-4 mr-2" />
                            Cast the Lots
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </TabsContent>

            {/* Casting Tab */}
            <TabsContent value="casting" className="space-y-6">
              {reading && reading.castResult ? (
                <>
                  <SortilegeCastingInterface 
                    castResult={reading.castResult} 
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
            <TabsContent value="report" className="space-y-6">
              {reading && reading.comprehensiveReport ? (
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
                    <SortilegeReport reading={reading} activeTab="overview" />
                  </TabsContent>
                  <TabsContent value="interpretation" className="space-y-6">
                    <SortilegeReport reading={reading} activeTab="interpretation" />
                  </TabsContent>
                  <TabsContent value="insights" className="space-y-6">
                    <SortilegeReport reading={reading} activeTab="insights" />
                  </TabsContent>
                  <TabsContent value="guidance" className="space-y-6">
                    <SortilegeReport reading={reading} activeTab="guidance" />
                  </TabsContent>
                  <TabsContent value="remedies" className="space-y-6">
                    <SortilegeReport reading={reading} activeTab="remedies" />
                  </TabsContent>
                  <TabsContent value="history" className="space-y-6">
                    <SortilegeReport reading={reading} activeTab="history" />
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
            <TabsContent value="ask-seer" className="space-y-6">
              {user && userProfile ? (
                reading ? (
                  <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md">
                    <CardContent className="p-6">
                      <SortilegeSeerChatInterface 
                        userId={user.uid} 
                        userProfile={userProfile}
                        sortilegeReading={reading}
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
  )
}
