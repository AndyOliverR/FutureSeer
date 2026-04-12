"use client"

import { useEffect, useMemo } from "react"
import { useOnboardingStallRecovery } from "@/hooks/useOnboardingStallRecovery"
import { OnboardingStuckBanner } from "@/components/onboarding/OnboardingStuckBanner"
import { useErrorLogger } from "@/hooks/useErrorLogger"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ChevronRight, Loader2, Sparkles } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useComprehensiveMysticalProfile } from "@/hooks/useComprehensiveMysticalProfile"
import { useIsPortraitNarrowLayout } from "@/hooks/useIsPortraitNarrowLayout"
import {
  hasRequiredProfileSetup,
  PROFILE_SETUP_PATH,
} from "@/lib/authRouting"
import { ALL_TOOL_SLUGS } from "@/lib/profileGenerationOrchestrator"
import {
  buildMysticalCardSnippet,
  isUsableStoredReport,
  resolveToolReportFromProfile,
} from "@/lib/mysticalProfilePositiveSnippet"
import { toolPathForSlug } from "@/lib/report-viral/toolSlugToPath"
import { toolManager } from "@/lib/services/toolManager"
import { MysticalLoadingState } from "@/components/MysticalLoadingState"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const CATEGORY_ORDER = [
  "Astrology",
  "Divination",
  "Numerology",
  "Reading",
  "Chinese",
  "Indian",
  "Remedies",
  "Analysis",
  "Energy",
] as const

function humanizePipelineSlug(slug: string): string {
  return slug
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .trim()
}

