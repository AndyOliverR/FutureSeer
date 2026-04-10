"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, Star, ExternalLink, ImageIcon, Loader2 } from 'lucide-react';
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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!isAdmin && !isSuperadmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="admin-card max-w-md text-slate-200">
          <CardContent className="p-6 text-center">
            <CardTitle className="text-sm font-medium text-slate-200 mb-2">Admin Access Required</CardTitle>
            <p className="text-slate-300 text-sm">You need admin or superadmin privileges to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-20">
        <Button asChild type="button" variant="outline" size="sm" className="mb-6 text-xs">
          <Link href="/admin/dashboard">Back to Admin Dashboard</Link>
        </Button>
        <h1 className="text-xl font-semibold text-slate-200 mb-2">User Feedback</h1>
        <p className="text-slate-400 text-sm mb-6">
          Review ratings, comments, and screenshots from the app
        </p>

        {error && (
          <Card className="admin-card mb-6 border-red-500/50">
            <CardContent className="p-4 text-red-300">{error}</CardContent>
          </Card>
        )}

        {submissions.length === 0 && !error && (
          <div className="admin-card p-8 text-center text-slate-300">
            <MessageSquare className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <p className="text-sm">No feedback submissions yet.</p>
          </div>
        )}

        <div className="space-y-4">
          {submissions.map((s) => (
            <Card key={s.id} className="admin-card text-slate-200">
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-slate-500 text-slate-200">
                      <Star className="w-3 h-3 mr-1" />
                      {s.rating}/5
                    </Badge>
                    {s.userId && (
                      <span className="text-sm text-slate-400 truncate max-w-[120px]" title={s.userId}>
                        {s.userId.slice(0, 8)}…
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-slate-500">{formatDate(s.submittedAt ?? s.timestamp)}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {s.feedback && (
                  <p className="text-slate-300 text-sm whitespace-pre-wrap">{s.feedback}</p>
                )}
                {s.url && (
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" />
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-amber-200/90 hover:underline truncate max-w-md">
                      {s.url}
                    </a>
                  </p>
                )}
                {s.userAgent && (
                  <p className="text-xs text-slate-500 truncate max-w-full" title={s.userAgent}>
                    {s.userAgent}
                  </p>
                )}
                {s.screenshots && s.screenshots.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <ImageIcon className="w-3 h-3" aria-hidden="true" /> Screenshots:
                    </span>
                    {s.screenshots.map((url, i) => (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-amber-200/90 hover:underline text-xs"
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
