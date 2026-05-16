import { NextRequest, NextResponse } from 'next/server';
import { devLog } from '@/lib/devLogger';
import { cancelSubscription } from '@/lib/razorpay';
import { getAuth, adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { isNoChargeSubscriptionEmail } from '@/lib/subscriptionConfig';
import { logApiPain } from '@/lib/painLogging';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const idToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!idToken) {
      return NextResponse.json({ error: 'Missing Authorization Bearer token' }, { status: 401 });
    }

    let uid: string;
    try {
      const decoded = await getAuth().verifyIdToken(idToken);
      uid = decoded.uid;
    } catch {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const body = await request.json();
    const { subscriptionId, userId } = body as { subscriptionId?: string; userId?: string };

    if (!subscriptionId || !userId) {
      return NextResponse.json(
        { error: 'Missing subscription ID or user ID' },
        { status: 400 }
      );
    }

    if (userId !== uid) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!adminDb) {
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    const userSnap = await adminDb.collection('users').doc(uid).get();
    const userData = userSnap.data();
    const storedSubId = typeof userData?.subscriptionId === 'string' ? userData.subscriptionId : undefined;

    if (!storedSubId) {
      return NextResponse.json({ error: 'No subscription on file' }, { status: 400 });
    }
    if (storedSubId !== subscriptionId) {
      return NextResponse.json({ error: 'Subscription does not match your account' }, { status: 403 });
    }

    await cancelSubscription(subscriptionId, false);

    let targetEmail: string | null = null;
    try {
      const u = await getAuth().getUser(uid);
      targetEmail = u.email ?? null;
    } catch {
      targetEmail = (userData?.email as string) ?? null;
    }
    const isNoCharge = targetEmail ? isNoChargeSubscriptionEmail(targetEmail) : false;
    const userRef = adminDb.collection('users').doc(uid);
    if (isNoCharge) {
      await userRef.update({
        subscriptionStatus: 'active',
        subscriptionId: FieldValue.delete(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    } else {
      await userRef.update({
        subscriptionStatus: 'cancelled',
        subscriptionCancelledAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription cancelled successfully',
    });
  } catch (error: unknown) {
    devLog.error('Error cancelling subscription:', error, 'route');
    await logApiPain(request, error, {
      area: 'payments',
      action: 'cancel_subscription_failed',
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}
