import { NextRequest, NextResponse } from 'next/server';
import { devLog } from '@/lib/devLogger';
import { verifyWebhookSignature } from '@/lib/razorpay';
import { getFirebaseDB } from '@/lib/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
    const bodyString = JSON.stringify(body);

    // Verify webhook signature
    const isValid = verifyWebhookSignature(bodyString, signature, webhookSecret);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 400 }
      );
    }

    const event = body.event;
    const payload = body.payload;

    const db = getFirebaseDB();
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    // Prefer user_id (Firebase uid) from notes so recurring updates target users/{uid}; fallback to customer_id for older subscriptions
    const getUserIdFromSubscription = (sub: { notes?: Record<string, string>; customer_id?: string }) =>
      sub.notes?.user_id || sub.notes?.customer_id || sub.customer_id;

    // Handle different webhook events
    switch (event) {
      case 'subscription.activated':
        // Subscription activated (trial ended, first charge successful)
        if (payload.subscription?.entity) {
          const subscription = payload.subscription.entity;
          const userId = getUserIdFromSubscription(subscription);

          if (userId) {
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, {
              subscriptionStatus: 'active',
              subscriptionId: subscription.id,
              subscriptionActivatedAt: serverTimestamp(),
              nextBillingDate: subscription.current_end,
              updatedAt: serverTimestamp(),
            });
          }
        }
        break;

      case 'subscription.charged':
        // Subscription charged (recurring payment successful)
        if (payload.subscription?.entity) {
          const subscription = payload.subscription.entity;
          const userId = getUserIdFromSubscription(subscription);
          const paymentId = payload.payment?.entity?.id;

          if (userId) {
            const userRef = doc(db, 'users', userId);
            const updates: Record<string, unknown> = {
              subscriptionStatus: 'active',
              subscriptionId: subscription.id,
              lastBillingDate: serverTimestamp(),
              nextBillingDate: subscription.current_end,
              updatedAt: serverTimestamp(),
            };
            if (paymentId) updates.lastPaymentId = paymentId;
            await updateDoc(userRef, updates);
          }
        }
        break;

      case 'subscription.cancelled':
        // Subscription cancelled
        if (payload.subscription?.entity) {
          const subscription = payload.subscription.entity;
          const userId = getUserIdFromSubscription(subscription);

          if (userId) {
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, {
              subscriptionStatus: 'cancelled',
              subscriptionCancelledAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          }
        }
        break;

      case 'payment.failed':
        // Payment failed
        if (payload.payment?.entity) {
          const payment = payload.payment.entity;
          const userId = payment.notes?.user_id || payment.notes?.customer_id;

          if (userId) {
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, {
              paymentFailed: true,
              paymentFailedAt: serverTimestamp(),
              lastPaymentError: payment.error_description || 'Payment failed',
              updatedAt: serverTimestamp(),
            });
          }
        }
        break;

      default:
        devLog.debug('Unhandled webhook event:', event);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    devLog.error('Error processing webhook:', error, 'route');
    return NextResponse.json(
      { error: error.message || 'Failed to process webhook' },
      { status: 500 }
    );
  }
}
