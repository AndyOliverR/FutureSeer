'use client'

import { Button } from '@/components/ui/button'
import { Copy, Share2 } from 'lucide-react'
import { FutureSeerWordmark } from '@/components/brand/FutureSeerWordmark'

interface ShareCardProps {
  archetypeName: string
  hookLine: string
  shareUrl: string
  onCopy: () => void
  onShare: () => void
}

export function ShareCard({ archetypeName, hookLine, shareUrl, onCopy, onShare }: ShareCardProps) {
  return (
    <div className="mx-auto max-w-md rounded-2xl border border-slate-600/50 bg-slate-900/90 p-6 text-center shadow-lg">
      <FutureSeerWordmark size="xs" />
      <p className="mt-3 font-serif text-xl font-bold text-white">{archetypeName}</p>
      <p className="mt-2 text-sm leading-relaxed text-slate-300">{hookLine}</p>
      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
        <Button type="button" variant="outline" size="sm" onClick={onCopy} className="border-amber-500/40 text-amber-100">
          <Copy className="mr-2 h-4 w-4" />
          Copy link
        </Button>
        <Button type="button" size="sm" onClick={onShare} className="bg-amber-500 text-slate-900 hover:bg-amber-400">
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </Button>
      </div>
      <p className="mt-4 truncate text-xs text-slate-400">{shareUrl}</p>
    </div>
  )
}
