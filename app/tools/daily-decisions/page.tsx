"use client"

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { useToolReport } from '@/hooks/useComprehensiveMysticalProfile'
import { ToolReportGuard } from '@/components/ToolReportGuard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ToolIntroductionTab } from '@/components/ToolIntroductionTab'
import { isProfileComplete, getProfileCompletionStatus } from '@/lib/firebase'
import { DailyDecisionsAnalysis } from '@/lib/dailyDecisionsIntelligence'
import {
  DAILY_COLOR_GUIDE,
  SHOE_COLOR_BY_DAY,
  AVOIDANCE_LIST,
  SIGN_ELEMENT,
  ELEMENT_PALETTE,
  RISING_STYLE_HINT,
  VENUS_TEXTURE_HINT,
  NAILS_VEDIC_GUIDE,
  getWeekdayFromDate,
  getColorGuideForWeekday,
} from '@/lib/dailyDecisionsColorGuide'
import { 
  Calendar,
  AlertTriangle,
  Info,
  User,
  Loader2,
  BookOpen,
  Sparkles,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  Scissors,
  Droplet,
  Palette,
  ExternalLink,
  Plane,
  Home,
  MessageCircle,
} from 'lucide-react'
import { DailyDecisionsSeerChatInterface } from '@/components/DailyDecisionsSeerChatInterface'

