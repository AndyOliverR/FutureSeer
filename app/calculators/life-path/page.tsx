import type { Metadata } from 'next'
import Link from 'next/link'
import { EnhancedFooter } from '@/components/enhanced-footer'
import { LifePathCalculatorForm } from '@/components/calculators/LifePathCalculatorForm'
import { buildPageMetadata } from '@/lib/seo/buildPageMetadata'
import { buildLearnArticleSchema } from '@/components/schema-markup'
import { normalizeSeoBaseUrl } from '@/lib/seo/locales'

const site = normalizeSeoBaseUrl(process.env.NEXT_PUBLIC_APP_URL ?? 'https://futureseer.app')

export const metadata: Metadata = buildPageMetadata({
  path: '/calculators/life-path',
  title: 'Life Path Number Calculator (Free) | FutureSeer',
  description:
    'Free life path number calculator from your birth date. Learn what the number means, then explore full numerology and astrology reports on FutureSeer.',
})

export default function LifePathCalculatorPage() {
  const url = `${site}/calculators/life-path`
  const schema = buildLearnArticleSchema({
    url,
    title: 'Life Path Number Calculator',
    description:
      'Calculate your Pythagorean-style life path number from birth date and continue into FutureSeer numerology.',
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
          <span className="text-white/70">Life path</span>
        </nav>
        <h1 className="text-2xl md:text-3xl font-bold text-amber-400 mb-4 font-heading">
          Free life path number calculator
        </h1>
        <p className="text-white/75 text-sm md:text-base mb-8 border-l-2 border-amber-500/40 pl-4">
          Enter your birth date for a classic life path number. This page is public and citeable; personalized
          multi-number reports live in the Numerology tool after you generate your profile.
        </p>
        <LifePathCalculatorForm />
        <section className="mt-10 space-y-3 text-sm text-white/75">
          <h2 className="text-lg font-semibold text-amber-300">How it is calculated</h2>
          <p>
            Digits of the day, month, and year are reduced, then combined and reduced again to a single digit
            (Pythagorean-style). FutureSeer’s full Numerology report adds name-based numbers and chart context.
          </p>
          <p>
            Related reading:{' '}
            <Link href="/learn/lucky-number-numerology-astrology" className="text-amber-300 underline">
              Lucky numbers across numerology and astrology
            </Link>
            .
          </p>
        </section>
      </main>
      <EnhancedFooter />
    </div>
  )
}
