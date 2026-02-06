import type { Metadata } from "next";
import { Header } from "@/components/header";
import { EnhancedFooter } from "@/components/enhanced-footer";
import { SharePageContent } from "@/components/SharePageContent";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Share FutureSeer",
  description: "Share FutureSeer with friends. Use native share, social media, or copy your referral link.",
  keywords: "share FutureSeer, referral, invite",
  openGraph: {
    title: "Share FutureSeer",
    description: "Share FutureSeer with friends. Use native share, social media, or copy your referral link.",
    type: "website",
    url: "https://futureseer.app/share",
  },
  twitter: {
    card: "summary_large_image",
    title: "Share FutureSeer",
    description: "Share FutureSeer with friends.",
  },
};

export default function SharePage() {
  return (
    <div className="min-h-screen flex flex-col starfield-ultra-sharp">
      <Header />

      <div className="relative flex-1 z-20 bg-transparent flex flex-col w-full">
        <div className="max-w-7xl mx-auto w-full">
          <section className="px-3 sm:px-4 md:px-6 pt-20 pb-20 max-w-4xl mx-auto">
            <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300">
              <CardContent className="p-4 sm:p-6 md:p-8 lg:p-12">
                <SharePageContent />
              </CardContent>
            </Card>
          </section>
        </div>
      </div>

      <EnhancedFooter />
    </div>
  );
}
