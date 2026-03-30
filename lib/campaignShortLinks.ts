/**
 * Short paths for bios and ads: /l/[campaign] → learn or tool (when NEXT_PUBLIC_GROWTH_SHORT_LINKS_ENABLED=1).
 */

export type CampaignShortLinkEntry = {
  /** In-app path (absolute from site root) */
  href: string
  description: string
}

/** Keys are URL segments: futureseer.app/l/angel-numbers */
export const CAMPAIGN_SHORT_LINK_TARGETS: Record<string, CampaignShortLinkEntry> = {
  'angel-numbers': {
    href: '/learn/angel-numbers-why-you-keep-seeing-111',
    description: 'Angel numbers and repeating digits',
  },
  synastry: {
    href: '/learn/synastry-relationship-patterns-intro',
    description: 'Relationship charts and patterns',
  },
  vedic: {
    href: '/learn/vedic-birth-chart-what-to-expect',
    description: 'Vedic astrology intro',
  },
  tarot: {
    href: '/learn/tarot-reflection-and-questions',
    description: 'Tarot as structured reflection',
  },
  vastu: {
    href: '/learn/vastu-home-energy-quick-intro',
    description: 'Vastu and directional harmony',
  },
}
