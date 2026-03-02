"use client"

import { useMemo, useCallback } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DashboardSection } from "@/components/western/DashboardSection"
import { Material3LoadingSpinner } from "./Material3LoadingSpinner"
import { 
  Star, 
  Sparkles, 
  Calendar, 
  RefreshCw,
  AlertCircle,
  Heart,
  Zap,
  Info
} from "lucide-react"
import { ANGEL_NUMBERS_CONSTANTS, MATERIAL3_EASING } from "./constants"

interface AngelNumbersData {
  userId: string
  fullName: string
  birthDate: string
  lastFetched: number
  lifePathAngel: number
  destinyAngel: number
  soulAngel: number
  personalityAngel: number
  currentDateAngel: number
  personalYearAngel: number
  personalMonthAngel: number
  personalDayAngel: number
  frequentNumbers: any[]
  masterNumbers: any[]
  repeatingPatterns: string[]
  angelicGuidance: {
    primaryMessage: string
    secondaryMessages: string[]
    actionSteps: string[]
    affirmations: string[]
    warnings?: string[]
  }
  synchronicities: {
    numberSequences: string[]
    timePatterns: string[]
    dateSignificance: string[]
    meaningfulCoincidences: string[]
  }
  metadata: {
    reportId: string
    version: string
    source: string
    isComprehensive: boolean
    systemConfidence?: number
    learningApplied?: boolean
  }
}

interface AngelNumbersAnalysisProps {
  angelNumbersData: AngelNumbersData
  loading: boolean
  error: string | null
  onRefresh: () => void
  onClearCache: () => Promise<void>
}

