import { useState, useCallback } from 'react'
import { hellenisticAstrologyIntelligence } from '@/lib/hellenisticAstrologyIntelligence'

export interface BirthData {
  name: string
  birthDate: string
  birthTime: string
  birthLocation: string
  focus: string
}

export interface PlanetaryDignity {
  planet: string
  sign: string
  dignity: 'ruler' | 'exaltation' | 'triplicity' | 'term' | 'face' | 'detriment' | 'fall' | 'peregrine'
  strength: number
  interpretation: string
}

export interface HellenisticAspect {
  planet1: string
  planet2: string
  aspect: 'conjunction' | 'sextile' | 'square' | 'trine' | 'opposition'
  orb: number
  interpretation: string
  strength: 'strong' | 'moderate' | 'weak'
}

export interface HellenisticHouse {
  house: number
  sign: string
  planets: string[]
  interpretation: string
  traditionalRuler: string
}

export interface HellenisticAnalysis {
  overview: {
    summary: string
    temperament: string
    elementalBalance: string
    keyStrengths: string[]
    challenges: string[]
  }
  planets: {
    sun: { sign: string; house: number; dignity: PlanetaryDignity; interpretation: string }
    moon: { sign: string; house: number; dignity: PlanetaryDignity; interpretation: string }
    mercury: { sign: string; house: number; dignity: PlanetaryDignity; interpretation: string }
    venus: { sign: string; house: number; dignity: PlanetaryDignity; interpretation: string }
    mars: { sign: string; house: number; dignity: PlanetaryDignity; interpretation: string }
    jupiter: { sign: string; house: number; dignity: PlanetaryDignity; interpretation: string }
    saturn: { sign: string; house: number; dignity: PlanetaryDignity; interpretation: string }
  }
  aspects: HellenisticAspect[]
  houses: HellenisticHouse[]
  dignities: {
    strongPlanets: PlanetaryDignity[]
    weakPlanets: PlanetaryDignity[]
    overallAssessment: string
  }
  timing: {
    lifePeriods: string[]
    favorableTransits: string[]
    challengingTransits: string[]
    timingTechniques: string[]
  }
  advice: {
    personality: string[]
    career: string[]
    relationships: string[]
    health: string[]
    spirituality: string[]
  }
}

export function useHellenisticAstrology() {
  const [birthData, setBirthData] = useState<BirthData>({
    name: '',
    birthDate: '',
    birthTime: '',
    birthLocation: '',
    focus: ''
  })
  const [analysis, setAnalysis] = useState<HellenisticAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const performHellenisticAnalysis = useCallback(async () => {
    if (!birthData.name || !birthData.birthDate || !birthData.birthTime || !birthData.birthLocation || !birthData.focus) {
      setError('Please provide all required birth data and select a focus area')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await hellenisticAstrologyIntelligence.performHellenisticAnalysis(birthData)
      setAnalysis(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to perform Hellenistic analysis')
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
    performHellenisticAnalysis,
    resetData
  }
} 