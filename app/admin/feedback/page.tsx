"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, Star, ExternalLink, Image, Crown, Loader2, ChevronLeft } from 'lucide-react';
function formatDate(ms?: number): string {
  if (ms == null) return '—';
  try {
    const d = new Date(ms);
    return d.toLocaleString();
  } catch {
    return '—';
  }
}

interface FeedbackSubmission {
  id: string;
  rating: number;
  feedback: string;
  url: string;
  userAgent: string;
  userId: string | null;
  timestamp?: number;
  submittedAt?: number;
  screenshots: string[];
  screenshotCount: number;
}

export default function AdminFeedbackPage() {
  const { user, isAdmin, isSuperadmin, loading: authLoading } = useAuth();
  const [submissions, setSubmissions] = useState<FeedbackSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || (!isAdmin && !isSuperadmin)) {
      setLoading(false);
      return;
    }
    const fetchFeedback = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = await user.getIdToken();
        const res = await fetch('/api/admin/feedback?limit=100', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || `HTTP ${res.status}`);
        }
        const data = await res.json();
        if (data.success && Array.isArray(data.submissions)) {
          setSubmissions(data.submissions);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load feedback');
      } finally {
        setLoading(false);
      }
    };
    fetchFeedback();
  }, [user, isAdmin, isSuperadmin]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen starfield-ultra-sharp flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-amber-400" />
      </div>
    );
  }

  if (!isAdmin && !isSuperadmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96 bg-slate-900/80 backdrop-blur-sm border-amber-500/20">
          <CardContent className="p-6 text-center">
            <Crown className="w-12 h-12 text-amber-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-amber-200 mb-2">Admin Access Required</h2>
            <p className="text-gray-400 mb-4">You need admin or superadmin privileges to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
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
            User Feedback
          </h1>
          <p className="text-gray-400 text-lg">
            Review ratings, comments, and screenshots from the app
          </p>
        </div>

        {error && (
          <Card className="mb-6 bg-red-900/20 border-red-500/30">
            <CardContent className="p-4 text-red-200">{error}</CardContent>
          </Card>
        )}

        {submissions.length === 0 && !error && (
          <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300 hover:scale-[1.01] p-8 text-center">
            <MessageSquare className="w-12 h-12 text-amber-400/60 mx-auto mb-4" />
            <p className="text-white/80 text-sm">No feedback submissions yet.</p>
          </div>
        )}

        <div className="space-y-4">
          {submissions.map((s) => (
            <Card key={s.id} className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300 hover:scale-[1.01]">
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-amber-500/30 text-amber-400">
                      <Star className="w-3 h-3 mr-1" />
                      {s.rating}/5
                    </Badge>
                    {s.userId && (
                      <span className="text-sm text-gray-400 truncate max-w-[120px]" title={s.userId}>
                        {s.userId.slice(0, 8)}…
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">{formatDate(s.submittedAt ?? s.timestamp)}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {s.feedback && (
                  <p className="text-white/90 text-sm whitespace-pre-wrap">{s.feedback}</p>
                )}
                {s.url && (
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" />
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline truncate max-w-md">
                      {s.url}
                    </a>
                  </p>
                )}
                {s.userAgent && (
                  <p className="text-xs text-gray-500 truncate max-w-full" title={s.userAgent}>
                    {s.userAgent}
                  </p>
                )}
                {s.screenshots && s.screenshots.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Image className="w-3 h-3" /> Screenshots:
                    </span>
                    {s.screenshots.map((url, i) => (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-amber-400 hover:underline text-xs"
                      >
                        Image {i + 1}
                      </a>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
