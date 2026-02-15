import { NextRequest, NextResponse } from 'next/server';
import { devLog } from '@/lib/devLogger';
import { getFirebaseDB } from '@/lib/firebase';
import { createOrder } from '@/lib/razorpay';
import { getCountryPricingConfig } from '@/lib/pricingConfig';

export const dynamic = 'force-static'

/**
 * POST /api/payments/tip
 * action: 'create-order' — Create Razorpay order for Tip Jar; client opens checkout then calls /api/payments/tip/verify.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, amount, countryCode, userId } = body;

    if (action !== 'create-order') {
      return NextResponse.json(
        { error: 'Invalid action. Use action: "create-order".' },
        { status: 400 }
      );
    }

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Valid amount is required' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const config = getCountryPricingConfig(countryCode || 'IN');
    const currency = config.currency;

    // Smallest unit: paise (INR) or cents (USD, etc.)
    const amountInSmallestUnit = Math.round(amount * 100);

    // Razorpay receipt max 40 chars. Use tip_ + base36 ts + _ + truncated userId.
    const ts = Date.now().toString(36);
    const uid = userId.slice(-14);
    const receipt = `tip_${ts}_${uid}`.slice(0, 40);
    const order = await createOrder({
      amount: amountInSmallestUnit,
      currency,
      receipt,
      notes: { userId },
    });

    const orderId = (order as { id: string }).id;
    const razorpayKeyId =
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || '';

    return NextResponse.json({
      orderId,
      razorpayKeyId,
      amount,
      currency,
    });
  } catch (error: any) {
    devLog.error('Error creating tip order:', error, 'route');
    return NextResponse.json(
      { error: error.message || 'Failed to create tip order' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/payments/tip?userId=xxx
 * Get tip history for a user
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
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

    if (typeof window === 'undefined') {
      const userRef = db.collection('users').doc(userId);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      const userData = userDoc.data();

      return NextResponse.json({
        success: true,
        totalTipAmount: userData?.totalTipAmount || 0,
        lastTipDate: userData?.lastTipDate || null,
        tipHistory: userData?.tipHistory || [],
      });
    } else {
      return NextResponse.json(
        { error: 'Client-side not supported for this endpoint' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    devLog.error('Error getting tip history:', error, 'route');
    return NextResponse.json(
      { error: error.message || 'Failed to get tip history' },
      { status: 500 }
    );
  }
}
