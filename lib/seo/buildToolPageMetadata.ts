import type { Metadata } from "next"
import { toolManager } from "@/lib/services/toolManager"
import { normalizeSeoBaseUrl } from "@/lib/seo/locales"

const site = normalizeSeoBaseUrl(process.env.NEXT_PUBLIC_APP_URL ?? "https://futureseer.app")

/** URL folder segment → toolManager config slug when they differ. */
const PATH_SEGMENT_TO_TOOL_SLUG: Record<string, string> = {
  "13-signs-zodiac": "thirteen-signs-zodiac",
  vedic: "vedic-astrology",
}

function humanizeSegment(segment: string): string {
  return segment
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
}

function resolveToolSlug(pathSegment: string): string {
  const alias = PATH_SEGMENT_TO_TOOL_SLUG[pathSegment]
  if (alias && toolManager.getTool(alias)) return alias
  if (toolManager.getTool(pathSegment)) return pathSegment
  return alias ?? pathSegment
}

/**
 * Per-tool canonical metadata for static routes under `app/tools/{segment}/`.
 * Priority tools with rich copy in `toolIntros.ts` keep their dedicated layouts.
 */
export function buildToolPageMetadata(pathSegment: string): Metadata {
  const path = `/tools/${pathSegment}`
  const canonical = `${site}${path}`
  const configSlug = resolveToolSlug(pathSegment)
  const tool = toolManager.getTool(configSlug)
  const name = tool?.name ?? humanizeSegment(pathSegment)
  const title = `${name} | FutureSeer`
  const description =
    tool?.description ??
    `Use ${name} on FutureSeer — AI-assisted mystical guidance with persistent reports in one account.`

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
