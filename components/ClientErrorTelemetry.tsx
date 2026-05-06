'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { logClientError } from '@/lib/errorLogging';

const TELEMETRY_THROTTLE_MS = 60_000;
const INDEXEDDB_WARNING_EMIT_MS = 5 * 60_000;

function browserLine(): string | undefined {
  if (typeof navigator === 'undefined') return undefined;
  return `${navigator.userAgent} | ${navigator.language || ''}`;
}

function shouldSuppressKnownIndexedDbDisconnect(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    normalized.includes('connection to indexed database server lost') ||
    normalized.includes('connection to indexeddb server lost') ||
    (normalized.includes('indexeddb') && normalized.includes('server lost'))
  );
}

/**
 * Registers global client handlers (window error, unhandled rejection) and sends
 * payloads to `/api/log-client-error` → Firestore `errorEvents`.
 */
export function ClientErrorTelemetry() {
  const pathname = usePathname();
  const { user } = useAuth();
  const idTokenRef = useRef<string | null>(null);
  const recentEventRef = useRef<Map<string, number>>(new Map());
  const suppressedIndexedDbCountRef = useRef<Map<string, number>>(new Map());
  const indexedDbWarnAtRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    if (!user) {
      idTokenRef.current = null;
      return;
    }
    let cancelled = false;
    user
      .getIdToken()
      .then((t) => {
        if (!cancelled) idTokenRef.current = t;
      })
      .catch(() => {
        if (!cancelled) idTokenRef.current = null;
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    const shouldThrottle = (key: string): boolean => {
      const now = Date.now();
      const previous = recentEventRef.current.get(key);
      if (previous && now - previous < TELEMETRY_THROTTLE_MS) {
        return true;
      }
      recentEventRef.current.set(key, now);
      return false;
    };

    const trackSuppressedIndexedDb = (source: 'window.error' | 'unhandledrejection', message: string): void => {
      const browser = browserLine();
      const route = pathname || '';
      const key = `${route}|${browser || 'unknown-browser'}`;
      const count = (suppressedIndexedDbCountRef.current.get(key) ?? 0) + 1;
      suppressedIndexedDbCountRef.current.set(key, count);

      const now = Date.now();
      const lastWarnAt = indexedDbWarnAtRef.current.get(key) ?? 0;
      if (now - lastWarnAt < INDEXEDDB_WARNING_EMIT_MS) return;
      indexedDbWarnAtRef.current.set(key, now);

      void logClientError({
        severity: 'warning',
        area: 'client',
        action: 'indexeddb_disconnect_suppressed',
        message: 'IndexedDB disconnect suppressed (count-only)',
        route: route || undefined,
        browser,
        idToken: idTokenRef.current,
        meta: {
          source,
          count,
          sample: message.slice(0, 240),
        },
      });
    };

    const onError = (ev: ErrorEvent) => {
      const err = ev.error instanceof Error ? ev.error : null;
      const detail = err
        ? `${err.name}: ${err.message}`
        : `${ev.message || 'Error'} at ${ev.filename ?? '?'}:${ev.lineno ?? '?'}:${ev.colno ?? '?'}`;
      if (shouldSuppressKnownIndexedDbDisconnect(detail)) {
        trackSuppressedIndexedDb('window.error', detail);
        return;
      }
      const key = `window.error|${pathname || ''}|${detail.slice(0, 240)}`;
      if (shouldThrottle(key)) return;
      void logClientError({
        area: 'client',
        action: 'window.error',
        message: detail.slice(0, 800),
        route: pathname || undefined,
        browser: browserLine(),
        idToken: idTokenRef.current,
        meta: {
          filename: ev.filename,
          lineno: ev.lineno,
          colno: ev.colno,
          stack: err?.stack,
        },
      });
    };

    const onRejection = (ev: PromiseRejectionEvent) => {
      const reason = ev.reason;
      const text =
        reason instanceof Error
          ? `${reason.name}: ${reason.message}`
          : typeof reason === 'string'
            ? reason
            : 'Unhandled promise rejection';
      if (shouldSuppressKnownIndexedDbDisconnect(text)) {
        trackSuppressedIndexedDb('unhandledrejection', text);
        return;
      }
      const key = `unhandledrejection|${pathname || ''}|${text.slice(0, 240)}`;
      if (shouldThrottle(key)) return;
      void logClientError({
        area: 'client',
        action: 'unhandledrejection',
        message: text.slice(0, 800),
        route: pathname || undefined,
        browser: browserLine(),
        idToken: idTokenRef.current,
        meta: {
          stack: reason instanceof Error ? reason.stack : undefined,
        },
      });
    };

    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
    };
  }, [pathname]);

  return null;
}
