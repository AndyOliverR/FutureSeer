import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { kpAstrologyIntelligence, KPAnalysis, KPQuestion, KPAnswer } from '@/lib/kpAstrologyIntelligence'
import { 
  Send, 
  Target, 
  Lightbulb, 
  Clock, 
  Heart, 
  TrendingUp, 
  Sparkles,
  MessageCircle,
  User,
  Bot,
  Calculator
} from 'lucide-react'

interface KPMessage {
  id: string
  type: 'user' | 'coach'
  content: string
  timestamp: Date
  coachingResponse?: KPAnswer
}

interface KPAstrologyCoachInterfaceProps {
  analysis?: KPAnalysis | null
}

export function KPAstrologyCoachInterface({ analysis }: KPAstrologyCoachInterfaceProps) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<KPMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [suggestedQuestions] = useState([
    "What does my KP chart reveal about my career timing?",
    "When is the best time for my relationship decisions?",
    "How can I use KP sub-lords for precise predictions?",
    "What does my KP chart say about my health timing?",
    "When should I make important financial decisions?",
    "How do I interpret KP cusps in my chart?",
    "What does my KP chart reveal about travel timing?",
    "How can I use KP for business decisions?"
  ])
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Helper function to determine question category
  const determineCategory = (question: string): KPQuestion['category'] => {
    const lower = question.toLowerCase()
    if (lower.includes('career') || lower.includes('job') || lower.includes('work') || lower.includes('profession')) return 'career'
    if (lower.includes('relationship') || lower.includes('marriage') || lower.includes('love') || lower.includes('partner')) return 'relationships'
    if (lower.includes('health') || lower.includes('illness') || lower.includes('medical') || lower.includes('disease')) return 'health'
    if (lower.includes('wealth') || lower.includes('money') || lower.includes('financial') || lower.includes('finance')) return 'wealth'
    if (lower.includes('education') || lower.includes('study') || lower.includes('learn') || lower.includes('school')) return 'education'
    if (lower.includes('travel') || lower.includes('journey') || lower.includes('trip') || lower.includes('foreign')) return 'travel'
    return 'general'
  }

  // Helper function to determine urgency
  const determineUrgency = (question: string): KPQuestion['urgency'] => {
    const lower = question.toLowerCase()
    if (lower.includes('urgent') || lower.includes('immediate') || lower.includes('now') || lower.includes('asap')) return 'high'
    if (lower.includes('soon') || lower.includes('near future') || lower.includes('coming')) return 'medium'
    return 'low'
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !user || isLoading || !analysis) return

    const userMessage: KPMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const questionText = inputValue.trim()
    setInputValue('')
    setIsLoading(true)

    try {
      // Create KP question
      const question: KPQuestion = {
        question: questionText,
        category: determineCategory(questionText),
        urgency: determineUrgency(questionText)
      }

      // Get answer from KP intelligence service
      const answer = await kpAstrologyIntelligence.answerQuestion(analysis, question)

      const coachMessage: KPMessage = {
        id: (Date.now() + 1).toString(),
        type: 'coach',
        content: answer.answer,
        timestamp: new Date(),
        coachingResponse: answer
      }

      setMessages(prev => [...prev, coachMessage])
    } catch (error) {
      console.error('Error getting KP coaching:', error)
      const errorMessage: KPMessage = {
        id: (Date.now() + 1).toString(),
        type: 'coach',
        content: "I'm having trouble accessing the KP Astrology insights right now. Please try again in a moment.",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleSuggestedQuestion = (question: string) => {
    setInputValue(question)
    inputRef.current?.focus()
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="bg-slate-800/50 border-slate-600">
        <CardHeader>
          <CardTitle className="text-purple-400 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Your KP Astrology Guide
          </CardTitle>
          <p className="text-sm text-white/80">
            Ask me about Krishnamurti Paddhati predictions and precise timing analysis based on sub-lords and cusps.
          </p>
          {!analysis && (
            <p className="text-sm text-yellow-400/80 mt-2">
              Please generate your KP chart first to get personalized answers.
            </p>
          )}
        </CardHeader>
      </Card>

      {/* Chat Interface */}
      <Card className="bg-slate-800/50 border-slate-600 h-96">
        <CardContent className="p-0 h-full flex flex-col">
          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Begin Your KP Journey</h3>
                <p className="text-white/80 mb-6">
                  I'm here to guide you through the precise predictions of Krishnamurti Paddhati using sub-lords and timing analysis.
                </p>
                
                {/* Suggested Questions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto px-4">
                  {suggestedQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestedQuestion(question)}
                      disabled={!analysis}
                      className="group relative text-left h-auto p-4 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
                        bg-slate-900/60 backdrop-blur-sm border border-purple-500/30 text-white/90 
                        hover:bg-slate-800/80 hover:border-purple-500/60 hover:text-white hover:shadow-lg hover:shadow-purple-500/20
                        disabled:hover:bg-slate-900/60 disabled:hover:border-purple-500/30
                        flex items-start gap-3 w-full"
                    >
                      <Lightbulb className="w-4 h-4 mt-0.5 text-purple-400 flex-shrink-0 group-hover:text-purple-300 transition-colors" />
                      <span className="text-sm leading-relaxed flex-1">{question}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.type === 'user'
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-700 text-white'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      {message.coachingResponse && (
                        <div className="mt-2 pt-2 border-t border-white/20">
                          {message.coachingResponse.significators && message.coachingResponse.significators.length > 0 && (
                            <p className="text-xs text-white/80 mb-1">
                              <span className="text-yellow-400 font-medium">Significators:</span> {message.coachingResponse.significators.join(', ')}
                            </p>
                          )}
                          {message.coachingResponse.timing && (
                            <p className="text-xs text-white/80 mb-1">
                              <span className="text-yellow-400 font-medium">Timing:</span> {message.coachingResponse.timing}
                            </p>
                          )}
                          {message.coachingResponse.confidence && (
                            <p className="text-xs text-white/70 mt-2">
                              Confidence: <span className="text-green-400">{message.coachingResponse.confidence}%</span>
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t border-slate-600 p-4">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about KP predictions and timing..."
                className="flex-1 bg-slate-700 border-slate-600 text-white placeholder:text-white/70 focus:border-purple-500"
                disabled={isLoading || !user || !analysis}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading || !user || !analysis}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personalization Info */}
      <Card className="bg-slate-800/50 border-slate-600">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-white/90">Precise timing predictions</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-purple-500 text-purple-400">
                Sub-lords
              </Badge>
              <Badge variant="outline" className="border-blue-500 text-blue-400">
                Cusps
              </Badge>
              {analysis?.timingAnalysis && (
                <Badge variant="outline" className="border-yellow-500 text-yellow-400">
                  {analysis.timingAnalysis.dasha} Dasha
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 