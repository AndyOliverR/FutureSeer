"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { TrichakraMethodCoachInterface } from "@/components/TrichakraMethodCoachInterface"
import { useTrichakra } from "@/hooks/use-trichakra"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Heart, 
  Brain, 
  Sparkles,
  Zap,
  Clock,
  Info,
  AlertTriangle,
  MessageCircle,
  Users,
} from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TeaserView } from '@/components/report-viral/TeaserView'
import { ShareCard } from '@/components/report-viral/ShareCard'
import { ViralLockOverlay } from '@/components/report-viral/LockedReportView'
import { buildToolTeaser } from '@/lib/report-viral/buildToolTeaser'
import { toolPathForSlug } from '@/lib/report-viral/toolSlugToPath'
import { cn } from '@/lib/utils'
import { useToolReportUnlock } from '@/hooks/useToolReportUnlock'
import { useViralReportBypass } from '@/hooks/useViralReportBypass'

export default function TrichakraMethodPage() {
  const { analysis, isLoading, error, performTrichakraAnalysis } = useTrichakra()
  const [activeTab, setActiveTab] = useState<string>("overview")

  useEffect(() => {
    if (!analysis && !isLoading && !error) {
      performTrichakraAnalysis()
    }
  }, [])

  // Check for reduced motion preference
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  // Tab configuration (Ask the Seer last, like Tarot)
  const tabsConfig = useMemo(() => [
    { value: 'overview', label: 'Overview' },
    { value: 'body', label: 'Body' },
    { value: 'mind', label: 'Mind' },
    { value: 'soul', label: 'Soul' },
    { value: 'ask-the-seer', label: 'Ask the Seer', icon: MessageCircle }
  ], [])

  const viralUnlock = useToolReportUnlock('trichakra')
  const bypassViral = useViralReportBypass()
  const [showShareCard, setShowShareCard] = useState(false)
  const [waitingLite, setWaitingLite] = useState(false)

  const showTrichakraViral = Boolean(analysis) && !bypassViral
  const trichakraTeaser = useMemo(() => buildToolTeaser('trichakra', analysis), [analysis])

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
          text: `${trichakraTeaser.archetypeName}: ${trichakraTeaser.hookLine.slice(0, 120)}…`,
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
  }, [copyLink, viralUnlock, trichakraTeaser.archetypeName, trichakraTeaser.hookLine])

  const continueWithoutSharing = useCallback(() => {
    setWaitingLite(true)
    window.setTimeout(() => {
      viralUnlock.unlockLite()
      setWaitingLite(false)
    }, 4000)
  }, [viralUnlock])

  const trichakraCompareHref = useMemo(
    () => `/tools/${toolPathForSlug('trichakra')}?friend=compare&ref=share`,
    []
  )

  const trichakraLocked =
    showTrichakraViral && viralUnlock.hydrated && !viralUnlock.isUnlocked && !bypassViral

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500/20 text-red-700 border-red-500/50'
      case 'high': return 'bg-orange-500/20 text-orange-700 border-orange-500/50'
      case 'medium': return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/50'
      case 'low': return 'bg-blue-500/20 text-blue-700 border-blue-500/50'
      default: return 'bg-gray-500/20 text-gray-700 border-gray-500/50'
    }
  }

  const getSystemColor = (system: string) => {
    switch (system) {
      case 'astrology': return 'bg-purple-500/20 text-purple-700 border-purple-500/50'
      case 'numerology': return 'bg-blue-500/20 text-blue-700 border-blue-500/50'
      case 'vastu': return 'bg-amber-500/20 text-amber-700 border-amber-500/50'
      case 'lal-kitab': return 'bg-red-500/20 text-red-700 border-red-500/50'
      default: return 'bg-gray-500/20 text-gray-700 border-gray-500/50'
    }
  }

  const getCostColor = (cost?: string) => {
    switch (cost) {
      case 'free': return 'text-green-600'
      case 'low': return 'text-blue-600'
      case 'medium': return 'text-yellow-600'
      case 'high': return 'text-orange-600'
      default: return 'text-gray-600'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-[var(--m3-primary)] border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-[var(--m3-on-surface)] m3-title-medium">Generating your Trichakra analysis...</p>
          <p className="text-[var(--m3-on-surface-variant)] m3-body-small mt-2">Analyzing Astrology, Numerology, Vastu, and Lal Kitab</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-2xl shadow-md max-w-md w-full p-6">
          <div className="flex items-center gap-2 text-red-600 mb-2">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="font-semibold text-lg">Error</h3>
          </div>
          <p className="text-slate-700 mb-4">{error}</p>
          <Button onClick={() => performTrichakraAnalysis()} className="w-full bg-amber-600 hover:bg-amber-700 text-white">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-2xl shadow-md max-w-md w-full p-6">
          <h3 className="font-semibold text-lg text-amber-900 mb-2">Trichakra Method</h3>
          <p className="text-slate-700 mb-4">Complete your profile to generate personalized remedies</p>
          <Button onClick={() => performTrichakraAnalysis()} className="w-full bg-amber-600 hover:bg-amber-700 text-white">
            Generate Analysis
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="starfield-ultra-sharp min-h-screen p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 pt-4"
        >
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-semibold mb-6">
            <span className="text-yellow-400">✨</span>{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600">Trichakra Method</span>
          </h1>
          <p className="text-slate-200 leading-relaxed text-xl font-light max-w-2xl mx-auto">
            Integrated Occult Remedies combining Astrology, Numerology, Vastu, and Lal Kitab
          </p>
        </motion.div>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6 p-4 bg-amber-50/80 border-2 border-amber-300 rounded-2xl"
        >
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-700 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-amber-900 mb-1">Important Disclaimer</h3>
              <p className="text-sm text-amber-800">
                The Trichakra Method remedies are based on traditional beliefs and cultural practices. 
                They are not scientifically validated and should not replace medical advice, diagnosis, or treatment. 
                These remedies are spiritual and cultural practices that may complement but should not substitute 
                professional medical care. Results may vary based on individual circumstances.
              </p>
            </div>
          </div>
        </motion.div>

        {showTrichakraViral && !bypassViral && (
          <div className="space-y-4 mb-6">
            <TeaserView teaser={trichakraTeaser} />
            {showShareCard && (
              <ShareCard
                archetypeName={trichakraTeaser.archetypeName}
                hookLine={trichakraTeaser.hookLine}
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

        {showTrichakraViral && viralUnlock.isUnlocked && !bypassViral && (
          <div className="mb-6 flex justify-center">
            <Link
              href={trichakraCompareHref}
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
            {tabsConfig.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="shrink-0 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 rounded-t-lg rounded-b-none px-4 py-2.5 text-sm font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 border border-transparent data-[state=inactive]:border-slate-600/50 transition-all flex items-center justify-center"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {activeTab === 'ask-the-seer' ? (
            <motion.div
              key="ask-the-seer"
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
              animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
              transition={prefersReducedMotion ? {} : { type: 'spring', stiffness: 300, damping: 30 }}
              className="w-full"
            >
              <TabsContent value="ask-the-seer" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                <div className="h-[800px] min-h-0">
                  <TrichakraMethodCoachInterface trichakraAnalysis={analysis} onRegenerate={performTrichakraAnalysis} />
                </div>
              </TabsContent>
            </motion.div>
          ) : showTrichakraViral && !viralUnlock.hydrated ? (
            <div className="py-12 text-center text-slate-400">Loading report…</div>
          ) : (
            <div className="relative min-h-[320px]">
              {trichakraLocked && (
                <ViralLockOverlay
                  onUnlockClick={handleShareToUnlock}
                  onContinueWithoutSharing={waitingLite ? () => {} : continueWithoutSharing}
                  continueDisabled={waitingLite}
                />
              )}
              <div
                className={cn(
                  trichakraLocked &&
                    'pointer-events-none select-none blur-sm filter transition-[filter] duration-300 [&_*]:pointer-events-none'
                )}
              >
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Heart className="w-5 h-5 text-red-500" />
                  <h3 className="font-semibold text-amber-900 text-lg">Body Level</h3>
                </div>
                <div className="text-3xl font-bold text-red-600 mb-2">
                  {analysis.remedies.body.length}
                </div>
                <p className="text-sm text-slate-700">
                  Physical remedies: gemstones, colors, materials
                </p>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Brain className="w-5 h-5 text-blue-500" />
                  <h3 className="font-semibold text-amber-900 text-lg">Mind Level</h3>
                </div>
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {analysis.remedies.mind.length}
                </div>
                <p className="text-sm text-slate-700">
                  Mental remedies: mantras, meditation, affirmations
                </p>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  <h3 className="font-semibold text-amber-900 text-lg">Soul Level</h3>
                </div>
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {analysis.remedies.soul.length}
                </div>
                <p className="text-sm text-slate-700">
                  Spiritual remedies: rituals, transformation
                </p>
              </div>
            </div>

            {/* Action Plan */}
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 p-6">
              <h3 className="font-semibold text-amber-900 text-lg mb-2">Action Plan</h3>
              <p className="text-slate-600 text-sm mb-4">Prioritized remedies organized by timeline</p>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-900">
                    <Zap className="w-4 h-4 text-red-500" />
                    Immediate ({analysis.actionPlan.immediate.length} remedies)
                  </h4>
                  <div className="space-y-2">
                    {analysis.actionPlan.immediate.slice(0, 3).map((remedy) => (
                      <div key={remedy.id} className="p-3 bg-white/60 rounded-lg border border-amber-200">
                        <div className="flex items-start justify-between mb-1">
                          <span className="font-medium text-slate-800">{remedy.title}</span>
                          <Badge className={getPriorityColor(remedy.priority)}>
                            {remedy.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-700">{remedy.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Body Tab */}
          <TabsContent value="body" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysis.remedies.body.map((remedy) => (
                <div key={remedy.id} className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-amber-900 text-lg">{remedy.title}</h3>
                    <Badge className={getSystemColor(remedy.system)}>
                      {remedy.system}
                    </Badge>
                  </div>
                  <p className="text-slate-700 text-sm mb-4">{remedy.description}</p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(remedy.priority)}>
                        {remedy.priority}
                      </Badge>
                      {remedy.cost && (
                        <span className={`text-sm font-medium ${getCostColor(remedy.cost)}`}>
                          Cost: {remedy.cost}
                        </span>
                      )}
                    </div>
                    {remedy.timing && (
                      <div className="flex items-center gap-2 text-sm text-slate-700">
                        <Clock className="w-4 h-4" />
                        {remedy.timing}
                      </div>
                    )}
                    <div>
                      <h5 className="font-semibold mb-1 text-sm text-amber-900">Instructions:</h5>
                      <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
                        {remedy.instructions.slice(0, 3).map((instruction, idx) => (
                          <li key={idx}>{instruction}</li>
                        ))}
                      </ul>
                    </div>
                    {remedy.benefits && remedy.benefits.length > 0 && (
                      <div>
                        <h5 className="font-semibold mb-1 text-sm text-amber-900">Benefits:</h5>
                        <div className="flex flex-wrap gap-1">
                          {remedy.benefits.slice(0, 3).map((benefit, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs border-amber-300 text-slate-700">
                              {benefit}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Mind Tab */}
          <TabsContent value="mind" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysis.remedies.mind.map((remedy) => (
                <div key={remedy.id} className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-amber-900 text-lg">{remedy.title}</h3>
                    <Badge className={getSystemColor(remedy.system)}>
                      {remedy.system}
                    </Badge>
                  </div>
                  <p className="text-slate-700 text-sm mb-4">{remedy.description}</p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(remedy.priority)}>
                        {remedy.priority}
                      </Badge>
                      {remedy.cost && (
                        <span className={`text-sm font-medium ${getCostColor(remedy.cost)}`}>
                          Cost: {remedy.cost}
                        </span>
                      )}
                    </div>
                    {remedy.timing && (
                      <div className="flex items-center gap-2 text-sm text-slate-700">
                        <Clock className="w-4 h-4" />
                        {remedy.timing}
                      </div>
                    )}
                    <div>
                      <h5 className="font-semibold mb-1 text-sm text-amber-900">Instructions:</h5>
                      <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
                        {remedy.instructions.slice(0, 3).map((instruction, idx) => (
                          <li key={idx}>{instruction}</li>
                        ))}
                      </ul>
                    </div>
                    {remedy.benefits && remedy.benefits.length > 0 && (
                      <div>
                        <h5 className="font-semibold mb-1 text-sm text-amber-900">Benefits:</h5>
                        <div className="flex flex-wrap gap-1">
                          {remedy.benefits.slice(0, 3).map((benefit, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs border-amber-300 text-slate-700">
                              {benefit}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Soul Tab */}
          <TabsContent value="soul" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysis.remedies.soul.map((remedy) => (
                <div key={remedy.id} className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-amber-900 text-lg">{remedy.title}</h3>
                    <Badge className={getSystemColor(remedy.system)}>
                      {remedy.system}
                    </Badge>
                  </div>
                  <p className="text-slate-700 text-sm mb-4">{remedy.description}</p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(remedy.priority)}>
                        {remedy.priority}
                      </Badge>
                      {remedy.cost && (
                        <span className={`text-sm font-medium ${getCostColor(remedy.cost)}`}>
                          Cost: {remedy.cost}
                        </span>
                      )}
                    </div>
                    {remedy.timing && (
                      <div className="flex items-center gap-2 text-sm text-slate-700">
                        <Clock className="w-4 h-4" />
                        {remedy.timing}
                      </div>
                    )}
                    <div>
                      <h5 className="font-semibold mb-1 text-sm text-amber-900">Instructions:</h5>
                      <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
                        {remedy.instructions.slice(0, 3).map((instruction, idx) => (
                          <li key={idx}>{instruction}</li>
                        ))}
                      </ul>
                    </div>
                    {remedy.benefits && remedy.benefits.length > 0 && (
                      <div>
                        <h5 className="font-semibold mb-1 text-sm text-amber-900">Benefits:</h5>
                        <div className="flex flex-wrap gap-1">
                          {remedy.benefits.slice(0, 3).map((benefit, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs border-amber-300 text-slate-700">
                              {benefit}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
              </div>
            </div>
          )}
        </Tabs>
        </div>
      </div>
    </div>
  )
}
