"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Variant = "m3" | "devotionist"

type OnboardingStuckBannerProps = {
  stuck: boolean
  variant?: Variant
  className?: string
  onSignOutTryAgain?: () => void | Promise<void>
}

/**
 * Shown when onboarding/auth loading exceeds client threshold — gives refresh escape hatch.
 */
export function OnboardingStuckBanner({
  stuck,
  variant = "devotionist",
  className,
  onSignOutTryAgain,
}: OnboardingStuckBannerProps) {
  const [copied, setCopied] = useState(false)
  if (!stuck) return null

  const isM3 = variant === "m3"
  const debugSnapshot =
    typeof window !== "undefined"
      ? {
          route: window.location.pathname,
          online: navigator.onLine,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
        }
      : null

  return (
    <div
      className={cn(
        "mt-6 rounded-2xl border p-4 text-left space-y-3",
        isM3
          ? "border-outline-variant bg-surface-container-highest text-on-surface"
          : "border-amber-500/30 bg-slate-900/80 text-amber-100",
        className
      )}
      role="status"
      aria-live="polite"
    >
      <p className={cn("text-sm font-medium", isM3 ? "text-on-surface" : "text-amber-200")}>
        This is taking longer than usual. Your connection or our servers may be slow.
      </p>
      <p className={cn("text-xs", isM3 ? "text-surface-on-variant" : "text-slate-400")}>
        Try refreshing the page. If it keeps happening, sign out and sign in again.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant={isM3 ? "default" : "secondary"}
          className={cn(!isM3 && "bg-amber-500 text-slate-900 hover:bg-amber-400")}
          onClick={() => window.location.reload()}
        >
          Refresh page
        </Button>
        {onSignOutTryAgain ? (
          <Button type="button" variant="outline" onClick={() => void onSignOutTryAgain()}>
            Sign out and try again
          </Button>
        ) : null}
        {debugSnapshot ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              void navigator.clipboard
                .writeText(JSON.stringify(debugSnapshot))
                .then(() => {
                  setCopied(true)
                  window.setTimeout(() => setCopied(false), 1400)
                })
                .catch(() => {})
            }}
          >
            {copied ? "Copied debug info" : "Copy debug info"}
          </Button>
        ) : null}
      </div>
    </div>
  )
}
