"use client";
import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { EnhancedFooter } from "@/components/enhanced-footer"
// Lazy load below-the-fold components for better performance
// Use ssr: false to prevent server-side rendering and reduce initial bundle size
const FeatureBlocks = dynamic(() => import("@/components/feature-blocks").then(mod => ({ default: mod.FeatureBlocks })), {
  ssr: false,
  loading: () => <div className="py-8 sm:py-12 md:py-16 px-4 sm:px-6" />
})

const StickyCTA = dynamic(() => import("@/components/sticky-cta").then(mod => ({ default: mod.StickyCTA })), {
  ssr: false
})

export default function HomePage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen flex flex-col starfield-ultra-sharp" data-page="landing">
        <Header />
        <div className="relative flex-1 z-20 flex items-center justify-center bg-transparent">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--m3-primary)] mx-auto mb-4" />
            <p className="text-[var(--m3-primary)] m3-body-large">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col starfield-ultra-sharp" data-page="landing">
      {/* Header outside wrapper to allow full-width extension */}
      <Header />
      <div className="relative flex-1 z-20 bg-transparent flex flex-col w-full">
        <HeroSection />
        
        <div className="px-4 sm:px-6">
          <FeatureBlocks />
        </div>
      </div>
      
      <EnhancedFooter />
      
      {/* Sticky CTA for mobile */}
      <StickyCTA />
    </div>
  )
}