import { useState, useCallback } from 'react'
import { mundaneAstrologyIntelligence } from '@/lib/mundaneAstrologyIntelligence'

export interface AnalysisData {
  analysisType: string
  timePeriod: string
  geographicFocus: string
  specificTopics: string
  analysisDepth: string
}

export interface WorldEvent {
  title: string
  description: string
  astrologicalFactors: string[]
  timing: string
  impact: 'major' | 'moderate' | 'minor'
  affectedAreas: string[]
}

export interface GlobalTrend {
  name: string
  description: string
  astrologicalIndicators: string[]
  duration: string
  intensity: 'strong' | 'moderate' | 'weak'
  affectedSectors: string[]
}

export interface MundanePrediction {
  timeframe: string
  prediction: string
  confidence: number
  astrologicalBasis: string[]
  potentialOutcomes: string[]
}

export interface AstrologicalCycle {
  name: string
  currentPhase: string
  description: string
  influence: string
  duration: string
  historicalContext: string
}

export interface MundaneAnalysis {
  overview: {
    summary: string
    keyThemes: string[]
    majorInfluences: string[]
    overallOutlook: 'positive' | 'neutral' | 'challenging'
  }
  events: WorldEvent[]
  trends: GlobalTrend[]
  predictions: MundanePrediction[]
  cycles: AstrologicalCycle[]
  advice: {
    global: string[]
    economic: string[]
    political: string[]
    social: string[]
    environmental: string[]
  }
}

export function useMundaneAstrology() {
  const [analysisData, setAnalysisData] = useState<AnalysisData>({
    analysisType: '',
    timePeriod: '',
    geographicFocus: '',
    specificTopics: '',
    analysisDepth: ''
  })
  const [analysis, setAnalysis] = useState<MundaneAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const performMundaneAnalysis = useCallback(async () => {
    if (!analysisData.analysisType || !analysisData.timePeriod || !analysisData.geographicFocus || !analysisData.analysisDepth) {
      setError('Please provide all required analysis parameters')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await mundaneAstrologyIntelligence.performMundaneAnalysis(analysisData)
      setAnalysis(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to perform mundane analysis')
    } finally {
      setIsLoading(false)
    }
  }, [analysisData])

  const resetData = useCallback(() => {
    setAnalysisData({
      analysisType: '',
      timePeriod: '',
      geographicFocus: '',
      specificTopics: '',
      analysisDepth: ''
    })
    setAnalysis(null)
    setError(null)
  }, [])

  return {
    analysisData,
    analysis,
    isLoading,
    error,
    setAnalysisData,
    performMundaneAnalysis,
    resetData
  }
} 