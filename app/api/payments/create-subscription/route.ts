import { NextRequest, NextResponse } from 'next/server';
import { getRazorpayClient, createPlan, createSubscription } from '@/lib/razorpay';
import { getCountryPricingConfig } from '@/lib/pricingConfig';
import { getFirebaseDB } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { plan, amount, currency, email, name, country, userId } = body;

    if (!plan || !email || !name || !country) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
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
              // User has free months - skip charge and decrement counter
              const nextBillingDate = Date.now() + (30 * 24 * 60 * 60 * 1000); // +30 days
              
              await userRef.update({
                freeMonthsRemaining: freeMonthsRemaining - 1,
                nextBillingDate: nextBillingDate,
                subscriptionStatus: 'active',
                updatedAt: Date.now()
              });
              
              console.log(`✅ Free month applied for user ${userId}. ${freeMonthsRemaining - 1} free months remaining.`);
              
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
          console.error('Error checking free months:', error);
          // Continue with normal billing if check fails
        }
      }
    }

    const config = getCountryPricingConfig(country);
    const razorpay = getRazorpayClient();

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
    const planName = `FutureSeer ${plan === 'buy-coffee' ? 'Monthly' : plan === 'treat-me' ? 'Quarterly' : plan === 'festive-hamper' ? 'Annual' : 'Trial'} Contribution`;
    const planDescription = `FutureSeer Innovation Experiment - ${planName}`;

    // For trial, use subscription minimum so gateway shows "charge ₹99 every month" (or equivalent). Paid plans use request amount.
    const noSubUnit = config.currency === 'IDR' || config.currency === 'VND';
    const planAmount = plan === 'power-user-trial'
      ? Math.round(config.pricingTiers.allFeatures * (noSubUnit ? 1 : 100))
      : amount;

    let razorpayPlanId: string;

    try {
      const createdPlan = await createPlan({
        period: planPeriod,
        amount: planAmount,
        currency: config.currency,
        item: {
          name: planName,
          description: planDescription,
        },
      });
      razorpayPlanId = createdPlan.id;
    } catch (error: any) {
      console.error('Error creating plan:', error);
      throw new Error(error.message || 'Failed to create subscription plan');
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
      },
    });

    return NextResponse.json({
      subscriptionId: subscription.id,
      razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
    });
  } catch (error: any) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create subscription' },
      { status: 500 }
    );
  }
}
