import { NextRequest, NextResponse } from 'next/server';
import { devLog } from '@/lib/devLogger';
import { verifyWebhookSignature } from '@/lib/razorpay';
import { getFirebaseDB } from '@/lib/firebase';
import { userRootDocUpdate } from '@/lib/userSubcollectionFirestore';
import { paidMembershipPatch } from '@/lib/subscriptionGrant';

type WebhookSubscription = {
  id?: string;
  notes?: Record<string, string>;
  customer_id?: string;
  current_end?: number;
};

async function markSubscriptionActive(
  subscription: WebhookSubscription,
  paymentId: string | undefined,
  extra: Record<string, unknown>,
): Promise<void> {
  const notesUid =
    typeof subscription.notes?.user_id === 'string' ? subscription.notes.user_id.trim() : '';
  const userId = notesUid || subscription.notes?.customer_id || subscription.customer_id;
  if (!userId || !subscription.id) return;

  const membership = notesUid
    ? paidMembershipPatch({
        plan: subscription.notes?.plan,
        subscriptionId: subscription.id,
        paymentId,
      })
    : null;

  await userRootDocUpdate(userId, {
    subscriptionStatus: 'active',
    subscriptionId: subscription.id,
    updatedAt: Date.now(),
    ...extra,
    ...(membership ?? {}),
  });
}

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
    const bodyString = await request.text();
    let body: {
      event?: string;
      payload?: {
        subscription?: { entity?: WebhookSubscription };
        payment?: { entity?: { id?: string; notes?: Record<string, string>; error_description?: string } };
      };
    };
    try {
      body = JSON.parse(bodyString) as typeof body;
    } catch {
      return NextResponse.json({ error: 'Invalid webhook body' }, { status: 400 });
    }

    const isValid = verifyWebhookSignature(bodyString, signature, webhookSecret);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 400 }
      );
    }

    const event = body.event;
    const payload = body.payload ?? {};

    if (!getFirebaseDB()) {
      throw new Error('Firestore not initialized');
    }

    const now = Date.now();

    switch (event) {
      case 'subscription.activated':
        if (payload.subscription?.entity) {
          const subscription = payload.subscription.entity;
          await markSubscriptionActive(subscription, payload.payment?.entity?.id, {
            subscriptionActivatedAt: now,
            nextBillingDate: subscription.current_end,
          });
        }
        break;

      case 'subscription.charged':
        if (payload.subscription?.entity) {
          const subscription = payload.subscription.entity;
          const paymentId = payload.payment?.entity?.id;
          await markSubscriptionActive(subscription, paymentId, {
            lastBillingDate: now,
            nextBillingDate: subscription.current_end,
            ...(paymentId ? { lastPaymentId: paymentId } : {}),
          });
        }
        break;

      case 'subscription.cancelled':
        if (payload.subscription?.entity) {
          const subscription = payload.subscription.entity;
          const notesUid =
            typeof subscription.notes?.user_id === 'string' ? subscription.notes.user_id.trim() : '';
          const userId = notesUid || subscription.notes?.customer_id || subscription.customer_id;

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
