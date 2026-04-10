# Onboarding Funnel Dashboard Mapping

Use these events from `lib/analytics.ts` to build product and growth dashboards.

## Core events

- `onboarding_step_view`
- `onboarding_step_next`
- `onboarding_step_back`
- `onboarding_abandon`
- `onboarding_completed`
- `paywall_view`
- `trial_start`
- `payment_completed`

## Recommended funnel

1. `onboarding_step_view` (`step_id = pain` or `welcome`)
2. `onboarding_step_next` on each required step
3. `paywall_view`
4. `trial_start`
5. `payment_completed`

## Segmentation keys

- `variant` (`control` or `story_first`)
- `surface` (`product_tour`, `signup`, `signup_plan_selection`)
- `landing_variant`
- `utm_source`, `utm_campaign`
- `country` (if available from signup payload)

## Weekly dashboard checks

- Top 2 step drop-off points (`view` to `next` conversion)
- Abandon reasons distribution (`skip`, `close`, `escape`, etc.)
- Variant performance (`trial_start` and `payment_completed`)
- Country-level conversion deltas after price updates
