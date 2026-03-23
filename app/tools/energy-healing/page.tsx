"use client"

import { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/use-auth'
import { useToolReport, useComprehensiveMysticalProfile } from '@/hooks/useComprehensiveMysticalProfile'
import { ToolReportGuard } from '@/components/ToolReportGuard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  AlertTriangle,
  Zap,
  Eye,
  Heart,
  Gem,
  Activity,
  MessageCircle,
  Users,
} from 'lucide-react'
import {
  ChakraAnalysis,
  AuraReading,
  ReikiAnalysis,
  CrystalRecommendation,
  EnergyBalanceAnalysis,
  energyHealingImageAnalyzer
} from '@/lib/energyHealing/energyHealingImageAnalyzer'
import { ChakraVisualization } from '@/components/energy-healing/ChakraVisualization'
import { AuraVisualization } from '@/components/energy-healing/AuraVisualization'
import { CrystalRecommendations } from '@/components/energy-healing/CrystalRecommendations'
import { EnergyHealingCoach } from '@/components/energy-healing/EnergyHealingCoach'
import { ToolIntroductionTab } from '@/components/ToolIntroductionTab'
import { useToolReportUnlock } from '@/hooks/useToolReportUnlock'
import { useViralReportBypass } from '@/hooks/useViralReportBypass'
import { TeaserView } from '@/components/report-viral/TeaserView'
import { ShareCard } from '@/components/report-viral/ShareCard'
import { ViralLockOverlay } from '@/components/report-viral/LockedReportView'
import { buildToolTeaser } from '@/lib/report-viral/buildToolTeaser'
import { toolPathForSlug } from '@/lib/report-viral/toolSlugToPath'
import { cn } from '@/lib/utils'

interface AllAnalyses {
  chakra: ChakraAnalysis | null
  aura: AuraReading | null
  reiki: ReikiAnalysis | null
  crystal: CrystalRecommendation | null
  energy: EnergyBalanceAnalysis | null
}

function getOverallBalance(raw: Record<string, unknown>): number | undefined {
  const ob = raw.overallBalance ?? raw.overall_balance
  if (typeof ob === 'number') return ob
  const over = raw.OVERALL
  if (typeof over === 'number') return over
  if (over && typeof over === 'object' && !Array.isArray(over)) return (over as Record<string, unknown>).overallBalance as number | undefined
  return undefined
}

/** Normalize raw crystal API response so formatter gets crystals array and expected keys. */
function normalizeCrystalRaw(raw: Record<string, unknown>): Record<string, unknown> {
  const crystals = raw.crystals ?? raw.CRYSTALS ?? raw.crystal_list
  return {
    ...raw,
    crystals: Array.isArray(crystals) ? crystals : (raw.crystals && typeof raw.crystals === 'object' ? [raw.crystals] : []),
    interpretation: raw.interpretation ?? raw.analysis,
    recommendations: raw.recommendations ?? raw.RECOMMENDATIONS ?? raw.recommendation
  }
}

/** Normalize raw energy API response so formatter gets camelCase keys. */
function normalizeEnergyRaw(raw: Record<string, unknown>): Record<string, unknown> {
  return {
    overallBalance: raw.overallBalance ?? raw.overall_balance ?? raw.OVERALL,
    chakraBalance: raw.chakraBalance ?? raw.chakra_balance ?? raw.chakra_balance_score,
    auraHealth: raw.auraHealth ?? raw.aura_health ?? raw.aura_health_score,
    energyFlow: raw.energyFlow ?? raw.energy_flow ?? raw.flow,
    blockages: raw.blockages ?? raw.BLOCKAGES ?? raw.blockage ?? [],
    recommendations: raw.recommendations ?? raw.RECOMMENDATIONS ?? [],
    techniques: raw.techniques ?? raw.TECHNIQUES ?? raw.practices ?? []
  }
}

