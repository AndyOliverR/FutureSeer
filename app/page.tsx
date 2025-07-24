"use client";
import { HeroSection } from "@/components/hero-section"
import { FeatureBlocks } from "@/components/feature-blocks"

export default function HomePage() {
  return (
    <div
      className="relative min-h-screen bg-cover bg-center bg-no-repeat overflow-hidden"
      style={{ backgroundImage: "url('/images/starfield-bg.png')" }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-transparent to-slate-950/40" />
      <div className="relative z-10">
        <HeroSection />
        <FeatureBlocks />
      </div>
    </div>
  )
} 