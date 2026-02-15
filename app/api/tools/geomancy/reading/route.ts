import { NextRequest, NextResponse } from 'next/server'
import { geomancyIntelligence } from '@/lib/geomancyIntelligence'
import { devLog } from '@/lib/devLogger'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { question, questionType, userId } = body

    if (!question || !question.trim()) {
      return NextResponse.json(
        { success: false, error: 'Question is required' },
        { status: 400 }
      )
    }

    devLog.info('🌍 Generating Geomancy reading for user:', userId, 'geomancy')
    devLog.debug('📝 Question:', question, 'geomancy')
    devLog.debug('🔮 Question Type:', questionType || 'auto-detected', 'geomancy')

    // Generate geomancy analysis
    const analysis = await geomancyIntelligence.performGeomancy(
      question.trim(),
      questionType || 'general'
    )

    // Optionally save to database (future enhancement)
    // For now, we'll just return the analysis
    if (userId) {
      // TODO: Implement saveAnalysis method in geomancyIntelligence if needed
      devLog.info('📊 Geomancy reading generated for user:', userId, 'geomancy')
    }

    return NextResponse.json({
      success: true,
      data: { ...analysis, question: question.trim() }
    })
  } catch (error: any) {
    devLog.error('Error generating geomancy reading:', error, 'route')
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to generate geomancy reading' 
      },
      { status: 500 }
    )
  }
}

