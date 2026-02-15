/**
 * Zi Wei Dou Shu Report Generation API
 * Generates comprehensive personalized reports
 */

import { NextRequest, NextResponse } from 'next/server'
import { chineseAstrologyService, BirthInfo } from '@/lib/chinese/chineseAstrologyService'
import { generateZiWeiReport } from '@/lib/chinese/ziweiReportGenerator'
import { UserProfile } from '@/lib/firebase'
import { devLog } from '@/lib/devLogger'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, birthData, userProfile } = body

    if (!birthData) {
      return NextResponse.json(
        { success: false, error: 'Birth data is required' },
        { status: 400 }
      )
    }

    // Validate birth data
    if (!birthData.solarDate || !birthData.solarTime || !birthData.gender) {
      return NextResponse.json(
        { success: false, error: 'Complete birth data (date, time, gender) is required' },
        { status: 400 }
      )
    }

    devLog.info('🔮 Generating Zi Wei Dou Shu report for user:', userId, 'chinese-astrology')

    // Ensure displayName is set - if missing or equals fullName, default to "AnDY"
    const profileWithDisplayName = userProfile as UserProfile | null
    if (profileWithDisplayName && (!profileWithDisplayName.displayName || profileWithDisplayName.displayName === profileWithDisplayName.fullName)) {
      profileWithDisplayName.displayName = 'AnDY'
    }

    // Calculate chart
    const chartData = chineseAstrologyService.calculateZiWeiChart(
      birthData as BirthInfo,
      true // Include runtime context
    )

    // Generate comprehensive report with displayName ensured
    const report = generateZiWeiReport(chartData, profileWithDisplayName)

    devLog.info('✅ Zi Wei Dou Shu report generated successfully', undefined, 'chinese-astrology')

    return NextResponse.json({
      success: true,
      data: {
        chartData,
        report,
        generatedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    devLog.error('❌ Error generating Zi Wei Dou Shu report:', error, 'route')
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate report',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    )
  }
}

