"use client"

import React, { useState, useMemo } from "react"
import dynamic from "next/dynamic"
import { motion, AnimatePresence } from "framer-motion"
import { useHistory } from "@/hooks/useHistory"
import { AskHistory } from "@/lib/firebase"
import { HistoryStatsCards } from "@/components/history/HistoryStatsCards"
import { HistoryFilters } from "@/components/history/HistoryFilters"
import { ReadingCard } from "@/components/history/ReadingCard"
import { EmptyHistoryState } from "@/components/history/EmptyHistoryState"
import { HISTORY_EMOJIS } from "@/lib/constants/history"
import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { buildHistorySummaries, buildLastSessionSummary } from "@/lib/historySummary"

// Lazy load modal for better performance
const ReadingDetailsModal = dynamic(() => 
  import("@/components/history/ReadingDetailsModal").then(mod => ({ default: mod.ReadingDetailsModal }))
)

export default function HistoryPage() {
  const { 
    history, 
    filteredHistory, 
    activity,
    loading, 
    loadingActivity,
    error, 
    activityError,
    searchTerm, 
    setSearchTerm, 
    filterType, 
    setFilterType, 
    getQuestionType, 
    formatDate, 
    getTypeColor,
    refreshHistory,
    refreshActivity,
  } = useHistory()
  
  const [selectedReading, setSelectedReading] = useState<AskHistory | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  const handleViewDetails = (reading: AskHistory) => {
    setSelectedReading(reading)
    setShowDetails(true)
  }

  const handleCloseDetails = () => {
    setShowDetails(false)
    setSelectedReading(null)
  }

  const handleRefresh = () => {
    refreshHistory()
    refreshActivity()
  }

  const getActivityLabel = (item: { type: string; payload?: Record<string, unknown> }) => {
    if (item.type === "sign_in") return "Signed in"
    if (item.type === "page_view" && item.payload?.path) {
      const path = String(item.payload.path)
      if (path === "/" || path === "") return "Viewed Home"
      if (path === "/dashboard") return "Viewed Dashboard"
      if (path === "/history") return "Viewed History"
      if (path === "/ask-the-seer" || path === "/seer") return "Viewed Ask the Seer"
      if (path === "/profile") return "Viewed Profile"
      if (path === "/settings") return "Viewed Settings"
      if (path === "/tools") return "Viewed Tools"
      if (path === "/pricing") return "Viewed Pricing"
      return `Viewed ${path}`
    }
    if (item.type === "tool_open" && item.payload?.toolSlug) {
      const slug = String(item.payload.toolSlug)
      const label = slug.split("-").map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(" ")
      return `Opened ${label}`
    }
    return item.type.replace("_", " ")
  }

  const activityItems = useMemo(
    () => (activity ?? []).map((a) => ({ type: a.type, timestamp: a.timestamp, payload: a.payload })),
    [activity]
  )
  const lastSessionSummary = useMemo(
    () => buildLastSessionSummary(activityItems),
    [activityItems]
  )
  const historySummaries = useMemo(() => {
    const readingItems = history.map((h) => ({ question: h.question, timestamp: h.timestamp }))
    return buildHistorySummaries(activityItems, readingItems, { maxDays: 14 })
  }, [activityItems, history])

  if (loading) {
    return (
      <div className="relative min-h-screen overflow-hidden starfield-ultra-sharp">
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.8, 1, 0.8]
              }}
              transition={{ 
                duration: 2.5, 
                repeat: Infinity, 
                ease: "easeInOut"
              }}
              className="text-6xl mb-6"
            >
              {HISTORY_EMOJIS.crystal}
            </motion.div>
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-base text-amber-400"
            >
              Loading your mystical journey...
            </motion.p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden starfield-ultra-sharp">
      <div className="relative z-10 pt-16 p-4 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div className="text-center sm:text-left">
            <h1 className="text-3xl md:text-4xl font-bold font-serif text-amber-400 mb-4">
              Your Mystical Journey
            </h1>
            <p className="text-base md:text-lg text-white/80">
              See what you did last and your recent activity
            </p>
          </div>
          <div className="flex justify-center sm:justify-end">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={loading || loadingActivity}
              className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${(loading || loadingActivity) ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </motion.div>

        {activityError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3"
          >
            <p className="text-amber-400/90 text-sm m3-body-medium">{activityError}</p>
            <p className="text-white/70 text-xs mt-1">Try Refresh in a few minutes, or check Firebase Console for index status.</p>
          </motion.div>
        )}

        {/* What you did last */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="mb-8"
        >
          <h2 className="text-lg font-semibold text-amber-400 mb-4">What you did last</h2>
          <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
            {lastSessionSummary ? (
              <p className="text-white/90 text-sm leading-relaxed">{lastSessionSummary}</p>
            ) : (
              <p className="text-white/80 text-sm">
                No activity yet. Use the app and we&apos;ll show what you did here.
              </p>
            )}
          </div>
        </motion.div>

        {/* Stats Cards */}
        <HistoryStatsCards activity={activityItems} formatDate={formatDate} />

        {/* Recent activity */}
        {activity.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-8"
          >
            <h2 className="text-lg font-semibold text-amber-400 mb-4">Recent activity</h2>
            <ul className="space-y-2 rounded-2xl border border-amber-500/30 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
              {activity.slice(0, 15).map((item) => (
                <li
                  key={item.id ?? item.timestamp}
                  className="flex items-center justify-between text-sm text-white/80 py-2 border-b border-white/5 last:border-0"
                >
                  <span>{getActivityLabel(item)}</span>
                  <span className="text-amber-400/80 tabular-nums">{formatDate(item.timestamp)}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* Summary narrative */}
        {historySummaries.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-8"
          >
            <h2 className="text-lg font-semibold text-amber-400 mb-4">Summary</h2>
            <div className="space-y-3 rounded-2xl border border-amber-500/30 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
              {historySummaries.map((day) => (
                <p key={day.dateKey} className="text-white/90 text-sm leading-relaxed">
                  {day.summaryText}
                </p>
              ))}
            </div>
          </motion.div>
        )}

        {/* Search and Filter - only when we have readings */}
        {filteredHistory.length > 0 && (
          <HistoryFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterType={filterType}
            setFilterType={setFilterType}
          />
        )}

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 rounded-2xl text-white/80 text-center text-sm"
          >
            {error}
          </motion.div>
        )}

        {/* Readings List - only when we have readings; empty state only when no activity and no readings */}
        <AnimatePresence>
          {filteredHistory.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="space-y-6"
            >
              {filteredHistory.map((reading, index) => (
                <ReadingCard
                  key={reading.id}
                  reading={reading}
                  index={index}
                  onViewDetails={handleViewDetails}
                  getQuestionType={getQuestionType}
                  getTypeColor={getTypeColor}
                  formatDate={formatDate}
                />
              ))}
            </motion.div>
          ) : activity.length === 0 ? (
            <EmptyHistoryState />
          ) : null}
        </AnimatePresence>

        {/* Reading Details Modal - Lazy Loaded */}
        <ReadingDetailsModal
          reading={selectedReading}
          isOpen={showDetails}
          onClose={handleCloseDetails}
          formatDate={formatDate}
        />
      </div>
    </div>
  )
}
