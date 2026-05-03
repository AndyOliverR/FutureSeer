import { NextRequest, NextResponse } from 'next/server';
import type { Query, QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { devLog } from '@/lib/devLogger';
import { adminDb } from '@/lib/firebase-admin';

// Must be dynamic: GET uses searchParams + Firestore; force-static breaks per-request handling.
export const dynamic = 'force-dynamic';

interface ConnectionRequestData {
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  topic: string;
  message: string;
}

function isFirestoreIndexUnavailableError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const e = error as { code?: number | string; message?: string; details?: string };
  const text = `${e.message ?? ''} ${String(e.details ?? '')}`;
  if (e.code === 9 || e.code === '9' || e.code === 'failed-precondition') return true;
  return /FAILED_PRECONDITION|failed-precondition|requires an index|index is currently building/i.test(text);
}

function createdAtMillis(data: Record<string, unknown>): number {
  const v = data.createdAt;
  if (v && typeof v === 'object' && v !== null && 'toMillis' in v && typeof (v as { toMillis: () => number }).toMillis === 'function') {
    return (v as { toMillis: () => number }).toMillis();
  }
  if (v && typeof v === 'object' && v !== null && 'seconds' in v && typeof (v as { seconds: number }).seconds === 'number') {
    return (v as { seconds: number }).seconds * 1000;
  }
  if (typeof v === 'string' || typeof v === 'number') {
    const t = new Date(v).getTime();
    return Number.isFinite(t) ? t : 0;
  }
  return 0;
}

/**
 * Prefer composite index + orderBy. If the index is missing or still building, query without orderBy and sort in memory.
 */
async function getConnectionDocsOrdered(baseQuery: Query): Promise<QueryDocumentSnapshot[]> {
  try {
    const snap = await baseQuery.orderBy('createdAt', 'desc').get();
    return snap.docs;
  } catch (error) {
    if (!isFirestoreIndexUnavailableError(error)) {
      throw error;
    }
    devLog.warn(
      '[community/connections] Composite index unavailable or building; using in-memory sort fallback.',
      undefined,
      'route',
    );
    const snap = await baseQuery.get();
    return [...snap.docs].sort(
      (a, b) =>
        createdAtMillis(b.data() as Record<string, unknown>) -
        createdAtMillis(a.data() as Record<string, unknown>),
    );
  }
}

function pushRequestFromDoc(
  requests: unknown[],
  doc: QueryDocumentSnapshot,
  requestType: 'incoming' | 'outgoing',
): void {
  const data = doc.data();
  requests.push({
    id: doc.id,
    ...data,
    type: requestType,
    createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
    respondedAt: data.respondedAt?.toDate?.()?.toISOString() || data.respondedAt,
  });
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

    const requests: unknown[] = [];

    if (type === 'incoming' || type === 'all') {
      const incomingDocs = await getConnectionDocsOrdered(
        db.collection('communityConnections').where('toUserId', '==', userId),
      );
      incomingDocs.forEach((doc) => pushRequestFromDoc(requests, doc, 'incoming'));
    }

    if (type === 'outgoing' || type === 'all') {
      const outgoingDocs = await getConnectionDocsOrdered(
        db.collection('communityConnections').where('fromUserId', '==', userId),
      );
      outgoingDocs.forEach((doc) => pushRequestFromDoc(requests, doc, 'outgoing'));
    }

    requests.sort(
      (a, b) =>
        new Date(String((b as { createdAt?: string }).createdAt ?? 0)).getTime() -
        new Date(String((a as { createdAt?: string }).createdAt ?? 0)).getTime()
    );

    return NextResponse.json({
      success: true,
      requests,
    });
  } catch (error: any) {
    devLog.error('Error fetching connection requests:', error, 'route');
    return NextResponse.json({ error: error.message || 'Failed to fetch connection requests' }, { status: 500 });
  }
}

