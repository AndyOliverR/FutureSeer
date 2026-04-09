import { resolveOwnedUserId } from '@/lib/security/ownership';

describe('resolveOwnedUserId', () => {
  it('returns user id when it matches auth uid', () => {
    expect(resolveOwnedUserId('u1', 'u1')).toBe('u1');
  });

  it('returns null when user id is different', () => {
    expect(resolveOwnedUserId('u1', 'u2')).toBeNull();
  });

  it('returns null for non-string user id', () => {
    expect(resolveOwnedUserId(undefined, 'u1')).toBeNull();
  });
});

