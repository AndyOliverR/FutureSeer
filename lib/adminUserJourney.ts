import 'server-only';

import type { UserRecord } from 'firebase-admin/auth';
import type { Firestore } from 'firebase-admin/firestore';
import {
  getBirthProfileMissingFields,
  isActiveTodayUtc,
  isBirthProfileComplete,
  type AdminUserJourneyPayload,
  type JourneyChip,
  type JourneyTimelineItem,
} from '@/lib/adminUserJourneyTypes';

export type { AdminUserJourneyPayload, JourneyChip, JourneyChipState, JourneyTimelineItem } from '@/lib/adminUserJourneyTypes';
export { getBirthProfileMissingFields, isBirthProfileComplete } from '@/lib/adminUserJourneyTypes';

function toIso(ts: unknown): string | null {
  if (ts == null) return null;
  if (typeof ts === 'string') {
    const d = new Date(ts);
    return isNaN(d.getTime()) ? null : d.toISOString();
  }
  if (typeof ts === 'number' && Number.isFinite(ts)) {
    return new Date(ts).toISOString();
  }
  if (ts instanceof Date) return ts.toISOString();
  if (typeof ts === 'object' && ts !== null && 'toDate' in ts) {
    const d = (ts as { toDate: () => Date }).toDate();
    return d.toISOString();
  }
  return null;
}

function maxIso(dates: (string | null | undefined)[]): string | null {
  let best: number | null = null;
  for (const iso of dates) {
    if (!iso) continue;
    const t = new Date(iso).getTime();
    if (!Number.isFinite(t)) continue;
    if (best == null || t > best) best = t;
  }
  return best != null ? new Date(best).toISOString() : null;
}

function inferSignupChip(
  hasAuth: boolean,
  birthComplete: boolean,
  mysticalReady: boolean,
  errorEvents: Array<{ action: string; severity: string; message: string }>,
): JourneyChip {
  if (!hasAuth) {
    return { state: 'no', label: 'No account', detail: 'Firebase Auth user not found.' };
  }
  const hasAuthSuccess = errorEvents.some((e) => e.action === 'auth_success');
  const hasOAuthRecovered = errorEvents.some(
    (e) =>
      e.action.includes('oauth_recovered') ||
      e.action.includes('dismissed_recovered') ||
      e.message.toLowerCase().includes('session resolved'),
  );
  const lastSignupFail = errorEvents.find(
    (e) =>
      e.severity === 'error' &&
      (e.action.startsWith('signup_') || e.action === 'auth_failed'),
  );
  const lastDismiss = errorEvents.find(
    (e) =>
      e.action.includes('dismissed') ||
      e.message.toLowerCase().includes('popup closed'),
  );

  if (birthComplete || mysticalReady || hasAuthSuccess || hasOAuthRecovered) {
    return {
      state: 'yes',
      label: 'Sign-up done',
      detail: 'Account exists and onboarding progressed past auth.',
    };
  }
  if (lastDismiss && !lastSignupFail) {
    return {
      state: 'unknown',
      label: 'May have left at OAuth',
      detail: 'Popup dismiss logged; no completed profile yet.',
    };
  }
  if (lastSignupFail) {
    return {
      state: 'partial',
      label: 'Sign-up bump',
      detail: `Last auth issue: ${lastSignupFail.action}`,
    };
  }
  return {
    state: 'unknown',
    label: 'Account only',
    detail: 'Auth user exists; no profile or auth telemetry yet.',
  };
}

