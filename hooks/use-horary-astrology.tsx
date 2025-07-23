"use client"

import { useState, useEffect } from 'react'
import { useAuth } from './use-auth'
import { horaryAstrologyIntelligence, HoraryQuestion, HoraryAnalysis, HoraryReading } from '@/lib/horaryAstrologyIntelligence'

export function useHoraryAstrology() {
  const { user, userProfile } = useAuth()
  const [data, setData] = useState<HoraryAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [readingHistory, setReadingHistory] = useState<HoraryReading[]>([])

  const castChart = async (question: string, category: HoraryQuestion['category'] = 'general', urgency: HoraryQuestion['urgency'] = 'medium') => {
    if (!user) {
      setError('Authentication required')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const horaryQuestion: HoraryQuestion = {
        question,
        category,
        urgency,
        askedAt: new Date(),
        askedFrom: {
          latitude: userProfile?.latitude || 0,
          longitude: userProfile?.longitude || 0,
          place: userProfile?.birthPlace || 'Unknown'
        }
      }

      const analysis = await horaryAstrologyIntelligence.castHoraryChart(horaryQuestion)
      setData(analysis)
      setLastUpdated(new Date())

      // Save reading to history
      const reading: HoraryReading = {
        id: Date.now().toString(),
        question,
        analysis,
        timestamp: new Date(),
        userId: user.uid
      }
      await horaryAstrologyIntelligence.saveReading(user.uid, reading)
      
      // Update reading history
      setReadingHistory(prev => [reading, ...prev.slice(0, 9)]) // Keep last 10 readings
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cast horary chart')
    } finally {
      setLoading(false)
    }
  }

  const loadReadingHistory = async () => {
    if (!user) return

    try {
      const history = await horaryAstrologyIntelligence.getReadingHistory(user.uid)
      setReadingHistory(history)
    } catch (err) {
      console.warn('Error loading reading history:', err)
    }
  }

  useEffect(() => {
    if (user) {
      loadReadingHistory()
    }
  }, [user])

  const getSystemStatus = () => {
    return horaryAstrologyIntelligence.getSystemStatus()
  }

  return {
    data,
    loading,
    error,
    lastUpdated,
    readingHistory,
    castChart,
    loadReadingHistory,
    getSystemStatus
  }
} 