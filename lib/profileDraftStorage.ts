/**
 * Optional local profile form draft (localStorage) when NEXT_PUBLIC_GROWTH_PROFILE_DRAFT_ENABLED=1.
 * Never overwrites server-side mystical profile generation state — text fields only, no photos.
 */

import { devLog } from '@/lib/devLogger'

const VERSION = 1 as const
const keyFor = (uid: string) => `fs_profile_draft_v${VERSION}_${uid}`

export type ProfileDraftV1 = {
  v: typeof VERSION
  uid: string
  savedAt: string
  displayName: string
  fullName: string
  birthDate: string
  birthTime: string
  birthTimeAMPM: string
  birthTimeKnown: boolean
  birthPlace: string
  currentLocation: string
  birthTimeNote: string
}

export function loadProfileDraft(uid: string): ProfileDraftV1 | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(keyFor(uid))
    if (!raw) return null
    const p = JSON.parse(raw) as ProfileDraftV1
    if (!p || p.v !== VERSION || p.uid !== uid) return null
    return p
  } catch (e) {
    devLog.warn('profile draft load failed', e, 'profileDraft')
    return null
  }
}

export function saveProfileDraft(
  uid: string,
  data: {
    displayName: string
    fullName: string
    birthDate: string
    birthTime: string
    birthTimeAMPM: string
    birthTimeKnown: boolean
    birthPlace: string
    currentLocation: string
    birthTimeNote: string
  }
): void {
  if (typeof window === 'undefined') return
  try {
    const payload: ProfileDraftV1 = {
      v: VERSION,
      uid,
      savedAt: new Date().toISOString(),
      ...data,
    }
    localStorage.setItem(keyFor(uid), JSON.stringify(payload))
  } catch (e) {
    devLog.warn('profile draft save failed', e, 'profileDraft')
  }
}

export function clearProfileDraft(uid: string): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(keyFor(uid))
  } catch {
    /* ignore */
  }
}
