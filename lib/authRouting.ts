import { getMissingFirstGenerationFields } from './subscriptionConfig'

/**
 * Canonical destination for returning users who have completed profile
 * and have reports in cache/DB (mysticalProfileGenerated === true).
 * Single constant so switching landing after generation / returning session is one change.
 */
export const RETURNING_USER_WITH_REPORTS_DESTINATION = '/mystical-profile'
export const NEW_USER_ONBOARDING_DESTINATION = '/profile'
export const ONBOARDING_FULL_REPORT_BYPASS_KEY = 'futureSeer:onboardingFullReportBypass'

/**
 * Returns the route to use when a user has completed profile and reports exist.
 * Use for dashboard and profile-setup redirects.
 */
export function getReturningUserWithReportsDestination(): string {
  return RETURNING_USER_WITH_REPORTS_DESTINATION
}

/**
 * Shared post-auth destination resolver for sign-in / sign-up entry points.
 * Uses explicit redirect if safe, otherwise branches by returning-user status.
 */
export function getPostAuthDestination(
  safeRedirect: string | null,
  isReturningUser: boolean
): string {
  if (safeRedirect) return safeRedirect
  return isReturningUser ? getReturningUserWithReportsDestination() : NEW_USER_ONBOARDING_DESTINATION
}

/** Route to send users who have not completed profile setup (missing birth date/place). */
export const PROFILE_SETUP_PATH = '/profile-setup'

/** Route used when returning users must commit to a paid plan/payment setup before high-value access. */
export const RETURNING_PAYMENT_COMMIT_PATH = '/subscribe'

/**
 * True when user has the required profile setup fields (birthDate, birthPlace) for generation.
 * Use to block navigation to dashboard/tools/ask-the-seer until setup is complete.
 */
export function hasRequiredProfileSetup(userProfile: { birthDate?: string; birthPlace?: string } | null): boolean {
  return Boolean(userProfile?.birthDate?.trim() && userProfile?.birthPlace?.trim())
}

type GenerationReadinessProfile = {
  displayName?: string
  fullName?: string
  gender?: string
  birthDate?: string
  birthTime?: string
  birthTimeKnown?: boolean
  birthPlace?: string
  currentLocation?: string
  facePhotoUrl?: string
  palmPhotoUrl?: string
}

/**
 * Full readiness used by first generation flow.
 * Keep this in sync with the profile generation entry requirements.
 */
export function hasRequiredGenerationProfileSetup(profile: GenerationReadinessProfile | null): boolean {
  const generationProfile = profile as Parameters<typeof getMissingFirstGenerationFields>[0]
  return (
    getMissingFirstGenerationFields(generationProfile, {
      allowUnknownBirthTime: true,
    }).length === 0
  )
}

type PaymentGateProfile = {
  mysticalProfileGenerated?: boolean
  subscriptionStatus?: string
  noChargeAccount?: boolean
}

/**
 * True when a user has an active paid/unlocked account and should bypass returning-user payment gate.
 */
export function hasActiveSubscriptionAccess(profile: PaymentGateProfile | null): boolean {
  if (!profile) return false
  if (profile.noChargeAccount === true) return true
  const status = String(profile.subscriptionStatus ?? '').trim().toLowerCase()
  return status === 'active'
}

/**
 * Returning users are users who already generated mystical profile at least once.
 */
export function isReturningUserProfile(profile: PaymentGateProfile | null): boolean {
  return Boolean(profile?.mysticalProfileGenerated)
}

/**
 * Gate only returning users without active access.
 */
export function shouldGateReturningUserForPaymentCommit(profile: PaymentGateProfile | null): boolean {
  return isReturningUserProfile(profile) && !hasActiveSubscriptionAccess(profile)
}

type ReturningPaymentCommitContext = {
  profile: PaymentGateProfile | null
  isSuperadmin: boolean
  isAdmin: boolean
  isSpecialUser: boolean
  hasSessionBypass?: boolean
}

/**
 * Canonical returning-payment gate decision across routes/hooks.
 * Special users (sponsored/no-charge) must never be forced into payment commit.
 */
export function shouldRequireReturningPaymentCommit(context: ReturningPaymentCommitContext): boolean {
  const { profile, isSuperadmin, isAdmin, isSpecialUser, hasSessionBypass } = context
  if (isSuperadmin || isAdmin || isSpecialUser) return false
  if (hasSessionBypass === true) return false
  return shouldGateReturningUserForPaymentCommit(profile)
}

/**
 * Builds a subscribe destination that can return users back to their attempted route after payment commit.
 */
export function getReturningPaymentCommitDestination(redirectPath?: string): string {
  if (!redirectPath) return `${RETURNING_PAYMENT_COMMIT_PATH}?gate=returning_commit`
  return `${RETURNING_PAYMENT_COMMIT_PATH}?gate=returning_commit&redirect=${encodeURIComponent(redirectPath)}`
}
