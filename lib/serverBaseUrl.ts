/**
 * Server-side base URL for same-origin API calls.
 * Use in API routes and server-only code when fetching the app's own API.
 * localhost is intentional only for local dev when no env is set; on Vercel,
 * VERCEL_URL is used when NEXT_PUBLIC_BASE_URL is not set.
 */
export function getServerBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
  );
}
