import { notFound, redirect } from 'next/navigation'
import { isGrowthShortLinksEnabled } from '@/lib/growthFlags'
import { CAMPAIGN_SHORT_LINK_TARGETS } from '@/lib/campaignShortLinks'

type Props = { params: Promise<{ campaign: string }> }

/**
 * Short marketing URLs: /l/angel-numbers → learn hub entry (feature-flagged).
 */
export default async function CampaignShortLinkPage({ params }: Props) {
  const { campaign } = await params
  if (!isGrowthShortLinksEnabled()) notFound()
  const entry = CAMPAIGN_SHORT_LINK_TARGETS[campaign]
  if (!entry) notFound()
  redirect(entry.href)
}
