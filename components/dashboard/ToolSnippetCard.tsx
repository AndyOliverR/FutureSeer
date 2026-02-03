'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Card } from '@/components/ui/card'

export interface ToolSnippetCardProps {
  toolName: string
  toolSlug: string
  icon: string | React.ReactNode
  metric: string | number
  metricLabel?: string
  insight: string
  href: string
  colorScheme?: 'amber' | 'purple' | 'blue' | 'green' | 'pink' | 'indigo' | 'rose' | 'cyan' | 'teal' | 'orange'
  priority?: number
}

const colorSchemes = {
  amber: {
    iconBg: 'bg-amber-500',
    border: 'border-amber-500/30',
    hoverBorder: 'hover:border-amber-500/50',
    text: 'text-amber-400',
    metric: 'text-amber-300'
  },
  purple: {
    iconBg: 'bg-purple-500',
    border: 'border-purple-500/30',
    hoverBorder: 'hover:border-purple-500/50',
    text: 'text-purple-400',
    metric: 'text-purple-300'
  },
  blue: {
    iconBg: 'bg-blue-500',
    border: 'border-blue-500/30',
    hoverBorder: 'hover:border-blue-500/50',
    text: 'text-blue-400',
    metric: 'text-blue-300'
  },
  green: {
    iconBg: 'bg-green-500',
    border: 'border-green-500/30',
    hoverBorder: 'hover:border-green-500/50',
    text: 'text-green-400',
    metric: 'text-green-300'
  },
  pink: {
    iconBg: 'bg-pink-500',
    border: 'border-pink-500/30',
    hoverBorder: 'hover:border-pink-500/50',
    text: 'text-pink-400',
    metric: 'text-pink-300'
  },
  indigo: {
    iconBg: 'bg-indigo-500',
    border: 'border-indigo-500/30',
    hoverBorder: 'hover:border-indigo-500/50',
    text: 'text-indigo-400',
    metric: 'text-indigo-300'
  },
  rose: {
    iconBg: 'bg-rose-500',
    border: 'border-rose-500/30',
    hoverBorder: 'hover:border-rose-500/50',
    text: 'text-rose-400',
    metric: 'text-rose-300'
  },
  cyan: {
    iconBg: 'bg-cyan-500',
    border: 'border-cyan-500/30',
    hoverBorder: 'hover:border-cyan-500/50',
    text: 'text-cyan-400',
    metric: 'text-cyan-300'
  },
  teal: {
    iconBg: 'bg-teal-500',
    border: 'border-teal-500/30',
    hoverBorder: 'hover:border-teal-500/50',
    text: 'text-teal-400',
    metric: 'text-teal-300'
  },
  orange: {
    iconBg: 'bg-orange-500',
    border: 'border-orange-500/30',
    hoverBorder: 'hover:border-orange-500/50',
    text: 'text-orange-400',
    metric: 'text-orange-300'
  }
}

export function ToolSnippetCard({
  toolName,
  toolSlug,
  icon,
  metric,
  metricLabel,
  insight,
  href,
  colorScheme = 'amber',
  priority = 0
}: ToolSnippetCardProps) {
  const colors = colorSchemes[colorScheme]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: priority * 0.05 }}
    >
      <Link href={href} className="block h-full">
        <Card
          className={`
            relative h-full overflow-hidden transition-all duration-300 hover:scale-105
            hover:shadow-xl hover:shadow-slate-700/20
            bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900
            border ${colors.border} ${colors.hoverBorder}
            p-4 sm:p-5
            group cursor-pointer
          `}
        >
          <div className="flex flex-col items-center text-center">
            {/* Icon: emoji only, no circle */}
            <div className="inline-flex items-center justify-center min-h-[3.5rem] mb-4 group-hover:scale-110 transition-transform duration-300">
              {typeof icon === 'string' ? <span className="text-4xl leading-none">{icon}</span> : icon}
            </div>

            {/* Tool Name */}
            <h3 className={`text-lg font-bold mb-2 ${colors.text} m3-label-large`}>
              {toolName}
            </h3>

            {/* Metric */}
            <div className="mb-2">
              <div className={`text-xl sm:text-2xl font-bold ${colors.metric} leading-tight`}>
                {metric}
              </div>
              {metricLabel && (
                <div className="text-xs text-white/70 mt-0.5 m3-label-small">
                  {metricLabel}
                </div>
              )}
            </div>

            {/* Insight */}
            <p className="text-sm text-white/80 line-clamp-2 m3-body-small leading-relaxed mb-4">
              {insight}
            </p>

            {/* View details */}
            <div className="mt-auto flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className={`text-xs ${colors.text} m3-label-small`}>View details</span>
              <ArrowRight className={`w-3 h-3 ${colors.text}`} />
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  )
}
