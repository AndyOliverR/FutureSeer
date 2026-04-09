import { NextRequest, NextResponse } from 'next/server'
import { devLog } from '@/lib/devLogger';
import { profileManager } from '@/lib/services/profileManager'
import { verifyUserRequest, resolveOwnedUserId } from '@/lib/userApiAuth';

export const dynamic = 'force-static'

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyUserRequest(request, 'profiles-route');
    if (!auth.ok) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const ownedUserId = resolveOwnedUserId(userId, auth.uid);

    if (!ownedUserId) {
      return NextResponse.json(
        { error: 'User ID is required and must match authenticated user' },
        { status: 403 }
      )
    }

    const profiles = await profileManager.getAdditionalProfiles(ownedUserId)
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
    const auth = await verifyUserRequest(request, 'profiles-route');
    if (!auth.ok) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json()
    const { userId, ...profileData } = body
    const ownedUserId = resolveOwnedUserId(userId, auth.uid);

    if (!ownedUserId) {
      return NextResponse.json(
        { error: 'User ID is required and must match authenticated user' },
        { status: 403 }
      )
    }

    if (!profileData.name || !profileData.dateOfBirth) {
      return NextResponse.json(
        { error: 'Name and Date of Birth are required' },
        { status: 400 }
      )
    }

    const profile = await profileManager.createAdditionalProfile(ownedUserId, profileData)
    return NextResponse.json({ success: true, profile })
  } catch (error: any) {
    devLog.error('Error creating profile:', error, 'route')
    return NextResponse.json(
      { error: error.message || 'Failed to create profile' },
      { status: 500 }
    )
  }
}

