import { NextRequest, NextResponse } from 'next/server';
import { devLog } from '@/lib/devLogger';
import { createOrder } from '@/lib/razorpay';
import {
  amountToSmallestUnit,
  getCreditPackOffer,
  getCreditPackPrice,
} from '@/lib/billingConfig';
import { resolveTrustedBillingCountryCode } from '@/lib/billingCountry';
import { getCountryPricingConfig } from '@/lib/pricingConfig';
import type { CreditPackId } from '@/lib/billingTypes';
import { getDocument, isAdminAvailable } from '@/lib/firebase-admin';
import { verifyUserRequest } from '@/lib/userApiAuth';

export const dynamic = 'force-dynamic';

const PACK_IDS: CreditPackId[] = ['starter', 'regular', 'power'];

/**
 * POST /api/payments/credits/create-order
 * Body: { packId, countryCode? }
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyUserRequest(request, 'credits-create-order');
    if (!auth.ok) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const packId = typeof body.packId === 'string' ? body.packId.trim() : '';
    const requestedCountry =
      typeof body.countryCode === 'string' ? body.countryCode.trim() : undefined;

    if (!PACK_IDS.includes(packId as CreditPackId)) {
      return NextResponse.json({ error: 'Invalid packId' }, { status: 400 });
    }

    let profileCountry: unknown;
    if (isAdminAvailable()) {
      try {
        const profileData = await getDocument('users', auth.uid);
        if (profileData && typeof profileData === 'object') {
          profileCountry = (profileData as Record<string, unknown>).country;
        }
      } catch (err) {
        devLog.warn('[credits-create-order] Could not load profile country', err, 'route');
      }
    }
    const countryCode = resolveTrustedBillingCountryCode({
      profileCountry,
      requestedCountry,
    });

    const offer = getCreditPackOffer(countryCode, packId as CreditPackId);
    const price = getCreditPackPrice(countryCode, packId as CreditPackId);
    const config = getCountryPricingConfig(countryCode);
    const amountInSmallestUnit = amountToSmallestUnit(price, config.currency);

    const ts = Date.now().toString(36);
    const uid = auth.uid.slice(-14);
    const receipt = `cr_${packId.slice(0, 3)}_${ts}_${uid}`.slice(0, 40);

    const order = await createOrder({
      amount: amountInSmallestUnit,
      currency: config.currency,
      receipt,
      notes: {
        userId: auth.uid,
        packId,
        credits: String(offer.credits),
        countryCode,
      },
    });

    const orderId = (order as { id: string }).id;
    const razorpayKeyId =
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || '';

    return NextResponse.json({
      orderId,
      razorpayKeyId,
      packId,
      credits: offer.credits,
      amount: price,
      currency: config.currency,
      formatted: offer.formatted,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create credit order';
    devLog.error('Error creating credit order:', error, 'route');
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
