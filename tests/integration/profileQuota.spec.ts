import { getEditLimit, isPaidPlan, shouldResetPeriod } from '@/lib/profileEditQuota';

describe('profileEditQuota', () => {
  it('returns correct edit limits per plan', () => {
    expect(getEditLimit(undefined)).toBe(5);
    expect(getEditLimit('')).toBe(5);
    expect(getEditLimit('trial')).toBe(5);
    expect(getEditLimit('power-user-trial')).toBe(5);
    expect(getEditLimit('buy-coffee')).toBeGreaterThan(5);
    expect(getEditLimit('treat-me')).toBeGreaterThan(getEditLimit('buy-coffee'));
    expect(getEditLimit('festive-hamper')).toBeGreaterThan(getEditLimit('treat-me'));
  });

  it('detects paid plans correctly', () => {
    expect(isPaidPlan(undefined)).toBe(false);
    expect(isPaidPlan('trial')).toBe(false);
    expect(isPaidPlan('buy-coffee')).toBe(true);
    expect(isPaidPlan('treat-me')).toBe(true);
    expect(isPaidPlan('festive-hamper')).toBe(true);
  });

  it('resets period for paid plans when month changes', () => {
    const now = new Date(Date.UTC(2026, 4, 15));
    const startThisMonth = Date.UTC(2026, 4, 1);
    const startPreviousMonth = Date.UTC(2026, 3, 1);

    expect(shouldResetPeriod(startThisMonth, now, true)).toBe(false);
    expect(shouldResetPeriod(startPreviousMonth, now, true)).toBe(true);
  });

  it('never resets period for free plans', () => {
    const now = new Date(Date.UTC(2026, 4, 15));
    const startPreviousMonth = Date.UTC(2026, 3, 1);
    expect(shouldResetPeriod(startPreviousMonth, now, false)).toBe(false);
  });
});

