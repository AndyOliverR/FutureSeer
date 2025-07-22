import { NextRequest, NextResponse } from 'next/server'
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
    console.error('AstroApp API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get birth chart' },
      { status: 500 }
    )
  }
}
