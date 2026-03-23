"use client"

import { useState, useMemo, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"
import { SynastryCoachInterface } from "@/components/SynastryCoachInterface"
import { SynastrySeerChatInterface } from "@/components/SynastrySeerChatInterface"
import { useSynastry } from "@/hooks/useSynastry"
import { AffiliateLink } from "@/components/AffiliateLink"
import { ToolReportViralShell } from "@/components/report-viral/ToolReportViralShell"
import { getSynastryChartUrl } from "@/lib/affiliateConfig"

/** Parse 24h "HH:mm" to 12h hour (1-12), minute (0-59), and AM/PM */
function time24To12(time24: string): { hour12: number; minute: number; ampm: "AM" | "PM" } {
  const [h = "0", m = "0"] = (time24 || "").trim().split(":")
  const hour = Math.min(23, Math.max(0, parseInt(h, 10) || 0))
  const minute = Math.min(59, Math.max(0, parseInt(m, 10) || 0))
  const hour12 = hour % 12 || 12
  const ampm = hour < 12 ? "AM" : "PM"
  return { hour12, minute, ampm }
}

/** Build 24h "HH:mm" from 12h hour (1-12), minute, and AM/PM */
function time12To24(hour12: number, minute: number, ampm: "AM" | "PM"): string {
  const m = Math.min(59, Math.max(0, minute))
  let hour24: number
  if (ampm === "AM") {
    hour24 = hour12 === 12 ? 0 : hour12
  } else {
    hour24 = hour12 === 12 ? 12 : hour12 + 12
  }
  return `${String(hour24).padStart(2, "0")}:${String(m).padStart(2, "0")}`
}

export default function SynastryPage() {
  const { userProfile, user } = useAuth()
  const {
    birthData1,
    birthData2,
    analysis,
    isLoading,
    error,
    setBirthData1,
    setBirthData2,
    performSynastryAnalysis,
    resetData
  } = useSynastry()

  const [activeTab, setActiveTab] = useState("overview")
  const [chartType, setChartType] = useState<"synastry" | "composite" | "davison">("synastry")

  // Check if user has complete birth details
  const hasCompleteDetails = userProfile?.birthDate && userProfile?.birthTime && userProfile?.birthPlace

  // Auto-populate Person 1 with user profile data if profile is complete
  useEffect(() => {
    if (hasCompleteDetails && !birthData1.name && !birthData1.birthDate) {
      setBirthData1({
        name: userProfile?.displayName || userProfile?.fullName || '',
        birthDate: userProfile.birthDate || '',
        birthTime: userProfile.birthTime || '',
        birthLocation: userProfile.birthPlace || ''
      })
    }
  }, [hasCompleteDetails, userProfile, birthData1.name, birthData1.birthDate, setBirthData1])

  // Check for reduced motion preference
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  // Material 3 motion configuration - optimized for GPU acceleration
  const motionConfig = useMemo(() => {
    if (prefersReducedMotion) return { duration: 0 }
    return { duration: 0.3, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }
  }, [prefersReducedMotion])

  // Tab configuration
  const tabsConfig = useMemo(() => [
    { value: 'overview', label: 'Overview' },
    { value: 'aspects', label: 'Aspects' },
    { value: 'compatibility', label: 'Compatibility' },
    { value: 'dynamics', label: 'Dynamics' },
    { value: 'growth', label: 'Growth' },
    { value: 'advice', label: 'Advice' },
    { value: 'ask-seer', label: 'Ask the Seer' }
  ], [])

  return (
    <div className="starfield-ultra-sharp min-h-screen p-4 overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8 pt-4">
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-heading font-semibold mb-6">
            <span className="text-yellow-400">💕</span>{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600">Synastry</span>
          </h1>
          <p className="text-slate-200 leading-relaxed text-xl font-light">
            Relationship compatibility analysis through astrological chart comparison
          </p>
          <p className="text-slate-400 text-sm mt-3">
            <AffiliateLink href={getSynastryChartUrl()} label="Create synastry chart at Astro-Charts" className="text-amber-500/80 hover:text-amber-400" />
          </p>
          {hasCompleteDetails && !birthData1.name && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4"
            >
              <p className="text-sm text-amber-400">
                💡 Your profile data will be used for Person 1
              </p>
            </motion.div>
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Section */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-1"
          >
            <Card elevation={2} className="bg-gradient-to-br from-amber-50/90 to-yellow-50/90 border-2 border-amber-200 rounded-3xl">
              <CardContent className="p-6">
                <h2 className="text-2xl font-heading font-semibold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600 mb-6 text-center">Relationship Data</h2>
              
              {/* Person 1 */}
              <div className="mb-8">
                <h3 className="text-lg font-heading font-semibold text-slate-800 mb-4 flex items-center">
                  <span className="mr-2">👤</span>
                  Person 1
                </h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Name"
                    value={(birthData1?.name ?? "")}
                    onChange={(e) => setBirthData1({ ...birthData1, name: e.target.value })}
                    className="w-full bg-white/95 border-2 border-amber-300 rounded-xl p-3 text-slate-800 placeholder:text-slate-500 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all duration-300"
                  />
                  <input
                    type="date"
                    value={(birthData1?.birthDate ?? "")}
                    onChange={(e) => setBirthData1({ ...birthData1, birthDate: e.target.value })}
                    className="w-full bg-white/95 border-2 border-amber-300 rounded-xl p-3 text-slate-800 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all duration-300 [color-scheme:dark]"
                  />
                  <div className="flex gap-2 items-center">
                    <div className="flex gap-1 flex-1">
                      <select
                        value={time24To12(birthData1?.birthTime ?? "00:00").hour12}
                        onChange={(e) => {
                          const { minute, ampm } = time24To12(birthData1?.birthTime ?? "00:00")
                          setBirthData1({ ...birthData1, birthTime: time12To24(Number(e.target.value), minute, ampm) })
                        }}
                        className="flex-1 bg-white/95 border-2 border-amber-300 rounded-xl p-3 text-slate-800 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 [color-scheme:dark]"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                      <span className="self-center text-slate-600">:</span>
                      <select
                        value={time24To12(birthData1?.birthTime ?? "00:00").minute}
                        onChange={(e) => {
                          const { hour12, ampm } = time24To12(birthData1?.birthTime ?? "00:00")
                          setBirthData1({ ...birthData1, birthTime: time12To24(hour12, Number(e.target.value), ampm) })
                        }}
                        className="flex-1 bg-white/95 border-2 border-amber-300 rounded-xl p-3 text-slate-800 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 [color-scheme:dark]"
                      >
                        {Array.from({ length: 60 }, (_, i) => i).map((n) => (
                          <option key={n} value={n}>{String(n).padStart(2, "0")}</option>
                        ))}
                      </select>
                    </div>
                    <select
                      value={time24To12(birthData1?.birthTime ?? "00:00").ampm}
                      onChange={(e) => {
                        const { hour12, minute } = time24To12(birthData1?.birthTime ?? "00:00")
                        setBirthData1({ ...birthData1, birthTime: time12To24(hour12, minute, e.target.value as "AM" | "PM") })
                      }}
                      className="w-20 bg-white/95 border-2 border-amber-300 rounded-xl p-3 text-slate-800 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 [color-scheme:dark]"
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                  <input
                    type="text"
                    placeholder="Birth Location"
                    value={(birthData1?.birthLocation ?? "")}
                    onChange={(e) => setBirthData1({ ...birthData1, birthLocation: e.target.value })}
                    className="w-full bg-white/95 border-2 border-amber-300 rounded-xl p-3 text-slate-800 placeholder:text-slate-500 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all duration-300"
                  />
                </div>
              </div>

              {/* Person 2 */}
              <div className="mb-8">
                <h3 className="text-lg font-heading font-semibold text-slate-800 mb-4 flex items-center">
                  <span className="mr-2">👤</span>
                  Person 2
                </h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Name"
                    value={(birthData2?.name ?? "")}
                    onChange={(e) => setBirthData2({ ...birthData2, name: e.target.value })}
                    className="w-full bg-white/95 border-2 border-amber-300 rounded-xl p-3 text-slate-800 placeholder:text-slate-500 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all duration-300"
                  />
                  <input
                    type="date"
                    value={(birthData2?.birthDate ?? "")}
                    onChange={(e) => setBirthData2({ ...birthData2, birthDate: e.target.value })}
                    className="w-full bg-white/95 border-2 border-amber-300 rounded-xl p-3 text-slate-800 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all duration-300 [color-scheme:dark]"
                  />
                  <div className="flex gap-2 items-center">
                    <div className="flex gap-1 flex-1">
                      <select
                        value={time24To12(birthData2?.birthTime ?? "00:00").hour12}
                        onChange={(e) => {
                          const { minute, ampm } = time24To12(birthData2?.birthTime ?? "00:00")
                          setBirthData2({ ...birthData2, birthTime: time12To24(Number(e.target.value), minute, ampm) })
                        }}
                        className="flex-1 bg-white/95 border-2 border-amber-300 rounded-xl p-3 text-slate-800 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 [color-scheme:dark]"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                      <span className="self-center text-slate-600">:</span>
                      <select
                        value={time24To12(birthData2?.birthTime ?? "00:00").minute}
                        onChange={(e) => {
                          const { hour12, ampm } = time24To12(birthData2?.birthTime ?? "00:00")
                          setBirthData2({ ...birthData2, birthTime: time12To24(hour12, Number(e.target.value), ampm) })
                        }}
                        className="flex-1 bg-white/95 border-2 border-amber-300 rounded-xl p-3 text-slate-800 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 [color-scheme:dark]"
                      >
                        {Array.from({ length: 60 }, (_, i) => i).map((n) => (
                          <option key={n} value={n}>{String(n).padStart(2, "0")}</option>
                        ))}
                      </select>
                    </div>
                    <select
                      value={time24To12(birthData2?.birthTime ?? "00:00").ampm}
                      onChange={(e) => {
                        const { hour12, minute } = time24To12(birthData2?.birthTime ?? "00:00")
                        setBirthData2({ ...birthData2, birthTime: time12To24(hour12, minute, e.target.value as "AM" | "PM") })
                      }}
                      className="w-20 bg-white/95 border-2 border-amber-300 rounded-xl p-3 text-slate-800 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 [color-scheme:dark]"
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                  <input
                    type="text"
                    placeholder="Birth Location"
                    value={(birthData2?.birthLocation ?? "")}
                    onChange={(e) => setBirthData2({ ...birthData2, birthLocation: e.target.value })}
                    className="w-full bg-white/95 border-2 border-amber-300 rounded-xl p-3 text-slate-800 placeholder:text-slate-500 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all duration-300"
                  />
                </div>
              </div>

              {/* Instructions */}
              <div className="mb-8 p-4 rounded-xl bg-amber-50/80 border-2 border-amber-300">
                <h4 className="text-slate-800 font-heading font-semibold mb-2 flex items-center">
                  <span className="mr-2">💡</span>
                  Synastry Insights
                </h4>
                <ul className="space-y-1 text-sm text-slate-700">
                  <li>• Planetary aspects between charts</li>
                  <li>• Compatibility analysis</li>
                  <li>• Relationship dynamics</li>
                  <li>• Growth opportunities</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <motion.button
                  whileHover={{}}
                  whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                  onClick={performSynastryAnalysis}
                  disabled={isLoading || !birthData1.name || !birthData1.birthDate || !birthData1.birthTime || !birthData1.birthLocation || !birthData2.name || !birthData2.birthDate || !birthData2.birthTime || !birthData2.birthLocation}
                  className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-xl p-4 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl transition-all duration-300"
                >
                  {isLoading ? "💕 Analyzing..." : "💕 Analyze Compatibility"}
                </motion.button>
                
                <motion.button
                  whileHover={{}}
                  whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                  onClick={resetData}
                    className="w-full bg-white/90 border-2 border-amber-300 text-slate-800 rounded-xl p-4 font-semibold hover:bg-white transition-all duration-300"
                >
                  🔄 Reset
                </motion.button>
              </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Results Section */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card elevation={2} className="bg-gradient-to-br from-amber-50/90 to-yellow-50/90 border-2 border-amber-200 rounded-3xl">
              <CardContent className="p-6">
              {/* Chart Type Selector */}
              <div className="flex flex-wrap gap-2 mb-4">
                <div className="w-full mb-4">
                  <h3 className="text-lg font-heading font-semibold text-slate-800 mb-3 flex items-center">
                    <span className="mr-2">💕</span>
                    Relationship Chart Type
                  </h3>
                  <div className="flex gap-2">
                    {([
                      { value: "synastry" as const, label: "Synastry", icon: "💫" },
                      { value: "composite" as const, label: "Composite", icon: "🔮" },
                      { value: "davison" as const, label: "Davison", icon: "⚖️" },
                    ]).map((type) => (
                      <motion.button
                        key={type.value}
                        whileHover={{}}
                        whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
                        onClick={() => setChartType(type.value)}
                        className={`flex-1 px-4 py-3 rounded-xl font-medium m3-elevation-0 m3-elevation-transition m3-transition-standard transition-all duration-300 ${
                          chartType === type.value
                            ? "m3-elevation-1 bg-gradient-to-br from-amber-100 to-yellow-100 text-amber-900 shadow-md"
                            : "bg-white/40 text-slate-800 hover:text-slate-900 hover:bg-amber-50/70 hover:m3-elevation-1"
                        }`}
                      >
                        <span className="mr-2">{type.icon}</span>
                        {type.label}
                      </motion.button>
                    ))}
                  </div>
                  <div className="mt-3 p-3 bg-amber-50/80 border-2 border-amber-300 rounded-lg">
                    <p className="text-sm text-slate-700">
                      {chartType === "synastry" && "Synastry: Analyzes planetary aspects between two individual charts"}
                      {chartType === "composite" && "Composite: Creates a mid-point chart representing the relationship itself"}
                      {chartType === "davison" && "Davison: Uses midpoint technique for relationship timing and dynamics"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="rounded-2xl border border-amber-500/30 bg-slate-900/80 overflow-hidden">
              <Tabs
                value={activeTab}
                onValueChange={(value) => {
                  if (tabsConfig.some((t) => t.value === value)) setActiveTab(value)
                }}
                className="w-full min-w-0"
              >
                <TabsList className="flex w-full flex-nowrap overflow-x-auto gap-1 sm:gap-2 p-2 sm:p-3 bg-slate-800/50 border-b border-amber-500/20 rounded-none h-auto min-h-0 justify-start [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-amber-500/30">
                  {tabsConfig.map((tab) => (
                    <motion.div
                      key={tab.value}
                      whileHover={{}}
                      whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                      transition={prefersReducedMotion ? {} : { type: "spring", stiffness: 400, damping: 17 }}
                      className="relative shrink-0"
                    >
                      <TabsTrigger 
                        value={tab.value} 
                        className="shrink-0 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 rounded-t-lg rounded-b-none px-4 py-2.5 text-sm font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 transition-all flex items-center justify-center relative overflow-hidden border border-transparent data-[state=inactive]:border-slate-600/50"
                      >
                        {tab.label}
                        {activeTab === tab.value && (
                          <motion.div
                            layoutId="activeTab"
                            className="absolute inset-0 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-t-lg rounded-b-none -z-10"
                            transition={prefersReducedMotion ? {} : { type: "spring", stiffness: 300, damping: 30 }}
                          />
                        )}
                      </TabsTrigger>
                    </motion.div>
                  ))}
                </TabsList>

                {/* Tab Content with Material 3 Transitions */}
                {tabsConfig.map((tab) => (
                  <TabsContent key={tab.value} value={tab.value} className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                    {tab.value === 'ask-seer' ? (
                      <SynastrySeerChatInterface analysis={analysis} userId={user?.uid} />
                    ) : (
                    <AnimatePresence mode="wait">
                      {isLoading && activeTab === tab.value && (
                        <motion.div
                          key="loading"
                          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                          animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                          exit={prefersReducedMotion ? {} : { opacity: 0, y: -20 }}
                          transition={motionConfig}
                        >
                          <div className="text-center py-16">
                            <motion.div
                              className="relative w-16 h-16 mx-auto mb-4"
                              animate={prefersReducedMotion ? {} : { rotate: 360 }}
                              transition={prefersReducedMotion ? {} : { duration: 1.5, repeat: Infinity, ease: "linear" }}
                              style={{ willChange: prefersReducedMotion ? 'auto' : 'transform' }}
                            >
                              <svg className="w-16 h-16" viewBox="0 0 24 24" style={{ willChange: 'auto' }}>
                                <circle
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="rgba(251, 191, 36, 0.2)"
                                  strokeWidth="2"
                                  fill="none"
                                />
                                {!prefersReducedMotion && (
                                  <motion.circle
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="#fbbf24"
                                    strokeWidth="2"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeDasharray="60 40"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                    style={{ transformOrigin: "12px 12px", willChange: 'transform' }}
                                  />
                                )}
                              </svg>
                            </motion.div>
                            <motion.p 
                              className="text-slate-200"
                              initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
                              animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                              transition={prefersReducedMotion ? {} : { delay: 0.2 }}
                            >
                              Analyzing cosmic compatibility...
                            </motion.p>
                          </div>
                        </motion.div>
                      )}

                      {error && !isLoading && activeTab === tab.value && (
                        <motion.div
                          key="error"
                          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                          animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                          exit={prefersReducedMotion ? {} : { opacity: 0, y: -20 }}
                          transition={motionConfig}
                        >
                          <div className="text-center py-16">
                            <div className="text-4xl mb-4">⚠️</div>
                            <p className="text-red-400 text-lg mb-2 font-semibold">Analysis Error</p>
                            <p className="text-slate-200 mb-4">{error}</p>
                            <motion.button
                              whileHover={{}}
                              whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
                              onClick={performSynastryAnalysis}
                              className="px-6 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-xl font-semibold hover:shadow-xl transition-all duration-300"
                            >
                              Try Again
                            </motion.button>
                          </div>
                        </motion.div>
                      )}

                      {analysis && !isLoading && !error && activeTab === tab.value && (
                        <ToolReportViralShell toolSlug="synastry" reportForTeaser={analysis}>
                        <motion.div
                          key="results"
                          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                          animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                          exit={prefersReducedMotion ? {} : { opacity: 0, y: -20 }}
                          transition={motionConfig}
                        >
                          <SynastryCoachInterface 
                            compatibility={analysis}
                            activeTab={activeTab}
                            chartType={chartType}
                            person1Data={{
                              name: birthData1?.name ?? '',
                              birthTime: birthData1?.birthTime ?? '',
                              birthPlace: birthData1?.birthLocation ?? '',
                            }}
                            person2Data={{
                              name: birthData2?.name ?? '',
                              birthTime: birthData2?.birthTime ?? '',
                              birthPlace: birthData2?.birthLocation ?? '',
                            }}
                          />
                        </motion.div>
                        </ToolReportViralShell>
                      )}

                      {!analysis && !isLoading && !error && activeTab === tab.value && (
                        <motion.div
                          key="empty"
                          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                          animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                          exit={prefersReducedMotion ? {} : { opacity: 0, y: -20 }}
                          transition={motionConfig}
                        >
                          <div className="text-center py-16">
                            <div className="text-6xl mb-6">💕</div>
                            <h3 className="text-2xl font-heading font-semibold text-transparent bg-clip-text bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 mb-4">Ready for Love Analysis?</h3>
                            <p className="text-slate-700 leading-relaxed text-lg max-w-2xl mx-auto">
                              Enter both birth details above to discover the cosmic compatibility 
                              and relationship dynamics between two souls.
                            </p>
                            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                              <Card elevation={1} className="bg-gradient-to-br from-amber-50/90 to-yellow-50/90 border-2 border-amber-200 rounded-xl">
                                <CardContent className="p-4">
                                  <div className="text-2xl mb-2">💫</div>
                                  <p className="text-slate-700 text-sm">Planetary aspects between charts</p>
                                </CardContent>
                              </Card>
                              <Card elevation={1} className="bg-gradient-to-br from-amber-50/90 to-yellow-50/90 border-2 border-amber-200 rounded-xl">
                                <CardContent className="p-4">
                                  <div className="text-2xl mb-2">💕</div>
                                  <p className="text-slate-700 text-sm">Compatibility analysis</p>
                                </CardContent>
                              </Card>
                              <Card elevation={1} className="bg-gradient-to-br from-amber-50/90 to-yellow-50/90 border-2 border-amber-200 rounded-xl">
                                <CardContent className="p-4">
                                  <div className="text-2xl mb-2">🌊</div>
                                  <p className="text-slate-700 text-sm">Relationship dynamics</p>
                                </CardContent>
                              </Card>
                              <Card elevation={1} className="bg-gradient-to-br from-amber-50/90 to-yellow-50/90 border-2 border-amber-200 rounded-xl">
                                <CardContent className="p-4">
                                  <div className="text-2xl mb-2">🌱</div>
                                  <p className="text-slate-700 text-sm">Growth opportunities</p>
                                </CardContent>
                              </Card>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
              </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Features Highlight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12"
        >
          <Card elevation={2} className="bg-gradient-to-br from-amber-50/90 to-yellow-50/90 border-2 border-amber-200 rounded-3xl">
            <CardContent className="p-8">
              <h3 className="text-2xl font-heading font-semibold text-transparent bg-clip-text bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 mb-6 text-center">✨ Synastry Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-3">💫</div>
              <h4 className="text-slate-800 font-heading font-semibold mb-2">Planetary Aspects</h4>
              <p className="text-slate-700 text-sm">Analyze how planets interact between charts</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">💕</div>
              <h4 className="text-slate-800 font-heading font-semibold mb-2">Compatibility</h4>
              <p className="text-slate-700 text-sm">Discover relationship strengths and challenges</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">🌱</div>
              <h4 className="text-slate-800 font-heading font-semibold mb-2">Growth</h4>
              <p className="text-slate-700 text-sm">Identify opportunities for mutual development</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">💡</div>
              <h4 className="text-slate-800 font-heading font-semibold mb-2">Guidance</h4>
              <p className="text-slate-700 text-sm">Receive personalized relationship advice</p>
            </div>
          </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
} 