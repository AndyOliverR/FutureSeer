/**
 * Canonical destination for returning users who have completed profile
 * and have reports in cache/DB (mysticalProfileGenerated === true).
 * Single constant so switching landing after generation / returning session is one change.
 */
export const RETURNING_USER_WITH_REPORTS_DESTINATION = '/mystical-profile'

/**
 * Returns the route to use when a user has completed profile and reports exist.
 * Use for dashboard and profile-setup redirects.
 */
export function getReturningUserWithReportsDestination(): string {
  return RETURNING_USER_WITH_REPORTS_DESTINATION
}

/** Route to send users who have not completed profile setup (missing birth date/place). */
export const PROFILE_SETUP_PATH = '/profile-setup'

/**
 * True when user has the required profile setup fields (birthDate, birthPlace) for generation.
 * Use to block navigation to dashboard/tools/ask-the-seer until setup is complete.
 */
export function hasRequiredProfileSetup(userProfile: { birthDate?: string; birthPlace?: string } | null): boolean {
  return Boolean(userProfile?.birthDate?.trim() && userProfile?.birthPlace?.trim())
}
