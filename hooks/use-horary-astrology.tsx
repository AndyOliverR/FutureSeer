"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"

interface HoraryAnalysis {
  overview: string
  question: string
  chartTime: string
  location: string
  answer: string
  answerExplanation: string
  confidence: number
  timing: string
  favorableTiming: string[]
  avoidTiming: string[]
  planets: Array<{
    name: string
    sign: string
    house: string
    meaning: string
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
  guidance: string
  recommendations: string[]
}

export function useHoraryAstrology() {
  const { user } = useAuth()
  const [question, setQuestion] = useState("")
  const [questionTime, setQuestionTime] = useState("")
  const [questionPlace, setQuestionPlace] = useState("")
  const [analysis, setAnalysis] = useState<HoraryAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const performHoraryAnalysis = async () => {
    if (!user?.uid || !question.trim() || !questionTime || !questionPlace.trim()) {
      setError("Please provide all required details")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Import the Horary Astrology intelligence module
      const { getHoraryAnalysis } = await import("@/lib/horaryAstrologyIntelligence")
      
      const result = await getHoraryAnalysis(
        user.uid,
        {
          question: question.trim(),
          questionTime,
          questionPlace: questionPlace.trim(),
        }
      )

      setAnalysis(result)
    } catch (err: any) {
      console.error("Error performing Horary analysis:", err)
      setError(err.message || "Failed to perform Horary analysis")
    } finally {
      setIsLoading(false)
    }
  }

  const resetData = () => {
    setQuestion("")
    setQuestionTime("")
    setQuestionPlace("")
    setAnalysis(null)
    setError(null)
  }

  return {
    question,
    setQuestion,
    questionTime,
    setQuestionTime,
    questionPlace,
    setQuestionPlace,
    analysis,
    isLoading,
    error,
    performHoraryAnalysis,
    resetData,
  }
} 