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

  async function performTarotReading() {
    if (!question.trim()) {
      setError("Please enter a question")
      return
    }

    if (!spreadType.trim()) {
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
          question: question.trim(),
          spreadType: spreadType.trim(),
          userId: user?.uid,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to generate tarot reading')
      }

      const result = await response.json()
      
      if (result.success && result.data) {
        // Convert timestamp back to Date
        const readingData = {
          ...result.data,
          timestamp: new Date(result.data.timestamp)
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

  return {
    question,
    setQuestion,
    spreadType,
    setSpreadType,
    reading,
    isLoading,
    error,
    performTarotReading,
    resetData,
  }
}
