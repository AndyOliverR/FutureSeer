import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { VastuCompassPrecisionClient } from "./VastuCompassPrecisionClient"

const VALID = ["8", "16", "32", "45"] as const

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
    return { title: "Compass | FutureSeer" }
  }
  const titles: Record<string, string> = {
    "8": "8-direction Vastu compass",
    "16": "16-zone Vastu compass",
    "32": "32-pada Vastu compass",
    "45": "45-field Vastu compass",
  }
  return {
    title: `${titles[precision] ?? "Vastu compass"} | FutureSeer`,
    description:
      "Vastu compass reference and live heading (on supported devices). North-up preview; rotate with device when compass is available.",
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
