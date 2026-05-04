/**
 * Server-side base URL for same-origin API calls.
 * Use in API routes and server-only code when fetching the app's own API.
 */
function normalizeServerBaseUrl(url: string): string {
  const normalized = url.trim().replace(/\/+$/, '');
  if (!/^https?:\/\//i.test(normalized)) return `https://${normalized}`;
  return normalized;
}

function isLocalHostName(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0';
}

export function getServerBaseUrl(): string {
  // 1. Explicitly defined server-only base URL (best for production)
  if (process.env.INTERNAL_BASE_URL) {
    return normalizeServerBaseUrl(process.env.INTERNAL_BASE_URL);
  }

  // 2. Explicitly defined Base URL (validate to avoid stale localhost in production)
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    const normalized = normalizeServerBaseUrl(process.env.NEXT_PUBLIC_BASE_URL);
    if (process.env.NODE_ENV !== 'production') return normalized;
    try {
      const { hostname } = new URL(normalized);
      if (!isLocalHostName(hostname)) return normalized;
    } catch {
      // Ignore malformed URL and continue to safer fallbacks.
    }
  }

  // 3. Vercel production alias URL (stable and safer than preview host for self-fetch)
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return normalizeServerBaseUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL);
  }

  // 4. Vercel system deployment URL
  if (process.env.VERCEL_URL) {
    return normalizeServerBaseUrl(process.env.VERCEL_URL);
  }

  // 5. Local development: use localhost so server-side self-fetch works (e.g. financial-astrology → occult/universal)
  // For Android emulator, set NEXT_PUBLIC_BASE_URL=http://10.0.2.2:3000
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
    const port = process.env.PORT || '3000';
    return `http://127.0.0.1:${port}`;
  }

  // 6. Production fallback (live site)
  return 'https://futureseer.app';
}
