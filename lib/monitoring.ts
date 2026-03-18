// Optional client-side monitoring bootstrap.
// This is a no-op unless NEXT_PUBLIC_SENTRY_DSN (or similar) is provided.

export function initClientMonitoring() {
  if (typeof window === 'undefined') return;
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return;

  // Lazy-import Sentry so it is only bundled when DSN is present.
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  import('@sentry/nextjs')
    .then((Sentry) => {
      if (!Sentry?.init) return;
      Sentry.init({
        dsn,
        tracesSampleRate: 0.1,
      });
    })
    .catch(() => {
      // Swallow init errors; app should continue to work without monitoring.
    });
}

