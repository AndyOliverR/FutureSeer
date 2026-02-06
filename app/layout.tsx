import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
// Suppress source map warnings from node_modules (must be imported early)
import "@/lib/suppressSourceMapWarnings"
import { Toaster } from "@/components/ui/toaster"
import { AnalyticsInitializer } from "@/components/AnalyticsInitializer"
import ClientProviders from "@/components/ClientProviders"
import { I18nProvider } from "@/components/I18nProvider"
import ErrorBoundary from "@/components/ErrorBoundary"
import { FirestoreErrorSuppressor } from "@/components/FirestoreErrorSuppressor"
import { MysticalFeedback } from "@/components/MysticalFeedback"
import { FloatingTipJar } from "@/components/FloatingTipJar"
import { FeedbackProvider } from "@/components/FeedbackContext"
import { SchemaMarkup } from "@/components/schema-markup"
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration"

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
    url: "https://futureseer.app",
    title: "FutureSeer - AI-Powered Mystical Insights",
    description: "Discover your cosmic path with AI-powered astrology, numerology, tarot, and more mystical tools.",
    siteName: "FutureSeer",
    images: [
      {
        url: "/og-image.svg",
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
    images: ["/og-image.svg"],
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

    // Helper to check if error is COOP (Cross-Origin-Opener-Policy) warning
    const suppressCOOPWarning = (errorMessage: string | any): boolean => {
      const message = typeof errorMessage === 'string' 
        ? errorMessage 
        : errorMessage?.message || errorMessage?.toString() || '';
      return message.includes('Cross-Origin-Opener-Policy') ||
             message.includes('policy would block') ||
             message.includes('policy would block the window.closed call') ||
             message.includes('window.closed') ||
             message.includes('COOP') ||
             message.includes('opener-policy') ||
             (message.includes('block') && message.includes('window.closed'));
    };

    window.addEventListener('unhandledrejection', (event) => {
      // Check both the error message and the error object itself
      const errorMessage = event.reason?.message || event.reason?.toString() || '';
      // Suppress COOP warnings (non-critical browser security notifications)
      if (suppressCOOPWarning(errorMessage) || suppressCOOPWarning(event.reason)) {
        event.preventDefault();
        return;
      }
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
      // Suppress COOP warnings (non-critical browser security notifications)
      if (suppressCOOPWarning(errorMessage) || suppressCOOPWarning(event.error)) {
        event.preventDefault();
        return;
      }
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
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className={`${inter.className} starfield-ultra-sharp`}>
        <ServiceWorkerRegistration />
        <SchemaMarkup />
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
                
                // Helper to check if error is COOP (Cross-Origin-Opener-Policy) warning
                function isCOOPWarning(message, error) {
                  const msg = String(message || '') + (error?.message || '') + (error?.toString() || '');
                  return msg.includes('Cross-Origin-Opener-Policy') ||
                         msg.includes('policy would block') ||
                         msg.includes('policy would block the window.closed call') ||
                         msg.includes('window.closed') ||
                         msg.includes('COOP') ||
                         msg.includes('opener-policy') ||
                         (msg.includes('block') && msg.includes('window.closed'));
                }
                
                // Patch error handlers BEFORE Next.js overlay can catch them
                const originalOnError = window.onerror;
                window.onerror = function(message, source, lineno, colno, error) {
                  // Suppress COOP warnings (non-critical browser security notifications)
                  if (isCOOPWarning(message, error)) {
                    return true; // Suppress completely
                  }
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
                  // Suppress COOP warnings
                  if (isCOOPWarning(event.reason?.message, event.reason)) {
                    event.preventDefault();
                    event.stopPropagation();
                    return false;
                  }
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
                  // Suppress COOP warnings
                  if (isCOOPWarning(e.message, e.error)) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    return false;
                  }
                  if (isFirestoreInternalError(e.error) || isFirestoreInternalError({ message: e.message })) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    return false;
                  }
                }, true);
                
                window.addEventListener('unhandledrejection', function(e) {
                  // Suppress COOP warnings
                  if (isCOOPWarning(e.reason?.message, e.reason)) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    return false;
                  }
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
        <main role="main" id="main-content">
          <FeedbackProvider>
            <ClientProviders>
              <MysticalFeedback />
              <FloatingTipJar />
            </ClientProviders>
            <ErrorBoundary>
              <ClientProviders>
                <I18nProvider>
                  <AnalyticsInitializer />
                  {children}
                  <Toaster />
                </I18nProvider>
              </ClientProviders>
            </ErrorBoundary>
          </FeedbackProvider>
        </main>
      </body>
    </html>
  )
}