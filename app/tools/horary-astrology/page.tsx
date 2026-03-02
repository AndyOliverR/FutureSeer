"use client"

import { useState } from "react"
import { devLog } from '@/lib/devLogger';
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/hooks/use-auth"
import { Badge } from "@/components/ui/badge"
import {
  Activity,
  AlertCircle,
  BarChart3,
  Brain,
  Calendar,
  Clock,
  Compass,
  Loader2,
  MessageCircle,
  Moon,
  RefreshCw,
  Star,
  Target,
  Zap
} from "lucide-react"
import { storeChart, storeCurrentChart, getCurrentChart } from '@/lib/chartStorage'
import HorarySeerChatInterface from '@/components/HorarySeerChatInterface'

interface HoraryData {
  basicInfo: {
    question: string
    questionTime: string
    questionPlace: string
    chartTime: string
  }
  seerState?: {
    ascendantSign: string
    ascendantDegree: number
    moonSign: string
    moonHouse: number
    moonApplyingAspect?: string
    voidOfCourseMoon: boolean
    saturnInFirst: boolean
  }
  chartImages: {
    horaryChart: string
    chartStyle: string
  }
  answer: {
    answer: string
    confidence: number
    explanation: string
    reasoning: string
  }
  planetaryPositions: Array<{
    name: string
    sign: string
    degree: number
    house: number
    meaning: string
    dignity: string
    speed: string
  }>
  houseAnalysis: Array<{
    house: number
    name: string
    description: string
    ruler: string
    planets: string[]
    significance: string
  }>
  aspects: Array<{
    planets: string
    type: string
    orb: number
    description: string
    applying: boolean
    separating: boolean
  }>
  timing: {
    immediate: string
    shortTerm: string
    longTerm: string
    criticalDates: string[]
    moonPhase: string
    moonSign: string
  }
  guidance: {
    guidance: string
    recommendations: string[]
    advice: string[]
  }
  rawAstroAppData: any
}

/** Zero-pad time parts (e.g. "9:5" -> "09:05", "14:30:1" -> "14:30:01") for parseable datetime strings. */
function normalizeTimePart(timePart: string): string {
  const parts = timePart.trim().split(':').map((p) => p.trim())
  if (parts.length < 2) return timePart
  const pad = (n: string) => n.padStart(2, '0')
  const h = pad(parts[0] || '0')
  const m = pad(parts[1] || '0')
  const s = parts[2] != null ? pad(parts[2]) : null
  return s != null ? `${h}:${m}:${s}` : `${h}:${m}`
}

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

