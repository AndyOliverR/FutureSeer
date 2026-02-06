"use client";

import React, { useState } from 'react';
import { getAttractivePrice, getReferralPrice, getCountryPricingConfig } from '@/lib/pricingConfig';
import { Button } from '@/components/ui/button';
import { Share2, Gift } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { ShareAppModal } from '@/components/ShareAppModal';

interface ReferralBenefitsSectionProps {
  countryCode: string;
}

export function ReferralBenefitsSection({ countryCode }: ReferralBenefitsSectionProps) {
  const { user } = useAuth();
  const [showShareModal, setShowShareModal] = useState(false);

  const config = getCountryPricingConfig(countryCode);
  const limitedPricing = getAttractivePrice('limited', countryCode);
  const allFeaturesPricing = getAttractivePrice('allFeatures', countryCode);
  const annualPricing = getAttractivePrice('annual', countryCode);
  
  const limitedReferral = getReferralPrice('limited', countryCode);
  const allFeaturesReferral = getReferralPrice('allFeatures', countryCode);
  const annualReferral = getReferralPrice('annual', countryCode);
  
  return (
    <section className="referral-benefits bg-gradient-to-br from-[#0a1128] via-[#0d1b35] to-[#0a1128] border border-amber-500/20 rounded-2xl p-6 sm:p-8 backdrop-blur-xl">
      <div className="flex items-center gap-3 mb-4">
        <Gift className="w-6 h-6 text-amber-400" />
        <h3 className="text-2xl sm:text-3xl font-serif text-white font-normal">
          Share with Friends, Everyone Benefits
        </h3>
      </div>
      <p className="text-base sm:text-lg text-white/90 leading-relaxed font-light mb-6">
        Share your referral code with friends and help them get started at special prices.
      </p>
      
      <div className="referral-pricing-grid grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="referral-tier bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
          <h4 className="text-white font-semibold mb-3">Limited Plan (4 tools)</h4>
          <div className="pricing space-y-2 mb-3">
            <div className="flex items-center justify-between">
              <span className="text-white/70 text-sm">Regular:</span>
              <span className="text-white/50 text-sm line-through">{limitedPricing.formatted}/month</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-amber-400 font-semibold">Friend pays:</span>
              <span className="text-amber-400 font-bold text-lg">{limitedReferral.formatted}/month</span>
            </div>
          </div>
          <p className="text-xs text-white/70">Share code for same price - {limitedReferral.formatted}/month</p>
        </div>
        
        <div className="referral-tier bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
          <h4 className="text-white font-semibold mb-3">All Features Plan</h4>
          <div className="pricing space-y-2 mb-3">
            <div className="flex items-center justify-between">
              <span className="text-white/70 text-sm">Regular:</span>
              <span className="text-white/50 text-sm line-through">{allFeaturesPricing.formatted}/month</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-amber-400 font-semibold">Friend pays:</span>
              <span className="text-amber-400 font-bold text-lg">{allFeaturesReferral.formatted}/month</span>
            </div>
          </div>
          <p className="text-xs text-white/70">
            Share code for {allFeaturesReferral.formatted}/month (discount from {allFeaturesPricing.formatted})
          </p>
        </div>
        
        <div className="referral-tier bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
          <h4 className="text-white font-semibold mb-3">Annual Plan (12 months)</h4>
          <div className="pricing space-y-2 mb-3">
            <div className="flex items-center justify-between">
              <span className="text-white/70 text-sm">Regular:</span>
              <span className="text-white/50 text-sm line-through">{annualPricing.formatted}/year</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-amber-400 font-semibold">Friend pays:</span>
              <span className="text-amber-400 font-bold text-lg">{annualReferral.formatted}</span>
            </div>
          </div>
          <p className="text-xs text-white/70">Share code for {annualReferral.formatted} first month discount</p>
        </div>
      </div>
      
      <div className="flex justify-center">
        <Button
          onClick={() => setShowShareModal(true)}
          className="bg-gradient-to-r from-amber-500 to-yellow-400 text-gray-900 hover:from-amber-400 hover:to-yellow-300 font-semibold px-6 py-3 rounded-xl flex items-center gap-2"
        >
          <Share2 className="w-5 h-5" />
          Get Your Referral Code & Share
        </Button>
      </div>
      <ShareAppModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} />
    </section>
  );
}
