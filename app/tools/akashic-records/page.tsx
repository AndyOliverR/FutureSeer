"use client"

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { useToolReport } from '@/hooks/useComprehensiveMysticalProfile'
import { ToolReportGuard } from '@/components/ToolReportGuard'
import {
  Sparkles,
  BookOpen,
  User,
  Target,
  Heart,
  Brain,
  MessageCircle,
  Loader2,
  ArrowLeft,
  Star,
  Calendar,
  MapPin,
  Clock,
  Info,
  AlertCircle,
  CheckCircle2,
  Eye,
  History,
  Zap,
  Users,
} from 'lucide-react'
import { useToolReportUnlock } from '@/hooks/useToolReportUnlock'
import { useViralReportBypass } from '@/hooks/useViralReportBypass'
import { TeaserView } from '@/components/report-viral/TeaserView'
import { ShareCard } from '@/components/report-viral/ShareCard'
import { ViralLockOverlay } from '@/components/report-viral/LockedReportView'
import { buildToolTeaser } from '@/lib/report-viral/buildToolTeaser'
import { toolPathForSlug } from '@/lib/report-viral/toolSlugToPath'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DevotionistStyleCard } from '@/components/western/DevotionistStyleCard'
import { AkashicSeerChatInterface } from '@/components/akashic/AkashicSeerChatInterface'
import { AkashicReading } from '@/lib/akashicRecordsIntelligence'

const tabs = [
  { id: 'overview', label: 'Overview', icon: Eye },
  { id: 'access', label: 'Access Records', icon: Sparkles },
  { id: 'soul-journey', label: 'Soul Journey', icon: Heart },
  { id: 'past-lives', label: 'Past Lives', icon: History },
  { id: 'karmic', label: 'Karmic Patterns', icon: Target },
  { id: 'purpose', label: 'Life Purpose', icon: Star },
  { id: 'ask-seer', label: 'Ask The Seer', icon: MessageCircle }
]

