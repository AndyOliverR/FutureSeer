"use client"

import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { CheckCircle, AlertCircle, Circle } from 'lucide-react'

export type DevotionistColorScheme = 'amber' | 'blue' | 'purple' | 'pink' | 'green' | 'orange' | 'cyan'

export interface DevotionistStyleCardProps {
  icon: ReactNode
  title: string
  subtitle?: string
  summary?: string
  items?: Array<{ icon?: ReactNode; text: string; highlight?: boolean; type?: 'positive' | 'neutral' | 'challenge' }>
  variant?: 'default' | 'callout' | 'timeline'
  colorScheme?: DevotionistColorScheme
  className?: string
  children?: ReactNode
}

const coolSurface = {
  border: 'border-sky-200',
  hoverBorder: 'hover:border-sky-300',
  bg: 'bg-sky-50',
  iconBg: 'bg-sky-100',
  iconColor: 'text-sky-700',
  titleColor: 'font-heading tracking-wide text-sky-900',
  body: 'text-slate-700',
  muted: 'text-slate-500',
}

const palettes: Record<DevotionistColorScheme, typeof coolSurface> = {
  amber: coolSurface,
  blue: coolSurface,
  cyan: {
    border: 'border-cyan-200',
    hoverBorder: 'hover:border-cyan-300',
    bg: 'bg-cyan-50',
    iconBg: 'bg-cyan-100',
    iconColor: 'text-cyan-700',
    titleColor: 'font-heading tracking-wide text-cyan-900',
    body: 'text-slate-700',
    muted: 'text-slate-500',
  },
  purple: {
    border: 'border-indigo-200',
    hoverBorder: 'hover:border-indigo-300',
    bg: 'bg-indigo-50',
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-700',
    titleColor: 'font-heading tracking-wide text-indigo-900',
    body: 'text-slate-700',
    muted: 'text-slate-500',
  },
  green: {
    border: 'border-teal-200',
    hoverBorder: 'hover:border-teal-300',
    bg: 'bg-teal-50',
    iconBg: 'bg-teal-100',
    iconColor: 'text-teal-700',
    titleColor: 'font-heading tracking-wide text-teal-900',
    body: 'text-slate-700',
    muted: 'text-slate-500',
  },
  pink: {
    border: 'border-sky-200',
    hoverBorder: 'hover:border-sky-300',
    bg: 'bg-slate-50',
    iconBg: 'bg-sky-100',
    iconColor: 'text-sky-700',
    titleColor: 'font-heading tracking-wide text-slate-900',
    body: 'text-slate-700',
    muted: 'text-slate-500',
  },
  orange: {
    border: 'border-sky-200',
    hoverBorder: 'hover:border-sky-300',
    bg: 'bg-slate-50',
    iconBg: 'bg-sky-100',
    iconColor: 'text-sky-700',
    titleColor: 'font-heading tracking-wide text-slate-900',
    body: 'text-slate-700',
    muted: 'text-slate-500',
  },
}

export function DevotionistStyleCard({
  icon,
  title,
  subtitle,
  summary,
  items,
  variant = 'default',
  colorScheme = 'amber',
  className = '',
  children
}: DevotionistStyleCardProps) {
  const surface = palettes[colorScheme] ?? coolSurface

  const getItemIcon = (item: { icon?: ReactNode; type?: 'positive' | 'neutral' | 'challenge' }) => {
    if (item.icon) return item.icon
    
    if (item.type === 'positive') {
      return <CheckCircle className="h-4 w-4 text-teal-600" />
    } else if (item.type === 'challenge') {
      return <AlertCircle className="h-4 w-4 text-sky-600" />
    }
    return <Circle className="h-3 w-3 fill-current text-slate-400" />
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
        <div className="absolute bottom-0 left-3 top-0 w-0.5 bg-sky-200" />
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
