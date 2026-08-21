"use client"

import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { CheckCircle, AlertCircle, Circle } from 'lucide-react'

export interface DevotionistStyleCardProps {
  icon: ReactNode
  title: string
  subtitle?: string
  summary?: string
  items?: Array<{ icon?: ReactNode; text: string; highlight?: boolean; type?: 'positive' | 'neutral' | 'challenge' }>
  variant?: 'default' | 'callout' | 'timeline'
  /** Kept for call-site compatibility; rainbow palettes are no longer applied. */
  colorScheme?: 'amber' | 'blue' | 'purple' | 'pink' | 'green' | 'orange' | 'cyan'
  className?: string
  children?: ReactNode
}

const surface = {
  border: 'border-[var(--m3-outline-variant)]',
  hoverBorder: 'hover:border-[var(--m3-outline)]',
  bg: 'bg-[var(--m3-surface-container)]',
  iconBg: 'bg-amber-500/15',
  iconColor: 'text-amber-300',
  titleColor: 'text-amber-200',
  body: 'text-[var(--m3-on-surface)]',
  muted: 'text-[var(--m3-on-surface-variant)]',
}

export function DevotionistStyleCard({
  icon,
  title,
  subtitle,
  summary,
  items,
  variant = 'default',
  colorScheme: _colorScheme = 'amber',
  className = '',
  children
}: DevotionistStyleCardProps) {
  void _colorScheme

  const getItemIcon = (item: { icon?: ReactNode; type?: 'positive' | 'neutral' | 'challenge' }) => {
    if (item.icon) return item.icon
    
    if (item.type === 'positive') {
      return <CheckCircle className="h-4 w-4 text-amber-300" />
    } else if (item.type === 'challenge') {
      return <AlertCircle className="h-4 w-4 text-amber-400/80" />
    }
    return <Circle className="h-3 w-3 fill-current text-[var(--m3-on-surface-variant)]" />
  }

  if (variant === 'callout') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className={cn(
          'rounded-2xl border p-5 shadow-sm sm:p-6',
          surface.border,
          surface.bg,
          surface.hoverBorder,
          'transition-all duration-300',
          className
        )}
      >
        <div className="mb-3 flex items-center gap-3">
          <div className={`${surface.iconBg} flex-shrink-0 rounded-lg p-2`}>
            <div className={surface.iconColor}>
              {icon}
            </div>
          </div>
          <div className="min-w-0 w-full flex-1">
            <h4 className={`${surface.titleColor} mb-1 text-lg font-medium`}>{title}</h4>
            {subtitle && (
              <p className={`${surface.muted} mb-2 text-sm`}>{subtitle}</p>
            )}
            {summary && (
              <p className={`${surface.body} mb-3 text-sm leading-relaxed`}>{summary}</p>
            )}
            {items && items.length > 0 && (
              <ul className="space-y-2">
                {items.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="mt-0.5 flex-shrink-0">
                      {getItemIcon(item)}
                    </span>
                    <span className={`text-sm ${surface.body} ${item.highlight ? 'font-medium' : ''}`}>
                      {item.text}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        {children && (
          <div className="mt-4">
            {children}
          </div>
        )}
      </motion.div>
    )
  }

  if (variant === 'timeline') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className={`relative pl-8 ${className}`}
      >
        <div className="absolute bottom-0 left-3 top-0 w-0.5 bg-amber-500/20" />
        <div className={`absolute left-0 top-1 ${surface.iconBg} rounded-full p-1.5`}>
          <div className={surface.iconColor}>
            {icon}
          </div>
        </div>
        <div className={`mb-4 rounded-2xl border p-5 shadow-sm sm:p-6 ${surface.border} ${surface.bg}`}>
          <h4 className={`${surface.titleColor} mb-1 text-base font-medium`}>{title}</h4>
          {subtitle && (
            <p className={`${surface.muted} mb-2 text-xs`}>{subtitle}</p>
          )}
          {summary && (
            <p className={`${surface.body} mb-2 text-sm leading-relaxed`}>{summary}</p>
          )}
          {items && items.length > 0 && (
            <ul className="mt-2 space-y-1.5">
              {items.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="mt-0.5 flex-shrink-0">
                    {getItemIcon(item)}
                  </span>
                  <span className={`text-xs ${surface.body} ${item.highlight ? 'font-medium' : ''}`}>
                    {item.text}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn('flex min-h-0 flex-col', className)}
    >
      <Card
        className={cn(
          'flex min-h-0 flex-1 flex-col rounded-2xl border shadow-sm',
          surface.border,
          surface.bg,
          surface.hoverBorder,
          'transition-all duration-300'
        )}
      >
        <CardContent className="flex min-h-0 flex-1 flex-col p-5 sm:p-6">
          <div className="mb-3 flex flex-shrink-0 items-center gap-3">
            <div className={`${surface.iconBg} flex-shrink-0 rounded-lg p-2`}>
              <div className={surface.iconColor}>
                {icon}
              </div>
            </div>
            <div className="min-w-0 w-full flex-1">
              <h4 className={`${surface.titleColor} mb-1 text-base font-medium`}>{title}</h4>
              {subtitle && (
                <p className={`${surface.muted} mb-2 text-xs`}>{subtitle}</p>
              )}
            </div>
          </div>
          
          {summary && (
            <p className={`${surface.body} mb-3 text-sm leading-relaxed`}>{summary}</p>
          )}
          
          {items && items.length > 0 && (
            <ul className="space-y-2">
              {items.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="mt-0.5 flex-shrink-0">
                    {getItemIcon(item)}
                  </span>
                  <span className={`text-sm ${surface.body} ${item.highlight ? 'font-medium' : ''}`}>
                    {item.text}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
