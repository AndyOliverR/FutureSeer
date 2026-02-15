import { NextRequest, NextResponse } from 'next/server';
import { devLog } from '@/lib/devLogger';
import { getAuth, adminDb } from '@/lib/firebase-admin';

async function verifyAdmin(request: NextRequest): Promise<{ uid: string; email?: string } | null> {
  const authHeader = request.headers.get('Authorization');
  const idToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!idToken) return null;
  try {
    const decoded = await getAuth().verifyIdToken(idToken);
    const isAdmin = decoded.admin === true || decoded.superadmin === true;
    if (!isAdmin) return null;
    return { uid: decoded.uid, email: decoded.email as string | undefined };
  } catch {
    return null;
  }
}

export const dynamic = 'force-static'

export async function GET(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD === '1') {
    return NextResponse.json({ error: 'Not available in static export' }, { status: 404 })
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

    const users = result.users.map((u) => {
      const record: Record<string, unknown> = {
        uid: u.uid,
        email: u.email,
        displayName: u.displayName ?? null,
        disabled: u.disabled,
        claims: u.customClaims || {},
      };
      return record;
    });

    if (adminDb && users.length > 0) {
      const uids = users.map((u) => u.uid as string);
      const snap = await adminDb.collection('users').get();
      const userDataByUid: Record<string, Record<string, unknown>> = {};
      snap.docs.forEach((d) => {
        if (uids.includes(d.id)) userDataByUid[d.id] = d.data();
      });
      users.forEach((u) => {
        const data = userDataByUid[u.uid as string];
        if (data) {
          u.subscriptionStatus = data.subscriptionStatus;
          u.nextBillingDate = data.nextBillingDate;
          u.subscriptionId = data.subscriptionId;
        }
      });
    }

    return NextResponse.json({
      users,
      nextPageToken: result.pageToken || undefined,
    });
  } catch (err) {
    devLog.error('Admin list-users error:', err, 'route');
    return NextResponse.json({ error: 'Failed to list users' }, { status: 500 });
  }
}
