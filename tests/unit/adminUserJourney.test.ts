/**
 * @jest-environment node
 */

import {
  isBirthProfileComplete,
  getBirthProfileMissingFields,
  isActiveTodayUtc,
  computeAdminUserFunnelFields,
} from '@/lib/adminUserJourneyTypes';

describe('adminUserJourney profile helpers', () => {
  it('detects complete birth profile', () => {
    expect(
      isBirthProfileComplete({
        birthDate: '1990-01-01',
        birthPlace: 'London',
        birthTime: '10:30',
      }),
    ).toBe(true);
    expect(
      isBirthProfileComplete({
        birthDate: '1990-01-01',
        birthPlace: 'London',
        birthTimeKnown: false,
      }),
    ).toBe(true);
  });

  it('lists missing birth fields', () => {
    expect(getBirthProfileMissingFields({ birthDate: '1990-01-01' })).toEqual([
      'birthPlace',
      'birthTime',
    ]);
  });

  it('detects active today in UTC', () => {
    const now = new Date('2026-05-16T14:00:00.000Z');
    expect(isActiveTodayUtc('2026-05-16T05:48:29.000Z', now)).toBe(true);
    expect(isActiveTodayUtc('2026-05-15T23:59:59.000Z', now)).toBe(false);
    expect(isActiveTodayUtc(null, now)).toBe(false);
  });

  it('computes funnel fields for list/export', () => {
    const now = new Date('2026-05-16T14:00:00.000Z');
    const funnel = computeAdminUserFunnelFields(
      {
        birthDate: '1990-01-01',
        birthPlace: 'London',
        birthTime: '10:00',
        mysticalProfileGenerated: true,
        lastSeenAt: Date.parse('2026-05-16T08:00:00.000Z'),
        lastSeenRoute: '/profile',
        subscriptionStatus: 'trial',
      },
      now,
    );
    expect(funnel.profileComplete).toBe(true);
    expect(funnel.mysticalReady).toBe(true);
    expect(funnel.activeToday).toBe(true);
    expect(funnel.lastSeenRoute).toBe('/profile');
    expect(funnel.subscriptionStatus).toBe('trial');
  });
});
