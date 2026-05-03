import { NextRequest, NextResponse } from 'next/server';
import { devLog } from '@/lib/devLogger';
import { adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  return [{ id: '_' }]
}

// PATCH - Accept/decline connection request
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (process.env.CAPACITOR_BUILD === '1') {
    return NextResponse.json({ error: 'Not available in static export' }, { status: 404 })
  }
  try {
    const { id: connectionId } = await params;
    const body = await request.json();
    const { action, userId } = body; // action: 'accept' | 'decline'

    if (!action || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: action, userId' },
        { status: 400 }
      );
    }

    if (action !== 'accept' && action !== 'decline') {
      return NextResponse.json(
        { error: 'Invalid action. Must be "accept" or "decline"' },
        { status: 400 }
      );
    }

    const db = adminDb;
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    const connectionRef = db.collection('communityConnections').doc(connectionId);
    const connectionDoc = await connectionRef.get();

    if (!connectionDoc.exists) {
      return NextResponse.json({ error: 'Connection request not found' }, { status: 404 });
    }

    const connectionData = connectionDoc.data();

    // Check if user is the recipient
    if (connectionData?.toUserId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized: Only recipient can respond to connection request' },
        { status: 403 }
      );
    }

    // Check if already responded
    if (connectionData?.status !== 'pending') {
      return NextResponse.json(
        { error: 'Connection request has already been responded to' },
        { status: 400 }
      );
    }

    const now = new Date();

    await connectionRef.update({
      status: action === 'accept' ? 'accepted' : 'declined',
      respondedAt: now,
    });

    return NextResponse.json({
      success: true,
      connection: {
        id: connectionDoc.id,
        ...connectionData,
        status: action === 'accept' ? 'accepted' : 'declined',
        respondedAt: now.toISOString(),
      },
    });
  } catch (error: any) {
    devLog.error('Error updating connection request:', error, 'route');
    return NextResponse.json({ error: error.message || 'Failed to update connection request' }, { status: 500 });
  }
}

