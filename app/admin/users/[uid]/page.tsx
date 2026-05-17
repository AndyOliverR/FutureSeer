"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, ExternalLink, Loader2, RefreshCw } from "lucide-react";
import type { AdminUserJourneyPayload, JourneyChip, JourneyChipState } from "@/lib/adminUserJourneyTypes";

function chipVariant(state: JourneyChipState): "default" | "secondary" | "destructive" | "outline" {
  if (state === "yes") return "default";
  if (state === "running" || state === "partial") return "secondary";
  if (state === "no") return "destructive";
  return "outline";
}

function JourneyChipCard({ title, chip }: { title: string; chip: JourneyChip }) {
  return (
    <Card className="admin-card border-slate-700/60 bg-slate-900/40">
      <CardHeader className="pb-2 pt-4">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm font-medium text-slate-200">{title}</CardTitle>
          <Badge variant={chipVariant(chip.state)} className="shrink-0 capitalize">
            {chip.state}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-4 pt-0">
        <p className="text-sm font-medium text-slate-100">{chip.label}</p>
        <p className="mt-1 text-xs text-slate-400 leading-relaxed">{chip.detail}</p>
      </CardContent>
    </Card>
  );
}

function formatTs(ts: string) {
  const d = new Date(ts);
  if (isNaN(d.getTime())) return ts;
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminUserJourneyPage() {
  const params = useParams();
  const uid = typeof params.uid === "string" ? params.uid : "";
  const { user, isAdmin, isSuperadmin } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AdminUserJourneyPayload | null>(null);

  const load = useCallback(async () => {
    if (!user || (!isAdmin && !isSuperadmin) || !uid) return;
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/admin/users/${encodeURIComponent(uid)}/journey`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      setData(body as AdminUserJourneyPayload);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      toast({ title: "Failed to load journey", description: msg, variant: "destructive" });
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [user, isAdmin, isSuperadmin, uid, toast]);

  useEffect(() => {
    void load();
  }, [load]);

  const email =
    (data?.auth?.email as string | undefined) ??
    (typeof data?.profile?.email === "string" ? data.profile.email : null);
  const displayName =
    data?.auth?.displayName ??
    (typeof data?.profile?.displayName === "string" ? data.profile.displayName : null);

  return (
    <div className="mx-auto max-w-5xl p-4 md:p-8 text-slate-200">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Button variant="outline" size="sm" asChild className="border-slate-600 text-slate-200">
          <Link href="/admin/dashboard">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Dashboard
          </Link>
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={loading}
          onClick={() => void load()}
          className="border-slate-600 text-slate-200"
        >
          <RefreshCw className={`mr-1 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
        {uid && (
          <Button variant="outline" size="sm" asChild className="border-slate-600 text-slate-200">
            <Link href={`/admin/errors?userId=${encodeURIComponent(uid)}`}>
              <ExternalLink className="mr-1 h-4 w-4" />
              Errors for user
            </Link>
          </Button>
        )}
      </div>

      <h1 className="text-2xl font-semibold text-slate-100">User journey</h1>
      <p className="mt-1 font-mono text-sm text-slate-400">{uid}</p>
      {(displayName || email) && (
        <p className="mt-1 text-slate-300">
          {displayName}
          {email ? ` · ${email}` : ""}
        </p>
      )}

      {loading && (
        <div className="mt-12 flex justify-center text-slate-400">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )}

      {!loading && data && (
        <>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <JourneyChipCard title="Account" chip={data.chips.account} />
            <JourneyChipCard title="Sign-up" chip={data.chips.signup} />
            <JourneyChipCard title="Birth profile" chip={data.chips.birthProfile} />
            <JourneyChipCard title="Mystical profile" chip={data.chips.mysticalProfile} />
            <JourneyChipCard title="Subscribed" chip={data.chips.subscribed} />
            <JourneyChipCard title="Tools" chip={data.chips.toolsUsed} />
            <JourneyChipCard title="Ask the Seer" chip={data.chips.askSeerUsed} />
            <JourneyChipCard title="Active today (UTC)" chip={data.chips.activeToday} />
          </div>

          <Card className="admin-card mt-6 border-slate-700/60 bg-slate-900/40">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-slate-200">Summary</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-300 space-y-1">
              <p>
                Last seen:{" "}
                {data.summary.lastSeenAt ? formatTs(data.summary.lastSeenAt) : "—"}
                {data.summary.lastSeenRoute ? ` · ${data.summary.lastSeenRoute}` : ""}
              </p>
              <p>
                Last activity (inferred):{" "}
                {data.summary.lastActivityAt ? formatTs(data.summary.lastActivityAt) : "—"}
              </p>
              <p>Tool opens (recent): {data.summary.toolOpenCount}</p>
              <p>Seer page views (recent): {data.summary.seerPageViews}</p>
              <p>
                Seer tokens today (UTC):{" "}
                {data.summary.seerTokensToday != null ? data.summary.seerTokensToday : "—"}
              </p>
              {data.auth && (
                <>
                  <p>Auth created: {data.auth.createdAt ? formatTs(data.auth.createdAt) : "—"}</p>
                  <p>
                    Last sign-in: {data.auth.lastSignInAt ? formatTs(data.auth.lastSignInAt) : "—"}
                  </p>
                  <p>Providers: {data.auth.providers.join(", ") || "—"}</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="admin-card mt-6 border-slate-700/60 bg-slate-900/40">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-slate-200">Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              {data.timeline.length === 0 ? (
                <p className="text-sm text-slate-400">No timeline events yet.</p>
              ) : (
                <ul className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                  {data.timeline.map((item) => (
                    <li
                      key={item.id}
                      className="border-b border-slate-700/50 pb-3 last:border-0 text-sm"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="text-xs capitalize border-slate-600">
                          {item.kind}
                        </Badge>
                        <span className="text-slate-500 text-xs">{formatTs(item.timestamp)}</span>
                        {item.severity && (
                          <Badge variant="secondary" className="text-xs">
                            {item.severity}
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1 text-slate-100">{item.title}</p>
                      {item.detail && (
                        <p className="mt-0.5 text-xs text-slate-400 line-clamp-2">{item.detail}</p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <details className="mt-6 text-sm text-slate-400">
            <summary className="cursor-pointer text-slate-300">Raw Firestore (debug)</summary>
            <pre className="mt-2 max-h-64 overflow-auto rounded bg-slate-950 p-3 text-xs">
              {JSON.stringify(
                { profile: data.profile, generationLock: data.generationLock },
                null,
                2,
              )}
            </pre>
          </details>
        </>
      )}
    </div>
  );
}
