"use client";
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { FeatureBlocks } from "@/components/feature-blocks"

export default function HomePage() {
  return (
    <div className="relative">
      <Header />
      <HeroSection />
      <FeatureBlocks />
    </div>
  )
} 