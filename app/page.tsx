"use client";
import dynamic from "next/dynamic"
import { HeroSection } from "@/components/hero-section"
import { EnhancedFooter } from "@/components/enhanced-footer"
// Lazy load below-the-fold components for better performance
// Use ssr: false to prevent server-side rendering and reduce initial bundle size
const FeatureBlocks = dynamic(() => import("@/components/feature-blocks").then(mod => ({ default: mod.FeatureBlocks })), {
  ssr: false,
  loading: () => <div className="py-8 sm:py-12 md:py-16 px-3 sm:px-4 md:px-6" />
})

const StickyCTA = dynamic(() => import("@/components/sticky-cta").then(mod => ({ default: mod.StickyCTA })), {
  ssr: false
})

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col starfield-ultra-sharp" data-page="landing">
      <div className="relative flex-1 z-20 bg-transparent flex flex-col w-full">
        <HeroSection />
        
        <div className="px-3 sm:px-4 md:px-6">
          <FeatureBlocks />
        </div>
      </div>
      
      <EnhancedFooter />
      
      {/* Sticky CTA for mobile */}
      <StickyCTA />
    </div>
  )
}