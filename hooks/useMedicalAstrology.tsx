import { useState, useCallback } from 'react'
import { medicalAstrologyIntelligence } from '@/lib/medicalAstrologyIntelligence'

export interface UserData {
  name: string
  birthTime: string
  birthPlace: string
}

export interface HealthData {
  healthFocus: string
  timeframe: string
  healthConcerns: string
}

export interface HealthTiming {
  optimalProcedures: string[]
  avoidPeriods: string[]
  recoveryWindows: string[]
  confidence: number
}

export interface BodySystem {
  system: string
  status: 'strong' | 'weak' | 'balanced'
  description: string
  recommendations: string[]
}

export interface NaturalRemedy {
  remedy: string
  type: 'herb' | 'crystal' | 'color' | 'element' | 'practice'
  description: string
  usage: string
}

export interface HealthAnalysis {
  overview: {
    summary: string
    overallHealth: number
    keyStrengths: string[]
    areasOfConcern: string[]
    recommendations: string[]
  }
  timing: HealthTiming
  bodySystems: BodySystem[]
  remedies: NaturalRemedy[]
  transits: {
    current: string[]
    upcoming: string[]
    impact: string
  }
  advice: {
    immediate: string[]
    shortTerm: string[]
    longTerm: string[]
    prevention: string[]
  }
}

export function useMedicalAstrology() {
  const [userData, setUserData] = useState<UserData>({
    name: '',
    birthTime: '',
    birthPlace: ''
  })
  
  const [healthData, setHealthData] = useState<HealthData>({
    healthFocus: '',
    timeframe: '',
    healthConcerns: ''
  })
  
  const [analysis, setAnalysis] = useState<HealthAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const analyzeHealthTiming = useCallback(async () => {
    if (!userData.birthTime || !healthData.healthFocus) {
      setError('Please provide birth time and health focus')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await medicalAstrologyIntelligence.analyzeHealthTiming(
        userData,
        healthData
      )
      
      setAnalysis(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze health timing')
    } finally {
      setIsLoading(false)
    }
  }, [userData, healthData])

  const resetData = useCallback(() => {
    setUserData({ name: '', birthTime: '', birthPlace: '' })
    setHealthData({ healthFocus: '', timeframe: '', healthConcerns: '' })
    setAnalysis(null)
    setError(null)
  }, [])

  return {
    userData,
    healthData,
    analysis,
    isLoading,
    error,
    setUserData,
    setHealthData,
    analyzeHealthTiming,
    resetData
  }
} 