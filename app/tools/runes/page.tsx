// Runes page that integrates with comprehensive profile data and runes intelligence
"use client"

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/use-auth'
import { useRunes } from '@/hooks/use-runes'
import { runesIntelligence } from '@/lib/runesIntelligence'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import RunesSeerChatInterface from '@/components/RunesSeerChatInterface'
import {
  Sparkles,
  Clock,
  Zap,
  MessageCircle,
  User,
  Eye,
  Target,
  Activity,
  BookOpen,
  Loader2,
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

export default function RunesPage() {
  const { userProfile } = useAuth()
  const [activeTab, setActiveTab] = useState<'overview' | 'reading' | 'runes' | 'guidance' | 'ask-the-seer'>('overview')
  
  // Use the runes hook
  const {
    question,
    setQuestion,
    spreadType,
    setSpreadType,
    reading: currentReading,
    isLoading: isReadingLoading,
    error: readingError,
    performRuneReading
  } = useRunes()

  const viralUnlock = useToolReportUnlock('runes')
  const bypassViral = useViralReportBypass()
  const [showShareCard, setShowShareCard] = useState(false)
  const [waitingLite, setWaitingLite] = useState(false)

  const showRunesViral = Boolean(currentReading) && !bypassViral
  const runesTeaser = useMemo(() => buildToolTeaser('runes', currentReading), [currentReading])

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
          text: `${runesTeaser.archetypeName}: ${runesTeaser.hookLine.slice(0, 120)}…`,
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
  }, [copyLink, viralUnlock, runesTeaser.archetypeName, runesTeaser.hookLine])

  const continueWithoutSharing = useCallback(() => {
    setWaitingLite(true)
    window.setTimeout(() => {
      viralUnlock.unlockLite()
      setWaitingLite(false)
    }, 4000)
  }, [viralUnlock])

  const runesCompareHref = useMemo(() => `/tools/${toolPathForSlug('runes')}?friend=compare&ref=share`, [])

  const runesLocked =
    showRunesViral && viralUnlock.hydrated && !viralUnlock.isUnlocked && !bypassViral

  // Get available spreads
  const [availableSpreads, setAvailableSpreads] = useState<any[]>([])
  const [allRunes, setAllRunes] = useState<any[]>([])
  
  useEffect(() => {
    const spreads = [
      {
        name: 'single',
        displayName: 'Single Rune',
        description: 'A single rune for quick guidance and insight.',
        runeCount: 1
      },
      {
        name: 'three',
        displayName: 'Three Runes',
        description: 'Past, Present, and Future insight.',
        runeCount: 3
      },
      {
        name: 'five',
        displayName: 'Five Runes',
        description: 'Situation, Challenge, Advice, Outcome, and Hidden Influence.',
        runeCount: 5
      },
      {
        name: 'nine',
        displayName: 'Nine Runes',
        description: 'Comprehensive reading covering all aspects of life.',
        runeCount: 9
      }
    ]
    setAvailableSpreads(spreads)
    
    // Load all runes for reference guide
    const runes = runesIntelligence.getAllRunes()
    setAllRunes(runes)
  }, [])

  return (
    <div className="relative min-h-screen starfield-ultra-sharp">
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 pt-4 text-center"
        >
          <h1 className="text-3xl font-serif bg-gradient-to-b from-amber-200 via-yellow-400 to-amber-600 bg-clip-text text-transparent mb-3">
            ᚱ Rune Divination
          </h1>
          <p className="text-slate-200 leading-relaxed text-xl font-light mb-2">
            Discover ancient Norse wisdom and guidance through the sacred symbols of the Elder Futhark
          </p>
          <p className="text-slate-200 leading-relaxed text-xl font-light">
            Runes provide guidance and perspective - you have the power to shape your destiny
          </p>
        </motion.div>

        {showRunesViral && !bypassViral && (
          <div className="mb-6 space-y-4">
            <TeaserView teaser={runesTeaser} />
            {showShareCard && (
              <ShareCard
                archetypeName={runesTeaser.archetypeName}
                hookLine={runesTeaser.hookLine}
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

        {showRunesViral && viralUnlock.isUnlocked && !bypassViral && (
          <div className="mb-4 flex justify-center">
            <Link
              href={runesCompareHref}
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
            <TabsTrigger value="overview" className="shrink-0 text-sm font-medium data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 rounded-t-lg rounded-b-none px-4 py-2.5 text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 transition-all flex items-center justify-center border border-transparent data-[state=inactive]:border-slate-600/50">
              <Eye className="w-4 h-4 mr-1" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="reading" className="shrink-0 text-sm font-medium data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 rounded-t-lg rounded-b-none px-4 py-2.5 text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 transition-all flex items-center justify-center border border-transparent data-[state=inactive]:border-slate-600/50">
              <Sparkles className="w-4 h-4 mr-1" />
              Reading
            </TabsTrigger>
            <TabsTrigger value="runes" className="shrink-0 text-sm font-medium data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 rounded-t-lg rounded-b-none px-4 py-2.5 text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 transition-all flex items-center justify-center border border-transparent data-[state=inactive]:border-slate-600/50">
              <BookOpen className="w-4 h-4 mr-1" />
              Runes
            </TabsTrigger>
            <TabsTrigger value="guidance" className="shrink-0 text-sm font-medium data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 rounded-t-lg rounded-b-none px-4 py-2.5 text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 transition-all flex items-center justify-center border border-transparent data-[state=inactive]:border-slate-600/50">
              <Target className="w-4 h-4 mr-1" />
              Guidance
            </TabsTrigger>
            <TabsTrigger value="ask-the-seer" className="shrink-0 text-sm font-medium data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 rounded-t-lg rounded-b-none px-4 py-2.5 text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 transition-all flex items-center justify-center border border-transparent data-[state=inactive]:border-slate-600/50">
              <MessageCircle className="w-4 h-4 mr-1" />
              Ask the Seer
            </TabsTrigger>
          </TabsList>

          {showRunesViral && !viralUnlock.hydrated ? (
            <div className="py-12 text-center text-slate-400">Loading report…</div>
          ) : (
            <div className="relative">
              {runesLocked && (
                <ViralLockOverlay
                  onUnlockClick={handleShareToUnlock}
                  onContinueWithoutSharing={waitingLite ? () => {} : continueWithoutSharing}
                  continueDisabled={waitingLite}
                />
              )}
              <div
                className={cn(
                  runesLocked &&
                    'pointer-events-none select-none blur-sm filter transition-[filter] duration-300 [&_*]:pointer-events-none'
                )}
              >
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Runes Profile Summary */}
              <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-2xl shadow-lg overflow-hidden">
                <CardHeader className="pb-3 bg-gradient-to-r from-amber-100 to-yellow-100">
                  <CardTitle className="text-amber-900 text-lg flex items-center">
                    <User className="w-5 h-5 mr-2 text-amber-700" />
                    Your Runic Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-slate-700">
                  {userProfile?.birthDate ? (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Profile Status:</span>
                        <span className="text-amber-800 font-bold">Active</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Name:</span>
                        <span className="text-amber-800 font-bold">
                          {userProfile.displayName || 'Seeker'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 mt-2">
                        Your profile enhances rune interpretations with personalized insights
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-slate-600 text-sm">Complete your profile for personalized readings</p>
                      <Button
                        onClick={() => window.location.href = '/profile'}
                        variant="outline"
                        size="sm"
                        className="w-full border-2 border-amber-500 text-amber-800 hover:bg-amber-100 rounded-xl"
                      >
                        <User className="w-4 h-4 mr-2" />
                        Complete Profile
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Readings */}
              <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-2xl shadow-lg overflow-hidden">
                <CardHeader className="pb-3 bg-gradient-to-r from-amber-100 to-yellow-100">
                  <CardTitle className="text-amber-900 text-lg flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-amber-700" />
                    Recent Readings
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-slate-700">
                  {currentReading ? (
                    <div className="space-y-2">
                      <p className="text-amber-800 text-sm font-medium">
                        Last reading: {currentReading.spreadName}
                      </p>
                      <div className="text-xs text-slate-600">
                        Question: {currentReading.question.substring(0, 50)}...
                      </div>
                      <div className="text-xs text-slate-600">
                        {new Date(currentReading.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-slate-600 text-sm">No readings performed yet</p>
                      <p className="text-xs text-slate-500">
                        Start your first reading to begin your runic journey
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Elemental Balance */}
              <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-2xl shadow-lg overflow-hidden">
                <CardHeader className="pb-3 bg-gradient-to-r from-amber-100 to-yellow-100">
                  <CardTitle className="text-amber-900 text-lg flex items-center">
                    <Zap className="w-5 h-5 mr-2 text-amber-700" />
                    Elemental Balance
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-slate-700">
                  {currentReading?.elementalBalance ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-red-700">Fire:</span>
                          <span className="text-amber-800 font-medium">{currentReading.elementalBalance.fire || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-amber-700">Earth:</span>
                          <span className="text-amber-800 font-medium">{currentReading.elementalBalance.earth || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-700">Air:</span>
                          <span className="text-amber-800 font-medium">{currentReading.elementalBalance.air || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-cyan-700">Water:</span>
                          <span className="text-amber-800 font-medium">{currentReading.elementalBalance.water || 0}</span>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-amber-300">
                        <div className="text-xs text-slate-600">
                          Primary: <span className="text-amber-800 font-medium capitalize">{currentReading.elementalBalance.primary || 'N/A'}</span>
                        </div>
                        <div className="text-xs text-slate-600">
                          Secondary: <span className="text-amber-800 font-medium capitalize">{currentReading.elementalBalance.secondary || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-600 text-sm">Perform a reading to see elemental balance</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-2xl shadow-lg overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-amber-100 to-yellow-100">
                <CardTitle className="text-amber-900 text-lg flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-amber-700" />
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
                    onClick={() => setActiveTab('runes')}
                    variant="outline"
                    className="border-2 border-amber-500 text-amber-800 hover:bg-amber-100 rounded-xl"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Rune Meanings
                  </Button>
                  <Button
                    onClick={() => setActiveTab('guidance')}
                    variant="outline"
                    className="border-2 border-amber-500 text-amber-800 hover:bg-amber-100 rounded-xl"
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
            <Card className="bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 border-2 border-amber-300 rounded-2xl shadow-lg overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-amber-100 to-yellow-100">
                <CardTitle className="text-amber-900 text-lg flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 text-amber-700" />
                  Rune Reading
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 text-slate-700">
                {!currentReading ? (
                  <div className="space-y-4">
                    {/* Question Input */}
                    <div>
                      <label className="block text-slate-700 text-sm font-medium mb-2">
                        What would you like guidance on?
                      </label>
                      <textarea
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Ask your question here... Remember, runes provide guidance and perspective, not fixed predictions."
                        className="w-full p-3 bg-white border-2 border-amber-200 rounded-2xl text-slate-800 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all duration-300"
                        rows={3}
                      />
                    </div>

                    {/* Spread Selection */}
                    <div>
                      <label className="block text-slate-700 text-sm font-medium mb-2">
                        Choose a spread
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {availableSpreads.map((spread) => (
                          <button
                            key={spread.name}
                            onClick={() => setSpreadType(spread.name)}
                            className={`p-3 rounded-2xl border-2 text-left transition-colors ${
                              spreadType === spread.name
                                ? 'border-amber-500 bg-amber-100 text-amber-900'
                                : 'border-amber-200 bg-white text-slate-700 hover:border-amber-400'
                            }`}
                          >
                            <div className="font-medium">{spread.displayName}</div>
                            <div className="text-xs text-slate-600 mt-1">
                              {spread.description}
                            </div>
                            <div className="text-xs text-amber-700 mt-1">
                              {spread.runeCount} rune{spread.runeCount > 1 ? 's' : ''}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Perform Reading Button */}
                    <Button
                      onClick={performRuneReading}
                      disabled={!question.trim() || !spreadType || isReadingLoading}
                      className="w-full bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white rounded-xl"
                    >
                      {isReadingLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Casting Runes...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Cast the Runes
                        </>
                      )}
                    </Button>

                    {readingError && (
                      <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-3">
                        <p className="text-red-700 text-sm">{readingError}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Reading Header */}
                    <div className="text-center">
                      <h3 className="text-xl font-semibold text-amber-900 mb-2">
                        {currentReading.spreadName}
                      </h3>
                      <p className="text-slate-700 text-sm">Question: {currentReading.question}</p>
                      <p className="text-slate-500 text-xs">Reading ID: {currentReading.id}</p>
                    </div>

                    {/* Runes Display */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {currentReading.runes.map((rune: any, index: number) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-4 border-2 border-amber-300 shadow-md"
                        >
                          <div className="text-center">
                            <div className="text-sm font-medium text-amber-800 mb-2">
                              {rune.position}
                            </div>
                            {/* Rune Symbol */}
                            <div className="mb-3 flex justify-center">
                              <div className={`relative w-24 h-24 rounded-xl overflow-hidden border-2 border-amber-400 flex items-center justify-center bg-gradient-to-br from-amber-100 to-yellow-100 ${rune.isReversed ? 'transform rotate-180' : ''}`}>
                                <span className="text-5xl font-bold text-amber-800">{rune.symbol}</span>
                              </div>
                            </div>
                            <div className="text-lg font-bold text-amber-900 mb-2">
                              {rune.name}
                            </div>
                            <div className="text-xs text-slate-600 mb-2">
                              {rune.element ? rune.element.charAt(0).toUpperCase() + rune.element.slice(1) : 'Unknown'} • {rune.deity}
                            </div>
                            <div className="text-xs mb-2">
                              <Badge 
                                variant="outline" 
                                className={`text-xs rounded-xl ${rune.isReversed ? 'bg-red-100 border-red-400 text-red-800' : 'bg-amber-200 border-amber-500 text-amber-900'}`}
                              >
                                {rune.isReversed ? 'Reversed' : 'Upright'}
                              </Badge>
                            </div>
                            <div className="text-sm text-slate-700 mb-3">
                              {rune.isReversed ? rune.reversed : rune.upright}
                            </div>
                            <div className="text-xs text-slate-600">
                              Energy: {rune.energy}/10
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Overall Reading */}
                    {currentReading.overallReading && (
                      <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-4 border-2 border-amber-300">
                        <h4 className="font-semibold text-amber-900 mb-3">
                          Runic Guidance
                        </h4>
                        <p className="text-slate-700 text-sm leading-relaxed">
                          {currentReading.overallReading}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Runes Tab */}
          <TabsContent value="runes" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
            {/* Rune Reference Guide - Always show all 24 runes */}
            <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-2xl shadow-lg overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-amber-100 to-yellow-100">
                <CardTitle className="text-amber-900 text-lg flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-amber-700" />
                  Elder Futhark Rune Reference Guide
                </CardTitle>
                <p className="text-slate-600 text-sm mt-2">
                  All 24 runes of the Elder Futhark with their meanings, upright and reversed interpretations
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allRunes.map((rune: any, index: number) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                    >
                      <Card className="bg-white border-2 border-amber-200 hover:border-amber-400 rounded-2xl shadow-md transition-colors overflow-hidden">
                        <CardContent className="p-4 text-slate-700">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <span className="text-4xl font-bold text-amber-700">{rune.symbol}</span>
                              <div>
                                <h4 className="font-semibold text-amber-900">
                                  {rune.name}
                                </h4>
                                <p className="text-xs text-slate-600">Meaning: {rune.meaning}</p>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="font-medium text-amber-800">Element:</span>{' '}
                              <span className="text-slate-700 capitalize">{rune.element}</span>
                            </div>
                            <div>
                              <span className="font-medium text-amber-800">Deity:</span>{' '}
                              <span className="text-slate-700">{rune.deity}</span>
                            </div>
                          </div>
                          <div className="mt-3 pt-3 border-t border-amber-200">
                            <div className="mb-2">
                              <Badge variant="outline" className="text-xs bg-amber-200 border-amber-500 text-amber-900 rounded-xl mb-2">
                                Upright
                              </Badge>
                              <p className="text-xs text-slate-700 mt-1">{rune.upright}</p>
                            </div>
                            <div>
                              <Badge variant="outline" className="text-xs bg-red-100 border-red-400 text-red-800 rounded-xl mb-2">
                                Reversed
                              </Badge>
                              <p className="text-xs text-slate-700 mt-1">{rune.reversed}</p>
                            </div>
                          </div>
                          {rune.description && (
                            <p className="text-xs text-slate-600 mt-3 italic">{rune.description}</p>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Reading-specific Runes (if available) */}
            {currentReading && (
              <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-amber-300 rounded-2xl shadow-lg overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-amber-100 to-yellow-100">
                  <CardTitle className="text-amber-900 text-lg">Your Reading Runes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentReading.runes.map((rune: any, index: number) => (
                      <Card key={index} className="bg-white border-2 border-amber-200 rounded-2xl shadow-md overflow-hidden">
                        <CardContent className="p-4 text-slate-700">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <span className="text-4xl font-bold text-amber-700">{rune.symbol}</span>
                              <div>
                                <h4 className="font-semibold text-amber-900">
                                  {rune.name}
                                </h4>
                                <p className="text-xs text-slate-600">{rune.position}</p>
                              </div>
                            </div>
                            <Badge 
                              variant="outline" 
                              className={`text-xs rounded-xl ${rune.isReversed ? 'bg-red-100 border-red-400 text-red-800' : 'bg-amber-200 border-amber-500 text-amber-900'}`}
                            >
                              {rune.isReversed ? 'Reversed' : 'Upright'}
                            </Badge>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="font-medium text-amber-800">Meaning:</span>{' '}
                              <span className="text-slate-700">{rune.meaning}</span>
                            </div>
                            <div>
                              <span className="font-medium text-amber-800">Element:</span>{' '}
                              <span className="text-slate-700 capitalize">{rune.element}</span>
                            </div>
                            <div>
                              <span className="font-medium text-amber-800">Deity:</span>{' '}
                              <span className="text-slate-700">{rune.deity}</span>
                            </div>
                            <div>
                              <span className="font-medium text-amber-800">Energy:</span>{' '}
                              <span className="text-slate-700">{rune.energy}/10</span>
                            </div>
                          </div>
                          <div className="mt-3 pt-3 border-t border-amber-200">
                            <p className="text-slate-700 text-sm">
                              {rune.isReversed ? rune.reversed : rune.upright}
                            </p>
                          </div>
                          {rune.timing && (
                            <p className="text-slate-600 mt-2 text-xs">{rune.timing}</p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Guidance Tab */}
          <TabsContent value="guidance" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
            {currentReading ? (
              <div className="space-y-6">
                {/* Recommendations */}
                {currentReading.recommendations && currentReading.recommendations.length > 0 && (
                  <Card className="bg-gradient-to-br from-green-50 to-teal-50 border-2 border-amber-300 rounded-2xl shadow-lg overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-amber-100 to-yellow-100">
                      <CardTitle className="text-amber-900 text-lg">Runic Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-slate-700">
                        {currentReading.recommendations.map((recommendation: string, index: number) => (
                          <div key={index} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-sm">{recommendation}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Timing Analysis */}
                {currentReading.timing && (
                  <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-amber-300 rounded-2xl shadow-lg overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-amber-100 to-yellow-100">
                      <CardTitle className="text-amber-900 text-lg">Timing Guidance</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-slate-700">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-700" />
                        <span className="text-sm text-slate-600">Current Phase:</span>
                        <span className="text-amber-900 font-medium">{currentReading.timing.currentPhase}</span>
                      </div>
                      {currentReading.timing.favorablePeriods && currentReading.timing.favorablePeriods.length > 0 && (
                        <div>
                          <span className="text-sm text-slate-600 font-medium">Favorable Periods:</span>
                          <div className="mt-1 space-y-1">
                            {currentReading.timing.favorablePeriods.map((period: string, index: number) => (
                              <div key={index} className="flex items-center gap-2">
                                <div className="w-1 h-1 bg-green-600 rounded-full"></div>
                                <span className="text-sm">{period}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {currentReading.timing.opportunities && currentReading.timing.opportunities.length > 0 && (
                        <div>
                          <span className="text-sm text-slate-600 font-medium">Opportunities:</span>
                          <div className="mt-1 space-y-1">
                            {currentReading.timing.opportunities.map((opportunity: string, index: number) => (
                              <div key={index} className="flex items-center gap-2">
                                <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
                                <span className="text-sm">{opportunity}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Coaching Insights */}
                {currentReading.coaching && (
                  <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-amber-300 rounded-2xl shadow-lg overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-amber-100 to-yellow-100">
                      <CardTitle className="text-amber-900 text-lg">Self-Reflection Insights</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-slate-700">
                      {currentReading.coaching.strengths && currentReading.coaching.strengths.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-green-800 mb-2">Strengths</h4>
                          <div className="space-y-1">
                            {currentReading.coaching.strengths.map((strength: string, index: number) => (
                              <div key={index} className="text-sm">• {strength}</div>
                            ))}
                          </div>
                        </div>
                      )}
                      {currentReading.coaching.challenges && currentReading.coaching.challenges.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-amber-800 mb-2">Challenges</h4>
                          <div className="space-y-1">
                            {currentReading.coaching.challenges.map((challenge: string, index: number) => (
                              <div key={index} className="text-sm">• {challenge}</div>
                            ))}
                          </div>
                        </div>
                      )}
                      {currentReading.coaching.growthAreas && currentReading.coaching.growthAreas.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-blue-800 mb-2">Growth Areas</h4>
                          <div className="space-y-1">
                            {currentReading.coaching.growthAreas.map((area: string, index: number) => (
                              <div key={index} className="text-sm">• {area}</div>
                            ))}
                          </div>
                        </div>
                      )}
                      {currentReading.coaching.affirmations && currentReading.coaching.affirmations.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-purple-800 mb-2">Affirmations</h4>
                          <div className="space-y-1">
                            {currentReading.coaching.affirmations.map((affirmation: string, index: number) => (
                              <div key={index} className="text-sm italic">"{affirmation}"</div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-2xl shadow-lg overflow-hidden">
                <CardContent className="p-6 text-center text-slate-700">
                  <p>Perform a reading to receive guidance</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

              </div>
            </div>
          )}

          {/* Ask the Seer Tab — Rune Divination (forces/consequences, no timelines) */}
          <TabsContent value="ask-the-seer" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-2xl p-6 shadow-md">
              <RunesSeerChatInterface
                reading={currentReading ?? undefined}
                userId={userProfile?.uid}
                userProfile={userProfile ?? undefined}
                sessionId={userProfile?.uid ? `runes_${userProfile.uid}` : undefined}
              />
            </div>
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </div>
  )
}
