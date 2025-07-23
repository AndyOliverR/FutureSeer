"use client"

import { motion } from "framer-motion"

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center">
      <motion.div
        className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
    </div>
  )
} 