"use client"

import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
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
  const [reading, setReading] = useState<BibliomancyReading | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [profileComplete, setProfileComplete] = useState(false)
  const [question, setQuestion] = useState('')
  const [isGeneratingQuestion, setIsGeneratingQuestion] = useState(false)
  const [selectedText, setSelectedText] = useState<SacredTextType | null>(null)

  // Check profile completeness
  useEffect(() => {
    if (userProfile) {
      const complete = !!(userProfile.birthDate && userProfile.birthTime && userProfile.birthPlace)
      setProfileComplete(complete)
    }
  }, [userProfile])

  // Generate comprehensive reading
  const generateReading = useCallback(async () => {
    if (!user?.uid) {
      setError('Please log in to generate a bibliomancy reading')
      return
    }

    setIsLoading(true)
    setError(null)

    const textTypeToSend = selectedText || 'bible'
    console.log('📤 Sending bibliomancy request with textType:', textTypeToSend)

    try {
      const response = await fetch('/api/tools/bibliomancy/reading', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user.uid,
          textType: textTypeToSend // Default to bible if not selected (backward compatibility)
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate bibliomancy reading')
      }

      if (data.success && data.data) {
        setReading(data.data)
        setProfileComplete(data.profileComplete || false)
        // Navigate to reading tab after generation
        setTimeout(() => {
          setActiveTab('reading')
        }, 300)
      } else {
        throw new Error('Invalid response from server')
      }
    } catch (err: any) {
      console.error('Error generating bibliomancy reading:', err)
      setError(err.message || 'Failed to generate bibliomancy reading. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [user?.uid, selectedText])

  // Auto-generate reading when profile is complete and text is selected
  useEffect(() => {
    if (profileComplete && !reading && !isLoading && user?.uid && selectedText) {
      console.log('✨ Auto-generating bibliomancy reading for complete profile')
      const timer = setTimeout(() => {
        generateReading()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [profileComplete, reading, isLoading, user?.uid, selectedText, generateReading])

  // Generate question-based reading
  const generateQuestionReading = useCallback(async () => {
    if (!question.trim()) {
      setError('Please enter a question')
      return
    }

    if (!user?.uid) {
      setError('Please log in to generate a question reading')
      return
    }

    setIsGeneratingQuestion(true)
    setError(null)

    const textTypeToSend = selectedText || 'bible'
    console.log('📤 Sending question reading request with textType:', textTypeToSend)

    try {
      const response = await fetch('/api/tools/bibliomancy/reading', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user.uid,
          question: question.trim(),
          textType: textTypeToSend // Default to bible if not selected (backward compatibility)
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate question reading')
      }

      if (data.success && data.data) {
        setReading(data.data)
        setActiveTab('question')
      } else {
        throw new Error('Invalid response from server')
      }
    } catch (err: any) {
      console.error('Error generating question reading:', err)
      setError(err.message || 'Failed to generate question reading. Please try again.')
    } finally {
      setIsGeneratingQuestion(false)
    }
  }, [question, user?.uid, selectedText])

  const missingFields = useMemo(() => {
    if (!userProfile) return ['Birth Date', 'Birth Time', 'Birth Place']
    const missing: string[] = []
    if (!userProfile.birthDate) missing.push('Birth Date')
    if (!userProfile.birthTime) missing.push('Birth Time')
    if (!userProfile.birthPlace) missing.push('Birth Place')
    return missing
  }, [userProfile])

  return (
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
              <h1 className="text-4xl font-serif bg-gradient-to-b from-amber-200 via-yellow-400 to-amber-600 bg-clip-text text-transparent mb-2">
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
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-transparent p-0 gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md rounded-xl px-3 py-2 text-xs sm:text-sm font-medium text-slate-300 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 transition-all flex items-center justify-center"
                >
                  <Icon className="w-4 h-4 mr-1" />
                  {tab.label}
                </TabsTrigger>
              )
            })}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
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

            {/* Generate Button */}
            {selectedText && (
              <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 shadow-lg rounded-3xl overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-6 text-center">
                  <Button
                    onClick={generateReading}
                    disabled={isLoading || !selectedText}
                    className="bg-amber-600 hover:bg-amber-500 text-white px-8 py-6 text-lg"
                    size="lg"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Generating Reading...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Generate My Bibliomancy Reading
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Reading Tab */}
          <TabsContent value="reading" className="space-y-6">
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
                  <h3 className="text-amber-900 font-semibold mb-2 text-xl">Generate Your Bibliomancy Reading</h3>
                  <p className="text-slate-700 mb-4">
                    Receive a comprehensive bibliomancy reading based on your birth information, with guidance for all areas of your life.
                  </p>
                  <Button
                    onClick={generateReading}
                    disabled={isLoading || !selectedText}
                    className="bg-amber-600 hover:bg-amber-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating Reading...
                      </>
                    ) : !selectedText ? (
                      <>
                        <Info className="w-4 h-4 mr-2" />
                        Select a Sacred Text First
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate My Reading
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <BibliomancyReport reading={reading} />
            )}
          </TabsContent>

          {/* Question Reading Tab */}
          <TabsContent value="question" className="space-y-6">
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
                <Button
                  onClick={generateQuestionReading}
                  disabled={isGeneratingQuestion || !question.trim() || !selectedText}
                  className="w-full bg-amber-600 hover:bg-amber-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGeneratingQuestion ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Consulting the Sacred Texts...
                    </>
                  ) : !selectedText ? (
                    <>
                      <Info className="w-4 h-4 mr-2" />
                      Select a Sacred Text First
                    </>
                  ) : (
                    <>
                      <BookOpen className="w-4 h-4 mr-2" />
                      Open the Book
                    </>
                  )}
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
          <TabsContent value="passages" className="space-y-6">
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
                    Generate a bibliomancy reading to see selected Bible passages and their interpretations.
                  </p>
                  {profileComplete && (
                    <Button
                      onClick={generateReading}
                      disabled={isLoading}
                      className="bg-amber-600 hover:bg-amber-500 text-white"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Reading
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Guidance Tab */}
          <TabsContent value="guidance" className="space-y-6">
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
                    Generate a bibliomancy reading to receive personalized guidance for all areas of your life.
                  </p>
                  {profileComplete && (
                    <Button
                      onClick={generateReading}
                      disabled={isLoading}
                      className="bg-amber-600 hover:bg-amber-500 text-white"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Reading
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Ask The Seer Tab */}
          <TabsContent value="ask-seer" className="space-y-6">
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
                    <p className="text-slate-700 mb-4">Generate your bibliomancy reading first.</p>
                    <Button
                      onClick={generateReading}
                      disabled={isLoading}
                      className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        'Generate Your Bibliomancy Reading'
                      )}
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
  )
}
