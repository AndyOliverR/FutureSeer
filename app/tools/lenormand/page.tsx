// Lenormand Divination page with Material 3 Devotionist styling
"use client"

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/use-auth'
import { useLenormand } from '@/hooks/use-lenormand-hook'
import { lenormandIntelligence } from '@/lib/lenormandIntelligence'
import { getCardDisplay, getCardImage } from '@/lib/lenormandImageMapper'
import { LenormandCoachInterface } from '@/components/LenormandCoachInterface'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Flower, 
  BookOpen,
  Sparkles,
  Target,
  Brain,
  Loader2,
  RefreshCw,
  Eye,
  Clock,
  Activity,
  Star,
  CheckCircle,
  Users,
} from 'lucide-react'
import { useToolReportUnlock } from '@/hooks/useToolReportUnlock'
import { useViralReportBypass } from '@/hooks/useViralReportBypass'
import { TeaserView } from '@/components/report-viral/TeaserView'
import { ShareCard } from '@/components/report-viral/ShareCard'
import { ViralLockOverlay } from '@/components/report-viral/LockedReportView'
import { buildToolTeaser } from '@/lib/report-viral/buildToolTeaser'
import { toolPathForSlug } from '@/lib/report-viral/toolSlugToPath'
import { cn } from '@/lib/utils'

