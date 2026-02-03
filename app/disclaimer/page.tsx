"use client"

import React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Header } from "@/components/header"
import { EnhancedFooter } from "@/components/enhanced-footer"

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen flex flex-col starfield-ultra-sharp">
      <Header />
      <div className="relative flex-1 z-20 bg-transparent flex flex-col w-full">
        <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 pt-20 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300 hover:scale-105">
              <CardContent className="p-8 md:p-12">
                <h1 className="text-2xl font-bold text-amber-400 mb-4 text-center">Disclaimer</h1>
                <p className="text-sm text-white/80 font-light mb-4">
                  <span className="text-amber-400 font-semibold">FutureSeer</span> is designed to inspire, guide, and entertain. The insights and predictions offered are based on traditional and modern mystical systems, as well as AI-powered interpretations.
                </p>
                <ul className="list-disc pl-6 text-sm text-white/80 font-light mb-4 space-y-2">
                  <li>No information provided by this app should be considered medical, legal, financial, or psychological advice.</li>
                  <li>Always consult qualified professionals for serious matters or decisions.</li>
                  <li>Use your own judgment and intuition when interpreting guidance from the app.</li>
                </ul>
                <p className="text-sm text-white/80 font-light mb-6">
                  By using FutureSeer, you acknowledge and accept this disclaimer. Your journey is your own, and the stars are but guides along the way.
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
