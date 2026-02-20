"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Iztro (Zi Wei Dou Shu) page - Redirects to Astrology tools
 * Chinese Astrology (Zi Wei) tool has been removed; redirect to tools listing
 */
export default function IztroPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/tools/ziwei-dou-shu')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center starfield-ultra-sharp">
      <div className="text-center">
        <p className="text-slate-300">Redirecting to tools...</p>
      </div>
    </div>
  )
}