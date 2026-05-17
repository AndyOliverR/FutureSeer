import { NextRequest, NextResponse } from 'next/server';
import { devLog } from '@/lib/devLogger';
import { getAuth, adminDb } from '@/lib/firebase-admin';
import { isAdminDecoded } from '@/lib/adminConfig';
import { mergeFirestoreFunnelIntoAdminUsers, type AdminListUserRecord } from '@/lib/adminUserListMerge';

async function verifyAdmin(request: NextRequest): Promise<{ uid: string; email?: string } | null> {
  const authHeader = request.headers.get('Authorization');
  const idToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!idToken) {
    devLog.warn('[admin/list-users] No Bearer token', 'route');
    return null;
  }
  try {
    const decoded = await getAuth().verifyIdToken(idToken);
    if (!isAdminDecoded(decoded)) {
      devLog.warn('[admin/list-users] Token valid but not admin', { email: decoded.email ?? '(no email)' }, 'route');
      return null;
    }
    return { uid: decoded.uid, email: decoded.email as string | undefined };
  } catch (err) {
    devLog.warn('[admin/list-users] verifyIdToken failed', err, 'route');
    return null;
  }
}

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD === '1') {
    return NextResponse.json({ error: 'Not available in static export' }, { status: 404 });
  }
  try {
    const auth = await verifyAdmin(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const pageToken = searchParams.get('pageToken') || undefined;
    const email = searchParams.get('email')?.trim() || undefined;
    const maxResults = Math.min(parseInt(searchParams.get('maxResults') || '100', 10), 1000);

    const authInstance = getAuth();
    let result: { users: import('firebase-admin/auth').UserRecord[]; pageToken?: string };

    if (email) {
      const user = await authInstance.getUserByEmail(email);
      result = { users: user ? [user] : [] };
    } else {
      result = await authInstance.listUsers(maxResults, pageToken);
    }

    const users: AdminListUserRecord[] = result.users.map((u) => ({
      uid: u.uid,
      email: u.email,
      displayName: u.displayName ?? null,
      disabled: u.disabled,
      claims: u.customClaims || {},
    }));

    const merged =
      adminDb && users.length > 0
        ? await mergeFirestoreFunnelIntoAdminUsers(adminDb, users)
        : users;

    return NextResponse.json({
      users: merged,
      nextPageToken: result.pageToken || undefined,
    });
  } catch (err) {
    devLog.error('Admin list-users error:', err, 'route');
    return NextResponse.json({ error: 'Failed to list users' }, { status: 500 });
  }
}
