"use client"

import React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, MessageCircle, Mail, Book, FileText, HelpCircle, Phone } from "lucide-react"

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-fixed bg-center bg-no-repeat overflow-hidden"
         style={{ 
           backgroundImage: "url('/assets/bg/starfield.avif')",
           backgroundSize: "cover",
           imageRendering: "crisp-edges"
         } as React.CSSProperties}>
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-transparent to-slate-950/40" />
      
      <div className="relative z-10 p-4 max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Link 
            href="/dashboard"
            className="inline-flex items-center gap-2 text-amber-200 hover:text-amber-100 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          
          <div className="text-center">
            <h1 className="text-4xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600 mb-4">
              Help & Support
            </h1>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto">
              We're here to help you on your mystical journey. Find answers, get assistance, or reach out to our team.
            </p>
          </div>
        </motion.div>

        {/* Support Options Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        >
          {/* FAQ */}
          <div className="rounded-2xl backdrop-blur-md bg-slate-900/40 border border-slate-700/50 p-6 card-glow hover:border-purple-500/30 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500/20 to-indigo-500/20 flex items-center justify-center">
                <HelpCircle className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-serif text-amber-200">FAQ</h3>
            </div>
            <p className="text-slate-300 mb-4">
              Find quick answers to the most common questions about FutureSeer's features and services.
            </p>
            <Link 
              href="/how-to-use"
              className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors font-medium"
            >
              Browse FAQ
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </Link>
          </div>

          {/* Documentation */}
          <div className="rounded-2xl backdrop-blur-md bg-slate-900/40 border border-slate-700/50 p-6 card-glow hover:border-blue-500/30 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                <Book className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-serif text-amber-200">Documentation</h3>
            </div>
            <p className="text-slate-300 mb-4">
              Learn how to make the most of our mystical tools and divination methods.
            </p>
            <Link 
              href="/tools"
              className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors font-medium"
            >
              Explore Tools
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </Link>
          </div>

          {/* Contact Support */}
          <div className="rounded-2xl backdrop-blur-md bg-slate-900/40 border border-slate-700/50 p-6 card-glow hover:border-green-500/30 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-serif text-amber-200">Live Chat</h3>
            </div>
            <p className="text-slate-300 mb-4">
              Get instant help from our support team. Available 24/7 for premium members.
            </p>
            <button className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors font-medium">
              Start Chat
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </button>
          </div>
        </motion.div>

        {/* Contact Methods */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="rounded-2xl backdrop-blur-md bg-slate-900/40 border border-slate-700/50 p-8 card-glow"
        >
          <h2 className="text-2xl font-serif text-amber-200 mb-6 text-center">Get in Touch</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email Support */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-amber-500/20 to-yellow-500/20 flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="font-serif text-amber-200 mb-2">Email Support</h3>
                <p className="text-slate-300 text-sm mb-2">
                  For detailed questions or technical issues
                </p>
                <a 
                  href="mailto:support@futureseer.app"
                  className="text-amber-400 hover:text-amber-300 transition-colors"
                >
                  support@futureseer.app
                </a>
              </div>
            </div>

            {/* Priority Support */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="font-serif text-amber-200 mb-2">Priority Support</h3>
                <p className="text-slate-300 text-sm mb-2">
                  Premium members get priority assistance
                </p>
                <span className="text-purple-400">
                  Available in your dashboard
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-8 text-center"
        >
          <h3 className="text-lg font-serif text-amber-200 mb-4">Quick Links</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              href="/privacy"
              className="px-4 py-2 rounded-lg bg-slate-800/50 text-slate-300 hover:text-amber-200 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link 
              href="/terms"
              className="px-4 py-2 rounded-lg bg-slate-800/50 text-slate-300 hover:text-amber-200 transition-colors"
            >
              Terms of Service
            </Link>
            <Link 
              href="/refund-policy"
              className="px-4 py-2 rounded-lg bg-slate-800/50 text-slate-300 hover:text-amber-200 transition-colors"
            >
              Refund Policy
            </Link>
            <Link 
              href="/contact"
              className="px-4 py-2 rounded-lg bg-slate-800/50 text-slate-300 hover:text-amber-200 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
