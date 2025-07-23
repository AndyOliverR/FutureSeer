import { useState, useCallback } from 'react'
import { geomancyIntelligence } from '@/lib/geomancyIntelligence'

export interface GeomanticFigure {
  name: string
  symbol: string
  element: string
  planet: string
  zodiac: string
  meaning: string
  interpretation: string
}

export interface GeomanticHouse {
  house: number
  figure: GeomanticFigure
  meaning: string
  relevance: string
}

export interface GeomanticAnalysis {
  overview: {
    summary: string
    overallAnswer: 'yes' | 'no' | 'maybe' | 'delayed'
    confidence: number
    keyInsights: string[]
    warnings: string[]
  }
  figures: GeomanticFigure[]
  houses: GeomanticHouse[]
  interpretation: {
    mainAnswer: string
    detailedExplanation: string
    supportingFactors: string[]
    challengingFactors: string[]
  }
  timing: {
    timeframe: string
    optimalPeriods: string[]
    avoidPeriods: string[]
    keyDates: string[]
  }
  advice: {
    immediate: string[]
    shortTerm: string[]
    longTerm: string[]
    spiritual: string[]
  }
}

export function useGeomancy() {
  const [question, setQuestion] = useState('')
  const [questionType, setQuestionType] = useState('')
  const [analysis, setAnalysis] = useState<GeomanticAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const performGeomancy = useCallback(async () => {
    if (!question || !questionType) {
      setError('Please provide both a question and question type')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await geomancyIntelligence.performGeomancy(
        question,
        questionType
      )
      
      setAnalysis(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to perform geomancy')
    } finally {
      setIsLoading(false)
    }
  }, [question, questionType])

  const resetData = useCallback(() => {
    setQuestion('')
    setQuestionType('')
    setAnalysis(null)
    setError(null)
  }, [])

  return {
    question,
    questionType,
    analysis,
    isLoading,
    error,
    setQuestion,
    setQuestionType,
    performGeomancy,
    resetData
  }
} 