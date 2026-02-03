"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { RuneReading } from "@/lib/runesIntelligence"

export interface RuneReadingResponse {
  question: string
  spreadType: string
  reading: RuneReading | null
  isLoading: boolean
  error: string | null
}

export function useRunes() {
  const { user, userProfile } = useAuth()
  const [question, setQuestion] = useState("")
  const [spreadType, setSpreadType] = useState("")
  const [reading, setReading] = useState<RuneReading | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function performRuneReading() {
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
      const response = await fetch('/api/tools/runes/reading', {
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
        throw new Error(errorData.error || 'Failed to generate runes reading')
      }

      const result = await response.json()
      
      if (result.success && result.data) {
        // Convert timestamp back to Date
        const readingData = {
          ...result.data,
          timestamp: new Date(result.data.timestamp)
        }
        setReading(readingData as RuneReading)
      } else {
        throw new Error(result.error || 'Invalid response from server')
      }
    } catch (err: any) {
      console.error("Error performing runes reading:", err)
      setError(err.message || "Failed to perform runes reading")
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
    performRuneReading,
    resetData,
  }
}

// Alias for compatibility with RunesTool component
export function useRunesData() {
  const runesHook = useRunes()
  
  return {
    runesData: runesHook.reading ? {
      spreadName: runesHook.reading.spreadName,
      energyScore: runesHook.reading.energyScore,
      overallReading: runesHook.reading.overallReading,
      recommendations: runesHook.reading.recommendations,
      runes: runesHook.reading.runes,
      elementalBalance: runesHook.reading.elementalBalance,
      timing: runesHook.reading.timing,
    } : null,
    loading: runesHook.isLoading,
    error: runesHook.error,
    refresh: () => {
      if (runesHook.question && runesHook.spreadType) {
        runesHook.performRuneReading()
      }
    },
    castRunes: runesHook.performRuneReading,
  }
} 