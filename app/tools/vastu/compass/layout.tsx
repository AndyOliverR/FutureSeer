import type { Metadata } from "next"
import { normalizeSeoBaseUrl } from "@/lib/seo/locales"

const site = normalizeSeoBaseUrl(process.env.NEXT_PUBLIC_APP_URL ?? "https://futureseer.app")
const canonical = `${site}/tools/vastu/compass`

export const metadata: Metadata = {
  title: "Vastu Compass | 4–45 Field Precision | FutureSeer",
  description:
    "Full-screen Vastu compass with live dial: four cardinals through 45 energy-field sectors (8°), plus 8, 16, and 32 precision.",
  alternates: { canonical },
  openGraph: {
    title: "Vastu Compass | FutureSeer",
    description:
      "Full-screen Vastu compass with live dial: four cardinals through 45 energy-field sectors.",
    url: canonical,
    siteName: "FutureSeer",
    type: "website",
  },
}

export default function VastuCompassLayout({ children }: { children: React.ReactNode }) {
  return children
}
