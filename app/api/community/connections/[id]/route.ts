import { NextRequest, NextResponse } from 'next/server';
import { devLog } from '@/lib/devLogger';
import { getFirebaseDB } from '@/lib/firebase';

export const dynamic = 'force-static'

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

    const db = getFirebaseDB();
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    if (typeof window === 'undefined') {
      // Server-side: Use Admin SDK
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
    } else {
      return NextResponse.json({ error: 'Client-side not supported for this endpoint' }, { status: 400 });
    }
  } catch (error: any) {
    devLog.error('Error updating connection request:', error, 'route');
    return NextResponse.json({ error: error.message || 'Failed to update connection request' }, { status: 500 });
  }
}

