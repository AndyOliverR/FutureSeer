import { NextRequest, NextResponse } from 'next/server';
import { devLog } from '@/lib/devLogger';
import { verifyWebhookSignature } from '@/lib/razorpay';
import { getFirebaseDB } from '@/lib/firebase';
import { userRootDocUpdate } from '@/lib/userSubcollectionFirestore';

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

    const isValid = verifyWebhookSignature(bodyString, signature, webhookSecret);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 400 }
      );
    }

    const event = body.event;
    const payload = body.payload;

    if (!getFirebaseDB()) {
      throw new Error('Firestore not initialized');
    }

    const getUserIdFromSubscription = (sub: { notes?: Record<string, string>; customer_id?: string }) =>
      sub.notes?.user_id || sub.notes?.customer_id || sub.customer_id;

    const now = Date.now();

    switch (event) {
      case 'subscription.activated':
        if (payload.subscription?.entity) {
          const subscription = payload.subscription.entity;
          const userId = getUserIdFromSubscription(subscription);

          if (userId) {
            await userRootDocUpdate(userId, {
              subscriptionStatus: 'active',
              subscriptionId: subscription.id,
              subscriptionActivatedAt: now,
              nextBillingDate: subscription.current_end,
              updatedAt: now,
            });
          }
        }
        break;

      case 'subscription.charged':
        if (payload.subscription?.entity) {
          const subscription = payload.subscription.entity;
          const userId = getUserIdFromSubscription(subscription);
          const paymentId = payload.payment?.entity?.id;

          if (userId) {
            const updates: Record<string, unknown> = {
              subscriptionStatus: 'active',
              subscriptionId: subscription.id,
              lastBillingDate: now,
              nextBillingDate: subscription.current_end,
              updatedAt: now,
            };
            if (paymentId) updates.lastPaymentId = paymentId;
            await userRootDocUpdate(userId, updates);
          }
        }
        break;

      case 'subscription.cancelled':
        if (payload.subscription?.entity) {
          const subscription = payload.subscription.entity;
          const userId = getUserIdFromSubscription(subscription);

          if (userId) {
            await userRootDocUpdate(userId, {
              subscriptionStatus: 'cancelled',
              subscriptionCancelledAt: now,
              updatedAt: now,
            });
          }
        }
        break;

      case 'payment.failed':
        if (payload.payment?.entity) {
          const payment = payload.payment.entity;
          const userId = payment.notes?.user_id || payment.notes?.customer_id;

          if (userId) {
            await userRootDocUpdate(userId, {
              paymentFailed: true,
              paymentFailedAt: now,
              lastPaymentError: payment.error_description || 'Payment failed',
              updatedAt: now,
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
