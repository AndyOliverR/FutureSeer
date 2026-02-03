/**
 * Custom hook for FutureSeer Chart Images
 * Provides chart generation and visual representation capabilities
 * 
 * This hook incorporates open-source Vedic astrology chart generation
 * and methodologies from established astrological projects.
 * 
 * Third-party attribution: See internal documentation for details.
 */

import { useState, useEffect } from 'react'
import { chartImageService, ChartImageData, DivisionalChart, EventPrediction, TarabalaData } from '@/lib/chartImageService'

interface UserProfile {
  uid: string
  birthDate: string
  birthPlace: string
  latitude?: number
  longitude?: number
  timezone?: string
}

export const useChartImages = (userProfile: UserProfile | null) => {
  const [chartImages, setChartImages] = useState<ChartImageData[]>([])
  const [divisionalCharts, setDivisionalCharts] = useState<DivisionalChart[]>([])
  const [eventPredictions, setEventPredictions] = useState<EventPrediction[]>([])
  const [tarabalaData, setTarabalaData] = useState<TarabalaData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (userProfile?.uid && userProfile?.birthDate && userProfile?.birthPlace) {
      generateAllCharts()
    }
  }, [userProfile])

  const generateAllCharts = async () => {
    if (!userProfile) return

    setLoading(true)
    setError(null)

    try {
      console.log('🎨 FutureSeer: Generating all chart images...')
      
      // Generate basic chart images
      const nakshatraWheel = await chartImageService.generateNakshatraWheel(userProfile)
      const dasaTimeline = await chartImageService.generateDasaTimeline(userProfile)
      const gocharaChart = await chartImageService.generateGocharaCharts(userProfile)
      const eventChart = await chartImageService.generateEventChart(userProfile)
      
      setChartImages([nakshatraWheel, dasaTimeline, gocharaChart, eventChart])
      
      // Generate divisional charts
      const divisionalChartsData = await chartImageService.generateDivisionalCharts(userProfile)
      setDivisionalCharts(divisionalChartsData)
      
      // Generate event predictions
      const eventPredictionsData = await chartImageService.getEventPredictions(userProfile)
      setEventPredictions(eventPredictionsData)
      
      // Generate Tarabala data
      const tarabalaDataResult = await chartImageService.getTarabalaData(userProfile)
      setTarabalaData(tarabalaDataResult)
      
      console.log('✅ FutureSeer: All chart images generated successfully')
    } catch (err) {
      console.error('❌ FutureSeer: Error generating chart images:', err)
      setError('An error occurred while generating your chart images.')
    } finally {
      setLoading(false)
    }
  }

  const refreshCharts = async () => {
    await generateAllCharts()
  }

  return {
    chartImages,
    divisionalCharts,
    eventPredictions,
    tarabalaData,
    loading,
    error,
    refreshCharts,
    hasCharts: chartImages.length > 0
  }
}