export default function HoraryAstrologyPage() {
  const { user, userProfile } = useAuth()
  const [horaryData, setHoraryData] = useState<HoraryData | null>(null)
  const [currentTransits, setCurrentTransits] = useState<any>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isLoadingTransits, setIsLoadingTransits] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'chart_images' | 'answer_analysis' | 'planetary_positions' | 'house_analysis' | 'aspects_analysis' | 'timing_analysis' | 'guidance_analysis' | 'current_transits' | 'ask_seer'>('chart_images')

  // Horary-specific state
  const [question, setQuestion] = useState('')
  const [questionTime, setQuestionTime] = useState('')
  const [questionPlace, setQuestionPlace] = useState('')

  const loadCurrentTransits = async () => {
    if (!user?.uid) return

    // First try to load cached current transits
    const cachedTransits = getCurrentChart(user.uid, 'horary-astrology')
    if (cachedTransits) {
      setCurrentTransits(cachedTransits)
      devLog.debug('📊 Loaded current transits from cache')
      return
    }

    // If no cached transits, fetch fresh ones
    await fetchCurrentTransits()
  }

  const fetchCurrentTransits = async () => {
    if (!user?.uid) return

    setIsLoadingTransits(true)
    try {
      const response = await fetch('/api/tools/horary-astrology/current-transits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          questionData: {
            question: 'General guidance',
            questionTime: new Date().toISOString(),
            questionPlace: userProfile?.birthPlace || 'Current location'
          }
        }),
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setCurrentTransits(result.data)
          // Store current transits with shorter cache time
          storeCurrentChart(user.uid, 'horary-astrology', result.data, undefined, { maxAge: 2 * 60 * 60 * 1000 }) // 2 hours
          devLog.debug('📊 Fresh current transits loaded and cached')
        }
      }
    } catch (err) {
      devLog.error('Error loading current transits:', err, 'page')
    } finally {
      setIsLoadingTransits(false)
    }
  }

  const generateHoraryAnalysis = async () => {
    if (!user?.uid || !question.trim() || !questionTime || !questionPlace?.trim()) {
      setError("Please provide a question, time, and place to generate Horary analysis")
      return
    }
    if (questionPlace.trim().length < 3) {
      setError("Please provide a valid location (at least 3 characters, e.g. City, Country)")
      return
    }

    // Validate date/time format
    if (!questionTime.includes('T')) {
      setError("The date or time could not be recognised. Please use the date and time picker and ensure both date and time are selected.")
      return
    }

    const [datePart, timePart] = questionTime.split('T')
    if (!datePart || !timePart) {
      setError("The date or time could not be recognised. Please use the date and time picker and ensure both date and time are selected.")
      return
    }

    const normalizedTime = normalizeTimePart(timePart)
    const fullDatetime = `${datePart}T${normalizedTime}`
    const d = new Date(fullDatetime)
    if (isNaN(d.getTime())) {
      setError("The date or time could not be recognised. Please use the date and time picker and ensure both date and time are selected.")
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch('/api/tools/horary-astrology/generate-custom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          questionData: {
            question: question.trim(),
            questionDate: datePart,
            questionTime: normalizedTime,
            questionPlace: questionPlace,
            latitude: userProfile?.birthLatitude || 12.2958,
            longitude: userProfile?.birthLongitude || 76.6394,
            timezone: userProfile?.timezone || 5.5
          }
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate Horary astrology report')
      }

      const result = await response.json()
      
      if (result.success) {
        setHoraryData(result.data)
        
        // Store as temporary data (question-specific analysis)
        storeChart(user.uid, 'horary-astrology', result.data)
        
        // Also load current transits
        await loadCurrentTransits()
        
        devLog.debug('Horary astrology analysis generated for question:', question)
      } else {
        throw new Error(result.error || 'Failed to generate Horary astrology report')
      }
    } catch (err: any) {
      devLog.error("Error performing Horary analysis:", err, 'page')
      setError(err.message || "Failed to perform Horary analysis")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen p-4 pb-8 starfield-ultra-sharp">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 pt-4"
        >
          <h1 className="text-5xl font-bold text-yellow-400 mb-4">🕰️ Horary Astrology</h1>
          <p className="text-white leading-relaxed text-lg mb-8">
            Professional astrological divination
          </p>
        </motion.div>

        {/* Question Input Form */}
        {!horaryData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto mb-8"
          >
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl p-8 shadow-md">
              <h2 className="text-3xl font-bold text-amber-900 mb-6 text-center">Ask Your Horary Question</h2>
              <p className="text-slate-700 text-center mb-8">
                Horary astrology answers specific questions by casting a chart for the exact moment you ask.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Question Input */}
                <div className="md:col-span-2">
                  <label className="block text-slate-700 font-semibold mb-3">
                    <span className="mr-2">❓</span>
                    Your Question
                  </label>
                  <textarea
                    placeholder="Ask a specific yes/no question or timing question..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="w-full bg-white border-2 border-amber-300 rounded-xl p-4 text-slate-800 placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-all duration-300 h-32 resize-none"
                  />
                  <p className="text-slate-600 text-sm mt-2">
                    Be specific and clear. Examples: &quot;Will I get the job?&quot;, &quot;When will I meet my soulmate?&quot;, &quot;Should I move to a new city?&quot;
                  </p>
                </div>

                {/* Question Time: date + time with AM/PM */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-3">
                    <span className="mr-2">⏰</span>
                    When did you ask this question?
                  </label>
                  <div className="flex flex-wrap gap-3 items-end">
                    <div className="flex-1 min-w-[140px]">
                      <label className="block text-slate-600 text-xs mb-1">Date</label>
                      <input
                        type="date"
                        value={questionTime ? questionTime.split("T")[0] : ""}
                        onChange={(e) => {
                          const date = e.target.value
                          const timePart = questionTime ? questionTime.split("T")[1]?.slice(0, 5) || "12:00" : "12:00"
                          setQuestionTime(date ? `${date}T${timePart}` : "")
                        }}
                        className="w-full bg-white border-2 border-amber-300 rounded-xl p-4 text-slate-800 focus:outline-none focus:border-amber-400 transition-all duration-300"
                      />
                    </div>
                    <div className="flex gap-2 items-center flex-wrap">
                      <div>
                        <label className="block text-slate-600 text-xs mb-1">Hour</label>
                        <select
                          value={time24To12(questionTime ? questionTime.split("T")[1]?.slice(0, 5) || "12:00" : "12:00").hour12}
                          onChange={(e) => {
                            const datePart = questionTime ? questionTime.split("T")[0] : new Date().toISOString().slice(0, 10)
                            const { minute, ampm } = time24To12(questionTime ? questionTime.split("T")[1]?.slice(0, 5) || "12:00" : "12:00")
                            setQuestionTime(`${datePart}T${time12To24(Number(e.target.value), minute, ampm)}`)
                          }}
                          className="bg-white border-2 border-amber-300 rounded-xl px-3 py-4 text-slate-800 focus:outline-none focus:border-amber-400 transition-all duration-300 min-w-[72px]"
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
                            <option key={n} value={n}>{n}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-600 text-xs mb-1">Min</label>
                        <select
                          value={time24To12(questionTime ? questionTime.split("T")[1]?.slice(0, 5) || "12:00" : "12:00").minute}
                          onChange={(e) => {
                            const datePart = questionTime ? questionTime.split("T")[0] : new Date().toISOString().slice(0, 10)
                            const { hour12, ampm } = time24To12(questionTime ? questionTime.split("T")[1]?.slice(0, 5) || "12:00" : "12:00")
                            setQuestionTime(`${datePart}T${time12To24(hour12, Number(e.target.value), ampm)}`)
                          }}
                          className="bg-white border-2 border-amber-300 rounded-xl px-3 py-4 text-slate-800 focus:outline-none focus:border-amber-400 transition-all duration-300 min-w-[72px]"
                        >
                          {Array.from({ length: 60 }, (_, i) => (
                            <option key={i} value={i}>{String(i).padStart(2, "0")}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-600 text-xs mb-1">AM/PM</label>
                        <select
                          value={time24To12(questionTime ? questionTime.split("T")[1]?.slice(0, 5) || "12:00" : "12:00").ampm}
                          onChange={(e) => {
                            const datePart = questionTime ? questionTime.split("T")[0] : new Date().toISOString().slice(0, 10)
                            const { hour12, minute } = time24To12(questionTime ? questionTime.split("T")[1]?.slice(0, 5) || "12:00" : "12:00")
                            setQuestionTime(`${datePart}T${time12To24(hour12, minute, e.target.value as "AM" | "PM")}`)
                          }}
                          className="bg-white border-2 border-amber-300 rounded-xl px-3 py-4 text-slate-800 focus:outline-none focus:border-amber-400 transition-all duration-300 min-w-[80px]"
                        >
                          <option value="AM">AM</option>
                          <option value="PM">PM</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <p className="text-slate-600 text-sm mt-2">
                    The exact moment you first thought of this question
                  </p>
                </div>

                {/* Question Place */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-3">
                    <span className="mr-2">📍</span>
                    Where were you when you asked?
                  </label>
                  <input
                    type="text"
                    placeholder="City, Country"
                    value={questionPlace}
                    onChange={(e) => setQuestionPlace(e.target.value)}
                    className="w-full bg-white border-2 border-amber-300 rounded-xl p-4 text-slate-800 placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-all duration-300"
                  />
                  <p className="text-slate-600 text-sm mt-2">
                    Your location when the question first came to mind
                  </p>
                </div>

                {/* Manual Generate Button */}
                <div className="md:col-span-2 text-center">
                  <button
                    onClick={generateHoraryAnalysis}
                    disabled={!question.trim() || !questionTime || !questionPlace.trim() || questionPlace.trim().length < 3 || isGenerating}
                    className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-amber-600 shadow-md"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2 inline" />
                        Generating Chart...
                      </>
                    ) : (
                      <>
                        <span className="mr-2">🔮</span>
                        Generate Horary Chart
                      </>
                    )}
                  </button>
                  <p className="text-slate-600 text-sm mt-2">
                    Click to generate your personalized horary chart
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        {horaryData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center gap-4 mb-8"
          >
            <motion.button
              onClick={() => {
                setHoraryData(null)
                setQuestion('')
                setQuestionTime('')
                setQuestionPlace('')
                setError(null)
              }}
              className="flex items-center gap-2 bg-[var(--m3-surface-container)] border-2 border-amber-500/50 text-amber-400 py-3 px-6 rounded-xl font-semibold hover:bg-[var(--m3-surface-container-high)] hover:border-amber-400 transition-all duration-300"
              whileHover={{}}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw className="w-5 h-5" />
              Ask New Question
            </motion.button>
            
            <motion.button
              onClick={fetchCurrentTransits}
              disabled={isLoadingTransits}
              className="flex items-center gap-2 bg-[var(--m3-surface-container-low)] border border-[var(--m3-outline-variant)] text-slate-200 py-3 px-6 rounded-xl font-semibold hover:bg-[var(--m3-surface-container)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{}}
              whileTap={{ scale: 0.95 }}
            >
              {isLoadingTransits ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Activity className="w-5 h-5" />
                  Refresh Transits
                </>
              )}
            </motion.button>
          </motion.div>
        )}

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 shadow-md">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-red-900">Error</h3>
                  <p className="text-red-900">{error}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Loading State */}
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl p-12 max-w-md mx-auto shadow-md">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="text-6xl mb-6"
              >
                🕰️
              </motion.div>
              <h3 className="text-2xl font-bold text-amber-900 mb-2">Generating Horary Analysis</h3>
              <p className="text-slate-700">Analyzing your question and casting the horary chart...</p>
            </div>
          </motion.div>
        )}

        {/* Results Section */}
        {horaryData && !isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl p-6 shadow-md">
              {/* Tabs */}
              <div className="flex flex-wrap gap-2 mb-6">
                {[
                  { id: "chart_images", label: "Chart Images", icon: BarChart3 },
                  { id: "answer_analysis", label: "Answer Analysis", icon: Target },
                  { id: "planetary_positions", label: "Planetary Positions", icon: Star },
                  { id: "house_analysis", label: "House Analysis", icon: Compass },
                  { id: "aspects_analysis", label: "Aspects Analysis", icon: Zap },
                  { id: "timing_analysis", label: "Timing Analysis", icon: Clock },
                  { id: "guidance_analysis", label: "Guidance Analysis", icon: Brain },
                  { id: "ask_seer", label: "Ask The Seer", icon: MessageCircle },
                  { id: "current_transits", label: "Current Transits", icon: Activity }
                ].map((tab) => (
                  <motion.button
                    key={tab.id}
                    whileHover={{}}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
                      activeTab === tab.id
                        ? "bg-gradient-to-br from-amber-100 to-yellow-100 text-amber-900 border-2 border-amber-300 shadow-sm"
                        : "text-slate-600 hover:text-slate-800 hover:bg-amber-100/50 border-2 border-transparent"
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </motion.button>
                ))}
              </div>

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                {activeTab === "chart_images" && (
                  <motion.div
                    key="chart_images"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    <h3 className="text-2xl font-bold text-amber-900 mb-4">Horary Chart</h3>
                    
                    {/* Chart Image */}
                    {horaryData.chartImages?.horaryChart && (
                      <div className="text-center">
                        <img 
                          src={horaryData.chartImages.horaryChart} 
                          alt="Horary Chart" 
                          className="mx-auto rounded-xl border-2 border-amber-300 max-w-full h-auto"
                        />
                      </div>
                    )}

                    {/* Basic Info Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-white border-2 border-amber-200 rounded-xl shadow-sm">
                        <div className="text-3xl mb-2">❓</div>
                        <div className="text-slate-600 text-sm">Question</div>
                        <div className="text-amber-900 text-sm font-medium">{horaryData.basicInfo?.question}</div>
                      </div>
                      <div className="text-center p-4 bg-white border-2 border-amber-200 rounded-xl shadow-sm">
                        <div className="text-3xl mb-2">⏰</div>
                        <div className="text-slate-600 text-sm">Chart Time</div>
                        <div className="text-amber-900 text-sm font-medium">
                          {(() => {
                            const ct = horaryData.basicInfo?.chartTime
                            if (!ct) return '—'
                            const d = new Date(ct)
                            return Number.isNaN(d.getTime()) ? ct : d.toLocaleString()
                          })()}
                        </div>
                      </div>
                      <div className="text-center p-4 bg-white border-2 border-amber-200 rounded-xl shadow-sm">
                        <div className="text-3xl mb-2">📍</div>
                        <div className="text-slate-600 text-sm">Location</div>
                        <div className="text-amber-900 text-sm font-medium">{horaryData.basicInfo?.questionPlace}</div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === "answer_analysis" && (
                  <motion.div
                    key="answer_analysis"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    <h3 className="text-2xl font-bold text-amber-900 mb-4">Answer Analysis</h3>
                    <div className="bg-white border-2 border-amber-200 rounded-xl p-6 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-xl font-semibold text-amber-900">Direct Answer</h4>
                        <Badge variant="outline" className={`${
                          horaryData.answer?.answer === 'Yes' ? 'border-green-600 text-green-800 bg-green-50' :
                          horaryData.answer?.answer === 'No' ? 'border-red-600 text-red-800 bg-red-50' :
                          'border-amber-600 text-amber-800 bg-amber-50'
                        }`}>
                          {horaryData.answer?.answer || 'Maybe'}
                        </Badge>
                      </div>
                      <p className="text-slate-700 leading-relaxed mb-4">{horaryData.answer?.explanation || 'The chart provides guidance for your question.'}</p>
                      <div className="text-sm text-slate-600 mb-4">
                        <strong>Confidence Level:</strong> {horaryData.answer?.confidence || 75}%
                      </div>
                      <div className="text-sm text-slate-600">
                        <strong>Reasoning:</strong> {horaryData.answer?.reasoning || 'Based on planetary positions and aspects.'}
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === "planetary_positions" && (
                  <motion.div
                    key="planetary_positions"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    <h3 className="text-2xl font-bold text-amber-900 mb-4">Planetary Positions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {horaryData.planetaryPositions?.map((planet: any, index: number) => (
                        <div key={index} className="bg-white border-2 border-amber-200 rounded-xl p-4 shadow-sm">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-semibold text-amber-900">{planet.name || `Planet ${index + 1}`}</div>
                            <Badge variant="outline" className="border-amber-500 text-amber-800 bg-amber-50">
                              {planet.sign || 'Unknown'}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600 mb-2">House {planet.house}</p>
                          <p className="text-xs text-slate-600 mb-2">{planet.meaning}</p>
                          <div className="flex justify-between text-xs text-slate-600">
                            <span>Dignity: {planet.dignity}</span>
                            <span>Speed: {planet.speed}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTab === "house_analysis" && (
                  <motion.div
                    key="house_analysis"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    <h3 className="text-2xl font-bold text-amber-900 mb-4">Professional House Analysis</h3>
                    <div className="space-y-6">
                      {horaryData.houseAnalysis?.map((house: any, index: number) => (
                        <div key={index} className="bg-white border-2 border-amber-200 rounded-xl p-6 shadow-sm">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-xl font-bold text-amber-900">{house.name}</h4>
                            <div className="text-sm text-slate-600">
                              <span className="font-semibold">Cusp:</span> {house.cusp}
                            </div>
                          </div>
                          
                          {/* Horary Significance */}
                          <div className="mb-4">
                            <h5 className="text-lg font-semibold text-amber-900 mb-2">Horary Significance</h5>
                            <p className="text-slate-700 leading-relaxed">{house.horarySignificance}</p>
                          </div>
                          
                          {/* Ruler Analysis */}
                          <div className="mb-4">
                            <h5 className="text-lg font-semibold text-amber-900 mb-2">Ruler Analysis</h5>
                            <div className="space-y-2">
                              <div className="text-slate-700">
                                <span className="font-semibold">Ruler:</span> {house.ruler}
                              </div>
                              <div className="text-slate-700">
                                <span className="font-semibold">Position:</span> {house.rulerPosition}
                              </div>
                              <div className="text-slate-700">
                                <span className="font-semibold">Dignity:</span> {house.rulerDignity}
                              </div>
                            </div>
                          </div>
                          
                          {/* Planets in House */}
                          {house.planets && house.planets.length > 0 && (
                            <div className="mb-4">
                              <h5 className="text-lg font-semibold text-amber-900 mb-2">Planets in House</h5>
                              <div className="space-y-2">
                                {house.planets.map((planet: any, planetIndex: number) => (
                                  <div key={planetIndex} className="flex items-center justify-between bg-amber-50 rounded-xl p-3 border border-amber-200">
                                    <div>
                                      <span className="font-semibold text-amber-900">{planet.name}</span>
                                      <span className="text-slate-600 ml-2">{planet.position}</span>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-sm text-slate-700">{planet.dignity}</div>
                                      {planet.retrograde && (
                                        <div className="text-xs text-amber-600">Retrograde</div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Aspects */}
                          {house.aspects && house.aspects.length > 0 && (
                            <div className="mb-4">
                              <h5 className="text-lg font-semibold text-amber-900 mb-2">Aspects</h5>
                              <div className="space-y-2">
                                {house.aspects.map((aspect: any, aspectIndex: number) => (
                                  <div key={aspectIndex} className="bg-amber-50 rounded-xl p-3 border border-amber-200">
                                    <div className="flex items-center justify-between">
                                      <span className="font-semibold text-amber-900">{aspect.aspect}</span>
                                      <span className="text-slate-600">{aspect.orb?.toFixed?.(1) ?? aspect.orb}° orb</span>
                                    </div>
                                    <div className="text-slate-700 mt-1">{aspect.planets}</div>
                                    {aspect.applying && (
                                      <div className="text-xs text-green-700 mt-1">Applying aspect</div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Professional Analysis */}
                          <div className="border-t border-amber-200 pt-4">
                            <h5 className="text-lg font-semibold text-amber-900 mb-2">Professional Analysis</h5>
                            <div className="text-slate-700 leading-relaxed whitespace-pre-line">
                              {house.professionalAnalysis}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTab === "aspects_analysis" && (
                  <motion.div
                    key="aspects_analysis"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    <h3 className="text-2xl font-bold text-amber-900 mb-4">Aspect Analysis</h3>
                    {horaryData.aspects && horaryData.aspects.length > 0 ? (
                      <div className="space-y-3">
                        {horaryData.aspects.map((aspect: any, index: number) => (
                          <div key={index} className="bg-white border-2 border-amber-200 rounded-xl p-4 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-amber-900">{aspect.planets}</h4>
                              <Badge variant="outline" className="border-green-600 text-green-800 bg-green-50">
                                {aspect.type}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-700 mb-2">{aspect.description}</p>
                            <div className="flex justify-between text-xs text-slate-600">
                              <span>Orb: {aspect.orb?.toFixed?.(2) ?? aspect.orb}°</span>
                              <span>{aspect.applying ? 'Applying' : 'Separating'}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-white border-2 border-amber-200 rounded-xl p-6 text-center shadow-sm">
                        <p className="text-slate-700">No significant aspects found in this horary chart.</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === "timing_analysis" && (
                  <motion.div
                    key="timing_analysis"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    <h3 className="text-2xl font-bold text-amber-900 mb-4">Timing Analysis</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="bg-white border-2 border-amber-200 rounded-xl p-4 shadow-sm">
                        <h4 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                          <Clock className="w-4 h-4 text-amber-600" />
                          Immediate Timing
                        </h4>
                        <p className="text-sm text-slate-700">{horaryData.timing?.immediate || 'Within 1-3 days'}</p>
                      </div>
                      <div className="bg-white border-2 border-amber-200 rounded-xl p-4 shadow-sm">
                        <h4 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-amber-600" />
                          Short Term
                        </h4>
                        <p className="text-sm text-slate-700">{horaryData.timing?.shortTerm || 'Within 1-2 weeks'}</p>
                      </div>
                      <div className="bg-white border-2 border-amber-200 rounded-xl p-4 shadow-sm">
                        <h4 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                          <Target className="w-4 h-4 text-amber-600" />
                          Long Term
                        </h4>
                        <p className="text-sm text-slate-700">{horaryData.timing?.longTerm || 'Within 1-3 months'}</p>
                      </div>
                      <div className="bg-white border-2 border-amber-200 rounded-xl p-4 shadow-sm">
                        <h4 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                          <Star className="w-4 h-4 text-amber-600" />
                          Moon Phase
                        </h4>
                        <p className="text-sm text-slate-700">{horaryData.timing?.moonPhase || 'Waxing Crescent'}</p>
                      </div>
                    </div>

                    {/* Critical Dates */}
                    {horaryData.timing?.criticalDates && horaryData.timing.criticalDates.length > 0 && (
                      <div className="bg-white border-2 border-amber-200 rounded-xl p-4 shadow-sm">
                        <h4 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-600" />
                          Critical Dates
                        </h4>
                        <ul className="text-sm text-slate-700 space-y-1">
                          {horaryData.timing.criticalDates.map((date: string, index: number) => (
                            <li key={index}>• {date}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === "guidance_analysis" && (
                  <motion.div
                    key="guidance_analysis"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    <h3 className="text-2xl font-bold text-amber-900 mb-4">Guidance & Advice</h3>
                    <p className="text-slate-700 leading-relaxed mb-4">{horaryData.guidance?.guidance || 'The chart provides clear guidance for your situation.'}</p>
                    
                    <div className="space-y-3">
                      {(horaryData.guidance?.recommendations || horaryData.guidance?.advice || []).map((rec: string, index: number) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="text-amber-600 mt-1">•</div>
                          <p className="text-slate-700">{rec}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTab === "ask_seer" && (
                  <motion.div
                    key="ask_seer"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-2xl p-6 shadow-md">
                      <HorarySeerChatInterface
                        horaryData={horaryData}
                        userId={user?.uid}
                        userProfile={userProfile ?? undefined}
                        sessionId={user?.uid ? `horary_${user.uid}` : undefined}
                      />
                    </div>
                  </motion.div>
                )}

                {activeTab === "current_transits" && (
                  <motion.div
                    key="current_transits"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    <h3 className="text-2xl font-bold text-amber-900 mb-4">Current Transits</h3>
                    
                    <div className="mb-4 flex justify-between items-center flex-wrap gap-2">
                      <p className="text-slate-700">Current planetary influences affecting your question</p>
                      <button
                        onClick={fetchCurrentTransits}
                        disabled={isLoadingTransits}
                        className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 border-2 border-amber-600 shadow-sm"
                      >
                        {isLoadingTransits ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-4 h-4" />
                            Refresh Transits
                          </>
                        )}
                      </button>
                    </div>

                    {currentTransits ? (
                      <div className="space-y-4">
                        {/* Active Transits */}
                        <div className="bg-white border-2 border-amber-200 rounded-xl p-4 shadow-sm">
                          <h4 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
                            <Activity className="w-4 h-4 text-amber-600" />
                            Active Transits
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {currentTransits.activeTransits?.slice(0, 8).map((transit: any, index: number) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-amber-50 rounded-xl border border-amber-200">
                                <div className="flex items-center gap-2">
                                  <span className="text-amber-900 font-semibold text-sm">{transit.planet}</span>
                                  <span className="text-slate-600 text-xs">{transit.sign}</span>
                                </div>
                                <div className="text-xs text-slate-600">
                                  {transit.degree?.toFixed?.(1) ?? transit.degree}° • H{transit.house}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Current Aspects */}
                        {currentTransits.currentAspects && currentTransits.currentAspects.length > 0 && (
                          <div className="bg-white border-2 border-amber-200 rounded-xl p-4 shadow-sm">
                            <h4 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
                              <Zap className="w-4 h-4 text-amber-600" />
                              Current Aspects
                            </h4>
                            <div className="space-y-2">
                              {currentTransits.currentAspects.slice(0, 5).map((aspect: any, index: number) => (
                                <div key={index} className="flex items-center justify-between p-2 bg-amber-50 rounded-xl border border-amber-200">
                                  <div className="text-slate-700 text-sm">{aspect.planets}</div>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="border-green-600 text-green-800 bg-green-50 text-xs">
                                      {aspect.aspect}
                                    </Badge>
                                    <span className="text-slate-600 text-xs">{aspect.orb?.toFixed?.(1) ?? aspect.orb}°</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Moon Information */}
                        <div className="bg-white border-2 border-amber-200 rounded-xl p-4 shadow-sm">
                          <h4 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
                            <Moon className="w-4 h-4 text-amber-600" />
                            Lunar Information
                          </h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="text-slate-600 text-sm">Moon Phase</div>
                              <div className="text-amber-900 font-semibold">{currentTransits.moonPhase}</div>
                            </div>
                            <div>
                              <div className="text-slate-600 text-sm">Moon Sign</div>
                              <div className="text-amber-900 font-semibold">{currentTransits.moonSign}</div>
                            </div>
                          </div>
                        </div>

                        {/* Chart Time */}
                        <div className="bg-white border-2 border-amber-200 rounded-xl p-4 shadow-sm">
                          <div className="text-slate-600 text-sm">Chart Generated</div>
                          <div className="text-amber-900 font-semibold">
                            {currentTransits.chartTime ? new Date(currentTransits.chartTime).toLocaleString() : 'Just now'}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white border-2 border-amber-200 rounded-xl p-6 text-center shadow-sm">
                        <p className="text-slate-700">No current transit data available. Click &quot;Refresh Transits&quot; to load current planetary influences.</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  )
}
