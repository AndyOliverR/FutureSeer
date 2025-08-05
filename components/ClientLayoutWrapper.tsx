"use client"

import { MysticalFeedback } from "@/components/MysticalFeedback"
import { Footer } from "@/components/Footer"
import { AnalyticsInitializer } from "@/components/AnalyticsInitializer"
import { HamburgerMenu } from "@/components/HamburgerMenu"
import { AutoInitializer } from "@/components/AutoInitializer"
import { Toaster } from "@/components/ui/toaster"

export function ClientLayoutWrapper() {
  return (
    <>
      <AutoInitializer />
      <AnalyticsInitializer />
      <HamburgerMenu />
      <MysticalFeedback />
      <Footer />
      <Toaster />
    </>
  )
} 