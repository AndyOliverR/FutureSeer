import { NextRequest, NextResponse } from 'next/server';
import { devLog } from '@/lib/devLogger';
import crypto from 'crypto';
import { getSubscription, refundPayment } from '@/lib/razorpay';
import { logApiPain } from '@/lib/painLogging';
import { verifyUserRequest } from '@/lib/userApiAuth';
import { isAdminAvailable, setDocument } from '@/lib/firebase-admin';
import { verifySubscriptionGrant } from '@/lib/subscriptionGrant';

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyUserRequest(request, 'verify-payment');
    if (!auth.ok) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } = body;

    if (
      typeof razorpay_payment_id !== 'string' ||
      typeof razorpay_subscription_id !== 'string' ||
      typeof razorpay_signature !== 'string' ||
      !razorpay_payment_id ||
      !razorpay_subscription_id ||
      !razorpay_signature
    ) {
      return NextResponse.json(
        { error: 'Missing payment verification data' },
        { status: 400 }
      );
    }

    // Verify signature (Razorpay: payment_id|subscription_id per subscription integration guide)
    const secret = process.env.RAZORPAY_KEY_SECRET || '';
    if (!secret) {
      return NextResponse.json(
        { error: 'Server misconfiguration: Razorpay secret not set' },
        { status: 500 }
      );
    }

    const text = `${razorpay_payment_id}|${razorpay_subscription_id}`;
    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(text)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    let subscription: { notes?: Record<string, string>; status?: string };
    try {
      subscription = (await getSubscription(razorpay_subscription_id)) as {
        notes?: Record<string, string>;
        status?: string;
      };
    } catch (lookupError: unknown) {
      devLog.error('Subscription lookup failed during verify-payment', lookupError, 'verify-payment');
      return NextResponse.json(
        { error: 'Could not confirm the subscription with Razorpay' },
        { status: 502 }
      );
    }

    const grant = verifySubscriptionGrant({
      authUid: auth.uid,
      notesUserId: subscription.notes?.user_id,
      notesPlan: subscription.notes?.plan,
      razorpayStatus: subscription.status,
      subscriptionId: razorpay_subscription_id,
      paymentId: razorpay_payment_id,
    });

    if (!grant.ok) {
      switch (grant.reason) {
        case 'trial_plan':
          try {
            await refundPayment(razorpay_payment_id);
          } catch (refundError: unknown) {
            devLog.error(
              'Trial mandate refund failed (trial access is unchanged)',
              refundError,
              'verify-payment'
            );
          }
          return NextResponse.json({
            success: true,
            paymentMethodId: razorpay_payment_id,
            subscriptionId: razorpay_subscription_id,
          });
        case 'user_mismatch':
          return NextResponse.json(
            { error: 'Subscription does not belong to this account' },
            { status: 403 }
          );
        case 'unbound_subscription':
          return NextResponse.json(
            { error: 'Subscription is not linked to an account' },
            { status: 422 }
          );
        case 'unknown_plan':
          return NextResponse.json(
            { error: 'Subscription plan is not recognized' },
            { status: 422 }
          );
        case 'inactive_subscription':
          return NextResponse.json(
            { error: 'Subscription is not active' },
            { status: 409 }
          );
        case 'missing_payment':
          return NextResponse.json(
            { error: 'Missing payment verification data' },
            { status: 400 }
          );
        default: {
          const _exhaustive: never = grant.reason;
          throw new Error(`Unhandled subscription grant: ${String(_exhaustive)}`);
        }
      }
    }

    if (!isAdminAvailable()) {
      return NextResponse.json(
        { error: 'Billing storage is unavailable' },
        { status: 503 }
      );
    }

    const wrote = await setDocument('users', grant.userId, {
      ...grant.patch,
      updatedAt: Date.now(),
    });
    if (!wrote) {
      return NextResponse.json(
        { error: 'Could not save membership' },
        { status: 503 }
      );
    }

    return NextResponse.json({
      success: true,
      paymentMethodId: razorpay_payment_id,
      subscriptionId: razorpay_subscription_id,
    });
  } catch (error: unknown) {
    devLog.error('Error verifying payment:', error, 'route');
    const message = error instanceof Error ? error.message : 'Failed to verify payment';
    await logApiPain(request, error, {
      area: 'payments',
      action: 'verify_payment_failed',
      message,
    });
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
