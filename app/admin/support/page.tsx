"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { MessageSquare, Crown, Loader2, Send, Star, Image, ExternalLink, ChevronLeft, Sparkles } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

function formatDate(ms?: number | null): string {
  if (ms == null) return '—'
  try {
    return new Date(ms).toLocaleString()
  } catch {
    return '—'
  }
}

interface Ticket {
  id: string
  userId: string
  userEmail: string
  userName: string
  type: string
  subject: string
  message: string
  status: string
  response: string
  respondedAt: number | null
  respondedBy: string | null
  createdAt: number
}

interface FeedbackSubmission {
  id: string
  rating: number
  feedback: string
  url: string
  userId: string | null
  submittedAt?: number
  screenshots: string[]
}

interface ToolInterestSubmission {
  id: string
  techniqueName: string
  techniqueSlug: string
  email?: string
  message?: string
  userId?: string
  createdAt: number | null
}

export default function AdminSupportPage() {
  const { user, isAdmin, isSuperadmin, loading: authLoading } = useAuth()
  const [activeTab, setActiveTab] = useState<'tickets' | 'feedback' | 'tool-interest'>('tickets')
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [feedback, setFeedback] = useState<FeedbackSubmission[]>([])
  const [toolInterest, setToolInterest] = useState<ToolInterestSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [responseText, setResponseText] = useState<Record<string, string>>({})
  const [submittingId, setSubmittingId] = useState<string | null>(null)

  useEffect(() => {
    if (!user || (!isAdmin && !isSuperadmin)) {
      setLoading(false)
      return
    }
    const fetchAll = async () => {
      try {
        setLoading(true)
        setError(null)
        const token = await user.getIdToken()
        const [ticketsRes, feedbackRes, toolInterestRes] = await Promise.all([
          fetch('/api/support-tickets', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/admin/feedback?limit=100', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/admin/tool-interest?limit=100', { headers: { Authorization: `Bearer ${token}` } }),
        ])
        if (!ticketsRes.ok) {
          const data = await ticketsRes.json().catch(() => ({}))
          throw new Error(data.error || 'Failed to load tickets')
        }
        const ticketsData = await ticketsRes.json()
        if (ticketsData.success && Array.isArray(ticketsData.tickets)) {
          setTickets(ticketsData.tickets)
        }
        if (feedbackRes.ok) {
          const feedbackData = await feedbackRes.json()
          if (feedbackData.success && Array.isArray(feedbackData.submissions)) {
            setFeedback(feedbackData.submissions)
          }
        }
        if (toolInterestRes.ok) {
          const toolInterestData = await toolInterestRes.json()
          if (toolInterestData.success && Array.isArray(toolInterestData.submissions)) {
            setToolInterest(toolInterestData.submissions)
          }
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load')
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [user, isAdmin, isSuperadmin])

  const handleSubmitResponse = async (ticketId: string) => {
    const text = responseText[ticketId]?.trim()
    if (!text || !user) return

    setSubmittingId(ticketId)
    try {
      const token = await user.getIdToken()
      const res = await fetch(`/api/support-tickets/${ticketId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ response: text }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to submit')
      }
      setTickets((prev) =>
        prev.map((t) =>
          t.id === ticketId
            ? {
                ...t,
                status: 'responded',
                response: text,
                respondedAt: Date.now(),
                respondedBy: user.uid,
              }
            : t
        )
      )
      setResponseText((prev) => ({ ...prev, [ticketId]: '' }))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to submit response')
    } finally {
      setSubmittingId(null)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen starfield-ultra-sharp flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-amber-400" />
      </div>
    )
  }

  if (!isAdmin && !isSuperadmin) {
    return (
      <div className="min-h-screen flex flex-col starfield-ultra-sharp items-center justify-center">
        <Card className="w-96 bg-slate-900/80 backdrop-blur-sm border-amber-500/20">
          <CardContent className="p-6 text-center">
            <Crown className="w-12 h-12 text-amber-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-amber-200 mb-2">Admin Access Required</h2>
            <p className="text-white/80 text-sm mb-4">
              You need admin or superadmin privileges to access the Support Desk.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="starfield-ultra-sharp min-h-screen overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-20">
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center gap-1 text-amber-400/90 hover:text-amber-300 text-sm font-medium mb-8"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Admin Dashboard
        </Link>
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600 bg-clip-text text-transparent mb-4">
            Support Desk
          </h1>
          <p className="text-gray-400 text-lg">
            Support, legal, and DPO queries, feedback, and tool interest from users
          </p>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('tickets')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'tickets'
                ? 'bg-amber-500/20 border border-amber-500/50 text-amber-400'
                : 'bg-slate-800/50 border border-slate-600 text-white/70 hover:border-amber-500/30'
            }`}
          >
            Support & Legal
          </button>
          <button
            onClick={() => setActiveTab('feedback')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'feedback'
                ? 'bg-amber-500/20 border border-amber-500/50 text-amber-400'
                : 'bg-slate-800/50 border border-slate-600 text-white/70 hover:border-amber-500/30'
            }`}
          >
            Feedback
          </button>
          <button
            onClick={() => setActiveTab('tool-interest')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'tool-interest'
                ? 'bg-amber-500/20 border border-amber-500/50 text-amber-400'
                : 'bg-slate-800/50 border border-slate-600 text-white/70 hover:border-amber-500/30'
            }`}
          >
            Tool interest
          </button>
        </div>

        {error && (
          <div className="rounded-xl bg-red-500/20 border border-red-500/50 p-4 text-red-400 text-sm mb-6">
            {error}
          </div>
        )}

        {activeTab === 'tickets' && tickets.length === 0 && !error && (
          <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300  p-12 text-center">
            <MessageSquare className="w-12 h-12 text-amber-400/60 mx-auto mb-4" />
            <p className="text-white/80 text-sm">No support tickets yet.</p>
          </div>
        )}

        {activeTab === 'feedback' && feedback.length === 0 && !error && (
          <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300  p-12 text-center">
            <Star className="w-12 h-12 text-amber-400/60 mx-auto mb-4" />
            <p className="text-white/80 text-sm">No feedback submissions yet.</p>
          </div>
        )}

        {activeTab === 'tool-interest' && toolInterest.length === 0 && !error && (
          <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300  p-12 text-center">
            <Sparkles className="w-12 h-12 text-amber-400/60 mx-auto mb-4" />
            <p className="text-white/80 text-sm">No tool interest submissions yet.</p>
          </div>
        )}

        {activeTab === 'tickets' && (
        <div className="space-y-4">
          {tickets.map((t) => (
            <div
              key={t.id}
              className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300  p-6"
            >
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className={`px-2 py-0.5 rounded text-xs font-medium border ${
                  t.type === 'legal' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                  t.type === 'support' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                  t.type === 'privacy' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                  t.type === 'dpo' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                  t.type === 'billing' ? 'bg-teal-500/20 text-teal-400 border-teal-500/30' :
                  'bg-amber-500/20 text-amber-400 border-amber-500/30'
                }`}>
                  {t.type}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-xs font-medium ${
                    t.status === 'responded'
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
                  }`}
                >
                  {t.status}
                </span>
                <span className="text-white/50 text-xs ml-auto">{formatDate(t.createdAt)}</span>
              </div>
              <p className="text-xs text-white/60 mb-1">
                {t.userEmail} · {t.userId?.slice(0, 8)}…
              </p>
              <h3 className="text-lg font-semibold text-white mb-2">{t.subject}</h3>
              <p className="text-sm text-white/80 font-light whitespace-pre-wrap mb-4">{t.message}</p>

              {t.status === 'responded' && t.response && (
                <div className="mt-4 pt-4 border-t border-amber-500/20">
                  <p className="text-xs font-medium text-amber-400 mb-2">Your response</p>
                  <p className="text-sm text-white/80 font-light whitespace-pre-wrap">{t.response}</p>
                  <p className="text-xs text-white/50 mt-1">{formatDate(t.respondedAt)}</p>
                </div>
              )}

              {t.status === 'open' && (
                <div className="mt-4 pt-4 border-t border-amber-500/20">
                  <textarea
                    value={responseText[t.id] ?? ''}
                    onChange={(e) =>
                      setResponseText((prev) => ({ ...prev, [t.id]: e.target.value }))
                    }
                    placeholder="Type your response..."
                    rows={4}
                    className="w-full px-3 py-2 bg-slate-800/50 border border-amber-500/30 rounded-md text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                  />
                  <Button
                    onClick={() => handleSubmitResponse(t.id)}
                    disabled={!responseText[t.id]?.trim() || submittingId === t.id}
                    className="mt-2 bg-amber-500 hover:bg-amber-600 text-white"
                  >
                    {submittingId === t.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Submit Response
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
        )}

        {activeTab === 'tool-interest' && (
        <div className="space-y-4">
          {toolInterest.map((s) => (
            <div
              key={s.id}
              className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300  p-6"
            >
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  Tool interest
                </span>
                <span className="text-white/50 text-xs ml-auto">{formatDate(s.createdAt)}</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">{s.techniqueName}</h3>
              {s.techniqueSlug && (
                <p className="text-xs text-white/50 mb-2">{s.techniqueSlug}</p>
              )}
              <p className="text-xs text-white/60 mb-2">
                {s.email || (s.userId ? `${s.userId.slice(0, 8)}…` : 'Anonymous')}
              </p>
              {s.message && (
                <p className="text-sm text-white/80 font-light whitespace-pre-wrap">{s.message}</p>
              )}
            </div>
          ))}
        </div>
        )}

        {activeTab === 'feedback' && (
        <div className="space-y-4">
          {feedback.map((s) => (
            <div
              key={s.id}
              className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300  p-6"
            >
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Feedback
                </span>
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  {s.rating}/5
                </span>
                <span className="text-white/50 text-xs ml-auto">{formatDate(s.submittedAt)}</span>
              </div>
              <p className="text-xs text-white/60 mb-1">
                {s.userId ? `${s.userId.slice(0, 8)}…` : 'Anonymous'}
              </p>
              {s.feedback && (
                <p className="text-sm text-white/80 font-light whitespace-pre-wrap mb-3">{s.feedback}</p>
              )}
              {s.url && (
                <p className="text-xs text-white/60 flex items-center gap-1 mb-2">
                  <ExternalLink className="w-3 h-3" />
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline truncate max-w-md">
                    {s.url}
                  </a>
                </p>
              )}
              {s.screenshots && s.screenshots.length > 0 && (
                <div className="flex flex-col gap-2 pt-2">
                  <span className="text-xs text-white/60 flex items-center gap-1">
                    <Image className="w-3 h-3" /> Screenshots:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {s.screenshots.map((url, i) => (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block rounded border border-amber-500/30 overflow-hidden hover:border-amber-500/50 transition-colors bg-slate-800/50"
                      >
                        <img
                          src={url}
                          alt={`Screenshot ${i + 1}`}
                          className="max-w-[200px] max-h-[150px] object-contain rounded"
                          referrerPolicy="no-referrer"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        )}
      </div>
    </div>
  )
}
