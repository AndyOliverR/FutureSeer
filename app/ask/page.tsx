"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Sparkles, 
  Search, 
  Star, 
  Clock, 
  Heart, 
  Zap, 
  Shield, 
  Gem, 
  Watch,
  Circle,
  Diamond,
  Palette,
  Music,
  BookOpen,
  Calendar,
  MapPin,
  User,
  Camera,
  Hand
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { getAstroData } from '@/lib/api'
import { generateAIPrediction } from '@/lib/api'
import { predictiveSystem } from '@/lib/predictiveAlgorithms'
import { generatePersonalizedRemedies } from '@/lib/remedyDatabase'

interface ComprehensivePrediction {
  question: string
  aiPrediction: string
  astroData: any
  numerologyData: any
  faceReadingData: any
  palmReadingData: any
  markovPrediction: any
  bayesianPrediction: any
  combinedPrediction: string
  confidence: number
  timing: string
  remedies: Remedy[]
  recommendations: string[]
  timestamp: number
}

interface Remedy {
  id: string
  type: 'gemstone' | 'color' | 'metal' | 'timing' | 'action' | 'crystal' | 'accessory' | 'mantra' | 'mudra' | 'ritual' | 'diet' | 'lifestyle'
  title: string
  description: string
  icon: React.ReactNode
  priority: 'high' | 'medium' | 'low'
  instructions: string[]
  benefits: string[]
  contraindications?: string[]
  activationTime?: string
  duration?: string
  frequency?: string
  cost?: 'free' | 'low' | 'medium' | 'high'
  difficulty?: 'easy' | 'moderate' | 'advanced'
  astrologicalTriggers?: string[]
  numerologicalTriggers?: string[]
  elementalAssociations?: string[]
  planetaryRulers?: string[]
}

