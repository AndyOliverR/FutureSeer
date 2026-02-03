"use client";
import { Brain, Sparkles, Zap } from "lucide-react"
import { useEffect, useState } from "react"
import { useIntersectionObserverMultiple } from "@/hooks/use-intersection-observer"
import { motion } from "framer-motion"

const features = [
  {
    icon: Brain,
    title: "See Into Your Future",
    description: "Occult wisdom combined with AI forecasting reveals hidden patterns and genuine glimpses into what lies ahead",
  },
  {
    icon: Sparkles,
    title: "Hidden Data Patterns",
    description: "Predictive analytics powered by ancient divination systems and time series forecasting",
  },
  {
    icon: Zap,
    title: "Innovation Experiment",
    description: "Join as a power user. Your usage improves accuracy and precision for everyone. Start your journey today.",
  },
]

export function FeatureBlocks() {
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  
  // Use intersection observer with higher threshold for better performance
  const [visibleCards] = useIntersectionObserverMultiple<HTMLDivElement>(
    '[data-feature-card]',
    { threshold: 0.1, rootMargin: '50px' }
  )

  // Ensure cards are visible on first render
  const [initialVisible] = useState<number[]>([0, 1, 2])
  // Merge initial visible with observer results
  const effectiveVisibleCards = [...new Set([...initialVisible, ...visibleCards])]

  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0)
    // Delay animation initialization slightly for better perceived performance
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <section className="py-8 sm:py-12 md:py-16 bg-transparent">
      <div className="max-w-6xl mx-auto bg-transparent">
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8"
          initial="hidden"
          animate={isVisible && effectiveVisibleCards.length > 0 ? "visible" : "hidden"}
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.1,
                delayChildren: 0.05,
                ease: [0.2, 0, 0, 1], // Material 3 standard easing
              },
            },
          }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              data-feature-card
              data-index={index}
              variants={{
                hidden: {
                  opacity: 0,
                  y: 40,
                  scale: 0.95,
                },
                visible: {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: {
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                    duration: 0.4,
                    ease: [0.2, 0, 0, 1], // Material 3 standard easing
                  },
                },
              }}
              className={`group relative p-6 sm:p-8 rounded-2xl bg-[var(--m3-surface-container-low)]/95 border border-[var(--m3-outline-variant)] backdrop-blur-xl m3-transition-standard overflow-hidden m3-elevation-2 hover:m3-elevation-3 active:m3-elevation-1 m3-elevation-transition ${
                isTouchDevice 
                  ? 'active:scale-[0.98]' 
                  : 'hover:border-[var(--m3-primary)]/50 hover:scale-[1.02] hover:-translate-y-1'
              }`}
              style={{
                willChange: effectiveVisibleCards.includes(index) ? 'transform, opacity' : 'auto'
              }}
            >
              {/* Graceful glow effects - disabled on mobile for performance */}
              {!isTouchDevice && (
                <>
                  {/* Outer glow ring */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-600/30 via-amber-500/20 to-amber-600/30 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-2xl -z-10" />
                  {/* Inner glow border */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-500/20 to-yellow-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 border-2 border-transparent group-hover:border-amber-500/40" />
                  {/* Subtle shine effect */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                </>
              )}

              <div className="relative z-10 text-center space-y-3 sm:space-y-4">
                {/* Icon with enhanced glow - optimized size for mobile */}
                <div className={`inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[var(--m3-primary-container)] border border-[var(--m3-primary)]/30 transition-all duration-300 ${
                  isTouchDevice 
                    ? '' 
                    : 'group-hover:border-[var(--m3-primary)]/50 group-hover:scale-110'
                }`}>
                  <feature.icon className={`w-7 h-7 sm:w-8 sm:h-8 text-[var(--m3-primary)] transition-all duration-300 group-hover:text-[var(--m3-primary)] ${
                    !isTouchDevice ? 'group-hover:scale-110' : ''
                  }`} />
                </div>

                {/* Title - Material 3 Title Large */}
                <h3 className="m3-title-large text-[var(--m3-on-surface)] transition-colors duration-300 font-normal">
                  {feature.title}
                </h3>

                {/* Description - Material 3 Body Medium */}
                <p className="m3-body-medium text-[var(--m3-on-surface-variant)] leading-relaxed font-light">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
} 