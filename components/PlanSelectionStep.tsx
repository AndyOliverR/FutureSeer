"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Coffee, Gift, Sparkles, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getAttractivePrice, getCountryPricingConfig } from '@/lib/pricingConfig';

interface PlanSelectionStepProps {
  selectedCountry: string;
  initialPlan?: 'power-user-trial' | 'buy-coffee' | 'treat-me' | 'festive-hamper';
  onPlanSelected: (planId: 'power-user-trial' | 'buy-coffee' | 'treat-me' | 'festive-hamper') => void;
}

interface ContributionTier {
  id: 'power-user-trial' | 'buy-coffee' | 'treat-me' | 'festive-hamper';
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  borderColor: string;
  features: string[];
  contributionType: 'trial' | 'monthly' | 'quarterly' | 'annual';
  pricingTier?: 'limited' | 'allFeatures' | 'annual';
  popular?: boolean;
  badge?: string;
  badgeColor?: string;
}

export function PlanSelectionStep({
  selectedCountry,
  initialPlan,
  onPlanSelected,
}: PlanSelectionStepProps) {
  const [selectedPlan, setSelectedPlan] = useState<
    'power-user-trial' | 'buy-coffee' | 'treat-me' | 'festive-hamper'
  >(initialPlan || 'power-user-trial');

  const config = getCountryPricingConfig(selectedCountry);

  const getPriceInfo = (tier: ContributionTier) => {
    if (tier.contributionType === 'trial') {
      return { price: 0, currency: config.currency, formatted: 'Free', currencySymbol: config.currencySymbol };
    }

    if (!tier.pricingTier) return null;

    const basePricing = getAttractivePrice(tier.pricingTier, selectedCountry);

    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: basePricing.currency,
      minimumFractionDigits: config.currency === 'INR' || config.currency === 'PKR' || config.currency === 'BDT' ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(basePricing.price);

    return {
      price: basePricing.price,
      currency: basePricing.currency,
      currencySymbol: basePricing.currencySymbol,
      formatted: formatted,
    };
  };

  const contributionTiers: ContributionTier[] = [
    {
      id: 'power-user-trial',
      name: 'Power User Trial',
      description: 'Start Your Journey - 30 Days Free',
      icon: <Sparkles className="w-6 h-6" />,
      color: 'bg-green-500',
      borderColor: 'border-green-500',
      contributionType: 'trial',
      features: [
        'Full access to all tools',
        'Your usage helps improve accuracy',
        'Early adopter status',
        'Attribution on leaderboard',
        'Part of the innovation team',
      ],
      badge: 'Free Trial',
      badgeColor: 'bg-green-500',
    },
    {
      id: 'buy-coffee',
      name: 'Coffee',
      description: 'Keep the innovation going',
      icon: <Coffee className="w-6 h-6" />,
      color: 'bg-amber-500',
      borderColor: 'border-amber-500',
      contributionType: 'monthly',
      pricingTier: 'allFeatures',
      popular: true,
      features: [
        'Your monthly contribution makes FutureSeer accessible',
        'Recurring monthly support',
        'All 60+ divination tools',
        'Unlimited AI readings',
        'Priority AI responses',
        'Community participation',
        'Forever on leaderboard',
      ],
      badge: 'Monthly',
      badgeColor: 'bg-amber-500',
    },
    {
      id: 'treat-me',
      name: 'Treat',
      description: 'Support the innovation for 3 months',
      icon: <Gift className="w-6 h-6" />,
      color: 'bg-purple-500',
      borderColor: 'border-purple-500',
      contributionType: 'quarterly',
      pricingTier: 'quarterly',
      features: [
        'Quarterly contribution',
        'Better value, same mission',
        'All monthly benefits',
        '3 months of innovation support',
        'Early access to new features',
        'Priority support',
      ],
      badge: 'Quarterly',
      badgeColor: 'bg-purple-500',
    },
    {
      id: 'festive-hamper',
      name: 'Hamper',
      description: 'Celebrate with us for a full year',
      icon: <Sparkles className="w-6 h-6" />,
      color: 'bg-blue-600',
      borderColor: 'border-blue-600',
      contributionType: 'annual',
      pricingTier: 'annual',
      features: [
        'Annual contribution',
        'Best value, maximum impact',
        'All quarterly benefits',
        '12 months of innovation support',
        'Family account options',
        'VIP community access',
        'Influence on product roadmap',
      ],
      badge: 'Best Value',
      badgeColor: 'bg-blue-600',
    },
  ];

  const handlePlanSelect = (planId: 'power-user-trial' | 'buy-coffee' | 'treat-me' | 'festive-hamper') => {
    setSelectedPlan(planId);
    onPlanSelected(planId);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Choose How You'd Like to Support the Innovation</h2>
        <p className="text-slate-300 font-serif">
          Select your contribution tier. All plans include a 30-day free trial.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {contributionTiers.map((tier) => {
          const priceInfo = getPriceInfo(tier);
          const isTrial = tier.contributionType === 'trial';
          const isSelected = selectedPlan === tier.id;

          return (
            <motion.div
              key={tier.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                onClick={() => handlePlanSelect(tier.id)}
                className={`relative overflow-hidden transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? 'ring-2 ring-amber-500 shadow-2xl shadow-amber-500/20'
                    : tier.popular
                    ? 'ring-2 ring-amber-500/50 shadow-xl shadow-amber-500/10'
                    : 'hover:shadow-xl hover:shadow-slate-700/20'
                } bg-gradient-to-br from-[#0a1128] via-[#0d1b35] to-[#0a1128] border ${
                  isSelected ? 'border-amber-500' : 'border-amber-500/30'
                } backdrop-blur-xl`}
              >
                {tier.badge && (
                  <div className={`absolute top-4 right-4 ${tier.badgeColor} text-white px-3 py-1 rounded-full text-xs font-semibold z-10`}>
                    {tier.badge}
                  </div>
                )}

                {isSelected && (
                  <div className="absolute top-4 left-4 z-10">
                    <div className="bg-amber-500 rounded-full p-1">
                      <Check className="w-4 h-4 text-slate-900" />
                    </div>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${tier.color} text-white mb-4`}>
                    {tier.icon}
                  </div>
                  <CardTitle className="text-xl font-bold text-white mb-2">{tier.name}</CardTitle>
                  <p className="text-white/70 text-sm">{tier.description}</p>
                </CardHeader>

                <CardContent className="text-center">
                  {/* Pricing/Contribution */}
                  <div className="mb-6">
                    {isTrial ? (
                      <div className="text-3xl font-bold text-green-400">Free</div>
                    ) : priceInfo ? (
                      <div>
                        <div className="text-3xl font-bold text-amber-400">
                          {priceInfo.formatted}
                          {tier.contributionType === 'annual'
                            ? '/year'
                            : tier.contributionType === 'quarterly'
                            ? '/quarter'
                            : '/month'}
                        </div>
                        <p className="text-white/60 text-xs mt-2">
                          {tier.contributionType === 'monthly' && 'Your monthly contribution'}
                          {tier.contributionType === 'quarterly' && 'Your quarterly contribution'}
                          {tier.contributionType === 'annual' && 'Your annual contribution'}
                        </p>
                      </div>
                    ) : null}
                  </div>

                  {/* Features */}
                  <ul className="space-y-2 mb-6 text-left">
                    {tier.features.slice(0, 4).map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-xs text-white/80">
                        <Check className="w-3 h-3 text-amber-400 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
