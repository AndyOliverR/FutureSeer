import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";
import { EnhancedFooter } from "@/components/enhanced-footer";
import { PersonalNote } from "@/components/about/PersonalNote";
import { AboutSectionSkeleton } from "@/components/about/AboutSectionSkeleton";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About FutureSeer - AI-Powered Mystical Insights",
  description: "Learn about FutureSeer, where ancient wisdom meets artificial intelligence. Discover our NASA-validated astronomical calculations, 60+ divination tools, and innovation experiment approach to mystical insights.",
  keywords: "about FutureSeer, mystical AI, astrology app, NASA validated, Swiss Ephemeris, divination tools, innovation experiment",
  openGraph: {
    title: "About FutureSeer - AI-Powered Mystical Insights",
    description: "Learn about FutureSeer, where ancient wisdom meets artificial intelligence. Discover our NASA-validated astronomical calculations, 60+ divination tools, and innovation experiment approach.",
    type: "website",
    url: "https://futureseer.app/about",
  },
  twitter: {
    card: "summary_large_image",
    title: "About FutureSeer - AI-Powered Mystical Insights",
    description: "Learn about FutureSeer, where ancient wisdom meets artificial intelligence.",
  },
};

// Lazy load below-the-fold components for better performance
const AboutHowItWorks = dynamic(() => import("@/components/about/AboutHowItWorks").then(mod => ({ default: mod.AboutHowItWorks })), {
  loading: () => <AboutSectionSkeleton />
});

const AboutPricing = dynamic(() => import("@/components/about/AboutPricing").then(mod => ({ default: mod.AboutPricing })), {
  loading: () => <AboutSectionSkeleton />
});

const AboutReferral = dynamic(() => import("@/components/about/AboutReferral").then(mod => ({ default: mod.AboutReferral })), {
  loading: () => <AboutSectionSkeleton />
});

const AboutInnovation = dynamic(() => import("@/components/about/AboutInnovation").then(mod => ({ default: mod.AboutInnovation })), {
  loading: () => <AboutSectionSkeleton />
});

const AboutFeedback = dynamic(() => import("@/components/about/AboutFeedback").then(mod => ({ default: mod.AboutFeedback })), {
  loading: () => <AboutSectionSkeleton />
});

const AboutStandards = dynamic(() => import("@/components/about/AboutStandards").then(mod => ({ default: mod.AboutStandards })), {
  loading: () => <AboutSectionSkeleton />
});

const AboutFAQ = dynamic(() => import("@/components/about/AboutFAQ").then(mod => ({ default: mod.AboutFAQ })), {
  loading: () => <AboutSectionSkeleton />
});

const AboutValueProposition = dynamic(() => import("@/components/about/AboutValueProposition").then(mod => ({ default: mod.AboutValueProposition })), {
  loading: () => <AboutSectionSkeleton />
});

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col starfield-ultra-sharp">
      <div className="relative flex-1 z-20 bg-transparent flex flex-col w-full">
        <div className="max-w-7xl mx-auto w-full">
          {/* Personal Note Section - Above the fold, no lazy loading */}
          <PersonalNote />

          {/* Why FutureSeer - problem, solution, differentiation, fit, promise */}
          <AboutValueProposition />
          
          {/* Below-the-fold sections - Lazy loaded */}
          <AboutHowItWorks />
          <AboutPricing />
          <AboutReferral />
          <AboutInnovation />
          <AboutFeedback />
          <AboutStandards />
          <AboutFAQ />
          
          {/* CTA Section */}
          <section className="text-center py-12 px-3 sm:px-4 md:px-6">
            <Link href="/signup">
              <Button variant="filled" className="bg-gradient-to-r from-[var(--m3-primary)] to-[var(--m3-tertiary)] text-[var(--m3-on-primary)] hover:from-[var(--m3-primary)]/90 hover:to-[var(--m3-tertiary)]/90 font-semibold px-8 py-4 m3-label-large rounded-xl m3-elevation-2 hover:m3-elevation-3 m3-elevation-transition m3-transition-emphasized m3-gpu-accelerated">
                Join the Innovation Experiment
              </Button>
            </Link>
          </section>
        </div>
      </div>
      
      {/* Footer */}
      <EnhancedFooter />
    </div>
  );
}
