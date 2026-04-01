'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { logClientError } from '@/lib/errorLogging';

function browserLine(): string | undefined {
  if (typeof navigator === 'undefined') return undefined;
  return `${navigator.userAgent} | ${navigator.language || ''}`;
}

/**
 * Registers global client handlers (window error, unhandled rejection) and sends
 * payloads to `/api/log-client-error` → Firestore `errorEvents`.
 */
export function ClientErrorTelemetry() {
  const pathname = usePathname();
  const { user } = useAuth();
  const idTokenRef = useRef<string | null>(null);

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
    const onError = (ev: ErrorEvent) => {
      const err = ev.error instanceof Error ? ev.error : null;
      const detail = err
        ? `${err.name}: ${err.message}`
        : `${ev.message || 'Error'} at ${ev.filename ?? '?'}:${ev.lineno ?? '?'}:${ev.colno ?? '?'}`;
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
