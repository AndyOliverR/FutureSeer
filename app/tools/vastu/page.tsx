"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { VastuCoachInterface } from "@/components/VastuCoachInterface"
import { VastuMainEntranceGuide } from "@/components/VastuMainEntranceGuide"
import { VastuConstructionPlanner } from "@/components/VastuConstructionPlanner"
import { VastuDocumentedRemedies } from "@/components/VastuDocumentedRemedies"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useVastu } from "@/hooks/use-vastu"
import { calculatePersonalizedVastuDirections } from "@/lib/vastuPersonalization"
import CompassHelper from "@/components/fengshui/CompassHelper"
import type { VastuLayoutInput } from "@/lib/vastuSeerState"
import { VASTU_16_ZONES, VASTU_32_PADA_IDS } from "@/lib/vastuDirections"
import { 
  Home, 
  Compass, 
  Layout, 
  Hammer, 
  Sparkles, 
  User,
  Shield,
  Zap,
  Clock,
  DollarSign,
  Info,
  Users,
} from 'lucide-react'
import { getVastuTiming, getNextAuspiciousDates } from '@/lib/vastuTimingService'
import { calculateAayaAayushya, type PropertyAayaData } from '@/lib/vastuAayaCalculations'
import { TeaserView } from '@/components/report-viral/TeaserView'
import { ShareCard } from '@/components/report-viral/ShareCard'
import { ViralLockOverlay } from '@/components/report-viral/LockedReportView'
import { buildToolTeaser } from '@/lib/report-viral/buildToolTeaser'
import { toolPathForSlug } from '@/lib/report-viral/toolSlugToPath'
import { cn } from '@/lib/utils'
import { useToolReportUnlock } from '@/hooks/useToolReportUnlock'
import { useViralReportBypass } from '@/hooks/useViralReportBypass'

// Helper function to get color styles based on color name
function getColorStyles(colorName: string): string {
  const color = colorName.toLowerCase().trim();
  
  // Map color names to Tailwind classes
  const colorMap: Record<string, string> = {
    'blue': 'bg-blue-500 text-white border-blue-600',
    'black': 'bg-black text-white border-gray-800',
    'navy': 'bg-blue-900 text-white border-blue-950',
    'white': 'bg-white text-black border-gray-300',
    'red': 'bg-red-500 text-white border-red-600',
    'orange': 'bg-orange-500 text-white border-orange-600',
    'yellow': 'bg-yellow-400 text-black border-yellow-500',
    'green': 'bg-green-500 text-white border-green-600',
    'pink': 'bg-pink-500 text-white border-pink-600',
    'purple': 'bg-purple-500 text-white border-purple-600',
    'brown': 'bg-amber-700 text-white border-amber-800',
    'beige': 'bg-amber-100 text-black border-amber-200',
    'cream': 'bg-amber-50 text-black border-amber-100',
    'silver': 'bg-gray-400 text-black border-gray-500',
    'gold': 'bg-yellow-500 text-black border-yellow-600',
    'coral': 'bg-orange-300 text-black border-orange-400',
    'rose': 'bg-pink-300 text-black border-pink-400',
    'light blue': 'bg-blue-300 text-black border-blue-400',
    'light green': 'bg-green-300 text-black border-green-400',
  };
  
  // Check for exact match first
  if (colorMap[color]) {
    return colorMap[color];
  }
  
  // Check for partial matches (e.g., "light blue" contains "blue")
  for (const [key, value] of Object.entries(colorMap)) {
    if (color.includes(key) || key.includes(color)) {
      return value;
    }
  }
  
  // Default fallback for unknown colors (devotionist light surfaces)
  return 'bg-amber-100 text-amber-900 border-amber-300';
}

