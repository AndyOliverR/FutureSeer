"use client"

import React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Mail, Book, HelpCircle, ArrowLeft } from "lucide-react"
import { EnhancedFooter } from "@/components/enhanced-footer"

export default function SupportPage() {
  return (
    <div className="min-h-screen flex flex-col starfield-ultra-sharp">
      <div className="relative flex-1 z-20 bg-transparent flex flex-col w-full">
        <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 pt-20 pb-20">
          {/* Compact section title */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <h1 className="text-2xl font-bold text-amber-400 mb-2">Help & Support</h1>
            <p className="text-sm text-white/80 font-light max-w-2xl mx-auto">
              Find answers, get assistance, or reach out to our team.
            </p>
          </motion.div>

          {/* Support Options Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8"
          >
            {/* FAQ */}
            <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 p-6 transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                  <HelpCircle className="w-6 h-6 text-amber-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">FAQ</h3>
              </div>
              <p className="text-sm text-white/80 font-light mb-4">
                Find quick answers to the most common questions about FutureSeer's features and services.
              </p>
              <Link
                href="/how-to-use"
                className="inline-flex items-center gap-2 text-amber-400 hover:underline transition-colors font-medium"
              >
                Browse FAQ
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </Link>
            </div>

            {/* Documentation */}
            <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 p-6 transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                  <Book className="w-6 h-6 text-amber-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Documentation</h3>
              </div>
              <p className="text-sm text-white/80 font-light mb-4">
                Learn how to make the most of our mystical tools and divination methods.
              </p>
              <Link
                href="/tools"
                className="inline-flex items-center gap-2 text-amber-400 hover:underline transition-colors font-medium"
              >
                Explore Tools
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </Link>
            </div>
          </motion.div>

          {/* Contact Methods */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 p-8 transition-all duration-300"
          >
            <h2 className="text-2xl font-bold text-amber-400 mb-6 text-center">Get in Touch</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email Support */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2">Email Support</h3>
                  <p className="text-sm text-white/80 font-light mb-2">
                    For detailed questions or technical issues
                  </p>
                  <Link
                    href="/contact"
                    className="text-amber-400 hover:underline transition-colors"
                  >
                    Submit a query
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 text-center"
          >
            <h3 className="text-lg font-bold text-amber-400 mb-4">Quick Links</h3>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/privacy"
                className="px-4 py-2 rounded-lg bg-amber-500/20 border border-amber-500/30 text-sm text-white hover:border-amber-500/50 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="px-4 py-2 rounded-lg bg-amber-500/20 border border-amber-500/30 text-sm text-white hover:border-amber-500/50 transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="/refund-policy"
                className="px-4 py-2 rounded-lg bg-amber-500/20 border border-amber-500/30 text-sm text-white hover:border-amber-500/50 transition-colors"
              >
                Refund Policy
              </Link>
              <Link
                href="/contact"
                className="px-4 py-2 rounded-lg bg-amber-500/20 border border-amber-500/30 text-sm text-white hover:border-amber-500/50 transition-colors"
              >
                Contact Us
              </Link>
              <Link
                href="/support/tickets"
                className="px-4 py-2 rounded-lg bg-amber-500/20 border border-amber-500/30 text-sm text-white hover:border-amber-500/50 transition-colors"
              >
                My Tickets
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      <EnhancedFooter />
    </div>
  )
}
