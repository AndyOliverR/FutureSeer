// Streamlined Tarot page that integrates with comprehensive profile data and external Tarot API
"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/hooks/use-auth'
import { extractToolData } from '@/lib/toolDataExtractor'
import { tarotApiService, TarotCard, TarotReading, TAROT_SPREADS } from '@/lib/tarotApiService'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Sparkles, 
  Calendar,
  Clock,
  MapPin,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Info,
  Zap,
  Brain,
  Home,
  Gem,
  MessageCircle,
  BarChart3,
  User,
  Eye,
  Heart,
  Shield,
  Target,
  Activity,
  Cards,
  BookOpen,
  Star
} from 'lucide-react'

export default function TarotPage() {
  const { user, userProfile } = useAuth()
  const [tarotData, setTarotData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'reading' | 'cards' | 'guidance' | 'coaching'>('overview')
  
  // Tarot reading state
  const [question, setQuestion] = useState('')
  const [spreadType, setSpreadType] = useState('')
  const [currentReading, setCurrentReading] = useState<TarotReading | null>(null)
  const [isReadingLoading, setIsReadingLoading] = useState(false)
  const [readingError, setReadingError] = useState<string | null>(null)

  // Check if user has complete birth details
  const hasCompleteDetails = userProfile?.birthDate && userProfile?.birthTime && userProfile?.birthPlace

  // Load Tarot data from stored comprehensive profile
  useEffect(() => {
    const loadTarotData = async () => {
      if (!user?.uid || !hasCompleteDetails) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)
        
        console.log('Loading Tarot data for user:', user.uid)
        const data = await extractToolData(user.uid, 'Tarot')
        console.log('Tarot data loaded:', data)
        setTarotData(data)
      } catch (err: any) {
        console.error('Error loading Tarot data:', err)
        setError(err.message || 'Failed to load Tarot data')
      } finally {
        setIsLoading(false)
      }
    }

    loadTarotData()
  }, [user?.uid, hasCompleteDetails])

  const refetch = async () => {
    if (!user?.uid || !hasCompleteDetails) return
    
    try {
      setIsLoading(true)
      setError(null)
      
      const data = await extractToolData(user.uid, 'Tarot')
      setTarotData(data)
    } catch (err: any) {
      console.error('Error refetching Tarot data:', err)
      setError(err.message || 'Failed to load Tarot data')
    } finally {
      setIsLoading(false)
    }
  }

  const performTarotReading = async () => {
    if (!question.trim() || !spreadType) return

    try {
      setIsReadingLoading(true)
      setReadingError(null)

      // Get cards based on spread type
      const spread = TAROT_SPREADS.find(s => s.name === spreadType)
      const numCards = spread ? spread.positions.length : 1
      
      const cards: TarotCard[] = []
      for (let i = 0; i < numCards; i++) {
        const card = await tarotApiService.getRandomCard()
        if (card) cards.push(card)
      }

      // Generate reading
      const reading = tarotApiService.generateReading(question, spreadType, cards)
      setCurrentReading(reading)
    } catch (err: any) {
      console.error('Error performing tarot reading:', err)
      setReadingError(err.message || 'Failed to perform tarot reading')
    } finally {
      setIsReadingLoading(false)
    }
  }

  const resetReading = () => {
    setQuestion('')
    setSpreadType('')
    setCurrentReading(null)
    setReadingError(null)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen starfield-ultra-sharp text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
              <p className="text-slate-300">Loading your Tarot data...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen starfield-ultra-sharp text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-red-300 font-semibold mb-2 text-xl">Error Loading Tarot Data</h3>
            <p className="text-red-400 mb-4">{error}</p>
            <Button
              onClick={refetch}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!hasCompleteDetails) {
    return (
      <div className="min-h-screen starfield-ultra-sharp text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-6 text-center">
            <Info className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-slate-300 font-semibold mb-2 text-xl">Complete Your Profile</h3>
            <p className="text-slate-400 mb-4">
              Please complete your birth date, time, and place in your profile to generate Tarot insights.
            </p>
            <Button
              onClick={() => window.location.href = '/profile'}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white"
            >
              <User className="w-4 h-4 mr-2" />
              Complete Profile
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen starfield-ultra-sharp text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center mb-4"
          >
            <Cards className="w-8 h-8 text-purple-400 mr-3" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Tarot Divination
            </h1>
          </motion.div>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Discover hidden truths and guidance through the ancient art of Tarot card reading
          </p>
        </div>

        {/* Data Source Status */}
        <div className="flex justify-center mb-6">
          <Badge variant="outline" className="text-xs px-3 py-1">
            <Sparkles className="w-3 h-3 mr-1" />
            FUTURESEER AI
          </Badge>
          </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-slate-800/50">
            <TabsTrigger value="overview" className="text-xs">
              <Eye className="w-4 h-4 mr-1" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="reading" className="text-xs">
              <Cards className="w-4 h-4 mr-1" />
              Reading
            </TabsTrigger>
            <TabsTrigger value="cards" className="text-xs">
              <BookOpen className="w-4 h-4 mr-1" />
              Cards
            </TabsTrigger>
            <TabsTrigger value="guidance" className="text-xs">
              <Target className="w-4 h-4 mr-1" />
              Guidance
            </TabsTrigger>
            <TabsTrigger value="coaching" className="text-xs">
              <Brain className="w-4 h-4 mr-1" />
              Coaching
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Tarot Profile Summary */}
              <Card className="bg-slate-800/50 border-slate-600/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-purple-300 text-lg flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Your Tarot Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {tarotData && typeof tarotData === 'object' ? (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Birth Card:</span>
                        <span className="text-purple-300 font-bold">{tarotData.birth_card || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Life Path Card:</span>
                        <span className="text-purple-300 font-bold">{tarotData.life_path_card || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Soul Card:</span>
                        <span className="text-purple-300 font-bold">{tarotData.soul_card || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Personality Card:</span>
                        <span className="text-purple-300 font-bold">{tarotData.personality_card || 'N/A'}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-400 text-sm">No Tarot profile data available</p>
                  )}
                </CardContent>
              </Card>

              {/* Recent Readings */}
              <Card className="bg-slate-800/50 border-slate-600/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-purple-300 text-lg flex items-center">
                    <Clock className="w-5 h-5 mr-2" />
                    Recent Readings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {tarotData?.recent_readings && Array.isArray(tarotData.recent_readings) && tarotData.recent_readings.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-slate-300 text-sm">
                        {tarotData.recent_readings.length} readings completed
                      </p>
                      <div className="text-xs text-slate-400">
                        Last reading: {tarotData.recent_readings[0]?.date || 'N/A'}
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-400 text-sm">No recent readings available</p>
                  )}
                </CardContent>
              </Card>

              {/* Elemental Balance */}
              <Card className="bg-slate-800/50 border-slate-600/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-purple-300 text-lg flex items-center">
                    <Zap className="w-5 h-5 mr-2" />
                    Elemental Balance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {tarotData?.elemental_balance && typeof tarotData.elemental_balance === 'object' ? (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Primary:</span>
                        <span className="text-purple-300">{tarotData.elemental_balance.primary || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Secondary:</span>
                        <span className="text-purple-300">{tarotData.elemental_balance.secondary || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Balance:</span>
                        <span className="text-purple-300">{tarotData.elemental_balance.balance || 'N/A'}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-400 text-sm">No elemental balance data available</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="bg-slate-800/50 border-slate-600/30">
              <CardHeader>
                <CardTitle className="text-purple-300 text-lg flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    onClick={() => setActiveTab('reading')}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white"
                  >
                    <Cards className="w-4 h-4 mr-2" />
                    New Reading
                  </Button>
                  <Button
                    onClick={() => setActiveTab('cards')}
                    variant="outline"
                    className="border-purple-600 text-purple-300 hover:bg-purple-600/20"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Card Meanings
                  </Button>
                  <Button
                    onClick={() => setActiveTab('guidance')}
                    variant="outline"
                    className="border-purple-600 text-purple-300 hover:bg-purple-600/20"
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Daily Guidance
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reading Tab */}
          <TabsContent value="reading" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-600/30">
              <CardHeader>
                <CardTitle className="text-purple-300 text-lg flex items-center">
                  <Cards className="w-5 h-5 mr-2" />
                  Tarot Reading
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {!currentReading ? (
                  <div className="space-y-4">
              {/* Question Input */}
                    <div>
                      <label className="block text-slate-300 text-sm font-medium mb-2">
                        What would you like guidance on?
                      </label>
                <textarea
                        value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Ask your question here..."
                        className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        rows={3}
                />
              </div>

                    {/* Spread Selection */}
                    <div>
                      <label className="block text-slate-300 text-sm font-medium mb-2">
                        Choose a spread
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {TAROT_SPREADS.map((spread) => (
                          <button
                            key={spread.name}
                            onClick={() => setSpreadType(spread.name)}
                            className={`p-3 rounded-lg border text-left transition-colors ${
                              spreadType === spread.name
                                ? 'border-purple-500 bg-purple-600/20 text-purple-300'
                                : 'border-slate-600 bg-slate-700/30 text-slate-300 hover:border-purple-500/50'
                            }`}
                          >
                            <div className="font-medium">{spread.name}</div>
                            <div className="text-xs text-slate-400 mt-1">{spread.description}</div>
                          </button>
                        ))}
              </div>
              </div>

                    {/* Perform Reading Button */}
                    <Button
                  onClick={performTarotReading}
                      disabled={!question.trim() || !spreadType || isReadingLoading}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white"
                    >
                      {isReadingLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Reading Cards...
                        </>
                      ) : (
                        <>
                          <Cards className="w-4 h-4 mr-2" />
                          Perform Reading
                        </>
                      )}
                    </Button>

                    {readingError && (
                      <div className="bg-red-900/20 border border-red-800 rounded-lg p-3">
                        <p className="text-red-400 text-sm">{readingError}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Reading Header */}
                    <div className="text-center">
                      <h3 className="text-xl font-semibold text-purple-300 mb-2">{currentReading.spreadName}</h3>
                      <p className="text-slate-400 text-sm">Question: {currentReading.question}</p>
                    </div>

                    {/* Cards Display */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {currentReading.cards.map((card, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30"
                        >
                          <div className="text-center">
                            <div className="text-sm font-medium text-purple-300 mb-2">
                              {card.position}
                            </div>
                            <div className="text-lg font-bold text-white mb-2">
                              {card.name}
                            </div>
                            <div className="text-xs text-slate-400 mb-3">
                              {card.suit} â€¢ {card.isUpright ? 'Upright' : 'Reversed'}
                            </div>
                            <div className="text-sm text-slate-300">
                              {card.isUpright ? card.meaning_upright : card.meaning_reversed}
              </div>
            </div>
          </motion.div>
                ))}
              </div>

                    {/* Overall Reading */}
                    <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30">
                      <h4 className="font-semibold text-purple-300 mb-3">Overall Reading</h4>
                      <p className="text-slate-300 text-sm leading-relaxed">
                        {currentReading.overallReading}
                      </p>
                    </div>

                    {/* Reset Button */}
                    <div className="text-center">
                      <Button
                        onClick={resetReading}
                        variant="outline"
                        className="border-purple-600 text-purple-300 hover:bg-purple-600/20"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        New Reading
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cards Tab */}
          <TabsContent value="cards" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-600/30">
              <CardHeader>
                <CardTitle className="text-purple-300 text-lg flex items-center">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Tarot Card Meanings
                </CardTitle>
              </CardHeader>
              <CardContent>
                {tarotData?.card_meanings && Array.isArray(tarotData.card_meanings) && tarotData.card_meanings.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tarotData.card_meanings.map((card: any, index: number) => (
                  <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30"
                      >
                        <div className="text-center">
                          <h4 className="font-semibold text-purple-300 mb-2">{card.name || 'Unknown Card'}</h4>
                          <div className="text-xs text-slate-400 mb-3">
                            {card.suit || 'N/A'} â€¢ {card.value || 'N/A'}
                          </div>
                          <div className="text-sm text-slate-300 space-y-2">
                            <div>
                              <strong className="text-green-400">Upright:</strong>
                              <p className="text-xs mt-1">{card.meaning_upright || 'No upright meaning available'}</p>
                            </div>
                            <div>
                              <strong className="text-red-400">Reversed:</strong>
                              <p className="text-xs mt-1">{card.meaning_reversed || 'No reversed meaning available'}</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-center py-8">No card meanings available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Guidance Tab */}
          <TabsContent value="guidance" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-600/30">
              <CardHeader>
                <CardTitle className="text-purple-300 text-lg flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  Daily Guidance
                </CardTitle>
              </CardHeader>
              <CardContent>
                {tarotData?.daily_guidance && typeof tarotData.daily_guidance === 'object' ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-purple-300 mb-2">Today's Message</h4>
                      <p className="text-slate-300 text-sm">
                        {tarotData.daily_guidance.message || 'No daily message available'}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-purple-300 mb-2">Focus Areas</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {tarotData.daily_guidance.focus_areas && Array.isArray(tarotData.daily_guidance.focus_areas) ? (
                          tarotData.daily_guidance.focus_areas.map((area: string, index: number) => (
                            <div key={index} className="bg-slate-700/30 rounded-lg p-3 border border-slate-600/30">
                              <p className="text-slate-300 text-sm">{area}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-slate-400 text-sm">No focus areas available</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-purple-300 mb-2">Recommendations</h4>
                      <div className="space-y-2">
                        {tarotData.daily_guidance.recommendations && Array.isArray(tarotData.daily_guidance.recommendations) ? (
                          tarotData.daily_guidance.recommendations.map((rec: string, index: number) => (
                            <div key={index} className="flex items-start">
                              <Star className="w-4 h-4 text-purple-400 mr-2 mt-0.5 flex-shrink-0" />
                              <p className="text-slate-300 text-sm">{rec}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-slate-400 text-sm">No recommendations available</p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-400 text-center py-8">No daily guidance available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Coaching Tab */}
          <TabsContent value="coaching" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-600/30">
              <CardHeader>
                <CardTitle className="text-purple-300 text-lg flex items-center">
                  <Brain className="w-5 h-5 mr-2" />
                  Tarot Coaching
                </CardTitle>
              </CardHeader>
              <CardContent>
                {tarotData?.coaching && typeof tarotData.coaching === 'object' ? (
                  <div className="space-y-6">
                    {/* Strengths */}
                    <div>
                      <h4 className="font-semibold text-green-400 mb-3 flex items-center">
                        <Shield className="w-4 h-4 mr-2" />
                        Your Strengths
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {tarotData.coaching.strengths && Array.isArray(tarotData.coaching.strengths) ? (
                          tarotData.coaching.strengths.map((strength: string, index: number) => (
                            <div key={index} className="bg-green-900/20 border border-green-800/30 rounded-lg p-3">
                              <p className="text-green-300 text-sm">{strength}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-slate-400 text-sm">No strengths identified</p>
                        )}
                      </div>
                    </div>

                    {/* Challenges */}
                    <div>
                      <h4 className="font-semibold text-orange-400 mb-3 flex items-center">
                        <Target className="w-4 h-4 mr-2" />
                        Areas for Growth
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {tarotData.coaching.challenges && Array.isArray(tarotData.coaching.challenges) ? (
                          tarotData.coaching.challenges.map((challenge: string, index: number) => (
                            <div key={index} className="bg-orange-900/20 border border-orange-800/30 rounded-lg p-3">
                              <p className="text-orange-300 text-sm">{challenge}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-slate-400 text-sm">No challenges identified</p>
                        )}
                      </div>
                    </div>

                    {/* Growth Areas */}
                    <div>
                      <h4 className="font-semibold text-blue-400 mb-3 flex items-center">
                        <Activity className="w-4 h-4 mr-2" />
                        Growth Opportunities
                      </h4>
                      <div className="space-y-2">
                        {tarotData.coaching.growth_areas && Array.isArray(tarotData.coaching.growth_areas) ? (
                          tarotData.coaching.growth_areas.map((area: string, index: number) => (
                            <div key={index} className="flex items-start">
                              <Gem className="w-4 h-4 text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                              <p className="text-blue-300 text-sm">{area}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-slate-400 text-sm">No growth areas identified</p>
                        )}
                      </div>
                    </div>

                    {/* Affirmations */}
                    <div>
                      <h4 className="font-semibold text-purple-400 mb-3 flex items-center">
                        <Heart className="w-4 h-4 mr-2" />
                        Daily Affirmations
                      </h4>
                      <div className="space-y-2">
                        {tarotData.coaching.affirmations && Array.isArray(tarotData.coaching.affirmations) ? (
                          tarotData.coaching.affirmations.map((affirmation: string, index: number) => (
                            <div key={index} className="bg-purple-900/20 border border-purple-800/30 rounded-lg p-3">
                              <p className="text-purple-300 text-sm italic">"{affirmation}"</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-slate-400 text-sm">No affirmations available</p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-400 text-center py-8">No coaching data available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Debug Info */}
        {process.env.NODE_ENV === 'development' && tarotData && (
          <div className="mt-6 p-4 bg-slate-800/30 rounded-lg border border-slate-600/30">
            <h4 className="text-purple-300 text-sm font-semibold mb-2">Debug Info (Development Only)</h4>
            <div className="text-xs text-slate-400 space-y-1">
              <p>Data loaded: {tarotData ? 'Yes' : 'No'}</p>
              <p>Birth card: {tarotData?.birth_card || 'N/A'}</p>
              <p>Life path card: {tarotData?.life_path_card || 'N/A'}</p>
              <p>Soul card: {tarotData?.soul_card || 'N/A'}</p>
              <p>Personality card: {tarotData?.personality_card || 'N/A'}</p>
              <p>Recent readings: {tarotData?.recent_readings?.length || 0}</p>
              <p>Card meanings: {tarotData?.card_meanings?.length || 0}</p>
              <p>Daily guidance: {tarotData?.daily_guidance ? 'Yes' : 'No'}</p>
              <p>Coaching data: {tarotData?.coaching ? 'Yes' : 'No'}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
