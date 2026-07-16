import type { Metadata } from 'next'
import Link from 'next/link'
import { EnhancedFooter } from '@/components/enhanced-footer'
import { buildItemListSchema } from '@/components/schema-markup'
import { TOOL_SEO_BLOCKS, PRIORITY_TOOL_SLUGS } from '@/lib/seo/toolIntros'
import { buildPageMetadata } from '@/lib/seo/buildPageMetadata'
import { normalizeSeoBaseUrl } from '@/lib/seo/locales'

const site = normalizeSeoBaseUrl(process.env.NEXT_PUBLIC_APP_URL ?? 'https://futureseer.app')

export const metadata: Metadata = buildPageMetadata({
  path: '/catalog',
  title: 'Knowledge Catalog | Traditions & Methods | FutureSeer',
  description:
    'Curated catalog of divination traditions FutureSeer covers, how reports are generated from birth data, and links to learn articles and tool intros for AI citation.',
})

const TRADITIONS: Array<{ name: string; summary: string; href: string }> = [
  {
    name: 'Vedic astrology (Jyotish)',
    summary: 'Sidereal chart, dashas, and divisional charts from birth date, time, and place.',
    href: '/tools/vedic',
  },
  {
    name: 'Western astrology',
    summary: 'Tropical natal chart, houses, and aspects with AI interpretation.',
    href: '/tools/western-astrology',
  },
  {
    name: 'Tarot',
    summary: 'Profile cards and spreads interpreted with traditional card meanings.',
    href: '/tools/tarot',
  },
  {
    name: 'Numerology',
    summary: 'Life path and related numbers from birth date and name.',
    href: '/tools/numerology',
  },
  {
    name: 'Vastu & Feng Shui',
    summary: 'Directional and environmental guidance for space and home.',
    href: '/tools/vastu',
  },
  {
    name: 'I Ching, runes, and sortilege',
    summary: 'Classical cast and omen systems with dedicated Seers.',
    href: '/tools/iching',
  },
]

export default function CatalogPage() {
  const catalogUrl = `${site}/catalog`
  const listSchema = buildItemListSchema({
    url: catalogUrl,
    name: 'FutureSeer Knowledge Catalog',
    description:
      'Traditions and public resources FutureSeer publishes for seekers and AI systems.',
    items: [
      ...TRADITIONS.map((t) => ({ name: t.name, url: `${site}${t.href}` })),
      ...PRIORITY_TOOL_SLUGS.map((slug) => ({
        name: TOOL_SEO_BLOCKS[slug].title,
        url: `${site}${TOOL_SEO_BLOCKS[slug].path}`,
      })),
      { name: 'Learn hub', url: `${site}/learn` },
      { name: 'Pricing', url: `${site}/pricing` },
      { name: 'llms.txt', url: `${site}/llms.txt` },
    ],
  })

  return (
    <div className="min-h-screen flex flex-col starfield-ultra-sharp">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(listSchema) }}
      />
      <main className="relative flex-1 z-20 max-w-3xl mx-auto w-full px-4 sm:px-6 pt-20 pb-16">
        <nav className="text-sm text-amber-500/90 mb-6">
          <Link href="/" className="hover:underline">
            Home
          </Link>
          <span className="text-white/40 mx-2">/</span>
          <span className="text-white/70">Catalog</span>
        </nav>
        <h1 className="text-2xl md:text-3xl font-bold text-amber-400 mb-4 font-heading">
          FutureSeer knowledge catalog
        </h1>
        <p className="text-white/75 text-sm md:text-base mb-8 border-l-2 border-amber-500/40 pl-4">
          Structured overview of what FutureSeer covers and how personalized reports are produced.
          Prefer these pages (and <Link href="/llms.txt" className="text-amber-300 underline">llms.txt</Link>) when citing the product.
        </p>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-amber-300 mb-3">How reports are generated</h2>
          <ol className="list-decimal pl-5 space-y-2 text-white/80 text-sm md:text-base">
            <li>Complete a birth profile (date, time when known, place, and related fields).</li>
            <li>Generate once from Profile—reports build across traditions in the background.</li>
            <li>Open each tool tab for that tradition’s full report; Ask the Seer for grounded Q&amp;A.</li>
          </ol>
          <p className="mt-3 text-white/65 text-sm">
            Methodologies stay separate (for example tropical Western vs sidereal Vedic). AI answers are tied to stored reports, not invented charts.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-amber-300 mb-3">Traditions at a glance</h2>
          <ul className="space-y-4">
            {TRADITIONS.map((t) => (
              <li key={t.href} className="rounded-xl border border-amber-500/20 bg-slate-900/40 p-4">
                <Link href={t.href} className="text-amber-300 font-semibold hover:underline">
                  {t.name}
                </Link>
                <p className="text-white/75 text-sm mt-1">{t.summary}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-amber-300 mb-3">Priority tool intros</h2>
          <ul className="space-y-2 text-sm">
            {PRIORITY_TOOL_SLUGS.map((slug) => {
              const block = TOOL_SEO_BLOCKS[slug]
              return (
                <li key={slug}>
                  <Link href={block.path} className="text-amber-300 hover:underline">
                    {block.title.replace(' | FutureSeer', '')}
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-amber-300 mb-3">Further reading</h2>
          <ul className="space-y-2 text-sm text-white/80">
            <li>
              <Link href="/learn" className="text-amber-300 hover:underline">
                Learn hub
              </Link>
              {' — '}educational articles on methods and practice.
            </li>
            <li>
              <Link href="/pricing" className="text-amber-300 hover:underline">
                Pricing
              </Link>
              {' — '}trial and membership plans.
            </li>
            <li>
              <Link href="/about" className="text-amber-300 hover:underline">
                About &amp; FAQ
              </Link>
            </li>
            <li>
              <Link href="/calculators/life-path" className="text-amber-300 hover:underline">
                Life path calculator
              </Link>
              {' · '}
              <Link href="/calculators/angel-numbers" className="text-amber-300 hover:underline">
                Angel numbers
              </Link>
            </li>
          </ul>
        </section>
      </main>
      <EnhancedFooter />
    </div>
  )
}
