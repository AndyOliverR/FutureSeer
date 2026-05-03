import { NextRequest, NextResponse } from 'next/server';
import { devLog } from '@/lib/devLogger';
import { verifyUserRequest, resolveOwnedUserId } from '@/lib/userApiAuth';
import { userRootDocGet, userRootDocUpdate } from '@/lib/userSubcollectionFirestore';

export const dynamic = 'force-static'

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyUserRequest(request, 'personalization-profile');
    if (!auth.ok) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = resolveOwnedUserId(searchParams.get('userId'), auth.uid);

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required and must match authenticated user' }, { status: 403 });
    }

    const userData = await userRootDocGet(userId);

    if (!userData) {
      return NextResponse.json({
        success: true,
        advancedProfile: {}
      });
    }

    const advancedProfile = userData.advancedProfile || {};

    return NextResponse.json({
      success: true,
      advancedProfile
    });

  } catch (error) {
    devLog.error('Error fetching advanced profile:', error, 'route');
    return NextResponse.json({
      success: true,
      advancedProfile: {}
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyUserRequest(request, 'personalization-profile');
    if (!auth.ok) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const userId = resolveOwnedUserId(body?.userId, auth.uid);
    const advancedProfile = body?.advancedProfile;

    if (!userId || !advancedProfile) {
      return NextResponse.json(
        { error: 'User ID and advanced profile data are required' },
        { status: 400 }
      );
    }

    await userRootDocUpdate(userId, {
      advancedProfile,
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: 'Advanced profile updated successfully'
    });

  } catch (error) {
    devLog.error('Error updating advanced profile:', error, 'route');
    return NextResponse.json(
      { error: 'Failed to update advanced profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await verifyUserRequest(request, 'personalization-profile');
    if (!auth.ok) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const userId = resolveOwnedUserId(body?.userId, auth.uid);
    const advancedProfile = body?.advancedProfile;

    if (!userId || !advancedProfile) {
      return NextResponse.json(
        { error: 'User ID and advanced profile data are required' },
        { status: 400 }
      );
    }

    await userRootDocUpdate(userId, {
      advancedProfile: {
        ...advancedProfile,
        updatedAt: new Date().toISOString()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Advanced profile merged successfully'
    });

  } catch (error) {
    devLog.error('Error merging advanced profile:', error, 'route');
    return NextResponse.json(
      { error: 'Failed to merge advanced profile' },
      { status: 500 }
    );
  }
}
