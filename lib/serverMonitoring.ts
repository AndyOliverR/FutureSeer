// Optional server-side monitoring helper.
// All functions are safe no-ops unless SENTRY_DSN (or similar) is configured.

type Extra = Record<string, unknown>;

export async function captureServerException(error: unknown, extra?: Extra) {
  const dsn = process.env.SENTRY_DSN || process.env.SENTRY_SERVER_DSN;
  if (!dsn) return;

  try {
    const Sentry = await import('@sentry/nextjs');
    if (!Sentry?.captureException) return;
    Sentry.captureException(error, extra ? { extra } : undefined);
  } catch {
    // Never throw from monitoring.
  }
}

