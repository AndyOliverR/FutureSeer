import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { AnalyticsInitializer } from "@/components/AnalyticsInitializer"
import ClientProviders from "@/components/ClientProviders"
import { I18nProvider } from "@/components/I18nProvider"
import { MysticalFeedback } from "@/components/MysticalFeedback"
import ErrorBoundary from "@/components/ErrorBoundary"
import { FirestoreErrorSuppressor } from "@/components/FirestoreErrorSuppressor"

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
  other: {
    // Security headers to prevent popup blocking
    'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    'Cross-Origin-Embedder-Policy': 'unsafe-none',
  },
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
  maximumScale: 5,
  userScalable: true,
  themeColor: "#000000",
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Add global error handling for unhandled promise rejections
  // Note: Firestore error suppression is handled in lib/firebase.ts
  // This handler is kept minimal to avoid duplicate suppression
  if (typeof window !== 'undefined') {
    // Enhanced error suppression for Firestore internal assertion errors
    const suppressFirestoreError = (errorMessage: string | any): boolean => {
      // Handle both string messages and error objects
      const message = typeof errorMessage === 'string' 
        ? errorMessage 
        : errorMessage?.message || errorMessage?.toString() || '';
      
      // Check for various Firestore internal error patterns
      const patterns = [
        'INTERNAL ASSERTION FAILED',
        'FIRESTORE',
        'Firestore',
        'FIRESTORE (12.1.0)',
        'Unexpected state (ID: ca9)',
        'Unexpected state (ID: b815)',
        've":-1',
        '__PRIVATE__fail',
        '__PRIVATE_TargetState',
        '__PRIVATE_WatchChangeAggregator',
        '__PRIVATE_AsyncQueueImpl',
        'DelayedOperation.handleDelayElapsed'
      ];
      
      const messageCheck = patterns.some(pattern => message.includes(pattern));
      
      // Check for nested errors in context objects (like ID: b815 wrapping ca9)
      const contextCheck = errorMessage?.context?.Pc && 
        typeof errorMessage.context.Pc === 'string' &&
        errorMessage.context.Pc.includes('INTERNAL ASSERTION FAILED');
      
      return messageCheck || contextCheck;
    };

    window.addEventListener('unhandledrejection', (event) => {
      // Check both the error message and the error object itself
      const errorMessage = event.reason?.message || event.reason?.toString() || '';
      // Suppress Firestore internal errors - they're handled in lib/firebase.ts
      if (suppressFirestoreError(errorMessage) || suppressFirestoreError(event.reason)) {
        event.preventDefault();
        return;
      }
      // Only log other unhandled rejections for debugging
      // console.warn('🛡️ Unhandled promise rejection caught:', event.reason);
      event.preventDefault();
    });
    
    window.addEventListener('error', (event) => {
      // Check both the error message and the error object itself
      const errorMessage = event.message || event.error?.message || '';
      // Suppress Firestore internal errors - they're handled in lib/firebase.ts
      if (suppressFirestoreError(errorMessage) || suppressFirestoreError(event.error)) {
        event.preventDefault();
        return;
      }
      // Only log other errors for debugging
      // console.warn('🛡️ Global error caught:', event.error);
    });
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Early error suppression script - runs before React/Next.js
                // This MUST run before Next.js error overlay initializes
                function isFirestoreInternalError(error) {
                  if (!error) return false;
                  try {
                    const msg = error?.message || error?.toString() || '';
                    const stack = error?.stack || '';
                    const str = JSON.stringify(error);
                    const patterns = [
                      'INTERNAL ASSERTION FAILED', 'FIRESTORE', 'Firestore',
                      'FIRESTORE (12.1.0)', 'Unexpected state (ID: ca9)',
                      'Unexpected state (ID: b815)', 've":-1', '__PRIVATE__fail',
                      '__PRIVATE_TargetState', '__PRIVATE_WatchChangeAggregator',
                      '__PRIVATE_AsyncQueueImpl', '__PRIVATE_PersistentListenStream',
                      'DelayedOperation.handleDelayElapsed', '__PRIVATE_onWatchStreamChange'
                    ];
                    const msgCheck = patterns.some(p => msg.includes(p) || stack.includes(p) || str.includes(p));
                    const ctxCheck = error?.context?.Pc && typeof error.context.Pc === 'string' && error.context.Pc.includes('INTERNAL ASSERTION FAILED');
                    return msgCheck || ctxCheck;
                  } catch (e) {
                    return false;
                  }
                }
                
                // Patch error handlers BEFORE Next.js overlay can catch them
                const originalOnError = window.onerror;
                window.onerror = function(message, source, lineno, colno, error) {
                  if (isFirestoreInternalError(error) || isFirestoreInternalError({ message: String(message) })) {
                    return true; // Suppress error completely
                  }
                  if (originalOnError) {
                    return originalOnError.call(window, message, source, lineno, colno, error);
                  }
                  return false;
                };
                
                const originalOnUnhandledRejection = window.onunhandledrejection;
                window.onunhandledrejection = function(event) {
                  if (isFirestoreInternalError(event.reason)) {
                    event.preventDefault();
                    event.stopPropagation();
                    return false;
                  }
                  if (originalOnUnhandledRejection) {
                    return originalOnUnhandledRejection.call(window, event);
                  }
                };
                
                // Add event listeners with capture phase (runs first)
                window.addEventListener('error', function(e) {
                  if (isFirestoreInternalError(e.error) || isFirestoreInternalError({ message: e.message })) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    return false;
                  }
                }, true);
                
                window.addEventListener('unhandledrejection', function(e) {
                  if (isFirestoreInternalError(e.reason)) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    return false;
                  }
                }, true);
              })();
            `,
          }}
        />
        <FirestoreErrorSuppressor />
        <ErrorBoundary>
          <div className="relative min-h-screen cosmic-starfield-hybrid">
            <div className="relative z-10">
              <ClientProviders>
                <I18nProvider>
                  <AnalyticsInitializer />
                  {children}
                  <Toaster />
                </I18nProvider>
              </ClientProviders>
            </div>
          </div>
          <MysticalFeedback />
        </ErrorBoundary>
      </body>
    </html>
  )
}