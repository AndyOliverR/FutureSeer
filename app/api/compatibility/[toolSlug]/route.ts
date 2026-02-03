import { NextRequest, NextResponse } from 'next/server'
import { calculateCompatibility } from '@/lib/services/compatibilityService'
import { getLocalUserProfile } from '@/lib/localStorage'
import { AdditionalProfile } from '@/lib/types/profileTypes'
import { profileManager } from '@/lib/services/profileManager'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ toolSlug: string }> }
) {
  try {
    const { toolSlug } = await params
    const body = await request.json()
    const { userId, profileId } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    if (!profileId) {
      return NextResponse.json(
        { error: 'Profile ID is required' },
        { status: 400 }
      )
    }

    // Get user profile
    const userProfile = getLocalUserProfile()
    if (!userProfile) {
      return NextResponse.json(
        { error: 'User profile not found. Please complete your profile first.' },
        { status: 404 }
      )
    }

    // Get additional profile
    const additionalProfile = await profileManager.getAdditionalProfile(userId, profileId)
    if (!additionalProfile) {
      return NextResponse.json(
        { error: 'Additional profile not found' },
        { status: 404 }
      )
    }

    // Calculate compatibility
    const report = await calculateCompatibility(
      toolSlug,
      userProfile,
      additionalProfile
    )

    return NextResponse.json({ success: true, report })
  } catch (error: any) {
    console.error('Error calculating compatibility:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to calculate compatibility' },
      { status: 500 }
    )
  }
}

