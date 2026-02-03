// Streamlined Numerology page that directly uses comprehensive profile data
"use client"

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/use-auth'
import { useToolData, saveToolData } from '@/lib/toolStorageUtils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ToolIntroductionTab } from '@/components/ToolIntroductionTab'
import { CompatibilityTab } from '@/components/compatibility/CompatibilityTab'
import { NumerologyRemedies } from '@/components/numerology/NumerologyRemedies'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { detectKarmicDebtNumbers, karmicDebtShortMeaning } from '@/lib/numerology/karmicDebt'
import { DashboardSection } from '@/components/western/DashboardSection'
import { 
  Hash, 
  Calendar,
  Clock,
  MapPin,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Info,
  Brain,
  Gem,
  MessageCircle,
  User,
  Eye,
  Heart,
  Target,
  Activity,
  Sun,
  Moon,
  Sparkles,
  Calculator,
  BookOpen,
  Compass,
  Star,
  Briefcase,
  ActivityIcon,
  TrendingUp
} from 'lucide-react'
import LoShuGrid from '@/components/numerology/LoShuGrid'
import { LuckyEssentials } from '@/components/numerology/LuckyEssentials'
import { NamePlanes } from '@/components/numerology/NamePlanes'
import { calcPersonalYear } from '@/lib/numerology/personalYear'
import { calcDriver, calcConductor } from '@/lib/numerology/driverConductor'
import { getZodiacFromDate } from '@/lib/numerology/zodiac'
import { getFavorables } from '@/lib/numerology/favorables'
import { getKuaResult } from '@/lib/numerology/kua'
import { calcChallengeCycles } from '@/lib/numerology/cycles'
import { generateMonthForecast } from '@/lib/numerology/forecast'
import { getSummaryNumbers } from '@/lib/numerology/summary'
import ComprehensiveNumerologyReport from '@/components/numerology/ComprehensiveNumerologyReport'
import NumerologySeerChatInterface from '@/components/numerology/NumerologySeerChatInterface'
import { DevotionistStyleCard } from '@/components/western/DevotionistStyleCard'
import { ChaldeanInterpretations } from '@/lib/numerology/chaldean'

