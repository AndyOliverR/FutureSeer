"use client"

import React, { useEffect, useState } from "react"
import { HeaderBar } from "@/components/dashboard/HeaderBar"
import { HeroWelcome } from "@/components/dashboard/HeroWelcome"
import { PredictionHistoryCard } from "@/components/dashboard/PredictionHistoryCard"
import { ConfidenceTrend } from "@/components/dashboard/ConfidenceTrend"
import { SymbolicPatternHighlights } from "@/components/dashboard/SymbolicPatternHighlights"
import { ActiveRemedyCard } from "@/components/dashboard/ActiveRemedyCard"
import { DailySeerPreview } from "@/components/dashboard/DailySeerPreview"
import { AstroDataStatus } from "@/components/AstroDataStatus"
import { useAuth } from "@/hooks/use-auth"
import { useHistory } from "@/hooks/useHistory"
import { useDailyGuidance } from "@/hooks/useDailyGuidance"
import { usePlan } from "@/hooks/usePlan"
import Link from "next/link"
import { motion } from "framer-motion"
import { Calendar, TrendingUp, Sparkles, Clock, Star, BookOpen, Settings, Plus } from "lucide-react"

export default function DashboardPage() {
  const { user, userProfile, loading: authLoading } = useAuth()
  const { history, loading: historyLoading, formatDate } = useHistory()
  const { dailyData, loading: dailyLoading } = useDailyGuidance()
  const { isTrialActive, trialTimeLeft, isPaid } = usePlan()
  
  const [lunarPhase, setLunarPhase] = useState("Waxing Crescent")
  const [dominantElement, setDominantElement] = useState("Water")

  // Get user's first name for personalized experience
  const getFirstName = (fullName: string) => {
    return fullName.split(' ')[0] || fullName
  }
  
  const fullName = userProfile?.displayName || user?.displayName || "Seeker"
  const userName = getFirstName(fullName)

  // Format history items for the prediction card
  const historyItems = history
    .filter(item => item.id) // Only include items with valid IDs
    .slice(0, 3)
    .map(item => ({
      id: item.id!,
      date: new Date(item.timestamp).toISOString(),
      question: item.question,
      confidence: item.symbolicData?.confidence || 75
    }))

  // Generate confidence trend data from history
  const confidenceTrendData = history.slice(-7).map((item, index) => ({
    date: formatDate(item.timestamp),
    confidence: item.symbolicData?.confidence || 75
  }))

  // Generate symbolic patterns from history
  const symbolicPatterns = history.reduce((patterns, item) => {
    const element = item.symbolicData?.elementalInfluence || "Fire"
    const existing = patterns.find(p => p.theme === element)
    if (existing) {
      existing.frequency++
    } else {
      patterns.push({
        theme: element,
        frequency: 1,
        interpretation: `Strong ${element.toLowerCase()} energy in your readings`
      })
    }
    return patterns
  }, [] as any[]).slice(0, 4)

  // Get active remedy from most recent reading
  const activeRemedy = history.length > 0 && history[0].remedies && history[0].remedies.length > 0
    ? {
        remedy: typeof history[0].remedies[0] === 'string' ? history[0].remedies[0] : "Rose Quartz Meditation",
        type: "Crystal",
        status: "Pending" as const
      }
    : {
        remedy: "Rose Quartz Meditation",
        type: "Crystal",
        status: "Pending" as const
      }

  // Daily seer preview data
  const dailySeerData = {
    date: new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    summary: dailyData?.themes?.[0]?.forecast?.slice(0, 100) + "..." || 
             "The cosmos whispers of new beginnings. Your intuition is heightened today, and the universe is ready to reveal its secrets.",
    callToAction: "/daily"
  }

  // Calculate dashboard stats
  const totalReadings = history.length
  const averageConfidence = history.length > 0 
    ? Math.round(history.reduce((sum, item) => sum + (item.symbolicData?.confidence || 75), 0) / history.length)
    : 0
  const recentReadings = history.filter(item => {
    const daysAgo = (Date.now() - item.timestamp) / (1000 * 60 * 60 * 24)
    return daysAgo <= 7
  }).length

  // Trial countdown
  const formatTrialTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4"></div>
          <p className="text-amber-200 font-serif">Loading your mystical journey...</p>
          <p className="text-slate-400 text-sm mt-2">Preparing personalized insights for you</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-6xl mb-6">🔮</div>
          <h1 className="text-3xl font-serif text-amber-200 mb-4">Welcome to FutureSeer</h1>
          <p className="text-slate-300 mb-8">Sign in to begin your mystical journey and unlock personalized cosmic insights.</p>
          <Link 
            href="/signin"
            className="inline-block px-8 py-3 bg-gradient-to-r from-amber-600 to-yellow-500 text-slate-900 font-semibold rounded-xl hover:from-amber-500 hover:to-yellow-400 transition-all button-glow"
          >
            Begin Your Journey
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat overflow-hidden"
         style={{ backgroundImage: "url('/images/starfield-bg.png')" }}>
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-transparent to-slate-950/40" />
      
      <div className="relative z-10 p-4 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <HeaderBar />
        </motion.div>

        {/* Trial Banner */}
        {isTrialActive && trialTimeLeft !== null && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-6 rounded-2xl backdrop-blur-md bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-400/30 p-4 text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-amber-200" />
              <span className="text-amber-200 font-serif font-semibold">Trial Period Active</span>
            </div>
            <p className="text-amber-100 text-sm">
              {trialTimeLeft > 0 
                ? `${formatTrialTime(trialTimeLeft)} remaining in your trial`
                : "Trial period ending soon"
              }
            </p>
            <Link 
              href="/subscribe"
              className="inline-block mt-3 px-6 py-2 bg-gradient-to-r from-amber-600 to-yellow-500 text-slate-900 font-semibold rounded-lg hover:from-amber-500 hover:to-yellow-400 transition-all text-sm"
            >
              Upgrade to Premium
            </Link>
          </motion.div>
        )}

        {/* Hero Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <HeroWelcome 
            userName={userName}
            lunarPhase={lunarPhase}
            dominantElement={dominantElement}
          />
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          <div className="rounded-2xl backdrop-blur-md bg-slate-900/40 border border-slate-700/50 p-6 text-center card-glow">
            <div className="text-3xl mb-2">📊</div>
            <div className="text-2xl font-serif text-amber-200 mb-1">{totalReadings}</div>
            <div className="text-sm text-slate-300">Total Readings</div>
          </div>
          <div className="rounded-2xl backdrop-blur-md bg-slate-900/40 border border-slate-700/50 p-6 text-center card-glow">
            <div className="text-3xl mb-2">⭐</div>
            <div className="text-2xl font-serif text-amber-200 mb-1">{averageConfidence}%</div>
            <div className="text-sm text-slate-300">Avg Confidence</div>
          </div>
          <div className="rounded-2xl backdrop-blur-md bg-slate-900/40 border border-slate-700/50 p-6 text-center card-glow">
            <div className="text-3xl mb-2">📅</div>
            <div className="text-2xl font-serif text-amber-200 mb-1">{recentReadings}</div>
            <div className="text-sm text-slate-300">This Week</div>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Predictions */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <PredictionHistoryCard items={historyItems} />
            </motion.div>

            {/* Confidence Trend */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <ConfidenceTrend data={confidenceTrendData} />
            </motion.div>

            {/* Symbolic Patterns */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <SymbolicPatternHighlights insights={symbolicPatterns} />
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Astro Data Status */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <AstroDataStatus />
            </motion.div>

            {/* Daily Seer Preview */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <DailySeerPreview 
                date={dailySeerData.date}
                summary={dailySeerData.summary}
                callToAction={dailySeerData.callToAction}
              />
            </motion.div>

            {/* Active Remedies */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <ActiveRemedyCard 
                remedy={activeRemedy.remedy}
                type={activeRemedy.type}
                status={activeRemedy.status}
              />
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="rounded-2xl backdrop-blur-md bg-slate-900/40 border border-slate-700/50 p-6 card-glow"
            >
              <h3 className="text-xl font-serif text-amber-200 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link 
                  href="/ask"
                  className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-amber-600/20 to-yellow-500/20 border border-amber-400/30 hover:from-amber-500/30 hover:to-yellow-400/30 transition-all group"
                >
                  <Plus className="w-5 h-5 text-amber-200 group-hover:scale-110 transition-transform" />
                  <span className="text-amber-100 font-serif">Ask the Seer</span>
                </Link>
                <Link 
                  href="/tools"
                  className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-purple-600/20 to-indigo-500/20 border border-purple-400/30 hover:from-purple-500/30 hover:to-indigo-400/30 transition-all group"
                >
                  <Sparkles className="w-5 h-5 text-purple-200 group-hover:scale-110 transition-transform" />
                  <span className="text-purple-100 font-serif">Divination Tools</span>
                </Link>
                <Link 
                  href="/history"
                  className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-blue-600/20 to-cyan-500/20 border border-blue-400/30 hover:from-blue-500/30 hover:to-cyan-400/30 transition-all group"
                >
                  <BookOpen className="w-5 h-5 text-blue-200 group-hover:scale-110 transition-transform" />
                  <span className="text-blue-100 font-serif">Reading History</span>
                </Link>
                <Link 
                  href="/settings"
                  className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-slate-600/20 to-gray-500/20 border border-slate-400/30 hover:from-slate-500/30 hover:to-gray-400/30 transition-all group"
                >
                  <Settings className="w-5 h-5 text-slate-200 group-hover:scale-110 transition-transform" />
                  <span className="text-slate-100 font-serif">Settings</span>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="text-center mb-8"
        >
          <div className="rounded-2xl backdrop-blur-md bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-400/20 p-8">
            <h3 className="text-2xl font-serif text-amber-200 mb-4">Ready for Your Next Insight?</h3>
            <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
              The cosmos is ready to reveal its secrets. Ask a question, explore the tools, or discover your daily guidance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/ask"
                className="px-8 py-3 bg-gradient-to-r from-amber-600 to-yellow-500 text-slate-900 font-semibold rounded-xl hover:from-amber-500 hover:to-yellow-400 transition-all button-glow"
              >
                🔮 Ask the Seer
              </Link>
              <Link 
                href="/daily"
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-500 text-white font-semibold rounded-xl hover:from-purple-500 hover:to-indigo-400 transition-all button-glow"
              >
                📅 Daily Guidance
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 