function buildChips(
  authUser: UserRecord | null,
  profile: Record<string, unknown> | null,
  lock: Record<string, unknown> | null,
  activities: Array<Record<string, unknown>>,
  errorEvents: Array<Record<string, unknown>>,
  seerTokensToday: number | null,
  lastActivityAt: string | null,
  lastSeenAt: string | null,
  lastSeenRoute: string | null,
): AdminUserJourneyPayload['chips'] {
  const birthComplete = isBirthProfileComplete(profile);
  const missing = getBirthProfileMissingFields(profile);
  const mysticalGenerated = profile?.mysticalProfileGenerated === true;
  const allReportsReady = profile?.allReportsReady === true;
  const profileStatus = typeof profile?.profileStatus === 'string' ? profile.profileStatus : '';
  const lockStatus = typeof lock?.status === 'string' ? lock.status : '';
  const lockRunning = lockStatus === 'running' || lockStatus === 'started';

  const toolOpens = activities.filter((a) => a.type === 'tool_open');
  const seerViews = activities.filter(
    (a) =>
      a.type === 'page_view' &&
      (a.path === '/seer' || a.path === '/ask-the-seer'),
  );
  const seerErrors = errorEvents.filter((e) => e.area === 'seer' || e.area === 'mystical-profile');

  const subStatus =
    typeof profile?.subscriptionStatus === 'string' ? profile.subscriptionStatus : '';
  const isSubscribed =
    profile?.isSubscribed === true ||
    subStatus === 'active' ||
    subStatus === 'paid';

  const activeToday = isActiveTodayUtc(lastSeenAt ?? lastActivityAt);

  const normalizedErrors = errorEvents.map((e) => ({
    action: String(e.action ?? ''),
    severity: String(e.severity ?? 'error'),
    message: String(e.message ?? ''),
  }));

  let mysticalChip: JourneyChip;
  if (allReportsReady || mysticalGenerated) {
    mysticalChip = {
      state: 'yes',
      label: 'Generated',
      detail: allReportsReady
        ? 'All reports ready.'
        : `Mystical profile flagged generated (${profileStatus || 'status unknown'}).`,
    };
  } else if (lockRunning) {
    mysticalChip = {
      state: 'running',
      label: 'Generating',
      detail: `Generation lock: ${lockStatus}`,
    };
  } else if (
    profileStatus === 'running' ||
    profileStatus === 'partial_ready' ||
    // Legacy Firestore values from the retired Stage A/B split.
    profileStatus === 'stageA_complete_stageB_running'
  ) {
    mysticalChip = {
      state: 'running',
      label: 'In progress',
      detail: `profileStatus: ${profileStatus}`,
    };
  } else if (profileStatus === 'stageA_failed') {
    mysticalChip = {
      state: 'no',
      label: 'Failed',
      detail: 'profileStatus: failed (legacy)',
    };
  } else {
    mysticalChip = {
      state: 'no',
      label: 'Not generated',
      detail: birthComplete
        ? 'Birth profile complete; Generate mystical profile not finished.'
        : 'Complete birth profile first.',
    };
  }

  let birthChip: JourneyChip;
  if (birthComplete) {
    birthChip = { state: 'yes', label: 'Complete', detail: 'Birth date, place, and time rules satisfied.' };
  } else if (missing.length < 3) {
    birthChip = {
      state: 'partial',
      label: 'Incomplete',
      detail: `Missing: ${missing.join(', ')}`,
    };
  } else {
    birthChip = { state: 'no', label: 'Not started', detail: 'No birth data on user document.' };
  }

  let subscribedChip: JourneyChip;
  if (isSubscribed) {
    subscribedChip = { state: 'yes', label: 'Subscribed', detail: subStatus || 'isSubscribed' };
  } else if (subStatus === 'trial' || profile?.trialEndDate) {
    subscribedChip = { state: 'partial', label: 'Trial', detail: subStatus || 'trial' };
  } else {
    subscribedChip = { state: 'no', label: 'Not subscribed', detail: subStatus || 'No active subscription' };
  }

  const askSeerUsed =
    seerViews.length > 0 ||
    (seerTokensToday != null && seerTokensToday > 0) ||
    seerErrors.some((e) => String(e.action ?? '').includes('seer'));

  return {
    account: authUser
      ? { state: 'yes', label: 'Account', detail: authUser.email ?? authUser.uid }
      : { state: 'no', label: 'No account', detail: 'Not in Firebase Auth' },
    signup: inferSignupChip(!!authUser, birthComplete, allReportsReady || mysticalGenerated, normalizedErrors),
    birthProfile: birthChip,
    mysticalProfile: mysticalChip,
    subscribed: subscribedChip,
    toolsUsed: {
      state: toolOpens.length > 0 ? 'yes' : 'no',
      label: toolOpens.length > 0 ? 'Used tools' : 'No tools logged',
      detail:
        toolOpens.length > 0
          ? `${toolOpens.length} tool open(s) in recent activity.`
          : 'No tool_open in recent activities subcollection.',
    },
    askSeerUsed: {
      state: askSeerUsed ? 'yes' : 'no',
      label: askSeerUsed ? 'Seer activity' : 'No Seer logged',
      detail:
        seerTokensToday != null && seerTokensToday > 0
          ? `${seerTokensToday} tokens today (UTC).`
          : seerViews.length > 0
            ? `${seerViews.length} Seer page view(s).`
            : 'No /seer page views or Seer tokens today.',
    },
    activeToday: {
      state: activeToday ? 'yes' : 'no',
      label: activeToday ? 'Active today' : 'Not today (UTC)',
      detail: lastSeenAt
        ? `lastSeenAt ${lastSeenAt}${lastSeenRoute ? ` · ${lastSeenRoute}` : ''}`
        : lastActivityAt
          ? `Inferred from activity ${lastActivityAt} (no lastSeenAt yet)`
          : 'No lastSeenAt or activity timestamp.',
    },
  };
}

