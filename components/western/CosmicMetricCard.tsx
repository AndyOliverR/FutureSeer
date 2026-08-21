"use client"

import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export interface CosmicMetricCardProps {
  icon: ReactNode
  label: string
  value: string
  subtitle?: string
  subValue?: string
  tooltip?: string
  badge?: string
  /** Kept for call-site compatibility; rainbow palettes are no longer applied. */
  colorScheme?: 'amber' | 'blue' | 'purple' | 'pink' | 'green' | 'orange' | 'cyan' | 'gradient'
  size?: 'small' | 'medium' | 'large'
  className?: string
  onClick?: () => void
}

const sizeConfig = {
  small: {
    iconSize: 'w-10 h-10',
    valueSize: 'text-lg',
    labelSize: 'text-xs',
    subtitleSize: 'text-xs'
  },
  medium: {
    iconSize: 'w-16 h-16',
    valueSize: 'text-2xl',
    labelSize: 'text-sm',
    subtitleSize: 'text-xs'
  },
  large: {
    iconSize: 'w-20 h-20',
    valueSize: 'text-3xl',
    labelSize: 'text-base',
    subtitleSize: 'text-sm'
  }
}

export function CosmicMetricCard({
  icon,
  label,
  value,
  subtitle,
  subValue,
  tooltip,
  badge,
  colorScheme: _colorScheme = 'amber',
  size = 'medium',
  className = '',
  onClick
}: CosmicMetricCardProps) {
  void _colorScheme
  const sizes = sizeConfig[size]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Card 
        className={`h-full rounded-2xl border border-[var(--m3-outline-variant)] bg-[var(--m3-surface-container)] text-[var(--m3-on-surface)] ${onClick ? 'cursor-pointer transition-all duration-300 hover:border-[var(--m3-outline)]' : ''}`}
        onClick={onClick}
        title={tooltip}
      >
        <CardContent className="flex h-full flex-col items-center justify-center p-4 text-center sm:p-6">
          <div className={`${sizes.iconSize} mb-3 flex items-center justify-center rounded-full bg-amber-500/15 text-amber-300`}>
            {icon}
          </div>
          <div className={`${sizes.labelSize} mb-2 font-medium text-[var(--m3-on-surface-variant)]`}>
            {label}
          </div>
          <div className="mb-2 flex items-center justify-center gap-2">
            <div className={`${sizes.valueSize} font-medium text-amber-200`}>
              {value}
            </div>
            {badge && (
              <Badge variant="secondary" className="border border-amber-500/30 bg-amber-500/15 text-xs text-amber-100">
                {badge}
              </Badge>
            )}
          </div>
          {(subValue ?? subtitle) && (
            <div className={`${sizes.subtitleSize} text-[var(--m3-on-surface-variant)]`} title={tooltip}>
              {subValue ?? subtitle}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
