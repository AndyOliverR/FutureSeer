'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Send, User, Loader2, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { SlowRevealText } from '@/components/chat/SlowRevealText'

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
  'What does my chart suggest for wellness timing?',
  'Which areas of health should I focus on according to my chart?',
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
      console.error('Error calling Medical Seer API:', error)
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
    <div className="w-full space-y-6">
      <div className="rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-yellow-50 shadow-lg m3-elevation-1 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-amber-200">
          <div className="flex items-center gap-2">
            <span className="text-2xl" aria-hidden>⚕️</span>
            <h3 className="font-semibold text-lg text-amber-900">Medical Seer</h3>
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
        </div>
        <div className="p-6 space-y-4">
          {/* Messages */}
          <div className="h-[400px] overflow-y-auto space-y-4 pr-2">
            {messages.length === 0 && !isLoading ? (
              <div className="text-center py-8">
                <span className="text-4xl" aria-hidden>⚕️</span>
                <p className="text-amber-900 font-medium mt-4 mb-2">
                  Welcome to Ask the Seer — Medical Astrology.
                </p>
                <p className="text-sm text-amber-800 mb-4">
                  Ask about wellness timing, body systems, or cosmic health insights—or pick a question below.
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {MEDICAL_STARTER_QUESTIONS.map((q, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSend(q)}
                      disabled={isLoading}
                      className="text-amber-800 border-amber-200 hover:bg-amber-100"
                    >
                      {q}
                    </Button>
                  ))}
                </div>
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
                    ? 'bg-amber-100/80 border border-amber-300 ml-12'
                    : 'bg-amber-50/80 border border-amber-200 mr-12'
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
                    {message.role === 'user' ? message.content : (
                      <SlowRevealText content={message.content} minThinkingMs={2000} delayPerWord={85} thinkingLabel="Consulting the stars..." className="text-slate-700" />
                    )}
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

          {/* Input */}
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about your health astrology..."
              className="flex-1 rounded-xl bg-amber-50/90 border-2 border-amber-300 text-slate-800 placeholder:text-slate-500 focus:border-amber-400"
            />
            <Button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="rounded-xl bg-amber-500 hover:bg-amber-600 text-white"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

