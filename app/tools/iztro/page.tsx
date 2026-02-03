"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Iztro (Zi Wei Dou Shu) page - Redirects to consolidated Chinese Astrology page
 * This page has been merged with chinese-astrology for better organization
 */
export default function IztroPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the consolidated Chinese Astrology page
    router.replace('/tools/chinese-astrology')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center starfield-ultra-sharp">
      <div className="text-center">
        <p className="text-slate-300">Redirecting to Chinese Astrology...</p>
      </div>
    </div>
  )
}