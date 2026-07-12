import type { DailyInsightCardData } from '@/lib/dailyInsightForHome';
import { buildDailyInsightCardData } from '@/lib/dailyInsightForHome';
import type { ComprehensiveMysticalProfile } from '@/contexts/MysticalProfileContext';

export const DAILY_INSIGHTS_DEFAULT_BATCH_SIZE = 120;

export function parseDailyInsightsBatchSize(raw: string | undefined): number {
  const n = raw ? parseInt(raw, 10) : Number.NaN;
  if (!Number.isFinite(n) || n < 1) return DAILY_INSIGHTS_DEFAULT_BATCH_SIZE;
  return Math.min(500, Math.floor(n));
}

export function todayInsightDateKey(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

export function shouldSendDailyInsightToday(
  profile: { dailyInsightEmailSentAt?: string },
  dateKey: string,
): boolean {
  return profile.dailyInsightEmailSentAt !== dateKey;
}

export function userWantsDailyInsightEmail(profile: {
  email?: string;
  notificationsEnabled?: boolean;
  notificationPreferences?: { dailyInsights?: boolean };
}): boolean {
  const email = profile.email?.trim();
  if (!email) return false;
  if (profile.notificationsEnabled === false) return false;
  return profile.notificationPreferences?.dailyInsights === true;
}

export function resolveRetentionNudgeStage(profile: {
  lastActiveAt?: number;
  trialEndsAt?: number;
}, now = Date.now()): {
  nudgeStage: 'active' | 'at_risk' | 'reactivation' | 'trial_ending';
  trialDaysLeft: number | null;
} {
  const dayMs = 24 * 60 * 60 * 1000;
  const daysSinceLast =
    typeof profile.lastActiveAt === 'number'
      ? Math.max(0, Math.floor((now - profile.lastActiveAt) / dayMs))
      : Number.POSITIVE_INFINITY;
  const trialDaysLeft =
    typeof profile.trialEndsAt === 'number'
      ? Math.max(0, Math.ceil((profile.trialEndsAt - now) / dayMs))
      : null;
  const nudgeStage: 'active' | 'at_risk' | 'reactivation' | 'trial_ending' =
    trialDaysLeft !== null && trialDaysLeft <= 3
      ? 'trial_ending'
      : daysSinceLast <= 0
        ? 'active'
        : daysSinceLast <= 1
          ? 'at_risk'
          : 'reactivation';
  return { nudgeStage, trialDaysLeft };
}

export function buildDailyInsightForEmail(
  comprehensiveProfile: Record<string, unknown> | null | undefined,
  displayName?: string,
  now = new Date(),
): DailyInsightCardData {
  return buildDailyInsightCardData(
    (comprehensiveProfile as ComprehensiveMysticalProfile | null) ?? null,
    displayName,
    now,
  );
}
