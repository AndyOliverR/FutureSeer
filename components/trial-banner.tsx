"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

export function TrialBanner() {
  const [timeLeft, setTimeLeft] = useState(9 * 60 * 60) // 9 hours in seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1))
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const hours = Math.floor(timeLeft / 3600)
  const minutes = Math.floor((timeLeft % 3600) / 60)

  return (
    <div className="bg-gradient-to-r from-gold/20 to-yellow-400/20 border-b border-gold/30 p-4">
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-gray-100 text-sm leading-relaxed">
          ✨ Free Trial Active:{" "}
          <span className="font-medium text-gold">
            {hours}h {minutes}m remaining
          </span>
          <span className="mx-4">•</span>
          <Link href="/subscribe" className="text-gold hover:text-yellow-300 underline">
            Upgrade Now
          </Link>
        </p>
      </div>
    </div>
  )
}
