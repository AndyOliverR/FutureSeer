"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Shield, Lock, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { loadRazorpayScript } from '@/lib/razorpayClient';
import { getCountryPricingConfig } from '@/lib/pricingConfig';
import { isRazorpayPlanCurrency } from '@/lib/razorpayPlanCurrencies';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PaymentMethodCaptureProps {
  selectedPlan: 'power-user-trial' | 'buy-coffee' | 'treat-me' | 'festive-hamper';
  userEmail: string;
  userName: string;
  userCountry: string;
  onPaymentMethodCaptured: (paymentMethodId: string, subscriptionId?: string) => void;
  onError?: (error: string) => void;
}

export function PaymentMethodCapture({
  selectedPlan,
  userEmail,
  userName,
  userCountry,
  onPaymentMethodCaptured,
  onError,
}: PaymentMethodCaptureProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setIsScriptLoaded(true);
    script.onerror = () => {
      if (onError) {
        onError('Failed to load payment system. Please refresh the page.');
      }
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup script on unmount
      const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [onError]);

  const handleSecureSpot = async () => {
    if (!isScriptLoaded) {
      if (onError) {
        onError('Payment system is still loading. Please wait a moment.');
      }
      return;
    }

    setIsLoading(true);

    try {
      // Get pricing for the selected plan
      const config = getCountryPricingConfig(userCountry);
      let amount = 0; // 0 for trial, actual amount for paid plans
      let planDescription = '';

      if (selectedPlan === 'buy-coffee') {
        amount = config.pricingTiers.allFeatures;
        planDescription = 'Monthly contribution to support the innovation';
      } else if (selectedPlan === 'treat-me') {
        amount = config.pricingTiers.quarterly;
        planDescription = 'Quarterly contribution to support the innovation';
      } else if (selectedPlan === 'festive-hamper') {
        amount = config.pricingTiers.annual;
        planDescription = 'Annual contribution to support the innovation';
      } else {
        // Trial - no charge, but still need payment method
        amount = 0;
        planDescription = 'Secure your spot in the innovation experiment';
      }

      // Razorpay expects smallest currency unit (paise for INR, cents for USD, etc.)
      // Config stores major units (₹99, $9.99). IDR/VND have no sub-unit.
      const noSubUnit = config.currency === 'IDR' || config.currency === 'VND';
      const amountInSmallestUnit = Math.round(amount * (noSubUnit ? 1 : 100));

      // Create subscription on server first
      const response = await fetch('/api/payments/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: selectedPlan,
          amount: amountInSmallestUnit,
          currency: config.currency,
          email: userEmail,
          name: userName,
          country: userCountry,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create subscription');
      }

      const data = await response.json();
      if (data.noSubscriptionRequired === true) {
        onPaymentMethodCaptured('no-charge');
        setIsLoading(false);
        return;
      }

      const { subscriptionId, razorpayKeyId } = data;

      // Trial and paid plans both use subscription checkout so verify-payment receives payment_id and subscription_id.
      await loadRazorpayScript();

      if (!window.Razorpay) {
        throw new Error('Razorpay script not loaded');
      }

      const options = {
        key: razorpayKeyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
        subscription_id: subscriptionId,
        name: 'FutureSeer Innovation Experiment',
        description: planDescription,
        prefill: {
          name: userName,
          email: userEmail,
        },
        handler: async (response: any) => {
          try {
            const verifyResponse = await fetch('/api/payments/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_subscription_id: response.razorpay_subscription_id || subscriptionId,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            if (!verifyResponse.ok) {
              throw new Error('Payment verification failed');
            }

            const { paymentMethodId } = await verifyResponse.json();
            onPaymentMethodCaptured(paymentMethodId, response.razorpay_subscription_id || subscriptionId);
          } catch (error: any) {
            if (onError) {
              onError(error.message || 'Failed to verify payment method');
            }
          } finally {
            setIsLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            if (onError) {
              onError('Payment cancelled by user');
            }
            setIsLoading(false);
          },
        },
        theme: {
          color: '#f59e0b',
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error: unknown) {
      if (onError) {
        onError(error instanceof Error ? error.message : 'Failed to secure your spot');
      }
      setIsLoading(false);
    }
  };

  const config = getCountryPricingConfig(userCountry);
  const chargeInUsdFallback = !isRazorpayPlanCurrency(config.currency);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <Card className="bg-slate-900/40 border-amber-500/30 backdrop-blur-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-amber-500/20 border border-amber-500/30">
              <Sparkles className="w-8 h-8 text-amber-400" />
            </div>
          </div>
          <CardTitle className="text-2xl font-serif text-white mb-2">
            Secure Your Spot in the Innovation Experiment
          </CardTitle>
          {chargeInUsdFallback && (
            <p className="text-sm text-amber-200/90 mb-2">
              Payment will be processed in USD. Your card may show the equivalent in your local currency.
            </p>
          )}
          <CardDescription className="text-slate-300 font-serif">
            {selectedPlan === 'power-user-trial' ? (
              <>
                A small amount (₹1 in India / $1 internationally) may be charged to verify your payment method and will be <span className="text-green-400 font-semibold">refunded immediately</span>. Your subscription minimum is ₹99/month (or equivalent) with the <span className="text-green-400 font-semibold">first month free</span>; after that you will be charged according to your plan. Any verification charge is refunded in full immediately.
              </>
            ) : (
              <>
                Add a payment method to join the innovation team. <br />
                <span className="text-amber-400 font-semibold">Your contribution starts after 30 days.</span>
              </>
            )}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Trust Indicators */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center gap-2">
              <Shield className="w-6 h-6 text-green-400" />
              <span className="text-xs text-slate-300">100% Secure</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Lock className="w-6 h-6 text-blue-400" />
              <span className="text-xs text-slate-300">Encrypted</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <CreditCard className="w-6 h-6 text-amber-400" />
              <span className="text-xs text-slate-300">Cancel Anytime</span>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
            <p className="text-sm text-slate-200 text-center">
              <span className="font-semibold text-amber-300">You're not buying anything.</span>
              <br />
              You're joining a team of innovators making FutureSeer accessible to all.
              <br />
              <span className="text-xs text-slate-400 mt-2 block">
                {selectedPlan === 'power-user-trial'
                  ? 'A verification charge may appear at checkout and is refunded in full immediately. Your first month is free; recurring charges apply after that per your plan.'
                  : 'Your payment method is securely stored and won\'t be charged for 30 days.'}
              </span>
            </p>
          </div>

          {/* CTA Button */}
          <Button
            onClick={handleSecureSpot}
            disabled={isLoading || !isScriptLoaded}
            className="w-full bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-slate-900 font-semibold py-6 text-lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Securing your spot...
              </>
            ) : !isScriptLoaded ? (
              'Loading...'
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Secure My Spot (No Charge for 30 Days)
              </>
            )}
          </Button>

          <p className="text-xs text-center text-slate-400">
            By continuing, you agree to our{' '}
            <a href="/terms" className="text-amber-400 hover:text-amber-300 underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-amber-400 hover:text-amber-300 underline">
              Privacy Policy
            </a>
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
