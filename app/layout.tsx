import type { Metadata } from "next"
import { Inter, Cedarville_Cursive } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/hooks/use-auth"
import { Toaster } from "@/components/ui/toaster"
import { ServiceStatus } from "@/components/ServiceStatus"
import { TopNavBar } from "@/components/TopNavBar";

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
        <div className="flex min-h-screen relative flex-col">
          <TopNavBar />
          <main className="flex-1">
            <AuthProvider>
              {children}
              <ServiceStatus />
              <Toaster />
            </AuthProvider>
          </main>
        </div>
      </body>
    </html>
  )
}