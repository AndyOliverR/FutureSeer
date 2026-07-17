/**
 * @jest-environment node
 */

import { lifePathFromIsoDate, lookupAngelNumber } from '@/lib/seo/publicCalculators'
import { buildSoftwareApplicationOffers } from '@/lib/seo/publicPricingCatalog'
import { PRODUCT_FAQ } from '@/lib/seo/faqCatalog'
import { buildFaqPageSchema } from '@/components/schema-markup'
import { LEARN_ARTICLES } from '@/app/learn/learnArticles'

describe('AI citation helpers', () => {
  it('computes life path from the selected calendar date in every timezone', () => {
    const previousTimezone = process.env.TZ

    try {
      process.env.TZ = 'UTC'
      expect(lifePathFromIsoDate('2023-11-11')?.number).toBe(11)

      process.env.TZ = 'America/Los_Angeles'
      expect(lifePathFromIsoDate('2023-11-11')?.number).toBe(11)
      expect(lifePathFromIsoDate('1990-01-15')?.number).toBe(8)
    } finally {
      if (previousTimezone === undefined) {
        delete process.env.TZ
      } else {
        process.env.TZ = previousTimezone
      }
    }
  })

  it('looks up angel number sequences', () => {
    expect(lookupAngelNumber('111')?.title).toBe('Alignment')
    expect(lookupAngelNumber('1111')?.sequence).toBe('111')
    expect(lookupAngelNumber('42')).toBeNull()
  })

  it('builds non-zero software offers including free trial', () => {
    const offers = buildSoftwareApplicationOffers()
    expect(offers.length).toBeGreaterThanOrEqual(4)
    expect(offers.some((o) => o.price === '0')).toBe(true)
    expect(offers.some((o) => o.price === '9.99')).toBe(true)
  })

  it('builds FAQPage schema from product FAQ', () => {
    const schema = buildFaqPageSchema({
      url: 'https://futureseer.app/about',
      faqs: PRODUCT_FAQ,
    })
    expect(schema['@type']).toBe('FAQPage')
    expect(Array.isArray(schema.mainEntity)).toBe(true)
    expect((schema.mainEntity as unknown[]).length).toBe(PRODUCT_FAQ.length)
  })

  it('includes new citation learn articles', () => {
    expect(LEARN_ARTICLES['birth-time-accuracy-for-charts']).toBeDefined()
    expect(LEARN_ARTICLES['vedic-vs-western-on-futureseer']).toBeDefined()
    expect(LEARN_ARTICLES['how-ask-the-seer-uses-your-reports']).toBeDefined()
    expect(LEARN_ARTICLES['generate-once-report-library']).toBeDefined()
    expect(LEARN_ARTICLES['lucky-colour-and-favourable-shades']).toBeDefined()
  })
})
