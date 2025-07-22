"use client"

import React from "react"
import Link from "next/link"
import { motion } from "framer-motion"

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="max-w-2xl w-full bg-slate-900/80 rounded-xl shadow-xl p-8 border border-amber-400/20"
      >
        <h1 className="text-3xl font-serif text-amber-300 mb-4 text-center">Terms & Conditions</h1>
        <p className="text-slate-200 font-serif mb-4">
          By using <span className="text-amber-200 font-bold">FutureSeer</span>, you agree to the following terms and conditions. Please read them carefully before embarking on your mystical journey.
        </p>
        <ul className="list-disc pl-6 text-slate-300 font-serif mb-4">
          <li className="mb-2">You must be at least 18 years old or have parental consent to use this app.</li>
          <li className="mb-2">All guidance, predictions, and insights are for entertainment and self-reflection purposes only. They are not a substitute for professional advice.</li>
          <li className="mb-2">You are responsible for the information you provide and for keeping your account secure.</li>
          <li className="mb-2">Do not use the app for unlawful, harmful, or malicious purposes.</li>
          <li className="mb-2">We reserve the right to update these terms at any time. Continued use of the app means you accept any changes.</li>
        </ul>
        <p className="text-slate-400 font-serif mb-6">
          For questions or concerns, please contact us through the app or at our support email.
        </p>
        <div className="flex justify-center">
          <Link href="/" className="text-amber-300 hover:text-amber-200 font-semibold transition-colors">Back to Home</Link>
        </div>
      </motion.div>
    </div>
  )
} 