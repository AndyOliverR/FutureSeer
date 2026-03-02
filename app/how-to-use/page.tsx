"use client"

import React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { EnhancedFooter } from "@/components/enhanced-footer"

export default function HowToUsePage() {
  return (
    <div className="min-h-screen flex flex-col starfield-ultra-sharp">
      <div className="relative flex-1 z-20 bg-transparent flex flex-col w-full">
        <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 pt-20 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300">
              <CardContent className="p-8 md:p-12">
                <h1 className="text-2xl font-bold text-amber-400 mb-4 text-center">How to Use FutureSeer</h1>
                <p className="text-sm text-white/80 font-light mb-4 text-center">
                  Embark on your mystical journey with <span className="text-amber-400 font-semibold">FutureSeer</span>. Here's how to unlock the secrets of the cosmos:
                </p>
                <ul className="list-disc pl-6 text-sm text-white/80 font-light mb-4 space-y-2">
                  <li><span className="text-amber-400 font-semibold">Sign Up or Sign In:</span> Create your account to access personalized guidance and save your mystical history.</li>
                  <li><span className="text-amber-400 font-semibold">Explore the Tools:</span> Choose from astrology, tarot, numerology, I Ching, palmistry, and more. Each tool offers unique insights and AI-powered interpretations.</li>
                  <li><span className="text-amber-400 font-semibold">Ask the Seer:</span> Use the Ask the Seer search bar for instant, personalized answers from our AI oracle.</li>
                  <li><span className="text-amber-400 font-semibold">Customize Your Experience:</span> Set your interests, save notes, and revisit your prediction history anytime.</li>
                  <li><span className="text-amber-400 font-semibold">Stay Inspired:</span> Enjoy daily guidance, inspirational quotes, and a supportive community of seekers.</li>
                </ul>
                <p className="text-sm text-white/80 font-light mb-6">
                  If you want deeper insights or are interested in a particular field, be sure to check the relevant tool and fill in as many details as you wish. The more you share, the more the cosmos can reveal!
                </p>
                <div className="flex justify-center">
                  <Link href="/" className="text-amber-400 hover:underline transition-colors">Back to Home</Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
      <EnhancedFooter />
    </div>
  )
}
