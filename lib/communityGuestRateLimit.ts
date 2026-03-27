/**
 * In-process rate limit for guest community writes (discussions/comments).
 * Best-effort per instance; sufficient to throttle casual abuse.
 */
const WINDOW_MS = 60 * 60 * 1000
const MAX_ACTIONS_PER_WINDOW = 8

type Bucket = { count: number; resetAt: number }
const buckets = new Map<string, Bucket>()

function getClientIp(request: Request): string {
  const xf = request.headers.get("x-forwarded-for")
  if (xf) {
    const first = xf.split(",")[0]?.trim()
    if (first) return first
  }
  const realIp = request.headers.get("x-real-ip")
  if (realIp) return realIp.trim()
  return "unknown"
}

export function getCommunityGuestClientIp(request: Request): string {
  return getClientIp(request)
}

/** Returns whether this IP may perform one more guest write (discussion or comment). */
export function consumeGuestCommunityWriteSlot(ip: string): { allowed: boolean; retryAfterSec?: number } {
  const now = Date.now()
  let b = buckets.get(ip)
  if (!b || now > b.resetAt) {
    b = { count: 1, resetAt: now + WINDOW_MS }
    buckets.set(ip, b)
    return { allowed: true }
  }
  if (b.count >= MAX_ACTIONS_PER_WINDOW) {
    return { allowed: false, retryAfterSec: Math.ceil((b.resetAt - now) / 1000) }
  }
  b.count += 1
  return { allowed: true }
}
