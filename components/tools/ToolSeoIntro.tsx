import Link from "next/link"
import type { PriorityToolSlug } from "@/lib/seo/toolIntros"
import { TOOL_SEO_BLOCKS } from "@/lib/seo/toolIntros"

/**
 * Server-rendered crawlable intro for tool routes (placed in nested layout above client page).
 */
export function ToolSeoIntro({ slug }: { slug: PriorityToolSlug }) {
  const b = TOOL_SEO_BLOCKS[slug]
  return (
    <section
      className="max-w-4xl mx-auto px-4 pt-4 pb-2 text-left border-b border-amber-500/15"
      aria-labelledby={`tool-seo-intro-${slug}`}
    >
      <h2 id={`tool-seo-intro-${slug}`} className="sr-only">
        About this tool
      </h2>
      {b.introParagraphs.map((p, i) => (
        <p key={i} className="text-sm text-amber-100/85 leading-relaxed mb-3 last:mb-0">
          {p}
        </p>
      ))}
      {b.learnSlug ? (
        <p className="text-xs text-amber-200/70 mt-2">
          <Link href={`/learn/${b.learnSlug}`} className="underline underline-offset-2 hover:text-amber-200">
            Read guide: related article
          </Link>{" "}
          in our Learn section.
        </p>
      ) : null}
    </section>
  )
}
