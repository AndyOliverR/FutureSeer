import type { Metadata, Viewport } from "next"
import { devLog } from '@/lib/devLogger';
import "./globals.css"
import "@/lib/suppressSourceMapWarnings"
import { Toaster } from "@/components/ui/toaster"
import ClientProviders from "@/components/ClientProviders"
import { I18nProvider } from "@/components/I18nProvider"
import ErrorBoundary from "@/components/ErrorBoundary"
import { FeedbackProvider } from "@/components/FeedbackContext"
import { SchemaMarkup } from "@/components/schema-markup"
import { Header } from "@/components/header"
import { BottomNavBar } from "@/components/BottomNavBar"
import { FloatingTipJar } from "@/components/FloatingTipJar"
import { MysticalFeedback } from "@/components/MysticalFeedback"
import {
  DeferredAnalyticsInitializer,
  DeferredFirestoreErrorSuppressor,
  DeferredServiceWorkerRegistration,
  DeferredViewportHeightSync,
} from "@/components/DeferredLayoutComponents"

export const metadata: Metadata = {
  title: "FutureSeer - AI-Powered Mystical Insights",
  description: "Discover your cosmic path with AI-powered astrology, numerology, tarot, and more mystical tools.",
  manifest: "/manifest.json",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#000000",
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="starfield-ultra-sharp min-h-screen overflow-x-hidden font-sans">
        {/* Platform Detection Script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const isAndroid = /Android/i.test(navigator.userAgent);
                if (isAndroid) {
                  document.documentElement.classList.add('platform-android');
                } else {
                  document.documentElement.classList.add('platform-web');
                }
              })();
            `,
          }}
        />
        <DeferredViewportHeightSync />
        <SchemaMarkup />
        <DeferredFirestoreErrorSuppressor />
        <main role="main" id="main-content">
          <ClientProviders>
            <div className="sticky top-0 z-[200] flex-shrink-0 w-full min-h-[52px] bg-surface">
              <Header />
            </div>
            <FeedbackProvider>
              <FloatingTipJar />
              <MysticalFeedback />
              <ErrorBoundary>
                <I18nProvider>
                  <DeferredAnalyticsInitializer />
                  {children}
                  {/* Bottom nav only renders via CSS media query/class on mobile/android */}
                  <BottomNavBar />
                  <Toaster />
                </I18nProvider>
              </ErrorBoundary>
            </FeedbackProvider>
          </ClientProviders>
        </main>
      </body>
    </html>
  )
}
