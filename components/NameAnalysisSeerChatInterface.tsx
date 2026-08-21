"use client"

import { useState, useRef, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, User, Trash2, MessageCircle } from "lucide-react"
import type { NameAnalysis } from "@/lib/nameAnalysisIntelligence"
import { SlowRevealText } from "@/components/chat/SlowRevealText"
import { devLog } from "@/lib/devLogger"
import { fetchWithFirebaseAuthRequired } from "@/lib/clientFirebaseFetch"

interface NameAnalysisMessage {
  id: string
  type: "user" | "seer"
  content: string
  timestamp: Date
}

interface NameAnalysisSeerChatInterfaceProps {
  analysis: NameAnalysis | null
  variant?: "dark" | "light"
  userProfile?: any
}

const NAME_ANALYSIS_STARTER_QUESTIONS = [
  "What does my name say about me?",
  "Analyze my full name.",
  "Is my name lucky?",
  "Should I change my name?",
]

export function NameAnalysisSeerChatInterface({
  analysis,
  variant = "dark",
  userProfile,
}: NameAnalysisSeerChatInterfaceProps) {
  const isLight = variant === "light"
  const { user } = useAuth()
  const [messages, setMessages] = useState<NameAnalysisMessage[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSendMessage = async (questionText?: string) => {
    const question = (questionText ?? inputValue.trim()).trim()
    if (!question || !user || isLoading) return
    const userMessage: NameAnalysisMessage = {
      id: Date.now().toString(),
      type: "user",
      content: question,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    if (!questionText) setInputValue("")
    setIsLoading(true)

    const seerMessageId = (Date.now() + 1).toString()
    const seerMessage: NameAnalysisMessage = {
      id: seerMessageId,
      type: "seer",
      content: "",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, seerMessage])

    try {
      const response = await fetchWithFirebaseAuthRequired("/api/ask-name-analysis-seer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          question,
          userProfile: userProfile ?? {},
          nameAnalysis: analysis ?? undefined,
          comprehensiveProfile: analysis ? { nameAnalysis: analysis } : undefined,
          sessionId: `na_${Date.now()}`,
        }),
      })

      const contentType = response.headers.get("Content-Type") ?? ""

      if (contentType.includes("application/json")) {
        const data = await response.json()
        if (data.refused && data.response) {
          setMessages((prev) =>
            prev.map((m) => (m.id === seerMessageId ? { ...m, content: data.response } : m))
          )
        } else if (data.error) {
          setMessages((prev) =>
            prev.map((m) => (m.id === seerMessageId ? { ...m, content: data.error || "Something went wrong." } : m))
          )
        } else if (!response.ok) {
          setMessages((prev) =>
            prev.map((m) => (m.id === seerMessageId ? { ...m, content: data.error || "Request failed." } : m))
          )
        }
        setIsLoading(false)
        return
      }

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        setMessages((prev) =>
          prev.map((m) => (m.id === seerMessageId ? { ...m, content: errData.error || "Request failed." } : m))
        )
        setIsLoading(false)
        return
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let fullResponse = ""

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
      devLog.error('Error getting Name Analysis Seer response', error, 'NameAnalysisSeerChatInterface')
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
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const clearChat = () => {
    setMessages([])
  }

  const noAnalysisCardClass = isLight
    ? "bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl p-6 shadow-md"
    : "bg-amber-950/95 border border-amber-500/30 rounded-xl p-6"
  const noAnalysisIconClass = isLight ? "text-amber-600" : "text-amber-400"
  const noAnalysisTitleClass = isLight ? "m3-title-large text-amber-900" : "m3-title-large text-white"
  const noAnalysisBodyClass = isLight ? "m3-body-medium text-slate-700 mt-2" : "m3-body-medium text-slate-300 mt-2"

  if (!analysis) {
    return (
      <Card className={noAnalysisCardClass}>
        <div className="text-center py-12">
          <User className={`w-16 h-16 ${noAnalysisIconClass} mx-auto mb-4`} />
          <p className={noAnalysisTitleClass}>Generate your name analysis to start asking questions</p>
          <p className={noAnalysisBodyClass}>The expert needs your name data to provide personalized answers.</p>
        </div>
      </Card>
    )
  }

  const headerCardClass = isLight
    ? "bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl p-4 overflow-hidden shadow-md"
    : "bg-amber-950/95 rounded-xl p-4 border border-amber-500/30 overflow-hidden"
  const headerIconClass = isLight ? "text-amber-600" : "text-amber-400"
  const headerTitleClass = isLight ? "m3-headline-small text-amber-900" : "m3-headline-small text-white"
  const headerBodyClass = isLight ? "m3-body-medium text-slate-700" : "m3-body-medium text-slate-300"

  const chatCardClass = isLight
    ? "bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl h-[600px] flex flex-col overflow-hidden shadow-lg"
    : "bg-amber-950/95 rounded-xl border border-amber-500/30 h-[600px] flex flex-col overflow-hidden"
  const emptyWrapperClass = isLight
    ? "rounded-xl p-6 bg-white/80 border-2 border-amber-200"
    : "rounded-xl p-6 bg-amber-950/40 border border-amber-500/20"
  const userBubbleClass = isLight
    ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-white"
    : "bg-gradient-to-r from-amber-500 to-amber-600 text-white"
  const seerBubbleClass = isLight
    ? "bg-white/90 text-slate-800 border-2 border-amber-200"
    : "bg-amber-950/60 text-slate-200 border border-amber-500/30"
  const inputAreaClass = isLight
    ? "border-t border-amber-200 p-4 bg-white/90"
    : "border-t border-slate-700/50 p-4 bg-amber-950/40"
  const inputClass = isLight
    ? "flex-1 bg-[var(--m3-surface-container-low)] border-[var(--m3-outline-variant)] text-[var(--m3-on-surface)] placeholder:text-[var(--m3-on-surface-variant)] focus:border-amber-400"
    : "flex-1 bg-amber-950/40 border-slate-600 text-white placeholder:text-slate-400 focus:border-amber-500"
  const sendBtnClass = isLight
    ? "bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white"
    : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
  const footerCardClass = isLight
    ? "bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl p-4 overflow-hidden shadow-md"
    : "bg-amber-950/95 rounded-xl p-4 border border-amber-500/30 overflow-hidden"
  const footerLabelClass = isLight ? "m3-label-medium text-slate-700" : "m3-label-medium text-slate-300"
  const footerBadgeClass = isLight ? "border-amber-300 text-amber-700" : "border-amber-500 text-amber-400"

  return (
    <div className="space-y-4">
      <Card className={headerCardClass}>
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-3">
            <User className={`w-6 h-6 ${headerIconClass}`} />
            <div>
              <h3 className={headerTitleClass}>Ask the Seer — Name Analysis</h3>
              <p className={headerBodyClass}>
                I'll interpret your name through identity and expression—vibration, perception, and career tone. No timing or remedies.
              </p>
            </div>
          </div>
          {messages.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={isLight ? "text-slate-600 hover:bg-amber-100" : "text-slate-300 hover:bg-amber-900/40 shrink-0"}
              onClick={clearChat}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Clear chat
            </Button>
          )}
        </div>
      </Card>

      <Card className={chatCardClass}>
        <ScrollArea className="flex-1 p-4">
          {messages.length === 0 ? (
            <div className={emptyWrapperClass}>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <MessageCircle className={`w-12 h-12 ${headerIconClass} mb-4`} />
                <p className={isLight ? "text-slate-700 font-medium mb-2" : "text-slate-300 font-medium mb-2"}>
                  Ask me anything about your name and expression…
                </p>
                <p className={isLight ? "text-slate-600 text-sm mb-4" : "text-slate-400 text-sm mb-4"}>
                  I'll interpret your name through identity and expression—vibration, perception, and career tone. No timing or remedies.
                </p>
                <p className={isLight ? "text-slate-700 text-sm font-medium mb-2" : "text-slate-300 text-sm font-medium mb-2"}>
                  You can ask about:
                </p>
                <ul className={`text-left text-sm mb-4 list-disc list-inside ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                  <li>Identity (core name vibration, how you're perceived, expression)</li>
                  <li>Expression and career tone (career-facing name, alignment with role)</li>
                  <li>Name-based (what your name says about you, is my name lucky, should I change my name)</li>
                </ul>
                <div className="flex flex-wrap gap-2 justify-center">
                  {NAME_ANALYSIS_STARTER_QUESTIONS.map((q, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSendMessage(q)}
                      disabled={isLoading || !user}
                      className={isLight ? "text-xs text-amber-800 border-amber-200 hover:bg-amber-100" : "text-xs text-slate-300 border-slate-600 hover:bg-slate-800"}
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
                      message.type === "user" ? userBubbleClass : seerBubbleClass
                    }`}
                  >
                    <p className="m3-body-medium leading-relaxed whitespace-pre-wrap">
                      {message.type === "user" ? (
                        message.content
                      ) : message.content ? (
                        <SlowRevealText
                          content={message.content}
                          minThinkingMs={2000}
                          delayPerWord={85}
                          thinkingLabel="Consulting the stars..."
                        />
                      ) : isLoading ? (
                        "…"
                      ) : (
                        ""
                      )}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        <div className={inputAreaClass}>
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. What does my name say about me?"
              className={inputClass}
              disabled={isLoading || !user}
            />
            <Button
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || isLoading || !user}
              className={sendBtnClass}
            >
              {isLoading ? (
                <div
                  className={`animate-spin rounded-full h-4 w-4 border-b-2 ${isLight ? "border-amber-600" : "border-white"}`}
                />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </Card>

      <Card className={footerCardClass}>
        <div className="flex items-center justify-between">
          <span className={footerLabelClass}>Identity and expression</span>
          <Badge variant="outline" className={footerBadgeClass}>
            Name Analysis
          </Badge>
        </div>
      </Card>
    </div>
  )
}
