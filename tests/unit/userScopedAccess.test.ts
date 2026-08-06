import { decideUserScopedAccess } from '@/lib/security/userScopedAccess';
import { requireOwnedUserId, isOwnedUserRequest } from '@/lib/security/requireOwnedUserId';
import { NextRequest } from 'next/server';

const mockVerifyUserRequest = jest.fn();

jest.mock('@/lib/userApiAuth', () => ({
  verifyUserRequest: (...args: unknown[]) => mockVerifyUserRequest(...args),
}));

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

describe('requireOwnedUserId / isOwnedUserRequest', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function req() {
    return new NextRequest('http://localhost:3000/api/test', { method: 'GET' });
  }

  it('requireOwnedUserId returns 401 when token is missing', async () => {
    mockVerifyUserRequest.mockResolvedValueOnce({ ok: false, reason: 'missing_token' });
    const result = await requireOwnedUserId(req(), 'victim', 'test');
    expect(result).toEqual({ ok: false, status: 401, error: 'Unauthorized' });
  });

  it('requireOwnedUserId returns 403 on uid mismatch', async () => {
    mockVerifyUserRequest.mockResolvedValueOnce({ ok: true, uid: 'attacker' });
    const result = await requireOwnedUserId(req(), 'victim', 'test');
    expect(result).toEqual({ ok: false, status: 403, error: 'Forbidden' });
  });

  it('isOwnedUserRequest is true only for matching uid', async () => {
    mockVerifyUserRequest.mockResolvedValueOnce({ ok: true, uid: 'owner' });
    await expect(isOwnedUserRequest(req(), 'owner', 'test')).resolves.toBe(true);

    mockVerifyUserRequest.mockResolvedValueOnce({ ok: true, uid: 'attacker' });
    await expect(isOwnedUserRequest(req(), 'victim', 'test')).resolves.toBe(false);
  });
});
