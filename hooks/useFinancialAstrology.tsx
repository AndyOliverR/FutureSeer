import { useState, useCallback } from 'react'
import { financialAstrologyIntelligence } from '@/lib/financialAstrologyIntelligence'

export interface UserData {
  name: string
  birthTime: string
  birthPlace: string
}

export interface MarketData {
  investmentType: string
  timeframe: string
  riskTolerance: string
}

export interface FinancialTiming {
  optimalEntry: string[]
  optimalExit: string[]
  avoidPeriods: string[]
  confidence: number
}

export interface SectorAnalysis {
  favorable: string[]
  challenging: string[]
  neutral: string[]
  reasoning: string
}

export interface MarketPrediction {
  trend: 'bullish' | 'bearish' | 'neutral'
  timeframe: string
  confidence: number
  reasoning: string
  keyEvents: string[]
}

export interface FinancialAnalysis {
  overview: {
    summary: string
    overallScore: number
    keyStrengths: string[]
    potentialRisks: string[]
    recommendations: string[]
  }
  timing: FinancialTiming
  sectors: SectorAnalysis
  transits: {
    current: string[]
    upcoming: string[]
    impact: string
  }
  predictions: MarketPrediction[]
  advice: {
    immediate: string[]
    shortTerm: string[]
    longTerm: string[]
    riskManagement: string[]
  }
}

export function useFinancialAstrology() {
  const [userData, setUserData] = useState<UserData>({
    name: '',
    birthTime: '',
    birthPlace: ''
  })
  
  const [marketData, setMarketData] = useState<MarketData>({
    investmentType: '',
    timeframe: '',
    riskTolerance: ''
  })
  
  const [analysis, setAnalysis] = useState<FinancialAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const analyzeFinancialTiming = useCallback(async () => {
    if (!userData.birthTime || !marketData.investmentType) {
      setError('Please provide birth time and investment type')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await financialAstrologyIntelligence.analyzeFinancialTiming(
        userData,
        marketData
      )
      
      setAnalysis(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze financial timing')
    } finally {
      setIsLoading(false)
    }
  }, [userData, marketData])

  const resetData = useCallback(() => {
    setUserData({ name: '', birthTime: '', birthPlace: '' })
    setMarketData({ investmentType: '', timeframe: '', riskTolerance: '' })
    setAnalysis(null)
    setError(null)
  }, [])

  return {
    userData,
    marketData,
    analysis,
    isLoading,
    error,
    setUserData,
    setMarketData,
    analyzeFinancialTiming,
    resetData
  }
} 