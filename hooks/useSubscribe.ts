"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { getCountryPricingConfig, getAttractivePrice } from "@/lib/pricingConfig";
import { MEMBERSHIP_TIER_FEATURES } from "@/lib/membershipTierCopy";
import { initializeSubscriptionCheckout } from "@/lib/razorpayClient";
import { updateUserProfile } from "@/lib/firebase";
import { analytics, ANALYTICS_EVENTS } from "@/lib/analytics";
import { CHECKOUT_DISPLAY_NAME } from "@/lib/checkoutBranding";
import { fetchWithFirebaseAuthRequired } from "@/lib/clientFirebaseFetch";

interface SubscriptionConfig {
  available: boolean;
  plans: SubscriptionPlan[];
  features: FeatureTier[];
  communityFeatures: CommunityFeature[];
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: string;
  features: string[];
  popular?: boolean;
  savings?: number;
  originalPrice?: number;
  valueScore: number;
  targetAudience: string;
  conversionRate?: number;
  currencySymbol?: string;
  formatted?: string;
}

interface FeatureTier {
  tier: string;
  features: string[];
  value: string;
}

interface CommunityFeature {
  name: string;
  description: string;
  availableIn: string[];
}

type UseSubscribeOptions = {
  requireReturningCommit?: boolean;
  redirectAfterCommit?: string;
};

