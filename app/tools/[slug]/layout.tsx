import type { Metadata } from "next"
import { toolManager } from '@/lib/services/toolManager'
import { normalizeSeoBaseUrl } from "@/lib/seo/locales"

export const dynamic = 'force-static'

export function generateStaticParams() {
  const tools = toolManager.getAllTools() ?? []
  return Array.isArray(tools) ? tools.map((tool) => ({ slug: tool.slug })) : []
}

const siteBase = normalizeSeoBaseUrl(process.env.NEXT_PUBLIC_APP_URL ?? "https://futureseer.app")

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const tool = toolManager.getTool(slug)

  if (!tool) {
    return {
      title: "Tool | FutureSeer",
      description: "Explore AI-powered mystical tools and guided insights on FutureSeer.",
      alternates: { canonical: `${siteBase}/tools` },
      robots: { index: false, follow: true },
    }
  }

  const title = `${tool.name} | FutureSeer`
  const description =
    tool.description || "Explore AI-powered mystical guidance and practical divination tools on FutureSeer."
  const canonical = `${siteBase}/tools/${tool.slug}`

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

export default function ToolSlugLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
