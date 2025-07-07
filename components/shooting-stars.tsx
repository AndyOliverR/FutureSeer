"use client"

import { useEffect, useState } from "react"

export function ShootingStars() {
  const [stars, setStars] = useState<Array<{
    id: number
    top: number
    left: number
    delay: number
    duration: number
  }>>([])

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    
    if (prefersReducedMotion) {
      return // Don't create shooting stars if user prefers reduced motion
    }

    let starId = 0
    const createShootingStar = () => {
      // Natural timing: 30-60 seconds between stars (more realistic)
      const delay = 30000 + Math.random() * 30000
      
      setTimeout(() => {
        const newStar = {
          id: starId++,
          top: Math.random() * 40, // Start from top 40% of screen
          left: Math.random() * 80, // Random horizontal position
          delay: Math.random() * 2000, // Stagger spawn timing
          duration: 4000 + Math.random() * 2000, // 4-6 seconds duration
        }
        
        setStars(prev => [...prev, newStar])
        
        // Remove star after animation completes
        setTimeout(() => {
          setStars(prev => prev.filter(star => star.id !== newStar.id))
        }, newStar.duration)
        
        // Schedule next star
        createShootingStar()
      }, delay)
    }

    // Start the cycle
    createShootingStar()

    return () => {
      setStars([])
    }
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute"
          style={{
            top: `${star.top}%`,
            left: `${star.left}%`,
            width: "2px",
            height: "80px",
            background: "linear-gradient(to bottom right, rgba(255, 255, 255, 0.9), rgba(173, 216, 230, 0.6), transparent)",
            animation: `shoot-restored ${star.duration}ms ease-out forwards`,
            animationDelay: `${star.delay}ms`,
            opacity: 0,
            transform: "rotate(45deg)",
            boxShadow: "0 0 6px rgba(255, 255, 255, 0.4), 0 0 12px rgba(173, 216, 230, 0.3)",
            filter: "blur(0.5px)",
          }}
        />
      ))}
    </div>
  )
}
