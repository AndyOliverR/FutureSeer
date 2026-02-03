"use client"

/**
 * Ogham Page
 * Main page for Celtic Ogham divination
 * Enhanced with comprehensive reports, profile integration, and visual displays
 */

import React, { useState, useEffect } from 'react'
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
import { isProfileComplete, getProfileCompletionStatus } from '@/lib/firebase'
import { OghamReport } from '@/lib/ogham/oghamReportGenerator'
import OghamReportDisplay from '@/components/ogham/OghamReportDisplay'
import { OghamSeerChatInterface } from '@/components/ogham/OghamSeerChatInterface'
import { ToolIntroductionTab } from '@/components/ToolIntroductionTab'

export default function OghamPage() {
  const { user, userProfile } = useAuth()
  const router = useRouter()
  const [report, setReport] = useState<OghamReport | null>(null)
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'report' | 'ask-seer'>('overview')
  
  // Check profile completion
  const profileStatus = userProfile ? getProfileCompletionStatus(userProfile) : {
    isComplete: false,
    missingFields: ['fullName', 'birthDate', 'birthTime', 'birthPlace'],
    completionPercentage: 0
  }

  // Auto-generate report when profile is complete
  useEffect(() => {
    if (profileStatus.isComplete && !report && !isGeneratingReport && user?.uid) {
      generateReport()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileStatus.isComplete, user?.uid])

  // Generate comprehensive Ogham report
  const generateReport = async () => {
    if (!user?.uid) {
      setError('Please sign in to generate your Ogham reading')
      return
    }

    if (!profileStatus.isComplete) {
      setError('Please complete your profile to generate a comprehensive Ogham reading')
      router.push('/profile-setup')
      return
    }

    setIsGeneratingReport(true)
    setError(null)

    try {
      const response = await fetch('/api/tools/ogham/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          userProfile,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate report')
      }

      const data = await response.json()
      if (data.success && data.data.report) {
        setReport(data.data.report)
        setActiveTab('report')
      } else {
        throw new Error('Invalid response from server')
      }
    } catch (err) {
      console.error('Error generating Ogham report:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate Ogham reading')
    } finally {
      setIsGeneratingReport(false)
    }
  }


  return (
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
              <h1 className="text-4xl md:text-5xl font-bold gold-glow">
                Ogham Divination
              </h1>
            </div>
            <p className="text-slate-300 text-lg leading-relaxed max-w-2xl mx-auto">
              Discover your connection to the ancient Celtic tree alphabet and unlock the wisdom of the Ogham script
            </p>
          </motion.div>

          {/* Profile Status Alert */}
          {!profileStatus.isComplete && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Card className="bg-amber-500/10 border-amber-500/30">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-amber-400 font-semibold mb-2">Complete Your Profile</h3>
                      <p className="text-slate-300 text-sm mb-3">
                        To generate your comprehensive Ogham reading, please complete your birth information.
                      </p>
                      {profileStatus.missingFields.length > 0 && (
                        <div className="mb-3">
                          <p className="text-slate-400 text-xs mb-1">Missing fields:</p>
                          <div className="flex flex-wrap gap-2">
                            {profileStatus.missingFields.map((field) => (
                              <Badge key={field} className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                                {field}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      <Button
                        onClick={() => router.push('/profile-setup')}
                        className="bg-amber-500 hover:bg-amber-600 text-white"
                      >
                        Complete Profile
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Success Message */}
          {profileStatus.isComplete && !report && !isGeneratingReport && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Card className="bg-green-500/10 border-green-500/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <div>
                      <p className="text-green-400 font-semibold">Profile Complete</p>
                      <p className="text-slate-300 text-sm">Your Ogham reading is being generated...</p>
                    </div>
                  </div>
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
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="space-y-6">
            <TabsList className="flex w-full bg-transparent p-0 gap-2">
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md rounded-xl px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 transition-all flex items-center justify-center"
              >
                <Info className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="report" 
                className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md rounded-xl px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 transition-all flex items-center justify-center"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Your Reading
              </TabsTrigger>
              <TabsTrigger 
                value="ask-seer" 
                className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md rounded-xl px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 transition-all flex items-center justify-center"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Ask The Seer
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-6">
              <ToolIntroductionTab toolSlug="ogham" />
              
              {profileStatus.isComplete && !report && (
                <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 shadow-lg rounded-3xl mt-6">
                  <CardContent className="p-12 text-center">
                    <Sparkles className="w-12 h-12 text-amber-700 mx-auto mb-4 animate-pulse" />
                    <p className="text-slate-700 mb-4">Ready to discover your Ogham reading?</p>
                    <Button
                      onClick={generateReport}
                      disabled={isGeneratingReport}
                      className="bg-amber-500 hover:bg-amber-600 text-white"
                    >
                      {isGeneratingReport ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <span className="mr-2">🌿</span>
                          Generate Your Ogham Reading
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Report Tab */}
            <TabsContent value="report" className="mt-6">
              {report ? (
                <OghamReportDisplay report={report} isLoading={isGeneratingReport} />
              ) : (
                <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 shadow-lg rounded-3xl">
                  <CardContent className="p-12 text-center">
                    {profileStatus.isComplete ? (
                      <>
                        <span className="text-5xl mb-4 block">🌿</span>
                        <p className="text-slate-700 mb-4">Generate your comprehensive Ogham reading</p>
                        <Button
                          onClick={generateReport}
                          disabled={isGeneratingReport}
                          className="bg-amber-500 hover:bg-amber-600 text-white"
                        >
                          {isGeneratingReport ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Generating Report...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 mr-2" />
                              Generate Comprehensive Report
                            </>
                          )}
                        </Button>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-12 h-12 text-amber-700 mx-auto mb-4" />
                        <p className="text-slate-700 mb-4">Please complete your profile to generate your Ogham reading</p>
                        <Button
                          onClick={() => router.push('/profile-setup')}
                          className="bg-amber-500 hover:bg-amber-600 text-white"
                        >
                          Complete Profile
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Ask The Seer Tab */}
            <TabsContent value="ask-seer" className="mt-6">
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
                      <p className="text-slate-700 mb-4">Generate your Ogham report first.</p>
                      <Button
                        onClick={generateReport}
                        disabled={isGeneratingReport}
                        className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl"
                      >
                        {isGeneratingReport ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          'Generate Your Ogham Reading'
                        )}
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
  )
}

