"use client";

import { Info } from 'lucide-react';

interface CompetitivePricingMessagingProps {
  countryCode: string;
}

export function CompetitivePricingMessaging({ countryCode }: CompetitivePricingMessagingProps) {
  return (
    <div className="attractive-pricing-messaging bg-slate-900/30 border border-slate-700/50 rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
      <div className="flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-400/70 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="text-xl sm:text-2xl font-serif text-white mb-2 font-normal">
            Innovation Experiment Phase
          </h3>
          <p className="text-sm sm:text-base text-white/70 font-light leading-relaxed">
            We're in the early stages of this innovation experiment. As we scale and learn from power users like you, 
            contribution levels may evolve to ensure the innovation remains accessible to all while improving accuracy and quality.
          </p>
        </div>
      </div>
    </div>
  );
}
