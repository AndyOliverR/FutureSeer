/**
 * Affiliate link configuration for revenue generation.
 * Uses env vars for tags/URLs. Links open in new tab with nofollow.
 *
 * Gems: Directed to GIA/IGI/GRS certified sellers only (NOT Amazon).
 * Crystals, Vastu remedies, tarot, books: Amazon.
 */

const AMAZON_TAG = process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_TAG || ''
const AMAZON_DOMAIN = process.env.NEXT_PUBLIC_AMAZON_DOMAIN || 'amazon.com'
const ASTRO_CHARTS_URL = process.env.NEXT_PUBLIC_ASTRO_CHARTS_URL || 'https://astro-charts.com'
const CERTIFIED_GEMSTONE_URL =
  process.env.NEXT_PUBLIC_CERTIFIED_GEMSTONE_SELLER_URL?.trim() || ''

function encodeQuery(s: string): string {
  return encodeURIComponent(s.trim()).replace(/%20/g, '+')
}

/**
 * Amazon search URL with affiliate tag.
 * Use when no specific product ASIN is available.
 */
export function getAmazonSearchUrl(query: string): string {
  const base = `https://www.${AMAZON_DOMAIN}/s?k=${encodeQuery(query)}`
  return AMAZON_TAG ? `${base}&tag=${AMAZON_TAG}` : base
}

/**
 * Crystal / healing crystal - Amazon search.
 */
export function getCrystalAffiliateUrl(crystalName: string): string {
  const query = `${crystalName} crystal healing`
  return getAmazonSearchUrl(query)
}

/**
 * Navaratna / Vedic gemstone - Certified seller only (GIA/IGI/GRS).
 * We recommend GIA, IGI, or GRS certified gemstones from trusted sellers. Avoid uncertified sources.
 */
export function getCertifiedGemstoneUrl(gemstoneName: string): string {
  const base = CERTIFIED_GEMSTONE_URL.replace(/\/$/, '')
  if (!base) return ''
  if (base.includes('navratan.com')) {
    return `${base}?q=${encodeURIComponent(gemstoneName.trim())}`
  }
  return base
}

/**
 * Navaratna / Vedic gemstone - links to certified seller (not Amazon).
 */
export function getGemstoneAffiliateUrl(gemstoneName: string): string {
  return getCertifiedGemstoneUrl(gemstoneName)
}

/**
 * Vastu / Feng Shui remedy - Amazon search (brass wire, pyramids, copper items, etc.).
 */
export function getVastuRemedyAffiliateUrl(query: string): string {
  return getAmazonSearchUrl(`${query} vastu remedy`)
}

/**
 * Tarot deck - Amazon search.
 */
export function getTarotDeckAffiliateUrl(deckName?: string): string {
  const query = deckName ? `${deckName} tarot deck` : 'tarot deck'
  return getAmazonSearchUrl(query)
}

/**
 * Astrology / occult book - Amazon search.
 */
export function getBookAffiliateUrl(bookTitle: string): string {
  return getAmazonSearchUrl(bookTitle)
}

/**
 * Astro-Charts - free birth chart calculator.
 * Add affiliate param when available from their program.
 */
export function getBirthChartUrl(): string {
  return ASTRO_CHARTS_URL
}

/**
 * Astro-Charts - synastry chart tool.
 */
export function getSynastryChartUrl(): string {
  return `${ASTRO_CHARTS_URL}/synastry-chart/`
}

/**
 * Check if affiliate links are configured (Amazon tag or Astro-Charts).
 */
export function hasAffiliateConfig(): boolean {
  return !!(AMAZON_TAG || ASTRO_CHARTS_URL)
}
