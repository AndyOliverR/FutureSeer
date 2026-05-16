import type { Metadata, Viewport } from "next"
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
  DeferredViewportHeightSync,
} from "@/components/DeferredLayoutComponents"
import { PlatformClassProvider } from "@/components/PlatformClassProvider"
import { OnboardingTour } from "@/components/OnboardingTour"
import { buildLocaleAlternates, localizedOgImagePath, normalizeSeoBaseUrl } from "@/lib/seo/locales"

const googleSiteVerification = process.env.GOOGLE_SITE_VERIFICATION?.trim()
const siteBase = normalizeSeoBaseUrl(process.env.NEXT_PUBLIC_APP_URL ?? "https://futureseer.app")

export const metadata: Metadata = {
  metadataBase: new URL(siteBase),
  applicationName: "FutureSeer",
  title: "FutureSeer - AI-Powered Mystical Insights",
  description: "Discover your cosmic path with AI-powered astrology, numerology, tarot, and more mystical tools.",
  keywords: [
    "AI astrology",
    "tarot reading app",
    "numerology insights",
    "vedic astrology",
    "western astrology",
    "astrologie IA",
    "tarot IA",
    "horoscopo AI",
    "占星 AI",
    "mystical guidance app",
  ],
  alternates: {
    canonical: `${siteBase}/`,
    languages: buildLocaleAlternates(siteBase),
  },
  creator: "FutureSeer",
  publisher: "FutureSeer",
  authors: [{ name: "FutureSeer", url: "https://futureseer.app" }],
  openGraph: {
    title: "FutureSeer - AI-Powered Mystical Insights",
    description: "Discover your cosmic path with AI-powered astrology, numerology, tarot, and more mystical tools.",
    url: "https://futureseer.app",
    siteName: "FutureSeer",
    type: "website",
    images: [
      {
        url: localizedOgImagePath("en"),
        width: 1200,
        height: 630,
        alt: "FutureSeer - AI-Powered Mystical Insights",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FutureSeer - AI-Powered Mystical Insights",
    description: "Discover your cosmic path with AI-powered astrology, numerology, tarot, and more mystical tools.",
    site: "@futureseerapp",
    creator: "@futureseerapp",
    images: [localizedOgImagePath("en")],
  },
  other: {
    copyright: "FutureSeer (futureseer.app)",
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/icon-180.png", sizes: "180x180", type: "image/png" }],
  },
  ...(googleSiteVerification
    ? { verification: { google: googleSiteVerification } }
    : {}),
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        {/* Patch console before any other script so COOP/window.closed from Firebase popup is suppressed */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){if(typeof console==="undefined")return;var w=console.warn,e=console.error;function coop(msg){if(typeof msg!=="string")return false;return msg.indexOf("Cross-Origin-Opener-Policy")!==-1||(msg.indexOf("block")!==-1&&(msg.indexOf("window.closed")!==-1||msg.indexOf("window.close")!==-1));}function nextImgSizes(msg){if(typeof msg!=="string")return false;return msg.indexOf("Image with src")!==-1&&msg.indexOf("fill")!==-1&&msg.indexOf("sizes")!==-1&&msg.indexOf("missing")!==-1;}function preloadNotUsed(msg){if(typeof msg!=="string")return false;return msg.indexOf("preloaded using link preload")!==-1&&msg.indexOf("not used within")!==-1;}console.warn=function(){var m=Array.prototype.join.call(arguments," ");if(coop(m)||nextImgSizes(m)||preloadNotUsed(m))return;return w.apply(console,arguments);};console.error=function(){var m=Array.prototype.join.call(arguments," ");if(coop(m))return;return e.apply(console,arguments);};})();`,
          }}
        />
        {/* Remove layout CSS preload as soon as possible to avoid browser "preloaded but not used" warning (stylesheet still loads via normal link) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){function r(){var links=document.querySelectorAll('link[rel="preload"]');for(var i=0;i<links.length;i++){var h=links[i].getAttribute('href');if(h&&h.indexOf('layout.css')!==-1){links[i].remove();break;}}}setTimeout(r,0);document.addEventListener('DOMContentLoaded',r);})();`,
          }}
        />
      </head>
      <body className="starfield-ultra-sharp min-h-screen overflow-x-hidden font-sans" suppressHydrationWarning>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var ua=(typeof navigator!=='undefined'&&navigator.userAgent)?navigator.userAgent:'';var width=(typeof window!=='undefined'&&window.innerWidth)?window.innerWidth:0;var isMobile=width>0&&width<768;var platformClass=isMobile?'platform-android':'platform-web';var dataPlatform=isMobile?'android':'web';var mobileOS='desktop';if(isMobile){if(/iPhone|iPad|iPod/i.test(ua))mobileOS='ios';else if(/Android/i.test(ua))mobileOS='android';}document.body.classList.remove('platform-android','platform-web');document.body.classList.add(platformClass);document.documentElement.setAttribute('data-platform',dataPlatform);document.documentElement.setAttribute('data-mobile-os',mobileOS);var isMac=!/iPhone|iPad|iPod/i.test(ua)&&/Macintosh|Mac OS X/i.test(ua);var designSystem=isMobile?(mobileOS==='ios'?'konsta-ios':'material'):(isMac?'konsta-ios':'devotionist');document.documentElement.setAttribute('data-design-system',designSystem);document.body.classList.remove('k-ios','k-material');if(designSystem==='konsta-ios')document.body.classList.add('k-ios');if(designSystem==='material')document.body.classList.add('k-material');})();`,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){if(typeof window==='undefined')return;if(!('serviceWorker' in navigator))return;var isProd=window.location.hostname!=='localhost'&&window.location.hostname!=='127.0.0.1';if(!isProd)return;navigator.serviceWorker.getRegistrations().then(function(regs){return Promise.all((regs||[]).map(function(r){return r.unregister();}));}).catch(function(){});if('caches' in window){caches.keys().then(function(keys){return Promise.all((keys||[]).filter(function(k){return k.indexOf('futureseer-')===0;}).map(function(k){return caches.delete(k);}));}).catch(function(){});} })();`,
          }}
        />
        <DeferredViewportHeightSync />
        <PlatformClassProvider />
        <SchemaMarkup />
        <DeferredFirestoreErrorSuppressor />
        <ClientProviders>
          <FeedbackProvider>
            <main role="main" id="main-content">
              <div className="sticky top-0 z-[200] flex-shrink-0 w-full min-h-[52px] bg-surface">
                <Header />
              </div>
              <ErrorBoundary>
                <I18nProvider>
                  <DeferredAnalyticsInitializer />
                  <div className="fs-main-content min-w-0 pl-0">
                    {children}
                  </div>
                  <OnboardingTour />
                  {/* BottomNavBar handles its own platform visibility internally */}
                  <BottomNavBar />
                  <Toaster />
                </I18nProvider>
              </ErrorBoundary>
            </main>
            <FloatingTipJar />
            <MysticalFeedback />
          </FeedbackProvider>
        </ClientProviders>
      </body>
    </html>
  )
}
