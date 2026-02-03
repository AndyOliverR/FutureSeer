import { NextRequest, NextResponse } from 'next/server'
import { getKabbalisticAnalysis } from '@/lib/kabbalisticNumerologyIntelligence'

/**
 * POST /api/tools/kabbalistic-numerology/analysis
 * Server-side Kabbalistic analysis (avoids heavy client bundle and main-thread blocking).
 * Body: { name: string, birthDate: string, userId?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, birthDate, userId } = body

    if (!name || !birthDate) {
      return NextResponse.json(
        { success: false, error: 'Name and birthDate are required' },
        { status: 400 }
      )
    }

    const uid = userId ?? 'anonymous'
    const result = await getKabbalisticAnalysis(uid, { name, birthDate })

    return NextResponse.json({ success: true, data: result })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to generate Kabbalistic analysis'
    console.error('Kabbalistic analysis API error:', err)
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
