import { NextRequest, NextResponse } from 'next/server'
import { scryingIntelligence } from '@/lib/scryingIntelligence'
import { devLog } from '@/lib/devLogger'

export const dynamic = 'force-static'

export async function GET(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD === '1') return NextResponse.json({ error: 'Not available in static export' }, { status: 404 })
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    devLog.info('🔮 Fetching Scrying profile for user:', userId, 'scrying')

    // Get user's scrying profile
    const profile = await scryingIntelligence.getUserScryingProfile(userId)

    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'No scrying profile found for this user' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        ...profile,
        timestamp: profile.timestamp.toISOString()
      }
    })
  } catch (error: any) {
    console.error('Error fetching scrying profile:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch scrying profile' 
      },
      { status: 500 }
    )
  }
}

