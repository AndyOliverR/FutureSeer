import { NextRequest, NextResponse } from 'next/server'
import { devLog } from '@/lib/devLogger';
import { profileManager } from '@/lib/services/profileManager'

export const dynamic = 'force-static'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const profiles = await profileManager.getAdditionalProfiles(userId)
    return NextResponse.json({ success: true, profiles })
  } catch (error: any) {
    devLog.error('Error fetching profiles:', error, 'route')
    return NextResponse.json(
      { error: error.message || 'Failed to fetch profiles' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, ...profileData } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    if (!profileData.name || !profileData.dateOfBirth) {
      return NextResponse.json(
        { error: 'Name and Date of Birth are required' },
        { status: 400 }
      )
    }

    const profile = await profileManager.createAdditionalProfile(userId, profileData)
    return NextResponse.json({ success: true, profile })
  } catch (error: any) {
    devLog.error('Error creating profile:', error, 'route')
    return NextResponse.json(
      { error: error.message || 'Failed to create profile' },
      { status: 500 }
    )
  }
}

