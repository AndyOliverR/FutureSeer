import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { devLog } from '@/lib/devLogger';
import {
  CreditPaymentValidationError,
  validateCreditPaymentRecords,
} from '@/lib/billingCreditPayment';
import { addCreditsFromPack } from '@/lib/billingCreditsServer';
import { getOrder, getPayment } from '@/lib/razorpay';
import { verifyUserRequest } from '@/lib/userApiAuth';

export const dynamic = 'force-dynamic';

/**
 * POST /api/payments/credits/verify
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyUserRequest(request, 'credits-verify');
    if (!auth.ok) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const paymentId =
      typeof body.razorpay_payment_id === 'string' ? body.razorpay_payment_id.trim() : '';
    const orderId =
      typeof body.razorpay_order_id === 'string' ? body.razorpay_order_id.trim() : '';
    const signature =
      typeof body.razorpay_signature === 'string' ? body.razorpay_signature.trim() : '';

    if (!paymentId || !orderId || !signature) {
      return NextResponse.json({ error: 'Missing payment verification data' }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET || '';
    if (!secret) {
      return NextResponse.json({ error: 'Razorpay not configured' }, { status: 500 });
    }

    const text = `${orderId}|${paymentId}`;
    const generatedSignature = crypto.createHmac('sha256', secret).update(text).digest('hex');
    const expected = Buffer.from(generatedSignature, 'utf8');
    const received = Buffer.from(signature, 'utf8');
    if (expected.length !== received.length || !crypto.timingSafeEqual(expected, received)) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    const [order, payment] = await Promise.all([getOrder(orderId), getPayment(paymentId)]);
    const packId = validateCreditPaymentRecords({
      order,
      payment,
      orderId,
      paymentId,
      userId: auth.uid,
    });

    const result = await addCreditsFromPack(
      auth.uid,
      packId,
      orderId,
      paymentId,
    );

    return NextResponse.json({
      success: true,
      duplicate: result.duplicate === true,
      creditsAdded: result.creditsAdded,
      creditBalance: result.creditBalance,
      transactionId: paymentId,
    });
  } catch (error: unknown) {
    if (error instanceof CreditPaymentValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : 'Failed to verify credit payment';
    devLog.error('Error verifying credit payment:', error, 'route');
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
