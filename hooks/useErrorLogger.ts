"use client";

import { useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { logClientError, type ErrorSeverity } from '@/lib/errorLogging';
import { useAuth } from '@/hooks/use-auth';

interface UseErrorLoggerOptions {
  area: string;
}

export function useErrorLogger(options: UseErrorLoggerOptions) {
  const pathname = usePathname();
  const { user } = useAuth();

  const logError = useCallback(
    async (action: string, message: string, severity: ErrorSeverity = 'error', meta?: Record<string, unknown>) => {
      const browser =
        typeof navigator !== 'undefined'
          ? `${navigator.userAgent} | ${navigator.language || ''}`
          : undefined;
      const online = typeof navigator !== 'undefined' ? navigator.onLine : undefined;
      const visibilityState = typeof document !== 'undefined' ? document.visibilityState : undefined;
      const platform =
        typeof document !== 'undefined'
          ? document.documentElement.getAttribute('data-platform') || undefined
          : undefined;
      const connectionType =
        typeof navigator !== 'undefined' && 'connection' in navigator
          ? (navigator as Navigator & { connection?: { effectiveType?: string } }).connection
              ?.effectiveType
          : undefined;

      try {
        await logClientError({
          area: options.area,
          action,
          message,
          severity,
          route: pathname || undefined,
          browser,
          meta: {
            ...meta,
            hasUser: !!user,
            online,
            visibilityState,
            platform,
            connectionType,
          },
        });
      } catch {
        // Never block auth UX on telemetry failures.
      }
    },
    [options.area, pathname, user],
  );

  return { logError };
}

