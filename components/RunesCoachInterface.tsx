import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { runesIntelligence } from '@/lib/runesIntelligence'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send, Shield, Lightbulb, Sparkles, MessageCircle } from 'lucide-react'

interface RunesMessage {
  id: string
  type: 'user' | 'coach'
  content: string
  timestamp: Date
  coachingResponse?: any
}

interface RunesCoachInterfaceProps {
  analysis?: any
  activeTab?: string
  question?: string
  spreadType?: string
}

export function RunesCoachInterface({ analysis, activeTab, question, spreadType }: RunesCoachInterfaceProps) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<RunesMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [suggestedQuestions] = useState([
    "What does the Fehu rune mean for my wealth?",
    "How should I interpret the Uruz rune?",
    "What guidance does Thurisaz provide?",
    "How can I work with the Ansuz rune?",
    "What does Raidho reveal about my journey?",
    "How should I understand Kenaz in my reading?",
    "What does Gebo indicate about relationships?",
    "How can I use Wunjo for happiness?"
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

    const userMessage: RunesMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      // Use runesIntelligence to get coaching if we have a reading
      let coachResponse: any = null
      
      if (analysis && question) {
        try {
          coachResponse = await runesIntelligence.getCoaching(inputValue.trim() || question, analysis)
        } catch (coachError) {
          console.warn('Failed to get coaching from runesIntelligence:', coachError)
        }
      }

      // Fallback to guidance if no coaching available
      const response = coachResponse ? {
        guidance: coachResponse.response,
        runes: analysis?.runes?.map((r: any) => r.name) || [],
        meaning: coachResponse.insights?.join(' ') || 'The runes offer guidance through their sacred symbols.',
        advice: coachResponse.recommendations?.join(' ') || 'Trust in the ancient wisdom of the Elder Futhark.'
      } : {
        guidance: `In the ancient Norse tradition, your question about "${inputValue.trim()}" would be answered through the sacred runes. The runes are not just letters but powerful symbols that carry the wisdom of Odin himself. Each rune has multiple layers of meaning - literal, symbolic, and mystical. The runes speak of guidance, perspective, and the interconnectedness of all things. Remember, runes provide guidance to help you shape your destiny, not fixed predictions.`,
        runes: analysis?.runes?.map((r: any) => r.name) || ['Fehu', 'Uruz', 'Thurisaz'],
        meaning: 'The runes offer perspective and guidance for your path.',
        advice: 'Trust in the ancient wisdom and let the runes guide your reflection and decision-making.'
      }

      const coachMessage: RunesMessage = {
        id: (Date.now() + 1).toString(),
        type: 'coach',
        content: response.guidance,
        timestamp: new Date(),
        coachingResponse: response
      }

      setMessages(prev => [...prev, coachMessage])
    } catch (error) {
      console.error('Error getting Runes coaching:', error)
      const errorMessage: RunesMessage = {
        id: (Date.now() + 1).toString(),
        type: 'coach',
        content: "I'm having trouble accessing the runic wisdom right now. Please try again in a moment.",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
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
      <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-amber-300 rounded-2xl shadow-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-amber-100 to-yellow-100">
          <CardTitle className="text-amber-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-700" />
            Your Runes Guide
          </CardTitle>
          <p className="text-sm text-slate-700">
            Ask me about the ancient Norse runes and their sacred meanings. I can help you interpret your reading or answer questions about runic wisdom.
          </p>
          {analysis && (
            <p className="text-xs text-amber-800 mt-1 font-medium">
              Current reading: {analysis.spreadName || 'Active'}
            </p>
          )}
        </CardHeader>
      </Card>

      {/* Chat Interface */}
      <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-2xl shadow-lg overflow-hidden h-96">
        <CardContent className="p-0 h-full flex flex-col">
          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="w-12 h-12 text-amber-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-amber-900 mb-2">Begin Your Runic Journey</h3>
                <p className="text-slate-700 mb-6">
                  I'm here to guide you through the ancient wisdom of the Norse runes.
                </p>

                {/* Suggested Questions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                  {suggestedQuestions.map((q, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="text-left h-auto p-3 border-2 border-amber-300 text-slate-700 hover:bg-amber-100 hover:border-amber-500 rounded-xl"
                      onClick={() => handleSuggestedQuestion(q)}
                    >
                      <Lightbulb className="w-4 h-4 mr-2 text-amber-600 flex-shrink-0" />
                      <span className="text-xs">{q}</span>
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
                      className={`max-w-[80%] p-3 rounded-2xl ${
                        message.type === 'user'
                          ? 'bg-amber-600 text-white'
                          : 'bg-white border-2 border-amber-200 text-slate-700'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      {message.coachingResponse?.runes && (
                        <div className="mt-2 pt-2 border-t border-amber-200">
                          <p className="text-xs text-slate-600">
                            Runes: {message.coachingResponse.runes.join(', ')}
                          </p>
                          <p className="text-xs text-slate-600">
                            Meaning: {message.coachingResponse.meaning}
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
          <div className="border-t-2 border-amber-200 bg-amber-50/50 p-4 rounded-b-2xl">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about the ancient runes and their meanings..."
                className="flex-1 bg-white border-2 border-amber-200 text-slate-800 placeholder:text-slate-500 focus:border-amber-500 rounded-xl"
                disabled={isLoading || !user}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading || !user}
                className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personalization Info */}
      <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-2xl shadow-lg overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-slate-700">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-medium">Ancient Norse wisdom</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-amber-500 text-amber-800 bg-amber-100 rounded-xl">
                24 Runes
              </Badge>
              <Badge variant="outline" className="border-blue-500 text-blue-800 bg-blue-50 rounded-xl">
                Sacred
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 