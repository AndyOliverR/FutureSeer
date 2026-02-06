"use client"

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Star, 
  AlertTriangle,
  Home,
  Gem,
  User,
  Heart,
  Sparkles,
  Moon,
  Sun,
  History,
  Briefcase
} from 'lucide-react'
import { getIntelligentHellenisticAstrologyData, HellenisticAstrologyReading } from '@/lib/hellenisticAstrologyIntelligence'
import HellenisticChartWheel from '@/components/hellenistic/HellenisticChartWheel'
import { ToolIntroductionTab } from '@/components/ToolIntroductionTab'
import HellenisticSeerChatInterface from '@/components/hellenistic/HellenisticSeerChatInterface'
import { DashboardSection } from '@/components/western/DashboardSection'

// Constants
const HOUSE_MEANINGS: Record<number, string> = {
  1: 'Self, identity, appearance, personality, and how you present yourself to the world. The Ascendant house governs your physical body and life force.',
  2: 'Resources, values, possessions, money, and material security. Governs what you value and how you acquire wealth.',
  3: 'Communication, siblings, short journeys, learning, and immediate environment. Governs your thinking style and local connections.',
  4: 'Home, family, roots, emotional foundation, and private life. Governs your sense of security and ancestral heritage.',
  5: 'Creativity, children, romance, pleasure, and self-expression. Governs your capacity for joy and creative pursuits.',
  6: 'Health, work, service, daily routines, and small animals. Governs your approach to wellness and daily responsibilities.',
  7: 'Partnerships, marriage, relationships, and open enemies. Governs your approach to committed relationships and contracts.',
  8: 'Transformation, shared resources, death, regeneration, and the occult. Governs your ability to change and regenerate.',
  9: 'Higher learning, philosophy, long journeys, religion, and wisdom. Governs your quest for meaning and truth.',
  10: 'Career, reputation, public image, authority, and social status. Governs your professional path and public standing.',
  11: 'Friends, groups, hopes, wishes, and aspirations. Governs your social networks and future goals.',
  12: 'Subconscious, spirituality, hidden matters, sacrifice, and isolation. Governs your spiritual practices and areas of release.'
} as const;

const CHART_WHEEL_SIZE = 600;
const MATERIAL_3_EASING = [0.4, 0, 0.2, 1] as const;

