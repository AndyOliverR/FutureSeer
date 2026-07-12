"use client";
import { HeroSection } from "@/components/hero-section"
import { EnhancedFooter } from "@/components/enhanced-footer"
import { FeatureBlocks } from "@/components/feature-blocks"
import { LandingSurveyTestimonials } from "@/components/landing/LandingSurveyTestimonials"
import { LandingValueIntro } from "@/components/landing/LandingValueIntro"
import { HomeDailyInsightSection } from "@/components/home/HomeDailyInsightSection"
import { HomeStrategicReadSection } from "@/components/home/HomeStrategicReadSection"
import dynamic from "next/dynamic"

const StickyCTA = dynamic(() => import("@/components/sticky-cta").then(mod => ({ default: mod.StickyCTA })), {
  ssr: false
})

export default function HomePage() {
  return (
    <div
      className="min-h-screen w-full min-w-0 max-w-full flex flex-col starfield-ultra-sharp bg-surface md:bg-transparent pt-[env(safe-area-inset-top)] md:pt-0 pb-24 md:pb-0 overflow-x-hidden"
      data-page="landing"
      data-onboarding="dashboard"
    >
      <div className="relative flex-1 z-20 bg-transparent flex flex-col w-full min-w-0 max-w-full">
        <HeroSection />
        <HomeDailyInsightSection />
        <HomeStrategicReadSection />
        <LandingValueIntro />
        <div className="px-4 w-full min-w-0 max-w-full">
          <FeatureBlocks />
          <LandingSurveyTestimonials />
        </div>
      </div>
      <EnhancedFooter />
      <StickyCTA />
    </div>
  )
}
