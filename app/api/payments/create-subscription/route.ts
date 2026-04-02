import { NextRequest, NextResponse } from 'next/server';
import { devLog } from '@/lib/devLogger';
import { createPlan, createSubscription } from '@/lib/razorpay';
import { isRazorpayPlanCurrency } from '@/lib/razorpayPlanCurrencies';
import { convertToUsdCents } from '@/lib/currencyConversion';
import { getCountryPricingConfig } from '@/lib/pricingConfig';
import { getFirebaseDB } from '@/lib/firebase';
import { isNoChargeSubscriptionEmail } from '@/lib/subscriptionConfig';
import { getAuth, setDocument, isAdminAvailable, getDocument } from '@/lib/firebase-admin';
import { CHECKOUT_DISPLAY_NAME } from '@/lib/checkoutBranding';

async function userIsSpecialForSubscription(uid: string): Promise<boolean> {
  if (!isAdminAvailable()) return false;
  try {
    const authUser = await getAuth().getUser(uid);
    if (authUser.customClaims?.specialUser === true) return true;
  } catch {
    /* ignore */
  }
  const data = await getDocument('users', uid);
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  return (
    d.specialUser === true || d.special_user === true || d.isSpecialUser === true
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { plan, amount, email, name, country, userId } = body;

    if (!plan || !email || !name || !country) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // No-charge accounts (god mode, mary mode, special test admin): skip Razorpay, grant access
    if (isNoChargeSubscriptionEmail(email)) {
      let uid: string | null = typeof userId === 'string' && userId.trim() ? userId.trim() : null;
      if (!uid && isAdminAvailable()) {
        try {
          const authUser = await getAuth().getUserByEmail(email.trim().toLowerCase());
          uid = authUser.uid;
        } catch {
          devLog.warn('[create-subscription] No-charge email: could not resolve uid from getUserByEmail', 'route');
        }
      }
      if (uid && isAdminAvailable()) {
        await setDocument('users', uid, {
          subscriptionStatus: 'active',
          noChargeAccount: true,
          updatedAt: Date.now(),
        });
        devLog.info(`[create-subscription] No-charge access granted for ${email}`, 'route');
      }
      return NextResponse.json({
        success: true,
        noSubscriptionRequired: true,
      });
    }

    // Admin-granted special user (Firebase claim / Firestore): skip Razorpay
    let uidForSpecial: string | null =
      typeof userId === 'string' && userId.trim() ? userId.trim() : null;
    if (!uidForSpecial && isAdminAvailable()) {
      try {
        uidForSpecial = (await getAuth().getUserByEmail(email.trim().toLowerCase())).uid;
      } catch {
        uidForSpecial = null;
      }
    }
    if (uidForSpecial && (await userIsSpecialForSubscription(uidForSpecial))) {
      if (isAdminAvailable()) {
        await setDocument('users', uidForSpecial, {
          subscriptionStatus: 'active',
          noChargeAccount: true,
          updatedAt: Date.now(),
        });
        devLog.info(`[create-subscription] Special user: skip Razorpay for ${email}`, 'route');
      }
      return NextResponse.json({
        success: true,
        noSubscriptionRequired: true,
      });
    }

    // Check if user has free months remaining (skip charge if they do)
    if (userId) {
      const db = getFirebaseDB();
      if (db && typeof window === 'undefined') {
        try {
          const userRef = db.collection('users').doc(userId);
          const userDoc = await userRef.get();
          
          if (userDoc.exists) {
            const userData = userDoc.data();
            const freeMonthsRemaining = userData?.freeMonthsRemaining || 0;
            
            if (freeMonthsRemaining > 0) {
              // Skip charge and decrement counter. Do not set subscriptionStatus to 'active' here:
              // teaser-trial product keeps full report access for Razorpay-activated subscriptions only.
              const nextBillingDate = Date.now() + (30 * 24 * 60 * 60 * 1000); // +30 days
              
              await userRef.update({
                freeMonthsRemaining: freeMonthsRemaining - 1,
                nextBillingDate: nextBillingDate,
                updatedAt: Date.now()
              });
              
              devLog.debug(`✅ Free month applied for user ${userId}. ${freeMonthsRemaining - 1} free months remaining.`);
              
              return NextResponse.json({
                success: true,
                freeMonthApplied: true,
                freeMonthsRemaining: freeMonthsRemaining - 1,
                nextBillingDate: nextBillingDate,
                message: 'Free month applied successfully'
              });
            }
          }
        } catch (error) {
          devLog.error('Error checking free months:', error, 'route');
          // Continue with normal billing if check fails
        }
      }
    }

    // Resolve Firebase uid for webhook (recurring updates must target users/{uid})
    let uid: string | null = typeof userId === 'string' && userId.trim() ? userId.trim() : null;
    if (!uid && isAdminAvailable()) {
      try {
        const authUser = await getAuth().getUserByEmail(email.trim().toLowerCase());
        uid = authUser.uid;
      } catch {
        devLog.warn('[create-subscription] Could not resolve uid from getUserByEmail', 'route');
      }
    }

    const config = getCountryPricingConfig(country);

    // Determine plan period and create Razorpay plan if needed
    let planPeriod: 'monthly' | 'quarterly' | 'yearly' = 'monthly';
    let totalCount = 12; // Default to 12 months

    if (plan === 'buy-coffee') {
      planPeriod = 'monthly';
      totalCount = 12; // 12 monthly cycles
    } else if (plan === 'treat-me') {
      planPeriod = 'quarterly';
      totalCount = 4; // 4 quarterly cycles (1 year)
    } else if (plan === 'festive-hamper') {
      planPeriod = 'yearly';
      totalCount = 1; // 1 annual cycle
    } else {
      // Trial - still need a plan for payment method capture
      planPeriod = 'monthly';
      totalCount = 12;
    }

    // Validate amount for paid plans (Razorpay requires minimum 1 in smallest unit)
    if (plan !== 'power-user-trial' && (!amount || amount <= 0)) {
      return NextResponse.json(
        { error: 'Invalid amount. Amount must be greater than 0 for paid plans.' },
        { status: 400 }
      );
    }

    // Trial is used for both signup and dashboard first-signin (RBI) payment-method capture.
    // Create or get Razorpay plan
    const planName = `${plan === 'buy-coffee' ? 'Monthly' : plan === 'treat-me' ? 'Quarterly' : plan === 'festive-hamper' ? 'Annual' : 'Trial'} membership`;
    const planDescription = `${CHECKOUT_DISPLAY_NAME} — ${planName}`;

    // For trial, use subscription minimum so gateway shows "charge ₹99 every month" (or equivalent). Paid plans use request amount.
    const noSubUnit = config.currency === 'IDR' || config.currency === 'VND';
    const planAmount = plan === 'power-user-trial'
      ? Math.round(config.pricingTiers.allFeatures * (noSubUnit ? 1 : 100))
      : amount;

    // Razorpay Plans API supports only INR and USD; others (e.g. AED) return "Currency provided is not supported".
    const useFallbackCurrency = !isRazorpayPlanCurrency(config.currency);
    const planCurrency = useFallbackCurrency ? 'USD' : config.currency;
    const planAmountForRazorpay = useFallbackCurrency
      ? convertToUsdCents(planAmount, config.currency)
      : planAmount;

    if (useFallbackCurrency) {
      devLog.info(`[create-subscription] Using USD fallback for unsupported currency: ${config.currency}`, 'route');
    }

    let razorpayPlanId: string;

    try {
      const createdPlan = await createPlan({
        period: planPeriod,
        amount: planAmountForRazorpay,
        currency: planCurrency,
        item: {
          name: planName,
          description: planDescription,
        },
      });
      razorpayPlanId = createdPlan.id;
    } catch (error: unknown) {
      devLog.error('Error creating plan:', error, 'route');
      const message = error instanceof Error ? error.message : 'Failed to create subscription plan';
      throw new Error(message);
    }

    // Trial: first charge delayed (start_at + 30 days). Paid plans: immediate start.
    const isTrial = plan === 'power-user-trial';
    const subscription = await createSubscription({
      planId: razorpayPlanId,
      customerId: email,
      customerName: name,
      customerEmail: email,
      totalCount,
      immediateStart: !isTrial,
      startAt: isTrial ? Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60 : undefined,
      notes: {
        plan: plan,
        country: country,
        contribution_type: plan,
        ...(uid ? { user_id: uid } : {}),
      },
    });

    return NextResponse.json({
      subscriptionId: subscription.id,
      razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
      ...(useFallbackCurrency ? { chargeCurrency: 'USD' as const } : {}),
    });
  } catch (error: unknown) {
    devLog.error('Error creating subscription:', error, 'route');
    const message = error instanceof Error ? error.message : 'Failed to create subscription';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
