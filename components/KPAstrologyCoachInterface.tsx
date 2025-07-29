import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
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
  coachingResponse?: any
}

export function KPAstrologyCoachInterface() {
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

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !user || isLoading) return

    const userMessage: KPMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      // Mock response for now - replace with actual KP intelligence
      const mockResponse = {
        guidance: `In KP Astrology, your question about "${inputValue.trim()}" would be analyzed through the precise system of sub-lords and cusps. The Krishnamurti Paddhati method provides exact timing predictions by examining the sublord of the significator and its connection to the cusps. This system is renowned for its mathematical precision in predicting the timing of events.`,
        subLords: ['Mars', 'Venus', 'Saturn'],
        cusps: ['1st House', '7th House', '10th House'],
        timing: 'Next 3-6 months'
      }

      const coachMessage: KPMessage = {
        id: (Date.now() + 1).toString(),
        type: 'coach',
        content: mockResponse.guidance,
        timestamp: new Date(),
        coachingResponse: mockResponse
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
          <p className="text-sm text-slate-400">
            Ask me about Krishnamurti Paddhati predictions and precise timing analysis.
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
                <h3 className="text-lg font-semibold text-white mb-2">Begin Your KP Journey</h3>
                <p className="text-slate-400 mb-6">
                  I'm here to guide you through the precise predictions of Krishnamurti Paddhati.
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
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.type === 'user'
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-700 text-slate-200'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      {message.coachingResponse?.subLords && (
                        <div className="mt-2 pt-2 border-t border-slate-600">
                          <p className="text-xs text-slate-400">
                            Sub-lords: {message.coachingResponse.subLords.join(', ')}
                          </p>
                          <p className="text-xs text-slate-400">
                            Timing: {message.coachingResponse.timing}
                          </p>
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
                className="flex-1 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-purple-500"
                disabled={isLoading || !user}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading || !user}
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
              <span className="text-sm text-slate-300">Precise timing predictions</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-purple-500 text-purple-400">
                Sub-lords
              </Badge>
              <Badge variant="outline" className="border-blue-500 text-blue-400">
                Cusps
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 