import { NextRequest, NextResponse } from 'next/server';
import { devLog } from '@/lib/devLogger';
import { getAuth, adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { cancelSubscription } from '@/lib/razorpay';
import { writeAuditLog } from '@/lib/adminAudit';
import { isNoChargeSubscriptionEmail } from '@/lib/subscriptionConfig';
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
    let { subscriptionId, userId } = body;
    if (!subscriptionId && userId) {
      if (!adminDb) {
        return NextResponse.json({ error: 'Database not available' }, { status: 500 });
      }
      const userDoc = await adminDb.collection('users').doc(userId).get();
      const data = userDoc.data();
      subscriptionId = data?.subscriptionId;
    }
    if (!subscriptionId) {
      return NextResponse.json({ error: 'subscriptionId or userId with stored subscriptionId required' }, { status: 400 });
    }

    await cancelSubscription(subscriptionId, false);
    if (userId && adminDb) {
      let targetEmail: string | null = null;
      try {
        const targetUser = await getAuth().getUser(userId);
        targetEmail = targetUser.email ?? null;
      } catch {
        const userDoc = await adminDb.collection('users').doc(userId).get();
        targetEmail = (userDoc.data()?.email as string) ?? null;
      }
      const isNoCharge = targetEmail ? isNoChargeSubscriptionEmail(targetEmail) : false;
      const userRef = adminDb.collection('users').doc(userId);
      if (isNoCharge) {
        await userRef.update({
          subscriptionStatus: 'active',
          subscriptionId: FieldValue.delete(),
          updatedAt: FieldValue.serverTimestamp(),
        });
        devLog.info(`[cancel-user-subscription] No-charge user ${targetEmail}: set status active after Razorpay cancel`, 'route');
      } else {
        await userRef.update({
          subscriptionStatus: 'cancelled',
          subscriptionCancelledAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
    }
    await writeAuditLog({
      actorUid: auth.uid,
      actorEmail: auth.email,
      action: 'cancel_user_subscription',
      targetUid: userId,
      details: { subscriptionId },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    devLog.error('Admin cancel-user-subscription error:', err, 'route');
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}
