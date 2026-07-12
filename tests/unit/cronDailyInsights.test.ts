import {
  parseDailyInsightsBatchSize,
  shouldSendDailyInsightToday,
  todayInsightDateKey,
  userWantsDailyInsightEmail,
  resolveRetentionNudgeStage,
} from '@/lib/cronDailyInsights';

describe('cronDailyInsights helpers', () => {
  it('parses batch size with cap', () => {
    expect(parseDailyInsightsBatchSize(undefined)).toBe(120);
    expect(parseDailyInsightsBatchSize('50')).toBe(50);
    expect(parseDailyInsightsBatchSize('9999')).toBe(500);
    expect(parseDailyInsightsBatchSize('0')).toBe(120);
  });

  it('detects opt-in users', () => {
    expect(
      userWantsDailyInsightEmail({
        email: 'a@b.com',
        notificationsEnabled: true,
        notificationPreferences: { dailyInsights: true },
      }),
    ).toBe(true);
    expect(
      userWantsDailyInsightEmail({
        email: 'a@b.com',
        notificationsEnabled: false,
        notificationPreferences: { dailyInsights: true },
      }),
    ).toBe(false);
  });

  it('dedupes by dailyInsightEmailSentAt date key', () => {
    const key = todayInsightDateKey(new Date('2026-07-12T10:00:00Z'));
    expect(key).toBe('2026-07-12');
    expect(shouldSendDailyInsightToday({ dailyInsightEmailSentAt: key }, key)).toBe(false);
    expect(shouldSendDailyInsightToday({}, key)).toBe(true);
  });

  it('maps retention nudge stages', () => {
    const now = Date.parse('2026-07-12T12:00:00Z');
    expect(resolveRetentionNudgeStage({ lastActiveAt: now }, now).nudgeStage).toBe('active');
    expect(
      resolveRetentionNudgeStage({ lastActiveAt: now - 3 * 86400000, trialEndsAt: now + 2 * 86400000 }, now)
        .nudgeStage,
    ).toBe('trial_ending');
  });
});
