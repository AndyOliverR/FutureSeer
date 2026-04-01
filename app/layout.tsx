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
  DeferredServiceWorkerRegistration,
  DeferredViewportHeightSync,
} from "@/components/DeferredLayoutComponents"
import { PlatformClassProvider } from "@/components/PlatformClassProvider"

export const metadata: Metadata = {
  title: "FutureSeer - AI-Powered Mystical Insights",
  description: "Discover your cosmic path with AI-powered astrology, numerology, tarot, and more mystical tools.",
  manifest: "/manifest.json",
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
            __html: `(function(){var w=typeof window!=='undefined'?window.innerWidth:0;var ua=typeof navigator!=='undefined'&&navigator.userAgent?navigator.userAgent:'';var ds='material';if(w>=768){document.body.classList.add('platform-web');document.documentElement.setAttribute('data-platform','web');document.documentElement.setAttribute('data-mobile-os','desktop');var isMac=!/iPhone|iPad|iPod/i.test(ua)&&/Macintosh|Mac OS X/i.test(ua);ds=isMac?'konsta-ios':'devotionist';document.documentElement.setAttribute('data-design-system',ds);document.body.classList.remove('k-ios','k-material');if(ds==='konsta-ios')document.body.classList.add('k-ios');else if(ds==='material')document.body.classList.add('k-material');return;}var mq=typeof window.matchMedia!=='undefined'&&window.matchMedia('(max-width: 767px)').matches;var vv=window.visualViewport&&window.visualViewport.width>0&&window.visualViewport.width<768;var isSmall=(w>0&&w<768)||mq||!!vv;var cls=isSmall?'platform-android':'platform-web';document.body.classList.add(cls);document.documentElement.setAttribute('data-platform',cls==='platform-android'?'android':'web');var os=isSmall?(/iPhone|iPad|iPod/i.test(ua)?'ios':/Android/i.test(ua)?'android':'desktop'):'desktop';document.documentElement.setAttribute('data-mobile-os',os);ds=isSmall?(os==='ios'?'konsta-ios':os==='android'?'material':'material'):'devotionist';document.documentElement.setAttribute('data-design-system',ds);document.body.classList.remove('k-ios','k-material');if(ds==='konsta-ios')document.body.classList.add('k-ios');else if(ds==='material')document.body.classList.add('k-material');})();`,
          }}
        />
        <DeferredViewportHeightSync />
        <PlatformClassProvider />
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
                  <div className="fs-main-content min-w-0 pl-0">
                    {children}
                  </div>
                  {/* BottomNavBar handles its own platform visibility internally */}
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
