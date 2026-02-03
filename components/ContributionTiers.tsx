"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coffee, Gift, Sparkles, Check } from "lucide-react";
import { getAttractivePrice, getCountryPricingConfig } from "@/lib/pricingConfig";
import { useToast } from "@/components/ui/use-toast";

interface ContributionTier {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  visualIcon: React.ReactNode;
  color: string;
  borderColor: string;
  features: string[];
  contributionType: 'trial' | 'monthly' | 'quarterly' | 'annual';
  pricingTier?: 'limited' | 'allFeatures' | 'annual';
  popular?: boolean;
  badge?: string;
  badgeColor?: string;
}

interface ContributionTiersProps {
  selectedCountry: string;
  onContribute: (tierId: string) => void;
}

export function ContributionTiers({ selectedCountry, onContribute }: ContributionTiersProps) {
  const { toast } = useToast();

  const getPriceInfo = (tier: ContributionTier) => {
    if (tier.contributionType === 'trial') {
      return { price: 0, currency: 'INR', formatted: 'Free', currencySymbol: '₹' };
    }
    
    if (!tier.pricingTier) return null;
    
    const basePricing = getAttractivePrice(tier.pricingTier, selectedCountry);
    
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: basePricing.currency,
      minimumFractionDigits: basePricing.currency === 'INR' || basePricing.currency === 'PKR' || basePricing.currency === 'BDT' ? 0 : 2,
      maximumFractionDigits: 2
    }).format(basePricing.price);
    
    return {
      price: basePricing.price,
      currency: basePricing.currency,
      currencySymbol: basePricing.currencySymbol,
      formatted: formatted
    };
  };

  const contributionTiers: ContributionTier[] = [
    {
      id: 'power-user-trial',
      name: 'Power User Trial',
      description: 'Start Your Journey - 30 Days Free',
      icon: <Sparkles className="w-6 h-6" />,
      visualIcon: <Sparkles className="w-12 h-12" />,
      color: 'bg-green-500',
      borderColor: 'border-green-500',
      contributionType: 'trial',
      features: [
        'Full access to all tools',
        'Your usage helps improve accuracy',
        'Early adopter status',
        'Attribution on leaderboard',
        'Part of the innovation team'
      ],
      badge: 'Free Trial',
      badgeColor: 'bg-green-500'
    },
    {
      id: 'buy-coffee',
      name: 'Coffee',
      description: 'Keep the innovation going',
      icon: <Coffee className="w-6 h-6" />,
      visualIcon: <Coffee className="w-12 h-12" />,
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
        'Forever on leaderboard'
      ],
      badge: 'Monthly',
      badgeColor: 'bg-amber-500'
    },
    {
      id: 'treat-me',
      name: 'Treat',
      description: 'Support the innovation for 3 months',
      icon: <Gift className="w-6 h-6" />,
      visualIcon: <Gift className="w-12 h-12" />,
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
        'Priority support'
      ],
      badge: 'Quarterly',
      badgeColor: 'bg-purple-500'
    },
    {
      id: 'festive-hamper',
      name: 'Hamper',
      description: 'Celebrate with us for a full year',
      icon: <Sparkles className="w-6 h-6" />,
      visualIcon: <Sparkles className="w-12 h-12" />,
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
        'Influence on product roadmap'
      ],
      badge: 'Best Value',
      badgeColor: 'bg-blue-600'
    }
  ];

  const handleContribute = (tier: ContributionTier) => {
    // Always redirect to signup with plan selection
    onContribute(tier.id);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
      {contributionTiers.map((tier) => {
        const priceInfo = getPriceInfo(tier);
        const isTrial = tier.contributionType === 'trial';

        return (
          <Card
            key={tier.id}
            className={`relative overflow-hidden transition-all duration-300 hover:scale-105 ${
              tier.popular
                ? 'ring-2 ring-amber-500 shadow-2xl shadow-amber-500/20'
                : 'hover:shadow-xl hover:shadow-slate-700/20'
            } bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50`}
          >
            {tier.badge && (
              <div className={`absolute top-4 right-4 ${tier.badgeColor} text-white px-3 py-1 rounded-full text-xs font-semibold z-10`}>
                {tier.badge}
              </div>
            )}

            <CardHeader className="text-center pb-4">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${tier.color} text-white mb-4`}>
                {tier.visualIcon}
              </div>
              <CardTitle className="text-2xl font-bold text-amber-400 mb-2">
                {tier.name}
              </CardTitle>
              <p className="text-white/80 text-sm">
                {tier.description}
              </p>
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
                      {tier.contributionType === 'annual' ? '/year' : tier.contributionType === 'quarterly' ? '/quarter' : '/month'}
                    </div>
                    <p className="text-white/80 text-xs mt-2">
                      {tier.contributionType === 'monthly' && 'Your monthly contribution'}
                      {tier.contributionType === 'quarterly' && 'Your quarterly contribution'}
                      {tier.contributionType === 'annual' && 'Your annual contribution'}
                    </p>
                  </div>
                ) : null}
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8 text-left">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm text-white/80">
                    <Check className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Button
                onClick={() => handleContribute(tier)}
                className={`w-full ${
                  tier.popular
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-gray-900'
                    : isTrial
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 text-white'
                } font-semibold py-3 transition-all duration-300`}
              >
                {isTrial ? 'Join the Experiment' : tier.name}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
