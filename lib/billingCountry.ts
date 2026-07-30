import { COUNTRY_PRICING_CONFIG } from '@/lib/pricingConfig';

/**
 * Normalize a billing country code to a known pricing key, or null if unusable.
 */
export function normalizeBillingCountryCode(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const code = raw.trim().toUpperCase();
  if (!code) return null;
  return Object.prototype.hasOwnProperty.call(COUNTRY_PRICING_CONFIG, code) ? code : null;
}

/**
 * Prefer persisted profile country so clients cannot PPP-spoof after signup.
 * If the profile has no country yet, allow a valid requested country (first checkout).
 * Default IN when neither is usable (matches existing product default).
 */
export function resolveTrustedBillingCountryCode(opts: {
  profileCountry?: unknown;
  requestedCountry?: unknown;
}): string {
  const fromProfile = normalizeBillingCountryCode(opts.profileCountry);
  if (fromProfile) return fromProfile;
  const fromRequest = normalizeBillingCountryCode(opts.requestedCountry);
  if (fromRequest) return fromRequest;
  return 'IN';
}
