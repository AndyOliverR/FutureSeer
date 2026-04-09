import { NextRequest, NextResponse } from 'next/server'
import { devLog } from '@/lib/devLogger';
import { profileManager } from '@/lib/services/profileManager'
import { verifyUserRequest, resolveOwnedUserId } from '@/lib/userApiAuth';

export const dynamic = 'force-static'

export async function generateStaticParams() {
  return [{ profileId: '_' }]
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ profileId: string }> }
) {
  if (process.env.CAPACITOR_BUILD === '1') {
    return NextResponse.json({ error: 'Not available in static export' }, { status: 404 })
  }
  try {
    const auth = await verifyUserRequest(request, 'profiles-id-route');
    if (!auth.ok) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { profileId } = await params
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const ownedUserId = resolveOwnedUserId(userId, auth.uid);

    if (!ownedUserId) {
      return NextResponse.json(
        { error: 'User ID is required and must match authenticated user' },
        { status: 403 }
      )
    }

    const profile = await profileManager.getAdditionalProfile(ownedUserId, profileId)
    
    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, profile })
  } catch (error: any) {
    devLog.error('Error fetching profile:', error, 'route')
    return NextResponse.json(
      { error: error.message || 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ profileId: string }> }
) {
  try {
    const auth = await verifyUserRequest(request, 'profiles-id-route');
    if (!auth.ok) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { profileId } = await params
    const body = await request.json()
    const { userId, ...updates } = body
    const ownedUserId = resolveOwnedUserId(userId, auth.uid);

    if (!ownedUserId) {
      return NextResponse.json(
        { error: 'User ID is required and must match authenticated user' },
        { status: 403 }
      )
    }

    const profile = await profileManager.updateAdditionalProfile(ownedUserId, profileId, updates)
    
    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, profile })
  } catch (error: any) {
    devLog.error('Error updating profile:', error, 'route')
    return NextResponse.json(
      { error: error.message || 'Failed to update profile' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ profileId: string }> }
) {
  try {
    const auth = await verifyUserRequest(request, 'profiles-id-route');
    if (!auth.ok) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { profileId } = await params
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const ownedUserId = resolveOwnedUserId(userId, auth.uid);

    if (!ownedUserId) {
      return NextResponse.json(
        { error: 'User ID is required and must match authenticated user' },
        { status: 403 }
      )
    }

    const success = await profileManager.deleteAdditionalProfile(ownedUserId, profileId)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    devLog.error('Error deleting profile:', error, 'route')
    return NextResponse.json(
      { error: error.message || 'Failed to delete profile' },
      { status: 500 }
    )
  }
}

