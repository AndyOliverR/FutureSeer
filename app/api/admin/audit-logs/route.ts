import { NextRequest, NextResponse } from 'next/server';
import { devLog } from '@/lib/devLogger';
import { adminDb } from '@/lib/firebase-admin';
import { getAuth } from '@/lib/firebase-admin';
import { isAdminDecoded } from '@/lib/adminConfig';

async function verifyAdmin(request: NextRequest): Promise<boolean> {
  const authHeader = request.headers.get('Authorization');
  const idToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!idToken) {
    devLog.warn('[admin/audit-logs] No Bearer token', 'route');
    return false;
  }
  try {
    const decoded = await getAuth().verifyIdToken(idToken);
    if (!isAdminDecoded(decoded)) {
      devLog.warn('[admin/audit-logs] Token valid but not admin', { email: decoded.email ?? '(no email)' }, 'route');
      return false;
    }
    return true;
  } catch (err) {
    devLog.warn('[admin/audit-logs] verifyIdToken failed', err, 'route');
    return false;
  }
}

const COLLECTION = 'auditLogs';

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD === '1') {
    return NextResponse.json({ error: 'Not available in static export' }, { status: 404 })
  }
  try {
    if (!(await verifyAdmin(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!adminDb) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const action = searchParams.get('action');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 200);
    const pageToken = searchParams.get('pageToken') || undefined;

    const snapshot = await adminDb
      .collection(COLLECTION)
      .orderBy('timestamp', 'desc')
      .limit(500)
      .get();

    let list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Array<Record<string, unknown> & { timestamp?: number }>;

    if (userId) list = list.filter((x) => x.actorUid === userId);
    if (action) list = list.filter((x) => x.action === action);
    if (startDate) {
      const t = parseInt(startDate, 10);
      if (!Number.isNaN(t)) list = list.filter((x) => (x.timestamp ?? 0) >= t);
    }
    if (endDate) {
      const t = parseInt(endDate, 10);
      if (!Number.isNaN(t)) list = list.filter((x) => (x.timestamp ?? 0) <= t);
    }

    const total = list.length;
    const start = pageToken ? Math.max(0, list.findIndex((x) => x.id === pageToken) + 1) : 0;
    const sliceList = list.slice(start, start + limit);
    const nextPageToken = list[start + limit] ? (list[start + limit] as { id: string }).id : undefined;

    const logs = sliceList.map((x) => ({
      id: x.id,
      timestamp: typeof x.timestamp === 'number' ? x.timestamp : Date.now(),
      action: x.action ?? '—',
      performedBy: (x.actorEmail as string) || (x.actorUid as string) || '—',
      targetUser: (x.targetUid as string) || '—',
      details: x.details ?? {},
      ipAddress: (x.ipAddress as string) ?? '',
    }));

    return NextResponse.json({ logs, nextPageToken });
  } catch (err) {
    devLog.error('Admin audit-logs error:', err, 'route');
    return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 });
  }
}
