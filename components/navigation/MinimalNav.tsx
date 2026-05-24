"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { FutureSeerWordmark } from "@/components/brand/FutureSeerWordmark"

export function MinimalNav() {
  return (
    <nav 
      className="bg-[var(--m3-surface)] backdrop-blur-xl border-b border-[var(--m3-outline-variant)] py-3 flex items-center justify-between z-[100] sticky top-0 left-0 right-0" 
      role="navigation" 
      aria-label="Minimal navigation"
      style={{ 
        width: '100vw', 
        marginLeft: 'calc(-50vw + 50%)', 
        marginRight: 'calc(-50vw + 50%)', 
        paddingLeft: '1rem', 
        paddingRight: '1rem', 
        boxSizing: 'border-box' 
      }}
    >
      <FutureSeerWordmark href="/" size="lg" className="relative z-[101] h-10 flex items-center" />
      
      <Link 
        href="/"
        className="inline-flex items-center gap-2 text-[var(--m3-on-surface-variant)] hover:text-[var(--m3-on-surface)] transition-colors group focus-visible:outline-2 focus-visible:outline-[var(--m3-primary)] focus-visible:outline-offset-2 rounded-md m3-transition-standard"
        aria-label="Back to home"
      >
        <span className="inline-block transition-transform group-hover:-translate-x-1">
          <ArrowLeft className="w-4 h-4" />
        </span>
        <span className="m3-label-medium">Home</span>
      </Link>
      <div className="flex items-center gap-4 ml-4">
        <Link
          href="/terms"
          className="text-[var(--m3-on-surface-variant)] hover:text-[var(--m3-on-surface)] transition-colors m3-label-medium"
        >
          Terms
        </Link>
        <Link
          href="/privacy"
          className="text-[var(--m3-on-surface-variant)] hover:text-[var(--m3-on-surface)] transition-colors m3-label-medium"
        >
          Privacy
        </Link>
      </div>
    </nav>
  )
}
