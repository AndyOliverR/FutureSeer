"use client";
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { ArrowRight, LogIn, ChevronDown } from "lucide-react"
import { useAnalytics } from "@/lib/analytics"
import { ANALYTICS_EVENTS } from "@/lib/analytics"
import { useState, useEffect } from "react"

export function HeroSection() {
  const router = useRouter()
  const { trackEvent } = useAnalytics()
  const [isAndroid, setIsAndroid] = useState(false)

  useEffect(() => {
    setIsAndroid(/Android/i.test(navigator.userAgent));
  }, []);

  // ANDROID APP HERO VERSION
  if (isAndroid) {
    return (
      <section className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center pt-20 pb-12 relative bg-transparent">
        <div className="max-w-4xl mx-auto space-y-6 opacity-100 translate-y-0">
          <h1 className="text-5xl sm:text-6xl font-heading text-primary leading-tight tracking-tight font-bold">
            Ask the Seer
          </h1>
          <div className="group max-w-lg mx-auto pt-2">
            <p className="text-lg italic font-serif mb-2 text-center leading-relaxed gold-glow font-medium">
              "Millionaires don't use astrology, billionaires do."
            </p>
            <p className="text-xs text-center font-medium text-primary/80 uppercase tracking-widest">— J.P. Morgan</p>
          </div>
          <div className="flex flex-col gap-4 justify-center items-center pt-8">
            <Button
              size="lg"
              variant="filled"
              className="w-full px-8 py-6 rounded-2xl text-lg font-bold shadow-lg shadow-primary/20 transition-all"
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
              className="w-full px-8 py-6 rounded-2xl text-lg border-2 text-white"
              onClick={() => router.push("/signin")}
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>
    )
  }

  // ORIGINAL WEB HERO VERSION
  return (
    <section className="flex flex-col items-center justify-center min-h-[70vh] md:min-h-[80vh] px-6 text-center pt-24 md:pt-32 pb-12 relative bg-transparent">
      <div className="max-w-4xl mx-auto space-y-8 md:space-y-12">
        <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-heading text-[var(--m3-primary)] leading-tight tracking-widest font-light uppercase">
          Ask the Seer
        </h1>
        <div className="max-w-xl mx-auto">
          <p className="m3-body-large md:m3-headline-small italic font-serif mb-2 text-center leading-relaxed gold-glow font-light">
            "Millionaires don't use astrology, billionaires do."
          </p>
          <p className="text-xs md:text-sm text-center font-normal text-[var(--m3-primary)] uppercase tracking-[0.2em]">
            — J.P. Morgan
          </p>
        </div>
        <div className="flex flex-row gap-6 justify-center items-center pt-10">
          <Button
            size="lg"
            variant="filled"
            className="px-10 py-4 bg-primary text-on-primary font-light tracking-widest rounded-full hover:scale-105 transition-all shadow-xl shadow-amber-500/10"
            onClick={() => router.push("/signup")}
          >
            Join the Innovation Experiment
          </Button>
          <Button
            size="lg"
            variant="outlined"
            className="px-10 py-4 bg-transparent border-white/20 text-white font-light tracking-widest rounded-full hover:bg-white/5 transition-all"
            onClick={() => router.push("/signin")}
          >
            Sign In
          </Button>
        </div>
      </div>
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce opacity-30">
        <ChevronDown className="w-6 h-6 text-white" />
      </div>
    </section>
  )
}
