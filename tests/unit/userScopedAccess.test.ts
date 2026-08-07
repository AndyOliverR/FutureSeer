import { decideUserScopedAccess } from '@/lib/security/userScopedAccess';

describe('decideUserScopedAccess', () => {
  it('allows owned access when token uid matches userId', () => {
    expect(decideUserScopedAccess('owner', { ok: true, uid: 'owner' })).toEqual({
      kind: 'owned',
      userId: 'owner',
    });
  });

  it('forbids access when token uid differs from userId', () => {
    expect(decideUserScopedAccess('victim', { ok: true, uid: 'attacker' })).toEqual({
      kind: 'forbidden',
    });
  });

  it('allows stateless generation when no token is present', () => {
    expect(decideUserScopedAccess('anyone', { ok: false, reason: 'missing_token' })).toEqual({
      kind: 'stateless',
    });
  });

  it('rejects invalid Firebase tokens', () => {
    expect(decideUserScopedAccess('anyone', { ok: false, reason: 'invalid_token' })).toEqual({
      kind: 'unauthorized',
    });
  });
});
