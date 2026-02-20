"use client"

import { useState, useEffect, Suspense } from 'react'
import { devLog } from '@/lib/devLogger';
import Link from "next/link"
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { EnhancedFooter } from "@/components/enhanced-footer"

function ContactContent() {
  const { user, userProfile, loading: authLoading } = useAuth()
  const searchParams = useSearchParams()
  const typeParam = searchParams.get('type')

  const [formData, setFormData] = useState({
    type: 'support',
    subject: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })

  useEffect(() => {
    if (typeParam && ['legal', 'privacy', 'dpo', 'billing', 'support'].includes(typeParam)) {
      setFormData((prev) => ({ ...prev, type: typeParam }))
    }
  }, [typeParam])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setIsSubmitting(true)
    setSubmitStatus({ type: null, message: '' })

    try {
      const token = await user.getIdToken()
      const response = await fetch('/api/support-tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: formData.type,
          subject: formData.subject,
          message: formData.message,
          userName: userProfile?.displayName || user.displayName || '',
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSubmitStatus({
          type: 'success',
          message: data.message || 'Your query has been submitted. You can track it in My Tickets.',
        })
        setFormData({ type: formData.type, subject: '', message: '' })
      } else {
        setSubmitStatus({
          type: 'error',
          message: data.error || 'Failed to submit. Please try again.',
        })
      }
    } catch (error) {
      devLog.error('Error submitting:', error, 'page')
      setSubmitStatus({
        type: 'error',
        message: 'An unexpected error occurred. Please try again later.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="min-h-screen flex flex-col starfield-ultra-sharp">
      <div className="relative flex-1 z-20 bg-transparent flex flex-col w-full">
        <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 pt-20 pb-20">
          <div className="text-center mb-12">
            <h1 className="text-2xl font-bold text-amber-400 mb-2">
              Contact Us
            </h1>
            <p className="text-sm text-white/80 font-light">
              Get in touch with our mystical support team
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="space-y-6">
              <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 p-6 transition-all duration-300">
                <h2 className="text-2xl font-bold text-amber-400 mb-4">
                  Get in Touch
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-amber-500/20 border border-amber-500/30 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white/80 font-medium text-sm">Support</p>
                      <Link href="/contact" className="text-amber-400 hover:underline transition-colors">
                        Submit a query
                      </Link>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-amber-500/20 border border-amber-500/30 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white/80 font-medium text-sm">Response Time</p>
                      <p className="text-amber-400">Within 24 hours</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-amber-500/20 border border-amber-500/30 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white/80 font-medium text-sm">Track your query</p>
                      <Link href="/support/tickets" className="text-amber-400 hover:underline transition-colors">
                        My Tickets
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 p-6 transition-all duration-300">
              <h2 className="text-2xl font-bold text-amber-400 mb-4">
                Send us a Message
              </h2>

              {!user && !authLoading && (
                <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-4 mb-4">
                  <p className="text-sm text-white/80 mb-3">
                    Sign in to submit a query and track your ticket.
                  </p>
                  <Link
                    href={`/signin?redirect=${encodeURIComponent('/contact' + (typeParam ? `?type=${typeParam}` : ''))}`}
                    className="inline-block px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-medium text-sm transition-colors"
                  >
                    Sign in to submit
                  </Link>
                </div>
              )}

              {submitStatus.type && (
                <div className={`mb-4 p-4 rounded-md text-sm ${
                  submitStatus.type === 'success'
                    ? 'bg-green-500/20 border border-green-500/50 text-green-400'
                    : 'bg-red-500/20 border border-red-500/50 text-red-400'
                }`}>
                  {submitStatus.message}
                  {submitStatus.type === 'success' && (
                    <Link href="/support/tickets" className="block mt-2 text-amber-400 hover:underline">
                      View your tickets →
                    </Link>
                  )}
                </div>
              )}

              {user && (
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Query Type *
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-slate-800/50 border border-amber-500/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required
                    >
                      <option value="support">Support</option>
                      <option value="legal">Legal</option>
                      <option value="privacy">Privacy</option>
                      <option value="dpo">Data Protection Officer</option>
                      <option value="billing">Billing</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Subject *
                    </label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-slate-800/50 border border-amber-500/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required
                    >
                      <option value="">Select a subject</option>
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Technical Support">Technical Support</option>
                      <option value="Billing & Payments">Billing & Payments</option>
                      <option value="Feature Request">Feature Request</option>
                      <option value="Bug Report">Bug Report</option>
                      <option value="Partnership">Partnership</option>
                      <option value="Legal Inquiry">Legal Inquiry</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-3 py-2 bg-slate-800/50 border border-amber-500/30 rounded-md text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="Tell us how we can help you..."
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200"
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 p-6 transition-all duration-300">
            <h2 className="text-2xl font-bold text-amber-400 mb-4">
              Additional Support
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Help Center</h3>
                <p className="text-sm text-white/80 font-light mb-3">
                  Find answers to common questions and learn how to use FutureSeer effectively.
                </p>
                <Link href="/how-to-use" className="text-amber-400 hover:underline transition-colors">
                  Visit Help Center →
                </Link>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Community</h3>
                <p className="text-sm text-white/80 font-light mb-3">
                  Connect with other users and share your mystical experiences.
                </p>
                <Link href="/subscribe" className="text-amber-400 hover:underline transition-colors">
                  Join Community →
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center text-sm text-white/60 font-light space-y-2">
            <p>
              Legal: <Link href="/contact?type=legal" className="text-amber-400 hover:underline">Submit a legal query</Link>
              {' · '}
              Privacy: <Link href="/contact?type=privacy" className="text-amber-400 hover:underline">Submit a privacy query</Link>
              {' · '}
              DPO: <Link href="/contact?type=dpo" className="text-amber-400 hover:underline">Submit a DPO query</Link>
              {' · '}
              Billing: <Link href="/contact?type=billing" className="text-amber-400 hover:underline">Submit a billing query</Link>
            </p>
            <p>
              FutureSeer is committed to providing excellent support to all our users.
            </p>
          </div>
        </div>
      </div>
      <EnhancedFooter />
    </div>
  )
}

export default function ContactPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col starfield-ultra-sharp items-center justify-center">
        <div className="animate-pulse text-amber-400">Loading...</div>
      </div>
    }>
      <ContactContent />
    </Suspense>
  )
}