export function AngelNumbersAnalysis({
  angelNumbersData,
  loading,
  error,
  onRefresh,
  onClearCache
}: AngelNumbersAnalysisProps) {
  // Memoize action handler
  const handleClearAndRegenerate = useCallback(async () => {
    await onClearCache()
    await onRefresh()
  }, [onClearCache, onRefresh])

  // Memoize master numbers check
  const hasMasterNumbers = useMemo(() => {
    return angelNumbersData.masterNumbers.length > 0
  }, [angelNumbersData.masterNumbers])

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-3xl">
        <CardContent className="p-8 text-center">
          <Material3LoadingSpinner size={64} className="mb-4 mx-auto" />
          <p className="text-amber-900 text-lg">{ANGEL_NUMBERS_CONSTANTS.MESSAGES.DECODING}</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 rounded-3xl">
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-red-700 text-lg mb-2">{ANGEL_NUMBERS_CONSTANTS.ERRORS.DECODING_ERROR}</p>
          <p className="text-slate-700">{error}</p>
          <motion.button
            whileHover={{}}
            whileTap={{ scale: 0.95, y: 0 }}
            onClick={onRefresh}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="mt-4 px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-xl font-semibold hover:shadow-xl transition-all duration-300"
          >
            {ANGEL_NUMBERS_CONSTANTS.BUTTONS.TRY_AGAIN}
          </motion.button>
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: MATERIAL3_EASING.decelerated }}
      className="space-y-6"
    >
      {/* Action Buttons */}
      <div className="flex gap-3 justify-end">
        <motion.button
          whileHover={{}}
          whileTap={{ scale: 0.95, y: 0 }}
          onClick={onRefresh}
          disabled={loading}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-300"
        >
                    <RefreshCw className="w-4 h-4" />
                    {loading ? ANGEL_NUMBERS_CONSTANTS.BUTTONS.REFRESHING : ANGEL_NUMBERS_CONSTANTS.BUTTONS.REFRESH}
        </motion.button>
        <motion.button
          whileHover={{}}
          whileTap={{ scale: 0.95, y: 0 }}
          onClick={handleClearAndRegenerate}
          disabled={loading}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-amber-300 text-amber-700 rounded-xl font-semibold hover:bg-amber-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {ANGEL_NUMBERS_CONSTANTS.BUTTONS.CLEAR_REGENERATE}
        </motion.button>
      </div>

      {/* Personal Angel Numbers */}
      <DashboardSection 
        title={ANGEL_NUMBERS_CONSTANTS.SECTIONS.PERSONAL_ANGEL_NUMBERS} 
        icon={<Star className="w-6 h-6" />}
        badge={ANGEL_NUMBERS_CONSTANTS.BADGES.DIVINE_BLUEPRINT}
        defaultExpanded={true}
        colorScheme="amber"
        storageKey={ANGEL_NUMBERS_CONSTANTS.STORAGE_KEYS.PERSONAL_NUMBERS}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            whileHover={{}}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl hover:shadow-lg transition-all duration-300">
              <CardContent className="p-4 text-center">
                <div className="text-2xl mb-2">👼</div>
                <div className="text-amber-900 font-semibold mb-1">Life Path</div>
                <div className="text-amber-600 text-3xl font-bold">{angelNumbersData.lifePathAngel}</div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div
            whileHover={{}}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl hover:shadow-lg transition-all duration-300">
              <CardContent className="p-4 text-center">
                <div className="text-2xl mb-2">⭐</div>
                <div className="text-purple-900 font-semibold mb-1">Destiny</div>
                <div className="text-purple-600 text-3xl font-bold">{angelNumbersData.destinyAngel}</div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div
            whileHover={{}}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl hover:shadow-lg transition-all duration-300">
              <CardContent className="p-4 text-center">
                <div className="text-2xl mb-2">💫</div>
                <div className="text-blue-900 font-semibold mb-1">Soul</div>
                <div className="text-blue-600 text-3xl font-bold">{angelNumbersData.soulAngel}</div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div
            whileHover={{}}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl hover:shadow-lg transition-all duration-300">
              <CardContent className="p-4 text-center">
                <div className="text-2xl mb-2">✨</div>
                <div className="text-green-900 font-semibold mb-1">Personality</div>
                <div className="text-green-600 text-3xl font-bold">{angelNumbersData.personalityAngel}</div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </DashboardSection>

      {/* Angelic Guidance */}
      <DashboardSection 
        title={ANGEL_NUMBERS_CONSTANTS.SECTIONS.DIVINE_GUIDANCE} 
        icon={<Sparkles className="w-6 h-6" />}
        badge={ANGEL_NUMBERS_CONSTANTS.BADGES.ANGELIC_MESSAGES}
        defaultExpanded={true}
        colorScheme="purple"
        storageKey={ANGEL_NUMBERS_CONSTANTS.STORAGE_KEYS.GUIDANCE}
      >
        <div className="space-y-4">
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <h4 className="text-purple-900 font-semibold mb-3 flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Primary Message
              </h4>
              <p className="text-slate-700 leading-relaxed text-lg">{angelNumbersData.angelicGuidance.primaryMessage}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <h4 className="text-blue-900 font-semibold mb-3 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Action Steps
              </h4>
              <ul className="space-y-2">
                {angelNumbersData.angelicGuidance.actionSteps.map((step, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="text-slate-700 flex items-start gap-2"
                  >
                    <span className="text-blue-600 mt-1">•</span>
                    <span>{step}</span>
                  </motion.li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <h4 className="text-amber-900 font-semibold mb-3 flex items-center gap-2">
                <Star className="w-5 h-5" />
                Affirmations
              </h4>
              <div className="space-y-2">
                {angelNumbersData.angelicGuidance.affirmations.map((affirmation, index) => (
                  <motion.p
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="text-slate-700 italic bg-white/60 p-3 rounded-lg"
                  >
                    "{affirmation}"
                  </motion.p>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardSection>

      {/* Current Angel Numbers */}
      <DashboardSection 
        title={ANGEL_NUMBERS_CONSTANTS.SECTIONS.CURRENT_ENERGIES} 
        icon={<Calendar className="w-6 h-6" />}
        badge={ANGEL_NUMBERS_CONSTANTS.BADGES.PRESENT_MOMENT}
        defaultExpanded={false}
        colorScheme="cyan"
        storageKey={ANGEL_NUMBERS_CONSTANTS.STORAGE_KEYS.CURRENT_NUMBERS}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            whileHover={{}}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-200 rounded-2xl hover:shadow-lg transition-all duration-300">
              <CardContent className="p-4 text-center">
                <div className="text-cyan-600 text-sm mb-1 font-medium">Today</div>
                <div className="text-cyan-900 text-3xl font-bold">{angelNumbersData.currentDateAngel}</div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div
            whileHover={{}}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-2xl hover:shadow-lg transition-all duration-300">
              <CardContent className="p-4 text-center">
                <div className="text-indigo-600 text-sm mb-1 font-medium">Year</div>
                <div className="text-indigo-900 text-3xl font-bold">{angelNumbersData.personalYearAngel}</div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div
            whileHover={{}}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Card className="bg-gradient-to-br from-violet-50 to-purple-50 border-2 border-violet-200 rounded-2xl hover:shadow-lg transition-all duration-300">
              <CardContent className="p-4 text-center">
                <div className="text-violet-600 text-sm mb-1 font-medium">Month</div>
                <div className="text-violet-900 text-3xl font-bold">{angelNumbersData.personalMonthAngel}</div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </DashboardSection>

      {/* Synchronicities */}
      <DashboardSection 
        title={ANGEL_NUMBERS_CONSTANTS.SECTIONS.DIVINE_SYNCHRONICITIES} 
        icon={<Sparkles className="w-6 h-6" />}
        badge={ANGEL_NUMBERS_CONSTANTS.BADGES.MEANINGFUL_SIGNS}
        defaultExpanded={false}
        colorScheme="pink"
        storageKey={ANGEL_NUMBERS_CONSTANTS.STORAGE_KEYS.SYNCHRONICITIES}
      >
        <div className="space-y-4">
          <Card className="bg-gradient-to-br from-pink-50 to-rose-50 border-2 border-pink-200 rounded-2xl hover:shadow-lg transition-all duration-300">
            <CardContent className="p-4">
              <h4 className="text-pink-900 font-semibold mb-3">Number Sequences</h4>
              <div className="flex flex-wrap gap-2">
                {angelNumbersData.synchronicities.numberSequences.map((seq, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05, type: "spring", stiffness: 200 }}
                    whileHover={{}}
                    className="px-3 py-1 bg-pink-500/20 text-pink-700 border border-pink-300 rounded-full text-sm cursor-default"
                  >
                    {seq}
                  </motion.span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardSection>

      {/* Master Numbers (if any) */}
      {hasMasterNumbers && (
        <DashboardSection 
          title={ANGEL_NUMBERS_CONSTANTS.SECTIONS.MASTER_NUMBERS} 
          icon={<Star className="w-6 h-6" />}
          badge={ANGEL_NUMBERS_CONSTANTS.BADGES.ADVANCED_SPIRITUAL}
          defaultExpanded={false}
          colorScheme="purple"
          storageKey={ANGEL_NUMBERS_CONSTANTS.STORAGE_KEYS.MASTER_NUMBERS}
        >
          <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-2xl hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Info className="w-5 h-5 text-purple-600" />
                <p className="text-slate-700">
                  You have Master Numbers in your profile, indicating advanced spiritual gifts and heightened abilities.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                {angelNumbersData.masterNumbers.map((master, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
                    whileHover={{}}
                  >
                    <Badge className="bg-purple-600 text-white px-4 py-2 text-lg">
                      {master.number}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </DashboardSection>
      )}
    </motion.div>
  )
}
