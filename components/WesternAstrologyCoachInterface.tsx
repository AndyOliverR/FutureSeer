"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  MessageSquare, 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Star,
  Sun,
  Moon,
  Target,
  Heart,
  Brain,
  Zap,
  Compass,
  Loader2,
  Lightbulb,
  BookOpen,
  TrendingUp
} from "lucide-react"
import { useWesternAstrology } from "@/hooks/use-western-astrology"

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export const WesternAstrologyCoachInterface = () => {
  const { data: chartData } = useWesternAstrology()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hello! I'm your Western Astrology AI coach. I can help you understand your astrological chart, interpret planetary aspects, explain elemental influences, and guide you through current transits. What would you like to explore about your Western astrology chart?",
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const response = generateCoachResponse(inputMessage, chartData)
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1500)
  }

  const generateCoachResponse = (userInput: string, chartData: any): string => {
    const input = userInput.toLowerCase()
    
    if (!chartData) {
      return "I'd love to help you with your Western astrology questions! However, I don't see your birth chart data yet. Please first generate your astrological chart using the Analysis tab, and then I can provide personalized guidance based on your specific planetary positions and aspects."
    }

    // Sun sign questions
    if (input.includes('sun sign') || input.includes('sun') || input.includes('personality')) {
      return `Your Sun sign is ${chartData.sunSign}, which represents your core personality and life purpose. ${chartData.sunSign} individuals are known for their ${getSunSignTraits(chartData.sunSign)}. This is the essence of who you are and how you express your fundamental nature.`
    }

    // Moon sign questions
    if (input.includes('moon sign') || input.includes('moon') || input.includes('emotional')) {
      return `Your Moon sign is ${chartData.moonSign}, which governs your emotional nature and inner self. ${chartData.moonSign} Moon individuals tend to ${getMoonSignTraits(chartData.moonSign)}. This shows how you process emotions and what makes you feel secure.`
    }

    // Rising sign questions
    if (input.includes('rising') || input.includes('ascendant') || input.includes('appearance')) {
      return `Your Rising sign (Ascendant) is ${chartData.risingSign}, which represents how you present yourself to the world and your first impressions. ${chartData.risingSign} Rising individuals often ${getRisingSignTraits(chartData.risingSign)}. This is the mask you wear and how others initially see you.`
    }

    // Elemental balance questions
    if (input.includes('element') || input.includes('fire') || input.includes('earth') || input.includes('air') || input.includes('water')) {
      const dominantElement = getDominantElement(chartData.elementalBalance)
      return `Looking at your elemental balance, you have ${chartData.elementalBalance.fire}% Fire, ${chartData.elementalBalance.earth}% Earth, ${chartData.elementalBalance.air}% Air, and ${chartData.elementalBalance.water}% Water. Your dominant element is ${dominantElement}, which means you naturally ${getElementTraits(dominantElement)}.`
    }

    // Planetary aspects questions
    if (input.includes('planet') || input.includes('aspect') || input.includes('mercury') || input.includes('venus') || input.includes('mars')) {
      return `Your planetary positions show interesting dynamics. For example, ${chartData.planetaryPositions[0]?.name} in ${chartData.planetaryPositions[0]?.sign} indicates ${getPlanetaryTraits(chartData.planetaryPositions[0]?.name, chartData.planetaryPositions[0]?.sign)}. The aspects between planets create unique energy patterns that influence your personality and life experiences.`
    }

    // Current transits questions
    if (input.includes('transit') || input.includes('current') || input.includes('now')) {
      return `Current transits are affecting your chart in interesting ways. ${chartData.currentTransits[0]?.planet} is currently ${chartData.currentTransits[0]?.aspect} your natal ${chartData.currentTransits[0]?.aspect}, which suggests ${chartData.currentTransits[0]?.interpretation}. This is a time for ${getTransitAdvice(chartData.currentTransits[0]?.aspect)}.`
    }

    // General guidance
    return `That's a great question about Western astrology! Based on your chart, I can see that ${chartData.sunSign} Sun with ${chartData.moonSign} Moon creates a ${getCompatibilityTrait(chartData.sunSign, chartData.moonSign)} personality. Your ${chartData.risingSign} Rising sign adds ${getRisingSignTraits(chartData.risingSign)} to your outward expression. Is there a specific area of your chart you'd like to explore deeper?`
  }

  const getSunSignTraits = (sign: string): string => {
    const traits: { [key: string]: string } = {
      'Aries': 'bold leadership, pioneering spirit, and dynamic energy',
      'Taurus': 'steadfast determination, practical wisdom, and sensual appreciation',
      'Gemini': 'versatile communication, intellectual curiosity, and social adaptability',
      'Cancer': 'nurturing intuition, emotional depth, and protective instincts',
      'Leo': 'creative self-expression, natural leadership, and warm generosity',
      'Virgo': 'analytical precision, service-oriented nature, and practical efficiency',
      'Libra': 'diplomatic balance, aesthetic appreciation, and harmonious relationships',
      'Scorpio': 'intense passion, transformative power, and deep psychological insight',
      'Sagittarius': 'philosophical wisdom, adventurous spirit, and optimistic expansion',
      'Capricorn': 'ambitious discipline, practical achievement, and responsible leadership',
      'Aquarius': 'innovative thinking, humanitarian ideals, and independent originality',
      'Pisces': 'compassionate spirituality, artistic sensitivity, and intuitive understanding'
    }
    return traits[sign] || 'unique characteristics and personal expression'
  }

  const getMoonSignTraits = (sign: string): string => {
    const traits: { [key: string]: string } = {
      'Aries': 'react emotionally with immediate passion and courage',
      'Taurus': 'seek emotional security through stability and sensual comforts',
      'Gemini': 'process emotions through communication and mental exploration',
      'Cancer': 'experience deep emotional sensitivity and nurturing instincts',
      'Leo': 'express emotions with dramatic flair and warm-hearted generosity',
      'Virgo': 'analyze emotions practically and find security through service',
      'Libra': 'balance emotions through relationships and aesthetic harmony',
      'Scorpio': 'experience intense emotional depth and transformative feelings',
      'Sagittarius': 'process emotions through philosophical understanding and adventure',
      'Capricorn': 'approach emotions with practical discipline and emotional reserve',
      'Aquarius': 'experience emotions through intellectual detachment and humanitarian concern',
      'Pisces': 'feel emotions with spiritual sensitivity and compassionate empathy'
    }
    return traits[sign] || 'process emotions in their own unique way'
  }

  const getRisingSignTraits = (sign: string): string => {
    const traits: { [key: string]: string } = {
      'Aries': 'appear confident, energetic, and ready for action',
      'Taurus': 'present as stable, patient, and physically grounded',
      'Gemini': 'seem communicative, curious, and mentally alert',
      'Cancer': 'appear nurturing, protective, and emotionally sensitive',
      'Leo': 'present as warm, confident, and naturally charismatic',
      'Virgo': 'seem practical, modest, and detail-oriented',
      'Libra': 'appear diplomatic, charming, and aesthetically aware',
      'Scorpio': 'present as intense, mysterious, and psychologically penetrating',
      'Sagittarius': 'seem optimistic, adventurous, and philosophically minded',
      'Capricorn': 'appear responsible, ambitious, and professionally focused',
      'Aquarius': 'present as unique, independent, and intellectually innovative',
      'Pisces': 'seem dreamy, compassionate, and spiritually attuned'
    }
    return traits[sign] || 'present themselves in their own unique way'
  }

  const getDominantElement = (balance: any): string => {
    const elements = [
      { name: 'Fire', value: balance.fire },
      { name: 'Earth', value: balance.earth },
      { name: 'Air', value: balance.air },
      { name: 'Water', value: balance.water }
    ]
    return elements.reduce((a, b) => a.value > b.value ? a : b).name
  }

  const getElementTraits = (element: string): string => {
    const traits: { [key: string]: string } = {
      'Fire': 'express yourself with passion, creativity, and dynamic energy',
      'Earth': 'approach life with practicality, stability, and grounded wisdom',
      'Air': 'think and communicate with intellectual clarity and social awareness',
      'Water': 'feel and intuit with emotional depth and spiritual sensitivity'
    }
    return traits[element] || 'express your unique elemental nature'
  }

  const getPlanetaryTraits = (planet: string, sign: string): string => {
    return `a ${planet.toLowerCase()} expression that is ${sign.toLowerCase()} in nature, influencing how you ${getPlanetFunction(planet)}`
  }

  const getPlanetFunction = (planet: string): string => {
    const functions: { [key: string]: string } = {
      'Mercury': 'communicate and process information',
      'Venus': 'relate to others and appreciate beauty',
      'Mars': 'take action and express energy',
      'Jupiter': 'expand your horizons and seek wisdom',
      'Saturn': 'build structure and develop discipline',
      'Uranus': 'innovate and break from tradition',
      'Neptune': 'dream and connect spiritually',
      'Pluto': 'transform and access deep power'
    }
    return functions[planet] || 'express this planetary energy'
  }

  const getTransitAdvice = (aspect: string): string => {
    const advice: { [key: string]: string } = {
      'conjunction': 'new beginnings and fresh starts',
      'sextile': 'opportunities and harmonious growth',
      'square': 'challenges that lead to growth',
      'trine': 'flow and natural development',
      'opposition': 'awareness and relationship dynamics'
    }
    return advice[aspect] || 'personal development and growth'
  }

  const getCompatibilityTrait = (sun: string, moon: string): string => {
    return 'harmonious and balanced'
  }

  const suggestedQuestions = [
    "What does my Sun sign reveal about my personality?",
    "How does my Moon sign affect my emotions?",
    "What does my Rising sign say about how others see me?",
    "How do the elements in my chart influence me?",
    "What are the current transits affecting me?",
    "How do my planetary aspects work together?"
  ]

  return (
    <div className="space-y-6">
      {/* Chat Interface */}
      <div className="bg-slate-800/50 border border-slate-600 rounded-lg h-96 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.type === 'assistant' && (
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-gray-200'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
              {message.type === 'user' && (
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </motion.div>
          ))}
          
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 justify-start"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-slate-700 text-gray-200 px-4 py-2 rounded-lg">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-slate-600 p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask about your Western astrology chart..."
              className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Suggested Questions */}
      <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-blue-400" />
          Suggested Questions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {suggestedQuestions.map((question, index) => (
            <button
              key={index}
              onClick={() => setInputMessage(question)}
              className="text-left p-3 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg transition-colors text-sm text-gray-300 hover:text-white"
            >
              {question}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Summary */}
      {chartData && (
        <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-400" />
            Your Chart Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-slate-700/30 rounded-lg">
              <Sun className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
              <div className="text-sm text-gray-400">Sun</div>
              <div className="font-semibold text-white">{chartData.sunSign}</div>
            </div>
            <div className="text-center p-3 bg-slate-700/30 rounded-lg">
              <Moon className="w-6 h-6 text-silver-400 mx-auto mb-1" />
              <div className="text-sm text-gray-400">Moon</div>
              <div className="font-semibold text-white">{chartData.moonSign}</div>
            </div>
            <div className="text-center p-3 bg-slate-700/30 rounded-lg">
              <Compass className="w-6 h-6 text-orange-400 mx-auto mb-1" />
              <div className="text-sm text-gray-400">Rising</div>
              <div className="font-semibold text-white">{chartData.risingSign}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 