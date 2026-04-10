"use client";

import { Coffee, Gift, Sparkles, Check } from 'lucide-react';
import { TipJarCard } from '@/components/TipJarCard';
import { AboutSection } from './AboutSection';
import { motion } from 'framer-motion';
import { getAttractivePrice, getMembershipPricingComparison } from '@/lib/pricingConfig';

interface AboutPricingProps {
  countryCode?: string;
}

export function AboutPricing({ countryCode = 'IN' }: AboutPricingProps) {
  const m = getAttractivePrice('allFeatures', countryCode);
  const q = getAttractivePrice('quarterly', countryCode);
  const a = getAttractivePrice('annual', countryCode);
  const cmp = getMembershipPricingComparison(countryCode);

  const pricingOptions = [
    {
      id: 'coffee',
      name: 'Coffee',
      icon: Coffee,
      price: `${m.formatted}/month`,
      description: 'Monthly membership',
      features: [
        'All 60+ divination tools',
        'Unlimited AI readings',
        'Cancel anytime',
      ],
    },
    {
      id: 'treat',
      name: 'Treat',
      icon: Gift,
      price: `${q.formatted}/quarter`,
      description: 'Quarterly membership',
      features: [
        'All Coffee benefits',
        `Save ${cmp.quarterlySavingsPercentVsMonthly}% vs 3× monthly`,
        'Billed every 3 months',
      ],
    },
    {
      id: 'hamper',
      name: 'Hamper',
      icon: Sparkles,
      price: `${a.formatted}/year`,
      description: 'Annual membership',
      features: [
        'All Treat benefits',
        `Save ${cmp.annualSavingsPercentVsMonthly}% vs 12× monthly`,
        'Best long-term value',
      ],
    },
  ];
  return (
    <AboutSection 
      title="Pricing & Support"
      subtitle="First month free for everyone. Choose your plan."
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Promo Card - High Visibility */}
        <motion.div
          className="p-8 rounded-[32px] glass-effect border-amber-500/40 text-center shadow-[0_0_30px_rgba(251,191,36,0.1)]"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-4">
            <Sparkles className="w-8 h-8 text-amber-400" />
          </div>
          <h3 className="text-3xl font-heading font-bold gold-glow mb-2 uppercase tracking-widest">First Month FREE</h3>
          <p className="text-surface-on text-sm font-medium uppercase tracking-widest">Unrestricted Access to All Tools</p>
        </motion.div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pricingOptions.map((option, index) => {
            const Icon = option.icon;
            return (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-8 rounded-[32px] glass-effect hover:border-amber-500/40 transition-all flex flex-col items-center text-center shadow-xl group"
              >
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-6 transition-transform">
                  <Icon className="w-8 h-8 text-amber-400" />
                </div>
                <h3 className="text-2xl font-heading font-bold text-white mb-1 uppercase tracking-tight">{option.name}</h3>
                <p className="text-amber-400 text-xl font-bold mb-1">{option.price}</p>
                <p className="text-white/50 text-[10px] mb-8 font-bold uppercase tracking-[0.2em]">{option.description}</p>
                <ul className="space-y-4 text-left w-full">
                  {option.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-white/80 font-normal">
                      <Check className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>

        {/* Tip Jar Section */}
        <div className="pt-12">
          <h3 className="text-2xl font-heading font-bold gold-glow text-center mb-8 uppercase tracking-widest">Show Your Appreciation</h3>
          <div className="max-w-md mx-auto">
            <TipJarCard countryCode={countryCode} />
          </div>
        </div>
      </div>
    </AboutSection>
  );
}
