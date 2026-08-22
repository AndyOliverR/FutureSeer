'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ChartFrameProps {
  title?: string
  subtitle?: string
  header?: ReactNode
  children: ReactNode
  className?: string
}

/**
 * Equal-sized well for natal/divisional charts. Square aspect, no CSS scale,
 * dual-design surface (glass/low container on web, solid M3 on mobile).
 */
export function ChartFrame({ title, subtitle, header, children, className }: ChartFrameProps) {
  return (
    <div
      className={cn(
        'flex h-full min-w-0 flex-col rounded-2xl border border-sky-200',
        'bg-white text-slate-900',
        className,
      )}
    >
      {title ? (
        <h3 className="font-heading px-4 pt-4 text-center text-sm font-medium tracking-wide text-sky-900 sm:text-base">
          {title}
        </h3>
      ) : null}
      {subtitle ? (
        <p className="px-4 text-center text-xs text-slate-500">{subtitle}</p>
      ) : null}
      {header ? <div className="px-3 pt-2 sm:px-4">{header}</div> : null}
      <div className="flex flex-1 items-center justify-center p-3 sm:p-4">
        <div className="relative mx-auto aspect-square w-full max-w-[480px] overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center [&_svg]:h-full [&_svg]:w-full [&_svg]:max-h-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
