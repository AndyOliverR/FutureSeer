import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAdvancedTechnique, getAllAdvancedTechniques } from '@/lib/data/advancedTechniques'
import { AdvancedTechniqueDetail } from '@/components/western/AdvancedTechniqueDetail'
import { ChevronLeft } from 'lucide-react'

interface PageProps {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return getAllAdvancedTechniques().map((t) => ({ slug: t.slug }))
}

export default async function AdvancedTechniquePage({ params }: PageProps) {
  const { slug } = await params
  const technique = getAdvancedTechnique(slug)

  if (!technique) {
    notFound()
  }

  return (
    <div className="starfield-ultra-sharp min-h-screen p-4">
      <div className="max-w-4xl mx-auto py-8">
        <Link
          href="/tools/western-astrology?tab=advanced"
          className="inline-flex items-center gap-1 text-amber-400/90 hover:text-amber-300 text-sm font-medium mb-8"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Advanced
        </Link>
        <AdvancedTechniqueDetail technique={technique} />
      </div>
    </div>
  )
}
