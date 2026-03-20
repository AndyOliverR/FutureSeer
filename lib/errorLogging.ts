import { devLog } from '@/lib/devLogger';

export type ErrorSeverity = 'error' | 'warning' | 'info';

export interface LogErrorInput {
  severity?: ErrorSeverity;
  area: string;
  action: string;
  message: string;
  userId?: string | null;
  route?: string;
  browser?: string;
  meta?: Record<string, unknown>;
  /** If provided, sent as Authorization Bearer so the API can record userId. Not stored in the logged event. */
  idToken?: string | null;
}

function truncate(value: unknown, max = 800): string | undefined {
  if (typeof value !== 'string') return undefined;
  if (value.length <= max) return value;
  return value.slice(0, max) + '…';
}

function sanitizeMeta(meta?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!meta) return undefined;
  const safe: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(meta)) {
    if (
      key.toLowerCase().includes('password') ||
      key.toLowerCase().includes('token') ||
      key.toLowerCase().includes('secret')
    ) {
      // Skip obviously sensitive fields
      continue;
    }
    if (typeof val === 'string') {
      safe[key] = truncate(val, 500);
    } else {
      safe[key] = val;
    }
  }
  return safe;
}

export async function logClientError(input: LogErrorInput): Promise<void> {
  // This is a thin wrapper used by the client hook; server-side callers should prefer logServerError.
  const payload = {
    severity: input.severity ?? 'error',
    area: input.area,
    action: input.action,
    message: truncate(input.message, 800) || 'Unknown error',
    route: input.route,
    browser: truncate(input.browser, 512),
    meta: sanitizeMeta(input.meta),
  };

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (input.idToken) {
    headers['Authorization'] = `Bearer ${input.idToken}`;
  }

  try {
    await fetch('/api/log-client-error', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
  } catch (err) {
    // Never block the user because telemetry failed
    if (process.env.NODE_ENV === 'development') {
      devLog.warn('[ErrorLogging] Failed to send client error', err, 'errorLogging');
    }
  }
}

