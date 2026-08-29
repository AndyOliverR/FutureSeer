/**
 * Integration tests: PATCH/DELETE /api/community/discussions/[id]
 * Callers must not edit or delete another member's thread by supplying their userId.
 * @jest-environment node
 */

import { NextRequest } from 'next/server';

const mockVerifyUserRequest = jest.fn();
const mockDiscussionGet = jest.fn();
const mockDiscussionUpdate = jest.fn();
const mockCommentsGet = jest.fn();
const mockBatchDelete = jest.fn();
const mockBatchCommit = jest.fn();
const mockStatsGet = jest.fn();
const mockStatsUpdate = jest.fn();

jest.mock('@/lib/userApiAuth', () => ({
  verifyUserRequest: (...args: unknown[]) => mockVerifyUserRequest(...args),
  resolveOwnedUserId: (requested: unknown, authUid: string) =>
    typeof requested === 'string' && requested.trim() === authUid ? requested.trim() : null,
}));

jest.mock('@/lib/firebase-admin', () => ({
  adminDb: {
    collection: (name: string) => {
      if (name === 'communityDiscussions') {
        return {
          doc: (id: string) => ({
            id,
            get: mockDiscussionGet,
            update: mockDiscussionUpdate,
            collection: () => ({
              get: mockCommentsGet,
            }),
          }),
        };
      }
      if (name === 'communityStats') {
        return {
          doc: () => ({
            get: mockStatsGet,
            update: mockStatsUpdate,
          }),
        };
      }
      return { doc: () => ({ get: jest.fn(), update: jest.fn() }) };
    },
    batch: () => ({
      delete: mockBatchDelete,
      commit: mockBatchCommit,
    }),
  },
}));

import { PATCH, DELETE } from '@/app/api/community/discussions/[id]/route';

describe('community discussion write auth', () => {
  const victimUid = 'victim-uid';
  const attackerUid = 'attacker-uid';
  const discussionId = 'disc-1';

  beforeEach(() => {
    jest.clearAllMocks();
    mockDiscussionGet.mockResolvedValue({
      exists: true,
      id: discussionId,
      data: () => ({
        title: 'Victim thread',
        content: 'Please help with my chart',
        authorId: victimUid,
        commentCount: 1,
        upvotes: 0,
        downvotes: 0,
        createdAt: { toDate: () => new Date('2026-08-01T00:00:00.000Z') },
        updatedAt: { toDate: () => new Date('2026-08-01T00:00:00.000Z') },
        lastActivityAt: { toDate: () => new Date('2026-08-01T00:00:00.000Z') },
      }),
    });
    mockDiscussionUpdate.mockResolvedValue(undefined);
    mockCommentsGet.mockResolvedValue({ docs: [{ ref: { id: 'c1' } }] });
    mockBatchCommit.mockResolvedValue(undefined);
    mockStatsGet.mockResolvedValue({
      exists: true,
      data: () => ({ totalDiscussions: 3, totalComments: 4 }),
    });
    mockStatsUpdate.mockResolvedValue(undefined);
  });

  function jsonHeaders(authHeader: boolean): Record<string, string> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (authHeader) headers.Authorization = 'Bearer test-token';
    return headers;
  }

  async function patchDiscussion(
    body: Record<string, unknown>,
    authHeader = true,
  ): Promise<Response> {
    const req = new NextRequest(`http://localhost:3000/api/community/discussions/${discussionId}`, {
      method: 'PATCH',
      headers: jsonHeaders(authHeader),
      body: JSON.stringify(body),
    });
    return PATCH(req, { params: Promise.resolve({ id: discussionId }) }) as Promise<Response>;
  }

  async function deleteDiscussion(
    queryUserId: string,
    authHeader = true,
  ): Promise<Response> {
    const req = new NextRequest(
      `http://localhost:3000/api/community/discussions/${discussionId}?userId=${queryUserId}`,
      {
        method: 'DELETE',
        headers: jsonHeaders(authHeader),
      },
    );
    return DELETE(req, { params: Promise.resolve({ id: discussionId }) }) as Promise<Response>;
  }

  describe('PATCH', () => {
    it('returns 401 and does not update when Authorization is missing', async () => {
      mockVerifyUserRequest.mockResolvedValue({ ok: false, reason: 'missing_token' });

      const res = await patchDiscussion({ title: 'Hijacked', userId: victimUid }, false);

      expect(res.status).toBe(401);
      expect(mockDiscussionUpdate).not.toHaveBeenCalled();
    });

    it('returns 403 and does not edit as another user when userId mismatches the token', async () => {
      mockVerifyUserRequest.mockResolvedValue({ ok: true, uid: attackerUid });

      const res = await patchDiscussion({ title: 'Hijacked', userId: victimUid });

      expect(res.status).toBe(403);
      expect(mockDiscussionUpdate).not.toHaveBeenCalled();
    });

    it('updates when the authenticated user is the author', async () => {
      mockVerifyUserRequest.mockResolvedValue({ ok: true, uid: victimUid });

      const res = await patchDiscussion({ title: 'Updated title', userId: victimUid });
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(mockDiscussionUpdate).toHaveBeenCalledTimes(1);
      expect(mockDiscussionUpdate.mock.calls[0][0]).toEqual(
        expect.objectContaining({ title: 'Updated title' }),
      );
    });
  });

  describe('DELETE', () => {
    it('returns 401 and does not delete when Authorization is missing', async () => {
      mockVerifyUserRequest.mockResolvedValue({ ok: false, reason: 'missing_token' });

      const res = await deleteDiscussion(victimUid, false);

      expect(res.status).toBe(401);
      expect(mockBatchCommit).not.toHaveBeenCalled();
    });

    it('returns 403 and does not delete as another user when userId mismatches the token', async () => {
      mockVerifyUserRequest.mockResolvedValue({ ok: true, uid: attackerUid });

      const res = await deleteDiscussion(victimUid);

      expect(res.status).toBe(403);
      expect(mockBatchCommit).not.toHaveBeenCalled();
    });

    it('deletes when the authenticated user is the author', async () => {
      mockVerifyUserRequest.mockResolvedValue({ ok: true, uid: victimUid });

      const res = await deleteDiscussion(victimUid);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(mockBatchCommit).toHaveBeenCalledTimes(1);
    });
  });
});
