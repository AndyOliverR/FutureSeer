import { adminDb } from '@/lib/firebase-admin';
import { devLog } from '@/lib/devLogger';

export type ErrorSeverity = 'error' | 'warning' | 'info';

export interface ServerLogInput {
  severity?: ErrorSeverity;
  area: string;
  action: string;
  message: string;
  userId?: string | null;
  route?: string;
  meta?: Record<string, unknown>;
}

type Environment = 'production' | 'preview' | 'development' | 'unknown';

function getEnvironment(): Environment {
  const env =
    process.env.NEXT_PUBLIC_VERCEL_ENV ||
    process.env.VERCEL_ENV ||
    process.env.NODE_ENV;
  if (env === 'production' || env === 'preview' || env === 'development') {
    return env;
  }
  return 'unknown';
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
    const lower = key.toLowerCase();
    if (lower.includes('password') || lower.includes('token') || lower.includes('secret')) {
      continue;
    }
    safe[key] = typeof val === 'string' ? truncate(val, 500) ?? '' : val;
  }
  return safe;
}

export async function logServerError(input: ServerLogInput): Promise<void> {
  const event = {
    timestamp: new Date().toISOString(),
    environment: getEnvironment(),
    severity: input.severity ?? 'error',
    source: 'server' as const,
    area: input.area,
    action: input.action,
    message: truncate(input.message, 800) || 'Unknown error',
    userId: input.userId ?? null,
    route: input.route,
    browser: undefined,
    meta: sanitizeMeta(input.meta),
  };

  try {
    if (adminDb) {
      await adminDb.collection('errorEvents').add(event);
    }
  } catch (err) {
    devLog.error('[ServerErrorLogging] Failed to write server error to Firestore', err, 'serverErrorLogging');
  }
}

