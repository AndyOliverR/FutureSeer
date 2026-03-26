/**
 * Shared copy for access gating: membership vs. missing mystical profile.
 * Keeps profile and tool empty states aligned.
 */

/** Shown when the user has a generated profile but no active membership for full tools. */
export const PROFILE_PLAN_REQUIRED_BODY =
  'Your mystical profile is ready. Choose a membership plan to view your full reports in Tools. You can select a plan in the Plan section above, or browse all tiers on Pricing.'

export const PROFILE_PLAN_PRICING_CTA_LABEL = 'View pricing and plans'

/**
 * When a tool report is not yet generated (full mystical profile not run or missing).
 * Plan vs. profile: this is the profile-generation path, not the membership path.
 */
export function toolReportMissingBody(toolLabel?: string): string {
  if (toolLabel) {
    return `Generate your mystical profile on Cosmic Profile to unlock your personalized ${toolLabel.toLowerCase()} reading from your birth data.`
  }
  return 'Generate your mystical profile on Cosmic Profile to unlock personalized insights from your birth data.'
}
