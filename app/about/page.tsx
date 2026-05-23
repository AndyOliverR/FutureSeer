import type { Metadata } from "next";
import Link from "next/link";
import { EnhancedFooter } from "@/components/enhanced-footer";
import { PersonalNote } from "@/components/about/PersonalNote";
import { AboutFAQ } from "@/components/about/AboutFAQ";
import { Button } from "@/components/ui/button";
import { buildLocalizedKeywordSet, normalizeSeoBaseUrl } from "@/lib/seo/locales";

const site = normalizeSeoBaseUrl(process.env.NEXT_PUBLIC_APP_URL ?? "https://futureseer.app");

export const metadata: Metadata = {
  title: "About FutureSeer - AI-Powered Mystical Insights",
  description: "Read the founder note, our mission, and common questions about FutureSeer.",
  alternates: { canonical: `${site}/about` },
  keywords: buildLocalizedKeywordSet([
    "about FutureSeer",
    "mystical AI",
    "astrology app",
    "divination tools",
    "innovation experiment",
    "guia mistica",
    "guide mystique",
    "mystische app",
    "jyotish ai",
    "神秘 指引",
  ]),
  openGraph: {
    title: "About FutureSeer - AI-Powered Mystical Insights",
    description: "Founder note, mission, and FAQ for FutureSeer.",
    type: "website",
    url: "https://futureseer.app/about",
  },
  twitter: {
    card: "summary_large_image",
    title: "About FutureSeer - AI-Powered Mystical Insights",
    description: "Founder note, mission, and FAQ for FutureSeer.",
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col starfield-ultra-sharp">
      <div className="relative flex-1 z-20 bg-transparent flex flex-col w-full">
        <div className="max-w-7xl mx-auto w-full">
          <PersonalNote />
          <section className="max-w-4xl mx-auto px-4 pb-10">
            <div className="rounded-2xl border border-amber-500/20 bg-slate-900/40 p-5 sm:p-6">
              <h2 className="text-amber-400 text-sm uppercase tracking-widest font-semibold mb-4">Mission</h2>
              <div className="grid gap-3 sm:grid-cols-3 text-sm">
                <div>
                  <p className="font-semibold text-white">AI + Tradition</p>
                  <p className="text-white/75">Precise and grounded interpretations.</p>
                </div>
                <div>
                  <p className="font-semibold text-white">One Platform</p>
                  <p className="text-white/75">Astrology, divination, and more in one place.</p>
                </div>
                <div>
                  <p className="font-semibold text-white">Inclusive Access</p>
                  <p className="text-white/75">Designed to be practical and accessible.</p>
                </div>
              </div>
            </div>
          </section>

          <AboutFAQ />
          
          <section className="text-center py-12 px-3 sm:px-4 md:px-6">
            <Link href="/tools">
              <Button variant="filled" className="bg-gradient-to-r from-[var(--m3-primary)] to-[var(--m3-tertiary)] text-[var(--m3-on-primary)] hover:from-[var(--m3-primary)]/90 hover:to-[var(--m3-tertiary)]/90 font-semibold px-8 py-4 m3-label-large rounded-xl m3-elevation-2 hover:m3-elevation-3 m3-elevation-transition m3-transition-emphasized m3-gpu-accelerated">
                Explore Tools
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
