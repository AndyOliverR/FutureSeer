import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Send, 
  Clock, 
  Lightbulb, 
  Target, 
  Heart, 
  TrendingUp, 
  Sparkles,
  MessageCircle,
  User,
  Bot
} from 'lucide-react'

interface HoraryMessage {
  id: string
  type: 'user' | 'coach'
  content: string
  timestamp: Date
  coachingResponse?: any
}

export function HoraryAstrologyCoachInterface() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<HoraryMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [suggestedQuestions] = useState([
    "How do I phrase a good horary question?",
    "What makes a horary chart valid?",
    "How do I interpret the answer?",
    "What about timing in horary?",
    "How do I read the houses?",
    "What do the aspects mean?",
    "How accurate is horary astrology?",
    "When should I ask a horary question?"
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

    const userMessage: HoraryMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      // Mock response for now - replace with actual Horary intelligence
      const mockResponse = {
        guidance: `In Horary Astrology, your question about "${inputValue.trim()}" would be analyzed through the moment of inquiry. This ancient system provides precise answers by casting a chart for the exact time and place when the question is asked, revealing the cosmic answer through planetary positions and aspects.`,
        techniques: ['Moment Casting', 'Question Analysis', 'Timing Interpretation'],
        advice: 'The key is to ask your question with clarity and record the exact moment.'
      }

      const coachMessage: HoraryMessage = {
        id: (Date.now() + 1).toString(),
        type: 'coach',
        content: mockResponse.guidance,
        timestamp: new Date(),
        coachingResponse: mockResponse
      }

      setMessages(prev => [...prev, coachMessage])
    } catch (error) {
      console.error('Error getting Horary coaching:', error)
      const errorMessage: HoraryMessage = {
        id: (Date.now() + 1).toString(),
        type: 'coach',
        content: "I'm having trouble accessing the Horary wisdom right now. Please try again in a moment.",
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
          <CardTitle className="text-orange-400 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Your Horary Guide
          </CardTitle>
          <p className="text-sm text-slate-400">
            Ask me about the ancient art of answering questions through moment-based astrology.
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
                <MessageCircle className="w-12 h-12 text-orange-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Begin Your Horary Journey</h3>
                <p className="text-slate-400 mb-6">
                  I'm here to guide you through the ancient art of Horary Astrology.
                </p>
                
                {/* Suggested Questions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                  {suggestedQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="text-left h-auto p-3 border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:border-orange-500"
                      onClick={() => handleSuggestedQuestion(question)}
                    >
                      <Lightbulb className="w-4 h-4 mr-2 text-orange-400 flex-shrink-0" />
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
                          ? 'bg-orange-600 text-white'
                          : 'bg-slate-700 text-slate-200'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      {message.coachingResponse?.techniques && (
                        <div className="mt-2 pt-2 border-t border-slate-600">
                          <p className="text-xs text-slate-400">
                            Techniques: {message.coachingResponse.techniques.join(', ')}
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
                placeholder="Ask about Horary Astrology..."
                className="flex-1 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-orange-500"
                disabled={isLoading || !user}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading || !user}
                className="bg-orange-600 hover:bg-orange-700 text-white"
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
              <Sparkles className="w-4 h-4 text-orange-400" />
              <span className="text-sm text-slate-300">Ancient timing wisdom</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-orange-500 text-orange-400">
                Horary
              </Badge>
              <Badge variant="outline" className="border-red-500 text-red-400">
                Timing
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 