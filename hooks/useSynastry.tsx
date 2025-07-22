import { useState, useCallback } from 'react'
import { synastryIntelligence } from '@/lib/synastryIntelligence'

export interface PersonData {
  name: string
  birthTime: string
  birthPlace: string
}

export interface SynastryAspect {
  planet1: string
  planet2: string
  aspect: string
  orb: number
  influence: 'harmonious' | 'challenging' | 'neutral'
  description: string
}

export interface HouseOverlay {
  planet: string
  house: number
  person: 'person1' | 'person2'
  description: string
}

export interface CompatibilityScore {
  overall: number
  emotional: number
  intellectual: number
  physical: number
  spiritual: number
}

export interface SynastryCompatibility {
  overview: {
    summary: string
    overallScore: number
    strengths: string[]
    challenges: string[]
    recommendations: string[]
  }
  aspects: SynastryAspect[]
  houseOverlays: HouseOverlay[]
  composite: {
    sunSign: string
    moonSign: string
    ascendant: string
    description: string
  }
  timing: {
    currentTransits: string[]
    futureHighlights: string[]
    advice: string
  }
}

export function useSynastry() {
  const [person1Data, setPerson1Data] = useState<PersonData>({
    name: '',
    birthTime: '',
    birthPlace: ''
  })
  
  const [person2Data, setPerson2Data] = useState<PersonData>({
    name: '',
    birthTime: '',
    birthPlace: ''
  })
  
  const [compatibility, setCompatibility] = useState<SynastryCompatibility | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const calculateCompatibility = useCallback(async () => {
    if (!person1Data.birthTime || !person2Data.birthTime) {
      setError('Please provide birth times for both people')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await synastryIntelligence.analyzeCompatibility(
        person1Data,
        person2Data
      )
      
      setCompatibility(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate compatibility')
    } finally {
      setIsLoading(false)
    }
  }, [person1Data, person2Data])

  const resetData = useCallback(() => {
    setPerson1Data({ name: '', birthTime: '', birthPlace: '' })
    setPerson2Data({ name: '', birthTime: '', birthPlace: '' })
    setCompatibility(null)
    setError(null)
  }, [])

  return {
    person1Data,
    person2Data,
    compatibility,
    isLoading,
    error,
    setPerson1Data,
    setPerson2Data,
    calculateCompatibility,
    resetData
  }
} 