export type JourneyChipState = 'yes' | 'no' | 'partial' | 'running' | 'unknown';

export interface JourneyChip {
  state: JourneyChipState;
  label: string;
  detail: string;
}

export interface JourneyTimelineItem {
  id: string;
  kind: 'activity' | 'error' | 'auth';
  timestamp: string;
  title: string;
  detail?: string;
  severity?: string;
  area?: string;
  action?: string;
}

export function isBirthProfileComplete(data: Record<string, unknown> | null | undefined): boolean {
  if (!data) return false;
  return !!(
    data.birthDate &&
    data.birthPlace &&
    (data.birthTimeKnown === false || data.birthTime)
  );
}

/** Admin list/export funnel columns (Phase 3). */
export interface AdminUserFunnelFields {
  profileComplete: boolean;
  mysticalReady: boolean;
  subscriptionStatus: string | null;
  lastSeenAt: string | null;
  lastSeenRoute: string | null;
  activeToday: boolean;
  profileStatus: string | null;
}

export function computeAdminUserFunnelFields(
  data: Record<string, unknown> | null | undefined,
  now = new Date(),
): AdminUserFunnelFields {
  const profileComplete = isBirthProfileComplete(data);
  const mysticalReady =
    data?.allReportsReady === true || data?.mysticalProfileGenerated === true;
  const lastSeenMs =
    typeof data?.lastSeenAt === 'number' && Number.isFinite(data.lastSeenAt)
      ? data.lastSeenAt
      : null;
  const lastSeenAt = lastSeenMs != null ? new Date(lastSeenMs).toISOString() : null;
  const lastSeenRoute =
    typeof data?.lastSeenRoute === 'string' && data.lastSeenRoute.trim()
      ? data.lastSeenRoute.trim()
      : null;
  const subscriptionStatus =
    typeof data?.subscriptionStatus === 'string' ? data.subscriptionStatus : null;
  const profileStatus =
    typeof data?.profileStatus === 'string' ? data.profileStatus : null;

  return {
    profileComplete,
    mysticalReady,
    subscriptionStatus,
    lastSeenAt,
    lastSeenRoute,
    activeToday: isActiveTodayUtc(lastSeenAt, now),
    profileStatus,
  };
}

export function isActiveTodayUtc(isoTimestamp: string | null | undefined, now = new Date()): boolean {
  if (!isoTimestamp) return false;
  const t = new Date(isoTimestamp).getTime();
  if (!Number.isFinite(t)) return false;
  const start = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return t >= start;
}

export function getBirthProfileMissingFields(
  data: Record<string, unknown> | null | undefined,
): string[] {
  if (!data) return ['birthDate', 'birthPlace', 'birthTime'];
  const missing: string[] = [];
  if (!data.birthDate) missing.push('birthDate');
  if (!data.birthPlace) missing.push('birthPlace');
  if (data.birthTimeKnown !== false && !data.birthTime) missing.push('birthTime');
  return missing;
}

export interface AdminUserJourneyPayload {
  uid: string;
  auth: {
    email: string | null;
    displayName: string | null;
    disabled: boolean;
    createdAt: string | null;
    lastSignInAt: string | null;
    providers: string[];
  } | null;
  chips: {
    account: JourneyChip;
    signup: JourneyChip;
    birthProfile: JourneyChip;
    mysticalProfile: JourneyChip;
    subscribed: JourneyChip;
    toolsUsed: JourneyChip;
    askSeerUsed: JourneyChip;
    activeToday: JourneyChip;
  };
  summary: {
    lastActivityAt: string | null;
    lastSeenAt: string | null;
    lastSeenRoute: string | null;
    toolOpenCount: number;
    seerPageViews: number;
    seerTokensToday: number | null;
  };
  profile: Record<string, unknown> | null;
  generationLock: Record<string, unknown> | null;
  timeline: JourneyTimelineItem[];
}
