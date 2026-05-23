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
 * After `ms` with `enabled` true (while the tab is visible), sets `stuck` and logs once.
 * Timer pauses while the document is hidden so background tabs do not false-positive.
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

    let timeoutId: ReturnType<typeof window.setTimeout> | undefined

    const clearTimer = () => {
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId)
        timeoutId = undefined
      }
    }

    const fireStall = () => {
      if (typeof document !== "undefined" && document.visibilityState === "hidden") {
        return
      }
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
    }

    const schedule = () => {
      clearTimer()
      if (typeof document !== "undefined" && document.visibilityState === "hidden") {
        return
      }
      timeoutId = window.setTimeout(fireStall, ms)
    }

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        clearTimer()
        setStuck(false)
        return
      }
      schedule()
    }

    schedule()
    document.addEventListener("visibilitychange", onVisibilityChange)

    return () => {
      clearTimer()
      document.removeEventListener("visibilitychange", onVisibilityChange)
      setStuck(false)
    }
  }, [enabled, ms, surface, funnelNewUser, logOnboarding])

  return stuck
}
