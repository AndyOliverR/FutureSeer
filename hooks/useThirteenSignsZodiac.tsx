import { useState, useCallback } from 'react'
import { thirteenSignsZodiacIntelligence } from '@/lib/thirteenSignsZodiacIntelligence'

export interface BirthData {
  name: string
  birthDate: string
  birthTime: string
  birthLocation: string
  focus: string
}

export interface ZodiacSign {
  name: string
  symbol: string
  element: string
  quality: string
  ruler: string
  dates: string
  traits: string[]
  description: string
}

export interface CompatibilityMatch {
  sign: string
  compatibility: 'excellent' | 'good' | 'fair' | 'challenging'
  percentage: number
  description: string
  strengths: string[]
  challenges: string[]
}

export interface ThirteenSignsAnalysis {
  overview: {
    primarySign: ZodiacSign
    secondarySign: ZodiacSign
    summary: string
    keyTraits: string[]
    uniqueCharacteristics: string[]
  }
  signs: {
    sun: ZodiacSign
    moon: ZodiacSign
    rising: ZodiacSign
    mercury: ZodiacSign
    venus: ZodiacSign
    mars: ZodiacSign
  }
  compatibility: {
    bestMatches: CompatibilityMatch[]
    goodMatches: CompatibilityMatch[]
    challengingMatches: CompatibilityMatch[]
    overallCompatibility: string
  }
  personality: {
    coreTraits: string[]
    strengths: string[]
    weaknesses: string[]
    growthAreas: string[]
    lifePath: string
  }
  career: {
    idealProfessions: string[]
    workStyle: string
    leadershipQualities: string[]
    successFactors: string[]
  }
  health: {
    strengths: string[]
    vulnerabilities: string[]
    wellnessTips: string[]
    recommendedActivities: string[]
  }
  advice: {
    personal: string[]
    relationships: string[]
    career: string[]
    health: string[]
    spiritual: string[]
  }
}

export function useThirteenSignsZodiac() {
  const [birthData, setBirthData] = useState<BirthData>({
    name: '',
    birthDate: '',
    birthTime: '',
    birthLocation: '',
    focus: ''
  })
  const [analysis, setAnalysis] = useState<ThirteenSignsAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const performThirteenSignsAnalysis = useCallback(async () => {
    if (!birthData.name || !birthData.birthDate || !birthData.birthTime || !birthData.birthLocation || !birthData.focus) {
      setError('Please provide all required birth data and select a focus area')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await thirteenSignsZodiacIntelligence.performThirteenSignsAnalysis(birthData)
      setAnalysis(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to perform 13 signs analysis')
    } finally {
      setIsLoading(false)
    }
  }, [birthData])

  const resetData = useCallback(() => {
    setBirthData({
      name: '',
      birthDate: '',
      birthTime: '',
      birthLocation: '',
      focus: ''
    })
    setAnalysis(null)
    setError(null)
  }, [])

  return {
    birthData,
    analysis,
    isLoading,
    error,
    setBirthData,
    performThirteenSignsAnalysis,
    resetData
  }
} 