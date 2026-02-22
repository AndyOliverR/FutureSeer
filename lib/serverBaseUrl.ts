/**
 * Server-side base URL for same-origin API calls.
 * Use in API routes and server-only code when fetching the app's own API.
 */
export function getServerBaseUrl(): string {
  // 1. Explicitly defined Base URL (best for production)
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }

  // 2. Vercel System URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // 3. Android Emulator Development Mode
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
    return 'http://10.0.2.2:3000';
  }

  // 4. Production Fallback (Play Store / Live Site)
  return 'https://futureseer.app';
}
