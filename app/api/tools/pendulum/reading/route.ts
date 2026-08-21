import { NextRequest, NextResponse } from 'next/server'
import { pendulumIntelligence } from '@/lib/pendulumIntelligence'
import { sanitizePendulumQuestion } from '@/lib/pendulumSeerState'
import { verifyUserRequest } from '@/lib/userApiAuth'
import { decideUserScopedAccess } from '@/lib/security/userScopedAccess'
import { devLog } from '@/lib/devLogger'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { question, pendulumType, userId } = body

    if (!question || !question.trim()) {
      return NextResponse.json(
        { success: false, error: 'Question is required' },
        { status: 400 }
      )
    }

    const sanitizedQuestion = sanitizePendulumQuestion(question.trim())

    devLog.info('⏳ Generating Pendulum reading for user:', userId, 'pendulum')
    devLog.debug('📝 Question:', sanitizedQuestion, 'pendulum')
    devLog.debug('🔮 Pendulum Type:', pendulumType || 'general', 'pendulum')

    // Validate pendulum type if provided
    const validTypes = ['crystal', 'metal', 'wood', 'stone']
    const validatedType = pendulumType && validTypes.includes(pendulumType)
      ? pendulumType as 'crystal' | 'metal' | 'wood' | 'stone'
      : undefined

    // Generate pendulum analysis (with sanitized question)
    const analysis = await pendulumIntelligence.answerQuestion(
      sanitizedQuestion,
      validatedType
    )

    // Persist only when the caller owns userId (Stage B / anonymous skip save).
    if (userId && typeof userId === 'string') {
      const auth = await verifyUserRequest(request, 'pendulum')
      const access = decideUserScopedAccess(userId, auth)
      if (access.kind === 'owned') {
        await pendulumIntelligence.saveAnalysis(access.userId, analysis)
      }
    }

    return NextResponse.json({
      success: true,
      data: analysis
    })
  } catch (error: any) {
    devLog.error('Error generating pendulum reading:', error, 'route')
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to generate pendulum reading' 
      },
      { status: 500 }
    )
  }
}