export default function HellenisticAstrologyPage() {
  const { user, userProfile } = useAuth()
  const [reading, setReading] = useState<HellenisticAstrologyReading | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'introduction' | 'chart' | 'planets' | 'houses' | 'lots' | 'sect' | 'profections' | 'interpretations' | 'ask-the-seer'>('introduction')

  // Check if user has complete birth details
  const hasCompleteDetails = useMemo(() => 
    userProfile?.birthDate && userProfile?.birthTime && userProfile?.birthPlace,
    [userProfile?.birthDate, userProfile?.birthTime, userProfile?.birthPlace]
  )

  // Load Hellenistic analysis - memoized with useCallback
  const loadHellenisticAnalysis = useCallback(async () => {
    if (!hasCompleteDetails || !user?.uid) return
    
    try {
      setIsLoading(true)
      setError(null)
      
      console.log('FutureSeer: Loading Hellenistic Astrology analysis...')
      if (!userProfile) return
      const hellenisticData = await getIntelligentHellenisticAstrologyData(
        user.uid,
        userProfile.birthDate ?? '',
        userProfile.birthTime ?? '',
        userProfile.birthPlace ?? '',
        userProfile.birthLatitude || 0,
        userProfile.birthLongitude || 0
      )
      
      setReading(hellenisticData)
      console.log('FutureSeer: Hellenistic Astrology analysis loaded successfully')
    } catch (error: any) {
      console.error('FutureSeer: Failed to load Hellenistic Astrology analysis:', error)
      setError('Failed to load Hellenistic Astrology analysis. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [hasCompleteDetails, user?.uid, userProfile?.birthDate, userProfile?.birthTime, userProfile?.birthPlace, userProfile?.birthLatitude, userProfile?.birthLongitude])

  useEffect(() => {
    if (hasCompleteDetails) {
      loadHellenisticAnalysis()
    }
  }, [hasCompleteDetails, loadHellenisticAnalysis])

  if (!hasCompleteDetails) {
    return (
      <div className="relative min-h-screen starfield-ultra-sharp">
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md bg-slate-900/50 border-amber-500/50 backdrop-blur-sm rounded-xl">
            <CardContent className="p-6 text-center">
              <Star className="w-12 h-12 text-amber-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-amber-200 mb-2">Profile Incomplete</h2>
              <p className="text-slate-300 mb-4">Complete your profile to unlock your Hellenistic astrology chart</p>
              <Button 
                onClick={() => window.location.href = '/profile-setup'}
                className="bg-amber-500 hover:bg-amber-600 text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
                aria-label="Navigate to profile setup page"
              >
                Complete Profile
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="starfield-ultra-sharp min-h-screen p-4 pt-4 overflow-hidden">
      {/* Softening overlay to integrate content with starfield */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/10 via-slate-900/30 to-slate-900/40 pointer-events-none"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-serif font-semibold mb-6">
            <span className="text-yellow-400">🏛️</span>{' '}
            <span className="bg-gradient-to-b from-amber-200 via-yellow-400 to-amber-600 bg-clip-text text-transparent">Hellenistic Astrology</span>
          </h1>
          <p className="text-slate-200 leading-relaxed text-xl font-light">
            Ancient Greco-Roman astrology system (1st century BCE - 7th century CE)
          </p>
        </div>

        {/* Tabs */}
        <Tabs 
          value={activeTab} 
          onValueChange={(value) => setActiveTab(value as any)} 
          className="w-full"
          aria-label="Hellenistic Astrology navigation tabs"
        >
          <TabsList 
            className="grid w-full grid-cols-9 bg-slate-900/50 backdrop-blur-md border-amber-500/50 rounded-2xl p-1 shadow-lg"
            role="tablist"
            aria-label="Hellenistic Astrology sections"
          >
            <TabsTrigger 
              value="introduction" 
              className="data-[state=active]:bg-amber-500 data-[state=active]:text-white rounded-xl px-2 py-1.5 text-[11px] text-slate-300 transition-all duration-300 ease-in-out data-[state=active]:shadow-md data-[state=active]:scale-105"
              aria-label="Introduction to Hellenistic Astrology"
            >
              Introduction
            </TabsTrigger>
            <TabsTrigger 
              value="chart" 
              className="data-[state=active]:bg-amber-500 data-[state=active]:text-white rounded-xl px-2 py-1.5 text-[11px] text-slate-300 transition-all duration-300 ease-in-out data-[state=active]:shadow-md data-[state=active]:scale-105"
            >
              Chart
            </TabsTrigger>
            <TabsTrigger 
              value="planets" 
              className="data-[state=active]:bg-amber-500 data-[state=active]:text-white rounded-xl px-2 py-1.5 text-[11px] text-slate-300 transition-all duration-300 ease-in-out data-[state=active]:shadow-md data-[state=active]:scale-105"
            >
              Planets
            </TabsTrigger>
            <TabsTrigger 
              value="houses" 
              className="data-[state=active]:bg-amber-500 data-[state=active]:text-white rounded-xl px-2 py-1.5 text-[11px] text-slate-300 transition-all duration-300 ease-in-out data-[state=active]:shadow-md data-[state=active]:scale-105"
            >
              Houses
            </TabsTrigger>
            <TabsTrigger 
              value="lots" 
              className="data-[state=active]:bg-amber-500 data-[state=active]:text-white rounded-xl px-2 py-1.5 text-[11px] text-slate-300 transition-all duration-300 ease-in-out data-[state=active]:shadow-md data-[state=active]:scale-105"
            >
              Lots
            </TabsTrigger>
            <TabsTrigger 
              value="sect" 
              className="data-[state=active]:bg-amber-500 data-[state=active]:text-white rounded-xl px-2 py-1.5 text-[11px] text-slate-300 transition-all duration-300 ease-in-out data-[state=active]:shadow-md data-[state=active]:scale-105"
            >
              Sect
            </TabsTrigger>
            <TabsTrigger 
              value="profections" 
              className="data-[state=active]:bg-amber-500 data-[state=active]:text-white rounded-xl px-2 py-1.5 text-[11px] text-slate-300 transition-all duration-300 ease-in-out data-[state=active]:shadow-md data-[state=active]:scale-105"
            >
              Profections
            </TabsTrigger>
            <TabsTrigger 
              value="interpretations" 
              className="data-[state=active]:bg-amber-500 data-[state=active]:text-white rounded-xl px-2 py-1.5 text-[11px] text-slate-300 transition-all duration-300 ease-in-out data-[state=active]:shadow-md data-[state=active]:scale-105"
            >
              Interpretations
            </TabsTrigger>
            <TabsTrigger 
              value="ask-the-seer" 
              className="data-[state=active]:bg-amber-500 data-[state=active]:text-white rounded-xl px-2 py-1.5 text-[11px] text-slate-300 transition-all duration-300 ease-in-out data-[state=active]:shadow-md data-[state=active]:scale-105"
            >
              Ask the Seer
            </TabsTrigger>
          </TabsList>

          {/* Introduction Tab */}
          <AnimatePresence mode="wait">
            <TabsContent value="introduction" className="space-y-6 mt-6">
              <motion.div
                key="introduction"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: MATERIAL_3_EASING }}
              >
                <ToolIntroductionTab toolSlug="hellenistic-astrology" />
              </motion.div>
            </TabsContent>
          </AnimatePresence>

          {/* Chart Tab */}
          <AnimatePresence mode="wait">
            <TabsContent value="chart" className="space-y-6 mt-6">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-3xl shadow-lg">
                    <CardContent className="p-8 text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
                      <p className="text-amber-900">Calculating your Hellenistic chart...</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : error ? (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 rounded-3xl shadow-lg">
                    <CardContent className="p-8 text-center">
                      <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
                      <p className="text-red-700 mb-4">{error}</p>
                      <Button 
                        onClick={loadHellenisticAnalysis} 
                        className="bg-amber-500 hover:bg-amber-600 text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
                      >
                        Try Again
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : reading ? (
                <motion.div
                  key="chart"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, ease: MATERIAL_3_EASING }}
                >
                  <DashboardSection 
                    title="Whole Sign House Chart" 
                    icon={<Star className="w-6 h-6" />}
                    colorScheme="amber"
                    defaultExpanded={true}
                    storageKey="chart"
                  >
                    <div className="space-y-6">
                      <div className="flex justify-center">
                      <HellenisticChartWheel
                        planets={reading.planets}
                        houses={reading.houses}
                        lots={[reading.lots.partOfFortune, reading.lots.partOfSpirit]}
                        ascendant={reading.ascendant}
                        width={CHART_WHEEL_SIZE}
                        height={CHART_WHEEL_SIZE}
                      />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1, duration: 0.3 }}
                        >
                          <Card className="bg-gradient-to-br from-amber-100 to-yellow-100 border-2 border-amber-300 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300">
                            <CardContent className="p-4">
                              <p className="text-amber-900 font-semibold mb-2">Ascendant</p>
                              <p className="text-slate-700 text-lg font-medium">
                                {reading.ascendant.sign} {reading.ascendant.degree.toFixed(1)}°
                              </p>
                            </CardContent>
                          </Card>
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2, duration: 0.3 }}
                        >
                          <Card className="bg-gradient-to-br from-amber-100 to-yellow-100 border-2 border-amber-300 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300">
                            <CardContent className="p-4">
                              <p className="text-amber-900 font-semibold mb-2">Chart Type</p>
                              <p className="text-slate-700 text-lg font-medium capitalize">{reading.sect.type} Chart</p>
                            </CardContent>
                          </Card>
                        </motion.div>
                      </div>
                    </div>
                  </DashboardSection>
                </motion.div>
              ) : null}
            </TabsContent>
          </AnimatePresence>

          {/* Planets Tab */}
          <AnimatePresence mode="wait">
            <TabsContent value="planets" className="space-y-6 mt-6">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-3xl shadow-lg">
                    <CardContent className="p-8 text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
                      <p className="text-amber-900">Loading planetary data...</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : reading ? (
                <motion.div
                  key="planets"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, ease: MATERIAL_3_EASING }}
                >
                  <DashboardSection 
                    title="Planetary Positions & Dignities" 
                    icon={<Star className="w-6 h-6" />}
                    badge={`${reading.planets.length} Planets`}
                    colorScheme="amber"
                    defaultExpanded={true}
                    storageKey="planets"
                  >
                    <div className="space-y-4">
                      {reading.planets.map(planet => {
                        const dignity = reading.dignities[planet.name];
                        return (
                          <motion.div
                            key={planet.name}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, ease: MATERIAL_3_EASING }}
                          >
                            <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <h3 className="text-amber-900 font-semibold text-lg">{planet.name}</h3>
                                  <Badge className={dignity.score >= 3 ? 'bg-green-600' : dignity.score >= 1 ? 'bg-amber-500' : 'bg-red-600'}>
                                    Dignity: {dignity.score.toFixed(1)}
                                  </Badge>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                                  <div className="bg-white/60 p-2 rounded-lg">
                                    <p className="text-slate-600 text-xs">Sign</p>
                                    <p className="text-slate-800 font-medium">{planet.sign} {planet.degree.toFixed(1)}°</p>
                                  </div>
                                  <div className="bg-white/60 p-2 rounded-lg">
                                    <p className="text-slate-600 text-xs">House</p>
                                    <p className="text-slate-800 font-medium">House {planet.house}</p>
                                  </div>
                                  <div className="bg-white/60 p-2 rounded-lg">
                                    <p className="text-slate-600 text-xs">Domicile</p>
                                    <p className={dignity.domicile ? 'text-green-700 font-bold' : 'text-slate-500'}>
                                      {dignity.domicile ? '✓' : '✗'}
                                    </p>
                                  </div>
                                  <div className="bg-white/60 p-2 rounded-lg">
                                    <p className="text-slate-600 text-xs">Exaltation</p>
                                    <p className={dignity.exaltation ? 'text-green-700 font-bold' : 'text-slate-500'}>
                                      {dignity.exaltation ? '✓' : '✗'}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {dignity.triplicity && <Badge variant="outline" className="text-xs text-amber-700 border-amber-400 bg-amber-50">Triplicity</Badge>}
                                  {dignity.term && <Badge variant="outline" className="text-xs text-amber-700 border-amber-400 bg-amber-50">Term</Badge>}
                                  {dignity.face && <Badge variant="outline" className="text-xs text-amber-700 border-amber-400 bg-amber-50">Face</Badge>}
                                  {dignity.detriment && <Badge variant="outline" className="text-xs text-red-700 border-red-400 bg-red-50">Detriment</Badge>}
                                  {dignity.fall && <Badge variant="outline" className="text-xs text-red-700 border-red-400 bg-red-50">Fall</Badge>}
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        );
                      })}
                    </div>
                  </DashboardSection>
                </motion.div>
              ) : null}
            </TabsContent>
          </AnimatePresence>

          {/* Houses Tab */}
          <AnimatePresence mode="wait">
            <TabsContent value="houses" className="space-y-6 mt-6">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-3xl shadow-lg">
                    <CardContent className="p-8 text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
                      <p className="text-amber-900">Loading house data...</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : reading ? (
                <motion.div
                  key="houses"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, ease: MATERIAL_3_EASING }}
                >
                  <DashboardSection 
                    title="Whole Sign Houses" 
                    icon={<Home className="w-6 h-6" />}
                    badge="12 Houses"
                    colorScheme="amber"
                    defaultExpanded={true}
                    storageKey="houses"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {reading.houses.map((house, index) => (
                        <motion.div
                          key={house.number}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05, duration: 0.2, ease: MATERIAL_3_EASING }}
                        >
                          <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="text-amber-900 font-semibold">House {house.number}</h3>
                                <Badge variant="outline" className="text-amber-700 border-amber-400 bg-amber-50">{house.sign}</Badge>
                              </div>
                              <p className="text-slate-700 text-sm mb-3 leading-relaxed">
                                {house.interpretation || HOUSE_MEANINGS[house.number]}
                              </p>
                              {house.planets.length > 0 ? (
                                <div className="mt-2">
                                  <p className="text-slate-600 text-sm mb-1">Contains:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {house.planets.map(planet => (
                                      <Badge key={planet} className="bg-amber-600 text-white text-xs">
                                        {planet}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <p className="text-slate-500 text-sm mt-2 italic">Empty</p>
                              )}
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </DashboardSection>
                </motion.div>
              ) : null}
            </TabsContent>
          </AnimatePresence>

          {/* Lots Tab */}
          <AnimatePresence mode="wait">
            <TabsContent value="lots" className="space-y-6 mt-6">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-3xl shadow-lg">
                    <CardContent className="p-8 text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
                      <p className="text-amber-900">Calculating Lots...</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : reading ? (
                <motion.div
                  key="lots"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, ease: MATERIAL_3_EASING }}
                >
                  <DashboardSection 
                    title="Lots (Parts)" 
                    icon={<Gem className="w-6 h-6" />}
                    badge="2 Lots"
                    colorScheme="amber"
                    defaultExpanded={true}
                    storageKey="lots"
                  >
                    <div className="space-y-4">
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1, duration: 0.3, ease: MATERIAL_3_EASING }}
                      >
                        <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300">
                          <CardContent className="p-6">
                            <h3 className="text-amber-900 font-semibold text-lg mb-4">
                              {reading.lots.partOfFortune.name}
                            </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                        <div className="bg-white/60 p-3 rounded-lg">
                          <p className="text-slate-600 text-xs mb-1">Sign</p>
                          <p className="text-slate-800 font-medium">{reading.lots.partOfFortune.sign}</p>
                        </div>
                        <div className="bg-white/60 p-3 rounded-lg">
                          <p className="text-slate-600 text-xs mb-1">Degree</p>
                          <p className="text-slate-800 font-medium">{reading.lots.partOfFortune.degree.toFixed(1)}°</p>
                        </div>
                        <div className="bg-white/60 p-3 rounded-lg">
                          <p className="text-slate-600 text-xs mb-1">House</p>
                          <p className="text-slate-800 font-medium">House {reading.lots.partOfFortune.house}</p>
                        </div>
                        <div className="bg-white/60 p-3 rounded-lg">
                          <p className="text-slate-600 text-xs mb-1">Lord</p>
                          <p className="text-slate-800 font-medium">
                            {reading.houses.find(h => h.number === reading.lots.partOfFortune.house)?.sign ? 
                              (Object.entries({
                                'Aries': 'Mars', 'Taurus': 'Venus', 'Gemini': 'Mercury', 'Cancer': 'Moon',
                                'Leo': 'Sun', 'Virgo': 'Mercury', 'Libra': 'Venus', 'Scorpio': 'Mars',
                                'Sagittarius': 'Jupiter', 'Capricorn': 'Saturn', 'Aquarius': 'Saturn', 'Pisces': 'Jupiter'
                              }).find(([sign]) => sign === reading.houses.find(h => h.number === reading.lots.partOfFortune.house)?.sign)?.[1] || 'Unknown') : 'Unknown'}
                          </p>
                        </div>
                      </div>
                            <p className="text-slate-700 text-sm leading-relaxed">{reading.lots.partOfFortune.interpretation}</p>
                          </CardContent>
                        </Card>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2, duration: 0.3, ease: MATERIAL_3_EASING }}
                      >
                        <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300">
                          <CardContent className="p-6">
                            <h3 className="text-amber-900 font-semibold text-lg mb-4">
                              {reading.lots.partOfSpirit.name}
                            </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                        <div className="bg-white/60 p-3 rounded-lg">
                          <p className="text-slate-600 text-xs mb-1">Sign</p>
                          <p className="text-slate-800 font-medium">{reading.lots.partOfSpirit.sign}</p>
                        </div>
                        <div className="bg-white/60 p-3 rounded-lg">
                          <p className="text-slate-600 text-xs mb-1">Degree</p>
                          <p className="text-slate-800 font-medium">{reading.lots.partOfSpirit.degree.toFixed(1)}°</p>
                        </div>
                        <div className="bg-white/60 p-3 rounded-lg">
                          <p className="text-slate-600 text-xs mb-1">House</p>
                          <p className="text-slate-800 font-medium">House {reading.lots.partOfSpirit.house}</p>
                        </div>
                        <div className="bg-white/60 p-3 rounded-lg">
                          <p className="text-slate-600 text-xs mb-1">Lord</p>
                          <p className="text-slate-800 font-medium">
                            {reading.houses.find(h => h.number === reading.lots.partOfSpirit.house)?.sign ? 
                              (Object.entries({
                                'Aries': 'Mars', 'Taurus': 'Venus', 'Gemini': 'Mercury', 'Cancer': 'Moon',
                                'Leo': 'Sun', 'Virgo': 'Mercury', 'Libra': 'Venus', 'Scorpio': 'Mars',
                                'Sagittarius': 'Jupiter', 'Capricorn': 'Saturn', 'Aquarius': 'Saturn', 'Pisces': 'Jupiter'
                              }).find(([sign]) => sign === reading.houses.find(h => h.number === reading.lots.partOfSpirit.house)?.sign)?.[1] || 'Unknown') : 'Unknown'}
                          </p>
                        </div>
                      </div>
                            <p className="text-slate-700 text-sm leading-relaxed">{reading.lots.partOfSpirit.interpretation}</p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </div>
                  </DashboardSection>
                </motion.div>
              ) : null}
            </TabsContent>
          </AnimatePresence>

          {/* Sect Tab */}
          <AnimatePresence mode="wait">
            <TabsContent value="sect" className="space-y-6 mt-6">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-3xl shadow-lg">
                    <CardContent className="p-8 text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
                      <p className="text-amber-900">Determining sect...</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : reading ? (
                <motion.div
                  key="sect"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, ease: MATERIAL_3_EASING }}
                >
                  <DashboardSection 
                    title="Planetary Sect" 
                    icon={reading.sect.type === 'day' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
                    badge={reading.sect.type === 'day' ? 'Day Chart' : 'Night Chart'}
                    colorScheme="amber"
                    defaultExpanded={true}
                    storageKey="sect"
                  >
                    <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4 mb-6">
                          <Badge className={reading.sect.type === 'day' ? 'bg-amber-500' : 'bg-amber-600'} variant="default">
                            {reading.sect.type.toUpperCase()} Chart
                          </Badge>
                          <p className="text-slate-700">
                            Sect Light: <span className="text-amber-900 font-semibold">{reading.sect.sectLeader}</span>
                          </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="bg-gradient-to-br from-amber-100 to-yellow-100 border border-amber-300 p-4 rounded-xl">
                            <p className="text-slate-600 text-sm mb-2">Sect Benefic</p>
                            <p className="text-amber-900 font-semibold text-lg">{reading.sect.benefic}</p>
                            <p className="text-slate-600 text-xs mt-1">Works more beneficially in this chart</p>
                          </div>
                          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-300 p-4 rounded-xl">
                            <p className="text-slate-600 text-sm mb-2">Sect Malefic</p>
                            <p className="text-amber-800 font-semibold text-lg">{reading.sect.malefic}</p>
                            <p className="text-slate-600 text-xs mt-1">More challenging in this chart</p>
                          </div>
                        </div>
                        <div className="mt-4 p-4 bg-white/60 rounded-lg border border-amber-200">
                          <p className="text-slate-700 text-sm leading-relaxed">
                            In a {reading.sect.type} chart, the {reading.sect.sectLeader} is the primary light and guide. 
                            The {reading.sect.benefic} works more beneficially, while the {reading.sect.malefic} may present 
                            more challenges. Understanding your sect helps you work with your chart's natural energies.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </DashboardSection>
                </motion.div>
              ) : null}
            </TabsContent>
          </AnimatePresence>

          {/* Profections Tab */}
          <AnimatePresence mode="wait">
            <TabsContent value="profections" className="space-y-6 mt-6">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-3xl shadow-lg">
                    <CardContent className="p-8 text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
                      <p className="text-amber-900">Calculating profections...</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : reading ? (
                <motion.div
                  key="profections"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, ease: MATERIAL_3_EASING }}
                >
                  <DashboardSection 
                    title="Annual Profections" 
                    icon={<History className="w-6 h-6" />}
                    badge={`Year ${reading.profections.currentYear}`}
                    colorScheme="amber"
                    defaultExpanded={true}
                    storageKey="profections"
                  >
                    <div className="space-y-4">
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.3, ease: MATERIAL_3_EASING }}
                      >
                        <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300">
                          <CardContent className="p-6">
                            <div className="flex items-center gap-4 mb-4">
                              <Badge className="bg-amber-600 text-white">Year {reading.profections.currentYear}</Badge>
                              <p className="text-amber-900 font-semibold">
                                {reading.profections.currentSign} - Ruled by {reading.profections.lord}
                              </p>
                            </div>
                            <div className="mb-4">
                              <p className="text-slate-600 text-sm mb-2">Activated Houses</p>
                              <div className="flex flex-wrap gap-2">
                                {reading.profections.activatedHouses.map(house => (
                                  <Badge key={house} variant="outline" className="text-amber-700 border-amber-400 bg-amber-50">
                                    House {house}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <p className="text-slate-700 text-sm leading-relaxed">{reading.profections.timing}</p>
                          </CardContent>
                        </Card>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.3, ease: MATERIAL_3_EASING }}
                      >
                        <Card className="bg-white/60 border border-amber-300 rounded-2xl shadow-sm">
                          <CardContent className="p-4">
                            <p className="text-slate-600 text-sm leading-relaxed">
                              Profections are an ancient timing technique where each year of life activates a different sign, 
                              starting from the Ascendant. The sign's ruler becomes the time-lord for that year, activating 
                              themes related to the houses it rules.
                            </p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </div>
                  </DashboardSection>
                </motion.div>
              ) : null}
            </TabsContent>
          </AnimatePresence>

          {/* Interpretations Tab */}
          <AnimatePresence mode="wait">
            <TabsContent value="interpretations" className="space-y-6 mt-6">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-3xl shadow-lg">
                    <CardContent className="p-8 text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
                      <p className="text-amber-900">Generating interpretations...</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : reading ? (
                <motion.div
                  key="interpretations"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, ease: MATERIAL_3_EASING }}
                  className="space-y-6"
                >
                  {/* Personality */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.3, ease: MATERIAL_3_EASING }}
                  >
                    <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-3xl shadow-md hover:shadow-lg transition-shadow duration-300">
                      <CardHeader className="bg-gradient-to-r from-amber-100 to-yellow-100">
                        <CardTitle className="text-amber-900 flex items-center gap-2 text-xl">
                          <User className="w-6 h-6" />
                          Personality
                        </CardTitle>
                      </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <p className="text-slate-700 leading-relaxed">{reading.interpretations.personality.overview}</p>
                      <div className="bg-white/60 p-4 rounded-xl">
                        <p className="text-amber-900 font-semibold mb-2">Strengths</p>
                        <ul className="list-disc list-inside space-y-1 text-slate-700">
                          {reading.interpretations.personality.strengths.map((strength, i) => (
                            <li key={i}>{strength}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-white/60 p-4 rounded-xl">
                        <p className="text-amber-900 font-semibold mb-2">Challenges</p>
                        <ul className="list-disc list-inside space-y-1 text-slate-700">
                          {reading.interpretations.personality.challenges.map((challenge, i) => (
                            <li key={i}>{challenge}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-white/60 p-4 rounded-xl">
                        <p className="text-amber-900 font-semibold mb-2">Life Purpose</p>
                        <p className="text-slate-700 leading-relaxed">{reading.interpretations.personality.lifePurpose}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Career */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.3, ease: MATERIAL_3_EASING }}
                >
                  <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-3xl shadow-md hover:shadow-lg transition-shadow duration-300">
                    <CardHeader className="bg-gradient-to-r from-amber-100 to-yellow-100">
                      <CardTitle className="text-amber-900 flex items-center gap-2 text-xl">
                        <Briefcase className="w-6 h-6" />
                        Career
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <div>
                        <p className="text-amber-900 font-semibold mb-3">Suitable Professions</p>
                        <div className="flex flex-wrap gap-2">
                          {reading.interpretations.career.suitableProfessions.map((prof, i) => (
                            <Badge key={i} className="bg-amber-600 text-white">
                              {prof}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="bg-white/60 p-4 rounded-xl">
                        <p className="text-slate-700 leading-relaxed">{reading.interpretations.career.careerTiming}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Relationships */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.3, ease: MATERIAL_3_EASING }}
                >
                  <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-3xl shadow-md hover:shadow-lg transition-shadow duration-300">
                    <CardHeader className="bg-gradient-to-r from-amber-100 to-yellow-100">
                      <CardTitle className="text-amber-900 flex items-center gap-2 text-xl">
                        <Heart className="w-6 h-6" />
                        Relationships
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <div className="bg-white/60 p-4 rounded-xl">
                        <p className="text-slate-700 leading-relaxed mb-3">{reading.interpretations.relationships.compatibility}</p>
                        <p className="text-slate-700 leading-relaxed">{reading.interpretations.relationships.relationshipAdvice}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Remedies */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.3, ease: MATERIAL_3_EASING }}
                >
                  <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-3xl shadow-md hover:shadow-lg transition-shadow duration-300">
                    <CardHeader className="bg-gradient-to-r from-amber-100 to-yellow-100">
                      <CardTitle className="text-amber-900 flex items-center gap-2 text-xl">
                        <Sparkles className="w-6 h-6" />
                        Remedies & Guidance
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <div>
                        <p className="text-amber-900 font-semibold mb-3">Planetary Remedies</p>
                        {reading.remedies.planetary.map((remedy, i) => (
                          <div key={i} className="bg-white/60 p-4 rounded-xl mb-3">
                            <p className="text-amber-900 font-semibold">{remedy.planet}</p>
                            <p className="text-slate-700 text-sm mt-1">{remedy.remedy}</p>
                            <p className="text-slate-600 text-xs mt-2">Timing: {remedy.timing}</p>
                          </div>
                        ))}
                      </div>
                      <div>
                        <p className="text-amber-900 font-semibold mb-3">General Guidance</p>
                        <ul className="list-disc list-inside space-y-2 text-slate-700">
                          {reading.remedies.general.map((guidance, i) => (
                            <li key={i}>{guidance}</li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            ) : null}
          </TabsContent>
          </AnimatePresence>

          {/* Ask the Seer Tab */}
          <AnimatePresence mode="wait">
            <TabsContent value="ask-the-seer" className="space-y-6 mt-6">
              <motion.div
                key="ask-seer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: MATERIAL_3_EASING }}
              >
                <Card className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 border-2 border-amber-300 shadow-lg rounded-3xl h-[800px] overflow-hidden">
                  <div className="h-full bg-gradient-to-b from-transparent to-white/30">
                    <HellenisticSeerChatInterface 
                      userId={user?.uid || ''}
                      userProfile={userProfile}
                      hellenisticReading={reading || undefined}
                    />
                  </div>
                </Card>
              </motion.div>
            </TabsContent>
          </AnimatePresence>
        </Tabs>
      </div>
    </div>
  )
}

