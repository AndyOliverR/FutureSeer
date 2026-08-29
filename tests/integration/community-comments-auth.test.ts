/**
 * Integration tests: /api/community/comments
 * Unauthenticated callers must not impersonate members, mutate karma, or edit/delete as the author.
 * @jest-environment node
 */

import { NextRequest } from 'next/server';

const mockVerifyUserRequest = jest.fn();
const mockDiscussionGet = jest.fn();
const mockDiscussionUpdate = jest.fn();
const mockCommentGet = jest.fn();
const mockCommentSet = jest.fn();
const mockCommentUpdate = jest.fn();
const mockCommentDelete = jest.fn();
const mockMemberGet = jest.fn();
const mockMemberSet = jest.fn();
const mockMemberUpdate = jest.fn();
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
          doc: () => ({
            get: mockDiscussionGet,
            update: mockDiscussionUpdate,
            collection: () => ({
              doc: (cid?: string) => ({
                id: cid || 'comment-new',
                get: mockCommentGet,
                set: mockCommentSet,
                update: mockCommentUpdate,
                delete: mockCommentDelete,
              }),
            }),
          }),
        };
      }
      if (name === 'communityMembers') {
        return {
          doc: () => ({
            get: mockMemberGet,
            set: mockMemberSet,
            update: mockMemberUpdate,
          }),
        };
      }
      if (name === 'communityStats') {
        return {
          doc: () => ({
            get: mockStatsGet,
            set: jest.fn(),
            update: mockStatsUpdate,
          }),
        };
      }
      return { doc: () => ({ get: jest.fn(), set: jest.fn(), update: jest.fn() }) };
    },
  },
}));

import { POST } from '@/app/api/community/comments/route';
import { PATCH, DELETE } from '@/app/api/community/comments/[id]/route';