function buildTimeline(
  activities: Array<{ id: string; data: Record<string, unknown> }>,
  errorEvents: Array<{ id: string; data: Record<string, unknown> }>,
  authUser: UserRecord | null,
): JourneyTimelineItem[] {
  const items: JourneyTimelineItem[] = [];

  if (authUser) {
    const created = authUser.metadata.creationTime;
    if (created) {
      items.push({
        id: 'auth-created',
        kind: 'auth',
        timestamp: new Date(created).toISOString(),
        title: 'Firebase Auth account created',
        detail: authUser.email ?? undefined,
      });
    }
    const lastSignIn = authUser.metadata.lastSignInTime;
    if (lastSignIn) {
      items.push({
        id: 'auth-last-sign-in',
        kind: 'auth',
        timestamp: new Date(lastSignIn).toISOString(),
        title: 'Last Firebase sign-in',
      });
    }
  }

  for (const { id, data } of activities) {
    const ts = toIso(data.timestamp) ?? new Date(0).toISOString();
    const type = String(data.type ?? 'activity');
    if (type === 'tool_open') {
      items.push({
        id: `act-${id}`,
        kind: 'activity',
        timestamp: ts,
        title: `Opened tool: ${String(data.toolSlug ?? 'unknown')}`,
      });
    } else {
      items.push({
        id: `act-${id}`,
        kind: 'activity',
        timestamp: ts,
        title: `Page: ${String(data.path ?? '/')}`,
        detail: type,
      });
    }
  }

  for (const { id, data } of errorEvents) {
    const ts = toIso(data.timestamp) ?? new Date(0).toISOString();
    items.push({
      id: `err-${id}`,
      kind: 'error',
      timestamp: ts,
      title: `${String(data.area ?? 'client')} / ${String(data.action ?? 'event')}`,
      detail: String(data.message ?? '').slice(0, 200),
      severity: String(data.severity ?? 'error'),
      area: String(data.area ?? ''),
      action: String(data.action ?? ''),
    });
  }

  items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return items.slice(0, 80);
}

