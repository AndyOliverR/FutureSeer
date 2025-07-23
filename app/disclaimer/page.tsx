"use client"

import React from "react"
import Link from "next/link"
import { motion } from "framer-motion"

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="max-w-2xl w-full bg-slate-900/80 rounded-xl shadow-xl p-8 border border-amber-400/20"
      >
        <h1 className="text-3xl font-serif text-amber-300 mb-4 text-center">Disclaimer</h1>
        <p className="text-slate-200 font-serif mb-4">
          <span className="text-amber-200 font-bold">FutureSeer</span> is designed to inspire, guide, and entertain. The insights and predictions offered are based on traditional and modern mystical systems, as well as AI-powered interpretations.
        </p>
        <ul className="list-disc pl-6 text-slate-300 font-serif mb-4">
          <li className="mb-2">No information provided by this app should be considered medical, legal, financial, or psychological advice.</li>
          <li className="mb-2">Always consult qualified professionals for serious matters or decisions.</li>
          <li className="mb-2">Use your own judgment and intuition when interpreting guidance from the app.</li>
        </ul>
        <p className="text-slate-400 font-serif mb-6">
          By using FutureSeer, you acknowledge and accept this disclaimer. Your journey is your own, and the stars are but guides along the way.
        </p>
        <div className="flex justify-center">
          <Link href="/" className="text-amber-300 hover:text-amber-200 font-semibold transition-colors">Back to Home</Link>
        </div>
      </motion.div>
    </div>
  )
} 