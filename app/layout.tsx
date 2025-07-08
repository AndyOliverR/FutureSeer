import type React from "react"
import type { Metadata } from "next"
import { Inter, Cormorant_Garamond } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/hooks/use-auth"
import MobileNav from "@/components/mobile-nav"

const inter = Inter({ subsets: ["latin"] })
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cormorant",
})

export const metadata: Metadata = {
  title: "FutureSeer - AI-Powered Mystical Insights",
  description: "Unveil the mysteries of your destiny through ancient wisdom and AI insight",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} ${cormorant.variable}`}>
        <AuthProvider>
          <div className="min-h-screen cosmic-background-restored">
            <div className="starfield-treated"></div>
            <MobileNav />
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
