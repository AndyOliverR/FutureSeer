"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { TarotReading } from "@/lib/tarotIntelligence"

export interface TarotReadingResponse {
  question: string
  spreadType: string
  reading: TarotReading | null
  isLoading: boolean
  error: string | null
}

export function useTarot() {
  const { user } = useAuth()
  const [question, setQuestion] = useState("")
  const [spreadType, setSpreadType] = useState("")
  const [reading, setReading] = useState<TarotReading | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function performTarotReading(questionArg?: string, spreadTypeArg?: string) {
    const q = (questionArg !== undefined ? questionArg : question).trim()
    const s = (spreadTypeArg !== undefined ? spreadTypeArg : spreadType).trim()
    if (!q) {
      setError("Please enter a question")
      return
    }

    if (!s) {
      setError("Please select a spread")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/tools/tarot/reading', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: q,
          spreadType: s,
          userId: user?.uid,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to generate tarot reading')
      }

      const result = await response.json()
      
      if (result.success && result.data) {
        const data = result.data as Record<string, unknown>
        const defaultCoaching = {
          strengths: [] as string[],
          challenges: [] as string[],
          growthAreas: [] as string[],
          affirmations: [] as string[]
        }
        const readingData = {
          ...data,
          timestamp: new Date((data.timestamp as string) ?? Date.now()),
          coaching: (data.coaching as TarotReading['coaching']) ?? defaultCoaching
        }
        setReading(readingData as TarotReading)
      } else {
        throw new Error(result.error || 'Invalid response from server')
      }
    } catch (err: any) {
      console.error("Error performing tarot reading:", err)
      setError(err.message || "Failed to perform tarot reading")
      setReading(null)
    } finally {
      setIsLoading(false)
    }
  }

  function resetData() {
    setQuestion("")
    setSpreadType("")
    setReading(null)
    setError(null)
  }

  async function getCoaching(_question: string) {
    return { response: '' as string }
  }

  return {
    question,
    setQuestion,
    spreadType,
    setSpreadType,
    reading,
    tarotData: reading,
    isLoading,
    loading: isLoading,
    error,
    coaching: null as { response: string } | null,
    getCoaching,
    performTarotReading,
    refresh: performTarotReading,
    drawTarot: performTarotReading,
    resetData,
  }
}

export const useTarotData = useTarot
