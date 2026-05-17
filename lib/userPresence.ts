'use client';

import { updateUserProfile } from '@/lib/firebase';

/** Minimum interval between Firestore presence writes (navigation heartbeats). */
export const PRESENCE_HEARTBEAT_THROTTLE_MS = 5 * 60 * 1000;

const lastWriteAtByUid = new Map<string, number>();
const lastRouteByUid = new Map<string, string>();

function normalizeRoute(route: string | undefined): string | undefined {
  if (!route) return undefined;
  const trimmed = route.trim();
  if (!trimmed) return undefined;
  return trimmed.length > 200 ? trimmed.slice(0, 200) : trimmed;
}

/**
 * Persists `lastSeenAt` / `lastSeenRoute` on the user doc for admin journey (Phase 2).
 * Throttled unless `force` (first session attach per tab).
 */
export async function recordUserPresence(
  uid: string,
  options?: { route?: string; force?: boolean },
): Promise<void> {
  const now = Date.now();
  const route = normalizeRoute(options?.route);
  const force = options?.force === true;
  const prevWrite = lastWriteAtByUid.get(uid) ?? 0;
  const prevRoute = lastRouteByUid.get(uid);

  if (!force) {
    const elapsed = now - prevWrite;
    if (elapsed < PRESENCE_HEARTBEAT_THROTTLE_MS) {
      if (!route || route === prevRoute) return;
      if (elapsed < 60_000) return;
    }
  }

  lastWriteAtByUid.set(uid, now);
  if (route) lastRouteByUid.set(uid, route);

  await updateUserProfile(uid, {
    lastSeenAt: now,
    ...(route ? { lastSeenRoute: route } : {}),
  });
}

/** Fire-and-forget presence write (auth bootstrap, navigation). */
export function recordUserPresenceDeferred(
  uid: string,
  options?: { route?: string; force?: boolean },
): void {
  void recordUserPresence(uid, options).catch(() => {});
}
