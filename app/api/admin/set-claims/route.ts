import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { devLog } from '@/lib/devLogger';
import { getAuth, setDocument, isAdminAvailable, adminDb, getDocument } from '@/lib/firebase-admin';
import { cancelSubscription } from '@/lib/razorpay';
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
    const { uid, claims } = body;
    if (!uid || typeof claims !== 'object') {
      return NextResponse.json({ error: 'uid and claims required' }, { status: 400 });
    }

    await getAuth().setCustomUserClaims(uid, claims);
    // Keep Firestore in sync for features that use DB fields (e.g. quota bypass).
    // Best-effort: do not fail the request if Firestore is unavailable.
    try {
      if (isAdminAvailable() && Object.prototype.hasOwnProperty.call(claims, 'specialUser')) {
        const raw = (claims as Record<string, unknown>).specialUser;
        const specialUser = Boolean(raw);
        await setDocument('users', uid, {
          specialUser,
          specialUserUpdatedAt: Date.now(),
        });
      }
    } catch (e) {
      devLog.warn('Failed to persist specialUser to Firestore', e, 'set-claims');
    }
    // Stop recurring Razorpay charges when special user is enabled and a subscription exists
    try {
      const claimsSpecial = Boolean((claims as Record<string, unknown>).specialUser);
      if (claimsSpecial && isAdminAvailable() && adminDb) {
        const data = await getDocument('users', uid);
        const subId = data && typeof data === 'object' ? (data as Record<string, unknown>).subscriptionId : undefined;
        if (typeof subId === 'string' && subId.trim()) {
          await cancelSubscription(subId.trim(), false);
          await adminDb.collection('users').doc(uid).update({
            subscriptionStatus: 'active',
            subscriptionId: FieldValue.delete(),
            noChargeAccount: true,
            updatedAt: Date.now(),
          });
          devLog.info(`[set-claims] Cancelled Razorpay subscription for special user uid=${uid}`, 'route');
        }
      }
    } catch (e) {
      devLog.warn('Failed to cancel Razorpay subscription when enabling specialUser', e, 'set-claims');
    }
    await writeAuditLog({
      actorUid: auth.uid,
      actorEmail: auth.email,
      action: 'set_claims',
      targetUid: uid,
      details: { claims },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    devLog.error('Admin set-claims error:', err, 'route');
    return NextResponse.json({ error: 'Failed to set claims' }, { status: 500 });
  }
}
