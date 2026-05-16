"use client";

import { useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { logClientError, type ErrorSeverity } from '@/lib/errorLogging';
import { buildClientErrorTelemetryContext } from '@/lib/clientErrorTelemetryContext';
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

      let idToken: string | null = null;
      if (user) {
        try {
          idToken = await user.getIdToken();
        } catch {
          idToken = null;
        }
      }

      try {
        await logClientError({
          area: options.area,
          action,
          message,
          severity,
          route: pathname || undefined,
          browser,
          idToken,
          meta: buildClientErrorTelemetryContext(user, meta),
        });
      } catch {
        // Never block auth UX on telemetry failures.
      }
    },
    [options.area, pathname, user],
  );

  return { logError };
}

