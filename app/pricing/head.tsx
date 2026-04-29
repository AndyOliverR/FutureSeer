import { normalizeSeoBaseUrl } from "@/lib/seo/locales";

const siteBase = normalizeSeoBaseUrl(process.env.NEXT_PUBLIC_APP_URL ?? "https://futureseer.app");

export default function Head() {
  return (
    <>
      <title>FutureSeer Pricing - Membership Tiers and Localized Plans</title>
      <meta
        name="description"
        content="Explore FutureSeer memberships with localized pricing across regions. Compare monthly, quarterly, and annual plans for full mystical access."
      />
      <meta
        name="keywords"
        content="futureseer pricing, localized pricing, astrology app subscription, tarot membership, numerology premium, precio app astrologia, tarif application mystique, 占星 订阅"
      />
      <link rel="canonical" href={`${siteBase}/pricing`} />
    </>
  );
}
