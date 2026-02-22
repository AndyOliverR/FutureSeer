"use client";

import { Coffee, Gift, Sparkles, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { TipJarCard } from '@/components/TipJarCard';
import { AboutSection } from './AboutSection';
import { motion } from 'framer-motion';

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
      title="Pricing & Support"
      subtitle="First month free for everyone. Choose your plan."
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Promo Card */}
        <motion.div
          className="p-6 sm:p-8 bg-primary-container rounded-[32px] border border-primary/20 text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 mb-4">
            <Sparkles className="w-8 h-8 text-on-primary-container" />
          </div>
          <h3 className="text-2xl font-heading font-bold text-on-primary-container mb-2">First Month FREE</h3>
          <p className="text-on-primary-container/80 text-sm font-medium uppercase tracking-widest">Experience the Full Potential</p>
        </motion.div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {pricingOptions.map((option, index) => {
            const Icon = option.icon;
            return (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-3xl bg-surface-container border border-outline-variant hover:border-amber-500/30 transition-all flex flex-col items-center text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-4">
                  <Icon className="w-7 h-7 text-amber-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-1">{option.name}</h3>
                <p className="text-amber-400 text-lg font-bold mb-1">{option.price}</p>
                <p className="text-surface-on-variant text-xs mb-6 font-medium uppercase tracking-wider">{option.description}</p>
                <ul className="space-y-3 text-left w-full">
                  {option.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-surface-on font-normal">
                      <Check className="w-4 h-4 text-green-400 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>

        {/* Tip Jar Section */}
        <div className="pt-8">
          <h3 className="text-xl font-heading font-bold text-amber-400 text-center mb-6 uppercase tracking-tight">Show Your Appreciation</h3>
          <div className="max-w-md mx-auto">
            <TipJarCard countryCode={countryCode} />
          </div>
        </div>
      </div>
    </AboutSection>
  );
}
