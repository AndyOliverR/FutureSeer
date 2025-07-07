import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/hooks/use-auth"
import MobileNav from "@/components/mobile-nav"
// import { PayPalScriptProvider } from "@paypal/react-paypal-js"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "FutureSeer - AI-Powered Mystical Insights",
  description: "Unveil the mysteries of your destiny through ancient wisdom and AI insight",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {/* <PayPalScriptProvider options={{ 
          clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '',
          currency: "INR",
          intent: "capture"
        }}> */}
          <AuthProvider>
            <div className="min-h-screen cosmic-background-restored">
              <div className="starfield-treated"></div>
              <MobileNav />
              {children}
            </div>
          </AuthProvider>
        {/* </PayPalScriptProvider> */}
      </body>
    </html>
  )
}
