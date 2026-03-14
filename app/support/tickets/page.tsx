"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { EnhancedFooter } from "@/components/enhanced-footer"
import { MessageSquare, Loader2, FileText } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface Ticket {
  id: string
  type: string
  subject: string
  message: string
  status: string
  response: string
  respondedAt: number | null
  createdAt: number
}

function formatDate(ms: number): string {
  try {
    return new Date(ms).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return '—'
  }
}

export default function MyTicketsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user && !authLoading) {
      router.replace('/signin?redirect=/support/tickets')
      return
    }
    if (!user) return

    const fetchTickets = async () => {
      try {
        setLoading(true)
        setError(null)
        // First attempt with current token
        const token = await user.getIdToken()
        let res = await fetch('/api/support-tickets?mine=true', {
          headers: { Authorization: `Bearer ${token}` },
        })

        // If unauthorized, retry once with a forced fresh token
        if (res.status === 401) {
          const freshToken = await user.getIdToken(true)
          res = await fetch('/api/support-tickets?mine=true', {
            headers: { Authorization: `Bearer ${freshToken}` },
          })
        }

        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error || `HTTP ${res.status}`)
        }
        const data = await res.json()
        if (data.success && Array.isArray(data.tickets)) {
          setTickets(data.tickets)
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load tickets')
      } finally {
        setLoading(false)
      }
    }
    fetchTickets()
  }, [user, authLoading, router])

  if (authLoading || (loading && tickets.length === 0)) {
    return (
      <div className="min-h-screen flex flex-col starfield-ultra-sharp items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-amber-400" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col starfield-ultra-sharp">
      <div className="relative flex-1 z-20 bg-transparent flex flex-col w-full">
        <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 pt-20 pb-20">
          <div className="text-center mb-10">
            <h1 className="text-2xl font-bold text-amber-400 mb-2">My Support Tickets</h1>
            <p className="text-sm text-white/80 font-light">
              View your queries and responses from our team
            </p>
          </div>

          <div className="mb-6">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-400 hover:border-amber-500/50 transition-colors text-sm font-medium"
            >
              <MessageSquare className="w-4 h-4" />
              Submit New Query
            </Link>
          </div>

          {error && (
            <Card className="mb-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30">
              <CardContent className="p-4">
                <p className="text-sm text-amber-400/90 font-light">{error}</p>
                <p className="text-xs text-white/60 mt-2">Check your connection and try again, or submit a new query.</p>
              </CardContent>
            </Card>
          )}

          {tickets.length === 0 && !loading && !error && (
            <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300">
              <CardContent className="p-12 text-center">
                <FileText className="w-12 h-12 text-amber-400/60 mx-auto mb-4" />
                <p className="text-white/80 text-sm font-light mb-4">You have no support tickets yet.</p>
                <Link
                  href="/contact"
                  className="text-amber-400 hover:underline font-medium"
                >
                  Submit your first query
                </Link>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            {tickets.map((ticket) => (
              <Card
                key={ticket.id}
                className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300"
              >
                <CardContent className="p-6">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium border ${
                    ticket.type === 'legal' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                    ticket.type === 'support' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                    ticket.type === 'privacy' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                    ticket.type === 'dpo' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                    ticket.type === 'billing' ? 'bg-teal-500/20 text-teal-400 border-teal-500/30' :
                    'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  }`}>
                    {ticket.type}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                      ticket.status === 'responded'
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
                    }`}
                  >
                    {ticket.status}
                  </span>
                  <span className="text-white/50 text-xs ml-auto">
                    {formatDate(ticket.createdAt)}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{ticket.subject}</h3>
                <p className="text-sm text-white/80 font-light mb-4 whitespace-pre-wrap">
                  {ticket.message}
                </p>
                {ticket.status === 'responded' && ticket.response && (
                  <div className="mt-4 pt-4 border-t border-amber-500/20">
                    <p className="text-xs font-medium text-amber-400 mb-2">Response from FutureSeer</p>
                    <p className="text-sm text-white/80 font-light whitespace-pre-wrap">
                      {ticket.response}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            ))}
          </div>
        </div>
      </div>
      <EnhancedFooter />
    </div>
  )
}
