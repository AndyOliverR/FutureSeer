import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { TestAuth } from "@/components/TestAuth"
import { TestModeSwitcher } from "@/components/TestModeSwitcher"
import { MysticalFeedback } from "@/components/MysticalFeedback"
import { Footer } from "@/components/Footer"
import { Toaster } from "@/components/ui/toaster"
import { AnalyticsInitializer } from "@/components/AnalyticsInitializer"
import ClientProviders from "@/components/ClientProviders"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: "FutureSeer - AI-Powered Mystical Insights",
  description: "Discover your cosmic path with AI-powered astrology, numerology, tarot, and more mystical tools.",
  keywords: "astrology, numerology, tarot, mystical, AI, predictions, horoscope, spiritual",
  authors: [{ name: "FutureSeer Team" }],
  creator: "FutureSeer",
  publisher: "FutureSeer",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://futureseer.com",
    title: "FutureSeer - AI-Powered Mystical Insights",
    description: "Discover your cosmic path with AI-powered astrology, numerology, tarot, and more mystical tools.",
    siteName: "FutureSeer",
    images: [
      {
        url: "/placeholder-logo.png",
        width: 1200,
        height: 630,
        alt: "FutureSeer - Mystical AI Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FutureSeer - AI-Powered Mystical Insights",
    description: "Discover your cosmic path with AI-powered astrology, numerology, tarot, and more mystical tools.",
    images: ["/placeholder-logo.png"],
  },
  manifest: "/manifest.json",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientProviders>
          <AnalyticsInitializer />
          {children}
          <TestAuth />
          <TestModeSwitcher />
          <MysticalFeedback />
          <Footer />
          <Toaster />
        </ClientProviders>
      </body>
    </html>
  )
}