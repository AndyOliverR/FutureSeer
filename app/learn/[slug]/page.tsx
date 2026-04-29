import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { LEARN_ARTICLES, LEARN_SLUGS } from "@/app/learn/learnArticles"
import { buildLearnArticleSchema } from "@/components/schema-markup"
import { EnhancedFooter } from "@/components/enhanced-footer"
import { buildPathLocaleAlternates, normalizeSeoBaseUrl } from "@/lib/seo/locales"

const site = normalizeSeoBaseUrl(process.env.NEXT_PUBLIC_APP_URL ?? "https://futureseer.app")

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return LEARN_SLUGS.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = LEARN_ARTICLES[slug]
  if (!article) return { title: "Not found" }
  return {
    title: `${article.title} | FutureSeer Learn`,
    description: article.description,
    alternates: {
      canonical: `${site}/learn/${slug}`,
      languages: buildPathLocaleAlternates(site, `/learn/${slug}`),
    },
    openGraph: {
      title: article.title,
      description: article.description,
      url: `${site}/learn/${slug}`,
      siteName: "FutureSeer",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.description,
      site: "@futureseerapp",
      creator: "@futureseerapp",
    },
  }
}

const TOOL_LINKS: { href: string; label: string }[] = [
  { href: "/tools/vastu", label: "Vastu" },
  { href: "/tools/feng-shui", label: "Feng Shui" },
  { href: "/tools/numerology", label: "Numerology" },
  { href: "/tools/vedic", label: "Vedic astrology" },
  { href: "/tools/western-astrology", label: "Western astrology" },
  { href: "/tools/tarot", label: "Tarot" },
  { href: "/daily", label: "Daily" },
  { href: "/seer", label: "Ask the Seer" },
  { href: "/community", label: "Community" },
]

export default async function LearnArticlePage({ params }: Props) {
  const { slug } = await params
  const article = LEARN_ARTICLES[slug]
  if (!article) notFound()
  const articleUrl = `${site}/learn/${slug}`
  const learnArticleSchema = buildLearnArticleSchema({
    url: articleUrl,
    title: article.title,
    description: article.description,
  })

  return (
    <div className="min-h-screen flex flex-col starfield-ultra-sharp">
      <article className="relative flex-1 z-20 bg-transparent flex flex-col w-full">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(learnArticleSchema) }}
        />
        <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 pt-20 pb-12">
          <nav className="text-sm text-amber-500/90 mb-6">
            <Link href="/learn" className="hover:underline">
              Learn
            </Link>
            <span className="text-white/40 mx-2">/</span>
            <span className="text-white/70">{article.title}</span>
          </nav>
          <h1 className="text-2xl md:text-3xl font-bold text-amber-400 mb-4 font-heading">{article.title}</h1>
          <p className="text-white/75 text-sm md:text-base mb-8 border-l-2 border-amber-500/40 pl-4">{article.description}</p>

          {article.sections.map((section, i) => (
            <section key={i} className="mb-8">
              {section.heading ? (
                <h2 className="text-xl font-semibold text-amber-300 mb-3">{section.heading}</h2>
              ) : null}
              {section.body.map((para, j) => (
                <p key={j} className="text-white/80 text-sm md:text-base leading-relaxed mb-4 last:mb-0">
                  {para.split(/(\*\*[^*]+\*\*)/g).map((part, k) => {
                    if (part.startsWith("**") && part.endsWith("**")) {
                      return (
                        <strong key={k} className="text-amber-200 font-semibold">
                          {part.slice(2, -2)}
                        </strong>
                      )
                    }
                    return part
                  })}
                </p>
              ))}
            </section>
          ))}

          <div className="rounded-2xl border border-amber-500/20 bg-slate-900/60 p-5 mt-10">
            <h2 className="text-sm font-bold uppercase tracking-widest text-amber-500/90 mb-3">Related tools</h2>
            <div className="flex flex-wrap gap-2">
              {TOOL_LINKS.map((t) => (
                <Link
                  key={t.href}
                  href={t.href}
                  className="text-xs md:text-sm px-3 py-1.5 rounded-full bg-amber-950/50 border border-amber-500/30 text-amber-200 hover:bg-amber-900/40 hover:border-amber-400/50 transition-colors"
                >
                  {t.label}
                </Link>
              ))}
            </div>
          </div>

          <p className="mt-8 text-center">
            <Link href="/learn" className="text-amber-400 hover:underline text-sm">
              ← All guides
            </Link>
          </p>
        </div>
      </article>
      <EnhancedFooter />
    </div>
  )
}
