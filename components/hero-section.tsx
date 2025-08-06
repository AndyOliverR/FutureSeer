"use client";
import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"

export function HeroSection() {
  const router = useRouter()
  const { user, userProfile, loading } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  function handleBeginJourney() {
    if (loading) return; // Wait for auth to load
    
    if (!user) {
      // Not signed in - go to sign in page
      router.push("/signin");
    } else if (!userProfile?.birthDate || !userProfile?.birthTime || !userProfile?.birthPlace) {
      // Signed in but profile incomplete - go to profile setup
      router.push("/profile-setup");
    } else {
      // Signed in and profile complete - go to dashboard
      router.push("/dashboard");
    }
  }

  // Prevent hydration mismatch by not rendering button content until mounted
  const buttonText = mounted && loading ? "Loading..." : "Begin Your Journey"

  return (
    <section className="flex flex-col items-center justify-start min-h-screen px-6 text-center pt-20">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Main Headline */}
        <h1 className="text-6xl md:text-8xl font-serif text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-yellow-400 to-amber-600 leading-tight tracking-wide">
          Ask the Seer
        </h1>
        
        {/* J.P. Morgan Quote */}
        <div className="group relative p-4 rounded-2xl max-w-2xl mx-auto mb-4 mt-2">
          {/* Gold glow background (hover only) */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl pointer-events-none" />
          <div className="relative z-10">
            <p className="text-lg md:text-xl italic text-amber-300 font-serif mb-1 text-center">
              "Millionaires don't use astrology, billionaires do."
            </p>
            <p className="text-soft/70 text-sm text-right text-amber-200 pr-2">— J.P. Morgan</p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8">
          <Button
            size="lg"
            className="group relative px-8 py-4 bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-slate-900 font-semibold text-lg border-0 shadow-lg shadow-amber-500/25 transition-all duration-300 hover:shadow-amber-400/40 hover:scale-105 rounded-2xl"
            onClick={handleBeginJourney}
            disabled={loading}
          >
            <span className="relative z-10">
              {buttonText}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-yellow-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
          </Button>
        </div>
        {/* Subheading moved below CTA */}
        <p className="text-white text-center text-sm md:text-base font-light drop-shadow-lg font-serif max-w-full mx-auto mt-8">
          Where ancient wisdom meets artificial intelligence. Unlock the mysteries of your path through personalized divination.
        </p>
      </div>
    </section>
  )
} 