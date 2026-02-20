"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { Shield, Clock } from 'lucide-react'
import { InnovationInvitation } from '@/components/InnovationInvitation'
import { ContributionTiers } from '@/components/ContributionTiers'
import { PowerUserBenefits } from '@/components/PowerUserBenefits'
import { AttributionLeaderboard } from '@/components/AttributionLeaderboard'
import { FeedbackImprovement } from '@/components/FeedbackImprovement'
import { ContextualHelp } from '@/components/ContextualHelp'
import { TipJarCard } from '@/components/TipJarCard'
export default function PricingPage() {
  const { userProfile } = useAuth()
  const [isMounted, setIsMounted] = useState(false)
  const { toast } = useToast()

  // Use country from user profile or default to India (no UI selector)
  const selectedCountry = userProfile?.country || 'IN'

  useEffect(() => {
    setIsMounted(true)
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
      <Link href="/" className="futureseer-logo text-2xl font-semibold tracking-wide hover:scale-105 transition-transform text-amber-400 absolute top-4 left-4 z-50">
        FutureSeer
      </Link>
      
      <div className="max-w-7xl mx-auto pt-8" data-onboarding="pricing">
        {/* Innovation Invitation Hero */}
        <div className="relative">
          <InnovationInvitation />
          <div className="absolute top-4 right-4">
            <ContextualHelp
              title="Understanding Contributions"
              content="Your contribution supports the innovation experiment. 'Buy Me a Coffee' is monthly, 'Treat Me' is quarterly, and 'Buy a Festive Hamper' is annual. You're not buying a subscription - you're supporting innovation that makes FutureSeer accessible to all."
              placement="left"
            />
          </div>
        </div>

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
            🔒 Secure contributions • Join the experiment • Cancel anytime
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