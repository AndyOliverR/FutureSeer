"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"

interface BirthData {
  name: string
  birthDateTime: string
  birthPlace: string
  analysisFocus: string
}

interface ThirteenSignsAnalysis {
  overview: string
  primarySign: string
  moonSign: string
  ophiuchusInfluence: string
  allSigns: Array<{
    name: string
    icon: string
    dates: string
    description: string
  }>
  ophiuchusDetails: string
  ophiuchusTraits: string[]
  ophiuchusStrengths: string[]
  compatibility: Array<{
    sign: string
    score: number
    description: string
  }>
  personality: string
  strengths: string[]
  growthAreas: string[]
  career: string
  careerPaths: Array<{
    title: string
    description: string
    skills: string
  }>
  guidance: string
  recommendations: string[]
}

export function useThirteenSignsZodiac() {
  const { user } = useAuth()
  const [birthData, setBirthData] = useState<BirthData>({
    name: "",
    birthDateTime: "",
    birthPlace: "",
    analysisFocus: "",
  })
  const [analysis, setAnalysis] = useState<ThirteenSignsAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const performThirteenSignsAnalysis = async () => {
    if (!user?.uid || !birthData.name || !birthData.birthDateTime || !birthData.birthPlace) {
      setError("Please provide all required birth details")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Import the Thirteen Signs intelligence module
      const { getThirteenSignsAnalysis } = await import("@/lib/thirteenSignsZodiacIntelligence")
      
      const result = await getThirteenSignsAnalysis(
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
      console.error("Error performing Thirteen Signs analysis:", err)
      setError(err.message || "Failed to perform Thirteen Signs analysis")
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
    performThirteenSignsAnalysis,
    resetData,
  }
} 