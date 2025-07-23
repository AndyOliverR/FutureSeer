"use client"

import { motion } from "framer-motion"

export function CosmicLoader() {
  return (
    <div className="flex items-center justify-center">
      <motion.div
        className="relative w-16 h-16"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        {/* Outer ring */}
        <div className="absolute inset-0 border-4 border-transparent border-t-yellow-400 rounded-full"></div>
        
        {/* Inner ring */}
        <motion.div
          className="absolute inset-2 border-2 border-transparent border-b-purple-400 rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        ></motion.div>
        
        {/* Center dot */}
        <motion.div
          className="absolute inset-6 bg-gradient-to-r from-yellow-400 to-purple-400 rounded-full"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
        ></motion.div>
      </motion.div>
    </div>
  )
} 