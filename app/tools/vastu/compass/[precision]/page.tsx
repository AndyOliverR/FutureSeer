import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { normalizeSeoBaseUrl } from "@/lib/seo/locales"
import { VastuCompassPrecisionClient } from "./VastuCompassPrecisionClient"

const VALID = ["8", "16", "32", "45"] as const
const siteBase = normalizeSeoBaseUrl(process.env.NEXT_PUBLIC_APP_URL ?? "https://futureseer.app")

export function generateStaticParams() {
  return VALID.map((precision) => ({ precision }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ precision: string }>
}): Promise<Metadata> {
  const { precision } = await params
  if (!VALID.includes(precision as (typeof VALID)[number])) {
    return {
      title: "Compass | FutureSeer",
      alternates: { canonical: `${siteBase}/tools/vastu/compass` },
      robots: { index: false, follow: true },
    }
  }
  const titles: Record<string, string> = {
    "8": "8-direction Vastu compass",
    "16": "16-zone Vastu compass",
    "32": "32-pada Vastu compass",
    "45": "45-field Vastu compass",
  }
  const canonical = `${siteBase}/tools/vastu/compass/${precision}`
  const title = `${titles[precision] ?? "Vastu compass"} | FutureSeer`
  const description =
    "Vastu compass reference and live heading (on supported devices). North-up preview; rotate with device when compass is available."

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "FutureSeer",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      site: "@futureseerapp",
      creator: "@futureseerapp",
    },
  }
}

export default async function VastuCompassPrecisionPage({
  params,
}: {
  params: Promise<{ precision: string }>
}) {
  const { precision } = await params
  if (!VALID.includes(precision as (typeof VALID)[number])) notFound()

  return <VastuCompassPrecisionClient precision={precision} />
}
