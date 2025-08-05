"use client"

import { AuthProvider } from "@/hooks/use-auth"
import { MysticalFeedback } from "@/components/MysticalFeedback"
import { Footer } from "@/components/Footer"
import { AnalyticsInitializer } from "@/components/AnalyticsInitializer"
import { HamburgerMenu } from "@/components/HamburgerMenu"
import { AutoInitializer } from "@/components/AutoInitializer"
import { Toaster } from "@/components/ui/toaster"

export function AppWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AutoInitializer />
      <AnalyticsInitializer />
      {children}
      <HamburgerMenu />
      <MysticalFeedback />
      <Footer />
      <Toaster />
    </AuthProvider>
  )
} 