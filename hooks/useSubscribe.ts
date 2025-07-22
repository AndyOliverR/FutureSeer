import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './use-auth';
import { trackEvent } from '@/lib/api';

interface PayPalConfig {
  clientId: string | null;
  available: boolean;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  originalPrice?: number;
  savings?: number;
  features: string[];
  isPopular?: boolean;
  isBestValue?: boolean;
}

export function useSubscribe() {
  const { user, userProfile } = useAuth();
  const [paypalConfig, setPaypalConfig] = useState<PayPalConfig>({ clientId: null, available: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [customTipAmount, setCustomTipAmount] = useState<number>(0);

  const plans: SubscriptionPlan[] = [
    {
      id: "monthly",
      name: "Monthly",
      price: 9,
      period: "month",
      features: [
        "✨ Unlimited AI readings",
        "🔮 All 18 divination tools",
        "📱 Mobile app access",
        "💫 Daily cosmic insights"
      ]
    },
    {
      id: "quarterly",
      name: "Quarterly",
      price: 21,
      period: "3 months",
      originalPrice: 27,
      savings: 6,
      isPopular: true,
      features: [
        "✨ Unlimited AI readings",
        "🔮 All 18 divination tools",
        "📱 Mobile app access",
        "💫 Daily cosmic insights",
        "🎯 Priority support"
      ]
    },
    {
      id: "yearly",
      name: "Yearly",
      price: 72,
      period: "year",
      originalPrice: 108,
      savings: 36,
      isBestValue: true,
      features: [
        "✨ Unlimited AI readings",
        "🔮 All 18 divination tools",
        "📱 Mobile app access",
        "💫 Daily cosmic insights",
        "🎯 Priority support",
        "🌟 Exclusive content"
      ]
    }
  ];

  const features = [
    { icon: "🔮", title: "AI Oracle", desc: "Advanced AI-powered predictions and insights" },
    { icon: "⭐", title: "18 Tools", desc: "Complete suite of divination methods" },
    { icon: "📱", title: "Mobile Ready", desc: "Seamless experience across all devices" },
    { icon: "💫", title: "Daily Insights", desc: "Personalized cosmic guidance every day" },
    { icon: "🎯", title: "Accurate Readings", desc: "Precision-tuned algorithms for accuracy" },
    { icon: "🌟", title: "Premium Support", desc: "Priority assistance from our team" },
  ];

  const tipAmounts = [5, 10, 25];

  const fetchPayPalConfig = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/paypal-config");
      if (!response.ok) throw new Error('Failed to fetch PayPal config');
      const config = await response.json();
      setPaypalConfig(config);
    } catch (err) {
      console.error("Error fetching PayPal config:", err);
      setError('Failed to load payment options');
      setPaypalConfig({ clientId: null, available: false });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayPalConfig();
  }, [fetchPayPalConfig]);

  const handleSubscriptionClick = useCallback((planId: string) => {
    if (!user?.uid) return;
    
    setSelectedPlan(planId);
    trackEvent("subscription_click", { plan: planId, userId: user.uid });
    
    // Here you would typically redirect to payment flow
    console.log(`Starting subscription flow for plan: ${planId}`);
  }, [user]);

  const handleTipClick = useCallback((amount: number) => {
    if (!user?.uid) return;
    
    trackEvent("tip_click", { amount, userId: user.uid });
    
    // Here you would typically redirect to payment flow
    console.log(`Starting tip flow for amount: $${amount}`);
  }, [user]);

  const handleCustomTip = useCallback(() => {
    if (!user?.uid || customTipAmount <= 0) return;
    
    handleTipClick(customTipAmount);
  }, [user, customTipAmount, handleTipClick]);

  const getPlanById = useCallback((planId: string) => {
    return plans.find(plan => plan.id === planId);
  }, [plans]);

  const formatPrice = useCallback((price: number) => {
    return `$${price}`;
  }, []);

  const calculateSavings = useCallback((originalPrice: number, currentPrice: number) => {
    return originalPrice - currentPrice;
  }, []);

  const getSavingsPercentage = useCallback((originalPrice: number, currentPrice: number) => {
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  }, []);

  return {
    // State
    paypalConfig,
    loading,
    error,
    selectedPlan,
    customTipAmount,
    
    // Data
    plans,
    features,
    tipAmounts,
    userProfile,
    
    // Actions
    setSelectedPlan,
    setCustomTipAmount,
    handleSubscriptionClick,
    handleTipClick,
    handleCustomTip,
    fetchPayPalConfig,
    
    // Utilities
    getPlanById,
    formatPrice,
    calculateSavings,
    getSavingsPercentage,
  };
} 