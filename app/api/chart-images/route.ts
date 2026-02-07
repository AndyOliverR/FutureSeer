/**
 * Chart Images API Route
 * Fetches astrological charts from VedAstro API and returns them with FutureSeer branding
 */

import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-static'
import { vedAstroApiService } from '@/lib/vedAstroApiService'
import { devLog } from '@/lib/devLogger'

export async function GET(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD === '1') {
    return NextResponse.json({ error: 'Not available in static export' }, { status: 404 })
  }
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const userId = searchParams.get('userId')

    if (!type || !userId) {
      return NextResponse.json(
        { 
          error: 'Missing required parameters',
          status: 'error',
          source: 'FutureSeer AI-Powered Mystic'
        },
        { status: 400 }
      )
    }

    // Get user profile from database or session
    // For now, we'll use default values - in production, fetch from database
    const birthData = {
      birthDate: '1990-01-01', // This should come from user profile
      birthTime: '12:00:00',
      birthPlace: 'New Delhi, India',
      latitude: 28.6139,
      longitude: 77.2090,
      timezone: 'Asia/Kolkata'
    }

    let chartData = null
    let hasRealChart = false
    let chartImageUrl = null

    try {
      // Map chart types to VedAstro API calls
      switch (type) {
        case 'divisional-d1':
          chartData = await vedAstroApiService.getDivisionalChart('D1', birthData)
          break
        case 'divisional-d9':
          chartData = await vedAstroApiService.getDivisionalChart('D9', birthData)
          break
        case 'divisional-d10':
          chartData = await vedAstroApiService.getDivisionalChart('D10', birthData)
          break
        case 'divisional-d12':
          chartData = await vedAstroApiService.getDivisionalChart('D12', birthData)
          break
        case 'divisional-d16':
          chartData = await vedAstroApiService.getDivisionalChart('D16', birthData)
          break
        case 'divisional-d20':
          chartData = await vedAstroApiService.getDivisionalChart('D20', birthData)
          break
        default:
          throw new Error(`Unsupported chart type: ${type}`)
      }

      // Check if we got real chart data from VedAstro
      if (chartData && chartData.Payload && chartData.Payload.chartImageUrl) {
        hasRealChart = true
        chartImageUrl = chartData.Payload.chartImageUrl
      }

    } catch (vedAstroError) {
      devLog.info('ℹ️ VedAstro API unavailable, using FutureSeer fallback', undefined, 'chart-images')
      // Continue with fallback
    }

    // Return response with FutureSeer branding
    const response = {
      status: hasRealChart ? 'success' : 'vedastro_api_unavailable',
      title: getChartTitle(type),
      message: hasRealChart 
        ? 'Real astrological chart from VedAstro API' 
        : 'Advanced Vedic Astrology Calculations by FutureSeer',
      chartImageUrl,
      hasRealChart,
      timestamp: new Date().toISOString(),
      source: 'FutureSeer AI-Powered Mystic',
      fallbackData: {
        description: getChartDescription(type),
        significance: getChartSignificance(type)
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('❌ Chart Images API Error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to generate chart',
        status: 'error',
        message: 'FutureSeer is working on generating your chart',
        timestamp: new Date().toISOString(),
        source: 'FutureSeer AI-Powered Mystic'
      },
      { status: 500 }
    )
  }
}

function getChartTitle(type: string): string {
  const titles: { [key: string]: string } = {
    'divisional-d1': 'Rashi Chart (D1)',
    'divisional-d9': 'Navamsha Chart (D9)',
    'divisional-d10': 'Dasamsha Chart (D10)',
    'divisional-d12': 'Dwadasamsha Chart (D12)',
    'divisional-d16': 'Shodasamsha Chart (D16)',
    'divisional-d20': 'Vimsamsha Chart (D20)'
  }
  return titles[type] || 'Astrological Chart'
}

function getChartDescription(type: string): string {
  const descriptions: { [key: string]: string } = {
    'divisional-d1': 'Main birth chart showing planetary positions and houses',
    'divisional-d9': 'Spiritual development and marriage chart',
    'divisional-d10': 'Career and profession chart',
    'divisional-d12': 'Parents and ancestors chart',
    'divisional-d16': 'Vehicles and comforts chart',
    'divisional-d20': 'Spiritual practices chart'
  }
  return descriptions[type] || 'Astrological chart analysis'
}

function getChartSignificance(type: string): string {
  const significances: { [key: string]: string } = {
    'divisional-d1': 'Primary chart for personality and life events',
    'divisional-d9': 'Shows inner nature and spiritual path',
    'divisional-d10': 'Reveals professional success and career path',
    'divisional-d12': 'Shows relationship with parents and lineage',
    'divisional-d16': 'Reveals material comforts and vehicles',
    'divisional-d20': 'Shows spiritual inclinations and practices'
  }
  return significances[type] || 'Important astrological insights'
}