export default function DailyDecisionsPage() {
  const { user, userProfile } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'introduction' | 'recommendations' | 'ask-the-seer'>('introduction')
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])
  const { report: pipelineReport, loading: isLoading, error, hasReport } = useToolReport('dailyDecisions')
  const analysis = useMemo(() => (pipelineReport as DailyDecisionsAnalysis | undefined) ?? null, [pipelineReport])

  const hasCompleteProfile = userProfile ? isProfileComplete(userProfile) : false
  const profileStatus = userProfile ? getProfileCompletionStatus(userProfile) : { isComplete: false, missingFields: [], completionPercentage: 0 }

  // Check for reduced motion preference
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  // Material 3 motion configuration
  const motionConfig = useMemo(() => {
    if (prefersReducedMotion) return { duration: 0 }
    return { duration: 0.3, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }
  }, [prefersReducedMotion])

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBadge = (score: number) => {
    if (score >= 80) return <CheckCircle className="w-5 h-5 text-green-600" />
    if (score >= 60) return <Clock className="w-5 h-5 text-yellow-600" />
    return <XCircle className="w-5 h-5 text-red-600" />
  }

  return (
    <ToolReportGuard loading={isLoading} error={error ?? null} toolLabel="Daily Decisions">
    <div className="min-h-screen starfield-ultra-sharp">
      <div className="fixed inset-0 -z-10 starfield-ultra-sharp" />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8 text-center pt-4"
          >
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-semibold mb-6">
              <span className="text-yellow-400">📅</span>{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600">Daily Decisions</span>
            </h1>
            <p className="text-slate-200 leading-relaxed text-xl font-light">
              Personalized Vedic astrology guidance for daily life decisions
            </p>
          </motion.div>

          {/* Profile Completion Alert */}
          {!hasCompleteProfile && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <Alert className="bg-amber-100 border-2 border-amber-300 rounded-2xl">
                <Info className="h-4 w-4 text-amber-700" />
                <AlertDescription className="text-amber-900">
                  <div className="flex items-center justify-between">
                    <div>
                      <strong>Complete your profile</strong> with birth date, time, and place for accurate recommendations. 
                      Missing: {profileStatus.missingFields.join(', ')}
                    </div>
                    <Button
                      onClick={() => router.push('/profile')}
                      size="sm"
                      className="bg-amber-500 hover:bg-amber-600 text-white ml-4"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Complete Profile
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          {/* Error Alert */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <Alert className="bg-red-100 border-2 border-red-300 rounded-2xl">
                <AlertTriangle className="h-4 w-4 text-red-700" />
                <AlertDescription className="text-red-900">
                  {error}
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          {/* Date Picker */}
          {hasCompleteProfile && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <Card className="bg-slate-800/50 border-2 border-slate-700 rounded-2xl">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Calendar className="w-5 h-5 text-amber-400" />
                    <label className="text-slate-200 font-medium">Select Date:</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => {
                        setSelectedDate(e.target.value)
                      }}
                      className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <Button asChild className="bg-amber-500 hover:bg-amber-600 text-white">
                      <Link href="/profile">Generate your mystical profile</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Tabs */}
          <div className="rounded-2xl border border-amber-500/30 bg-slate-900/80 overflow-hidden">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'introduction' | 'recommendations' | 'ask-the-seer')} className="w-full min-w-0">
            <TabsList className="flex w-full flex-nowrap overflow-x-auto gap-1 sm:gap-2 p-2 sm:p-3 bg-slate-800/50 border-b border-amber-500/20 rounded-none h-auto min-h-0 justify-start [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-amber-500/30">
              {[
                { value: 'introduction', label: 'Introduction', icon: BookOpen },
                { value: 'recommendations', label: 'Recommendations', icon: Sparkles, disabled: !analysis },
                { value: 'ask-the-seer', label: 'Ask the Seer', icon: MessageCircle, disabled: !analysis }
              ].map((tab) => (
                <motion.div
                  key={tab.value}
                  whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
                  whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                  transition={prefersReducedMotion ? {} : { type: "spring", stiffness: 400, damping: 17 }}
                  className="relative shrink-0"
                >
                  <TabsTrigger 
                    value={tab.value}
                    disabled={tab.disabled}
                    className={`shrink-0 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 rounded-t-lg rounded-b-none px-4 py-2.5 text-sm font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 transition-all flex items-center justify-center relative overflow-hidden border border-transparent data-[state=inactive]:border-slate-600/50 ${
                      tab.disabled ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <tab.icon className="w-4 h-4 mr-2" />
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

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              {/* Introduction Tab */}
              {activeTab === 'introduction' && (
                <motion.div
                  key="introduction"
                  initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                  animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                  exit={prefersReducedMotion ? {} : { opacity: 0, y: -20 }}
                  transition={motionConfig}
                >
                  <TabsContent value="introduction" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                    <ToolIntroductionTab toolSlug="daily-decisions" />
                  </TabsContent>
                </motion.div>
              )}

              {/* Recommendations Tab */}
              {activeTab === 'recommendations' && (
                <motion.div
                  key="recommendations"
                  initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                  animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                  exit={prefersReducedMotion ? {} : { opacity: 0, y: -20 }}
                  transition={motionConfig}
                >
                  <TabsContent value="recommendations" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                    {isLoading ? (
                      <Card className="bg-slate-800/50 border-2 border-slate-700 rounded-2xl">
                        <CardContent className="p-12 text-center">
                          <Loader2 className="w-12 h-12 animate-spin text-amber-400 mx-auto mb-4" />
                          <p className="text-slate-300">Calculating personalized recommendations...</p>
                        </CardContent>
                      </Card>
                    ) : analysis ? (
                      <div className="space-y-6">
                        {/* Rahu Kaal & Gulika Kaal Alert */}
                        <Card className="bg-red-50 border-2 border-red-300 rounded-2xl">
                          <CardHeader>
                            <CardTitle className="text-red-900 font-serif flex items-center gap-2">
                              <AlertTriangle className="w-5 h-5" />
                              Inauspicious Times - Avoid These Periods
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="bg-white rounded-lg p-4 border border-red-200">
                              <div className="font-semibold text-red-800 mb-1">Rahu Kaal</div>
                              <div className="text-red-700">{analysis.rahuKaal.formatted}</div>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-red-200">
                              <div className="font-semibold text-red-800 mb-1">Gulika Kaal</div>
                              <div className="text-red-700">{analysis.gulikaKaal.formatted}</div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Panchanga Summary */}
                        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl dark:from-blue-900/20 dark:to-indigo-900/20 dark:border-blue-700">
                          <CardHeader>
                            <CardTitle className="text-blue-900 dark:text-blue-100 font-serif flex items-center gap-2">
                              <Calendar className="w-5 h-5" />
                              Today&apos;s Panchanga ({analysis.date})
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div>
                                <div className="text-sm text-blue-700 dark:text-blue-400 mb-1">Tithi</div>
                                <div className="font-semibold text-blue-900 dark:text-blue-100">{analysis.panchangaSummary.tithi}</div>
                              </div>
                              <div>
                                <div className="text-sm text-blue-700 dark:text-blue-400 mb-1">Nakshatra</div>
                                <div className="font-semibold text-blue-900 dark:text-blue-100">{analysis.panchangaSummary.nakshatra}</div>
                              </div>
                              <div>
                                <div className="text-sm text-blue-700 dark:text-blue-400 mb-1">Vara</div>
                                <div className="font-semibold text-blue-900 dark:text-blue-100">{analysis.panchangaSummary.vara}</div>
                              </div>
                              <div>
                                <div className="text-sm text-blue-700 dark:text-blue-400 mb-1">Yoga</div>
                                <div className="font-semibold text-blue-900 dark:text-blue-100">{analysis.panchangaSummary.yoga}</div>
                              </div>
                              {analysis.panchangaSummary.sunrise != null && (
                                <div>
                                  <div className="text-sm text-blue-700 dark:text-blue-400 mb-1">Sunrise</div>
                                  <div className="font-semibold text-blue-900 dark:text-blue-100">{analysis.panchangaSummary.sunrise}</div>
                                </div>
                              )}
                              {analysis.panchangaSummary.sunset != null && (
                                <div>
                                  <div className="text-sm text-blue-700 dark:text-blue-400 mb-1">Sunset</div>
                                  <div className="font-semibold text-blue-900 dark:text-blue-100">{analysis.panchangaSummary.sunset}</div>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>

                        {/* User Context */}
                        <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-2xl">
                          <CardHeader>
                            <CardTitle className="text-purple-900 font-serif flex items-center gap-2">
                              <User className="w-5 h-5" />
                              Your Chart Context
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                              <div>
                                <div className="text-sm text-purple-700 mb-1">Janma Nakshatra</div>
                                <div className="font-semibold text-purple-900">{analysis.userContext.janmaNakshatra}</div>
                              </div>
                              <div>
                                <div className="text-sm text-purple-700 mb-1">Janma Tithi</div>
                                <div className="font-semibold text-purple-900">{analysis.userContext.janmaTithi}</div>
                              </div>
                              <div>
                                <div className="text-sm text-purple-700 mb-1">Ascendant</div>
                                <div className="font-semibold text-purple-900">{analysis.userContext.ascendant}</div>
                              </div>
                              {analysis.userContext.currentDasha && (
                                <div>
                                  <div className="text-sm text-purple-700 mb-1">Current Dasha</div>
                                  <div className="font-semibold text-purple-900">
                                    {analysis.userContext.currentDasha.planet} ({analysis.userContext.currentDasha.progress.toFixed(1)}%)
                                  </div>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>

                        {/* Color & Style */}
                        <div className="space-y-6">
                          <h2 className="text-2xl font-serif font-semibold text-amber-200 mb-2">Color & Style</h2>

                          {/* Daily Color Guide */}
                          <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 rounded-2xl dark:from-slate-800/50 dark:to-slate-900/50 dark:border-slate-600">
                            <CardHeader>
                              <CardTitle className="text-slate-900 dark:text-slate-100 font-serif flex items-center gap-2">
                                <Palette className="w-5 h-5" />
                                Daily Color Guide for Clothes & Accessories
                              </CardTitle>
                              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                Wearing the color of the day helps align your personal energy with the prevailing planetary frequency.
                              </p>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-600">
                                <table className="w-full text-left text-sm">
                                  <thead>
                                    <tr className="border-b border-slate-200 bg-slate-100 dark:border-slate-600 dark:bg-slate-800">
                                      <th className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">Day</th>
                                      <th className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">Ruling Planet</th>
                                      <th className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">Primary Colors</th>
                                      <th className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">Beneficial Actions</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {DAILY_COLOR_GUIDE.map((row) => {
                                      const weekday = getWeekdayFromDate(analysis.date);
                                      const isToday = row.weekday === weekday;
                                      return (
                                        <tr
                                          key={row.day}
                                          className={`border-b border-slate-100 dark:border-slate-700 ${isToday ? 'bg-amber-100 dark:bg-amber-900/30' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                                        >
                                          <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{row.day}</td>
                                          <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{row.rulingPlanet}</td>
                                          <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{row.primaryColors}</td>
                                          <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{row.beneficialActions}</td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>

                              {/* Today's Color & Actions */}
                              {(() => {
                                const w = getWeekdayFromDate(analysis.date);
                                const today = getColorGuideForWeekday(w);
                                const shoe = SHOE_COLOR_BY_DAY[w];
                                return (
                                  <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-900/20">
                                    <div className="mb-2 text-xs font-medium uppercase tracking-wide text-amber-700 dark:text-amber-400">
                                      Based on {today.day} ({analysis.date})
                                    </div>
                                    <div className="grid gap-2 text-slate-800 dark:text-slate-200 sm:grid-cols-2">
                                      <div>
                                        <span className="font-semibold">Colors:</span> {today.primaryColors}
                                      </div>
                                      <div>
                                        <span className="font-semibold">Actions:</span> {today.beneficialActions}
                                      </div>
                                      {shoe && (
                                        <div className="sm:col-span-2">
                                          <span className="font-semibold">Shoes:</span> {shoe}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })()}
                            </CardContent>
                          </Card>

                          {/* Specialized Activities 2026 */}
                          <Card className="bg-gradient-to-br from-indigo-50 to-violet-50 border-2 border-indigo-200 rounded-2xl dark:from-indigo-900/20 dark:to-violet-900/20 dark:border-indigo-700">
                            <CardHeader>
                              <CardTitle className="text-indigo-900 dark:text-indigo-100 font-serif flex items-center gap-2">
                                <Sparkles className="w-5 h-5" />
                                Specialized Activity Suggestions for 2026
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-indigo-900 dark:text-indigo-200">
                              <p>
                                <strong>Buying clothes:</strong> For maximum benefit, start the year with new clothes to reset your energy. Friday is generally the best day for fashion-related purchases (ruled by Venus).
                              </p>
                              <p>
                                <strong>Buying shoes:</strong> Match your shoe color to the day&apos;s planet for grounding energy (e.g. black on Saturday for Saturn&apos;s protection). Today: {SHOE_COLOR_BY_DAY[getWeekdayFromDate(analysis.date)]}.
                              </p>
                            </CardContent>
                          </Card>

                          {/* Personalization by Profile */}
                          {(() => {
                            const signKey = (s: string | undefined) =>
                              s && typeof s === 'string' && s !== 'Unknown'
                                ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
                                : '';
                            const sun = analysis.userContext.sunSign;
                            const rising = analysis.userContext.ascendant;
                            const venus = analysis.userContext.venusSign;
                            const hasAny = signKey(sun) || signKey(rising) || signKey(venus);
                            if (!hasAny) return null;
                            return (
                              <Card className="bg-gradient-to-br from-rose-50 to-pink-50 border-2 border-rose-200 rounded-2xl dark:from-rose-900/20 dark:to-pink-900/20 dark:border-rose-700">
                                <CardHeader>
                                  <CardTitle className="text-rose-900 dark:text-rose-100 font-serif flex items-center gap-2">
                                    <User className="w-5 h-5" />
                                    Personalization by Profile
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 text-rose-900 dark:text-rose-200">
                                  {signKey(sun) && (() => {
                                    const el = SIGN_ELEMENT[signKey(sun)!];
                                    const pal = el ? ELEMENT_PALETTE[el] : null;
                                    return (
                                      <p>
                                        <strong>Sun sign:</strong> Use for your core clothing palette. Your Sun is in {sun} {el ? `(${el})` : ''}. {pal ? `Lean into ${pal}.` : ''}
                                      </p>
                                    );
                                  })()}
                                  {signKey(rising) && RISING_STYLE_HINT[signKey(rising)!] && (
                                    <p>
                                      <strong>Rising sign (Ascendant):</strong> Dress for this sign to improve how others perceive you. {rising} Rising: {RISING_STYLE_HINT[signKey(rising)!]}.
                                    </p>
                                  )}
                                  {signKey(venus) && VENUS_TEXTURE_HINT[signKey(venus)!] && (
                                    <p>
                                      <strong>Venus sign:</strong> Fabrics and textures that make you feel most attractive. {VENUS_TEXTURE_HINT[signKey(venus)!]}
                                    </p>
                                  )}
                                </CardContent>
                              </Card>
                            );
                          })()}

                          {/* Daily Life Best Practices 2026 */}
                          <Card className="bg-gradient-to-br from-teal-50 to-cyan-50 border-2 border-teal-200 rounded-2xl dark:from-teal-900/20 dark:to-cyan-900/20 dark:border-teal-700">
                            <CardHeader>
                              <CardTitle className="text-teal-900 dark:text-teal-100 font-serif flex items-center gap-2">
                                <CheckCircle className="w-5 h-5" />
                                Daily Life Best Practices (2026 Focus)
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-teal-900 dark:text-teal-200">
                              <p><strong>Energy cleansing:</strong> Monday is the ideal day to clear &quot;emotional clutter&quot; at home.</p>
                              <p><strong>Shopping habits:</strong> In 2026, favor sustainable &quot;investment&quot; pieces over fast fashion to align with the year&apos;s more intentional energy.</p>
                            </CardContent>
                          </Card>

                          {/* Avoidance List */}
                          <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 rounded-2xl dark:from-red-900/20 dark:to-orange-900/20 dark:border-red-700">
                            <CardHeader>
                              <CardTitle className="text-red-900 dark:text-red-100 font-serif flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5" />
                                Avoidance List
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <ul className="list-inside list-disc space-y-1 text-red-900 dark:text-red-200">
                                {AVOIDANCE_LIST.map((item, i) => (
                                  <li key={i}>{item.text}</li>
                                ))}
                              </ul>
                            </CardContent>
                          </Card>

                          {/* External Resources */}
                          <Card className="bg-slate-100 border-2 border-slate-300 rounded-2xl dark:bg-slate-800/50 dark:border-slate-600">
                            <CardHeader>
                              <CardTitle className="text-slate-900 dark:text-slate-100 font-serif flex items-center gap-2">
                                <ExternalLink className="w-5 h-5" />
                                Where to Personalize
                              </CardTitle>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                For a full profile using your name, time, and date of birth:
                              </p>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                              <a href="https://www.astrosage.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-amber-600 hover:underline dark:text-amber-400">
                                <ExternalLink className="w-4 h-4 shrink-0" /> AstroSage AI — Daily AI-generated rituals and personalized color suggestions.
                              </a>
                              <a href="https://www.astrotalk.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-amber-600 hover:underline dark:text-amber-400">
                                <ExternalLink className="w-4 h-4 shrink-0" /> Astrotalk — Detailed birth chart and daily report.
                              </a>
                              <a href="https://www.rudraastrology.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-amber-600 hover:underline dark:text-amber-400">
                                <ExternalLink className="w-4 h-4 shrink-0" /> Rudra Astrology Center — Specialized Vedic predictions from exact birth details.
                              </a>
                            </CardContent>
                          </Card>
                        </div>

                        {/* Recommendations */}
                        <div className="space-y-4">
                          <h2 className="text-2xl font-serif font-semibold text-amber-200 mb-4">Finance & Grooming</h2>
                          
                          {/* Lend Money */}
                          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl">
                            <CardHeader>
                              <CardTitle className="text-green-900 font-serif flex items-center gap-2">
                                <DollarSign className="w-5 h-5" />
                                Lend Money
                                {getScoreBadge(analysis.recommendations.lendMoney.score)}
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-green-800">Score:</span>
                                <span className={`font-bold ${getScoreColor(analysis.recommendations.lendMoney.score)}`}>
                                  {analysis.recommendations.lendMoney.score}/100
                                </span>
                              </div>
                              <div>
                                <div className="font-semibold text-green-800 mb-1">Best Days:</div>
                                <div className="text-green-700">{analysis.recommendations.lendMoney.bestDays.join(', ')}</div>
                              </div>
                              {analysis.recommendations.lendMoney.avoidDays.length > 0 && (
                                <div>
                                  <div className="font-semibold text-red-700 mb-1">Avoid Days:</div>
                                  <div className="text-red-600">{analysis.recommendations.lendMoney.avoidDays.join(', ')}</div>
                                </div>
                              )}
                              {analysis.recommendations.lendMoney.avoidTimes.length > 0 && (
                                <div>
                                  <div className="font-semibold text-red-700 mb-1">Avoid Times:</div>
                                  <div className="text-red-600">{analysis.recommendations.lendMoney.avoidTimes.join(', ')}</div>
                                </div>
                              )}
                              <div className="bg-white rounded-lg p-3 border border-green-200">
                                <div className="text-sm text-green-800">{analysis.recommendations.lendMoney.personalizedNote}</div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Borrow Money */}
                          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl">
                            <CardHeader>
                              <CardTitle className="text-blue-900 font-serif flex items-center gap-2">
                                <DollarSign className="w-5 h-5" />
                                Borrow Money
                                {getScoreBadge(analysis.recommendations.borrowMoney.score)}
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-blue-800">Score:</span>
                                <span className={`font-bold ${getScoreColor(analysis.recommendations.borrowMoney.score)}`}>
                                  {analysis.recommendations.borrowMoney.score}/100
                                </span>
                              </div>
                              <div>
                                <div className="font-semibold text-blue-800 mb-1">Best Days:</div>
                                <div className="text-blue-700">{analysis.recommendations.borrowMoney.bestDays.join(', ')}</div>
                              </div>
                              {analysis.recommendations.borrowMoney.avoidDays.length > 0 && (
                                <div>
                                  <div className="font-semibold text-red-700 mb-1">Avoid Days:</div>
                                  <div className="text-red-600">{analysis.recommendations.borrowMoney.avoidDays.join(', ')}</div>
                                </div>
                              )}
                              <div className="bg-white rounded-lg p-3 border border-blue-200">
                                <div className="text-sm text-blue-800">{analysis.recommendations.borrowMoney.personalizedNote}</div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Pay Back Debts */}
                          <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 rounded-2xl">
                            <CardHeader>
                              <CardTitle className="text-orange-900 font-serif flex items-center gap-2">
                                <DollarSign className="w-5 h-5" />
                                Pay Back Debts
                                {getScoreBadge(analysis.recommendations.payBackDebts.score)}
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-orange-800">Score:</span>
                                <span className={`font-bold ${getScoreColor(analysis.recommendations.payBackDebts.score)}`}>
                                  {analysis.recommendations.payBackDebts.score}/100
                                </span>
                              </div>
                              <div>
                                <div className="font-semibold text-orange-800 mb-1">Best Days:</div>
                                <div className="text-orange-700">{analysis.recommendations.payBackDebts.bestDays.join(', ')}</div>
                              </div>
                              {analysis.recommendations.payBackDebts.avoidTimes.length > 0 && (
                                <div>
                                  <div className="font-semibold text-green-700 mb-1">Recommended Times:</div>
                                  <div className="text-green-600">{analysis.recommendations.payBackDebts.avoidTimes.join(', ')}</div>
                                </div>
                              )}
                              <div className="bg-white rounded-lg p-3 border border-orange-200">
                                <div className="text-sm text-orange-800">{analysis.recommendations.payBackDebts.personalizedNote}</div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Travel */}
                          <Card className="bg-gradient-to-br from-sky-50 to-indigo-50 border-2 border-sky-200 rounded-2xl dark:from-sky-900/20 dark:to-indigo-900/20 dark:border-sky-700">
                            <CardHeader>
                              <CardTitle className="text-sky-900 dark:text-sky-100 font-serif flex items-center gap-2">
                                <Plane className="w-5 h-5" />
                                Travel
                                {getScoreBadge(analysis.recommendations.travel.score)}
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-sky-800 dark:text-sky-200">Score:</span>
                                <span className={`font-bold ${getScoreColor(analysis.recommendations.travel.score)}`}>
                                  {analysis.recommendations.travel.score}/100
                                </span>
                              </div>
                              <div>
                                <div className="font-semibold text-sky-800 dark:text-sky-200 mb-1">Best Days:</div>
                                <div className="text-sky-700 dark:text-sky-300">{analysis.recommendations.travel.bestDays.join(', ')}</div>
                              </div>
                              {analysis.recommendations.travel.avoidDays.length > 0 && (
                                <div>
                                  <div className="font-semibold text-red-700 dark:text-red-400 mb-1">Avoid Days:</div>
                                  <div className="text-red-600 dark:text-red-300">{analysis.recommendations.travel.avoidDays.join(', ')}</div>
                                </div>
                              )}
                              {analysis.recommendations.travel.avoidTimes.length > 0 && (
                                <div>
                                  <div className="font-semibold text-red-700 dark:text-red-400 mb-1">Avoid Starting Journey During:</div>
                                  <ul className="list-inside list-disc space-y-0.5 text-red-600 dark:text-red-300 text-sm">
                                    {analysis.recommendations.travel.avoidTimes.map((t, i) => (
                                      <li key={i}>{t}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              <div className="bg-white dark:bg-sky-900/20 rounded-lg p-3 border border-sky-200 dark:border-sky-700">
                                <div className="text-sm text-sky-800 dark:text-sky-200">{analysis.recommendations.travel.personalizedNote}</div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Property / construction / moving (Vastu-based) */}
                          {analysis.propertyConstruction != null && (
                            <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl dark:from-amber-900/20 dark:to-yellow-900/20 dark:border-amber-700">
                              <CardHeader>
                                <CardTitle className="text-amber-900 dark:text-amber-100 font-serif flex items-center gap-2">
                                  <Home className="w-5 h-5" />
                                  Property / construction / moving
                                  {getScoreBadge(analysis.propertyConstruction.auspiciousScore)}
                                </CardTitle>
                                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                                  Vastu-based timing for the selected date. Best and avoid activities for construction, moving, or renovations.
                                </p>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-amber-800 dark:text-amber-200">Auspicious score:</span>
                                  <span className={`font-bold ${getScoreColor(analysis.propertyConstruction.auspiciousScore)}`}>
                                    {analysis.propertyConstruction.auspiciousScore}/100
                                  </span>
                                  {analysis.propertyConstruction.isAuspicious ? (
                                    <span className="text-sm text-green-600 dark:text-green-400">— Favorable</span>
                                  ) : (
                                    <span className="text-sm text-amber-600 dark:text-amber-400">— Consider postponing major work</span>
                                  )}
                                </div>
                                {analysis.propertyConstruction.bestActivities.length > 0 && (
                                  <div>
                                    <div className="font-semibold text-amber-800 dark:text-amber-200 mb-1">Best activities:</div>
                                    <ul className="list-inside list-disc space-y-0.5 text-amber-700 dark:text-amber-300 text-sm">
                                      {analysis.propertyConstruction.bestActivities.map((a, i) => (
                                        <li key={i}>{a}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                {analysis.propertyConstruction.avoidActivities.length > 0 && (
                                  <div>
                                    <div className="font-semibold text-red-700 dark:text-red-400 mb-1">Avoid:</div>
                                    <ul className="list-inside list-disc space-y-0.5 text-red-600 dark:text-red-300 text-sm">
                                      {analysis.propertyConstruction.avoidActivities.map((a, i) => (
                                        <li key={i}>{a}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                {analysis.propertyConstruction.recommendations.length > 0 && (
                                  <div>
                                    <div className="font-semibold text-amber-800 dark:text-amber-200 mb-1">Recommendations:</div>
                                    <ul className="list-inside list-disc space-y-0.5 text-amber-700 dark:text-amber-300 text-sm">
                                      {analysis.propertyConstruction.recommendations.slice(0, 4).map((r, i) => (
                                        <li key={i}>{r}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          )}

                          {/* Haircut */}
                          <Card className="bg-gradient-to-br from-pink-50 to-rose-50 border-2 border-pink-200 rounded-2xl">
                            <CardHeader>
                              <CardTitle className="text-pink-900 font-serif flex items-center gap-2">
                                <Scissors className="w-5 h-5" />
                                Haircut
                                {getScoreBadge(analysis.recommendations.haircut.score)}
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-pink-800">Score:</span>
                                <span className={`font-bold ${getScoreColor(analysis.recommendations.haircut.score)}`}>
                                  {analysis.recommendations.haircut.score}/100
                                </span>
                              </div>
                              <div>
                                <div className="font-semibold text-pink-800 mb-1">Best Days:</div>
                                <div className="text-pink-700">{analysis.recommendations.haircut.bestDays.join(', ')}</div>
                              </div>
                              {analysis.recommendations.haircut.avoidDays.length > 0 && (
                                <div>
                                  <div className="font-semibold text-red-700 mb-1">Avoid Days:</div>
                                  <div className="text-red-600">{analysis.recommendations.haircut.avoidDays.join(', ')}</div>
                                </div>
                              )}
                              <div className="bg-white rounded-lg p-3 border border-pink-200">
                                <div className="text-sm text-pink-800">{analysis.recommendations.haircut.personalizedNote}</div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Cut Nails (Vedic) */}
                          <Card className="bg-gradient-to-br from-violet-50 to-purple-50 border-2 border-violet-200 rounded-2xl dark:from-violet-900/20 dark:to-purple-900/20 dark:border-violet-700">
                            <CardHeader>
                              <CardTitle className="text-violet-900 dark:text-violet-100 font-serif flex items-center gap-2">
                                <Scissors className="w-5 h-5" />
                                Cut Nails (Fingers & Toes) — Nail cutting (Vedic)
                                {getScoreBadge(analysis.recommendations.cutNails.score)}
                              </CardTitle>
                              <p className="text-sm text-violet-700 dark:text-violet-300 mt-1">
                                According to traditional Vedic beliefs, the timing of cutting finger or toe nails is believed to impact fortune, wealth, and health. Avoid specific days and after sunset to prevent negative energy and financial loss.
                              </p>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-violet-800 dark:text-violet-200">Score:</span>
                                <span className={`font-bold ${getScoreColor(analysis.recommendations.cutNails.score)}`}>
                                  {analysis.recommendations.cutNails.score}/100
                                </span>
                              </div>
                              <div>
                                <div className="font-semibold text-violet-800 dark:text-violet-200 mb-1">Best Days:</div>
                                <div className="text-violet-700 dark:text-violet-300">{analysis.recommendations.cutNails.bestDays.join(', ')}</div>
                              </div>
                              {analysis.recommendations.cutNails.avoidDays.length > 0 && (
                                <div>
                                  <div className="font-semibold text-red-700 dark:text-red-400 mb-1">Avoid Days:</div>
                                  <div className="text-red-600 dark:text-red-300">{analysis.recommendations.cutNails.avoidDays.join(', ')}</div>
                                </div>
                              )}
                              {analysis.recommendations.cutNails.avoidTimes.length > 0 && (
                                <div>
                                  <div className="font-semibold text-red-700 dark:text-red-400 mb-1">Avoid Times:</div>
                                  <ul className="list-inside list-disc space-y-0.5 text-red-600 dark:text-red-300 text-sm">
                                    {analysis.recommendations.cutNails.avoidTimes.map((t, i) => (
                                      <li key={i}>{t}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              <div>
                                <div className="font-semibold text-violet-800 dark:text-violet-200 mb-1">Best Timing:</div>
                                <div className="text-violet-700 dark:text-violet-300">{NAILS_VEDIC_GUIDE.bestTiming}</div>
                              </div>
                              <div>
                                <div className="font-semibold text-violet-800 dark:text-violet-200 mb-1">Disposal:</div>
                                <div className="text-violet-700 dark:text-violet-300">{NAILS_VEDIC_GUIDE.disposalTip}</div>
                              </div>
                              <div>
                                <div className="font-semibold text-violet-800 dark:text-violet-200 mb-1">Key Takeaways:</div>
                                <ul className="list-inside list-disc space-y-0.5 text-violet-700 dark:text-violet-300 text-sm">
                                  {NAILS_VEDIC_GUIDE.keyTakeaways.map((t, i) => (
                                    <li key={i}>{t}</li>
                                  ))}
                                </ul>
                              </div>
                              {analysis.recommendations.cutNails.tips && analysis.recommendations.cutNails.tips.length > 0 && (
                                <div>
                                  <div className="font-semibold text-violet-800 dark:text-violet-200 mb-1">Tips:</div>
                                  <ul className="list-inside list-disc space-y-0.5 text-violet-700 dark:text-violet-300 text-sm">
                                    {analysis.recommendations.cutNails.tips.map((t, i) => (
                                      <li key={i}>{t}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              <div className="bg-white dark:bg-violet-900/20 rounded-lg p-3 border border-violet-200 dark:border-violet-700">
                                <div className="text-sm text-violet-800 dark:text-violet-200">{analysis.recommendations.cutNails.personalizedNote}</div>
                              </div>
                              <p className="text-xs italic text-violet-600 dark:text-violet-400">
                                {NAILS_VEDIC_GUIDE.disclaimer}
                              </p>
                            </CardContent>
                          </Card>

                          {/* Hair Oil */}
                          <Card className="bg-gradient-to-br from-teal-50 to-cyan-50 border-2 border-teal-200 rounded-2xl">
                            <CardHeader>
                              <CardTitle className="text-teal-900 font-serif flex items-center gap-2">
                                <Droplet className="w-5 h-5" />
                                Apply Hair Oil
                                {getScoreBadge(analysis.recommendations.hairOil.score)}
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-teal-800">Score:</span>
                                <span className={`font-bold ${getScoreColor(analysis.recommendations.hairOil.score)}`}>
                                  {analysis.recommendations.hairOil.score}/100
                                </span>
                              </div>
                              <div>
                                <div className="font-semibold text-teal-800 mb-1">Best Days:</div>
                                <div className="text-teal-700">{analysis.recommendations.hairOil.bestDays.join(', ')}</div>
                              </div>
                              {analysis.recommendations.hairOil.avoidDays.length > 0 && (
                                <div>
                                  <div className="font-semibold text-red-700 mb-1">Avoid Days:</div>
                                  <div className="text-red-600">{analysis.recommendations.hairOil.avoidDays.join(', ')}</div>
                                </div>
                              )}
                              <div className="bg-white rounded-lg p-3 border border-teal-200">
                                <div className="text-sm text-teal-800">{analysis.recommendations.hairOil.personalizedNote}</div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        {/* Disclaimer */}
                        <Card className="bg-slate-800/50 border-2 border-slate-700 rounded-2xl">
                          <CardContent className="p-4">
                            <p className="text-sm text-slate-400 italic">
                              <strong>Disclaimer:</strong> Astrology is a traditional belief system. Recommendations are based on interpretation, not scientific proof. These suggestions are for cultural and traditional guidance only and should not override urgent health, legal, or financial decisions.
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    ) : (
                      <Card className="bg-slate-800/50 border-2 border-slate-700 rounded-2xl">
                        <CardContent className="p-12 text-center">
                          <Calendar className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                          <p className="text-slate-300 mb-4">Select a date and click "Get Recommendations" to see personalized guidance.</p>
                          <Button asChild className="bg-amber-500 hover:bg-amber-600 text-white">
                            <Link href="/profile">Generate your mystical profile</Link>
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>
                </motion.div>
              )}

              {/* Ask the Seer Tab */}
              {activeTab === 'ask-the-seer' && (
                <motion.div
                  key="ask-the-seer"
                  initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                  animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                  exit={prefersReducedMotion ? {} : { opacity: 0, y: -20 }}
                  transition={motionConfig}
                >
                  <TabsContent value="ask-the-seer" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                    <DailyDecisionsSeerChatInterface
                      analysis={analysis}
                      selectedDate={selectedDate}
                      userId={user?.uid}
                      userProfile={userProfile}
                    />
                  </TabsContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Tabs>
          </div>
        </div>
      </div>
    </div>
    </ToolReportGuard>
  )
}
