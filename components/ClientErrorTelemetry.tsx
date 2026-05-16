'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { logClientError } from '@/lib/errorLogging';
import { buildClientErrorTelemetryContext } from '@/lib/clientErrorTelemetryContext';
import { getFirebaseAuth } from '@/lib/firebase';
import type { User } from 'firebase/auth';

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

const TRANSIENT_AUTH_ERROR_CODES = [
  'auth/user-token-expired',
  'auth/network-request-failed',
  'auth/id-token-expired',
  'auth/invalid-user-token',
] as const;

function extractFirebaseAuthCode(reason: unknown): string | null {
  if (reason && typeof reason === 'object' && 'code' in reason) {
    const code = (reason as { code?: string }).code;
    if (typeof code === 'string' && code.startsWith('auth/')) return code;
  }
  return null;
}

function isTransientAuthError(reason: unknown): boolean {
  const code = extractFirebaseAuthCode(reason);
  return code !== null && (TRANSIENT_AUTH_ERROR_CODES as readonly string[]).includes(code);
}

/** Firebase Auth SDK internal race; often harmless after OAuth redirect/popup. */
function isFirebaseAuthInternalAssertion(message: string): boolean {
  return message.includes('INTERNAL ASSERTION FAILED') && message.includes('Pending promise was never set');
}

/**
 * Registers global client handlers (window error, unhandled rejection) and sends
 * payloads to `/api/log-client-error` → Firestore `errorEvents`.
 */
export function ClientErrorTelemetry() {
  const pathname = usePathname();
  const { user } = useAuth();
  const userRef = useRef<User | null>(null);
  const idTokenRef = useRef<string | null>(null);
  const recentEventRef = useRef<Map<string, number>>(new Map());
  const suppressedIndexedDbCountRef = useRef<Map<string, number>>(new Map());
  const indexedDbWarnAtRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    userRef.current = user;
  }, [user]);

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
    const telemetryMeta = (extra?: Record<string, unknown>) =>
      buildClientErrorTelemetryContext(userRef.current, extra);

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
        meta: telemetryMeta({
          source,
          count,
          sample: message.slice(0, 240),
        }),
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
        meta: telemetryMeta({
          filename: ev.filename,
          lineno: ev.lineno,
          colno: ev.colno,
          stack: err?.stack,
        }),
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

      if (isTransientAuthError(reason)) {
        const authCode = extractFirebaseAuthCode(reason)!;
        ev.preventDefault();
        if (
          authCode === 'auth/user-token-expired' ||
          authCode === 'auth/id-token-expired' ||
          authCode === 'auth/invalid-user-token'
        ) {
          try {
            const auth = getFirebaseAuth();
            const cu = auth?.currentUser;
            if (cu) void cu.getIdToken(true).catch(() => {});
          } catch { /* best-effort */ }
        }
        const key = `auth_transient|${pathname || ''}|${authCode}`;
        if (shouldThrottle(key)) return;
        void logClientError({
          severity: 'warning',
          area: 'auth',
          action: 'transient_auth_error',
          message: text.slice(0, 800),
          route: pathname || undefined,
          browser: browserLine(),
          idToken: idTokenRef.current,
          meta: telemetryMeta({
            authCode,
            stack: reason instanceof Error ? reason.stack : undefined,
          }),
        });
        return;
      }

      if (isFirebaseAuthInternalAssertion(text)) {
        const key = `firebase_auth_internal|${pathname || ''}|${text.slice(0, 120)}`;
        if (shouldThrottle(key)) return;
        void logClientError({
          severity: 'warning',
          area: 'auth',
          action: 'firebase_auth_internal_assertion',
          message: text.slice(0, 800),
          route: pathname || undefined,
          browser: browserLine(),
          idToken: idTokenRef.current,
          meta: telemetryMeta({
            stack: reason instanceof Error ? reason.stack : undefined,
          }),
        });
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
        meta: telemetryMeta({
          stack: reason instanceof Error ? reason.stack : undefined,
        }),
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
