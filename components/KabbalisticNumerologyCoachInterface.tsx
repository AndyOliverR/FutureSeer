import { useState, useRef, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Send, MessageCircle, Brain, Trash2 } from "lucide-react"
import type { SimplifiedKabbalisticAnalysis } from '@/lib/kabbalisticNumerologyIntelligence'
import { devLog } from '@/lib/devLogger'

interface KabbalisticMessage {
  id: string
  type: 'user' | 'coach'
  content: string
  timestamp: Date
  coachingResponse?: { techniques?: string[] }
}

interface KabbalisticNumerologyCoachInterfaceProps {
  analysis: SimplifiedKabbalisticAnalysis | null
  variant?: "dark" | "light"
  userProfile?: any
}

const KABBALISTIC_STARTER_QUESTIONS = [
  'What does my Kabbalistic numerology say about my soul path?',
  'Why do I keep facing similar challenges?',
  'What inner lesson am I meant to learn?',
  'How does my name influence my life direction?',
]

export function KabbalisticNumerologyCoachInterface({ analysis, variant = "dark", userProfile }: KabbalisticNumerologyCoachInterfaceProps) {
  const isLight = variant === "light"
  const { user } = useAuth()
  const [messages, setMessages] = useState<KabbalisticMessage[]>([])
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
    if (!text || !user || isLoading) return

    const userMessage: KabbalisticMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: text,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    const coachMessageId = (Date.now() + 1).toString()
    const coachMessage: KabbalisticMessage = {
      id: coachMessageId,
      type: 'coach',
      content: '',
      timestamp: new Date(),
      coachingResponse: { techniques: ['Gematria', 'Hebrew Letter Analysis', 'Soul Number'] }
    }
    setMessages(prev => [...prev, coachMessage])

    try {
      const response = await fetch('/api/ask-kabbalistic-numerology-seer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          question: text,
          userProfile: userProfile ?? {},
          kabbalisticAnalysis: analysis ?? undefined,
          comprehensiveProfile: analysis ? { kabbalisticNumerology: { chart: analysis.chart } } : undefined,
          sessionId: `kab_${Date.now()}`,
        }),
      })

      const contentType = response.headers.get('Content-Type') ?? ''

      if (contentType.includes('application/json')) {
        const data = await response.json()
        if (data.refused && data.response) {
          setMessages(prev =>
            prev.map(m => m.id === coachMessageId ? { ...m, content: data.response } : m)
          )
        } else if (data.error) {
          setMessages(prev =>
            prev.map(m => m.id === coachMessageId ? { ...m, content: data.error || 'Something went wrong.' } : m)
          )
        } else if (!response.ok) {
          setMessages(prev =>
            prev.map(m => m.id === coachMessageId ? { ...m, content: data.error || 'Request failed.' } : m)
          )
        }
        setIsLoading(false)
        return
      }

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        setMessages(prev =>
          prev.map(m => m.id === coachMessageId ? { ...m, content: errData.error || 'Request failed.' } : m)
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
          setMessages(prev =>
            prev.map(m => m.id === coachMessageId ? { ...m, content: fullResponse } : m)
          )
        }
      }
    } catch (error) {
      devLog.error('Error getting Kabbalistic coaching', error, 'KabbalisticNumerologyCoachInterface')
      setMessages(prev =>
        prev.map(m => m.id === coachMessageId ? { ...m, content: "I'm having trouble accessing the Kabbalistic wisdom right now. Please try again in a moment." } : m)
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const clearChat = () => {
    setMessages([])
  }

  const noAnalysisCardClass = isLight
    ? "bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-6 shadow-md"
    : "bg-amber-950/95 border border-amber-500/30 rounded-xl p-6"
  const noAnalysisIconClass = isLight ? "text-purple-600" : "text-amber-400"
  const noAnalysisTitleClass = isLight ? "m3-title-large text-purple-900" : "m3-title-large text-white"
  const noAnalysisBodyClass = isLight ? "m3-body-medium text-slate-700 mt-2" : "m3-body-medium text-slate-300 mt-2"

  if (!analysis) {
    return (
      <Card className={noAnalysisCardClass}>
        <div className="text-center py-12">
          <Brain className={`w-16 h-16 ${noAnalysisIconClass} mx-auto mb-4`} />
          <p className={noAnalysisTitleClass}>Generate your Kabbalistic analysis to start asking questions</p>
          <p className={noAnalysisBodyClass}>The expert needs your analysis data to provide personalized answers</p>
        </div>
      </Card>
    )
  }

  const cardWrapper = isLight
    ? "bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 border-2 border-purple-200 rounded-2xl h-[600px] flex flex-col overflow-hidden shadow-lg"
    : "h-full flex flex-col bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-700/50 overflow-hidden"
  const headerStrip = isLight
    ? "p-4 border-b border-purple-200 bg-white/80 flex items-center justify-between gap-3 shrink-0"
    : "p-4 border-b border-slate-700/50 bg-gradient-to-r from-amber-900/20 to-slate-900/50 flex items-center justify-between gap-3 shrink-0"
  const headerTitleClass = isLight ? "text-lg font-bold text-purple-900" : "text-xl font-bold text-white"
  const headerSubtitleClass = isLight ? "text-sm text-slate-600 mt-0.5" : "text-sm text-slate-400 mt-1"
  const emptyWrapperClass = isLight
    ? "rounded-xl p-6 bg-white/80 border-2 border-purple-200"
    : "rounded-xl p-6 bg-amber-950/40 border border-amber-500/20"
  const emptyIconClass = isLight ? "text-purple-600" : "text-amber-400"
  const userBubbleClass = isLight
    ? "bg-gradient-to-r from-purple-400 to-indigo-500 text-white"
    : "bg-amber-500/20 border border-amber-500/30 text-white"
  const coachBubbleClass = isLight
    ? "bg-white/90 text-slate-800 border-2 border-purple-200"
    : "bg-slate-800/50 border border-slate-700/50 text-slate-200"
  const inputAreaClass = isLight
    ? "border-t border-purple-200 p-4 bg-white/90 shrink-0"
    : "p-4 border-t border-slate-700/50 shrink-0"
  const inputClass = isLight
    ? "flex-1 bg-white border-purple-200 text-slate-800 placeholder:text-slate-500 focus:border-purple-400"
    : "flex-1 bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500"
  const sendBtnClass = isLight
    ? "bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white"
    : "bg-amber-500 hover:bg-amber-600 text-white"

  return (
    <div className={cardWrapper}>
      <div className={headerStrip}>
        <div>
          <h3 className={headerTitleClass}>Ask the Seer — Kabbalistic Numerology</h3>
          <p className={headerSubtitleClass}>
            I'll interpret your name and numbers through Kabbalistic principles to reveal soul lessons, challenges, and spiritual strengths.
          </p>
        </div>
        {messages.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={isLight ? "text-slate-600 hover:bg-purple-100 shrink-0" : "text-slate-400 hover:text-amber-400 hover:bg-slate-700/50 shrink-0"}
            onClick={clearChat}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Clear chat
          </Button>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !isLoading ? (
          <div className={emptyWrapperClass}>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageCircle className={`w-12 h-12 ${emptyIconClass} mb-4`} />
              <p className={isLight ? "text-slate-700 font-medium mb-2" : "text-slate-300 font-medium mb-2"}>
                Ask me anything about your soul numbers and inner patterns…
              </p>
              <p className={isLight ? "text-slate-600 text-sm mb-4" : "text-slate-400 text-sm mb-4"}>
                I'll interpret your name and numbers through Kabbalistic principles to reveal soul lessons, challenges, and spiritual strengths.
              </p>
              <p className={isLight ? "text-slate-700 text-sm font-medium mb-2" : "text-slate-300 text-sm font-medium mb-2"}>
                You can ask about:
              </p>
              <ul className={`text-left text-sm mb-4 list-disc list-inside ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                <li>Soul and inner nature (core soul lessons, inner motivations, hidden strengths or fears, karmic challenges)</li>
                <li>Life themes (why certain struggles recur, what areas demand growth, how to align with purpose)</li>
                <li>Name-based questions (how my name influences me, whether my name supports or conflicts with my nature, what energies my name activates)</li>
              </ul>
              <div className="flex flex-wrap gap-2 justify-center">
                {KABBALISTIC_STARTER_QUESTIONS.map((q, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSendMessage(q)}
                    disabled={isLoading || !user}
                    className={isLight ? "border-purple-200 hover:bg-purple-100 text-slate-700" : "border-amber-500/30 hover:bg-amber-500/20 text-slate-200"}
                  >
                    {q}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] p-4 rounded-xl ${
                    message.type === "user" ? userBubbleClass : coachBubbleClass
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-wrap">
                    {message.content || (message.type === "coach" && isLoading ? "…" : "")}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className={inputAreaClass}>
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. What does my Kabbalistic numerology say about my soul path?"
            className={inputClass}
            disabled={isLoading || !user}
          />
          <Button
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim() || isLoading || !user}
            className={sendBtnClass}
          >
            {isLoading ? (
              <div className={`animate-spin rounded-full h-4 w-4 border-b-2 ${isLight ? "border-purple-600" : "border-white"}`} />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
