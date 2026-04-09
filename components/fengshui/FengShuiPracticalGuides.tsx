"use client"

import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import {
  allPracticalGuideItems,
  FURTHER_READING_LINKS,
  PRACTICAL_GUIDE_DISCLAIMER,
  type PracticalGuideCategory,
  type PracticalGuideItem,
} from "@/lib/fengshui/practicalGuides"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ExternalLink, Sparkles } from "lucide-react"

const FILTER_LABELS: { id: PracticalGuideCategory | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "wealth", label: "Wealth" },
  { id: "entry", label: "Entry" },
  { id: "drains", label: "Drains" },
  { id: "maintenance", label: "Maintenance" },
]

function GuideCard({ item, index }: { item: PracticalGuideItem; index: number }) {
  const [open, setOpen] = useState(false)

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md md:hover:shadow-xl transition-shadow duration-300">
        <CardContent className="p-4">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold text-amber-900 text-sm sm:text-base leading-snug">{item.title}</h3>
              <span className="text-[10px] uppercase tracking-wide text-amber-700/80 shrink-0 px-2 py-0.5 rounded-full bg-amber-100 border border-amber-200">
                {item.category}
              </span>
            </div>
            {item.problem ? (
              <p className="text-xs sm:text-sm text-slate-600 mb-2">{item.problem}</p>
            ) : null}
            <p className="text-xs sm:text-sm text-slate-700 mb-2">
              <span className="font-semibold text-amber-900">Remedy: </span>
              {item.remedy}
            </p>
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="w-full text-left text-xs sm:text-sm text-amber-700 hover:text-amber-900 flex items-center gap-2 py-1"
              >
                <ChevronDown className={cn("w-4 h-4 transition-transform", open && "rotate-180")} />
                {open ? "Hide" : "Why this matters"}
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2 border-t border-amber-200 mt-2">
              <p className="text-xs sm:text-sm text-slate-700">{item.why}</p>
            </CollapsibleContent>
          </motion.div>
        </CardContent>
      </Card>
    </Collapsible>
  )
}

interface FengShuiPracticalGuidesProps {
  wealthTips: string[]
}

export default function FengShuiPracticalGuides({ wealthTips }: FengShuiPracticalGuidesProps) {
  const [filter, setFilter] = useState<PracticalGuideCategory | "all">("all")

  const items = useMemo(() => {
    const all = allPracticalGuideItems()
    if (filter === "all") return all
    return all.filter((i) => i.category === filter)
  }, [filter])

  return (
    <div className="space-y-6">
      <p className="text-xs sm:text-sm text-slate-600 md:text-slate-700 leading-relaxed border border-amber-200/60 rounded-xl p-3 md:p-4 bg-amber-50/80 md:bg-amber-50/90">
        {PRACTICAL_GUIDE_DISCLAIMER}
      </p>

      {wealthTips.length > 0 && (
        <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-amber-900 flex items-center gap-2 text-lg">
              <Sparkles className="w-5 h-5 text-amber-700" />
              Personalized pointers
            </CardTitle>
            <p className="text-xs sm:text-sm text-slate-600 font-normal">
              Aligned with your Kua and elements — supportive habits for your space, not promises.
            </p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {wealthTips.map((line, i) => (
                <li key={i} className="text-sm text-slate-700 flex gap-2">
                  <span className="text-amber-600 shrink-0">•</span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <div>
        <p className="text-sm font-medium text-amber-900 mb-2">Browse by topic</p>
        <div className="flex flex-wrap gap-2">
          {FILTER_LABELS.map(({ id, label }) => (
            <Button
              key={id}
              type="button"
              variant={filter === id ? "default" : "outline"}
              size="sm"
              className={cn(
                "rounded-full text-xs sm:text-sm",
                filter === id
                  ? "bg-amber-700 hover:bg-amber-800 text-white"
                  : "border-amber-300 bg-white/90 text-amber-900 hover:bg-amber-50"
              )}
              onClick={() => setFilter(id)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item, index) => (
          <GuideCard key={item.id} item={item} index={index} />
        ))}
      </div>

      <Card className="border-2 border-amber-200/80 rounded-2xl bg-slate-900/40 md:bg-slate-900/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-amber-100 text-base sm:text-lg">Further reading (external)</CardTitle>
          <p className="text-xs sm:text-sm text-slate-300 font-normal">
            Open in a new tab. Use for concepts only; do not copy long excerpts without checking license terms.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {FURTHER_READING_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-2 text-sm text-amber-200 hover:text-amber-100 underline-offset-2 hover:underline"
            >
              <ExternalLink className="w-4 h-4 shrink-0 mt-0.5 opacity-80" />
              <span>
                <span className="font-medium">{link.label}</span>
                <span className="block text-slate-400 text-xs mt-0.5">{link.note}</span>
              </span>
            </a>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
