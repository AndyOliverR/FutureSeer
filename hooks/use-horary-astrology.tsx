"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { storeChart, getStoredChart, storePermanentChart, getPermanentChart, hasPermanentChart, storeCurrentChart, getCurrentChart, hasCurrentChart } from '@/lib/chartStorage'

interface HoraryAnalysis {
  basicInfo: {
    question: string
    questionTime: string
    questionPlace: string
    chartTime: string
  }
  chartImages: {
    horaryChart: string
    chartStyle: string
  }
  answer: {
    answer: string
    confidence: number
    explanation: string
    reasoning: string
  }
  planetaryPositions: Array<{
    name: string
    sign: string
    degree: number
    house: number
    meaning: string
    dignity: string
    speed: string
  }>
  houseAnalysis: Array<{
    house: number
    name: string
    description: string
    ruler: string
    planets: string[]
    significance: string
  }>
  aspects: Array<{
    planets: string
    type: string
    orb: number
    description: string
    applying: boolean
    separating: boolean
  }>
  timing: {
    immediate: string
    shortTerm: string
    longTerm: string
    criticalDates: string[]
    moonPhase: string
    moonSign: string
  }
  guidance: {
    guidance: string
    recommendations: string[]
    advice: string[]
  }
  rawAstroAppData: any
}

export function useHoraryAstrology() {
  const { user, userProfile } = useAuth()
  const [question, setQuestion] = useState("")
  const [questionTime, setQuestionTime] = useState("")
  const [questionPlace, setQuestionPlace] = useState("")
  const [analysis, setAnalysis] = useState<HoraryAnalysis | null>(null)
  const [currentTransits, setCurrentTransits] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingTransits, setIsLoadingTransits] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadCurrentTransits = async () => {
    if (!user?.uid) return

    // First try to load cached current transits
    const cachedTransits = getCurrentChart(user.uid, 'horary-astrology')
    if (cachedTransits) {
      setCurrentTransits(cachedTransits)
      console.log('📊 Loaded current transits from cache')
      return
    }

    // If no cached transits, fetch fresh ones
    await fetchCurrentTransits()
  }

  const fetchCurrentTransits = async () => {
    if (!user?.uid) return

    setIsLoadingTransits(true)
    try {
      const response = await fetch('/api/tools/horary-astrology/current-transits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          questionData: {
            question: question,
            questionTime: questionTime,
            questionPlace: questionPlace
          }
        }),
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setCurrentTransits(result.data)
          // Store current transits with shorter cache time
          storeCurrentChart(user.uid, 'horary-astrology', result.data, undefined, { maxAge: 2 * 60 * 60 * 1000 }) // 2 hours
          console.log('📊 Fresh current transits loaded and cached')
        }
      }
    } catch (err) {
      console.error('Error loading current transits:', err)
    } finally {
      setIsLoadingTransits(false)
    }
  }

  const performHoraryAnalysis = async () => {
    if (!user?.uid || !question.trim() || !questionTime || !questionPlace.trim()) {
      setError("Please provide all required details")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/tools/horary-astrology/generate-real', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          questionData: {
            question: question.trim(),
            questionTime,
            questionPlace: questionPlace.trim(),
            latitude: userProfile?.birthLatitude ?? 12.2958,
            longitude: userProfile?.birthLongitude ?? 76.6394,
            timezone: userProfile?.timezone || 5.5
          }
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate Horary astrology report')
      }

      const result = await response.json()
      
      if (result.success) {
        setAnalysis(result.data)
        
        // Store as permanent data (question-specific chart)
        storePermanentChart(user.uid, 'horary-astrology', result.data)
        
        // Also load current transits
        await loadCurrentTransits()
        
        console.log('Horary astrology analysis generated and cached permanently')
      } else {
        throw new Error(result.error || 'Failed to generate Horary astrology report')
      }
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
    setCurrentTransits(null)
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
    currentTransits,
    isLoading,
    isLoadingTransits,
    error,
    performHoraryAnalysis,
    fetchCurrentTransits,
    resetData,
  }
} 