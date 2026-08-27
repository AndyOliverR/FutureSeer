/**
 * Integration tests: POST /api/community/members/auto-join
 * Unauthenticated callers must not create or overwrite community member docs.
 * @jest-environment node
 */

import { NextRequest } from 'next/server';

const mockVerifyUserRequest = jest.fn();
const mockMemberGet = jest.fn();
const mockMemberUpdate = jest.fn();
const mockMemberSet = jest.fn();
const mockStatsGet = jest.fn();
const mockStatsUpdate = jest.fn();
const mockStatsSet = jest.fn();

jest.mock('@/lib/userApiAuth', () => ({
  verifyUserRequest: (...args: unknown[]) => mockVerifyUserRequest(...args),
  resolveOwnedUserId: (requested: unknown, authUid: string) =>
    typeof requested === 'string' && requested.trim() === authUid ? requested.trim() : null,
}));

jest.mock('@/lib/firebase-admin', () => ({
  adminDb: {
    collection: (name: string) => {
      if (name === 'communityMembers') {
        return {
          doc: (id: string) => ({
            id,
            get: mockMemberGet,
            update: mockMemberUpdate,
            set: mockMemberSet,
          }),
        };
      }
      return {
        doc: () => ({
          get: mockStatsGet,
          update: mockStatsUpdate,
          set: mockStatsSet,
        }),
      };
    },
  },
}));

import { POST } from '@/app/api/community/members/auto-join/route';

describe('POST /api/community/members/auto-join', () => {
  const victimUid = 'victim-uid';
  const attackerUid = 'attacker-uid';

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.FOUNDER_UID = 'founder-uid';
    process.env.FOUNDER_EMAIL = 'founder@example.com';
    mockMemberGet.mockResolvedValue({
      exists: true,
      id: victimUid,
      data: () => ({
        userId: victimUid,
        name: 'Real Member',
        karma: 40,
        contributions: 2,
        streak: 3,
        badges: [],
        joinDate: new Date('2026-01-01'),
      }),
    });
    mockMemberUpdate.mockResolvedValue(undefined);
    mockMemberSet.mockResolvedValue(undefined);
    mockStatsGet.mockResolvedValue({ exists: true, data: () => ({ totalMembers: 10 }) });
    mockStatsUpdate.mockResolvedValue(undefined);
    mockStatsSet.mockResolvedValue(undefined);
  });

  async function postJoin(body: Record<string, unknown>, authHeader = true): Promise<Response> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (authHeader) headers.Authorization = 'Bearer test-token';
    const req = new NextRequest('http://localhost:3000/api/community/members/auto-join', {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    return POST(req) as Promise<Response>;
  }

  it('returns 401 and does not write when Authorization is missing', async () => {
    mockVerifyUserRequest.mockResolvedValue({ ok: false, reason: 'missing_token' });

    const res = await postJoin(
      { userId: victimUid, userName: 'Impostor', email: 'evil@example.com' },
      false,
    );

    expect(res.status).toBe(401);
    expect(mockMemberGet).not.toHaveBeenCalled();
    expect(mockMemberUpdate).not.toHaveBeenCalled();
    expect(mockMemberSet).not.toHaveBeenCalled();
  });

  it('returns 403 and does not overwrite another member when userId mismatches the token', async () => {
    mockVerifyUserRequest.mockResolvedValue({
      ok: true,
      uid: attackerUid,
      email: 'attacker@example.com',
    });

    const res = await postJoin({
      userId: victimUid,
      userName: 'Impostor',
      email: 'evil@example.com',
      photoURL: 'https://evil.example/photo.png',
    });

    expect(res.status).toBe(403);
    expect(mockMemberUpdate).not.toHaveBeenCalled();
    expect(mockMemberSet).not.toHaveBeenCalled();
  });

  it('does not grant founder karma from a spoofed body email', async () => {
    mockVerifyUserRequest.mockResolvedValue({
      ok: true,
      uid: attackerUid,
      email: 'attacker@example.com',
    });
    mockMemberGet.mockResolvedValue({
      exists: true,
      id: attackerUid,
      data: () => ({
        userId: attackerUid,
        name: 'Attacker',
        karma: 0,
        contributions: 0,
        streak: 0,
        badges: [],
        joinDate: new Date('2026-01-01'),
      }),
    });

    const res = await postJoin({
      userId: attackerUid,
      userName: 'Fake Founder',
      email: 'founder@example.com',
    });

    expect(res.status).toBe(200);
    expect(mockMemberUpdate).toHaveBeenCalled();
    const payload = mockMemberUpdate.mock.calls[0][0] as Record<string, unknown>;
    expect(payload.karma).toBeUndefined();
    expect(payload.flair).toBeUndefined();
    const body = await res.json();
    expect(body.member.karma).toBe(0);
  });

  it('updates the authenticated member when userId matches the token', async () => {
    mockVerifyUserRequest.mockResolvedValue({
      ok: true,
      uid: attackerUid,
      email: 'attacker@example.com',
    });
    mockMemberGet.mockResolvedValue({
      exists: true,
      id: attackerUid,
      data: () => ({
        userId: attackerUid,
        name: 'Attacker',
        karma: 12,
        contributions: 1,
        streak: 1,
        badges: [],
        joinDate: new Date('2026-01-01'),
      }),
    });

    const res = await postJoin({
      userId: attackerUid,
      userName: 'Attacker Name',
      email: 'attacker@example.com',
    });

    expect(res.status).toBe(200);
    expect(mockMemberUpdate).toHaveBeenCalledTimes(1);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.member.userId).toBe(attackerUid);
    expect(body.member.karma).toBe(12);
  });
});
