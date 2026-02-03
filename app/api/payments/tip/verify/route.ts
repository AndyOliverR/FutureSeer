import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseDB } from '@/lib/firebase';
import crypto from 'crypto';

/**
 * POST /api/payments/tip/verify
 * Verify Razorpay order payment signature, then update user tipHistory in Firebase.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      userId,
      amount,
    } = body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !userId) {
      return NextResponse.json(
        { error: 'Missing payment verification data or userId' },
        { status: 400 }
      );
    }

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Valid amount is required' },
        { status: 400 }
      );
    }

    const secret = process.env.RAZORPAY_KEY_SECRET || '';
    if (!secret) {
      return NextResponse.json(
        { error: 'Razorpay not configured' },
        { status: 500 }
      );
    }

    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
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

    const db = getFirebaseDB();
    if (!db) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 500 }
      );
    }

    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    const currentTipAmount = userData?.totalTipAmount || 0;
    const tipHistory = userData?.tipHistory || [];

    const tipData = {
      amount: Number(amount),
      date: Date.now(),
      transactionId: razorpay_payment_id,
    };

    await userRef.update({
      totalTipAmount: currentTipAmount + Number(amount),
      lastTipDate: Date.now(),
      tipHistory: [...tipHistory, tipData],
      updatedAt: Date.now(),
    });

    return NextResponse.json({
      success: true,
      transactionId: razorpay_payment_id,
    });
  } catch (error: any) {
    console.error('Error verifying tip payment:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to verify tip payment' },
      { status: 500 }
    );
  }
}
