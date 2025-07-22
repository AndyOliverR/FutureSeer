import React from "react"
import Link from "next/link"

export function HeaderBar() {
  return (
    <header className="w-full flex items-center justify-between px-4 py-3 rounded-2xl backdrop-blur-md bg-slate-900/40 border border-slate-700/50 shadow-lg mb-2 card-glow">
      <div className="flex items-center gap-2">
        <Link href="/" className="cursor-pointer">
          <span className="text-2xl font-serif font-semibold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600 tracking-wide hover:scale-105 transition-transform">
            FutureSeer
          </span>
        </Link>
      </div>
      <div className="flex items-center gap-4">
        {/* Placeholder for nav or avatar */}
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400/30 to-yellow-500/30 flex items-center justify-center text-amber-200 font-serif font-bold text-lg">
          {/* User avatar or icon */}
          <span>A</span>
        </div>
      </div>
    </header>
  )
} 