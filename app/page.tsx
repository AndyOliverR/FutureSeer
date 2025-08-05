"use client";
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { FeatureBlocks } from "@/components/feature-blocks"
import { AppWrapper } from "@/components/AppWrapper"

export default function HomePage() {
  return (
    <AppWrapper>
      <div className="relative">
        <Header />
        <HeroSection />
        <FeatureBlocks />
      </div>
    </AppWrapper>
  )
} 