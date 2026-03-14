import { NextRequest, NextResponse } from 'next/server';
import { devLog } from '@/lib/devLogger';
import { getAuth, adminDb } from '@/lib/firebase-admin';
import { isAdminDecoded } from '@/lib/adminConfig';

async function verifyAdmin(request: NextRequest): Promise<boolean> {
  const authHeader = request.headers.get('Authorization');
  const idToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!idToken) {
    devLog.warn('[admin/error-events] No Bearer token', 'route');
    return false;
  }
  try {
    const decoded = await getAuth().verifyIdToken(idToken);
    if (!isAdminDecoded(decoded)) {
      devLog.warn('[admin/error-events] Token valid but not admin', { email: decoded.email ?? '(no email)' }, 'route');
      return false;
    }
    return true;
  } catch (err) {
    devLog.warn('[admin/error-events] verifyIdToken failed', err, 'route');
    return false;
  }
}

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD === '1') {
    return NextResponse.json({ error: 'Not available in static export' }, { status: 404 });
  }
  try {
    if (!(await verifyAdmin(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!adminDb) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    const snapshot = await adminDb
      .collection('errorEvents')
      .orderBy('timestamp', 'desc')
      .limit(200)
      .get();

    const events = snapshot.docs.map((doc) => {
      const data = doc.data();
      const ts = data.timestamp;
      const timestamp =
        typeof ts === 'string'
          ? ts
          : ts?.toDate?.()
            ? (ts as { toDate: () => Date }).toDate().toISOString()
            : ts != null
              ? new Date(ts as number).toISOString()
              : '';
      return {
        id: doc.id,
        timestamp,
        environment: data.environment || 'unknown',
        severity: data.severity || 'error',
        source: data.source || 'client',
        area: data.area || 'unknown',
        action: data.action || '',
        message: data.message || '',
        userId: data.userId ?? null,
        route: data.route,
        browser: data.browser,
        meta: data.meta,
      };
    });

    return NextResponse.json({ success: true, events });
  } catch (err) {
    devLog.error('Admin error-events GET error:', err, 'route');
    return NextResponse.json({ error: 'Failed to fetch error events' }, { status: 500 });
  }
}