async function fetchErrorEventsForUser(
  db: Firestore,
  uid: string,
  limit: number,
): Promise<Array<{ id: string; data: Record<string, unknown> }>> {
  try {
    const snap = await db
      .collection('errorEvents')
      .where('userId', '==', uid)
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get();
    return snap.docs.map((doc) => ({ id: doc.id, data: doc.data() as Record<string, unknown> }));
  } catch {
    const snap = await db.collection('errorEvents').orderBy('timestamp', 'desc').limit(400).get();
    return snap.docs
      .map((doc) => ({ id: doc.id, data: doc.data() as Record<string, unknown> }))
      .filter((row) => row.data.userId === uid)
      .slice(0, limit);
  }
}

export async function buildAdminUserJourney(
  db: Firestore,
  authUser: UserRecord | null,
  uid: string,
): Promise<AdminUserJourneyPayload> {
  const [profileSnap, lockSnap, activitySnap, errorRows, seerDailySnap] = await Promise.all([
    db.collection('users').doc(uid).get(),
    db.collection('generationLocks').doc(uid).get(),
    db
      .collection('users')
      .doc(uid)
      .collection('activities')
      .orderBy('timestamp', 'desc')
      .limit(50)
      .get()
      .catch(() => null),
    fetchErrorEventsForUser(db, uid, 50),
    db.collection('aiInferenceDaily').doc(uid).get().catch(() => null),
  ]);

  const profile = profileSnap.exists ? (profileSnap.data() as Record<string, unknown>) : null;
  const lock = lockSnap.exists ? (lockSnap.data() as Record<string, unknown>) : null;
  const activities =
    activitySnap?.docs.map((doc) => ({ id: doc.id, data: doc.data() as Record<string, unknown> })) ?? [];

  const seerDaily = seerDailySnap?.exists ? seerDailySnap.data() : null;
  const today = new Date().toISOString().slice(0, 10);
  const seerTokensToday =
    seerDaily && seerDaily.day === today && typeof seerDaily.seerTokens === 'number'
      ? seerDaily.seerTokens
      : null;

  const activityTimes = activities.map((a) => toIso(a.data.timestamp));
  const errorTimes = errorRows.map((e) => toIso(e.data.timestamp));
  const lastSeenAt = toIso(profile?.lastSeenAt);
  const lastSeenRoute =
    typeof profile?.lastSeenRoute === 'string' && profile.lastSeenRoute.trim()
      ? profile.lastSeenRoute.trim()
      : null;

  const lastActivityAt = maxIso([
    lastSeenAt,
    ...activityTimes,
    ...errorTimes,
    toIso(profile?.updatedAt),
    toIso(profile?.mysticalProfileGeneratedAt),
    toIso(profile?.lastLoginAt),
    authUser?.metadata.lastSignInTime
      ? new Date(authUser.metadata.lastSignInTime).toISOString()
      : null,
  ]);

  const chips = buildChips(
    authUser,
    profile,
    lock,
    activities.map((a) => a.data),
    errorRows.map((e) => e.data),
    seerTokensToday,
    lastActivityAt,
    lastSeenAt,
    lastSeenRoute,
  );

  const toolOpenCount = activities.filter((a) => a.data.type === 'tool_open').length;
  const seerPageViews = activities.filter(
    (a) =>
      a.data.type === 'page_view' &&
      (a.data.path === '/seer' || a.data.path === '/ask-the-seer'),
  ).length;

  return {
    uid,
    auth: authUser
      ? {
          email: authUser.email ?? null,
          displayName: authUser.displayName ?? null,
          disabled: authUser.disabled,
          createdAt: authUser.metadata.creationTime
            ? new Date(authUser.metadata.creationTime).toISOString()
            : null,
          lastSignInAt: authUser.metadata.lastSignInTime
            ? new Date(authUser.metadata.lastSignInTime).toISOString()
            : null,
          providers: authUser.providerData.map((p) => p.providerId),
        }
      : null,
    chips,
    summary: {
      lastActivityAt,
      lastSeenAt,
      lastSeenRoute,
      toolOpenCount,
      seerPageViews,
      seerTokensToday,
    },
    profile,
    generationLock: lock,
    timeline: buildTimeline(activities, errorRows, authUser),
  };
}