/** True if raw looks like a chakra-only response (orchestrator stores this at top level). Used for hasRealReport. */
function looksLikeChakraData(raw: Record<string, unknown>): boolean {
  if (getOverallBalance(raw) !== undefined) return true
  if (Array.isArray(raw.chakras) && raw.chakras.length > 0) return true
  if (raw.chakras && typeof raw.chakras === 'object' && !Array.isArray(raw.chakras)) return true
  if (Array.isArray(raw.CHAKRAS) && raw.CHAKRAS.length > 0) return true
  if (Array.isArray(raw.chakra_analysis) && raw.chakra_analysis.length > 0) return true
  return false
}

/** True if raw can be used as ChakraAnalysis (ChakraVisualization expects chakras array and overallBalance). */
function isChakraShape(raw: Record<string, unknown>): boolean {
  return Array.isArray(raw.chakras) && raw.chakras.length > 0 && getOverallBalance(raw) !== undefined
}

const CHAKRA_NAMES = ['Root Chakra', 'Sacral Chakra', 'Solar Plexus Chakra', 'Heart Chakra', 'Throat Chakra', 'Third Eye Chakra', 'Crown Chakra']

/** Build ChakraAnalysis from raw API-style response (array chakras or object chakras). */
function normalizeToChakraAnalysis(raw: Record<string, unknown>): ChakraAnalysis | null {
  const ob = getOverallBalance(raw)
  const arr = (raw.chakras ?? raw.CHAKRAS ?? raw.chakra_analysis) as Array<{ name?: string; balance?: number; status?: string; interpretation?: string; color?: string }> | Record<string, unknown> | undefined
  if (Array.isArray(arr) && arr.length > 0) {
    const chakras = arr.slice(0, 7).map((c, i) => {
      const rawName = c && typeof c === 'object' ? (c as { name?: unknown }).name : undefined
      const name = typeof rawName === 'string' ? rawName : (CHAKRA_NAMES[i] ?? `Chakra ${i + 1}`)
      return {
      name,
      balance: typeof (c as { balance?: number }).balance === 'number' ? (c as { balance: number }).balance : 50,
      status: ((c as { status?: string }).status as ChakraAnalysis['chakras'][0]['status']) ?? 'balanced',
      color: (c as { color?: string }).color ?? '#888',
      interpretation: (c as { interpretation?: string }).interpretation ?? '',
      recommendations: [] as string[]
    }
    })
    const overallBalance = typeof ob === 'number' ? ob : Math.round(chakras.reduce((s, c) => s + c.balance, 0) / chakras.length)
    return {
      chakras,
      overallBalance,
      primaryIssues: chakras.filter(c => c.status !== 'balanced').map(c => c.name),
      recommendations: Array.isArray(raw.recommendations) ? (raw.recommendations as string[]) : []
    }
  }
  if (arr && typeof arr === 'object' && !Array.isArray(arr)) {
    try {
      return energyHealingImageAnalyzer.formatChakraAnalysis(raw as { chakras?: Record<string, { balance?: number; status?: string; interpretation?: string }>; overallBalance?: number; recommendations?: string[] })
    } catch {
      return null
    }
  }
  if (typeof ob === 'number') {
    const balance = Math.max(0, Math.min(100, ob))
    return {
      chakras: CHAKRA_NAMES.map((name, i) => ({
        name,
        balance,
        status: 'balanced' as const,
        color: '#888',
        interpretation: '',
        recommendations: [] as string[]
      })),
      overallBalance: ob,
      primaryIssues: [],
      recommendations: Array.isArray(raw.recommendations) ? (raw.recommendations as string[]) : []
    }
  }
  return null
}

