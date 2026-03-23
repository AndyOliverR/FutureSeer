"use client"

import { useState, useMemo, useCallback } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { useToolReport } from "@/hooks/useComprehensiveMysticalProfile"
import { ToolReportGuard } from "@/components/ToolReportGuard"
import { 
  Sparkles,
  User,
  Target,
  MessageCircle,
  BookOpen,
  Zap,
  Heart,
  Brain,
  Info,
  Loader2,
  Star,
  Users,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import HumanDesignSeerChatInterface from "@/components/HumanDesignSeerChatInterface"
import { useToolReportUnlock } from "@/hooks/useToolReportUnlock"
import { useViralReportBypass } from "@/hooks/useViralReportBypass"
import { TeaserView } from "@/components/report-viral/TeaserView"
import { ShareCard } from "@/components/report-viral/ShareCard"
import { ViralLockOverlay } from "@/components/report-viral/LockedReportView"
import { buildToolTeaser } from "@/lib/report-viral/buildToolTeaser"
import { toolPathForSlug } from "@/lib/report-viral/toolSlugToPath"
import { cn } from "@/lib/utils"

const tabs = [
  { id: 'ask-seer', label: 'Ask The Seer', icon: MessageCircle },
  { id: 'overview', label: 'Overview', icon: Sparkles },
  { id: 'bodygraph', label: 'BodyGraph', icon: Target },
  { id: 'centers', label: 'Centers', icon: Brain },
  { id: 'gates', label: 'Gates & Channels', icon: Zap },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'cross', label: 'Incarnation Cross', icon: Star },
  { id: 'report', label: 'Full Report', icon: BookOpen },
]

interface HumanDesignChart {
  type: {
    id: string;
    name: string;
    strategy: string;
    description: string;
    notSelfTheme: string;
  };
  strategy: string;
  authority: {
    id: string;
    name: string;
    description: string;
  };
  profile: {
    id: string;
    name: string;
    description: string;
    role: string;
  };
  centers: {
    defined: string[];
    undefined: string[];
    details: Record<string, any>;
  };
  gates: Array<{
    planet: string;
    gate: number;
    line: number;
    longitude: number;
    center: string;
  }>;
  channels: Array<{
    id: string;
    name: string;
    gates: [number, number];
    centers: [string, string];
    description: string;
  }>;
  incarnationCross: {
    sunGate: number;
    earthGate: number;
    name: string;
    description: string;
  };
  definition: {
    type: string;
    description: string;
  };
}

interface HumanDesignReport {
  overview: {
    summary: string;
    keyInsights: string[];
    personalMessage: string;
  };
  type: {
    description: string;
    strategy: string;
    notSelfTheme: string;
    practicalGuidance: string[];
  };
  authority: {
    description: string;
    decisionMaking: string;
    practicalTips: string[];
  };
  profile: {
    description: string;
    lifeRole: string;
    strengths: string[];
    challenges: string[];
  };
  centers: {
    defined: Array<{
      name: string;
      description: string;
      gifts: string[];
      challenges: string[];
    }>;
    undefined: Array<{
      name: string;
      description: string;
      wisdom: string[];
      conditioning: string[];
    }>;
  };
  gates: {
    overview: string;
    keyGates: Array<{
      gate: number;
      name: string;
      description: string;
      personalMeaning: string;
    }>;
  };
  channels: {
    overview: string;
    activeChannels: Array<{
      name: string;
      description: string;
      gifts: string[];
      expression: string;
    }>;
  };
  incarnationCross: {
    description: string;
    lifePurpose: string;
    expression: string[];
  };
  relationships: {
    overview: string;
    compatibility: string;
    advice: string[];
  };
  career: {
    overview: string;
    suitablePaths: string[];
    successFactors: string[];
  };
  personalGrowth: {
    overview: string;
    recommendations: string[];
    practices: string[];
  };
}

