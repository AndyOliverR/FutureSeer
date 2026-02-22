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
    <section className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center pt-20 md:pt-32 pb-12 relative bg-transparent">
      <div className="max-w-4xl mx-auto space-y-6 md:space-y-10 opacity-100 translate-y-0">
        {/* Main Headline - Responsive sizing and bolder weight for mobile */}
        <h1 className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-heading text-primary leading-tight tracking-tight font-semibold">
          Ask the Seer
        </h1>

        {/* J.P. Morgan Quote - Adjusted for mobile readability */}
        <div className="group max-w-lg mx-auto pt-2 sm:pt-6">
          <p className="text-lg md:text-2xl italic font-serif mb-2 text-center leading-relaxed gold-glow font-medium">
            "Millionaires don't use astrology, billionaires do."
          </p>
          <p className="text-xs md:text-sm text-center font-medium text-primary/80 uppercase tracking-widest">
            — J.P. Morgan
          </p>
        </div>

        {/* CTA Buttons - Material 3 Rounded */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
          <Button
            size="lg"
            variant="filled"
            className="w-full sm:w-auto px-8 py-6 rounded-2xl text-lg font-semibold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            onClick={() => {
              trackEvent(ANALYTICS_EVENTS.HERO_CTA_CLICKED, { cta_type: "join_experiment" })
              router.push("/signup")
            }}
          >
            Join the Experiment
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          
          <Button
            size="lg"
            variant="outlined"
            className="w-full sm:w-auto px-8 py-6 rounded-2xl text-lg border-2 text-white hover:bg-white/5"
            onClick={() => {
              trackEvent(ANALYTICS_EVENTS.HERO_CTA_CLICKED, { cta_type: "signin" })
              router.push("/signin")
            }}
          >
            Sign In
          </Button>
        </div>
        
        <p className="text-sm md:text-base text-surface-on-variant max-w-md mx-auto pt-4 opacity-80">
          Discover your cosmic path with AI-powered mystical insights.
        </p>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce opacity-50 hidden md:block">
        <ChevronDown className="w-6 h-6 text-primary" />
      </div>
    </section>
  )
}
