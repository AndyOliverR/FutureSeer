/**
 * Persistent cache for comprehensive mystical profile (localStorage).
 * Keyed by userId; value includes a version hash of profile-defining fields
 * so we can detect mismatch when the server profile has changed.
 */

import { devLog } from '@/lib/devLogger';

const CACHE_KEY_PREFIX = 'futureseer_comprehensive_profile_'

function storageKey(userId: string): string {
  return `${CACHE_KEY_PREFIX}${userId}`
}

/** Fields used to compute profile version (change when user updates or doc is regenerated). */
export interface ProfileVersionFields {
  birthDate?: string
  birthTime?: string
  birthPlace?: string
  lastUpdated?: number
  metadata?: { generatedAt?: string }
}

/** Stored cache entry shape. */
export interface PersistentProfileEntry {
  profileVersion: string
  profile: unknown
  cachedAt: number
}

/**
 * Compute a version hash from profile-defining fields.
 * Same algorithm as calculateProfileDataHash in firebase.ts (djb2-style, browser-safe).
 */
export function computeComprehensiveProfileVersionHash(profile: ProfileVersionFields): string {
  const relevant = {
    birthDate: profile.birthDate,
    birthTime: profile.birthTime,
    birthPlace: profile.birthPlace,
    lastUpdated: profile.lastUpdated,
    generatedAt: profile.metadata?.generatedAt
  }
  const dataString = JSON.stringify(relevant)
  let hash = 0
  for (let i = 0; i < dataString.length; i++) {
    const char = dataString.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(36)
}

/**
 * Read cached profile for userId from localStorage.
 * Returns null if missing, invalid, or not in browser.
 */
export function getPersistentProfile(userId: string): PersistentProfileEntry | null {
  if (typeof window === 'undefined' || !window.localStorage) return null
  try {
    const raw = window.localStorage.getItem(storageKey(userId))
    if (!raw) return null
    const parsed = JSON.parse(raw) as PersistentProfileEntry
    if (!parsed || typeof parsed.profileVersion !== 'string' || parsed.profile == null) return null
    return {
      profileVersion: parsed.profileVersion,
      profile: parsed.profile,
      cachedAt: typeof parsed.cachedAt === 'number' ? parsed.cachedAt : 0
    }
  } catch {
    return null
  }
}

/**
 * Write profile to localStorage for userId with the given version hash.
 */
export function setPersistentProfile(userId: string, profileVersion: string, profile: unknown): void {
  if (typeof window === 'undefined' || !window.localStorage) return
  try {
    const entry: PersistentProfileEntry = {
      profileVersion,
      profile,
      cachedAt: Date.now()
    }
    window.localStorage.setItem(storageKey(userId), JSON.stringify(entry))
  } catch (e) {
    if (process.env.NODE_ENV === 'development') {
      devLog.warn('Failed to write comprehensive profile cache:', e, 'comprehensiveProfileCache')
    }
  }
}

/**
 * Remove persistent cache entry for userId (e.g. on profile save with change or sign-out).
 */
export function clearPersistentProfileCache(userId: string): void {
  if (typeof window === 'undefined' || !window.localStorage) return
  try {
    window.localStorage.removeItem(storageKey(userId))
  } catch {
    // ignore
  }
}
