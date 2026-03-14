import { NextRequest, NextResponse } from 'next/server';
import { devLog } from '@/lib/devLogger';
import { getAuth } from '@/lib/firebase-admin';
import { writeAuditLog } from '@/lib/adminAudit';
import { isAdminDecoded } from '@/lib/adminConfig';

async function verifyAdmin(request: NextRequest): Promise<{ uid: string; email?: string } | null> {
  const authHeader = request.headers.get('Authorization');
  const idToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!idToken) return null;
  try {
    const decoded = await getAuth().verifyIdToken(idToken);
    if (!isAdminDecoded(decoded)) return null;
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
    const { action, userIds, claims, reason } = body;
    if (!action || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ error: 'action and userIds (array) required' }, { status: 400 });
    }

    const authInstance = getAuth();

    if (action === 'updateClaims') {
      if (!claims || typeof claims !== 'object') {
        return NextResponse.json({ error: 'claims required for updateClaims' }, { status: 400 });
      }
      for (const uid of userIds) {
        const user = await authInstance.getUser(uid);
        const existing = (user.customClaims || {}) as Record<string, unknown>;
        await authInstance.setCustomUserClaims(uid, { ...existing, ...claims });
        await writeAuditLog({
          actorUid: auth.uid,
          actorEmail: auth.email,
          action: 'bulk_update_claims',
          targetUid: uid,
          details: { claims, reason },
        });
      }
    } else if (action === 'disableUsers') {
      for (const uid of userIds) {
        await authInstance.updateUser(uid, { disabled: true });
        await writeAuditLog({
          actorUid: auth.uid,
          actorEmail: auth.email,
          action: 'disable_user',
          targetUid: uid,
          details: { reason },
        });
      }
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    devLog.error('Admin bulk-actions error:', err, 'route');
    return NextResponse.json({ error: 'Failed to perform bulk action' }, { status: 500 });
  }
}
