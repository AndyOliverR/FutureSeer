import type { Metadata } from "next";
import { Header } from "@/components/header";
import { EnhancedFooter } from "@/components/enhanced-footer";
import { TipJarPageContent } from "@/components/TipJarPageContent";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Tip Jar - Support FutureSeer",
  description: "Show your appreciation with a one-time tip. Your contribution helps keep FutureSeer accessible to everyone.",
  keywords: "tip jar, support FutureSeer, donation, contribution, appreciation",
  openGraph: {
    title: "Tip Jar - Support FutureSeer",
    description: "Show your appreciation with a one-time tip. Your contribution helps keep FutureSeer accessible to everyone.",
    type: "website",
    url: "https://futureseer.app/tip-jar",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tip Jar - Support FutureSeer",
    description: "Show your appreciation with a one-time tip.",
  },
};

export default function TipJarPage() {
  return (
    <div className="min-h-screen flex flex-col starfield-ultra-sharp">
      <Header />

      <div className="relative flex-1 z-20 bg-transparent flex flex-col w-full">
        <div className="max-w-7xl mx-auto w-full">
          <section className="px-4 sm:px-6 pt-20 pb-20 max-w-4xl mx-auto">
            <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300">
              <CardContent className="p-8 md:p-12">
                <TipJarPageContent />
              </CardContent>
            </Card>
          </section>
        </div>
      </div>

      <EnhancedFooter />
    </div>
  );
}
