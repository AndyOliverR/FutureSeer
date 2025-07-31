"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { useAnalytics } from '@/lib/analytics'
import { MysticalCard } from '@/components/MysticalBackground'
import { ToolSymbol } from '@/components/MysticalSymbol'
import { 
  Sparkles, 
  Brain, 
  Heart, 
  Target, 
  Zap, 
  Star, 
  Moon, 
  Sun,
  Loader2,
  Send,
  RefreshCw,
  BookOpen,
  Lightbulb,
  Shield,
  Compass
} from 'lucide-react'

interface HolisticRemedy {
  id: string
  type: 'gemstone' | 'numerology' | 'astrology' | 'crystal' | 'meditation' | 'ritual'
  name: string
  description: string
  benefits: string[]
  instructions: string
  confidence: number
  symbol?: string
  color?: string
}

export default function AskPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const { trackAskTheSeer, trackToolAnalysis } = useAnalytics()
  
  const [question, setQuestion] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [remedies, setRemedies] = useState<HolisticRemedy[]>([])
  const [questionType, setQuestionType] = useState<string>('')
  const [analysisQuality, setAnalysisQuality] = useState<number>(0)

  // Question type detection
  useEffect(() => {
    if (question.trim()) {
      const lowerQuestion = question.toLowerCase()
      let detectedType = 'general'
      
      if (lowerQuestion.includes('love') || lowerQuestion.includes('relationship') || lowerQuestion.includes('romance')) {
        detectedType = 'love'
      } else if (lowerQuestion.includes('career') || lowerQuestion.includes('job') || lowerQuestion.includes('work')) {
        detectedType = 'career'
      } else if (lowerQuestion.includes('health') || lowerQuestion.includes('wellness') || lowerQuestion.includes('healing')) {
        detectedType = 'health'
      } else if (lowerQuestion.includes('money') || lowerQuestion.includes('finance') || lowerQuestion.includes('wealth')) {
        detectedType = 'finance'
      } else if (lowerQuestion.includes('spiritual') || lowerQuestion.includes('purpose') || lowerQuestion.includes('meaning')) {
        detectedType = 'spiritual'
      }
      
      setQuestionType(detectedType)
    }
  }, [question])

  const questionTypes = [
    { type: 'love', icon: Heart, label: 'Love & Relationships', color: 'bg-pink-500' },
    { type: 'career', icon: Target, label: 'Career & Success', color: 'bg-blue-500' },
    { type: 'health', icon: Shield, label: 'Health & Wellness', color: 'bg-green-500' },
    { type: 'finance', icon: Zap, label: 'Finance & Abundance', color: 'bg-yellow-500' },
    { type: 'spiritual', icon: Compass, label: 'Spiritual Growth', color: 'bg-purple-500' },
    { type: 'general', icon: Brain, label: 'General Guidance', color: 'bg-gray-500' }
  ]

  const handleSubmit = async () => {
    if (!question.trim()) {
      toast({
        title: 'Question Required',
        description: 'Please enter your mystical question',
        variant: 'destructive'
      })
      return
    }

    setIsAnalyzing(true)
    
    try {
      // Track the question
      trackAskTheSeer(questionType, {
        question_length: question.length,
        question_type: questionType,
        user_id: user?.uid
      })

      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Generate mock remedies
      const mockRemedies: HolisticRemedy[] = [
        {
          id: '1',
          type: 'gemstone',
          name: 'Rose Quartz',
          description: 'The stone of universal love and healing',
          benefits: ['Enhances love and relationships', 'Promotes emotional healing', 'Opens the heart chakra'],
          instructions: 'Wear as jewelry or place under your pillow',
          confidence: 0.92,
          symbol: '💎',
          color: '#FFB6C1'
        },
        {
          id: '2',
          type: 'numerology',
          name: 'Life Path Number 7',
          description: 'Your spiritual journey and inner wisdom',
          benefits: ['Deepens spiritual understanding', 'Enhances intuition', 'Promotes inner peace'],
          instructions: 'Meditate on the number 7 daily',
          confidence: 0.88,
          symbol: '7️⃣',
          color: '#800080'
        },
        {
          id: '3',
          type: 'meditation',
          name: 'Cosmic Alignment Meditation',
          description: 'Align your energy with universal forces',
          benefits: ['Brings clarity and focus', 'Reduces stress and anxiety', 'Connects with higher self'],
          instructions: 'Practice for 15 minutes daily at sunrise',
          confidence: 0.85,
          symbol: '🧘',
          color: '#4169E1'
        }
      ]
      
      setRemedies(mockRemedies)
      setAnalysisQuality(0.88)
      
      // Track analysis completion
      trackToolAnalysis('ask_the_seer', questionType, 0.88, {
        remedies_generated: mockRemedies.length,
        question_length: question.length
      })
      
      toast({
        title: 'Mystical Insights Revealed! 🌟',
        description: 'Your personalized remedies have been generated.',
      })
      
    } catch (error) {
      console.error('Analysis failed:', error)
      toast({
        title: 'Analysis Failed',
        description: 'Could not generate mystical insights. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const resetForm = () => {
    setQuestion('')
    setRemedies([])
    setQuestionType('')
    setAnalysisQuality(0)
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="text-6xl mb-4">🔮</div>
          <h1 className="text-4xl font-bold gold-glow mb-4">Ask the Seer</h1>
          <p className="text-soft text-lg leading-relaxed">
            Pose your deepest questions to our AI-powered mystical oracle. 
            Receive personalized insights combining astrology, numerology, and ancient wisdom.
          </p>
        </motion.div>

        {/* Question Input */}
        <MysticalCard className="mb-8">
          <div className="space-y-6">
            <div>
              <label className="text-soft text-sm mb-3 block">Your Mystical Question</label>
              <Textarea
                placeholder="Ask about love, career, health, spirituality, or any aspect of your life..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={4}
                className="bg-white/5 border-white/20 text-soft placeholder-gray-500 focus:border-amber-400"
                disabled={isAnalyzing}
              />
            </div>

            {/* Question Type Indicator */}
            {questionType && (
              <div className="flex items-center gap-2">
                <span className="text-soft text-sm">Detected:</span>
                {questionTypes.map((type) => (
                  type.type === questionType && (
                    <Badge key={type.type} className={type.color}>
                      <type.icon className="w-3 h-3 mr-1" />
                      {type.label}
                    </Badge>
                  )
                ))}
              </div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={handleSubmit}
                disabled={isAnalyzing || !question.trim()}
                className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Consulting the Stars...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Seek Mystical Guidance
                  </>
                )}
              </Button>
              
              {remedies.length > 0 && (
                <Button
                  variant="outline"
                  onClick={resetForm}
                  className="text-soft"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  New Question
                </Button>
              )}
            </div>
          </div>
        </MysticalCard>

        {/* Results */}
        {remedies.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Analysis Quality */}
            <MysticalCard>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Star className="w-5 h-5 text-amber-400" />
                  <span className="text-white font-semibold">Analysis Confidence</span>
                </div>
                <div className="text-2xl font-bold text-amber-400 mb-1">
                  {Math.round(analysisQuality * 100)}%
                </div>
                <p className="text-soft text-sm">
                  Based on cosmic alignment and mystical calculations
                </p>
              </div>
            </MysticalCard>

            {/* Remedies */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {remedies.map((remedy, index) => (
                <motion.div
                  key={remedy.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                >
                  <MysticalCard>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{remedy.symbol}</div>
                        <div>
                          <h3 className="text-white font-semibold">{remedy.name}</h3>
                          <Badge variant="outline" className="text-xs">
                            {remedy.type}
                          </Badge>
                        </div>
                      </div>
                      
                      <p className="text-soft text-sm">{remedy.description}</p>
                      
                      <div>
                        <h4 className="text-white text-sm font-medium mb-2">Benefits:</h4>
                        <ul className="space-y-1">
                          {remedy.benefits.map((benefit, i) => (
                            <li key={i} className="text-soft text-xs flex items-center gap-2">
                              <div className="w-1 h-1 bg-amber-400 rounded-full" />
                              {benefit}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="text-white text-sm font-medium mb-2">Instructions:</h4>
                        <p className="text-soft text-xs">{remedy.instructions}</p>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-soft text-xs">Confidence</span>
                        <span className="text-amber-400 text-sm font-semibold">
                          {Math.round(remedy.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                  </MysticalCard>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16"
        >
          <h2 className="text-2xl font-bold text-white text-center mb-8">Why Choose the Seer?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="glass-card border-white/10">
              <CardContent className="p-6 text-center">
                <Brain className="w-8 h-8 text-amber-400 mx-auto mb-3" />
                <h3 className="text-white font-semibold mb-2">AI-Powered Insights</h3>
                <p className="text-soft text-sm">Advanced algorithms combine multiple mystical traditions for accurate guidance.</p>
              </CardContent>
            </Card>
            
            <Card className="glass-card border-white/10">
              <CardContent className="p-6 text-center">
                <Heart className="w-8 h-8 text-amber-400 mx-auto mb-3" />
                <h3 className="text-white font-semibold mb-2">Personalized Remedies</h3>
                <p className="text-soft text-sm">Tailored solutions based on your unique cosmic blueprint and current situation.</p>
              </CardContent>
            </Card>
            
            <Card className="glass-card border-white/10">
              <CardContent className="p-6 text-center">
                <BookOpen className="w-8 h-8 text-amber-400 mx-auto mb-3" />
                <h3 className="text-white font-semibold mb-2">Ancient Wisdom</h3>
                <p className="text-soft text-sm">Drawing from centuries of mystical knowledge and spiritual traditions.</p>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 