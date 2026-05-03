"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { ContributionTiers } from '@/components/ContributionTiers'
import { TipJarCard } from '@/components/TipJarCard'
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
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-3">
            <span className="text-amber-400">FutureSeer</span>
            <span> membership plans</span>
          </h1>
          <p className="text-white/80 text-sm md:text-base max-w-2xl mx-auto">
            Start with a 30-day trial, then choose monthly, quarterly, or annual membership.
          </p>
          <p className="text-white/70 text-xs md:text-sm max-w-2xl mx-auto mt-3 leading-relaxed">
            You are not buying another horoscope feed—you are backing the full generate-once library plus Ask the Seer,
            which reasons across every stored report in your account.
          </p>
        </div>

        {/* Contribution Tiers */}
        <div className="space-y-8">
          <ContributionTiers 
            selectedCountry={selectedCountry}
            onContribute={handleContribute}
          />
          
          {/* Tip Jar Section */}
          <div className="text-center mb-8">
            <h3 className="text-2xl font-serif text-amber-400 mb-3">Tip Jar</h3>
            <div className="max-w-md mx-auto">
              <TipJarCard countryCode={selectedCountry} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 