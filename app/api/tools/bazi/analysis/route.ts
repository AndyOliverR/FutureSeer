import { NextRequest, NextResponse } from 'next/server'
import { baziIntelligence, type BaziProfileInput } from '@/lib/baziIntelligence'
import { getUserProfile } from '@/lib/firebase'
import { devLog } from '@/lib/devLogger'
import { normalizeTimeString } from '@/lib/timeUtils'

export const dynamic = 'force-dynamic'

function normalizeProfileFromBody(body: Record<string, unknown>): { birthDate?: string; birthTime?: string; birthPlace?: string; birthLatitude?: number; birthLongitude?: number; gender?: string } | null {
  const raw = body.userProfile as Record<string, unknown> | undefined
  if (!raw || typeof raw !== 'object') return null
  const birthDate = (raw.birthDate ?? raw.birth_date) as string | undefined
  const birthTime = (raw.birthTime ?? raw.birth_time) as string | undefined
  const birthPlace = (raw.birthPlace ?? raw.birth_place) as string | undefined
  if (!birthDate || !birthPlace) return null
  return {
    birthDate,
    birthTime: birthTime && String(birthTime).trim() ? (birthTime as string) : undefined,
    birthPlace,
    birthLatitude: (raw.birthLatitude ?? raw.birth_latitude) as number | undefined,
    birthLongitude: (raw.birthLongitude ?? raw.birth_longitude) as number | undefined,
    gender: (raw.gender as string | undefined),
  }
}

/** Normalize birthTime to 24h HH:mm for BaZi calculation. Handles HH:mm, HH:mm:ss, and 12h (e.g. "2:15 PM"). */
function normalizeBirthTimeToHHmm(birthTime: string | undefined): string {
  const raw = birthTime ? String(birthTime).trim() : ''
  if (!raw) return '12:00'
  const fromUtils = normalizeTimeString(raw)
  if (!fromUtils) return '12:00'
  const s = fromUtils.trim()
  // 12h format: e.g. "2:15 PM", "11:30 AM", "12:00:00 PM"
  const twelve = s.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)$/i)
  if (twelve) {
    let h = parseInt(twelve[1], 10)
    const m = parseInt(twelve[2], 10) || 0
    const pm = (twelve[4] || '').toUpperCase() === 'PM'
    if (h === 12) h = pm ? 12 : 0
    else if (pm) h += 12
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  }
  // 24h HH:mm or HH:mm:ss — take first two parts
  const parts = s.split(':').map((p) => parseInt(p, 10))
  const hour = Number.isNaN(parts[0]) ? 12 : Math.min(23, Math.max(0, parts[0]))
  const minute = Number.isNaN(parts[1]) ? 0 : Math.min(59, Math.max(0, parts[1]))
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body
    const hasUserProfile = !!(body.userProfile && typeof body.userProfile === 'object')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    devLog.info('[BaZi] POST /api/tools/bazi/analysis called', { userId, hasUserProfile }, 'bazi')

    // Use profile from request body when provided (e.g. by profile-generation orchestrator); otherwise fetch from DB
    let userProfile = normalizeProfileFromBody(body)
    if (!userProfile) {
      try {
        const fetched = await getUserProfile(userId)
        if (fetched?.birthDate && fetched?.birthPlace) {
          userProfile = {
            birthDate: fetched.birthDate,
            birthTime: fetched.birthTime && String(fetched.birthTime).trim() ? fetched.birthTime : undefined,
            birthPlace: fetched.birthPlace,
            birthLatitude: fetched.birthLatitude,
            birthLongitude: fetched.birthLongitude,
            gender: fetched.gender,
          }
        }
      } catch (profileError) {
        devLog.error('[BaZi] Failed to fetch user profile', profileError, 'route')
        return NextResponse.json(
          { success: false, error: 'Failed to fetch user profile' },
          { status: 400 }
        )
      }
    }

    if (!userProfile?.birthDate || !userProfile?.birthPlace) {
      return NextResponse.json(
        { success: false, error: 'Complete profile (birth date and place) is required for BaZi analysis' },
        { status: 400 }
      )
    }

    const birthTimeNormalized = normalizeBirthTimeToHHmm(userProfile.birthTime)
    const profileForBazi: BaziProfileInput = {
      birthDate: userProfile.birthDate,
      birthTime: birthTimeNormalized,
      birthPlace: userProfile.birthPlace,
      ...(userProfile.birthLatitude != null && { birthLatitude: userProfile.birthLatitude }),
      ...(userProfile.birthLongitude != null && { birthLongitude: userProfile.birthLongitude }),
      ...(userProfile.gender != null && userProfile.gender !== '' && { gender: userProfile.gender }),
    }

    const reading = await baziIntelligence.getBaziReading(userId, profileForBazi)

    return NextResponse.json({
      success: true,
      data: {
        ...reading,
        metadata: {
          ...reading.metadata,
          lastUpdated: reading.metadata.lastUpdated.toISOString()
        }
      }
    })
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error))
    devLog.error('[BaZi] Error generating BaZi reading', { message: err.message, stack: err.stack }, 'route')
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Failed to generate BaZi reading'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    devLog.info('🏮 Fetching BaZi reading for user:', userId, 'bazi')

    // Fetch user profile
    const userProfile = await getUserProfile(userId)
    
    if (!userProfile) {
      return NextResponse.json(
        { success: false, error: 'User profile not found' },
        { status: 404 }
      )
    }

    if (!userProfile.birthDate || !userProfile.birthPlace) {
      return NextResponse.json(
        { success: false, error: 'Complete profile (birth date and place) is required for BaZi analysis' },
        { status: 400 }
      )
    }

    const birthTimeNormalized = normalizeBirthTimeToHHmm(userProfile.birthTime)
    const profileForBazi: BaziProfileInput = {
      birthDate: userProfile.birthDate,
      birthTime: birthTimeNormalized,
      birthPlace: userProfile.birthPlace,
      ...(userProfile.birthLatitude != null && { birthLatitude: userProfile.birthLatitude }),
      ...(userProfile.birthLongitude != null && { birthLongitude: userProfile.birthLongitude }),
      ...(userProfile.gender != null && userProfile.gender !== '' && { gender: userProfile.gender }),
    }

    const reading = await baziIntelligence.getBaziReading(userId, profileForBazi)

    return NextResponse.json({
      success: true,
      data: {
        ...reading,
        metadata: {
          ...reading.metadata,
          lastUpdated: reading.metadata.lastUpdated.toISOString()
        }
      }
    })
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error))
    devLog.error('[BaZi] Error fetching BaZi reading', { message: err.message, stack: err.stack }, 'route')
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch BaZi reading' },
      { status: 500 }
    )
  }
}