export default function AkashicRecordsPage() {
  const { user, userProfile } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'overview' | 'access' | 'soul-journey' | 'past-lives' | 'karmic' | 'purpose' | 'ask-seer'>('overview')
  const [profileComplete, setProfileComplete] = useState(false)
  const { report: pipelineReport, loading: isLoading, error } = useToolReport('akashicRecords')
  const reading = useMemo((): AkashicReading | null => {
    if (!pipelineReport || typeof pipelineReport !== 'object') return null
    const r = pipelineReport as Record<string, unknown>
    const data = (r.data ?? r) as Record<string, unknown> | undefined
    if (!data || typeof data !== 'object') return null
    const hasReadingContent =
      data.soulJourney ?? data.pastLives ?? data.karmicPatterns ?? data.lifePurpose ?? data.guidance ?? data.personalMessage
    if (!hasReadingContent) return null
    if (r.placeholder === true && !data.soulJourney && !data.guidance && !data.personalMessage) return null
    return data as unknown as AkashicReading
  }, [pipelineReport])

  const viralUnlock = useToolReportUnlock('akashicRecords')
  const bypassViral = useViralReportBypass()
  const [showShareCard, setShowShareCard] = useState(false)
  const [waitingLite, setWaitingLite] = useState(false)

  const showAkashicViral = Boolean(reading) && !bypassViral
  const akashicTeaser = useMemo(() => buildToolTeaser('akashicRecords', reading), [reading])

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
          text: `${akashicTeaser.archetypeName}: ${akashicTeaser.hookLine.slice(0, 120)}…`,
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
  }, [copyLink, viralUnlock, akashicTeaser.archetypeName, akashicTeaser.hookLine])

  const continueWithoutSharing = useCallback(() => {
    setWaitingLite(true)
    window.setTimeout(() => {
      viralUnlock.unlockLite()
      setWaitingLite(false)
    }, 4000)
  }, [viralUnlock])

  const akashicCompareHref = useMemo(
    () => `/tools/${toolPathForSlug('akashicRecords')}?friend=compare&ref=share`,
    []
  )

  const akashicLocked =
    showAkashicViral && viralUnlock.hydrated && !viralUnlock.isUnlocked && !bypassViral

  useEffect(() => {
    if (userProfile) setProfileComplete(!!(userProfile.birthDate && userProfile.birthTime && userProfile.birthPlace))
  }, [userProfile])

  const missingFields = useMemo(() => {
    if (!userProfile) return ['birthDate', 'birthTime', 'birthPlace']
    const missing: string[] = []
    if (!userProfile.birthDate) missing.push('Birth Date')
    if (!userProfile.birthTime) missing.push('Birth Time')
    if (!userProfile.birthPlace) missing.push('Birth Place')
    return missing
  }, [userProfile])

  return (
    <ToolReportGuard loading={isLoading} error={error ?? null} toolLabel="Akashic Records">
    <div className="starfield-ultra-sharp min-h-screen overflow-hidden">
      <div className="relative z-10 container mx-auto px-4 pt-4 pb-8">
        {/* Header - centred */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="text-5xl mb-4"
          >
            📚
          </motion.div>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif bg-gradient-to-b from-amber-200 via-yellow-400 to-amber-600 bg-clip-text text-transparent mb-4">
            Akashic Records
          </h1>
          <p className="text-slate-300 mb-6">
            Access the universal library of souls - past, present, and future
          </p>
          <p className="text-slate-400 text-sm italic max-w-3xl mx-auto">
            The Akashic Records (from Sanskrit "Akasha" meaning "ether" or "sky") are believed to be a universal library containing all events, thoughts, words, emotions, and intentions that have ever occurred, are occurring, or will occur. Each soul has its own record within this cosmic library.
          </p>
        </motion.div>

        {/* Profile Completeness Alert */}
        {!profileComplete && userProfile && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <Alert className="bg-amber-50 border-2 border-amber-300">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-900">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <strong>Complete your profile</strong> for the most detailed Akashic Records reading.
                    {missingFields.length > 0 && (
                      <span className="ml-2 text-slate-900">Missing: {missingFields.join(', ')}</span>
                    )}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => router.push('/profile')}
                    className="bg-amber-600 hover:bg-amber-500 text-white"
                  >
                    Complete Profile
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {showAkashicViral && !bypassViral && (
          <div className="mb-6 space-y-4">
            <TeaserView teaser={akashicTeaser} />
            {showShareCard && (
              <ShareCard
                archetypeName={akashicTeaser.archetypeName}
                hookLine={akashicTeaser.hookLine}
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

        {showAkashicViral && viralUnlock.isUnlocked && !bypassViral && (
          <div className="mb-4 flex justify-center">
            <Link
              href={akashicCompareHref}
              className="inline-flex items-center gap-2 rounded-full border border-violet-500/40 bg-violet-950/40 px-4 py-2 text-sm font-medium text-violet-100 hover:bg-violet-900/50"
            >
              <Users className="h-4 w-4" />
              Compare with a friend
            </Link>
          </div>
        )}

        {/* Main Content */}
        <div className="rounded-2xl border border-amber-500/30 bg-slate-900/80 overflow-hidden">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full min-w-0">
          <TabsList className="flex w-full flex-nowrap overflow-x-auto gap-1 sm:gap-2 p-2 sm:p-3 bg-slate-800/50 border-b border-amber-500/20 rounded-none h-auto min-h-0 justify-start [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-amber-500/30">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="shrink-0 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 rounded-t-lg rounded-b-none px-4 py-2.5 text-sm font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 transition-all flex items-center justify-center gap-1.5 border border-transparent data-[state=inactive]:border-slate-600/50"
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {tab.label}
                </TabsTrigger>
              )
            })}
          </TabsList>

          {showAkashicViral && !viralUnlock.hydrated ? (
            <div className="py-12 text-center text-slate-400">Loading report…</div>
          ) : (
            <div className="relative min-h-[320px]">
              {akashicLocked && (
                <ViralLockOverlay
                  onUnlockClick={handleShareToUnlock}
                  onContinueWithoutSharing={waitingLite ? () => {} : continueWithoutSharing}
                  continueDisabled={waitingLite}
                />
              )}
              <div
                className={cn(
                  akashicLocked &&
                    'pointer-events-none select-none blur-sm filter transition-[filter] duration-300 [&_*]:pointer-events-none'
                )}
              >
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
            <DevotionistStyleCard
              icon={<BookOpen className="w-6 h-6" />}
              title="What Are the Akashic Records?"
              summary={'The Akashic Records are believed to be a compendium of all universal events, thoughts, words, emotions, and intentions that have ever occurred, are occurring, or will occur. Often compared to a cosmic library or the "Book of Life," these records are stored in a non-physical plane of existence called akasha (Sanskrit for "sky" or "ether").'}
              variant="callout"
              colorScheme="amber"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="rounded-xl p-4 border-2 border-amber-200 bg-amber-50/90 shadow-sm">
                  <h3 className="text-slate-900 font-semibold mb-2 flex items-center">
                    <Star className="w-4 h-4 mr-2" />
                    Universal Record
                  </h3>
                  <p className="text-sm text-slate-800">
                    The records hold not just human experiences but also the history of all life forms and entities throughout time.
                  </p>
                </div>
                <div className="rounded-xl p-4 border-2 border-amber-200 bg-amber-50/90 shadow-sm">
                  <h3 className="text-slate-900 font-semibold mb-2 flex items-center">
                    <Zap className="w-4 h-4 mr-2" />
                    Energetic & Non-Physical
                  </h3>
                  <p className="text-sm text-slate-800">
                    They exist as an energetic archive, accessible through vibrational frequencies rather than physical means.
                  </p>
                </div>
                <div className="rounded-xl p-4 border-2 border-amber-200 bg-amber-50/90 shadow-sm">
                  <h3 className="text-slate-900 font-semibold mb-2 flex items-center">
                    <Brain className="w-4 h-4 mr-2" />
                    Non-Linear Time
                  </h3>
                  <p className="text-sm text-slate-800">
                    Because the records exist in a higher dimension, they are not bound by linear time, making information from any point accessible.
                  </p>
                </div>
                <div className="rounded-xl p-4 border-2 border-amber-200 bg-amber-50/90 shadow-sm">
                  <h3 className="text-slate-900 font-semibold mb-2 flex items-center">
                    <Target className="w-4 h-4 mr-2" />
                    Personal & Universal
                  </h3>
                  <p className="text-sm text-slate-800">
                    You can access your own soul's records, or access the universal records for guidance and understanding.
                  </p>
                </div>
              </div>
              <div className="mt-6 p-4 rounded-xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-yellow-50">
                <h3 className="text-slate-900 font-semibold mb-2">Purpose of Access</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-slate-800">
                  <li>Gaining guidance for life decisions</li>
                  <li>Self-understanding and personal growth</li>
                  <li>Healing past-life issues and traumas</li>
                  <li>Gaining insight into your soul's purpose and life plan</li>
                  <li>Understanding karmic patterns and relationships</li>
                  <li>Exploring past lives and their influence on the present</li>
                </ul>
              </div>
            </DevotionistStyleCard>
          </TabsContent>

          {/* Access Records Tab */}
          <TabsContent value="access" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
            <DevotionistStyleCard
              icon={<Sparkles className="w-6 h-6" />}
              title="Access Your Akashic Records"
              variant="callout"
              colorScheme="amber"
            >
              {isLoading ? (
                <div className="text-center py-12">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 360] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="text-7xl mb-6"
                  >
                    📚
                  </motion.div>
                  <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }}>
                    <h3 className="text-2xl font-serif text-slate-900 mb-4">Accessing the Akashic Records...</h3>
                    <p className="text-slate-800 mb-6">The Records are revealing your soul's journey, past lives, and karmic patterns.</p>
                    <Loader2 className="w-8 h-8 animate-spin text-amber-600 mx-auto" />
                  </motion.div>
                </div>
              ) : !reading ? (
                <div className="space-y-6">
                  <div className="text-center py-8">
                    <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 3, repeat: Infinity }} className="text-6xl mb-4">
                      📚
                    </motion.div>
                    <h3 className="text-2xl font-serif text-slate-900 mb-4">
                      {profileComplete ? 'Ready to Access Your Records?' : 'Complete Your Profile First'}
                    </h3>
                    <p className="text-slate-800 max-w-2xl mx-auto mb-6">
                      The Akashic Records will reveal insights about your soul's journey, past lives, karmic patterns, and life purpose.
                      {!profileComplete && (
                        <span className="block mt-2 text-amber-600">Complete your birth information for the most detailed reading.</span>
                      )}
                      {profileComplete && (
                        <span className="block mt-2 text-green-600">Complete your profile and generate your mystical profile once from your Profile page to see your Akashic reading here.</span>
                      )}
                    </p>
                  </div>
                  {profileComplete && userProfile && (
                    <div className="rounded-xl p-4 border-2 border-green-300 bg-green-50/90">
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <span className="text-green-800 font-semibold">Profile Complete</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-slate-800">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-amber-600" />
                          <span>Birth Date: {userProfile.birthDate}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-amber-600" />
                          <span>Birth Time: {userProfile.birthTime}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-amber-600" />
                          <span>Birth Place: {userProfile.birthPlace}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <Button asChild className="w-full bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white text-lg py-6" size="lg">
                    <Link href="/profile">
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generate your mystical profile
                    </Link>
                  </Button>
                  {error && (
                    <Alert className="bg-red-50 border-2 border-red-300">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800">{error}</AlertDescription>
                    </Alert>
                  )}
                  {!user && (
                    <Alert className="bg-amber-50 border-2 border-amber-300">
                      <Info className="h-4 w-4 text-amber-600" />
                      <AlertDescription className="text-slate-900">Please log in to access the Akashic Records.</AlertDescription>
                    </Alert>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center py-4 rounded-xl border-2 border-green-300 bg-gradient-to-r from-green-50 to-emerald-50">
                    <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <h3 className="text-xl font-semibold text-amber-900 mb-2">Records Accessed Successfully</h3>
                    <p className="text-slate-800 text-sm">Generated on {new Date(reading.generatedAt).toLocaleString()}</p>
                  </div>
                  <Button
                    onClick={() => setActiveTab('soul-journey')}
                    className="w-full bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white"
                  >
                    View Your Reading
                  </Button>
                </div>
              )}
            </DevotionistStyleCard>
          </TabsContent>

          {/* Soul Journey Tab */}
          <TabsContent value="soul-journey" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
            {reading ? (
              <DevotionistStyleCard
                icon={<Heart className="w-6 h-6" />}
                title="Your Soul's Journey"
                summary={reading.soulJourney.overview}
                variant="callout"
                colorScheme="pink"
              >
                <div className="mt-4">
                  <h3 className="text-slate-900 font-semibold mb-3 flex items-center">
                    <Star className="w-5 h-5 mr-2" />
                    Current Stage: {reading.soulJourney.currentStage}
                  </h3>
                </div>
                <div className="mt-6">
                  <h3 className="text-slate-900 font-semibold mb-3 flex items-center">
                    <Zap className="w-5 h-5 mr-2" />
                    Soul Evolution
                  </h3>
                  <div className="space-y-2">
                    {reading.soulJourney.evolution.map((stage, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-3 p-3 rounded-xl border-2 border-amber-200 bg-amber-50/90"
                      >
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-200 flex items-center justify-center text-slate-900 font-semibold text-sm">
                          {index + 1}
                        </div>
                        <p className="text-slate-800 flex-1">{stage}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
                {reading.soulJourney.milestones.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-slate-900 font-semibold mb-3 flex items-center">
                      <Target className="w-5 h-5 mr-2" />
                      Soul Milestones
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {reading.soulJourney.milestones.map((milestone, index) => (
                        <div key={index} className="p-3 rounded-xl border-2 border-amber-200 bg-amber-50/90">
                          <p className="text-slate-800 text-sm">{milestone}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="mt-6">
                  <h3 className="text-slate-900 font-semibold mb-3 flex items-center">
                    <ArrowLeft className="w-5 h-5 mr-2 rotate-[-90deg]" />
                    Next Steps on Your Journey
                  </h3>
                  <div className="space-y-2">
                    {reading.soulJourney.nextSteps.map((step, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-3 p-3 rounded-xl border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50"
                      >
                        <CheckCircle2 className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <p className="text-slate-800 flex-1">{step}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </DevotionistStyleCard>
            ) : (
              <DevotionistStyleCard
                icon={<Heart className="w-6 h-6" />}
                title="Your Soul's Journey"
                summary="No reading available yet. Access your Akashic Records to view your soul's journey, evolution, and next steps."
                variant="callout"
                colorScheme="amber"
              >
                <Button
                  onClick={() => setActiveTab('access')}
                  className="w-full mt-4 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white"
                >
                  Access Your Records
                </Button>
              </DevotionistStyleCard>
            )}
          </TabsContent>

          {/* Past Lives Tab */}
          <TabsContent value="past-lives" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
            {reading ? (
              <DevotionistStyleCard
                icon={<History className="w-6 h-6" />}
                title="Past Lives Exploration"
                variant="callout"
                colorScheme="purple"
              >
                <div className="space-y-6 mt-4">
                  {reading.pastLives.map((life, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="rounded-xl p-6 border-2 border-purple-300 bg-purple-100/95"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-slate-900 mb-2">Life #{index + 1}</h3>
                          <div className="flex flex-wrap gap-2">
                            <Badge className="bg-purple-700 text-white border-purple-800 font-medium shadow-sm">
                              <Calendar className="w-3 h-3 mr-1" />
                              {life.era}
                            </Badge>
                            <Badge className="bg-purple-700 text-white border-purple-800 font-medium shadow-sm">
                              <MapPin className="w-3 h-3 mr-1" />
                              {life.location}
                            </Badge>
                            <Badge className="bg-purple-700 text-white border-purple-800 font-medium shadow-sm">
                              <User className="w-3 h-3 mr-1" />
                              {life.role}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-slate-900 font-semibold mb-2">Lessons Learned</h4>
                          <ul className="list-disc list-inside space-y-1 text-slate-800">
                            {life.lessons.map((lesson, i) => (
                              <li key={i}>{lesson}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-slate-900 font-semibold mb-2">Connection to Current Life</h4>
                          <p className="text-slate-800">{life.connections}</p>
                        </div>
                        <div>
                          <h4 className="text-slate-900 font-semibold mb-2">Significance</h4>
                          <p className="text-slate-800">{life.significance}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </DevotionistStyleCard>
            ) : (
              <DevotionistStyleCard
                icon={<History className="w-6 h-6" />}
                title="Past Lives Exploration"
                summary="No reading available yet. Access your Akashic Records to explore your past lives."
                variant="callout"
                colorScheme="amber"
              >
                <Button
                  onClick={() => setActiveTab('access')}
                  className="w-full mt-4 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white"
                >
                  Access Your Records
                </Button>
              </DevotionistStyleCard>
            )}
          </TabsContent>

          {/* Karmic Patterns Tab */}
          <TabsContent value="karmic" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
            {reading ? (
              <DevotionistStyleCard
                icon={<Target className="w-6 h-6" />}
                title="Karmic Patterns"
                variant="callout"
                colorScheme="green"
              >
                <div className="space-y-6 mt-4">
                  <div className="rounded-xl p-4 border-2 border-amber-200 bg-amber-50/90">
                    <h3 className="text-slate-900 font-semibold mb-2">Overall Karmic Balance</h3>
                    <p className="text-slate-800">{reading.karmicPatterns.overallBalance}</p>
                  </div>
                  <div>
                    <h3 className="text-slate-900 font-semibold mb-4 text-lg">Active Patterns</h3>
                    <div className="space-y-4">
                      {reading.karmicPatterns.patterns.map((pattern, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="rounded-xl p-5 border-2 border-green-200 bg-green-50/90"
                        >
                          <h4 className="text-xl font-semibold text-slate-900 mb-3">{pattern.type}</h4>
                          <div className="space-y-3 text-slate-800">
                            <div>
                              <span className="text-slate-900 font-medium">Description: </span>
                              <span>{pattern.description}</span>
                            </div>
                            <div>
                              <span className="text-slate-900 font-medium">Origin: </span>
                              <span>{pattern.origin}</span>
                            </div>
                            <div>
                              <span className="text-slate-900 font-medium">Current Manifestation: </span>
                              <span>{pattern.currentManifestation}</span>
                            </div>
                            <div className="mt-3 p-3 rounded-xl border-2 border-amber-300 bg-amber-50/90">
                              <span className="text-slate-900 font-medium">Resolution: </span>
                              <span>{pattern.resolution}</span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                  {reading.karmicPatterns.debts.length > 0 && (
                    <div>
                      <h3 className="text-slate-900 font-semibold mb-3">Karmic Debts</h3>
                      <div className="space-y-2">
                        {reading.karmicPatterns.debts.map((debt, index) => (
                          <div key={index} className="p-3 rounded-xl border-2 border-red-300 bg-red-50 text-slate-800">
                            {debt}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {reading.karmicPatterns.credits.length > 0 && (
                    <div>
                      <h3 className="text-slate-900 font-semibold mb-3">Karmic Credits</h3>
                      <div className="space-y-2">
                        {reading.karmicPatterns.credits.map((credit, index) => (
                          <div key={index} className="p-3 rounded-xl border-2 border-green-300 bg-green-50 text-slate-800">
                            {credit}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </DevotionistStyleCard>
            ) : (
              <DevotionistStyleCard
                icon={<Target className="w-6 h-6" />}
                title="Karmic Patterns"
                summary="No reading available yet. Access your Akashic Records to explore your karmic patterns."
                variant="callout"
                colorScheme="amber"
              >
                <Button
                  onClick={() => setActiveTab('access')}
                  className="w-full mt-4 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white"
                >
                  Access Your Records
                </Button>
              </DevotionistStyleCard>
            )}
          </TabsContent>

          {/* Life Purpose Tab */}
          <TabsContent value="purpose" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
            {reading ? (
              <DevotionistStyleCard
                icon={<Star className="w-6 h-6" />}
                title="Your Life Purpose"
                variant="callout"
                colorScheme="amber"
              >
                <div className="space-y-6 mt-4">
                  <div>
                    <h3 className="text-slate-900 font-semibold mb-3 text-xl">Soul's Mission</h3>
                    <p className="text-slate-800 leading-relaxed text-lg">{reading.lifePurpose.mission}</p>
                  </div>
                  <div>
                    <h3 className="text-slate-900 font-semibold mb-3 text-xl flex items-center">
                      <Sparkles className="w-5 h-5 mr-2" />
                      Your Unique Gifts
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {reading.lifePurpose.gifts.map((gift, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-4 rounded-xl border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50 flex items-center gap-3"
                        >
                          <Star className="w-5 h-5 text-amber-600 flex-shrink-0" />
                          <span className="text-slate-800">{gift}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-slate-900 font-semibold mb-3 text-xl">Challenges for Growth</h3>
                    <div className="space-y-2">
                      {reading.lifePurpose.challenges.map((challenge, index) => (
                        <div key={index} className="p-3 rounded-xl border-2 border-amber-200 bg-amber-50/90 text-slate-800">
                          {challenge}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-slate-900 font-semibold mb-3 text-xl">Expression of Purpose</h3>
                    <p className="text-slate-800 leading-relaxed">{reading.lifePurpose.expression}</p>
                  </div>
                  <div>
                    <h3 className="text-slate-900 font-semibold mb-3 text-xl">Ways to Align</h3>
                    <div className="space-y-2">
                      {reading.lifePurpose.alignment.map((way, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start gap-3 p-3 rounded-xl border-2 border-amber-200 bg-amber-50/90"
                        >
                          <Target className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                          <span className="text-slate-800">{way}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </DevotionistStyleCard>
            ) : (
              <DevotionistStyleCard
                icon={<Star className="w-6 h-6" />}
                title="Your Life Purpose"
                summary="No reading available yet. Access your Akashic Records to discover your life purpose."
                variant="callout"
                colorScheme="amber"
              >
                <Button
                  onClick={() => setActiveTab('access')}
                  className="w-full mt-4 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white"
                >
                  Access Your Records
                </Button>
              </DevotionistStyleCard>
            )}
          </TabsContent>

              </div>
            </div>
          )}

          {/* Ask The Seer Tab */}
          <TabsContent value="ask-seer" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
            {reading ? (
              <AkashicSeerChatInterface reading={reading} userProfile={userProfile} />
            ) : (
              <div className="text-center py-12 rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 shadow-lg">
                <MessageCircle className="w-12 h-12 text-amber-600 mx-auto mb-4" />
                <p className="text-slate-800 mb-4">Generate your mystical profile once from your Profile page to access your Akashic Records.</p>
                <Button asChild className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl">
                  <Link href="/profile">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate your mystical profile
                  </Link>
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
        </div>

        {/* Personal Message Card - Always visible when reading exists */}
        {reading && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
            <DevotionistStyleCard
              icon={<Sparkles className="w-5 h-5" />}
              title="A Message from the Records"
              summary={reading.personalMessage}
              variant="callout"
              colorScheme="amber"
            />
          </motion.div>
        )}
      </div>
    </div>
    </ToolReportGuard>
  )
}

