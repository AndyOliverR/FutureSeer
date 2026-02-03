"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SeerPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to /ask-the-seer
    router.replace('/ask-the-seer')
  }, [router])

  // Show loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center starfield-ultra-sharp">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4"></div>
        <p className="text-amber-400">Redirecting to Ask the Seer...</p>
      </div>
    </div>
  )
}
