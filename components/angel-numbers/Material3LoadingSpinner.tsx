"use client"

import { motion } from "framer-motion"

// Material 3 circular progress indicator
export function Material3LoadingSpinner({ size = 48, className = "" }: { size?: number; className?: string }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        className="animate-spin"
        style={{ animation: "spin 1.4s linear infinite" }}
      >
        <motion.circle
          cx="24"
          cy="24"
          r="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="31.416"
          strokeDashoffset="31.416"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{
            duration: 1.4,
            repeat: Infinity,
            ease: "linear"
          }}
          className="text-amber-500"
        />
        <motion.circle
          cx="24"
          cy="24"
          r="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="31.416"
          strokeDashoffset="15.708"
          initial={{ pathLength: 0, opacity: 0.3 }}
          animate={{ pathLength: 0.5, opacity: 0.3 }}
          transition={{
            duration: 1.4,
            repeat: Infinity,
            ease: "linear"
          }}
          className="text-amber-300"
        />
      </svg>
    </div>
  )
}
