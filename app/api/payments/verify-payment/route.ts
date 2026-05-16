import { NextRequest, NextResponse } from 'next/server';
import { devLog } from '@/lib/devLogger';
import crypto from 'crypto';
import { getSubscription, refundPayment } from '@/lib/razorpay';
import { logApiPain } from '@/lib/painLogging';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } = body;

    if (!razorpay_payment_id || !razorpay_subscription_id || !razorpay_signature) {
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

    // For trial: refund the mandate/auth charge immediately so it is "refundable immediately"
    try {
      const subscription = await getSubscription(razorpay_subscription_id);
      const notes = (subscription as { notes?: Record<string, string> })?.notes;
      const plan = notes?.plan;
      if (plan === 'power-user-trial') {
        await refundPayment(razorpay_payment_id);
      }
    } catch (refundError: unknown) {
      devLog.error('Trial mandate refund failed (user still gets access)', refundError, 'verify-payment');
      // Still return success so user is marked as having a payment method; refund can be retried via webhook/ops
    }

    // Payment verified successfully
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