export default function AskPage() {
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [prediction, setPrediction] = useState<ComprehensivePrediction | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Mock user profile (replace with actual user data)
  const userProfile = {
    fullName: 'Andy Oliver Rozario',
    birthDate: '1990-01-01',
    birthTime: '12:00',
    birthPlace: 'Mumbai, India',
    selfieImage: null,
    palmImage: null
  }

  const generateRemedies = (astroData: any, numerologyData: any, question: string): Remedy[] => {
    // Mock face reading and palm reading data for now
    const faceReadingData = {
      eyeShape: 'almond',
      noseType: 'straight',
      mouthShape: 'full',
      foreheadType: 'high',
      personalityTraits: ['Intelligent', 'Creative', 'Ambitious'],
      communicationStyle: 'Direct and clear',
      hiddenTalents: ['Leadership', 'Innovation']
    }

    const palmReadingData = {
      lifeLine: 'Long and clear',
      heartLine: 'Curved and deep',
      headLine: 'Straight and strong',
      fateLine: 'Present and clear',
      lifePath: 'Success in business and relationships',
      challenges: 'Patience and timing',
      opportunities: 'Leadership and innovation'
    }

    // Use the comprehensive remedy database
    return generatePersonalizedRemedies(
      astroData,
      numerologyData,
      faceReadingData,
      palmReadingData,
      question,
      userProfile
    )
  }

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim()) {
      setError('Please enter your question')
      return
    }

    setLoading(true)
    setError(null)
    setPrediction(null)
    setRevealed(false)
    setBookmarked(false)

    try {
      // Step 1: Get astrological data
      const astroData = await getAstroData(userProfile.birthDate, userProfile.birthPlace, 'user123')
      
      // Step 2: Generate numerology data (mock for now)
      const numerologyData = {
        lifePathNumber: 5,
        destinyNumber: 7,
        missingNumbers: [5, 7],
        personalYearNumber: 3,
        karmicDebts: [],
        masterNumbers: []
      }

      // Step 3: Generate face reading data (mock for now)
      const faceReadingData = {
        eyeShape: 'almond',
        noseType: 'straight',
        mouthShape: 'full',
        foreheadType: 'high',
        personalityTraits: ['Intelligent', 'Creative', 'Ambitious'],
        communicationStyle: 'Direct and clear',
        hiddenTalents: ['Leadership', 'Innovation']
      }

      // Step 4: Generate palm reading data (mock for now)
      const palmReadingData = {
        lifeLine: 'Long and clear',
        heartLine: 'Curved and deep',
        headLine: 'Straight and strong',
        fateLine: 'Present and clear',
        lifePath: 'Success in business and relationships',
        challenges: 'Patience and timing',
        opportunities: 'Leadership and innovation'
      }

      // Step 5: Generate AI prediction
      const aiPrediction = await generateAIPrediction(question, astroData, {
        primarySymbol: 'Star',
        elementalInfluence: 'Fire',
        cosmicAlignment: 'Harmonious',
        timing: 'Favorable'
      })

      // Step 6: Generate advanced predictions using our algorithms
      const advancedPrediction = await predictiveSystem.generateComprehensivePrediction(
        'user123',
        'current_state',
        astroData,
        numerologyData,
        ['spiritual', 'career_focused'],
        { question, userProfile }
      )

      // Step 7: Generate remedies
      const remedies = generateRemedies(astroData, numerologyData, question)

      // Step 8: Create comprehensive prediction
      const comprehensivePrediction: ComprehensivePrediction = {
        question,
        aiPrediction,
        astroData,
        numerologyData,
        faceReadingData,
        palmReadingData,
        markovPrediction: advancedPrediction.markovPrediction,
        bayesianPrediction: advancedPrediction.bayesianPrediction,
        combinedPrediction: advancedPrediction.combinedPrediction,
        confidence: advancedPrediction.confidence,
        timing: advancedPrediction.timing,
        remedies,
        recommendations: advancedPrediction.recommendations,
        timestamp: Date.now()
      }

      setPrediction(comprehensivePrediction)
      setRevealed(true)

      toast({
        title: '🔮 Mystical Insights Revealed!',
        description: 'Your comprehensive prediction is ready.',
      })

    } catch (error) {
      console.error('Error generating prediction:', error)
      setError('Failed to generate prediction. Please try again.')
      toast({
        title: 'Prediction Failed',
        description: 'Unable to generate mystical insights at this time.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleBookmark = () => {
    setBookmarked(!bookmarked)
    toast({
      title: bookmarked ? 'Removed from bookmarks' : 'Added to bookmarks',
      description: bookmarked ? 'Prediction removed from saved items.' : 'Prediction saved for later reference.',
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Ask the <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500">Seer</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Your exclusive gateway to combined mystical insights. Ask any question and receive a comprehensive analysis 
            combining astrology, numerology, face reading, palmistry, and advanced predictive algorithms.
          </p>
          
          {/* User Profile Summary */}
          <div className="bg-slate-800/50 rounded-lg p-4 mb-8">
            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-amber-400" />
                <span className="text-gray-300">{userProfile.fullName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                <span className="text-gray-300">{userProfile.birthDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">{userProfile.birthTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-400" />
                <span className="text-gray-300">{userProfile.birthPlace}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Question Form */}
        <Card className="bg-slate-800/50 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Sparkles className="w-6 h-6 text-amber-400" />
              Ask Your Question
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAsk} className="space-y-4">
              <div>
                <Textarea
                  placeholder="Ask anything about your life, relationships, career, health, or spiritual journey..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="min-h-[120px] text-lg bg-slate-700 border-slate-600 text-white placeholder-gray-400"
                  disabled={loading}
                />
              </div>
              
              {error && (
                <div className="text-red-400 text-sm bg-red-900/20 p-3 rounded-lg">
                  {error}
                </div>
              )}
              
              <Button
                type="submit"
                disabled={loading || !question.trim()}
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-semibold py-3 text-lg"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Consulting the Cosmos...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Search className="w-5 h-5" />
                    Ask the Seer
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Prediction Results */}
        {prediction && (
          <div className="space-y-8">
            {/* Main Prediction */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Star className="w-6 h-6 text-amber-400" />
                    Mystical Insights
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-green-500 text-white">
                      {Math.round(prediction.confidence * 100)}% Confidence
                    </Badge>
                    <Button
                      onClick={handleBookmark}
                      variant="outline"
                      size="sm"
                      className={bookmarked ? 'bg-amber-500 text-white' : ''}
                    >
                      {bookmarked ? 'Bookmarked' : 'Bookmark'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3">🔮 Combined Prediction</h3>
                  <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                    {prediction.combinedPrediction}
                  </p>
                </div>
                
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3">🤖 AI Oracle Response</h3>
                  <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                    {prediction.aiPrediction}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-700/50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-green-400" />
                      Timing
                    </h4>
                    <p className="text-sm text-gray-300">{prediction.timing}</p>
                  </div>
                  
                  <div className="bg-slate-700/50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      Energy
                    </h4>
                    <p className="text-sm text-gray-300">Harmonious & Favorable</p>
                  </div>
                  
                  <div className="bg-slate-700/50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-blue-400" />
                      Protection
                    </h4>
                    <p className="text-sm text-gray-300">Strong cosmic shield active</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Remedies Section */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Gem className="w-6 h-6 text-amber-400" />
                  Personalized Remedies & Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {prediction.remedies.map((remedy, index) => (
                    <Card key={index} className="bg-slate-700/50 border-slate-600">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {remedy.icon}
                            <CardTitle className="text-lg">{remedy.title}</CardTitle>
                          </div>
                          <Badge 
                            variant={remedy.priority === 'high' ? 'default' : 'secondary'}
                            className={
                              remedy.priority === 'high' 
                                ? 'bg-red-500 text-white' 
                                : remedy.priority === 'medium'
                                ? 'bg-yellow-500 text-white'
                                : 'bg-green-500 text-white'
                            }
                          >
                            {remedy.priority}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-gray-300">{remedy.description}</p>
                        
                        <div>
                          <h5 className="font-semibold text-sm mb-2">Instructions:</h5>
                          <ul className="text-xs text-gray-400 space-y-1">
                            {remedy.instructions.map((instruction, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-amber-400 mt-1">•</span>
                                {instruction}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h5 className="font-semibold text-sm mb-2">Benefits:</h5>
                          <ul className="text-xs text-gray-400 space-y-1">
                            {remedy.benefits.map((benefit, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-green-400 mt-1">✓</span>
                                {benefit}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Additional Recommendations */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Heart className="w-6 h-6 text-red-400" />
                  Additional Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg">📚 Spiritual Practices</h4>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li>• Practice daily meditation for 15 minutes</li>
                      <li>• Read spiritual literature before bed</li>
                      <li>• Keep a gratitude journal</li>
                      <li>• Connect with nature regularly</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg">🎯 Action Steps</h4>
                    <ul className="space-y-2 text-sm text-gray-300">
                      {prediction.recommendations.map((rec, index) => (
                        <li key={index}>• {rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
} 