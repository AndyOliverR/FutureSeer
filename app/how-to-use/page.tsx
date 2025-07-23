"use client"

import React from "react"
import Link from "next/link"
import { motion } from "framer-motion"

export default function HowToUsePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="max-w-2xl w-full bg-slate-900/80 rounded-xl shadow-xl p-8 border border-amber-400/20"
      >
        <h1 className="text-3xl font-serif text-amber-300 mb-4 text-center">How to Use FutureSeer</h1>
        <p className="text-lg text-slate-200 font-serif mb-4 text-center">
          Embark on your mystical journey with <span className="text-amber-200 font-bold">FutureSeer</span>. Here’s how to unlock the secrets of the cosmos:
        </p>
        <ul className="list-disc pl-6 text-slate-300 font-serif mb-4">
          <li className="mb-2"><span className="text-amber-200 font-semibold">Sign Up or Sign In:</span> Create your account to access personalized guidance and save your mystical history.</li>
          <li className="mb-2"><span className="text-amber-200 font-semibold">Explore the Tools:</span> Choose from astrology, tarot, numerology, I Ching, palmistry, and more. Each tool offers unique insights and AI-powered interpretations.</li>
          <li className="mb-2"><span className="text-amber-200 font-semibold">Ask the Seer:</span> Use the Ask the Seer search bar for instant, personalized answers from our AI oracle.</li>
          <li className="mb-2"><span className="text-amber-200 font-semibold">Customize Your Experience:</span> Set your interests, save notes, and revisit your prediction history anytime.</li>
          <li className="mb-2"><span className="text-amber-200 font-semibold">Stay Inspired:</span> Enjoy daily guidance, inspirational quotes, and a supportive community of seekers.</li>
        </ul>
        <p className="text-slate-400 font-serif mb-6">
          If you want deeper insights or are interested in a particular field, be sure to check the relevant tool and fill in as many details as you wish. The more you share, the more the cosmos can reveal!
        </p>
        <div className="flex justify-center">
          <Link href="/" className="text-amber-300 hover:text-amber-200 font-semibold transition-colors">Back to Home</Link>
        </div>
      </motion.div>
    </div>
  )
} 