export default function HumanDesignPage() {
  const { user, userProfile } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const { report: pipelineReport, loading: isLoading, error } = useToolReport('humanDesign')
  const chart = useMemo(() => (pipelineReport as Record<string, unknown> | undefined)?.chart as HumanDesignChart | undefined, [pipelineReport])
  const report = useMemo(() => (pipelineReport as Record<string, unknown> | undefined)?.report as HumanDesignReport | undefined, [pipelineReport])
  const hasReport = !!chart && !!report

  const viralUnlock = useToolReportUnlock('humanDesign')
  const bypassViral = useViralReportBypass()
  const [showShareCard, setShowShareCard] = useState(false)
  const [waitingLite, setWaitingLite] = useState(false)

  const showHumanDesignViral = hasReport && !bypassViral
  const hdTeaser = useMemo(() => buildToolTeaser('humanDesign', pipelineReport), [pipelineReport])

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
          text: `${hdTeaser.archetypeName}: ${hdTeaser.hookLine.slice(0, 120)}…`,
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
  }, [copyLink, viralUnlock, hdTeaser.archetypeName, hdTeaser.hookLine])

  const continueWithoutSharing = useCallback(() => {
    setWaitingLite(true)
    window.setTimeout(() => {
      viralUnlock.unlockLite()
      setWaitingLite(false)
    }, 4000)
  }, [viralUnlock])

  const hdCompareHref = useMemo(
    () => `/tools/${toolPathForSlug('humanDesign')}?friend=compare&ref=share`,
    []
  )

  const hdLocked =
    showHumanDesignViral && viralUnlock.hydrated && !viralUnlock.isUnlocked && !bypassViral

  if (!user) {
    return (
      <div className="starfield-ultra-sharp min-h-screen flex items-center justify-center p-4">
        <Card className="border-2 border-amber-300 hover:border-amber-400 shadow-lg rounded-3xl transition-all duration-300 overflow-hidden max-w-md">
          <div className="h-1 bg-amber-400" />
          <CardContent className="bg-gradient-to-br from-amber-50 to-yellow-50 p-6 text-center">
            <p className="text-slate-800 mb-4">Please sign in to access Human Design analysis.</p>
            <Button onClick={() => router.push('/auth')} className="bg-gradient-to-r from-amber-600 to-yellow-500">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const hasCompleteProfile = userProfile?.birthDate && userProfile?.birthTime && userProfile?.birthPlace

  return (
    <ToolReportGuard loading={isLoading} error={error ?? null} toolLabel="Human Design">
    <div className="starfield-ultra-sharp min-h-screen overflow-hidden">
      <div className="p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8 pt-4"
          >
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-semibold mb-6">
              <span className="text-yellow-400">🧬</span>{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600">Human Design</span>
            </h1>
            <p className="text-slate-200 leading-relaxed text-xl font-light">Modern synthesis of astrology, I Ching, Kabbalah, and chakras</p>

            <div className="flex items-center justify-center gap-4 mb-6 mt-6">
              <Badge variant="default" className="bg-amber-500/20 text-amber-400 border-amber-500/50">
                Premium
              </Badge>
              <Badge variant="outline" className="text-slate-300 border-slate-600">
                Modern Synthesis
              </Badge>
            </div>

            {!hasReport && !isLoading && (
              <div className="mt-6">
                <p className="text-slate-300 mb-4">Generate your mystical profile to unlock your Human Design report.</p>
                <Button asChild size="lg" className="bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-700 hover:to-yellow-600 text-white">
                  <Link href="/profile">Generate your mystical profile</Link>
                </Button>
              </div>
            )}

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-20">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="text-6xl mb-4"
              >
                🧬
              </motion.div>
              <p className="text-white/80">Calculating your Human Design chart...</p>
            </div>
          )}
          </motion.div>

          {/* Error Alert */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Alert className="bg-red-500/20 border-red-500/50 text-white">
                <Info className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
                {error.includes("complete your profile") && (
                  <Button
                    onClick={() => router.push('/profile')}
                    className="mt-4 bg-gradient-to-r from-amber-600 to-yellow-500"
                  >
                    Complete Profile
                  </Button>
                )}
              </Alert>
            </motion.div>
          )}

          {/* Main Content */}
          {!isLoading && hasReport ? (
            <>
            {showHumanDesignViral && !bypassViral && (
              <div className="mb-6 space-y-4">
                <TeaserView teaser={hdTeaser} />
                {showShareCard && (
                  <ShareCard
                    archetypeName={hdTeaser.archetypeName}
                    hookLine={hdTeaser.hookLine}
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

            {showHumanDesignViral && viralUnlock.isUnlocked && !bypassViral && (
              <div className="mb-6 flex justify-center">
                <Link
                  href={hdCompareHref}
                  className="inline-flex items-center gap-2 rounded-full border border-violet-500/40 bg-violet-950/40 px-4 py-2 text-sm font-medium text-violet-100 hover:bg-violet-900/50"
                >
                  <Users className="h-4 w-4" />
                  Compare with a friend
                </Link>
              </div>
            )}

            <div className="rounded-2xl border border-amber-500/30 bg-slate-900/80 overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full min-w-0">
              <TabsList className="flex w-full flex-nowrap overflow-x-auto gap-1 sm:gap-2 p-2 sm:p-3 bg-slate-800/50 border-b border-amber-500/20 rounded-none h-auto min-h-0 justify-start [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-amber-500/30">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className="shrink-0 rounded-t-lg rounded-b-none px-4 py-2.5 text-sm font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 border border-transparent data-[state=inactive]:border-slate-600/50 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 transition-all flex items-center justify-center gap-2"
                    >
                      <Icon className="w-4 h-4 hidden lg:inline" />
                      <span className="hidden lg:inline">{tab.label}</span>
                      <span className="lg:hidden">{tab.label.split(' ')[0]}</span>
                    </TabsTrigger>
                  )
                })}
              </TabsList>

              {activeTab === 'ask-seer' ? (
              <TabsContent value="ask-seer" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                <div className="h-[800px] min-h-0">
                  <HumanDesignSeerChatInterface
                    userId={user?.uid ?? ''}
                    userProfile={userProfile}
                    humanDesignChart={chart}
                    sessionId={`human_design_${Date.now()}`}
                  />
                </div>
              </TabsContent>
              ) : showHumanDesignViral && !viralUnlock.hydrated ? (
              <div className="py-12 text-center text-slate-400">Loading report…</div>
              ) : (
              <div className="relative min-h-[320px]">
                {hdLocked && (
                  <ViralLockOverlay
                    onUnlockClick={handleShareToUnlock}
                    onContinueWithoutSharing={waitingLite ? () => {} : continueWithoutSharing}
                    continueDisabled={waitingLite}
                  />
                )}
                <div
                  className={cn(
                    hdLocked &&
                      'pointer-events-none select-none blur-sm filter transition-[filter] duration-300 [&_*]:pointer-events-none'
                  )}
                >
              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                <Card className="border-2 border-amber-300 hover:border-amber-400 shadow-lg rounded-3xl transition-all duration-300 overflow-hidden">
                  <div className="h-1 bg-amber-400" />
                  <CardHeader className="bg-gradient-to-r from-amber-100 to-yellow-100">
                    <CardTitle className="text-amber-900 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-700" />
                      Your Human Design Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="bg-gradient-to-br from-amber-50 to-yellow-50 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-amber-700 font-semibold mb-2">Type</h3>
                          <p className="text-2xl font-bold text-amber-900 mb-2">{chart.type.name}</p>
                          <p className="text-slate-800 text-sm">{chart.type.description}</p>
                        </div>
                        <div>
                          <h3 className="text-amber-700 font-semibold mb-2">Strategy</h3>
                          <p className="text-xl font-semibold text-amber-900 mb-2">{chart.strategy}</p>
                          <p className="text-slate-800 text-sm">{report.type.description}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-amber-700 font-semibold mb-2">Authority</h3>
                          <p className="text-xl font-semibold text-amber-900 mb-2">{chart.authority.name}</p>
                          <p className="text-slate-800 text-sm">{chart.authority.description}</p>
                        </div>
                        <div>
                          <h3 className="text-amber-700 font-semibold mb-2">Profile</h3>
                          <p className="text-xl font-semibold text-amber-900 mb-2">{chart.profile.name}</p>
                          <p className="text-slate-800 text-sm">{chart.profile.description}</p>
                        </div>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-amber-300">
                      <h3 className="text-amber-700 font-semibold mb-3">Key Insights</h3>
                      <ul className="space-y-2">
                        {report.overview.keyInsights.map((insight, index) => (
                          <li key={index} className="flex items-start gap-2 text-slate-800">
                            <Star className="w-4 h-4 text-amber-700 mt-1 flex-shrink-0" />
                            <span>{insight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="pt-4 border-t border-amber-300">
                      <p className="text-slate-800 leading-relaxed">{report.overview.personalMessage}</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* BodyGraph Tab */}
              <TabsContent value="bodygraph" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                <Card className="border-2 border-amber-300 hover:border-amber-400 shadow-lg rounded-3xl transition-all duration-300 overflow-hidden">
                  <div className="h-1 bg-amber-400" />
                  <CardHeader className="bg-gradient-to-r from-amber-100 to-yellow-100">
                    <CardTitle className="text-amber-900 flex items-center gap-2">
                      <Target className="w-5 h-5 text-amber-700" />
                      Your BodyGraph
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="bg-gradient-to-br from-amber-50 to-yellow-50">
                    <div className="text-center py-12">
                      <p className="text-slate-800 mb-4">BodyGraph visualization coming soon</p>
                      <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-amber-700">{chart.centers.defined.length}</div>
                          <div className="text-sm text-slate-700">Defined Centers</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-amber-700">{chart.centers.undefined.length}</div>
                          <div className="text-sm text-slate-700">Undefined Centers</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-amber-700">{chart.channels.length}</div>
                          <div className="text-sm text-slate-700">Active Channels</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Centers Tab */}
              <TabsContent value="centers" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border-2 border-amber-300 hover:border-amber-400 shadow-lg rounded-3xl transition-all duration-300 overflow-hidden">
                    <div className="h-1 bg-amber-400" />
                    <CardHeader className="bg-gradient-to-r from-amber-100 to-yellow-100">
                      <CardTitle className="text-amber-900 flex items-center gap-2">
                        <Brain className="w-5 h-5 text-amber-700" />
                        Defined Centers ({chart.centers.defined.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="bg-gradient-to-br from-amber-50 to-yellow-50 space-y-4">
                      {report.centers.defined.map((center, index) => (
                        <div key={index} className="p-4 bg-amber-100/50 rounded-xl border border-amber-300/50">
                          <h4 className="text-amber-800 font-semibold mb-2">{center.name}</h4>
                          <p className="text-slate-800 text-sm mb-3">{center.description}</p>
                          <div className="space-y-2">
                            <div>
                              <p className="text-xs text-amber-700 font-semibold mb-1">Gifts:</p>
                              <ul className="text-xs text-slate-800 space-y-1">
                                {center.gifts.map((gift, i) => (
                                  <li key={i}>• {gift}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-amber-300 hover:border-amber-400 shadow-lg rounded-3xl transition-all duration-300 overflow-hidden">
                    <div className="h-1 bg-amber-400" />
                    <CardHeader className="bg-gradient-to-r from-amber-100 to-yellow-100">
                      <CardTitle className="text-amber-900 flex items-center gap-2">
                        <Brain className="w-5 h-5 text-amber-700" />
                        Undefined Centers ({chart.centers.undefined.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="bg-gradient-to-br from-amber-50 to-yellow-50 space-y-4">
                      {report.centers.undefined.map((center, index) => (
                        <div key={index} className="p-4 bg-amber-50/50 rounded-xl border border-amber-200/50">
                          <h4 className="text-amber-800 font-semibold mb-2">{center.name}</h4>
                          <p className="text-slate-700 text-sm mb-3">{center.description}</p>
                          <div className="space-y-2">
                            <div>
                              <p className="text-xs text-amber-700 font-semibold mb-1">Wisdom:</p>
                              <ul className="text-xs text-slate-800 space-y-1">
                                {center.wisdom.map((w, i) => (
                                  <li key={i}>• {w}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Gates & Channels Tab */}
              <TabsContent value="gates" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                <Card className="border-2 border-amber-300 hover:border-amber-400 shadow-lg rounded-3xl transition-all duration-300 overflow-hidden">
                  <div className="h-1 bg-amber-400" />
                  <CardHeader className="bg-gradient-to-r from-amber-100 to-yellow-100">
                    <CardTitle className="text-amber-900 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-amber-700" />
                      Active Gates & Channels
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="bg-gradient-to-br from-amber-50 to-yellow-50 space-y-6">
                    <div>
                      <h3 className="text-amber-700 font-semibold mb-3">Active Channels ({chart.channels.length})</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {report.channels.activeChannels.map((channel, index) => (
                          <div key={index} className="p-4 bg-amber-100/50 rounded-xl border border-amber-300/50">
                            <h4 className="text-amber-800 font-semibold mb-2">{channel.name}</h4>
                            <p className="text-slate-800 text-sm mb-3">{channel.description}</p>
                            <div>
                              <p className="text-xs text-amber-700 font-semibold mb-1">Gifts:</p>
                              <ul className="text-xs text-slate-800 space-y-1">
                                {channel.gifts.map((gift, i) => (
                                  <li key={i}>• {gift}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-amber-700 font-semibold mb-3">Key Gates</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {report.gates.keyGates.map((gate, index) => (
                          <div key={index} className="p-4 bg-amber-50/50 rounded-xl border border-amber-200/50">
                            <h4 className="text-amber-900 font-semibold mb-2">Gate {gate.gate}: {gate.name}</h4>
                            <p className="text-slate-800 text-sm mb-2">{gate.description}</p>
                            <p className="text-slate-700 text-xs">{gate.personalMeaning}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Profile Tab */}
              <TabsContent value="profile" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                <Card className="border-2 border-amber-300 hover:border-amber-400 shadow-lg rounded-3xl transition-all duration-300 overflow-hidden">
                  <div className="h-1 bg-amber-400" />
                  <CardHeader className="bg-gradient-to-r from-amber-100 to-yellow-100">
                    <CardTitle className="text-amber-900 flex items-center gap-2">
                      <User className="w-5 h-5 text-amber-700" />
                      Your Profile: {chart.profile.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="bg-gradient-to-br from-amber-50 to-yellow-50 space-y-6">
                    <div>
                      <h3 className="text-amber-700 font-semibold mb-3">Life Role</h3>
                      <p className="text-slate-800 mb-4">{report.profile.lifeRole}</p>
                      <p className="text-slate-800 leading-relaxed">{report.profile.description}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-amber-700 font-semibold mb-3">Strengths</h3>
                        <ul className="space-y-2">
                          {report.profile.strengths.map((strength, index) => (
                            <li key={index} className="flex items-start gap-2 text-slate-800">
                              <Star className="w-4 h-4 text-amber-700 mt-1 flex-shrink-0" />
                              <span>{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h3 className="text-amber-700 font-semibold mb-3">Challenges</h3>
                        <ul className="space-y-2">
                          {report.profile.challenges.map((challenge, index) => (
                            <li key={index} className="flex items-start gap-2 text-slate-800">
                              <Info className="w-4 h-4 text-amber-700 mt-1 flex-shrink-0" />
                              <span>{challenge}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Incarnation Cross Tab */}
              <TabsContent value="cross" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                <Card className="border-2 border-amber-300 hover:border-amber-400 shadow-lg rounded-3xl transition-all duration-300 overflow-hidden">
                  <div className="h-1 bg-amber-400" />
                  <CardHeader className="bg-gradient-to-r from-amber-100 to-yellow-100">
                    <CardTitle className="text-amber-900 flex items-center gap-2">
                      <Star className="w-5 h-5 text-amber-700" />
                      Your Incarnation Cross
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="bg-gradient-to-br from-amber-50 to-yellow-50 space-y-6">
                    <div>
                      <h3 className="text-amber-700 font-semibold mb-3">Life Purpose</h3>
                      <p className="text-slate-800 text-lg mb-4">{report.incarnationCross.lifePurpose}</p>
                      <p className="text-slate-800 leading-relaxed mb-4">{report.incarnationCross.description}</p>
                    </div>
                    <div>
                      <h3 className="text-amber-700 font-semibold mb-3">Expression</h3>
                      <ul className="space-y-2">
                        {report.incarnationCross.expression.map((expr, index) => (
                          <li key={index} className="flex items-start gap-2 text-slate-800">
                            <Target className="w-4 h-4 text-amber-700 mt-1 flex-shrink-0" />
                            <span>{expr}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="pt-4 border-t border-amber-300">
                      <p className="text-slate-700 text-sm">
                        Gate {chart.incarnationCross.sunGate} (Sun) × Gate {chart.incarnationCross.earthGate} (Earth)
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Full Report Tab */}
              <TabsContent value="report" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                <Card className="border-2 border-amber-300 hover:border-amber-400 shadow-lg rounded-3xl transition-all duration-300 overflow-hidden">
                  <div className="h-1 bg-amber-400" />
                  <CardHeader className="bg-gradient-to-r from-amber-100 to-yellow-100">
                    <CardTitle className="text-amber-900 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-amber-700" />
                      Complete Human Design Report
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="bg-gradient-to-br from-amber-50 to-yellow-50 space-y-8">
                    <div>
                      <h3 className="text-amber-700 font-semibold mb-3">Relationships</h3>
                      <p className="text-slate-800 mb-3">{report.relationships.overview}</p>
                      <p className="text-slate-800 mb-4">{report.relationships.compatibility}</p>
                      <ul className="space-y-2">
                        {report.relationships.advice.map((advice, index) => (
                          <li key={index} className="flex items-start gap-2 text-slate-800">
                            <Heart className="w-4 h-4 text-amber-700 mt-1 flex-shrink-0" />
                            <span>{advice}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="pt-4 border-t border-amber-300">
                      <h3 className="text-amber-700 font-semibold mb-3">Career</h3>
                      <p className="text-slate-800 mb-4">{report.career.overview}</p>
                      <div className="mb-4">
                        <p className="text-amber-700 font-semibold mb-2">Suitable Paths:</p>
                        <ul className="space-y-1">
                          {report.career.suitablePaths.map((path, index) => (
                            <li key={index} className="text-slate-800">• {path}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-amber-700 font-semibold mb-2">Success Factors:</p>
                        <ul className="space-y-1">
                          {report.career.successFactors.map((factor, index) => (
                            <li key={index} className="text-slate-800">• {factor}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-amber-300">
                      <h3 className="text-amber-700 font-semibold mb-3">Personal Growth</h3>
                      <p className="text-slate-800 mb-4">{report.personalGrowth.overview}</p>
                      <div className="mb-4">
                        <p className="text-amber-700 font-semibold mb-2">Recommendations:</p>
                        <ul className="space-y-1">
                          {report.personalGrowth.recommendations.map((rec, index) => (
                            <li key={index} className="text-slate-800">• {rec}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-amber-700 font-semibold mb-2">Practices:</p>
                        <ul className="space-y-1">
                          {report.personalGrowth.practices.map((practice, index) => (
                            <li key={index} className="text-slate-800">• {practice}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
                </div>
              </div>
              )}
            </Tabs>
            </div>
            </>
          ) : !isLoading ? (
            <Card className="border-2 border-amber-300 hover:border-amber-400 shadow-lg rounded-3xl transition-all duration-300 overflow-hidden">
              <div className="h-1 bg-amber-400" />
              <CardContent className="bg-gradient-to-br from-amber-50 to-yellow-50 p-12 text-center">
                <div className="text-6xl mb-4">🧬</div>
                <h3 className="text-2xl font-semibold text-amber-900 mb-4">Ready to Discover Your Human Design?</h3>
                <p className="text-slate-800 mb-6 max-w-2xl mx-auto">
                  Your Human Design chart reveals your unique energetic blueprint, combining astrology, I Ching, Kabbalah, and the chakra system. 
                  Generate your personalized report to understand your Type, Strategy, Authority, Profile, and more.
                </p>
                {!hasCompleteProfile && (
                  <Alert className="bg-amber-100 border-amber-300 text-amber-900 mb-6 max-w-2xl mx-auto">
                    <Info className="h-4 w-4 text-amber-700" />
                    <AlertDescription className="text-amber-900">
                      Please complete your profile with birth date, time, and place to generate your Human Design report.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
    </ToolReportGuard>
  )
}

