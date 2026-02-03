"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { HISTORY_EMOJIS, HISTORY_CONFIG } from "@/lib/constants/history"

interface ActivityItem {
  type: string
  timestamp: number
  payload?: Record<string, unknown>
}

interface HistoryStatsCardsProps {
  activity: ActivityItem[]
  formatDate: (timestamp: number) => string
}

export function HistoryStatsCards({ activity, formatDate }: HistoryStatsCardsProps) {
  const stats = useMemo(() => {
    const list = activity ?? []
    const now = Date.now()
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayStartTs = todayStart.getTime()
    const weekAgo = now - HISTORY_CONFIG.DAYS_IN_WEEK * HISTORY_CONFIG.MS_PER_DAY

    const actionsToday = list.filter((a) => a.timestamp >= todayStartTs).length
    const thisWeek = list.filter((a) => a.timestamp >= weekAgo).length
    const mostRecent = list.length > 0 ? Math.max(...list.map((a) => a.timestamp)) : null
    const lastActive = mostRecent != null ? formatDate(mostRecent) : "N/A"

    const toolSlugs = new Set<string>()
    list.forEach((a) => {
      if (a.type === "tool_open" && a.payload?.toolSlug) toolSlugs.add(String(a.payload.toolSlug))
    })
    const toolsUsed = toolSlugs.size

    return { actionsToday, thisWeek, lastActive, toolsUsed }
  }, [activity, formatDate])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
    >
      <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300 hover:scale-105 text-center rounded-2xl">
        <CardContent className="p-4">
          <div className="text-2xl mb-2">{HISTORY_EMOJIS.stats}</div>
          <div className="text-2xl font-bold font-serif text-amber-400">{stats.actionsToday}</div>
          <div className="text-sm text-white/80">Actions Today</div>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300 hover:scale-105 text-center rounded-2xl">
        <CardContent className="p-4">
          <div className="text-2xl mb-2">{HISTORY_EMOJIS.calendar}</div>
          <div className="text-2xl font-bold font-serif text-amber-400">{stats.thisWeek}</div>
          <div className="text-sm text-white/80">This Week</div>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300 hover:scale-105 text-center rounded-2xl">
        <CardContent className="p-4">
          <div className="text-2xl mb-2">{HISTORY_EMOJIS.star}</div>
          <div className="text-2xl font-bold font-serif text-amber-400">{stats.lastActive}</div>
          <div className="text-sm text-white/80">Last Active</div>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300 hover:scale-105 text-center rounded-2xl">
        <CardContent className="p-4">
          <div className="text-2xl mb-2">{HISTORY_EMOJIS.tools}</div>
          <div className="text-2xl font-bold font-serif text-amber-400">{stats.toolsUsed}</div>
          <div className="text-sm text-white/80">Tools Used</div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
