"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { ContributionTiers } from '@/components/ContributionTiers'
import { TipJarCard } from '@/components/TipJarCard'

export function PricingPageClient() {
  const { userProfile } = useAuth()
  const [isMounted, setIsMounted] = useState(false)
  const selectedCountry = userProfile?.country || 'IN'

  useEffect(() => {
    const id = requestAnimationFrame(() => setIsMounted(true))
    return () => cancelAnimationFrame(id)
  }, [])

  const handleContribute = (tierId: string) => {
    window.location.href = `/signup?plan=${tierId}`;
  }

  if (!isMounted) {
    return (
      <div className="min-h-[12rem] rounded-2xl border border-white/10 bg-slate-900/40 p-6 text-center text-white/60 text-sm">
        Loading membership options for your region…
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <ContributionTiers
        selectedCountry={selectedCountry}
        onContribute={handleContribute}
      />
      <div className="text-center mb-8">
        <h3 className="text-2xl font-serif text-amber-400 mb-3">Tip Jar</h3>
        <div className="max-w-md mx-auto">
          <TipJarCard countryCode={selectedCountry} />
        </div>
      </div>
    </div>
  )
}
