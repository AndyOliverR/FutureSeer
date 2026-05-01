"use client"

import { useMemo, useEffect, Suspense, useRef, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useSearchParams, useRouter } from "next/navigation"
import { useTools } from "@/hooks/useTools"
import { useComprehensiveMysticalProfile } from "@/hooks/useComprehensiveMysticalProfile"
import { navigateToTool } from '@/lib/utils/toolRouting'
import { ArrowLeft, Search, Sparkles, ChevronRight, Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useIsMobileLayout } from "@/hooks/useIsMobileLayout"
import {
  getReturningPaymentCommitDestination,
  hasRequiredProfileSetup,
  PROFILE_SETUP_PATH,
} from "@/lib/authRouting"
import { cn } from "@/lib/utils"
import { BACK_NAV_LINK_CLASSES } from "@/components/navigation/BackButton"
import { analytics } from "@/lib/analytics"
import { summarizeToolReadiness, ALL_TOOL_SLUGS } from "@/lib/profileGenerationOrchestrator"
import { isNumerologyChartsV2Enabled } from "@/lib/charts/featureFlags"
import { buildItemListSchema } from "@/components/schema-markup"
import { normalizeSeoBaseUrl } from "@/lib/seo/locales"
import { toolPathForSlug } from "@/lib/report-viral/toolSlugToPath"

const CATEGORY_ORDER = ['Astrology', 'Divination', 'Numerology', 'Reading', 'Chinese', 'Indian', 'Remedies', 'Analysis', 'Energy'] as const;
const site = normalizeSeoBaseUrl(process.env.NEXT_PUBLIC_APP_URL ?? "https://futureseer.app")

function ToolsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  const { user, userProfile, loading: authLoading, isSuperadmin, isAdmin, requiresReturningPaymentCommit } = useAuth();
  const { profile: comprehensiveProfile } = useComprehensiveMysticalProfile();
  const { tools, searchTerm, setSearchTerm } = useTools();
  const readiness = useMemo(
    () => summarizeToolReadiness((comprehensiveProfile as Record<string, unknown> | null) ?? null, ALL_TOOL_SLUGS),
    [comprehensiveProfile],
  )
  const allReportsReady = Boolean((userProfile as Record<string, unknown> | null)?.allReportsReady)
  const generationHasPendingTools =
    Boolean(userProfile?.mysticalProfileGenerated) && !allReportsReady && readiness.pendingToolSlugs.length > 0
  const pendingToolsSet = useMemo(
    () => new Set(readiness.pendingToolSlugs.map((slug) => toolPathForSlug(slug))),
    [readiness.pendingToolSlugs],
  )
  const [nowMs, setNowMs] = useState(() => Date.now())
  const toolStatusMap = useMemo(
    () =>
      ((comprehensiveProfile as Record<string, unknown> | null)?.toolStatus as
        | Record<string, { updatedAt?: number; generatedAt?: number; state?: string; unchanged?: boolean }>
        | undefined) ?? {},
    [comprehensiveProfile],
  )
  const toolStateByPath = useMemo(() => {
    const stateMap: Record<string, string> = {}
    for (const [slug, status] of Object.entries(toolStatusMap)) {
      const pathSlug = toolPathForSlug(slug)
      if (typeof status?.state === 'string') stateMap[pathSlug] = status.state
    }
    return stateMap
  }, [toolStatusMap])
  const profileByPath = useMemo(() => {
    const profileObj = (comprehensiveProfile as Record<string, unknown> | null) ?? {}
    const map: Record<string, unknown> = {}
    for (const slug of ALL_TOOL_SLUGS) {
      const pathSlug = toolPathForSlug(slug)
      map[pathSlug] = profileObj[slug]
    }
    return map
  }, [comprehensiveProfile])
  const formatAgo = (ts?: number) => {
    if (!ts) return null
    const sec = Math.max(0, Math.floor((nowMs - ts) / 1000))
    if (sec < 5) return 'updated now'
    if (sec < 60) return `updated ${sec}s ago`
    const min = Math.floor(sec / 60)
    return `updated ${min}m ago`
  }
  const numerologyPreviewBypassEnabled = isNumerologyChartsV2Enabled()
  const baselineNextStepTools = useMemo(
    () =>
      new Set([
        toolPathForSlug('synastry'),
        toolPathForSlug('horary'),
        toolPathForSlug('angelNumbers'),
        toolPathForSlug('kabbalisticNumerology'),
        toolPathForSlug('nameAnalysis'),
        toolPathForSlug('vastu'),
      ]),
    []
  )
  const isToolPending = (toolSlug: string) =>
    {
      if (!Boolean(userProfile?.mysticalProfileGenerated)) return false
      const state = toolStateByPath[toolSlug]
      if (state === 'ready') return false
      if (state === 'running' || state === 'pending' || state === 'placeholder') return true
      const report = profileByPath[toolSlug]
      const hasUsableReport =
        report != null &&
        typeof report === 'object' &&
        (report as { placeholder?: boolean; status?: string }).placeholder !== true &&
        (report as { status?: string }).status !== 'failed'
      if (hasUsableReport) return false
      return pendingToolsSet.has(toolSlug)
    }
  const isBaselineNextStepReady = (toolSlug: string) => {
    if (isToolPending(toolSlug)) return false
    if (!baselineNextStepTools.has(toolSlug)) return false
    const report = profileByPath[toolSlug]
    if (!report || typeof report !== 'object') return false
    return (report as { requiresNextStep?: boolean }).requiresNextStep === true
  }
  const canOpenTool = (toolSlug: string, isComingSoon?: boolean) => {
    if (isComingSoon) return false
    if (!isToolPending(toolSlug)) return true
    // Temporary rollout bypass: allow Numerology-only validation while readiness gate is active.
    if (numerologyPreviewBypassEnabled && toolSlug === 'numerology') return true
    return false
  }
  const isMobileLayout = useIsMobileLayout();
  const gateTrackedRef = useRef(false)
  const bypassTrackedRef = useRef(false)

  useEffect(() => {
    const timer = window.setInterval(() => setNowMs(Date.now()), 10_000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (
      !authLoading &&
      user &&
      userProfile != null &&
      !hasRequiredProfileSetup(userProfile) &&
      !isSuperadmin &&
      !isAdmin
    ) {
      router.replace(PROFILE_SETUP_PATH);
    }
  }, [authLoading, user, userProfile, router, isSuperadmin, isAdmin]);

  useEffect(() => {
    if (!authLoading && user && requiresReturningPaymentCommit && !isSuperadmin && !isAdmin) {
      if (!gateTrackedRef.current) {
        analytics.trackReturnGateViewed({ surface: "tools_route", destination: "/subscribe" })
        gateTrackedRef.current = true
      }
      const attempted =
        typeof window !== "undefined"
          ? `${window.location.pathname}${window.location.search}`
          : "/tools";
      router.replace(getReturningPaymentCommitDestination(attempted));
    }
  }, [authLoading, user, requiresReturningPaymentCommit, router, isSuperadmin, isAdmin]);

  useEffect(() => {
    if (!authLoading && user && !requiresReturningPaymentCommit && !isSuperadmin && !isAdmin && !bypassTrackedRef.current) {
      analytics.trackReturnGateBypassedActiveSubscriber({ surface: "tools_route" })
      bypassTrackedRef.current = true
    }
  }, [authLoading, user, requiresReturningPaymentCommit, isSuperadmin, isAdmin])

  const displayedTools = useMemo(() => {
    let list = categoryParam ? tools.filter(t => t.category === categoryParam) : tools;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(t => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
    }
    return list;
  }, [tools, categoryParam, searchTerm]);

  const toolsCollectionSchema = useMemo(
    () =>
      buildItemListSchema({
        url: `${site}/tools`,
        name: "FutureSeer Mystical Tools",
        description: "Browse FutureSeer mystical tools across astrology, divination, numerology, and more.",
        items: displayedTools.map((tool) => ({
          name: tool.name,
          url: `${site}/tools/${tool.slug}`,
        })),
      }),
    [displayedTools],
  )

  const toolsByCategoryOrdered = useMemo(() => {
    if (categoryParam || searchTerm.trim()) return null;
    const byCat: Record<string, typeof displayedTools> = {};
    for (const tool of displayedTools) {
      if (!byCat[tool.category]) byCat[tool.category] = [];
      byCat[tool.category].push(tool);
    }
    const ordered: { category: string; tools: typeof displayedTools }[] = [];
    for (const cat of CATEGORY_ORDER) {
      if (byCat[cat]?.length) ordered.push({ category: cat, tools: byCat[cat] });
    }
    const rest = Object.keys(byCat).filter(c => !(CATEGORY_ORDER as readonly string[]).includes(c));
    for (const cat of rest) ordered.push({ category: cat, tools: byCat[cat] });
    return ordered;
  }, [displayedTools, categoryParam, searchTerm]);

  if (user && userProfile != null && !hasRequiredProfileSetup(userProfile) && !isSuperadmin && !isAdmin) return null;
  if (user && requiresReturningPaymentCommit && !isSuperadmin && !isAdmin) return null;

  // RENDER MATERIAL 3 (mobile layout: small screen or native)
  if (isMobileLayout) {
    return (
      <div data-onboarding="tools" className="min-h-screen bg-surface flex flex-col pt-[env(safe-area-inset-top)] pb-24 overflow-x-hidden">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(toolsCollectionSchema) }}
        />
        <div className="px-4 py-6 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-heading font-bold text-amber-400 uppercase tracking-tight">Mystical Tools</h1>
            <div className="p-2 bg-primary-container rounded-full text-primary-on-container animate-pulse">
              <Sparkles className="w-6 h-6" />
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-on-variant opacity-50" />
            <input
              type="text" placeholder="Search all tools..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-14 pl-12 bg-surface-container-high rounded-2xl border border-outline-variant text-surface-on"
            />
          </div>
        </div>

        {categoryParam && (
          <div className="px-4 pb-2">
            <Link href="/tools" className={BACK_NAV_LINK_CLASSES}>
              <ArrowLeft className="w-4 h-4" />
              Back to all tools
            </Link>
          </div>
        )}

        <div className="flex overflow-x-auto gap-2 px-4 pb-4 no-scrollbar">
          <Link href="/tools" className={cn("h-10 px-5 rounded-full border flex items-center justify-center text-xs font-bold uppercase tracking-widest transition-all", !categoryParam ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-amber-500/20" : "bg-surface-container-low border-outline-variant text-surface-on-variant")}>All</Link>
          {CATEGORY_ORDER.map(cat => (
            <Link key={cat} href={`/tools?category=${encodeURIComponent(cat)}`} className={cn("h-10 px-5 rounded-full border flex items-center justify-center text-xs font-bold uppercase tracking-widest transition-all", categoryParam === cat ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-amber-500/20" : "bg-surface-container-low border-outline-variant text-surface-on-variant")}>{cat}</Link>
          ))}
        </div>

        <div className="px-4 space-y-8 pb-6">
          {generationHasPendingTools ? (
            <div className="mb-8 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-center text-amber-200 text-sm">
              Reports are still processing. Ready tools are unlocked now ({readiness.readyToolsCount}/{ALL_TOOL_SLUGS.length} ready).
            </div>
          ) : null}
          {toolsByCategoryOrdered ? (
            toolsByCategoryOrdered.map(({ category, tools: catTools }) => (
              <div key={category}>
                <h2 className="text-lg font-bold text-amber-400 uppercase tracking-wider mb-3 px-1">{category}</h2>
                <div className="grid grid-cols-1 gap-3">
                  {catTools.map((tool, index) => (
                    <motion.div
                      key={tool.slug} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      onClick={() => canOpenTool(tool.slug, tool.isComingSoon) && navigateToTool(tool.slug, router)}
                      className={cn("relative p-4 rounded-3xl border flex items-center gap-4 min-h-[100px] active:scale-[0.98] transition-all", !canOpenTool(tool.slug, tool.isComingSoon) ? "bg-surface-container-low opacity-50 border-outline-variant/30" : "bg-surface-container-high border-outline-variant shadow-md")}
                    >
                      <div className="shrink-0 w-16 h-16 rounded-lg bg-surface-container-lowest flex items-center justify-center text-3xl shadow-inner">{tool.icon}</div>
                      <div className="flex-1 min-w-0 pr-6">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-white leading-tight truncate">{tool.name}</h3>
                          {isToolPending(tool.slug) ? (
                            <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] uppercase tracking-wide text-amber-200">
                              Processing
                            </span>
                          ) : isBaselineNextStepReady(tool.slug) ? (
                            <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] uppercase tracking-wide text-cyan-200">
                              Complete Next Step
                            </span>
                          ) : null}
                          {toolStatusMap[tool.slug]?.unchanged ? (
                            <span className="rounded-full bg-slate-500/20 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-300">
                              No new data yet
                            </span>
                          ) : null}
                        </div>
                        <p className="text-xs text-surface-on-variant uppercase font-bold opacity-70 tracking-wide mt-1">{tool.category}</p>
                        {isToolPending(tool.slug) ? (
                          <p className="text-xs text-surface-on-variant mt-1">
                            {formatAgo(toolStatusMap[tool.slug]?.updatedAt ?? toolStatusMap[tool.slug]?.generatedAt) ?? 'processing'}
                          </p>
                        ) : null}
                      </div>
                      <ChevronRight className="absolute right-4 w-6 h-6 text-amber-400 opacity-30" />
                    </motion.div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {displayedTools.map((tool) => (
                <motion.div
                  key={tool.slug} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  onClick={() => canOpenTool(tool.slug, tool.isComingSoon) && navigateToTool(tool.slug, router)}
                  className={cn("relative p-4 rounded-3xl border flex items-center gap-4 min-h-[100px] active:scale-[0.98] transition-all", !canOpenTool(tool.slug, tool.isComingSoon) ? "bg-surface-container-low opacity-50 border-outline-variant/30" : "bg-surface-container-high border-outline-variant shadow-md")}
                >
                  <div className="shrink-0 w-16 h-16 rounded-lg bg-surface-container-lowest flex items-center justify-center text-3xl shadow-inner">{tool.icon}</div>
                  <div className="flex-1 min-w-0 pr-6">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-white leading-tight truncate">{tool.name}</h3>
                      {isToolPending(tool.slug) ? (
                        <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] uppercase tracking-wide text-amber-200">
                          Processing
                        </span>
                      ) : isBaselineNextStepReady(tool.slug) ? (
                        <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] uppercase tracking-wide text-cyan-200">
                          Complete Next Step
                        </span>
                      ) : null}
                      {toolStatusMap[tool.slug]?.unchanged ? (
                        <span className="rounded-full bg-slate-500/20 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-300">
                          No new data yet
                        </span>
                      ) : null}
                    </div>
                    <p className="text-xs text-surface-on-variant uppercase font-bold opacity-70 tracking-wide mt-1">{tool.category}</p>
                    {isToolPending(tool.slug) ? (
                      <p className="text-xs text-surface-on-variant mt-1">
                        {formatAgo(toolStatusMap[tool.slug]?.updatedAt ?? toolStatusMap[tool.slug]?.generatedAt) ?? 'processing'}
                      </p>
                    ) : null}
                  </div>
                  <ChevronRight className="absolute right-4 w-6 h-6 text-amber-400 opacity-30" />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // RENDER ORIGINAL WEB DESIGN
  return (
    <div data-onboarding="tools" className="min-h-screen pt-24 pb-12 px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(toolsCollectionSchema) }}
      />
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-heading font-light text-amber-400 mb-4 tracking-widest uppercase">Mystical Tools</h1>
          <p className="text-surface-on-variant text-lg max-w-2xl mx-auto font-light italic">Choose your path to cosmic wisdom through ancient traditions</p>
        </div>

        <div className="mb-12 relative max-w-2xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-400/50" />
          <input
            type="text" placeholder="Search our mystical tools..." value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-14 pl-12 bg-surface-container-low border border-outline-variant rounded-full text-surface-on placeholder:text-surface-on-variant focus:border-amber-500 focus:ring-amber-500/20 transition-all"
          />
        </div>

        {categoryParam && (
          <div className="mb-6 max-w-7xl mx-auto">
            <Link href="/tools" className={BACK_NAV_LINK_CLASSES}>
              <ArrowLeft className="w-4 h-4" />
              Back to all tools
            </Link>
          </div>
        )}

        {toolsByCategoryOrdered ? (
          <div className="space-y-16">
            {toolsByCategoryOrdered.map(({ category, tools: catTools }) => (
              <section key={category}>
                <h2 className="text-2xl font-heading font-light text-amber-400 mb-6 tracking-widest uppercase border-b border-amber-500/20 pb-2">
                  {category}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {catTools.map((tool) => (
                    <motion.div
                      key={tool.slug} whileHover={{}}
                      onClick={() => canOpenTool(tool.slug, tool.isComingSoon) && navigateToTool(tool.slug, router)}
                      className={cn("group relative h-[320px] bg-gradient-to-br from-surface-container-high via-surface-container-low to-surface-container-high border border-outline-variant rounded-3xl p-8 overflow-hidden transition-all", !canOpenTool(tool.slug, tool.isComingSoon) ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:border-amber-500/60")}
                    >
                      <div className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="relative z-10 h-full flex flex-col items-center text-center">
                        <div className="text-6xl mb-6 transition-transform">{tool.icon}</div>
                        <h3 className="text-2xl font-bold text-amber-400 mb-3">{tool.name}</h3>
                        {isToolPending(tool.slug) ? (
                          <span className="mb-2 rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] uppercase tracking-wide text-amber-200">
                            Processing
                          </span>
                        ) : isBaselineNextStepReady(tool.slug) ? (
                          <span className="mb-2 rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] uppercase tracking-wide text-cyan-200">
                            Complete Next Step
                          </span>
                        ) : null}
                        {toolStatusMap[tool.slug]?.unchanged ? (
                          <span className="mb-2 rounded-full bg-slate-500/20 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-300">
                            No new data yet
                          </span>
                        ) : null}
                        <p className="text-surface-on-variant text-sm font-light leading-relaxed flex-grow">{tool.description}</p>
                        {isToolPending(tool.slug) ? (
                          <p className="mt-2 text-xs text-surface-on-variant">
                            {formatAgo(toolStatusMap[tool.slug]?.updatedAt ?? toolStatusMap[tool.slug]?.generatedAt) ?? 'processing'}
                          </p>
                        ) : null}
                        <div className="mt-4 text-amber-400 font-bold uppercase text-xs tracking-widest flex items-center gap-2">
                          Explore <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayedTools.map((tool) => (
            <motion.div
              key={tool.slug} whileHover={{}}
              onClick={() => canOpenTool(tool.slug, tool.isComingSoon) && navigateToTool(tool.slug, router)}
              className={cn("group relative h-[320px] bg-gradient-to-br from-surface-container-high via-surface-container-low to-surface-container-high border border-outline-variant rounded-3xl p-8 overflow-hidden transition-all", !canOpenTool(tool.slug, tool.isComingSoon) ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:border-amber-500/60")}
            >
              <div className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 h-full flex flex-col items-center text-center">
                <div className="text-6xl mb-6 transition-transform">{tool.icon}</div>
                <h3 className="text-2xl font-bold text-amber-400 mb-3">{tool.name}</h3>
                {isToolPending(tool.slug) ? (
                  <span className="mb-2 rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] uppercase tracking-wide text-amber-200">
                    Processing
                  </span>
                ) : isBaselineNextStepReady(tool.slug) ? (
                  <span className="mb-2 rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] uppercase tracking-wide text-cyan-200">
                    Complete Next Step
                  </span>
                ) : null}
                {toolStatusMap[tool.slug]?.unchanged ? (
                  <span className="mb-2 rounded-full bg-slate-500/20 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-300">
                    No new data yet
                  </span>
                ) : null}
                <p className="text-surface-on-variant text-sm font-light leading-relaxed flex-grow">{tool.description}</p>
                {isToolPending(tool.slug) ? (
                  <p className="mt-2 text-xs text-surface-on-variant">
                    {formatAgo(toolStatusMap[tool.slug]?.updatedAt ?? toolStatusMap[tool.slug]?.generatedAt) ?? 'processing'}
                  </p>
                ) : null}
                <div className="mt-4 text-amber-400 font-bold uppercase text-xs tracking-widest flex items-center gap-2">
                  Explore <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        )}
      </div>
    </div>
  );
}

export default function ToolsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface flex items-center justify-center"><Loader2 className="animate-spin text-amber-400" /></div>}>
      <ToolsPageContent />
    </Suspense>
  )
}
