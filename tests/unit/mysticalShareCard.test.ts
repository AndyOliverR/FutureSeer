import { buildMysticalSharePayload } from '@/lib/growth/mysticalShareCard';

describe('buildMysticalSharePayload', () => {
  it('returns null when profile has no ready reports', () => {
    expect(buildMysticalSharePayload({})).toBeNull();
  });

  it('builds payload from western report teaser fields', () => {
    const profile = {
      displayName: 'Alex Morgan',
      western: {
        chartOverview: 'A steady presence with sharp intuition beneath the surface.',
        personality: { summary: 'You lead with calm clarity.' },
      },
    };
    const payload = buildMysticalSharePayload(profile, {
      referralCode: 'ABC123',
      userId: 'uid-1',
    });
    expect(payload).not.toBeNull();
    expect(payload?.displayName).toBe('Alex');
    expect(payload?.archetypeTitle).toBeTruthy();
    expect(payload?.hookLine.length).toBeGreaterThan(10);
    expect(payload?.shareUrl).toContain('futureseer.app');
    expect(payload?.shareUrl).toContain('ref=ABC123');
  });
});
