import { NextRequest, NextResponse } from 'next/server';
import { devLog } from '@/lib/devLogger';
import { adminDb } from '@/lib/firebase-admin';
import { verifyAdminRequest } from '@/lib/adminApiAuth';

export const dynamic = 'force-dynamic';

const TRIAGE_STATUSES = ['open', 'resolved', 'ignored'] as const;

function normalizeTimestamp(ts: unknown): string {
  if (typeof ts === 'string') return ts;
  if (ts && typeof ts === 'object' && 'toDate' in ts && typeof (ts as { toDate: () => Date }).toDate === 'function') {
    return (ts as { toDate: () => Date }).toDate().toISOString();
  }
  if (ts != null && (typeof ts === 'number' || ts instanceof Date)) {
    return new Date(ts as number | Date).toISOString();
  }
  return '';
}

function normalizeIsoField(ts: unknown): string | null {
  if (ts == null) return null;
  const s = normalizeTimestamp(ts);
  return s || null;
}

function normalizeTriageStatus(v: unknown): 'open' | 'resolved' | 'ignored' {
  if (typeof v === 'string' && (TRIAGE_STATUSES as readonly string[]).includes(v)) {
    return v as 'open' | 'resolved' | 'ignored';
  }
  return 'open';
}

function normalizeSeverity(v: unknown): string {
  if (v === 'error' || v === 'warning' || v === 'info') return v;
  return 'error';
}

export async function GET(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD === '1') {
    return NextResponse.json({ error: 'Not available in static export' }, { status: 404 });
  }
  try {
    const auth = await verifyAdminRequest(request, 'admin/error-events');
    if (!auth.ok) {
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
      const timestamp = normalizeTimestamp(data.timestamp);
      const triageUpdatedBy =
        data.triageUpdatedBy &&
        typeof data.triageUpdatedBy === 'object' &&
        data.triageUpdatedBy !== null
          ? {
              uid: typeof (data.triageUpdatedBy as { uid?: unknown }).uid === 'string'
                ? (data.triageUpdatedBy as { uid: string }).uid
                : '',
              email:
                (data.triageUpdatedBy as { email?: unknown }).email === null ||
                typeof (data.triageUpdatedBy as { email?: unknown }).email === 'string'
                  ? ((data.triageUpdatedBy as { email: string | null }).email ?? null)
                  : null,
            }
          : null;

      return {
        id: doc.id,
        timestamp,
        environment: data.environment || 'unknown',
        severity: normalizeSeverity(data.severity),
        source: data.source || 'client',
        area: data.area || 'unknown',
        action: data.action || '',
        message: data.message || '',
        userId: data.userId ?? null,
        route: data.route,
        browser: data.browser,
        meta: data.meta,
        triageStatus: normalizeTriageStatus(data.triageStatus),
        triageNote: typeof data.triageNote === 'string' ? data.triageNote : null,
        triageUpdatedAt: normalizeIsoField(data.triageUpdatedAt),
        triageUpdatedBy,
      };
    });

    return NextResponse.json({ success: true, events });
  } catch (err) {
    devLog.error('Admin error-events GET error:', err, 'route');
    return NextResponse.json({ error: 'Failed to fetch error events' }, { status: 500 });
  }
}
