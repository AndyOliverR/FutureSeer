"use client"

import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Search, BookOpen, Heart, Briefcase, Activity, Plane, X } from "lucide-react"
import { LucideIcon } from "lucide-react"

interface FilterOption {
  value: string
  label: string
  icon: LucideIcon
}

interface HistoryFiltersProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
  filterType: string
  setFilterType: (type: string) => void
}

const filterOptions: FilterOption[] = [
  { value: "all", label: "All Readings", icon: BookOpen },
  { value: "love", label: "Love & Relationships", icon: Heart },
  { value: "career", label: "Career & Money", icon: Briefcase },
  { value: "health", label: "Health & Wellness", icon: Activity },
  { value: "travel", label: "Travel & Adventure", icon: Plane },
]

export function HistoryFilters({ 
  searchTerm, 
  setSearchTerm, 
  filterType, 
  setFilterType 
}: HistoryFiltersProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="mb-8"
    >
      <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300 hover:scale-105 rounded-2xl">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-[var(--m3-on-surface-variant)]" />
              <Input
                type="text"
                placeholder="Search your readings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-[var(--m3-surface-container-low)] border-[var(--m3-outline-variant)] text-[var(--m3-on-surface)] placeholder:text-[var(--m3-on-surface-variant)] focus:border-[var(--m3-primary)] focus:shadow-[0_0_0_3px_var(--m3-primary-container)] rounded-xl m3-body-medium"
                aria-label="Search readings"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-3 text-[var(--m3-on-surface-variant)] hover:text-[var(--m3-primary)] hover:bg-[var(--m3-primary-container)] rounded-lg p-1 m3-transition-standard"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            
            {/* Filter - Material 3 Filter Chip Pattern */}
            <div className="flex gap-3 overflow-x-auto pb-2">
              {filterOptions.map((option) => {
                const Icon = option.icon
                const isActive = filterType === option.value
                return (
                  <button
                    key={option.value}
                    onClick={() => setFilterType(option.value)}
                    className={`group relative overflow-hidden whitespace-nowrap px-4 py-2.5 rounded-full font-medium text-sm transition-all duration-300 ${
                      isActive 
                        ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/50 text-amber-400" 
                        : "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 text-white/80 hover:border-amber-500/50 hover:text-amber-400"
                    }`}
                    aria-label={`Filter by ${option.label}`}
                    aria-pressed={isActive}
                  >
                    <div className="relative flex items-center justify-center gap-2">
                      <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                        isActive ? 'text-amber-400' : 'text-white/80 group-hover:text-amber-400'
                      }`} />
                      <span className="transition-transform group-hover:scale-105">{option.label}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
