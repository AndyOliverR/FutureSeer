"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"

interface BirthData {
  name: string
  birthDateTime: string
  birthPlace: string
  analysisFocus: string
}

interface HellenisticAnalysis {
  overview: string
  risingSign: string
  moonSign: string
  sunSign: string
  planets: Array<{
    name: string
    sign: string
    description: string
  }>
  houses: Array<{
    name: string
    description: string
    ruler: string
  }>
  aspects: Array<{
    planets: string
    type: string
    description: string
  }>
  dignities: Array<{
    planet: string
    status: string
    description: string
  }>
  timing: string
  favorablePeriods: string[]
  challengingPeriods: string[]
  guidance: string
  recommendations: string[]
}

export function useHellenisticAstrology() {
  const { user } = useAuth()
  const [birthData, setBirthData] = useState<BirthData>({
    name: "",
    birthDateTime: "",
    birthPlace: "",
    analysisFocus: "",
  })
  const [analysis, setAnalysis] = useState<HellenisticAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const performHellenisticAnalysis = async () => {
    if (!user?.uid || !birthData.name || !birthData.birthDateTime || !birthData.birthPlace) {
      setError("Please provide all required birth details")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Import the Hellenistic intelligence module
      const { getHellenisticAnalysis } = await import("@/lib/hellenisticAstrologyIntelligence")
      
      const result = await getHellenisticAnalysis(
        user.uid,
        {
          name: birthData.name,
          birthDateTime: birthData.birthDateTime,
          birthPlace: birthData.birthPlace,
          analysisFocus: birthData.analysisFocus,
        }
      )

      setAnalysis(result)
    } catch (err: any) {
      console.error("Error performing Hellenistic analysis:", err)
      setError(err.message || "Failed to perform Hellenistic analysis")
    } finally {
      setIsLoading(false)
    }
  }

  const resetData = () => {
    setBirthData({
      name: "",
      birthDateTime: "",
      birthPlace: "",
      analysisFocus: "",
    })
    setAnalysis(null)
    setError(null)
  }

  return {
    birthData,
    setBirthData,
    analysis,
    isLoading,
    error,
    performHellenisticAnalysis,
    resetData,
  }
} 