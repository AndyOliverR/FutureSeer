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
  Hand,
  Leaf
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { getAstroData } from '@/lib/api'
import { generateAIPrediction } from '@/lib/api'
import { predictiveSystem } from '@/lib/predictiveAlgorithms'
import { generateHolisticRemedies } from '@/lib/comprehensiveRemedyGenerator'
import { ComprehensiveRemedy } from '@/lib/comprehensiveRemedyDatabase'

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
  remedies: ComprehensiveRemedy[]
  recommendations: string[]
  timestamp: number
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
    fullName: 'Andy Rozario',
    dateOfBirth: '1990-01-01',
    timeOfBirth: '12:00',
    placeOfBirth: 'Mumbai, India',
    email: 'andyoliverrozario2@gmail.com'
  }

  // Mock comprehensive system data (replace with actual data)
  const mockSystemData = {
    // Astrological Data
    vedicAstrology: {
      nakshatra: 'Ashwini',
      dosha: 'Vata',
      sunSign: 'Capricorn',
      moonSign: 'Cancer',
      risingSign: 'Libra'
    },
    westernAstrology: {
      sunSign: 'Capricorn',
      moonSign: 'Cancer',
      risingSign: 'Libra',
      houses: { first: 'Libra', second: 'Scorpio' }
    },
    medicalAstrology: {
      weakPlanets: ['Mars', 'Saturn'],
      healthAreas: ['Digestive', 'Nervous']
    },
    financialAstrology: {
      wealthPlanets: ['Jupiter', 'Venus'],
      investmentTiming: 'Waxing Moon'
    },
    
    // Numerology Data
    chaldeanNumerology: {
      lifePathNumber: 7,
      missingNumbers: [5, 7],
      destinyNumber: 3,
      personalYear: 2024
    },
    angelNumbers: {
      currentSequence: '111',
      frequentNumbers: ['111', '222', '333']
    },
    kabbalisticNumerology: {
      nameValue: 15,
      spiritualPath: 'Wisdom'
    },
    
    // Divination Data
    tarot: {
      majorArcana: ['Fool', 'Magician'],
      currentInfluence: 'New Beginnings'
    },
    runes: {
      primaryRune: 'Fehu',
      energy: 'Abundance'
    },
    iching: {
      primaryHexagram: '1',
      meaning: 'Creative Force'
    },
    
    // Reading Data
    palmistry: {
      weakLines: ['Life Line', 'Heart Line'],
      strongLines: ['Head Line']
    },
    faceReading: {
      eyeShape: 'Almond',
      noseType: 'Straight',
      personalityTraits: ['Intelligent', 'Creative']
    },
    
    // Specialized Data
    vastu: {
      weakDirections: ['North', 'East'],
      strongDirections: ['South', 'West']
    },
    bazi: {
      primaryElement: 'Wood',
      weakElement: 'Metal'
    },
    dreamSymbols: {
      frequentSymbols: ['Water', 'Flying'],
      interpretation: 'Emotional Freedom'
    },
    
    // Profile Data
    userProfile,
    currentLifeArea: 'Career'
  }

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim()) {
      toast({
        title: "Question Required",
        description: "Please enter your question for the Seer.",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    setError(null)
    setRevealed(false)

    try {
      // Get astrological data
      const astroData = await getAstroData(userProfile.dateOfBirth, userProfile.timeOfBirth, userProfile.placeOfBirth, 'user123')
      
      // Generate AI prediction
      const symbolicData = {
        primarySymbol: 'Star',
        elementalInfluence: 'Fire',
        cosmicAlignment: 'Harmonious',
        timing: 'Favorable'
      }
      const aiPrediction = await generateAIPrediction(question, astroData, symbolicData)
      
      // Generate advanced predictions using Markov Chain and Bayesian Networks
      const advancedPrediction = await predictiveSystem.generateComprehensivePrediction(
        'user123',
        'current_state',
        astroData,
        mockSystemData.chaldeanNumerology,
        ['career_focused', 'spiritual_seeker'],
        { question, lifeArea: 'career' }
      )
      
      // Generate comprehensive remedies using ALL systems
      const comprehensiveRemedies = generateHolisticRemedies(mockSystemData, question)
      
      // Create comprehensive prediction
      const comprehensivePrediction: ComprehensivePrediction = {
        question,
        aiPrediction: aiPrediction.prediction,
        astroData,
        numerologyData: mockSystemData.chaldeanNumerology,
        faceReadingData: mockSystemData.faceReading,
        palmReadingData: mockSystemData.palmistry,
        markovPrediction: advancedPrediction.markovPrediction,
        bayesianPrediction: advancedPrediction.bayesianPrediction,
        combinedPrediction: advancedPrediction.combinedPrediction,
        confidence: advancedPrediction.confidence,
        timing: advancedPrediction.timing,
        remedies: comprehensiveRemedies,
        recommendations: advancedPrediction.recommendations,
        timestamp: Date.now()
      }

      setPrediction(comprehensivePrediction)
      toast({
        title: "Divine Wisdom Received",
        description: "The Seer has revealed your cosmic guidance.",
      })
    } catch (err) {
      console.error('Error generating prediction:', err)
      setError('Failed to connect with the divine realm. Please try again.')
      toast({
        title: "Connection Error",
        description: "Unable to reach the mystical realm. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const getRemedyIcon = (type: string) => {
    switch (type) {
      case 'gemstone': return <Gem className="w-5 h-5 text-blue-500" />
      case 'color': return <Palette className="w-5 h-5 text-purple-500" />
      case 'crystal': return <Circle className="w-5 h-5 text-white" />
      case 'accessory': return <Watch className="w-5 h-5 text-green-500" />
      case 'mantra': return <Music className="w-5 h-5 text-yellow-500" />
      case 'mudra': return <Hand className="w-5 h-5 text-pink-500" />
      case 'ritual': return <Sparkles className="w-5 h-5 text-amber-500" />
      case 'diet': return <Leaf className="w-5 h-5 text-green-500" />
      case 'lifestyle': return <Heart className="w-5 h-5 text-red-500" />
      default: return <Star className="w-5 h-5 text-gold-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500 text-white'
      case 'high': return 'bg-orange-500 text-white'
      case 'medium': return 'bg-yellow-500 text-black'
      case 'low': return 'bg-green-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <h1 className="text-5xl font-bold gold-glow mb-4">🔮 Ask the Seer</h1>
          <p className="text-soft leading-relaxed text-lg mb-4">
            Divine wisdom from ALL mystical systems combined for your ultimate guidance
          </p>
          <div className="glass-card rounded-2xl p-6 border border-purple-500/20 max-w-2xl mx-auto">
            <p className="text-xl italic text-purple-300 font-serif mb-2">
              "When all systems align, the universe speaks with one voice, revealing the path to your destiny."
            </p>
            <p className="text-soft/70 text-sm">— FutureSeer Oracle</p>
          </div>
        </div>

        {/* Question Form */}
        <Card className="glass-card border-purple-500/20 mb-8">
          <CardHeader>
            <CardTitle className="text-2xl gold-glow text-center">Your Sacred Question</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAsk} className="space-y-4">
              <Textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask anything about your life, destiny, relationships, career, health, or spiritual path..."
                className="min-h-[120px] text-lg"
                disabled={loading}
              />
              <Button 
                type="submit" 
                disabled={loading || !question.trim()}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Consulting the Divine Realm...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Ask the Seer
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="glass-card border-red-500/20 mb-8">
            <CardContent className="pt-6">
              <div className="text-red-400 text-center">
                <p className="text-lg">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Prediction Results */}
        {prediction && (
          <div className="space-y-8">
            {/* Combined Prediction */}
            <Card className="glass-card border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-2xl gold-glow flex items-center gap-2">
                  <Sparkles className="w-6 h-6" />
                  Divine Oracle Response
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-xl p-6 border border-purple-500/20">
                  <p className="text-lg leading-relaxed text-white">
                    {prediction.combinedPrediction}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-slate-800/50 rounded-xl">
                    <Clock className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                    <h4 className="font-semibold text-blue-400">Timing</h4>
                    <p className="text-sm text-gray-300">{prediction.timing}</p>
                  </div>
                  <div className="text-center p-4 bg-slate-800/50 rounded-xl">
                    <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                    <h4 className="font-semibold text-yellow-400">Energy</h4>
                    <p className="text-sm text-gray-300">High Cosmic Alignment</p>
                  </div>
                  <div className="text-center p-4 bg-slate-800/50 rounded-xl">
                    <Shield className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <h4 className="font-semibold text-green-400">Protection</h4>
                    <p className="text-sm text-gray-300">Divine Shield Active</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Comprehensive Remedies */}
            <Card className="glass-card border-amber-500/20">
              <CardHeader>
                <CardTitle className="text-2xl gold-glow flex items-center gap-2">
                  <Gem className="w-6 h-6" />
                  Your Personalized Remedy Program
                </CardTitle>
                <p className="text-soft">
                  Holistic solutions from ALL mystical systems combined for your unique profile
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {prediction.remedies.map((remedy, index) => (
                    <Card key={remedy.id} className="bg-slate-800/50 border-slate-600">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {remedy.icon}
                            <CardTitle className="text-lg">{remedy.title}</CardTitle>
                          </div>
                          <Badge className={getPriorityColor(remedy.priority)}>
                            {remedy.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-400">{remedy.system} • {remedy.category}</p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-gray-300">{remedy.description}</p>
                        
                        <div>
                          <h5 className="font-semibold text-sm mb-2 text-amber-400">Instructions:</h5>
                          <ul className="text-xs text-gray-400 space-y-1">
                            {remedy.instructions.slice(0, 3).map((instruction, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-amber-400 mt-1">•</span>
                                {instruction}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h5 className="font-semibold text-sm mb-2 text-green-400">Benefits:</h5>
                          <ul className="text-xs text-gray-400 space-y-1">
                            {remedy.benefits.slice(0, 2).map((benefit, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-green-400 mt-1">✓</span>
                                {benefit}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Cost: {remedy.cost}</span>
                          <span>Difficulty: {remedy.difficulty}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <div className="mt-6 p-4 bg-gradient-to-r from-amber-900/30 to-orange-900/30 rounded-xl border border-amber-500/20">
                  <h4 className="text-lg font-semibold text-amber-400 mb-2">🌟 Holistic Integration</h4>
                  <p className="text-sm text-gray-300">
                    These remedies work synergistically across all mystical systems. Each remedy enhances the others, 
                    creating a powerful transformation program tailored specifically to your unique cosmic blueprint.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* System Integration Summary */}
            <Card className="glass-card border-cyan-500/20">
              <CardHeader>
                <CardTitle className="text-2xl gold-glow flex items-center gap-2">
                  <Sparkles className="w-6 h-6" />
                  Systems Integration Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {[
                    { name: 'Vedic', icon: '🕉️', status: 'Active' },
                    { name: 'Western', icon: '♈', status: 'Active' },
                    { name: 'Numerology', icon: '🔢', status: 'Active' },
                    { name: 'Tarot', icon: '🃏', status: 'Active' },
                    { name: 'Palmistry', icon: '✋', status: 'Active' },
                    { name: 'Face Reading', icon: '👤', status: 'Active' },
                    { name: 'Vastu', icon: '🏠', status: 'Active' },
                    { name: 'Bazi', icon: '🐉', status: 'Active' },
                    { name: 'I Ching', icon: '☯️', status: 'Active' },
                    { name: 'Runes', icon: 'ᚱ', status: 'Active' },
                    { name: 'Angel Numbers', icon: '👼', status: 'Active' },
                    { name: 'Dream Symbols', icon: '💭', status: 'Active' }
                  ].map((system) => (
                    <div key={system.name} className="text-center p-3 bg-slate-800/50 rounded-xl">
                      <div className="text-2xl mb-1">{system.icon}</div>
                      <div className="text-xs font-semibold text-gray-300">{system.name}</div>
                      <div className="text-xs text-green-400">{system.status}</div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 p-4 bg-gradient-to-r from-cyan-900/30 to-blue-900/30 rounded-xl border border-cyan-500/20">
                  <h4 className="text-lg font-semibold text-cyan-400 mb-2">🔮 Comprehensive Analysis</h4>
                  <p className="text-sm text-gray-300">
                    All 12+ mystical systems have been analyzed and integrated to provide you with the most 
                    comprehensive and accurate guidance possible. This is the power of FutureSeer's holistic approach.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
} 