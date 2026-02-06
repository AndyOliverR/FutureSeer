"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import type { ThirteenSignsAnalysis as LibAnalysis } from "@/hooks/useThirteenSignsZodiac"

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
  allSigns: Array<{ name: string; icon: string; dates: string; description: string }>
  ophiuchusDetails: string
  ophiuchusTraits: string[]
  ophiuchusStrengths: string[]
  compatibility: Array<{ sign: string; score: number; description: string }>
  personality: string
  strengths: string[]
  growthAreas: string[]
  career: string
  careerPaths: Array<{ title: string; description: string; skills: string }>
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
      const { thirteenSignsZodiacIntelligence } = await import("@/lib/thirteenSignsZodiacIntelligence")
      
      const [birthDate = "", birthTime = ""] = birthData.birthDateTime.includes("T")
        ? birthData.birthDateTime.split("T")
        : [birthData.birthDateTime, ""]
      const result: LibAnalysis = await thirteenSignsZodiacIntelligence.performThirteenSignsAnalysis({
        name: birthData.name,
        birthDate,
        birthTime,
        birthLocation: birthData.birthPlace,
        focus: birthData.analysisFocus,
      })

      const mapped: ThirteenSignsAnalysis = {
        overview: result.overview?.summary ?? "",
        primarySign: result.overview?.primarySign?.name ?? "",
        moonSign: result.signs?.moon?.name ?? "",
        ophiuchusInfluence: result.overview?.secondarySign?.description ?? "",
        allSigns: result.signs
          ? [
              result.signs.sun,
              result.signs.moon,
              result.signs.rising,
              result.signs.mercury,
              result.signs.venus,
              result.signs.mars,
            ]
            .filter(Boolean)
            .map((s) => ({
              name: s.name,
              icon: s.symbol ?? "",
              dates: s.dates ?? "",
              description: s.description ?? "",
            }))
          : [],
        ophiuchusDetails: result.overview?.secondarySign?.description ?? "",
        ophiuchusTraits: result.overview?.uniqueCharacteristics ?? [],
        ophiuchusStrengths: result.overview?.keyTraits ?? [],
        compatibility: [
          ...(result.compatibility?.bestMatches ?? []).map((m) => ({
            sign: m.sign,
            score: m.percentage,
            description: m.description ?? "",
          })),
          ...(result.compatibility?.goodMatches ?? []).map((m) => ({
            sign: m.sign,
            score: m.percentage,
            description: m.description ?? "",
          })),
          ...(result.compatibility?.challengingMatches ?? []).map((m) => ({
            sign: m.sign,
            score: m.percentage,
            description: m.description ?? "",
          })),
        ],
        personality: result.personality?.lifePath ?? "",
        strengths: result.personality?.strengths ?? [],
        growthAreas: result.personality?.growthAreas ?? [],
        career: result.career?.workStyle ?? "",
        careerPaths: (result.career?.idealProfessions ?? []).map((title) => ({
          title: String(title),
          description: "",
          skills: "",
        })),
        guidance: (result.advice?.personal ?? []).join(" "),
        recommendations: result.advice?.personal ?? [],
      }
      setAnalysis(mapped)
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