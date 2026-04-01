// Server-side error capture to Firestore `errorEvents` (same pipeline as client logging).

import {
  formatUnknownError,
  getErrorEventEnvironment,
  writeErrorEventToFirestore,
} from '@/lib/errorEvents';

type Extra = Record<string, unknown>;

const RESERVED = new Set(['area', 'action', 'route', 'userId']);

/**
 * Record an exception from API routes or server code. Never throws.
 * Optional `extra` keys: `area`, `action`, `route`, `userId`, plus any JSON-safe meta.
 */
export async function captureServerException(error: unknown, extra?: Extra): Promise<void> {
  try {
    const { message, stack } = formatUnknownError(error);
    const area =
      typeof extra?.area === 'string' && extra.area.length > 0 ? extra.area : 'server';
    const action =
      typeof extra?.action === 'string' && extra.action.length > 0
        ? extra.action
        : 'exception';
    const route = typeof extra?.route === 'string' ? extra.route : undefined;
    const userId =
      typeof extra?.userId === 'string' ? extra.userId : null;

    const meta: Record<string, unknown> = {};
    if (stack) meta.stack = stack;
    if (extra) {
      for (const [k, v] of Object.entries(extra)) {
        if (RESERVED.has(k)) continue;
        meta[k] = v;
      }
    }

    await writeErrorEventToFirestore({
      timestamp: new Date().toISOString(),
      environment: getErrorEventEnvironment(),
      severity: 'error',
      source: 'server',
      area,
      action,
      message: message.slice(0, 2000),
      userId,
      route,
      meta: Object.keys(meta).length ? meta : undefined,
    });
  } catch {
    // Never throw from monitoring.
  }
}
