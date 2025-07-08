"use client"

import { useEffect, useState } from "react"

export function ShootingStars() {
  const [stars, setStars] = useState<Array<{ id: number; delay: number }>>([])

  useEffect(() => {
    const createShootingStar = () => {
      const id = Date.now()
      setStars((prev) => [...prev, { id, delay: 0 }])

      setTimeout(() => {
        setStars((prev) => prev.filter((star) => star.id !== id))
      }, 3000)
    }

    const interval = setInterval(createShootingStar, 18000) // Every 18 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute shooting-star"
          style={{
            top: `${Math.random() * 30}%`,
            left: `${Math.random() * 100}%`,
          }}
        />
      ))}
    </div>
  )
}
