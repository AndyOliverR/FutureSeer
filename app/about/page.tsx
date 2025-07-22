"use client"

import React from "react"
import Link from "next/link"
import { motion } from "framer-motion"

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="max-w-2xl w-full bg-slate-900/80 rounded-xl shadow-xl p-8 border border-amber-400/20"
      >
        <h1 className="text-3xl font-serif text-amber-300 mb-4 text-center">About FutureSeer</h1>
        <p className="text-lg text-slate-200 font-serif mb-4 text-center">
          Welcome to <span className="text-amber-200 font-bold">FutureSeer</span>, your gateway to the mystical arts and the wisdom of the ancients. Our vision is to empower every seeker with the tools, insights, and guidance to navigate life’s mysteries and unlock their highest potential.
        </p>
        <p className="text-slate-300 font-serif mb-4">
          FutureSeer brings together the world’s most powerful divination systems—astrology, numerology, tarot, I Ching, palmistry, and more—into a single, beautifully designed platform. Whether you’re a curious beginner or a seasoned mystic, you’ll find personalized guidance, AI-powered interpretations, and a supportive community of fellow seekers.
        </p>
        <p className="text-slate-400 font-serif mb-6">
          Our mission is to make the occult accessible, relatable, and inspiring for all. We believe that everyone deserves to know the secrets written in the stars and within themselves.
        </p>
        <div className="flex justify-center">
          <Link href="/" className="text-amber-300 hover:text-amber-200 font-semibold transition-colors">Back to Home</Link>
        </div>
      </motion.div>
    </div>
  )
} 