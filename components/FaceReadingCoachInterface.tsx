import { useState } from 'react'
import { motion } from 'framer-motion'
import { faceReadingIntelligence, FaceReadingAnalysis } from "@/lib/faceReadingIntelligence"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import FaceReadingSeerChatInterface from '@/components/FaceReadingSeerChatInterface'
import { useAuth } from '@/hooks/use-auth'
import { 
  MessageSquare, 
  Send, 
  Lightbulb, 
  Target, 
  Heart, 
  Zap,
  Eye,
  Activity,
  Sparkles,
  ArrowRight,
  Clock,
  TrendingUp,
  Star
} from 'lucide-react'

interface FaceReadingCoachInterfaceProps {
  analysis: FaceReadingAnalysis
  activeTab: string
  faceData?: any
  readingMethod?: 'modern' | 'chinese'
}

export function FaceReadingCoachInterface({ 
  analysis, 
  activeTab, 
  faceData, 
  readingMethod 
}: FaceReadingCoachInterfaceProps) {
  const { user, userProfile: authUserProfile } = useAuth()
  const [question, setQuestion] = useState('')
  const [isAsking, setIsAsking] = useState(false)
  const [currentResponse, setCurrentResponse] = useState<string | null>(null)
  const [coaching, setCoaching] = useState<any[]>([])

  const handleAskQuestion = async () => {
    if (!question.trim() || !analysis) return

    setIsAsking(true)
    setCurrentResponse(null)

    try {
      const response = await faceReadingIntelligence.getCoaching(question, analysis)
      if (response) {
        setCurrentResponse(response.response)
        setCoaching(prev => [response, ...prev])
      }
    } catch (error) {
      console.error('Error getting coaching:', error)
    } finally {
      setIsAsking(false)
    }
  }

  if (!analysis) {
    return (
      <Card className="bg-amber-50/80 border-2 border-amber-300 shadow-md">
        <CardContent className="p-6 text-center">
          <Eye className="w-12 h-12 text-amber-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-amber-900 mb-2">No Face Reading Data</h3>
          <p className="text-slate-600">Complete a face reading to access facial coaching</p>
        </CardContent>
      </Card>
    )
  }

  const faceReadingData = analysis
  const isChinese = readingMethod === 'chinese'

  // Helper function to adjust terminology based on reading method
  const getTerm = (modern: string, chinese: string) => isChinese ? chinese : modern

  // Render Overview Tab
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Overall Reading Summary */}
      <Card 
        elevation={1} 
        className="bg-amber-50/80 border-2 border-amber-300 shadow-md m3-elevation-transition rounded-2xl"
      >
        <CardContent className="p-6">
          <h3 className="text-xl text-amber-900 font-semibold mb-4 flex items-center">
            <span className="mr-2">👁️</span>
            {getTerm('Overall Reading', '整体面相分析')}
          </h3>
          <p className="text-slate-700 leading-relaxed">{faceReadingData.overallReading}</p>
        </CardContent>
      </Card>

      {/* Face Shape & Energy Score */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card 
          elevation={1} 
          className="bg-purple-50/80 border-2 border-purple-300 shadow-md m3-elevation-transition rounded-2xl"
        >
          <CardContent className="p-6">
            <h3 className="text-lg text-purple-900 font-semibold mb-3 flex items-center">
              <span className="mr-2">🎭</span>
              {getTerm('Face Shape', '面型')}
            </h3>
            <p className="text-slate-700 text-2xl font-semibold">{faceReadingData.faceShape}</p>
            <p className="text-slate-600 text-sm mt-2">
              {getTerm('Your face shape reveals your fundamental nature and approach to life.', '你的面型揭示了你的根本本性和生活态度。')}
            </p>
          </CardContent>
        </Card>

        <Card 
          elevation={1} 
          className="bg-blue-50/80 border-2 border-blue-300 shadow-md m3-elevation-transition rounded-2xl"
        >
          <CardContent className="p-6">
          <h3 className="text-lg text-blue-900 font-semibold mb-3 flex items-center">
            <span className="mr-2">⚡</span>
            {getTerm('Energy Score', '能量评分')}
          </h3>
          <div className="flex items-center gap-4">
            <div className="relative w-24 h-24">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="rgba(59, 130, 246, 0.2)"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="url(#energyGradient)"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${faceReadingData.energyScore * 2.51} 251`}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="energyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#60a5fa" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-900">{faceReadingData.energyScore}</div>
                  <div className="text-xs text-slate-600">/100</div>
                </div>
              </div>
            </div>
            <div>
              <p className="text-slate-700 text-sm">
                {faceReadingData.energyScore > 70 
                  ? getTerm('High energy - You radiate vitality and enthusiasm', '高能量 - 你散发出活力和热情')
                  : faceReadingData.energyScore > 40
                  ? getTerm('Moderate energy - You have balanced vitality', '中等能量 - 你有平衡的活力')
                  : getTerm('Calm energy - You exude tranquility and peace', '平静能量 - 你散发出宁静与平和')}
              </p>
            </div>
          </div>
          </CardContent>
        </Card>
      </div>

      {/* Element Balance */}
      <Card 
        elevation={1} 
        className="bg-green-50/80 border-2 border-green-300 shadow-md m3-elevation-transition rounded-2xl"
      >
        <CardContent className="p-6">
        <h3 className="text-lg text-green-900 font-semibold mb-4 flex items-center">
          <span className="mr-2">🌊</span>
          {getTerm('Element Balance', '五行平衡')}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(faceReadingData.elementBalance).map(([element, value]) => (
            <div key={element} className="text-center">
              <div className="text-3xl mb-2">
                {element === 'fire' ? '🔥' : element === 'earth' ? '🌍' : element === 'air' ? '💨' : '💧'}
              </div>
              <div className="text-slate-700 font-semibold capitalize">{element}</div>
              <div className="text-amber-700 text-lg font-bold">{value}%</div>
            </div>
          ))}
        </div>
        </CardContent>
      </Card>
    </div>
  )

  // Render Features Tab
  const renderFeatures = () => (
    <div className="space-y-6">
      <Card 
        elevation={1} 
        className="bg-cyan-50/80 border-2 border-cyan-300 shadow-md m3-elevation-transition rounded-2xl"
      >
        <CardContent className="p-6">
          <h3 className="text-xl text-cyan-900 font-semibold mb-4 flex items-center">
            <span className="mr-2">👁️</span>
            {getTerm('Facial Features Analysis', '面部特征分析')}
          </h3>
          <p className="text-slate-600 mb-6">
            {getTerm('Detailed analysis of your facial features and their meanings.', '详细分析你的面部特征及其含义。')}
          </p>

        <div className="space-y-4">
          {faceReadingData.features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 rounded-xl border-2 border-cyan-200 bg-white"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{feature.type === 'eyes' ? '👁️' : feature.type === 'nose' ? '👃' : feature.type === 'mouth' ? '👄' : '🧠'}</span>
                <div>
                  <h4 className="text-slate-700 font-semibold">{feature.name}</h4>
                  <p className="text-slate-500 text-xs capitalize">{feature.type}</p>
                </div>
              </div>
              <p className="text-slate-600 text-sm">{feature.characteristics}</p>
            </motion.div>
          ))}
        </div>
        </CardContent>
      </Card>

      {/* Dominant Features */}
      <Card 
        elevation={1} 
        className="bg-pink-50/80 border-2 border-pink-300 shadow-md m3-elevation-transition rounded-2xl"
      >
        <CardContent className="p-6">
          <h3 className="text-lg text-pink-900 font-semibold mb-4 flex items-center">
            <span className="mr-2">⭐</span>
            {getTerm('Dominant Features', '主要特征')}
          </h3>
          <div className="flex flex-wrap gap-2">
            {faceReadingData.dominantFeatures.map((feature, index) => (
              <Badge key={index} className="bg-green-500/20 text-green-700 border-green-500/50">
                {feature}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  // Render Personality Tab
  const renderPersonality = () => (
    <div className="space-y-6">
      <Card 
        elevation={1} 
        className="bg-amber-50/80 border-2 border-amber-300 shadow-md m3-elevation-transition rounded-2xl"
      >
        <CardContent className="p-6">
          <h3 className="text-xl text-amber-900 font-semibold mb-4 flex items-center">
            <span className="mr-2">🧠</span>
            {getTerm('Personality Traits', '性格特征')}
          </h3>
          <p className="text-slate-600 mb-6">
            {getTerm('Your facial features reveal these key personality traits.', '你的面部特征揭示了这些关键的性格特征。')}
          </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {faceReadingData.personalityTraits.map((trait, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 rounded-xl border-2 border-amber-200 bg-white"
            >
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-600" />
                <span className="text-slate-700 font-semibold">{trait}</span>
              </div>
            </motion.div>
          ))}
        </div>
        </CardContent>
      </Card>

      {/* Compatibility */}
      <Card 
        elevation={1} 
        className="bg-blue-50/80 border-2 border-blue-300 shadow-md m3-elevation-transition rounded-2xl"
      >
        <CardContent className="p-6">
          <h3 className="text-lg text-blue-900 font-semibold mb-4 flex items-center">
            <span className="mr-2">💕</span>
            {getTerm('Relationship Compatibility', '人际关系兼容性')}
          </h3>
          <p className="text-slate-700 leading-relaxed">{faceReadingData.compatibility}</p>
        </CardContent>
      </Card>
    </div>
  )

  // Render Character Tab
  const renderCharacter = () => (
    <div className="space-y-6">
      <ScrollArea className="h-[600px]">
        <div className="space-y-4">
          {/* Strengths */}
          <Card className="bg-green-50/80 border-2 border-green-300 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">
                  {getTerm('Your Strengths', '你的优势')}
                </span>
              </div>
              <div className="space-y-2">
                {faceReadingData.coaching.strengths.map((strength, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm text-slate-700">{strength}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Challenges */}
          <Card className="bg-yellow-50/80 border-2 border-yellow-300 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-900">
                  {getTerm('Growth Challenges', '成长挑战')}
                </span>
              </div>
              <div className="space-y-2">
                {faceReadingData.coaching.challenges.map((challenge, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm text-slate-700">{challenge}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Growth Areas */}
          <Card className="bg-blue-50/80 border-2 border-blue-300 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  {getTerm('Growth Areas', '成长领域')}
                </span>
              </div>
              <div className="space-y-2">
                {faceReadingData.coaching.growthAreas.map((area, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm text-slate-700">{area}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Health Indicators */}
          {faceReadingData.healthIndicators && faceReadingData.healthIndicators.length > 0 && (
            <Card className="bg-red-50/80 border-2 border-red-300 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Activity className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-medium text-red-900">
                    {getTerm('Health Indicators', '健康指标')}
                  </span>
                </div>
                <div className="space-y-2">
                  {faceReadingData.healthIndicators.map((indicator, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm text-slate-700">{indicator}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  )

  // Render Destiny Tab
  const renderDestiny = () => (
    <div className="space-y-6">
      <Card 
        elevation={1} 
        className="bg-purple-50/80 border-2 border-purple-300 shadow-md m3-elevation-transition rounded-2xl"
      >
        <CardContent className="p-6">
          <h3 className="text-xl text-purple-900 font-semibold mb-4 flex items-center">
            <span className="mr-2">🌟</span>
            {getTerm('Life Path & Destiny', '人生道路与命运')}
          </h3>
          <p className="text-slate-700 leading-relaxed text-lg mb-6">{faceReadingData.lifePath}</p>
        </CardContent>
      </Card>

      {/* Career Guidance */}
      <Card 
        elevation={1} 
        className="bg-amber-50/80 border-2 border-amber-300 shadow-md m3-elevation-transition rounded-2xl"
      >
        <CardContent className="p-6">
          <h3 className="text-lg text-amber-900 font-semibold mb-4 flex items-center">
            <span className="mr-2">💼</span>
            {getTerm('Career Guidance', '职业指导')}
          </h3>
          <p className="text-slate-700 leading-relaxed">{faceReadingData.careerGuidance}</p>
        </CardContent>
      </Card>

      {/* Compatibility & Relationships */}
      <Card 
        elevation={1} 
        className="bg-pink-50/80 border-2 border-pink-300 shadow-md m3-elevation-transition rounded-2xl"
      >
        <CardContent className="p-6">
          <h3 className="text-lg text-pink-900 font-semibold mb-4 flex items-center">
            <span className="mr-2">💕</span>
            {getTerm('Relationship Patterns', '人际关系模式')}
          </h3>
          <p className="text-slate-700 leading-relaxed">{faceReadingData.compatibility}</p>
        </CardContent>
      </Card>

      {/* Energy Score Visual */}
      <Card 
        elevation={1} 
        className="bg-blue-50/80 border-2 border-blue-300 shadow-md m3-elevation-transition rounded-2xl"
      >
        <CardContent className="p-6">
          <h3 className="text-lg text-blue-900 font-semibold mb-4 flex items-center">
            <span className="mr-2">⚡</span>
            {getTerm('Vital Energy Level', '生命能量水平')}
          </h3>
          <div className="flex items-center gap-6">
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="rgba(59, 130, 246, 0.2)"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="url(#destinyGradient)"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${faceReadingData.energyScore * 3.52} 352`}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="destinyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#60a5fa" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-900">{faceReadingData.energyScore}</div>
                  <div className="text-sm text-slate-600">/100</div>
                </div>
              </div>
            </div>
            <div>
              <p className="text-slate-700 mb-2">
                {getTerm('Your facial energy indicates your life force and vitality level.', '你的面部能量显示了你的生命力和活力水平。')}
              </p>
              <p className="text-slate-600 text-sm">
                {getTerm(`Confidence: ${faceReadingData.confidenceLevel}%`, `置信度: ${faceReadingData.confidenceLevel}%`)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  // Switch statement to render content based on activeTab
  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverview()
      case "features":
        return renderFeatures()
      case "personality":
        return renderPersonality()
      case "character":
        return renderCharacter()
      case "destiny":
        return renderDestiny()
      case "ask-the-seer":
        return (
          <div className="space-y-6 mt-6">
            <FaceReadingSeerChatInterface
              analysis={analysis}
              userId={user?.uid}
              userProfile={authUserProfile}
              sessionId={undefined}
            />
          </div>
        )
      default:
        return renderOverview()
    }
  }

  // If activeTab matches one of the main content tabs, show that content
  const mainTabs = ['overview', 'features', 'personality', 'character', 'destiny', 'ask-the-seer']
  if (activeTab && mainTabs.includes(activeTab)) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {renderContent()}
      </motion.div>
    )
  }

  // Otherwise show the coach interface (default view)
  return (
    <Card className="bg-amber-50/80 border-2 border-amber-300 shadow-md">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-amber-900 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-amber-600" />
          Facial Wisdom Coach
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="coaching" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-transparent p-0 gap-2">
            <TabsTrigger value="coaching" className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md rounded-xl px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 data-[state=inactive]:hover:bg-amber-100/50 transition-all">Ask Coach</TabsTrigger>
            <TabsTrigger value="insights" className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md rounded-xl px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 data-[state=inactive]:hover:bg-amber-100/50 transition-all">Insights</TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md rounded-xl px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 data-[state=inactive]:hover:bg-amber-100/50 transition-all">History</TabsTrigger>
          </TabsList>

          <TabsContent value="coaching" className="space-y-4">
            {/* Question Input */}
            <div className="space-y-3">
              <Textarea
                placeholder="Ask your facial wisdom coach about your features, personality, or life path..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="bg-white border-2 border-amber-200 text-slate-700 placeholder:text-slate-400"
                rows={3}
              />
              <Button
                onClick={handleAskQuestion}
                disabled={!question.trim() || isAsking}
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white"
              >
                {isAsking ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Consulting facial wisdom...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Ask Coach
                  </>
                )}
              </Button>
            </div>

            {/* Current Response */}
            {currentResponse && (
              <Card className="bg-white border-2 border-amber-200 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-medium text-amber-900">Coach's Response</span>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">{currentResponse}</p>
                </CardContent>
              </Card>
            )}

            {/* Quick Questions */}
            <Card className="bg-white border-2 border-amber-200 shadow-sm">
              <CardContent className="p-4">
                <h4 className="text-sm font-medium text-amber-900 mb-3">Quick Questions</h4>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    "How can I enhance my natural facial features?",
                    "What career path aligns with my facial energy?",
                    "How can I balance my facial elements?",
                    "What does my face reveal about my life purpose?"
                  ].map((quickQuestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => setQuestion(quickQuestion)}
                      className="justify-start text-left h-auto p-3 border-2 border-amber-200 text-slate-700 hover:bg-amber-50 hover:border-amber-300"
                    >
                      <ArrowRight className="w-3 h-3 mr-2 flex-shrink-0" />
                      <span className="text-xs text-slate-700">{quickQuestion}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {/* Strengths */}
                <Card className="bg-green-50/80 border-2 border-green-300 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-900">Your Strengths</span>
                    </div>
                    <div className="space-y-2">
                      {faceReadingData.coaching.strengths.map((strength, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm text-slate-700">{strength}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Challenges */}
                <Card className="bg-yellow-50/80 border-2 border-yellow-300 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-900">Growth Challenges</span>
                    </div>
                    <div className="space-y-2">
                      {faceReadingData.coaching.challenges.map((challenge, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm text-slate-700">{challenge}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Growth Areas */}
                <Card className="bg-blue-50/80 border-2 border-blue-300 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Lightbulb className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">Growth Areas</span>
                    </div>
                    <div className="space-y-2">
                      {faceReadingData.coaching.growthAreas.map((area, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm text-slate-700">{area}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Affirmations */}
                <Card className="bg-purple-50/80 border-2 border-purple-300 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Heart className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-900">Daily Affirmations</span>
                    </div>
                    <div className="space-y-3">
                      {faceReadingData.coaching.affirmations.map((affirmation, index) => (
                        <div key={index} className="bg-white rounded-lg p-3 border-2 border-purple-200">
                          <p className="text-sm text-slate-700 italic">"{affirmation}"</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <ScrollArea className="h-96">
              {coaching.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600">No coaching history yet</p>
                  <p className="text-sm text-slate-500">Ask your first question to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {coaching.map((session) => (
                    <Card key={session.id} className="bg-white border-2 border-amber-200 shadow-sm">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-amber-600" />
                            <span className="text-xs text-slate-600">
                              {new Date(session.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <h4 className="text-sm font-medium text-amber-900 mb-1">Question:</h4>
                            <p className="text-sm text-slate-700">{session.question}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-amber-900 mb-1">Response:</h4>
                            <p className="text-sm text-slate-700">{session.response}</p>
                          </div>
                          {session.insights.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-amber-900 mb-1">Insights:</h4>
                              <div className="space-y-1">
                                {session.insights.map((insight, index) => (
                                  <div key={index} className="flex items-start gap-2">
                                    <div className="w-1 h-1 bg-amber-600 rounded-full mt-2 flex-shrink-0"></div>
                                    <span className="text-xs text-slate-600">{insight}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
} 