"use client";
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { ArrowRight, ChevronDown } from "lucide-react"
import { useAnalytics } from "@/lib/analytics"
import { ANALYTICS_EVENTS } from "@/lib/analytics"

export function HeroSection() {
  const router = useRouter()
  const { trackEvent } = useAnalytics()

  return (
    <section className="flex flex-col items-center justify-center min-h-[75vh] md:min-h-[85vh] px-4 text-center pt-24 md:pt-32 pb-12 relative bg-transparent">
      <div className="max-w-5xl mx-auto space-y-8 md:space-y-12">
        {/* Responsive Headline: Large on web, fits perfectly on mobile */}
        <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-9xl font-heading text-primary leading-tight tracking-[0.1em] md:tracking-[0.2em] font-light uppercase">
          Ask the Seer
        </h1>

        {/* Quote Section */}
        <div className="max-w-xl mx-auto space-y-4">
          <p className="text-base md:text-2xl italic font-serif leading-relaxed gold-glow font-light">
            "Millionaires don't use astrology, billionaires do."
          </p>
          <p className="text-[10px] md:text-sm font-normal text-primary/80 uppercase tracking-[0.2em]">
            — J.P. Morgan
          </p>
        </div>

        {/* Unified CTA Buttons: Stacked on mobile, side-by-side on web */}
        <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center pt-6">
          <Button
            size="lg"
            className="w-full sm:w-auto px-8 md:px-10 py-6 md:py-7 bg-primary text-on-primary font-bold md:font-light uppercase tracking-widest rounded-2xl md:rounded-full hover:scale-105 transition-all shadow-xl shadow-amber-500/10"
            onClick={() => {
              trackEvent(ANALYTICS_EVENTS.HERO_CTA_CLICKED, { cta_type: "join_experiment" })
              router.push("/signup")
            }}
          >
            Join the Experiment
            <ArrowRight className="ml-2 w-4 h-4 hidden md:block" />
          </Button>

          <Button
            size="lg"
            variant="outlined"
            className="w-full sm:w-auto px-8 md:px-10 py-6 md:py-7 bg-transparent border-2 border-white/20 text-white font-bold md:font-light uppercase tracking-widest rounded-2xl md:rounded-full hover:bg-white/5 transition-all"
            onClick={() => router.push("/signin")}
          >
            Sign In
          </Button>
        </div>
      </div>

      {/* Scroll indicator - hidden on very small screens */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce opacity-30 hidden sm:block">
        <ChevronDown className="w-6 h-6 text-white" />
      </div>
    </section>
  )
}
