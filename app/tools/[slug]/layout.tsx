import { toolManager } from '@/lib/services/toolManager'

export const dynamic = 'force-static'

export function generateStaticParams() {
  const tools = toolManager.getAllTools()
  return tools.map((tool) => ({ slug: tool.slug }))
}

export default function ToolSlugLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