describe('community comments auth', () => {
  const victimUid = 'victim-uid';
  const attackerUid = 'attacker-uid';
  const discussionId = 'disc-1';
  const commentId = 'comment-1';

  beforeEach(() => {
    jest.clearAllMocks();
    mockDiscussionGet.mockResolvedValue({
      exists: true,
      data: () => ({ commentCount: 2, title: 'Chart help' }),
    });
    mockDiscussionUpdate.mockResolvedValue(undefined);
    mockCommentSet.mockResolvedValue(undefined);
    mockCommentUpdate.mockResolvedValue(undefined);
    mockCommentDelete.mockResolvedValue(undefined);
    mockCommentGet.mockResolvedValue({
      exists: true,
      id: commentId,
      data: () => ({
        content: 'Original reply',
        authorId: victimUid,
        authorName: 'Victim',
        discussionId,
        createdAt: { toDate: () => new Date('2026-08-01T00:00:00.000Z') },
        updatedAt: { toDate: () => new Date('2026-08-01T00:00:00.000Z') },
      }),
    });
    mockMemberGet.mockResolvedValue({
      exists: true,
      data: () => ({
        karma: 10,
        contributions: 3,
        lastActive: new Date('2026-08-01T00:00:00.000Z'),
        streak: 1,
        name: 'Victim',
      }),
    });
    mockMemberSet.mockResolvedValue(undefined);
    mockMemberUpdate.mockResolvedValue(undefined);
    mockStatsGet.mockResolvedValue({
      exists: true,
      data: () => ({ totalComments: 5 }),
    });
    mockStatsUpdate.mockResolvedValue(undefined);
  });

  function jsonHeaders(authHeader: boolean): Record<string, string> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (authHeader) headers.Authorization = 'Bearer test-token';
    return headers;
  }

  async function postComment(
    body: Record<string, unknown>,
    authHeader = true,
  ): Promise<Response> {
    const req = new NextRequest('http://localhost:3000/api/community/comments', {
      method: 'POST',
      headers: jsonHeaders(authHeader),
      body: JSON.stringify(body),
    });
    return POST(req) as Promise<Response>;
  }

  async function patchComment(
    body: Record<string, unknown>,
    authHeader = true,
  ): Promise<Response> {
    const req = new NextRequest(`http://localhost:3000/api/community/comments/${commentId}`, {
      method: 'PATCH',
      headers: jsonHeaders(authHeader),
      body: JSON.stringify(body),
    });
    return PATCH(req, { params: Promise.resolve({ id: commentId }) }) as Promise<Response>;
  }

  async function deleteComment(
    queryUserId: string,
    authHeader = true,
  ): Promise<Response> {
    const req = new NextRequest(
      `http://localhost:3000/api/community/comments/${commentId}?discussionId=${discussionId}&userId=${queryUserId}`,
      {
        method: 'DELETE',
        headers: jsonHeaders(authHeader),
      },
    );
    return DELETE(req, { params: Promise.resolve({ id: commentId }) }) as Promise<Response>;
  }

  const impersonatingPostBody = {
    discussionId,
    content: 'Forged reply as the victim',
    userId: victimUid,
    authorName: 'Not the victim',
  };

  describe('POST (signed-in)', () => {
    it('returns 401 and does not write when Authorization is missing', async () => {
      mockVerifyUserRequest.mockResolvedValue({ ok: false, reason: 'missing_token' });

      const res = await postComment(impersonatingPostBody, false);

      expect(res.status).toBe(401);
      expect(mockCommentSet).not.toHaveBeenCalled();
      expect(mockMemberUpdate).not.toHaveBeenCalled();
    });

    it('returns 403 and does not post as another user when userId mismatches the token', async () => {
      mockVerifyUserRequest.mockResolvedValue({ ok: true, uid: attackerUid });

      const res = await postComment(impersonatingPostBody);

      expect(res.status).toBe(403);
      expect(mockCommentSet).not.toHaveBeenCalled();
      expect(mockMemberUpdate).not.toHaveBeenCalled();
    });

    it('creates a comment when userId matches the token', async () => {
      mockVerifyUserRequest.mockResolvedValue({ ok: true, uid: attackerUid });

      const res = await postComment({
        discussionId,
        content: 'My own reply',
        userId: attackerUid,
        authorName: 'Attacker',
      });
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(mockCommentSet).toHaveBeenCalledTimes(1);
      const stored = mockCommentSet.mock.calls[0][0] as Record<string, unknown>;
      expect(stored.authorId).toBe(attackerUid);
      expect(stored.content).toBe('My own reply');
    });
  });

  describe('PATCH', () => {
    it('returns 401 and does not update when Authorization is missing', async () => {
      mockVerifyUserRequest.mockResolvedValue({ ok: false, reason: 'missing_token' });

      const res = await patchComment(
        { content: 'Defaced', discussionId, userId: victimUid },
        false,
      );

      expect(res.status).toBe(401);
      expect(mockCommentUpdate).not.toHaveBeenCalled();
    });

    it('returns 403 and does not edit as another user when userId mismatches the token', async () => {
      mockVerifyUserRequest.mockResolvedValue({ ok: true, uid: attackerUid });

      const res = await patchComment({
        content: 'Defaced',
        discussionId,
        userId: victimUid,
      });

      expect(res.status).toBe(403);
      expect(mockCommentUpdate).not.toHaveBeenCalled();
    });

    it('updates when the authenticated user is the author', async () => {
      mockVerifyUserRequest.mockResolvedValue({ ok: true, uid: victimUid });

      const res = await patchComment({
        content: 'Edited by author',
        discussionId,
        userId: victimUid,
      });
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(mockCommentUpdate).toHaveBeenCalledTimes(1);
      expect(mockCommentUpdate.mock.calls[0][0]).toEqual(
        expect.objectContaining({ content: 'Edited by author' }),
      );
    });
  });

  describe('DELETE', () => {
    it('returns 401 and does not delete when Authorization is missing', async () => {
      mockVerifyUserRequest.mockResolvedValue({ ok: false, reason: 'missing_token' });

      const res = await deleteComment(victimUid, false);

      expect(res.status).toBe(401);
      expect(mockCommentDelete).not.toHaveBeenCalled();
    });

    it('returns 403 and does not delete as another user when userId mismatches the token', async () => {
      mockVerifyUserRequest.mockResolvedValue({ ok: true, uid: attackerUid });

      const res = await deleteComment(victimUid);

      expect(res.status).toBe(403);
      expect(mockCommentDelete).not.toHaveBeenCalled();
    });

    it('deletes when the authenticated user is the author', async () => {
      mockVerifyUserRequest.mockResolvedValue({ ok: true, uid: victimUid });

      const res = await deleteComment(victimUid);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(mockCommentDelete).toHaveBeenCalledTimes(1);
    });
  });
});
