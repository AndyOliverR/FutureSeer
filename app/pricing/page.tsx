import { FutureSeerWordmark } from '@/components/brand/FutureSeerWordmark'
import { PricingPublicSummary } from '@/components/pricing/PricingPublicSummary'
import { PricingPageClient } from '@/components/pricing/PricingPageClient'
import { buildFaqPageSchema } from '@/components/schema-markup'
import { buildSoftwareApplicationOffers } from '@/lib/seo/publicPricingCatalog'
import { PRICING_FAQ } from '@/lib/seo/faqCatalog'
import { normalizeSeoBaseUrl } from '@/lib/seo/locales'

const site = normalizeSeoBaseUrl(process.env.NEXT_PUBLIC_APP_URL ?? 'https://futureseer.app')

export default function PricingPage() {
  const pricingUrl = `${site}/pricing`
  const faqSchema = buildFaqPageSchema({ url: pricingUrl, faqs: PRICING_FAQ })
  const offersSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'FutureSeer Pricing',
    url: pricingUrl,
    description:
      'FutureSeer membership plans: 30-day trial, then Coffee (monthly), Treat (quarterly), or Hamper (annual).',
    mainEntity: {
      '@type': 'SoftwareApplication',
      name: 'FutureSeer',
      applicationCategory: 'LifestyleApplication',
      operatingSystem: 'Web',
      offers: buildSoftwareApplicationOffers(),
    },
  }

  return (
    <div className="starfield-ultra-sharp min-h-screen py-12 px-3 sm:px-4 md:px-6 pb-32 md:pb-12 overflow-x-hidden relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(offersSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <FutureSeerWordmark href="/" size="lg" className="absolute top-4 left-4 z-50" />

      <div className="max-w-7xl mx-auto pt-8" data-onboarding="pricing">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-3 flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
            <FutureSeerWordmark size="lg" className="inline-block" />
            <span className="text-white font-bold normal-case tracking-normal">membership plans</span>
          </h1>
          <p className="text-white/80 text-sm md:text-base max-w-2xl mx-auto">
            Start with a 30-day trial, then choose monthly, quarterly, or annual membership.
          </p>
          <p className="text-white/70 text-xs md:text-sm max-w-2xl mx-auto mt-3 leading-relaxed">
            You are not buying another horoscope feed—you are backing the full generate-once library plus Ask the Seer,
            which reasons across every stored report in your account.
          </p>
        </div>

        <PricingPublicSummary />
        <PricingPageClient />
      </div>
    </div>
  )
}