export default function EnergyHealingPage() {
  const { user, userProfile } = useAuth()
  const [activeTab, setActiveTab] = useState<'introduction' | 'chakra' | 'aura' | 'reiki' | 'crystal' | 'energy' | 'ask-the-seer'>('introduction')
  const { report: pipelineReport, loading, error } = useToolReport('energyHealing')
  const { profile } = useComprehensiveMysticalProfile()
  const reportFromProfile = useMemo(() => {
    const p = profile as Record<string, unknown> | null
    if (!p || typeof p !== 'object') return undefined
    const r =
      p.energyHealing ??
      p['Energy & Healing'] ??
      (p.toolReports as Record<string, { data?: unknown }> | undefined)?.energyHealing?.data ??
      (p.toolReports as Record<string, { data?: unknown }> | undefined)?.['Energy & Healing']?.data
    return r != null ? r : undefined
  }, [profile])

  const effectiveReport = pipelineReport ?? reportFromProfile

  /** True if the user has already generated a mystical profile (returning user). Don't show "generate again" in that case. */
  const hasAnyGeneratedProfile = useMemo(() => {
    const p = profile as Record<string, unknown> | null
    if (!p || typeof p !== 'object') return false
    return (
      p.vedic != null ||
      p.interpretations != null ||
      (p.metadata as { generatedAt?: string } | undefined)?.generatedAt != null
    )
  }, [profile])

  const hasRealReport = useMemo(() => {
    if (!effectiveReport || typeof effectiveReport !== 'object') return false
    const raw = effectiveReport as Record<string, unknown>
    if (raw.placeholder === true) return false
    const hasChakra = !!(raw.chakra || (looksLikeChakraData(raw) && raw))
    const hasAura = !!raw.aura
    const hasReiki = !!raw.reiki
    const hasCrystal = !!raw.crystal
    const hasEnergy = !!raw.energy
    if (hasChakra || hasAura || hasReiki || hasCrystal || hasEnergy) return true
    const keys = Object.keys(raw).filter((k) => k !== 'placeholder' && k !== 'reason')
    return keys.length > 0
  }, [effectiveReport])

  const viralUnlock = useToolReportUnlock('energyHealing')
  const bypassViral = useViralReportBypass()
  const [showShareCard, setShowShareCard] = useState(false)
  const [waitingLite, setWaitingLite] = useState(false)
  const showEnergyHealingViral = hasRealReport && !bypassViral
  const ehTeaser = useMemo(() => buildToolTeaser('energyHealing', effectiveReport), [effectiveReport])

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
          text: `${ehTeaser.archetypeName}: ${ehTeaser.hookLine.slice(0, 120)}…`,
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
  }, [copyLink, viralUnlock, ehTeaser.archetypeName, ehTeaser.hookLine])

  const continueWithoutSharing = useCallback(() => {
    setWaitingLite(true)
    window.setTimeout(() => {
      viralUnlock.unlockLite()
      setWaitingLite(false)
    }, 4000)
  }, [viralUnlock])

  const ehCompareHref = useMemo(
    () => `/tools/${toolPathForSlug('energyHealing')}?friend=compare&ref=share`,
    []
  )

  const ehLocked =
    showEnergyHealingViral && viralUnlock.hydrated && !viralUnlock.isUnlocked && !bypassViral

  const allAnalyses = useMemo((): AllAnalyses => {
    let raw = effectiveReport as Record<string, unknown> | undefined
    if (!raw || typeof raw !== 'object') return { chakra: null, aura: null, reiki: null, crystal: null, energy: null }
    if (raw.data && typeof raw.data === 'object' && !Array.isArray(raw.data)) {
      raw = raw.data as Record<string, unknown>
    }
    let chakra: ChakraAnalysis | null = null
    // Prefer normalizing from raw.chakra (orchestrator stores { chakra, aura, ... } from API)
    if (raw.chakra && typeof raw.chakra === 'object') {
      chakra = normalizeToChakraAnalysis(raw.chakra as Record<string, unknown>) ?? null
    }
    if (!chakra && looksLikeChakraData(raw)) {
      chakra = normalizeToChakraAnalysis(raw) ?? null
    }
    if (!chakra && isChakraShape(raw)) {
      chakra = raw as unknown as ChakraAnalysis
    }
    if (!chakra && raw.chakra && typeof raw.chakra === 'object' && isChakraShape(raw.chakra as Record<string, unknown>)) {
      chakra = raw.chakra as ChakraAnalysis
    }
    let aura: AuraReading | null = (raw.aura as AuraReading) ?? null
    if (!aura && raw.aura && typeof raw.aura === 'object') {
      try {
        aura = energyHealingImageAnalyzer.formatAuraReading(raw.aura as Parameters<typeof energyHealingImageAnalyzer.formatAuraReading>[0])
      } catch {
        aura = null
      }
    }
    let reiki: ReikiAnalysis | null = (raw.reiki as ReikiAnalysis) ?? null
    if (!reiki && raw.reiki && typeof raw.reiki === 'object') {
      try {
        reiki = energyHealingImageAnalyzer.formatReikiAnalysis(raw.reiki as Parameters<typeof energyHealingImageAnalyzer.formatReikiAnalysis>[0])
      } catch {
        reiki = null
      }
    }
    let crystal: CrystalRecommendation | null = null
    if (raw.crystal && typeof raw.crystal === 'object') {
      const crystalRaw = normalizeCrystalRaw(raw.crystal as Record<string, unknown>)
      try {
        crystal = energyHealingImageAnalyzer.formatCrystalAnalysis(crystalRaw as Parameters<typeof energyHealingImageAnalyzer.formatCrystalAnalysis>[0])
      } catch {
        if (Array.isArray((raw.crystal as Record<string, unknown>).crystals)) {
          crystal = raw.crystal as CrystalRecommendation
        }
      }
    }
    let energy: EnergyBalanceAnalysis | null = null
    if (raw.energy && typeof raw.energy === 'object') {
      const energyRaw = normalizeEnergyRaw(raw.energy as Record<string, unknown>)
      try {
        energy = energyHealingImageAnalyzer.formatEnergyBalance(energyRaw as Parameters<typeof energyHealingImageAnalyzer.formatEnergyBalance>[0])
      } catch {
        energy = null
      }
      if (!energy) energy = (raw.energy as EnergyBalanceAnalysis) ?? null
    }
    return {
      chakra: chakra ?? null,
      aura: aura ?? null,
      reiki: reiki ?? null,
      crystal: crystal ?? null,
      energy: energy ?? null
    }
  }, [effectiveReport])

  const healingMethods = [
    { 
      value: 'chakra' as const, 
      label: 'Chakra Analysis', 
      icon: <Zap className="h-5 w-5" />,
      description: 'Assess and balance your seven energy centers'
    },
    { 
      value: 'aura' as const, 
      label: 'Aura Reading', 
      icon: <Eye className="h-5 w-5" />,
      description: 'Read your energy field and spiritual vibrations'
    },
    { 
      value: 'reiki' as const, 
      label: 'Reiki', 
      icon: <Heart className="h-5 w-5" />,
      description: 'Universal life force energy healing'
    },
    { 
      value: 'crystal' as const, 
      label: 'Crystal Healing', 
      icon: <Gem className="h-5 w-5" />,
      description: 'Crystal and gemstone therapy'
    },
    { 
      value: 'energy' as const, 
      label: 'Energy Healing', 
      icon: <Activity className="h-5 w-5" />,
      description: 'General energy balancing and healing'
    }
  ]

  return (
    <ToolReportGuard loading={loading} error={error ?? null} toolLabel="Energy & Healing">
    <div className="relative min-h-screen starfield-ultra-sharp">
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 pt-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-semibold mb-6">
                <span className="text-yellow-400">✨</span>{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600">Energy & Healing</span>
              </h1>
              <p className="text-slate-200 leading-relaxed text-xl font-light">
                Holistic energy work: Chakra Analysis, Aura Reading, Reiki, Crystal Healing, and Energy Balancing
              </p>
            </motion.div>
          </div>

          {/* Error Display */}
          {error && (
            <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md mb-8">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-amber-700">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="text-amber-900">{error}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* When no report: only show "generate" CTA if user has not yet generated a profile (new user). Returning users with existing profile see tabs with empty states instead. */}
          {!hasRealReport && !loading && !hasAnyGeneratedProfile && (
            <Card className="bg-amber-500/10 border-amber-500/30 rounded-2xl shadow-md mb-8">
              <CardContent className="p-6 text-center">
                <p className="text-slate-300 mb-2">Your Energy & Healing report is generated from your mystical profile.</p>
                <p className="text-slate-400 text-sm">
                  <Link href="/profile" className="text-amber-400 hover:text-amber-300 underline">Go to Profile</Link>
                  {' '}and click &quot;Generate my mystical profile&quot; to create your report; then return here to view it.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Report from mystical profile, or returning user with profile: show tabs (with empty states per section if no energy data) */}
          {(hasRealReport || hasAnyGeneratedProfile) && (
          <>
            {showEnergyHealingViral && !bypassViral && (
              <div className="mb-6 space-y-4">
                <TeaserView teaser={ehTeaser} />
                {showShareCard && (
                  <ShareCard
                    archetypeName={ehTeaser.archetypeName}
                    hookLine={ehTeaser.hookLine}
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

            {showEnergyHealingViral && viralUnlock.isUnlocked && !bypassViral && (
              <div className="mb-6 flex justify-center">
                <Link
                  href={ehCompareHref}
                  className="inline-flex items-center gap-2 rounded-full border border-violet-500/40 bg-violet-950/40 px-4 py-2 text-sm font-medium text-violet-100 hover:bg-violet-900/50"
                >
                  <Users className="h-4 w-4" />
                  Compare with a friend
                </Link>
              </div>
            )}

          <div className="rounded-2xl border border-amber-500/30 bg-slate-900/80 overflow-hidden">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="w-full min-w-0">
              <TabsList className="flex w-full flex-nowrap overflow-x-auto gap-1 sm:gap-2 p-2 sm:p-3 bg-slate-800/50 border-b border-amber-500/20 rounded-none h-auto min-h-0 justify-start [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-amber-500/30">
                <TabsTrigger 
                  value="ask-the-seer" 
                  className="shrink-0 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 rounded-t-lg rounded-b-none px-4 py-2.5 text-sm font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 border border-transparent data-[state=inactive]:border-slate-600/50 transition-all inline-flex items-center gap-2"
                >
                  <MessageCircle className="h-4 w-4 hidden sm:inline" />
                  Ask the Seer
                </TabsTrigger>
                <TabsTrigger 
                  value="introduction" 
                  className="shrink-0 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 rounded-t-lg rounded-b-none px-4 py-2.5 text-sm font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 border border-transparent data-[state=inactive]:border-slate-600/50 transition-all"
                >
                  Introduction
                </TabsTrigger>
                {healingMethods.map((method) => (
                  <TabsTrigger 
                    key={method.value}
                    value={method.value} 
                    className="shrink-0 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 rounded-t-lg rounded-b-none px-4 py-2.5 text-sm font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 border border-transparent data-[state=inactive]:border-slate-600/50 transition-all"
                  >
                    {method.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {activeTab === 'ask-the-seer' ? (
              <TabsContent value="ask-the-seer" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                <EnergyHealingCoach 
                  analysis={{
                    method: 'chakra',
                    timestamp: new Date(),
                    chakraAnalysis: allAnalyses.chakra || undefined,
                    auraReading: allAnalyses.aura || undefined,
                    reikiAnalysis: allAnalyses.reiki || undefined,
                    crystalRecommendation: allAnalyses.crystal || undefined,
                    energyBalance: allAnalyses.energy || undefined,
                    overallInsights: [],
                    recommendations: []
                  }} 
                />
              </TabsContent>
              ) : showEnergyHealingViral && !viralUnlock.hydrated ? (
              <div className="py-12 text-center text-slate-400">Loading report…</div>
              ) : (
              <div className="relative min-h-[320px]">
                {ehLocked && (
                  <ViralLockOverlay
                    onUnlockClick={handleShareToUnlock}
                    onContinueWithoutSharing={waitingLite ? () => {} : continueWithoutSharing}
                    continueDisabled={waitingLite}
                  />
                )}
                <div
                  className={cn(
                    ehLocked &&
                      'pointer-events-none select-none blur-sm filter transition-[filter] duration-300 [&_*]:pointer-events-none'
                  )}
                >
              {/* Introduction Tab */}
              <TabsContent value="introduction" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                <ToolIntroductionTab toolSlug="energy-healing" />
              </TabsContent>

              {/* Chakra Analysis Tab */}
              <TabsContent value="chakra" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                {allAnalyses.chakra ? (
                  <ChakraVisualization analysis={allAnalyses.chakra} />
                ) : (
                  <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md">
                    <CardContent className="p-8 text-center">
                      <Zap className="w-12 h-12 text-amber-600 mx-auto mb-4" />
                      <p className="text-amber-950 font-medium">No data for this section in your profile.</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Aura Reading Tab */}
              <TabsContent value="aura" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                {allAnalyses.aura ? (
                  <AuraVisualization reading={allAnalyses.aura} />
                ) : (
                  <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md">
                    <CardContent className="p-8 text-center">
                      <Eye className="w-12 h-12 text-amber-600 mx-auto mb-4" />
                      <p className="text-amber-950 font-medium">No data for this section in your profile.</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Reiki Tab */}
              <TabsContent value="reiki" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                {allAnalyses.reiki ? (
                  <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300">
                    <CardHeader>
                      <CardTitle className="text-amber-950 font-semibold flex items-center gap-2">
                        <Heart className="w-5 h-5 text-amber-700" />
                        Reiki Energy Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-amber-100/50 rounded-xl border-2 border-amber-300">
                          <p className="text-amber-950 text-sm font-medium mb-1">Energy Level</p>
                          <p className="text-amber-950 font-semibold capitalize">{allAnalyses.reiki.energyLevel}</p>
                        </div>
                        <div className="p-4 bg-amber-100/50 rounded-xl border-2 border-amber-300">
                          <p className="text-amber-950 text-sm font-medium mb-1">Blockages</p>
                          <p className="text-amber-950 font-semibold">{allAnalyses.reiki.blockages.length}</p>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-amber-950 font-semibold mb-2">Recommended Symbols</h3>
                        <div className="flex flex-wrap gap-2">
                          {allAnalyses.reiki.recommendedSymbols.map((symbol, index) => (
                            <Badge key={index} variant="outline" className="border-amber-600 text-amber-950 bg-amber-100 font-medium">
                              {symbol}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-amber-950 font-semibold mb-2">Treatment Areas</h3>
                        <div className="flex flex-wrap gap-2">
                          {allAnalyses.reiki.treatmentAreas.map((area, index) => (
                            <Badge key={index} variant="outline" className="border-amber-600 text-amber-950 bg-amber-100 font-medium">
                              {area}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-amber-950 font-semibold mb-2">Interpretation</h3>
                        <p className="text-amber-950 font-medium">{allAnalyses.reiki.interpretation}</p>
                      </div>
                      {allAnalyses.reiki.recommendations && allAnalyses.reiki.recommendations.length > 0 && (
                        <div>
                          <h3 className="text-amber-950 font-semibold mb-2">Recommendations</h3>
                          <ul className="space-y-2">
                            {allAnalyses.reiki.recommendations.map((rec, index) => (
                              <li key={index} className="text-amber-950 font-medium flex items-start gap-2">
                                <span className="text-amber-800 mt-1">•</span>
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md">
                    <CardContent className="p-8 text-center">
                      <Heart className="w-12 h-12 text-amber-600 mx-auto mb-4" />
                      <p className="text-amber-950 font-medium">No data for this section in your profile.</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Crystal Healing Tab */}
              <TabsContent value="crystal" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                {allAnalyses.crystal ? (
                  <CrystalRecommendations recommendation={allAnalyses.crystal} />
                ) : (
                  <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md">
                    <CardContent className="p-8 text-center">
                      <Gem className="w-12 h-12 text-amber-600 mx-auto mb-4" />
                      <p className="text-amber-950 font-medium">No data for this section in your profile.</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Energy Balance Tab */}
              <TabsContent value="energy" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                {allAnalyses.energy ? (
                  <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300">
                    <CardHeader>
                      <CardTitle className="text-amber-950 font-semibold flex items-center gap-2">
                        <Activity className="w-5 h-5 text-amber-700" />
                        Energy Balance Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-amber-100/50 rounded-xl border-2 border-amber-300">
                          <p className="text-amber-950 text-sm font-medium mb-1">Overall Balance</p>
                          <p className="text-2xl font-bold text-amber-950">{typeof allAnalyses.energy.overallBalance === 'number' ? allAnalyses.energy.overallBalance : '—'}%</p>
                        </div>
                        <div className="p-4 bg-amber-100/50 rounded-xl border-2 border-amber-300">
                          <p className="text-amber-950 text-sm font-medium mb-1">Chakra Balance</p>
                          <p className="text-2xl font-bold text-amber-950">{typeof allAnalyses.energy.chakraBalance === 'number' ? allAnalyses.energy.chakraBalance : '—'}%</p>
                        </div>
                        <div className="p-4 bg-amber-100/50 rounded-xl border-2 border-amber-300">
                          <p className="text-amber-950 text-sm font-medium mb-1">Aura Health</p>
                          <p className="text-2xl font-bold text-amber-950">{typeof allAnalyses.energy.auraHealth === 'number' ? allAnalyses.energy.auraHealth : '—'}%</p>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-amber-950 font-semibold mb-2">Energy Flow</h3>
                        <Badge variant="outline" className="border-amber-600 text-amber-950 bg-amber-100 font-medium capitalize">
                          {(typeof allAnalyses.energy.energyFlow === 'string' ? allAnalyses.energy.energyFlow : '—').replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      {allAnalyses.energy.blockages && allAnalyses.energy.blockages.length > 0 && (
                        <div>
                          <h3 className="text-amber-950 font-semibold mb-2">Energy Blockages</h3>
                          <div className="flex flex-wrap gap-2">
                            {allAnalyses.energy.blockages.map((blockage, index) => (
                              <Badge key={index} variant="outline" className="border-amber-600 text-amber-950 bg-amber-100 font-medium">
                                {blockage}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {allAnalyses.energy.techniques && allAnalyses.energy.techniques.length > 0 && (
                        <div>
                          <h3 className="text-amber-950 font-semibold mb-2">Recommended Techniques</h3>
                          <ul className="space-y-2">
                            {allAnalyses.energy.techniques.map((technique, index) => (
                              <li key={index} className="text-amber-950 font-medium flex items-start gap-2">
                                <span className="text-amber-800 mt-1">•</span>
                                <span>{technique}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {allAnalyses.energy.recommendations && allAnalyses.energy.recommendations.length > 0 && (
                        <div>
                          <h3 className="text-amber-950 font-semibold mb-2">Recommendations</h3>
                          <ul className="space-y-2">
                            {allAnalyses.energy.recommendations.map((rec, index) => (
                              <li key={index} className="text-amber-950 font-medium flex items-start gap-2">
                                <span className="text-amber-800 mt-1">•</span>
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md">
                    <CardContent className="p-8 text-center">
                      <Activity className="w-12 h-12 text-amber-600 mx-auto mb-4" />
                      <p className="text-amber-950 font-medium">No data for this section in your profile.</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
                </div>
              </div>
              )}
            </Tabs>
            </div>
          </>
          )}
        </div>
      </div>
    </div>
    </ToolReportGuard>
  )
}