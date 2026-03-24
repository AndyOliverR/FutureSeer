"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { Shield, Clock } from 'lucide-react'
import { InnovationInvitation } from '@/components/InnovationInvitation'
import { ContributionTiers } from '@/components/ContributionTiers'
import { PowerUserBenefits } from '@/components/PowerUserBenefits'
import { AttributionLeaderboard } from '@/components/AttributionLeaderboard'
import { FeedbackImprovement } from '@/components/FeedbackImprovement'
import { ContextualHelp } from '@/components/ContextualHelp'
import { TipJarCard } from '@/components/TipJarCard'
import { PricingReflectionPrompts } from '@/components/PricingReflectionPrompts'
export default function PricingPage() {
  const { userProfile } = useAuth()
  const [isMounted, setIsMounted] = useState(false)
  // Use country from user profile or default to India (no UI selector)
  const selectedCountry = userProfile?.country || 'IN'

  useEffect(() => {
    const id = requestAnimationFrame(() => setIsMounted(true))
    return () => cancelAnimationFrame(id)
  }, [])

  const handleContribute = (tierId: string) => {
    // Redirect to signup with plan pre-selected
    // ContributionTiers already sends correct IDs: 'power-user-trial', 'buy-coffee', 'treat-me', 'festive-hamper'
    // These match SignupFlow's expected plan IDs, so pass directly
    window.location.href = `/signup?plan=${tierId}`;
  }

  if (!isMounted) return null

  return (
    <div className="starfield-ultra-sharp min-h-screen py-12 px-3 sm:px-4 md:px-6 overflow-hidden relative">
      {/* Logo - Top Left */}
      <Link href="/" className="futureseer-logo text-2xl font-semibold tracking-wide transition-transform text-amber-400 absolute top-4 left-4 z-50">
        FutureSeer
      </Link>
      
      <div className="max-w-7xl mx-auto pt-8" data-onboarding="pricing">
        {/* Innovation Invitation Hero */}
        <div className="relative">
          <InnovationInvitation />
          <div className="absolute top-4 right-4">
            <ContextualHelp
              title="Understanding memberships"
              content="Coffee, Treat, and Hamper are membership tiers with recurring billing (monthly, quarterly, or annual). Your membership supports the innovation experiment and unlocks full access to tools and AI features. Cancel anytime; see Terms and Refund Policy."
              placement="left"
            />
          </div>
        </div>

        <PricingReflectionPrompts />

        {/* Contribution Tiers */}
        <div className="space-y-8">
          <ContributionTiers 
            selectedCountry={selectedCountry}
            onContribute={handleContribute}
          />
          
          {/* Tip Jar Section */}
          <div className="text-center mb-8">
            <h3 className="text-2xl font-serif text-amber-400 mb-3">Or Show Your Appreciation</h3>
            <p className="text-white/80 mb-6">One-time contribution, any amount</p>
            <div className="max-w-md mx-auto">
              <TipJarCard countryCode={selectedCountry} />
            </div>
          </div>
        </div>

        {/* Power User Benefits */}
        <PowerUserBenefits />

        {/* Attribution Leaderboard Preview */}
        <AttributionLeaderboard />

        {/* Feedback Improvement Section */}
        <div className="mb-16">
          <FeedbackImprovement variant="section" />
        </div>

        {/* Additional Info */}
        <div className="text-center text-white/80 space-y-4">
          <p className="text-sm">
            Secure membership billing • Join the experiment • Cancel anytime
          </p>
          <div className="flex justify-center items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-400" />
              <span>100% secure</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>24/7 support</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 