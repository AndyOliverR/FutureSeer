import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/firebase-admin';
import { writeAuditLog } from '@/lib/adminAudit';

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
    const { uid, claims } = body;
    if (!uid || typeof claims !== 'object') {
      return NextResponse.json({ error: 'uid and claims required' }, { status: 400 });
    }

    await getAuth().setCustomUserClaims(uid, claims);
    await writeAuditLog({
      actorUid: auth.uid,
      actorEmail: auth.email,
      action: 'set_claims',
      targetUid: uid,
      details: { claims },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Admin set-claims error:', err);
    return NextResponse.json({ error: 'Failed to set claims' }, { status: 500 });
  }
}
