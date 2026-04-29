type AuthMethod = "google" | "apple" | "email";
type AuthSurface = "signin" | "signup";
type AuthOutcome = "success" | "redirect_initiated" | "dismissed" | "error";

async function getAnalytics() {
  const mod = await import("@/lib/analytics");
  return mod.analytics;
}

export function trackSignupStartedFromCampaignDeferred(surface: string): void {
  void getAnalytics()
    .then((analytics) => analytics.trackSignupStartedFromCampaign(surface))
    .catch(() => {});
}

export function trackFirstTimeOnboardingStartedDeferred(
  properties?: Record<string, unknown>
): void {
  void getAnalytics()
    .then((analytics) => analytics.trackFirstTimeOnboardingStarted(properties))
    .catch(() => {});
}

export function trackAuthAttemptDeferred(
  method: AuthMethod,
  surface: AuthSurface,
  properties?: Record<string, unknown>
): void {
  void getAnalytics()
    .then((analytics) => analytics.trackAuthAttempt(method, surface, properties))
    .catch(() => {});
}

export function trackAuthOutcomeDeferred(
  method: AuthMethod,
  surface: AuthSurface,
  outcome: AuthOutcome,
  properties?: Record<string, unknown>
): void {
  void getAnalytics()
    .then((analytics) =>
      analytics.trackAuthOutcome(method, surface, outcome, properties)
    )
    .catch(() => {});
}
