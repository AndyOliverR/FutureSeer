import { NextRequest, NextResponse } from 'next/server';
import { devLog } from '@/lib/devLogger';
import { getAuth, adminDb } from '@/lib/firebase-admin';
import { isAdminDecoded } from '@/lib/adminConfig';
import {
  ADMIN_USER_FUNNEL_CSV_HEADERS,
  adminUserToCsvRow,
  mergeFirestoreFunnelIntoAdminUsers,
  type AdminListUserRecord,
} from '@/lib/adminUserListMerge';

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

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD === '1') {
    return NextResponse.json({ error: 'Not available in static export' }, { status: 404 });
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
    const users: AdminListUserRecord[] = result.users.map((u) => ({
      uid: u.uid,
      email: u.email,
      displayName: u.displayName,
      disabled: u.disabled,
      claims: u.customClaims || {},
    }));

    const merged =
      adminDb && users.length > 0
        ? await mergeFirestoreFunnelIntoAdminUsers(adminDb, users)
        : users;

    if (format === 'csv') {
      const rows = merged.map((u) => adminUserToCsvRow(u));
      const csv = [ADMIN_USER_FUNNEL_CSV_HEADERS.join(','), ...rows].join('\r\n');
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="users-export-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    return NextResponse.json(merged);
  } catch (err) {
    devLog.error('Admin export-users error:', err, 'route');
    return NextResponse.json({ error: 'Failed to export users' }, { status: 500 });
  }
}
