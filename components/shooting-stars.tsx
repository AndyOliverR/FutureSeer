"use client"

import { useEffect, useState } from "react"

export function ShootingStars() {
  const [stars, setStars] = useState<Array<{ id: number; delay: number }>>([])

  useEffect(() => {
    const createShootingStar = () => {
      const id = Date.now()
      setStars((prev) => [...prev, { id, delay: 0 }])

      // Remove star after animation completes
      setTimeout(() => {
        setStars((prev) => prev.filter((star) => star.id !== id))
      }, 3000)
    }

    // Create shooting star every 18-22 seconds
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        // 30% chance each interval
        createShootingStar()
      }
    }, 6000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute shooting-star"
          style={{
            top: `${Math.random() * 30}%`,
            left: `${Math.random() * 30}%`,
            animationDelay: `${star.delay}ms`,
          }}
        />
      ))}
    </div>
  )
}
