import { NextRequest, NextResponse } from 'next/server';
import { devLog } from '@/lib/devLogger';
import { getAuth } from '@/lib/firebase-admin';

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

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAdmin(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { targetUid } = body;
    if (!targetUid) {
      return NextResponse.json({ error: 'targetUid required' }, { status: 400 });
    }

    const targetUser = await getAuth().getUser(targetUid);
    const customToken = await getAuth().createCustomToken(targetUid);

    return NextResponse.json({
      customToken,
      targetUser: {
        uid: targetUser.uid,
        email: targetUser.email,
        displayName: targetUser.displayName,
      },
    });
  } catch (err) {
    devLog.error('Admin impersonate error:', err, 'route');
    return NextResponse.json({ error: 'Failed to create impersonation token' }, { status: 500 });
  }
}
