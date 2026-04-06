/**
 * Opt-in Sign in with Apple UI. Requires Firebase Apple provider + Apple Developer setup.
 * Set NEXT_PUBLIC_APPLE_SIGNIN_ENABLED=true or =1 after configuration.
 */
export function isAppleSignInEnabledClient(): boolean {
  const v = process.env.NEXT_PUBLIC_APPLE_SIGNIN_ENABLED;
  return v === "true" || v === "1";
}
