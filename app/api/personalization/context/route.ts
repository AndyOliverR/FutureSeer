import { NextRequest, NextResponse } from 'next/server';
import { devLog } from '@/lib/devLogger';
import { verifyUserRequest, resolveOwnedUserId } from '@/lib/userApiAuth';
import { userRootDocGet, userRootDocUpdate } from '@/lib/userSubcollectionFirestore';

export const dynamic = 'force-static'

export async function POST(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD === '1') return NextResponse.json({ error: 'Not available in static export' }, { status: 404 })
  try {
    const auth = await verifyUserRequest(request, 'personalization-context');
    if (!auth.ok) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const userId = resolveOwnedUserId(body?.userId, auth.uid);
    const context = body?.context;

    if (!userId || !context) {
      return NextResponse.json(
        { error: 'User ID and context data are required' },
        { status: 400 }
      );
    }

    await userRootDocUpdate(userId, {
      currentContext: {
        ...context,
        timestamp: new Date().toISOString()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Context updated successfully'
    });

  } catch (error) {
    devLog.error('Error updating context:', error, 'route');
    return NextResponse.json(
      { error: 'Failed to update context' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyUserRequest(request, 'personalization-context');
    if (!auth.ok) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = resolveOwnedUserId(searchParams.get('userId'), auth.uid);

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const userData = await userRootDocGet(userId);

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const currentContext = userData.currentContext || {};
    const rawHistory = userData.contextHistory;
    const contextHistory = Array.isArray(rawHistory) ? rawHistory : [];

    return NextResponse.json({
      success: true,
      currentContext,
      contextHistory
    });

  } catch (error) {
    devLog.error('Error fetching context:', error, 'route');
    return NextResponse.json(
      { error: 'Failed to fetch context' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await verifyUserRequest(request, 'personalization-context');
    if (!auth.ok) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const userId = resolveOwnedUserId(body?.userId, auth.uid);
    const contextUpdate = body?.contextUpdate;

    if (!userId || !contextUpdate) {
      return NextResponse.json(
        { error: 'User ID and context update are required' },
        { status: 400 }
      );
    }

    const userData = await userRootDocGet(userId);

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const currentContext = userData.currentContext || {};
    const rawHistory = userData.contextHistory;
    const contextHistory = Array.isArray(rawHistory) ? rawHistory : [];

    const updatedContext = {
      ...currentContext,
      ...contextUpdate,
      timestamp: new Date().toISOString()
    };

    const newHistory = [
      updatedContext,
      ...contextHistory.slice(0, 9)
    ];

    await userRootDocUpdate(userId, {
      currentContext: updatedContext,
      contextHistory: newHistory
    });

    return NextResponse.json({
      success: true,
      message: 'Context history updated successfully'
    });

  } catch (error) {
    devLog.error('Error updating context history:', error, 'route');
    return NextResponse.json(
      { error: 'Failed to update context history' },
      { status: 500 }
    );
  }
}
