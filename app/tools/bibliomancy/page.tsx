"use client"

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { useToolReport } from '@/hooks/useComprehensiveMysticalProfile'
import { ToolReportGuard } from '@/components/ToolReportGuard'
import {
  BookOpen,
  Sparkles,
  Target,
  Heart,
  MessageCircle,
  Loader2,
  Star,
  Info,
  AlertCircle,
  User,
  Quote,
  AlertTriangle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { ToolIntroductionTab } from '@/components/ToolIntroductionTab'
import { BibliomancySeerChatInterface } from '@/components/bibliomancy/BibliomancySeerChatInterface'
import BibliomancyReport from '@/components/bibliomancy/BibliomancyReport'
import { BibliomancyReading, SacredTextType } from '@/lib/bibliomancyIntelligence'
import SacredTextSelector from '@/components/bibliomancy/SacredTextSelector'

const tabs = [
  { id: 'overview', label: 'Overview', icon: BookOpen },
  { id: 'reading', label: 'Your Reading', icon: Sparkles },
  { id: 'question', label: 'Question Reading', icon: Heart },
  { id: 'passages', label: 'Passages', icon: Quote },
  { id: 'guidance', label: 'Guidance', icon: Target },
  { id: 'ask-seer', label: 'Ask The Seer', icon: MessageCircle }
]

export default function BibliomancyPage() {
  const { user, userProfile } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'overview' | 'reading' | 'question' | 'passages' | 'guidance' | 'ask-seer'>('overview')
  const [question, setQuestion] = useState('')
  const [selectedText, setSelectedText] = useState<SacredTextType | null>(null)
  const { report: pipelineReport, loading: isLoading, error, hasReport } = useToolReport('bibliomancy')
  const reading = useMemo((): BibliomancyReading | null => {
    if (!pipelineReport || typeof pipelineReport !== 'object') return null
    const r = pipelineReport as Record<string, unknown>
    if (r.placeholder === true) return null
    const data = (r.data ?? r) as Record<string, unknown> | undefined
    const hasReading = data && typeof data === 'object' && (Array.isArray((data as Record<string, unknown>).selectedPassages) || (data as Record<string, unknown>).selectedPassages != null)
    return hasReading ? (data as unknown as BibliomancyReading) : null
  }, [pipelineReport])
  const [profileComplete, setProfileComplete] = useState(false)
  useEffect(() => {
    if (userProfile) setProfileComplete(!!(userProfile.birthDate && userProfile.birthTime && userProfile.birthPlace))
  }, [userProfile])

  const missingFields = useMemo(() => {
    if (!userProfile) return ['Birth Date', 'Birth Time', 'Birth Place']
    const missing: string[] = []
    if (!userProfile.birthDate) missing.push('Birth Date')
    if (!userProfile.birthTime) missing.push('Birth Time')
    if (!userProfile.birthPlace) missing.push('Birth Place')
    return missing
  }, [userProfile])

  return (
    <ToolReportGuard loading={isLoading} error={error ?? null} toolLabel="bibliomancy">
    <div className="starfield-ultra-sharp min-h-screen overflow-hidden">
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 pt-4 text-center"
        >
          <div className="flex flex-col items-center gap-4 mb-4">
            <div className="text-5xl">
              📖
            </div>
            <div>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif bg-gradient-to-b from-amber-200 via-yellow-400 to-amber-600 bg-clip-text text-transparent mb-2">
                Bibliomancy
              </h1>
              <p className="text-slate-300">
                Divine guidance through sacred texts and Bible passages
              </p>
            </div>
          </div>
          <p className="text-slate-400 text-sm italic max-w-3xl mx-auto">
            Bibliomancy is the ancient practice of seeking divine guidance by randomly selecting passages from sacred texts, particularly the Bible. Each passage is interpreted as guidance for your life situation, offering wisdom, comfort, and direction.
          </p>
        </motion.div>

        {/* Profile Completeness Alert */}
        {!profileComplete && userProfile && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Alert className="bg-amber-900/20 border-amber-500/50 backdrop-blur-sm">
              <AlertCircle className="h-4 w-4 text-amber-400" />
              <AlertDescription className="text-amber-200">
                <div className="flex items-center justify-between">
                  <div>
                    <strong>Complete your profile</strong> for the most detailed bibliomancy reading.
                    {missingFields.length > 0 && (
                      <span className="ml-2 text-amber-300/80">
                        Missing: {missingFields.join(', ')}
                      </span>
                    )}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => router.push('/dashboard?tab=profile')}
                    className="ml-4 bg-amber-600 hover:bg-amber-500 text-white"
                  >
                    Complete Profile
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Alert className="bg-red-900/20 border-red-500/50 backdrop-blur-sm">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-200">
                {error}
              </AlertDescription>
            </Alert>
          </motion.div>
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
                  className="shrink-0 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 rounded-t-lg rounded-b-none px-4 py-2.5 text-sm font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 transition-all flex items-center justify-center border border-transparent data-[state=inactive]:border-slate-600/50"
                >
                  <Icon className="w-4 h-4 mr-1" />
                  {tab.label}
                </TabsTrigger>
              )
            })}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
            <ToolIntroductionTab toolSlug="bibliomancy" />
            
            {/* Sacred Text Selector */}
            <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 shadow-lg rounded-3xl overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6">
                <SacredTextSelector
                  selectedText={selectedText}
                  onSelect={setSelectedText}
                  disabled={isLoading}
                />
              </CardContent>
            </Card>

            {/* CTA when no reading from pipeline */}
            {selectedText && !reading && (
              <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 shadow-lg rounded-3xl overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-6 text-center">
                  <p className="text-slate-700 mb-4">Generate your mystical profile to get your Bibliomancy reading.</p>
                  <Button asChild className="bg-amber-600 hover:bg-amber-500 text-white px-8 py-6 text-lg" size="lg">
                    <Link href="/profile">
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generate your mystical profile
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Reading Tab */}
          <TabsContent value="reading" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
            {!profileComplete ? (
              <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 shadow-lg rounded-3xl overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-6 text-center">
                  <Info className="w-12 h-12 text-amber-700 mx-auto mb-4" />
                  <h3 className="text-amber-900 font-semibold mb-2 text-xl">Complete Your Profile</h3>
                  <p className="text-slate-700 mb-4">
                    Please complete your birth date, time, and place to generate your comprehensive bibliomancy reading.
                  </p>
                  <Button
                    onClick={() => router.push('/dashboard?tab=profile')}
                    className="bg-amber-600 hover:bg-amber-500 text-white"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Complete Profile
                  </Button>
                </CardContent>
              </Card>
            ) : !reading ? (
              <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 shadow-lg rounded-3xl overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-6 text-center">
                  <Info className="w-12 h-12 text-amber-700 mx-auto mb-4" />
                  <h3 className="text-amber-900 font-semibold mb-2 text-xl">Bibliomancy Reading</h3>
                  <p className="text-slate-700 mb-4">
                    Generate your mystical profile to receive a comprehensive bibliomancy reading with guidance for all areas of your life.
                  </p>
                  <Button asChild className="bg-amber-600 hover:bg-amber-500 text-white">
                    <Link href="/profile">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate your mystical profile
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <BibliomancyReport reading={reading} />
            )}
          </TabsContent>

          {/* Question Reading Tab */}
          <TabsContent value="question" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
            <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 shadow-lg rounded-3xl overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="bg-gradient-to-r from-amber-100 to-yellow-100">
                <CardTitle className="text-amber-900 flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Ask a Question
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Your Question
                  </label>
                  <Textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="What guidance do you seek from the sacred texts?"
                    className="w-full p-3 bg-white border border-amber-300 rounded-lg text-slate-900 placeholder:text-slate-500 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 h-32 resize-none"
                  />
                </div>
                {!selectedText && (
                  <div className="p-3 bg-amber-100 border border-amber-300 rounded-lg text-center">
                    <p className="text-sm text-amber-900">
                      Please select a sacred text from the Overview tab first.
                    </p>
                  </div>
                )}
                <p className="text-sm text-slate-600">
                  Question-based readings are included when you generate your mystical profile.
                </p>
                <Button asChild className="w-full bg-amber-600 hover:bg-amber-500 text-white">
                  <Link href="/profile">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate your mystical profile
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {reading?.questionReading && (
              <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 shadow-lg rounded-3xl overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="bg-gradient-to-r from-amber-100 to-yellow-100">
                  <CardTitle className="text-amber-900 flex items-center gap-2">
                    <Quote className="h-5 w-5" />
                    Your Answer
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-6">
                  <div>
                    <h4 className="text-sm font-semibold text-amber-700 mb-2">Your Question</h4>
                    <p className="text-slate-800 italic">"{reading.questionReading.question}"</p>
                  </div>
                  <div className="bg-amber-100 border border-amber-300 rounded-lg p-4">
                    <div className="mb-2">
                      <Badge variant="secondary" className="bg-amber-200 text-amber-900 border-amber-300">
                        {reading.questionReading.passage.reference}
                      </Badge>
                    </div>
                    <blockquote className="text-amber-900 italic leading-relaxed text-lg">
                      "{reading.questionReading.passage.text}"
                    </blockquote>
                  </div>
                  {reading.questionReading.interpretation && (
                    <div>
                      <h4 className="text-sm font-semibold text-amber-700 mb-2">Interpretation</h4>
                      <p className="text-slate-700 leading-relaxed">{reading.questionReading.interpretation}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Passages Tab */}
          <TabsContent value="passages" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
            {reading && reading.selectedPassages && reading.selectedPassages.length > 0 ? (
              <div className="space-y-4">
                {reading.selectedPassages.map((passage, idx) => (
                  <Card key={idx} className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 shadow-lg rounded-3xl overflow-hidden hover:shadow-xl transition-shadow duration-300">
                    <CardHeader className="bg-gradient-to-r from-amber-100 to-yellow-100">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-amber-900 flex items-center gap-2">
                          <BookOpen className="h-5 w-5" />
                          {passage.reference}
                        </CardTitle>
                        <Badge variant="secondary" className="bg-amber-200 text-amber-900 border-amber-300">
                          {passage.book}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4 p-6">
                      <div className="bg-amber-100 border border-amber-300 rounded-lg p-4">
                        <blockquote className="text-amber-900 italic leading-relaxed text-lg">
                          "{passage.text}"
                        </blockquote>
                      </div>
                      {passage.interpretation && (
                        <div>
                          <h4 className="text-sm font-semibold text-amber-700 mb-2 flex items-center gap-2">
                            <Sparkles className="h-4 w-4" />
                            Interpretation
                          </h4>
                          <p className="text-slate-700 leading-relaxed">{passage.interpretation}</p>
                        </div>
                      )}
                      {passage.application && (
                        <div>
                          <h4 className="text-sm font-semibold text-amber-700 mb-2">Application</h4>
                          <p className="text-slate-700 leading-relaxed">{passage.application}</p>
                        </div>
                      )}
                      {passage.themes && passage.themes.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-2 border-t border-amber-300">
                          {passage.themes.map((theme, themeIdx) => (
                            <Badge
                              key={themeIdx}
                              variant="secondary"
                              className="bg-amber-200 text-amber-900 border-amber-300"
                            >
                              {theme}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 shadow-lg rounded-3xl overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-6 text-center">
                  <Info className="w-12 h-12 text-amber-700 mx-auto mb-4" />
                  <h3 className="text-amber-900 font-semibold mb-2 text-xl">No Passages Yet</h3>
                  <p className="text-slate-700 mb-4">
                    Generate your mystical profile to see selected passages and their interpretations.
                  </p>
                  <Button asChild className="bg-amber-600 hover:bg-amber-500 text-white">
                    <Link href="/profile">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate your mystical profile
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Guidance Tab */}
          <TabsContent value="guidance" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
            {reading && reading.lifeAreaGuidance ? (
              <div className="space-y-6">
                {Object.entries(reading.lifeAreaGuidance).map(([area, guidance]) => (
                  <Card key={area} className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 shadow-lg rounded-3xl overflow-hidden hover:shadow-xl transition-shadow duration-300">
                    <CardHeader className="bg-gradient-to-r from-amber-100 to-yellow-100">
                      <CardTitle className="text-amber-900 capitalize">
                        {area === 'love' ? 'Love & Romance' :
                         area === 'career' ? 'Career & Work' :
                         area === 'health' ? 'Health & Wellness' :
                         area === 'spirituality' ? 'Spirituality' :
                         area === 'finances' ? 'Finances' :
                         'Relationships'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 p-6">
                      <div className="bg-amber-100 border border-amber-300 rounded-lg p-4">
                        <div className="mb-2">
                          <Badge variant="secondary" className="bg-amber-200 text-amber-900 border-amber-300">
                            {guidance.passage.reference}
                          </Badge>
                        </div>
                        <blockquote className="text-amber-900 italic leading-relaxed">
                          "{guidance.passage.text}"
                        </blockquote>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-amber-700 mb-2">Divine Message</h4>
                        <p className="text-slate-700 leading-relaxed">{guidance.message}</p>
                      </div>
                      {guidance.actions && guidance.actions.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-amber-700 mb-2">Actions</h4>
                          <ul className="space-y-1">
                            {guidance.actions.map((action, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-slate-700">
                                <Star className="h-4 w-4 text-amber-600 mt-1 flex-shrink-0" />
                                <span>{action}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {guidance.affirmations && guidance.affirmations.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-amber-700 mb-2">Affirmations</h4>
                          <ul className="space-y-1">
                            {guidance.affirmations.map((affirmation, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-slate-700 italic">
                                <Heart className="h-4 w-4 text-pink-600 mt-1 flex-shrink-0" />
                                <span>"{affirmation}"</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 shadow-lg rounded-3xl overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-6 text-center">
                  <Info className="w-12 h-12 text-amber-700 mx-auto mb-4" />
                  <h3 className="text-amber-900 font-semibold mb-2 text-xl">No Guidance Yet</h3>
                  <p className="text-slate-700 mb-4">
                    Generate your mystical profile to receive personalized guidance for all areas of your life.
                  </p>
                  <Button asChild className="bg-amber-600 hover:bg-amber-500 text-white">
                    <Link href="/profile">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate your mystical profile
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Ask The Seer Tab */}
          <TabsContent value="ask-seer" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
            {user?.uid ? (
              reading ? (
                <BibliomancySeerChatInterface
                  reading={reading}
                  userProfile={userProfile}
                  userId={user.uid}
                />
              ) : (
                <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 shadow-lg rounded-3xl overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  <CardContent className="p-12 text-center">
                    <MessageCircle className="w-12 h-12 text-amber-600 mx-auto mb-4" />
                    <p className="text-slate-700 mb-4">Generate your mystical profile to get your bibliomancy reading first.</p>
                    <Button asChild className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl">
                      <Link href="/profile">
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate your mystical profile
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )
            ) : (
              <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 shadow-lg rounded-3xl overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-12 text-center">
                  <p className="text-slate-700">Please sign in to ask The Seer about Bibliomancy</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </div>
    </ToolReportGuard>
  )
}
