"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Copy, Info } from "lucide-react";

type ErrorSeverity = "error" | "warning";
type ErrorEnvironment = "production" | "preview" | "development" | "unknown";
type ErrorSource = "client" | "server";

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
}

function formatTimestamp(ts: string) {
  const d = new Date(ts);
  if (isNaN(d.getTime())) return ts;
  return d.toLocaleString(undefined, { year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function describeErrorSimple(event: ErrorEventDoc): string {
  const { area, action } = event;
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
  return "Something went wrong while a user was using the app.";
}

function buildCopyPayload(event: ErrorEventDoc): string {
  const lines: string[] = [];
  lines.push("FutureSeer error event");
  lines.push(`- Time (UTC): ${event.timestamp}`);
  lines.push(`- Environment: ${event.environment}`);
  lines.push(`- Source: ${event.source}`);
  lines.push(`- Area: ${event.area}`);
  lines.push(`- Action: ${event.action}`);
  lines.push(`- Message: ${event.message}`);
  if (event.route) lines.push(`- Route: ${event.route}`);
  lines.push(`- UserId: ${event.userId ?? "unknown"}`);
  if (event.browser) lines.push(`- Browser: ${event.browser}`);
  if (event.meta && Object.keys(event.meta).length > 0) {
    lines.push(`- Meta: ${JSON.stringify(event.meta)}`);
  }
  return lines.join("\n");
}

export default function AdminErrorsPage() {
  const { user, isAdmin, isSuperadmin } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ErrorEventDoc[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [areaFilter, setAreaFilter] = useState<string>("all");
  const [envFilter, setEnvFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!user || (!isAdmin && !isSuperadmin)) return;
    const load = async () => {
      setLoading(true);
      try {
        const token = await user.getIdToken();
        const res = await fetch("/api/admin/error-events", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 401 || res.status === 403) {
          toast({ title: "Access denied", description: "Admin access required to view error events.", variant: "destructive" });
          setErrors([]);
          setLoading(false);
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
        }>;
        const items: ErrorEventDoc[] = raw.map((e) => ({
          id: e.id,
          timestamp: e.timestamp || "",
          environment: (e.environment as ErrorEnvironment) || "unknown",
          severity: (e.severity as ErrorSeverity) || "error",
          source: (e.source as ErrorSource) || "client",
          area: e.area || "unknown",
          action: e.action || "",
          message: e.message || "",
          userId: e.userId ?? null,
          route: e.route,
          browser: e.browser,
          meta: e.meta,
        }));
        setErrors(items);
      } catch (err: unknown) {
        toast({ title: "Error", description: err instanceof Error ? err.message : "Failed to load error events.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, isAdmin, isSuperadmin, toast]);

  const filtered = useMemo(() => {
    return errors.filter((e) => {
      if (envFilter !== "all" && e.environment !== envFilter) return false;
      if (areaFilter !== "all" && e.area !== areaFilter) return false;
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
  }, [errors, envFilter, areaFilter, search]);

  const areas = useMemo(() => {
    const set = new Set<string>();
    errors.forEach((e) => set.add(e.area));
    return Array.from(set).sort();
  }, [errors]);

  const environments: ErrorEnvironment[] = ["production", "preview", "development", "unknown"];

  const selected = filtered.find((e) => e.id === selectedId) || filtered[0] || null;

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
      <Card className="admin-card mb-6 text-slate-200">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-slate-200">Recent errors</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-300">
            These are the latest issues users have hit while using FutureSeer. Each row is one error event.
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
            <Input
              placeholder="Search message or route"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 max-w-xs text-xs bg-slate-800 border-slate-600 text-slate-200 placeholder:text-slate-500"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr,1.5fr] gap-4">
        <Card className="admin-card text-slate-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-slate-200">Events ({filtered.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-auto max-h-[480px]">
              <table className="min-w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-600 bg-slate-800/80 text-slate-200">
                    <th className="px-3 py-2 text-left font-medium">Time</th>
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
                      <td colSpan={6} className="px-3 py-4 text-center text-slate-400">
                        Loading errors...
                      </td>
                    </tr>
                  )}
                  {!loading && filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-3 py-4 text-center text-slate-400">
                        No error events found for the current filters.
                      </td>
                    </tr>
                  )}
                  {!loading &&
                    filtered.map((e) => (
                      <tr
                        key={e.id}
                        className={`border-b border-slate-700/60 cursor-pointer hover:bg-slate-800/50 ${selected?.id === e.id ? "bg-slate-800/80" : ""} text-slate-300`}
                        onClick={() => setSelectedId(e.id)}
                      >
                        <td className="px-3 py-2 whitespace-nowrap font-mono">{formatTimestamp(e.timestamp)}</td>
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
                        <td className="px-3 py-2 max-w-[140px] truncate font-mono" title={e.route}>
                          {e.route || "-"}
                        </td>
                        <td className="px-3 py-2 max-w-[200px] truncate" title={e.message}>
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
                                  toast({ title: "Copied", description: "Error details copied. You can paste them wherever you debug issues." });
                                });
                              }
                            }}
                            aria-label="Copy error details"
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
            <CardTitle className="text-sm font-medium text-slate-200">Details</CardTitle>
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
                Select a row on the left to see a simple explanation and full details here.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