export default function MysticalProfilePage() {
  const router = useRouter()
  const { user, userProfile, loading: authLoading, isSuperadmin, isAdmin, signOut } = useAuth()
  const { profile, loading: profileLoading, error } = useComprehensiveMysticalProfile()
  const { material3: useMaterial3Layout, narrow: isNarrowViewport } =
    useIsPortraitNarrowLayout()
  const { logError: logOnboarding } = useErrorLogger({ area: "onboarding" })

  const p = profile as Record<string, unknown> | null

  const showMysticalPageLoader = useMemo(() => {
    if (authLoading) return true
    if (user && !authLoading && userProfile === null && !isSuperadmin && !isAdmin) return true
    if (
      user &&
      userProfile != null &&
      hasRequiredProfileSetup(userProfile) &&
      userProfile.mysticalProfileGenerated &&
      profileLoading
    ) {
      return true
    }
    return false
  }, [authLoading, user, userProfile, isSuperadmin, isAdmin, profileLoading])

  const mysticalPageLoaderStall = useOnboardingStallRecovery(showMysticalPageLoader, {
    surface: "mystical_profile_page_loader",
    logOnboarding,
    funnelNewUser: userProfile ? !userProfile.mysticalProfileGenerated : null,
  })

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.replace("/signin?redirect=/mystical-profile")
      return
    }
    if (userProfile === null && !isSuperadmin && !isAdmin) {
      router.replace("/profile")
      return
    }
    if (
      userProfile != null &&
      !hasRequiredProfileSetup(userProfile) &&
      !isSuperadmin &&
      !isAdmin
    ) {
      router.replace(PROFILE_SETUP_PATH)
      return
    }
    if (
      userProfile &&
      !userProfile.mysticalProfileGenerated &&
      !isSuperadmin &&
      !isAdmin
    ) {
      router.replace("/profile")
    }
  }, [authLoading, user, userProfile, router, isSuperadmin, isAdmin])

  const groupedCards = useMemo(() => {
    if (!p) return []
    type Card = {
      slug: string
      name: string
      icon: string
      category: string
      href: string
      primaryLine: string
      secondaryLine: string
      rarityLabel: string
    }
    const cards: Card[] = []
    for (const slug of ALL_TOOL_SLUGS) {
      const report = resolveToolReportFromProfile(p, slug)
      if (!isUsableStoredReport(report)) continue
      const { primaryLine, secondaryLine, teaser } = buildMysticalCardSnippet(slug, report)
      const pathSeg = toolPathForSlug(slug)
      const config = toolManager.getTool(pathSeg)
      cards.push({
        slug,
        name: config?.name ?? humanizePipelineSlug(slug),
        icon: config?.icon ?? "✨",
        category: config?.category ?? "Readings",
        href: `/tools/${pathSeg}`,
        primaryLine,
        secondaryLine,
        rarityLabel: teaser.rarityLabel,
      })
    }
    const byCat = new Map<string, Card[]>()
    for (const c of cards) {
      const list = byCat.get(c.category) ?? []
      list.push(c)
      byCat.set(c.category, list)
    }
    const ordered: { category: string; items: Card[] }[] = []
    for (const cat of CATEGORY_ORDER) {
      const items = byCat.get(cat)
      if (items?.length) ordered.push({ category: cat, items })
    }
    const rest = [...byCat.keys()].filter(
      (c) => !(CATEGORY_ORDER as readonly string[]).includes(c)
    )
    rest.sort()
    for (const cat of rest) {
      const items = byCat.get(cat)
      if (items?.length) ordered.push({ category: cat, items })
    }
    return ordered
  }, [p])

  if (showMysticalPageLoader) {
    return (
      <div className="relative min-h-screen">
        <MysticalLoadingState
          variant="fullscreen"
          message="Gathering your mystical highlights…"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom))] z-30 flex justify-center px-4">
          <div className="pointer-events-auto w-full max-w-md">
            <OnboardingStuckBanner
              stuck={mysticalPageLoaderStall}
              variant={useMaterial3Layout ? "m3" : "devotionist"}
              onSignOutTryAgain={async () => {
                await signOut()
              }}
            />
          </div>
        </div>
      </div>
    )
  }

  if (!user || (userProfile != null && !hasRequiredProfileSetup(userProfile) && !isSuperadmin && !isAdmin)) {
    return null
  }

  if (
    userProfile &&
    !userProfile.mysticalProfileGenerated &&
    !isSuperadmin &&
    !isAdmin
  ) {
    return null
  }

  if (error) {
    return (
      <div className="min-h-screen pt-24 px-4 flex flex-col items-center justify-center text-center">
        <p className="text-red-300 mb-4 max-w-md">{error}</p>
        <Button asChild variant="outline" className="border-amber-500/50 text-amber-200">
          <Link href="/profile">Back to profile</Link>
        </Button>
      </div>
    )
  }

  const ctaRow = (
    <div
      className={cn(
        "flex flex-wrap gap-3 justify-center mb-10",
        useMaterial3Layout ? "px-1" : ""
      )}
    >
      <Button
        asChild
        className={cn(
          useMaterial3Layout
            ? "bg-primary text-primary-foreground"
            : "bg-amber-500/90 hover:bg-amber-500 text-slate-950"
        )}
      >
        <Link href="/tools">Explore all tools</Link>
      </Button>
      <Button asChild variant="outline" className={useMaterial3Layout ? "border-outline-variant text-on-surface" : "border-amber-500/40 text-amber-200"}>
        <Link href="/ask-the-seer">Ask the Seer</Link>
      </Button>
      <Button asChild variant="outline" className={useMaterial3Layout ? "border-outline-variant text-on-surface" : "border-amber-500/40 text-amber-200"}>
        <Link href="/community/attribution">Community</Link>
      </Button>
    </div>
  )

  if (useMaterial3Layout) {
    return (
      <div className="min-h-screen bg-surface flex flex-col pt-[env(safe-area-inset-top)] pb-24 px-4 overflow-x-hidden">
        <div className="py-6 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <h1 className="text-2xl font-heading font-bold text-primary uppercase tracking-tight">
              Mystical profile
            </h1>
            <div className="p-2 bg-primary-container rounded-full text-primary-on-container shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
          </div>
          <p className="text-surface-on-variant text-sm leading-relaxed">
            A glimpse across your readings—tap a card to go deeper in each tool.
          </p>
        </div>
        {ctaRow}
        {groupedCards.length === 0 ? (
          <div className="rounded-2xl border border-outline-variant bg-surface-container-high p-6 text-center text-surface-on-variant text-sm">
            No report snippets found yet. Open{" "}
            <Link href="/tools" className="text-primary underline">
              Tools
            </Link>{" "}
            or regenerate from{" "}
            <Link href="/profile" className="text-primary underline">
              Profile
            </Link>
            .
          </div>
        ) : (
          <div className="space-y-8 pb-8">
            {groupedCards.map(({ category, items }) => (
              <section key={category}>
                <h2 className="text-xs font-bold text-surface-on-variant uppercase tracking-widest mb-3 opacity-80">
                  {category}
                </h2>
                <div className="space-y-3">
                  {items.map((c, i) => (
                    <motion.div
                      key={c.slug}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02 }}
                    >
                      <Link
                        href={c.href}
                        className="block rounded-3xl border border-outline-variant bg-surface-container-high p-4 shadow-md active:scale-[0.99] transition-transform"
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-3xl shrink-0" aria-hidden>
                            {c.icon}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <h3 className="font-bold text-on-surface leading-tight">{c.name}</h3>
                              <span className="text-[10px] uppercase font-bold text-primary shrink-0">
                                {c.rarityLabel}
                              </span>
                            </div>
                            <p className="text-sm text-on-surface mt-2 leading-snug">{c.primaryLine}</p>
                            <p className="text-xs text-surface-on-variant mt-1 line-clamp-2">{c.secondaryLine}</p>
                            <div className="mt-3 flex items-center gap-1 text-primary text-xs font-bold uppercase tracking-wide">
                              Explore <ChevronRight className="w-3 h-3" />
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      className={cn(
        "min-h-screen pt-24 px-6",
        isNarrowViewport ? "pb-24" : "pb-16"
      )}
    >
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-heading font-light text-amber-400 mb-3 tracking-widest uppercase">
            Mystical profile
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto font-light italic">
            Highlights from every tradition we generated for you—step into each tool for the full reading.
          </p>
        </div>
        {ctaRow}
        {groupedCards.length === 0 ? (
          <div className="backdrop-blur-sm bg-slate-900/50 border border-amber-500/20 rounded-2xl p-8 text-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-amber-400 mx-auto mb-3" />
            <p>No snippets available yet. Try regenerating from your profile, or browse the tool library.</p>
            <div className="mt-4 flex flex-wrap gap-3 justify-center">
              <Button asChild className="bg-amber-500/90 text-slate-950 hover:bg-amber-500">
                <Link href="/profile">Profile</Link>
              </Button>
              <Button asChild variant="outline" className="border-amber-500/40 text-amber-200">
                <Link href="/tools">Tools</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-14">
            {groupedCards.map(({ category, items }) => (
              <section key={category}>
                <h2 className="text-xl font-heading font-light text-amber-400 mb-5 tracking-widest uppercase border-b border-amber-500/20 pb-2">
                  {category}
                </h2>
                <div className="grid gap-6 md:grid-cols-2">
                  {items.map((c, i) => (
                    <motion.div
                      key={c.slug}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <Link
                        href={c.href}
                        className="group block h-full rounded-2xl border border-amber-500/25 bg-slate-900/40 hover:border-amber-500/50 hover:bg-slate-900/60 p-6 transition-all backdrop-blur-sm"
                      >
                        <div className="flex items-start gap-4">
                          <span className="text-4xl shrink-0" aria-hidden>
                            {c.icon}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-baseline justify-between gap-2">
                              <h3 className="text-lg font-semibold text-amber-200 group-hover:text-amber-100">
                                {c.name}
                              </h3>
                              <span className="text-[10px] uppercase tracking-wider text-amber-500/80 font-bold">
                                {c.rarityLabel}
                              </span>
                            </div>
                            <p className="text-slate-200 text-sm mt-3 leading-relaxed">{c.primaryLine}</p>
                            <p className="text-slate-500 text-xs mt-2 leading-relaxed line-clamp-2">
                              {c.secondaryLine}
                            </p>
                            <div className="mt-4 text-amber-400 text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                              Explore{" "}
                              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
