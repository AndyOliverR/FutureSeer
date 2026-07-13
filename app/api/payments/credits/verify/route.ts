import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { devLog } from '@/lib/devLogger';
import { addCreditsFromPack } from '@/lib/billingCreditsServer';
import { verifyCreditOrderMetadata } from '@/lib/creditPaymentVerification';
import { fetchOrder } from '@/lib/razorpay';
import type { CreditPackId } from '@/lib/billingTypes';
import { verifyUserRequest } from '@/lib/userApiAuth';

export const dynamic = 'force-dynamic';

const PACK_IDS: CreditPackId[] = ['starter', 'regular', 'power'];

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
    const {
      razorpay_payment_id: paymentId,
      razorpay_order_id: orderId,
      razorpay_signature: signature,
      packId,
    } = body;

    if (!paymentId || !orderId || !signature || !packId) {
      return NextResponse.json({ error: 'Missing payment verification data' }, { status: 400 });
    }

    if (!PACK_IDS.includes(packId as CreditPackId)) {
      return NextResponse.json({ error: 'Invalid packId' }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET || '';
    if (!secret) {
      return NextResponse.json({ error: 'Razorpay not configured' }, { status: 500 });
    }

    const text = `${orderId}|${paymentId}`;
    const generatedSignature = crypto.createHmac('sha256', secret).update(text).digest('hex');
    const signatureIsValid =
      typeof signature === 'string' &&
      generatedSignature.length === signature.length &&
      crypto.timingSafeEqual(Buffer.from(generatedSignature), Buffer.from(signature));
    if (!signatureIsValid) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    const order = await fetchOrder(orderId);
    const metadata = verifyCreditOrderMetadata({
      order,
      expectedOrderId: orderId,
      authUid: auth.uid,
      requestedPackId: packId as CreditPackId,
    });
    if (!metadata.ok) {
      return NextResponse.json({ error: metadata.error }, { status: 400 });
    }

    const result = await addCreditsFromPack(
      auth.uid,
      metadata.packId,
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
    const message = error instanceof Error ? error.message : 'Failed to verify credit payment';
    devLog.error('Error verifying credit payment:', error, 'route');
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
