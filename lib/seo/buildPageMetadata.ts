import type { Metadata } from "next"
import { normalizeSeoBaseUrl } from "@/lib/seo/locales"

const site = normalizeSeoBaseUrl(process.env.NEXT_PUBLIC_APP_URL ?? "https://futureseer.app")

export type PageMetadataInput = {
  /** Path including leading slash, e.g. `/pricing` */
  path: string
  title: string
  description: string
  noindex?: boolean
}

/** Canonical + OG metadata for marketing/legal/static routes. */
export function buildPageMetadata(input: PageMetadataInput): Metadata {
  const path = input.path.startsWith("/") ? input.path : `/${input.path}`
  const url = `${site}${path === "/" ? "" : path}`
  const canonical = path === "/" ? `${site}/` : url

  return {
    title: input.title,
    description: input.description,
    alternates: { canonical },
    robots: input.noindex
      ? { index: false, follow: true }
      : { index: true, follow: true },
    openGraph: {
      title: input.title,
      description: input.description,
      url: canonical,
      siteName: "FutureSeer",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
    },
  }
}

export function buildToolsIndexMetadata(): Metadata {
  return buildPageMetadata({
    path: "/tools",
    title: "FutureSeer Tools — 50+ Divination Systems",
    description:
      "Explore 50+ divination systems in one account: Vedic and Western astrology, tarot, numerology, I Ching, runes, and more on FutureSeer.",
  })
}

export function buildAuthPageMetadata(kind: "signin" | "signup"): Metadata {
  const isSignUp = kind === "signup"
  return buildPageMetadata({
    path: isSignUp ? "/signup" : "/signin",
    title: isSignUp ? "Sign Up | FutureSeer" : "Sign In | FutureSeer",
    description: isSignUp
      ? "Create your FutureSeer account for AI-powered mystical insights and persistent readings."
      : "Sign in to FutureSeer to access your mystical profile, saved reports, and Ask the Seer.",
    noindex: true,
  })
}
