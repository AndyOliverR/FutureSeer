"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Copy, Info, Loader2 } from "lucide-react";

type ErrorSeverity = "error" | "warning" | "info";
type ErrorEnvironment = "production" | "preview" | "development" | "unknown";
type ErrorSource = "client" | "server";
type TriageStatus = "open" | "resolved" | "ignored";

interface TriageUpdatedBy {
  uid: string;
  email: string | null;
}

interface ErrorEventDoc {
  id: string;
  timestamp: string;
  environment: ErrorEnvironment;
  severity: ErrorSeverity;
  source: ErrorSource;
  area: string;
  action: string;
  message: string;
  userId: string | null;
  route?: string;
  browser?: string;
  meta?: Record<string, unknown>;
  triageStatus: TriageStatus;
  triageNote: string | null;
  triageUpdatedAt: string | null;
  triageUpdatedBy: TriageUpdatedBy | null;
}

function formatTimestamp(ts: string) {
  const d = new Date(ts);
  if (isNaN(d.getTime())) return ts;
  return d.toLocaleString(undefined, { year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function describeErrorSimple(event: ErrorEventDoc): string {
  const { area, action, severity } = event;

  if (severity === "error") {
    if (area === "auth" && action.startsWith("sign_in")) {
      return "A user tried to sign in and it failed.";
    }
    if (area === "auth" && action.startsWith("signup")) {
      return "A user tried to create an account and something went wrong.";
    }
    if (area === "profile-setup" && action === "complete") {
      return "A user tried to complete the profile setup wizard and it failed at the final step.";
    }
    if (area === "profile" && action === "save_profile") {
      return "A user tried to save changes to their profile and the save failed.";
    }
    if (area === "profile" && (action === "upload_face" || action === "upload_palm")) {
      return "A user tried to upload a profile photo and the upload failed.";
    }
    if (area === "mystical-profile" && action === "generate") {
      return "A user tried to generate their mystical profile and the backend failed.";
    }
    if (area === "seer" && action === "api_unauthorized") {
      return "Ask the Seer or a tool Seer API returned 401/403 after a token refresh — check client Authorization headers, session expiry, or server auth rules.";
    }
    return "Something went wrong while a user was using the app.";
  }

  if (area === "auth" && action === "auth_success") {
    return "Telemetry: user signed in successfully.";
  }
  if (area === "auth" && action === "view_loaded") {
    return "Telemetry: sign-in screen was viewed.";
  }
  if (area === "auth" && action === "google_clicked") {
    return "Telemetry: user started Google sign-in.";
  }
  if (area === "auth" && action === "email_submit_clicked") {
    return "Telemetry: user submitted email/password sign-in.";
  }
  if (area === "profile" && action === "no_mystical_profile") {
    return "Diagnostic: no generated mystical profile for this user yet (expected for new accounts).";
  }

  if (severity === "info") {
    return "Informational / diagnostic event (not a failure).";
  }
  if (severity === "warning") {
    return "Warning-level event — may still warrant review.";
  }
  return "Something went wrong while a user was using the app.";
}

function buildCopyPayload(event: ErrorEventDoc): string {
  const lines: string[] = [];
  lines.push("FutureSeer error event");
  lines.push(`- Time (UTC): ${event.timestamp}`);
  lines.push(`- Environment: ${event.environment}`);
  lines.push(`- Severity: ${event.severity}`);
  lines.push(`- Source: ${event.source}`);
  lines.push(`- Area: ${event.area}`);
  lines.push(`- Action: ${event.action}`);
  lines.push(`- Message: ${event.message}`);
  if (event.route) lines.push(`- Route: ${event.route}`);
  lines.push(`- UserId: ${event.userId ?? "unknown"}`);
  lines.push(`- Triage: ${event.triageStatus}`);
  if (event.triageNote) lines.push(`- Triage note: ${event.triageNote}`);
  if (event.browser) lines.push(`- Browser: ${event.browser}`);
  if (event.meta && Object.keys(event.meta).length > 0) {
    lines.push(`- Meta: ${JSON.stringify(event.meta)}`);
  }
  return lines.join("\n");
}

type SeverityFilter = "errors" | "warnings" | "info" | "all";
type TriageFilter = "open" | "resolved" | "ignored" | "all";

export default function AdminErrorsPage() {
  const { user, isAdmin, isSuperadmin } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ErrorEventDoc[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [areaFilter, setAreaFilter] = useState<string>("all");
  const [envFilter, setEnvFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [triageFilter, setTriageFilter] = useState<TriageFilter>("open");
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("errors");
  const [noteDraft, setNoteDraft] = useState("");
  const [savingTriage, setSavingTriage] = useState(false);
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [bulkSaving, setBulkSaving] = useState(false);
  const [bulkNote, setBulkNote] = useState("Bulk resolved — historical backlog cleared");

  const loadEvents = useCallback(async () => {
    if (!user || (!isAdmin && !isSuperadmin)) return;
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/admin/error-events", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401 || res.status === 403) {
        toast({ title: "Access denied", description: "Admin access required to view error events.", variant: "destructive" });
        setErrors([]);
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      const data = await res.json().catch(() => ({ events: [] }));
      const raw = (data.events ?? []) as Array<{
        id: string;
        timestamp: string;
        environment?: string;
        severity?: string;
        source?: string;
        area?: string;
        action?: string;
        message?: string;
        userId?: string | null;
        route?: string;
        browser?: string;
        meta?: Record<string, unknown>;
        triageStatus?: string;
        triageNote?: string | null;
        triageUpdatedAt?: string | null;
        triageUpdatedBy?: { uid?: string; email?: string | null } | null;
      }>;
      const items: ErrorEventDoc[] = raw.map((e) => {
        const rawTriage = e.triageStatus;
        const triageStatus: TriageStatus =
          rawTriage === "resolved" || rawTriage === "ignored" ? rawTriage : "open";
        const sev = e.severity;
        const severity: ErrorSeverity =
          sev === "warning" || sev === "info" ? sev : "error";
        const by = e.triageUpdatedBy;
        const triageUpdatedBy =
          by && typeof by.uid === "string"
            ? { uid: by.uid, email: typeof by.email === "string" || by.email === null ? by.email : null }
            : null;
        return {
          id: e.id,
          timestamp: e.timestamp || "",
          environment: (e.environment as ErrorEnvironment) || "unknown",
          severity,
          source: (e.source as ErrorSource) || "client",
          area: e.area || "unknown",
          action: e.action || "",
          message: e.message || "",
          userId: e.userId ?? null,
          route: e.route,
          browser: e.browser,
          meta: e.meta,
          triageStatus,
          triageNote: typeof e.triageNote === "string" ? e.triageNote : null,
          triageUpdatedAt: e.triageUpdatedAt ?? null,
          triageUpdatedBy,
        };
      });
      setErrors(items);
    } catch (err: unknown) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Failed to load error events.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [user, isAdmin, isSuperadmin, toast]);

  useEffect(() => {
    void loadEvents();
  }, [loadEvents]);

  const filtered = useMemo(() => {
    return errors.filter((e) => {
      if (envFilter !== "all" && e.environment !== envFilter) return false;
      if (areaFilter !== "all" && e.area !== areaFilter) return false;
      if (triageFilter !== "all" && e.triageStatus !== triageFilter) return false;
      if (severityFilter === "errors" && e.severity !== "error") return false;
      if (severityFilter === "warnings" && e.severity !== "warning") return false;
      if (severityFilter === "info" && e.severity !== "info") return false;
      if (search.trim()) {
        const s = search.toLowerCase();
        if (
          !(
            e.message.toLowerCase().includes(s) ||
            e.route?.toLowerCase().includes(s) ||
            e.action.toLowerCase().includes(s)
          )
        ) {
          return false;
        }
      }
      return true;
    });
  }, [errors, envFilter, areaFilter, search, triageFilter, severityFilter]);

  const filteredIds = useMemo(() => filtered.map((e) => e.id), [filtered]);

  useEffect(() => {
    setSelectedRowIds((prev) => prev.filter((id) => filteredIds.includes(id)));
  }, [filteredIds]);

  const allVisibleSelected =
    filteredIds.length > 0 && filteredIds.every((id) => selectedRowIds.includes(id));
  const someVisibleSelected = filteredIds.some((id) => selectedRowIds.includes(id));

  const toggleSelectAllVisible = () => {
    if (allVisibleSelected) {
      setSelectedRowIds([]);
    } else {
      setSelectedRowIds([...filteredIds]);
    }
  };

  const toggleRowSelected = (id: string) => {
    setSelectedRowIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const areas = useMemo(() => {
    const set = new Set<string>();
    set.add("seer");
    errors.forEach((e) => set.add(e.area));
    return Array.from(set).sort();
  }, [errors]);

  const environments: ErrorEnvironment[] = ["production", "preview", "development", "unknown"];

  const selected = filtered.find((e) => e.id === selectedId) || filtered[0] || null;

  useEffect(() => {
    if (selected) {
      setNoteDraft(selected.triageNote ?? "");
    }
  }, [selected]);

  useEffect(() => {
    if (filtered.length && selectedId && !filtered.some((e) => e.id === selectedId)) {
      setSelectedId(filtered[0]?.id ?? null);
    }
  }, [filtered, selectedId]);

  const applyTriage = async (status: TriageStatus, includeNote: boolean) => {
    if (!user || !selected) return;
    setSavingTriage(true);
    try {
      const token = await user.getIdToken();
      const body: { triageStatus: TriageStatus; triageNote?: string } = { triageStatus: status };
      if (includeNote) {
        body.triageNote = noteDraft.trim();
      }
      const res = await fetch(`/api/admin/error-events/${encodeURIComponent(selected.id)}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      toast({ title: "Saved", description: `Marked as ${status}.` });
      await loadEvents();
    } catch (err: unknown) {
      toast({
        title: "Update failed",
        description: err instanceof Error ? err.message : "Could not update triage.",
        variant: "destructive",
      });
    } finally {
      setSavingTriage(false);
    }
  };

  const applyBulkTriage = async (ids: string[], status: TriageStatus) => {
    if (!user || ids.length === 0) return;
    setBulkSaving(true);
    try {
      const token = await user.getIdToken();
      const noteTrim = bulkNote.trim();
      const body: { ids: string[]; triageStatus: TriageStatus; triageNote?: string } = {
        ids,
        triageStatus: status,
      };
      if (noteTrim.length > 0) {
        body.triageNote = noteTrim;
      }
      const res = await fetch("/api/admin/error-events/bulk", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      const failed = (data.failed ?? []) as { id: string; reason: string }[];
      const updated = typeof data.updated === "number" ? data.updated : ids.length;
      toast({
        title: "Bulk update done",
        description:
          failed.length > 0
            ? `Updated ${updated}. ${failed.length} failed (e.g. missing id).`
            : `Marked ${updated} event(s) as ${status}.`,
        variant: failed.length > 0 ? "destructive" : undefined,
      });
      setSelectedRowIds([]);
      await loadEvents();
    } catch (err: unknown) {
      toast({
        title: "Bulk update failed",
        description: err instanceof Error ? err.message : "Could not update events.",
        variant: "destructive",
      });
    } finally {
      setBulkSaving(false);
    }
  };

  const severityBadgeClass = (sev: ErrorSeverity) => {
    if (sev === "error") return "border-red-500/60 text-red-200 bg-red-950/40";
    if (sev === "warning") return "border-amber-500/60 text-amber-200 bg-amber-950/30";
    return "border-slate-500 text-slate-300 bg-slate-800/80";
  };

  const triageBadgeClass = (t: TriageStatus) => {
    if (t === "resolved") return "border-emerald-600/60 text-emerald-200 bg-emerald-950/30";
    if (t === "ignored") return "border-slate-500 text-slate-400 bg-slate-800/80";
    return "border-amber-500/50 text-amber-200 bg-slate-900/60";
  };

  if (!user || (!isAdmin && !isSuperadmin)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="admin-card border-slate-600/80 text-slate-200">
          <CardHeader><CardTitle className="text-sm font-medium text-slate-200">Access Denied</CardTitle></CardHeader>
          <CardContent>
            <p className="text-slate-300 text-sm">You do not have access to this page. Only admin users can view recent errors.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 max-w-6xl mx-auto">
      <div className="mb-4">
        <Button asChild type="button" variant="outline" size="sm" className="text-xs">
          <Link href="/admin/dashboard">Back to Admin Dashboard</Link>
        </Button>
      </div>
      <Card className="admin-card mb-6 text-slate-200">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-slate-200">Client &amp; server events</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-300">
            Stream of client and server log events. <span className="text-red-300/90">Severity &quot;error&quot;</span> is a failure;
            <span className="text-slate-400"> &quot;warning&quot;</span> and <span className="text-slate-400">&quot;info&quot;</span> are often telemetry or diagnostics.
            Use triage to track what was reviewed or fixed — resolved items stay in Firestore for audit.
          </p>
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-300">Environment</span>
              <Select value={envFilter} onValueChange={setEnvFilter}>
                <SelectTrigger className="h-8 w-32 text-xs bg-slate-800 border-slate-600 text-slate-200">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {environments.map((env) => (
                    <SelectItem key={env} value={env}>{env}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-300">Area</span>
              <Select value={areaFilter} onValueChange={setAreaFilter}>
                <SelectTrigger className="h-8 w-40 text-xs bg-slate-800 border-slate-600 text-slate-200">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {areas.map((a) => (
                    <SelectItem key={a} value={a}>{a}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-300">Triage</span>
              <Select value={triageFilter} onValueChange={(v) => setTriageFilter(v as TriageFilter)}>
                <SelectTrigger className="h-8 w-36 text-xs bg-slate-800 border-slate-600 text-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="ignored">Ignored</SelectItem>
                  <SelectItem value="all">All</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-300">Severity</span>
              <Select value={severityFilter} onValueChange={(v) => setSeverityFilter(v as SeverityFilter)}>
                <SelectTrigger className="h-8 w-40 text-xs bg-slate-800 border-slate-600 text-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="errors">Errors only</SelectItem>
                  <SelectItem value="warnings">Warnings only</SelectItem>
                  <SelectItem value="info">Info only</SelectItem>
                  <SelectItem value="all">All</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Input
              placeholder="Search message or route"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 max-w-xs text-xs bg-slate-800 border-slate-600 text-slate-200 placeholder:text-slate-500"
            />
            <Button type="button" variant="outline" size="sm" className="h-8 text-xs" onClick={() => void loadEvents()} disabled={loading}>
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr,1.5fr] gap-4">
        <Card className="admin-card text-slate-200">
          <CardHeader className="flex flex-col gap-3 items-stretch">
            <div className="flex flex-row items-center justify-between gap-2">
              <CardTitle className="text-sm font-medium text-slate-200">Events ({filtered.length})</CardTitle>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end sm:gap-3">
              <div className="flex flex-col gap-1 min-w-[200px] flex-1 max-w-md">
                <Label htmlFor="bulk-triage-note" className="text-[11px] text-slate-400">
                  Note for bulk actions (optional)
                </Label>
                <Input
                  id="bulk-triage-note"
                  value={bulkNote}
                  onChange={(e) => setBulkNote(e.target.value)}
                  placeholder="Applied to every row in a bulk resolve"
                  className="h-8 text-xs bg-slate-800 border-slate-600 text-slate-200"
                  disabled={bulkSaving}
                />
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                <Button
                  type="button"
                  size="sm"
                  className="h-8 text-xs"
                  disabled={bulkSaving || selectedRowIds.length === 0}
                  onClick={() => void applyBulkTriage(selectedRowIds, "resolved")}
                >
                  {bulkSaving ? <Loader2 className="w-3 h-3 animate-spin shrink-0" aria-hidden /> : null}
                  Resolve selected ({selectedRowIds.length})
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="h-8 text-xs"
                  disabled={bulkSaving}
                  onClick={() => {
                    const openIds = filtered.filter((e) => e.triageStatus === "open").map((e) => e.id);
                    if (openIds.length === 0) {
                      toast({ title: "Nothing to clear", description: "No open events in the current view." });
                      return;
                    }
                    if (
                      typeof window !== "undefined" &&
                      !window.confirm(
                        `Mark ${openIds.length} open event(s) in this view as resolved? This does not delete data.`,
                      )
                    ) {
                      return;
                    }
                    void applyBulkTriage(openIds, "resolved");
                  }}
                >
                  Clear queue (all open in view)
                </Button>
              </div>
            </div>
            <p className="text-[11px] text-slate-500">
              Use the checkboxes to select rows, or &quot;Clear queue&quot; to resolve every <strong className="text-slate-400">open</strong> row matching the current filters (up to 200 loaded).
            </p>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-auto max-h-[480px]">
              <table className="min-w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-600 bg-slate-800/80 text-slate-200">
                    <th className="w-10 px-2 py-2 text-left font-medium align-middle">
                      <Checkbox
                        checked={allVisibleSelected ? true : someVisibleSelected ? "indeterminate" : false}
                        onCheckedChange={() => toggleSelectAllVisible()}
                        disabled={loading || filtered.length === 0}
                        aria-label="Select all visible rows"
                      />
                    </th>
                    <th className="px-3 py-2 text-left font-medium">Time</th>
                    <th className="px-3 py-2 text-left font-medium">Sev</th>
                    <th className="px-3 py-2 text-left font-medium">Triage</th>
                    <th className="px-3 py-2 text-left font-medium">Area / Action</th>
                    <th className="px-3 py-2 text-left font-medium">Env</th>
                    <th className="px-3 py-2 text-left font-medium">Route</th>
                    <th className="px-3 py-2 text-left font-medium">Summary</th>
                    <th className="px-3 py-2 text-right font-medium">Copy</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td colSpan={9} className="px-3 py-4 text-center text-slate-400">
                        Loading events...
                      </td>
                    </tr>
                  )}
                  {!loading && filtered.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-3 py-4 text-center text-slate-400">
                        No events match the current filters.
                      </td>
                    </tr>
                  )}
                  {!loading &&
                    filtered.map((e) => (
                      <tr
                        key={e.id}
                        className={`border-b border-slate-700/60 cursor-pointer hover:bg-slate-800/50 ${selected?.id === e.id ? "bg-slate-800/80" : ""} text-slate-300`}
                        onClick={() => {
                          setSelectedId(e.id);
                          setNoteDraft(e.triageNote ?? "");
                        }}
                      >
                        <td
                          className="w-10 px-2 py-2 align-middle"
                          onClick={(ev) => ev.stopPropagation()}
                        >
                          <Checkbox
                            checked={selectedRowIds.includes(e.id)}
                            onCheckedChange={() => toggleRowSelected(e.id)}
                            disabled={bulkSaving}
                            aria-label={`Select event ${e.id}`}
                          />
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap font-mono">{formatTimestamp(e.timestamp)}</td>
                        <td className="px-3 py-2">
                          <Badge variant="outline" className={`text-[10px] uppercase ${severityBadgeClass(e.severity)}`}>
                            {e.severity}
                          </Badge>
                        </td>
                        <td className="px-3 py-2">
                          <Badge variant="outline" className={`text-[10px] ${triageBadgeClass(e.triageStatus)}`}>
                            {e.triageStatus}
                          </Badge>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-200">{e.area}</span>
                            <span className="text-[10px] text-slate-400">{e.action}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <Badge variant={e.environment === "production" ? "destructive" : "outline"} className="border-slate-500 text-slate-200">
                            {e.environment}
                          </Badge>
                        </td>
                        <td className="px-3 py-2 max-w-[120px] truncate font-mono" title={e.route}>
                          {e.route || "-"}
                        </td>
                        <td className="px-3 py-2 max-w-[160px] truncate" title={e.message}>
                          {e.message}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-slate-300 hover:bg-slate-800 hover:text-slate-200"
                            onClick={(ev) => {
                              ev.stopPropagation();
                              const payload = buildCopyPayload(e);
                              if (navigator.clipboard?.writeText) {
                                navigator.clipboard.writeText(payload).then(() => {
                                  toast({ title: "Copied", description: "Event details copied to clipboard." });
                                });
                              }
                            }}
                            aria-label="Copy event details"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="admin-card text-slate-200 border border-slate-600/80">
          <CardHeader className="flex items-center gap-2">
            <Info className="w-4 h-4 text-slate-400" />
            <CardTitle className="text-sm font-medium text-slate-200">Details &amp; triage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {selected ? (
              <>
                <p className="font-medium text-slate-200">{describeErrorSimple(selected)}</p>
                <div className="space-y-1 text-xs text-slate-300">
                  <p>
                    <span className="font-semibold text-slate-200">When:</span> {formatTimestamp(selected.timestamp)}{" "}
                    <span className="text-slate-500 text-[11px]">(raw: {selected.timestamp})</span>
                  </p>
                  <p>
                    <span className="font-semibold text-slate-200">Severity:</span> {selected.severity}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-200">Environment:</span> {selected.environment}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-200">Source:</span> {selected.source}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-200">Area / Action:</span> {selected.area} / {selected.action}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-200">UserId:</span> {selected.userId ?? "Unknown"}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-200">Route:</span> {selected.route || "-"}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-200">Message:</span> {selected.message}
                  </p>
                  {selected.browser && (
                    <p>
                      <span className="font-semibold text-slate-200">Browser:</span> {selected.browser}
                    </p>
                  )}
                  <p>
                    <span className="font-semibold text-slate-200">Triage:</span> {selected.triageStatus}
                    {selected.triageUpdatedAt && (
                      <span className="text-slate-500 ml-1">
                        (updated {formatTimestamp(selected.triageUpdatedAt)}
                        {selected.triageUpdatedBy?.email ? ` by ${selected.triageUpdatedBy.email}` : ""})
                      </span>
                    )}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-700/80">
                  <label className="text-xs font-semibold text-slate-200" htmlFor="triage-note">
                    Triage note (optional)
                  </label>
                  <Textarea
                    id="triage-note"
                    value={noteDraft}
                    onChange={(ev) => setNoteDraft(ev.target.value)}
                    placeholder="Ticket ID, what you changed, or why this is ignored…"
                    className="min-h-[72px] text-xs bg-slate-800 border-slate-600 text-slate-200"
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      className="h-8 text-xs gap-1"
                      disabled={savingTriage}
                      onClick={() => void applyTriage("resolved", true)}
                    >
                      {savingTriage ? <Loader2 className="w-3 h-3 animate-spin shrink-0" aria-hidden /> : null}
                      Mark resolved
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      className="h-8 text-xs"
                      disabled={savingTriage}
                      onClick={() => void applyTriage("ignored", true)}
                    >
                      Ignore
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs border-slate-600"
                      disabled={savingTriage}
                      onClick={() => void applyTriage("open", true)}
                    >
                      Reopen
                    </Button>
                  </div>
                </div>

                {selected.meta && Object.keys(selected.meta).length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-200">Extra details</p>
                    <pre className="bg-slate-800/80 rounded border border-slate-600 p-2 text-xs text-slate-300 max-h-40 overflow-auto font-mono">
                      {JSON.stringify(selected.meta, null, 2)}
                    </pre>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-slate-400">
                Select a row on the left to see details and triage options.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
