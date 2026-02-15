"use client"

/**
 * Ogham Page
 * Main page for Celtic Ogham divination
 * Enhanced with comprehensive reports, profile integration, and visual displays
 */

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Sparkles,
  Info,
  BookOpen,
  Loader2,
  AlertCircle,
  CheckCircle,
  MessageCircle
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { useToolReport } from '@/hooks/useComprehensiveMysticalProfile'
import { ToolReportGuard } from '@/components/ToolReportGuard'
import { OghamReport } from '@/lib/ogham/oghamReportGenerator'
import OghamReportDisplay from '@/components/ogham/OghamReportDisplay'
import { OghamSeerChatInterface } from '@/components/ogham/OghamSeerChatInterface'
import { ToolIntroductionTab } from '@/components/ToolIntroductionTab'

export default function OghamPage() {
  const { user, userProfile } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'overview' | 'report' | 'ask-seer'>('overview')
  const { report: pipelineReport, loading: isGeneratingReport, error, hasReport } = useToolReport('ogham')
  const report = useMemo(() => {
    const raw = pipelineReport as Record<string, unknown> | undefined
    if (raw?.report) return raw.report as OghamReport
    if (pipelineReport && typeof pipelineReport === 'object' && !('placeholder' in (pipelineReport as object))) return pipelineReport as unknown as OghamReport
    return null
  }, [pipelineReport])


  return (
    <ToolReportGuard loading={isGeneratingReport} error={error ?? null} toolLabel="Ogham">
    <div className="starfield-ultra-sharp min-h-screen overflow-hidden">
      <div className="container mx-auto px-4 py-8 pt-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="text-5xl">🌿</span>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold gold-glow">
                Ogham Divination
              </h1>
            </div>
            <p className="text-slate-300 text-lg leading-relaxed max-w-2xl mx-auto">
              Discover your connection to the ancient Celtic tree alphabet and unlock the wisdom of the Ogham script
            </p>
          </motion.div>

          {/* CTA when no report */}
          {!hasReport && !isGeneratingReport && !error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Card className="bg-amber-500/10 border-amber-500/30">
                <CardContent className="p-4 text-center">
                  <p className="text-slate-300 mb-3">Generate your mystical profile to unlock your Ogham reading.</p>
                  <Button asChild className="bg-amber-500 hover:bg-amber-600 text-white">
                    <Link href="/profile">Generate your mystical profile</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Card className="bg-red-500/10 border-red-500/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <div>
                      <p className="text-red-400 font-semibold">Error</p>
                      <p className="text-slate-300 text-sm">{error}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Main Content Tabs */}
          <div className="rounded-2xl border border-amber-500/30 bg-slate-900/80 overflow-hidden">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full min-w-0">
            <TabsList className="flex w-full flex-nowrap overflow-x-auto gap-1 sm:gap-2 p-2 sm:p-3 bg-slate-800/50 border-b border-amber-500/20 rounded-none h-auto min-h-0 justify-start [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-amber-500/30">
              <TabsTrigger 
                value="overview" 
                className="shrink-0 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 rounded-t-lg rounded-b-none px-4 py-2.5 text-sm font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 transition-all flex items-center justify-center border border-transparent data-[state=inactive]:border-slate-600/50"
              >
                <Info className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="report" 
                className="shrink-0 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 rounded-t-lg rounded-b-none px-4 py-2.5 text-sm font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 transition-all flex items-center justify-center border border-transparent data-[state=inactive]:border-slate-600/50"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Your Reading
              </TabsTrigger>
              <TabsTrigger 
                value="ask-seer" 
                className="shrink-0 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 rounded-t-lg rounded-b-none px-4 py-2.5 text-sm font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 transition-all flex items-center justify-center border border-transparent data-[state=inactive]:border-slate-600/50"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Ask The Seer
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="pt-6 px-4 sm:px-6 pb-6 mt-0">
              <ToolIntroductionTab toolSlug="ogham" />
              
              {!hasReport && (
                <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 shadow-lg rounded-3xl mt-6">
                  <CardContent className="p-12 text-center">
                    <p className="text-slate-700 mb-4">Generate your mystical profile to unlock your Ogham reading.</p>
                    <Button asChild className="bg-amber-500 hover:bg-amber-600 text-white">
                      <Link href="/profile">Generate your mystical profile</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Report Tab */}
            <TabsContent value="report" className="pt-6 px-4 sm:px-6 pb-6 mt-0">
              {report ? (
                <OghamReportDisplay report={report} isLoading={isGeneratingReport} />
              ) : (
                <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 shadow-lg rounded-3xl">
                  <CardContent className="p-12 text-center">
                    <p className="text-slate-700 mb-4">Generate your mystical profile to unlock your Ogham reading.</p>
                    <Button asChild className="bg-amber-500 hover:bg-amber-600 text-white">
                      <Link href="/profile">Generate your mystical profile</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Ask The Seer Tab */}
            <TabsContent value="ask-seer" className="pt-6 px-4 sm:px-6 pb-6 mt-0">
              {user?.uid && userProfile ? (
                report ? (
                  <OghamSeerChatInterface
                    report={report}
                    userProfile={userProfile}
                    userId={user.uid}
                  />
                ) : (
                  <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 shadow-lg rounded-3xl">
                    <CardContent className="p-12 text-center">
                      <MessageCircle className="w-12 h-12 text-amber-600 mx-auto mb-4" />
                      <p className="text-slate-700 mb-4">Generate your mystical profile to unlock your Ogham reading.</p>
                      <Button asChild className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl">
                        <Link href="/profile">Generate your mystical profile</Link>
                      </Button>
                    </CardContent>
                  </Card>
                )
              ) : (
                <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 shadow-lg rounded-3xl">
                  <CardContent className="p-12 text-center">
                    <p className="text-slate-700">Please sign in to ask The Seer about Ogham</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
          </div>
        </div>
      </div>
    </div>
    </ToolReportGuard>
  )
}

