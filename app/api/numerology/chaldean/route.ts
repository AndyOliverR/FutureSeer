import { NextResponse } from 'next/server'
import { computeChaldeanProfile, ChaldeanInterpretations } from '@/lib/numerology/chaldean'
import { devLog } from '@/lib/devLogger'

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const { userId, birthDate, currentName } = body || {}

    if (!birthDate || !currentName) {
      return NextResponse.json(
        { error: 'currentName and birthDate are required' },
        { status: 400 }
      )
    }

    const result = computeChaldeanProfile(currentName, birthDate)

    // Build interpretations for quick UI text
    const interp = {
      lifePath: ChaldeanInterpretations[result.numbers.lifePath] || '',
      destiny: ChaldeanInterpretations[result.numbers.destiny] || '',
      soulUrge: ChaldeanInterpretations[result.numbers.soulUrge] || '',
      personality: ChaldeanInterpretations[result.numbers.personality] || '',
      birthday: ChaldeanInterpretations[result.numbers.birthday] || '',
      maturity: ChaldeanInterpretations[result.numbers.maturity] || ''
    }

    // Optional: soft persist via Admin SDK if available; ignore failures
    try {
      if (userId) {
        const { getFirestore } = await import('firebase-admin/firestore')
        const db = getFirestore()
        await db
          .collection('users')
          .doc(userId)
          .collection('numerology')
          .doc('chaldean')
          .set(
            {
              result,
              interpretations: interp,
              updatedAt: new Date().toISOString()
            },
            { merge: true }
          )
      }
    } catch (e) {
      devLog.warn('Numerology soft-save skipped:', e, 'numerology')
    }

    return NextResponse.json({
      success: true,
      data: {
        result,
        interpretations: interp,
        metadata: {
          generatedAt: new Date().toISOString(),
          system: 'Chaldean',
          version: '1.0.0'
        }
      }
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to compute Chaldean numerology'
      },
      { status: 500 }
    )
  }
}


