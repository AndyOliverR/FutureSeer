"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"

interface KabbalisticAnalysis {
  overview: string
  soulNumber: number
  destinyNumber: number
  personalityNumber: number
  gematria: string
  nameValue: number
  nameMeaning: string
  birthValue: number
  birthMeaning: string
  soulDescription: string
  soulStrengths: string[]
  soulChallenges: string[]
  destinyDescription: string
  lifePurpose: string
  careerPaths: string[]
  personalityDescription: string
  personalityTraits: string[]
  expressionModes: string[]
  hebrewLetters: Array<{
    hebrew: string
    english: string
    value: number
    meaning: string
  }>
  guidance: string
  recommendations: string[]
}

export function useKabbalisticNumerology() {
  const { user } = useAuth()
  const [name, setName] = useState("")
  const [birthDate, setBirthDate] = useState("")
  const [analysis, setAnalysis] = useState<KabbalisticAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const performKabbalisticAnalysis = async () => {
    if (!user?.uid || !name.trim() || !birthDate) {
      setError("Please provide both name and birth date")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Import the Kabbalistic Numerology intelligence module
      const { getKabbalisticAnalysis } = await import("@/lib/kabbalisticNumerologyIntelligence")
      
      const result = await getKabbalisticAnalysis(
        user.uid,
        {
          name: name.trim(),
          birthDate,
        }
      )

      setAnalysis(result)
    } catch (err: any) {
      console.error("Error performing Kabbalistic analysis:", err)
      setError(err.message || "Failed to perform Kabbalistic analysis")
    } finally {
      setIsLoading(false)
    }
  }

  const resetData = () => {
    setName("")
    setBirthDate("")
    setAnalysis(null)
    setError(null)
  }

  return {
    name,
    setName,
    birthDate,
    setBirthDate,
    analysis,
    isLoading,
    error,
    performKabbalisticAnalysis,
    resetData,
  }
} 