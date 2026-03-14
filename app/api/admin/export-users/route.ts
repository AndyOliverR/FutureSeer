import { NextRequest, NextResponse } from 'next/server';
import { devLog } from '@/lib/devLogger';
import { getAuth, adminDb } from '@/lib/firebase-admin';
import { isAdminDecoded } from '@/lib/adminConfig';

async function verifyAdmin(request: NextRequest): Promise<boolean> {
  const authHeader = request.headers.get('Authorization');
  const idToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!idToken) return false;
  try {
    const decoded = await getAuth().verifyIdToken(idToken);
    return isAdminDecoded(decoded);
  } catch {
    return false;
  }
}

export const dynamic = 'force-static'

export async function GET(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD === '1') {
    return NextResponse.json({ error: 'Not available in static export' }, { status: 404 })
  }
  try {
    if (!(await verifyAdmin(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const format = (searchParams.get('format') || 'json') as 'json' | 'csv';
    const pageToken = searchParams.get('pageToken') || undefined;
    const maxResults = Math.min(parseInt(searchParams.get('maxResults') || '500', 10), 1000);

    const result = await getAuth().listUsers(maxResults, pageToken);
    const users = result.users.map((u) => ({
      uid: u.uid,
      email: u.email,
      displayName: u.displayName,
      disabled: u.disabled,
      claims: u.customClaims || {},
    }));

    if (adminDb && users.length > 0) {
      const snap = await adminDb.collection('users').get();
      const byUid: Record<string, Record<string, unknown>> = {};
      snap.docs.forEach((d) => { byUid[d.id] = d.data(); });
      users.forEach((u: Record<string, unknown>) => {
        const data = byUid[u.uid as string];
        if (data) {
          u.subscriptionStatus = data.subscriptionStatus;
          u.nextBillingDate = data.nextBillingDate;
        }
      });
    }

    if (format === 'csv') {
      const headers = ['uid', 'email', 'displayName', 'disabled', 'subscriptionStatus', 'nextBillingDate'];
      const rows = users.map((u: Record<string, unknown>) =>
        headers.map((h) => {
          const v = u[h];
          if (v === undefined || v === null) return '';
          const s = String(v);
          return s.includes(',') || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
        }).join(',')
      );
      const csv = [headers.join(','), ...rows].join('\r\n');
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="users-export-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    return NextResponse.json(users);
  } catch (err) {
    devLog.error('Admin export-users error:', err, 'route');
    return NextResponse.json({ error: 'Failed to export users' }, { status: 500 });
  }
}
