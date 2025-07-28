import type { Metadata } from "next"
import { Inter, Cedarville_Cursive } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/hooks/use-auth"
import { Toaster } from "@/components/ui/toaster"
import { TestModeSwitcher } from '@/components/TestModeSwitcher'
import { TestAuth } from '@/components/TestAuth'

const inter = Inter({ subsets: ["latin"] })
const cedarvilleCursive = Cedarville_Cursive({ 
  weight: "400",
  subsets: ["latin"],
  variable: "--font-cedarville-cursive"
})

export const metadata: Metadata = {
  title: "FutureSeer - AI-Powered Mystical Insights",
  description: "Discover your cosmic path with AI-powered divination and ancient wisdom",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link href="https://fonts.googleapis.com/css2?family=Monsieur+La+Doulaise&display=swap" rel="stylesheet" />
      </head>
      <body className={`${inter.className} ${cedarvilleCursive.variable} bg-[url('/assets/bg/starfield.avif')] bg-cover bg-center bg-fixed`}>
        <AuthProvider>
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <main>
              {children}
            </main>
          </div>
          <TestAuth />
          <TestModeSwitcher />
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}