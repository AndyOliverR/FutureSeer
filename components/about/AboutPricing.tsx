"use client";

import { Coffee, Gift, Sparkles, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { TipJarCard } from '@/components/TipJarCard';
import { AboutSection } from './AboutSection';

interface AboutPricingProps {
  countryCode?: string;
}

const pricingOptions = [
  {
    id: 'coffee',
    name: 'Coffee',
    icon: Coffee,
    price: '₹99/month',
    description: 'Monthly support',
    features: [
      'All 60+ divination tools',
      'Unlimited AI readings',
      'Cancel anytime'
    ]
  },
  {
    id: 'treat',
    name: 'Treat',
    icon: Gift,
    price: '₹199/quarter',
    description: 'Better value',
    features: [
      'All Coffee benefits',
      'Save 33%',
      'Quarterly billing'
    ]
  },
  {
    id: 'hamper',
    name: 'Hamper',
    icon: Sparkles,
    price: '₹999/year',
    description: 'Best value',
    features: [
      'All Treat benefits',
      'Save 17%',
      'VIP perks'
    ]
  }
];

export function AboutPricing({ countryCode = 'IN' }: AboutPricingProps) {
  return (
    <AboutSection 
      title="Pricing & Support Options" 
      subtitle="First month free for everyone. Choose your plan."
    >
      {/* Signup Flow Explanation */}
      <div className="mb-12 p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 rounded-2xl text-center max-w-4xl mx-auto transition-all duration-300 hover:scale-105">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/30 mb-4">
          <Sparkles className="w-8 h-8 text-amber-400" />
        </div>
        <h3 className="text-2xl font-bold text-amber-400 mb-4">First Month FREE</h3>
        <p className="text-white/60 text-sm mb-4 font-light">All Features Included</p>
        <div className="text-white/80 font-light">
          <p className="mb-2">↓</p>
          <p className="text-sm text-amber-400">Choose Your Plan:</p>
          <div className="flex justify-center gap-4 mt-4 flex-wrap">
            <span className="px-4 py-2 bg-amber-500/20 border border-amber-500/30 rounded-lg text-sm text-amber-400">Coffee (₹99/month)</span>
            <span className="px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-lg text-sm text-amber-400">Treat (₹199/quarter)</span>
            <span className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-sm text-amber-400">Hamper (₹999/year)</span>
          </div>
        </div>
      </div>

      {/* Recurring Contributions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-7xl mx-auto">
        {pricingOptions.map((option) => {
          const Icon = option.icon;
          return (
            <Card 
              key={option.id}
              className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300 hover:scale-105"
            >
              <CardContent className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-500/20 border border-amber-500/30 mb-4">
                  <Icon className="w-7 h-7 text-amber-400" />
                </div>
                <h3 className="text-2xl font-bold text-amber-400 mb-2">{option.name}</h3>
                <p className="text-amber-400 text-xl font-semibold mb-2">{option.price}</p>
                <p className="text-white/60 text-sm mb-4 font-light">{option.description}</p>
                <ul className="space-y-2 text-left text-sm text-white/80">
                  {option.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 font-light">
                      <Check className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tip Jar Section */}
      <div className="mb-12 max-w-7xl mx-auto">
        <h3 className="text-2xl font-serif text-amber-400 text-center mb-6 font-light">Show Your Appreciation</h3>
        <div className="max-w-md mx-auto">
          <TipJarCard countryCode={countryCode} />
        </div>
      </div>
    </AboutSection>
  );
}
