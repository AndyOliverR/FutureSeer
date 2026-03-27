import type { Metadata } from "next"
import Link from "next/link"
import { LEARN_ARTICLES } from "@/app/learn/learnArticles"
import { EnhancedFooter } from "@/components/enhanced-footer"

const site = process.env.NEXT_PUBLIC_APP_URL ?? "https://futureseer.app"

export const metadata: Metadata = {
  title: "Learn | Guides & Articles | FutureSeer",
  description:
    "Read original guides on Vastu, astrology, numerology, multi-divination, and community—then open the matching tools on FutureSeer.",
  alternates: { canonical: `${site}/learn` },
}

export default function LearnIndexPage() {
  const items = Object.values(LEARN_ARTICLES).sort((a, b) => a.title.localeCompare(b.title))

  return (
    <div className="min-h-screen flex flex-col starfield-ultra-sharp">
      <div className="relative flex-1 z-20 bg-transparent flex flex-col w-full">
        <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 pt-20 pb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-amber-400 mb-2 text-center font-heading">
            Learn
          </h1>
          <p className="text-white/80 text-center text-sm md:text-base mb-10 max-w-2xl mx-auto">
            Original articles on Vastu, astrology, numerology, and how FutureSeer ties tools together. For personalized readings,{" "}
            <Link href="/signup" className="text-amber-400 hover:underline">
              create an account
            </Link>{" "}
            and open the linked tools.
          </p>
          <ul className="space-y-4">
            {items.map((article) => (
              <li key={article.slug}>
                <Link
                  href={`/learn/${article.slug}`}
                  className="block rounded-2xl border border-amber-500/25 bg-slate-900/70 hover:bg-slate-800/80 hover:border-amber-500/45 transition-colors p-5"
                >
                  <h2 className="text-lg font-semibold text-amber-300 mb-1">{article.title}</h2>
                  <p className="text-sm text-white/70">{article.description}</p>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-10 text-center text-xs text-white/50">
            More guides will be added over time.{" "}
            <Link href="/community" className="text-amber-500/90 hover:underline">
              Join the community
            </Link>{" "}
            to discuss topics with other seekers.
          </p>
        </div>
      </div>
      <EnhancedFooter />
    </div>
  )
}
