import { decideUserScopedAccess } from '@/lib/security/userScopedAccess';

describe('decideUserScopedAccess', () => {
  it('allows owned Firebase UID', () => {
    expect(decideUserScopedAccess('uid-1', { ok: true, uid: 'uid-1' })).toEqual({
      kind: 'owned',
      userId: 'uid-1',
    });
  });

  it('forbids mismatched UID', () => {
    expect(decideUserScopedAccess('victim', { ok: true, uid: 'attacker' })).toEqual({
      kind: 'forbidden',
    });
  });

  it('uses stateless generation when token is missing', () => {
    expect(decideUserScopedAccess('uid-1', { ok: false, reason: 'missing_token' })).toEqual({
      kind: 'stateless',
    });
  });

  it('rejects invalid tokens', () => {
    expect(decideUserScopedAccess('uid-1', { ok: false, reason: 'invalid_token' })).toEqual({
      kind: 'unauthorized',
    });
  });
});
