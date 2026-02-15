import { NextRequest, NextResponse } from 'next/server'
import { devLog } from '@/lib/devLogger';
import { getBirthChart } from '@/lib/astroapp'

export async function POST(request: NextRequest) {
  try {
    const { birthDate, birthPlace } = await request.json()
    
    if (!birthDate || !birthPlace) {
      return NextResponse.json(
        { error: 'Birth date and birth place are required' },
        { status: 400 }
      )
    }

    const chartData = await getBirthChart(birthDate, birthPlace)
    return NextResponse.json(chartData)
  } catch (error: any) {
    devLog.error('AstroApp API error:', error, 'route')
    return NextResponse.json(
      { error: error.message || 'Failed to get birth chart' },
      { status: 500 }
    )
  }
}
