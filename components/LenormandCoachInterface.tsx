"use client"

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
  Send,
  Flower,
  MessageCircle,
  Trash2,
  BookOpen,
} from 'lucide-react'
import type { LenormandReading } from '@/lib/lenormandIntelligence'
import { devLog } from '@/lib/devLogger'
import { fetchWithFirebaseAuthRequired } from '@/lib/clientFirebaseFetch'

interface LenormandMessage {
  id: string
  type: 'user' | 'seer'
  content: string
  timestamp: Date
}

interface LenormandCoachInterfaceProps {
  reading: LenormandReading | null
  userProfile?: any
  onSwitchToReading?: () => void
}

const LENORMAND_STARTER_QUESTIONS = [
  'What is the likely outcome in the near term?',
  'How do these cards combine?',
]

export function LenormandCoachInterface({
  reading,
  userProfile,
  onSwitchToReading,
}: LenormandCoachInterfaceProps) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<LenormandMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSendMessage = async (messageText?: string) => {
    const text = (messageText ?? inputValue).trim()
    if (!text || !user || isLoading || !reading) return

    const question = text
    const userMessage: LenormandMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: question,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    const seerMessageId = (Date.now() + 1).toString()
    const seerMessage: LenormandMessage = {
      id: seerMessageId,
      type: 'seer',
      content: '',
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, seerMessage])

    try {
      const response = await fetchWithFirebaseAuthRequired('/api/ask-lenormand-seer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          question,
          userProfile: userProfile ?? {},
          lenormandReading: {
            question: reading.question,
            spreadType: reading.spreadType,
            cards: reading.cards,
            positions: reading.positions,
          },
          sessionId: `len_${Date.now()}`,
        }),
      })

      const contentType = response.headers.get('Content-Type') ?? ''

      if (contentType.includes('application/json')) {
        const data = await response.json()
        if (data.refused && data.response) {
          setMessages((prev) =>
            prev.map((m) => (m.id === seerMessageId ? { ...m, content: data.response } : m))
          )
        } else if (data.error) {
          setMessages((prev) =>
            prev.map((m) => (m.id === seerMessageId ? { ...m, content: data.error || 'Something went wrong.' } : m))
          )
        } else if (!response.ok) {
          setMessages((prev) =>
            prev.map((m) => (m.id === seerMessageId ? { ...m, content: data.error || 'Request failed.' } : m))
          )
        }
        setIsLoading(false)
        return
      }

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        setMessages((prev) =>
          prev.map((m) => (m.id === seerMessageId ? { ...m, content: errData.error || 'Request failed.' } : m))
        )
        setIsLoading(false)
        return
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let fullResponse = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value, { stream: true })
          fullResponse += chunk
          setMessages((prev) =>
            prev.map((m) => (m.id === seerMessageId ? { ...m, content: fullResponse } : m))
          )
        }
      }
    } catch (error) {
      devLog.error('Error getting Lenormand Seer response', error, 'LenormandCoachInterface')
      setMessages((prev) =>
        prev.map((m) =>
          m.id === seerMessageId
            ? { ...m, content: "I'm having trouble right now. Please try again in a moment." }
            : m
        )
      )
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

  const clearChat = () => {
    setMessages([])
  }

  if (!reading) {
    return (
      <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-lg">
        <CardContent className="text-center py-12">
          <BookOpen className="w-16 h-16 text-amber-600 mx-auto mb-4" />
          <p className="text-lg font-semibold text-amber-900 mb-2">Perform a reading first</p>
          <p className="text-slate-700 mb-6">
            Ask the Seer answers questions about your current spread. Draw cards in the Reading tab, then return here.
          </p>
          {onSwitchToReading && (
            <Button
              onClick={onSwitchToReading}
              className="bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white rounded-xl"
            >
              <Flower className="w-4 h-4 mr-2" />
              Go to Reading
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="h-full min-h-[28rem] flex flex-col bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl border-2 border-amber-200 shadow-lg overflow-hidden">
      <div className="p-4 border-b border-amber-200 bg-white/80 flex items-center justify-between gap-3 shrink-0">
        <div>
          <h3 className="text-xl font-bold text-amber-900">Lenormand Seer</h3>
          <p className="text-sm text-slate-700 mt-1">
            Concrete, near-term answers from your spread.
          </p>
        </div>
        {messages.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-amber-700 hover:bg-amber-100 shrink-0"
            onClick={clearChat}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Clear chat
          </Button>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !isLoading ? (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-amber-700" />
            <p className="text-amber-900 font-medium mb-2">
              Welcome to Ask the Seer — Lenormand.
            </p>
            {reading && (
              <p className="text-sm text-amber-800 mb-2">
                Your question: {reading.question}
              </p>
            )}
            {reading && reading.cards?.length > 0 && (
              <p className="text-xs text-slate-600 mb-2">
                Using your {reading.cards.length}-card spread.
              </p>
            )}
            <p className="text-sm text-slate-700 mb-4">
              Ask about outcome, what&apos;s happening, or how cards combine—or pick a question below.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {LENORMAND_STARTER_QUESTIONS.map((q, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSendMessage(q)}
                  disabled={isLoading || !user}
                  className="bg-white border-amber-200 hover:bg-amber-50 text-slate-700"
                >
                  {q}
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
                  className={`max-w-[80%] rounded-2xl p-4 ${
                    message.type === 'user'
                      ? 'bg-blue-50 border-2 border-blue-200 text-slate-800'
                      : 'bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 text-slate-800'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">
                    {message.content || (message.type === 'seer' && isLoading ? '…' : '')}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.type !== 'seer' && (
              <div className="flex justify-start">
                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl p-4">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-amber-600 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-amber-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <div className="w-2 h-2 bg-amber-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="p-4 border-t border-amber-200 bg-white/80 shrink-0">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your spread (concrete, near-term)..."
            className="flex-1 bg-white border-amber-200 text-slate-800 placeholder:text-slate-500 focus:border-amber-400"
            disabled={isLoading || !user}
          />
          <Button
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim() || isLoading || !user}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
