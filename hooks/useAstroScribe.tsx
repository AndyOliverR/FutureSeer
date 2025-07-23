import { useState, useCallback } from 'react'
import { getAstroScribeAnalysis } from "@/lib/astroScribeIntelligence"

export interface ScribeData {
  interpretationType: string
  writingStyle: string
  focusAreas: string[]
  astrologicalData: string
  specificQuestions: string
  reportLength: string
}

export interface AstrologicalInsight {
  title: string
  description: string
  significance: string
  practicalApplication: string
  keywords: string[]
}

export interface LifeAreaAnalysis {
  area: string
  overview: string
  strengths: string[]
  challenges: string[]
  opportunities: string[]
  recommendations: string[]
}

export interface TimingGuidance {
  period: string
  description: string
  favorableActivities: string[]
  challengingAspects: string[]
  advice: string
}

export interface AstroScribeInterpretation {
  overview: {
    title: string
    summary: string
    keyThemes: string[]
    overallTone: string
    writingStyle: string
  }
  analysis: {
    mainInterpretation: string
    detailedAnalysis: string
    astrologicalFactors: string[]
    psychologicalInsights: string[]
  }
  insights: AstrologicalInsight[]
  lifeAreas: LifeAreaAnalysis[]
  timing: TimingGuidance[]
  recommendations: {
    immediate: string[]
    shortTerm: string[]
    longTerm: string[]
    spiritual: string[]
  }
  summary: {
    keyPoints: string[]
    finalThoughts: string
    nextSteps: string[]
  }
}

export function useAstroScribe() {
  const [scribeData, setScribeData] = useState<ScribeData>({
    interpretationType: '',
    writingStyle: '',
    focusAreas: [],
    astrologicalData: '',
    specificQuestions: '',
    reportLength: ''
  })
  const [interpretation, setInterpretation] = useState<AstroScribeInterpretation | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateInterpretation = useCallback(async () => {
    if (!scribeData.interpretationType || !scribeData.writingStyle || !scribeData.astrologicalData || !scribeData.reportLength) {
      setError('Please provide all required interpretation parameters')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await getAstroScribeAnalysis(scribeData)
      setInterpretation(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate interpretation')
    } finally {
      setIsLoading(false)
    }
  }, [scribeData])

  const resetData = useCallback(() => {
    setScribeData({
      interpretationType: '',
      writingStyle: '',
      focusAreas: [],
      astrologicalData: '',
      specificQuestions: '',
      reportLength: ''
    })
    setInterpretation(null)
    setError(null)
  }, [])

  return {
    scribeData,
    interpretation,
    isLoading,
    error,
    setScribeData,
    generateInterpretation,
    resetData
  }
} 