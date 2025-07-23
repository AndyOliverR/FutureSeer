"use client"

import { useState, useEffect } from 'react'
import { useAuth } from './use-auth'
import { kpAstrologyIntelligence, KPChartData, KPAnalysis, KPQuestion, KPAnswer } from '@/lib/kpAstrologyIntelligence'

export function useKPAstrology() {
  const { user, userProfile } = useAuth()
  const [data, setData] = useState<KPAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Auto-fetch on sign-in if user has birth data
  useEffect(() => {
    if (user && userProfile?.birthDate && userProfile?.birthPlace && !data) {
      analyze({
        birthDate: userProfile.birthDate,
        birthTime: userProfile.birthTime || "12:00",
        birthPlace: userProfile.birthPlace,
        latitude: 0,
        longitude: 0
      })
    }
  }, [user, userProfile, data])

  const analyze = async (chartData: KPChartData) => {
    if (!user) {
      setError('Authentication required')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const analysis = await kpAstrologyIntelligence.analyzeChart(chartData)
      setData(analysis)
      setLastUpdated(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze KP chart')
    } finally {
      setLoading(false)
    }
  }

  const answerQuestion = async (question: string, category: KPQuestion['category'] = 'general', urgency: KPQuestion['urgency'] = 'medium'): Promise<KPAnswer | null> => {
    if (!data) {
      setError('Please analyze your KP chart first')
      return null
    }

    const kpQuestion: KPQuestion = {
      question,
      category,
      urgency
    }

    try {
      const answer = await kpAstrologyIntelligence.answerQuestion(data, kpQuestion)
      return answer
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to answer question')
      return null
    }
  }

  const refresh = async () => {
    if (userProfile?.birthDate && userProfile?.birthPlace) {
      await analyze({
        birthDate: userProfile.birthDate,
        birthTime: userProfile.birthTime || "12:00",
        birthPlace: userProfile.birthPlace,
        latitude: 0,
        longitude: 0
      })
    }
  }

  const getSystemStatus = () => {
    return kpAstrologyIntelligence.getSystemStatus()
  }

  return {
    data,
    loading,
    error,
    lastUpdated,
    analyze,
    answerQuestion,
    refresh,
    getSystemStatus
  }
} 