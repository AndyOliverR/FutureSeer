"use client";
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { ArrowRight, LogIn, ChevronDown } from "lucide-react"
import { useAnalytics } from "@/lib/analytics"
import { ANALYTICS_EVENTS } from "@/lib/analytics"

export function HeroSection() {
  const router = useRouter()
  const { trackEvent } = useAnalytics()

  return (
    <section className="flex flex-col items-center justify-center min-h-[70vh] md:min-h-[80vh] px-4 sm:px-6 text-center pt-24 md:pt-32 lg:pt-40 pb-12 relative bg-transparent">
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 md:space-y-10 lg:space-y-12 opacity-100 translate-y-0">
        {/* Main Headline - Larger font size */}
        <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-serif text-[var(--m3-primary)] leading-tight tracking-wide font-light">
          Ask the Seer
        </h1>

        {/* J.P. Morgan Quote - golden glow */}
        <div className="group max-w-xl mx-auto pt-4 sm:pt-6">
          <div className="relative">
            <p className="m3-body-large md:m3-headline-small italic font-serif mb-2 text-center leading-relaxed relative z-10 font-light gold-glow">
              Millionaires don't use astrology, billionaires do.
            </p>
          </div>
          <p className="m3-label-medium md:m3-body-medium text-center font-normal text-[var(--m3-primary)] transition-all duration-300 group-hover:text-[var(--m3-on-primary-container)]">
            <span className="text-xs">—</span> J.P. Morgan
          </p>
        </div>

        {/* CTA Buttons with enhanced animations */}
        <div className="flex flex-col gap-3 sm:gap-4 justify-center items-center pt-6 sm:pt-8">
          {/* Primary CTA with graceful glow effect */}
          <Button
            size="lg"
            variant="filled"
            aria-label="Join the Innovation Experiment"
            className="group relative px-6 sm:px-8 py-3 sm:py-4 min-h-[44px] w-full sm:w-auto bg-gradient-to-r from-[var(--m3-primary)] to-[var(--m3-tertiary)] text-[var(--m3-on-primary)] font-normal m3-label-large border-0 rounded-2xl touch-manipulation overflow-hidden transition-all duration-500 m3-transition-emphasized hover:scale-[1.02] active:scale-[0.98] hover:shadow-[0_0_30px_rgba(245,158,11,0.6),0_0_60px_rgba(245,158,11,0.4)] focus-visible:outline-2 focus-visible:outline-[var(--m3-primary)] focus-visible:outline-offset-2 m3-gpu-accelerated"
            onClick={() => {
              trackEvent(ANALYTICS_EVENTS.HERO_CTA_CLICKED, {
                cta_type: "join_experiment",
              })
              router.push("/signup")
            }}
          >
            {/* Graceful glow effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--m3-primary)] via-[var(--m3-tertiary)] to-[var(--m3-primary)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl blur-sm" />
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--m3-primary-container)] to-[var(--m3-tertiary-container)] opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-2xl" />
            
            <span className="relative z-10 flex items-center justify-center gap-2">
              Join the Innovation Experiment
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300 ease-out" />
            </span>
            
            {/* Subtle shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shimmer transition-opacity duration-500 rounded-2xl" />
          </Button>
          
          {/* Secondary CTA */}
          <Button
            size="lg"
            variant="outlined"
            aria-label="Sign in to your FutureSeer account"
            className="group px-6 sm:px-8 py-3 sm:py-4 min-h-[44px] w-full sm:w-auto bg-transparent border-2 border-[var(--m3-primary)]/50 hover:bg-[var(--m3-primary-container)] hover:border-[var(--m3-primary)] active:scale-95 transition-all duration-300 m3-transition-standard rounded-2xl touch-manipulation focus-visible:outline-2 focus-visible:outline-[var(--m3-primary)] focus-visible:outline-offset-2 m3-gpu-accelerated m3-label-large"
            onClick={() => {
              trackEvent(ANALYTICS_EVENTS.HERO_CTA_CLICKED, {
                cta_type: "signin",
              })
              router.push("/signin")
            }}
          >
            <span className="flex items-center justify-center gap-2 text-white">
              <LogIn className="w-5 h-5 text-white" />
              Sign In
            </span>
          </Button>
        </div>
        
        {/* Descriptive text - replaces old quote position */}
        <div className="max-w-xl mx-auto pt-6 sm:pt-8 pb-12 sm:pb-16">
          <p className="m3-body-large md:m3-headline-small text-center leading-relaxed relative z-10 text-[var(--m3-on-surface)] font-light">
            See your future. Join the experiment. <span className="text-[var(--m3-primary)]">Join the Innovation Experiment.</span>
          </p>
        </div>
      </div>

      {/* Scroll indicator - positioned at bottom, perfectly centered on page */}
      <div className="absolute inset-x-0 flex justify-center bottom-8 hidden md:block animate-scroll-indicator z-10" aria-hidden="true">
        <ChevronDown className="w-6 h-6 text-[var(--m3-primary)]" />
      </div>
    </section>
  )
} 