// Room Card Component with expandable details (devotionist-style)
function RoomCard({ room }: { room: any }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className="bg-amber-50/80 border-2 border-amber-300 rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-amber-900">{room.name}</h4>
        <span className={`text-xs px-2 py-1 rounded-full ${
          room.status === 'optimal' ? 'bg-green-100 text-green-800 border border-green-300' :
          room.status === 'good' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
          room.status === 'warning' ? 'bg-amber-100 text-amber-700 border border-amber-400' :
          'bg-red-100 text-red-800 border border-red-300'
        }`}>
          {room.status}
        </span>
      </div>
      {room.description && (
        <p className="text-sm text-slate-700 mb-2">{room.description}</p>
      )}
      <p className="text-sm text-slate-700 mb-1">Recommended: <span className="text-amber-800 font-medium">{room.idealDirection}</span></p>
      {room.currentDirection && (
        <p className="text-sm text-slate-700 mb-2">Current: <span className="text-amber-800 font-medium">{room.currentDirection}</span></p>
      )}
      <div className="mb-3">
        <div className="text-xs text-slate-600">Energy Score: <span className="text-amber-800 font-semibold">{room.energyScore}%</span></div>
      </div>
      
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left text-sm text-amber-700 hover:text-amber-900 mb-2 flex items-center gap-2 font-medium"
      >
        {isExpanded ? '▼' : '▶'} {isExpanded ? 'Hide' : 'Show'} Details
      </motion.button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3 mt-3 pt-3 border-t border-amber-200"
          >
            {room.furniturePlacement && room.furniturePlacement.length > 0 && (
              <div>
                <h5 className="text-sm font-semibold text-amber-900 mb-1">Furniture Placement:</h5>
                <ul className="text-xs text-slate-700 space-y-1">
                  {room.furniturePlacement.map((item: string, i: number) => (
                    <li key={i}>• {item}</li>
                  ))}
                </ul>
              </div>
            )}
            {room.colors && room.colors.length > 0 && (
              <div>
                <h5 className="text-sm font-semibold text-amber-900 mb-1">Recommended Colors:</h5>
                <div className="flex flex-wrap gap-2">
                  {room.colors.map((color: string, i: number) => (
                    <span key={i} className={`text-xs px-2 py-1 border rounded-full ${getColorStyles(color)}`}>
                      {color}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {room.appliances && room.appliances.length > 0 && (
              <div>
                <h5 className="text-sm font-semibold text-amber-900 mb-1">Appliance Guidelines:</h5>
                <ul className="text-xs text-slate-700 space-y-1">
                  {room.appliances.map((item: string, i: number) => (
                    <li key={i}>• {item}</li>
                  ))}
                </ul>
              </div>
            )}
            {room.recommendations && room.recommendations.length > 0 && (
              <div>
                <h5 className="text-sm font-semibold text-amber-900 mb-1">Recommendations:</h5>
                <ul className="text-xs text-slate-700 space-y-1">
                  {room.recommendations.map((rec: string, i: number) => (
                    <li key={i}>• {rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const DIRECTION_OPTIONS_16 = ['Unknown', ...VASTU_16_ZONES] as const
const MAIN_DOOR_OPTIONS = ['Unknown', ...VASTU_32_PADA_IDS] as const
const CENTER_OPTIONS = ['Open', 'Blocked', 'Partially blocked', 'Unknown'] as const

export default function VastuPage() {
  const { analysis, isLoading, error, userProfile, user } = useVastu()

  const [activeTab, setActiveTab] = useState<string>("overview")
  const [facingDirection, setFacingDirection] = useState<string>('')
  const [layout, setLayout] = useState<VastuLayoutInput>({})
  const [personalizedDirections, setPersonalizedDirections] = useState<any>(null)

  // Calculate personalized directions when userProfile is available
  useEffect(() => {
    if (userProfile) {
      const personalized = calculatePersonalizedVastuDirections(userProfile)
      setPersonalizedDirections(personalized)
    }
  }, [userProfile])

  const [vastuTiming, setVastuTiming] = useState<any>(null)
  const [aayaCalculation, setAayaCalculation] = useState<any>(null)
  const [nextAuspiciousDates, setNextAuspiciousDates] = useState<any[]>([])

  useEffect(() => {
    if (userProfile && analysis) {
      // Calculate timing for today
      const today = new Date()
      const latitude = userProfile.birthLatitude || 19.0760
      const longitude = userProfile.birthLongitude || 72.8777
      const timing = getVastuTiming(today, latitude, longitude, userProfile)
      setVastuTiming(timing)
      
      // Get next auspicious dates
      const auspiciousDates = getNextAuspiciousDates(today, 5, latitude, longitude, 60)
      setNextAuspiciousDates(auspiciousDates)
      
      // Calculate Aaya/Aayushya
      const aayaPropertyData: PropertyAayaData = {
        propertyType: analysis.propertyType || 'residential',
        plotShape: analysis.plotShape || 'rectangular',
        entranceDirection: analysis.entranceDirection || 'north',
        totalRooms: analysis.rooms?.length || 8,
        floors: 1
      }
      const aaya = calculateAayaAayushya(aayaPropertyData, userProfile)
      setAayaCalculation(aaya)
    }
  }, [userProfile, analysis])

  const tabs = [
    { id: "overview", label: "Overview", icon: Home },
    { id: "entrance", label: "Main Entrance", icon: Compass },
    { id: "rooms", label: "Room Placement", icon: Layout },
    { id: "construction", label: "Construction", icon: Hammer },
    { id: "timing", label: "Auspicious Timing", icon: Clock },
    { id: "aaya", label: "Aaya/Aayushya", icon: DollarSign },
    { id: "remedies", label: "Remedies", icon: Shield },
    { id: "coach", label: "Ask the Seer", icon: Zap }
  ]

  const viralUnlock = useToolReportUnlock('vastu')
  const bypassViral = useViralReportBypass()
  const [showShareCard, setShowShareCard] = useState(false)
  const [waitingLite, setWaitingLite] = useState(false)

  const showVastuViral = Boolean(analysis) && !bypassViral
  const vastuTeaser = useMemo(() => buildToolTeaser('vastu', analysis), [analysis])

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
          text: `${vastuTeaser.archetypeName}: ${vastuTeaser.hookLine.slice(0, 120)}…`,
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
  }, [copyLink, viralUnlock, vastuTeaser.archetypeName, vastuTeaser.hookLine])

  const continueWithoutSharing = useCallback(() => {
    setWaitingLite(true)
    window.setTimeout(() => {
      viralUnlock.unlockLite()
      setWaitingLite(false)
    }, 4000)
  }, [viralUnlock])

  const vastuCompareHref = useMemo(
    () => `/tools/${toolPathForSlug('vastu')}?friend=compare&ref=share`,
    []
  )

  const vastuLocked =
    showVastuViral && viralUnlock.hydrated && !viralUnlock.isUnlocked && !bypassViral

  return (
    <div className="min-h-screen starfield-ultra-sharp p-4">
      <div className="max-w-7xl mx-auto relative z-10 pt-4 pb-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold gold-glow mb-4">🏠 Vastu</h1>
          <p className="text-white leading-relaxed text-lg mb-6">
            Ancient Indian science of sacred architecture and cosmic harmony
          </p>
          
          {/* Personalized Greeting */}
          {userProfile && userProfile.fullName && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-2xl p-4 max-w-2xl mx-auto mb-4 shadow-sm"
            >
              <div className="flex items-center gap-3 justify-center">
                <User className="w-5 h-5 text-amber-700" />
                <p className="text-slate-700">
                  Welcome back, <span className="text-amber-900 font-semibold">{userProfile.fullName}</span>!
                  {personalizedDirections && (
                    <span className="text-slate-600 text-sm block mt-1">
                      Lucky directions: <span className="text-amber-700 font-medium">{personalizedDirections.bestDirections.join(', ')}</span>
                    </span>
                  )}
                </p>
              </div>
            </motion.div>
          )}

          {/* Inspirational Quote */}
          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-2xl p-6 max-w-2xl mx-auto shadow-sm">
            <p className="text-xl italic text-amber-900 font-serif mb-2">
              "When the home aligns with cosmic energies, prosperity flows like a river and peace dwells in every corner."
            </p>
            <p className="text-slate-600 text-sm">— Vastu Shastra</p>
          </div>
        </motion.div>

        {/* Main Content */}
                {isLoading ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-16"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="text-6xl mb-6"
                    >
                      🏠
                    </motion.div>
            <h3 className="text-2xl gold-glow mb-4">Generating Personalized Vastu Recommendations</h3>
            <p className="text-white text-lg">Calculating cosmic guidance based on birth chart...</p>
                  </motion.div>
                ) : error ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-16"
                  >
                    <div className="text-4xl mb-4">⚠️</div>
            <p className="text-red-400 text-lg mb-2">Error Loading Recommendations</p>
            <p className="text-white">{error}</p>
                  </motion.div>
        ) : !userProfile ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-16"
                  >
                    <div className="text-6xl mb-6">🏠</div>
            <h3 className="text-2xl gold-glow mb-4">Complete Profile</h3>
            <p className="text-white leading-relaxed max-w-md mx-auto">
              Please complete profile with birth details to receive personalized Vastu recommendations.
                    </p>
                  </motion.div>
        ) : analysis ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {showVastuViral && !bypassViral && (
              <div className="space-y-4">
                <TeaserView teaser={vastuTeaser} />
                {showShareCard && (
                  <ShareCard
                    archetypeName={vastuTeaser.archetypeName}
                    hookLine={vastuTeaser.hookLine}
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

            {showVastuViral && viralUnlock.isUnlocked && !bypassViral && (
              <div className="flex justify-center">
                <Link
                  href={vastuCompareHref}
                  className="inline-flex items-center gap-2 rounded-full border border-violet-500/40 bg-violet-950/40 px-4 py-2 text-sm font-medium text-violet-100 hover:bg-violet-900/50"
                >
                  <Users className="h-4 w-4" />
                  Compare with a friend
                </Link>
              </div>
            )}

            {/* Tabs */}
            <div className="rounded-2xl border border-amber-500/30 bg-slate-900/80 overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full min-w-0">
              <TabsList className="flex w-full flex-nowrap overflow-x-auto gap-1 sm:gap-2 p-2 sm:p-3 bg-slate-800/50 border-b border-amber-500/20 rounded-none h-auto min-h-0 justify-start [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-amber-500/30">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className="shrink-0 devotionist-tab-trigger flex items-center gap-2 rounded-t-lg rounded-b-none px-4 py-2.5 text-sm font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 border border-transparent data-[state=inactive]:border-slate-600/50 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 transition-all"
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </TabsTrigger>
                  )
                })}
              </TabsList>

              {activeTab === 'coach' ? (
                <TabsContent value="coach" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                      <VastuCoachInterface
                        analysis={analysis ?? null}
                        userProfile={userProfile}
                        onSwitchToOverview={() => setActiveTab('overview')}
                        facingDirection={facingDirection || undefined}
                        layout={(facingDirection && [layout.kitchen, layout.bedroom, layout.toilet, layout.main_door, layout.living_room, layout.prayer_room, layout.center].some(Boolean)) ? { facing_direction: facingDirection, ...layout } : undefined}
                      />
                </TabsContent>
              ) : showVastuViral && !viralUnlock.hydrated ? (
              <div className="py-12 text-center text-slate-400">Loading report…</div>
              ) : (
              <div className="relative min-h-[320px]">
                {vastuLocked && (
                  <ViralLockOverlay
                    onUnlockClick={handleShareToUnlock}
                    onContinueWithoutSharing={waitingLite ? () => {} : continueWithoutSharing}
                    continueDisabled={waitingLite}
                  />
                )}
                <div
                  className={cn(
                    vastuLocked &&
                      'pointer-events-none select-none blur-sm filter transition-[filter] duration-300 [&_*]:pointer-events-none'
                  )}
                >
            {personalizedDirections && personalizedDirections.bestDirections.length > 0 && (
              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-2xl p-6 shadow-sm mx-4 sm:mx-6 mt-6">
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="w-6 h-6 text-amber-700" />
                  <h3 className="text-2xl font-bold text-amber-900">Personalized Vastu Recommendations</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-700 font-semibold mb-2">Lucky Directions:</p>
                    <div className="flex flex-wrap gap-2">
                      {personalizedDirections.bestDirections.map((dir: string, i: number) => (
                        <span key={i} className="px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full text-sm font-medium">
                          {dir}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-slate-700 font-semibold mb-2">Recommended Colors:</p>
                    <div className="flex flex-wrap gap-2">
                      {personalizedDirections.recommendedColors.slice(0, 5).map((color: string, i: number) => (
                        <span key={i} className={`px-3 py-1 border rounded-full text-sm ${getColorStyles(color)}`}>
                          {color}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

              {/* Tab Content */}
                <TabsContent value="overview" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                      <div className="space-y-6">
                        <div className="text-center mb-6">
                          <div className="text-6xl mb-4">🏠</div>
                          <h3 className="text-3xl font-bold text-amber-900 mb-2">Vastu Recommendations Ready</h3>
                          {analysis.overallScore !== null && analysis.overallScore !== undefined && !analysis.metadata?.isProfileBased && (
                            <div className="inline-block px-6 py-3 rounded-xl border-2 border-amber-300 bg-amber-50/80">
                              <div className="text-4xl font-bold text-amber-900 mb-1">{analysis.overallScore}%</div>
                              <div className="text-sm text-slate-600">Overall Vastu Score</div>
                            </div>
                          )}
                          {(analysis.overallScore === null || analysis.overallScore === undefined || analysis.metadata?.isProfileBased === true) && (
                            <div className="inline-block px-6 py-3 rounded-xl border-2 border-amber-300 bg-amber-50/80">
                              <div className="text-sm text-slate-700">Personalized Recommendations Based on Profile</div>
                            </div>
                          )}
                        </div>
                        {analysis.personality && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-amber-50/80 border-2 border-amber-300 rounded-xl p-4 shadow-sm">
                              <h4 className="font-semibold text-amber-900 mb-2">Strengths</h4>
                              <ul className="space-y-1 text-sm text-slate-700">
                                {analysis.personality.strengths.map((s: string, i: number) => (
                                  <li key={i}>• {s}</li>
                                ))}
                              </ul>
                            </div>
                            <div className="bg-amber-50/80 border-2 border-amber-300 rounded-xl p-4 shadow-sm">
                              <h4 className="font-semibold text-amber-900 mb-2">Life Path</h4>
                              <p className="text-sm text-slate-700">{analysis.personality.lifePath}</p>
                            </div>
                          </div>
                        )}
                        {analysis.personalizedInsights && analysis.personalizedInsights.personalizedRecommendations.length > 0 && (
                          <div className="mt-6 bg-amber-50/80 border-2 border-amber-300 rounded-xl p-6 shadow-sm">
                            <h4 className="font-semibold text-amber-900 mb-4 flex items-center gap-2">
                              <Sparkles className="w-5 h-5 text-amber-700" />
                              Personalized Recommendations
                            </h4>
                            <div className="space-y-3">
                              {analysis.personalizedInsights.personalizedRecommendations.map((rec: string, i: number) => (
                                <div key={i} className="flex items-start gap-3">
                                  <span className="text-amber-600 mt-1">✨</span>
                                  <p className="text-slate-700 flex-1">{rec}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Current residence layout: facing + room placements for Ask the Seer */}
                        <div className="mt-6 bg-amber-50/80 border-2 border-amber-300 rounded-2xl p-6 shadow-sm">
                          <h4 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                            <Layout className="w-5 h-5 text-amber-700" />
                            Your current residence layout
                          </h4>
                          <p className="text-sm text-slate-700 mb-4">
                            Fill this in so Ask the Seer can give advice based on your actual circumstances. Example: Kitchen in Southeast is correct.
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                              <label className="text-sm font-medium text-amber-900 block mb-1">Facing direction (16 zones)</label>
                              <Select
                                value={facingDirection || 'Unknown'}
                                onValueChange={(v) => setFacingDirection(v === 'Unknown' ? '' : v)}
                              >
                                <SelectTrigger className="border-amber-200 bg-white text-slate-800">
                                  <SelectValue placeholder="Select…" />
                                </SelectTrigger>
                                <SelectContent>
                                  {DIRECTION_OPTIONS_16.map((d) => (
                                    <SelectItem key={d} value={d}>{d}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-amber-900 block mb-1">Main door (32 padas)</label>
                              <Select
                                value={layout.main_door || 'Unknown'}
                                onValueChange={(v) => setLayout((prev) => ({ ...prev, main_door: v === 'Unknown' ? undefined : v }))}
                              >
                                <SelectTrigger className="border-amber-200 bg-white text-slate-800">
                                  <SelectValue placeholder="Select…" />
                                </SelectTrigger>
                                <SelectContent>
                                  {MAIN_DOOR_OPTIONS.map((d) => (
                                    <SelectItem key={d} value={d}>{d}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-amber-900 block mb-1">Kitchen (16 zones)</label>
                              <Select
                                value={layout.kitchen || 'Unknown'}
                                onValueChange={(v) => setLayout((prev) => ({ ...prev, kitchen: v === 'Unknown' ? undefined : v }))}
                              >
                                <SelectTrigger className="border-amber-200 bg-white text-slate-800">
                                  <SelectValue placeholder="Select…" />
                                </SelectTrigger>
                                <SelectContent>
                                  {DIRECTION_OPTIONS_16.map((d) => (
                                    <SelectItem key={d} value={d}>{d}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-amber-900 block mb-1">Bedroom (16 zones)</label>
                              <Select
                                value={layout.bedroom || 'Unknown'}
                                onValueChange={(v) => setLayout((prev) => ({ ...prev, bedroom: v === 'Unknown' ? undefined : v }))}
                              >
                                <SelectTrigger className="border-amber-200 bg-white text-slate-800">
                                  <SelectValue placeholder="Select…" />
                                </SelectTrigger>
                                <SelectContent>
                                  {DIRECTION_OPTIONS_16.map((d) => (
                                    <SelectItem key={d} value={d}>{d}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-amber-900 block mb-1">Toilet (16 zones)</label>
                              <Select
                                value={layout.toilet || 'Unknown'}
                                onValueChange={(v) => setLayout((prev) => ({ ...prev, toilet: v === 'Unknown' ? undefined : v }))}
                              >
                                <SelectTrigger className="border-amber-200 bg-white text-slate-800">
                                  <SelectValue placeholder="Select…" />
                                </SelectTrigger>
                                <SelectContent>
                                  {DIRECTION_OPTIONS_16.map((d) => (
                                    <SelectItem key={d} value={d}>{d}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-amber-900 block mb-1">Living room (16 zones)</label>
                              <Select
                                value={layout.living_room || 'Unknown'}
                                onValueChange={(v) => setLayout((prev) => ({ ...prev, living_room: v === 'Unknown' ? undefined : v }))}
                              >
                                <SelectTrigger className="border-amber-200 bg-white text-slate-800">
                                  <SelectValue placeholder="Select…" />
                                </SelectTrigger>
                                <SelectContent>
                                  {DIRECTION_OPTIONS_16.map((d) => (
                                    <SelectItem key={d} value={d}>{d}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-amber-900 block mb-1">Prayer room (16 zones)</label>
                              <Select
                                value={layout.prayer_room || 'Unknown'}
                                onValueChange={(v) => setLayout((prev) => ({ ...prev, prayer_room: v === 'Unknown' ? undefined : v }))}
                              >
                                <SelectTrigger className="border-amber-200 bg-white text-slate-800">
                                  <SelectValue placeholder="Select…" />
                                </SelectTrigger>
                                <SelectContent>
                                  {DIRECTION_OPTIONS_16.map((d) => (
                                    <SelectItem key={d} value={d}>{d}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-amber-900 block mb-1">Center (Brahmasthan)</label>
                              <Select
                                value={layout.center || 'Unknown'}
                                onValueChange={(v) => setLayout((prev) => ({ ...prev, center: v === 'Unknown' ? undefined : v }))}
                              >
                                <SelectTrigger className="border-amber-200 bg-white text-slate-800">
                                  <SelectValue placeholder="Select…" />
                                </SelectTrigger>
                                <SelectContent>
                                  {CENTER_OPTIONS.map((d) => (
                                    <SelectItem key={d} value={d}>{d}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <CompassHelper mode="16" onUseDirection={(d) => setFacingDirection(d)} />
                          <div className="mt-4">
                            <CompassHelper
                              mode="32"
                              buttonLabel="Use as main door location (32 padas)"
                              onUseDirection={(d) => setLayout((prev) => ({ ...prev, main_door: d }))}
                              className="mt-2"
                            />
                          </div>
                        </div>
                      </div>
                </TabsContent>
                <TabsContent value="entrance" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                      {analysis.mainEntranceAnalysis ? (
                        <VastuMainEntranceGuide analysis={analysis.mainEntranceAnalysis} />
                      ) : (
                        <div className="space-y-6">
                          <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-sm">
                              <Compass className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="text-2xl font-bold text-amber-900">Main Entrance Analysis</h3>
                              <p className="text-slate-600">32 Padas System - Personalized Recommendations</p>
                            </div>
                          </div>
                          <div className="bg-amber-50/80 border-2 border-amber-300 rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                              <Info className="w-5 h-5 text-amber-700" />
                              <h4 className="text-xl font-semibold text-amber-900">Main Entrance Guidance</h4>
                            </div>
                            {personalizedDirections && personalizedDirections.bestDirections.length > 0 ? (
                              <div className="space-y-4">
                                <p className="text-slate-700">
                                  Based on birth chart analysis, the most auspicious directions for the main entrance are:
                                </p>
                                <div className="flex flex-wrap gap-2 mb-4">
                                  {personalizedDirections.bestDirections.map((dir: string, i: number) => (
                                    <span key={i} className="px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full text-sm font-medium">
                                      {dir.charAt(0).toUpperCase() + dir.slice(1)}
                                    </span>
                                  ))}
                                </div>
                                <div className="space-y-3">
                                  <div>
                                    <h5 className="text-amber-900 font-semibold mb-2">General Main Entrance Guidelines:</h5>
                                    <ul className="space-y-2 text-slate-700 text-sm">
                                      <li className="flex items-start gap-2">
                                        <span className="text-amber-600 mt-1">•</span>
                                        <span>Main entrance should face one of the auspicious directions listed above</span>
                                      </li>
                                      <li className="flex items-start gap-2">
                                        <span className="text-amber-600 mt-1">•</span>
                                        <span>Door should be larger than other doors in the house</span>
                                      </li>
                                      <li className="flex items-start gap-2">
                                        <span className="text-amber-600 mt-1">•</span>
                                        <span>Ensure entrance is well-lit and obstacle-free</span>
                                      </li>
                                      <li className="flex items-start gap-2">
                                        <span className="text-amber-600 mt-1">•</span>
                                        <span>Place Ganesha idol at entrance (north/NE, back facing outside)</span>
                                      </li>
                                      <li className="flex items-start gap-2">
                                        <span className="text-amber-600 mt-1">•</span>
                                        <span>Use auspicious colors: {personalizedDirections.recommendedColors.slice(0, 3).join(', ')}</span>
                                      </li>
                                      <li className="flex items-start gap-2">
                                        <span className="text-amber-600 mt-1">•</span>
                                        <span>Door should open clockwise from right side</span>
                                      </li>
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <p className="text-slate-700">
                                Complete profile to receive personalized main entrance recommendations based on birth chart analysis.
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                </TabsContent>
                <TabsContent value="rooms" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                      <div className="space-y-4">
                        <h3 className="text-2xl font-bold text-amber-900 mb-4">Room Placement Recommendations</h3>
                            {analysis.rooms && analysis.rooms.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {analysis.rooms.map((room: any, index: number) => (
                              <RoomCard key={index} room={room} />
                            ))}
                          </div>
                        ) : (
                          <p className="text-slate-600">No room data available</p>
                        )}
                      </div>
                </TabsContent>
                <TabsContent value="construction" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                      <VastuConstructionPlanner />
                </TabsContent>
                <TabsContent value="timing" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                      <div className="space-y-6">
                        <h3 className="text-2xl font-bold text-amber-900 mb-4">Auspicious Timing for Vastu Activities</h3>
                        {vastuTiming ? (
                          <div className="space-y-4">
                            <div className="bg-amber-50/80 border-2 border-amber-300 rounded-2xl p-6 shadow-sm">
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="text-xl font-bold text-amber-900">Today's Panchanga</h4>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                  vastuTiming.isAuspicious 
                                    ? 'bg-green-100 text-green-800 border border-green-300'
                                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                                }`}>
                                  {vastuTiming.auspiciousScore}% Auspicious
                                </span>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                                <div>
                                  <p className="text-xs text-slate-600 mb-1">Tithi</p>
                                  <p className="text-slate-800 font-semibold">{vastuTiming.tithi}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-slate-600 mb-1">Nakshatra</p>
                                  <p className="text-slate-800 font-semibold">{vastuTiming.nakshatra}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-slate-600 mb-1">Yoga</p>
                                  <p className="text-slate-800 font-semibold">{vastuTiming.yoga}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-slate-600 mb-1">Karana</p>
                                  <p className="text-slate-800 font-semibold">{vastuTiming.karana}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-slate-600 mb-1">Vaara</p>
                                  <p className="text-slate-800 font-semibold">{vastuTiming.vara}</p>
                                </div>
                              </div>
                              <div className="mb-4">
                                <h5 className="text-amber-900 font-semibold mb-2">Best Activities Today:</h5>
                                <div className="flex flex-wrap gap-2">
                                  {vastuTiming.bestActivities.map((activity: string, i: number) => (
                                    <span key={i} className="px-3 py-1 bg-green-100 text-green-800 border border-green-300 rounded-full text-sm">
                                      {activity}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              {vastuTiming.avoidActivities.length > 0 && (
                                <div className="mb-4">
                                  <h5 className="text-amber-900 font-semibold mb-2">Avoid Today:</h5>
                                  <div className="flex flex-wrap gap-2">
                                    {vastuTiming.avoidActivities.map((activity: string, i: number) => (
                                      <span key={i} className="px-3 py-1 bg-red-100 text-red-800 border border-red-300 rounded-full text-sm">
                                        {activity}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              <div>
                                <h5 className="text-amber-900 font-semibold mb-2">Time Slots:</h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {vastuTiming.timeSlots.map((slot: any, i: number) => (
                                    <div key={i} className={`p-3 rounded-xl border-2 ${
                                      slot.auspicious 
                                        ? 'bg-green-50 border-green-300'
                                        : 'bg-red-50 border-red-300'
                                    }`}>
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="text-slate-800 font-medium text-sm">{slot.start} - {slot.end}</span>
                                        <span className={`text-xs px-2 py-1 rounded-lg ${
                                          slot.auspicious ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                          {slot.auspicious ? 'Auspicious' : 'Avoid'}
                                        </span>
                                      </div>
                                      <p className="text-xs text-slate-600">{slot.activity}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              {vastuTiming.recommendations.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-amber-200">
                                  <h5 className="text-amber-900 font-semibold mb-2">Recommendations:</h5>
                                  <ul className="space-y-1">
                                    {vastuTiming.recommendations.map((rec: string, i: number) => (
                                      <li key={i} className="text-sm text-slate-700">• {rec}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                            {nextAuspiciousDates.length > 0 && (
                              <div className="bg-amber-50/80 border-2 border-amber-300 rounded-2xl p-6 shadow-sm">
                                <h4 className="text-xl font-bold text-amber-900 mb-4">Next Auspicious Dates</h4>
                                <div className="space-y-3">
                                  {nextAuspiciousDates.map((date, i) => (
                                    <div key={i} className="p-4 bg-white/80 rounded-xl border-2 border-amber-200">
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="text-slate-800 font-semibold">
                                          {date.date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                        </span>
                                        <span className="px-3 py-1 bg-green-100 text-green-800 border border-green-300 rounded-full text-sm font-medium">
                                          {date.auspiciousScore}%
                                        </span>
                                      </div>
                                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-slate-600">
                                        <span>{date.tithi}</span>
                                        <span>{date.nakshatra}</span>
                                        <span>{date.yoga}</span>
                                        <span>{date.vara}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-slate-600">Calculating auspicious timing...</p>
                        )}
                      </div>
                </TabsContent>
                <TabsContent value="aaya" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                      <div className="space-y-6">
                        <h3 className="text-2xl font-bold text-amber-900 mb-4">Aaya & Aayushya Calculations</h3>
                        {aayaCalculation ? (
                          <div className="space-y-4">
                            <div className="bg-amber-50/80 border-2 border-amber-300 rounded-2xl p-6 shadow-sm">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <div className="text-center p-4 bg-white/80 rounded-xl border-2 border-amber-200">
                                  <p className="text-xs text-slate-600 mb-2">Aaya (Income)</p>
                                  <p className="text-3xl font-bold text-amber-900">{aayaCalculation.aaya.toFixed(1)}</p>
                                  <p className="text-xs text-slate-600 mt-1">/ 8.0</p>
                                </div>
                                <div className="text-center p-4 bg-white/80 rounded-xl border-2 border-amber-200">
                                  <p className="text-xs text-slate-600 mb-2">Aayushya (Longevity)</p>
                                  <p className="text-3xl font-bold text-amber-900">{aayaCalculation.aayushya.toFixed(1)}</p>
                                  <p className="text-xs text-slate-600 mt-1">/ 8.0</p>
                                </div>
                                <div className="text-center p-4 bg-white/80 rounded-xl border-2 border-amber-200">
                                  <p className="text-xs text-slate-600 mb-2">Dhana (Wealth)</p>
                                  <p className="text-3xl font-bold text-amber-900">{aayaCalculation.dhana.toFixed(1)}</p>
                                  <p className="text-xs text-slate-600 mt-1">/ 8.0</p>
                                </div>
                                <div className="text-center p-4 bg-white/80 rounded-xl border-2 border-amber-200">
                                  <p className="text-xs text-slate-600 mb-2">Runa (Debt)</p>
                                  <p className="text-3xl font-bold text-amber-900">{aayaCalculation.runa.toFixed(1)}</p>
                                  <p className="text-xs text-slate-600 mt-1">/ 8.0 (lower is better)</p>
                                </div>
                              </div>
                              <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                  <p className="text-slate-800 font-semibold">Overall Auspiciousness Score</p>
                                  <span className="text-2xl font-bold text-amber-900">{aayaCalculation.overallScore}%</span>
                                </div>
                                <div className="w-full bg-amber-100 rounded-full h-3">
                                  <div 
                                    className="bg-gradient-to-r from-amber-400 to-amber-600 h-3 rounded-full transition-all duration-500"
                                    style={{ width: `${aayaCalculation.overallScore}%` }}
                                  />
                                </div>
                              </div>
                              <div className="mb-4">
                                <h5 className="text-amber-900 font-semibold mb-2">Interpretation:</h5>
                                <p className="text-slate-700">{aayaCalculation.interpretation}</p>
                              </div>
                              {aayaCalculation.recommendations.length > 0 && (
                                <div>
                                  <h5 className="text-amber-900 font-semibold mb-2">Recommendations:</h5>
                                  <ul className="space-y-2">
                                    {aayaCalculation.recommendations.map((rec: string, i: number) => (
                                      <li key={i} className="flex items-start gap-2">
                                        <span className="text-amber-600 mt-1">✨</span>
                                        <p className="text-slate-700 text-sm flex-1">{rec}</p>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <p className="text-slate-600">Calculating Aaya/Aayushya...</p>
                        )}
                      </div>
                </TabsContent>
                <TabsContent value="remedies" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                      <div className="space-y-6">
                        <VastuDocumentedRemedies />
                        {analysis.remedies && (
                          <div className="bg-amber-50/80 border-2 border-amber-300 rounded-2xl p-6 shadow-sm">
                            <h3 className="text-xl font-bold text-amber-900 mb-4 flex items-center gap-2">
                              <Sparkles className="w-5 h-5 text-amber-700" />
                              Personalized Recommendations
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {Object.entries(analysis.remedies).map(([key, value]: [string, any]) => (
                                <div key={key} className="bg-white/80 border-2 border-amber-200 rounded-xl p-4 shadow-sm">
                                  <h4 className="font-semibold text-amber-900 mb-2 capitalize">{key}</h4>
                                  <ul className="space-y-1 text-sm text-slate-700">
                                    {Array.isArray(value) && value.map((item: string, i: number) => (
                                      <li key={i}>• {item}</li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                </TabsContent>
                </div>
              </div>
              )}
            </Tabs>
            </div>
          </motion.div>
        ) : null}

        {/* Features Highlight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-2xl p-8 mt-12 shadow-sm"
        >
          <h3 className="text-2xl font-bold text-amber-900 mb-6 text-center">✨ Vastu Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-3">🧭</div>
              <h4 className="text-amber-900 font-semibold mb-2">32 Padas System</h4>
              <p className="text-slate-600 text-sm">Precise directional guidance</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">⚡</div>
              <h4 className="text-amber-900 font-semibold mb-2">Personalized</h4>
              <p className="text-slate-600 text-sm">Based on birth details</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">🏗️</div>
              <h4 className="text-amber-900 font-semibold mb-2">Construction Guide</h4>
              <p className="text-slate-600 text-sm">Step-by-step planning</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">✨</div>
              <h4 className="text-amber-900 font-semibold mb-2">Ask the Seer</h4>
              <p className="text-slate-600 text-sm">Interactive guidance</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 
