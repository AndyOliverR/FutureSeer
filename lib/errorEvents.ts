// Server-only: append structured error rows to Firestore `errorEvents`.
// Used by `/api/log-client-error` and `captureServerException` (no third-party APM).

import { adminDb } from '@/lib/firebase-admin';
import type { ErrorSeverity } from '@/lib/errorLogging';

export type ErrorEventSource = 'client' | 'server';

export interface ErrorEventRecord {
  timestamp: string;
  environment: 'production' | 'preview' | 'development' | 'unknown';
  severity: ErrorSeverity;
  source: ErrorEventSource;
  area: string;
  action: string;
  message: string;
  userId: string | null;
  route?: string;
  browser?: string;
  meta?: Record<string, unknown>;
}

export function getErrorEventEnvironment(): ErrorEventRecord['environment'] {
  const env =
    process.env.NEXT_PUBLIC_VERCEL_ENV ||
    process.env.VERCEL_ENV ||
    process.env.NODE_ENV;
  if (env === 'production' || env === 'preview' || env === 'development') {
    return env;
  }
  return 'unknown';
}

export function formatUnknownError(error: unknown): { message: string; stack?: string } {
  if (error instanceof Error) {
    return { message: `${error.name}: ${error.message}`, stack: error.stack };
  }
  if (typeof error === 'string') {
    return { message: error };
  }
  try {
    return { message: JSON.stringify(error) };
  } catch {
    return { message: String(error) };
  }
}

/** Persists one error row. Safe no-op when Admin Firestore is unavailable. */
export async function writeErrorEventToFirestore(event: ErrorEventRecord): Promise<void> {
  if (!adminDb) return;
  await adminDb.collection('errorEvents').add(event);
}
