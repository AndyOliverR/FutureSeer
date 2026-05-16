import type { User } from 'firebase/auth';

/** Device class for admin triage (not the M3 layout flag). */
export type ClientMobileOs = 'ios' | 'android' | 'desktop';

export interface ClientErrorTelemetryContext {
  platform?: string;
  mobileOS: ClientMobileOs;
  userDisplayName?: string;
  userEmail?: string;
  hasUser: boolean;
  online?: boolean;
  visibilityState?: string;
  connectionType?: string;
}

function detectMobileOsFromUa(ua: string, isMobileLayout: boolean): ClientMobileOs {
  if (!isMobileLayout) return 'desktop';
  if (/iPhone|iPad|iPod/i.test(ua)) return 'ios';
  if (/Android/i.test(ua)) return 'android';
  return 'desktop';
}

/** Shared context attached to client error events for admin triage. */
export function buildClientErrorTelemetryContext(
  user: User | null | undefined,
  extra?: Record<string, unknown>,
): Record<string, unknown> {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const platform =
    typeof document !== 'undefined'
      ? document.documentElement.getAttribute('data-platform') || undefined
      : undefined;
  const dataMobileOs =
    typeof document !== 'undefined'
      ? document.documentElement.getAttribute('data-mobile-os')
      : null;
  const isMobileLayout = platform === 'android';
  const mobileOS: ClientMobileOs =
    dataMobileOs === 'ios' || dataMobileOs === 'android' || dataMobileOs === 'desktop'
      ? dataMobileOs
      : detectMobileOsFromUa(ua, isMobileLayout);

  const online = typeof navigator !== 'undefined' ? navigator.onLine : undefined;
  const visibilityState = typeof document !== 'undefined' ? document.visibilityState : undefined;
  const connectionType =
    typeof navigator !== 'undefined' && 'connection' in navigator
      ? (navigator as Navigator & { connection?: { effectiveType?: string } }).connection
          ?.effectiveType
      : undefined;

  const userDisplayName = user?.displayName?.trim() || undefined;
  const userEmail = user?.email?.trim() || undefined;

  return {
    ...extra,
    hasUser: !!user,
    platform,
    mobileOS,
    userDisplayName,
    userEmail,
    online,
    visibilityState,
    connectionType,
  };
}

export function formatUserLabelFromMeta(meta?: Record<string, unknown>): string | null {
  if (!meta) return null;
  const name = typeof meta.userDisplayName === 'string' ? meta.userDisplayName.trim() : '';
  const email = typeof meta.userEmail === 'string' ? meta.userEmail.trim() : '';
  if (name && email) return `${name} <${email}>`;
  if (name) return name;
  if (email) return email;
  return null;
}
