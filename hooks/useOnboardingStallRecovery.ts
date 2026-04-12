"use client"

import { useEffect, useState, useRef } from "react"
import type { ErrorSeverity } from "@/lib/errorLogging"

const DEFAULT_STALL_MS = 16_000

type LogFn = (
  action: string,
  message: string,
  severity?: ErrorSeverity,
  meta?: Record<string, unknown>
) => Promise<void>

/**
 * After `ms` with `enabled` true, sets `stuck` and logs once to onboarding (critical visibility).
 */
export function useOnboardingStallRecovery(
  enabled: boolean,
  options: {
    ms?: number
    surface: string
    logOnboarding: LogFn
    funnelNewUser?: boolean | null
  }
): boolean {
  const [stuck, setStuck] = useState(false)
  const loggedRef = useRef(false)
  const { ms = DEFAULT_STALL_MS, surface, logOnboarding, funnelNewUser } = options

  useEffect(() => {
    if (!enabled) {
      loggedRef.current = false
      return undefined
    }
    const t = window.setTimeout(() => {
      setStuck(true)
      if (loggedRef.current) return
      loggedRef.current = true
      void logOnboarding(
        "loading_stall",
        `Onboarding wait exceeded ${ms}ms (${surface})`,
        "error",
        {
          surface,
          reason: "loading_timeout",
          msWaited: ms,
          ...(funnelNewUser === true || funnelNewUser === false
            ? { funnelNewUser: funnelNewUser ? "new_user" : "returning" }
            : {}),
        }
      )
    }, ms)
    return () => {
      window.clearTimeout(t)
      setStuck(false)
    }
  }, [enabled, ms, surface, funnelNewUser, logOnboarding])

  return stuck
}
