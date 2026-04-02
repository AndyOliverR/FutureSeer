import { useState, useCallback } from 'react'
import { normalizeBirthTime } from '@/lib/birthTimeUtils'

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

/** Per-person natal summary (Sun, Moon, Venus, Mars sign + house) for Ask the Seer dual chart state. */
export interface PersonNatalSummary {
  sun: { sign: string; house: number }
  moon: { sign: string; house: number }
  venus: { sign: string; house: number }
  mars: { sign: string; house: number }
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
  /** Person 1 natal summary (Sun/Moon/Venus/Mars sign + house) for Ask the Seer. */
  person1Natal?: PersonNatalSummary
  /** Person 2 natal summary (Sun/Moon/Venus/Mars sign + house) for Ask the Seer. */
  person2Natal?: PersonNatalSummary
}

export function useSynastry() {
  const [birthData1, setBirthData1] = useState({
    name: '',
    birthDate: '',
    birthTime: '',
    birthLocation: ''
  })
  const [birthData2, setBirthData2] = useState({
    name: '',
    birthDate: '',
    birthTime: '',
    birthLocation: ''
  })
  const [analysis, setAnalysis] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const performSynastryAnalysis = useCallback(async () => {
    if (!birthData1.name || !birthData1.birthDate || !birthData1.birthTime || !birthData1.birthLocation || !birthData2.name || !birthData2.birthDate || !birthData2.birthTime || !birthData2.birthLocation) {
      setError('Please provide all birth details for both people')
      return
    }
    
    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(birthData1.birthDate) || !dateRegex.test(birthData2.birthDate)) {
      setError('Invalid date format. Please use YYYY-MM-DD format.')
      return
    }
    
    // Normalize to HH:MM (profile/API often store HH:MM:SS from normalizeBirthTime)
    const hm1 = normalizeBirthTime(birthData1.birthTime).slice(0, 5)
    const hm2 = normalizeBirthTime(birthData2.birthTime).slice(0, 5)
    const timeRegex = /^\d{2}:\d{2}$/
    if (!timeRegex.test(hm1) || !timeRegex.test(hm2)) {
      setError('Invalid time format. Please use HH:MM format (24-hour).')
      return
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      console.log('💕 Starting synastry analysis...', {
        person1: birthData1.name,
        person2: birthData2.name
      })
      
      // Import synastryIntelligence
      const { synastryIntelligence } = await import('@/lib/synastryIntelligence')
      
      // Prepare PersonData objects
      const person1: PersonData = {
        name: birthData1.name,
        birthTime: `${birthData1.birthDate} ${hm1}`,
        birthPlace: birthData1.birthLocation
      }
      
      const person2: PersonData = {
        name: birthData2.name,
        birthTime: `${birthData2.birthDate} ${hm2}`,
        birthPlace: birthData2.birthLocation
      }
      
      console.log('💕 Person data prepared:', { person1, person2 })
      
      // Perform synastry analysis
      console.log('💕 Calling analyzeCompatibility...')
      const compatibility = await synastryIntelligence.analyzeCompatibility(person1, person2)
      
      console.log('💕 Analysis completed:', compatibility)
      console.log('💕 Compatibility score:', compatibility.overview.overallScore)
      console.log('💕 Aspects count:', compatibility.aspects.length)
      
      setAnalysis(compatibility)
      setIsLoading(false)
      console.log('💕 Analysis state updated successfully')
    } catch (err) {
      console.error('❌ Synastry analysis error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to calculate compatibility'
      console.error('❌ Error details:', {
        message: errorMessage,
        stack: err instanceof Error ? err.stack : 'No stack trace',
        error: err
      })
      setError(errorMessage)
      setIsLoading(false)
    }
  }, [birthData1, birthData2])

  const resetData = useCallback(() => {
    setBirthData1({ name: '', birthDate: '', birthTime: '', birthLocation: '' })
    setBirthData2({ name: '', birthDate: '', birthTime: '', birthLocation: '' })
    setAnalysis(null)
    setError(null)
  }, [])

  return {
    birthData1: birthData1 || { name: '', birthDate: '', birthTime: '', birthLocation: '' },
    birthData2: birthData2 || { name: '', birthDate: '', birthTime: '', birthLocation: '' },
    analysis,
    isLoading,
    error,
    setBirthData1,
    setBirthData2,
    performSynastryAnalysis,
    resetData
  }
} 