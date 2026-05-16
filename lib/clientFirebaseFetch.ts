'use client';

import { getFirebaseAuth } from '@/lib/firebase';
import { buildClientErrorTelemetryContext } from '@/lib/clientErrorTelemetryContext';
import { logClientError } from '@/lib/errorLogging';

export class MissingFirebaseAuthError extends Error {
  constructor() {
    super('Please sign in again to continue.');
    this.name = 'MissingFirebaseAuthError';
  }
}

export async function getFirebaseIdToken(forceRefresh = false): Promise<string | null> {
  const auth = getFirebaseAuth();
  if (!auth?.currentUser) return null;
  try {
    return await auth.currentUser.getIdToken(forceRefresh);
  } catch {
    return null;
  }
}

const SEER_401_TELEMETRY_THROTTLE_MS = 10 * 60 * 1000;
const API_FAILURE_TELEMETRY_THROTTLE_MS = 5 * 60 * 1000;

function browserLine(): string | undefined {
  if (typeof navigator === 'undefined') return undefined;
  return `${navigator.userAgent} | ${navigator.language || ''}`;
}

function apiPathForMeta(input: RequestInfo | URL): string {
  if (typeof input === 'string') return input;
  if (typeof URL !== 'undefined' && input instanceof URL) return `${input.pathname}${input.search}`;
  if (typeof Request !== 'undefined' && input instanceof Request) return input.url;
  return 'unknown';
}

function seer401ThrottleKey(input: RequestInfo | URL): string {
  const path = apiPathForMeta(input);
  const auth = getFirebaseAuth();
  const uid = auth?.currentUser?.uid ?? 'anon';
  return `fs_seer_401_telemetry_${path}_${uid}`;
}

function shouldThrottleSeer401Telemetry(key: string): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return false;
    const t = parseInt(raw, 10);
    if (Number.isNaN(t)) return false;
    return Date.now() - t < SEER_401_TELEMETRY_THROTTLE_MS;
  } catch {
    return false;
  }
}

function markSeer401Telemetry(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(key, String(Date.now()));
  } catch {
    /* ignore */
  }
}

function apiFailureThrottleKey(path: string, status: number): string {
  const auth = getFirebaseAuth();
  const uid = auth?.currentUser?.uid ?? 'anon';
  return `fs_api_fail_${status}_${path}_${uid}`;
}

function shouldThrottleApiFailureTelemetry(key: string): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return false;
    const t = parseInt(raw, 10);
    if (Number.isNaN(t)) return false;
    return Date.now() - t < API_FAILURE_TELEMETRY_THROTTLE_MS;
  } catch {
    return false;
  }
}

function markApiFailureTelemetry(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(key, String(Date.now()));
  } catch {
    /* ignore */
  }
}

/** Non-auth API failures (4xx/5xx) for Admin → Errors. */
function reportApiFailureToAdmin(input: RequestInfo | URL, res: Response): void {
  if (typeof window === 'undefined') return;
  if (res.ok) return;
  if (res.status === 401 || res.status === 403) return;

  const path = apiPathForMeta(input);
  const key = apiFailureThrottleKey(path, res.status);
  if (shouldThrottleApiFailureTelemetry(key)) return;
  markApiFailureTelemetry(key);

  const route = window.location.pathname;
  const auth = getFirebaseAuth();
  const cu = auth?.currentUser;

  void (async () => {
    const idToken = await getFirebaseIdToken(false);
    await logClientError({
      severity: res.status >= 500 ? 'error' : 'warning',
      area: 'api',
      action: 'request_failed',
      message: `API ${res.status}: ${path}`.slice(0, 800),
      route,
      browser: browserLine(),
      idToken,
      meta: buildClientErrorTelemetryContext(cu, {
        apiPath: path,
        httpStatus: res.status,
      }),
    });
  })();
}

/**
 * Record Seer API auth failures to Firestore errorEvents (admin /admin/errors).
 * Throttled per user + API path so a broken client cannot spam the dashboard.
 */
function reportSeerUnauthorizedToAdmin(input: RequestInfo | URL, httpStatus: number): void {
  if (typeof window === 'undefined') return;
  if (httpStatus !== 401 && httpStatus !== 403) return;

  const key = seer401ThrottleKey(input);
  if (shouldThrottleSeer401Telemetry(key)) return;
  markSeer401Telemetry(key);

  const path = apiPathForMeta(input);
  const route = typeof window !== 'undefined' ? window.location.pathname : undefined;

  void (async () => {
    const idToken = await getFirebaseIdToken(true);
    await logClientError({
      severity: 'error',
      area: 'seer',
      action: 'api_unauthorized',
      message: `Seer API returned ${httpStatus} after token refresh`,
      route,
      browser: browserLine(),
      idToken,
      meta: {
        apiPath: path,
        httpStatus,
      },
    });
  })();
}

/**
 * Call API routes that use verifyUserRequest / enforceToolSeerGate.
 * Sets Authorization Bearer; throws if no signed-in user token.
 * Retries once on 401 with a refreshed ID token.
 * Emits throttled admin telemetry if the response is still 401 or 403.
 */
export async function fetchWithFirebaseAuthRequired(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const token = await getFirebaseIdToken(false);
  if (!token) {
    throw new MissingFirebaseAuthError();
  }
  const run = async (t: string) => {
    const headers = new Headers(init?.headers);
    headers.set('Authorization', `Bearer ${t}`);
    return fetch(input, { ...init, headers });
  };
  let res = await run(token);
  if (res.status === 401) {
    const fresh = await getFirebaseIdToken(true);
    if (fresh) {
      res = await run(fresh);
    }
  }
  if (res.status === 401 || res.status === 403) {
    reportSeerUnauthorizedToAdmin(input, res.status);
  } else if (!res.ok) {
    reportApiFailureToAdmin(input, res);
  }
  return res;
}
