import { NextRequest, NextResponse } from 'next/server';
import { devLog } from '@/lib/devLogger';
import { adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-static'

interface ConnectionRequestData {
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  topic: string;
  message: string;
}

// POST - Send connection request
export async function POST(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD === '1') {
    return NextResponse.json({ error: 'Not available in static export' }, { status: 404 })
  }
  try {
    const body: ConnectionRequestData = await request.json();
    const { fromUserId, fromUserName, toUserId, toUserName, topic, message } = body;

    if (!fromUserId || !fromUserName || !toUserId || !toUserName || !topic || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: fromUserId, fromUserName, toUserId, toUserName, topic, message' },
        { status: 400 }
      );
    }

    if (fromUserId === toUserId) {
      return NextResponse.json(
        { error: 'Cannot send connection request to yourself' },
        { status: 400 }
      );
    }

    const db = adminDb;
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    if (typeof window === 'undefined') {
      // Server-side: Use Admin SDK
      // Check if request already exists
      const existingRequest = await db.collection('communityConnections')
        .where('fromUserId', '==', fromUserId)
        .where('toUserId', '==', toUserId)
        .where('status', '==', 'pending')
        .get();

      if (!existingRequest.empty) {
        return NextResponse.json(
          { error: 'Connection request already sent' },
          { status: 400 }
        );
      }

      // Check if reverse request exists (mutual connection)
      const reverseRequest = await db.collection('communityConnections')
        .where('fromUserId', '==', toUserId)
        .where('toUserId', '==', fromUserId)
        .where('status', '==', 'accepted')
        .get();

      if (!reverseRequest.empty) {
        return NextResponse.json(
          { error: 'Users are already connected' },
          { status: 400 }
        );
      }

      const now = new Date();

      // Create connection request
      const connectionRef = db.collection('communityConnections').doc();
      const connectionData = {
        fromUserId,
        fromUserName,
        toUserId,
        toUserName,
        topic,
        message,
        status: 'pending',
        createdAt: now,
        respondedAt: null,
      };

      await connectionRef.set(connectionData);

      return NextResponse.json({
        success: true,
        connection: {
          id: connectionRef.id,
          ...connectionData,
          createdAt: connectionData.createdAt.toISOString(),
        },
      });
    } else {
      return NextResponse.json({ error: 'Client-side not supported for this endpoint' }, { status: 400 });
    }
  } catch (error: any) {
    devLog.error('Error creating connection request:', error, 'route');
    return NextResponse.json({ error: error.message || 'Failed to create connection request' }, { status: 500 });
  }
}

// GET - Fetch user's connection requests
export async function GET(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD === '1') {
    return NextResponse.json({ error: 'Not available in static export' }, { status: 404 })
  }
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type') || 'all'; // all, incoming, outgoing

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const db = adminDb;
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    if (typeof window === 'undefined') {
      // Server-side: Use Admin SDK
      const requests: any[] = [];

      if (type === 'incoming' || type === 'all') {
        const incomingSnapshot = await db.collection('communityConnections')
          .where('toUserId', '==', userId)
          .orderBy('createdAt', 'desc')
          .get();

        incomingSnapshot.docs.forEach((doc: any) => {
          requests.push({
            id: doc.id,
            ...doc.data(),
            type: 'incoming',
            createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
            respondedAt: doc.data().respondedAt?.toDate?.()?.toISOString() || doc.data().respondedAt,
          });
        });
      }

      if (type === 'outgoing' || type === 'all') {
        const outgoingSnapshot = await db.collection('communityConnections')
          .where('fromUserId', '==', userId)
          .orderBy('createdAt', 'desc')
          .get();

        outgoingSnapshot.docs.forEach((doc: any) => {
          requests.push({
            id: doc.id,
            ...doc.data(),
            type: 'outgoing',
            createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
            respondedAt: doc.data().respondedAt?.toDate?.()?.toISOString() || doc.data().respondedAt,
          });
        });
      }

      // Sort by date
      requests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      return NextResponse.json({
        success: true,
        requests,
      });
    } else {
      return NextResponse.json({ error: 'Client-side not supported for this endpoint' }, { status: 400 });
    }
  } catch (error: any) {
    devLog.error('Error fetching connection requests:', error, 'route');
    return NextResponse.json({ error: error.message || 'Failed to fetch connection requests' }, { status: 500 });
  }
}

