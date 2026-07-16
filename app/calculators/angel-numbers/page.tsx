import type { Metadata } from 'next'
import Link from 'next/link'
import { EnhancedFooter } from '@/components/enhanced-footer'
import { AngelNumberCalculatorForm } from '@/components/calculators/AngelNumberCalculatorForm'
import { buildPageMetadata } from '@/lib/seo/buildPageMetadata'
import { buildLearnArticleSchema } from '@/components/schema-markup'
import { normalizeSeoBaseUrl } from '@/lib/seo/locales'

const site = normalizeSeoBaseUrl(process.env.NEXT_PUBLIC_APP_URL ?? 'https://futureseer.app')

export const metadata: Metadata = buildPageMetadata({
  path: '/calculators/angel-numbers',
  title: 'Angel Number Meanings (Free Lookup) | FutureSeer',
  description:
    'Look up common angel number sequences like 111, 444, and 777. Free citeable guide with CTAs into FutureSeer’s Angel Numbers tool.',
})

export default function AngelNumbersCalculatorPage() {
  const url = `${site}/calculators/angel-numbers`
  const schema = buildLearnArticleSchema({
    url,
    title: 'Angel Number Meanings Lookup',
    description:
      'Public meanings for repeating number sequences, with a path into FutureSeer’s full Angel Numbers experience.',
  })

  return (
    <div className="min-h-screen flex flex-col starfield-ultra-sharp">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <main className="relative flex-1 z-20 max-w-3xl mx-auto w-full px-4 sm:px-6 pt-20 pb-16">
        <nav className="text-sm text-amber-500/90 mb-6">
          <Link href="/" className="hover:underline">
            Home
          </Link>
          <span className="text-white/40 mx-2">/</span>
          <Link href="/catalog" className="hover:underline">
            Catalog
          </Link>
          <span className="text-white/40 mx-2">/</span>
          <span className="text-white/70">Angel numbers</span>
        </nav>
        <h1 className="text-2xl md:text-3xl font-bold text-amber-400 mb-4 font-heading">
          Angel number meanings (free lookup)
        </h1>
        <p className="text-white/75 text-sm md:text-base mb-8 border-l-2 border-amber-500/40 pl-4">
          Repeating numbers people notice on clocks and receipts. These short meanings are for reflection—not
          medical or financial advice. Sign in for a profile-based Angel Numbers reading on FutureSeer.
        </p>
        <AngelNumberCalculatorForm />
        <section className="mt-10 space-y-3 text-sm text-white/75">
          <h2 className="text-lg font-semibold text-amber-300">About this guide</h2>
          <p>
            Meanings here cover the most searched repeating sequences. Your full FutureSeer Angel Numbers tool can
            personalize themes after profile generation.
          </p>
          <p>
            Browse the{' '}
            <Link href="/catalog" className="text-amber-300 underline">
              knowledge catalog
            </Link>{' '}
            or{' '}
            <Link href="/pricing" className="text-amber-300 underline">
              pricing
            </Link>{' '}
            for how membership works.
          </p>
        </section>
      </main>
      <EnhancedFooter />
    </div>
  )
}
