import { useState, useCallback } from 'react'
import { useAuth } from '@/hooks/use-auth'

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
  const { user } = useAuth()
  const [question, setQuestion] = useState('')
  const [questionType, setQuestionType] = useState('')
  const [analysis, setAnalysis] = useState<GeomanticAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Auto-detect question type from question text
  const detectQuestionType = useCallback((questionText: string): string => {
    if (!questionText) return 'general'
    
    const lowerQuestion = questionText.toLowerCase()
    
    // Love and relationships
    if (lowerQuestion.match(/\b(love|relationship|partner|marriage|dating|romance|boyfriend|girlfriend|spouse|crush|heart|breakup|divorce)\b/)) {
      return 'love'
    }
    
    // Career and work
    if (lowerQuestion.match(/\b(career|job|work|business|profession|promotion|salary|office|colleague|boss|employment|resign|quit)\b/)) {
      return 'career'
    }
    
    // Money and finance
    if (lowerQuestion.match(/\b(money|finance|financial|wealth|income|salary|debt|investment|savings|budget|cash|rich|poor|buy|sell|purchase|expensive)\b/)) {
      return 'money'
    }
    
    // Health
    if (lowerQuestion.match(/\b(health|illness|sick|disease|medical|doctor|hospital|pain|healing|recovery|wellness|treatment|symptom)\b/)) {
      return 'health'
    }
    
    return 'general'
  }, [])

  const performGeomancy = useCallback(async () => {
    if (!question) {
      setError('Please provide a question')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Auto-detect question type if not provided
      const detectedType = questionType || detectQuestionType(question)
      
      const response = await fetch('/api/tools/geomancy/reading', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: question.trim(),
          questionType: detectedType,
          userId: user?.uid,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to generate geomancy reading')
      }

      const result = await response.json()
      
      if (result.success && result.data) {
        setAnalysis(result.data)
      } else {
        throw new Error(result.error || 'Invalid response from server')
      }
    } catch (err: any) {
      console.error('Error performing geomancy:', err)
      setError(err instanceof Error ? err.message : 'Failed to perform geomancy')
      setAnalysis(null)
    } finally {
      setIsLoading(false)
    }
  }, [question, questionType, detectQuestionType, user])

  // Alias for performGeomancy to match page usage
  const performGeomancyAnalysis = performGeomancy

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
    performGeomancyAnalysis,
    resetData
  }
} 