export function useSubscribe(options: UseSubscribeOptions = {}) {
  const { requireReturningCommit = false, redirectAfterCommit } = options;
  const router = useRouter();
  const { user, userProfile, loading: authLoading, isSpecialUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionConfig, setSubscriptionConfig] = useState<SubscriptionConfig>({
    available: false,
    plans: [],
    features: [],
    communityFeatures: []
  });

  const country = userProfile?.country ?? 'IN';

  const fetchSubscriptionConfig = useCallback(() => {
    try {
      setError(null);
      const cfg = getCountryPricingConfig(country);
      const priceAll = getAttractivePrice('allFeatures', country);
      const priceQuarterly = getAttractivePrice('quarterly', country);
      const priceAnnual = getAttractivePrice('annual', country);

      const plans: SubscriptionPlan[] = [
        {
          id: "power-user-trial",
          name: "Power User Trial",
          price: 0,
          currency: cfg.currency,
          interval: "forever",
          currencySymbol: cfg.currencySymbol,
          formatted: "Free",
          features: [...MEMBERSHIP_TIER_FEATURES["power-user-trial"]],
          valueScore: 3,
          targetAudience: "New users, curious explorers",
        },
        {
          id: "buy-coffee",
          name: "Coffee",
          price: priceAll.price,
          currency: priceAll.currency,
          interval: "month",
          currencySymbol: priceAll.currencySymbol,
          formatted: priceAll.formatted,
          features: [...MEMBERSHIP_TIER_FEATURES["buy-coffee"]],
          popular: true,
          valueScore: 7,
          targetAudience: "Regular users, spiritual seekers",
        },
        {
          id: "treat-me",
          name: "Treat",
          price: priceQuarterly.price,
          currency: priceQuarterly.currency,
          interval: "quarter",
          currencySymbol: priceQuarterly.currencySymbol,
          formatted: priceQuarterly.formatted,
          features: [
            "Quarterly contribution",
            "Better value, same mission",
            "All monthly benefits",
            "3 months of innovation support",
            "Early access to new features",
            "Priority support",
          ],
          valueScore: 8,
          targetAudience: "Committed supporters",
        },
        {
          id: "festive-hamper",
          name: "Hamper",
          price: priceAnnual.price,
          currency: priceAnnual.currency,
          interval: "year",
          currencySymbol: priceAnnual.currencySymbol,
          formatted: priceAnnual.formatted,
          features: [...MEMBERSHIP_TIER_FEATURES["festive-hamper"]],
          valueScore: 10,
          targetAudience: "Annual believers",
        },
      ];

      const subConfig: SubscriptionConfig = {
        available: true,
        plans: plans.filter((plan) => (requireReturningCommit ? plan.id !== "power-user-trial" : true)),
        features: [
          { tier: "Core Value", features: ["AI-Powered Predictions", "18+ Divination Tools", "Personalized Insights", "Mobile Optimization"], value: "Foundation of mystical guidance" },
          { tier: "Advanced Value", features: ["Custom AI Training", "Pattern Recognition", "Community Features", "Priority Support"], value: "Enhanced personalization & community" },
          { tier: "Premium Value", features: ["1-on-1 Consultations", "Exclusive Content", "Lifetime Access", "Product Influence"], value: "Ultimate mystical experience" },
        ],
        communityFeatures: [
          { name: "Cosmic Community", description: "Connect with fellow seekers, share insights, and learn together in a safe, moderated environment", availableIn: ["buy-coffee", "treat-me", "festive-hamper"] },
          { name: "Independent Expert Network", description: "Interact with verified independent astrologers and mystics who contribute voluntarily", availableIn: ["treat-me", "festive-hamper"] },
          { name: "Expert-Led Discussions", description: "Reddit-style threads where independent experts share knowledge and answer questions", availableIn: ["festive-hamper"] },
          { name: "Study Groups", description: "Form study groups around specific divination methods with community members", availableIn: ["buy-coffee", "treat-me", "festive-hamper"] },
          { name: "Safety-First Environment", description: "Strict community guidelines with AI moderation and mental health protection", availableIn: ["buy-coffee", "treat-me", "festive-hamper"] },
        ],
      };
      setSubscriptionConfig(subConfig);
    } catch (err) {
      console.error("Error fetching subscription config:", err);
      setError("Failed to load subscription options");
      setSubscriptionConfig({ available: false, plans: [], features: [], communityFeatures: [] });
    }
  }, [country, requireReturningCommit]);

  useEffect(() => {
    fetchSubscriptionConfig();
    setLoading(false);
  }, [fetchSubscriptionConfig]);

  const subscribeToPlan = useCallback(async (planId: string) => {
    setError(null);

    if (planId === 'power-user-trial') {
      if (requireReturningCommit) {
        setError('Please choose a paid plan to complete returning access.');
        throw new Error('Paid plan required for returning access');
      }
      router.push('/tools');
      return;
    }

    const contributionPlans = ['buy-coffee', 'treat-me', 'festive-hamper'] as const;
    if (!contributionPlans.includes(planId as (typeof contributionPlans)[number])) {
      setError('Unknown plan');
      throw new Error('Unknown plan');
    }

    // Wait for auth to finish loading before checking user
    if (authLoading) {
      setError('Please wait while we verify your account...');
      return;
    }

    if (!user) {
      const subscribePath =
        typeof window !== 'undefined'
          ? `${window.location.pathname}${window.location.search}`
          : '/subscribe';
      router.push(`/signin?redirect=${encodeURIComponent(subscribePath)}`);
      return;
    }

    // Special users: treat as fully active without charging or opening checkout
    if (isSpecialUser) {
      try {
        if (userProfile?.subscriptionStatus !== 'active' || !userProfile?.noChargeAccount) {
          await updateUserProfile(user.uid, {
            subscriptionStatus: 'active',
            noChargeAccount: true,
          });
        }
      } catch (err) {
        console.error("Error marking special user as active:", err);
        // Fall through to tools even if profile update fails
      }
      router.push('/tools');
      setLoading(false);
      return;
    }

    const userCountry = userProfile?.country ?? 'IN';
    const pricingConfig = getCountryPricingConfig(userCountry);
    let amount = 0;
    let planDescription = '';

    if (planId === 'buy-coffee') {
      amount = pricingConfig.pricingTiers.allFeatures;
      planDescription = 'Coffee — monthly membership';
    } else if (planId === 'treat-me') {
      amount = pricingConfig.pricingTiers.quarterly;
      planDescription = 'Treat — quarterly membership';
    } else {
      amount = pricingConfig.pricingTiers.annual;
      planDescription = 'Hamper — annual membership';
    }

    // Razorpay expects smallest currency unit (paise for INR, cents for USD, etc.)
    // Pricing config stores major units (₹99, $9.99). IDR/VND have no sub-unit.
    const noSubUnit = pricingConfig.currency === 'IDR' || pricingConfig.currency === 'VND';
    const amountInSmallestUnit = Math.round(amount * (noSubUnit ? 1 : 100));

    setLoading(true);

    try {
      const createRes = await fetchWithFirebaseAuthRequired('/api/payments/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: planId,
          amount: amountInSmallestUnit,
          currency: pricingConfig.currency,
          email: user.email,
          name: user.displayName || user.email || '',
          country: userCountry,
          userId: user.uid,
          enableTrial: requireReturningCommit,
        }),
      });

      const createData = await createRes.json();
      if (!createRes.ok) {
        throw new Error(createData.error || 'Failed to create subscription');
      }

      if (createData.noSubscriptionRequired === true) {
        setLoading(false);
        router.push(redirectAfterCommit || '/tools');
        return;
      }

      const { subscriptionId, razorpayKeyId } = createData;
      if (!subscriptionId || !razorpayKeyId) {
        throw new Error('Missing subscription or key from server');
      }

      if (requireReturningCommit) {
        analytics.trackReturnPlanCommitStarted({
          surface: 'subscribe_checkout',
          plan: planId,
        });
      }

      await initializeSubscriptionCheckout({
        key: razorpayKeyId,
        subscriptionId,
        name: CHECKOUT_DISPLAY_NAME,
        description: planDescription,
        prefill: {
          name: user.displayName || undefined,
          email: user.email || undefined,
        },
        handler: async (res) => {
          try {
            const verifyRes = await fetch('/api/payments/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: res.razorpay_payment_id,
                razorpay_subscription_id: subscriptionId,
                razorpay_signature: res.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) {
              throw new Error(verifyData.error || 'Verification failed');
            }
            await updateUserProfile(user.uid, {
              subscriptionId,
              selectedPlan: planId as 'buy-coffee' | 'treat-me' | 'festive-hamper',
              isSubscribed: true,
              subscriptionStatus: 'active',
            });
            analytics.trackSubscriptionStart(planId, amount, {
              currency: pricingConfig.currency,
              surface: 'subscribe_checkout',
            });
            analytics.trackPaymentCompleted(planId, subscriptionId, {
              surface: 'subscribe_checkout',
              razorpay_payment_id: res.razorpay_payment_id,
            });
            if (requireReturningCommit) {
              analytics.trackReturnPlanCommitCompleted({
                surface: 'subscribe_checkout',
                plan: planId,
                destination: redirectAfterCommit || '/tools',
              });
            }
            router.push(redirectAfterCommit || '/tools');
          } catch (err) {
            console.error('Subscribe verify error:', err);
            setError(err instanceof Error ? err.message : 'Verification failed');
          } finally {
            setLoading(false);
          }
        },
        onError: () => {
          setLoading(false);
        },
      });
    } catch (err) {
      console.error('Error subscribing to plan:', err);
      const msg = err instanceof Error ? err.message : 'Failed to subscribe';
      setError(msg);
      setLoading(false);
      throw err;
    }
  }, [user, userProfile, router, authLoading, isSpecialUser, requireReturningCommit, redirectAfterCommit]);

  // Analytics and optimization functions
  const trackPricingEvent = useCallback((event: string, planId: string, metadata?: Record<string, unknown>) => {
    const name =
      event === 'plan_selected'
        ? ANALYTICS_EVENTS.PLAN_SELECTED
        : event === 'plan_hovered'
          ? ANALYTICS_EVENTS.PLAN_HOVERED
          : event;
    analytics.trackEvent(name, { plan_id: planId, ...metadata });
  }, []);

  const getRecommendedPlan = useCallback((userBehavior: {
    readingFrequency: number;
    toolUsage: number;
    communityEngagement: number;
  }) => {
    const { readingFrequency, toolUsage, communityEngagement } = userBehavior;
    if (readingFrequency > 10 && communityEngagement > 0.7) {
      return 'festive-hamper';
    } else if (readingFrequency > 5 || toolUsage > 0.5) {
      return 'buy-coffee';
    }
    return 'power-user-trial';
  }, []);

  return {
    loading,
    error,
    subscriptionConfig,
    subscribeToPlan,
    fetchSubscriptionConfig,
    trackPricingEvent,
    getRecommendedPlan,
  };
} 