export default function NumerologyPage() {
  const { user, userProfile } = useAuth()
  const [activeTab, setActiveTab] = useState<'introduction' | 'overview' | 'report' | 'numbers' | 'compatibility' | 'guidance' | 'remedies' | 'ask-the-seer'>('introduction')
  const [isAutoGenerating, setIsAutoGenerating] = useState(false)
  const [comprehensiveReport, setComprehensiveReport] = useState<Record<string, unknown> | null>(null)
  const [isLoadingComprehensiveReport, setIsLoadingComprehensiveReport] = useState(false)

  // Check if user has complete birth details
  const hasCompleteDetails = userProfile?.birthDate && userProfile?.birthTime && userProfile?.birthPlace

  // Use the new localStorage-based hook
  const { toolData: numerologyData, isLoading, error, refetch } = useToolData(
    user?.uid, 
    'numerology', 
    hasCompleteDetails
  )

  // Memoized calculations for performance
  const driverConductor = useMemo(() => ({
    driver: calcDriver(userProfile?.birthDate),
    conductor: calcConductor(userProfile?.birthDate)
  }), [userProfile?.birthDate])

  const personalYear = useMemo(() => 
    calcPersonalYear(userProfile?.birthDate || ''), 
    [userProfile?.birthDate]
  )

  const zodiacInfo = useMemo(() => 
    getZodiacFromDate(userProfile?.birthDate), 
    [userProfile?.birthDate]
  )

  const favorables = useMemo(() => 
    getFavorables(driverConductor.driver.reduced), 
    [driverConductor.driver.reduced]
  )

  const kuaNumber = useMemo(() => {
    const birthYear = userProfile?.birthDate ? parseInt(userProfile.birthDate.split('-')[0], 10) : undefined
    if (!birthYear) return null
    const isMale = userProfile?.gender !== 'female'
    return getKuaResult(birthYear, isMale)
  }, [userProfile?.birthDate, userProfile?.gender])

  const luckyEssentials = useMemo(() => {
    const birthYear = userProfile?.birthDate ? parseInt(userProfile.birthDate.split('-')[0], 10) : undefined
    return { driver: driverConductor.driver.reduced, conductor: driverConductor.conductor.reduced, birthYear }
  }, [driverConductor.driver.reduced, driverConductor.conductor.reduced, userProfile?.birthDate])

  const challengeCycles = useMemo(() => 
    calcChallengeCycles(userProfile?.birthDate), 
    [userProfile?.birthDate]
  )

  const summaryNumbers = useMemo(() => 
    getSummaryNumbers(
      numerologyData?.life_path_number || numerologyData?.life_path || null,
      numerologyData?.destiny_number || null,
      numerologyData?.birthday_number || null
    ),
    [numerologyData?.life_path_number, numerologyData?.life_path, numerologyData?.destiny_number, numerologyData?.birthday_number]
  )

  // Memoize current month to avoid recalculation on every render
  const currentMonth = useMemo(() => new Date().getMonth() + 1, [])
  
  const monthlyForecast = useMemo(() => {
    const py = personalYear
    const birthYear = userProfile?.birthDate ? parseInt(userProfile.birthDate.split('-')[0], 10) : null
    if (!py || !birthYear) return []
    return generateMonthForecast(py, birthYear, currentMonth)
  }, [personalYear, userProfile?.birthDate, currentMonth])

  const karmicDebts = useMemo(() => 
    detectKarmicDebtNumbers([
      numerologyData?.life_path_number || numerologyData?.life_path,
      numerologyData?.expression_number,
      numerologyData?.destiny_number,
      numerologyData?.birthday_number,
      numerologyData?.maturity_number,
    ]),
    [numerologyData?.life_path_number, numerologyData?.life_path, numerologyData?.expression_number, numerologyData?.destiny_number, numerologyData?.birthday_number, numerologyData?.maturity_number]
  )

  // Auto-generate numerology when profile is complete and no data exists
  useEffect(() => {
    const shouldAutogen = !!hasCompleteDetails && !isLoading && !numerologyData && !!user?.uid && !isAutoGenerating
    if (!shouldAutogen) return
    setIsAutoGenerating(true)
    ;(async () => {
      try {
        const res = await fetch('/api/numerology/chaldean', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user?.uid,
            birthDate: userProfile?.birthDate,
            currentName: userProfile?.fullName || userProfile?.displayName || user?.displayName || ''
          })
        })
        const json = await res.json()
        if (json?.data?.result && user?.uid) {
          const r = json.data.result
          const payload = {
            life_path_number: r.numbers.lifePath,
            life_path: r.numbers.lifePath,
            expression_number: r.numbers.destiny,
            soul_number: r.numbers.soulUrge,
            soul_urge: r.numbers.soulUrge,
            personality_number: r.numbers.personality,
            destiny_number: r.numbers.destiny,
            birthday_number: r.numbers.birthday,
            maturity_number: r.numbers.maturity,
            breakdown: r.breakdown,
            interpretations: json.data.interpretations
          }
          saveToolData(user.uid, 'numerology', payload)
          refetch() // Trigger immediate data reload after saving
        }
      } catch (e) {
        console.error('numerology autogen failed', e)
      } finally {
        setIsAutoGenerating(false)
      }
    })()
  }, [hasCompleteDetails, isLoading, numerologyData, user?.uid, userProfile?.birthDate, userProfile?.displayName, userProfile?.fullName, isAutoGenerating])

  // Fetch comprehensive report when numerology data is available
  useEffect(() => {
    const fetchComprehensiveReport = async () => {
      if (!user?.uid || !numerologyData || comprehensiveReport) {
        return
      }

      setIsLoadingComprehensiveReport(true)
      try {
        const response = await fetch('/api/numerology/comprehensive', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.uid,
            numerologyData: {
              lifePathNumber: numerologyData.life_path_number || numerologyData.life_path,
              expressionNumber: numerologyData.expression_number,
              soulUrgeNumber: numerologyData.soul_number || numerologyData.soul_urge,
              personalityNumber: numerologyData.personality_number,
              destinyNumber: numerologyData.destiny_number,
              birthdayNumber: numerologyData.birthday_number,
              maturityNumber: numerologyData.maturity_number,
              breakdown: numerologyData.breakdown
            },
            userProfile: userProfile
          }),
        })

        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data?.comprehensiveAnalysis) {
            setComprehensiveReport(result.data.comprehensiveAnalysis)
          }
        }
      } catch (error) {
        console.error('Error fetching comprehensive report:', error)
      } finally {
        setIsLoadingComprehensiveReport(false)
      }
    }

    fetchComprehensiveReport()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, numerologyData])

  if (isLoading) {
    return (
      <div className="relative min-h-screen starfield-ultra-sharp">
        <div className="relative z-10 container mx-auto px-4 pt-4 pb-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4"></div>
              <p className="m3-body-medium text-slate-300">Loading your numerology data...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="relative min-h-screen starfield-ultra-sharp">
        <div className="relative z-10 container mx-auto px-4 pt-4 pb-8">
          <div className="backdrop-blur-sm bg-slate-900/50 border-amber-500/50 rounded-xl p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="m3-title-large text-red-300 font-semibold mb-2">Error Loading Numerology Data</h3>
            <p className="m3-body-medium text-red-400 mb-4">{error}</p>
            <div className="flex items-center justify-center gap-3">
              <Button 
                onClick={refetch} 
                className="m3-ripple m3-button-bounce m3-elevation-1 hover:m3-elevation-2 m3-elevation-transition bg-[var(--m3-primary)] text-[var(--m3-on-primary)] hover:bg-[var(--m3-primary)]/90"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!hasCompleteDetails) {
    return (
      <div className="relative min-h-screen starfield-ultra-sharp">
        <div className="relative z-10 container mx-auto px-4 pt-4 pb-8">
          <div className="backdrop-blur-sm bg-slate-900/50 border-amber-500/50 rounded-xl p-6 text-center">
            <Info className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="m3-title-large text-slate-300 font-semibold mb-2">Complete Your Profile</h3>
            <p className="m3-body-medium text-slate-400 mb-4">
              Please complete your birth date, time, and place in your profile to generate numerology insights.
            </p>
            <Button
              onClick={() => window.location.href = '/profile'}
              className="m3-ripple m3-button-bounce m3-elevation-1 hover:m3-elevation-2 m3-elevation-transition bg-[var(--m3-primary)] text-[var(--m3-on-primary)] hover:bg-[var(--m3-primary)]/90"
            >
              <User className="w-4 h-4 mr-2" />
              Complete Profile
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!numerologyData) {
    return (
      <div className="relative min-h-screen starfield-ultra-sharp">
        <div className="relative z-10 container mx-auto px-4 pt-4 pb-8">
          <div className="backdrop-blur-sm bg-slate-900/50 border-amber-500/50 rounded-xl p-6 text-center">
            <Info className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="m3-title-large text-slate-300 font-semibold mb-2">Preparing Your Numerology</h3>
            <p className="m3-body-medium text-slate-400 mb-4">We're generating your Chaldean numerology report automatically.</p>
            <div className="flex items-center justify-center gap-3">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-400" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen">
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 pt-4 pb-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="m3-headline-large mb-6 flex items-center justify-center gap-3">
            <span className="text-amber-400">🔢</span>
            <span className="bg-gradient-to-b from-amber-200 via-yellow-400 to-amber-600 bg-clip-text text-transparent">Numerology</span>
          </h1>
          <p className="m3-body-large text-slate-300">
            Ancient Babylonian number system revealing life patterns and destiny
          </p>
          
          {/* Data Source Indicators */}
          {/* Data source pills removed per request */}
          
          {/* Debug info removed for production */}
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2 bg-transparent p-0">
            <TabsTrigger 
              value="introduction" 
              className="m3-elevation-0 m3-elevation-transition m3-transition-standard data-[state=active]:m3-elevation-1 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 text-slate-300 hover:text-slate-100 hover:m3-elevation-1 rounded-xl px-3 py-2 text-xs sm:text-sm m3-label-medium"
            >
              Introduction
            </TabsTrigger>
            <TabsTrigger 
              value="overview" 
              className="m3-elevation-0 m3-elevation-transition m3-transition-standard data-[state=active]:m3-elevation-1 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 text-slate-300 hover:text-slate-100 hover:m3-elevation-1 rounded-xl px-3 py-2 text-xs sm:text-sm m3-label-medium"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="report" 
              className="m3-elevation-0 m3-elevation-transition m3-transition-standard data-[state=active]:m3-elevation-1 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 text-slate-300 hover:text-slate-100 hover:m3-elevation-1 rounded-xl px-3 py-2 text-xs sm:text-sm m3-label-medium"
            >
              Report
            </TabsTrigger>
            <TabsTrigger 
              value="compatibility" 
              className="m3-elevation-0 m3-elevation-transition m3-transition-standard data-[state=active]:m3-elevation-1 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 text-slate-300 hover:text-slate-100 hover:m3-elevation-1 rounded-xl px-3 py-2 text-xs sm:text-sm m3-label-medium"
            >
              Compare
            </TabsTrigger>
            <TabsTrigger 
              value="numbers" 
              className="m3-elevation-0 m3-elevation-transition m3-transition-standard data-[state=active]:m3-elevation-1 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 text-slate-300 hover:text-slate-100 hover:m3-elevation-1 rounded-xl px-3 py-2 text-xs sm:text-sm m3-label-medium"
            >
              Numbers
            </TabsTrigger>
            <TabsTrigger 
              value="remedies" 
              className="m3-elevation-0 m3-elevation-transition m3-transition-standard data-[state=active]:m3-elevation-1 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 text-slate-300 hover:text-slate-100 hover:m3-elevation-1 rounded-xl px-3 py-2 text-xs sm:text-sm m3-label-medium"
            >
              Remedies
            </TabsTrigger>
            <TabsTrigger 
              value="guidance" 
              className="m3-elevation-0 m3-elevation-transition m3-transition-standard data-[state=active]:m3-elevation-1 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 text-slate-300 hover:text-slate-100 hover:m3-elevation-1 rounded-xl px-3 py-2 text-xs sm:text-sm m3-label-medium"
            >
              Guidance
            </TabsTrigger>
            <TabsTrigger 
              value="ask-the-seer" 
              className="m3-elevation-0 m3-elevation-transition m3-transition-standard data-[state=active]:m3-elevation-1 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 text-slate-300 hover:text-slate-100 hover:m3-elevation-1 rounded-xl px-3 py-2 text-xs sm:text-sm m3-label-medium"
            >
              Ask the Seer
            </TabsTrigger>
          </TabsList>

          {/* Introduction Tab */}
          <TabsContent value="introduction" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
            >
              <ToolIntroductionTab toolSlug="numerology" />
            </motion.div>
          </TabsContent>

          {/* Report Tab */}
          <TabsContent value="report" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
            >
              <ComprehensiveNumerologyReport
                userId={user?.uid}
                numerologyData={numerologyData}
                userProfile={userProfile}
                cachedReport={comprehensiveReport}
                isLoadingReport={isLoadingComprehensiveReport}
              />
            </motion.div>
          </TabsContent>

          {/* Compatibility Tab */}
          <TabsContent value="compatibility" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
            >
              <CompatibilityTab toolSlug="numerology" />
            </motion.div>
          </TabsContent>

          {/* Remedies Tab */}
          <TabsContent value="remedies" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
            >
              <NumerologyRemedies 
                numerologyData={numerologyData} 
                birthDate={userProfile?.birthDate}
                onNavigateToTab={(tab) => setActiveTab(tab as any)}
              />
            </motion.div>
          </TabsContent>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
              className="space-y-6"
            >
            {/* Birth Information Section */}
            <DashboardSection
              title="Birth Information"
              icon={<User className="w-6 h-6" />}
              colorScheme="amber"
              defaultExpanded={true}
              storageKey="numerology-birth-info"
            >
              <DevotionistStyleCard
                icon={<User className="w-5 h-5" />}
                title="Your Birth Details"
                items={[
                  { text: `Date: ${userProfile?.birthDate || 'Not set'}`, icon: <Calendar className="w-4 h-4" /> },
                  { text: `Time: ${userProfile?.birthTime || 'Not set'}`, icon: <Clock className="w-4 h-4" /> },
                  { text: `Place: ${userProfile?.birthPlace || 'Not set'}`, icon: <MapPin className="w-4 h-4" /> }
                ]}
                colorScheme="amber"
              />
            </DashboardSection>

            {/* Core Numbers Summary Section */}
            <DashboardSection
              title="Core Numbers Summary"
              icon={<Hash className="w-6 h-6" />}
              badge="Primary Profile"
              colorScheme="blue"
              defaultExpanded={true}
              storageKey="numerology-core-numbers"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DevotionistStyleCard
                  icon={<Hash className="w-5 h-5" />}
                  title="Core Numbers"
                  summary={numerologyData && typeof numerologyData === 'object' 
                    ? `Your numerological blueprint reveals key patterns in your life journey.`
                    : 'No numerology data available'}
                  items={numerologyData && typeof numerologyData === 'object' ? [
                    { text: `Life Path: ${numerologyData.life_path_number || numerologyData.life_path || 'N/A'}`, highlight: true },
                    { text: `Expression: ${numerologyData.expression_number || 'N/A'}` },
                    { text: `Soul Urge: ${numerologyData.soul_number || numerologyData.soul_urge || 'N/A'}` },
                    { text: `Personality: ${numerologyData.personality_number || 'N/A'}` },
                    { text: `Destiny: ${numerologyData.destiny_number || 'N/A'}` }
                  ] : undefined}
                  colorScheme="blue"
                />

                {/* Lo Shu Grid - Enhanced Display */}
                <div className="space-y-4">
                  <LoShuGrid
                    birthDateISO={userProfile?.birthDate}
                    driverReduced={driverConductor.driver.reduced}
                    conductorReduced={driverConductor.conductor.reduced}
                  />
                  <DevotionistStyleCard
                    icon={<Calculator className="w-5 h-5" />}
                    title="Data Source"
                    items={[
                      { text: 'Source: Calculated', icon: <CheckCircle className="w-4 h-4" /> },
                      { text: 'System: Chaldean' },
                      { text: 'Status: Ready', icon: <CheckCircle className="w-4 h-4 text-green-600" /> }
                    ]}
                    colorScheme="cyan"
                  />
                </div>
              </div>
            </DashboardSection>

            {/* Karmic Indicators Section */}
            {karmicDebts.length > 0 && (
              <DashboardSection
                title="Karmic Indicators"
                icon={<AlertTriangle className="w-6 h-6" />}
                badge={`${karmicDebts.length} Detected`}
                colorScheme="orange"
                defaultExpanded={false}
                storageKey="numerology-karmic-debts"
              >
                <DevotionistStyleCard
                  icon={<AlertTriangle className="w-5 h-5" />}
                  title="Karmic Debts"
                  summary="These numbers indicate lessons to be learned in this lifetime."
                  items={karmicDebts.map((kd) => ({
                    text: `KD ${kd}: ${karmicDebtShortMeaning(kd)}`,
                    type: 'challenge' as const
                  }))}
                  colorScheme="orange"
                />
              </DashboardSection>
            )}
            </motion.div>
          </TabsContent>

          {/* Numbers Tab */}
          <TabsContent value="numbers" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
              className="space-y-6"
            >
            {/* Primary Numbers Section */}
            <DashboardSection
              title="Primary Numbers"
              icon={<Target className="w-6 h-6" />}
              badge="Core Identity"
              colorScheme="amber"
              defaultExpanded={true}
              storageKey="numerology-primary-numbers"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Life Path Number */}
                <DevotionistStyleCard
                  icon={<Target className="w-5 h-5" />}
                  title={`Life Path Number ${numerologyData?.life_path_number || numerologyData?.life_path || 'N/A'}`}
                  summary={(() => {
                    const lifePath = numerologyData?.life_path_number || numerologyData?.life_path
                    return lifePath ? (ChaldeanInterpretations[lifePath] || "Your life's purpose and the lessons you're here to learn") : "Your life's purpose and the lessons you're here to learn"
                  })()}
                  colorScheme="amber"
                />

                {/* Expression Number */}
                <DevotionistStyleCard
                  icon={<BookOpen className="w-5 h-5" />}
                  title={`Expression Number ${numerologyData?.expression_number || 'N/A'}`}
                  summary={(() => {
                    const expr = numerologyData?.expression_number
                    return expr ? (ChaldeanInterpretations[expr] || "Your natural talents and abilities revealed through your name") : "Your natural talents and abilities"
                  })()}
                  colorScheme="blue"
                />

                {/* Soul Urge Number */}
                <DevotionistStyleCard
                  icon={<Heart className="w-5 h-5" />}
                  title={`Soul Urge Number ${numerologyData?.soul_number || numerologyData?.soul_urge || 'N/A'}`}
                  summary={(() => {
                    const soul = numerologyData?.soul_number || numerologyData?.soul_urge
                    return soul ? (ChaldeanInterpretations[soul] || "Your inner desires and motivations that drive your choices") : "Your inner desires and motivations"
                  })()}
                  colorScheme="pink"
                />
              </div>
            </DashboardSection>

            {/* Secondary Numbers Section */}
            <DashboardSection
              title="Secondary Numbers"
              icon={<Eye className="w-6 h-6" />}
              colorScheme="blue"
              defaultExpanded={true}
              storageKey="numerology-secondary-numbers"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personality Number */}
                <DevotionistStyleCard
                  icon={<Eye className="w-5 h-5" />}
                  title={`Personality Number ${numerologyData?.personality_number || 'N/A'}`}
                  summary={(() => {
                    const personality = numerologyData?.personality_number
                    return personality ? (ChaldeanInterpretations[personality] || "How others perceive you based on your outer expression") : "How others perceive you"
                  })()}
                  colorScheme="purple"
                />

                {/* Destiny Number */}
                <DevotionistStyleCard
                  icon={<Sparkles className="w-5 h-5" />}
                  title={`Destiny Number ${numerologyData?.destiny_number || 'N/A'}`}
                  summary={(() => {
                    const destiny = numerologyData?.destiny_number
                    return destiny ? (ChaldeanInterpretations[destiny] || "Your ultimate life purpose and the path you're meant to walk") : "Your ultimate life purpose"
                  })()}
                  colorScheme="green"
                />

                {/* Birthday & Maturity Numbers */}
                {numerologyData?.birthday_number && (
                  <DevotionistStyleCard
                    icon={<Calendar className="w-5 h-5" />}
                    title={`Birthday Number ${numerologyData.birthday_number}`}
                    summary="Special gift or talent you bring to this life"
                    colorScheme="cyan"
                  />
                )}
                {numerologyData?.maturity_number && (
                  <DevotionistStyleCard
                    icon={<Sparkles className="w-5 h-5" />}
                    title={`Maturity Number ${numerologyData.maturity_number}`}
                    summary="The ultimate goal you're working toward in the second half of life"
                    colorScheme="amber"
                  />
                )}
              </div>
            </DashboardSection>

            {/* Cycles & Timing Section */}
            <DashboardSection
              title="Cycles & Timing"
              icon={<Sun className="w-6 h-6" />}
              colorScheme="purple"
              defaultExpanded={false}
              storageKey="numerology-cycles-timing"
            >
              <div className="space-y-6">
                {/* Personal Year */}
                <DevotionistStyleCard
                  icon={<Sun className="w-5 h-5" />}
                  title={`Personal Year ${personalYear ?? '—'}`}
                  summary="Focus theme for this year based on your birth date"
                  colorScheme="orange"
                />

                {/* Driver & Conductor */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DevotionistStyleCard
                    icon={<Moon className="w-5 h-5" />}
                    title={`Driver (Day): ${driverConductor.driver.master ? `${driverConductor.driver.master} (→ ${driverConductor.driver.reduced})` : driverConductor.driver.reduced ?? '—'}`}
                    summary="The Driver reflects your everyday operating style and immediate instincts. It shapes first moves, habits, and how you act under pressure."
                    colorScheme="cyan"
                  />
                  <DevotionistStyleCard
                    icon={<Moon className="w-5 h-5" />}
                    title={`Conductor (Full Date): ${driverConductor.conductor.master ? `${driverConductor.conductor.master} (→ ${driverConductor.conductor.reduced})` : driverConductor.conductor.reduced ?? '—'}`}
                    summary="The Conductor sets your life's broader rhythm and timing—how people, places, and events align around you across years."
                    colorScheme="cyan"
                  />
                </div>
              </div>
            </DashboardSection>

            {/* Lucky Elements Section */}
            <DashboardSection
              title="Lucky Elements"
              icon={<Star className="w-6 h-6" />}
              colorScheme="green"
              defaultExpanded={false}
              storageKey="numerology-lucky-elements"
            >
              <div className="space-y-6">
                {/* Lucky Essentials */}
                <LuckyEssentials
                  driver={luckyEssentials.driver}
                  conductor={luckyEssentials.conductor}
                  birthYear={luckyEssentials.birthYear}
                />

                {/* Zodiac */}
                {zodiacInfo && (
                  <DevotionistStyleCard
                    icon={<Sparkles className="w-5 h-5" />}
                    title={`Your Zodiac: ${zodiacInfo.sign}`}
                    summary={zodiacInfo.description}
                    items={zodiacInfo.traits.map(t => ({ text: t }))}
                    colorScheme="purple"
                  />
                )}

                {/* Favorables */}
                <DevotionistStyleCard
                  icon={<Star className="w-5 h-5" />}
                  title="Favorables"
                  summary="Favorable elements aligned with your numerology profile"
                  items={[
                    { text: `Days: ${favorables.days.join(', ')}` },
                    { text: `Alphabets: ${favorables.alphabets.slice(0, 5).join(', ')}` },
                    { text: `Direction: ${favorables.direction}` },
                    { text: `Ruling Deity: ${favorables.deity}` },
                    { text: `Mantra: ${favorables.mantra}`, highlight: true }
                  ]}
                  colorScheme="amber"
                />

                {/* Kua Number */}
                {kuaNumber && (
                  <DevotionistStyleCard
                    icon={<Compass className="w-5 h-5" />}
                    title={`Kua Number: ${kuaNumber.number}`}
                    summary={kuaNumber.attributes}
                    items={[
                      { text: `Success: ${kuaNumber.directions.success}` },
                      { text: `Health: ${kuaNumber.directions.health}` },
                      { text: `Relationships: ${kuaNumber.directions.relationships}` },
                      { text: `Wisdom: ${kuaNumber.directions.wisdom}` }
                    ]}
                    colorScheme="green"
                  />
                )}

                {/* Name Planes */}
                <NamePlanes
                  firstName={userProfile?.fullName || userProfile?.displayName || user?.displayName}
                  nameNumber={numerologyData?.expression_number || numerologyData?.destiny_number}
                />
              </div>
            </DashboardSection>
            </motion.div>
          </TabsContent>


          {/* Guidance Tab */}
          <TabsContent value="guidance" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
              className="space-y-6"
            >
            {/* Health Blueprint Section */}
            {driverConductor.driver.reduced === 6 && (
              <DashboardSection
                title="Health & Immunity Blueprint"
                icon={<Activity className="w-6 h-6" />}
                colorScheme="orange"
                defaultExpanded={false}
                storageKey="numerology-health-blueprint"
              >
                <DevotionistStyleCard
                  icon={<Activity className="w-5 h-5" />}
                  title="Health Considerations"
                  summary="See Remedies section for support."
                  items={[
                    'Excess mucus leading to lung issues',
                    'Nerve weakness from emotional sensitivity',
                    'Kidney and urinary problems',
                    'Susceptibility to colds',
                    'Constipation from preference for sweets and oily foods',
                  ].map(issue => ({ text: issue, type: 'challenge' as const }))}
                  colorScheme="orange"
                />
              </DashboardSection>
            )}

            {/* Career Pathways Section */}
            {(() => {
              const lp = numerologyData?.life_path_number || numerologyData?.life_path
              const dest = numerologyData?.destiny_number
              const hasCareerGuidance = lp === 6 && dest === 2
              if (!hasCareerGuidance) return null
              const careers = [
                { role: 'Counseling or Therapy', strengths: ['Emotional support', 'Guidance'], challenges: ['Handling conflict'] },
                { role: 'Human Resources', strengths: ['Harmonious work environment', 'Relationship building'], challenges: ['Setting boundaries'] },
                { role: 'Event Planning', strengths: ['Balanced experiences', 'Organization'], challenges: ['Managing stress'] },
                { role: 'Interior Design', strengths: ['Balance and harmony', 'Aesthetic sense'], challenges: ['Client expectations'] },
                { role: 'Social Work', strengths: ['Community contribution', 'Addressing imbalances'], challenges: ['Emotional boundaries'] },
              ]
              return (
                <DashboardSection
                  title="Career Pathways"
                  icon={<Briefcase className="w-6 h-6" />}
                  badge={`${careers.length} Recommended`}
                  colorScheme="blue"
                  defaultExpanded={false}
                  storageKey="numerology-career-pathways"
                >
                  <div className="space-y-4">
                    {careers.map((career, idx) => (
                      <DevotionistStyleCard
                        key={idx}
                        icon={<Briefcase className="w-5 h-5" />}
                        title={career.role}
                        items={[
                          ...career.strengths.map(s => ({ text: s, type: 'positive' as const })),
                          ...career.challenges.map(c => ({ text: c, type: 'challenge' as const }))
                        ]}
                        colorScheme="blue"
                      />
                    ))}
                  </div>
                </DashboardSection>
              )
            })()}

            {/* Monthly Forecast Section */}
            {monthlyForecast.length > 0 && (
              <DashboardSection
                title="Monthly Forecast"
                icon={<Calendar className="w-6 h-6" />}
                badge={`${monthlyForecast.length} Months`}
                colorScheme="amber"
                defaultExpanded={false}
                storageKey="numerology-monthly-forecast"
              >
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {monthlyForecast.map((month, idx) => (
                    <DevotionistStyleCard
                      key={idx}
                      icon={<Calendar className="w-5 h-5" />}
                      title={`${month.month} ${month.year}`}
                      subtitle={month.theme}
                      summary={month.advice}
                      items={month.expectations.slice(0, 4).map(exp => ({ text: exp }))}
                      variant="timeline"
                      colorScheme="amber"
                    />
                  ))}
                </div>
              </DashboardSection>
            )}

            {/* Challenge Cycles Section */}
            {challengeCycles.length > 0 && (
              <DashboardSection
                title="Challenge Cycles"
                icon={<TrendingUp className="w-6 h-6" />}
                badge={`${challengeCycles.length} Cycles`}
                colorScheme="cyan"
                defaultExpanded={false}
                storageKey="numerology-challenge-cycles"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {challengeCycles.map((cycle, idx) => (
                    <DevotionistStyleCard
                      key={idx}
                      icon={<TrendingUp className="w-5 h-5" />}
                      title={`Challenge ${cycle.number} (Ages ${cycle.range})`}
                      summary={cycle.attributes}
                      items={[{ text: `Focus: ${cycle.focus}`, highlight: true }]}
                      colorScheme="orange"
                    />
                  ))}
                </div>
              </DashboardSection>
            )}

            {/* Success Indicators Section */}
            <DashboardSection
              title="Success Indicators"
              icon={<ActivityIcon className="w-6 h-6" />}
              colorScheme="green"
              defaultExpanded={false}
              storageKey="numerology-success-indicators"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <DevotionistStyleCard
                  icon={<ActivityIcon className="w-5 h-5" />}
                  title={`Success Number ${summaryNumbers.success.number}`}
                  items={summaryNumbers.success.qualities.map(q => ({ text: q, type: 'positive' as const }))}
                  colorScheme="green"
                />
                <DevotionistStyleCard
                  icon={<ActivityIcon className="w-5 h-5" />}
                  title={`Connection Number ${summaryNumbers.connection.number}`}
                  summary={summaryNumbers.connection.focus}
                  colorScheme="blue"
                />
                <DevotionistStyleCard
                  icon={<ActivityIcon className="w-5 h-5" />}
                  title={`Maturity Number ${summaryNumbers.maturity.number}`}
                  subtitle={summaryNumbers.maturity.note}
                  items={summaryNumbers.maturity.traits.map(t => ({ text: t }))}
                  colorScheme="purple"
                />
              </div>
            </DashboardSection>

            {/* Remedies Section */}
            <DashboardSection
              title="Quick Remedies"
              icon={<Gem className="w-6 h-6" />}
              colorScheme="amber"
              defaultExpanded={false}
              storageKey="numerology-quick-remedies"
            >
              <DevotionistStyleCard
                icon={<Gem className="w-5 h-5" />}
                title="Remedies Guide"
                summary="Choose up to 3 remedies that resonate most with you. Focus and dedication enhance their effectiveness."
                items={[
                  { text: 'For Missing Numbers (Lo Shu Grid): See the Remedies tab for comprehensive remedies based on your missing numbers and numerology profile.' },
                  { text: 'Health Mantra: Mrityunjaya Beeja Mantra - Om Haum Jum Sah', highlight: true },
                  { text: 'Chant 108 times daily for healing and protection.' }
                ]}
                colorScheme="amber"
              />
            </DashboardSection>

            {/* Final Note */}
            <DevotionistStyleCard
              icon={<Sparkles className="w-5 h-5" />}
              title="Final Note"
              summary="This fortune report is a spark—let your actions be the flame. Integrate the recommendations that resonate, and use them as a guide to create a more fulfilling and prosperous life."
              colorScheme="cyan"
              variant="callout"
            />
            </motion.div>
          </TabsContent>

          {/* Ask the Seer Tab */}
          <TabsContent value="ask-the-seer" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
            >
            {user?.uid && numerologyData ? (
              <NumerologySeerChatInterface
                userId={user.uid}
                userProfile={userProfile}
                numerologyData={{
                  lifePathNumber: numerologyData.life_path_number || numerologyData.life_path,
                  expressionNumber: numerologyData.expression_number,
                  soulUrgeNumber: numerologyData.soul_number || numerologyData.soul_urge,
                  personalityNumber: numerologyData.personality_number,
                  destinyNumber: numerologyData.destiny_number,
                  birthdayNumber: numerologyData.birthday_number,
                  maturityNumber: numerologyData.maturity_number,
                  personalYearNumber: numerologyData.personal_year_number
                }}
                comprehensiveReport={comprehensiveReport}
              />
            ) : (
              <Card className="bg-slate-900/50 border-amber-500/50 backdrop-blur-sm rounded-xl" elevation={1}>
                <CardHeader>
                  <CardTitle className="m3-title-medium flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-amber-400" />
                    <span className="text-amber-200">AI Numerology Coach</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center py-8">
                  <div className="space-y-4">
                    <div className="w-16 h-16 backdrop-blur-sm bg-slate-900/50 border-amber-500/50 rounded-full flex items-center justify-center mx-auto">
                      <Brain className="w-8 h-8 text-amber-300" />
                    </div>
                    <h3 className="m3-title-large font-serif text-amber-300">Ask the Seer</h3>
                    <p className="m3-body-medium text-slate-300">
                      Please wait while we load your numerology data...
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
