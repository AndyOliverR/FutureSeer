"use client"

import { useState, useEffect } from "react"

const DESKTOP_MEDIA = "(min-width: 768px)"
const PORTRAIT_MEDIA = "(orientation: portrait)"

function readNarrow(): boolean {
  if (typeof window === "undefined") return false
  const mq = window.matchMedia(DESKTOP_MEDIA)
  if (mq && typeof mq.matches === "boolean") return !mq.matches
  const w = window.innerWidth
  if (w >= 768) return false
  if (w > 0 && w < 768) return true
  return false
}

function readPortrait(): boolean {
  if (typeof window === "undefined") return true
  try {
    const mq = window.matchMedia(PORTRAIT_MEDIA)
    if (mq && typeof mq.matches === "boolean") return mq.matches
  } catch {
    /* ignore */
  }
  const h = window.innerHeight
  const w = window.innerWidth
  if (w <= 0 || h <= 0) return true
  return h >= w
}

function readLayout(): { narrow: boolean; portrait: boolean } {
  return { narrow: readNarrow(), portrait: readPortrait() }
}

export type PortraitNarrowLayoutFlags = {
  /** Narrow viewport (&lt;768px) and portrait — use Material 3 for Mystical Profile. */
  material3: boolean
  /** Narrow viewport (&lt;768px) regardless of orientation — e.g. bottom nav clearance. */
  narrow: boolean
}

/**
 * Mystical Profile (and similar) split: Devotionist on desktop or on narrow landscape;
 * Material 3 on narrow portrait. Aligns with the 768px breakpoint used elsewhere.
 */
export function useIsPortraitNarrowLayout(): PortraitNarrowLayoutFlags {
  const [{ narrow, portrait }, setFlags] = useState(() => readLayout())

  useEffect(() => {
    const setFromRead = () => {
      const next = readLayout()
      setFlags((prev) =>
        prev.narrow === next.narrow && prev.portrait === next.portrait ? prev : next
      )
    }

    setFromRead()

    const t1 = window.setTimeout(setFromRead, 50)
    const t2 = window.setTimeout(setFromRead, 200)
    const t3 = window.setTimeout(setFromRead, 500)

    const onUpdate = setFromRead
    window.addEventListener("resize", onUpdate)
    window.addEventListener("orientationchange", onUpdate)

    const observer = new MutationObserver(setFromRead)
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] })
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-platform"],
    })

    let desktopMq: MediaQueryList | null = null
    let portraitMq: MediaQueryList | null = null
    try {
      desktopMq = window.matchMedia(DESKTOP_MEDIA)
      desktopMq.addEventListener("change", setFromRead)
    } catch {
      /* ignore */
    }
    try {
      portraitMq = window.matchMedia(PORTRAIT_MEDIA)
      portraitMq.addEventListener("change", setFromRead)
    } catch {
      /* ignore */
    }

    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
      window.clearTimeout(t3)
      window.removeEventListener("resize", onUpdate)
      window.removeEventListener("orientationchange", onUpdate)
      observer.disconnect()
      desktopMq?.removeEventListener("change", setFromRead)
      portraitMq?.removeEventListener("change", setFromRead)
    }
  }, [])

  return {
    material3: narrow && portrait,
    narrow,
  }
}
