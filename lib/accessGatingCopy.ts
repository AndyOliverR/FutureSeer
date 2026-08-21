/**
 * Shared copy for access gating: membership vs. missing mystical profile.
 * Keeps profile and tool empty states aligned.
 */

/** Shown when the user has a generated profile but no active membership for full tools. */
export const PROFILE_PLAN_REQUIRED_BODY =
  'Your mystical profile is ready. Choose a membership plan to view your full reports in Tools. You can select a plan in the Plan section above, or browse all tiers on Pricing.'

export const PROFILE_PLAN_PRICING_CTA_LABEL = 'View pricing and plans'

/**
 * When a tool report is not yet generated (profile not committed).
 */
export function toolReportMissingBody(toolLabel?: string): string {
  if (toolLabel) {
    return `Generate your full report on Profile first, then return here for your ${toolLabel.toLowerCase()} reading.`
  }
  return 'Generate your full report on Profile first, then open this tool for its reading.'
}