export default function LenormandPage() {
  const { user, userProfile } = useAuth()
  const [activeTab, setActiveTab] = useState<'overview' | 'reading' | 'cards' | 'guidance' | 'ask-the-seer'>('overview')
  
  // Use the lenormand hook
  const {
    question,
    setQuestion,
    spreadType,
    setSpreadType,
    reading: currentReading,
    isLoading: isReadingLoading,
    error: readingError,
    performLenormandReading,
    resetData: resetReading
  } = useLenormand()

  const viralUnlock = useToolReportUnlock('lenormand')
  const bypassViral = useViralReportBypass()
  const [showShareCard, setShowShareCard] = useState(false)
  const [waitingLite, setWaitingLite] = useState(false)

  const showLenormandViral = Boolean(currentReading) && !bypassViral
  const lenormandTeaser = useMemo(() => buildToolTeaser('lenormand', currentReading), [currentReading])

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
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'FutureSeer — my reading',
          text: `${lenormandTeaser.archetypeName}: ${lenormandTeaser.hookLine.slice(0, 120)}…`,
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
  }, [copyLink, viralUnlock, lenormandTeaser.archetypeName, lenormandTeaser.hookLine])

  const continueWithoutSharing = useCallback(() => {
    setWaitingLite(true)
    window.setTimeout(() => {
      viralUnlock.unlockLite()
      setWaitingLite(false)
    }, 4000)
  }, [viralUnlock])

  const lenormandCompareHref = useMemo(
    () => `/tools/${toolPathForSlug('lenormand')}?friend=compare&ref=share`,
    []
  )

  const lenormandLocked =
    showLenormandViral && viralUnlock.hydrated && !viralUnlock.isUnlocked && !bypassViral

  // Get available spreads
  const [availableSpreads, setAvailableSpreads] = useState<any[]>([])
  const [allCards, setAllCards] = useState<any[]>([])
  
  useEffect(() => {
    const spreads = lenormandIntelligence.getAvailableSpreads()
    setAvailableSpreads(spreads)
    
    // Get all cards from lenormandIntelligence
    const cards = lenormandIntelligence.getAllCards()
    setAllCards(cards)
  }, [])
  
  const displayName = userProfile?.displayName || user?.displayName || "Seeker"

  // Color schemes for cycling through colorful gradients
  const colorSchemes = [
    { bg: 'from-amber-50 to-yellow-50', border: 'border-amber-200', text: 'text-amber-900', textSecondary: 'text-amber-700', textMuted: 'text-slate-600' },
    { bg: 'from-cyan-50 to-blue-50', border: 'border-cyan-200', text: 'text-cyan-900', textSecondary: 'text-cyan-700', textMuted: 'text-slate-600' },
    { bg: 'from-blue-50 to-indigo-50', border: 'border-blue-200', text: 'text-blue-900', textSecondary: 'text-blue-700', textMuted: 'text-slate-600' },
    { bg: 'from-purple-50 to-pink-50', border: 'border-purple-200', text: 'text-purple-900', textSecondary: 'text-purple-700', textMuted: 'text-slate-600' },
  ]

  return (
    <div className="relative min-h-screen starfield-ultra-sharp">
      
      <div className="relative z-10 container mx-auto px-4 pt-4 pb-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <h1 className="text-3xl font-serif mb-2 flex items-center justify-center gap-2">
            <span className="text-3xl">🍀</span>
            <span className="bg-gradient-to-b from-amber-200 via-yellow-400 to-amber-600 bg-clip-text text-transparent">
              Lenormand Divination
            </span>
          </h1>
          <p className="text-slate-300 mt-2">
            Discover practical guidance through the 36-card Lenormand system
          </p>
        </motion.div>

        {showLenormandViral && !bypassViral && (
          <div className="mb-6 space-y-4">
            <TeaserView teaser={lenormandTeaser} />
            {showShareCard && (
              <ShareCard
                archetypeName={lenormandTeaser.archetypeName}
                hookLine={lenormandTeaser.hookLine}
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

        {showLenormandViral && viralUnlock.isUnlocked && !bypassViral && (
          <div className="mb-4 flex justify-center">
            <Link
              href={lenormandCompareHref}
              className="inline-flex items-center gap-2 rounded-full border border-violet-500/40 bg-violet-950/40 px-4 py-2 text-sm font-medium text-violet-100 hover:bg-violet-900/50"
            >
              <Users className="h-4 w-4" />
              Compare with a friend
            </Link>
          </div>
        )}

        {/* Main Content */}
        <div className="rounded-2xl border border-amber-500/30 bg-slate-900/80 overflow-hidden">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full min-w-0">
          <TabsList className="flex w-full flex-nowrap overflow-x-auto gap-1 sm:gap-2 p-2 sm:p-3 bg-slate-800/50 border-b border-amber-500/20 rounded-none h-auto min-h-0 justify-start [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-amber-500/30">
            <TabsTrigger value="overview" className="devotionist-tab-trigger shrink-0 rounded-t-lg rounded-b-none data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 border border-transparent data-[state=inactive]:border-slate-600/50 text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30">
              <Eye className="w-4 h-4 mr-1" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="reading" className="devotionist-tab-trigger shrink-0 rounded-t-lg rounded-b-none data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 border border-transparent data-[state=inactive]:border-slate-600/50 text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30">
              <Sparkles className="w-4 h-4 mr-1" />
              Reading
            </TabsTrigger>
            <TabsTrigger value="cards" className="devotionist-tab-trigger shrink-0 rounded-t-lg rounded-b-none data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 border border-transparent data-[state=inactive]:border-slate-600/50 text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30">
              <BookOpen className="w-4 h-4 mr-1" />
              Cards
            </TabsTrigger>
            <TabsTrigger value="guidance" className="devotionist-tab-trigger shrink-0 rounded-t-lg rounded-b-none data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 border border-transparent data-[state=inactive]:border-slate-600/50 text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30">
              <Target className="w-4 h-4 mr-1" />
              Guidance
            </TabsTrigger>
            <TabsTrigger value="ask-the-seer" className="devotionist-tab-trigger shrink-0 rounded-t-lg rounded-b-none data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 border border-transparent data-[state=inactive]:border-slate-600/50 text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30">
              <Brain className="w-4 h-4 mr-1" />
              Ask the seer
            </TabsTrigger>
          </TabsList>

          {showLenormandViral && !viralUnlock.hydrated ? (
            <div className="py-12 text-center text-slate-400">Loading report…</div>
          ) : (
            <div className="relative min-h-[320px]">
              {lenormandLocked && (
                <ViralLockOverlay
                  onUnlockClick={handleShareToUnlock}
                  onContinueWithoutSharing={waitingLite ? () => {} : continueWithoutSharing}
                  continueDisabled={waitingLite}
                />
              )}
              <div
                className={cn(
                  lenormandLocked &&
                    'pointer-events-none select-none blur-sm filter transition-[filter] duration-300 [&_*]:pointer-events-none'
                )}
              >
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Lenormand Profile Summary */}
              <Card elevation={2} className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-xl shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-amber-900 text-lg flex items-center">
                    <Flower className="w-5 h-5 mr-2" />
                    Your Lenormand Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {user ? (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-700">Welcome,</span>
                        <span className="text-amber-900 font-bold">{displayName}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-700">Ready to read?</span>
                        <Badge variant="outline" className="border-amber-500 text-amber-700 bg-amber-100">
                          Yes
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-700 text-sm">Sign in to personalize your readings</p>
                  )}
                </CardContent>
              </Card>

              {/* Recent Readings */}
              <Card elevation={2} className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-xl shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-amber-900 text-lg flex items-center">
                    <Clock className="w-5 h-5 mr-2" />
                    Recent Readings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {currentReading ? (
                    <div className="space-y-2">
                      <p className="text-slate-700 text-sm">
                        Last reading completed
                      </p>
                      <div className="text-xs text-slate-600">
                        {new Date(currentReading.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-slate-700 text-sm">No readings performed yet</p>
                      <p className="text-xs text-slate-600">
                        Start your first reading to begin
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card elevation={2} className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-xl shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-amber-900 text-lg flex items-center">
                    <Activity className="w-5 h-5 mr-2" />
                    Deck Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-amber-700">Cards:</span>
                      <span className="text-slate-900 font-semibold">36</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-amber-700">Spreads:</span>
                      <span className="text-slate-900 font-semibold">5</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-amber-700">Style:</span>
                      <span className="text-slate-900 font-semibold">Practical</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card elevation={2} className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-xl shadow-sm">
              <CardHeader>
                <CardTitle className="text-amber-900 text-lg flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    onClick={() => setActiveTab('reading')}
                    className="bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white rounded-xl"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    New Reading
                  </Button>
                  <Button
                    onClick={() => setActiveTab('cards')}
                    variant="outline"
                    className="border-amber-600 text-amber-700 hover:bg-amber-100 rounded-xl"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Card Meanings
                  </Button>
                  <Button
                    onClick={() => setActiveTab('guidance')}
                    variant="outline"
                    className="border-amber-600 text-amber-700 hover:bg-amber-100 rounded-xl"
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Daily Guidance
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reading Tab */}
          <TabsContent value="reading" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
            <Card elevation={2} className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md">
              <CardHeader>
                <CardTitle className="text-amber-900 text-lg flex items-center">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Lenormand Reading
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                {!currentReading ? (
                  <div className="space-y-4">
                    {/* Question Input */}
                    <div>
                      <label className="block text-amber-900 text-sm font-medium mb-2">
                        What would you like guidance on, {displayName}?
                      </label>
                      <textarea
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Ask your question here..."
                        className="w-full p-3 bg-white border-2 border-amber-200 rounded-xl text-slate-800 placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all duration-300"
                        rows={3}
                      />
                    </div>

                    {/* Spread Selection */}
                    <div>
                      <label className="block text-amber-900 text-sm font-medium mb-2">
                        Choose a spread
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {availableSpreads.map((spread) => (
                          <button
                            key={spread.name}
                            onClick={() => setSpreadType(spread.value)}
                            className={`p-3 rounded-xl border-2 text-left transition-colors ${
                              spreadType === spread.value
                                ? 'bg-gradient-to-br from-amber-100 to-yellow-100 border-amber-300 text-amber-900 shadow-md'
                                : 'bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200 text-slate-700 hover:border-amber-300 hover:shadow-sm'
                            }`}
                          >
                            <div className="font-medium">{spread.name}</div>
                            <div className="text-xs text-slate-600 mt-1">
                              {spread.description}
                            </div>
                            <div className={`text-xs mt-1 ${spreadType === spread.value ? 'text-amber-700' : 'text-amber-600'}`}>
                              {spread.cardCount} card{spread.cardCount > 1 ? 's' : ''}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Perform Reading Button */}
                    <Button
                      onClick={performLenormandReading}
                      disabled={!question.trim() || !spreadType || isReadingLoading}
                      className="w-full bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white"
                    >
                      {isReadingLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Consulting the Cards...
                        </>
                      ) : (
                        <>
                          <Flower className="w-4 h-4 mr-2" />
                          Draw Cards
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
                  <div className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                    {/* Reading Header */}
                    <div className="text-center">
                      <h3 className="text-xl font-semibold bg-gradient-to-b from-amber-600 via-yellow-600 to-amber-700 bg-clip-text text-transparent mb-2">
                        {currentReading.cards.length} Card Reading
                      </h3>
                      <p className="text-slate-700 text-sm">Question: {currentReading.question}</p>
                      <p className="text-slate-600 text-xs">Reading ID: {currentReading.id}</p>
                    </div>

                    {/* Cards Display */}
                    <div className={`grid gap-4 ${
                      currentReading.spreadType === 'nine' 
                        ? 'grid-cols-3' 
                        : currentReading.spreadType === 'grandTableau'
                        ? 'grid-cols-9'
                        : currentReading.spreadType === 'lineOfFive'
                        ? 'grid-cols-5'
                        : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                    }`}>
                      {currentReading.cards.map((card: any, index: number) => {
                        const scheme = colorSchemes[index % colorSchemes.length]
                        return (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`bg-gradient-to-br ${scheme.bg} rounded-xl p-4 border-2 ${scheme.border} shadow-md hover:shadow-xl transition-shadow`}
                          >
                            <div className="text-center">
                              <div className={`text-sm font-medium ${scheme.textSecondary} mb-2`}>
                                {currentReading.positions[index]}
                              </div>
                              {/* Card Display */}
                              <div className="mb-3 flex justify-center">
                                <img 
                                  src={getCardImage(card)} 
                                  alt={card.name}
                                  className="w-32 h-auto rounded-lg shadow-lg"
                                  onError={(e) => {
                                    // Fallback to emoji if image fails to load
                                    e.currentTarget.style.display = 'none'
                                    const fallback = e.currentTarget.nextElementSibling as HTMLElement
                                    if (fallback) fallback.style.display = 'block'
                                  }}
                                />
                                <div className="text-6xl hidden">
                                  {getCardDisplay(card)}
                                </div>
                              </div>
                              <div className={`text-lg font-bold ${scheme.text} mb-2`}>
                                {card.name}
                              </div>
                              <div className={`text-xs ${scheme.textMuted} mb-2`}>
                                {card.number}. {card.keywords.join(' • ')}
                              </div>
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>

                    {/* Overall Reading Summary */}
                    <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-4 border-2 border-amber-200 shadow-md">
                      <h4 className="font-semibold text-amber-900 mb-3">Overall Reading</h4>
                      <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
                        {currentReading.overallReading}
                      </p>
                    </div>

                    {/* Individual Card Readings */}
                    {currentReading.individualCardReadings && currentReading.individualCardReadings.length > 0 && (
                      <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-4 border-2 border-cyan-200 shadow-md">
                        <h4 className="font-semibold text-cyan-900 mb-3">Individual Card Interpretations</h4>
                        <div className="space-y-3">
                          {currentReading.individualCardReadings.map((cardReading: any, index: number) => (
                            <div key={index} className="border-b border-cyan-200/50 pb-3 last:border-0">
                              <div className="flex items-start gap-3">
                                <div className="mt-1 flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 border border-cyan-400/50 shadow-lg shadow-cyan-500/20">
                                  <span className="text-xs font-bold text-white">
                                    {index + 1}
                                  </span>
                                </div>
                                <div className="flex-1">
                                  <div className="font-semibold text-cyan-900 text-sm mb-1">
                                    {cardReading.cardName} - {cardReading.position}
                                  </div>
                                  <p className="text-slate-700 text-sm leading-relaxed">
                                    {cardReading.interpretation}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Card Combinations */}
                    {currentReading.combinations && currentReading.combinations.length > 0 && (
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border-2 border-blue-200 shadow-md">
                        <h4 className="font-semibold text-blue-900 mb-3">Card Combinations</h4>
                        <div className="space-y-2">
                          {currentReading.combinations.map((combo: any, index: number) => (
                            <div key={index} className="flex items-start gap-2">
                              <Star className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                              <p className="text-slate-700 text-sm">
                                <span className="font-semibold text-blue-900">{combo.cards.join(' + ')}:</span> {combo.meaning}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Timing Insights */}
                    {currentReading.timing && (
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200 shadow-md">
                        <h4 className="font-semibold text-purple-900 mb-3">Timing</h4>
                        <p className="text-slate-700 text-sm">
                          {currentReading.timing}
                        </p>
                      </div>
                    )}

                    {/* Advice */}
                    {currentReading.advice && currentReading.advice.length > 0 && (
                      <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-4 border-2 border-amber-200 shadow-md">
                        <h4 className="font-semibold text-amber-900 mb-3">Practical Advice</h4>
                        <ul className="space-y-2">
                          {currentReading.advice.map((advice: string, index: number) => (
                            <li key={index} className="text-slate-700 text-sm flex items-start">
                              <CheckCircle className="w-4 h-4 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
                              {advice}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Reset Button */}
                    <div className="text-center">
                      <Button
                        onClick={resetReading}
                        variant="outline"
                        className="border-amber-600 text-amber-700 hover:bg-amber-100 rounded-xl"
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
          <TabsContent value="cards" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
            <Card elevation={2} className="bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 border-2 border-purple-200 rounded-2xl shadow-lg">
              <CardHeader>
                <CardTitle className="text-purple-900 text-lg flex items-center">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Lenormand Card Meanings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {allCards.map((card, index) => {
                    const scheme = colorSchemes[index % colorSchemes.length]
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className={`bg-gradient-to-br ${scheme.bg} rounded-xl p-4 border-2 ${scheme.border} shadow-md hover:shadow-xl transition-all`}
                      >
                        <div className="text-center">
                          <div className="mb-3 flex justify-center">
                            <img 
                              src={getCardImage(card)} 
                              alt={card.name}
                              className="w-24 h-auto rounded-lg shadow-lg"
                              onError={(e) => {
                                // Fallback to emoji if image fails to load
                                e.currentTarget.style.display = 'none'
                                const fallback = e.currentTarget.nextElementSibling as HTMLElement
                                if (fallback) fallback.style.display = 'block'
                              }}
                            />
                            <div className="text-5xl hidden">
                              {getCardDisplay(card)}
                            </div>
                          </div>
                          <div className={`text-xs ${scheme.textSecondary} mb-1`}>
                            Card {card.number}
                          </div>
                          <h4 className={`font-semibold ${scheme.text} mb-2 text-sm`}>{card.name}</h4>
                          <div className={`text-xs ${scheme.textMuted} mb-2`}>
                            {card.playingCard || 'N/A'}
                          </div>
                          <div className={`text-xs ${scheme.textMuted} mb-2`}>
                            Keywords: {card.keywords.join(', ')}
                          </div>
                          <div className={`text-xs ${scheme.textMuted} mb-2`}>
                            {card.description.substring(0, 100)}...
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Guidance Tab */}
          <TabsContent value="guidance" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
            <Card elevation={2} className="bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 border-2 border-purple-200 rounded-2xl shadow-lg">
              <CardHeader>
                <CardTitle className="text-purple-900 text-lg flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  Daily Guidance
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentReading?.advice && currentReading.advice.length > 0 ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-purple-900 mb-2">Guidance from Your Reading</h4>
                      <p className="text-slate-700 text-sm">
                        Based on your latest reading, here are practical insights and recommendations.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-purple-900 mb-2">Recommendations</h4>
                      <div className="space-y-2">
                        {currentReading.advice.map((advice: string, index: number) => (
                          <div key={index} className="flex items-start">
                            <CheckCircle className="w-4 h-4 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                            <p className="text-slate-700 text-sm">{advice}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-purple-900 mb-3">Welcome to Lenormand Guidance</h4>
                      <p className="text-slate-700 text-sm mb-4">
                        Lenormand cards offer practical, direct guidance for everyday life. Here are essential principles to help you get the most from your readings.
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <CheckCircle className="w-4 h-4 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-slate-700 text-sm font-semibold">Card Combinations</p>
                          <p className="text-slate-600 text-xs">Lenormand meaning comes from how cards combine. Cards modify each other to create a narrative.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <CheckCircle className="w-4 h-4 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-slate-700 text-sm font-semibold">Practical Focus</p>
                          <p className="text-slate-600 text-xs">Focus on the what, when, and where rather than deep psychology. Lenormand answers concrete questions.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <CheckCircle className="w-4 h-4 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-slate-700 text-sm font-semibold">Position Matters</p>
                          <p className="text-slate-600 text-xs">In multi-card spreads, position determines meaning. Ask clear, specific questions for best results.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <CheckCircle className="w-4 h-4 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-slate-700 text-sm font-semibold">No Reversals</p>
                          <p className="text-slate-600 text-xs">Lenormand cards don't have reversed meanings. Context comes from surrounding cards and position.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <CheckCircle className="w-4 h-4 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-slate-700 text-sm font-semibold">Timing Indicators</p>
                          <p className="text-slate-600 text-xs">Certain cards suggest timing. The Sun, Moon, and Stars often relate to days, weeks, or months.</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 p-4 bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-xl shadow-md">
                      <p className="text-amber-900 text-sm font-semibold mb-2">Ready to begin?</p>
                      <p className="text-slate-700 text-xs">
                        Perform your first Lenormand reading to receive personalized guidance based on your cards and situation.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

              </div>
            </div>
          )}

          {/* Ask the Seer Tab */}
          <TabsContent value="ask-the-seer" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
            <LenormandCoachInterface
              reading={currentReading ?? null}
              userProfile={userProfile}
              onSwitchToReading={() => setActiveTab('reading')}
            />
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </div>
  )
}
