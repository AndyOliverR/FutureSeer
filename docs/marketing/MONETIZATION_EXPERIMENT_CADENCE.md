# Weekly Monetization Experiment Cadence

This cadence turns pricing and paywall work into a measurable weekly system.

## North-star chain

`Impression -> Product page view -> Install/Signup -> Onboarding completion -> Trial start -> Paid conversion -> D30 retention`

## Weekly cycle

### Monday: Define one experiment

- Choose exactly one primary lever:
  - paywall order (`control` vs `story_first`)
  - pricing anchor display (monthly-first vs yearly-first)
  - trial framing copy (value-first vs urgency-first)
- Define success metric and guardrail metric.

### Tuesday-Wednesday: Ship and verify

- Enable experiment flag / variant assignment.
- Confirm event integrity in analytics (`paywall_view`, `trial_start`, `payment_completed`).
- QA mobile and web rendering.

### Thursday: Read early signal

- Check sample size and directional impact.
- Segment by locale (`en`, `es`, `pt`, `fr`, `de`, `hi`, `zh-Hans`, `zh-Hant`).

### Friday: Decision

- Promote winner if:
  - primary metric improves >= 5%
  - no material guardrail regression
- Otherwise roll back and log learnings.

## Experiment backlog template

| ID | Hypothesis | Variant A | Variant B | Primary KPI | Guardrail | Owner | Status |
|----|------------|-----------|-----------|-------------|-----------|-------|--------|
| EXP-001 | Story-first onboarding improves trial starts | control | story_first | trial_start_rate | onboarding_completion_rate | Growth | planned |

## Required KPIs

- `store_cvr`
- `onboarding_completion_rate`
- `trial_start_rate`
- `trial_to_paid_rate`
- `d30_retention`
- `ltv_to_cac`

Run this cycle every week, but avoid overlapping major pricing and paywall experiments in the same cohort window.
