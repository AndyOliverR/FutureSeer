import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useAstroData } from '@/hooks/useAstroData'
import { getPersonalizedCoaching } from '@/lib/astroCoach'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Send, 
  Brain, 
  Lightbulb, 
  Target, 
  Heart, 
  TrendingUp, 
  Sparkles,
  MessageCircle,
  User,
  Bot
} from 'lucide-react'

interface CoachingMessage {
  id: string
  type: 'user' | 'coach'
  content: string
  timestamp: Date
  coachingResponse?: any
}

export function AstroCoachInterface() {
  const { user } = useAuth()
  const { astroData, loading: astroLoading } = useAstroData()
  const [messages, setMessages] = useState<CoachingMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [suggestedQuestions] = useState([
    "I'm feeling stressed about my career. What should I focus on?",
    "How can I improve my relationships?",
    "What are my biggest strengths right now?",
    "I'm facing a major decision. What guidance do you have?",
    "How can I better manage my energy and emotions?",
    "What opportunities should I be looking for?",
    "I feel stuck. What's my next step?",
    "How can I use my natural talents more effectively?"
  ])
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !user || !astroData || isLoading) return

    const userMessage: CoachingMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      const coachingResponse = await getPersonalizedCoaching(
        user.uid,
        astroData,
        inputValue.trim()
      )

      const coachMessage: CoachingMessage = {
        id: (Date.now() + 1).toString(),
        type: 'coach',
        content: coachingResponse.guidance,
        timestamp: new Date(),
        coachingResponse
      }

      setMessages(prev => [...prev, coachMessage])
    } catch (error) {
      console.error('Error getting coaching:', error)
      const errorMessage: CoachingMessage = {
        id: (Date.now() + 1).toString(),
        type: 'coach',
        content: "I'm having trouble accessing your astrological insights right now. Please try again in a moment.",
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

  if (astroLoading) {
    return (
      <Card className="bg-slate-800/50 border-slate-600">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
            <span className="ml-3 text-slate-300">Loading your astrological profile...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!astroData) {
    return (
      <Card className="bg-slate-800/50 border-slate-600">
        <CardContent className="p-6 text-center">
          <Brain className="w-12 h-12 text-purple-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Astrological Profile Required</h3>
          <p className="text-slate-400 mb-4">
            Please complete your birth details to access personalized coaching.
          </p>
          <Button variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-500/20">
            Complete Profile
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="bg-slate-800/50 border-slate-600">
        <CardHeader>
          <CardTitle className="text-purple-400 flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Your Personal Astrological Coach
          </CardTitle>
          <p className="text-sm text-slate-400">
            Ask me anything about your life, and I'll provide personalized guidance based on your unique astrological profile.
          </p>
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
                <h3 className="text-lg font-semibold text-white mb-2">Start Your Coaching Session</h3>
                <p className="text-slate-400 mb-6">
                  I'm here to provide personalized guidance based on your astrological profile.
                </p>
                
                {/* Suggested Questions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                  {suggestedQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="text-left h-auto p-3 border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:border-purple-500"
                      onClick={() => handleSuggestedQuestion(question)}
                    >
                      <Lightbulb className="w-4 h-4 mr-2 text-purple-400 flex-shrink-0" />
                      <span className="text-xs">{question}</span>
                    </Button>
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
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.type === 'user'
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-700 text-slate-200'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {message.type === 'user' ? (
                          <User className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        ) : (
                          <Bot className="w-4 h-4 mt-0.5 flex-shrink-0 text-purple-400" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm">{message.content}</p>
                          
                          {/* Coaching Response Details */}
                          {message.coachingResponse && (
                            <div className="mt-3 space-y-2">
                              {/* Suggestions */}
                              {message.coachingResponse.suggestions?.length > 0 && (
                                <div>
                                  <div className="flex items-center gap-1 mb-1">
                                    <Lightbulb className="w-3 h-3 text-yellow-400" />
                                    <span className="text-xs font-medium text-slate-300">Suggestions</span>
                                  </div>
                                  <ul className="text-xs space-y-1">
                                    {message.coachingResponse.suggestions.slice(0, 2).map((suggestion: string, index: number) => (
                                      <li key={index} className="flex items-start gap-1">
                                        <span className="text-purple-400">•</span>
                                        <span>{suggestion}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {/* Actionable Steps */}
                              {message.coachingResponse.actionableSteps?.length > 0 && (
                                <div>
                                  <div className="flex items-center gap-1 mb-1">
                                    <Target className="w-3 h-3 text-green-400" />
                                    <span className="text-xs font-medium text-slate-300">Action Steps</span>
                                  </div>
                                  <ul className="text-xs space-y-1">
                                    {message.coachingResponse.actionableSteps.slice(0, 2).map((step: string, index: number) => (
                                      <li key={index} className="flex items-start gap-1">
                                        <span className="text-green-400">•</span>
                                        <span>{step}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {/* Encouragement */}
                              {message.coachingResponse.encouragement && (
                                <div className="mt-2 p-2 bg-purple-900/30 border border-purple-500/30 rounded">
                                  <div className="flex items-center gap-1 mb-1">
                                    <Heart className="w-3 h-3 text-pink-400" />
                                    <span className="text-xs font-medium text-purple-300">Encouragement</span>
                                  </div>
                                  <p className="text-xs text-purple-200">{message.coachingResponse.encouragement}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-xs opacity-70 mt-2">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-700 text-slate-200 rounded-lg p-3 max-w-[80%]">
                      <div className="flex items-center gap-2">
                        <Bot className="w-4 h-4 text-purple-400" />
                        <div className="flex items-center gap-1">
                          <div className="animate-pulse">Analyzing your chart</div>
                          <div className="flex gap-1">
                            <div className="w-1 h-1 bg-purple-400 rounded-full animate-bounce"></div>
                            <div className="w-1 h-1 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-1 h-1 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
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
                placeholder="Ask me anything about your life, career, relationships..."
                className="flex-1 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-purple-500"
                disabled={isLoading || !user || !astroData}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading || !user || !astroData}
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
              <span className="text-sm text-slate-300">Personalized for you</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-purple-500 text-purple-400">
                {astroData.sunSign} Sun
              </Badge>
              <Badge variant="outline" className="border-blue-500 text-blue-400">
                {astroData.moonSign} Moon
              </Badge>
              <Badge variant="outline" className="border-green-500 text-green-400">
                {astroData.risingSign} Rising
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 