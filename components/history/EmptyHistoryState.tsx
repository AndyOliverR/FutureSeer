"use client"

import { motion } from "framer-motion"
import { HISTORY_EMOJIS } from "@/lib/constants/history"

export function EmptyHistoryState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="text-center py-16"
    >
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="text-6xl mb-6"
      >
        {HISTORY_EMOJIS.crystal}
      </motion.div>
      <p className="text-2xl font-bold text-amber-400 font-serif mb-4">
        No activity yet
      </p>
      <p className="text-base text-white/80 max-w-md mx-auto">
        Use the app – visit Dashboard, open tools, or Ask the Seer – and we&apos;ll show what you did here.
      </p>
    </motion.div>
  )
}
