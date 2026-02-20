'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Send, User, Loader2, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { SlowRevealText } from '@/components/chat/SlowRevealText'
import { devLog } from '@/lib/devLogger'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface MedicalSeerChatProps {
  userProfile?: any
  analysis?: any
}

const MEDICAL_STARTER_QUESTIONS = [
  'What health tendencies does my chart show?',
  'Which areas of my body need extra care?',
  'Are there periods when I should be more cautious?',
  'How does stress tend to affect me physically?',
]

export function MedicalSeerChat({ userProfile, analysis }: MedicalSeerChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSend = async (messageText?: string) => {
    const text = (messageText ?? input).trim()
    if (!text) return

    const userMessage: Message = {
      role: 'user',
      content: text,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // Call Groq API
      const response = await fetch('/api/chat/medical-seer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: text,
          analysis,
          userProfile
        })
      })

      const data = await response.json()

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response ?? data.error ?? 'I could not generate a response. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      devLog.error('Error calling Medical Seer API', error, 'MedicalSeerChat')
      const errorMessage: Message = {
        role: 'assistant',
        content: 'I apologize, I encountered an error processing your request. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full">
      <Card className="flex flex-col h-full bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 shadow-lg min-h-[50vh] max-h-[85vh] overflow-hidden">
        <CardHeader className="border-b border-amber-200 bg-white/80 flex flex-row items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-2xl" aria-hidden>⚕️</span>
            <CardTitle className="font-semibold text-lg text-amber-900 m-0">Ask the Seer — Medical Astrology</CardTitle>
          </div>
          {messages.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-slate-600 hover:text-amber-900 hover:bg-amber-100 shrink-0"
              onClick={() => setMessages([])}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Clear chat
            </Button>
          )}
        </CardHeader>
        <CardContent className="flex-1 flex flex-col min-h-0 p-0">
          <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && !isLoading ? (
              <div className="text-center py-8 max-w-lg mx-auto">
                <span className="text-4xl" aria-hidden>⚕️</span>
                <p className="text-amber-900 font-medium mt-4 mb-2">
                  Ask me about health tendencies shown in your chart…
                </p>
                <p className="text-slate-700 text-sm mb-4">
                  I&apos;ll interpret planetary influences to highlight constitutional strengths, sensitivities, and periods requiring care.
                </p>
                <p className="text-slate-600 text-sm font-medium mb-2 text-left">You can ask about:</p>
                <ul className="text-slate-700 text-sm mb-4 text-left list-disc pl-5 space-y-1">
                  <li>Health tendencies (areas of strength or vulnerability, stress-related sensitivities, energy and recovery patterns)</li>
                  <li>Preventative awareness (when to prioritize rest or routine, which habits support balance, how stress may manifest physically)</li>
                  <li>Period-based caution (phases requiring extra care, times to avoid overexertion)</li>
                </ul>
                <div className="flex flex-wrap gap-2 justify-center">
                  {MEDICAL_STARTER_QUESTIONS.map((q, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSend(q)}
                      disabled={isLoading}
                      className="text-xs text-amber-800 border-amber-200 hover:bg-amber-100"
                    >
                      {q}
                    </Button>
                  ))}
                </div>
                <p className="text-slate-600 text-xs mt-4">
                  Best for: tendencies and preventative awareness; not diagnosis or treatment.
                </p>
                <p className="text-slate-600 text-xs mt-1">
                  Astrology doesn&apos;t diagnose. For medical concerns, consult a healthcare professional.
                </p>
              </div>
            ) : (
              <>
                {messages.map((message, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`p-3 rounded-xl max-w-[85%] ${
                      message.role === 'user'
                        ? 'bg-blue-50 border-2 border-blue-200 ml-12'
                        : 'bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 mr-12'
                    }`}>
                      <div className="flex items-start gap-2 mb-1">
                        {message.role === 'user' ? (
                          <User className="w-4 h-4 text-amber-700 flex-shrink-0" />
                        ) : (
                          <span className="text-base flex-shrink-0" aria-hidden>⚕️</span>
                        )}
                        <span className={`text-xs font-semibold ${message.role === 'user' ? 'text-amber-900' : 'text-slate-700'}`}>
                          {message.role === 'user' ? 'You' : 'Medical Seer'}
                        </span>
                        <span className="text-xs text-slate-600 ml-auto">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className={`text-sm whitespace-pre-line ${message.role === 'user' ? 'text-slate-800' : 'text-slate-700'}`}>
                        {message.content}
                      </p>
                    </div>
                  </motion.div>
                ))}
                {isLoading && (
                  <div className="flex items-center gap-2 text-slate-700">
                    <Loader2 className="w-4 h-4 animate-spin text-amber-700" />
                    <span className="text-sm">Medical Seer is thinking...</span>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="shrink-0 border-t border-amber-200 bg-white/80 p-4 flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="e.g. What health tendencies does my chart show?"
              disabled={isLoading}
              className="flex-1 bg-white border-amber-200 text-slate-800 placeholder-slate-500 focus:border-amber-400 focus:ring-amber-200"
            />
            <Button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

