"use client";
import { HeroSection } from "@/components/hero-section"
import { EnhancedFooter } from "@/components/enhanced-footer"
import { FeatureBlocks } from "@/components/feature-blocks"
import dynamic from "next/dynamic"

const StickyCTA = dynamic(() => import("@/components/sticky-cta").then(mod => ({ default: mod.StickyCTA })), {
  ssr: false
})

export default function HomePage() {
  return (
    <div
      className="min-h-screen w-full min-w-0 max-w-full flex flex-col starfield-ultra-sharp bg-surface md:bg-transparent pt-[env(safe-area-inset-top)] md:pt-0 pb-24 md:pb-0 overflow-x-hidden"
      data-page="landing"
    >
      <div className="relative flex-1 z-20 bg-transparent flex flex-col w-full min-w-0 max-w-full">
        <HeroSection />
        <div className="px-4 w-full min-w-0 max-w-full">
          <FeatureBlocks />
          <section className="mx-auto mt-6 mb-2 max-w-6xl rounded-xl border border-amber-500/25 bg-slate-900/35 p-4 md:p-5">
            <h2 className="text-sm md:text-base font-semibold text-amber-300">Why FutureSeer</h2>
            <p className="mt-2 text-xs md:text-sm text-slate-200/90 leading-relaxed">
              FutureSeer brings multiple divination systems into one account, one profile, and one persistent insight layer.
              You get tool-specific experts for depth and a unified Seer for cross-system synthesis in the same workspace at
              <span className="font-medium text-amber-300"> futureseer.app</span>.
            </p>
          </section>
        </div>
      </div>
      <EnhancedFooter />
      <StickyCTA />
    </div>
  )
}
