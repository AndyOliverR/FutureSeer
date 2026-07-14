"use client";
import { HeroSection } from "@/components/hero-section"
import dynamic from "next/dynamic"

const HomeDailyInsightSection = dynamic(
  () => import("@/components/home/HomeDailyInsightSection").then((m) => ({ default: m.HomeDailyInsightSection })),
  { loading: () => null }
)
const HomeStrategicReadSection = dynamic(
  () => import("@/components/home/HomeStrategicReadSection").then((m) => ({ default: m.HomeStrategicReadSection })),
  { loading: () => null }
)
const LandingValueIntro = dynamic(
  () => import("@/components/landing/LandingValueIntro").then((m) => ({ default: m.LandingValueIntro })),
  { loading: () => null }
)
const FeatureBlocks = dynamic(
  () => import("@/components/feature-blocks").then((m) => ({ default: m.FeatureBlocks })),
  { loading: () => null }
)
const LandingSurveyTestimonials = dynamic(
  () => import("@/components/landing/LandingSurveyTestimonials").then((m) => ({ default: m.LandingSurveyTestimonials })),
  { loading: () => null }
)
const EnhancedFooter = dynamic(
  () => import("@/components/enhanced-footer").then((m) => ({ default: m.EnhancedFooter })),
  { loading: () => null }
)
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
        <div className="fs-below-fold-section">
          <HomeDailyInsightSection />
          <HomeStrategicReadSection />
          <LandingValueIntro />
          <div className="px-4 w-full min-w-0 max-w-full">
            <FeatureBlocks />
            <LandingSurveyTestimonials />
          </div>
        </div>
      </div>
      <EnhancedFooter />
      <StickyCTA />
    </div>
  )
}
