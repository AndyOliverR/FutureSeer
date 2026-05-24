"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Quote, Star } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { LANDING_SURVEY_TOPICS } from "@/lib/landingSurveyTypes";

interface LandingTestimonialRow {
  id: string;
  kind: string;
  rating: number | null;
  experienceText: string;
  topic: string;
  displayName: string;
  roleLabel: string;
  sharePublicly: boolean;
  status: string;
  submittedAt: number | null;
}

function formatDate(ms: number | null): string {
  if (ms == null) return "—";
  try {
    return new Date(ms).toLocaleString();
  } catch {
    return "—";
  }
}

function topicLabel(id: string): string {
  return LANDING_SURVEY_TOPICS.find((t) => t.id === id)?.label ?? id;
}

export default function AdminTestimonialsPage() {
  const { user, isAdmin, isSuperadmin, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<LandingTestimonialRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"pending" | "approved" | "rejected">("pending");
  const [actingId, setActingId] = useState<string | null>(null);

  const loadItems = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const token = await user.getIdToken();
      const res = await fetch(`/api/admin/landing-testimonials?status=${statusFilter}&limit=50`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = (await res.json()) as { error?: string; items?: LandingTestimonialRow[] };
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setItems(Array.isArray(data.items) ? data.items : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load testimonials");
    } finally {
      setLoading(false);
    }
  }, [user, statusFilter]);

  useEffect(() => {
    if (!user || (!isAdmin && !isSuperadmin)) {
      setLoading(false);
      return;
    }
    void loadItems();
  }, [user, isAdmin, isSuperadmin, loadItems]);

  const handleAction = async (id: string, action: "approve" | "reject") => {
    if (!user) return;
    setActingId(id);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/admin/landing-testimonials", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, action }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Action failed");
      toast({ title: action === "approve" ? "Approved for homepage" : "Rejected" });
      setItems((prev) => prev.filter((row) => row.id !== id));
    } catch (e) {
      toast({
        title: "Could not update",
        description: e instanceof Error ? e.message : "Try again",
        variant: "destructive",
      });
    } finally {
      setActingId(null);
    }
  };

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
            <p className="text-slate-300 text-sm">You need admin privileges to moderate landing testimonials.</p>
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
        <div className="flex items-center gap-2 mb-2">
          <Quote className="h-5 w-5 text-amber-400" />
          <h1 className="text-xl font-semibold text-slate-200">Landing testimonials</h1>
        </div>
        <p className="text-slate-400 text-sm mb-6">
          Review survey submissions from the homepage. Only approved quotes with public consent appear on the landing
          page.
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          {(["pending", "approved", "rejected"] as const).map((s) => (
            <Button
              key={s}
              type="button"
              size="sm"
              variant={statusFilter === s ? "default" : "outline"}
              className="capitalize text-xs"
              onClick={() => setStatusFilter(s)}
            >
              {s}
            </Button>
          ))}
        </div>

        {error ? <p className="text-red-400 text-sm mb-4">{error}</p> : null}

        {items.length === 0 ? (
          <Card className="admin-card text-slate-300">
            <CardContent className="p-8 text-center text-sm">No {statusFilter} submissions.</CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {items.map((row) => (
              <Card key={row.id} className="admin-card text-slate-200">
                <CardHeader className="pb-2">
                  <div className="flex flex-wrap items-center gap-2 justify-between">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      {row.kind === "testimonial" ? "Testimonial" : "Hope / feedback"}
                      {row.sharePublicly ? (
                        <Badge variant="outline" className="text-amber-300 border-amber-500/40">
                          Homepage OK
                        </Badge>
                      ) : null}
                    </CardTitle>
                    <span className="text-xs text-slate-500">{formatDate(row.submittedAt)}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {row.rating != null ? (
                    <div className="flex gap-0.5">
                      {[...Array(row.rating)].map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  ) : null}
                  <p className="text-sm text-slate-300 leading-relaxed italic">&ldquo;{row.experienceText}&rdquo;</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span>Topic: {topicLabel(row.topic)}</span>
                    {row.displayName ? <span>Name: {row.displayName}</span> : null}
                    {row.roleLabel ? <span>{row.roleLabel}</span> : null}
                  </div>
                  {statusFilter === "pending" && row.sharePublicly && row.kind === "testimonial" ? (
                    <div className="flex flex-wrap gap-2 pt-2">
                      <Button
                        type="button"
                        size="sm"
                        disabled={actingId === row.id}
                        onClick={() => void handleAction(row.id, "approve")}
                      >
                        {actingId === row.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Approve for homepage"}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={actingId === row.id}
                        onClick={() => void handleAction(row.id, "reject")}
                      >
                        Reject
                      </Button>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
