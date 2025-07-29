import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Send, 
  Hash, 
  Lightbulb, 
  Target, 
  Heart, 
  TrendingUp, 
  Sparkles,
  MessageCircle,
  User,
  Bot
} from 'lucide-react'

interface KabbalisticMessage {
  id: string
  type: 'user' | 'coach'
  content: string
  timestamp: Date
  coachingResponse?: any
}

export function KabbalisticNumerologyCoachInterface() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<KabbalisticMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [suggestedQuestions] = useState([
    "What is Gematria and how does it work?",
    "How do I calculate my soul number?",
    "What does my destiny number reveal?",
    "How do Hebrew letters connect to numbers?",
    "What is the significance of my name in Kabbalah?",
    "How can I use Kabbalistic numerology daily?",
    "What are the spiritual meanings of numbers?",
    "How does birth date numerology work?"
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

    const userMessage: KabbalisticMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      // Mock response for now - replace with actual Kabbalistic intelligence
      const mockResponse = {
        guidance: `In Kabbalistic Numerology, your question about "${inputValue.trim()}" would be analyzed through the ancient Hebrew system of Gematria. This mystical tradition reveals the divine connection between letters, numbers, and the soul's purpose, offering profound insights into your spiritual journey and life path.`,
        techniques: ['Gematria Calculation', 'Hebrew Letter Analysis', 'Soul Number Discovery'],
        advice: 'Each letter carries divine energy and numerical significance.'
      }

      const coachMessage: KabbalisticMessage = {
        id: (Date.now() + 1).toString(),
        type: 'coach',
        content: mockResponse.guidance,
        timestamp: new Date(),
        coachingResponse: mockResponse
      }

      setMessages(prev => [...prev, coachMessage])
    } catch (error) {
      console.error('Error getting Kabbalistic coaching:', error)
      const errorMessage: KabbalisticMessage = {
        id: (Date.now() + 1).toString(),
        type: 'coach',
        content: "I'm having trouble accessing the Kabbalistic wisdom right now. Please try again in a moment.",
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
            <Hash className="w-5 h-5" />
            Your Kabbalistic Guide
          </CardTitle>
          <p className="text-sm text-slate-400">
            Ask me about the mystical connection between Hebrew letters, numbers, and your soul.
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
                <h3 className="text-lg font-semibold text-white mb-2">Begin Your Kabbalistic Journey</h3>
                <p className="text-slate-400 mb-6">
                  I'm here to guide you through the mystical world of Kabbalistic Numerology.
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
                placeholder="Ask about Kabbalistic Numerology..."
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
              <span className="text-sm text-slate-300">Hebrew mystical wisdom</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-purple-500 text-purple-400">
                Gematria
              </Badge>
              <Badge variant="outline" className="border-blue-500 text-blue-400">
                Kabbalah
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 