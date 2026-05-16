/**
 * Unified client + server logging into Firestore `errorEvents` (Admin → Errors).
 */

import type { User } from 'firebase/auth';
import type { NextRequest } from 'next/server';
import { buildClientErrorTelemetryContext } from '@/lib/clientErrorTelemetryContext';
import { logClientError, type ErrorSeverity } from '@/lib/errorLogging';
import { logServerError } from '@/lib/serverErrorLogging';

export interface UserPainInput {
  area: string;
  action: string;
  message: string;
  severity?: ErrorSeverity;
  route?: string;
  user?: User | null;
  idToken?: string | null;
  meta?: Record<string, unknown>;
}

/** Client-side user/system pain visible in Admin → Errors. */
export async function logUserPain(input: UserPainInput): Promise<void> {
  const browser =
    typeof navigator !== 'undefined'
      ? `${navigator.userAgent} | ${navigator.language || ''}`
      : undefined;

  let idToken = input.idToken ?? null;
  if (!idToken && input.user) {
    try {
      idToken = await input.user.getIdToken();
    } catch {
      idToken = null;
    }
  }

  await logClientError({
    area: input.area,
    action: input.action,
    message: input.message.slice(0, 800),
    severity: input.severity ?? 'error',
    route:
      input.route ??
      (typeof window !== 'undefined' ? window.location.pathname : undefined),
    browser,
    idToken,
    meta: buildClientErrorTelemetryContext(input.user, input.meta),
  });
}

export interface SystemPainInput {
  area: string;
  action: string;
  message: string;
  severity?: ErrorSeverity;
  userId?: string | null;
  route?: string;
  meta?: Record<string, unknown>;
}

/** Server-side pain (API routes, background jobs). */
export async function logSystemPain(input: SystemPainInput): Promise<void> {
  await logServerError(input);
}

export function routePathFromRequest(request: NextRequest): string {
  try {
    return request.nextUrl.pathname;
  } catch {
    return '';
  }
}

/** Log API route failures with request path + optional stack. */
export async function logApiPain(
  request: NextRequest,
  error: unknown,
  input: Omit<SystemPainInput, 'message' | 'route'> & { message?: string },
): Promise<void> {
  const message =
    input.message ??
    (error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : 'API route error');

  const meta: Record<string, unknown> = { ...input.meta };
  if (error instanceof Error && error.stack) {
    meta.stack = error.stack.slice(0, 1500);
  }

  await logSystemPain({
    area: input.area,
    action: input.action,
    message: message.slice(0, 800),
    severity: input.severity ?? 'error',
    userId: input.userId ?? null,
    route: routePathFromRequest(request),
    meta,
  });
}
