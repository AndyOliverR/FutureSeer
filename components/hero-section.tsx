"use client";

import { Button } from "@/components/ui/button"
import Link from "next/link"
// Landing: single CTA "Join the Experiment" → signup; secondary link to sign in
import { useRouter } from "next/navigation"
import { ArrowRight, ChevronDown } from "lucide-react"
import { useAnalytics } from "@/lib/analytics"
import { ANALYTICS_EVENTS } from "@/lib/analytics"

export function HeroSection() {
  const router = useRouter()
  const { trackEvent } = useAnalytics()

  return (
    <section className="flex flex-col items-center justify-center min-h-[75vh] md:min-h-[85vh] px-4 text-center pt-20 md:pt-24 pb-12 relative bg-transparent">
      <div className="max-w-5xl mx-auto space-y-8 md:space-y-12">
        {/* Responsive Headline: Large on web, fits perfectly on mobile */}
        <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-9xl font-heading text-primary leading-tight tracking-[0.1em] md:tracking-[0.2em] font-light uppercase">
          Ask the Seer
        </h1>

        {/* Quote Section */}
        <div className="max-w-xl mx-auto space-y-4">
          <p className="text-base md:text-2xl font-quote leading-relaxed gold-glow font-light not-italic">
            "Millionaires don't use astrology, billionaires do."
          </p>
          <p className="text-xs md:text-sm font-normal text-primary/80 uppercase tracking-[0.2em]">
            — J.P. Morgan
          </p>
        </div>

        {/* Single primary CTA: Join the Experiment → signup */}
        <div className="flex flex-col gap-4 md:gap-5 justify-center items-center pt-6">
          <Button
            size="lg"
            className="w-full sm:w-auto px-8 md:px-10 py-6 md:py-7 bg-primary text-[#020617] font-bold md:font-light uppercase tracking-widest rounded-2xl md:rounded-full transition-all shadow-xl shadow-amber-500/10 [&_svg]:text-[#020617]"
            onClick={() => {
              trackEvent(ANALYTICS_EVENTS.HERO_CTA_CLICKED, { cta_type: "join_experiment" })
              router.push("/signup")
            }}
          >
            Join the Experiment
            <ArrowRight className="ml-2 w-4 h-4 hidden md:block" />
          </Button>
          <p className="text-xs text-primary/65 max-w-md mx-auto">
            No spam. Read our{" "}
            <Link
              href="/privacy"
              className="text-amber-400/90 hover:text-amber-400 underline-offset-2 hover:underline"
            >
              Privacy
            </Link>{" "}
            policy.
          </p>
          <Link
            href="/signin"
            className="text-sm font-medium text-amber-400/80 hover:text-amber-400 transition-colors uppercase tracking-wider"
          >
            Already have an account? Sign In
          </Link>
          <p className="text-sm text-white tracking-wide font-medium">
            Crafted with <span className="text-[#B91C1C] text-2xl align-middle">♥</span> in India for the World.
          </p>
        </div>
      </div>

      {/* Scroll indicator - in empty space below CTAs, hidden on very small screens */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 animate-bounce opacity-30 hidden sm:block">
        <ChevronDown className="w-6 h-6 text-white" />
      </div>
    </section>
  )
}
