"use client";

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight, ChevronDown } from "lucide-react"
import { useAnalytics } from "@/lib/analytics"
import { ANALYTICS_EVENTS } from "@/lib/analytics"
import { heroCtaLabel } from "@/lib/heroCtaVariant"
import { useHeroCtaVariant } from "@/hooks/useHeroCtaVariant"

export function HeroSection() {
  const router = useRouter()
  const { trackEvent } = useAnalytics()
  const ctaVariant = useHeroCtaVariant()
  const ctaLabel = heroCtaLabel(ctaVariant)

  return (
    <section className="flex flex-col items-center justify-center min-h-[70vh] md:min-h-[80vh] px-4 text-center pt-20 md:pt-24 pb-6 relative bg-transparent">
      <div className="max-w-5xl mx-auto space-y-8 md:space-y-12">
        <h1 className="fs-heading-hero shiny-gold-text">
          <span className="block">ASK THE</span>
          <span className="block">SEER</span>
        </h1>

        <div className="max-w-xl mx-auto space-y-4 opacity-90">
          <p className="text-base md:text-2xl font-quote leading-relaxed gold-glow font-light not-italic">
            &ldquo;Millionaires don&apos;t use astrology, billionaires do.&rdquo;
          </p>
          <p className="text-xs md:text-sm font-normal text-primary/80 uppercase tracking-[0.2em]">
            — J.P. Morgan
          </p>
        </div>

        <div className="flex flex-col gap-4 md:gap-5 justify-center items-center pt-6">
          <Button
            size="lg"
            className="w-full sm:w-auto px-8 md:px-10 py-6 md:py-7 bg-primary text-[#020617] font-bold md:font-light uppercase tracking-widest rounded-2xl md:rounded-full transition-all shadow-xl shadow-amber-500/10 [&_svg]:text-[#020617]"
            onClick={() => {
              trackEvent(ANALYTICS_EVENTS.HERO_CTA_CLICKED, { cta_type: ctaVariant })
              router.push("/signup")
            }}
          >
            {ctaLabel}
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
          <div className="pt-2 animate-bounce opacity-30 hidden sm:block" aria-hidden="true">
            <ChevronDown className="w-6 h-6 text-white mx-auto" />
          </div>
        </div>
      </div>
    </section>
  )
}
