/**
 * Custom hook for FutureSeer Advanced Astrological Analysis
 * Provides comprehensive Vedic astrology insights for users
 * 
 * This hook incorporates open-source Vedic astrology calculations
 * and methodologies from established astrological projects.
 * 
 * Third-party attribution: See internal documentation for details.
 */

import { useState, useEffect } from 'react'
import { futureSeerAstroService, ComprehensiveAnalysis, PersonalizedRemedy, CoachingInsight } from '@/lib/futureSeerAstroService'

interface UserProfile {
  uid: string
  birthDate: string
  birthPlace: string
  latitude?: number
  longitude?: number
  timezone?: string
}

export const useFutureSeerAnalysis = (userProfile: UserProfile | null) => {
  const [analysis, setAnalysis] = useState<ComprehensiveAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (userProfile?.uid && userProfile?.birthDate && userProfile?.birthPlace) {
      // First try to load from cache
      const cachedAnalysis = futureSeerAstroService.getCachedAnalysis(userProfile.uid)
      if (cachedAnalysis) {
        setAnalysis(cachedAnalysis)
        return
      }

      // If no cache, generate new analysis
      generateAnalysis()
    }
  }, [userProfile])

  const generateAnalysis = async () => {
    if (!userProfile) return

    setLoading(true)
    setError(null)

    try {
      console.log('🔮 FutureSeer: Starting comprehensive analysis generation...')
      const newAnalysis = await futureSeerAstroService.getComprehensiveAnalysis(userProfile)
      
      if (newAnalysis) {
        setAnalysis(newAnalysis)
        console.log('✅ FutureSeer: Analysis generated and set successfully')
      } else {
        setError('Failed to generate analysis. Please try again.')
      }
    } catch (err) {
      console.error('❌ FutureSeer: Error in analysis generation:', err)
      setError('An error occurred while generating your analysis.')
    } finally {
      setLoading(false)
    }
  }

  const refreshAnalysis = async () => {
    if (!userProfile) return

    // Clear cache and generate new analysis
    futureSeerAstroService.clearCachedAnalysis(userProfile.uid)
    await generateAnalysis()
  }

  return {
    analysis,
    loading,
    error,
    refreshAnalysis,
    hasAnalysis: !!analysis
  }
}

export const useFutureSeerRemedies = (userProfile: UserProfile | null) => {
  const [remedies, setRemedies] = useState<PersonalizedRemedy[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (userProfile?.uid && userProfile?.birthDate && userProfile?.birthPlace) {
      generateRemedies()
    }
  }, [userProfile])

  const generateRemedies = async () => {
    if (!userProfile) return

    setLoading(true)
    setError(null)

    try {
      console.log('💎 FutureSeer: Generating personalized remedies...')
      const newRemedies = await futureSeerAstroService.getPersonalizedRemedies(userProfile)
      setRemedies(newRemedies)
      console.log('✅ FutureSeer: Remedies generated successfully')
    } catch (err) {
      console.error('❌ FutureSeer: Error generating remedies:', err)
      setError('An error occurred while generating your remedies.')
    } finally {
      setLoading(false)
    }
  }

  return {
    remedies,
    loading,
    error,
    refreshRemedies: generateRemedies,
    hasRemedies: remedies.length > 0
  }
}

export const useFutureSeerCoaching = (userProfile: UserProfile | null) => {
  const [insights, setInsights] = useState<CoachingInsight[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (userProfile?.uid && userProfile?.birthDate && userProfile?.birthPlace) {
      generateInsights()
    }
  }, [userProfile])

  const generateInsights = async () => {
    if (!userProfile) return

    setLoading(true)
    setError(null)

    try {
      console.log('🧠 FutureSeer: Generating coaching insights...')
      const newInsights = await futureSeerAstroService.getCoachingInsights(userProfile)
      setInsights(newInsights)
      console.log('✅ FutureSeer: Coaching insights generated successfully')
    } catch (err) {
      console.error('❌ FutureSeer: Error generating coaching insights:', err)
      setError('An error occurred while generating your coaching insights.')
    } finally {
      setLoading(false)
    }
  }

  return {
    insights,
    loading,
    error,
    refreshInsights: generateInsights,
    hasInsights: insights.length > 0
  }
}

